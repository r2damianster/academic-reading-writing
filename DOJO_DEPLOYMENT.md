# Dojo Académico — Deployment & Operations Guide

## Overview

Dojo Académico is a gamification system integrated **within** academic-reading-writing.vercel.app. Students access it via the sidebar button "🥋 Dojo" and can:

- Solve structured exercises in 5 series (Argumentative Essays, Research Papers, Grammar, Integrity, Speed Challenge)
- Play QuickThink (rapid Q&A sessions, 30s per question)
- See their streak, rank in course league, unlocked badges
- View leaderboard (modal on entry, standings always visible)

## Architecture

### Frontend (Client)
- **index.html**: Added sidebar button "🥋 Dojo" + streak badge
- **dojo-home.html**: Series grid, QuickThink shortcuts, leaderboard card
- **dojo-series.html**: Topic list with exercise navigation
- **dojo-exercise.html**: Exercise solver with timer + submit
- **dojo-quick-think.html**: Q&A session with nav + results
- **my-progress.html**: New "🥋 Dojo" tab (streak, badges, league)
- **js/dojo-client.js**: API client + offline-first localStorage queue

### Backend (Server)
- **api/gamification.js**: 6 actions
  - `dojo-series`: list series + student progress
  - `dojo-topic`: list topics + exercises for series
  - `submit-exercise`: score calculation, badge check
  - `quick-think-sets`: list QT sets
  - `submit-qt`: record session, badge check
  - `leaderboard`: student rank + top performers in course
- **lib/scoring-engine.js**: Scoring formulas (transparent to students)
  - Base pts: 10 (easy), 25 (medium), 50 (hard)
  - Streak multiplier: 1.0x (1-7d) → 1.1x (8-14d) → 1.2x (15+d)
  - Time multiplier: 1.2x (<50%) | 1.0x | 0.8x (>100%)
  - Quick Think: 5 pts per correct answer
- **data/dojo/** JSON files (static content)
  - series.json: 5 series metadata
  - topics.json: 11 topics across series
  - exercises.json: 10+ exercises with prompts + difficulty
  - quick-think.json: 2 Q&A sets (grammar, citations)

### Database (Supabase)
- **8 gamification_* tables** (already in schema)
  - `gamification_student_dojo_progress`: track series/topic/exercise completion, streak, points
  - `gamification_student_quick_think_session`: Q&A session records
  - `gamification_student_badges`: unlocked badges per student
  - `gamification_student_league_progress`: weekly points + rank per student per league
  - `gamification_streaks`: calendar-day racha (UTC-5 Ecuador)
  - `gamification_dojo_series`: series metadata (filled from JSON)
  - `gamification_dojo_topic`: topic metadata (filled from JSON)
  - `gamification_quick_think_set`: QT metadata (filled from JSON)
  - `gamification_leagues`: weekly leagues by course + tier
  - `gamification_badges`: badge definitions

## Deployment Checklist

### 1. Apply Supabase RLS Policies
```bash
# Run supabase-dojo-rls.sql via Supabase SQL Editor
# OR use psql: psql -d postgresql://... < supabase-dojo-rls.sql
```

Policies ensure:
- Students see only their own progress/badges/sessions
- Leaderboard visible within course (via `course` field)
- Public read on content tables (series, topics, exercises, badges)

### 2. Seed Initial Data (Optional)
If using Supabase instead of JSON-only:
```sql
-- Series
INSERT INTO gamification_dojo_series (series_id, name, ...) 
VALUES ('argumentative-essays', 'Argumentative Essays', ...);

-- Topics
INSERT INTO gamification_dojo_topic (topic_id, series_id, name, ...)
VALUES ('arg-thesis-statements', 'argumentative-essays', 'Thesis Statements', ...);

-- Badges
INSERT INTO gamification_badges (badge_id, name, category, source_type)
VALUES 
  ('consistency', 'Consistency', 'racha', 'dojo'),
  ('essay-master', 'Essay Master', 'writing', 'dojo'),
  ('speed-demon', 'Speed Demon', 'challenge', 'dojo'),
  ('quick-thinker', 'Quick Thinker', 'quiz', 'dojo'),
  ('writing-legend', 'Writing Legend', 'milestone', 'dojo');
```

### 3. Deploy to Vercel

```bash
git add -A
git commit -m "feat: Deploy Dojo Académico"
git push origin main
```

Auto-push hook via GitHub will trigger Vercel deployment.

**Check deployment:**
- https://academic-reading-writing.vercel.app/ loads home
- Sidebar has "🥋 Dojo" button
- Click Dojo → series grid loads
- Exercise/QT flows work in dev

### 4. Monitor (Post-Deploy)

**Logs:**
```bash
# Vercel logs (via Web UI)
# API errors in /api/gamification responses
# Client errors in browser console
```

**Key checks:**
- RLS policies block non-owner access (test in Supabase SQL)
- Badge unlock triggers on >threshold activity
- Leaderboard updates weekly (Sundays 23:59 UTC-5)
- Offline queue syncs when online

## Scoring Formula (Student-Visible)

Displayed on dojo-series.html:

```
Points = Base × Streak Multiplier × Time Multiplier

Base Points:
  Easy:   10 pts
  Medium: 25 pts
  Hard:   50 pts

Streak Multiplier (consecutive days):
  Days 1-7:   1.0x
  Days 8-14:  1.1x
  Days 15+:   1.2x

Time Multiplier (vs time limit):
  < 50%:      1.2x (Speed Bonus!)
  50-100%:    1.0x
  > 100%:     0.8x

Example:
  25 pts (medium) × 1.1 (10d streak) × 1.2 (fast) = 33 pts

Quick Think:
  5 pts per correct answer (independent of time)
```

## Badge Criteria (Auto-Unlock)

- **Consistency** ⚡: 7 consecutive days streak
- **Essay Master** 📝: 10 argumentative essays completed
- **Speed Demon** ⚡: 10 exercises <50% time limit
- **Quick Thinker** 💡: 50 QuickThink questions correct
- **Writing Legend** 🏆: 100 total exercises completed

Badges unlock automatically via `checkAndUnlockBadges()` after each submit.

## Leaderboard (24-Hour Gate)

**First-time logic:** When student enters Dojo home:
1. `dojoClient.showLeaderboardIfEligible()` checks `dojo_leaderboard_last_shown` in localStorage
2. If >24h since last view, show modal + update timestamp
3. After 24h, show again (once) for that 24h window
4. Standings card always visible (no gate)

**Backend:** `handleGetLeaderboard()` fetches from `gamification_student_dojo_progress` where `course_id = student.course_id`.

## File Structure

```
.
├── api/gamification.js                  ← API endpoint (6 actions)
├── lib/scoring-engine.js                ← Scoring logic
├── lib/localStorage-sync.js             ← Offline queue (legacy, integrated in dojo-client)
├── data/dojo/
│   ├── series.json                      ← 5 series
│   ├── topics.json                      ← 11 topics
│   ├── exercises.json                   ← 10+ exercises
│   └── quick-think.json                 ← 2 Q&A sets
├── dojo-home.html                       ← Entry point (series + leaderboard)
├── dojo-series.html                     ← Topic list + exercise nav
├── dojo-exercise.html                   ← Exercise solver
├── dojo-quick-think.html                ← Q&A session
├── js/dojo-client.js                    ← Frontend API client
├── index.html                           ← Sidebar button added
├── my-progress.html                     ← Dojo tab added
├── supabase-dojo-rls.sql                ← RLS policies
└── DOJO_DEPLOYMENT.md                   ← This file
```

## Known Limitations & Future Work

1. **Badges section in My Progress**: Currently placeholder. Full sync requires badge icons + descriptions in Supabase.
2. **League tiers**: Currently calculated client-side (bronze→platinum). Can move to stored procedure.
3. **Cron for weekly reset**: Leagues reset every Sunday 23:59 UTC-5 (manual or via cron job).
4. **Student names in leaderboard**: Only show UUID slice due to privacy. Can add `name` field if GDPR-compliant.
5. **Racha streak calculation**: Uses localStorage `dojo_last_activity_date`. Should sync with Supabase timestamp for multi-device.

## Support & Debugging

**Issue: "Leaderboard unavailable"**
- Check Supabase course students query (student.course_id correct?)
- Verify RLS policy allows course visibility

**Issue: "Badge not unlocking"**
- Check `total_exercise_count`, `speed_bonus_count`, `qt_correct_count` update in Supabase
- Run `checkAndUnlockBadges()` manually via SQL

**Issue: "Offline queue not syncing"**
- Check browser localStorage `dojo_queue_exercise` / `dojo_queue_quick_think`
- Verify API `/api/gamification` reachable

---

**Deployed:** [academic-reading-writing.vercel.app](https://academic-reading-writing.vercel.app)  
**GitHub:** [r2damianster/academic-reading-writing](https://github.com/r2damianster/academic-reading-writing)  
**Contact:** Arturo Rodríguez (ULEAM, Psicodidáctica)
