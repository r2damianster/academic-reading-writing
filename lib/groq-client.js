/* lib/groq-client.js
 * Cliente ligero para la API de Groq (OpenAI-compatible).
 * Reemplaza @anthropic-ai/sdk sin agregar nuevas dependencias — usa fetch nativo.
 *
 * 2026-09-13: llama-3.1-8b-instant y llama-3.3-70b-versatile fueron retirados de
 * la cuenta de Groq (404 model_not_found) — ver catálogo real vía GET
 * https://api.groq.com/openai/v1/models. Migrado a los modelos GPT-OSS de OpenAI
 * servidos en Groq, que sí siguen disponibles en este token:
 *   openai/gpt-oss-20b   → rápido y económico (equivalente a Haiku)
 *   openai/gpt-oss-120b  → potente y preciso  (equivalente a Sonnet/Opus)
 * Los nombres internos ('llama-3.1-8b-instant', etc.) se conservan como claves —
 * son los que usa api/orchestrator.js#selectModel() — solo cambia a qué modelo
 * real de Groq apuntan.
 *
 * Uso:
 *   const { groqChat } = require('./groq-client');
 *   const result = await groqChat({ apiKey, model, system, userContent, maxTokens });
 *   // result → { text, usage: { input_tokens, output_tokens, cached_tokens: 0 } }
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Mapeo de nombres internos → modelos reales de Groq
const GROQ_MODELS = {
    // Nivel Haiku: tareas simples y rápidas
    'llama-3.1-8b-instant':    'openai/gpt-oss-20b',
    // Nivel Sonnet/Opus: análisis, feedback, generación
    'llama-3.3-70b-versatile': 'openai/gpt-oss-120b'
};

const MAX_RATE_LIMIT_RETRIES      = 2;
const MAX_RATE_LIMIT_WAIT_SECONDS = 20;

// Segundos de espera sugeridos por Groq: cabecera retry-after o "try again in 12.39s" en el cuerpo.
function _parseRetryAfterSeconds(response, bodyText) {
    const headerSeconds = parseFloat(response.headers.get('retry-after'));
    if (!isNaN(headerSeconds)) return headerSeconds;
    const bodyMatch = /try again in ([\d.]+)s/i.exec(bodyText || '');
    return bodyMatch ? parseFloat(bodyMatch[1]) : 5;
}

/**
 * Llama a la API de Groq con un system prompt y un mensaje de usuario.
 * @param {object} opts
 * @param {string} opts.apiKey      — GROQ_TOKEN del .env
 * @param {string} opts.model       — nombre del modelo (se mapea internamente)
 * @param {string} opts.system      — system prompt (Segmento A)
 * @param {string} opts.userContent — contenido del mensaje del usuario (Segmentos B + C)
 * @param {number} opts.maxTokens   — máximo de tokens en la respuesta
 * @returns {{ text: string, usage: { input_tokens, output_tokens, cached_tokens } }}
 */
async function groqChat({ apiKey, model, system, userContent, maxTokens = 800, temperature = 0.7 }) {
    const resolvedModel = GROQ_MODELS[model] || GROQ_MODELS['llama-3.3-70b-versatile'];

    const messages = [];
    if (system) {
        messages.push({ role: 'system', content: system });
    }
    messages.push({ role: 'user', content: userContent });

    const body = {
        model:      resolvedModel,
        messages,
        max_tokens: maxTokens,
        temperature
    };

    // Los modelos GPT-OSS emiten un bloque de "reasoning" oculto antes de la
    // respuesta y lo descuentan del mismo max_tokens — sin esto, tareas con
    // salida JSON corta (ej. test-grader) se cortan a mitad de la respuesta
    // (finish_reason:"length") antes de llegar al JSON real. 'low' deja
    // suficiente presupuesto para la respuesta sin gastarlo todo pensando.
    if (resolvedModel.startsWith('openai/gpt-oss')) {
        body.reasoning_effort = 'low';
    }

    // El plan gratuito limita tokens por minuto (TPM): con varios estudiantes enviando a la vez
    // Groq responde 429 con "try again in Ns". Se espera ese tiempo y se reintenta.
    let res;
    for (let attemptNumber = 0; attemptNumber <= MAX_RATE_LIMIT_RETRIES; attemptNumber++) {
        res = await fetch(GROQ_API_URL, {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (res.status !== 429 || attemptNumber === MAX_RATE_LIMIT_RETRIES) break;

        const rateLimitText = await res.clone().text();
        const waitSeconds   = _parseRetryAfterSeconds(res, rateLimitText);
        if (waitSeconds > MAX_RATE_LIMIT_WAIT_SECONDS) break;
        await new Promise(resolve => setTimeout(resolve, Math.ceil(waitSeconds * 1000) + 500));
    }

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq API error ${res.status}: ${errText}`);
    }

    const data = await res.json();

    const text  = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};

    return {
        text,
        model:    resolvedModel,
        usage: {
            input_tokens:  usage.prompt_tokens     || 0,
            output_tokens: usage.completion_tokens || 0,
            cached_tokens: 0   // Groq no tiene prompt caching (pero es gratuito)
        }
    };
}

module.exports = { groqChat, GROQ_MODELS };
