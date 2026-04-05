# Cartridge Authoring Guide — Formula Defense

This guide tells you everything you need to create a new cartridge for the Formula Defense game engine. A cartridge is a self-contained JavaScript file that defines a complete subject deck: commands (the formulas/concepts), question generation, answer validation, supplementary banks, and prerequisite knowledge graphs.

The game engine loads a cartridge via `window.AP_STATS_CARTRIDGE` (or any `window.*_CARTRIDGE` global). Everything inside the cartridge is data and deck-specific logic. The engine handles rendering, audio, scoring, SRS, and gameplay.

---

## File Structure

```javascript
// [Subject] cartridge data and deck-specific behavior.
(function(){
const MY_CARTRIDGE = {

  // ══════════════════════════════════════
  //  1. CARTRIDGE METADATA
  // ══════════════════════════════════════
  id: 'my-subject-formulas',        // Unique ID, used as localStorage key suffix
  name: 'My Subject',               // Display name
  description: 'Formula defense for [exam/course]',
  icon: '📐',                       // Single emoji
  inputMode: 'quiz',                // 'quiz' = multiple choice, 'prefix-key' = type first letter, 'typing' = free text
  prefixLabel: null,                // Only used if inputMode is 'prefix-key'
  title: 'MY SUBJECT',              // Title screen line 1 (caps)
  subtitle: 'FORMULA DEFENSE',      // Title screen line 2
  startButton: 'DEPLOY',            // Main action button text
  instructions: 'HTML string explaining how the game works',
  instructionsSub: 'Secondary instruction line (HTML)',

  // ══════════════════════════════════════
  //  2. COMMANDS (the deck)
  // ══════════════════════════════════════
  commands: [
    // See "Command Schema" section below
  ],

  // ══════════════════════════════════════
  //  3. QUESTION GENERATOR
  // ══════════════════════════════════════
  generateQuestion(cmd, allCommands) {
    // See "Question Generator" section below
  },

  // ══════════════════════════════════════
  //  4. FORMAT HELPERS
  // ══════════════════════════════════════
  formatPrompt(cmd) { return cmd.action; },
  formatAnswer(cmd) { return cmd.latex ? '(formula)' : cmd.action; },

  // ══════════════════════════════════════
  //  5. ANSWER VALIDATOR (for fill-blank)
  // ══════════════════════════════════════
  validateBlank(input, answer) {
    // See "Blank Validation" section below
  },
};

// ══════════════════════════════════════
//  6. SUPPLEMENTARY BANKS
// ══════════════════════════════════════
// See sections below for each bank

const VARIABLE_BANK = { /* ... */ };
const APPLICATION_BANK = { /* ... */ };
const RELATIONSHIP_BANK = { /* ... */ };
const EXPLANATION_GLOSSARY = [ /* ... */ ];
const AUTO_BLANK_SPECS = [ /* ... */ ];
const DOM_LABELS = { /* ... */ };

// ══════════════════════════════════════
//  7. PREREQUISITE DAG (shared nodes)
// ══════════════════════════════════════
const SHARED_PREREQ_NODES = { /* ... */ };
function wireL1toL2(PREREQ_DAG) { /* ... */ }

// ══════════════════════════════════════
//  8. BOOT-TIME EXPANSION + EXPORT
// ══════════════════════════════════════
// Auto-expand fill-blank coverage
expandFormulaBlankCoverage(MY_CARTRIDGE);

// Attach banks to cartridge object
MY_CARTRIDGE.variableBank = VARIABLE_BANK;
MY_CARTRIDGE.applicationBank = APPLICATION_BANK;
MY_CARTRIDGE.relationshipBank = RELATIONSHIP_BANK;
MY_CARTRIDGE.explanationGlossary = EXPLANATION_GLOSSARY;
MY_CARTRIDGE.autoBlankSpecs = AUTO_BLANK_SPECS;
MY_CARTRIDGE.domLabels = DOM_LABELS;
MY_CARTRIDGE.sharedPrereqNodes = SHARED_PREREQ_NODES;
MY_CARTRIDGE.wireL1toL2 = wireL1toL2;
// + normalizeExplanationLookup, buildExplanationBank (helper functions)

// Publish
window.MY_CARTRIDGE = MY_CARTRIDGE;
})();
```

---

## 2. Command Schema

Each command represents one formula, concept, or skill. This is the core unit of the deck.

```javascript
{
  id: 'slope-b',                    // Unique string, kebab-case. Used as SRS key.
  action: 'Regression Slope (b)',   // Human-readable name shown in identify questions.
                                    // The parenthetical is stripped for MC options.
  tier: 'core',                     // 'core' | 'regular' | 'power' | 'support'
                                    // Determines difficulty unlock order:
                                    //   core    = always available
                                    //   regular = unlocked at wave 3
                                    //   power   = unlocked at wave 6
                                    //   support = always available but lower spawn weight
  dom: 'descriptive',               // Domain tag. Used for:
                                    //   - Domain filter buttons on title screen
                                    //   - Same-domain distractor prioritization
                                    //   - DOM_LABELS mapping to curriculum units
  hint: 'b = r times sy/sx',       // Plain-text hint (shown in input panel)
  explain: 'One sentence explaining when/why to use this',  // Used in explainer panel
  latex: '\\hat{y} = a + bx',      // KaTeX string of the formula. Rendered on the enemy cube
                                    // and in quiz prompts. Must be valid KaTeX.

  // ── BLANKS (fill-in-the-blank questions) ──
  // Each blank shows the formula with one symbol replaced by a boxed ?
  // The student picks the correct symbol from 3 choices
  blanks: [
    {
      latex: '\\hat{y} = a + \\boxed{\\,?\\,}x',  // Formula with blank
      answer: 'b',                                   // Correct answer (must normalize-match choices[0])
      choices: ['b', 'r', 'a']                       // choices[0] MUST be the correct answer.
                                                      // Engine shuffles at runtime.
    },
    // 2-4 blanks per command recommended
  ],

  // ── SUBCONCEPTS (prerequisite questions for DAG decomposition) ──
  // When a student misses this command, hydra split creates child enemies
  // that ask these subconcept questions. 3 per command.
  subconcepts: [
    {
      q: 'What does b represent in the LSRL?',           // Question text
      correct: 'The predicted change in y per unit x',    // Correct answer (full sentence)
      wrong: ['The y-intercept', 'The correlation']       // 2 wrong answers
    },
    // Exactly 3 subconcepts per command
  ]
}
```

### Command Rules

- **`id`**: unique across the entire cartridge. Kebab-case. No spaces or special chars.
- **`action`**: should clearly describe what the formula calculates. Parenthetical like `(b)` is stripped for MC option text, so the base text must stand alone.
- **`latex`**: must be valid KaTeX. Use `\\` for LaTeX commands. Unicode is fine for display but LaTeX is preferred for consistency.
- **`blanks[].answer`** must normalize-match `blanks[].choices[0]` after the `validateBlank()` normalization. This is the #1 source of bugs. Test it.
- **`blanks[].choices`**: exactly 3 choices. `choices[0]` is always the correct answer (engine shuffles at runtime). No duplicate choices after normalization (e.g., `n` and `N` normalize identically).
- **`subconcepts`**: exactly 3. Each must have 1 correct and 2 wrong answers. These become the L1 nodes in the prerequisite DAG.

### Tier Guidelines

| Tier | When unlocked | Typical content |
|------|--------------|-----------------|
| `core` | Wave 1 | Fundamental formulas everyone must know |
| `regular` | Wave 3 | Standard exam formulas |
| `power` | Wave 6 | Advanced/multi-step formulas |
| `support` | Wave 1 | Conditions, interpretation, conceptual cards |

---

## 3. Question Generator

The cartridge must export a `generateQuestion(cmd, allCommands)` method that returns one of 5 question types. The engine calls this at enemy spawn time.

### Question types and return shapes

#### Identify (4-option MC: "What does this formula calculate?")
```javascript
{
  type: 'identify',
  latex: cmd.latex,                    // The formula shown
  options: ['Correct', 'Wrong1', 'Wrong2', 'Wrong3'],  // Shuffled
  correctIdx: 0,                       // Index of correct answer in options[]
  correctKey: 'a'                      // 'a'|'b'|'c'|'d' matching correctIdx
}
```
Distractors: prefer same-domain commands first, then any. Deduplicate via case-insensitive Set.

#### Fill-blank (3-option MC: "What symbol goes in the box?")
```javascript
{
  type: 'fillblank',
  latex: '\\hat{y} = a + \\boxed{\\,?\\,}x',  // Formula with blank
  answer: 'b',                                   // For display in wrong-answer feedback
  choices: ['a', 'b', 'r'],                      // Shuffled from blank.choices
  correctIdx: 1,                                  // Index of correct in shuffled choices
  fullLatex: cmd.latex                            // Complete formula for reference
}
```

#### Variable (4-option MC: "What does [symbol] represent in this formula?")
```javascript
{
  type: 'variable',
  latex: cmd.latex,
  symbol: '\\hat{p}',                 // The symbol being asked about (LaTeX)
  options: ['sample proportion', 'population proportion', ...],  // Shuffled
  correctIdx: 2,
  correctKey: 'c'
}
```
Distractors: pulled from other commands' VARIABLE_BANK entries, deduplicated.

#### Application (4-option MC: "Which formula applies to this scenario?")
```javascript
{
  type: 'application',
  scenario: 'A company claims 90% ship on time...',  // 1-2 sentence real-world scenario
  options: ['One-proportion z statistic', 'CI for One Proportion', ...],  // Shuffled
  correctIdx: 0,
  correctKey: 'a'
}
```
Distractors: from `confusionSet` in APPLICATION_BANK (deliberately confusable commands).

#### Relationship (3-option MC: "What happens to Y when X increases?")
```javascript
{
  type: 'relationship',
  latex: cmd.latex,
  input: 'n (sample size)',
  output: 'margin of error',
  direction: 'Decreases',             // Correct answer
  explain: 'sqrt(n) in denominator...',
  formulaName: 'Margin of Error',
  options: ['Increases', 'Decreases', 'Stays the same'],  // Shuffled
  correctIdx: 1,
  correctKey: 'b'
}
```

### Weight system

Question type weights vary by difficulty setting:

| Type | Learn | Practice | Challenge |
|------|-------|----------|-----------|
| identify | 40% | 15% | 5% |
| fillblank | 25% | 45% | 45% |
| variable | 15% | 10% | 10% |
| application | 10% | 15% | 20% |
| relationship | 10% | 15% | 20% |

Weights are **renormalized** over available types for each command. If a command has no APPLICATION_BANK entry, that weight is redistributed to the others.

---

## 4. Blank Validation

`validateBlank(input, answer)` must handle LaTeX/Unicode mismatches. The normalization function:

1. Trim and lowercase
2. Collapse whitespace
3. Replace Greek Unicode → ASCII: `σ→sigma`, `μ→mu`, `β→beta`, `χ→chi`
4. Replace LaTeX hat/bar: `\hat{p}→phat`, `\bar{x}→xbar`
5. Strip LaTeX formatting: `\\`, `{`, `}`, `_`
6. Check aliases for common equivalents: `p0↔p_0`, `phat↔p-hat`, `sx↔s_x`, etc.

**Critical rule**: `validateBlank(blank.answer, blank.choices[0])` MUST return `true` for every blank in the deck. If it doesn't, correct answers won't validate at runtime and the game is broken.

---

## 5. Supplementary Banks

### VARIABLE_BANK

Keyed by command `id`. Array of `{s, d}` objects describing each symbol in the formula.

```javascript
const VARIABLE_BANK = {
  'mean': [
    { s: '\\bar{x}', d: 'sample mean' },
    { s: 'x_i', d: 'individual data values' },
    { s: 'n', d: 'sample size' }
  ],
  // 2-3 entries per command
};
```

- `s`: LaTeX string of the symbol
- `d`: plain-text description of what it represents
- Descriptions must be unique enough to distinguish from other commands' variables (they become distractors for each other)

### APPLICATION_BANK

Keyed by command `id`. Array of scenario objects.

```javascript
const APPLICATION_BANK = {
  'one-prop-z': [
    {
      scenario: 'A company claims 90% of orders ship on time. A consumer group surveys 200 orders and finds 84%.',
      confusionSet: ['one-prop-ci', 'two-prop-z', 'one-mean-t']
    },
    // 1-2 scenarios per command
  ],
};
```

- **`scenario`**: 1-2 sentences describing a real-world situation. Must NOT contain the answer (no naming the formula, no giving away key symbols).
- **`confusionSet`**: array of 3 command `id`s that are deliberately confusable with this one. These become the wrong-answer distractors. Choose commands that students commonly mix up.

### RELATIONSHIP_BANK

Keyed by command `id`. Array of directional relationship entries.

```javascript
const RELATIONSHIP_BANK = {
  'phat-sd': [
    {
      input: 'n (sample size)',          // What changes
      output: 'SD of p-hat',            // What we're measuring the effect on
      direction: 'decreases',           // 'increases' | 'decreases' | 'stays the same'
      explain: 'n is in the denominator under the square root'
    }
  ],
};
```

Not every command needs a relationship entry. Skip commands where "what happens when X increases?" is unnatural (e.g., static definitions, conditions).

### EXPLANATION_GLOSSARY

Array of notation explainer entries. Each entry covers one symbol/concept that appears as a fill-blank answer.

```javascript
const EXPLANATION_GLOSSARY = [
  {
    keys: ['p-hat'],                    // Lookup keys (normalized). Can have multiple aliases.
    title: 'p-hat',                     // Display title
    lines: [
      'Sentence 1: what it is.',
      'Sentence 2: when to use it.',
      'Sentence 3: how to spot it on the exam.'
    ]
  },
];
```

The engine builds a lookup table from these at boot. When a student sees a fill-blank question, they can open the explainer to understand the symbol.

### AUTO_BLANK_SPECS

Rules for auto-generating additional fill-blank variants. The engine scans each command's `latex` for matches and creates blanks automatically.

```javascript
const AUTO_BLANK_SPECS = [
  // Literal match: find this exact string in the formula, replace with boxed blank
  { match: '\\hat{p}', choices: ['\\hat{p}', 'p', 'p_0'] },

  // Regex match: for symbols that need lookahead/lookbehind
  { regex: /(?<![_\w])n(?![_\w])/u, answer: 'n', choices: ['n', 'n-1', 'n+1'] },
];
```

- `choices[0]` is always the correct answer
- The engine skips auto-blanks that duplicate an existing hand-authored blank (by normalized answer)
- Max 3 auto-blanks added per command
- Literal matches checked first, then regex

### DOM_LABELS

Maps domain tags to curriculum unit labels for the title screen filter buttons.

```javascript
const DOM_LABELS = {
  'descriptive': ['U1 · Describing Data', 'U2 · Two-Variable Data'],
  'probability': ['U4 · Probability Rules'],
  'inference':   ['U5-6 · Inference'],
  // One entry per domain used in commands
};
```

---

## 6. Prerequisite DAG

The game decomposes wrong answers into prerequisite knowledge using a recursive DAG. When a student misses a formula, child enemies spawn testing the underlying concepts.

### Structure

- **L0**: The main formula command (exists in `commands[]`)
- **L1**: Subconcepts (auto-generated from each command's `subconcepts[]` array)
- **L2-L5**: Shared prerequisite nodes defined in `SHARED_PREREQ_NODES`

### SHARED_PREREQ_NODES

Hand-authored conceptual/computational nodes that are shared across multiple commands.

```javascript
const SHARED_PREREQ_NODES = {
  'se-concept': {
    id: 'se-concept',
    type: 'conceptual',              // 'conceptual' | 'computational'
    level: 2,                         // 2-5 (depth in the DAG)
    q: 'What does Standard Error measure?',
    correct: 'How much a statistic varies across repeated samples',
    wrong: ['The average error', 'The distance between sample and population'],
    prereqs: ['sampling-variability', 'variance-to-sd', 'sqrt-n-effect']
  },
  // Level 5 nodes are leaf nodes (prereqs: basic arithmetic)
  'add-numbers': {
    id: 'add-numbers', type: 'computational', level: 5,
    q: '7 + 5 = ?', correct: '12', wrong: ['11', '13'],
    prereqs: []   // Leaf node — no further decomposition
  },
};
```

### wireL1toL2

A function that pattern-matches L1 subconcept questions to L2+ shared nodes using regex rules.

```javascript
function wireL1toL2(PREREQ_DAG) {
  const rules = [
    // [regex_matching_question_or_answer, [shared_node_ids_to_wire_as_prereqs]]
    [/standard error|SE\b/i, ['se-concept', 'sqrt-n-effect']],
    [/z.score|standard.*unit/i, ['z-score-concept']],
    [/H.?0|null hyp/i, ['hypothesis-framework']],
    // ... one rule per conceptual pattern
  ];

  for (const node of Object.values(PREREQ_DAG)) {
    if (node.level !== 1 || !node.autoGen || node.prereqs.length > 0) continue;
    const matched = new Set();
    for (const [re, ids] of rules) {
      if (re.test(node.q) || re.test(node.correct)) {
        ids.forEach(id => { if (PREREQ_DAG[id]) matched.add(id) });
      }
    }
    if (matched.size > 0) node.prereqs = [...matched];
  }
}
```

### DAG rules

- Every L1 node should wire to at least one L2+ node (0 unwired subconcepts is the target)
- Every branch should eventually reach L5 leaf nodes (no dangling refs)
- No cycles allowed (the engine runs `validateDAG()` at boot and will crash if cycles exist)
- L1 nodes are auto-generated by the engine from `subconcepts[]`; don't define them in `SHARED_PREREQ_NODES`

---

## 7. Boot-Time Expansion

Before exporting, the cartridge runs `expandFormulaBlankCoverage()` which scans every command's `latex` against `AUTO_BLANK_SPECS` and adds up to 3 additional fill-blank variants per command. This ensures every formula has multiple blank questions without requiring exhaustive hand-authoring.

---

## 8. Validation Checklist

Before shipping a cartridge, verify:

1. **`node --check <cartridge>.js`** passes (valid JS syntax)
2. **Command count** matches expectation
3. **Every blank validates**: `validateBlank(blank.answer, blank.choices[0])` returns `true` for all blanks
4. **No duplicate choices** after normalization on any blank
5. **Every command has**: `id`, `action`, `tier`, `dom`, `hint`, `explain`, `latex`, `blanks[]` (can be empty for concept cards), `subconcepts[3]`
6. **VARIABLE_BANK** entry for every command (2-3 vars each)
7. **APPLICATION_BANK** entry for every command (1-2 scenarios, no answer giveaways)
8. **RELATIONSHIP_BANK** entry where applicable
9. **EXPLANATION_GLOSSARY** entry for every symbol that appears as a fill-blank answer
10. **0 unwired subconcepts** (run wireL1toL2 and check)
11. **0 dangling prereq refs** (every node ID referenced in `prereqs[]` must exist)
12. **0 cycles** in the DAG

---

## 9. Blank Template (Minimal Working Cartridge)

```javascript
// Minimal cartridge template — replace all TODO markers
(function(){

function shuffleArr(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const MY_CARTRIDGE = {
  id: 'TODO-subject-id',
  name: 'TODO Subject Name',
  description: 'TODO description',
  icon: 'TODO',
  inputMode: 'quiz',
  prefixLabel: null,
  title: 'TODO TITLE',
  subtitle: 'FORMULA DEFENSE',
  startButton: 'DEPLOY',
  instructions: 'TODO: explain game mechanics in HTML',
  instructionsSub: 'TODO: secondary instructions',

  commands: [
    {
      id: 'TODO-cmd-1',
      action: 'TODO Formula Name',
      tier: 'core',
      dom: 'TODO-domain',
      hint: 'TODO plain text hint',
      explain: 'TODO one sentence explanation',
      latex: 'TODO: \\text{valid KaTeX}',
      blanks: [
        {
          latex: 'TODO: formula with \\boxed{\\,?\\,}',
          answer: 'TODO',
          choices: ['TODO-correct', 'TODO-wrong1', 'TODO-wrong2']
        }
      ],
      subconcepts: [
        { q: 'TODO question 1?', correct: 'TODO correct', wrong: ['TODO wrong1', 'TODO wrong2'] },
        { q: 'TODO question 2?', correct: 'TODO correct', wrong: ['TODO wrong1', 'TODO wrong2'] },
        { q: 'TODO question 3?', correct: 'TODO correct', wrong: ['TODO wrong1', 'TODO wrong2'] }
      ]
    },
    // Add more commands...
  ],

  generateQuestion(cmd, allCommands) {
    // Copy the full generateQuestion implementation from the reference cartridge.
    // The logic is generic — only the weight table needs subject-specific tuning.
    // TODO: paste full implementation here
  },

  formatPrompt(cmd) { return cmd.action; },
  formatAnswer(cmd) { return cmd.latex ? '(formula)' : cmd.action; },

  validateBlank(input, answer) {
    // TODO: implement normalization for your subject's notation
    // Must handle: LaTeX formatting, Unicode symbols, common aliases
    function norm(s) { return s.trim().toLowerCase().replace(/\s+/g, '').replace(/[\\{}_]/g, ''); }
    return norm(input) === norm(answer);
  },
};

// ── Banks ──
const VARIABLE_BANK = {
  // 'cmd-id': [{ s: 'LaTeX symbol', d: 'plain text description' }, ...]
};
const APPLICATION_BANK = {
  // 'cmd-id': [{ scenario: '...', confusionSet: ['other-cmd-id', ...] }, ...]
};
const RELATIONSHIP_BANK = {
  // 'cmd-id': [{ input: '...', output: '...', direction: 'increases|decreases|stays the same', explain: '...' }, ...]
};
const EXPLANATION_GLOSSARY = [
  // { keys: ['symbol'], title: 'Display Title', lines: ['What it is.', 'When to use it.', 'How to spot it.'] }
];
const AUTO_BLANK_SPECS = [
  // { match: 'literal LaTeX', choices: ['correct', 'wrong1', 'wrong2'] }
  // { regex: /pattern/u, answer: 'correct', choices: ['correct', 'wrong1', 'wrong2'] }
];
const DOM_LABELS = {
  // 'domain-tag': ['Unit Label 1', 'Unit Label 2']
};

// ── DAG ──
const SHARED_PREREQ_NODES = {
  // 'node-id': { id, type, level, q, correct, wrong, prereqs }
};
function wireL1toL2(PREREQ_DAG) {
  const rules = [
    // [/regex/i, ['shared-node-id', ...]]
  ];
  for (const node of Object.values(PREREQ_DAG)) {
    if (node.level !== 1 || !node.autoGen || node.prereqs.length > 0) continue;
    const matched = new Set();
    for (const [re, ids] of rules) {
      if (re.test(node.q) || re.test(node.correct)) {
        ids.forEach(id => { if (PREREQ_DAG[id]) matched.add(id) });
      }
    }
    if (matched.size > 0) node.prereqs = [...matched];
  }
}

// ── Boot expansion ──
// Auto-blank expansion helpers (copy from reference cartridge)
// expandFormulaBlankCoverage(MY_CARTRIDGE);

// ── Export ──
MY_CARTRIDGE.variableBank = VARIABLE_BANK;
MY_CARTRIDGE.applicationBank = APPLICATION_BANK;
MY_CARTRIDGE.relationshipBank = RELATIONSHIP_BANK;
MY_CARTRIDGE.explanationGlossary = EXPLANATION_GLOSSARY;
MY_CARTRIDGE.autoBlankSpecs = AUTO_BLANK_SPECS;
MY_CARTRIDGE.domLabels = DOM_LABELS;
MY_CARTRIDGE.sharedPrereqNodes = SHARED_PREREQ_NODES;
MY_CARTRIDGE.wireL1toL2 = wireL1toL2;

window.MY_CARTRIDGE = MY_CARTRIDGE;
})();
```

---

## 10. Common Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|------------|
| `choices[0]` doesn't match `answer` after normalization | Correct answers rejected at runtime | Run validateBlank on every blank at build time |
| `n` and `N` as separate choices | Normalize identically, engine sees duplicates | Test normalization on all choice sets |
| Scenario contains the answer keyword | Students read the answer from the question | Never name the formula/method in application scenarios |
| Subconcept `wrong` has only 1 entry | Runtime error on MC generation | Always exactly 2 wrong answers |
| DAG node references non-existent prereq | Boot crash in validateDAG | Grep all prereq arrays for existence |
| wireL1toL2 regex too broad | Unrelated subconcepts get wrong prereqs | Use word boundaries (`\b`) and test against full corpus |
| Missing domain in DOM_LABELS | Filter button renders but shows no label | Entry for every `dom` value used in commands |
| `id` collision between commands | SRS state corruption | Unique IDs enforced by convention |
