# Spec: Cartridge Module Extraction — Separate Pedagogy from Game Engine

## Problem Statement

`index.html` is a ~7200-line single file where ~1500 lines of AP Stats pedagogy data (76 commands, 5 question banks, DAG nodes, validation rules) are tangled into the game engine. This makes it impossible to:
- Add a second course (Algebra 2, etc.) without duplicating the engine
- Edit deck content without risk of breaking game logic
- Have non-engineers (teachers) review/edit question content
- Test pedagogy independently from rendering

## Goal

Extract all AP Stats deck data into a standalone `ap-stats-cartridge.js` file that the game engine loads via `<script>` tag. The game engine stays in `index.html` and talks to the cartridge through a defined API contract.

## What Goes Into the Cartridge

### Data constants (~1200 lines)

| Constant | Lines | Description |
|----------|-------|-------------|
| `commands` array | 1201-1884 | 76 formula cards with id, action, tier, dom, hint, explain, latex, blanks, subconcepts |
| `VARIABLE_BANK` | 1999-2076 | Symbol→description maps per command for variable questions |
| `APPLICATION_BANK` | 2079-2152 | Real-world scenarios with confusionSets for application questions |
| `RELATIONSHIP_BANK` | 2155-2190 | Input/output/direction entries for relationship questions |
| `EXPLANATION_GLOSSARY` | 2335-2531 | 70 notation entries with 3-sentence explanations |
| `AUTO_BLANK_SPECS` | 2192-2258 | Regex/literal match rules for auto-generating fill-blank questions |
| `DOM_LABELS` | 3121-3130 | Domain→curriculum unit label mapping |
| `SHARED_PREREQ_NODES` | 3167-3374 | 75 hand-authored L2-L5 DAG prerequisite nodes |

### Functions that are deck-specific (~100 lines)

| Function | Lines | Why cartridge-specific |
|----------|-------|----------------------|
| `wireL1toL2()` | 3377-3442 | 52 regex rules matching AP Stats terminology to L2+ nodes |
| `generateQuestion(cmd, allCommands)` | 1887-1978 | Question type weights, bank lookups, distractor selection |
| `validateBlank(input, answer)` | 1984-1996 | AP Stats notation aliases (σ→sigma, p̂→phat, etc.) |
| `buildExplanationBank(cmds)` | 2535-2556 | Builds lookup from commands + glossary |

### Cartridge metadata

```javascript
{
  id: 'ap-stats-formulas',
  name: 'AP Statistics',
  description: 'Formula defense for the 2026 AP Statistics exam',
  icon: '📊',
  title: 'AP STATS',
  subtitle: 'FORMULA DEFENSE',
  startButton: 'DEPLOY',
  instructions: '...',  // the instruction text currently in the cartridge
  inputMode: 'quiz',
  examDate: '2026-05-07',
}
```

## What Stays in the Game Engine (`index.html`)

- Three.js rendering, scene, camera, particles, trees, ferns, stars, Mandelbrot terrain shader
- SRS/BKT system (`saveSRS`, `loadSRS`, `sanitizeSrsCard`, `bktUpdate`, etc.)
- DAG framework functions: `buildDAGFromSubconcepts()`, `installSharedNodes()`, `validateDAG()`, `canNodeSplit()`, `selectWeakestPrereqs()`, `spawnHydraChildren()`
- Input panel rendering, quiz flow, keyboard/touch handlers
- Music editor, audio engine
- Cloud sync, leaderboard
- Run state, checkpointing
- All screen management (title, pause, end, wave clear)
- The `COMMANDS` global (set from `activeCartridge.commands` at init)
- The `PREREQ_DAG` global (populated at init from cartridge data)

## Cartridge API Contract

The game engine expects a cartridge object with this shape:

```javascript
window.AP_STATS_CARTRIDGE = {
  // Metadata
  id: 'ap-stats-formulas',
  name: 'AP Statistics',
  // ... other metadata fields

  // Data
  commands: [ /* 76 command objects */ ],
  variableBank: { /* keyed by command id */ },
  applicationBank: { /* keyed by command id */ },
  relationshipBank: { /* keyed by command id */ },
  explanationGlossary: [ /* notation entries */ ],
  autoBlankSpecs: [ /* match rules */ ],
  domLabels: { /* domain→label mapping */ },
  sharedPrereqNodes: { /* L2-L5 DAG nodes */ },

  // Deck-specific functions
  wireL1toL2(PREREQ_DAG) { /* regex wiring rules */ },
  generateQuestion(cmd, allCommands, difficulty) { /* returns question object */ },
  validateBlank(input, answer) { /* returns boolean */ },
  buildExplanationBank(commands) { /* returns {byId, byLabel} */ },

  // Display
  formatPrompt(cmd) { return cmd.action; },
  formatAnswer(cmd) { return cmd.latex ? '(formula)' : cmd.action; },
};
```

## File Structure

```
tmux-trainer/
  index.html              — game engine (~5700 lines after extraction)
  ap-stats-cartridge.js   — AP Stats deck data + methods (~1500 lines)
  sw.js                   — service worker (add cartridge to cache)
```

## Implementation Plan

### Step 1: Create `ap-stats-cartridge.js`

1. Create the file with an IIFE or global assignment: `window.AP_STATS_CARTRIDGE = { ... }`
2. Move all data constants listed above into it
3. Move `wireL1toL2`, `generateQuestion`, `validateBlank`, `buildExplanationBank` into it
4. The `generateQuestion` function currently references `VARIABLE_BANK`, `APPLICATION_BANK`, `RELATIONSHIP_BANK` as globals — change these to reference `this.variableBank` etc. (or pass them as closure variables within the cartridge module)

### Step 2: Update `index.html`

1. Add `<script src="ap-stats-cartridge.js"></script>` before the main `<script>` block
2. Replace the `activeCartridge` object literal with:
   ```javascript
   const activeCartridge = window.AP_STATS_CARTRIDGE;
   ```
3. Remove all moved data constants and functions
4. Update references:
   - `VARIABLE_BANK[cmd.id]` → accessed via cartridge (either passed into generateQuestion or kept as a property)
   - `APPLICATION_BANK`, `RELATIONSHIP_BANK` → same
   - `EXPLANATION_GLOSSARY` → via cartridge
   - `AUTO_BLANK_SPECS` → via cartridge
   - `DOM_LABELS` → via cartridge
   - `SHARED_PREREQ_NODES` → via cartridge's `sharedPrereqNodes`
5. Update initialization sequence:
   ```javascript
   const activeCartridge = window.AP_STATS_CARTRIDGE;
   COMMANDS = activeCartridge.commands;
   buildDAGFromSubconcepts(COMMANDS);
   Object.assign(PREREQ_DAG, activeCartridge.sharedPrereqNodes);
   activeCartridge.wireL1toL2(PREREQ_DAG);
   validateDAG();
   EXPLANATION_BANK = activeCartridge.buildExplanationBank(COMMANDS);
   ```

### Step 3: Update `sw.js`

Add `'/ap-stats-cartridge.js'` to the shell cache URLs so it works offline.

### Step 4: Verify

- Parse check on both files
- Command count: 76
- All question types generate correctly
- DAG validation passes (0 cycles, 0 dangling refs)
- Blank validation works (including the tricky notation aliases)
- Explanation bank builds correctly
- Service worker caches the cartridge file

## Blast Radius

- `index.html`: ~1500 lines removed, ~20 lines of glue code added
- `ap-stats-cartridge.js`: new file, ~1500 lines
- `sw.js`: 1 URL added to cache list
- **No changes to**: game logic, rendering, SRS/BKT, audio, UI, cloud sync, run state
- **Risk**: any global reference to the moved constants that we miss will throw a ReferenceError at runtime. The parse check catches syntax but not runtime errors. Manual grep for all moved constant names is essential.

## Migration Safety

- The cartridge JS loads synchronously via `<script>` tag before the main script — all globals are available when the engine initializes
- If the cartridge file fails to load (CDN issue, etc.), `window.AP_STATS_CARTRIDGE` will be undefined — the init code should check and show an error instead of crashing
- Old service worker caches won't have the cartridge file — the SW cache version should be bumped

## Future Cartridges

Once this extraction is done, adding a new course (e.g., Algebra 2) means:
1. Create `algebra2-cartridge.js` with the same API shape
2. Add a cartridge selector or config param
3. The game engine works unchanged — different commands, different DAG, same rendering

## Constants to grep for when verifying no stale references

After extraction, grep `index.html` for these — none should appear:
- `VARIABLE_BANK` (except via `activeCartridge.variableBank`)
- `APPLICATION_BANK`
- `RELATIONSHIP_BANK`
- `EXPLANATION_GLOSSARY`
- `AUTO_BLANK_SPECS`
- `SHARED_PREREQ_NODES`
- `DOM_LABELS` (except the cartridge reference assignment)
- `wireL1toL2` (except the init call via cartridge)
