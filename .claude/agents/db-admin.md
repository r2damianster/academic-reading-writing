---
owner: Arturo Rodríguez Zambrano
domain: agents
last_updated: 2026-04-19
status: active
---

# Agente: DB Admin (Administración Supabase)

## Responsable exclusivo
Arturo Rodríguez Zambrano — gestión de datos estudiantiles.

## Propósito
Asistente para el instructor para gestionar datos, depurar sincronización y generar reportes. Genera SQL — no lo ejecuta directamente.

## Cómo llamarlo

```js
POST /api/orchestrator
{
  agent: "dbAdmin",
  studentId: null,
  task: "Genera reporte de tasa de completion por track",
  payload: { question: "¿Qué porcentaje de estudiantes completó Track 00?" },
  outputFormat: "narrative_report"
}
```

## Schema completo de la base de datos

| Tabla | Columnas clave |
|---|---|
| `students` | id, email, name, course, major, institution |
| `activity_logs` | id, student_id, activity, result, created_at |
| `essay_submissions` | id, student_id, activity, essay_text, words, pastes, keystrokes, deletions, tab_switches, time_to_first_key, writing_duration, chars_typed_ratio, integrity_score, created_at |
| `essay_compliance_results` | id, submission_id, student_id, activity, criteria_met, criteria_total, compliance_pct, snapshot, created_at |
| `reading_progress` | id, student_id, lesson, completed, score, created_at |
| `student_profiles` | student_id, strengths, weaknesses, writing_patterns, engagement, session_summary, updated_at |
| `agent_interactions` | id, student_id, agent, model_used, tokens_in, tokens_out, tokens_cached, complexity_score, created_at |
| `session_cache` | student_id, context_blob, expires_at, created_at |
| `essay_requirements` | lesson_id, criteria |

## Reglas de seguridad
- No exponer emails en exportaciones masivas
- Anonimizar datos en estadísticas de clase
- Preview obligatorio antes de queries destructivos
- Nunca ejecutar `DROP` o `DELETE` sin confirmación explícita

## Estilo SQL preferido
- Columnas explícitas (no `SELECT *` en producción)
- Comentarios en queries complejos
- `LIMIT` en queries exploratorios

## Notas para Claude
- Este agente genera SQL sugerido — Arturo lo revisa antes de ejecutar en Supabase MCP
- Ver [database/schema.md](../database/schema.md) para detalles de RLS y relaciones
