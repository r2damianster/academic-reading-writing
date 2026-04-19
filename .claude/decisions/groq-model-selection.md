---
owner: Arturo Rodríguez Zambrano
domain: decisions
last_updated: 2026-04-19
status: active
---

# ADR: Selección de Modelo IA (Token Optimizer)

## Decisión
Usar `scoreComplexity()` para seleccionar dinámicamente entre llama-3.1-8b (rápido) y llama-3.3-70b (potente), en lugar de usar siempre el modelo más caro.

## Por qué
- Groq es gratuito pero tiene rate limits
- Tareas simples (respuesta corta, vocabulario) no necesitan 70B params
- Tareas complejas (analizar ensayo, generar lección) sí necesitan el modelo mayor

## Lógica actual

```
score 0-30   → llama-3.1-8b-instant    (300 tokens max)
score 31-65  → llama-3.3-70b-versatile (800 tokens max)
score 66-100 → llama-3.3-70b-versatile (2000 tokens max)
```

## Cómo se calcula el score
Ver detalle completo en [api/orchestrator.md](../api/orchestrator.md#token-optimizer).

## Si se cambia de proveedor
- Crear nuevo cliente en `lib/` (patrón `groq-client.js`)
- Cambiar `require` en `api/orchestrator.js`
- Los alias en `GROQ_MODELS` permiten referenciar nombres de Anthropic y resolver al equivalente

## Alternativas consideradas
- **Anthropic Claude**: más caro pero con prompt caching real — considerar si Groq tiene downtime frecuente
- **Qwen DashScope**: contexto hasta 1M tokens — útil si los ensayos son muy largos. Ver `QWEN.md`
