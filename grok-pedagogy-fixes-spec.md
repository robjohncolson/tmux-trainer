# Grok Pedagogy Fixes — Spec

## Context

Grok reviewed the AP Stats Formula Defense game against the College Board 2026 reference sheet. The review was based on a truncated/stale copy (saw ~24 commands, game has 77). Many suggestions were already shipped. After cross-referencing, **two actionable items remain**:

1. **Distractor quality improvements** — tighten specific MC distractors to catch real AP exam misconceptions
2. **Geometric SD notation polish** — show variance form alongside SD form

The third Grok suggestion ("add 7 missing commands") is fully resolved — all proposed commands already exist under different IDs.

## 1. Distractor Quality Improvements

### Problem

Some subconcept `wrong` arrays use obviously wrong distractors rather than common student misconceptions. Grok identified specific AP exam traps worth encoding.

### Changes (targeted edits to existing commands)

#### 1a. `corr-r` subconcept: "What does r=0 mean?"
- **Current wrong**: `['No relationship of any kind','Variables are independent']`
- **Status**: Already correct! "No relationship of any kind" IS the misconception distractor. ✓ No change needed.

#### 1b. `geom-pmf` subconcept: "What does geometric distribution count?"
- **Current wrong**: `['Successes in n trials','Probability of x successes']`
- **Change**: Replace second wrong with Grok's misconception: `'Number of failures before first success'`
- **Why**: Students confuse "trials until (including) success" with "failures before success" — off by 1 error that changes answers.

#### 1c. `chi-sq` subconcept: "Why square (O-E)?"
- **Current wrong**: `['To amplify small differences','To convert to proportions']`
- **Change**: Replace `'To convert to proportions'` with `'Because we divide by O, not E'`
- **Why**: Common error is computing (O-E)²/O or |O-E|/E. The distractor plants the O-vs-E confusion.

#### 1d. `chi-sq` — add new blank variant targeting the denominator
- **Add blank**: `{latex:'\\chi^2 = \\sum\\frac{(O-E)^2}{\\boxed{\\,?\\,}}',answer:'E',choices:['E','O','n']}`
- **Why**: Grok noted students confuse dividing by O vs E. Currently the blank only targets the numerator subtrahend.

#### 1e. `std-dev` subconcept: "Why use n-1 instead of n?"
- **Current wrong**: `['To make the value smaller','Because one value is always zero']`
- **Change**: Replace `'Because one value is always zero'` with `'Because we divide by n for populations'`
- **Why**: The real misconception is confusing sample vs population formulas, not a nonsense answer.

#### 1f. `phat-sd` / `phat-se` — p vs p̂ confusion
- Check current blanks for p̂ SE formulas. Ensure `p` and `p̂` appear as distinct distractor choices where the p/p̂ distinction matters (CI uses p̂, test uses p₀).
- **Why**: Using p when you should use p̂ (or vice versa) is a top AP exam error.

#### 1g. `geom-sd` subconcept: "How does σ change as p increases?"
- **Current wrong**: `['σ increases','σ stays constant']`
- **Status**: Already correct misconception pair. ✓ No change needed.

### Commands affected: `geom-pmf`, `chi-sq`, `std-dev`, possibly `phat-sd`/`phat-se`

## 2. Geometric SD Notation Polish

### Problem

The official AP Stats reference sheet shows variance σ² = (1-p)/p², then students derive SD as √(1-p)/p. The game shows only the SD form. Students may not recognize the connection on the exam.

### Current state (line 1258-1263)

```js
{id:'geom-sd', action:'Standard Deviation of Geometric (σ)', ...
  latex:'\\sigma_X = \\frac{\\sqrt{1-p}}{p}',
  explain:'Spread depends on how rare successes are',
```

### Change

- Update `explain` to: `'Spread depends on how rare successes are. Variance form: σ² = (1-p)/p²; take √ to get SD'`
- Add a second blank targeting the variance form:
  `{latex:'\\sigma_X^2 = \\frac{1-p}{\\boxed{\\,?\\,}}',answer:'p^2',choices:['p^2','p','(1-p)^2']}`

### Why

Students see σ² = (1-p)/p² on the reference sheet and need to connect it to √(1-p)/p. The extra blank and explain text bridge the gap.

## 3. "Missing Commands" — No Action Needed

| Grok's proposed ID | Already exists as | Line |
|---|---|---|
| `xbar-mu` | `xbar-mean` | 1326 |
| `xbar-sd` | `xbar-sd` | 1332 |
| `xbar-se` | `xbar-se` | 1338 |
| `one-mean-t` | `one-mean-t` | 1344 |
| `two-mean-t` | `two-mean-t` | 1350 |
| `pooled-p` | embedded in `pooled-se` subconcepts | 1318 |
| `pooled-diff-se` | `pooled-se` | 1318 |
| `slope-se` | `slope-se` | 1370 |
| `slope-t` | `slope-t` | 1376 |
| `r-squared` | `r-squared` | 1382 |
| `residual-s` | `resid-s` | 1378 |
| `expected-count` | `expected-gof` + `expected-twoway` | 1546/1556 |
| `binom-normal-cond` | `large-counts` + `normal-condition` | existing |
| `large-sample-cond` | `large-counts` | existing |
| `ten-percent-cond` | `ten-pct-condition` | existing |

## Implementation Plan

1. Edit `geom-pmf` subconcepts — swap 1 wrong answer (line ~1251)
2. Edit `chi-sq` subconcepts — swap 1 wrong answer + add 1 blank (line ~1282)
3. Edit `std-dev` subconcepts — swap 1 wrong answer (line ~1171)
4. Edit `geom-sd` explain + add variance blank (line ~1258)
5. Check `phat-sd`/`phat-se` blanks for p/p̂ distractors (lines ~1286-1310)
6. Parse check
7. Verify command count unchanged (77)

## Blast Radius

- Only `wrong` arrays and `blanks` arrays in existing commands — no structural changes
- No new commands, no DAG changes, no question type changes
- `generateQuestion()` already handles multiple blanks per command
- `reshuffleQuestionOptions()` already handles arbitrary choices arrays

## Testing Plan

- Parse check passes
- Command count remains 77
- Each modified command still has valid subconcepts (3 each) and blanks (1-2 each)
- No duplicate choices in any modified choices array
