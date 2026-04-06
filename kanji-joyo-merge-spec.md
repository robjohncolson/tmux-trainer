# Spec: Unified Joyo Kanji Cartridge (1,026 kanji)

## Goal
Merge all 6 grade-level kanji cartridges (G1-G6) into a single `kanji-joyo-cartridge.js` that registers as one deck. Students select which grades to drill via domain filters on the PLAY tab, just like AP Stats students select units. Cross-grade confusables surface naturally since all kanji share one command pool.

## Approach: Merger Cartridge

Keep the 6 grade files as data modules. A new merger file reads from all 6 and registers one unified cartridge.

### Step 1: Modify grade files to export data only (not self-register)

Each grade file currently ends with:
```javascript
window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANJI_GN);
window.KANJI_GN_CARTRIDGE = KANJI_GN;
```

Change to export-only:
```javascript
window.KANJI_G1_DATA = KANJI_G1;
// (remove TD_CARTRIDGES.push)
// (keep the named export for backward compat / deep links)
```

Files affected:
- `kanji-g1-cartridge-v2.js` → exports `window.KANJI_G1_DATA`
- `kanji-g2-cartridge.js` → exports `window.KANJI_G2_DATA`
- `kanji-g3-cartridge.js` → exports `window.KANJI_G3_DATA`
- `kanji-g4-cartridge.js` → exports `window.KANJI_G4_DATA`
- `kanji-g5-cartridge.js` → exports `window.KANJI_G5_DATA`
- `kanji-g6-cartridge.js` → exports `window.KANJI_G6_DATA`

### Step 2: Create `kanji-joyo-cartridge.js` (~200-300 lines)

This file loads after all 6 grade files and merges them into one cartridge.

```javascript
(function() {
  const GRADES = [
    { key: 'KANJI_G1_DATA', dom: 'g1' },
    { key: 'KANJI_G2_DATA', dom: 'g2' },
    { key: 'KANJI_G3_DATA', dom: 'g3' },
    { key: 'KANJI_G4_DATA', dom: 'g4' },
    { key: 'KANJI_G5_DATA', dom: 'g5' },
    { key: 'KANJI_G6_DATA', dom: 'g6' },
  ];

  // Collect data sources
  const sources = GRADES.map(g => window[g.key]).filter(Boolean);
  if (sources.length === 0) return; // no grade data loaded

  // Merge commands (dom already set per grade)
  const allCommands = sources.flatMap(s => s.commands);

  // Merge banks
  const mergedVariableBank = Object.assign({}, ...sources.map(s => s.variableBank || {}));
  const mergedApplicationBank = Object.assign({}, ...sources.map(s => s.applicationBank || {}));
  const mergedRelationshipBank = Object.assign({}, ...sources.map(s => s.relationshipBank || {}));
  const mergedGlossary = sources.flatMap(s => s.explanationGlossary || []);

  // Merge DAG nodes
  const mergedPrereqNodes = Object.assign({}, ...sources.map(s => s.sharedPrereqNodes || {}));

  // Compose wireL1toL2 — run each grade's wiring function in sequence
  function wireL1toL2(dag) {
    sources.forEach(s => { if (s.wireL1toL2) s.wireL1toL2(dag); });
  }

  // Merge DOM_LABELS
  const mergedDomLabels = Object.assign({}, ...sources.map(s => s.domLabels || {}));

  // Use the first available generateQuestion (they're all identical copies)
  const generateQuestion = sources[0].generateQuestion.bind({ /* bank refs */ });

  // Build unified cartridge object...
})();
```

### Cartridge Metadata
```javascript
{
  id: 'joyo-kanji',
  name: 'Joyo Kanji - All Grades',
  description: 'All 1,026 elementary school kanji (Grades 1-6)',
  icon: '漢',
  inputMode: 'quiz',
  title: 'JOYO KANJI',
  subtitle: 'DEFENSE',
  startButton: '出陣',
  identifyPrompt: 'What is the meaning of this kanji?',
  variablePrompt: 'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
  applicationPrompt: 'Which kanji fits this context?',
}
```

### Step 3: Update `index.html`

Load order (all blocking `<script>` tags):
```html
<!-- Kanji grade data modules (export only, do not self-register) -->
<script src="./kanji-g1-cartridge-v2.js"></script>
<script src="./kanji-g2-cartridge.js"></script>
<script src="./kanji-g3-cartridge.js"></script>
<script src="./kanji-g4-cartridge.js"></script>
<script src="./kanji-g5-cartridge.js"></script>
<script src="./kanji-g6-cartridge.js"></script>
<!-- Unified cartridge (merges all grades, registers once) -->
<script src="./kanji-joyo-cartridge.js"></script>
```

### Step 4: Update `sw.js`

- Add `./kanji-joyo-cartridge.js` to `PRECACHE_URLS`
- Grade files stay in precache (they're still loaded as data)
- Bump cache version

### Step 5: Domain Filter UX

The engine's existing domain filter system (used by AP Stats for unit selection) already works with `dom` fields on commands. The PLAY tab will show:

```
[ G1 ] [ G2 ] [ G3 ] [ G4 ] [ G5 ] [ G6 ]
```

Students toggle which grades to include in their session. A Grade 3 student would enable G1+G2+G3.

DOM_LABELS mapping:
```javascript
{
  'g1': ['Grade 1 (first-year elementary)'],
  'g2': ['Grade 2 (second-year elementary)'],
  'g3': ['Grade 3 (third-year elementary)'],
  'g4': ['Grade 4 (fourth-year elementary)'],
  'g5': ['Grade 5 (fifth-year elementary)'],
  'g6': ['Grade 6 (sixth-year elementary)'],
}
```

### Step 6: SRS / Persistence

- Single SRS key: `td-srs-joyo-kanji`
- Single high score: `td-highscore-joyo-kanji`
- Single run state: `td-run-state-joyo-kanji`
- Cloud sync scoped to cartridge ID `joyo-kanji`
- Leaderboard scoped to `joyo-kanji`

### Step 7: Migration

Old per-grade SRS keys (`td-srs-joyo-kanji-g1`, etc.) should be merged into the new unified key on first load. Migration logic:
1. On cartridge load, check for any `td-srs-joyo-kanji-g*` keys in localStorage
2. If found, merge card data into `td-srs-joyo-kanji` (per-card rev/timestamp conflict resolution)
3. Delete old keys after successful merge
4. This runs once — subsequent loads find only the unified key

### Step 8: Deep Links

- `#deck=joyo-kanji` — opens the unified deck
- Old deep links (`#deck=joyo-kanji-g1`, etc.) should redirect to the unified deck with the appropriate grade filter pre-selected

## Benefits of Consolidation

1. **Cross-grade SRS**: Cards from all grades share one spaced repetition pool. If a student struggles with 水 (G1) while learning 氵-radical kanji in G3, the SRS surfaces both.
2. **Cross-grade confusables**: 開 (G3) and 閉 (G6) naturally appear as distractors for each other.
3. **One leaderboard**: Students compete on total kanji mastery, not per-grade fragments.
4. **Simpler deck selector**: 2 entries (AP Stats + Joyo Kanji) instead of 8.
5. **Progressive difficulty**: Students start with G1 filter, add grades as they advance.

## Validation

`node validate-cartridge.js kanji-joyo-cartridge.js` must pass all 12 rules with 0 failures. Expected: 1,026 commands, ~2,000+ blanks, domains g1-g6, tiers core+regular.

## Deep Link
`https://tmux-trainer.vercel.app/#deck=joyo-kanji`
