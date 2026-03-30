# Continuation Prompt — AP Stats Formula Driller Redesign

## What Was Done

### Phase 1: Quiz Mode Redesign
Redesigned the AP Stats cartridge in `index.html` from a "type the full formula" mode to a two-mode quiz system:

### Phase 2: Compact UI (De-occlusion)
Fixed the input panel blocking the 3D game view:
- **Glass-morphism panel**: Semi-transparent background (`rgba(13,5,0,0.75)`) with `backdrop-filter:blur(6px)` — game shows through
- **Flexbox MC buttons**: Changed from 2x2 grid to single-row flex layout, reduced padding/font ~40%
- **Smaller LaTeX**: 1.15em (from 1.4em), reduced min-height 24px (from 36px)
- **Hidden help text**: Only visible on panel hover (opacity transition)
- **Queue bar repositioned**: `bottom:80px` (from 130px) to match slimmer panel
- **Overall**: Panel height reduced from ~170px to ~90px, ~50% less occlusion

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
