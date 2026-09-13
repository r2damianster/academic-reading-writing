/* lib/agents/test-grader.js
 * Agente evaluador de tests con rúbrica de 8 indicadores.
 * Recibe Phase 1 (topic sentences) + Phase 2 (body paragraphs) concatenadas
 * junto con la rúbrica activa de test_rubrics.
 * Devuelve JSON estricto: { indicator_scores, total_score, overall_feedback }
 */

function transformPayload(payload) {
    const { essay, rubric, lesson } = payload || {};
    return {
        lesson:  lesson  || 'test1 fundamentals',
        essay:   (essay  || '').slice(0, 6000),
        rubric:  rubric  || null
    };
}

function buildTask(payload) {
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

module.exports = { transformPayload, buildTask };
