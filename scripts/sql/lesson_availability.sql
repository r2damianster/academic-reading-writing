-- =============================================================================
-- Lesson Availability & Deadlines Schema
-- =============================================================================

CREATE TABLE IF NOT EXISTS lesson_availability (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id        TEXT         NOT NULL, -- Path or label from nav.js
    course_id        TEXT,                  -- Optional grouping by course
    student_id       UUID         REFERENCES students(id) ON DELETE CASCADE, -- Optional individual override
    available_from   TIMESTAMPTZ,           -- Start date/time
    available_until  TIMESTAMPTZ,           -- End date/time (deadline)
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    message_override TEXT,                  -- custom message for blocked users
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_lesson_avail_lesson  ON lesson_availability(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_avail_course  ON lesson_availability(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_avail_student ON lesson_availability(student_id);

-- RLS: Only the service role and possibly admins should manage this.
-- Students can read to check their own status.
ALTER TABLE lesson_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lesson availability"
    ON lesson_availability FOR SELECT
    USING (true);

-- (Optional) If you want to use the anon key for management from admin.html, 
-- you'll need a policy for authenticated instructors or just use the service role key.
-- For now, we assume admin management uses the service role key via internal API 
-- or that the anon key is used with a policy if we want to stick to the existing pattern.
