// AP Stats topic → cartridge command IDs
// Authoring rules: AP CED topic descriptions guide alignment.
// Topics with no formula get no entry (lesson-only in BROWSE).
// Commands may appear in multiple topics.
window.AP_STATS_TOPIC_MAP = {
  // ── Unit 1: Exploring One-Variable Data ──
  // 1-1 Introducing Statistics: conceptual intro, no formula
  // 1-2 Language of Variation: variables, no formula
  // 1-3 Categorical variable tables: no formula
  // 1-4 Categorical variable graphs: no formula
  // 1-5 Quantitative variable graphs: no formula
  // 1-6 Describing distribution shape: no formula
  '1-7': ['mean','std-dev','variance','iqr'],
  '1-8': ['iqr','outlier-iqr'],
  '1-9': ['zscore'],
  '1-10': ['zscore','empirical-rule'],

  // ── Unit 2: Exploring Two-Variable Data ──
  // 2-1 Intro: Are Variables Related? — conceptual
  // 2-2 Two categorical variables: no formula
  // 2-3 Stats for two categorical variables: no formula
  // 2-4 Representing two quantitative variables: no formula
  '2-5': ['corr-r'],
  '2-6': ['linreg','linreg-mean','slope-b','y-intercept'],
  '2-7': ['residual'],
  '2-8': ['linreg','linreg-mean','slope-b','y-intercept','residual','r-squared','resid-s'],
  '2-9': ['log-transform','r-squared','resid-s'],

  // ── Unit 3: Collecting Data ──
  // 3-1 through 3-7: study design, sampling, experiments — no formulas
  // (random-condition is inference-phase; maps to U6+ below)

  // ── Unit 4: Probability, Random Variables, Probability Distributions ──
  // 4-1 Intro: Random and Non-Random Patterns — conceptual
  // 4-2 Simulation: no formula
  '4-3': ['complement','add-rule'],
  '4-4': ['add-rule','complement'],
  '4-5': ['cond-prob','mult-rule'],
  '4-6': ['mult-independent','mult-rule','add-rule'],
  '4-7': ['rv-mean','rv-sd'],
  '4-8': ['rv-mean','rv-sd','lintransform'],
  '4-9': ['lincomb-mean','lincomb-var','lintransform'],
  '4-10': ['binom-pmf','binom-mean','binom-sd'],
  '4-11': ['binom-pmf','binom-mean','binom-sd'],
  '4-12': ['geom-pmf','geom-mean','geom-sd'],

  // ── Unit 5: Sampling Distributions ──
  // 5-1 Intro — conceptual
  '5-2': ['zscore','empirical-rule'],
  '5-3': ['xbar-mean','xbar-sd','xbar-se'],
  '5-4': ['phat-mean','phat-sd','xbar-mean','xbar-sd'],
  '5-5': ['phat-mean','phat-sd','phat-se','large-counts'],
  '5-6': ['diff-p-sd','diff-p-se','lincomb-mean','lincomb-var'],
  '5-7': ['xbar-mean','xbar-sd','xbar-se'],
  '5-8': ['diff-x-sd','diff-x-se','lincomb-mean','lincomb-var'],

  // ── Unit 6: Inference for Categorical Data: Proportions ──
  // 6-1 Intro: Why Be Normal? — conceptual
  '6-2': ['one-prop-ci','ci-formula','margin-error','phat-se','large-counts','ten-pct-condition','random-condition','width-ci'],
  '6-3': ['one-prop-ci','ci-formula','margin-error'],
  '6-4': ['one-prop-z','z-test-stat','phat-mean','phat-sd','large-counts','ten-pct-condition','random-condition'],
  '6-5': ['p-value-interp'],
  '6-6': ['p-value-interp','type-i-error','type-ii-error'],
  '6-7': ['type-i-error','type-ii-error','power'],
  '6-8': ['two-prop-ci','diff-p-se','ci-formula','margin-error','large-counts','ten-pct-condition','random-condition'],
  '6-9': ['two-prop-ci'],
  '6-10': ['two-prop-z','pooled-se','diff-p-sd','z-test-stat','large-counts','ten-pct-condition','random-condition'],
  '6-11': ['two-prop-z','pooled-se','p-value-interp'],

  // ── Unit 7: Inference for Quantitative Data: Means ──
  // 7-1 Intro: Should I Worry About Error? — conceptual
  '7-2': ['one-mean-ci','ci-formula','margin-error','xbar-se','df-t','normal-condition','ten-pct-condition','random-condition'],
  '7-3': ['one-mean-ci'],
  '7-4': ['one-mean-t','xbar-se','df-t','normal-condition','ten-pct-condition','random-condition'],
  '7-5': ['one-mean-t','p-value-interp'],
  '7-6': ['two-mean-ci','diff-x-se','ci-formula','margin-error','df-t','normal-condition','ten-pct-condition','random-condition'],
  '7-7': ['two-mean-ci'],
  '7-8': ['two-mean-t','diff-x-se','df-t','normal-condition','ten-pct-condition','random-condition'],
  '7-9': ['two-mean-t','p-value-interp','paired-t'],
  '7-10': ['one-mean-t','two-mean-t'],

  // ── Unit 8: Inference for Categorical Data: Chi-Square ──
  // 8-1 Intro: Are My Results Unexpected? — conceptual
  '8-2': ['chi-sq','expected-gof','df-gof','chi-sq-hyp','chi-sq-conditions','random-condition'],
  '8-3': ['chi-sq','expected-gof','df-gof','chi-sq-conclude','chi-sq-output','std-resid-chi','p-value-interp'],
  '8-4': ['expected-twoway','df-twoway','chi-sq-conditions'],
  '8-5': ['chi-sq','expected-twoway','df-twoway','chi-sq-hyp','chi-sq-select','chi-sq-conditions','random-condition'],
  '8-6': ['chi-sq','chi-sq-conclude','chi-sq-output','std-resid-chi','p-value-interp'],
  '8-7': ['chi-sq-select'],

  // ── Unit 9: Inference for Quantitative Data: Slopes ──
  // 9-1 Intro: Do Those Points Align? — conceptual
  '9-2': ['slope-ci','slope-se','resid-s','df-t','normal-condition','random-condition','slope-mean','slope-sd'],
  '9-3': ['slope-ci'],
  '9-4': ['slope-t','slope-se','df-t','normal-condition','random-condition'],
  '9-5': ['slope-t','p-value-interp','slope-ci'],
  '9-6': ['slope-t','slope-ci'],
};
