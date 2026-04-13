/* api/agents/integrity.js
 * Agente de Integridad Académica.
 * Recibe métricas de telemetría del essay y genera un reporte narrativo.
 * Solo visible para el instructor — nunca se muestra al estudiante.
 */

const AGENT_META = {
    name:         'integrity',
    description:  'Academic integrity analyst — behavioral telemetry narrative reports',
    defaultOutput: 'narrative_report',
    defaultDepth:  3,   // necesita historial para detectar patrones multi-sesión
    models: {
        singleSession: 'sonnet',  // análisis de una sola sesión
        multiSession:  'opus'     // comparación entre sesiones (detección de patrones)
    }
};

// Umbrales de riesgo — deben coincidir con el sistema prompt del agente
const RISK_THRESHOLDS = {
    LOW:      { min: 85, max: 100, label: 'LOW',      color: '#27ae60' },
    MODERATE: { min: 60, max: 84,  label: 'MODERATE', color: '#e67e22' },
    HIGH:     { min: 30, max: 59,  label: 'HIGH',     color: '#e74c3c' },
    CRITICAL: { min: 0,  max: 29,  label: 'CRITICAL', color: '#8e0000' }
};

/**
 * Clasifica el nivel de riesgo según el integrity_score.
 * @param {number} score - 0 a 100
 * @returns {object} { label, color, min, max }
 */
function classifyRisk(score) {
    if (score >= 85) return RISK_THRESHOLDS.LOW;
    if (score >= 60) return RISK_THRESHOLDS.MODERATE;
    if (score >= 30) return RISK_THRESHOLDS.HIGH;
    return RISK_THRESHOLDS.CRITICAL;
}

/**
 * Transforma el payload de auditoría en el formato óptimo para el orquestador.
 * Filtra campos irrelevantes y agrega señales derivadas.
 *
 * @param {object} raw - audit data de essay-handler.js
 * @returns {object} payload listo para el orquestador
 */
function transformPayload(raw) {
    const {
        lesson, words, pastes, keystrokes, deletions,
        tabSwitches, timeToFirstKey, writingDuration,
        charsTypedRatio, integrityScore
    } = raw || {};

    const risk = classifyRisk(integrityScore ?? 100);

    // Señales derivadas que el agente puede usar directamente
    const derived = {
        pasteRatio:      charsTypedRatio != null ? (100 - charsTypedRatio) : null,
        wordsPerMinute:  (writingDuration > 0 && words > 0)
                            ? Math.round((words / writingDuration) * 60)
                            : null,
        deletionRate:    (keystrokes > 0 && deletions > 0)
                            ? Math.round((deletions / keystrokes) * 100)
                            : 0
    };

    return {
        lesson:          lesson || 'unknown',
        preCalculatedRisk: risk.label,
        metrics: {
            words:           words           || 0,
            pastes:          pastes          || 0,
            keystrokes:      keystrokes      || 0,
            deletions:       deletions       || 0,
            tabSwitches:     tabSwitches     || 0,
            timeToFirstKey:  timeToFirstKey  || 0,
            writingDuration: writingDuration || 0,
            charsTypedRatio: charsTypedRatio || 100,
            integrityScore:  integrityScore  || 100
        },
        derived
    };
}

/**
 * Genera el task string para el orquestador.
 * @param {object} payload - payload ya transformado
 * @returns {string}
 */
function buildTask(payload) {
    const { preCalculatedRisk, metrics } = payload;
    return `Analiza las métricas de integridad de la sesión de escritura para la lección ` +
           `"${payload.lesson}". El score pre-calculado es ${metrics.integrityScore}% ` +
           `(riesgo ${preCalculatedRisk}). Genera un reporte narrativo para el instructor.`;
}

module.exports = { AGENT_META, transformPayload, buildTask, classifyRisk, RISK_THRESHOLDS };
