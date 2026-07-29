# Graph Report - Academic_reading_and_writing  (2026-07-29)

## Corpus Check
- 103 files · ~224,131 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 82 nodes · 107 edges · 12 communities (8 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4e3e0220`
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
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]

## God Nodes (most connected - your core abstractions)
1. `DojoClient` - 20 edges
2. `Dojo Académico — Deployment & Operations Guide` - 10 edges
3. `loadDojoContent()` - 6 edges
4. `getStudentDojoProgress()` - 5 edges
5. `handleSubmitExercise()` - 5 edges
6. `handleSubmitQuickThink()` - 5 edges
7. `Deployment Checklist` - 5 edges
8. `calcExercisePoints()` - 5 edges
9. `checkAndUnlockBadges()` - 4 edges
10. `Architecture` - 4 edges

## Surprising Connections (you probably didn't know these)
- `handleSubmitExercise()` --calls--> `calcExercisePoints()`  [EXTRACTED]
  api/gamification.js → lib/scoring-engine.js
- `handleSubmitQuickThink()` --calls--> `calcQuickThinkPoints()`  [EXTRACTED]
  api/gamification.js → lib/scoring-engine.js

## Import Cycles
- None detected.

## Communities (12 total, 4 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.28
Nodes (6): calcExercisePoints(), checkBadgeUnlock(), getLeagueRankInfo(), getStreakMultiplier(), getStreakStatus(), getTimeMultiplier()

### Community 2 - "Community 2"
Cohesion: 0.21
Nodes (15): { calcExercisePoints, calcQuickThinkPoints, getStreakStatus, checkBadgeUnlock, getLeagueRankInfo }, checkAndUnlockBadges(), { createClient }, DOJO_CACHE, fs, getStudentDojoProgress(), handleDojoSeries(), handleDojoTopic() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (7): { createClient }, fs, http, MIME, path, server, supabase

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (12): Architecture, Backend (Server), Badge Criteria (Auto-Unlock), Database (Supabase), Dojo Académico — Deployment & Operations Guide, File Structure, Frontend (Client), Known Limitations & Future Work (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.40
Nodes (5): 1. Apply Supabase RLS Policies, 2. Seed Initial Data (Optional), 3. Deploy to Vercel, 4. Monitor (Post-Deploy), Deployment Checklist

## Knowledge Gaps
- **30 isolated node(s):** `fs`, `path`, `{ createClient }`, `{ calcExercisePoints, calcQuickThinkPoints, getStreakStatus, checkBadgeUnlock, getLeagueRankInfo }`, `supabase` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DojoClient` connect `Community 6` to `Community 8`, `Community 9`, `Community 7`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `Dojo Académico — Deployment & Operations Guide` connect `Community 4` to `Community 5`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `Deployment Checklist` connect `Community 5` to `Community 4`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `{ createClient }` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._