/* js/agent-client.js
 * Wrapper del frontend para comunicarse con el orquestador de agentes.
 * Es el ÚNICO archivo del frontend que hace fetch a /api/orchestrator.
 *
 * Uso:
 *   AgentClient.call('writing', 'Evalúa este ensayo', { essay: '...', lesson: '...' })
 *     .then(result => console.log(result.response))
 *     .catch(err  => console.error(err));
 *
 *   // Con opciones avanzadas:
 *   AgentClient.call('integrity', 'Analiza métricas de auditoría', auditData, {
 *       outputFormat:      'narrative_report',
 *       needsHistoryDepth: 3,
 *       onChunk:           (text) => appendToUI(text)   // para streaming futuro
 *   });
 */

const AgentClient = (function () {

    const ENDPOINT = '/api/orchestrator';

    // ── Formatos de salida válidos ────────────────────────────────────────────
    const OUTPUT_FORMATS = [
        'short_answer',       // respuesta breve (Haiku por defecto)
        'full_feedback',      // análisis completo (Sonnet)
        'narrative_report',   // reporte narrativo (Sonnet/Opus)
        'json_profile',       // JSON estructurado (Memory Agent)
        'generate_content'    // generación de lección HTML (Opus)
    ];

    // ── Estado del cliente ────────────────────────────────────────────────────
    let _pendingRequests = 0;

    // ── Función principal ─────────────────────────────────────────────────────
    /**
     * Llama a un agente a través del orquestador.
     *
     * @param {string} agent        - Nombre del agente ("writing", "reading", etc.)
     * @param {string} task         - Descripción de la tarea en lenguaje natural
     * @param {object|string} payload - Datos específicos del agente
     * @param {object} options      - Opciones opcionales:
     *   outputFormat      {string}   - Formato de salida (default: "short_answer")
     *   needsHistoryDepth {number}   - Sesiones de historial necesarias (default: 0)
     *   requiresTools     {boolean}  - Si el agente necesita tool use (default: false)
     *   onStart           {function} - Callback cuando inicia la llamada
     *   onComplete        {function} - Callback cuando termina (recibe result)
     *   onError           {function} - Callback de error (recibe error)
     *   silent            {boolean}  - Si true, no loggea en consola
     * @returns {Promise<object>} - Respuesta del agente
     */
    async function call(agent, task, payload = {}, options = {}) {
        const {
            outputFormat       = 'short_answer',
            needsHistoryDepth  = 0,
            requiresTools      = false,
            onStart            = null,
            onComplete         = null,
            onError            = null,
            silent             = false
        } = options;

        // Obtener studentId del localStorage (establecido en auth.js)
        const studentId = localStorage.getItem('studentId') || null;

        if (!silent) {
            console.log(`🤖 AgentClient → ${agent} | task: "${task.slice(0, 60)}..."`);
        }

        if (typeof onStart === 'function') onStart();
        _pendingRequests++;

        try {
            const response = await fetch(ENDPOINT, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    agent,
                    studentId,
                    task,
                    payload,
                    outputFormat,
                    needsHistoryDepth,
                    requiresTools
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const err = new Error(data.error || `HTTP ${response.status}`);
                err.status = response.status;
                err.detail = data.detail || '';
                throw err;
            }

            if (!silent) {
                const cached = data.usage?.cache_read_input_tokens || 0;
                const total  = data.usage?.input_tokens || 0;
                const pct    = total > 0 ? Math.round((cached / total) * 100) : 0;
                console.log(
                    `✅ AgentClient ← ${agent} | model: ${data.model} | ` +
                    `score: ${data.complexityScore} | ` +
                    `tokens in: ${total} (${pct}% cached) | out: ${data.usage?.output_tokens || 0}`
                );
            }

            if (typeof onComplete === 'function') onComplete(data);
            return data;

        } catch (err) {
            if (!silent) {
                console.error(`❌ AgentClient error (${agent}):`, err.message);
            }
            if (typeof onError === 'function') onError(err);
            throw err;

        } finally {
            _pendingRequests--;
        }
    }

    // ── Helpers de alto nivel ─────────────────────────────────────────────────
    // Atajos tipados para los agentes más usados desde el frontend.

    /**
     * Solicita feedback de escritura para un ensayo.
     * @param {string} lessonName - Nombre de la lección
     * @param {string} essayText  - Texto del ensayo
     * @param {object} auditData  - Datos de auditoría (words, keystrokes, etc.)
     */
    async function requestWritingFeedback(lessonName, essayText, auditData) {
        return call(
            'writing',
            'Evalúa este ensayo y da retroalimentación específica',
            { lesson: lessonName, essay: essayText, audit: auditData },
            { outputFormat: 'full_feedback', needsHistoryDepth: 2 }
        );
    }

    /**
     * Solicita análisis de integridad para un ensayo.
     * @param {string} lessonName - Nombre de la lección
     * @param {object} auditData  - Datos completos de auditoría
     */
    async function requestIntegrityAnalysis(lessonName, auditData) {
        return call(
            'integrity',
            'Analiza las métricas de integridad de esta sesión de escritura',
            { lesson: lessonName, ...auditData },
            { outputFormat: 'narrative_report', needsHistoryDepth: 3, silent: true }
        );
    }

    /**
     * Solicita resumen de progreso del estudiante.
     */
    async function requestProgressSummary() {
        return call(
            'progress',
            'Resume el progreso actual y recomienda la siguiente acción',
            {},
            { outputFormat: 'short_answer', needsHistoryDepth: 5 }
        );
    }

    /**
     * Solicita ayuda con el texto de lectura activo.
     * @param {string} question    - Pregunta del estudiante
     * @param {string} pdfId       - ID del PDF activo
     * @param {number} currentPage - Página actual
     */
    async function askReadingQuestion(question, pdfId, currentPage) {
        return call(
            'reading',
            question,
            { pdfId, currentPage },
            { outputFormat: 'short_answer', needsHistoryDepth: 1 }
        );
    }

    /**
     * Solicita evaluación de un test con rúbrica de 8 indicadores.
     * @param {string} testId       - ID del test (ej: 'test1 fundamentals')
     * @param {string} essayText    - Texto completo (Phase 1 + Phase 2 concatenadas)
     * @param {object|null} rubric  - Indicadores de la rúbrica activa (fetched from Supabase)
     * @param {object} auditData    - Datos de auditoría del ActivityTracker
     */
    async function requestTestEvaluation(testId, essayText, rubric, auditData) {
        return call(
            'test-grader',
            'Evaluate this academic writing test submission against the provided rubric',
            { lesson: testId, essay: essayText, rubric, audit: auditData },
            { outputFormat: 'json', needsHistoryDepth: 0, requiresTools: false }
        );
    }

    // ── Estado del cliente ────────────────────────────────────────────────────

    function isPending() {
        return _pendingRequests > 0;
    }

    function getPendingCount() {
        return _pendingRequests;
    }

    // ── API pública ───────────────────────────────────────────────────────────
    return {
        call,
        requestWritingFeedback,
        requestIntegrityAnalysis,
        requestProgressSummary,
        askReadingQuestion,
        requestTestEvaluation,
        isPending,
        getPendingCount,
        OUTPUT_FORMATS
    };

})();
