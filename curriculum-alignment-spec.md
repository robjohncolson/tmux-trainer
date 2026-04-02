# Curriculum Alignment Spec — BKT Tree Completeness

## Problem

Cross-referencing the game's 59 AP Stats commands against the 817 curriculum questions in `school/curriculum_render/data/curriculum.js` revealed three categories of issues:

1. **2 commands with redundant subconcepts** — `binom-sd` and `residual` each have overlapping subconcept questions that reduce BKT diagnostic value
2. **7 missing formulas** — heavily tested in the curriculum but absent from the game
3. **6 subconcepts with bare-number correct answers** — produce weak depth-2 True/False questions in the BKT hydra system

## Fix 1: Overlapping Subconcept Replacement

### binom-sd (line ~860)

**Current Q1:** "Why does p(1-p) appear?" → "Variability is largest when p=0.5"
**Current Q3:** "When is σ maximized for fixed n?" → "When p = 0.5"

These are the same concept. Replace Q3:

**New Q3:** `{q:'What does the square root do?',correct:'Converts variance back to original units',wrong:['Makes the value smaller','Ensures the result is positive']}`

Q2 ("What does n contribute to σ?") stays — it tests a different aspect.

### residual (line ~1079)

**Current Q1:** "What does a positive residual mean?" → "The model underpredicted (actual > predicted)"
**Current Q2:** "What does a negative residual mean?" → "The model overpredicted (actual < predicted)"

These are mirror images. Replace Q2:

**New Q2:** `{q:'What should the sum of all residuals equal for LSRL?',correct:'Zero (residuals balance out by least squares)',wrong:['The mean of y','One']}`

Q3 ("What should a residual plot look like?") stays.

## Fix 2: Add 7 Missing Curriculum Formulas

Insert these 7 new commands before the closing `],` of the commands array (line ~1233). Each includes latex, blanks, and 3 subconcepts with 2 wrong answers each.

### 2a. paired-t (10 curriculum questions, U7)

```javascript
{id:'paired-t',action:'Paired t Statistic',tier:'power',dom:'inf-means',
  hint:'Mean difference over SE of differences',
  explain:'Used when two measurements come from the same subjects',
  latex:'t = \\frac{\\bar{d}}{s_d / \\sqrt{n}}',
  blanks:[
    {latex:'t = \\frac{\\bar{d}}{\\boxed{\\,?\\,} / \\sqrt{n}}',answer:'s_d',choices:['s_d','s','\\sigma']},
    {latex:'t = \\frac{\\boxed{\\,?\\,}}{s_d / \\sqrt{n}}',answer:'d-bar',choices:['\\bar{d}','\\bar{x}','\\mu_d']},
    {latex:'t = \\frac{\\bar{d}}{s_d / \\boxed{\\,?\\,}}',answer:'sqrt(n)',choices:['\\sqrt{n}','n','n-1']}
  ],
  subconcepts:[
    {q:'When do you use a paired t-test instead of two-sample?',correct:'When observations are naturally linked (same subjects measured twice)',wrong:['When sample sizes are equal','When populations have equal variance']},
    {q:'What does d-bar represent?',correct:'The mean of the individual differences (after minus before)',wrong:['The difference of the two sample means','The population mean difference']},
    {q:'What are the degrees of freedom for a paired t-test?',correct:'n minus 1, where n is the number of pairs',wrong:['n1 plus n2 minus 2','The smaller of n1-1 and n2-1']}
  ]},
```

### 2b. slope-ci (26 curriculum questions, U9)

```javascript
{id:'slope-ci',action:'CI for Regression Slope',tier:'power',dom:'regression',
  hint:'b plus or minus t-star times SE of b',
  explain:'Estimates the true population slope with a confidence interval',
  latex:'b \\pm t^* \\cdot SE_b',
  blanks:[
    {latex:'b \\pm \\boxed{\\,?\\,} \\cdot SE_b',answer:'t*',choices:['t^*','z^*','\\chi^2']},
    {latex:'\\boxed{\\,?\\,} \\pm t^* \\cdot SE_b',answer:'b',choices:['b','\\beta','\\bar{x}']},
    {latex:'b \\pm t^* \\cdot \\boxed{\\,?\\,}',answer:'SE_b',choices:['SE_b','s_b','\\sigma_b']}
  ],
  subconcepts:[
    {q:'Why use t* instead of z* for slope inference?',correct:'Population standard deviation is unknown and estimated from data',wrong:['Because the slope is always t-distributed','Because sample sizes are always small']},
    {q:'If 0 is in the confidence interval for slope, what does that suggest?',correct:'The linear relationship may not be statistically significant',wrong:['The model is perfect','The slope must be exactly zero']},
    {q:'What conditions must be checked for slope CI?',correct:'Linearity, independence, normal residuals, equal variance (LINE)',wrong:['Only normality of x values','Only that n is large enough']}
  ]},
```

### 2c. df-t (22 curriculum questions, U7-U9)

```javascript
{id:'df-t',action:'Degrees of Freedom (t)',tier:'support',dom:'inference',
  hint:'Depends on the type of t procedure',
  explain:'df determines the shape of the t distribution used for inference',
  latex:'df = \\begin{cases} n-1 & \\text{one-sample / paired} \\\\ \\min(n_1-1,\\,n_2-1) & \\text{two-sample (conservative)} \\\\ n-2 & \\text{regression slope} \\end{cases}',
  blanks:[
    {latex:'\\text{One-sample: } df = \\boxed{\\,?\\,}',answer:'n-1',choices:['n-1','n','n-2']},
    {latex:'\\text{Two-sample (conservative): } df = \\boxed{\\,?\\,}',answer:'min(n1-1,n2-1)',choices:['\\min(n_1{-}1,n_2{-}1)','n_1+n_2-2','n_1+n_2']},
    {latex:'\\text{Regression slope: } df = \\boxed{\\,?\\,}',answer:'n-2',choices:['n-2','n-1','n']}
  ],
  subconcepts:[
    {q:'Why does df = n-1 for one-sample t?',correct:'One parameter (the mean) is estimated from the data',wrong:['Because we lose one data point','Because the first observation is fixed']},
    {q:'Why is the conservative two-sample df the minimum?',correct:'Using the smaller df gives wider intervals, protecting against error',wrong:['Because the larger sample dominates','Because degrees of freedom must be equal']},
    {q:'What happens to the t distribution as df increases?',correct:'It approaches the standard normal (z) distribution',wrong:['It becomes more spread out','It becomes skewed']}
  ]},
```

### 2d. large-counts (17 curriculum questions, U5-U8)

```javascript
{id:'large-counts',action:'Large Counts Condition',tier:'support',dom:'inf-proportions',
  hint:'np and n(1-p) both at least 10',
  explain:'Ensures the sampling distribution of p-hat is approximately Normal',
  latex:'np \\geq 10 \\quad\\text{and}\\quad n(1-p) \\geq 10',
  blanks:[
    {latex:'\\boxed{\\,?\\,} \\geq 10 \\;\\text{and}\\; n(1-p) \\geq 10',answer:'np',choices:['np','n','p']},
    {latex:'np \\geq \\boxed{\\,?\\,} \\;\\text{and}\\; n(1-p) \\geq ?',answer:'10',choices:['10','30','5']}
  ],
  subconcepts:[
    {q:'Why do both np and n(1-p) need to be checked?',correct:'Both the number of successes and failures must be large enough for Normal approximation',wrong:['Only one condition matters','To check independence']},
    {q:'What happens if large counts condition fails?',correct:'The Normal approximation is unreliable and inference procedures are invalid',wrong:['The test automatically fails','The p-value doubles']},
    {q:'For a hypothesis test, do you use p0 or p-hat to check large counts?',correct:'Use p0 (the hypothesized value) for hypothesis tests',wrong:['Always use p-hat','Use whichever is larger']}
  ]},
```

### 2e. type-i-error (15 curriculum questions, U6-U7)

```javascript
{id:'type-i-error',action:'Type I Error (α)',tier:'support',dom:'inference',
  hint:'Rejecting a true null hypothesis',
  explain:'The probability of a false positive, controlled by the significance level',
  latex:'\\alpha = P(\\text{reject } H_0 \\mid H_0 \\text{ is true})',
  blanks:[
    {latex:'\\alpha = P(\\text{reject } H_0 \\mid \\boxed{\\,?\\,})',answer:'H0 true',choices:['H_0 \\text{ true}','H_a \\text{ true}','H_0 \\text{ false}']},
    {latex:'\\boxed{\\,?\\,} = P(\\text{reject } H_0 \\mid H_0 \\text{ true})',answer:'alpha',choices:['\\alpha','\\beta','1-\\beta']}
  ],
  subconcepts:[
    {q:'What is a Type I error in everyday terms?',correct:'A false alarm — concluding an effect exists when it does not',wrong:['Missing a real effect','Getting the wrong sample']},
    {q:'How is the Type I error rate controlled?',correct:'By choosing the significance level α before collecting data',wrong:['By increasing sample size','By using a two-tailed test']},
    {q:'If α = 0.05, what does that mean?',correct:'There is a 5% chance of rejecting H0 when H0 is actually true',wrong:['There is a 5% chance H0 is true','95% of the data supports H0']}
  ]},
```

### 2f. type-ii-error (14 curriculum questions, U6-U7)

```javascript
{id:'type-ii-error',action:'Type II Error (β)',tier:'support',dom:'inference',
  hint:'Failing to reject a false null hypothesis',
  explain:'The probability of a false negative; power = 1 − β',
  latex:'\\beta = P(\\text{fail to reject } H_0 \\mid H_a \\text{ is true})',
  blanks:[
    {latex:'\\beta = P(\\text{fail to reject } H_0 \\mid \\boxed{\\,?\\,})',answer:'Ha true',choices:['H_a \\text{ true}','H_0 \\text{ true}','H_a \\text{ false}']},
    {latex:'\\text{Power} = 1 - \\boxed{\\,?\\,}',answer:'beta',choices:['\\beta','\\alpha','p']}
  ],
  subconcepts:[
    {q:'What is a Type II error in everyday terms?',correct:'A missed detection — failing to notice a real effect',wrong:['A false alarm','Proving the null hypothesis']},
    {q:'What is the relationship between Type II error and power?',correct:'Power = 1 − β, so lower β means higher power',wrong:['Power = β','Power = α + β']},
    {q:'How can you reduce Type II error?',correct:'Increase sample size, increase α, or study a larger effect',wrong:['Decrease the significance level','Use a one-tailed test always']}
  ]},
```

### 2g. log-transform (6 curriculum questions, U2)

```javascript
{id:'log-transform',action:'Logarithmic Re-expression',tier:'power',dom:'descriptive',
  hint:'Take log of response variable to linearize curved relationships',
  explain:'Used when a scatterplot shows exponential or power-law curvature',
  latex:'\\hat{y} = 10^{a + bx} \\quad\\text{or}\\quad \\ln(\\hat{y}) = a + bx',
  blanks:[
    {latex:'\\boxed{\\,?\\,} = 10^{a + bx}',answer:'y-hat',choices:['\\hat{y}','\\ln(\\hat{y})','y']},
    {latex:'\\ln(\\hat{y}) = \\boxed{\\,?\\,} + bx',answer:'a',choices:['a','\\bar{y}','e']}
  ],
  subconcepts:[
    {q:'When should you consider a log transformation?',correct:'When the scatterplot shows a curved (exponential) pattern',wrong:['When the data is already linear','When the residuals are centered at zero']},
    {q:'After fitting log(y) = a + bx, how do you predict y?',correct:'Back-transform: y-hat = 10^(a + bx) or e^(a + bx)',wrong:['Just use a + bx directly','Take the log of a + bx']},
    {q:'What should the residual plot of log(y) vs x look like if transformation worked?',correct:'Random scatter with no pattern (linearized relationship)',wrong:['A curved pattern','A positive trend']}
  ]},
```

## Fix 3: Enrich Bare-Number Correct Answers

Replace bare numeric `correct` values with complete statements for better depth-2 T/F generation:

| Command | Subconcept Q | Current correct | New correct |
|---------|-------------|----------------|-------------|
| `binom-mean` | "If n=100 and p=0.3, what is μ?" | `"30"` | `"30, because μ = np = 100 × 0.3"` |
| `geom-mean` | "If p=0.25, expected trials?" | `"4"` | `"4 trials, because μ = 1/p = 1/0.25"` |
| `empirical-rule` | "If mean=100 and SD=15, about 95% fall between?" | `"70 and 130"` | `"70 and 130, which is mean ± 2 SD"` |
| `r-squared` | "If r = -0.9, what is r squared?" | `"0.81"` | `"0.81, because (−0.9)² = 0.81"` |
| `complement` | "If P(rain) = 0.3, what is P(no rain)?" | `"0.7"` | `"0.7, because P(Aᶜ) = 1 − P(A)"` |
| `df-gof` | "If there are 5 categories, what is df?" | `"4"` | `"4, because df = k − 1 = 5 − 1"` |

## Implementation Order (Dependency-Aware)

1. **Fix 3 first** — bare-number enrichment (6 edits, each independent, no new code)
2. **Fix 1 second** — subconcept replacements (2 edits, each independent)
3. **Fix 2 third** — new commands (7 insertions at the same location, after last existing command)
4. **BKT wiring** — new commands are automatically registered in the BKT tree because `initSRS` iterates over `COMMANDS`, and `pickCommands` draws from the pool. `loadSRS` migration bootstraps new commands at pKnown=0.1 (fresh). No additional BKT wiring needed.
5. **Auto-blank expansion** — the existing auto-blank pass generates fill-blank variants for any command with notation blanks. New commands will get expanded automatically.

## Files Modified

- `index.html` — command definitions section (~lines 777-1233):
  - 6 bare-number correct answers enriched in place
  - 2 subconcept replacements in place
  - 7 new command objects inserted before the closing `],`

## Testing Plan

1. **Parse check**: Verify inline JS parses without errors
2. **Command count**: Verify total commands = 66 (was 59 + 7 new)
3. **Subconcept count**: Verify all 66 commands have 3 subconcepts each = 198
4. **Wrong answer count**: Verify all 198 subconcepts have 2 wrong answers each = 396
5. **Blank coverage**: Verify all 66 commands have at least 2 blanks
6. **No duplicates**: Verify no duplicate command IDs
7. **BKT registration**: Verify `initSRS` creates entries for all 66 commands
8. **Enriched answers**: Verify the 6 enriched answers are statements (not bare numbers)
9. **Replaced subconcepts**: Verify binom-sd Q3 and residual Q2 are the new versions
10. **Domain coverage**: Verify new commands map to expected domains
