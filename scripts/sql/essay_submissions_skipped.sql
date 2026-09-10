-- Migration: add skipped flag to essay_submissions
-- Distingue un "skip" (estudiante saltó el ensayo, quiere volver luego) de un
-- intento real. Sin esto, _countAttempts() en lesson-access.js cuenta el skip
-- como intento consumido y bloquea el regreso en lecciones is_repeatable=false.

ALTER TABLE essay_submissions
    ADD COLUMN IF NOT EXISTS skipped BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_essay_submissions_pending
    ON essay_submissions(student_id, activity, created_at DESC)
    WHERE skipped = TRUE;
