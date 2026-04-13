/* api/agents/reading.js
 * Agente de Lectura Académica — módulo de transformación de payload.
 * El orquestador lo carga dinámicamente. Exporta transformPayload y buildTask.
 *
 * Campos del payload esperado (desde reading-engine.js / agent-client.js):
 *   lesson       — nombre normalizado de la lección
 *   pdfId        — URL o ID del PDF activo (puede ser null)
 *   currentPage  — página actual del PDF
 *   question     — pregunta del estudiante (texto libre, max 500 chars)
 *   selectedText — fragmento del PDF que el estudiante resaltó (max 300 chars)
 *   slideType    — tipo de slide activo (READING_QUIZ, READING_FILL, etc.)
 *   wrongAttempts— intentos fallidos en el exercise activo (señal de dificultad)
 */

const AGENT_META = {
    name:                'Academic Reading Coach',
    defaultOutput:       'short_answer',
    modelRecommendation: 'haiku para preguntas de vocabulario; sonnet para análisis de comprensión crítica'
};

// ── Transformación del payload ───────────────────────────────────────────────
// Normaliza, trunca y estructura los datos antes de enviarlos al modelo.

function transformPayload(raw) {
    return {
        lesson:        raw.lesson        || 'unknown',
        pdfId:         raw.pdfId         || null,
        currentPage:   typeof raw.currentPage === 'number' ? raw.currentPage : 1,
        question:      (raw.question     || '').slice(0, 500).trim(),
        selectedText:  (raw.selectedText || '').slice(0, 300).trim(),
        slideType:     raw.slideType     || null,
        wrongAttempts: typeof raw.wrongAttempts === 'number' ? raw.wrongAttempts : 0
    };
}

// ── Construcción de la tarea ─────────────────────────────────────────────────
// Genera el string de `task` según el contexto de la interacción.

function buildTask(payload) {
    const lesson  = payload.lesson      || 'the lesson';
    const page    = payload.currentPage || 1;
    const wrong   = payload.wrongAttempts;

    // Caso 1: el estudiante resaltó un fragmento del PDF
    if (payload.selectedText) {
        return `The student highlighted this text from the PDF (lesson "${lesson}", page ${page}): ` +
               `"${payload.selectedText}". They need help understanding it. ` +
               `Apply Socratic coaching — do not summarize the whole article.`;
    }

    // Caso 2: pregunta explícita del estudiante
    if (payload.question) {
        const retryNote = wrong > 0
            ? ` Note: the student has made ${wrong} wrong attempt(s) on this activity.`
            : '';
        return `Student question about "${lesson}" (PDF page ${page}): ${payload.question}${retryNote}`;
    }

    // Caso 3: dificultad sin pregunta específica (múltiples errores)
    if (wrong >= 2) {
        return `The student is struggling with "${lesson}" (page ${page}, ` +
               `slide type: ${payload.slideType || 'unknown'}) after ${wrong} failed attempts. ` +
               `Provide a hint using the Socratic method — do not give the answer directly.`;
    }

    // Caso 4: contexto general
    return `The student needs reading support for "${lesson}", currently on page ${page} ` +
           `(slide: ${payload.slideType || 'unknown'}).`;
}

module.exports = { AGENT_META, transformPayload, buildTask };
