# Application/Relationship Question Types — Spec

## Problem Statement

Current question types (identify, fillblank, variable) test **recall**: recognize a formula, fill in a symbol, name a variable. These are Bloom's taxonomy Level 1-2 (Remember/Understand).

Students need **application** (Level 3) and **analysis** (Level 4) practice:
- "When would you use this formula?" (application — scenario → formula mapping)
- "What happens to the margin of error when n increases?" (relationship — cause → effect reasoning)

These are the exact question styles that appear on the AP exam's free response section but are currently absent from the game.

## Solution Design

### Two New Question Types

#### 1. `application` — "Which formula/concept applies here?"

Given a real-world scenario, pick which formula/concept to use.

Structure:
- Prompt: a 1-2 sentence scenario (e.g., "A researcher wants to estimate the proportion of voters who support a policy within ±3%. Which formula determines the interval?")
- 4 MC options: the correct command action + 3 distractor actions
- Badge: green "APPLICATION" (distinct from blue IDENTIFY, orange FILL-BLANK, teal VARIABLE)

Data source: `APPLICATION_BANK` constant keyed by command id:
```js
APPLICATION_BANK['one-prop-ci'] = [
  {scenario: 'A survey of 600 voters finds 54% support a ballot measure. Estimate the true proportion with 95% confidence.',
   confusionSet: ['one-prop-z', 'two-prop-ci', 'ci-formula']}
]
```

Each scenario includes a `confusionSet` array of command IDs whose action labels become distractors. This ensures meaningful confusion pairs (e.g., CI vs hypothesis test, one-sample vs two-sample) rather than arbitrary same-domain neighbors.

If `confusionSet` has fewer than 3 entries, remaining distractors are filled from same-domain commands.

#### 2. `relationship` — "What happens when X changes?"

Given a formula, identify the directional relationship between two variables.

Structure:
- Prompt: "In [formula name], **holding other quantities constant**: What happens to [output] when [input] increases?"
- 3 MC options: "Increases", "Decreases", "Stays the same"
- Badge: purple "RELATIONSHIP"
- The ceteris-paribus clause is always present in the prompt to avoid ambiguity

Data source: a new `relationships` array on each command:
```js
relationships: [
  {input: 'n', output: 'margin of error', direction: 'decreases', explain: 'n is in the denominator under a square root, so larger n → smaller ME'}
]
```

### Question Generation Mix

Updated `generateQuestion()` probability allocation:

| Difficulty | identify | fillblank | variable | application | relationship |
|-----------|----------|-----------|----------|-------------|--------------|
| learn     | 40%      | 25%       | 15%      | 10%         | 10%          |
| practice  | 15%      | 45%       | 10%      | 15%         | 15%          |
| challenge | 5%       | 45%       | 10%      | 20%         | 20%          |

For each command, the available types are determined at generation time:
- `identify`: always available
- `fillblank`: available if `cmd.blanks.length > 0`
- `variable`: available if `VARIABLE_BANK[cmd.id]` exists
- `application`: available if `APPLICATION_BANK[cmd.id]` exists
- `relationship`: available if `RELATIONSHIP_BANK[cmd.id]` exists

Weights are renormalized over available types only:
```js
const weights = {};
if (true) weights.identify = baseWeights.identify;
if (cmd.blanks.length) weights.fillblank = baseWeights.fillblank;
if (VARIABLE_BANK[cmd.id]) weights.variable = baseWeights.variable;
if (APPLICATION_BANK[cmd.id]) weights.application = baseWeights.application;
if (RELATIONSHIP_BANK[cmd.id]) weights.relationship = baseWeights.relationship;
const total = Object.values(weights).reduce((a,b)=>a+b, 0);
// Roll against normalized weights
```

### Application Bank (authored per command)

Each AP Stats command gets 1-3 application scenarios. Focus on:
- Real-world contexts from the AP Stats curriculum framework
- Scenarios that require choosing between similar formulas (e.g., one-prop-z vs two-prop-z)
- Scenarios where students commonly pick the wrong test

Target: at least 1 application per command, 2-3 for core/power tier commands.

### Relationship Bank (authored per command)

Each formula with ≥2 variables gets 1-3 relationship entries. Focus on:
- Denominator relationships (n↑ → SE↓)
- Numerator relationships (difference↑ → test stat↑)
- Confidence level relationships (C↑ → z*↑ → ME↑)
- Sample size effects (the most-tested AP concept)

Target: at least 1 relationship per formula command, 2+ for inference formulas.

### UI Integration

Both new types use the existing quiz MC rendering path:
- `application`: 4-option MC (same as identify)
- `relationship`: 3-option MC (same as fillblank)

New badge colors:
- Application: `#228844` green background
- Relationship: `#664488` purple background

The prompt text sits in the `#ip-header` sticky area. For application questions, the scenario text replaces the formula display (no LaTeX needed — the question IS the scenario). For relationship questions, the formula LaTeX is shown with the relationship prompt below it.

### Scoring

Gameplay penalties (surge, speed) are the same as identify/fillblank.

BKT update weight is **0.7x** for application and relationship questions — these test transfer/reasoning, not recall, so they should influence pKnown more gently. A student who struggles with application shouldn't have their recall mastery destroyed.

### DAG Decomposition on Miss

- **Application misses do NOT trigger DAG decomposition.** An application miss means the student confused which formula to use, not that they don't understand the formula's parts. Spawning prerequisite enemies would teach the wrong skill.
- **Relationship misses do NOT trigger DAG decomposition** for the same reason — the student may understand the formula but not its directional behavior.
- Both types still apply the surge/speed penalty and BKT miss (at 0.7x weight).

### Explainer Integration

Alt+E text explanations still work — they explain the formula as usual. The explanation is arguably MORE useful for application/relationship questions since the student needs to understand what the formula does to answer correctly.

### Prerequisite DAG Integration

Application and relationship questions are L0 (main formula level) only — they test the command itself, not its subconcepts. Wrong answers trigger the same DAG decomposition as identify/fillblank misses.

## Blast Radius

| Area | Impact | Risk |
|------|--------|------|
| `generateQuestion()` | Add application/relationship type selection | MEDIUM — core question path |
| `setInputPanelContent()` | Add rendering for new types | MEDIUM — must handle new prompt layouts |
| `handleQuizChoice()` | Already handles MC generically | LOW — no change needed |
| Command data | Add `applications[]` and `relationships[]` arrays | LOW — additive |
| Badge CSS | 2 new badge colors | LOW — additive |
| `reshuffleQuestionOptions()` | Must handle new types | LOW — small addition |
| SRS/BKT | No change — uses same correct/incorrect path | NONE |
| Music/Audio | No change | NONE |
| Labels/3D | No change | NONE |

## Implementation Plan

1. Author `APPLICATION_BANK` — object keyed by command id, each value is array of `{scenario, answer}` (answer = the command's action label)
2. Author `RELATIONSHIP_BANK` — object keyed by command id, each value is array of `{input, output, direction, explain}`
3. Update `generateQuestion()` to include new types in the probability roll
4. Add rendering for `application` and `relationship` question types in `setInputPanelContent()`
5. Add badge CSS for new types
6. Update `reshuffleQuestionOptions()` for new types
7. Update wrong-answer feedback to show scenario/relationship context
8. Parse check + browser verify

## Codex Review Findings (all addressed)

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| 1 | HIGH | Generic same-domain distractors are weak for application Qs | Added `confusionSet` per scenario with specific command IDs |
| 2 | HIGH | Relationship prompts omit ceteris paribus, making answers ambiguous | Added "holding other quantities constant" to prompt template |
| 3 | HIGH | Application misses → DAG decomposition is wrong remediation | Application/relationship misses skip DAG split, BKT penalty only |
| 4 | MEDIUM | Probability fallback math undefined | Renormalize weights over available types per command |
| 5 | MEDIUM | BKT treats new types same as recall | 0.7x BKT update weight for application/relationship |
| 6 | MEDIUM | UI render contract for long scenarios on mobile | Cap scenario to 2 lines, formula in body for relationship |
| 7 | LOW | Inconsistent authoring scope numbers | 76 commands, 93 application scenarios, 59 relationship entries |

## Content Authoring Strategy

Rather than authoring 76×3 = 228 entries, focus on high-value commands first:
- All inference formulas (one-prop-z, two-prop-z, one-mean-t, etc.) — these are the AP exam's bread and butter
- Condition checks (random, normal, 10%) — students constantly confuse these
- CI vs hypothesis test pairs — the most common AP mistake

Start with ~40 application entries and ~50 relationship entries covering the most-tested formulas, then expand.
