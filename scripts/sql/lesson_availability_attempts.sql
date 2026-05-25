-- Migration: add is_repeatable, max_attempts, and activity_key to lesson_availability
-- activity_key maps lesson_id (nav.js label) to essay_submissions.activity (SlideEngine name)
-- Example: lesson_id = 'Test 1 — Fundamentals' → activity_key = 'test1 fundamentals'

ALTER TABLE lesson_availability
    ADD COLUMN IF NOT EXISTS is_repeatable BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS max_attempts  INTEGER,      -- NULL = unlimited
    ADD COLUMN IF NOT EXISTS activity_key  TEXT;         -- required when max_attempts is set

CREATE INDEX IF NOT EXISTS idx_lesson_availability_attempts
    ON lesson_availability(activity_key)
    WHERE max_attempts IS NOT NULL;
