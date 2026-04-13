/* api/agents/writing.js
 * Agente de Escritura Académica.
 * La lógica central (llamada a Claude) la maneja el orquestador.
 * Este módulo define metadatos y transformaciones de payload específicas.
 */

const AGENT_META = {
    name:         'writing',
    description:  'Academic writing tutor — feedback on essays and paragraphs',
    defaultOutput: 'full_feedback',
    defaultDepth:  2,          // necesita 2 sesiones de historial para personalizar
    models: {
        // Routing recomendado según tipo de tarea
        grammarCheck:    'haiku',   // corrección gramatical simple
        structureFeedback: 'sonnet', // análisis de estructura
        researchPaper:   'opus'     // análisis de paper completo
    }
};

/**
 * Transforma el payload recibido del frontend en el formato óptimo para el orquestador.
 * Trunca el ensayo para no desperdiciar tokens en texto muy largo.
 *
 * @param {object} raw - { lesson, essay, audit, lessonRequirements? }
 * @returns {object} payload listo para el orquestador
 */
function transformPayload(raw) {
    const { lesson, essay, audit, lessonRequirements } = raw || {};

    // Truncar el ensayo a 2000 caracteres (suficiente para feedback pedagógico)
    const essayTruncated = (essay || '').slice(0, 2000);
    const wasTruncated   = (essay || '').length > 2000;

    const transformed = {
        lesson:       lesson || 'unknown',
        essay:        essayTruncated,
        wordCount:    audit?.words || 0,
        integrityScore: audit?.integrityScore || 100
    };

    if (wasTruncated) {
        transformed.note = 'Essay truncated to 2000 chars for analysis';
    }

    if (lessonRequirements) {
        transformed.rubric = lessonRequirements;
    }

    // Incluir métricas relevantes para contextualizar el feedback
    if (audit && !audit.skipped) {
        transformed.writingMetrics = {
            pastes:         audit.pastes         || 0,
            writingDuration: audit.writingDuration || 0,
            timeToFirstKey: audit.timeToFirstKey  || 0
        };
    }

    return transformed;
}

/**
 * Genera el texto de la tarea (task string) para el orquestador.
 * @param {object} payload - payload ya transformado
 * @returns {string}
 */
function buildTask(payload) {
    const words = payload.wordCount;
    const lesson = payload.lesson;

    if (words < 30) {
        return `El estudiante escribió muy poco (${words} palabras) para la lección "${lesson}". ` +
               'Identifica si el texto tiene al menos una idea completa y sugiere cómo expandirlo.';
    }

    return `Evalúa el ensayo de la lección "${lesson}" (${words} palabras) y proporciona ` +
           'retroalimentación específica y constructiva siguiendo el PEER model.';
}

module.exports = { AGENT_META, transformPayload, buildTask };
