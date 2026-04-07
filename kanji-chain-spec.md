# Kanji Chain Drill — Spec

## Philosophy

Strip kanji learning to its core: **recognition → reading → meaning**. No stroke order, no radical decomposition, no 5-type question generator. Each kanji is a 3-step chain. Get all 3 right → kill. Get one wrong → surge + retry. After individual kanji mastery, compounds drill the same chain.

## The 3-Step Chain

Every kanji enemy requires 3 sequential correct answers to die:

```
Step 0:  山  → [やま | かわ | もり]         kanji → furigana (3 MC)
Step 1:  やま → [yama | kawa | mori]        furigana → romaji (3 MC)
Step 2:  yama → [mountain | river | forest]  romaji → english (3 MC)
```

- **Correct** at any step → advance to next step, re-render question immediately
- **Correct at step 2** → enemy dies (full kill, score + death animation)
- **Wrong** at any step → enemy surges forward, stay on same step, distractors reshuffle
- **Miss cap**: 2 wrong on step 0, 3 wrong on steps 1-2 → forced breach

No decomposition. No hydra splits. The chain IS the decomposition — if a student can't read the kanji (step 0), they stay on that step until they get it or the enemy breaches. This is lean.

## Compound Phase

After individual kanji, compounds (jukugo) follow the same chain:

```
Step 0:  山川  → [やまかわ | ...]           compound → furigana (3 MC)
Step 1:  やまかわ → [yamakawa | ...]        furigana → romaji (3 MC)
Step 2:  yamakawa → [mountain river | ...]   romaji → english (3 MC)
```

### Compound gating

Compounds have `requires: ['k-5c71', 'k-5ddd']` — the component kanji IDs. A compound only enters the pick pool when ALL component kanji have `pKnown >= 0.5`. This means students naturally drill individual kanji first, compounds appear as mastery grows.

### Compound sourcing

Each grade file includes a curated compound list harvested from existing `hint` fields + standard jukugo lists. Target: ~1.5 compounds per kanji (so G1 = ~120 compounds, G2 = ~240, etc.).

## Data Format

### Source arrays (per-grade file)

```javascript
// Individual kanji — one row per kanji
const KANJI = [
  // [kanji, primaryReading, romaji, english, tier, distractors]
  ['一', 'いち', 'ichi', 'one',       'core', { f: ['に','さん'],   r: ['ni','san'],     e: ['two','three'] }],
  ['二', 'に',   'ni',   'two',       'core', { f: ['いち','さん'], r: ['ichi','san'],   e: ['one','three'] }],
  ['山', 'やま', 'yama', 'mountain',  'core', { f: ['かわ','もり'], r: ['kawa','mori'],  e: ['river','forest'] }],
  // ...
];

// Compounds — one row per jukugo
const COMPOUNDS = [
  // [compound, reading, romaji, english, componentIds, tier, distractors]
  ['一日', 'いちにち', 'ichinichi', 'one day', ['k-4e00','k-65e5'], 'regular',
    { f: ['ふつか','みっか'], r: ['futsuka','mikka'], e: ['two days','three days'] }],
  // ...
];
```

### Distractor strategy

- **Furigana distractors** (`f`): same-grade readings, preferring visually/phonetically confusable
- **Romaji distractors** (`r`): match the furigana distractors (consistent chain)
- **English distractors** (`e`): same-grade meanings, preferring semantic neighbors

If distractors are omitted, the builder auto-selects from same-grade pool (random, no duplicates). Authored distractors always preferred.

### Built command shape

The cartridge builder expands source rows into engine commands:

```javascript
{
  id: 'k-5c71',              // Unicode codepoint
  action: 'mountain',         // English meaning (used for labels, scoring)
  tier: 'core',
  dom: 'g1',                  // grade domain for filtering
  latex: '山',                // display character
  chain: [
    {
      type: 'kanji-to-furigana',
      prompt: '山',
      correct: 'やま',
      wrong: ['かわ', 'もり']
    },
    {
      type: 'furigana-to-romaji',
      prompt: 'やま',
      correct: 'yama',
      wrong: ['kawa', 'mori']
    },
    {
      type: 'romaji-to-english',
      prompt: 'yama',
      correct: 'mountain',
      wrong: ['river', 'forest']
    }
  ],
  // For compounds only:
  requires: ['k-5c71', 'k-5ddd']  // component kanji IDs (omitted for individual kanji)
}
```

### No longer needed

These fields from the current cartridge are **deleted**:

- `blanks` — replaced by chain
- `subconcepts` — replaced by chain decomposition
- `hint` — the chain teaches the reading/meaning directly
- `explain` — chain steps are self-explanatory
- `VARIABLE_BANK` — not applicable
- `APPLICATION_BANK` — not applicable
- `RELATIONSHIP_BANK` — not applicable
- `EXPLANATION_GLOSSARY` — not applicable
- `AUTO_BLANK_SPECS` — not applicable
- `SHARED_PREREQ_NODES` — no DAG
- `wireL1toL2()` — no DAG wiring

The entire pedagogical surface is the 3-step chain. That's the point.

## Engine Changes

### 1. Chain question support in `setInputPanelContent()`

When the active enemy has a `chain` property:

- Read `enemy.chainStep` (default 0)
- Render the chain step as a 3-option MC question
- Prompt displayed large and centered (kanji in KaTeX for step 0, plain text for steps 1-2)
- 3 answer buttons: correct + 2 wrong, shuffled
- Step indicator: `● ○ ○` / `● ● ○` / `● ● ●` dots showing chain progress

### 2. Chain answer handling

New `handleChainChoice(choiceIdx)`:

- If correct:
  - `enemy.chainStep++`
  - If `chainStep >= chain.length` → `handleHit(enemy)` (kill)
  - Else → re-render question for next step, brief green flash
  - SRS: `bktUpdate()` with `correct:true` weighted by step (step 0 = 1.0, step 1 = 0.7, step 2 = 0.5)
- If wrong:
  - `handleMiss(enemy)` with existing surge/speed penalty
  - Reshuffle wrong answers (keep correct, pick 2 new wrongs from grade pool)
  - SRS: `bktUpdate()` with `correct:false` weighted by step
  - Stay on same chainStep

### 3. Chain enemy state

Add to enemy object:
```javascript
enemy.chainStep = 0;          // current step in the chain (0, 1, 2)
enemy.chainMisses = [0, 0, 0]; // miss count per step (for miss cap)
```

`addEnemy()` initializes these from the command's `chain` property.

### 4. Miss cap per step

- Step 0 (kanji→furigana): 2 misses → breach
- Step 1 (furigana→romaji): 3 misses → breach  
- Step 2 (romaji→english): 3 misses → breach

### 5. What stays the same

- Tower defense movement, path, spawning
- Wave system
- SRS/BKT per-card tracking
- Score, lives, streak
- Death animation, particles, fractal trees, Mandelbrot scar
- Music/audio system
- Camera, labels, reticle
- Cloud sync, leaderboard
- Service worker
- Kana cartridge (unchanged, stays vocabulary-driven)
- AP Stats cartridge (unchanged)

### 6. What gets deleted from kanji path

- `generateQuestion()` in kanji cartridges (replaced by chain reader)
- `validateBlank()` in kanji cartridges (no blanks)
- All bank constants (VARIABLE, APPLICATION, RELATIONSHIP, GLOSSARY)
- All DAG/prereq infrastructure for kanji (SHARED_PREREQ_NODES, wireL1toL2)
- Subconcept rendering in `setInputPanelContent()` when chain is active

The engine detects chain vs non-chain commands: if `activeCartridge.commands[i].chain` exists, use chain flow. Otherwise use existing question generator. This means AP Stats keeps working with zero changes.

## Display

### Step 0: Kanji → Furigana

```
┌─────────────────────────┐
│         山              │  ← large kanji (KaTeX)
│                         │
│   ● ○ ○   reading       │  ← step indicator + label
│                         │
│  [やま]  [かわ]  [もり]  │  ← 3 MC buttons (hiragana)
└─────────────────────────┘
```

### Step 1: Furigana → Romaji

```
┌─────────────────────────┐
│         やま             │  ← hiragana prompt (large)
│                         │
│   ● ● ○   romaji        │  ← step indicator
│                         │
│  [yama]  [kawa]  [mori]  │  ← 3 MC buttons (romaji)
└─────────────────────────┘
```

### Step 2: Romaji → English

```
┌─────────────────────────┐
│         yama             │  ← romaji prompt (large)
│                         │
│   ● ● ●   meaning       │  ← step indicator
│                         │
│  [mountain] [river] [forest] │  ← 3 MC buttons (english)
└─────────────────────────┘
```

### Step labels

| Step | Indicator | Label |
|------|-----------|-------|
| 0 | `● ○ ○` | reading |
| 1 | `● ● ○` | romaji |
| 2 | `● ● ●` | meaning |

Filled dots are amber. Empty dots are dim grey. Label describes what the student is identifying.

## SRS Integration

- One SRS card per kanji/compound (keyed by command ID)
- `bktUpdate()` called on every answer (correct or wrong)
- Weight by step: step 0 carries full weight (reading recognition is hardest), steps 1-2 carry reduced weight (reinforcement)
- `pKnown` reflects overall mastery of the full chain
- `pickCommands()` works as-is — low pKnown kanji get picked more often

## Compound Gating in pickCommands()

```javascript
// In pickCommands(), skip compounds whose prereqs aren't ready
if (cmd.requires) {
  const ready = cmd.requires.every(id => {
    const card = srs[id];
    return card && card.pKnown >= 0.5;
  });
  if (!ready) continue; // skip this compound for now
}
```

## File Changes

| File | Change |
|------|--------|
| `kanji-g1-cartridge-v2.js` | Rewrite: KANJI + COMPOUNDS source arrays, chain builder, no banks/DAG |
| `kanji-g2-cartridge.js` | Same rewrite |
| `kanji-g3-cartridge.js` | Same rewrite |
| `kanji-g4-cartridge.js` | Same rewrite |
| `kanji-g5-cartridge.js` | Same rewrite |
| `kanji-g6-cartridge.js` | Same rewrite |
| `kanji-joyo-cartridge.js` | Simplify: merge chains, no bank merging, no DAG wiring |
| `kana-cartridge.js` | **Unchanged** |
| `index.html` | Add chain question rendering + handleChainChoice + chain enemy state |
| `sw.js` | Cache bump only |
| `ap-stats-cartridge.js` | **Unchanged** |

### Estimated line counts (per grade file)

- Source data: ~5 lines per kanji + ~8 lines per compound
- Builder function: ~40 lines
- Registration: ~20 lines
- G1 (80 kanji + ~120 compounds): ~1,500 lines
- G2 (160 + ~240): ~3,000 lines (consider splitting compounds to separate file)

### Engine changes (index.html)

- `setInputPanelContent()`: ~40 new lines for chain rendering
- `handleChainChoice()`: ~35 new lines
- Enemy init: ~5 lines (chainStep, chainMisses)
- Miss cap check: ~5 lines
- Compound gating in `pickCommands()`: ~8 lines
- Total: ~93 lines added, ~0 lines removed from engine (chain is additive, old path preserved)

## Migration

- Old SRS data (`td-srs-joyo-kanji`) carries over — command IDs stay the same (`k-XXXX`)
- Old `pKnown`, `mastery`, `rev`, `lastUpdated` remain valid
- `dagState` on old cards is silently ignored (no DAG in new system)
- `subPKnown` on old cards is silently ignored
- Compound commands are new IDs (`kc-XXXX-YYYY`) — start fresh at pKnown 0.1

## Validation Checklist

1. Every kanji has exactly 3 chain steps
2. Every compound has exactly 3 chain steps + `requires` array
3. Every `requires` ID exists as a kanji command ID
4. No duplicate IDs across kanji + compounds
5. Every chain step has exactly 2 wrong answers
6. Wrong answers don't duplicate the correct answer
7. Furigana wrongs are valid hiragana strings
8. Romaji wrongs are valid romanizations
9. English wrongs are actual English words/phrases
10. All component kanji IDs in compounds resolve to real kanji commands

## Not In Scope

- Stroke order (explicitly removed)
- Radical decomposition DAG
- Variable/application/relationship question types for kanji
- Explanation panels for kanji
- Animation videos for kanji
- Auto-blank generation for kanji
- `wireL1toL2` for kanji

These remain fully operational for AP Stats and any future non-chain cartridge.
