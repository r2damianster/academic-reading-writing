/* api/agents/content-gen.js
 * Agente Generador de Contenido — módulo de transformación de payload.
 * Genera slides HTML listos para pegar en los módulos del slide-engine.js.
 *
 * Campos del payload esperado (desde admin.html):
 *   lessonTitle    — título de la lección
 *   module         — carpeta destino (ej: "01/unit1-essays")
 *   difficulty     — nivel CEFR: "A2" | "B1" | "B2"
 *   objective      — objetivo de aprendizaje de la lección (1 oración)
 *   slideCount     — cantidad de slides deseados (4-14, default 10)
 *   slideTypes     — array de tipos deseados (CONTENT, QUIZ, ESSAY, etc.)
 *   keyVocabulary  — array de palabras clave a incluir
 *   existingContext— resumen de lecciones previas para mantener coherencia
 */

const SLIDE_TYPES = [
    'VIDEO', 'CONTENT', 'QUIZ', 'CONTRAST', 'DRAG_DROP',
    'FILL_BLANK', 'ESSAY', 'HIGHLIGHT', 'MATCH',
    'SORT_PARAGRAPH', 'WORD_BANK', 'CATEGORIZE'
];

const AGENT_META = {
    name:                'Content Generator',
    defaultOutput:       'generate_content',
    modelRecommendation: 'opus para lección completa; sonnet para un slide individual o revisión'
};

// ── Transformación del payload ───────────────────────────────────────────────

function transformPayload(raw) {
    const requestedTypes = Array.isArray(raw.slideTypes)
        ? raw.slideTypes
              .map(t => String(t).toUpperCase().trim())
              .filter(t => SLIDE_TYPES.includes(t))
        : ['CONTENT', 'QUIZ', 'ESSAY'];

    // Garantizar al menos CONTENT y QUIZ si el array quedó vacío por filtrado
    const finalTypes = requestedTypes.length > 0 ? requestedTypes : ['CONTENT', 'QUIZ', 'ESSAY'];

    return {
        lessonTitle:     (raw.lessonTitle     || 'Untitled Lesson').slice(0, 100).trim(),
        module:          (raw.module          || '00-fundamentals').trim(),
        difficulty:      ['A2', 'B1', 'B2'].includes(raw.difficulty) ? raw.difficulty : 'B1',
        objective:       (raw.objective       || '').slice(0, 300).trim(),
        slideCount:      Math.min(Math.max(parseInt(raw.slideCount) || 10, 4), 14),
        slideTypes:      finalTypes,
        keyVocabulary:   Array.isArray(raw.keyVocabulary)
                             ? raw.keyVocabulary.slice(0, 10).map(w => String(w).slice(0, 50).trim())
                             : [],
        existingContext: (raw.existingContext || '').slice(0, 500).trim()
    };
}

// ── Construcción de la tarea ─────────────────────────────────────────────────

function buildTask(payload) {
    const types  = payload.slideTypes.join(', ');
    const vocab  = payload.keyVocabulary.length > 0
        ? ` Key vocabulary to include: ${payload.keyVocabulary.join(', ')}.`
        : '';
    const obj    = payload.objective
        ? ` Learning objective: "${payload.objective}".`
        : '';
    const ctx    = payload.existingContext
        ? ` Context from previous lessons: ${payload.existingContext}.`
        : '';

    return (
        `Generate a complete lesson titled "${payload.lessonTitle}" ` +
        `for module ${payload.module} (CEFR ${payload.difficulty}). ` +
        `Target exactly ${payload.slideCount} slides using these types in order: ${types}.` +
        `${obj}${vocab}${ctx} ` +
        `Output ONLY valid HTML slide divs — no <html>/<head>/<body> tags, ` +
        `no markdown fences, no explanation text. ` +
        `Each slide must be <div class="slide" data-type="...">. ` +
        `Follow the slide-engine.js structure exactly.`
    );
}

module.exports = { AGENT_META, SLIDE_TYPES, transformPayload, buildTask };
