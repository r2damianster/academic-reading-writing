/* lib/agents/test-grader.js
 * Agente evaluador de tests con rúbrica de 8 indicadores.
 * Recibe Phase 1 (topic sentences) + Phase 2 (body paragraphs) concatenadas
 * junto con la rúbrica activa de test_rubrics.
 * Devuelve JSON estricto: { indicator_scores, total_score, overall_feedback }
 */

function transformPayload(payload) {
    const { essay, rubric, lesson, source, keyIdeas, checks, stepInstruction } = payload || {};
    const transformed = {
        lesson:  lesson  || 'test1 fundamentals',
        essay:   (essay  || '').slice(0, 6000),
        rubric:  rubric  || null
    };
    // Campos opcionales para tareas de summarizing/paraphrasing (BUILD_UP / APPLIED_TASK con fuente)
    if (source)                                  transformed.source          = String(source).slice(0, 3000);
    if (stepInstruction)                         transformed.stepInstruction = String(stepInstruction).slice(0, 500);
    if (Array.isArray(keyIdeas) && keyIdeas.length) transformed.keyIdeas     = keyIdeas.slice(0, 8).map(idea => String(idea).slice(0, 300));
    if (checks && typeof checks === 'object')    transformed.checks          = checks;
    return transformed;
}

function buildTask(payload) {
    if (payload && (payload.source || payload.keyIdeas)) return buildSourceTask(payload);
    return (
        'Evaluate this academic writing submission against the provided rubric. ' +
        'Return ONLY valid JSON — no markdown, no explanation outside the JSON structure. ' +
        'Format: { "indicator_scores": [{ "key": "...", "points": 0.00, "level": "...", "comment": "..." }], ' +
        '"total_score": 0.00, "overall_feedback": "..." }. ' +
        'Score each rubric item against its defined point levels/descriptors when present; ' +
        'if an item has only a max point value, assign points out of that value based on how well the response satisfies it. ' +
        'Comments must be in Spanish, specific, and pedagogically constructive (1–2 sentences per item).'
    );
}

// Tareas con texto fuente: el estudiante resume o parafrasea "source".
// La IA no da un juicio holístico: verifica cada idea clave como presente/ausente,
// lo que es más objetivo y más fiable con modelos pequeños.
function buildSourceTask(payload) {
    const hasKeyIdeas = Array.isArray(payload.keyIdeas) && payload.keyIdeas.length > 0;
    return (
        'The student was asked to work from the SOURCE text in DATA (summarize or paraphrase it). ' +
        'Evaluate ONLY the student response ("essay") against the source and the rubric. ' +
        (hasKeyIdeas
            ? 'For each entry of "keyIdeas", decide if the student response expresses that idea (in any wording, ' +
              'a faithful paraphrase counts; copying is not required). Put your yes/no decision in the matching ' +
              'rubric indicator comment and award points proportionally to the ideas present. '
            : '') +
        'If "checks" is present, treat those values as objective facts (e.g. copyOverlap, wordRatio, hasCitation) ' +
        'and do not contradict them. Penalize claims not supported by the source. ' +
        'Return ONLY valid JSON — no markdown. Format: { "indicator_scores": [{ "key": "...", "points": 0.00, ' +
        '"level": "...", "comment": "...", "suggested_example": "" }], "total_score": 0.00, "overall_feedback": "..." }. ' +
        'indicator_scores must follow the order of the rubric. total_score must equal the sum of points. ' +
        'Comments and overall_feedback in Spanish (1–2 sentences, specific); suggested_example in English, only if points are below max.'
    );
}

module.exports = { transformPayload, buildTask };
