# Graph Report - Academic_reading_and_writing  (2026-08-25)

## Corpus Check
- 108 files · ~250,181 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 100 nodes · 132 edges · 12 communities (4 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `62f19ca1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]

## God Nodes (most connected - your core abstractions)
1. `DojoClient` - 22 edges
2. `Dojo Académico — Deployment & Operations Guide` - 10 edges
3. `handleSubmitExercise()` - 7 edges
4. `loadDojoContent()` - 6 edges
5. `checkAndUnlockBadges()` - 6 edges
6. `handleSubmitQuickThink()` - 6 edges
7. `getStudentDojoProgress()` - 5 edges
8. `Deployment Checklist` - 5 edges
9. `calcExercisePoints()` - 5 edges
10. `getStudentStreak()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `handleSubmitExercise()` --calls--> `calcExercisePoints()`  [EXTRACTED]
  api/gamification.js → lib/scoring-engine.js
- `handleSubmitExercise()` --calls--> `validateExerciseAnswer()`  [EXTRACTED]
  api/gamification.js → lib/dojo-integrity.js
- `handleSubmitQuickThink()` --calls--> `calcQuickThinkPoints()`  [EXTRACTED]
  api/gamification.js → lib/scoring-engine.js

## Import Cycles
- None detected.

## Communities (12 total, 8 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.28
Nodes (6): calcExercisePoints(), checkBadgeUnlock(), getLeagueRankInfo(), getStreakMultiplier(), getStreakStatus(), getTimeMultiplier()

### Community 2 - "Community 2"
Cohesion: 0.16
Nodes (21): { calcExercisePoints, calcQuickThinkPoints, getStreakStatus, checkBadgeUnlock, getLeagueRankInfo }, checkAndUnlockBadges(), { createClient }, DOJO_CACHE, fs, getStudentDojoProgress(), getStudentStreak(), handleDojoSeries() (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (7): { createClient }, fs, http, MIME, path, server, supabase

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (17): 1. Apply Supabase RLS Policies, 2. Seed Initial Data (Optional), 3. Deploy to Vercel, 4. Monitor (Post-Deploy), Architecture, Backend (Server), Badge Criteria (Auto-Unlock), Database (Supabase) (+9 more)

## Knowledge Gaps
- **36 isolated node(s):** `{ createClient }`, `http`, `fs`, `path`, `{ createClient }` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `{ createClient }`, `http`, `fs` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Community 6` be split into smaller, more focused modules?**
  _Cohesion score 0.1422924901185771 - nodes in this community are weakly interconnected._