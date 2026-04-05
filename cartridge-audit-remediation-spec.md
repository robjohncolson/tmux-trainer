# Cartridge Audit Remediation Spec

Fixes verified against `ap-stats-cartridge.js` from a GPT-4o audit of the 76-command AP Stats deck against the 2026 AP Statistics Exam Reference Information.

**File to edit**: `ap-stats-cartridge.js` (all changes)

---

## 1. Formula Fix: rv-sd notation (line 78)

The 2026 reference sheet uses μ_X (subscripted) in the discrete RV standard deviation formula. The cartridge uses unsubscripted μ.

### Change

```js
// Line 78 — BEFORE
latex:'\\sigma_X = \\sqrt{\\sum(x_i - \\mu)^2 \\cdot P(x_i)}',

// Line 78 — AFTER
latex:'\\sigma_X = \\sqrt{\\sum(x_i - \\mu_X)^2 \\cdot P(x_i)}',
```

Also update the blank on line 79 to match:

```js
// Line 79 — BEFORE
{latex:'\\sigma_X = \\sqrt{\\sum(x_i - \\boxed{\\,?\\,})^2 \\cdot P(x_i)}',answer:'mu',choices:['\\mu','\\bar{x}','0']}

// Line 79 — AFTER
{latex:'\\sigma_X = \\sqrt{\\sum(x_i - \\boxed{\\,?\\,})^2 \\cdot P(x_i)}',answer:'mu_X',choices:['\\mu_X','\\bar{x}','0']}
```

**Why**: `\\mu` alone is ambiguous — students see μ for population mean elsewhere. The reference sheet subscripts it.

---

## 2. Blank Fix: large-counts stray `?` (line 522)

Blank #2 for `large-counts` has a bare `?` instead of `\boxed{\,?\,}` in the second condition:

```
np \geq \boxed{\,?\,} \;\text{ and }\; n(1-p) \geq ?
```

The student fills in the first `?` (answer: `10`). The second `?` is supposed to also be `10` but renders as a literal question mark.

### Change

```js
// Line 522 — BEFORE
{latex:'np \\geq \\boxed{\\,?\\,} \\;\\text{ and }\\; n(1-p) \\geq ?',answer:'10',choices:['10','30','5']}

// Line 522 — AFTER
{latex:'np \\geq \\boxed{\\,?\\,} \\;\\text{ and }\\; n(1-p) \\geq 10',answer:'10',choices:['10','30','5']}
```

**Why**: The blank asks "what threshold?" — one boxed blank is enough. Show 10 in the other position so the student sees both conditions.

---

## 3. Application Scenario Rewrites (10 scenarios)

These scenarios give away the answer by naming the formula, method, or key symbols.

### 3a. `linreg-mean` (line 897)

**Problem**: "A least-squares model is fit to bivariate data" names the method.

```js
// BEFORE
'linreg-mean':[{scenario:'A least-squares model is fit to bivariate data. What known coordinate pair must it always include?',confusionSet:['linreg','y-intercept','slope-b']}],

// AFTER
'linreg-mean':[{scenario:'A student plots bivariate data and draws a prediction line. She wants to verify it passes through a specific landmark point of the dataset.',confusionSet:['linreg','y-intercept','slope-b']}],
```

### 3b. `y-intercept` (line 906)

**Problem**: "Given the LSRL" and "intercept a" name the formula and answer.

```js
// BEFORE
'y-intercept':[{scenario:'Given the LSRL passes through (x-bar, y-bar), a student must find the intercept a.',confusionSet:['linreg','linreg-mean','slope-b']}],

// AFTER
'y-intercept':[{scenario:'A researcher knows the slope and the mean of each variable. She needs the starting value of the prediction line when x is zero.',confusionSet:['linreg','linreg-mean','slope-b']}],
```

### 3c. `ci-formula` second scenario (line 925)

**Problem**: "After computing SE and finding z*" names the components.

```js
// BEFORE (second entry in the array)
{scenario:'After computing SE and finding z*, a student wants a range of plausible values for the parameter.',confusionSet:['z-test-stat','margin-error','one-mean-ci']}

// AFTER
{scenario:'A student has a point estimate and wants to express her uncertainty as a range of plausible values for the true parameter.',confusionSet:['z-test-stat','margin-error','one-mean-ci']}
```

### 3d. `type-i-error` (line 929)

**Problem**: "Name this mistake" is a definition prompt, not a scenario.

```js
// BEFORE
'type-i-error':[{scenario:'A drug trial rejects H0 and approves a treatment that is actually ineffective. Name this mistake.',confusionSet:['type-ii-error','p-value-interp','power']}],

// AFTER
'type-i-error':[{scenario:'A pharmaceutical company runs a trial and concludes the new drug works, but later discovers it performs no better than placebo. What kind of error occurred?',confusionSet:['type-ii-error','p-value-interp','power']}],
```

### 3e. `type-ii-error` (line 930)

**Problem**: "Name this mistake" is a definition prompt.

```js
// BEFORE
'type-ii-error':[{scenario:'A screening fails to detect a disease that is actually present. Name this mistake.',confusionSet:['type-i-error','power','p-value-interp']}],

// AFTER
'type-ii-error':[{scenario:'A factory passes inspection even though its defect rate actually exceeds the standard. What kind of error occurred?',confusionSet:['type-i-error','power','p-value-interp']}],
```

### 3f. `pooled-se` (line 941)

**Problem**: "using a single combined estimate" describes pooling.

```js
// BEFORE
'pooled-se':[{scenario:'A clinical trial compares cure rates in two groups. Under the null hypothesis that both populations have the same rate, quantify the variability of the difference using a single combined estimate.',confusionSet:['diff-p-se','phat-se','diff-x-se']}],

// AFTER
'pooled-se':[{scenario:'A clinical trial compares cure rates in two groups. Under the null hypothesis of equal population proportions, the researcher must quantify the variability of the difference in sample proportions.',confusionSet:['diff-p-se','phat-se','diff-x-se']}],
```

### 3g. `slope-mean` (line 960)

**Problem**: "center of all those b values" names the symbol.

```js
// BEFORE
'slope-mean':[{scenario:'If you repeatedly drew new datasets and fit lines, what would the center of all those b values equal?',confusionSet:['xbar-mean','phat-mean','slope-b']}],

// AFTER
'slope-mean':[{scenario:'A statistician imagines drawing thousands of samples and fitting a regression line each time. What does the long-run average of those slopes converge to?',confusionSet:['xbar-mean','phat-mean','slope-b']}],
```

### 3h. `slope-se` (line 961)

**Problem**: "residual SD and x-spread" names the exact formula inputs.

```js
// BEFORE
'slope-se':[{scenario:'A biologist fits a regression of wing length on body mass for 30 birds. From the computer output she reads the residual SD and x-spread, and needs to quantify how precisely the slope is estimated.',confusionSet:['slope-sd','xbar-se','phat-se']}],

// AFTER
'slope-se':[{scenario:'A biologist fits a regression of wing length on body mass for 30 birds and wants to know how precisely the sample slope estimates the true slope.',confusionSet:['slope-sd','xbar-se','phat-se']}],
```

### 3i. `slope-sd` (line 966)

**Problem**: Gives exact symbols σ, σ_x, n — basically solving it for the student.

```js
// BEFORE
'slope-sd':[{scenario:'For the population of all possible samples from this dataset, how variable is the slope estimate? Given σ=5, σ_x=3, n=40.',confusionSet:['slope-se','xbar-sd','phat-sd']}],

// AFTER
'slope-sd':[{scenario:'If a population regression exists and you could draw every possible sample, how much would the fitted slopes spread out around the true slope?',confusionSet:['slope-se','xbar-sd','phat-sd']}],
```

### 3j. `df-gof` (line 967)

**Problem**: "chi-square goodness-of-fit test" names the test directly.

```js
// BEFORE
'df-gof':[{scenario:'A spinner has 5 equally-likely sections. How many degrees of freedom for a chi-square goodness-of-fit test?',confusionSet:['df-twoway','df-t','chi-sq']}],

// AFTER
'df-gof':[{scenario:'A spinner has 5 equally-likely sections. After spinning 200 times and comparing observed counts to expected, how many degrees of freedom does the test use?',confusionSet:['df-twoway','df-t','chi-sq']}],
```

---

## 4. wireL1toL2 Regex Fixes (lines 1600-1659)

### 4a. Over-broad `why.*n\b` (line 1603)

Matches "why...mean", "why...distribution", any word ending in `n`.

```js
// BEFORE
[/divide|divid|denominator|why.*n\b/i,['division-concept']],

// AFTER
[/divide|divid|denominator|why\b.*\bby\s+n\b/i,['division-concept']],
```

### 4b. Over-broad `O\s` (line 1621)

With `/i`, matches lowercase "o " in "to ", "do ", "go ", etc.

```js
// BEFORE
[/observed|O\s|O\b.*count/i,['observed-vs-expected']],

// AFTER
[/observed|(?<!\w)O(?!\w).*count/i,['observed-vs-expected']],
```

### 4c. Over-broad `E\s.*count` (line 1622)

With `/i`, matches "e " followed by any "count" in the sentence.

```js
// BEFORE
[/expected.*count|E\s.*count/i,['observed-vs-expected']],

// AFTER
[/expected.*count|(?<!\w)E(?!\w).*count/i,['observed-vs-expected']],
```

### 4d. IQR/quartile miswired to mean-concept (line 1638)

Quartiles and IQR are order-statistic concepts, not mean concepts.

```js
// BEFORE
[/Q1|percentile|IQR|resistant|quartile/i,['mean-concept']],

// AFTER
[/Q1|percentile|IQR|resistant|quartile/i,['order-statistics-concept']],
```

Requires adding the new `order-statistics-concept` node (see Section 5).

### 4e. Correlation miswired to slope-concept (line 1632)

Correlation (r) and slope (b) are related but distinct concepts.

```js
// BEFORE
[/\br\b.*measure|linear.*assoc|correlation|strength.*direction/i,['slope-concept']],

// AFTER
[/\br\b.*measure|linear.*assoc|correlation|strength.*direction/i,['correlation-concept']],
```

Requires adding the new `correlation-concept` node (see Section 5).

### 4f. Y-intercept miswired to slope-concept only (line 1631)

The y-intercept is a separate concept from the slope.

```js
// BEFORE
[/y.intercept|"a".*represent|predict.*when x|a\b.*represent.*intercept/i,['slope-concept']],

// AFTER
[/y.intercept|"a".*represent|predict.*when x|a\b.*represent.*intercept/i,['intercept-concept']],
```

Requires adding the new `intercept-concept` node (see Section 5).

---

## 5. New Shared Prereq Nodes (add to SHARED_PREREQ_NODES)

Three concepts are currently miswired because no proper target node exists. Add these inside `SHARED_PREREQ_NODES` (after existing L2 nodes, before L3).

```js
'order-statistics-concept':{id:'order-statistics-concept',type:'mc',level:2,
  q:'What must you do to data before finding quartiles?',
  correct:'Sort the values from smallest to largest',
  wrong:['Square all values','Subtract the mean from each value'],
  prereqs:['compare-numbers']},

'correlation-concept':{id:'correlation-concept',type:'mc',level:2,
  q:'What does the correlation coefficient r measure?',
  correct:'Strength and direction of a linear relationship',
  wrong:['The slope of the line','The proportion of variation explained'],
  prereqs:['slope-concept','fraction-concept']},

'intercept-concept':{id:'intercept-concept',type:'mc',level:2,
  q:'In a regression line, what does the y-intercept represent?',
  correct:'The predicted y-value when x equals zero',
  wrong:['The rate of change per unit x','The correlation between x and y'],
  prereqs:['slope-concept','mean-concept']},
```

---

## 6. Tier Labels — Design Decision (NOT a mandatory fix)

The audit found that the tier rubric says "core = on reference sheet" but many reference-sheet formulas are labeled `regular` or `power`:

| Command | Current Tier | On Reference Sheet? |
|---------|-------------|-------------------|
| `corr-r` | regular | Yes |
| `binom-pmf` | regular | Yes |
| `rv-sd` | regular | Yes |
| `geom-sd` | regular | Yes |
| `diff-x-se` | power | Yes |
| `pooled-se` | power | Yes |
| `slope-se` | power | Yes |

**The current labeling is defensible** if tier means "cognitive complexity for the student" rather than "appears on the reference sheet." The tier drives enemy speed/size and wave placement, so difficulty-based tiers make gameplay sense.

**Action**: No code change. Document that tier = difficulty, not reference-sheet presence. If you want to change the tier rubric definition, update the `tier` field on the commands listed above to `core`.

---

## 7. Findings NOT Confirmed

The audit claimed "6 blanks where answer doesn't match choices after normalization." After tracing every hand-authored blank and AUTO_BLANK_SPEC through the `norm()` function + alias table (line 798-809), **all answers match their correct choice**. The alias system (`phatc→pc`, `phat1→phat1`, etc.) handles the LaTeX→shorthand conversions correctly. No fix needed.

The audit also flagged `N` vs `n` collision in `ten-pct-condition` (line 587). After norm, `N` and `n` both become `n`. However, fill-blank questions are **multiple choice** — the student picks from buttons `['N','n-1','\\mu']`. Since `N` is a distinct button from any `n` button, and the correct choice (`N`) normalizes to match the answer (`N`), no incorrect answer can be accepted. No fix needed.

---

## Implementation Checklist

All edits are in `ap-stats-cartridge.js`:

- [ ] **Section 1**: Fix `rv-sd` latex + blank (lines 78-79)
- [ ] **Section 2**: Fix `large-counts` blank #2 stray `?` (line 522)
- [ ] **Section 3**: Rewrite 10 application scenarios (lines 897, 906, 925, 929, 930, 941, 960, 961, 966, 967)
- [ ] **Section 4a-c**: Tighten 3 over-broad regex rules (lines 1603, 1621, 1622)
- [ ] **Section 4d-f**: Fix 3 miswired regex rules (lines 1631, 1632, 1638)
- [ ] **Section 5**: Add 3 new SHARED_PREREQ_NODES entries
- [ ] Run `validateDAG()` at boot to confirm no dangling refs or cycles after changes
