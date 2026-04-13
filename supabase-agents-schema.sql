-- =============================================================================
-- Tablas nuevas para el sistema de agentes de IA
-- Academic Reading & Writing — ULEAM
--
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Orden: ejecutar en el orden en que aparecen (hay dependencias entre tablas)
-- =============================================================================


-- ─── 1. STUDENT_PROFILES ─────────────────────────────────────────────────────
-- Perfil comprimido de cada estudiante. Lo mantiene el Memory Agent.
-- Se actualiza con el cron nocturno y después de cada interacción significativa.

CREATE TABLE IF NOT EXISTS student_profiles (
    student_id        UUID        PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
    strengths         TEXT[]      NOT NULL DEFAULT '{}',
    weaknesses        TEXT[]      NOT NULL DEFAULT '{}',
    writing_patterns  JSONB       NOT NULL DEFAULT '{
        "avg_words_per_essay": 0,
        "avg_integrity_score": null,
        "paste_tendency": "unknown",
        "vocabulary_level": "unknown",
        "common_errors": []
    }',
    engagement        JSONB       NOT NULL DEFAULT '{
        "sessions_completed": 0,
        "days_since_last_session": null,
        "completion_rate_pct": 0,
        "risk_level": "active"
    }',
    session_summary   TEXT        NOT NULL DEFAULT '',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para actualizaciones del cron (filtra por fecha)
CREATE INDEX IF NOT EXISTS idx_student_profiles_updated
    ON student_profiles(updated_at);

-- RLS: el estudiante puede ver su propio perfil; el instructor puede ver todos
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own profile"
    ON student_profiles FOR SELECT
    USING (student_id::text = current_setting('app.student_id', true));

CREATE POLICY "Service role has full access to profiles"
    ON student_profiles FOR ALL
    USING (current_setting('role', true) = 'service_role');


-- ─── 2. AGENT_INTERACTIONS ───────────────────────────────────────────────────
-- Registro de cada llamada al orquestador.
-- Permite monitorear gasto de tokens y auditar el uso de la IA.

CREATE TABLE IF NOT EXISTS agent_interactions (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID        REFERENCES students(id) ON DELETE SET NULL,
    agent             TEXT        NOT NULL,
    model_used        TEXT        NOT NULL,
    tokens_in         INTEGER     NOT NULL DEFAULT 0,
    tokens_out        INTEGER     NOT NULL DEFAULT 0,
    tokens_cached     INTEGER     NOT NULL DEFAULT 0,
    complexity_score  INTEGER     NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para queries del dashboard de tokens
CREATE INDEX IF NOT EXISTS idx_agent_interactions_student
    ON agent_interactions(student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_interactions_agent
    ON agent_interactions(agent, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_interactions_date
    ON agent_interactions(created_at DESC);

-- RLS: solo el service role puede insertar y leer
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to interactions"
    ON agent_interactions FOR ALL
    USING (current_setting('role', true) = 'service_role');


-- ─── 3. SESSION_CACHE ────────────────────────────────────────────────────────
-- Cache del Segmento B (perfil comprimido) con TTL de 4 horas.
-- Evita releer student_profiles en cada llamada al orquestador.

CREATE TABLE IF NOT EXISTS session_cache (
    student_id    UUID        PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
    context_blob  TEXT        NOT NULL,
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para limpiar registros expirados (cron de limpieza)
CREATE INDEX IF NOT EXISTS idx_session_cache_expires
    ON session_cache(expires_at);

-- RLS: solo el service role puede leer y escribir el cache
ALTER TABLE session_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to cache"
    ON session_cache FOR ALL
    USING (current_setting('role', true) = 'service_role');


-- =============================================================================
-- DATOS INICIALES — essay_requirements (DT-004)
-- Criterios de compliance para las lecciones del módulo 00-fundamentals
-- y primeras lecciones de 01/unit1-essays.
-- El campo `lesson_id` debe coincidir exactamente con _lessonName en slide-engine.js
-- (minúsculas, guiones → espacios, sin espacios extra).
-- =============================================================================

-- Verificar que la tabla existe antes de insertar
-- (Si no existe, crearla primero con el schema de tu proyecto)

INSERT INTO essay_requirements
    (lesson_id, min_words, max_words, min_integrity_score_required, max_pastes_allowed,
     target_keywords, min_keyword_matches, required_markers, forbidden_words)
VALUES

-- ── Módulo 00 — Fundamentals ───────────────────────────────────────────────

('formal language',
    80, 300, 75, 1,
    '{"formal": "", "academic": "", "register": "", "vocabulary": "", "tone": ""}',
    3,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','stuff','things','a lot of']
),

('thesis statement',
    100, 350, 75, 1,
    '{"thesis": "", "argument": "", "claim": "", "essay": "", "introduction": ""}',
    3,
    ARRAY[]::TEXT[],
    ARRAY['I think','I believe','In my opinion','gonna','wanna']
),

('topic sentences',
    100, 350, 75, 1,
    '{"topic sentence": "", "paragraph": "", "main idea": "", "support": ""}',
    3,
    ARRAY[]::TEXT[],
    ARRAY['I think','I believe','gonna','wanna']
),

('peer model',
    150, 450, 75, 1,
    '{"point": "", "explanation": "", "evidence": "", "response": "", "argument": ""}',
    4,
    ARRAY[]::TEXT[],
    ARRAY['I think','I believe','gonna','wanna']
),

('essay structure',
    150, 500, 75, 1,
    '{"introduction": "", "body": "", "conclusion": "", "thesis": "", "paragraph": ""}',
    4,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda']
),

('semantic waves',
    120, 400, 75, 1,
    '{"abstract": "", "concrete": "", "example": "", "concept": "", "application": ""}',
    3,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna']
),

('hedging language',
    100, 350, 75, 1,
    '{"may": "", "might": "", "could": "", "suggest": "", "appear": "", "seem": ""}',
    3,
    ARRAY[]::TEXT[],
    ARRAY['definitely','absolutely','certainly proves','I think','I believe']
),

-- ── Módulo 01/unit1 — Essays ───────────────────────────────────────────────

('argumentative essay',
    250, 700, 80, 1,
    '{"thesis": "", "argument": "", "counterargument": "", "evidence": "", "rebuttal": "", "however": ""}',
    4,
    ARRAY[]::TEXT[],
    ARRAY['I think','I believe','In my opinion','gonna','wanna']
),

('chain essay',
    200, 600, 78, 1,
    '{"furthermore": "", "in addition": "", "consequently": "", "therefore": "", "moreover": ""}',
    3,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','firstly secondly thirdly']
),

('rebuttal paragraph',
    120, 400, 78, 1,
    '{"although": "", "however": "", "despite": "", "counterargument": "", "concede": ""}',
    3,
    ARRAY[]::TEXT[],
    ARRAY['I think','I believe','gonna','wanna']
)

ON CONFLICT (lesson_id) DO UPDATE SET
    min_words                    = EXCLUDED.min_words,
    max_words                    = EXCLUDED.max_words,
    min_integrity_score_required = EXCLUDED.min_integrity_score_required,
    max_pastes_allowed           = EXCLUDED.max_pastes_allowed,
    target_keywords              = EXCLUDED.target_keywords,
    min_keyword_matches          = EXCLUDED.min_keyword_matches,
    required_markers             = EXCLUDED.required_markers,
    forbidden_words              = EXCLUDED.forbidden_words;


-- =============================================================================
-- QUERIES ÚTILES PARA EL INSTRUCTOR (ejecutar manualmente cuando se necesite)
-- =============================================================================

-- Ver gasto de tokens por agente en los últimos 7 días:
-- SELECT agent, model_used,
--        COUNT(*)                          AS calls,
--        SUM(tokens_in)                    AS total_tokens_in,
--        SUM(tokens_out)                   AS total_tokens_out,
--        SUM(tokens_cached)                AS total_tokens_cached,
--        ROUND(AVG(complexity_score), 1)   AS avg_complexity
-- FROM agent_interactions
-- WHERE created_at > NOW() - INTERVAL '7 days'
-- GROUP BY agent, model_used
-- ORDER BY total_tokens_in DESC;

-- Ver estudiantes sin perfil creado (nuevos):
-- SELECT s.id, s.name, s.email
-- FROM students s
-- LEFT JOIN student_profiles sp ON sp.student_id = s.id
-- WHERE sp.student_id IS NULL;

-- Limpiar session_cache expirado (ejecutar con cron):
-- DELETE FROM session_cache WHERE expires_at < NOW();
