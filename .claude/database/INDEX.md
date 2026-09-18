---
type: index
domain: database
last_updated: 2026-09-17
owner: Arturo Rodríguez Zambrano
---

# Índice de Base de Datos

**Motor:** Supabase (PostgreSQL). RLS activo en todas las tablas.

## Tablas

| Tabla | Propósito | Documento |
|---|---|---|
| `students` | Registro de estudiantes | [schema.md](schema.md) |
| `activity_logs` | Log de actividades por lección | [schema.md](schema.md) |
| `essay_submissions` | Ensayos + telemetría de integridad + resultado de Peer Review | [schema.md](schema.md) |
| `essay_compliance_results` | Resultados de evaluación de rúbrica | [schema.md](schema.md) |
| `reading_progress` | Progreso por lección de lectura | [schema.md](schema.md) |
| `student_profiles` | Perfiles comprimidos por Memory Agent | [schema.md](schema.md) |
| `agent_interactions` | Audit trail de llamadas a agentes IA | [schema.md](schema.md) |
| `session_cache` | Cache de perfiles (TTL 4h) | [schema.md](schema.md) |
| `essay_requirements` | Criterios de evaluación por lección | [schema.md](schema.md) |
| `peer_review_sessions` | Sesión de peer review en vivo (docente/estado/tiempos) | [schema.md](schema.md) |
| `peer_review_participants` | Estudiante conectado a una sesión + su ensayo | [schema.md](schema.md) |
| `peer_review_assignments` | Asignación anónima revisor↔ensayo | [schema.md](schema.md) |
| `peer_review_feedback` | Rúbrica + comentarios que un revisor envió | [schema.md](schema.md) |
| `peer_review_templates` | Consignas guardadas — "lecciones programadas" | [schema.md](schema.md) |

Las 5 tablas `peer_review_*` tienen RLS activo **sin políticas** (deny-all anon/authenticated) — solo accesibles desde `api/peer-review-session.js` con `SUPABASE_SERVICE_KEY`. Es la única excepción a "RLS activo" en el sentido de que no hay políticas granulares, sino bloqueo total.

## Variables de entorno

Ver [env-vars.md](env-vars.md) para el mapa completo de variables y su exposición.

## Acceso

| Contexto | Credencial | Restricción |
|---|---|---|
| Servidor (`api/`) | `SUPABASE_SERVICE_KEY` | Sin RLS |
| Browser (`js/`) | Anon key vía `/api/config` | Sujeta a RLS |
| Claude Code MCP | Supabase MCP | `execute_sql` permitido |
