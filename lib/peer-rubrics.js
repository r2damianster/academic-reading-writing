/* lib/peer-rubrics.js
 * Rúbricas de la sesión de peer review en vivo. Cada sesión guarda `rubric_key`
 * y el endpoint usa estos criterios para el puntaje de los revisores, el
 * promedio de pares y el prompt de la IA. Agregar una rúbrica nueva = agregar
 * una entrada aquí (no hace falta tocar el endpoint ni el frontend).
 *
 * Escala de todos los criterios: 1-4 (1=Unsatisfactory, 4=Excellent).
 */

const DEFAULT_RUBRIC_KEY = 'peel';

const RUBRICS = {
    // Sesión original: ensayo de 3 párrafos PEEL con hedging y nominalización.
    peel: {
        label: 'PEEL, Hedging & Nominalization',
        criteria: [
            { key: 'peel_rigor',     label: 'PEEL (Point-Evidence-Explain-Link)' },
            { key: 'hedging',        label: 'Hedging' },
            { key: 'nominalization', label: 'Nominalización' }
        ],
        graderPrompt:
            'You are an objective academic writing evaluator. The essay below is 3 argument paragraphs ' +
            'that must each follow the P.E.E.L. model (Point, Evidence, Explain, Link — Link connects the ' +
            'paragraph back to the thesis) and deliberately use hedging language and nominalizations. ' +
            'Score 1-4 on exactly these 3 criteria (1=Unsatisfactory, 2=In Progress, 3=Satisfactory, 4=Excellent): ' +
            'peel_rigor (all 3 paragraphs execute Point→Evidence→Explain→Link in order, Link ties back to the thesis), ' +
            'hedging (modal verbs / approximators / distancing verbs / reporting structures used in each paragraph, ' +
            'calibrated to the strength of the claim — not overclaiming or underclaiming), ' +
            'nominalization (at least 2 natural nominalizations per paragraph, e.g. implementation/development/assumption, ' +
            'not just plain verbs). Respond ONLY with JSON: ' +
            '{"peel_rigor":n,"hedging":n,"nominalization":n,' +
            '"rationale":"1-2 sentences in Spanish explaining the overall score"}'
    },

    // Mini-ensayo de 4 párrafos, uno por patrón, en orden fijo: SPRE, PEEL, CER, Toulmin.
    // Hedging y nominalización no puntúan: los revisores los comentan en texto libre.
    combined: {
        label: 'SPRE + PEEL + CER + Toulmin',
        reviewHint: 'Puntúa cada párrafo según su patrón. Hedging y nominalización no puntúan: coméntalos en "Qué mejorar".',
        criteria: [
            { key: 'spre',    label: 'Párrafo 1 — SPRE (Situation-Problem-Response-Evaluation)' },
            { key: 'peel',    label: 'Párrafo 2 — PEEL (Point-Evidence-Explain-Link)' },
            { key: 'cer',     label: 'Párrafo 3 — CER (Claim-Evidence-Reasoning)' },
            { key: 'toulmin', label: 'Párrafo 4 — Toulmin (al menos 4 de 6 componentes)' }
        ],
        graderPrompt:
            'You are an objective academic writing evaluator. The text below is a mini-essay of FOUR paragraphs, ' +
            'each written with a different pattern, in this fixed order: ' +
            '(1) SPRE — Situation, Problem, Response, Evaluation; ' +
            '(2) PEEL — Point, Evidence, Explanation, Link; ' +
            '(3) CER — Claim, Evidence (means, dispersion, significance), Reasoning; ' +
            '(4) Toulmin — at least four of Claim, Grounds, Warrant, Backing, Qualifier, Rebuttal, including a hedge and a condition under which the claim would not apply. ' +
            'The students were told NOT to write the component labels, so judge the function of each sentence, not labels. ' +
            'If a paragraph is missing or does not follow its pattern, score it 1. ' +
            'Score 1-4 (1=Unsatisfactory, 2=In Progress, 3=Satisfactory, 4=Excellent) on exactly these 4 criteria: ' +
            'spre (paragraph 1 has all four components in order; Situation gives context before the Problem), ' +
            'peel (paragraph 2: clear Point, concrete Evidence, Explanation that interprets instead of repeating, Link back to the topic), ' +
            'cer (paragraph 3: Claim announces the finding, Evidence reports data, Reasoning explains what the data mean), ' +
            'toulmin (paragraph 4: disputable Claim, Grounds with source, a Warrant explaining WHY the grounds support the claim, plus qualifier/rebuttal). ' +
            'Respond ONLY with JSON: {"spre":n,"peel":n,"cer":n,"toulmin":n,' +
            '"rationale":"1-2 sentences in Spanish naming the strongest and the weakest paragraph"}'
    }
};

function resolveRubricKey(rubricKey) {
    return RUBRICS[rubricKey] ? rubricKey : DEFAULT_RUBRIC_KEY;
}

function getRubric(rubricKey) {
    return RUBRICS[resolveRubricKey(rubricKey)];
}

function getCriteriaKeys(rubricKey) {
    return getRubric(rubricKey).criteria.map(criterion => criterion.key);
}

module.exports = { RUBRICS, DEFAULT_RUBRIC_KEY, resolveRubricKey, getRubric, getCriteriaKeys };
