# Codex Prompt: Unified Joyo Kanji Cartridge (merge 6 grades into 1)

## Context

You are working in the `tmux-trainer` project. Read the full spec in `kanji-joyo-merge-spec.md`.

**Key reference files** (read before writing code):
- `kanji-joyo-merge-spec.md` — the specification
- `cartridge-authoring-guide.md` — engine contract
- `kanji-g1-cartridge-v2.js` through `kanji-g6-cartridge.js` — the 6 grade data files
- `ap-stats-cartridge.js` — reference for how domain filters work (the `dom` field on commands)
- `validate-cartridge.js` — validator: `node validate-cartridge.js <file>`
- `index.html` — engine: look at how `activeCartridge` and domain filters work

## Task Overview

Merge all 6 grade-level kanji cartridges into one unified deck. This is a 3-part task:

### Part 1: Modify grade files to export-only

Each of the 6 grade cartridge files currently self-registers via `window.TD_CARTRIDGES.push()`. Change each to export data without self-registering.

**For each file** (`kanji-g1-cartridge-v2.js` through `kanji-g6-cartridge.js`):

Find the bottom of the IIFE where it says:
```javascript
window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANJI_GN);
window.KANJI_GN_CARTRIDGE = KANJI_GN;
```

Replace with:
```javascript
window.KANJI_G1_DATA = KANJI_G1;  // (use appropriate variable name per file)
```

Keep the cartridge object and all its properties — just stop it from pushing to `TD_CARTRIDGES`.

Files and their export names:
- `kanji-g1-cartridge-v2.js` → `window.KANJI_G1_DATA`
- `kanji-g2-cartridge.js` → `window.KANJI_G2_DATA`
- `kanji-g3-cartridge.js` → `window.KANJI_G3_DATA`
- `kanji-g4-cartridge.js` → `window.KANJI_G4_DATA`
- `kanji-g5-cartridge.js` → `window.KANJI_G5_DATA`
- `kanji-g6-cartridge.js` → `window.KANJI_G6_DATA`

### Part 2: Create `kanji-joyo-cartridge.js`

New file (~200-300 lines) that merges all 6 grade data exports into one unified cartridge.

**What it must do:**

1. Read `window.KANJI_G1_DATA` through `window.KANJI_G6_DATA`
2. Skip any grade that didn't load (graceful degradation)
3. Concatenate all `.commands` arrays (dom fields already set per grade: g1-g6)
4. Merge all banks via `Object.assign`:
   - `variableBank` — keyed by command ID, no conflicts across grades
   - `applicationBank` — same
   - `relationshipBank` — same (all empty `{}` for kanji, but merge anyway)
   - `explanationGlossary` — concatenate arrays
5. Merge all `sharedPrereqNodes` via `Object.assign`
6. Compose `wireL1toL2`: call each grade's `wireL1toL2(dag)` in sequence
7. Merge all `domLabels` via `Object.assign`
8. Copy `generateQuestion` from the first available source (they're all identical)
9. Copy `validateBlank` from the first available source
10. Build `buildExplanationBank` from merged glossary
11. Copy `normalizeExplanationLookup` from the first available source

**Cartridge metadata:**
```javascript
{
  id: 'joyo-kanji',
  name: 'Joyo Kanji - All Grades',
  description: 'All 1,026 elementary school kanji (Grades 1-6)',
  icon: '漢',
  inputMode: 'quiz',
  prefixLabel: null,
  title: 'JOYO KANJI',
  subtitle: 'DEFENSE',
  startButton: '出陣',
  instructions: 'Identify kanji by <b>meaning</b>, <b>reading</b>, and <b>components</b>. Fill blanks in real vocabulary compounds. Wrong answers decompose into radical and reading sub-questions.',
  instructionsSub: 'Grades 1-6 - 1,026 kanji - Select grades on the PLAY tab',
  identifyPrompt: 'What is the meaning of this kanji?',
  variablePrompt: 'What does <span id="var-symbol" style="display:inline-block"></span> represent in this kanji?',
  applicationPrompt: 'Which kanji fits this context?',
}
```

**`generateQuestion` binding**: The function references `this.variableBank`, `this.applicationBank`, etc. Make sure the merged cartridge object has all these properties set before `generateQuestion` is called. The simplest way: copy the function body from one grade source, then set `KANJI_JOYO.generateQuestion = sourceFunc;` — it will read from `this` which is the merged cartridge.

**Registration:**
```javascript
window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANJI_JOYO);
```

### Part 3: Update `index.html` and `sw.js`

**`index.html`** — script tags should be:
```html
<script src="./kanji-g1-cartridge-v2.js"></script>
<script src="./kanji-g2-cartridge.js"></script>
<script src="./kanji-g3-cartridge.js"></script>
<script src="./kanji-g4-cartridge.js"></script>
<script src="./kanji-g5-cartridge.js"></script>
<script src="./kanji-g6-cartridge.js"></script>
<script src="./kanji-joyo-cartridge.js"></script>
```

The grade files load first (as data exports), then the merger file combines and registers.

**`sw.js`** — add `'./kanji-joyo-cartridge.js'` to `PRECACHE_URLS`. Keep grade files in precache. Bump cache version.

### Part 4: SRS Migration (in the merger file)

Add a one-time migration function that runs on cartridge load:

```javascript
function migratePerGradeSRS() {
  const oldKeys = [
    'td-srs-joyo-kanji-g1', 'td-srs-joyo-kanji-g2', 'td-srs-joyo-kanji-g3',
    'td-srs-joyo-kanji-g4', 'td-srs-joyo-kanji-g5', 'td-srs-joyo-kanji-g6'
  ];
  const unifiedKey = 'td-srs-joyo-kanji';
  let unified = {};
  try { unified = JSON.parse(localStorage.getItem(unifiedKey)) || {}; } catch(e) {}

  let migrated = false;
  for (const key of oldKeys) {
    try {
      const old = JSON.parse(localStorage.getItem(key));
      if (!old) continue;
      for (const [cardId, card] of Object.entries(old)) {
        if (!unified[cardId] || (card.rev || 0) > (unified[cardId].rev || 0)) {
          unified[cardId] = card;
        }
      }
      localStorage.removeItem(key);
      migrated = true;
    } catch(e) {}
  }
  if (migrated) {
    localStorage.setItem(unifiedKey, JSON.stringify(unified));
  }
}
```

Call `migratePerGradeSRS()` at the top of the IIFE, before building the cartridge.

## Validate

Run `node validate-cartridge.js kanji-joyo-cartridge.js` — all 12 rules must pass with 0 failures.

Expected:
- 1,026 commands
- ~2,000+ blanks
- Domains: g1, g2, g3, g4, g5, g6
- Tiers: core, regular

## Important Constraints

- Do NOT duplicate command data — the merger reads from grade file exports
- Do NOT modify `generateQuestion` logic — copy verbatim from a grade source
- Grade files keep their full structure (banks, DAG, wireL1toL2) — just stop self-registering
- The merged cartridge must pass the validator as a single cartridge
- Test that domain filtering works: if a student unchecks G5 and G6, only G1-G4 commands should appear
