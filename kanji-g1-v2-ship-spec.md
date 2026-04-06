# Kanji Grade 1 Cartridge v2 — Ship-Ready Spec

## Goal

Replace `kanji-g1-cartridge.js` (v1) with `kanji-g1-cartridge-v2.js` (v2) as the registered Grade 1 kanji cartridge. Fix known bugs, complete missing banks, and ensure all engine-supported question types fire correctly.

## Scope

- **80 Grade 1 kanji only** (one through six)
- Single domain: `g1` (no multi-level progression within Grade 1)
- Tiers: `core` for high-frequency kanji, `regular` for the rest
- No external data pipeline — hand-authored content already in v2
- No stroke-order UI — engine doesn't support drawing modality

## Current State

| Item | Status |
|------|--------|
| `kanji-g1-cartridge-v2.js` | Exists, 80 commands, compound-completion blanks, radical DAG |
| Registration in `index.html` | **NOT loaded** — v1 is loaded instead (line 336) |
| `VARIABLE_BANK` | Needs audit — may be incomplete |
| `APPLICATION_BANK` | **Missing or incomplete** — needed for application-type questions |
| `EXPLANATION_GLOSSARY` | **Missing or incomplete** — needed for explainer panel |
| Subconcept bugs | Known: duplicate `wrong` answers (e.g., line 32: `wrong:['2','2']`) |
| Distractor diversity | Narrow pools (e.g., `['one','two','three']` for every blank of one) |

## Command Schema (per kanji)

Each of the 80 kanji is one command object:

| Field | Content | Notes |
|-------|---------|-------|
| `id` | `k-{hex codepoint}` (e.g., `k-4e00`) | Stable SRS key; already correct in v2 |
| `action` | Primary English gloss (e.g., "one", "rain") | Keep concise |
| `tier` | `core` or `regular` | Review: currently all `core`; split ~30 high-frequency as `core`, rest as `regular` |
| `dom` | `g1` | Rename from `l1` for clarity (Grade 1, not Level 1) |
| `hint` | On/kun readings + example word | Already good in v2 |
| `explain` | Mnemonic or component note | Already good in v2 |
| `latex` | Single kanji character | Already correct |
| `blanks[2-3]` | Compound-completion with `\boxed{\,?\,}` | Fix: diversify distractor pools across blanks |
| `subconcepts[3]` | Radical / reading / meaning questions | Fix: no duplicate wrong answers |

### Tier Assignment Guidelines

- **`core`**: The ~30 most common kanji a learner encounters first (numbers, days, basic nouns: one-ten, day, month, person, big, small, up, down, etc.)
- **`regular`**: Remaining ~50 kanji (village, bamboo, insect, thread, etc.)

## Question Types

The `generateQuestion(cmd, allCommands)` function must support 4 of the 5 engine types:

| Type | Kanji adaptation | Weight (learn) | Weight (practice) | Weight (challenge) |
|------|-----------------|----------------|-------------------|-------------------|
| **identify** | Show kanji glyph -> pick meaning from 4 options | 40% | 15% | 10% |
| **fillblank** | Compound with box -> pick correct kanji from 3 options | 25% | 45% | 40% |
| **variable** | Show kanji -> "What does [component] represent?" | 15% | 15% | 15% |
| **application** | Show context sentence -> pick which kanji fits | 10% | 15% | 25% |
| **relationship** | **Skip** (0% weight, not applicable to kanji) | 0% | 0% | 0% |

Weight renormalization: if a command is missing a bank entry (e.g., no APPLICATION_BANK), redistribute that weight to the remaining types proportionally.

### Distractor Selection Rules

- **identify**: Pick 3 other kanji meanings from the same domain (`g1`). Prefer confusable-set members when available.
- **fillblank**: Already defined in `blanks[].choices`. Diversify so not every blank for the same kanji uses the same 3 distractors.
- **variable**: Pick 3 other component descriptions from VARIABLE_BANK entries of other commands.
- **application**: Use `confusionSet` IDs from APPLICATION_BANK; fall back to random same-domain commands.

## Banks Required

### VARIABLE_BANK (per kanji, 2-3 entries)

Each entry is `{s: 'component', d: 'description'}`.

Example for k-5b66 (study/learning):
```javascript
'k-5b66': [
  {s: 'child radical (bottom)', d: 'child radical (bottom)'},
  {s: 'roof cover (middle)', d: 'cover/roof component'},
  {s: 'three dots (top)', d: 'simplified hand/plant top'}
]
```

Source: decompose each Grade 1 kanji into 2-3 visible components/radicals. For simple kanji (one, two, three), use stroke-based descriptions or the kanji's role as a component in other kanji.

### APPLICATION_BANK (per kanji, 1 entry minimum)

Each entry is `{scenario: '...', confusionSet: ['id1','id2','id3']}`.

Example for k-5b66 (study/learning):
```javascript
'k-5b66': [{
  scenario: 'A child goes to a building every morning to read books and listen to a teacher.',
  confusionSet: ['k-6821', 'k-5b57', 'k-5148']  // school, character, enter
}]
```

Rules:
- Scenario must NOT contain the English gloss or any direct translation of the kanji
- confusionSet should contain 3 IDs of visually or semantically similar Grade 1 kanji
- Keep scenarios to 1-2 sentences, age-appropriate, concrete

### EXPLANATION_GLOSSARY

One entry per unique fill-blank answer token. Since fill-blank answers are kanji characters, each of the 80 kanji needs a glossary entry.

```javascript
{
  keys: ['study/learning kanji'],  // or the kanji character itself if the engine indexes by answer token
  title: 'study/learning',
  lines: [
    'Meaning: study, learning, scholarship',
    'On: GAKU | Kun: mana(bu)',
    'Example: school (GAKKOU), student (GAKUSEI)'
  ]
}
```

### RELATIONSHIP_BANK

Empty: `const RELATIONSHIP_BANK = {};`

### AUTO_BLANK_SPECS

Empty: `const AUTO_BLANK_SPECS = [];` (blanks are hand-authored per command)

### DOM_LABELS

```javascript
const DOM_LABELS = {
  'g1': ['Grade 1 (first-year elementary)']
};
```

## Confusable Sets

Define these explicitly for distractor selection and interleaving:

| Group | Kanji | Confusion type |
|-------|-------|---------------|
| Number strokes | one, two, three | Visual (stroke count) |
| Direction pair | right, left | Semantic mirror |
| Nature/weather | rain, cloud, electric | Semantic + shared radical |
| Tree composition | tree, grove, forest | Visual (1/2/3 tree) |
| Person variants | person, big, heaven | Visual similarity |
| Fire/water | fire, water | Semantic contrast |
| Vertical pair | up, down | Semantic mirror |
| Celestial | sun/day, moon/month | Semantic + visual |
| Body openings | mouth, eye, ear | Body-part cluster |
| Hand/foot | hand, foot | Body-part pair |
| Male/female | man/male, woman/female | Semantic pair |
| Ground | soil/earth, field/rice paddy, village | Semantic cluster |

These groups inform:
1. `APPLICATION_BANK.confusionSet` — prefer confusable-group members
2. `generateQuestion()` identify distractors — prefer confusable-group members
3. Blank distractor diversity — pull from confusable group instead of repeating the same 3

## Prerequisite DAG

Keep v2's existing multi-level structure:

- **L1** (auto-generated): 3 subconcepts per kanji (240 total L1 nodes)
- **L2**: ~18 radical nodes (radical-mouth, radical-sun, radical-tree, radical-person, radical-earth, radical-water, radical-fire, radical-strength, radical-hand, radical-eye, radical-shell, radical-rain, radical-thread, radical-grass, radical-bamboo, radical-insect, radical-horse, radical-gate)
- **L3**: Conceptual groupings (body-parts, nature-elements, direction-concepts, number-concepts, animal-concepts)
- **L4**: Reading foundations (onyomi-kunyomi, compound-reading-rules, hiragana-reading)
- **L5**: Leaf node (stroke-basics)

### wireL1toL2 Rules

Pattern-match subconcept question text to L2+ shared nodes. Every L1 node must wire to at least 1 L2+ node. Audit and fix any unwired nodes.

## Bug Fixes Required

### 1. Duplicate wrong answers in subconcepts
Scan all 80 commands. Every `subconcepts[].wrong` array must have 2 **distinct** values. Known example: k-4e00 line 32 has `wrong:['2','2']`.

### 2. Distractor diversity in blanks
For each command, the 2-3 blanks should not all use the identical `choices` array. Pull distractors from the confusable set or vary by compound context.

### 3. Domain tag rename
Change `dom: 'l1'` to `dom: 'g1'` across all 80 commands and update DOM_LABELS accordingly.

## Registration

### In `index.html`:
1. **Replace** `<script src="./kanji-g1-cartridge.js"></script>` with `<script src="./kanji-g1-cartridge-v2.js"></script>`
2. Ensure v2's IIFE does:
   - `window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];`
   - `window.TD_CARTRIDGES.push(KANJI_G1);`
   - `window.KANJI_G1_CARTRIDGE = KANJI_G1;`

## Validation Checklist (pre-ship)

Run `node validate-cartridge.js kanji-g1-cartridge-v2.js` and confirm:

- [ ] All 80 commands have required fields (id, action, tier, dom, hint, explain, latex, blanks, subconcepts)
- [ ] All command IDs are unique
- [ ] All subconcepts have exactly 3 entries with q/correct/wrong[2], no duplicate wrongs
- [ ] `validateBlank(blank.answer, blank.choices[0]) === true` for all blanks
- [ ] No duplicate choices after normalization in any blank
- [ ] VARIABLE_BANK has 2-3 entries for each of 80 commands
- [ ] APPLICATION_BANK has 1+ entry for each of 80 commands
- [ ] EXPLANATION_GLOSSARY covers every unique fill-blank answer token
- [ ] DOM_LABELS covers `g1`
- [ ] DAG: 0 dangling prereqs, 0 cycles, 0 self-references
- [ ] wireL1toL2: 0 unwired L1 nodes
- [ ] generateQuestion() returns valid shapes for identify, fillblank, variable, application types

## What NOT to Build

- Grades 2-6 cartridges (defer until Grade 1 validated with real usage)
- KANJIDIC2/JMdict/KanjiVG enrichment pipeline (hand-authoring works at 80-kanji scale)
- Stroke order animation or tracing UI (engine doesn't support it)
- Custom SRS tuning (engine owns this)
- Mastery gating / progression state (engine owns difficulty modes)
- Localization / i18n (single locale en-US with ja content)
- Relationship bank content (not applicable to kanji)
