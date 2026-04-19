---
owner: Arturo Rodríguez Zambrano
domain: database
last_updated: 2026-04-19
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
  id                  uuid PRIMARY KEY,
  student_id          uuid REFERENCES students(id),
  activity            text,      -- lessonId
  essay_text          text,
  words               integer,
  pastes              integer,
  keystrokes          integer,
  deletions           integer,
  tab_switches        integer,
  time_to_first_key   integer,   -- segundos
  writing_duration    integer,   -- segundos
  chars_typed_ratio   numeric,   -- porcentaje 0-100
  integrity_score     numeric,   -- 0-100
  created_at          timestamptz DEFAULT now()
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

## Notas
- `context_blob` en `session_cache` contiene el perfil completo del estudiante — no loguear
- `essay_text` en `essay_submissions` es PII — no incluir en exports masivos
- TTL del session_cache: 4 horas (gestionado en `lib/agents/memory.js`)
