# Graph Report - Academic_reading_and_writing  (2026-07-29)

## Corpus Check
- 105 files · ~248,127 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 91 nodes · 127 edges · 15 communities (10 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b84f21a`
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
- `handleSubmitQuickThink()` --calls--> `calcQuickThinkPoints()`  [EXTRACTED]
  api/gamification.js → lib/scoring-engine.js
- `handleSubmitExercise()` --calls--> `validateExerciseAnswer()`  [EXTRACTED]
  api/gamification.js → lib/dojo-integrity.js

## Import Cycles
- None detected.

## Communities (15 total, 5 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.24
Nodes (7): calcExercisePoints(), calcQuickThinkPoints(), checkBadgeUnlock(), getLeagueRankInfo(), getStreakMultiplier(), getStreakStatus(), getTimeMultiplier()

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (7): { calcExercisePoints, calcQuickThinkPoints, getStreakStatus, checkBadgeUnlock, getLeagueRankInfo }, { createClient }, DOJO_CACHE, fs, path, supabase, { validateExerciseAnswer }

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (7): { createClient }, fs, http, MIME, path, server, supabase

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (17): 1. Apply Supabase RLS Policies, 2. Seed Initial Data (Optional), 3. Deploy to Vercel, 4. Monitor (Post-Deploy), Architecture, Backend (Server), Badge Criteria (Auto-Unlock), Database (Supabase) (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.40
Nodes (5): handleDojoTopic(), handleQuickThinkSets(), handleSubmitQuickThink(), loadDojoContent(), updateStreak()

### Community 7 - "Community 7"
Cohesion: 0.40
Nodes (6): checkAndUnlockBadges(), getStudentDojoProgress(), getStudentStreak(), handleDojoSeries(), handleGetBadges(), handleGetStreak()

## Knowledge Gaps
- **31 isolated node(s):** `fs`, `path`, `{ createClient }`, `{ calcExercisePoints, calcQuickThinkPoints, getStreakStatus, checkBadgeUnlock, getLeagueRankInfo }`, `{ validateExerciseAnswer }` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DojoClient` connect `Community 6` to `Community 8`, `Community 12`, `Community 13`, `Community 14`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `{ createClient }` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._