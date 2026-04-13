/* api/groq-client.js
 * Cliente ligero para la API de Groq (OpenAI-compatible).
 * Reemplaza @anthropic-ai/sdk sin agregar nuevas dependencias — usa fetch nativo.
 *
 * Modelos disponibles en Groq (gratuitos):
 *   llama-3.1-8b-instant      → rápido y económico (equivalente a Haiku)
 *   llama-3.3-70b-versatile   → potente y preciso  (equivalente a Sonnet/Opus)
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
    'llama-3.1-8b-instant':    'llama-3.1-8b-instant',
    // Nivel Sonnet/Opus: análisis, feedback, generación
    'llama-3.3-70b-versatile': 'llama-3.3-70b-versatile',
    // Alias de compatibilidad (por si el orchestrator referencia nombres de Anthropic)
    'claude-haiku-4-5-20251001': 'llama-3.1-8b-instant',
    'claude-sonnet-4-6':         'llama-3.3-70b-versatile',
    'claude-opus-4-6':           'llama-3.3-70b-versatile'
};

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
async function groqChat({ apiKey, model, system, userContent, maxTokens = 800 }) {
    const resolvedModel = GROQ_MODELS[model] || 'llama-3.3-70b-versatile';

    const messages = [];
    if (system) {
        messages.push({ role: 'system', content: system });
    }
    messages.push({ role: 'user', content: userContent });

    const res = await fetch(GROQ_API_URL, {
        method:  'POST',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model:      resolvedModel,
            messages,
            max_tokens: maxTokens,
            temperature: 0.7
        })
    });

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
