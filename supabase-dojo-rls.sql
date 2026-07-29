-- Dojo Académico — Row-Level Security Policies
-- Ensures students only access their own gamification data

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. gamification_student_dojo_progress — Student-only access
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE gamification_student_dojo_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see only their own dojo progress" ON gamification_student_dojo_progress
  AS SELECT
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. gamification_student_quick_think_session — Student-only access
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE gamification_student_quick_think_session ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see only their own quick think sessions" ON gamification_student_quick_think_session
  AS SELECT
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. gamification_student_badges — Student-only access
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE gamification_student_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see only their own badges" ON gamification_student_badges
  AS SELECT
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. gamification_student_league_progress — Student-only access
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE gamification_student_league_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see only their own league progress" ON gamification_student_league_progress
  AS SELECT
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. gamification_streaks — Student-only access
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE gamification_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see only their own streak" ON gamification_streaks
  AS SELECT
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. gamification_leagues — Visible to league members (course students)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE gamification_leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see leagues for their course" ON gamification_leagues
  AS SELECT
  USING (
    course IN (SELECT course FROM students WHERE id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. Public read: gamification_dojo_series, gamification_dojo_topic,
--    gamification_quick_think_set, gamification_badges
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE gamification_dojo_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read: dojo series" ON gamification_dojo_series
  AS SELECT
  USING (true);

ALTER TABLE gamification_dojo_topic ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read: dojo topics" ON gamification_dojo_topic
  AS SELECT
  USING (true);

ALTER TABLE gamification_quick_think_set ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read: quick think sets" ON gamification_quick_think_set
  AS SELECT
  USING (true);

ALTER TABLE gamification_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read: badges" ON gamification_badges
  AS SELECT
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. Notes
-- ═══════════════════════════════════════════════════════════════════════════
-- The backend (api/gamification.js) uses SUPABASE_SERVICE_KEY to bypass RLS
-- for admin operations like updating progress and checking leaderboards.
--
-- RLS only applies to direct client calls. Since our frontend uses
-- dojoClient.js → api/gamification.js (which uses service key),
-- RLS is a backup security layer but won't block legitimate operations.
--
-- If direct Supabase client calls are added later, auth.uid() must match
-- the actual user's UUID in the students table.
