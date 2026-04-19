---
owner: Arturo Rodríguez Zambrano
domain: api
last_updated: 2026-04-19
status: active
---

# Endpoint: /api/orchestrator

## Responsable exclusivo
Arturo Rodríguez Zambrano — punto de entrada único de todos los agentes.

## Propósito
Hub central de routing para todos los agentes IA. Contiene el Token Optimizer (selección de modelo por complejidad) y el pipeline completo de cada petición.

## Contrato de la API

**Request:**
```json
{
  "agent": "writing | reading | integrity | peerReview | peer-review | progress | contentGen | github | dbAdmin | frontend",
  "studentId": "uuid | null",
  "task": "descripción en lenguaje natural",
  "payload": {},
  "outputFormat": "short_answer | full_feedback | narrative_report | json_profile | generate_content",
  "needsHistoryDepth": 0,
  "requiresTools": false
}
```

**Response:**
```json
{
  "agent": "string",
  "model": "string",
  "response": "string",
  "complexityScore": 0,
  "usage": { "input_tokens": 0, "output_tokens": 0, "cached_tokens": 0 }
}
```

## Pipeline interno

```
1. Validar agent → AGENT_MAP[agent]
2. PROMPTS[promptKey] → system prompt (Segmento A)
3. Memory.getProfile(studentId) → Segmento B
4. scoreComplexity() → 0-100
5. selectModel(score) → modelo + maxTokens
6. agentModule.transformPayload() → normaliza payload
7. Armar userContent = SegB + "TASK: ... DATA: ..."
8. groqChat(system, userContent, maxTokens)
9. _logInteraction() → agent_interactions en Supabase
10. Memory.saveSessionCache() → actualizar cache
```

## Token Optimizer — scoreComplexity()

| Factor | Puntos |
|---|---|
| Payload > 500 tokens | +30 |
| Payload > 100 tokens | +20 |
| Keywords HIGH (analiza, evalúa, genera lección) | +35 |
| Keywords MEDIUM (revisa, explica, sugiere) | +15 |
| historyDepth > 3 | +20 |
| requiresTools = true | +15 |
| outputFormat = generate_content | +20 |
| outputFormat = full_feedback | +10 |

## Variables de entorno requeridas
- `GROQ_TOKEN` — si ausente, retorna 500
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` — si ausentes, `_logInteraction` falla silenciosamente

## Notas para Claude
- `_handle()` está exportado para testing — `module.exports._handle = _handle`
- Si `AGENT_MAP[agent]` existe pero `PROMPTS[promptKey]` es undefined → 501 "not implemented"
- El orquestador nunca lanza excepciones al cliente — todos los errores son capturados
