/* lib/agents/report-analyst.js
 * Agente especializado en analizar reportes multi-intento para el instructor.
 * Transforma el payload para que el LLM reciba los datos de forma estructurada.
 */

/**
 * Transforma el payload crudo del reporte en un formato optimizado para el LLM.
 * Agrupa intentos por actividad y limpia campos redundantes.
 */
function transformPayload(payload) {
    if (!payload || !payload.essaysProcessed) return payload;

    const summary = (payload.summaryList || []).map(l => ({
        activity: l.activity,
        result: l.result,
        date: (l.created_at || '').slice(0, 10)
    }));

    const essays = (payload.essaysProcessed || []).map(e => ({
        activity: e.activity,
        date: e.date,
        integrity: e.audit,
        compliance: e.compliance ? {
            score: `${e.compliance.passed}/${e.compliance.total}`,
            pct: e.compliance.pct
        } : 'No rubric data',
        text_preview: (e.text || '').slice(0, 500) + (e.text && e.text.length > 500 ? '...' : '')
    }));

    return {
        summary_of_activities: summary,
        detailed_essay_attempts: essays
    };
}

/**
 * Opcional: Construye una tarea por defecto si no se provee una.
 */
function buildTask(payload) {
    return "Analiza el historial de ensayos del estudiante. Busca patrones de mejora académica o riesgos de integridad entre los diferentes intentos. Genera recomendaciones pedagógicas para el instructor.";
}

module.exports = {
    transformPayload,
    buildTask
};
