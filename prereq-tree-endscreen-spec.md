# Visual Prereq Tree on End Screen — Spec

## Problem
After a run, students see a mastery bar and "focus next session" list, but no visualization of their knowledge decomposition. The DAG system tracks which prereq nodes they encountered and their pKnown — this data should be visible.

## Solution
Add a collapsible "KNOWLEDGE MAP" section to the end screen showing a tree of encountered DAG nodes per weak command.

### Layout
For each weak command (up to 4, same as existing "FOCUS NEXT SESSION"):
```
[Command Name] ★★☆ (mastery stars)
  ├─ L1: Subconcept A          ●●●○○ (pKnown dots)
  │   └─ L2: Builder Concept   ●●○○○
  │       └─ L3: Foundation     ●○○○○
  └─ L1: Subconcept B          ●●●●○
```

### Data source
- `G.srs[cmdId].dagState` — encountered nodes with pKnown
- `PREREQ_DAG[nodeId]` — node metadata (question text, level, prereqs)
- Only show nodes with `encounters > 0` (actually visited during the run)

### Visual encoding
- pKnown as colored dots: 5 dots, filled proportional to pKnown
  - 0-0.2: red (#ff4422), 0.2-0.5: orange (#ff8c00), 0.5-0.8: yellow (#ffcc00), 0.8+: green (#44ff88)
- Node depth shown by indentation (CSS padding-left)
- Node names truncated to ~40 chars on mobile

### Implementation
- Build tree HTML in `showEndScreen()` after the "FOCUS NEXT SESSION" section
- Walk each weak command's `dagState`, filter to `encounters > 0`
- Sort by level (L1 first), then by pKnown ascending (weakest first)
- Render as nested divs with left-border tree lines
- Collapsible: starts expanded, click to collapse

## Blast Radius
- `showEndScreen()` only — additive HTML generation
- No changes to game logic, DAG, BKT, or SRS
