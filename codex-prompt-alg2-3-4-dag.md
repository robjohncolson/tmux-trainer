# Codex Task: Extend DAG — Full Arithmetic-to-Equation Scaffolding

## Context

The `alg2-dividing-polynomials-cartridge.js` cartridge has a shallow prerequisite DAG — 9 nodes, most conceptual dead-ends. When a student misses a question, remediation bottoms out after one hop. This task adds 28 new computational nodes so the DAG forms a complete fractal decomposition: every concept breaks down into its component skills, which break down into simpler skills, all the way to basic multiplication. Four skill strands (evaluation, polynomial arithmetic, synthetic mechanics, factor connection) share arithmetic roots and diverge at the pre-algebra level.

## Input Files

1. **Spec** (primary guide): `alg2-3-4-dag-extension-spec.md` — contains every node, every prereq, wiring map, strand walkthroughs, distractor rationale
2. **Cartridge to modify**: `alg2-dividing-polynomials-cartridge.js`
3. **Authoring rules**: `cartridge-authoring-guide.md` (section 6: Prerequisite DAG)

## Output

**Modified file**: `alg2-dividing-polynomials-cartridge.js` (in-place edit, only SHARED_PREREQ_NODES and wireL1toL2)

## What to Change

### 1. Add 28 new nodes to SHARED_PREREQ_NODES

**Level 5 — Arithmetic leaves (3 nodes, prereqs: []):**
`mult-whole`, `add-whole`, `sub-whole`

**Level 4 — Signed numbers + exponents (6 nodes):**
`mult-by-negative`, `neg-times-neg`, `add-negatives`, `sub-a-negative`, `square-a-number`, `cube-a-number`

**Level 3 — Pre-algebra computation (16 nodes):**

Evaluation strand: `neg-odd-power`, `neg-even-power`, `eval-monomial`, `eval-neg-substitution`, `coeff-times-power`, `eval-two-terms`, `eval-three-terms`

Poly arithmetic strand: `combine-like-terms`, `distribute-monomial`, `subtract-polynomials`, `mult-mono-by-binomial`, `reverse-distribute`

Synthetic strand: `synth-chain-step`

Factor bridge strand: `zero-means-factor`, `nonzero-not-factor`, `factor-implies-zero`

**Level 2 — Equation-level bridges (3 nodes):**
`eval-full-poly`, `read-synth-result`, `one-div-step`

Copy exact `q`, `correct`, `wrong`, `prereqs` from the spec. Every new node's `type` is `'computational'`.

### 2. Update prereqs on all 9 existing nodes

| Node | New prereqs |
|------|-------------|
| `eval-poly` | `['eval-full-poly']` |
| `poly-degree` | `['square-a-number', 'cube-a-number']` |
| `division-concept` | `['reverse-distribute', 'one-div-step']` |
| `sign-of-c` | `['sub-a-negative']` |
| `zero-placeholder` | `['combine-like-terms']` |
| `degree-reduction` | `['poly-degree', 'read-synth-result']` |
| `factor-vs-remainder` | `['zero-means-factor', 'nonzero-not-factor']` |
| `multiply-add-step` | `['mult-by-negative', 'add-negatives']` |
| `leading-term-division` | `['square-a-number']` |

### 3. Append 8 regex rules to wireL1toL2

Add after the existing 9 rules (do NOT remove any):

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

## What NOT to Change

- Commands array (6 commands) — untouched
- generateQuestion — untouched
- validateBlank — untouched
- All banks (VARIABLE, APPLICATION, RELATIONSHIP, GLOSSARY, AUTO_BLANK_SPECS, DOM_LABELS) — untouched
- Boot-time expansion and export — untouched

## Validation

```bash
node --check alg2-dividing-polynomials-cartridge.js
node validate-cartridge.js alg2-dividing-polynomials-cartridge.js
```

Expect:
- 37 shared nodes (was 9)
- 0 dangling prereq refs
- 0 self-referencing nodes
- 0 cycles
- 0/18 subconcepts unwired
- All other checks still passing

Also manually verify:
- Every L5 node has `prereqs: []`
- Every L2/L3/L4 node has at least one prereq pointing deeper
- All 4 strand walkthroughs in the spec reach L5 leaves without gaps
