# Drum Machine Editor Spec — FL Studio-Style Step Sequencer

## Problem Statement

The music editor's pad rhythm and bass grids use plain dropdown selects that feel clinical and uninspiring. Modifying rhythm patterns requires reading dropdown labels (REST, GHOST, FULL, ACCENT) without any visual representation of the pattern. There's no hi-hat pattern control at all — it's hardcoded to even beats.

## Solution Design

Transform the pad, bass, and hi-hat sections into an FL Studio-inspired step sequencer with clickable colored pads, visual intensity indicators, and a unified drum machine aesthetic.

### Visual Design

```
┌──────────────────────────────────────────────────┐
│  STEP SEQUENCER                                  │
│                                                  │
│  PADS   [■][▪][■][▪][■][▪][█][▪]   ← colored    │
│  BASS   [R][·][R][5][·][R][5][5]   ← note labels │
│  HI-HAT [●][·][●][·][●][·][●][·]   ← toggle     │
│          1  2  3  4  5  6  7  8                  │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Pad Row
- 8 rectangular cells in a horizontal row
- Click cycles: REST (dark/empty) → GHOST (dim amber, 25%) → FULL (medium amber, 55%) → ACCENT (bright amber, 85%) → REST
- Cell fill color and brightness indicates intensity level
- Cell shows a small volume bar inside (height proportional to level)

### Bass Row
- 8 rectangular cells in a horizontal row
- Click cycles through: REST → ROOT → LOW 5TH → MIN 3RD → MAJ 3RD → 4TH → 5TH → REST
- Active cells show the note name in a colored cell (blue-tinted)
- REST cells are dark/empty

### Hi-Hat Row (NEW)
- 8 rectangular cells, binary toggle (on/off)
- Click toggles between on (bright dot) and off (dark)
- Requires new `hihat` field in MUSIC_CONFIG (array of 8: 0 or 1)
- Default: `[1,0,1,0,1,0,1,0]` (current hardcoded even-beat pattern)

### Step Numbers
- Row of step numbers (1-8) below the grid
- Current beat number highlighted during preview playback

### CSS Styling
- Dark cell backgrounds (#1a0800) with rounded corners
- Amber/orange palette for pads matching the game theme
- Blue tint for bass notes
- White/silver for hi-hat
- Subtle glow on active cells
- Hover: slight brightness lift
- Active/pressed: scale 0.95 for tactile feel
- Grid gap: 4px for tight sequencer look
- Channel labels on the left (PADS, BASS, HI-HAT) with channel color dot

## Implementation Plan

### Config Changes
1. Add `hihat` field (array of 8 ints: 0 or 1) to all 12 waves in DEFAULT_MUSIC_CONFIG
2. Update `cloneWaveConfig()` to include `hihat`
3. Update `sanitizeWaveConfig()` to validate `hihat`
4. Update hi-hat scheduling in `seq()` to use `cfg.hihat` pattern instead of hardcoded even beats

### CSS Changes
5. Add `.seq-grid` — the 3-row × 8-column step sequencer container
6. Add `.seq-row` — single row with channel label + 8 cells
7. Add `.seq-cell` — individual clickable pad cell with states
8. Add `.seq-label` — channel name on the left
9. Add color state classes: `.seq-cell--off`, `.seq-cell--ghost`, `.seq-cell--full`, `.seq-cell--accent`, `.seq-cell--note`, `.seq-cell--hat`
10. Add step number row

### Editor UI Changes
11. Replace pad dropdown grid with `.seq-row` of clickable cells
12. Replace bass dropdown grid with `.seq-row` of clickable cells
13. Add hi-hat `.seq-row` of toggle cells
14. Merge all three into a single "STEP SEQUENCER" card
15. Keep dropdown selects as hidden fallback for accessibility

### JS Changes
16. `cyclePadStep(step)` — cycles pad value through [0, .25, .55, .85]
17. `cycleBassStep(step)` — cycles bass note through BASS_OPTIONS values
18. `toggleHihat(step)` — toggles hi-hat on/off
19. `updateHihatStep(step, value)` — update function for hi-hat
20. Update `renderMusicEditor()` to generate step sequencer HTML

### Audio Engine Changes
21. In `seq()` hi-hat loop: use `cfg.hihat` array instead of `i%2===0` hardcoded pattern

## Blast Radius

### Config/Persistence
- DEFAULT_MUSIC_CONFIG: add hihat field to all 12 waves
- cloneWaveConfig: add hihat.slice()
- sanitizeWaveConfig: validate hihat array (8 elements, 0 or 1)
- Backwards compatible: legacy saves without hihat get default pattern

### Audio Engine
- seq() hi-hat scheduling: loop over cfg.hihat instead of even beats
- No change to pad or bass scheduling

### Editor UI
- renderMusicEditor(): major visual change to pad/bass/hihat sections
- New step sequencer CSS rules
- New cycle/toggle JS functions

### No Impact On
- Chord selection, tempo control, volume sliders
- Game mechanics, SRS, scoring
- Mobile layout (sequencer cells are inherently touch-friendly)

## Testing Plan
- Parse check passes
- All 12 waves have hihat field with default [1,0,1,0,1,0,1,0]
- Step sequencer renders 3 rows × 8 cells
- Clicking pad cells cycles through 4 levels with visual feedback
- Clicking bass cells cycles through note options
- Clicking hi-hat cells toggles on/off
- Preview plays with custom hi-hat pattern
- Saves/loads including hihat field
- Mobile: cells are touch-friendly (min 36px tap target)

## Edge Cases
- Legacy saves without hihat: default to [1,0,1,0,1,0,1,0]
- All hi-hat steps off: silence (no crash)
- All bass steps REST: no bass (acceptable)
- All pad steps REST: silence (acceptable)
