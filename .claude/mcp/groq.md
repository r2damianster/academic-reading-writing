---
owner: Arturo Rodríguez Zambrano
domain: mcp
last_updated: 2026-04-19
status: active
---

# Proveedor IA: Groq

## Responsable exclusivo
Arturo Rodríguez Zambrano — selección de modelos y optimización de tokens.

## Descripción
Groq es el proveedor IA activo. No usa MCP — se llama directamente desde `lib/groq-client.js` usando `fetch` nativo (API compatible con OpenAI).

## Variable de entorno
```
GROQ_TOKEN=gsk_...
```

## Modelos en uso

| Modelo | Alias interno | Nivel | Cuándo |
|---|---|---|---|
| `llama-3.1-8b-instant` | Haiku equiv. | Rápido / económico | Score ≤ 30 |
| `llama-3.3-70b-versatile` | Sonnet/Opus equiv. | Potente / preciso | Score > 30 |

## Modelos disponibles en Groq (no configurados por defecto)

| Modelo | Uso potencial |
|---|---|
| `qwen-qwq-32b` | Razonamiento, feedback detallado |
| `meta-llama/llama-4-scout-17b-16e-instruct` | Multimodal |
| `gemma2-9b-it` | Alternativa liviana de Google |

## Cómo cambiar de proveedor
El orquestador llama a `groqChat()` de `lib/groq-client.js`. Para cambiar:
1. Crear nuevo cliente en `lib/` (ver `groq-client.js` como referencia)
2. Cambiar el `require` en `api/orchestrator.js`
3. Ajustar nombres de modelos en `selectModel()`

## Anthropic Claude (disponible, no activo en producción)
`@anthropic-ai/sdk` instalado. Usar para análisis de alta complejidad o prompt caching real.

## Qwen via DashScope (documentado, no implementado)
No existe `QWEN.md` ni `lib/qwen-client.js` en el repo — la config está descrita en `CLAUDE.md` pero requiere crear el cliente antes de poder usarse.

## Aliases de compatibilidad en groq-client.js
```js
'claude-haiku-4-5-20251001': 'llama-3.1-8b-instant',
'claude-sonnet-4-6':         'llama-3.3-70b-versatile',
'claude-opus-4-6':           'llama-3.3-70b-versatile'
```
Esto permite referenciar modelos de Anthropic y que el cliente resuelva al equivalente Groq.
