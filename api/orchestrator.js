/* api/orchestrator.js
 * Punto de entrada único para todos los agentes de IA.
 * Contiene el Token Optimizer (selección de modelo) y el router de agentes.
 *
 * Endpoint: POST /api/orchestrator
 * Body: {
 *   agent:             string   — "writing" | "reading" | "integrity" | etc.
 *   studentId:         string   — UUID del estudiante (puede ser null para instructor)
 *   task:              string   — descripción de la tarea en lenguaje natural
 *   payload:           object   — datos específicos del agente
 *   outputFormat:      string   — "short_answer" | "full_feedback" | "narrative_report" | etc.
 *   needsHistoryDepth: number   — cuántas sesiones previas necesita (0 = ninguna)
 *   requiresTools:     boolean  — si el agente necesita ejecutar herramientas
 * }
 *
 * Response: {
 *   agent:            string
 *   model:            string
 *   response:         string
 *   complexityScore:  number
 *   usage:            { input_tokens, output_tokens, cache_read_input_tokens }
 * }
 */

require('dotenv').config();

const { groqChat } = require('../lib/groq-client');
const PROMPTS      = require('../lib/agents/_prompts');
const Memory       = require('../lib/agents/memory');

// Módulos de agentes con transformaciones específicas de payload
// Si el módulo no existe, el orquestador usa el payload tal como llega
const AGENT_MODULES = {};
['writing', 'integrity', 'reading', 'content-gen', 'github', 'frontend', 'peer-review'].forEach(name => {
    try { AGENT_MODULES[name] = require(`../lib/agents/${name}`); } catch (e) {}
});

// ── Token Optimizer: calcula score de complejidad (0-100) ────────────────────

function scoreComplexity(req) {
    let score = 0;
    const {
        task            = '',
        payload         = {},
        needsHistoryDepth = 0,
        requiresTools   = false,
        outputFormat    = ''
    } = req;

    // 1. Tamaño del payload (estimación de tokens: ~1 token por 4 caracteres)
    const payloadTokens = Math.ceil(JSON.stringify(payload).length / 4);
    if      (payloadTokens > 500) score += 30;
    else if (payloadTokens > 100) score += 20;
    else if (payloadTokens > 30)  score += 10;

    // 2. Tipo de tarea (keywords en el texto del task)
    const t = task.toLowerCase();
    const HIGH_KW   = ['analiza', 'evalúa', 'compara', 'sintetiza', 'genera lección',
                       'detecta patrones', 'multi-sesión', 'analyze', 'evaluate',
                       'generate lesson', 'detect patterns'];
    const MEDIUM_KW = ['revisa', 'explica', 'resume', 'verifica', 'sugiere',
                       'review', 'explain', 'summarize', 'verify', 'suggest'];

    if      (HIGH_KW.some(k   => t.includes(k))) score += 35;
    else if (MEDIUM_KW.some(k => t.includes(k))) score += 15;

    // 3. Profundidad de historial requerida
    if      (needsHistoryDepth > 3) score += 20;
    else if (needsHistoryDepth > 0) score += 8;

    // 4. Requiere tool use (Supabase, GitHub API, etc.)
    if (requiresTools) score += 15;

    // 5. Formato de salida
    if      (outputFormat === 'generate_content') score += 20;
    else if (outputFormat === 'full_feedback')    score += 10;
    else if (outputFormat === 'narrative_report') score += 8;
    else if (outputFormat === 'json_profile')     score += 5;

    return Math.min(score, 100);
}

// ── Selección de modelo según score ─────────────────────────────────────────

function selectModel(score) {
    if (score <= 30) return { model: 'llama-3.1-8b-instant',    maxTokens: 300  };
    if (score <= 65) return { model: 'llama-3.3-70b-versatile', maxTokens: 800  };
    return             { model: 'llama-3.3-70b-versatile', maxTokens: 2000 };
}

// ── Mapa de agentes disponibles ──────────────────────────────────────────────
// Los valores son las claves de PROMPTS en _prompts.js.
// Agentes pendientes de implementar retornan un mensaje claro.

const AGENT_MAP = {
    writing:    'writing',
    reading:    'reading',
    integrity:  'integrity',
    progress:   'progress',
    peerReview: 'peerReview',
    'peer-review': 'peerReview',   // alias con guión para uniformidad con el módulo
    contentGen: 'contentGen',
    github:     'github',
    dbAdmin:    'dbAdmin',
    frontend:   'frontend'
};

// ── Registro de interacción en Supabase ──────────────────────────────────────

async function _logInteraction(data, supabaseUrl, supabaseKey) {
    if (!supabaseUrl || !supabaseKey) return;
    try {
        await fetch(`${supabaseUrl}/rest/v1/agent_interactions`, {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'apikey':         supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer':        'return=minimal'
            },
            body: JSON.stringify(data)
        });
    } catch (e) {
        console.warn('⚠️ Orchestrator: _logInteraction failed (non-critical):', e.message);
    }
}

// ── Handler principal ────────────────────────────────────────────────────────

async function _handle(body, env) {
    const {
        agent,
        studentId,
        task           = '',
        payload        = {},
        outputFormat   = 'short_answer',
        needsHistoryDepth = 0,
        requiresTools  = false
    } = body;

    // Validación básica
    if (!agent) return { status: 400, body: { error: 'Missing required field: agent' } };

    const promptKey = AGENT_MAP[agent];
    if (!promptKey) {
        return { status: 400, body: { error: `Unknown agent: "${agent}". Valid agents: ${Object.keys(AGENT_MAP).join(', ')}` } };
    }

    const systemPrompt = PROMPTS[promptKey];
    if (!systemPrompt) {
        return { status: 501, body: { error: `Agent "${agent}" is not yet implemented.` } };
    }

    // ── 1. Obtener perfil del estudiante (Memory Agent) ──────────────────────
    let profile      = null;
    let contextSegB  = '';

    if (studentId) {
        try {
            profile     = await Memory.getProfile(studentId, env.supabaseUrl, env.supabaseKey);
            contextSegB = Memory.buildContextString(profile);
        } catch (e) {
            console.warn('⚠️ Orchestrator: Memory.getProfile failed:', e.message);
            contextSegB = 'STUDENT CONTEXT: Profile unavailable.';
        }
    }

    // ── 2. Token Optimizer: score y selección de modelo ──────────────────────
    const complexityScore = scoreComplexity({ task, payload, needsHistoryDepth, requiresTools, outputFormat });
    const { model, maxTokens } = selectModel(complexityScore);

    // ── 3. Transformar payload con el módulo del agente (si existe) ─────────
    let finalPayload = payload;
    let finalTask    = task;
    const agentModule = AGENT_MODULES[agent];
    if (agentModule) {
        if (typeof agentModule.transformPayload === 'function') {
            finalPayload = agentModule.transformPayload(payload);
        }
        if (typeof agentModule.buildTask === 'function' && !task) {
            finalTask = agentModule.buildTask(finalPayload);
        }
    }

    // ── 4. Ensamblar Segmento C (payload dinámico) ───────────────────────────
    const payloadStr  = typeof finalPayload === 'string'
        ? finalPayload
        : JSON.stringify(finalPayload, null, 2);

    const segmentC = `TASK: ${finalTask}\n\nDATA:\n${payloadStr}`;

    // ── 4. Llamar a la API de Groq ───────────────────────────────────────────
    // Segmento A (systemPrompt) + Segmento B (perfil) + Segmento C (payload)
    const userContent = contextSegB
        ? `${contextSegB}\n\n${segmentC}`
        : segmentC;

    let groqResult;
    try {
        groqResult = await groqChat({
            apiKey:     env.groqKey,
            model,
            system:     systemPrompt,
            userContent,
            maxTokens
        });
    } catch (e) {
        console.error('❌ Orchestrator: Groq API error:', e.message);
        return { status: 502, body: { error: 'AI service error. Please try again.', detail: e.message } };
    }

    const responseText = groqResult.text;
    const usage        = groqResult.usage;

    // ── 5. Registrar interacción en Supabase (audit trail + token monitoring) ─
    await _logInteraction({
        student_id:        studentId || null,
        agent,
        model_used:        groqResult.model || model,
        tokens_in:         usage.input_tokens  || 0,
        tokens_out:        usage.output_tokens || 0,
        tokens_cached:     usage.cached_tokens || 0,
        complexity_score:  complexityScore,
        created_at:        new Date().toISOString()
    }, env.supabaseUrl, env.supabaseKey);

    // ── 6. Actualizar session_cache con perfil (si hubo interacción exitosa) ──
    if (studentId && profile && !profile.is_default) {
        Memory.saveSessionCache(studentId, profile, env.supabaseUrl, env.supabaseKey)
            .catch(e => console.warn('⚠️ Orchestrator: session cache update failed:', e.message));
    }

    return {
        status: 200,
        body: {
            agent,
            model,
            response:        responseText,
            complexityScore,
            usage: {
                input_tokens:  usage.input_tokens  || 0,
                output_tokens: usage.output_tokens || 0,
                cached_tokens: usage.cached_tokens || 0
            }
        }
    };
}

// ── Vercel serverless handler ────────────────────────────────────────────────
// Exportado para Vercel. También reutilizable desde server.js (local).

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    // Parsear body — compatible con Vercel (req.body ya parseado) y Node.js nativo
    let body;
    try {
        if (req.body && typeof req.body === 'object') {
            body = req.body;
        } else {
            const raw = await new Promise((resolve, reject) => {
                let data = '';
                req.on('data', chunk => { data += chunk.toString(); });
                req.on('end',  ()    => resolve(data));
                req.on('error', e   => reject(e));
            });
            body = JSON.parse(raw);
        }
    } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        return;
    }

    // Variables de entorno
    const env = {
        groqKey:     process.env.GROQ_TOKEN            || '',
        supabaseUrl: process.env.SUPABASE_URL           || '',
        supabaseKey: process.env.SUPABASE_SERVICE_KEY   || process.env.SUPABASE_KEY || ''
    };

    if (!env.groqKey) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'GROQ_TOKEN not configured in environment' }));
        return;
    }

    const result = await _handle(body, env);

    res.statusCode = result.status;
    res.end(JSON.stringify(result.body));
};

// Exportar _handle para testing y reutilización
module.exports._handle = _handle;
