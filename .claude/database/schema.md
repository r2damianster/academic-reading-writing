---
owner: Arturo Rodríguez Zambrano
domain: database
last_updated: 2026-09-17
status: active
---

# Schema de Base de Datos

## students
```sql
students(
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text UNIQUE NOT NULL,
  name         text NOT NULL,
  course       text,
  major        text,
  institution  text
)
```

## activity_logs
```sql
activity_logs(
  id          uuid PRIMARY KEY,
  student_id  uuid REFERENCES students(id),
  activity    text,      -- lessonId o slug de actividad
  result      text,      -- "completed", "score:85", etc.
  created_at  timestamptz DEFAULT now()
)
```

## essay_submissions
```sql
essay_submissions(
  id                     uuid PRIMARY KEY,
  student_id             uuid REFERENCES students(id),
  activity               text,      -- lessonId, o "peer-review:<sessionId>" para sesiones en vivo
  essay_text             text,
  words                  integer,
  pastes                 integer,
  keystrokes             integer,
  deletions              integer,
  tab_switches           integer,
  time_to_first_key      integer,   -- segundos
  writing_duration       integer,   -- segundos
  chars_typed_ratio      numeric,   -- porcentaje 0-100
  integrity_score        numeric,   -- 0-100
  skipped                boolean DEFAULT false,  -- true = estudiante saltó el ensayo (no cuenta como intento, ver lesson-access.js _countAttempts)
  -- columnas de Peer Review (2026-09-17):
  peer_review_session_id uuid REFERENCES peer_review_sessions(id),
  ai_essay_scores        jsonb,     -- {peel_rigor, hedging, nominalization} 1-4 c/u, calificado por Groq
  ai_essay_rationale      text,
  peer_avg_scores         jsonb,     -- promedio de los 2-3 revisores, mismos criterios — persistido acá porque peer_review_feedback está bloqueada por RLS
  peer_review_count       integer DEFAULT 0,
  created_at              timestamptz DEFAULT now()
)
```

## essay_compliance_results
```sql
essay_compliance_results(
  id             uuid PRIMARY KEY,
  submission_id  uuid REFERENCES essay_submissions(id),
  student_id     uuid REFERENCES students(id),
  activity       text,
  criteria_met   integer,
  criteria_total integer,
  compliance_pct numeric,
  snapshot       jsonb,     -- copia de criterios al momento de evaluar
  created_at     timestamptz DEFAULT now()
)
```

## reading_progress
```sql
reading_progress(
  id          uuid PRIMARY KEY,
  student_id  uuid REFERENCES students(id),
  lesson      text,
  completed   boolean DEFAULT false,
  score       numeric,
  created_at  timestamptz DEFAULT now()
)
```

## student_profiles
```sql
student_profiles(
  student_id        uuid PRIMARY KEY REFERENCES students(id),
  strengths         jsonb,    -- array de strings
  weaknesses        jsonb,
  writing_patterns  jsonb,
  engagement        jsonb,
  session_summary   text,
  updated_at        timestamptz DEFAULT now()
)
```

## agent_interactions
```sql
agent_interactions(
  id               uuid PRIMARY KEY,
  student_id       uuid REFERENCES students(id),
  agent            text,
  model_used       text,
  tokens_in        integer,
  tokens_out       integer,
  tokens_cached    integer,
  complexity_score integer,
  created_at       timestamptz DEFAULT now()
)
```

## session_cache
```sql
session_cache(
  student_id    uuid PRIMARY KEY REFERENCES students(id),
  context_blob  text,       -- JSON serializado del perfil
  expires_at    timestamptz,
  created_at    timestamptz DEFAULT now()
)
```

## essay_requirements
```sql
essay_requirements(
  lesson_id  text PRIMARY KEY,
  criteria   jsonb    -- array de criterios de evaluación
)
```

## peer_review_sessions (2026-09-17)
```sql
peer_review_sessions(
  id                   uuid PRIMARY KEY,
  lesson_name          text NOT NULL,
  teacher_email        text NOT NULL,
  status               text NOT NULL DEFAULT 'open', -- open|writing|assigning|reviewing|feedback_released|closed
  writing_minutes      integer DEFAULT 20,
  writing_deadline     timestamptz,
  review_minutes       integer DEFAULT 15,
  review_deadline      timestamptz,
  reviewers_per_essay  integer DEFAULT 3,
  instructions         text,      -- consigna/thesis mostrada al estudiante durante la escritura
  course_id            uuid,      -- filtra el roster nominal contra students.course_id
  template_id          uuid REFERENCES peer_review_templates(id),
  created_at           timestamptz DEFAULT now()
)
```
RLS activo, **sin políticas** — deny-all para anon/authenticated. Solo `api/peer-review-session.js` (service_role) accede.

## peer_review_participants (2026-09-17)
```sql
peer_review_participants(
  id                   uuid PRIMARY KEY,
  session_id           uuid REFERENCES peer_review_sessions(id) ON DELETE CASCADE,
  student_id           uuid NOT NULL,
  student_name         text,
  status               text DEFAULT 'connected', -- connected|writing|waiting|reviewing|done
  essay_submission_id  uuid REFERENCES essay_submissions(id),
  draft_text           text,      -- autoguardado mientras escribe
  draft_updated_at     timestamptz,
  excluded             boolean DEFAULT false,   -- excluido manualmente del pool por el docente
  connected_at         timestamptz DEFAULT now(),
  submitted_at         timestamptz,
  UNIQUE(session_id, student_id)
)
```

## peer_review_assignments (2026-09-17)
```sql
peer_review_assignments(
  id                          uuid PRIMARY KEY,
  session_id                  uuid REFERENCES peer_review_sessions(id) ON DELETE CASCADE,
  essay_owner_participant_id  uuid REFERENCES peer_review_participants(id),
  reviewer_participant_id     uuid REFERENCES peer_review_participants(id),
  anon_code                   text NOT NULL,   -- ej. "Ensayo 7" — estable por autor dentro de la sesión
  status                      text DEFAULT 'pending', -- pending|in_progress|done|expired
  assigned_at                 timestamptz DEFAULT now(),
  UNIQUE(session_id, essay_owner_participant_id, reviewer_participant_id)
)
```

## peer_review_feedback (2026-09-17)
```sql
peer_review_feedback(
  id                           uuid PRIMARY KEY,
  assignment_id                uuid UNIQUE REFERENCES peer_review_assignments(id) ON DELETE CASCADE,
  essay_scores                 jsonb NOT NULL,  -- {peel_rigor, hedging, nominalization}
  comments                     jsonb NOT NULL,  -- {strengths, improve, priority}
  ai_review_quality_scores     jsonb,           -- {specific, actionable, balanced} — calidad de la revisión, calificado por Groq
  ai_review_quality_rationale  text,
  submitted_at                 timestamptz DEFAULT now()
)
```

## peer_review_templates (2026-09-17)
```sql
peer_review_templates(
  id                   uuid PRIMARY KEY,
  name                 text NOT NULL,
  course_id            uuid,
  instructions         text NOT NULL,
  writing_minutes      integer DEFAULT 20,
  review_minutes       integer DEFAULT 15,
  reviewers_per_essay  integer DEFAULT 3,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
)
```
Lecciones "programadas" — el docente las elige de un `<select>` en el panel en vez de escribir la consigna cada vez.

## Notas
- `context_blob` en `session_cache` contiene el perfil completo del estudiante — no loguear
- `essay_text` en `essay_submissions` es PII — no incluir en exports masivos
- TTL del session_cache: 4 horas (gestionado en `lib/agents/memory.js`)
- Las 5 tablas `peer_review_*` tienen RLS activo sin políticas a propósito (anonimato) — nunca agregar una política de SELECT/INSERT para anon/authenticated ahí. El promedio de pares se expone al estudiante/docente vía `essay_submissions.peer_avg_scores`, no leyendo `peer_review_feedback` directo.
