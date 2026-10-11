---
type: index
domain: agents
last_updated: 2026-09-01
owner: Arturo Rodríguez Zambrano
---

# Índice de Agentes IA

Todos los agentes pasan por `POST /api/orchestrator`. Ninguno tiene endpoint propio.

## Tabla de agentes

| Agent key | Archivo | Modelo (default) | Responsable | Estado |
|---|---|---|---|---|
| `writing` | [writing.md](writing.md) | gpt-oss-120b | Arturo | ✅ Activo |
| `reading` | [reading.md](reading.md) | gpt-oss-20b | Arturo | ✅ Activo |
| `integrity` | [integrity.md](integrity.md) | gpt-oss-120b | Arturo | ✅ Activo |
| `peerReview` / `peer-review` | [peer-review.md](peer-review.md) | gpt-oss-120b | Arturo | ✅ Activo |
| `progress` | [progress.md](progress.md) | gpt-oss-20b | Arturo | ✅ Activo |
| `contentGen` | [content-gen.md](content-gen.md) | gpt-oss-120b | Arturo | ✅ Activo |
| `memory` | [memory.md](memory.md) | gpt-oss-20b | Arturo | ✅ Interno (no expuesto) |
| `github` | [github.md](github.md) | gpt-oss-120b | Arturo | 🟡 Manual (hook PostToolUse NO configurado) |
| `dbAdmin` | [db-admin.md](db-admin.md) | gpt-oss-120b | Arturo | ✅ Activo |
| `frontend` | [frontend.md](frontend.md) | gpt-oss-20b | Arturo | ✅ Activo |
| `reportAnalyst` | [report-analyst.md](report-analyst.md) | gpt-oss-120b | Arturo | ✅ Activo |
| `testGrader` | [test-grader.md](test-grader.md) | gpt-oss-120b | Arturo | ✅ Activo |

## Selección de modelo (Token Optimizer)

| Score | Clave interna → modelo Groq | Max tokens |
|---|---|---|
| 0 – 30 | `llama-3.1-8b-instant` → `openai/gpt-oss-20b` | 700 |
| 31 – 65 | `llama-3.3-70b-versatile` → `openai/gpt-oss-120b` | 800 |
| 66 – 100 | `llama-3.3-70b-versatile` → `openai/gpt-oss-120b` | 2000 |

## Cómo agregar un agente nuevo

1. Crear `lib/agents/mi-agente.js` con `transformPayload()` y `buildTask()`
2. Agregar system prompt en `lib/agents/_prompts.js`
3. Registrar en `AGENT_MAP` de `api/orchestrator.js`
4. Agregar a este índice
