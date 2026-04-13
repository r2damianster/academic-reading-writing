/* api/agents/peer-review.js
 * Agente Peer Review — módulo de transformación de payload.
 *
 * Dos modos de operación (definidos en el system prompt de _prompts.js):
 *   reviewer_guide    — el estudiante está revisando el trabajo de un par
 *   feedback_receiver — el estudiante está leyendo comentarios sobre su propio trabajo
 *
 * Campos del payload esperado (desde peer-review-form.html):
 *   mode             — "reviewer_guide" | "feedback_receiver"
 *   peerEssay        — texto del ensayo que se está revisando (max 1000 chars)
 *   reviewerDraft    — borrador del feedback que el revisor está escribiendo (max 400)
 *   scores           — { argument: 1-4, evidence: 1-4, structure: 1-4, ... }
 *   focusField       — campo activo: "strengths" | "improve" | "priority"
 *   feedbackReceived — Mode B: feedback recibido para interpretar (max 800 chars)
 *   lessonTitle      — título de la lección / ensayo siendo revisado
 */

const RUBRIC_LABELS = {
    argument:    'Argument (thesis + paragraph coherence)',
    evidence:    'Evidence (relevance + analysis)',
    structure:   'Structure (intro/body/conclusion + transitions)',
    language:    'Language (academic register + grammar)',
    conventions: 'Conventions (APA 7 citations)'
};

const AGENT_META = {
    name:                'Peer Review Facilitator',
    defaultOutput:       'short_answer',
    modelRecommendation: 'sonnet para análisis de feedback; haiku para guía puntual'
};

// ── Transformación del payload ───────────────────────────────────────────────

function transformPayload(raw) {
    // Normalizar scores: solo valores entre 1 y 4
    const rawScores   = raw.scores && typeof raw.scores === 'object' ? raw.scores : {};
    const cleanScores = {};
    Object.entries(rawScores).forEach(([k, v]) => {
        const n = parseInt(v);
        if (!isNaN(n) && n >= 1 && n <= 4) cleanScores[k] = n;
    });

    return {
        mode:             ['reviewer_guide', 'feedback_receiver'].includes(raw.mode)
                              ? raw.mode : 'reviewer_guide',
        peerEssay:        (raw.peerEssay        || '').slice(0, 1000).trim(),
        reviewerDraft:    (raw.reviewerDraft     || '').slice(0, 400).trim(),
        scores:           cleanScores,
        focusField:       ['strengths', 'improve', 'priority'].includes(raw.focusField)
                              ? raw.focusField : null,
        feedbackReceived: (raw.feedbackReceived  || '').slice(0, 800).trim(),
        lessonTitle:      (raw.lessonTitle       || '').slice(0, 100).trim()
    };
}

// ── Construcción de la tarea ─────────────────────────────────────────────────

function buildTask(payload) {
    // ── Mode B: el estudiante recibió feedback ──────────────────────────────
    if (payload.mode === 'feedback_receiver') {
        const fb = payload.feedbackReceived
            ? `Feedback received: "${payload.feedbackReceived.slice(0, 300)}"`
            : 'The student received peer review feedback but has not shared it yet.';

        return (
            `MODE B — FEEDBACK RECEIVER. ${fb} ` +
            `Help the student understand which suggestions are structural (high priority) ` +
            `vs stylistic (optional). Use the PEER model to help them create a concrete ` +
            `revision plan — one action item at a time. Do not dismiss or validate the ` +
            `feedback emotionally; treat it as data.`
        );
    }

    // ── Mode A: el estudiante está revisando el trabajo de un par ───────────
    const scoresStr = Object.entries(payload.scores)
        .map(([k, v]) => `${RUBRIC_LABELS[k] || k}: ${v}/4`)
        .join(', ');

    const ratingsCtx = scoresStr
        ? ` Ratings given so far: ${scoresStr}.`
        : ' No ratings given yet.';

    const focusCtx = payload.focusField
        ? ` The reviewer is currently writing the "${payload.focusField}" section.`
        : '';

    // El revisor tiene un borrador de feedback: evaluarlo
    if (payload.reviewerDraft) {
        return (
            `MODE A — REVIEWER GUIDE. Evaluate this draft feedback: ` +
            `"${payload.reviewerDraft}".${ratingsCtx}${focusCtx} ` +
            `Check: (1) Is it specific — does it reference a passage or paragraph? ` +
            `(2) Is it actionable — does it say what should change and why? ` +
            `(3) Is it balanced — does it avoid personal judgement? ` +
            `Ask one guiding question to help the reviewer improve their comment.`
        );
    }

    // El revisor necesita orientación sin borrador previo
    return (
        `MODE A — REVIEWER GUIDE. Guide the reviewer through evaluating a peer essay ` +
        `${payload.lessonTitle ? `titled "${payload.lessonTitle}"` : ''}.` +
        `${ratingsCtx}${focusCtx} ` +
        `Use the Socratic method: ask one guiding question about the ` +
        `${payload.focusField || 'most important aspect'}. ` +
        `Do not write the feedback for them.`
    );
}

module.exports = { AGENT_META, RUBRIC_LABELS, transformPayload, buildTask };
