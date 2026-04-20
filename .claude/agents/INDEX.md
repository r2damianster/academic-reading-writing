---
type: index
domain: agents
last_updated: 2026-04-20
owner: Arturo Rodríguez Zambrano
---

# Índice de Agentes IA

Todos los agentes pasan por `POST /api/orchestrator`. Ninguno tiene endpoint propio.

## Tabla de agentes

| Agent key | Archivo | Modelo (default) | Responsable | Estado |
|---|---|---|---|---|
| `writing` | [writing.md](writing.md) | llama-3.3-70b | Arturo | ✅ Activo |
| `reading` | [reading.md](reading.md) | llama-3.1-8b | Arturo | ✅ Activo |
| `integrity` | [integrity.md](integrity.md) | llama-3.3-70b | Arturo | ✅ Activo |
| `peerReview` / `peer-review` | [peer-review.md](peer-review.md) | llama-3.3-70b | Arturo | ✅ Activo |
| `progress` | [progress.md](progress.md) | llama-3.1-8b | Arturo | ✅ Activo |
| `contentGen` | [content-gen.md](content-gen.md) | llama-3.3-70b | Arturo | ✅ Activo |
| `memory` | [memory.md](memory.md) | llama-3.1-8b | Arturo | ✅ Interno (no expuesto) |
| `github` | [github.md](github.md) | llama-3.3-70b | Arturo | ✅ Hook PostToolUse |
| `dbAdmin` | [db-admin.md](db-admin.md) | llama-3.3-70b | Arturo | ✅ Activo |
| `frontend` | [frontend.md](frontend.md) | llama-3.1-8b | Arturo | ✅ Activo |
| `reportAnalyst` | — | llama-3.3-70b | Arturo | ✅ Activo (Nuevo) |

## Selección de modelo (Token Optimizer)

| Score | Modelo | Max tokens |
|---|---|---|
| 0 – 30 | `llama-3.1-8b-instant` | 300 |
| 31 – 65 | `llama-3.3-70b-versatile` | 800 |
| 66 – 100 | `llama-3.3-70b-versatile` | 2000 |

## Cómo agregar un agente nuevo

1. Crear `lib/agents/mi-agente.js` con `transformPayload()` y `buildTask()`
2. Agregar system prompt en `lib/agents/_prompts.js`
3. Registrar en `AGENT_MAP` de `api/orchestrator.js`
4. Agregar a este índice
