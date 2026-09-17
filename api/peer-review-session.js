/* api/peer-review-session.js
 * Sesión de peer review en vivo — un solo endpoint, multiplexado por `action`
 * (mismo patrón que api/gamification.js). Usa el último slot disponible de las
 * 12 funciones serverless de Vercel Hobby — no agregar más endpoints sin
 * consolidar antes.
 *
 * Flujo: open -> connect -> start_writing -> (autosave_draft* / finish_early) ->
 *        force_close_writing -> assign_reviews -> (get_my_reviews / submit_review) ->
 *        force_close_reviewing -> release_feedback (repetible, procesa en lotes) ->
 *        get_results / roster (polling público, sin datos sensibles)
 *
 * Anonimato: las 4 tablas peer_review_* tienen RLS activo sin políticas — solo
 * este endpoint (SUPABASE_SERVICE_KEY) puede leerlas o escribirlas. El cliente
 * nunca ve el student_id de un revisor ni del autor de un ensayo asignado.
 */

const { createClient } = require('@supabase/supabase-js');
const { groqChat } = require('../lib/groq-client');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const ADMIN_EMAIL   = 'arturo.rodriguez@uleam.edu.ec';
const GRADING_MODEL = 'llama-3.3-70b-versatile'; // -> gpt-oss-120b en Groq

const ESSAY_CRITERIA  = ['peel_rigor', 'hedging', 'nominalization'];
const REVIEW_CRITERIA = ['specific', 'actionable', 'balanced'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function requireTeacher(payload) {
    return !!process.env.ADMIN_PASSWORD && payload && payload.teacherPassword === process.env.ADMIN_PASSWORD;
}

function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function parseAiJson(text) {
    try {
        const cleaned = text.replace(/```json|```/g, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;
    } catch (e) {
        return null;
    }
}

function clampScore(n) {
    const v = parseInt(n, 10);
    if (isNaN(v)) return 2;
    return Math.min(4, Math.max(1, v));
}

async function gradeWithGroq(criteria, systemPrompt, userContent) {
    try {
        const { text } = await groqChat({
            apiKey:      process.env.GROQ_TOKEN,
            model:       GRADING_MODEL,
            system:      systemPrompt,
            userContent: userContent.slice(0, 3000),
            maxTokens:   300
        });
        const parsed = parseAiJson(text) || {};
        const scores = {};
        criteria.forEach(key => { scores[key] = clampScore(parsed[key]); });
        return { scores, rationale: (parsed.rationale || '').slice(0, 400) };
    } catch (e) {
        console.warn('⚠️ Groq grading falló:', e.message);
        const fallback = {};
        criteria.forEach(key => { fallback[key] = null; });
        return { scores: fallback, rationale: 'Evaluación IA no disponible (error de conexión con Groq).' };
    }
}

function gradeEssay(essayText) {
    return gradeWithGroq(
        ESSAY_CRITERIA,
        'You are an objective academic writing evaluator. The essay below is 3 argument paragraphs ' +
        'that must each follow the P.E.E.L. model (Point, Evidence, Explain, Link — Link connects the ' +
        "paragraph back to the thesis) and deliberately use hedging language and nominalizations. " +
        'Score 1-4 on exactly these 3 criteria (1=Unsatisfactory, 2=In Progress, 3=Satisfactory, 4=Excellent): ' +
        'peel_rigor (all 3 paragraphs execute Point→Evidence→Explain→Link in order, Link ties back to the thesis), ' +
        'hedging (modal verbs / approximators / distancing verbs / reporting structures used in each paragraph, ' +
        'calibrated to the strength of the claim — not overclaiming or underclaiming), ' +
        'nominalization (at least 2 natural nominalizations per paragraph, e.g. implementation/development/assumption, ' +
        'not just plain verbs). Respond ONLY with JSON: ' +
        '{"peel_rigor":n,"hedging":n,"nominalization":n,' +
        '"rationale":"1-2 sentences in Spanish explaining the overall score"}',
        essayText || '(ensayo vacío — el estudiante no entregó texto)'
    );
}

function gradeReviewQuality(comments) {
    const text = ['strengths', 'improve', 'priority']
        .map(k => `${k}: ${(comments && comments[k]) || '(vacío)'}`)
        .join('\n');
    return gradeWithGroq(
        REVIEW_CRITERIA,
        'You are evaluating the QUALITY of peer-review feedback one student wrote about a ' +
        "classmate's essay. Score 1-4 on: specific (references concrete passages, not just " +
        'impressions), actionable (says exactly what should change), balanced (includes at least ' +
        'one strength and one weakness, no personal judgement). Respond ONLY with JSON: ' +
        '{"specific":n,"actionable":n,"balanced":n,"rationale":"1-2 sentences in Spanish"}',
        text
    );
}

// ── Acciones ─────────────────────────────────────────────────────────────────

async function actionOpen(payload) {
    if (!requireTeacher(payload)) return { status: 401, body: { error: 'Contraseña de docente inválida.' } };
    const { lessonName, writingMinutes = 20, reviewMinutes = 15, reviewersPerEssay = 3, instructions = '' } = payload;
    if (!lessonName) return { status: 400, body: { error: 'lessonName requerido.' } };

    const { data, error } = await supabase.from('peer_review_sessions').insert({
        lesson_name:          String(lessonName).slice(0, 150),
        teacher_email:        ADMIN_EMAIL,
        status:               'open',
        writing_minutes:      writingMinutes,
        review_minutes:       reviewMinutes,
        reviewers_per_essay:  reviewersPerEssay,
        instructions:         String(instructions).slice(0, 4000)
    }).select().single();

    if (error) return { status: 500, body: { error: error.message } };
    return { status: 200, body: { session: data } };
}

async function actionConnect(sessionId, studentId, payload) {
    if (!sessionId || !studentId) return { status: 400, body: { error: 'sessionId y studentId requeridos.' } };
    const { data: session, error: sErr } = await supabase.from('peer_review_sessions').select('status').eq('id', sessionId).single();
    if (sErr || !session) return { status: 404, body: { error: 'Sesión no encontrada.' } };
    if (!['open', 'writing'].includes(session.status)) {
        return { status: 409, body: { error: 'La sesión ya no acepta nuevas conexiones.' } };
    }

    const { data, error } = await supabase.from('peer_review_participants')
        .upsert({
            session_id:   sessionId,
            student_id:   studentId,
            student_name: (payload && payload.studentName || '').slice(0, 100),
            status:       session.status === 'writing' ? 'writing' : 'connected'
        }, { onConflict: 'session_id,student_id' })
        .select('id, status')
        .single();

    if (error) return { status: 500, body: { error: error.message } };
    return { status: 200, body: { participantId: data.id, status: data.status, sessionStatus: session.status } };
}

async function actionRoster(sessionId) {
    if (!sessionId) return { status: 400, body: { error: 'sessionId requerido.' } };
    const { data: session, error: sErr } = await supabase.from('peer_review_sessions').select('*').eq('id', sessionId).single();
    if (sErr || !session) return { status: 404, body: { error: 'Sesión no encontrada.' } };

    const { data: participants, error: pErr } = await supabase.from('peer_review_participants')
        .select('status').eq('session_id', sessionId);
    if (pErr) return { status: 500, body: { error: pErr.message } };

    const counts = participants.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {});

    let reviewProgress = null;
    if (['reviewing', 'feedback_released', 'closed'].includes(session.status)) {
        const { data: assignments } = await supabase.from('peer_review_assignments')
            .select('status').eq('session_id', sessionId);
        if (assignments) {
            reviewProgress = {
                total: assignments.length,
                done:  assignments.filter(a => a.status === 'done').length
            };
        }
    }

    return {
        status: 200,
        body: {
            sessionStatus:   session.status,
            instructions:    session.instructions || '',
            writingDeadline: session.writing_deadline,
            reviewDeadline:  session.review_deadline,
            connected:       participants.length,
            byStatus:        counts,
            reviewProgress
        }
    };
}

async function actionStartWriting(sessionId, payload) {
    if (!requireTeacher(payload)) return { status: 401, body: { error: 'Contraseña de docente inválida.' } };
    const { data: session, error: sErr } = await supabase.from('peer_review_sessions').select('*').eq('id', sessionId).single();
    if (sErr || !session) return { status: 404, body: { error: 'Sesión no encontrada.' } };

    const deadline = new Date(Date.now() + session.writing_minutes * 60000).toISOString();
    const { error } = await supabase.from('peer_review_sessions')
        .update({ status: 'writing', writing_deadline: deadline }).eq('id', sessionId);
    if (error) return { status: 500, body: { error: error.message } };

    await supabase.from('peer_review_participants').update({ status: 'writing' }).eq('session_id', sessionId).eq('status', 'connected');
    return { status: 200, body: { writingDeadline: deadline } };
}

async function actionAutosaveDraft(sessionId, studentId, payload) {
    if (!sessionId || !studentId) return { status: 400, body: { error: 'sessionId y studentId requeridos.' } };
    const text = ((payload && payload.text) || '').slice(0, 20000);
    const { error } = await supabase.from('peer_review_participants')
        .update({ draft_text: text, draft_updated_at: new Date().toISOString() })
        .eq('session_id', sessionId).eq('student_id', studentId);
    if (error) return { status: 500, body: { error: error.message } };
    return { status: 200, body: { saved: true } };
}

async function actionFinishEarly(sessionId, studentId, payload) {
    if (!sessionId || !studentId) return { status: 400, body: { error: 'sessionId y studentId requeridos.' } };
    const { essaySubmissionId } = payload || {};
    if (!essaySubmissionId) return { status: 400, body: { error: 'essaySubmissionId requerido.' } };

    const { error } = await supabase.from('peer_review_participants')
        .update({ essay_submission_id: essaySubmissionId, status: 'waiting', submitted_at: new Date().toISOString() })
        .eq('session_id', sessionId).eq('student_id', studentId);
    if (error) return { status: 500, body: { error: error.message } };
    return { status: 200, body: { status: 'waiting' } };
}

// Los que se quedaron sin entregar: se les cierra igual, usando lo que tengan
// autoguardado (aunque esté incompleto o vacío) — no se excluyen del pool de revisión.
async function actionForceCloseWriting(sessionId, payload) {
    if (!requireTeacher(payload)) return { status: 401, body: { error: 'Contraseña de docente inválida.' } };

    const { data: stragglers, error: stErr } = await supabase.from('peer_review_participants')
        .select('*').eq('session_id', sessionId).in('status', ['connected', 'writing']);
    if (stErr) return { status: 500, body: { error: stErr.message } };

    for (const p of (stragglers || [])) {
        const essayText = p.draft_text || '';
        const words = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
        const { data: inserted, error: insErr } = await supabase.from('essay_submissions').insert({
            student_id:             p.student_id,
            activity:               `peer-review:${sessionId}`,
            essay_text:             essayText,
            words,
            integrity_score:        null, // no medido — cierre forzado sin submit del estudiante
            skipped:                words === 0,
            peer_review_session_id: sessionId
        }).select('id').single();

        if (insErr) { console.warn('⚠️ force_close_writing insert falló:', insErr.message); continue; }
        await supabase.from('peer_review_participants')
            .update({ essay_submission_id: inserted.id, status: 'waiting', submitted_at: new Date().toISOString() })
            .eq('id', p.id);
    }

    const { error } = await supabase.from('peer_review_sessions').update({ status: 'assigning' }).eq('id', sessionId);
    if (error) return { status: 500, body: { error: error.message } };
    return { status: 200, body: { closedStragglers: (stragglers || []).length } };
}

async function actionAssignReviews(sessionId, payload) {
    if (!requireTeacher(payload)) return { status: 401, body: { error: 'Contraseña de docente inválida.' } };
    const { data: session, error: sErr } = await supabase.from('peer_review_sessions').select('*').eq('id', sessionId).single();
    if (sErr || !session) return { status: 404, body: { error: 'Sesión no encontrada.' } };

    const { data: participants, error: pErr } = await supabase.from('peer_review_participants')
        .select('id').eq('session_id', sessionId).not('essay_submission_id', 'is', null);
    if (pErr) return { status: 500, body: { error: pErr.message } };

    const pool = participants || [];
    if (pool.length < 2) return { status: 409, body: { error: 'Se necesitan al menos 2 ensayos entregados para asignar revisiones.' } };

    const shuffled = shuffle(pool);
    const n = shuffled.length;
    const k = Math.min(session.reviewers_per_essay, n - 1); // nunca bloquea por grupos pequeños/impares

    const rows = [];
    shuffled.forEach((owner, i) => {
        const anonCode = `Ensayo ${i + 1}`;
        for (let offset = 1; offset <= k; offset++) {
            const reviewer = shuffled[(i + offset) % n];
            rows.push({
                session_id:                 sessionId,
                essay_owner_participant_id: owner.id,
                reviewer_participant_id:    reviewer.id,
                anon_code:                  anonCode
            });
        }
    });

    const { error: insErr } = await supabase.from('peer_review_assignments').insert(rows);
    if (insErr) return { status: 500, body: { error: insErr.message } };

    const reviewDeadline = new Date(Date.now() + session.review_minutes * 60000).toISOString();
    await supabase.from('peer_review_sessions').update({ status: 'reviewing', review_deadline: reviewDeadline }).eq('id', sessionId);
    await supabase.from('peer_review_participants').update({ status: 'reviewing' }).eq('session_id', sessionId).eq('status', 'waiting');

    return { status: 200, body: { assignmentsCreated: rows.length, reviewersPerEssay: k, reviewDeadline } };
}

async function actionGetMyReviews(sessionId, studentId) {
    if (!sessionId || !studentId) return { status: 400, body: { error: 'sessionId y studentId requeridos.' } };

    const { data: me, error: meErr } = await supabase.from('peer_review_participants')
        .select('id').eq('session_id', sessionId).eq('student_id', studentId).single();
    if (meErr || !me) return { status: 404, body: { error: 'No estás conectado a esta sesión.' } };

    const { data: assignments, error: aErr } = await supabase.from('peer_review_assignments')
        .select('id, anon_code, status, essay_owner_participant_id')
        .eq('session_id', sessionId).eq('reviewer_participant_id', me.id);
    if (aErr) return { status: 500, body: { error: aErr.message } };

    const ownerIds = (assignments || []).map(a => a.essay_owner_participant_id);
    if (ownerIds.length === 0) return { status: 200, body: { reviews: [] } };

    const { data: owners, error: oErr } = await supabase.from('peer_review_participants')
        .select('id, essay_submission_id').in('id', ownerIds);
    if (oErr) return { status: 500, body: { error: oErr.message } };

    const submissionIds = owners.map(o => o.essay_submission_id).filter(Boolean);
    const { data: essays, error: esErr } = await supabase.from('essay_submissions')
        .select('id, essay_text').in('id', submissionIds);
    if (esErr) return { status: 500, body: { error: esErr.message } };

    const essayById  = Object.fromEntries((essays || []).map(e => [e.id, e.essay_text]));
    const subByOwner = Object.fromEntries(owners.map(o => [o.id, o.essay_submission_id]));

    const reviews = assignments.map(a => ({
        assignmentId: a.id,
        anonCode:     a.anon_code,
        status:       a.status,
        essayText:    essayById[subByOwner[a.essay_owner_participant_id]] || '(sin entrega)'
    }));

    return { status: 200, body: { reviews } };
}

async function actionSubmitReview(studentId, payload) {
    const { assignmentId, essayScores, comments } = payload || {};
    if (!assignmentId || !essayScores || !comments) {
        return { status: 400, body: { error: 'assignmentId, essayScores y comments requeridos.' } };
    }

    const { data: assignment, error: aErr } = await supabase.from('peer_review_assignments')
        .select('id, reviewer_participant_id').eq('id', assignmentId).single();
    if (aErr || !assignment) return { status: 404, body: { error: 'Asignación no encontrada.' } };

    const { data: reviewer } = await supabase.from('peer_review_participants')
        .select('student_id').eq('id', assignment.reviewer_participant_id).single();
    if (!reviewer || reviewer.student_id !== studentId) {
        return { status: 403, body: { error: 'Esta revisión no te pertenece.' } };
    }

    const cleanScores = {};
    ESSAY_CRITERIA.forEach(key => { cleanScores[key] = clampScore(essayScores[key]); });
    const cleanComments = {
        strengths: (comments.strengths || '').slice(0, 600),
        improve:   (comments.improve   || '').slice(0, 600),
        priority:  (comments.priority  || '').slice(0, 300)
    };

    const { error: fErr } = await supabase.from('peer_review_feedback').insert({
        assignment_id: assignmentId,
        essay_scores:  cleanScores,
        comments:      cleanComments
    });
    if (fErr) return { status: 500, body: { error: fErr.message } };

    await supabase.from('peer_review_assignments').update({ status: 'done' }).eq('id', assignmentId);
    return { status: 200, body: { submitted: true } };
}

// Revisiones no entregadas a tiempo: se marcan expired y el resultado se libera
// igual con lo que sí llegó — parcial, nunca bloquea el cierre de la sesión.
async function actionForceCloseReviewing(sessionId, payload) {
    if (!requireTeacher(payload)) return { status: 401, body: { error: 'Contraseña de docente inválida.' } };
    const { error } = await supabase.from('peer_review_assignments')
        .update({ status: 'expired' }).eq('session_id', sessionId).in('status', ['pending', 'in_progress']);
    if (error) return { status: 500, body: { error: error.message } };
    return { status: 200, body: { closed: true } };
}

// Idempotente y por lotes: se puede llamar varias veces seguidas (el frontend
// hace polling de `remaining`) sin riesgo de duplicar evaluaciones ni de
// exceder el timeout de la función serverless con clases grandes.
async function actionReleaseFeedback(sessionId, payload) {
    if (!requireTeacher(payload)) return { status: 401, body: { error: 'Contraseña de docente inválida.' } };
    const batchSize = Math.min((payload && payload.batchSize) || 15, 30);

    await supabase.from('peer_review_sessions').update({ status: 'feedback_released' }).eq('id', sessionId);

    const { data: participants } = await supabase.from('peer_review_participants')
        .select('essay_submission_id').eq('session_id', sessionId).not('essay_submission_id', 'is', null);
    const submissionIds = [...new Set((participants || []).map(p => p.essay_submission_id))];

    const { data: ungradedEssays } = await supabase.from('essay_submissions')
        .select('id, essay_text').in('id', submissionIds).is('ai_essay_scores', null);

    let graded = 0;
    for (const essay of (ungradedEssays || []).slice(0, batchSize)) {
        const { scores, rationale } = await gradeEssay(essay.essay_text);
        await supabase.from('essay_submissions')
            .update({ ai_essay_scores: scores, ai_essay_rationale: rationale }).eq('id', essay.id);
        graded++;
    }

    let feedbackGraded = 0;
    if (graded === 0 && (!ungradedEssays || ungradedEssays.length <= batchSize)) {
        // Solo pasa a calificar feedback una vez que ya no quedan ensayos sin calificar en este lote.
        const { data: assignmentIds } = await supabase.from('peer_review_assignments')
            .select('id').eq('session_id', sessionId);
        const ids = (assignmentIds || []).map(a => a.id);

        const { data: ungradedFeedback } = await supabase.from('peer_review_feedback')
            .select('id, comments').in('assignment_id', ids).is('ai_review_quality_scores', null);

        for (const fb of (ungradedFeedback || []).slice(0, batchSize)) {
            const { scores, rationale } = await gradeReviewQuality(fb.comments);
            await supabase.from('peer_review_feedback')
                .update({ ai_review_quality_scores: scores, ai_review_quality_rationale: rationale }).eq('id', fb.id);
            feedbackGraded++;
        }
    }

    const remainingEssays = Math.max(0, (ungradedEssays || []).length - graded);
    return {
        status: 200,
        body: {
            gradedEssays:    graded,
            gradedFeedback:  feedbackGraded,
            remaining:       remainingEssays > 0 ? remainingEssays : feedbackGraded > 0 ? -1 : 0
            // remaining: -1 significa "sigue habiendo feedback por calificar, sigue llamando"
        }
    };
}

async function actionGetResults(sessionId, studentId) {
    if (!sessionId || !studentId) return { status: 400, body: { error: 'sessionId y studentId requeridos.' } };

    const { data: me, error: meErr } = await supabase.from('peer_review_participants')
        .select('id, essay_submission_id').eq('session_id', sessionId).eq('student_id', studentId).single();
    if (meErr || !me) return { status: 404, body: { error: 'No estás conectado a esta sesión.' } };

    let essay = null;
    if (me.essay_submission_id) {
        const { data } = await supabase.from('essay_submissions')
            .select('essay_text, ai_essay_scores, ai_essay_rationale').eq('id', me.essay_submission_id).single();
        essay = data;
    }

    const { data: assignmentsOnMyEssay } = await supabase.from('peer_review_assignments')
        .select('id, status').eq('essay_owner_participant_id', me.id);
    const doneIds = (assignmentsOnMyEssay || []).filter(a => a.status === 'done').map(a => a.id);

    const { data: peerFeedback } = await supabase.from('peer_review_feedback')
        .select('essay_scores, comments').in('assignment_id', doneIds.length ? doneIds : ['00000000-0000-0000-0000-000000000000']);

    const peerAvg = {};
    ESSAY_CRITERIA.forEach(key => {
        const vals = (peerFeedback || []).map(f => f.essay_scores[key]).filter(v => v != null);
        peerAvg[key] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
    });

    const { data: myReviewAssignments } = await supabase.from('peer_review_assignments')
        .select('id').eq('reviewer_participant_id', me.id);
    const myAssignmentIds = (myReviewAssignments || []).map(a => a.id);
    const { data: myFeedbackGiven } = await supabase.from('peer_review_feedback')
        .select('ai_review_quality_scores, ai_review_quality_rationale')
        .in('assignment_id', myAssignmentIds.length ? myAssignmentIds : ['00000000-0000-0000-0000-000000000000']);

    const reviewAvg = {};
    REVIEW_CRITERIA.forEach(key => {
        const vals = (myFeedbackGiven || []).map(f => f.ai_review_quality_scores && f.ai_review_quality_scores[key]).filter(v => v != null);
        reviewAvg[key] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
    });

    return {
        status: 200,
        body: {
            essay: {
                text: essay ? essay.essay_text : null,
                aiEvaluator: {
                    label:     'Evaluador por IA (Groq)',
                    scores:    essay ? essay.ai_essay_scores : null,
                    rationale: essay ? essay.ai_essay_rationale : null
                },
                peerEvaluation: {
                    label:      'Evaluación de tus pares',
                    scores:     peerAvg,
                    reviewCount: (peerFeedback || []).length,
                    details:    (peerFeedback || []).map(f => f.comments)
                }
            },
            myReviewsQuality: {
                label:  'Evaluador por IA (Groq) — pertinencia de tus revisiones',
                scores: reviewAvg,
                rationales: (myFeedbackGiven || []).map(f => f.ai_review_quality_rationale).filter(Boolean)
            }
        }
    };
}

// ── Router ───────────────────────────────────────────────────────────────────

// Nota: usa res.setHeader/writeHead/end (nunca res.status().json()) para ser
// compatible tanto con el runtime de Vercel como con el servidor Node puro de
// server.js (local). Mismo patrón que api/orchestrator.js.
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const send = (statusCode, body) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(body));
    };

    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    try {
        const isGet = req.method === 'GET';
        let src;
        if (isGet) {
            src = req.query || {};
        } else if (req.body && typeof req.body === 'object') {
            // Vercel ya parsea el body — también usado cuando server.js lo parsea a mano en local.
            src = req.body;
        } else {
            const raw = await new Promise((resolve, reject) => {
                let data = '';
                req.on('data', chunk => { data += chunk.toString(); });
                req.on('end',  ()    => resolve(data));
                req.on('error', reject);
            });
            src = raw ? JSON.parse(raw) : {};
        }

        const { action, sessionId, studentId, payload = {} } = src || {};
        if (!action) return send(400, { error: 'action requerido.' });

        let result;
        switch (action) {
            case 'open':                   result = await actionOpen(payload); break;
            case 'connect':                 result = await actionConnect(sessionId, studentId, payload); break;
            case 'roster':                  result = await actionRoster(sessionId); break;
            case 'start_writing':           result = await actionStartWriting(sessionId, payload); break;
            case 'autosave_draft':          result = await actionAutosaveDraft(sessionId, studentId, payload); break;
            case 'finish_early':            result = await actionFinishEarly(sessionId, studentId, payload); break;
            case 'force_close_writing':     result = await actionForceCloseWriting(sessionId, payload); break;
            case 'assign_reviews':          result = await actionAssignReviews(sessionId, payload); break;
            case 'get_my_reviews':          result = await actionGetMyReviews(sessionId, studentId); break;
            case 'submit_review':           result = await actionSubmitReview(studentId, payload); break;
            case 'force_close_reviewing':   result = await actionForceCloseReviewing(sessionId, payload); break;
            case 'release_feedback':        result = await actionReleaseFeedback(sessionId, payload); break;
            case 'get_results':             result = await actionGetResults(sessionId, studentId); break;
            default: return send(400, { error: `Acción desconocida: "${action}"` });
        }

        return send(result.status, result.body);
    } catch (e) {
        console.error('🔥 peer-review-session error:', e);
        return send(500, { error: 'Internal Server Error' });
    }
};
