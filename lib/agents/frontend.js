/* api/agents/frontend.js
 * Agente Frontend/UI — módulo de transformación de payload.
 * Diagnostica problemas visuales, verifica consistencia entre los 72 módulos
 * y sugiere fixes de CSS/HTML sin introducir frameworks ni dependencias.
 *
 * Campos del payload esperado:
 *   issue            — descripción del problema (texto libre)
 *   component        — componente afectado (ej: "ESSAY slide", "quiz option")
 *   affectedFiles    — array de archivos HTML/CSS involucrados
 *   cssClasses       — clases CSS relevantes
 *   browserInfo      — navegador y versión (para bugs de compatibilidad)
 *   htmlSnippet      — fragmento HTML relevante (max 800 chars)
 *   cssSnippet       — reglas CSS relevantes (max 600 chars)
 *   expectedBehavior — qué debería pasar
 *   actualBehavior   — qué está pasando
 */

const AGENT_META = {
    name:                'Frontend UI Assistant',
    defaultOutput:       'short_answer',
    modelRecommendation: 'haiku para checks de consistencia; sonnet para diagnóstico de layout complejo'
};

// CSS architecture reference — used in buildTask context
const CSS_FILES = {
    'main.css':          'Layout, sidebar, flyout navigation (~808 lines)',
    'modules.css':       'Slide engine components (~202 lines)',
    'readingsidebar.css':'PDF reader + task panels (~655 lines)',
    'welcome.css':       'Welcome screen (~152 lines)'
};

// ── Transformación del payload ───────────────────────────────────────────────

function transformPayload(raw) {
    return {
        issue:            (raw.issue            || '').slice(0, 400).trim(),
        component:        raw.component         || null,
        affectedFiles:    Array.isArray(raw.affectedFiles)
                              ? raw.affectedFiles.slice(0, 10)
                              : [],
        cssClasses:       Array.isArray(raw.cssClasses)
                              ? raw.cssClasses.slice(0, 15).map(c => String(c).trim())
                              : [],
        browserInfo:      raw.browserInfo       || null,
        htmlSnippet:      (raw.htmlSnippet      || '').slice(0, 800),
        cssSnippet:       (raw.cssSnippet       || '').slice(0, 600),
        expectedBehavior: (raw.expectedBehavior || '').slice(0, 200).trim(),
        actualBehavior:   (raw.actualBehavior   || '').slice(0, 200).trim()
    };
}

// ── Construcción de la tarea ─────────────────────────────────────────────────

function buildTask(payload) {
    const ctx = [];

    if (payload.component)        ctx.push(`Component: ${payload.component}`);
    if (payload.browserInfo)      ctx.push(`Browser: ${payload.browserInfo}`);
    if (payload.cssClasses.length > 0) ctx.push(`CSS classes: ${payload.cssClasses.join(', ')}`);
    if (payload.expectedBehavior) ctx.push(`Expected: ${payload.expectedBehavior}`);
    if (payload.actualBehavior)   ctx.push(`Actual: ${payload.actualBehavior}`);
    if (payload.affectedFiles.length > 0) ctx.push(`Files: ${payload.affectedFiles.join(', ')}`);

    const context = ctx.length > 0 ? ` [${ctx.join(' | ')}]` : '';

    // Problema explícito
    if (payload.issue) {
        return `Frontend UI issue: ${payload.issue}.${context} ` +
               `Constraints: no CSS frameworks, no inline styles, no new external dependencies. ` +
               `CSS must go into the appropriate css/*.css file. ` +
               `JS must follow the IIFE Revealing Module Pattern.`;
    }

    // Diagnóstico por snippet
    if (payload.htmlSnippet || payload.cssSnippet) {
        return `Diagnose a UI problem from the provided HTML/CSS snippet.${context} ` +
               `Suggest a minimal fix that respects the existing CSS architecture ` +
               `(main.css, modules.css, readingsidebar.css, welcome.css).`;
    }

    // Consulta general de consistencia
    return `Frontend consistency check for the reading/writing platform.${context} ` +
           `Verify the reported component follows the project's CSS/JS conventions ` +
           `and is consistent across all 72 lesson modules.`;
}

module.exports = { AGENT_META, CSS_FILES, transformPayload, buildTask };
