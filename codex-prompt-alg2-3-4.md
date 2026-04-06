# Codex Task: Implement Algebra 2 Lesson 3-4 Dividing Polynomials Cartridge

## Context

You are building a cartridge for the Formula Defense game engine (tmux-trainer). A cartridge is a self-contained JavaScript IIFE that defines a complete subject deck: commands, question generation, answer validation, supplementary banks, and prerequisite DAGs.

## Input Files (read these first)

1. **Spec** (your primary guide): `alg2-3-4-dividing-polynomials-cartridge-spec.md`
2. **Authoring contract** (schema rules, validation requirements): `cartridge-authoring-guide.md`
3. **Reference implementation** (copy patterns from this): `ap-stats-cartridge.js`
4. **Template** (minimal structure): `dummy-cartridge.js`
5. **Gemini draft** (starting point to expand, NOT to ship as-is): the existing code in the spec's "Base cartridge" section — do NOT copy it verbatim; the spec explains what to keep, revise, and add.

## Output

**Single file**: `alg2-dividing-polynomials-cartridge.js`

## What to Build

Implement every section of the spec (sections 1-13). The key deliverables:

### Commands (6 total)
- `long-division` — NEW, procedural, targets quiz Q1
- `synthetic-division` — NEW, procedural, targets quiz Q2
- `division-algorithm` — REVISED from Gemini draft (update `dom` to `'division-methods'`)
- `remainder-theorem` — REVISED (add sign-flip blank)
- `factor-theorem` — REVISED (improve subconcept)
- `factor-with-division` — NEW, targets quiz Q5's procedural half

Each command must have: `id`, `action`, `tier`, `dom`, `hint`, `explain`, `latex`, `blanks[]`, `subconcepts[3]` (exactly 3, each with 1 correct and 2 wrong).

### generateQuestion()
**Do NOT use the Gemini draft's uniform-random picker.** Copy the weighted `generateQuestion` from `ap-stats-cartridge.js` (starts around line 766). It handles:
- Difficulty-based weight tables (learn/practice/challenge)
- All 5 question types including `relationship`
- Weighted renormalization over available types
- Same-domain distractor priority
- `stripNot()` helper

Add empty-bank guards: gate on `this.variableBank[cmd.id]?.length > 0` (not just truthy check).

### Supplementary Banks
- **VARIABLE_BANK**: entry for all 6 commands (2-3 vars each). See spec section 4.
- **APPLICATION_BANK**: entry for all 6 commands. Scenarios must NOT name the method. All confusionSets must have exactly 3 valid command IDs. See spec section 3.
- **RELATIONSHIP_BANK**: at least 4 entries. See spec section 5.
- **EXPLANATION_GLOSSARY**: cover every symbol that appears as a blank answer, plus the 4 new entries from spec section 6.
- **AUTO_BLANK_SPECS**: populate per spec section 7.
- **DOM_LABELS**: two domains (`division-methods`, `theorems`). See spec section 8.

### Prerequisite DAG
- Keep existing 3 shared nodes (`eval-poly`, `poly-degree`, `division-concept`)
- Add 6 new nodes from spec section 9: `sign-of-c`, `zero-placeholder`, `degree-reduction`, `factor-vs-remainder`, `multiply-add-step`, `leading-term-division`
- Update `wireL1toL2` with expanded regex rules from spec section 9

### Engine Alignment
- Attach `normalizeExplanationLookup` and `buildExplanationBank` stubs (see spec section 10a)
- Fix `validateBlank` to NOT strip parentheses (answers like `(x-c)` and `(1-p)` must validate). See spec section 10b.
- Export via `window.TD_CARTRIDGES.push()` AND `window.ALG2_POLYNOMIALS_CARTRIDGE`

## Patterns to Follow

- Match the code style of `ap-stats-cartridge.js` (compact, semicolon-terminated, minimal whitespace in data arrays)
- IIFE wrapper: `(function(){ ... })();`
- `shuffleArr` helper at top of IIFE
- Banks defined as `const` after `MY_CARTRIDGE`, then attached before export
- Guard the `expandFormulaBlankCoverage` call with a typeof check (see Gemini draft pattern)

## Validation (run these checks before finishing)

```bash
node --check alg2-dividing-polynomials-cartridge.js
```

Then manually verify:
1. 6 commands, each with all required fields
2. Every `blank.choices[0]` matches `blank.answer` after normalization
3. No duplicate choices after normalization on any blank
4. Every command ID referenced in a confusionSet exists as a command
5. Every prereq ID referenced in SHARED_PREREQ_NODES exists
6. `generateQuestion` includes weighted selection and all 5 types
7. `normalizeExplanationLookup` and `buildExplanationBank` are attached

## Do NOT

- Ship the Gemini draft as-is (it has 3 commands; we need 6, plus all the fixes)
- Use uniform-random question type selection
- Name the method/theorem inside application scenarios
- Strip parentheses in `validateBlank` normalization
- Leave AUTO_BLANK_SPECS empty
- Leave confusionSets with fewer than 3 entries
