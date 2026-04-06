# Spec: Algebra 2 Lesson 3-4 — Dividing Polynomials Cartridge

**Source quiz**: enVision Algebra 2, Lesson 3-4 Quiz (5 questions)
**Base cartridge**: Gemini draft (`alg2-dividing-polynomials`)
**Analyses synthesized**: ChatGPT deep review + Claude structural review
**Reference implementation**: `ap-stats-cartridge.js`
**Authoring contract**: `cartridge-authoring-guide.md`

---

## 1. Commands (the deck)

The quiz tests **5 distinct micro-skills**. Gemini's draft covers only 3 abstract theorems. Expand to **6 commands** that map to every quiz item plus the unifying identity.

| id | action | tier | dom | Quiz item | Status |
|----|--------|------|-----|-----------|--------|
| `long-division` | Polynomial Long Division | core | division-methods | Q1 | **NEW** |
| `synthetic-division` | Synthetic Division | core | division-methods | Q2 | **NEW** |
| `division-algorithm` | Division Algorithm Identity | core | division-methods | (connects Q1/Q2 to formal expression) | KEEP, revise |
| `remainder-theorem` | Remainder Theorem | core | theorems | Q3, Q4 | KEEP, revise |
| `factor-theorem` | Factor Theorem | core | theorems | Q5 (conceptual half) | KEEP, revise |
| `factor-with-division` | Factoring via Division | regular | theorems | Q5 (procedural half) | **NEW** |

### 1a. New command: `long-division`

```
id: 'long-division'
action: 'Polynomial Long Division'
tier: 'core'
dom: 'division-methods'
hint: 'Divide, multiply, subtract, bring down — repeat'
explain: 'Systematically divides a polynomial by another, producing a quotient and remainder.'
latex: '\\frac{x^3 + x^2 - 2x + 14}{x + 3} = x^2 - 2x + 4 + \\frac{2}{x+3}'
```

**Blanks** (4, targeting the output format the quiz tests):
1. Box the quotient's leading term: `answer: 'x^2'`, choices: `['x^2', 'x^3', '2x']`
2. Box the remainder numerator: `answer: '2'`, choices: `['2', '14', '-2']`
3. Box the divisor in the remainder fraction: `answer: 'x+3'`, choices: `['x+3', 'x-3', 'x']`
4. Box the constant quotient term: `answer: '4'`, choices: `['4', '-8', '10']`

**Subconcepts** (3):
1. "What is the first step of polynomial long division?" / "Divide the leading term of the dividend by the leading term of the divisor" / wrong: ["Multiply the entire dividend by the divisor", "Subtract the divisor from the dividend"]
2. "When do you stop the long division process?" / "When the remainder's degree is less than the divisor's degree" / wrong: ["When the remainder is 0", "After exactly n steps where n is the dividend's degree"]
3. "How is the final answer expressed?" / "Quotient plus remainder over divisor" / wrong: ["Just the quotient", "Quotient times divisor plus remainder"]

### 1b. New command: `synthetic-division`

```
id: 'synthetic-division'
action: 'Synthetic Division'
tier: 'core'
dom: 'division-methods'
hint: 'Bring down, multiply by c, add — repeat'
explain: 'A shortcut for dividing by a linear binomial (x - c), using only coefficients.'
latex: '\\begin{array}{c|cccc} c & a_n & a_{n-1} & \\cdots & a_0 \\end{array}'
```

**Blanks** (3):
1. Box the value used in the synthetic division box when dividing by (x - 2): `answer: '2'`, choices: `['2', '-2', '0']`
2. Box what the last number in the bottom row represents: `answer: 'remainder'`, choices: `['remainder', 'leading coefficient', 'divisor']`
3. Box the operation performed at each column: `answer: 'multiply then add'`, choices: `['multiply then add', 'multiply then subtract', 'divide then add']`

**Subconcepts** (3):
1. "When dividing by (x + 2) using synthetic division, what value goes in the box?" / "−2" / wrong: ["2", "+2"]
2. "If the polynomial is missing an x^2 term, what coefficient must you insert?" / "0 as a placeholder" / wrong: ["Skip that column", "1 as a placeholder"]
3. "What is the degree of the quotient relative to the dividend?" / "One degree less than the dividend" / wrong: ["Same degree", "Two degrees less"]

### 1c. New command: `factor-with-division`

```
id: 'factor-with-division'
action: 'Factoring via Division'
tier: 'regular'
dom: 'theorems'
hint: 'If (x-c) is a factor, divide to find the cofactor'
explain: 'When a linear factor is known, divide it out to express the polynomial as a product of factors.'
latex: 'P(x) = (x - c) \\cdot Q(x) \\quad \\text{where } P(c) = 0'
```

**Blanks** (3):
1. Box Q(x): `answer: 'Q(x)'`, choices: `['Q(x)', 'P(x)', 'R(x)']`
2. Box the required remainder: `answer: '0'`, choices: `['0', '1', 'c']`
3. Box (x - c): `answer: '(x-c)'`, choices: `['(x-c)', '(x+c)', 'Q(x)']`

**Subconcepts** (3):
1. "After confirming (x+2) is a factor of P(x), what is the next step?" / "Divide P(x) by (x+2) to find the quotient Q(x)" / wrong: ["Multiply P(x) by (x+2)", "Evaluate P(2)"]
2. "If P(x) is degree 3 and (x-c) is a factor, what degree is the cofactor Q(x)?" / "Degree 2 (quadratic)" / wrong: ["Degree 3", "Degree 1"]
3. "How do you express P(x) as a product?" / "P(x) = (x - c) * Q(x)" / wrong: ["P(x) = Q(x) + R(x)", "P(x) = (x-c) + Q(x)"]

### 1d. Revisions to existing commands

**`division-algorithm`**: Keep as-is but update `dom` from `'polynomials'` to `'division-methods'` for consistency with the new commands.

**`remainder-theorem`**: Add one more blank targeting the sign-flip trap:
- `latex: 'P(x) \\div (x + 2) \\implies \\text{R} = P(\\boxed{\\,?\\,})'`
- `answer: '-2'`, choices: `['-2', '2', '0']`

**`factor-theorem`**: Add subconcept targeting the "converse trap":
- Replace weakest existing subconcept with: "If P(c) != 0, what can you conclude about (x-c)?" / "It is NOT a factor of P(x)" / wrong: ["It is still a factor", "Cannot determine"]

---

## 2. `generateQuestion()` — Replace with weighted system

**Delete** the Gemini uniform-random picker. **Copy** the weighted `generateQuestion` from `ap-stats-cartridge.js` (lines 766-846+). It already handles:
- Difficulty-based weight tables (learn/practice/challenge)
- Weight renormalization over available types per command
- `relationship` type generation (Gemini omitted this entirely)
- Same-domain distractor prioritization for identify questions
- ConfusionSet-based distractors for application questions
- `stripNot()` helper for cleaning action names

Only change needed: replace `G.difficulty` reference with whatever the engine exposes (check if `G` is a global in the engine — if so, keep as-is).

Also add the **empty-bank guard** flagged by ChatGPT:
- Gate `variable` type on `this.variableBank[cmd.id]?.length > 0` (not just truthy)
- Gate `application` type on `this.applicationBank[cmd.id]?.length > 0`
- Gate `relationship` type on `this.relationshipBank[cmd.id]?.length > 0`

---

## 3. Application Bank — Rewrite + Expand

**Critical fix from Claude's analysis**: current scenarios give away the answer by naming the method. Rewrite all scenarios so the student must *choose* which method/theorem applies.

```javascript
const APPLICATION_BANK = {
  'long-division': [
    {
      scenario: 'A cubic polynomial needs to be divided by a linear binomial, and you must show the full quotient-plus-remainder expression.',
      confusionSet: ['synthetic-division', 'division-algorithm', 'remainder-theorem']
    },
    {
      scenario: 'You need to simplify (x^3 + 2x^2 - 5x + 1) / (x - 1) and express the result as a polynomial plus a fraction.',
      confusionSet: ['synthetic-division', 'factor-with-division', 'division-algorithm']
    }
  ],
  'synthetic-division': [
    {
      scenario: 'You need a quick way to find the quotient and remainder when dividing a degree-4 polynomial by (x - 3), using only its coefficients.',
      confusionSet: ['long-division', 'remainder-theorem', 'division-algorithm']
    },
    {
      scenario: 'Morgan sets up a table with the divisor root and the polynomial coefficients to compute a quotient row.',
      confusionSet: ['long-division', 'remainder-theorem', 'factor-theorem']
    }
  ],
  'division-algorithm': [
    {
      scenario: 'You want to verify that your division was correct by checking that dividend equals divisor times quotient plus remainder.',
      confusionSet: ['remainder-theorem', 'long-division', 'factor-theorem']
    }
  ],
  'remainder-theorem': [
    {
      scenario: 'Without performing full division, you need to find the remainder when a polynomial is divided by a linear binomial.',
      confusionSet: ['factor-theorem', 'synthetic-division', 'long-division']
    },
    {
      scenario: 'A teacher asks you to verify that the remainder from your division matches the value you get by direct substitution.',
      confusionSet: ['factor-theorem', 'division-algorithm', 'factor-with-division']
    }
  ],
  'factor-theorem': [
    {
      scenario: 'You need to determine whether a given linear binomial is a factor of a polynomial, without actually dividing.',
      confusionSet: ['remainder-theorem', 'factor-with-division', 'synthetic-division']
    }
  ],
  'factor-with-division': [
    {
      scenario: 'You know that (x+2) is a factor of a cubic, and you need to find the quadratic that completes the factorization.',
      confusionSet: ['factor-theorem', 'long-division', 'synthetic-division']
    },
    {
      scenario: 'After confirming P(c) = 0, you need to express P(x) as a product of two polynomials.',
      confusionSet: ['factor-theorem', 'remainder-theorem', 'division-algorithm']
    }
  ]
};
```

Key improvements:
- Every confusionSet now has **3 entries** (Gemini had only 2, which produced "Unknown Theorem" fillers)
- No scenario names the method — students must infer from context
- Scenarios model real quiz phrasing patterns

---

## 4. Variable Bank — Expand for new commands

```javascript
const VARIABLE_BANK = {
  'long-division': [
    { s: 'P(x)', d: 'the dividend polynomial being divided' },
    { s: 'D(x)', d: 'the divisor (what you divide by)' },
    { s: 'Q(x)', d: 'the quotient polynomial result' }
  ],
  'synthetic-division': [
    { s: 'c', d: 'the root of the linear divisor (x-c)' },
    { s: 'a_n', d: 'leading coefficient of the dividend' },
    { s: 'R', d: 'the last entry in the bottom row (remainder)' }
  ],
  'division-algorithm': [
    { s: 'P(x)', d: 'dividend polynomial' },
    { s: 'D(x)', d: 'divisor polynomial' },
    { s: 'Q(x)', d: 'quotient polynomial' },
    { s: 'R(x)', d: 'remainder polynomial' }
  ],
  'remainder-theorem': [
    { s: 'c', d: 'the value substituted into P(x) to find the remainder' },
    { s: 'P(c)', d: 'the remainder when dividing by (x-c)' }
  ],
  'factor-theorem': [
    { s: '(x-c)', d: 'the linear binomial factor being tested' },
    { s: '0', d: 'the remainder value that confirms a factor' }
  ],
  'factor-with-division': [
    { s: 'Q(x)', d: 'the cofactor (quotient after dividing out the known factor)' },
    { s: '(x-c)', d: 'the known linear factor' },
    { s: 'P(x)', d: 'the original polynomial being factored' }
  ]
};
```

---

## 5. Relationship Bank — Expand from 1 entry to 4

```javascript
const RELATIONSHIP_BANK = {
  'division-algorithm': [
    {
      input: 'Degree of D(x)',
      output: 'Maximum degree of R(x)',
      direction: 'increases',
      explain: 'The remainder must always have a degree strictly less than the divisor.'
    }
  ],
  'long-division': [
    {
      input: 'Degree of the dividend',
      output: 'Number of division steps required',
      direction: 'increases',
      explain: 'Each step reduces the dividend degree by 1 until remainder degree < divisor degree.'
    }
  ],
  'remainder-theorem': [
    {
      input: 'Value of c in P(c)',
      output: 'Remainder when dividing by (x-c)',
      direction: 'increases',
      explain: 'Changing c changes which point on the polynomial you evaluate; the remainder is P(c).'
    }
  ],
  'factor-theorem': [
    {
      input: 'P(c) (the evaluated result)',
      output: 'Whether (x-c) is a factor',
      direction: 'decreases',
      explain: 'As P(c) approaches 0, (x-c) approaches being a factor; at exactly 0, it IS a factor.'
    }
  ]
};
```

---

## 6. Explanation Glossary — Expand for new symbols

Add entries for new symbols introduced by the 3 new commands:

```javascript
// ADD to existing glossary array:
{
  keys: ['long division', 'polynomial long division'],
  title: 'Long Division',
  lines: ['Systematic algorithm for dividing polynomials.', 'Works for any divisor, not just linear.', 'Produces quotient Q(x) and remainder R(x).']
},
{
  keys: ['synthetic division', 'synthetic'],
  title: 'Synthetic Division',
  lines: ['Shortcut using only coefficients.', 'Only works when dividing by a linear binomial (x-c).', 'Use the root c (not the divisor itself) in the box.']
},
{
  keys: ['cofactor', 'q(x) cofactor'],
  title: 'Cofactor Q(x)',
  lines: ['The quotient when a known factor is divided out.', 'If P(x) = (x-c)*Q(x), then Q(x) is the cofactor.', 'Its degree is one less than P(x).']
},
{
  keys: ['placeholder', 'zero coefficient', 'missing term'],
  title: 'Zero Placeholder',
  lines: ['Insert 0 for any missing degree term.', 'Required in both long division and synthetic division.', 'Forgetting this shifts all subsequent terms incorrectly.']
}
```

---

## 7. AUTO_BLANK_SPECS — Populate (currently empty)

Add regex-based auto-blank patterns relevant to polynomial division notation:

```javascript
const AUTO_BLANK_SPECS = [
  { match: 'Q(x)', choices: ['Q(x)', 'R(x)', 'D(x)'] },
  { match: 'R(x)', choices: ['R(x)', 'Q(x)', 'P(x)'] },
  { match: 'D(x)', choices: ['D(x)', 'P(x)', 'Q(x)'] },
  { match: 'P(c)', choices: ['P(c)', 'P(x)', '0'] },
  { regex: /(?<![_\w])0(?![_\w.])/u, answer: '0', choices: ['0', '1', 'c'] }
];
```

---

## 8. DOM_LABELS — Update for two domains

```javascript
const DOM_LABELS = {
  'division-methods': ['Lesson 3-4 - Division Methods'],
  'theorems': ['Lesson 3-4 - Division Theorems']
};
```

---

## 9. Prerequisite DAG — Expand

### New shared prereq nodes (L2+)

```javascript
const SHARED_PREREQ_NODES = {
  // Existing (keep):
  'eval-poly': { ... },      // evaluating polynomials
  'poly-degree': { ... },    // understanding degree
  'division-concept': { ... }, // what is a quotient

  // NEW:
  'sign-of-c': {
    id: 'sign-of-c', type: 'conceptual', level: 2,
    q: 'When dividing by (x + 3), what value of c do you use in synthetic division?',
    correct: '-3 (rewrite as x - (-3))',
    wrong: ['3', '+3'],
    prereqs: []
  },
  'zero-placeholder': {
    id: 'zero-placeholder', type: 'conceptual', level: 2,
    q: 'If a polynomial is missing the x^2 term, what coefficient must you use for it?',
    correct: '0',
    wrong: ['1', 'Skip it'],
    prereqs: []
  },
  'degree-reduction': {
    id: 'degree-reduction', type: 'conceptual', level: 2,
    q: 'If P(x) has degree 4 and you divide by (x-c), what degree is the quotient?',
    correct: 'Degree 3 (one less)',
    wrong: ['Degree 4', 'Degree 2'],
    prereqs: ['poly-degree']
  },
  'factor-vs-remainder': {
    id: 'factor-vs-remainder', type: 'conceptual', level: 2,
    q: 'What distinguishes the Factor Theorem from the Remainder Theorem?',
    correct: 'Factor Theorem is the special case where the remainder equals 0',
    wrong: ['They are completely unrelated', 'Factor Theorem works for quadratic divisors'],
    prereqs: []
  },
  'multiply-add-step': {
    id: 'multiply-add-step', type: 'computational', level: 3,
    q: 'In synthetic division, if the current bottom-row value is 3 and c = 2, what goes in the next column above the line?',
    correct: '6 (multiply 3 by 2)',
    wrong: ['5 (add 3 and 2)', '1 (subtract)'],
    prereqs: ['eval-poly']
  },
  'leading-term-division': {
    id: 'leading-term-division', type: 'computational', level: 3,
    q: 'What is x^3 divided by x?',
    correct: 'x^2',
    wrong: ['x^3', 'x'],
    prereqs: ['poly-degree']
  }
};
```

### Updated `wireL1toL2` rules

```javascript
function wireL1toL2(PREREQ_DAG) {
  const rules = [
    [/evaluate|P\(3\)|P\(-2\)|P\(c\)|value|substitut/i, ['eval-poly']],
    [/degree/i, ['poly-degree']],
    [/divisor|factor|divide|quotient|Q\(x\)|D\(x\)/i, ['division-concept']],
    // NEW rules:
    [/sign|x\s*\+|x\s*-|\(x\+|\(x-|rewrite.*c/i, ['sign-of-c']],
    [/missing.*term|placeholder|zero.*coefficient|insert.*0/i, ['zero-placeholder']],
    [/degree.*quotient|one.*less|degree.*reduction/i, ['degree-reduction']],
    [/factor.*theorem.*vs|remainder.*0.*factor|special.*case/i, ['factor-vs-remainder']],
    [/multiply.*add|bring.*down|synthetic.*step/i, ['multiply-add-step']],
    [/leading.*term|first.*step.*division|divide.*leading/i, ['leading-term-division']]
  ];

  for (const node of Object.values(PREREQ_DAG)) {
    if (node.level !== 1 || !node.autoGen || node.prereqs.length > 0) continue;
    const matched = new Set();
    for (const [re, ids] of rules) {
      if (re.test(node.q) || re.test(node.correct)) {
        ids.forEach(id => { if (PREREQ_DAG[id]) matched.add(id); });
      }
    }
    if (matched.size > 0) node.prereqs = [...matched];
  }
}
```

---

## 10. Engine Alignment Fixes

These are structural issues flagged by both analyses that must be fixed regardless of content:

### 10a. Add missing helper functions

The dummy cartridge exports `normalizeExplanationLookup` and `buildExplanationBank`. The Gemini cartridge omits them. Add stubs matching the dummy pattern:

```javascript
MY_CARTRIDGE.normalizeExplanationLookup = function(s) {
  return s.toLowerCase().trim();
};
MY_CARTRIDGE.buildExplanationBank = function() {
  return { byId: {}, byLabel: {} };
};
```

### 10b. `validateBlank` — Strengthen normalization

Current normalization strips `()` which will break answers like `(x-c)` and `(1-p)`. Fix:

```javascript
validateBlank(input, answer) {
  function norm(s) {
    return s.trim().toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[\\{}_]/g, '')  // strip LaTeX formatting but KEEP parens
      .replace(/\^/g, '');      // strip caret for exponents
  }
  // Also check common aliases
  const aliases = {
    'xbar': 'x-bar', 'phat': 'p-hat',
    'multiplythenadd': 'multiply then add'
  };
  const ni = norm(input), na = norm(answer);
  return ni === na || aliases[ni] === na || aliases[na] === ni;
}
```

### 10c. Cartridge export — Use TD_CARTRIDGES pattern

Keep the `window.TD_CARTRIDGES` push pattern from Gemini's draft. Also export as `window.ALG2_POLYNOMIALS_CARTRIDGE` (keep existing global name).

---

## 11. Distractor Engineering Guidance

When implementing application questions that mirror quiz items computationally, use these **systematic error models** (from ChatGPT analysis) rather than random wrong answers:

| Error type | How to generate distractor |
|------------|---------------------------|
| **Sign flip** | Use `c` instead of `-c` (e.g., evaluate P(2) instead of P(-2) for divisor x+2) |
| **Missing zero coefficient** | Omit placeholder 0, producing shifted quotient |
| **Remainder as constant** | Add remainder as constant term instead of fraction over divisor |
| **Stopped too early** | Remainder still has degree >= divisor degree |
| **RT/FT confusion** | Claim "is a factor" when remainder != 0, or "not a factor" when remainder = 0 |
| **Quotient degree error** | Report quotient with same degree as dividend instead of one less |

---

## 12. Validation Checklist (for Codex to run post-implementation)

1. `node --check alg2-dividing-polynomials-cartridge.js` passes
2. 6 commands present, each with: id, action, tier, dom, hint, explain, latex, blanks[], subconcepts[3]
3. `validateBlank(blank.answer, blank.choices[0])` returns `true` for **every** blank
4. No duplicate choices after normalization on any blank
5. VARIABLE_BANK entry for all 6 commands (2-3 vars each)
6. APPLICATION_BANK entry for all 6 commands (1-2 scenarios, no answer giveaways)
7. RELATIONSHIP_BANK entries where applicable (at least 4)
8. EXPLANATION_GLOSSARY covers every symbol appearing as a blank answer
9. All confusionSet IDs reference valid command IDs
10. 0 unwired subconcepts after wireL1toL2
11. 0 dangling prereq refs
12. 0 DAG cycles
13. `generateQuestion` uses weighted type selection (not uniform random)
14. `generateQuestion` includes `relationship` type
15. Empty-bank guards: gated on `.length > 0`, not just truthy
16. `normalizeExplanationLookup` and `buildExplanationBank` are attached to cartridge
17. Output file name: `alg2-dividing-polynomials-cartridge.js`

---

## 13. File Output

**Single file**: `alg2-dividing-polynomials-cartridge.js`
**Pattern**: Self-contained IIFE matching `ap-stats-cartridge.js` structure
**Global export**: `window.ALG2_POLYNOMIALS_CARTRIDGE` + push to `window.TD_CARTRIDGES`
