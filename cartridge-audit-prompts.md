# Cartridge Audit Prompts

Paste each prompt into ChatGPT (or similar) along with the contents of `ap-stats-cartridge.js`.

---

## Prompt 1: Formula Correctness Audit

```
I'm attaching an AP Statistics formula cartridge (ap-stats-cartridge.js) for a quiz game. It contains 76 commands, each with a formula in LaTeX.

Please audit every formula's `latex` field against the official 2026 AP Statistics Exam Reference Information booklet. For each command, report:

1. Whether the formula matches the official reference (MATCH / MISMATCH / NOT ON REFERENCE SHEET)
2. If mismatched: what the formula says vs. what it should say
3. If the formula uses non-standard notation that could confuse AP students

Also check:
- Are any official reference sheet formulas MISSING from the 76 commands?
- Are the `tier` assignments reasonable? (core = on reference sheet, regular = frequently tested, support = background knowledge, power = multi-step)

Output as a table: | command id | formula | status | notes |
```

---

## Prompt 2: Blank Answer Validation

```
I'm attaching an AP Statistics cartridge file (ap-stats-cartridge.js). Each command has a `blanks` array where fill-in-the-blank questions are defined with:
- `latex`: the formula with a \boxed{\,?\,} placeholder
- `answer`: the correct answer string
- `choices`: array of multiple-choice options (one must match the answer)

Please check EVERY blank across all 76 commands for these issues:

1. **Answer not in choices**: The `answer` string doesn't match any string in `choices` after normalization (stripping LaTeX formatting characters \, {, }, _). This is a critical bug — the correct answer would be unjudgeable.

2. **Unicode vs LaTeX mismatch**: The answer uses a Unicode character (∩, ∪, σ, μ, β, χ, p̂, x̄) but the choices use LaTeX equivalents (\cap, \cup, \sigma, \mu, \beta, \chi, \hat{p}, \bar{x}), or vice versa.

3. **Answer appears in the question**: The blank's `latex` field contains text that gives away which choice is correct.

4. **Duplicate choices**: Two choices normalize to the same string.

5. **Pedagogically weak distractors**: A wrong choice that no student would ever pick (too obviously wrong to test anything).

Output as a table: | command id | blank # | issue type | details | suggested fix |
```

---

## Prompt 3: Application Scenario Review

```
I'm attaching an AP Statistics cartridge (ap-stats-cartridge.js). The `applicationBank` contains ~72 real-world scenarios that ask "which formula applies?" with authored confusion sets.

For each scenario, check:

1. **Answer giveaway**: Does the scenario text contain keywords that directly name or describe the correct formula? (e.g., saying "find the standard deviation" when the answer IS the standard deviation formula). The scenario should describe a SITUATION, not name the method.

2. **Ambiguous scenario**: Could a knowledgeable student reasonably argue for a different formula in the confusion set? If so, the scenario needs to be more specific.

3. **Confusion set quality**: Are the distractor formulas actually confusable with the correct one for this scenario? Random unrelated formulas don't test anything useful.

4. **Missing context**: Does the scenario omit information that would be needed to determine the correct formula? (e.g., not specifying whether it's a one-sample or two-sample situation)

5. **Factual errors**: Any statistical inaccuracies in the scenario description.

Output as a table: | command id | scenario # | issue type | the scenario text | suggested fix |

Only report actual problems — don't flag scenarios that are fine.
```

---

## Prompt 4: DAG Wiring Verification

```
I'm attaching an AP Statistics cartridge (ap-stats-cartridge.js). It contains a prerequisite DAG (Directed Acyclic Graph) system:

- Each command has `subconcepts` (L1 nodes) — conceptual check questions
- `sharedPrereqNodes` contains ~73 hand-authored L2-L5 nodes (deeper prerequisite knowledge)
- `wireL1toL2(dag)` contains ~52 regex rules that match L1 subconcept question text to L2+ prerequisite nodes

Please verify:

1. **Unwired subconcepts**: For each command's subconcepts, check if the question text (`q` field) and correct answer would match at least one regex rule in `wireL1toL2`. List any subconcepts that would NOT be wired to any L2+ node.

2. **Incorrect wiring**: Would any regex rule wire a subconcept to a WRONG prerequisite? (e.g., a question about standard deviation getting wired to a probability node)

3. **Missing L2+ nodes**: Are there common AP Stats prerequisite concepts that should exist in `sharedPrereqNodes` but don't? Think about: sampling distributions, Central Limit Theorem, degrees of freedom, expected value, independence, random variables.

4. **Dangling prereqs**: Do any nodes in `sharedPrereqNodes` reference `prereqs` that don't exist in the node set?

5. **Depth coverage**: Do all branches eventually reach L5 (arithmetic floor)? Or are there dead ends at L3/L4?

Output:
- Table of unwired subconcepts: | command id | subconcept # | question text | suggested L2+ node |
- Table of wiring issues: | rule # | regex pattern | problem | fix |
- List of suggested new L2+ nodes
- List of dangling references
```

---

## Usage Notes

- Upload `ap-stats-cartridge.js` as a file attachment with each prompt
- These prompts work best with models that can process the full ~1700 line file
- For ChatGPT: use GPT-4o or o1 with file upload
- For Gemini: paste the file contents directly (it handles large context well)
- Run prompts 1 and 2 first (formula correctness + blank validation are highest priority)
- Prompts 3 and 4 are deeper pedagogical reviews, best done after fixing any issues from 1 and 2
