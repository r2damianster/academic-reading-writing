-- Migration: create test_evaluations table for AI rubric scoring results

CREATE TABLE IF NOT EXISTS test_evaluations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id    UUID REFERENCES essay_submissions(id) ON DELETE CASCADE,
    student_id       UUID        NOT NULL,
    test_id          TEXT        NOT NULL,      -- 'test1 fundamentals'
    rubric_id        UUID REFERENCES test_rubrics(id),
    attempt_number   INTEGER     NOT NULL DEFAULT 1,
    total_score      NUMERIC(4,2),
    indicator_scores JSONB       NOT NULL,      -- [{key, points, level, comment}, ...]
    overall_feedback TEXT,
    model_used       TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id)                       -- one evaluation per submission
);

CREATE INDEX IF NOT EXISTS idx_test_evaluations_student  ON test_evaluations(student_id, test_id);
CREATE INDEX IF NOT EXISTS idx_test_evaluations_rubric   ON test_evaluations(rubric_id);

-- RLS
ALTER TABLE test_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can read own evaluations"
    ON test_evaluations FOR SELECT
    USING (student_id = auth.uid());
CREATE POLICY "Service role full access"
    ON test_evaluations FOR ALL
    USING (auth.role() = 'service_role');
