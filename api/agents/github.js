/* api/agents/github.js
 * Agente GitHub — módulo de transformación de payload.
 * Revisa código, detecta bugs, escanea credenciales y sugiere actualizaciones
 * a DEUDA_TECNICA.md. Llamado desde el hook de Claude Code o manualmente.
 *
 * Campos del payload esperado:
 *   action         — "review" | "security_check" | "debt_update"
 *   diff           — git diff del cambio (max 3000 chars)
 *   commitMessage  — mensaje del commit (max 200 chars)
 *   modifiedFiles  — array de rutas modificadas
 *   prDescription  — descripción del PR (max 500 chars)
 *   debtItems      — array de IDs de DEUDA_TECNICA a verificar (ej: ["BUG-001"])
 */

const CRITICAL_FILES = [
    'slide-engine.js',
    'reading-engine.js',
    'essay-handler.js',
    'orchestrator.js',
    'memory.js',
    'api/config.js'
];

const AGENT_META = {
    name:                'GitHub Code Reviewer',
    defaultOutput:       'narrative_report',
    modelRecommendation: 'sonnet para revisión de código; haiku para security checks rápidos'
};

// ── Transformación del payload ───────────────────────────────────────────────

function transformPayload(raw) {
    const modifiedFiles   = Array.isArray(raw.modifiedFiles)  ? raw.modifiedFiles  : [];
    const criticalTouched = modifiedFiles.filter(f =>
        CRITICAL_FILES.some(cf => f.endsWith(cf))
    );

    return {
        action:          ['review', 'security_check', 'debt_update'].includes(raw.action)
                             ? raw.action : 'review',
        diff:            (raw.diff           || '').slice(0, 3000),
        commitMessage:   (raw.commitMessage  || '').slice(0, 200).trim(),
        modifiedFiles,
        criticalTouched,
        prDescription:   (raw.prDescription  || '').slice(0, 500).trim(),
        debtItems:       Array.isArray(raw.debtItems) ? raw.debtItems.slice(0, 10) : [],
        branch:          (raw.branch         || 'main').slice(0, 80)
    };
}

// ── Construcción de la tarea ─────────────────────────────────────────────────

function buildTask(payload) {
    const critical = payload.criticalTouched.length > 0
        ? ` ⚠️ CRITICAL FILES modified: ${payload.criticalTouched.join(', ')}.`
        : '';

    switch (payload.action) {
        case 'security_check':
            return (
                `Security scan for: ${payload.modifiedFiles.join(', ')}.${critical} ` +
                `Check for: (1) hardcoded Supabase URL/KEY or ANTHROPIC_API_KEY, ` +
                `(2) console.log statements that include student email, essay_text, or PII, ` +
                `(3) new external CDN links not in the approved list, ` +
                `(4) /api/config.js exposing SUPABASE_SERVICE_KEY instead of anon key, ` +
                `(5) SQL/XSS injection vectors in Supabase REST queries.`
            );

        case 'debt_update':
            return (
                `Review DEUDA_TECNICA.md items: ${payload.debtItems.join(', ')}. ` +
                `Analyze the provided diff and determine which items are fully resolved, ` +
                `partially resolved, or introduced a new bug. ` +
                `For each item: state its new status and why.`
            );

        default: // 'review'
            return (
                `Code review for: "${payload.commitMessage || 'unnamed commit'}".${critical} ` +
                `Files changed: ${payload.modifiedFiles.join(', ') || 'unknown'}. ` +
                `Check for: new race conditions, silent error swallowing, ` +
                `inconsistency with existing patterns (IIFE module, _configReady await, ` +
                `Supabase REST headers), and any regression risk for the 72 lesson modules.`
            );
    }
}

module.exports = { AGENT_META, CRITICAL_FILES, transformPayload, buildTask };
