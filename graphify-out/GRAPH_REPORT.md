# Graph Report - Academic_reading_and_writing  (2026-07-28)

## Corpus Check
- 100 files · ~217,776 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 36 nodes · 49 edges · 6 communities (4 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `418d3d3b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]

## God Nodes (most connected - your core abstractions)
1. `loadDojoContent()` - 6 edges
2. `calcExercisePoints()` - 5 edges
3. `handleSubmitExercise()` - 4 edges
4. `getStudentDojoProgress()` - 3 edges
5. `handleDojoSeries()` - 3 edges
6. `handleSubmitQuickThink()` - 3 edges
7. `calcQuickThinkPoints()` - 3 edges
8. `handleDojoTopic()` - 2 edges
9. `handleQuickThinkSets()` - 2 edges
10. `getStreakMultiplier()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `handleSubmitExercise()` --calls--> `calcExercisePoints()`  [EXTRACTED]
  api/gamification.js → lib/scoring-engine.js
- `handleSubmitQuickThink()` --calls--> `calcQuickThinkPoints()`  [EXTRACTED]
  api/gamification.js → lib/scoring-engine.js

## Import Cycles
- None detected.

## Communities (6 total, 2 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.28
Nodes (6): calcExercisePoints(), checkBadgeUnlock(), getLeagueRankInfo(), getStreakMultiplier(), getStreakStatus(), getTimeMultiplier()

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (6): { calcExercisePoints, calcQuickThinkPoints, getStreakStatus, checkBadgeUnlock, getLeagueRankInfo }, { createClient }, DOJO_CACHE, fs, path, supabase

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (7): { createClient }, fs, http, MIME, path, server, supabase

### Community 4 - "Community 4"
Cohesion: 0.40
Nodes (6): getStudentDojoProgress(), handleDojoSeries(), handleDojoTopic(), handleQuickThinkSets(), handleSubmitExercise(), loadDojoContent()

## Knowledge Gaps
- **15 isolated node(s):** `fs`, `path`, `{ createClient }`, `{ calcExercisePoints, calcQuickThinkPoints, getStreakStatus, checkBadgeUnlock, getLeagueRankInfo }`, `supabase` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `calcExercisePoints()` connect `Community 1` to `Community 2`, `Community 4`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `loadDojoContent()` connect `Community 4` to `Community 2`, `Community 5`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `handleSubmitExercise()` connect `Community 4` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `{ createClient }` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._