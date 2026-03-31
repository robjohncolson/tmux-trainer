# Continuation Prompt — AP Stats Formula Driller Redesign

## What Was Done

### Phase 1: Quiz Mode Redesign
Redesigned the AP Stats cartridge in `index.html` from a "type the full formula" mode to a two-mode quiz system:

### Phase 2: Compact UI (De-occlusion)
Fixed the input panel blocking the 3D game view:
- **Transparent panel**: 35% opacity background, no blur — game fully visible through panel
- **Flexbox MC buttons**: Changed from 2x2 grid to single-row flex layout, reduced padding/font ~40%
- **Smaller LaTeX**: 1.15em (from 1.4em), reduced min-height 24px (from 36px)
- **Hidden help text**: Only visible on panel hover (opacity transition)
- **Queue bar repositioned**: `bottom:80px` (from 130px) to match slimmer panel

### Phase 3: Anti-Spoiler Labels + Adaptive Speed
- **Unit-based enemy labels**: Enemy labels now show chapter/unit references (e.g. "U4 · Distributions", "U6 · Proportions") instead of formula names, which were giving away the answer in identify mode. Labels cached at spawn time.
- **Adaptive speed system**: Replaced fixed speed formula with mastery-aware scaling:
  - Wave 1 = 40% of base speed, increases 8% per wave
  - Higher average mastery = faster enemies (1.0x at mastery 0, 1.5x at mastery 5)
  - Miss penalty (1.5x per miss) still stacks on top
  - Domain-to-unit mapping based on official AP Stats 2026 curriculum (Units 1-9)

### Phase 4: Fill-Blank Always MC + 50/50 Hint System
- **Fill-blank is now pure MC (A/B/C)**: Removed broken text input (cursor bug). All answers are multiple choice.
- **KaTeX rendering fix**: Fill-blank choices now always render LaTeX (was gated behind showHint).
- **50/50 hint (Alt+H)**: Eliminates one wrong answer (grayed out, disabled). Shows conceptual `explain` text instead of mechanical hint. Half-point penalty applies.

### Phase 5: Hydra Split Mechanic
When a student **misses** a formula question, the enemy explodes into 2-3 smaller child enemies. Each child asks a **sub-concept question** about a component of the parent formula (e.g., "Why divide by n?" → "Larger samples reduce variability").

- **39 formulas × 3 sub-concepts each** = 117 sub-concept questions, all multiple choice A/B/C
- **Child enemies**: Smaller 3D mesh (0.30 cube vs 0.45), lighter amber color (#ffaa22), faster spin, less bobbing
- **Split mechanics**: Parent explodes with amber particles, children spawn at parent's path position (staggered), inherit parent's `cmd` for SRS tracking, move at 75% base speed
- **Child misses**: Speed up (1.5x) but do NOT split further (max depth 1)
- **Child hits**: Half points (50% reduction since easier questions)
- **Guard rails**: Max 20 total enemies; if cap reached, fallback to old speed-up behavior
- **SFX.split()**: New split sound effect (sweep + noise burst)
- **50/50 hint works on children**: Alt+H eliminates one wrong sub-concept answer
- **Wave completion**: Naturally waits for all children killed/breached before wave ends
- **39 explain fields**: Each formula has a curriculum-aligned conceptual explanation (e.g. "Larger samples reduce variability — sample size is in the denominator").

### Phase 6: Mobile Compatibility + QR Code
- **Responsive CSS**: 3 breakpoints (768px, 400px, 500px height) with `clamp()` font scaling, 44px min tap targets, safe-area insets for notched devices
- **Touch support**: Swipe left/right to cycle enemies, pinch-zoom prevention, double-tap prevention, iOS AudioContext resume, body overscroll prevention
- **Portrait camera**: FOV widens from 50 to 65 in portrait, camera pulls higher (1.4x Y) and back (1.3x Z), tracking dampened to keep action centered
- **Resize handler**: Uses `visualViewport` API for virtual keyboard awareness, listens to `orientationchange`
- **QR code**: Desktop-only QR code on title screen using qrcode.js CDN, links to `https://robjohncolson.github.io/tmux-trainer/`
- **Canvas touch-action**: Set to `none` to prevent browser gesture interception
- **Viewport**: `maximum-scale=1.0,user-scalable=no,viewport-fit=cover`

### Phase 7: High Score + Chord Progression Fix + Supporting Formulas
- **High score**: Persisted in localStorage, shown on title screen and end screen with "NEW HIGH SCORE!" banner
- **Chord evolution within waves**: `SFX.setProgress(fraction)` evolves pad filter (600-1800Hz) and pitch as enemies are killed within each wave
- **20 supporting formulas** added from AP Stats framework files (tier:'support', available from wave 4):
  - Descriptive (7): z-score, IQR, outlier rule, empirical rule, residual, r-squared, y-intercept
  - Probability (3): complement rule, general multiplication rule, independent multiplication
  - Distributions (3): linear combination mean/variance, linear transformation
  - Chi-Square (4): expected counts (two-way/GOF), df (GOF/two-way)
  - Inference (3): power, margin of error, CI width vs sample size
  - Each has LaTeX, blanks, 3 subconcepts (hydra split compatible)
  - Total: 59 formulas (39 reference + 20 supporting), 177 subconcepts, auto-generated deep concepts

### Phase 8: Anti-Spam + Melodic Arch + Rainbow Death + Chord Isolation
- **Anti-spam cooldown**: 300ms debounce on both handleHit and handleMiss prevents key spamming
- **Melodic arch**: Replaced Circle of Fifths with palindrome tension arc:
  W1:Am→W2:Dm→W3:Gm→W4:Cm→W5:Fm→W6:Bbm (peak tension, tritone from home)
  W7:Bbm→W8:Fm→W9:Cm→W10:Gm→W11:Dm→W12:Am (resolution back home)
- **Rainbow sparkle death**: Correct answers now explode in 7-color rainbow particles (longer life, wider spread)
- **Chord isolation**: setProgress only counts main formula enemies (not sub/deep children) for pad evolution

### New Question Types

1. **Identify (Multiple Choice A-D)**: Formula is rendered in LaTeX. Student picks what the formula calculates from 4 choices. Distractors are auto-generated from other formulas, preferring same domain for difficulty.

2. **Fill-the-Blank (Short Typed Answer)**: Formula is rendered in LaTeX with one variable/exponent replaced by a boxed "?". Student types just the missing piece (e.g., "n-1", "p", "SE"). Much faster than typing entire formulas.

### New Mechanics

- **Enemy speed-up on miss**: Each wrong answer multiplies the enemy's speed by 1.5x (stacks). Visual indicator on enemy label.
- **Hint system (Alt+H)**: For fill-blank questions, hint converts to A/B/C multiple choice. Student gets half points when using hint.
- **LaTeX rendering**: All 39 formulas now render via KaTeX CDN for proper mathematical notation.
- **Half-point penalty**: Quiz mode uses 50% multiplier for hint-assisted answers (vs. flat -30 in other modes).

### Data Changes

All 39 AP Stats 2026 formulas now include:
- `latex`: KaTeX string for full formula display
- `blanks[]`: Array of {latex with blank, answer, 3 choices} for fill-blank mode
- Auto-generated distractors for identify mode (no manual distractor lists needed)
- Removed `key`, `accept`, and `validate` fields (replaced by `validateBlank`)

### Files Modified

- `index.html` — All changes in single file (1133 -> 1330 lines)

## What Was NOT Changed

- tmux cartridge (prefix-key mode) — untouched
- 3D scene, path, server tower, particles, beams — untouched
- SRS system, wave progression, tier unlocking — untouched
- Sound engine — untouched
- Cartridge selection screen — untouched
- localStorage persistence — compatible (same `id` keys)

## Suggested Next Steps

### High Priority
1. **Playtesting**: Open in browser, play through several waves of AP Stats. Verify:
   - LaTeX renders correctly for all 39 formulas
   - Identify mode distractors make sense (not too easy/hard)
   - Fill-blank answers validate correctly (case insensitive, aliases work)
   - Speed-up mechanic feels challenging but fair
   - Hint half-point system works

2. **Blank answer normalization**: The `validateBlank` function handles common aliases but may need expansion. Test edge cases like:
   - "P(B)" vs "p(b)" (currently case-insensitive)
   - "sigma" vs "σ" (Unicode aliases)
   - "n - 1" vs "n-1" (whitespace stripping)

3. **Balance tuning**:
   - Speed multiplier (currently 1.5x per miss — may be too punishing if stacked)
   - Spawn delay vs. question difficulty
   - Half-point penalty for hints (currently 50%)

### Medium Priority
4. **Add more blanks per formula**: Currently 1 blank per formula. Some formulas (especially complex ones like binomial PMF, two-sample tests) would benefit from 2-3 different blank positions to increase variety.

5. **Difficulty scaling**: Early waves could favor "identify" questions, later waves favor "fill-blank". Currently 50/50 random.

6. **Visual feedback on MC buttons**: Add brief green/red flash on correct/wrong choice before enemy dies or speeds up.

### Low Priority
7. **Formula grouping mode**: Let students filter by domain (descriptive, probability, inference, etc.) for focused practice.
8. **Review mode**: After game over, show all missed formulas with full LaTeX and explanation.
9. **Mobile touch support**: MC buttons work on mobile but the game isn't optimized for touch.
