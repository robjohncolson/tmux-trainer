# Continuation Prompt — AP Stats Formula Defense

## Project Snapshot

- Main game file: `index.html`
- Architecture: single-file HTML/CSS/JS app with Three.js, KaTeX, qrcode.js
- Current cartridge: AP Statistics only
- Entry flow: boot directly to the title screen
- Persistence keys:
  - `td-srs-ap-stats-formulas`
  - `td-highscore-ap-stats-formulas`
  - `td-run-state-ap-stats-formulas`
  - `td-music-config-v1`

## Latest Completed Work

### Dead Code Removal

- Removed the unused cartridge selector screen logic.
- Removed dead selector CSS:
  - `.cart-grid`
  - `.cart-card`
  - related cart-only styling that no longer had callers
- Title screen is now the only menu entry point.

### Mobile Hint Visibility

- `.input-help` is no longer hidden on mobile.
- Mobile now forces it to `display:block` with visible opacity so answer hints render on touch devices.
- Desktop still keeps the lighter hover/focus behavior.

### Music Editor

A full music editor now exists and is reachable from:

- the title screen
- the pause menu

Editor features:

- Wave selector: `W1` through `W12`
- Chord picker: 4 chord slots per wave
- Pad rhythm grid: 8 step loop per wave
- Bass grid: 8 step loop per wave
- Tempo slider
- Preview button
- Save to `localStorage`
- Reset draft back to stock defaults

Implementation notes:

- `MUSIC_CONFIG` is still the source of truth inside the `SFX` module.
- The sound engine now loads saved music config from `td-music-config-v1`.
- Preview uses the current editor draft for a full 4-chord pass without permanently mutating the live config.
- Pad voices now support an editable per-step rhythm pattern instead of a flat sustained bed.
- Preview advances across chords 1 through 4 so all selected chords are audible before saving.
- Save writes the whole 12-wave draft to `localStorage`.
- Reset restores the draft to the built-in defaults until saved.

### Menu / Pause Flow

- Added `showPauseScreen()` and `resumeFromPause()` so pause rendering is no longer embedded directly inside the key handler.
- `Escape` now:
  - closes the music editor if it is open
  - otherwise saves progress/high score and exits the current run back to the title screen
- `P` now toggles pause/resume during active gameplay.
- The pause screen now includes an explicit `[ MAIN MENU ]` button in addition to resume and music editor actions.
- `Space` no longer auto-clicks editor buttons while the music editor is open.

### Return-To-Menu High Score

- Returning to the title screen from gameplay now calls `showTitleScreen('game')`.
- In that path, the saved high score is rendered as a large animated badge that drifts across the title screen like a DVD screensaver bounce.
- Mid-run exits now write the latest score to `td-highscore-ap-stats-formulas` before returning, so the badge appears immediately after `Escape`.
- Normal title-screen entry still shows the smaller static high score line.

### Run Checkpointing

- Added a shared checkpoint path for run exits and wave clears:
  - `saveSRS()`
  - high-score sync
- Added resumable run snapshots in `td-run-state-ap-stats-formulas`.
- `Escape` and `[ SAVE + EXIT ]` now preserve the live run state instead of only banking long-term SRS progress.
- The title screen now shows `[ CONTINUE ]` with a compact wave / score / lives summary when a saved run exists.
- `continueGame()` restores score, lives, wave, remaining queue, active enemies, and wave-clear state.
- Wave clear now checkpoints progress immediately instead of waiting for the next wave or end screen.
- The wave-clear panel now includes `[ SAVE + EXIT ]` so players can bank progress and return to the main menu between waves.
- Fresh deploys, reset progress, and completed runs clear the saved run snapshot.

### Audio Startup Cleanup

- BGM start/stop now clears queued Web Audio automation before relaunching the loop.
- Title/pause/end transitions also cancel delayed BGM start timers so a previous preview or rapid exit cannot leak an extra opening bar into the next run.

## Current UI Layout

### Title Screen

- AP Stats title + subtitle
- instructions
- domain filters
- difficulty buttons
- static high score on normal entry
- animated “DVD-style” high score badge when returning from pause/end-of-run
- continue summary + continue button when a run snapshot exists
- deploy button
- music editor button
- reset progress link
- QR code block

### Music Editor

- Responsive overlay panel
- Desktop: two-column layout
- Mobile: stacked single-column layout with internal scroll
- Pad rhythm card sits alongside the other wave controls
- Action buttons are at the bottom of the editor panel

### In-Run Overlays

- Pause overlay:
  - resume
  - music editor
  - main menu
- Wave-clear panel:
  - next wave
  - save + exit

## Verification Completed

Verified in a headless browser against `http://127.0.0.1:4173/index.html`.

Desktop verification:

- `Escape` from an active run returns to the title screen
- `Escape` stores SRS progress, current high score, and a resumable run checkpoint before the title screen renders
- `[ CONTINUE ]` restores wave, score, lives, selected enemy, and queued state from the saved checkpoint
- `P` opens pause and `P` resumes from pause
- Music editor opens from title screen
- Music editor opens from pause menu
- Returning to menu from gameplay shows the animated high-score badge
- Wave clear shows a `[ SAVE + EXIT ]` control and persists checkpoint data
- Continuing from a saved wave-clear checkpoint reopens the wave-clear panel instead of restarting the run
- Delayed BGM launch is canceled if the player exits before startup finishes
- All required controls render:
  - 12 wave buttons
  - 4 chord selects
  - 8 pad rhythm selects
  - 8 bass selects
  - tempo slider
  - preview/save/reset actions

Mobile verification:

- `Escape` from an active run returns to the title screen with the animated high-score badge
- Saved runs still surface `[ CONTINUE ]` after returning to the title screen
- Music editor renders at `375px` width
- Editor panel is scrollable and bottom actions are reachable
- Pad rhythm controls render and remain selectable
- `.input-help` resolves to visible mobile styles:
  - `display: block`
  - opacity > 0

## Latest Update: Local Explanation Bank

Implemented a fully local explainer system for the AP Stats cartridge. This does not call any AI/API service and is built from shipped deck metadata plus a handwritten glossary for notation answers used in fill-blank prompts.

What shipped:

- `EXPLANATION_BANK` is built in `index.html` from:
  - command-level formula/concept entries keyed by command id and stripped action label
  - `EXPLANATION_GLOSSARY` entries for notation answers like `n`, `p-hat`, `p0`, `mu`, `sigma`, `SE`, `Q1`, `P(A ∩ B)`, `z* or t*`, etc.
- The input tray now renders explainer controls directly under the active prompt:
  - identify questions: `TARGET` plus `A/B/C/D`
  - fill-blank questions: `TARGET` plus `A/B/C`
  - typed/prefix/subconcept prompts: `TARGET`
- Clicking an explainer chip opens a compact 3-sentence panel:
  - sentence 1: what it is
  - sentence 2: when to use it
  - sentence 3: a recognition clue
- `Alt+E` toggles the target explainer from keyboard.
- Explainer state is reset when:
  - selection changes
  - auto-select picks a new enemy
  - a target is killed
  - hydra splits replace the current target
  - screen transitions move out of gameplay
- Mobile behavior:
  - `#input-panel` already had internal scrolling; explainer open/close now also drives tray scroll position
  - opening an explanation auto-scrolls the tray so the definition panel is visible
  - closing or resetting the explainer returns the tray to the top

Verification completed:

- JavaScript parse check passed on the inline `<script>` block
- Browser-verified in headless Chromium at `1920x1080` and `375x812`
- Confirmed:
  - identify-mode answer explainers open and show 3 lines
  - fill-blank answer explainers open and show 3 lines
  - `Alt+E` opens the target explainer from a closed state
  - mobile explainer panel stays within the viewport after the auto-scroll fix
  - explainer help text renders in the tray on both viewports

## Important Code Areas

- `index.html` CSS top section:
  - overlay styles
  - mobile breakpoints
  - music editor styles
  - explainer tray styles
- `index.html` `SFX` module:
  - built-in music defaults
  - pad rhythm scheduling
  - BGM automation cleanup
  - load/save/reset/preview API
- `index.html` explanation helpers:
  - `EXPLANATION_GLOSSARY`
  - `buildExplanationBank()`
  - `normalizeExplanationLookup()`
  - `openExplanationForActiveAnswer()`
  - `openExplanationForSelectedCommand()`
  - `renderExplanationControls()`
- `index.html` music editor helpers:
  - chord library
  - pad options
  - bass options
  - editor render/update functions
- `index.html` screens section:
  - `showTitleScreen(context)`
  - `showPauseScreen()`
  - `resumeFromPause()`
- `index.html` persistence / exit helpers:
  - `syncHighScore()`
  - `syncRunCheckpoint()`
  - `saveRunState()`
  - `loadRunState()`
  - `clearRunState()`
  - `returnToTitleFromRun()`
- `index.html` run-entry helpers:
  - `startGame()`
  - `continueGame()`
  - `queueBGMStart()`
  - `cancelQueuedBGMStart()`
- `index.html` wave-clear handling:
  - `updateInput()`
  - `checkWaveComplete()`

## Likely Next Tasks

- Expand the explanation glossary beyond AP Stats if more cartridges get the same explainer UI
- Add richer per-term overrides where the generated command-based sentences feel too generic
- Consider a small touch-only `?` affordance on each answer row if mobile users miss the explainer chips
- Expand pad rhythm presets if users want one-click groove templates instead of per-step editing
- Add a touch-visible pause/menu button if mobile players need the new pause flow without a hardware keyboard
- Decide whether `Continue` should restore an exact mid-wave moment forever or periodically collapse back to “start of current wave” checkpoints for simpler state
- Expand chord library if more harmonic variety is wanted than major/minor triads
- Add explicit “discard draft changes” behavior if the editor should preserve unsaved edits across closes
- Consider naming editable waves separately from the original song labels if users should author custom presets
- If more structural work happens, split `index.html` into smaller modules before feature work gets deeper

## GitNexus Note

- GitNexus index was refreshed with `npx gitnexus analyze`.
- The current GitNexus CLI in this environment indexed the repo, but it did not resolve the inline JS functions in `index.html` as named symbols for `impact/context`.
- Manual call-site analysis was used for the HTML inline-script functions during this pass.
