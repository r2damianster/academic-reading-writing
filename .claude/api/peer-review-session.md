---
owner: Arturo Rodríguez Zambrano
domain: api
last_updated: 2026-09-17
status: active
---

# Endpoint: /api/peer-review-session

## Responsable exclusivo
Arturo Rodríguez Zambrano — módulo Track 03, sesión de peer review sincronizada en vivo.

## Propósito
Un solo endpoint, multiplexado por `action` en el body (mismo patrón que `api/gamification.js`) — usa el último slot disponible de las 12 funciones Vercel. Orquesta todo el ciclo: el docente abre sesión → estudiantes conectan → escriben con integridad → asignación anónima al azar (2-3 revisores/ensayo) → revisión con rúbrica → liberación de resultados con doble evaluación (IA Groq + promedio de pares).

## Contrato
```
POST /api/peer-review-session
Body: { action: string, sessionId?: string, studentId?: string, payload?: object }

Response: { ...según action } | { error: string }
```

## Acciones (18)

| Action | Rol | Descripción |
|---|---|---|
| `list_templates` | docente | Lista `peer_review_templates` guardadas |
| `save_template` | docente | Crea o actualiza (con `id`) una plantilla |
| `delete_template` | docente | Elimina una plantilla |
| `open` | docente | Crea sesión (`status: 'open'`), opcionalmente desde `templateId` |
| `connect` | estudiante | Une al estudiante a la sesión (`peer_review_participants`) |
| `roster` | público (polling) | Estado agregado/anónimo — usado por estudiantes y docente para el conteo |
| `roster_detail` | docente | Lista nominal contra `students` (filtrada por `course_id`), con estado de conexión, flag de integridad y excluidos |
| `start_writing` | docente | `status → 'writing'`, fija `writing_deadline` |
| `autosave_draft` | estudiante | Guarda borrador cada ~20s (usado si el docente cierra antes de que termine) |
| `finish_early` | estudiante | Vincula el `essay_submission_id` ya insertado por el cliente, `status → 'waiting'` |
| `force_close_writing` | docente | Exige `status === 'writing'`. Cierra a los rezagados con su borrador (o vacío), `status → 'assigning'` |
| `assign_reviews` | docente | Exige `status === 'assigning'`. Baraja y asigna 2-3 revisores/ensayo (nunca auto-revisión), `status → 'reviewing'` |
| `get_my_reviews` | estudiante | Ensayos anónimos asignados a mí como revisor |
| `submit_review` | estudiante | Envía rúbrica + comentarios para una asignación |
| `force_close_reviewing` | docente | Exige `status === 'reviewing'`. Marca `pending`/`in_progress` como `expired` (parcial, no bloquea) |
| `reopen_reviewing` | docente | Revive asignaciones `expired` → `pending`, extiende `review_deadline` — recuperación si se cerró antes de tiempo |
| `exclude_participant` | docente | Saca a un estudiante del pool activo sin cerrar la sesión; expira sus revisiones pendientes como revisor |
| `release_feedback` | docente | Idempotente, por lotes (`batchSize` ≤ 30). Califica con Groq (reintenta 2x), persiste `peer_avg_scores` en `essay_submissions`, `status → 'feedback_released'` solo cuando TODO terminó |
| `get_results` | estudiante | Su ensayo + evaluación IA + promedio de pares + pertinencia de sus propias revisiones |

## Tablas destino
- `peer_review_sessions`, `peer_review_participants`, `peer_review_assignments`, `peer_review_feedback`, `peer_review_templates` — RLS activo **sin políticas** (deny-all anon/authenticated; solo este endpoint con `SUPABASE_SERVICE_KEY` accede). Garantiza el anonimato: el cliente nunca ve `student_id` de un revisor ni del autor de un ensayo asignado.
- `essay_submissions` — columnas `peer_review_session_id`, `ai_essay_scores`, `ai_essay_rationale`, `peer_avg_scores`, `peer_review_count`. El promedio de pares se persiste aquí (no solo en `peer_review_feedback`) para que `js/report.js` y `admin-student-detail.js`/`admin-students.html` puedan leerlo con anon/service key sin tocar las tablas bloqueadas.

## Variables de entorno
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY`
- `GROQ_TOKEN` (calificación IA vía `lib/groq-client.js`)
- `ADMIN_PASSWORD` (gatea toda acción de docente vía `payload.teacherPassword`)

## Reglas de estado — no romper
- `force_close_writing` exige `'writing'`, `assign_reviews` exige `'assigning'`, `force_close_reviewing` exige `'reviewing'` — devuelven 409 si no. Esto arregló un bug real: un doble-click en el botón correspondiente (sesión del 2026-09-17) volvía a ejecutar la acción sin avisar, dejando 8 estudiantes sin poder completar su revisión. Cualquier acción nueva que cambie `status` necesita la misma guarda.
- El status de la sesión pasa a `'feedback_released'` **solo cuando `release_feedback` terminó todo el lote** (ensayos + feedback de calidad de revisión) — nunca al inicio. Antes ponía el status al principio y el estudiante cuyo poll caía en esa ventana veía resultados vacíos para siempre (el frontend solo pedía `get_results` una vez).
- `gradeWithGroq` reintenta 2 veces con backoff; si falla del todo, **no escribe nada** (deja `ai_essay_scores`/`ai_review_quality_scores` en `null` para que el siguiente `release_feedback` lo reintente). Nunca escribir un fallback que marque la fila como "ya procesada".

## Notas para Claude
- La rúbrica (`ESSAY_CRITERIA = ['peel_rigor', 'hedging', 'nominalization']`, `REVIEW_CRITERIA = ['specific', 'actionable', 'balanced']`) está hardcodeada — ver DT-008 en `DEUDA_TECNICA.md`.
- `ETHICS_FLAG_THRESHOLD = 70` — `integrity_score` debajo de esto se marca para revisión del docente en `roster_detail` (no es una acusación automática, es una señal).
- Router usa `res.setHeader`/`writeHead`/`end` (nunca `res.status().json()`) para funcionar tanto en Vercel como en el servidor Node puro de `server.js` (local) — mismo patrón que `api/orchestrator.js`.
