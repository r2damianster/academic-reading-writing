/* scripts/grade-pending-tests.js
 * Califica en lote los envíos de tests (activity "test...") que no tienen fila en test_evaluations.
 * Usa la misma rúbrica activa, el mismo prompt y el mismo formato que el test-grader del orquestador.
 *
 * Uso:
 *   node scripts/grade-pending-tests.js            → simulacro: lista qué calificaría, no escribe nada
 *   node scripts/grade-pending-tests.js --apply    → califica y guarda en test_evaluations
 *   node scripts/grade-pending-tests.js --apply --test "test peel"   → solo un test
 */
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    fs.readFileSync(filePath, 'utf8').split(/\r?\n/).forEach(line => {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
        if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    });
}
loadEnvFile(path.join(__dirname, '..', '.env'));

const PROMPTS = require('../lib/agents/_prompts');
const testGrader = require('../lib/agents/test-grader');
const { groqChat } = require('../lib/groq-client');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const GROQ_KEY     = process.env.GROQ_TOKEN;
const SECONDS_BETWEEN_CALLS = 30; // límite de Groq: 8000 tokens/minuto, ~4000 por calificación

const shouldApply  = process.argv.includes('--apply');
const testFilterIx = process.argv.indexOf('--test');
const testFilter   = testFilterIx !== -1 ? process.argv[testFilterIx + 1] : null;

const supabaseHeaders = {
    apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json'
};

async function supabaseGet(restPath) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${restPath}`, { headers: supabaseHeaders });
    if (!response.ok) throw new Error(`GET ${restPath} → ${response.status} ${await response.text()}`);
    return response.json();
}

function sleep(milliseconds) { return new Promise(resolve => setTimeout(resolve, milliseconds)); }

function parseGraderJson(rawText) {
    const trimmed = (rawText || '').trim();
    const jsonText = trimmed.startsWith('{') ? trimmed : trimmed.replace(/^```json?\n?/, '').replace(/```$/, '');
    return JSON.parse(jsonText);
}

async function gradeSubmission(submission, rubric) {
    const payload = testGrader.transformPayload({
        lesson: submission.activity, essay: submission.essay_text, rubric: rubric.indicators
    });
    const task = testGrader.buildTask(payload);
    const userContent = `TASK: ${task}\n\nDATA:\n${JSON.stringify(payload, null, 2)}`;

    const groqResult = await groqChat({
        apiKey: GROQ_KEY, model: 'llama-3.3-70b-versatile',
        system: PROMPTS.testGrader, userContent, maxTokens: 2000
    });
    return { evaluation: parseGraderJson(groqResult.text), modelUsed: groqResult.model };
}

async function saveEvaluation(submission, rubric, evaluation, modelUsed) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/test_evaluations`, {
        method: 'POST',
        headers: { ...supabaseHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify({
            student_id:       submission.student_id,
            submission_id:    submission.id,
            test_id:          submission.activity,
            rubric_id:        rubric.id,
            attempt_number:   1,
            total_score:      evaluation.total_score ?? null,
            indicator_scores: evaluation.indicator_scores || [],
            overall_feedback: evaluation.overall_feedback || '',
            model_used:       modelUsed || null
        })
    });
    if (!response.ok) throw new Error(`INSERT → ${response.status} ${await response.text()}`);
}

async function main() {
    if (!SUPABASE_URL || !SERVICE_KEY || !GROQ_KEY) throw new Error('Faltan SUPABASE_URL, SUPABASE_SERVICE_KEY o GROQ_TOKEN en .env');

    const rubrics = await supabaseGet('test_rubrics?is_active=eq.true&test_id=like.test*&select=id,test_id,indicators');
    const rubricByTest = Object.fromEntries(rubrics.map(rubric => [rubric.test_id, rubric]));

    const submissions = await supabaseGet(
        'essay_submissions?activity=like.test*&skipped=is.false&select=id,student_id,activity,essay_text,created_at&order=created_at.asc'
    );
    const evaluated = await supabaseGet('test_evaluations?submission_id=not.is.null&select=submission_id');
    const evaluatedIds = new Set(evaluated.map(row => row.submission_id));

    const pending = submissions.filter(submission =>
        !evaluatedIds.has(submission.id) &&
        rubricByTest[submission.activity] &&
        (submission.essay_text || '').trim().length > 50 &&
        (!testFilter || submission.activity === testFilter));

    console.log(`${pending.length} envíos sin calificar (${shouldApply ? 'APLICANDO' : 'simulacro'})`);

    let gradedCount = 0;
    for (const [position, submission] of pending.entries()) {
        const label = `${position + 1}/${pending.length} "${submission.activity}" ${submission.created_at}`;
        if (!shouldApply) { console.log(`  pendiente ${label}`); continue; }
        try {
            const { evaluation, modelUsed } = await gradeSubmission(submission, rubricByTest[submission.activity]);
            await saveEvaluation(submission, rubricByTest[submission.activity], evaluation, modelUsed);
            gradedCount++;
            console.log(`  ✅ ${label} → ${evaluation.total_score}`);
        } catch (error) {
            console.warn(`  ⚠️ ${label} falló: ${error.message.slice(0, 200)}`);
        }
        if (position < pending.length - 1) await sleep(SECONDS_BETWEEN_CALLS * 1000);
    }
    if (shouldApply) console.log(`Listo: ${gradedCount}/${pending.length} calificados.`);
}

main().catch(error => { console.error('❌', error.message); process.exit(1); });
