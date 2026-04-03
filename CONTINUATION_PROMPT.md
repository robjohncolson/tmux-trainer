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

## Repository Baseline

- Current baseline branch for continuation is `master`.
- The mobile targeting / HUD trim / anti-button-mash / expanded variable-blank drill pass is already merged into `master`.
- The old feature branch `codex/ap-stats-mobile-quiz-polish` was merged and deleted, so future work should build from `master` rather than trying to revive that branch.
- If local tooling files are dirty, treat `AGENTS.md`, `CLAUDE.md`, `.codex/`, and `state/` as unrelated unless the task explicitly involves repo tooling or agent setup.

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

## Latest Update: Selection Reticle + Score Funnel Particles

Added two pieces of gameplay polish to the AP Stats defense board:

- Selected targets now get a stronger screen-space focus treatment:
  - the projected enemy label renders inside an `.enemy-label-shell`
  - selected labels add two animated amber `target-reticle` squares
  - the reticle expands outward in pulses so focus is obvious without changing the enemy mesh or hitbox logic
- Rainbow kill particles now have a two-phase motion:
  - phase 1: burst outward from the hit with a brief expansion window
  - phase 2: redirect toward the score HUD instead of just fading in place
  - this uses a world-space score target derived from the `#h-score` DOM position and camera projection math

Verification completed:

- JavaScript parse check passed after the particle update
- Desktop browser check confirmed the selected label renders both reticle layers
- Mobile browser check confirmed the reticle still renders at `375px`
- Particle sanity check confirmed the intended motion:
  - average distance from source increased from `0` to about `3.19` during the initial burst
  - average distance to the score target dropped from about `11.84` to `6.76` during the funnel phase

## Latest Update: World-Space Reticle + Deferred Score Awards

Implemented the next pass on selection readability and score feedback.

What shipped:

- The selected-target reticle now lives in Three.js around the actual cube instead of inside the projected label DOM.
- The reticle is built from 3 amber square `LineLoop` layers with staggered ghost-pulse expansion.
- The reticle uses yaw-only billboarding so it faces the camera cleanly without full `lookAt` tilt.
- The old label-based `.target-reticle` DOM/CSS treatment was removed.
- Correct-answer score is now deferred into a pending award queue instead of incrementing immediately on hit.
- Rainbow hit particles carry an award id and score only lands when particles reach the score HUD target.
- Score awards are chunked into several arrivals so the HUD steps upward as particles connect.
- The score HUD now does a small `score-pop` flash on arrival.
- Rainbow funnel particles were made more vivid with:
  - additive rendering
  - stronger homing pull
  - slight spiral drift
  - short pooled trail ghosts
  - a tiny score-impact burst near the HUD target
- Mobile reduces rainbow particle count automatically to keep the effect readable and cheaper to render.
- Pending score awards are flushed before save/high-score sync so delayed points cannot be lost on:
  - checkpoint save
  - return to title
  - end screen
  - unload
- Flushing also purges any in-flight tagged particles so deferred awards cannot double-collect after a save/restore boundary.
- Once an award fully lands, any leftover particles from that kill are dropped out of award mode and fade quickly.

Spec artifact:

- Added `selected-reticle-score-funnel-spec.md` with the feature contract, manual blast-radius analysis, and verification plan.

Verification completed:

- Inline script parse check passed after the reticle/award changes.
- Headless Chromium desktop check at `1920x1080` confirmed:
  - selected reticle group is visible on the selected cube
  - score remains unchanged immediately after `handleHit()`
  - pending award count is created on hit
  - full score lands after particle arrival
  - score HUD receives the `score-pop` state
  - checkpoint flush banks pending score and clears tagged particles
- Headless Chromium mobile check at `375x812` confirmed:
  - selected reticle remains visible
  - mobile uses the reduced rainbow particle count
  - full score still lands from particle arrival
  - no console/page errors were raised during the mobile pass

## Latest Update: Focused Labels + Sticky Input Panel

Implemented the next UI/UX pass for gameplay readability, with the work driven by a shared spec plus an external Claude review.

What shipped:

- Enemy labels now have two clear states:
  - unselected enemies render as ghost labels at about `0.55` opacity with no visible border
  - selected enemies render at full opacity with 4 light lock-on bracket corners around the label shell
- The selected arrow was kept as a secondary cue, but it now inherits the selected label color instead of the old amber treatment.
- Depth coloring is preserved for hydra children:
  - depth 0 selected labels use light grey
  - depth 1 stays blue
  - depth 2 stays purple
- The in-world Three.js selected reticle remains in place around the cube as the scene-level cue.
- `#input-panel` is no longer one scrolling block.
- The panel now renders through persistent `#ip-header` and `#ip-body` regions:
  - header stays fixed inside the panel
  - body handles vertical scrolling
- Quiz prompts now place the badge, formula, and question text in the header while answers, hints, explainers, and help live in the scrollable body.
- Typed and prefix-key modes were updated to use the same header/body split.
- Formula rendering now uses a `latex-shell` / `latex-scroll` wrapper:
  - wide formulas can scroll horizontally instead of shrinking too far
  - the right-edge fade indicator now stays pinned on the outer shell instead of scrolling away with the content
- Mobile answer buttons were increased to a minimum height of `56px`.
- Fill-blank answer buttons were increased to the same mobile height.
- Explanation chips were made slightly taller on mobile as secondary controls.
- A darker bottom-stage gradient was added behind the input panel using `#input-panel::before`.
- Quiz answers now flash green/red briefly before resolution:
  - click/touch and keyboard multiple-choice submissions both use the same delay path
  - typed and prefix-key answers remain immediate
- Correct answers are protected during the flash window:
  - the selected enemy is marked with `pendingCorrectHit`
  - movement and breach checks ignore that enemy until the delayed hit resolves
  - this fixes the regression where a correct answer near the end of the path could still breach during the `220ms` flash delay
- During the flash window, target switching and extra quiz inputs are locked so the visual confirmation cannot be interrupted.

Spec artifact:

- Added `ui-focus-sticky-input-spec.md` with the agreed UX contract, manual blast-radius analysis, dependency-aware implementation plan, and tmux-bridge upgrade notes.

GitNexus note:

- `npx gitnexus status` still reports the repo as indexed and current.
- Inline `index.html` JavaScript functions still do not resolve as named symbols for `impact/context`, so blast-radius work for this pass remained manual.

Verification completed:

- Inline script parse check passed after the UI update.
- Headless Chromium harness checks at `375x812` confirmed:
  - selected labels render with 4 brackets
  - ghost labels render at `0.55` opacity
  - the input header remains pinned while the body scrolls
  - answer buttons are `56px` tall
  - formula scroll wrappers are present
  - the gradient backdrop is active
  - tap feedback flash lands before answer resolution
- Headless Chromium harness checks at `1440x900` confirmed:
  - selected/ghost label states render correctly
  - the sticky header behavior still holds
  - the gradient backdrop is active
  - tap feedback flash still triggers correctly
- External Claude review findings from tmux were incorporated:
  - fixed the pending-correct-answer breach bug
  - moved the formula fade from the scrolling element to a stable outer shell
  - a narrower follow-up review was requested after those fixes, but BrowserMCP live verification was unavailable in that session
  - one remaining desktop-only harness failure for `56px` button height is expected because that target applies only to mobile
  - overlap risk from the larger label shell padding and fill-rate cost from the tall backdrop gradient were noted as monitor items, not blockers

## Latest Update: Mobile Canvas Targeting + HUD Trim

Implemented the next mobile usability pass on top of the sticky input work.

What shipped:

- On compact mobile viewports, all unselected enemy labels are now hidden entirely.
- Only the currently selected floating label remains visible on mobile.
- Mobile targeting no longer depends on tapping projected label DOM.
- Tap selection now uses the 3D canvas directly:
  - tapping near an enemy retargets to that enemy
  - swipe cycling still remains available
- The input tray now resets its scroll position when the selected target changes so a new question never opens halfway down the panel.
- The explainer panel now has its own height cap on mobile so answer controls remain at least partially visible on short screens.
- Mobile HUD density was reduced:
  - `MASTERY` is hidden during active gameplay
  - `WAVE` is hidden during active gameplay
  - `SCORE`, `LIVES`, and `STREAK` remain visible
- Desktop keeps the existing ghost-label presentation and current selected-label styling.

Verification completed:

- Inline script parse check passed after the mobile targeting changes.
- Headless Chromium mobile check at `375x812` confirmed:
  - only the selected label remains visible
  - canvas tap can retarget enemies
  - `#ip-body` resets to the top on target change
  - the explainer cap leaves answer controls visible
  - `MASTERY` and `WAVE` are hidden from the mobile HUD

## Latest Update: Anti-Mash Pressure + Expanded Blank Coverage

Implemented the next gameplay polish pass to reduce button-mashing and increase variable-placement practice across the AP Stats deck.

What shipped:

- Wrong quiz answers now punish the run immediately instead of only wasting time:
  - the missed enemy surges forward along the path
  - the fallback speed multiplier increases after the miss
  - miss feedback text now reflects the forward shove
- Hydra split pressure was increased:
  - child enemies now spawn ahead of the parent position
  - child enemies inherit stronger speed multipliers
- Question mix now shifts toward formula-part identification as difficulty rises:
  - `learn`: lower fill-blank rate
  - `practice`: majority fill-blank
  - `challenge`: strongly fill-blank weighted
- AP Stats formula coverage now auto-expands beyond hand-authored blank prompts.
- A new auto-blank pass generates additional “what symbol belongs here?” variants for common AP Stats notation such as:
  - `n`
  - `p-hat`
  - `p0`
  - `mu`
  - `sigma`
  - `sigma_xbar`
  - `SE`
  - `b`
  - `a`
  - confidence-level critical values and related notation where applicable
- The expansion runs against the full AP Stats cartridge so each formula now has multiple blank variants instead of often only one.
- The on-screen AP Stats instruction copy was updated to match the real quiz mechanic.

Verification completed:

- Inline script parse check passed after the gameplay-pressure and blank-expansion changes.
- Headless Chromium mobile page-load smoke check passed at `375x812`.
- Cartridge verification confirmed:
  - `59` AP Stats formula commands
  - every formula has at least `2` fill-blank variants
  - maximum variants per formula is `4`
  - average fill-blank variants per formula is `2.81`
- Manual sampling confirmed the generated blanks are testing symbol placement rather than duplicating the same omission pattern for every command.

## Important Code Areas

- `index.html` CSS top section:
  - overlay styles, mobile breakpoints, music editor styles
  - step sequencer CSS: `.seq-grid`, `.seq-row`, `.seq-cell` with state classes
  - login form CSS: `.login-box`, `.menu-tabs`, `.menu-tab`
  - wrong-answer feedback: `.wrong-feedback`, `.wf-wrong`, `.wf-correct`, `.wf-explain`
  - `latex-shell` / `latex-scroll`, score-pop HUD, label ghosting
- `index.html` `SFX` module (FM synthesis):
  - 14 FM voices: 3 pad + bass + kick + snare + hihat + 7 SFX pool
  - `drumBus` gain node for kick/snare/hihat routing
  - `scheduleFmKick()`, `scheduleFmSnare()`, `scheduleFmHihat()` — drum scheduling
  - FM modulation index approach: `modIndex × carrierFreq` for pitch-independent timbre
  - built-in music defaults with per-wave `padVol`, `bassVol`, `hihatVol`, `kickVol`, `snareVol`, `kick`/`snare` patterns
  - pad rhythm scheduling with FM mod depth envelopes, BGM automation
  - load/save/reset/preview API, volume scaling in `startBGM()`, `setKey()`, `setProgress()`, `seq()`
- `index.html` label projection:
  - `updateLabels()` — cached label DOM via `labelCache` Map
  - `clearLabelCache()` — cleanup on screen transitions
  - `HUD` object + `initHUD()` — cached HUD element refs
- `index.html` ground spotlight: `spotlightTex`, `selectedSpotlight`, `updateSelectedSpotlight()`
- `index.html` input layout / feedback:
  - `setInputPanelContent()`, `queueQuizChoiceResolution()`, `clearQuizAnswerFeedback()`
  - Wrong-answer auto-hold: `QUIZ_ANSWER_FEEDBACK.held`, GOT IT button, space-to-dismiss
  - `renderExplanationControls()` — renders explainer panel with WATCH button + video player
  - `openAnimationForSelectedCommand()` — standalone Alt+W: opens explainer + loads video in one step
- `index.html` music editor:
  - FL Studio-style step sequencer: `cyclePadStep()`, `cycleBassStep()`, `toggleHihat()` + backward variants
  - `renderMusicEditor()` with STEP SEQUENCER card, VOLUME MIX card, ACTIONS card
- `index.html` screens section:
  - `showTitleScreen(context)` — tabbed menu: PLAY / RANKS / MORE tabs via `G._menuTab`
  - Leaderboard fetches per-user progress from lrsl-driller server
  - Login form with student dropdown (fetched from `/api/users`)
  - `showPauseScreen()`, `resumeFromPause()`
- `index.html` cloud auth + sync:
  - `SYNC_SERVER` constant → `https://lrsl-driller-production.up.railway.app`
  - `getIdentity()` / `setIdentity()` / `clearIdentity()` — password in sessionStorage, username in localStorage
  - `verifyUser()` → POST `/api/users/verify`
  - `syncToCloud()` → POST `/api/progress/cartridge-sync` with `modeProgress` JSONB
  - `pullFromCloud()` → GET `/api/progress/cartridge/:username/:cartridgeId` with per-card rev+timestamp merge
  - `cloudSyncReady` gate, `cloudSyncInFlight` guard, `resetRev` tombstone
  - `updateSyncIndicator()` — HUD shows ☁ synced / ☁ syncing / ⚠ offline
  - `visibilitychange` flush on page hide
- `index.html` SRS time decay + exam deadline:
  - `EXAM_DATE = new Date('2026-05-07')` — configurable
  - `applyTimeDecay(srs)` — half-life decay by mastery level (2-14 days)
  - `getExamUrgency()` — returns `{urgency, daysLeft, mode}` (normal/focused/intensive/cram)
  - `pickCommands()` uses exam urgency to prioritize decayed cards and limit new card intake
- `index.html` persistence:
  - `saveSRS(immediate)` — debounced per-answer save with read-modify-write merge + cloud push
  - `sanitizeSrsCard()` — range validation for all 16+ fields
  - `syncRunCheckpoint()`, `saveRunState()`, `loadRunState()`, `clearRunState()`
- `index.html` animation video player:
  - `ANIMATION_BASE`, `animationManifest`, `animationManifestLoading` constants
  - `EXPLAINER_STATE` extended: `animationId`, `videoUrl`, `videoLoading`, `videoError`, `videoNonce`
  - `getAnimationAvailability()`, `fetchAnimationManifest()`, `loadAnimation()`, `closeAnimationVideo()`
  - `renderExplanationControls()` updated with WATCH button, `<video>` element, loading/error states
  - `Alt+W` keyboard binding for animation toggle
  - CSS: `.explain-watch`, `.explain-video-wrap`, `.explain-video`, `.explain-video-close`, `.has-video`
- `index.html` BKT: `clampProb()`, `bayesPosterior()`, `bktUpdate()`, `pickScore()`, `infoGain()`
- `index.html` anti-button-mash: `reshuffleQuestionOptions()`, `enemy.missCount`, attempt cap
- `index.html` MC dedup: identify question generation deduplicates distractor options via Set

## Latest Session Work (April 1-2, 2026)

This session shipped 18 commits covering UI polish, audio, persistence hardening, cloud sync, and exam-prep features.

### Spacebar Fix + Ground Spotlight + Tighter Camera Zoom
- Spacebar no longer restarts the game (preventDefault on all screens, input exemption)
- Replaced 3D square reticle with ground-plane spotlight disc (amber/blue/purple by depth)
- Camera ~35% closer to focused enemy, faster lerp tracking

### Per-Part Volume Controls + FL Studio Step Sequencer
- 3 volume sliders (pads/bass/hihat) with headroom ceilings (pads×0.5, bass×0.35, hihat×0.04)
- Default pads 5%, hihat 11%, bass 60%
- Replaced dropdown grids with clickable step sequencer (3 rows × 8 cells)
- New editable hi-hat pattern (was hardcoded even beats)
- Right-click cycles backward on bass/pad cells

### SRS/BKT Persistence Hardening
- Per-card `rev` counter + `lastUpdated` timestamp for conflict resolution
- `saveSRS()` does read-modify-write per-card merge (prevents stale-tab overwrites)
- `sanitizeSrsCard()` validates all 16 fields, forces BKT v1 params
- Per-answer debounced saves (300ms), HUD “SAVE FAILED” warning

### Performance + Mechanics Polish
- Label DOM caching (no more 60fps DOM rebuild)
- HUD element caching (6 fewer getElementById calls per frame)
- Hydra children skip spawning if parent past t=0.82/0.85
- Session stats (TIME, AVG RESP) on end screen

### Subconcept Question Context
- Parent formula name + LaTeX shown above subconcept questions (“RE: Sample Mean”)
- Fixes “What does Σ mean here?” having no context for what “here” refers to

### Wrong-Answer Feedback Overhaul
- Correction banner shows: ✗ chosen answer, ✓ correct answer, explain text
- Auto-hold: banner stays until GOT IT button or space pressed (no more racing the timer)
- Mobile: tap the banner to dismiss

### Mobile Touch Controls
- ⏸ pause button in HUD (visible only on mobile, top-right)
- Mute button moved to top-left on mobile (was overlapping pause)
- HINT touch button replaces EXPLAIN+HINT (simpler)
- HOW TO PLAY shows both keyboard AND touch controls

### Tabbed Menu System + Leaderboard
- Title screen reorganized into PLAY / RANKS / MORE tabs
- PLAY: domains, difficulty, deploy/continue, exam countdown
- RANKS: leaderboard fetched from server (score, seen/66, mastered stars, medals)
- MORE: cloud login, music editor, HOW TO PLAY, reset progress, QR code

### Cloud Auth + Cross-Device SRS Sync
- Login via lrsl-driller shared auth (student dropdown + password)
- SRS pushed to server on checkpoint saves, pulled on login/title screen load
- Per-card rev+timestamp merge for conflict resolution
- `resetRev` tombstone prevents deleted progress from resurrecting
- Password in sessionStorage (dies on tab close), username in localStorage
- Sync indicator in HUD: ☁ synced / ⚠ offline

### SRS Time Decay + Exam Deadline
- Knowledge decays based on real calendar time since last review
- Half-life by mastery: 2d (m0-1), 3-5d (m2-3), 7-14d (m4-5)
- Mastery levels drop as pKnown decays below thresholds
- EXAM_DATE = May 7, 2026 — countdown on PLAY tab
- Near exam: prioritize decayed cards, reduce new card intake (cram mode last 3 days)

### Formula Name Readability + MC Dedup
- Renamed 34 of 66 command action fields for student clarity
- “Mean of Discrete R.V.” → “Expected Value of a Random Variable”
- All “Std Dev” → “Standard Deviation”, all “SE of” → “Standard Error of”
- MC distractor selection now deduplicates via case-insensitive Set

### Input Panel Slim-Down
- Removed DEFINITIONS/TARGET/A/B/C/D chip row on desktop (saves ~32-120px)
- Hidden .input-help shortcut text (covered by HOW TO PLAY)
- Hidden scrollbar on ip-body
- Desktop input panel max-height 55vh

## Latest Update: Manim Animation Video Player + Generation Pipeline

Implemented a complete pipeline for 3Blue1Brown-style Manim animations embedded in the explainer panel, with Supabase storage and batch generation tooling.

### Video Player in Explainer Panel

- Explainer panel now supports inline video playback of short (10-20s) Manim animations
- WATCH button appears in the explainer title bar when an animation is available
- Uses direct public Supabase URLs with `preload="metadata"` — browser handles streaming/caching
- Tri-state availability model: `unknown` (manifest not loaded, try-on-click) / `available` / `unavailable`
- Animation availability manifest fetched once from Supabase on title screen load
- Video autoplays muted with `playsinline` and `loop`; click/tap toggles mute
- `Alt+W` keyboard shortcut toggles animation video on/off
- Nonce-based stale response guard prevents wrong-formula video after rapid selection changes
- Mobile: entire explainer panel capped at 45vh during video; text explanation lines hidden to save space; video capped at 30vh
- `resetExplanationState()` clears all video state, increments nonce
- Manifest fetch failure preserves `unknown` state for graceful try-on-click degradation

### Supabase Storage Layout

- Reuses existing `videos` bucket at `hgvnytaqmuybzbotosyj.supabase.co`
- Path: `animations/ap-stats-formulas/{commandId}.mp4`
- Availability manifest: `animations/ap-stats-formulas/manifest.json`
- Convention: filename = command `id` field from the deck (deterministic, no lookup needed)

### Batch Generation Pipeline

- `scripts/animation-manifest.json` — 66-entry manifest mapping each command to:
  - formula name, LaTeX, domain, tier
  - generation prompt with curriculum context
  - learning objectives and common misconceptions from `frameworks.js`
- `scripts/generate-animations.py` — batch generation via Math-To-Manim six-agent pipeline
  - Supports `--domain`, `--id`, `--dry-run`, `--render`, `--render-only`
  - Uses `ReverseKnowledgeTreeOrchestrator` with `max_tree_depth=2` for focused explainers
  - Renders to MP4 via `manim render -qm` (720p30)
- `scripts/upload-ap-stats-animations.mjs` — upload rendered MP4s to Supabase
  - Discovers rendered files in `animations/output/{id}/{id}.mp4`
  - Uploads to Supabase with upsert
  - Generates and uploads availability manifest
  - Loads `.env` from project root or falls back to lrsl-driller `.env`

### Codex Review Findings (all addressed)

- HIGH: Input render memoization — clear `lastInputState` on every video state change
- HIGH: Blob URL cache conflict — dropped blob fetching, use direct public URLs
- MEDIUM: Manifest fallback unreachable — tri-state availability with try-on-click
- MEDIUM: No animationId field — added `EXPLAINER_STATE.animationId`
- MEDIUM: AbortController missing — simplified to nonce guard (sufficient for direct URLs)
- LOW: Mobile streaming concerns — direct URL + `preload="metadata"` + panel cap

### Spec Artifact

- `manim-animation-spec.md` with full design, Codex review findings table, and implementation plan

## Latest Update: Shortcut Simplification — Remove Hint, Parallel Alt+E / Alt+W

Simplified the shortcut system from three overlapping learning aids to two clean parallel paths:

### What shipped

- **Alt+E** — text explanation (3-sentence panel, unchanged)
- **Alt+W** — visual explanation (Manim animation video, now standalone — no longer requires Alt+E to be open first)
- **Alt+H removed** — hint mechanic fully deleted

### Hint removal details

- Removed `hintUsed` and `showHint` from game state (`G`), all init/reset paths, and state persistence
- Removed hint scoring penalty (was 0.5x for quiz, 0.7x for typed)
- Removed SRS quality penalty (`q -= 2` when hint used)
- Removed `eliminatedIdx` answer elimination mechanic from quiz rendering and keyboard handlers
- Removed `toggleHintFromButton()` function and mobile HINT touch button
- Removed all "Alt+H" references from help text, instructions, HOW TO PLAY
- Old saved runs with `hintUsed`/`showHint` fields are silently ignored (backward compatible)

### Alt+W standalone

- New `openAnimationForSelectedCommand()` — opens explainer + immediately loads video in one step
- Alt+W handler: close if playing → load if explainer open → open fresh with video if not
- Alt+W added to all `.input-help` strings and HOW TO PLAY

### UI polish (Gemini 3.2 review)

- Video player: title bar renders before video, smooth fade-in animation, glass-morphic close pill
- Mobile video: text lines collapse with opacity/max-height transition (not abrupt display:none)
- Pause screen: removed QR code that was bleeding through overlay
- Global .btn styles: removed #overlay scoping (fixes unstyled GOT IT button)
- Tactile :active press state (scale 0.96) on all interactive buttons
- Themed thin scrollbar on #ip-body (was hidden)
- Mobile mute button: enforced 44px min touch target

### Spec artifacts

- `shortcut-simplify-spec.md` — hint removal + Alt+W independence design
- `gemini-ui-review-prompt.md` — Gemini review prompt for UI polish pass

## Latest Update: Service Worker — Offline Caching

Added `sw.js` for offline-capable caching of the app shell, CDN libs, and Manim animation videos.

### Caching strategy (per Codex review)

- **Navigation (index.html)**: network-first with cache fallback — deploys propagate immediately, offline still works
- **CDN assets** (Three.js, KaTeX, QRCode): cache-first — version-pinned URLs are immutable
- **Animation MP4s**: cache-first from runtime cache — cached after first watch, instant replay
- **Animation manifest**: stale-while-revalidate — picks up new animations on next visit
- **Range requests** (video seeking): bypass SW entirely — prevents broken seeking/206 responses
- **Railway API** (cloud sync): never cached — always hits network

### CDN CORS fix

Added `crossorigin="anonymous"` to all 4 CDN `<script>`/`<link>` tags so the SW gets proper CORS responses instead of opaque objects.

### Install resilience

Same-origin shell precached on install (must succeed). CDN assets cached individually with per-asset error handling — a single CDN failure won't block SW activation.

### Immediate takeover

`skipWaiting()` + `clients.claim()` — new SW versions activate immediately across all tabs.

### Files

- `sw.js` — Service Worker with install/activate/fetch handlers
- `index.html` — 3-line SW registration at end of script, `crossorigin` on CDN tags

## Latest Update: Contextual Color Blend + FM Synthesis Audio

Two parallel features shipped:

### Contextual Color Blend

Explainer panel now uses a cool blue Manim-inspired palette instead of the game's amber theme:
- Panel border/background: `#58C4DD` blue tones
- Title, close button, text lines: cool blue/grey
- Shortcut badges: blue `kbd` pills with blue borders
- Creates a clear "learning mode" visual signal when Alt+E or Alt+W is open
- Rest of the game stays amber — the color shift is contextual

### FM Synthesis Audio Overhaul (Genesis/YM2612 inspired)

Replaced all basic Web Audio oscillators with FM synthesis voices:
- **FM Pads**: carrier sine + modulator at ratio 2, modIndex 0.5 → bell/electric piano timbre
- **FM Bass**: carrier + modulator at ratio 1, modIndex 2 → warm fat bass with pluck attack
- **FM Kick**: pitch envelope 150→55Hz, punchy sine sweep (new instrument)
- **FM Snare**: carrier + modulator ratio 2.3, inharmonic + filtered noise burst (new instrument)
- **FM Hihat**: carrier 400Hz + modulator ratio √2, modIndex 8 → metallic (upgraded from noise-only)
- **FM SFX**: hit (bell, ratio 3), miss (detuned dissonance), breach (low growl, ratio 7), waveClear (arpeggio)
- Uses modulation INDEX (`modIndex × carrierFreq`) for pitch-independent timbre
- 14 FM voices total: 3 pad + bass + kick + snare + hihat + 7 SFX pool
- Added `drumBus` gain node for drum routing

### Music Editor Updates

- Step sequencer expanded from 3 to 5 rows with section headers:
  - DRUMS section: kick, snare, hihat (toggle 0/1)
  - MELODY section: bass, pads (existing multi-level cells)
- Volume MIX card: 5 sliders (pads, bass, kick, snare, hihat)
- DEFAULT_MUSIC_CONFIG: all 12 waves now have kick/snare patterns (varied by wave)
- `sanitizeWaveConfig()` handles all 4 new fields (kick, snare, kickVol, snareVol)
- Full backward compat with old saved configs

### Spec artifacts

- `contextual-blend-spec.md` — color palette design
- `fm-synthesis-spec.md` — full FM synthesis architecture + Codex review findings

## Latest Update: Alt+E Cycle, Answer Lock, Speed Fix

### Alt+E 3-state cycle

- `Alt+E` now cycles: closed → text explanation → video animation → close
- `Alt+W` removed entirely — one shortcut to learn
- `closeAnimationVideo()` and `openAnimationForSelectedCommand()` deleted (dead code)
- `.explain-video-close` CSS deleted (no overlay close button on video)
- Shortcut badge is one contextual button: `[Alt+E] explain` / `[Alt+E] watch` / `[Alt+E] close`
- Panel title bar: one contextual button with `<kbd>Alt+E</kbd>` label showing next action
- `videoLoading` treated as video state — Alt+E during load cancels/closes
- Alt+E blocked during answer feedback flash (`QUIZ_ANSWER_FEEDBACK.locked`)

### Answer lock during learning mode

- `handleQuizChoice()`, `handleHintChoice()`, `handleSubconceptChoice()` — guard: `EXPLAINER_STATE.open` blocks
- Keyboard A/B/C/D blocked in quiz mode when explainer open
- Typed submit (Enter) blocked when explainer open
- Prefix-key progression blocked when explainer open
- MC/fillblank button grids visually dimmed (opacity 0.3, pointer-events none) when explainer open

### Speed fix

- `explainerSlow` only applies when explainer open AND feedback NOT locked
- During answer flash window (~220ms), enemies move at full speed regardless of explainer state

### Spec artifact

- `alt-e-cycle-spec.md` — full design + Codex review findings (5 findings, all addressed)

## Latest Update: Quantized Chord Changes + Streak-Driven Groove

### Chord quantization

- `advanceChord()` now queues chord changes instead of applying immediately
- Preview melody plays instantly on kill (5th + root of next chord, FM bell)
- Chord resolves on next bar start in `seq()` — harmonic changes land on beat 1
- Capped at 2 pending advances — multiple kills in one bar don't create chord salad
- `pendingChordAdvances` reset on BGM start/stop

### Streak-driven groove

| Streak | Addition |
|--------|----------|
| 0-2 | Straight beats from config |
| 3+ | Ghost hihats on odd steps (offbeats, 30% volume) |
| 5+ | Ghost snare fill on step 7 (before downbeat, 40% volume) |
| 8+ | Syncopated kicks on steps 3 and 5 (50% volume) |
| 10+ | Bass passing tones (geometric mean for correct pitch) |

- `SFX.setStreak(n)` called from `handleHit()`, `handleMiss()`, `checkBreach()`
- Miss/breach resets to straight beats on next bar
- Groove embellishments skipped during music editor preview

### Spec artifact

- `chord-quantize-groove-spec.md` — design + Codex review (5 medium findings, all addressed)

## Latest Update: Musical Health — Performance Drives Instrumentation

Replaced kill-driven chord progression with auto-advancing chords + performance-gated layers.

### How it works

- Chords auto-advance every bar in `seq()` — the song plays itself like real music
- Musical health (0-5) determines which layers are audible
- Correct answer: health +1 (layer fades in). Wrong answer: health -1 (layer fades out). Breach: health -2.
- Health 5 = full arrangement. Health 0 = silence (only SFX).
- Wave start resets health to 5.

### Layer stack

| Health | Layers |
|--------|--------|
| 5 | Pads + bass + kick + snare + hihat (+ streak groove at 3+) |
| 4 | Bass + kick + snare + hihat |
| 3 | Kick + snare + hihat |
| 2 | Snare + hihat |
| 1 | Hihat only |
| 0 | Silence |

### API changes

- `advanceChord()` → renamed `musicalHit()` (health +1, kill melody on current chord)
- New: `musicalMiss()` (health -1), `musicalBreach()` (health -2)
- `pendingChordAdvances` deleted — chords are automatic now
- Streak groove gated on `health>=5 && streak>=3`

## Latest Update: Julia Set Fractal Background

Added a fullscreen Julia set fractal rendered as a GLSL shader behind the Three.js scene. The fractal responds to musical health and streak:

- **Health 0**: black background (shader short-circuits, nearly free)
- **Health 1-4**: progressively more detailed fractal (16-64 iterations)
- **Health 5**: full vivid fractal (80 iterations) with gentle pulse
- **Streak 3+**: color cycling accelerates

Each of the 12 waves has a unique Julia `c` parameter creating a distinct fractal shape. Wave transitions change the fractal's geometry.

### Implementation

- Dual-pass rendering: `fractalScene` (ortho camera + fullscreen quad) rendered first, then `renderer.clearDepth()`, then game `scene`
- `ShaderMaterial` with `depthTest:false, depthWrite:false` prevents depth buffer conflict
- Division-by-zero guard: skip fractal pass entirely when `musicalHealth=0`
- GLSL `int` loop with `const int` max for mobile compatibility
- 0.45 intensity cap keeps fractal visible as reward but readable against game elements
- `SFX.getMusicalHealth()`, `SFX.getStreak()`, `SFX.getWaveIndex()` — read-only getters
- Resize handler updates `resolution` uniform

### Spec artifact

- `fractal-background-spec.md` — full design + Codex review (4 findings, all addressed)

## Latest Update: fBm Amber Fractal + Pitch Stability Fix

### fBm shader swap

Replaced Julia set fractal with fractal Brownian motion noise in amber tones:
- Hash-based gradient noise with 5 unrolled octaves (GLSL ES 1.0 compatible via `step()` mask)
- Octaves = musical health (1-5) — dramatically visible complexity growth
- Pure amber palette: dark amber → mid → bright `#ff8c00`
- Streak drives flow speed (faster turbulence at high streak)
- Contrast curve `pow(v, 0.7)` keeps midtones visible
- 0.4 intensity cap — visible as reward, doesn't fight foreground

### Pitch stability fix

Removed `setProgress()` which was detuning pads by up to 50% per wave:
- `setProgress()` function deleted
- `SFX.setProgress()` call in animate() deleted
- `lastProgress` state variable deleted
- `setProgress` removed from SFX public API
- `padBus.gain` now exclusively owned by `seq()` via health gating

Chords now stay perfectly in tune throughout the wave. Only `setKey()` (wave transitions), `syncCurrentVoicing()` (editor), and `seq()` (auto-advance) touch voice frequencies.

## Latest Update: Fractal Trees Background

Replaced fBm shader with 3 recursive 2D fractal trees rendered as Three.js `LineSegments`:

- Recursion depth = musical health (0-5). Health 0 = empty. Health 5 = full canopy. Unmistakable per level.
- 3 trees: center (tall), left (smaller, offset), right (mirrored). Asymmetric, natural.
- Beat-synced sway: `sin(timeSec * omega + depth * 0.4) * swayAmp * (0.2 + depth * 0.8)`. Trunk barely moves, tips sway most. Cascading wind ripple effect.
- Tempo-locked: `omega = (tempo / 60) * 2π`, using `time * 0.001` for seconds.
- Amber color by depth: dark trunk `#3d1f00` → bright gold tips `#ff8c00` via vertex colors.
- Smooth health transitions: `treeDisplayDepth` interpolates toward `targetDepth` each frame.
- `setDrawRange()` controls visible branch count (no per-branch opacity needed).
- Fog disabled on tree material (`fog: false`) to prevent wash-out.
- Pre-allocated `Float32Array` with `DynamicDrawUsage` — zero GC churn.
- 93 segments total at health 5 (3 trees × 31). Cheaper than the shader it replaced.
- Removed: fBm shader, fractalScene, fractalCamera, dual-pass rendering.
- Restored: `renderer.setClearColor(AMB.black)`, single-pass render.

## Likely Next Tasks

- **Quality review rendered animations** — verify pedagogical accuracy per formula
- Add server endpoint for batch leaderboard query (currently N sequential requests)
- Tune SRS decay half-lives based on student feedback
- Add adaptive BKT params (v2) once enough data collected
- Consider splitting `index.html` into modules (now ~4500 lines)
- Add teacher dashboard view for class mastery overview
- Particle pooling for main particles (trail ghosts already pooled)
- Event listener cleanup on screen transitions (memory leak prevention)
- Accessibility pass: ARIA labels, semantic HTML, WCAG contrast fixes

## GitNexus Note

- GitNexus index was refreshed with `npx gitnexus analyze`.
- The current GitNexus CLI in this environment indexed the repo, but it did not resolve the inline JS functions in `index.html` as named symbols for `impact/context`.
- Manual call-site analysis was used for the HTML inline-script functions during this pass.
