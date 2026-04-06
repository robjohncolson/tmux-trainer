# Spec: DAG Extension — Full Arithmetic-to-Equation Scaffolding

**Cartridge**: `alg2-dividing-polynomials-cartridge.js`
**Revision**: v2 — replaces the original spec. Previous version had the right floor (arithmetic leaves) but missing rungs going back UP. This version fills every gap so the path from "7 x 8" to "divide a cubic by (x+3)" is a smooth, intuitive staircase.
**Problem**: Current DAG has 9 nodes, 7 conceptual, 7 dead-ends. No computational scaffolding at all — a student who can't evaluate P(-2) just gets told "substitute c for x" and hits a wall.
**Goal**: 9 existing + 28 new = **37 nodes** across levels 2-5. Four complete skill strands that build from bedrock arithmetic to equation-level fluency. Every node below L2 uses **concrete numbers and real computation**. Target: Algebra 2 students at a Title 1 school with shaky foundations.

---

## Design Principle: Four Skill Strands

The 6 commands decompose into 4 strands that share arithmetic foundations but diverge at the pre-algebra level. Each strand is a complete ladder — no rungs missing.

| Strand | Supports commands | Core skill chain |
|--------|-------------------|------------------|
| **Evaluation** | remainder-theorem, factor-theorem | multiply → powers → negative powers → evaluate one term → two terms → three terms → full polynomial |
| **Poly Arithmetic** | long-division, division-algorithm | multiply → distribute → multiply mono×binomial → subtract polys → reverse (division as undo) → one division step |
| **Synthetic Mechanics** | synthetic-division | multiply → multiply+add → chain two steps → read the result row |
| **Factor Connection** | factor-theorem, factor-with-division | evaluation strand → "P(c)=0 means factor" → "P(c)≠0 means not factor" → "factor implies P(c)=0" |

---

## Level 5 — Bedrock Arithmetic (3 leaf nodes)

If a student misses these, the game has found the floor.

```javascript
'mult-whole': {
  id: 'mult-whole', type: 'computational', level: 5,
  q: '7 × 8 = ?',
  correct: '56',
  wrong: ['54', '48'],
  prereqs: []
}
```
- Wrong 54: off-by-two (common mental slip on 7×8)
- Wrong 48: confused with 6×8

```javascript
'add-whole': {
  id: 'add-whole', type: 'computational', level: 5,
  q: '14 + 9 = ?',
  correct: '23',
  wrong: ['22', '25'],
  prereqs: []
}
```
- Wrong 22: forgot to carry
- Wrong 25: added 11 instead of 9

```javascript
'sub-whole': {
  id: 'sub-whole', type: 'computational', level: 5,
  q: '23 − 8 = ?',
  correct: '15',
  wrong: ['13', '17'],
  prereqs: []
}
```
- Wrong 13/17: off-by-two in either direction

---

## Level 4 — Signed Number Operations + Basic Exponents (6 nodes)

These bridge from whole numbers to the signed arithmetic that polynomial evaluation demands.

```javascript
'mult-by-negative': {
  id: 'mult-by-negative', type: 'computational', level: 4,
  q: '(−3) × 5 = ?',
  correct: '−15',
  wrong: ['15', '−8'],
  prereqs: ['mult-whole']
}
```
- Wrong 15: dropped the negative sign
- Wrong −8: added instead of multiplied

```javascript
'neg-times-neg': {
  id: 'neg-times-neg', type: 'computational', level: 4,
  q: '(−4) × (−6) = ?',
  correct: '24',
  wrong: ['−24', '−10'],
  prereqs: ['mult-whole']
}
```
- Wrong −24: "two negatives stay negative" error
- Wrong −10: added magnitudes with wrong sign

```javascript
'add-negatives': {
  id: 'add-negatives', type: 'computational', level: 4,
  q: '−7 + (−5) = ?',
  correct: '−12',
  wrong: ['−2', '12'],
  prereqs: ['add-whole']
}
```
- Wrong −2: subtracted magnitudes instead of adding
- Wrong 12: dropped both negatives

```javascript
'sub-a-negative': {
  id: 'sub-a-negative', type: 'computational', level: 4,
  q: '8 − (−3) = ?',
  correct: '11',
  wrong: ['5', '−11'],
  prereqs: ['sub-whole']
}
```
- Wrong 5: subtracted normally, missed the double-negative
- Wrong −11: flipped the sign of everything

```javascript
'square-a-number': {
  id: 'square-a-number', type: 'computational', level: 4,
  q: '4² = ?',
  correct: '16',
  wrong: ['8', '12'],
  prereqs: ['mult-whole']
}
```
- Wrong 8: doubled instead of squaring (4×2)
- Wrong 12: tripled instead (4×3)

```javascript
'cube-a-number': {
  id: 'cube-a-number', type: 'computational', level: 4,
  q: '2³ = ?',
  correct: '8',
  wrong: ['6', '9'],
  prereqs: ['mult-whole']
}
```
- Wrong 6: tripled instead of cubing (2×3)
- Wrong 9: confused with 3²

---

## Level 3 — Pre-Algebra Computation (16 nodes)

This is the biggest layer. It bridges signed arithmetic to polynomial-level work through four sub-strands.

### Strand A: Powers of Negatives → Evaluation Chain

```javascript
'neg-odd-power': {
  id: 'neg-odd-power', type: 'computational', level: 3,
  q: '(−2)³ = ?',
  correct: '−8',
  wrong: ['8', '−6'],
  prereqs: ['cube-a-number', 'mult-by-negative']
}
```
- Wrong 8: forgot odd power keeps the negative
- Wrong −6: tripled instead of cubing

```javascript
'neg-even-power': {
  id: 'neg-even-power', type: 'computational', level: 3,
  q: '(−3)² = ?',
  correct: '9',
  wrong: ['−9', '6'],
  prereqs: ['square-a-number', 'neg-times-neg']
}
```
- Wrong −9: "squaring a negative stays negative" error
- Wrong 6: doubled instead of squaring

```javascript
'eval-monomial': {
  id: 'eval-monomial', type: 'computational', level: 3,
  q: 'If x = 3, what is 2x² ?',
  correct: '18',
  wrong: ['12', '36'],
  prereqs: ['square-a-number', 'mult-whole']
}
```
- Wrong 12: computed 2×3×2 (didn't square first)
- Wrong 36: computed (2×3)² instead of 2×(3²)

```javascript
'eval-neg-substitution': {
  id: 'eval-neg-substitution', type: 'computational', level: 3,
  q: 'If x = −2, what is x³ ?',
  correct: '−8',
  wrong: ['8', '−6'],
  prereqs: ['neg-odd-power']
}
```

```javascript
'coeff-times-power': {
  id: 'coeff-times-power', type: 'computational', level: 3,
  q: '2 · (−2)³ = ?',
  correct: '−16',
  wrong: ['16', '−12'],
  prereqs: ['neg-odd-power', 'mult-by-negative']
}
```
- Wrong 16: dropped negative from (−2)³ = −8
- Wrong −12: computed 2·(−6) — tripled instead of cubed

```javascript
'eval-two-terms': {
  id: 'eval-two-terms', type: 'computational', level: 3,
  q: 'If x = 2, what is x² + 3x ?',
  correct: '10',
  wrong: ['8', '14'],
  prereqs: ['eval-monomial', 'add-whole']
}
```
- Wrong 8: only computed x² = 4, then added 4 (forgot the 3x)
- Wrong 14: computed 2² + 3(2²) — misapplied exponent

```javascript
'eval-three-terms': {
  id: 'eval-three-terms', type: 'computational', level: 3,
  q: 'If x = −1, what is 2x² − 3x + 1 ?',
  correct: '6',
  wrong: ['0', '−4'],
  prereqs: ['neg-even-power', 'mult-by-negative', 'add-negatives']
}
```
- Steps: 2(1) − 3(−1) + 1 = 2 + 3 + 1 = 6
- Wrong 0: computed 2(1) − 3(1) + 1 (forgot x is negative in −3x)
- Wrong −4: computed 2(−1) − 3(−1) + 1 (didn't square, used x directly)

### Strand B: Polynomial Arithmetic → Division Steps

```javascript
'combine-like-terms': {
  id: 'combine-like-terms', type: 'computational', level: 3,
  q: '5x + 3x = ?',
  correct: '8x',
  wrong: ['15x', '53x'],
  prereqs: ['add-whole']
}
```
- Wrong 15x: multiplied coefficients
- Wrong 53x: concatenated digits

```javascript
'distribute-monomial': {
  id: 'distribute-monomial', type: 'computational', level: 3,
  q: '3(x + 4) = ?',
  correct: '3x + 12',
  wrong: ['3x + 4', '7x'],
  prereqs: ['mult-whole', 'add-whole']
}
```
- Wrong 3x + 4: only distributed to the x
- Wrong 7x: added 3 + 4 = 7 and slapped an x on it

```javascript
'subtract-polynomials': {
  id: 'subtract-polynomials', type: 'computational', level: 3,
  q: '(3x² + 2x) − (x² + 5x) = ?',
  correct: '2x² − 3x',
  wrong: ['4x² + 7x', '2x² + 3x'],
  prereqs: ['sub-whole', 'sub-a-negative']
}
```
- Wrong 4x² + 7x: added everything instead of subtracting
- Wrong 2x² + 3x: subtracted x² terms right but forgot to negate the 5x

```javascript
'mult-mono-by-binomial': {
  id: 'mult-mono-by-binomial', type: 'computational', level: 3,
  q: 'x · (x + 3) = ?',
  correct: 'x² + 3x',
  wrong: ['x² + 3', '2x + 3'],
  prereqs: ['distribute-monomial']
}
```
- Wrong x² + 3: only multiplied x by the first term
- Wrong 2x + 3: added x to each instead of multiplying

```javascript
'reverse-distribute': {
  id: 'reverse-distribute', type: 'computational', level: 3,
  q: 'If x(x + 3) = x² + 3x, then (x² + 3x) ÷ x = ?',
  correct: 'x + 3',
  wrong: ['x + 3x', 'x²'],
  prereqs: ['mult-mono-by-binomial']
}
```
- This is THE bridge from multiplication to division — undoing distribution
- Wrong x + 3x: divided only the first term
- Wrong x²: divided only the second term's coefficient

### Strand C: Synthetic Division Chain

```javascript
'synth-chain-step': {
  id: 'synth-chain-step', type: 'computational', level: 3,
  q: 'Synthetic division: bring down 1, multiply by 2 to get 2, add to the next coefficient 1 to get 3. What is the next product (3 × 2)?',
  correct: '6',
  wrong: ['5', '3'],
  prereqs: ['mult-by-negative', 'add-negatives']
}
```
- Tests the "multiply then add" loop with a follow-up step
- Wrong 5: added 3+2 instead of multiplying
- Wrong 3: didn't multiply at all, just carried forward

### Strand D: Factor Theorem Concrete Bridge

```javascript
'zero-means-factor': {
  id: 'zero-means-factor', type: 'computational', level: 3,
  q: 'You evaluate P(2) and get 0. Is (x − 2) a factor of P(x)?',
  correct: 'Yes, because the remainder is 0',
  wrong: ['No, because 2 is positive', 'Only if P(x) is quadratic'],
  prereqs: ['eval-three-terms']
}
```

```javascript
'nonzero-not-factor': {
  id: 'nonzero-not-factor', type: 'computational', level: 3,
  q: 'You evaluate P(3) and get 5. Is (x − 3) a factor of P(x)?',
  correct: 'No, the remainder is 5, not 0',
  wrong: ['Yes, because 5 is close to 0', 'Yes, because P(3) exists'],
  prereqs: ['eval-three-terms']
}
```

```javascript
'factor-implies-zero': {
  id: 'factor-implies-zero', type: 'computational', level: 3,
  q: 'You are told (x + 2) is a factor of P(x). What must P(−2) equal?',
  correct: '0',
  wrong: ['2', '−2'],
  prereqs: ['zero-means-factor', 'sub-a-negative']
}
```
- This tests the converse AND the sign flip (x+2 means c = −2)
- Wrong 2: used +2 instead of −2 for c
- Wrong −2: confused the c value with the P(c) output

---

## Level 2 — Equation-Level Bridge Nodes (3 new nodes)

These sit right below L1 subconcepts and test full procedures with specific numbers.

```javascript
'eval-full-poly': {
  id: 'eval-full-poly', type: 'computational', level: 2,
  q: 'Evaluate P(x) = 2x³ − x² + 4x + 5 at x = −2',
  correct: '−23',
  wrong: ['−7', '33'],
  prereqs: ['coeff-times-power', 'eval-three-terms', 'add-negatives']
}
```
- This is Quiz Q3 from the actual enVision quiz (verbatim polynomial and value)
- Steps: 2(−8) − (4) + (−8) + 5 = −16 − 4 − 8 + 5 = −23
- Wrong −7: sign error on the −x² term (used +4 instead of −4)
- Wrong 33: evaluated at x=+2 instead of x=−2

```javascript
'read-synth-result': {
  id: 'read-synth-result', type: 'computational', level: 2,
  q: 'Synthetic division bottom row: [1, 3, 0, −4, 0]. The last number is the remainder. What is the quotient?',
  correct: 'x³ + 3x² − 4',
  wrong: ['x⁴ + 3x³ − 4x', 'x² + 3x − 4'],
  prereqs: ['synth-chain-step', 'combine-like-terms']
}
```
- This is Quiz Q2 — reading the synthetic division result
- Wrong x⁴+3x³−4x: used wrong starting degree (should be one less than original)
- Wrong x²+3x−4: dropped another degree (two less, not one less)

```javascript
'one-div-step': {
  id: 'one-div-step', type: 'computational', level: 2,
  q: 'Long division first step: x³ ÷ x = x². Then x²(x+3) = x³+3x². Subtract from x³+x²: what remains?',
  correct: '−2x²',
  wrong: ['4x²', '2x²'],
  prereqs: ['leading-term-division', 'mult-mono-by-binomial', 'subtract-polynomials']
}
```
- This walks through Q1's first iteration with real coefficients
- Steps: (x³ + x²) − (x³ + 3x²) = −2x²
- Wrong 4x²: added instead of subtracted
- Wrong 2x²: subtracted but dropped the negative sign

---

## Updates to 9 Existing Nodes (prereqs only)

Every existing dead-end now wires through the new computational nodes.

| Node | Old prereqs | New prereqs | Rationale |
|------|-------------|-------------|-----------|
| `eval-poly` | `[]` | `['eval-full-poly']` | The concrete version of "substitute and simplify" |
| `poly-degree` | `[]` | `['square-a-number', 'cube-a-number']` | "Highest power" means nothing if you can't compute powers |
| `division-concept` | `[]` | `['reverse-distribute', 'one-div-step']` | Quotient = "what I multiply divisor by"; bridges to actual division step |
| `sign-of-c` | `[]` | `['sub-a-negative']` | Rewriting (x+3) as (x−(−3)) IS subtracting a negative |
| `zero-placeholder` | `[]` | `['combine-like-terms']` | Missing terms need 0 because like terms must align |
| `degree-reduction` | `['poly-degree']` | `['poly-degree', 'read-synth-result']` | See it concretely: degree-4 input → bottom row has degree-3 quotient |
| `factor-vs-remainder` | `[]` | `['zero-means-factor', 'nonzero-not-factor']` | Concrete: "P(c)=0 → factor, P(c)≠0 → not factor" |
| `multiply-add-step` | `['eval-poly']` | `['mult-by-negative', 'add-negatives']` | Actual skill: multiply signed number, then add — not abstract evaluation |
| `leading-term-division` | `['poly-degree']` | `['square-a-number']` | x³÷x=x² only makes sense if you know what x² means |

---

## Updated wireL1toL2 Rules

Append these 8 rules (don't remove existing 9):

```javascript
[/multiply|product|times/i, ['mult-mono-by-binomial', 'distribute-monomial']],
[/subtract|minus|change.*sign/i, ['subtract-polynomials']],
[/combin|like.*term|collect/i, ['combine-like-terms']],
[/exponent|power|squared|cubed/i, ['neg-even-power', 'neg-odd-power']],
[/negative|−|sign.*flip/i, ['sub-a-negative', 'mult-by-negative']],
[/distribut|expand/i, ['distribute-monomial']],
[/P\(\-?\d\)\s*=\s*0|is.*factor|not.*factor/i, ['zero-means-factor', 'nonzero-not-factor']],
[/quotient.*row|bottom.*row|read.*result/i, ['read-synth-result']]
```

---

## Full Wiring Map

```
L0  COMMANDS (6)
    │
L1  SUBCONCEPTS (18, auto-generated, wired by wireL1toL2)
    │
L2  eval-poly ─────────────→ eval-full-poly ──┬→ coeff-times-power (L3)
    │                                          ├→ eval-three-terms (L3)
    │                                          └→ add-negatives (L4)
    │
    poly-degree ────────────┬→ square-a-number (L4)
    │                       └→ cube-a-number (L4)
    │
    division-concept ───────┬→ reverse-distribute (L3) → mult-mono-by-binom (L3)
    │                       └→ one-div-step (L2) ──┬→ leading-term-div (L3)
    │                                              ├→ mult-mono-by-binom (L3)
    │                                              └→ subtract-polys (L3)
    │
    sign-of-c ──────────────→ sub-a-negative (L4) → sub-whole (L5)
    │
    zero-placeholder ───────→ combine-like-terms (L3) → add-whole (L5)
    │
    degree-reduction ───────┬→ poly-degree (L2)
    │                       └→ read-synth-result (L2) → synth-chain-step (L3)
    │
    factor-vs-remainder ────┬→ zero-means-factor (L3) → eval-three-terms (L3)
    │                       └→ nonzero-not-factor (L3) → eval-three-terms (L3)
    │
    multiply-add-step ──────┬→ mult-by-negative (L4) → mult-whole (L5)
    │                       └→ add-negatives (L4) → add-whole (L5)
    │
    leading-term-division ──→ square-a-number (L4) → mult-whole (L5)
    │
    eval-full-poly (NEW) ───┬→ coeff-times-power (L3)
    │                       ├→ eval-three-terms (L3)
    │                       └→ add-negatives (L4)
    │
    read-synth-result (NEW) ┬→ synth-chain-step (L3)
    │                       └→ combine-like-terms (L3)
    │
    one-div-step (NEW) ─────┬→ leading-term-division (L3)
    │                       ├→ mult-mono-by-binomial (L3)
    │                       └→ subtract-polynomials (L3)
    │
L3  EVALUATION STRAND:
    neg-odd-power ──────────┬→ cube-a-number (L4)
    │                       └→ mult-by-negative (L4)
    neg-even-power ─────────┬→ square-a-number (L4)
    │                       └→ neg-times-neg (L4)
    eval-monomial ──────────┬→ square-a-number (L4)
    │                       └→ mult-whole (L5)
    eval-neg-substitution ──→ neg-odd-power (L3)
    coeff-times-power ──────┬→ neg-odd-power (L3)
    │                       └→ mult-by-negative (L4)
    eval-two-terms ─────────┬→ eval-monomial (L3)
    │                       └→ add-whole (L5)
    eval-three-terms ───────┬→ neg-even-power (L3)
    │                       ├→ mult-by-negative (L4)
    │                       └→ add-negatives (L4)
    │
    POLY ARITHMETIC STRAND:
    combine-like-terms ─────→ add-whole (L5)
    distribute-monomial ────┬→ mult-whole (L5)
    │                       └→ add-whole (L5)
    subtract-polynomials ───┬→ sub-whole (L5)
    │                       └→ sub-a-negative (L4)
    mult-mono-by-binomial ──→ distribute-monomial (L3)
    reverse-distribute ─────→ mult-mono-by-binomial (L3)
    │
    SYNTHETIC STRAND:
    synth-chain-step ───────┬→ mult-by-negative (L4)
    │                       └→ add-negatives (L4)
    │
    FACTOR BRIDGE STRAND:
    zero-means-factor ──────→ eval-three-terms (L3)
    nonzero-not-factor ─────→ eval-three-terms (L3)
    factor-implies-zero ────┬→ zero-means-factor (L3)
    │                       └→ sub-a-negative (L4)
    │
L4  mult-by-negative ──────→ mult-whole (L5)
    neg-times-neg ──────────→ mult-whole (L5)
    add-negatives ──────────→ add-whole (L5)
    sub-a-negative ─────────→ sub-whole (L5)
    square-a-number ────────→ mult-whole (L5)
    cube-a-number ──────────→ mult-whole (L5)
    │
L5  mult-whole ─── add-whole ─── sub-whole   (LEAVES)
```

Every command → every L1 subconcept → L2 node → ... → L5 leaf. Zero dead ends. Zero gaps.

---

## Complete Strand Walkthroughs

### "How does a student get from 7×8 to evaluating P(−2)?"

```
mult-whole: 7 × 8 = 56
    ���
mult-by-negative: (−3) × 5 = −15
    ↓
cube-a-number: 2³ = 8
    ↓
neg-odd-power: (−2)³ = −8
    ↓
coeff-times-power: 2·(−2)³ = −16
    ↓
eval-three-terms: If x=−1, what is 2x²−3x+1? → 6
    ↓
eval-full-poly: Evaluate 2x³−x²+4x+5 at x=−2 → −23
    ↓
eval-poly: "What does it mean to evaluate P(c)?"
    ↓
L1 subconcept: "To find the remainder, evaluate P(c)"
    ↓
L0: Remainder Theorem command
```

### "How does a student get from 7×8 to long division?"

```
mult-whole: 7 × 8 = 56
    ↓
distribute-monomial: 3(x+4) = 3x+12
    ↓
mult-mono-by-binomial: x(x+3) = x²+3x
    ↓
reverse-distribute: (x²+3x) ÷ x = x+3
    ↓
subtract-polynomials: (x³+x²) − (x³+3x²) = −2x²
    ↓
one-div-step: full first iteration of long division
    ↓
division-concept: "What does a quotient represent?"
    ↓
L1 subconcept: "First step of long division?"
    ↓
L0: Polynomial Long Division command
```

### "How does a student get from 7×8 to the Factor Theorem?"

```
mult-whole: 7 × 8 = 56
    ↓
square-a-number: 4² = 16
    ↓
neg-even-power: (−3)² = 9
    ↓
eval-three-terms: If x=−1, 2x²−3x+1 = 6
    ↓
zero-means-factor: P(2)=0, so (x−2) IS a factor
    ↓
factor-implies-zero: (x+2) is a factor → P(−2) must = 0
    ↓
factor-vs-remainder: "FT is the special case where remainder = 0"
    ↓
L1 subconcept: "If P(c)=0, what about (x−c)?"
    ↓
L0: Factor Theorem command
```

---

## Node Count Summary

| Level | Existing | New | Total | Type |
|-------|----------|-----|-------|------|
| L2 | 7 (updated prereqs) | 3 | 10 | 3 computational, 7 conceptual |
| L3 | 2 (updated prereqs) | 16 | 18 | all computational |
| L4 | 0 | 6 | 6 | all computational |
| L5 | 0 | 3 | 3 | all computational |
| **Total** | **9** | **28** | **37** | |

---

## Validation Checklist

1. 37 total shared prereq nodes
2. Every L5 node has `prereqs: []`
3. Every L2/L3/L4 node has at least one prereq pointing to a deeper level
4. 0 dangling prereq refs
5. 0 cycles
6. 0 self-references
7. Every new node has: `id`, `type: 'computational'`, `level`, `q`, `correct`, `wrong[2]`
8. All wrong answers model plausible student errors
9. 0/18 subconcepts unwired after wireL1toL2
10. Every strand walkthrough terminates at L5 leaves
11. Validator passes: `node validate-cartridge.js alg2-dividing-polynomials-cartridge.js`

---

## Implementation Notes for Codex

- **Only touch `SHARED_PREREQ_NODES` and `wireL1toL2`** — no changes to commands, banks, generateQuestion, or any other section
- Add 28 new nodes to `SHARED_PREREQ_NODES`
- Update prereqs on all 9 existing nodes as specified
- Append 8 new regex rules to `wireL1toL2`'s `rules` array
- Order nodes in the object: L5 first, then L4, then L3, then existing L2 (for readability)
- Run validation after implementation
