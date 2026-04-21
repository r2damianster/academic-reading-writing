---
type: index
domain: api
last_updated: 2026-04-19
owner: Arturo Rodríguez Zambrano
---

# Índice de API Endpoints

Todos los endpoints son funciones serverless de Vercel (CommonJS).
**Límite: 12 funciones. Actualmente: 7 activas.**

## Tabla de endpoints

| Ruta | Método | Función | Documento |
|---|---|---|---|
| `POST /api/orchestrator` | POST | Hub de agentes IA | [orchestrator.md](orchestrator.md) |
| `GET /api/config` | GET | Expone anon key de Supabase al browser | [config.md](config.md) |
| `POST /api/validate-student` | POST | Auth de estudiantes y admin | [validate-student.md](validate-student.md) |
| `POST /api/sync-reading` | POST | Sincroniza progreso de lectura | [sync-reading.md](sync-reading.md) |
| `GET /api/cron/compress-profiles` | GET (cron) | Comprime perfiles nocturnamente | — |
| `GET /api/admin-students` | GET | Lista todos los estudiantes con stats agregados (usa SERVICE_KEY) | — |
| `GET /api/admin-student-detail` | GET | Historial completo de un estudiante `?studentId=<uuid>` (usa SERVICE_KEY) | — |

## Módulos de soporte en lib/ (no cuentan como funciones)

| Archivo | Propósito |
|---|---|
| `lib/groq-client.js` | Cliente HTTP para Groq API |
| `lib/agents/_prompts.js` | System prompts de los 10 agentes |
| `lib/agents/memory.js` | Gestión de perfiles de estudiantes |
| `lib/agents/writing.js` | Transform payload — writing agent |
| `lib/agents/integrity.js` | Transform payload — integrity agent |
| `lib/agents/reading.js` | Transform payload — reading agent |
| `lib/agents/content-gen.js` | Transform payload — content gen |
| `lib/agents/github.js` | Transform payload — github agent |
| `lib/agents/frontend.js` | Transform payload — frontend agent |
| `lib/agents/peer-review.js` | Transform payload — peer review |

## Regla crítica
Nunca mover archivos de `lib/` a `api/` sin verificar el conteo de funciones.
