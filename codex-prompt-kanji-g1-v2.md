# Codex Prompt: Kanji G1 Cartridge v2 — Ship-Ready Implementation

## Context

You are working in the `tmux-trainer` project — a browser-based game engine that loads "cartridges" (self-contained JS files) to teach different subjects. The engine handles SRS, rendering, scoring, and difficulty modes. Cartridges provide content (commands), question generation, and supplementary data banks.

**Spec file**: Read `kanji-g1-v2-ship-spec.md` in this directory for the full specification.

**Key reference files** (read these before writing any code):
- `cartridge-authoring-guide.md` — the normative engine contract (command schema, bank formats, DAG rules, validation checklist)
- `kanji-g1-cartridge-v2.js` — the existing file you are modifying (80 Grade 1 kanji, ~1620 lines)
- `ap-stats-cartridge.js` — reference implementation showing all 5 question types, weight renormalization, and complete banks
- `dummy-cartridge.js` — minimal template showing registration pattern
- `validate-cartridge.js` — validator tool; run with `node validate-cartridge.js kanji-g1-cartridge-v2.js` to check your work
- `index.html` — line ~336 loads cartridges; you'll swap v1 for v2 here

## Task Overview

Fix bugs, complete missing banks, and register the v2 kanji cartridge. Work in this order:

### Phase 1: Bug Fixes (in `kanji-g1-cartridge-v2.js`)

1. **Fix duplicate wrong answers in subconcepts.** Scan all 80 commands. Every `subconcepts[N].wrong` must be an array of 2 *distinct* strings. Known example: command `k-4e00` has `wrong:['2','2']` — change the second to a different plausible wrong answer. Fix ALL instances across all 80 commands.

2. **Diversify blank distractors.** Currently many commands reuse the identical `choices` array for all their blanks. For each command, vary the distractors across its 2-3 blanks using the confusable sets defined in the spec. Example: for `k-4e00` (one), instead of `['one','two','three']` for every blank, use `['one','ten','hundred']` for one blank and `['one','day/sun','moon/month']` for another — drawing from kanji that could plausibly appear in that compound position.

3. **Rename domain tag.** Change `dom: 'l1'` to `dom: 'g1'` across all 80 commands.

4. **Review tier assignments.** Change ~30 high-frequency kanji to `tier: 'core'` and the remaining ~50 to `tier: 'regular'`. High-frequency = numbers (one through ten), basic nouns (day/sun, moon/month, fire, water, tree, gold/money, soil/earth, person, child, woman/female, man/male, big, small, up, down, middle, mountain, river, rain, sky/empty, eye, mouth, hand, foot, white, red, blue/green).

### Phase 2: Complete Missing Banks

5. **VARIABLE_BANK** — Ensure every command ID has 2-3 entries of `{s: 'component', d: 'description'}`. Decompose each kanji into its visible radicals/components. For simple kanji (one, two, three), describe the kanji's function as a component in other kanji or its stroke characteristics.

6. **APPLICATION_BANK** — Add 1 entry per command: `{scenario: '1-2 sentence context', confusionSet: ['id1','id2','id3']}`. Rules:
   - Scenario must NOT contain the English meaning or a direct translation
   - confusionSet must contain 3 IDs of Grade 1 kanji that are visually or semantically similar
   - Keep scenarios concrete, age-appropriate, 1-2 sentences
   - Use the confusable groups from the spec (number-strokes, direction-pair, nature-weather, tree-composition, person-variants, fire-water, vertical-pair, celestial, body-openings, etc.)

7. **EXPLANATION_GLOSSARY** — Add one entry per kanji that appears as a `blank.answer`:
   ```javascript
   {keys: ['the-kanji-character'], title: 'english-gloss', lines: ['Meaning: ...', 'On: ... | Kun: ...', 'Example: word (reading)']}
   ```

8. **DOM_LABELS** — Update to `{'g1': ['Grade 1 (first-year elementary)']}`.

9. **RELATIONSHIP_BANK** — Ensure it's `{}` (empty object).

10. **AUTO_BLANK_SPECS** — Ensure it's `[]` (empty array).

### Phase 3: generateQuestion() Upgrade

11. **Support 4 question types** with weight renormalization. Model after `ap-stats-cartridge.js` lines ~766-880. The function should:
    - Read difficulty from `G.difficulty` (defaults to `'learn'`)
    - Use these base weights: `{identify: 0.40, fillblank: 0.25, variable: 0.15, application: 0.10}` for learn mode; `{identify: 0.10, fillblank: 0.40, variable: 0.15, application: 0.25}` for challenge mode; interpolate for practice
    - Check which banks exist for the current command and drop missing types
    - Renormalize remaining weights and roll
    - Generate the selected question type following the exact return shapes defined in `cartridge-authoring-guide.md`

    For **identify**: show `cmd.latex` (the kanji), options are 4 `action` strings (correct + 3 distractors from same domain, preferring confusable-set members).

    For **fillblank**: pick a random blank from `cmd.blanks`, return `{type:'fillblank', latex: blank.latex, answer: blank.answer, choices: shuffled blank.choices, correctIdx, fullLatex: cmd.latex}`.

    For **variable**: pick a random entry from `VARIABLE_BANK[cmd.id]`, show `cmd.latex`, options are 4 component descriptions (correct + 3 from other commands' VARIABLE_BANK entries).

    For **application**: pick a random entry from `APPLICATION_BANK[cmd.id]`, show the scenario, options are 4 action strings (correct command + confusionSet commands' actions).

### Phase 4: Registration Swap

12. **In `index.html`** (~line 336): Replace `<script src="./kanji-g1-cartridge.js"></script>` with `<script src="./kanji-g1-cartridge-v2.js"></script>`.

13. **In `kanji-g1-cartridge-v2.js`**: Ensure the IIFE's export block does:
    ```javascript
    window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
    window.TD_CARTRIDGES.push(KANJI_G1);
    window.KANJI_G1_CARTRIDGE = KANJI_G1;
    ```

### Phase 5: Validate

14. Run `node validate-cartridge.js kanji-g1-cartridge-v2.js` and fix any failures. The validator checks 12 rules — all must pass. Pay special attention to:
    - Blank validation: `validateBlank(blank.answer, blank.choices[0])` must return `true`
    - No duplicate choices after normalization
    - DAG integrity: 0 dangling prereqs, 0 cycles
    - wireL1toL2: 0 unwired L1 nodes

## Important Constraints

- **Do NOT create new files** — edit `kanji-g1-cartridge-v2.js` and `index.html` only
- **Do NOT modify the engine** (`index.html` game logic) — only change the `<script>` tag for cartridge loading
- **Do NOT add Grades 2-6** — this is Grade 1 only
- **Do NOT add stroke-order animation** — engine doesn't support it
- **Do NOT modify `validateBlank()`** unless you discover it doesn't handle kanji character comparison correctly (it should be a simple trim+normalize compare for single kanji characters)
- **Keep the existing 80 commands** — don't add or remove kanji, just fix and enrich what's there
- **Preserve the existing DAG structure** (SHARED_PREREQ_NODES, wireL1toL2) — only fix wiring gaps, don't redesign

## Quality Checks

After each phase, sanity-check by running the validator. After Phase 5, all 12 rules should pass with 0 warnings. The final cartridge should:
- Have 80 commands with all required fields
- Have ~240 blanks across those commands
- Have VARIABLE_BANK entries for all 80 commands
- Have APPLICATION_BANK entries for all 80 commands
- Have EXPLANATION_GLOSSARY entries for all kanji answer tokens
- Support identify, fillblank, variable, and application question types
- Pass `node validate-cartridge.js kanji-g1-cartridge-v2.js` with 0 errors
