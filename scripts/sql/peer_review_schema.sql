-- Peer Review Session — esquema completo
-- Sesión en vivo: docente abre -> estudiantes conectan -> escriben con integridad ->
-- asignación aleatoria anónima (2-3 revisores/ensayo) -> revisión con rúbrica ->
-- liberación de resultados con doble evaluación (IA Groq + pares).
--
-- Seguridad: las 4 tablas quedan con RLS activo y SIN políticas → anon/authenticated
-- no pueden leer ni escribir nada. Todo pasa por api/peer-review-session.js con
-- SUPABASE_SERVICE_KEY (el service_role de Supabase tiene BYPASSRLS). Así se
-- garantiza el anonimato: el cliente nunca puede hacer SELECT directo a estas tablas.

CREATE TABLE IF NOT EXISTS peer_review_sessions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_name          TEXT        NOT NULL,
    teacher_email        TEXT        NOT NULL,
    status               TEXT        NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open','writing','assigning','reviewing','feedback_released','closed')),
    writing_minutes      INTEGER     NOT NULL DEFAULT 20,
    writing_deadline     TIMESTAMPTZ,
    review_minutes       INTEGER     NOT NULL DEFAULT 15,
    review_deadline      TIMESTAMPTZ,
    reviewers_per_essay  INTEGER     NOT NULL DEFAULT 3,
    instructions         TEXT,                 -- consigna/thesis mostrada a los estudiantes durante la escritura
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS peer_review_participants (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id           UUID        NOT NULL REFERENCES peer_review_sessions(id) ON DELETE CASCADE,
    student_id           UUID        NOT NULL,
    student_name         TEXT,
    status               TEXT        NOT NULL DEFAULT 'connected'
                         CHECK (status IN ('connected','writing','waiting','reviewing','done')),
    essay_submission_id  UUID        REFERENCES essay_submissions(id),
    draft_text           TEXT,                 -- autoguardado mientras escribe, usado si el docente cierra antes de que termine
    draft_updated_at     TIMESTAMPTZ,
    connected_at         TIMESTAMPTZ DEFAULT NOW(),
    submitted_at         TIMESTAMPTZ,
    UNIQUE (session_id, student_id)
);

CREATE TABLE IF NOT EXISTS peer_review_assignments (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id                  UUID        NOT NULL REFERENCES peer_review_sessions(id) ON DELETE CASCADE,
    essay_owner_participant_id  UUID        NOT NULL REFERENCES peer_review_participants(id),
    reviewer_participant_id     UUID        NOT NULL REFERENCES peer_review_participants(id),
    anon_code                   TEXT        NOT NULL,   -- ej. "Ensayo 7" — estable por autor dentro de la sesión
    status                      TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','in_progress','done','expired')),
    assigned_at                 TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (session_id, essay_owner_participant_id, reviewer_participant_id)
);

CREATE TABLE IF NOT EXISTS peer_review_feedback (
    id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id                 UUID        NOT NULL UNIQUE REFERENCES peer_review_assignments(id) ON DELETE CASCADE,
    essay_scores                  JSONB       NOT NULL,  -- {argument,evidence,structure,language,conventions}: 1-4 cada uno
    comments                      JSONB       NOT NULL,  -- {strengths, improve, priority}
    ai_review_quality_scores      JSONB,                  -- {specific,actionable,balanced}: 1-4 — llenado por Groq al liberar
    ai_review_quality_rationale   TEXT,
    submitted_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prp_session   ON peer_review_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_pra_session   ON peer_review_assignments(session_id);
CREATE INDEX IF NOT EXISTS idx_pra_reviewer  ON peer_review_assignments(reviewer_participant_id);
CREATE INDEX IF NOT EXISTS idx_pra_owner     ON peer_review_assignments(essay_owner_participant_id);

ALTER TABLE peer_review_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_review_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_review_assignments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_review_feedback      ENABLE ROW LEVEL SECURITY;
-- Sin CREATE POLICY a propósito: RLS activo + cero políticas = deny-all para anon/authenticated.
-- service_role (BYPASSRLS) sigue teniendo acceso total desde el endpoint.

-- Vincula cada ensayo escrito en sesión de peer review + resultado de la doble evaluación del ensayo.
ALTER TABLE essay_submissions ADD COLUMN IF NOT EXISTS peer_review_session_id UUID REFERENCES peer_review_sessions(id);
ALTER TABLE essay_submissions ADD COLUMN IF NOT EXISTS ai_essay_scores        JSONB;   -- {argument,evidence,structure,language,conventions}
ALTER TABLE essay_submissions ADD COLUMN IF NOT EXISTS ai_essay_rationale     TEXT;
