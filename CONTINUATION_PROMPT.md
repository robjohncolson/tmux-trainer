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
- `index.html` BKT + DAG: `clampProb()`, `bayesPosterior()`, `bktUpdate()`, `pickScore()`, `infoGain()`, `PREREQ_DAG`, `SHARED_PREREQ_NODES`, `buildDAGFromSubconcepts()`, `wireL1toL2()`, `validateDAG()`, `canNodeSplit()`, `selectWeakestPrereqs()`, `getTransferSeed()`, `spawnHydraChildren()` (recursive DAG traversal)
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

## Latest Update: Grounded Trees + fBm Amber Sky

### Trees grounded on terrain

- `terrainHeight(x,z)` helper extracts the terrain height formula for reuse
- Tree mesh positions now use `terrainHeight(tc.x, tc.z)` for y — trunks grow from the grid surface
- Tree positions: center (0,-4), left (-5,-6), right (4.5,-5) — behind the enemy path
- Trees grow upward in world y from their terrain-grounded base

### fBm amber sky restored

- Brought back the fBm noise shader as a pure decorative backdrop (always 5 octaves, not health-driven)
- `skyScene` + `skyCamera` + `skyMaterial` — separate render pass
- Dual-pass: sky rendered first → `clearDepth()` → game scene on top
- Dimmed to 0.25 intensity so it doesn't fight the game foreground
- Gentle time-based pulse animation

### Render order

1. fBm amber sky (fullscreen shader quad)
2. Clear depth buffer
3. Game scene (terrain, trees, enemies, particles, etc.)

Trees are IN the game scene so they interact with fog, camera, and depth correctly.

## Latest Update: Growing Forest — Trees Drive Music, Expand Across Waves

### Trees are the source of truth

- `G.treeDepth` (0-10) replaces `musicalHealth` as the primary state variable
- Main formula kills (splitDepth === 0): treeDepth +1. Subconcepts: no change.
- Wrong answer: treeDepth -1. Breach: treeDepth -2. Cap at 10, floor at 0.
- Music reads tree depth via `SFX.setTreeDepth(d)` → clamps to 0-5 for layer gating
- treeDepth persists across waves. Only resets to 3 on new game.
- Saved/restored in run state checkpoints (old saves default to 3).

### Progressive forest expansion

- 10-tree pool with `unlockAt` thresholds (1, 3, 3, 5, 5, 7, 7, 9, 9, 10)
- Pioneer tree always tallest; later trees "catch up" at shorter depth
- treeDepth 1: lone sapling → treeDepth 10: full fractal forest of 10 trees

### Groove at treeDepth 7+

- `grooveAlways` flag set when treeDepth >= 7
- Streak groove plays even at streak 0 when forest is lush enough

### Dynamic sky

- Wind drift: UV offset by `time * 0.02, time * 0.008` — clouds flow
- Brightness driven by treeDepth: 0.15 (barren) → 0.35 (full forest)
- Horizon fade: `smoothstep(0.15, 0.55, y/resolution.y)` — no hard edge with grid

### API changes

- `SFX.musicalHit()` → `SFX.killMelody()` (melody only, no health change)
- `SFX.musicalMiss()` / `SFX.musicalBreach()` → deleted (game code sets `G.treeDepth` directly)
- `SFX.setTreeDepth(d)` → new, replaces all three

## Latest Update: Validation Fixes + Tree Scaling

### Reshuffle timing fix
- `reshuffleQuestionOptions()` moved from `resolveFn()` to `clearQuizAnswerFeedback()`
- Options stay stable while wrong-answer feedback is visible (GOT IT / space)
- `QUIZ_ANSWER_FEEDBACK.reshuffleEnemyId` stores target for deferred reshuffle

### validateBlank LaTeX normalization fix
- `norm()` now strips LaTeX formatting: `\\`, `{`, `}`, `_` via `.replace(/[\\{}_]/g,'')`
- Fixes: `\\beta` now matches answer `beta`, `\\mu_0` matches `mu0`, etc.
- Fillblank questions now include `correctIdx` for proper wrong-answer feedback display
- `reshuffleQuestionOptions` maintains `correctIdx` for fillblank after reshuffle

### Tree sizing
- TREE_POOL z-coordinates restored to original (-4..-10, close to action)
- `len` values scaled down ~40% (e.g., 3.5→2.1, 2.8→1.7) so trees fit in viewport when zoomed

## Latest Update: SRS Tuning + Variable Questions + Batch Leaderboard

### SRS half-life tuning for exam prep
- Half-lives changed from [2,2,3,5,7,10,14] to [2,3,5,10,18,30,45] days by mastery
- Mastery-5 cards now survive weekly study gaps (86% retained vs 62% before)
- Urgency threshold shifted: focused mode at 35 days (was 30)

### Variable Role question type
- New `VARIABLE_BANK` constant: 66 entries (2-3 vars per command) with AP Stats-accurate descriptions
- 20% chance of variable question when command has vars in bank
- "What does [symbol] represent in this formula?" with 4-option MC
- Green "VARIABLE" badge distinguishes from identify questions
- Integrated into keyboard handler, reshuffleQuestionOptions, and handleQuizChoice

### Batch leaderboard client
- `fetchLeaderboardRows()` tries `/api/progress/leaderboard/{cartId}` first (1 request)
- Falls back to sequential per-user fetch if batch endpoint returns non-200
- Server-side batch endpoint in lrsl-driller is a follow-up task

## Latest Update: Prerequisite DAG — Fractal Knowledge Decomposition

Replaced the flat `subconcepts[]` system with a recursive prerequisite DAG. Wrong answers now fractal-unfold into builder concepts down to Algebra 1 foundations.

### PREREQ_DAG system
- `PREREQ_DAG` flat lookup table of prerequisite knowledge nodes
- L1 nodes auto-generated from existing subconcepts via `buildDAGFromSubconcepts()`
- 66 hand-authored shared L2-L5 nodes across all AP Stats domains
- `wireL1toL2()` pattern-matches 198 L1 subconcept questions to L2 prereqs via 43 regex rules (95% coverage)
- `validateDAG()` runs at startup: cycle detection + dangling ref check
- Commands gain `prereqs: [nodeId, ...]` pointing into the DAG
- Curriculum-grounded: L2-L5 node hierarchy cross-referenced against AP Stats framework from `../school/follows-along`

### Recursive hydra (replaces fixed 2-level system)
- Miss L0 → spawns weakest 2 L1 prereq enemies (always, if prereqs exist)
- Miss L1 → first encounter = speed-boost only (no split). Second+ encounter with pKnown < 0.3 → splits into L2 prereqs
- Fractal unfolding continues to L5 (arithmetic floor) via same one-level-at-a-time gate
- Ancestor spawn budget: max 4 living descendants per L0 ancestor
- Legacy subconcept fallback if command has no DAG prereqs

### DAG-aware BKT
- `dagState` map on each SRS card: `{ nodeId: { pKnown, encounters, lastEncounterWave } }`
- `bktUpdate()` routes to `dagState` when `dagNodeId` is present, legacy `subPKnown` fallback
- `recomputeCompositePKnown()` only averages L1 (direct prereq) nodes — deeper nodes influence indirectly
- `getTransferSeed()` seeds shared nodes at 0.3 (instead of 0.1) if mastered under another command
- Critical timing: `canNodeSplit()` checked BEFORE `bktUpdate()` to avoid encounter-gate bypass

### Depth-based visuals
- L1 Prereq: blue #4488ff, 0.30 box
- L2 Builder: cyan #44bbcc, 0.18 box
- L3 Foundation: green #44cc66, 0.15 box
- L4-L5 Basic: gray #cccccc, 0.12 box
- Depth-specific flash messages: "SPLIT! PREREQS INCOMING" → "BACK TO BASICS"
- L1-L2: 3-option MC, L3+: 2-option MC

### Miss penalty tuning (encourages deep exploration)
- Tree depth: only penalized on L0 misses; prereq misses (L1+) are free
- Surge: inverted curve — L0=0.15, L1=0.08, L2=0.04, L3+=0.02
- Speed fallback: gentler for prereqs — L0=1.85x, L1=1.4x, L2+=1.2x

### DAG node inventory (66 shared nodes across L2-L5)
- L2 (19 nodes): SE, z-score, hypothesis, critical value, slope, mean, independence, CLT, pooling, df, observed-vs-expected, unbiased-estimator, etc.
- L3 (12 nodes): deviation, ratio, constraint, probability, subset, distribution shape, rate of change, weighted average, coordinate pairs, etc.
- L4 (12 nodes): equal sharing, part-of-whole, number line, self-multiply, Venn overlap, rise/run, bigger-smaller, etc.
- L5 (9 leaf nodes): add, subtract, multiply, divide, percent-to-decimal, fraction-of-group, compare-numbers, square-number, count-items
- Every branch reaches L5 (verified by Codex: no dangling refs, no cycles)

### Migration
- `dagState: {}` added to SRS card schema
- `sanitizeSrsCard()` validates dagState entries
- `loadSRS()` auto-migrates old `subPKnown` to `dagState` keyed by prereq node IDs
- `srsHit`/`srsMiss` deep-clone dagState

### Files
- `index.html` — all changes in inline `<script>`:
  - New section: PREREQ_DAG + 66 shared L2-L5 nodes + wireL1toL2 + utility functions (~lines 2779-2970)
  - Modified: `recomputeCompositePKnown`, `bktUpdate`, `initSRS`, `sanitizeSrsCard`, `srsHit`, `srsMiss`, `loadSRS`
  - Modified: `handleHit`, `handleMiss` (DAG-aware BKT context + split gate)
  - Rewritten: `spawnHydraChildren` (recursive DAG traversal)
  - Renamed: `handleSubconceptChoice` → `handlePrereqChoice` (alias preserved)
  - New meshes: `builderGeo/Mat`, `foundationGeo/Mat`, `basicGeo/Mat`
  - Modified: `addChildEnemyMesh`, `updateEnemyMeshes` (5-depth color support)
  - Boot: `buildDAGFromSubconcepts` + `installSharedNodes` + `wireL1toL2` + `validateDAG`
- `prerequisite-dag-spec.md` — full spec with review findings incorporated

## Latest Update: 10 New AP Stats Commands + Animations + Mobile Melody Composer (April 4, 2026)

### 10 New AP Stats Commands (76 total)

Added end-to-end curriculum coverage with 10 new commands:

| ID | Formula | Tier | Domain |
|----|---------|------|--------|
| `variance` | s² = Σ(xi - x̄)² / (n-1) | support | descriptive |
| `ten-pct-condition` | n < 0.10 · N | support | inference |
| `std-resid-chi` | (O - E) / √E | support | chi-square |
| `one-prop-ci` | p̂ ± z* √(p̂(1-p̂)/n) | regular | inf-proportions |
| `two-prop-ci` | (p̂₁-p̂₂) ± z* √(...) | power | inf-proportions |
| `one-mean-ci` | x̄ ± t* s/√n | regular | inf-means |
| `two-mean-ci` | (x̄₁-x̄₂) ± t* √(...) | power | inf-means |
| `random-condition` | Random sample/experiment | support | inference |
| `normal-condition` | Large counts / n≥30 | support | inference |
| `p-value-interp` | P(observed \| H₀ true) | support | inference |

Each has: 3 subconcepts, 2+ blanks, variable bank entries, Codex-reviewed. All wired into DAG via wireL1toL2 (0 unwired subconcepts, 53 regex rules, 73 shared L2+ nodes).

### 10 Manim Animations (76 total)

Wrote 3Blue1Brown-style Manim scripts directly (no LLM pipeline — Claude writes them), rendered at 720p30, uploaded to Supabase. Each ~260-390 KB, ~15 seconds.

Animation style: dark background (#1e1e1e), color-coded formula parts (blue=statistic, gold=±/result, red=critical value, green=SE), step-by-step reveals, numerical examples, number-line intervals for CIs.

Files: `animations/output/{id}/{id}.py` + `{id}.mp4`
Manifest: `scripts/animation-manifest.json` (76 entries), `scripts/animation-availability.json` (76 IDs)
Supabase: `videos/animations/ap-stats-formulas/{id}.mp4` + `manifest.json`

### Mobile Melody Composer

The compose mode (unlocked at tree depth 7+) was entirely keyboard-driven. Now works on mobile:

- **Tappable piano keys**: white keys show note names (C4, D4, ..., E5), each with `onclick` → `handleComposeKey()`
- **Tappable black keys**: show note names (C#, D#, ...), `pointer-events:none` when locked (td<9) + handler `td>=9` double guard
- **Modifier row**: 4 tappable buttons — `· rest`, `— hold`, `⌫ undo`, `▶ play`/`■ stop`
- **Touch feedback**: `.piano-key-touch:active div` scales + highlights
- REDO / KEEP / BACK action buttons already worked (onclick)
- Keyboard handler untouched — desktop still uses A-L keys

### Server-Side Batch Leaderboard (lrsl-driller)

Added `GET /api/progress/leaderboard/:cartridgeId` endpoint (commit 664a994 in lrsl-driller):
- Single Supabase query for all progress rows + batched user metadata
- Returns `[{username, real_name, gold_stars, silver_stars, high_score}]`
- Client-side updated from 30+ sequential fetches to `Promise.allSettled` → batch endpoint

### Voluntary Decomposition (? button)

- Press `?` on any enemy with DAG prereqs to spawn 3 sub-concept children
- Parent stays alive, children spawn ahead at `t + 0.03 + 0.03*i`
- BFS fill (`collectPrereqs()`) ensures exactly 3 children from deeper DAG levels
- Slight BKT nudge (15%) — counts as learning signal
- Auto-select always picks highest `t` (closest to castle)

### Gameplay Tuning

- Inverted surge curve: L0=0.15, L1=0.08, L2=0.04, L3+=0.02 (was flat 0.30)
- No tree loss for prereq enemies
- `canNodeSplit` checked BEFORE `bktUpdate` (encounter gate fix)
- Trees wave at quarter speed
- `[N]`/`[S]` keyboard shortcuts on wave clear screen
- `[P]`/`[R]`/`[M]` shortcuts for PLAY/RANKS/MORE tabs

### Important Code Areas (new)

- `index.html` compose UI: tappable piano keys, modifier row (lines ~4555-4580)
- `index.html` `handleComposeKey()`: PIANO_WHITE/PIANO_BLACK maps, rest/hold/undo (lines ~3854-3878)
- `index.html` `voluntarySplit()`: BFS prereq fill, parent preservation (near `spawnHydraChildren`)
- `index.html` `collectPrereqs()`: BFS to fill exactly 3 children from DAG
- `scripts/animation-manifest.json`: 76-entry generation manifest
- `scripts/upload-ap-stats-animations.mjs`: Supabase upload script (reusable for future animations)

## Latest Update: Bloom Post-Processing — Health-Driven Visual Focus

Added UnrealBloomPass from Three.js r128 postprocessing chain, driven by tree health (0-10).

### How it works

- Tree depth 0: no bloom — flat, dead scene
- Tree depth 1-4: progressively warmer glow on trees, enemies, terrain
- Tree depth 5-8: rich vivid bloom, scene feels alive
- Tree depth 9-10: full triumphant bloom (strength 0.9, radius 0.6, threshold 0.4)
- Asymmetric lerp: health loss fades bloom fast (0.1 rate), health gain builds slowly (0.05 rate)
- Sky stays visually soft — bloom only enhances foreground game elements

### Render pipeline

- Sky pre-rendered into EffectComposer's internal FBO (`renderTarget1`)
- `RenderPass.clear = false` so game scene composites on top of sky in same FBO
- UnrealBloomPass processes combined sky+game image
- Buffer state explicitly reset each frame for stability
- CDN failure fallback: if bloom scripts don't load, `bloomComposer` stays `null` and original dual-pass renderer runs

### CDN dependencies (6 new scripts)

- CopyShader, LuminosityHighPassShader, EffectComposer, ShaderPass, RenderPass, UnrealBloomPass
- All from `cdn.jsdelivr.net/npm/three@0.128.0/examples/js/`
- Non-module UMD scripts that register on global `THREE` object (matches existing r128 setup)
- All tags have `crossorigin="anonymous"` for SW CORS compatibility

### Mobile performance

- Bloom resolution defaults to 0.5x on mobile (`navigator.maxTouchPoints > 0`)
- Resize handler updates bloom resolution with mobile scale factor
- `composer.setSize(w, h)` uses CSS pixels only (EffectComposer reads pixel ratio internally)

### Service worker

- 6 new CDN URLs added to `CDN_URLS` in `sw.js`
- Cache bumped from `td-shell-v1` to `td-shell-v2`

### Review findings (all addressed)

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | HIGH | Composer FBO would overwrite sky backbuffer | Pre-render sky into FBO, `renderPass.clear=false` |
| 2 | MEDIUM | Missing ShaderPass.js dependency | Added 6th script tag |
| 3 | MEDIUM | Mobile bloom fallback was opt-in | Default 0.5x on all mobile |
| 4 | MEDIUM | CDN failure guard incomplete | `if(bloomComposer)` with fallback branch |
| 5 | LOW | `setSize(w*pr)` would double-count pixel ratio | CSS pixels only |
| 6 | LOW | Lerp rate 0.05 sluggish on health loss | Asymmetric: 0.1 decay, 0.05 growth |

### Spec artifact

- `bloom-postprocessing-spec.md` — full design + review findings table

### Important code areas (new)

- `index.html` bloom init: `bloomComposer`, `bloomPass`, CDN guard (~line 4020-4033)
- `index.html` animate() bloom render: FBO pre-render + `bloomComposer.render()` (~line 6202-6227)
- `index.html` resize: `bloomComposer.setSize()` + mobile bloom resolution (~line 6240-6244)
- `sw.js`: 6 postprocessing CDN URLs in `CDN_URLS`, cache `td-shell-v2`

## Latest Update: Bloom Tuning + Miss Cap + Application/Relationship Questions

### Bloom tuning
- Max bloom strength reduced from 0.9 to 0.35, radius from 0.6 to 0.25, threshold floor from 0.4 to 0.7
- Fixes the heavy ghosting at high tree depth — now a subtle warm glow

### Miss cap (anti-button-mash)
- L0 main formula enemies: 2-miss cap → forced breach (costs a life)
- L1+ prereq enemies: 3-miss cap → forced breach (slightly gentler)
- Random guessing on 4-option MC now has only 6.25% chance of surviving a main formula
- Replaces the old speed-boost-only penalty that allowed brute-forcing through levels

### Application question type (new)
- Green "APPLICATION" badge
- 1-2 sentence real-world scenario: "Which formula or concept applies?"
- 4-option MC with authored `confusionSet` per scenario (deliberate confusion pairs, not random)
- 101 scenarios across 72 commands, focused on inference and conditions (AP exam core)
- `APPLICATION_BANK` constant keyed by command id

### Relationship question type (new)
- Purple "RELATIONSHIP" badge
- Formula shown with prompt: "In [formula], holding other quantities constant: What happens to [output] when [input] increases?"
- 3-option MC: Increases / Decreases / Stays the same
- 61 entries across 34 commands, focused on sample size effects, confidence level, variability
- `RELATIONSHIP_BANK` constant keyed by command id
- Wrong-answer feedback shows the relationship explanation

### Question generation mix (renormalized)
- Base weights by difficulty:
  - learn: identify 40%, fillblank 25%, variable 15%, application 10%, relationship 10%
  - practice: identify 15%, fillblank 45%, variable 10%, application 15%, relationship 15%
  - challenge: identify 5%, fillblank 45%, variable 10%, application 20%, relationship 20%
- Weights renormalized over available types per command (commands without banks skip those types)

### DAG and BKT integration
- Application/relationship misses do NOT trigger DAG decomposition (student confused which formula, not its internals)
- BKT update weight: 0.7x for application/relationship (tests transfer, not recall)
- `bktWeight` field added to BKT context, applied as scaled posterior move in `bktUpdate()`

### Codex review findings (all addressed)
| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | HIGH | Distractors need authored confusion pairs | `confusionSet` per scenario |
| 2 | HIGH | Relationship prompts omit ceteris paribus | "holding other quantities constant" in template |
| 3 | HIGH | Application misses → wrong DAG remediation | Skip DAG split for new types |
| 4 | MEDIUM | Probability fallback math undefined | Renormalize over available types |
| 5 | MEDIUM | BKT treats new types same as recall | 0.7x weight for application/relationship |
| 6 | MEDIUM | UI render contract for long scenarios | Scenario capped to 2 lines, formula in body |
| 7 | LOW | Inconsistent authoring scope | 76 commands, 101 app scenarios, 61 rel entries |

### Spec artifact
- `application-relationship-spec.md` — full design + Codex review findings

### Important code areas (new)
- `index.html` APPLICATION_BANK: 101 scenarios with confusionSets (~line 2010-2094)
- `index.html` RELATIONSHIP_BANK: 61 entries with direction/explain (~line 2096-2152)
- `index.html` generateQuestion(): renormalized 5-type weight system (~line 1861-1955)
- `index.html` setInputPanelContent(): application + relationship rendering (~line 4800-4842)
- `index.html` handleQuizChoice(): accepts application/relationship types
- `index.html` keyboard handler: A-D for application, A-C for relationship
- `index.html` bktUpdate(): `bktWeight` scaling of posterior move
- `index.html` handleMiss(): `skipDAG` for application/relationship types

## Latest Update: CSS Filter + Vignette — Health-Driven Visual Atmosphere

Replaced the removed bloom with two lightweight, zero-ghosting visual layers.

### CSS Filter (color warmth)
- `canvas.style.filter` driven by tree health via smooth lerp
- Health 0: `saturate(0.85) contrast(0.92)` — washed out
- Health 10: `saturate(1.10) contrast(1.00)` — vivid warm
- Quantized to 2dp with string cache to minimize DOM writes on mobile

### Vignette Shader (cinematic edges)
- Fullscreen quad in dedicated `vigScene` rendered after game scene
- `smoothstep(0.35, 0.95, distance)` darkens screen edges
- Health 0: intensity 0.60 (heavy tunnel vision), Health 10: intensity 0.15 (subtle)
- `transparent:true, depthTest:false, depthWrite:false`
- Black vignette: premultiplied alpha works correctly for `vec4(0,0,0,a)`

### Render pipeline
```
1. autoClear=false → clear()
2. render(skyScene)   // fBm amber sky
3. clearDepth()
4. render(scene)      // game scene
5. render(vigScene)   // vignette overlay
6. autoClear=true
7. CSS filter applied (if changed)
```

### Important code areas (new)
- `index.html` vignette init: `vigScene`, `vigCamera`, `vigMaterial` (~after skyScene)
- `index.html` animate(): health-driven lerp for `vigSat`, `vigCon`, `vigInt` + CSS filter
- `index.html` handleResize(): `vigMaterial.uniforms.resolution`

### Spec artifact
- `css-filter-vignette-spec.md` — design + Codex/CC review findings

## Latest Update: April 4 Session — Massive UI/UX + Visual + Pedagogy Pass

### Shipped this session
- **Application/Relationship question types** — 101 application scenarios + 61 relationship entries, authored confusionSets, 0.7x BKT weight, no DAG split on miss
- **Visual prereq tree → Knowledge Review** — shows all encountered commands with pKnown bars on wave-clear overlay + end screen
- **Transfer priors v2** — 0.6x discount posterior transfer across shared DAG nodes
- **CSS filter + vignette** — health-driven saturation/contrast + edge darkening, zero ghosting
- **Fractal ferns** — Poisson-distributed L-system plants along terrain edges (15 ferns)
- **Fractal stars** — recursive plus/cross patterns (Vicsek fractal) in sky, depth grows with health
- **Fractal lightning** — midpoint displacement bolts on breach (red) and streak 5+ (amber)
- **Fractal particle branches** — kill particles fork mid-burst (3% chance, depth 2 max)
- **High contrast mode** — ☀ toggle inverts all UI + canvas for daytime classroom use, persisted in localStorage
- **Mobile camera overhaul** — smooth orbit drag, pinch zoom, double-tap cube-view, swipeable question panel
- **Desktop mouse wheel zoom** — 0.3x to 4.0x
- **Minimal HUD** — score + hearts + PAUSE text; volume/contrast in pause menu
- **2-miss cap** — main formula enemies breach after 2 wrong answers (anti-button-mash)
- **18 answer giveaways fixed** — scenarios rewritten to not contain answer keywords
- **13 vague MC labels made specific** — answers now explain what the formula does
- **Mobile explainer close button** — both "watch" and "close" when video available
- **Formula auto-scaling** — renderLatex() scales wide formulas to fit container
- **Word-wrap on MC buttons** — no more horizontal overflow
- **5-second feedback lock safety valve** — auto-clears stuck input state
- **QR code → Vercel** — tmux-trainer.vercel.app
- **SW updateViaCache:'none'** — fixes stale service worker caching
- **Vercel deployment** added alongside GitHub Pages

### Attempted and reverted
- **Bloom post-processing (UnrealBloomPass)** — caused severe ghosting on moving objects. Removed entirely. Lesson: spatial blur post-processing doesn't work with moving 3D objects; use color grading + vignette instead.
- **Mandelbrot terrain** — replaced the wireframe grid with a Mandelbrot set shader. Visually interesting but degraded overall aesthetics: path didn't integrate with the fractal boundary, camera angles suffered, trees/ferns lost their grounding context. Reverted to original terrain. Lesson: the Mandelbrot needs proper path integration (cubes walking along the actual boundary, computed on CPU) and a more top-down camera design. Not a quick swap — needs its own dedicated sprint.
- **Constellation star clusters** — Points + LineSegments in the sky. Too far from camera to see, overwhelmed by fog, underwhelming even when repositioned. Removed in favor of fractal stars (Vicsek plus-signs). Lesson: distant sky decorations need to be fog-immune AND camera-angle-aware.

### Lessons learned (visual effects)
- **Bloom/blur = ghosting**: Any post-processing that spatially blurs a scene with fast-moving objects will ghost. Stick to per-pixel color grading (CSS filter, shader color remap) or non-blurring overlays (vignette).
- **CSS `canvas.style.filter` works well**: Cheap, GPU-composited, no render targets. Quantize writes to avoid mobile jank. Per-frame is fine if cached.
- **Vignette overlay is trivial**: One transparent fullscreen quad after the game scene. Negligible cost, big atmospheric impact.
- **Mandelbrot as terrain needs path-first design**: Don't overlay a static path on top of a dynamic fractal. The path must be computed FROM the fractal boundary (binary search along rays), regenerated per wave, and the camera must be designed for the resulting geometry.
- **Top-down vs chase camera**: The game plays best with a slightly elevated chase camera (y=5-7, following the selected cube). Pure top-down loses immersion. Cube-eye-level is cinematic but impractical for gameplay on mobile where the input panel covers half the screen.
- **Touch gesture priority**: Camera control (orbit, zoom, pan) must take priority over enemy selection on mobile. Auto-select handles targeting; the player's fingers should control the view, not compete with it.

### Important code areas (new/updated this session)
- `index.html` APPLICATION_BANK: 101 scenarios with confusionSets
- `index.html` RELATIONSHIP_BANK: 61 entries with direction/explain
- `index.html` generateQuestion(): renormalized 5-type weight system
- `index.html` setInputPanelContent(): application + relationship rendering
- `index.html` bktUpdate(): `bktWeight` scaling of posterior move
- `index.html` handleMiss(): `skipDAG` for application/relationship types
- `index.html` buildKnowledgeMapHtml(): reusable progress visualization
- `index.html` wave-clear overlay: full-screen knowledge review
- `index.html` vignette: `vigScene`, `vigCamera`, `vigMaterial`
- `index.html` animate(): CSS filter + vignette health lerp
- `index.html` fractal ferns: Poisson FERN_POOL, generateFern()
- `index.html` fractal stars: STAR_POOL, generateFractalStar()
- `index.html` fractal lightning: lightningPool, spawnLightning(), generateBolt()
- `index.html` camera: camMode, camOrbitAngle, camZoomMult, smooth drag orbit
- `index.html` touch: continuous orbit in touchmove, pinch zoom, swipeable panel
- `index.html` high contrast: body.hi-contrast CSS + inline filter prepend
- `index.html` renderLatex(): auto-scale with transform:scale()

## Latest Update: Pinned Label + Reticle + Death Animation + Camera + Particles (April 4 cont.)

### Pinned Selected Label + 3D Corner-Bracket Reticle

Replaced the entire floating DOM label projection system:
- **Pinned label**: single `#selected-label` div inside `#input-panel`, no projection math, zoom-independent. Shows mastery dot, formula name, speed tag, depth color.
- **3D reticle**: white `LineSegments` corner-bracket (4 L-shaped corners) around the selected cube. Pulsing scale+opacity, yaw-only billboard.
- **Canvas selection**: `selectEnemy(id)` extracted as reusable function. Desktop click + mobile tap via `pickEnemyAtScreenPoint()`.
- **Removed**: `updateLabels()`, `clearLabelCache()`, `labelCache`, `#labels` div, all `.enemy-label`/`.sel-arrow` CSS, label onclick handlers.

### Fractal Stars — Sky Repositioning

- Stars repositioned: y=3.5-5.2 (was 7-10.5), z=-12.5 to -17. 13 stars (was 7) spread across x=-22 to x=+20 in far-left/left/center/right/far-right sky regions.
- Desktop camera: dist 6.5→8 (pulled back), height 5→4, lookBiasY 0.3→1.5 for less top-down angle.

### Death Animation — Shrink + Particle Release

Two-phase death sequence replacing instant mesh removal:
- **Shrink** (500ms): cube keeps original color, gets brighter (emissive ramps 0.2→1.0), spins faster, exponential collapse `pow(1-t,5)` — most shrink in first ~150ms.
- At <1% original volume: mesh removed, rainbow score particles spawn from that point.
- No red husk, no wireframe sphere — just shrink and release.
- `dyingEnemies` queue with accumulated frame-delta timing (pause-safe).
- `checkWaveComplete()` gated on `dyingEnemies.length===0`.
- All exit paths call `clearDyingEnemies()` with deferred explosion safety net.

### Camera — Smooth Lazy Tracking

- Camera position lerp: 0.10 → 0.04 (much lazier drift to next target).
- Camera lookAt: now also lerped via `camLookX/Y/Z` at 0.04 rate (was instant snap). Prevents the zoom-out/zoom-in jolt on kill.
- `handleHit` no longer sets `G.selectedId=null` — `autoSelect` picks next target naturally, so camera never has a "no target" frame.

### Enhanced Fractal Particle Branching

- Burst-phase branching: 3% → 10% chance, particle cap 80 → 120.
- New funnel-phase branching: 4% chance after 40% of journey toward scoreboard. Particles fork mid-flight creating branching trails.
- Branch children are visual-only (`awardId:null`) — no score collection or early award completion.
- Funnel branching disabled on mobile (reduced particle mode).
- Particle scale: min 0.35 (was 0.16), life×1.2. Count: 24-52 per kill (was 12-32).

### Spec Artifacts

- `pinned-label-reticle-spec.md` — label + reticle design + Codex review
- `roygbiv-death-spec.md` — death animation design + Codex review (6 findings addressed)
- `fractal-branching-spec.md` — branching design + Codex review (4 findings addressed)

### Important Code Areas (new/updated)

- `index.html` `selectEnemy()`: reusable selection function (after `pickEnemyAtScreenPoint`)
- `index.html` `updateSelectedLabel()` / `clearPinnedLabel()`: pinned label system
- `index.html` `selectionReticle`: LineSegments corner-bracket, `updateSelectionReticle(time)`
- `index.html` `#selected-label` CSS: inside `#input-panel`, flex child
- `index.html` canvas click handler: desktop click-to-select
- `index.html` touchend: mobile tap-to-select via `pickEnemyAtScreenPoint`
- `index.html` death animation: `dyingEnemies`, `startDeathAnimation()`, `updateDyingEnemies()`, `clearDyingEnemies()`
- `index.html` camera: `camLookX/Y/Z` smoothed lookAt, 0.04 lerp rate
- `index.html` fractal branching: burst 10% + funnel 4%, cap 120, `awardId:null` on branches
- `index.html` STAR_POOL: 13 stars across x=-22 to x=+20, y=3.5-5.2, z=-12.5 to -17

### Lessons Learned (visual polish)

- **Camera lookAt must be lerped**: Instant `lookAt()` with slow position lerp creates jarring rotation snaps on target switch. Both must lerp at the same rate.
- **Don't null selectedId on kill**: Let autoSelect handle the transition — prevents the one-frame "no target" camera jump to default orbit.
- **Death animation timing**: Exponential easing (`pow(1-t,5)`) feels much more satisfying than quadratic for a collapse effect — most action in the first 30%.
- **Particle scale is feel**: Too big loses swarm charm, too small loses dopamine. 0.35 min with 1.2x life multiplier is the sweet spot.
- **Bloom post-processing still doesn't work**: Emissive PhongMaterial + additive blending looked worse than plain MeshBasicMaterial + additive. The additive blending IS the bloom for small bright objects.

## Latest Update: Cartridge Audit Remediation (April 5, 2026)

External GPT-4o audit compared the 76-command AP Stats deck against the 2026 AP Statistics Exam Reference Information. Findings were verified against actual code, false positives discarded, and confirmed issues fixed.

### Formula fix: rv-sd notation

- `rv-sd` latex changed from `\mu` (unsubscripted) to `\mu_X` per the 2026 reference sheet
- Blank answer updated from `mu` to `mu_X`, choices updated to `\mu_X`
- `validateBlank('\\mu_X','mu_X')` confirmed working

### Blank fix: large-counts stray `?`

- Blank #2 had a bare `?` instead of showing `10` in the second condition
- Changed `n(1-p) \geq ?` to `n(1-p) \geq 10` (student fills the first boxed blank only)

### 10 application scenario rewrites

Scenarios that gave away the answer by naming the formula, method, or key symbols were rewritten:

| Command | Problem | Fix |
|---------|---------|-----|
| `linreg-mean` | "least-squares model" names method | Describes "landmark point of the dataset" |
| `y-intercept` | "LSRL" and "intercept a" name formula | Describes "starting value when x is zero" |
| `ci-formula` (2nd) | "computing SE and finding z*" names components | Describes "range of plausible values" |
| `type-i-error` | "Name this mistake" is definition prompt | Real scenario: drug trial approves ineffective treatment |
| `type-ii-error` | "Name this mistake" is definition prompt | Real scenario: factory passes bad inspection |
| `pooled-se` | "single combined estimate" describes pooling | Describes "null hypothesis of equal proportions" |
| `slope-mean` | "b values" names the symbol | Describes "long-run average of slopes" |
| `slope-se` | "residual SD and x-spread" names inputs | Asks "how precisely the sample slope estimates the true slope" |
| `slope-sd` | Gives exact σ, σ_x, n symbols | Asks "how much would fitted slopes spread out" |
| `df-gof` | "chi-square goodness-of-fit test" names the test | Describes "comparing observed counts to expected" |

### wireL1toL2 regex fixes (6 rules)

3 over-broad rules tightened:
- `why.*n\b` → `why\b.*\bby\s+n\b` (was matching "mean", "distribution", etc.)
- `O\s` → `(?<!\w)O(?!\w).*count` (was matching "to ", "do " with `/i` flag)
- `E\s.*count` → `(?<!\w)E(?!\w).*count` (same issue)

3 miswired rules remapped to correct concept nodes:
- Quartile/IQR: `mean-concept` → `order-statistics-concept` (new node)
- Correlation/r: `slope-concept` �� `correlation-concept` (new node)
- Y-intercept: `slope-concept` → `intercept-concept` (new node)

### 3 new SHARED_PREREQ_NODES

Added L2 nodes to support the remapped rules:
- `order-statistics-concept`: "Sort values before finding quartiles" → prereqs: `compare-numbers`
- `correlation-concept`: "r measures strength/direction of linear relationship" → prereqs: `slope-concept`, `fraction-concept`
- `intercept-concept`: "Predicted y when x=0" → prereqs: `slope-concept`, `mean-concept`

No dangling prereq refs. `validateDAG()` runs at boot (index.html).

### Audit findings NOT confirmed

- "6 blanks where answer doesn't match choices" — all answers match via norm() + alias system
- "N/n normalization collision" — fill-blank is multiple choice, so no wrong answer can be accepted
- Tier label conflict flagged as design decision (tier = difficulty, not reference-sheet presence)

### Spec artifact

- `cartridge-audit-remediation-spec.md` — full spec with line-by-line changes, verification checklist

### Important code areas (updated)

- `ap-stats-cartridge.js` line 78: rv-sd latex with `\mu_X`
- `ap-stats-cartridge.js` line 522: large-counts blank with `10` (not stray `?`)
- `ap-stats-cartridge.js` lines 897-967: APPLICATION_BANK (10 rewritten scenarios)
- `ap-stats-cartridge.js` lines 1487-1501: 3 new SHARED_PREREQ_NODES
- `ap-stats-cartridge.js` lines 1618, 1636-1637, 1646-1647, 1653: wireL1toL2 rule fixes

## Latest Update: Grok Pedagogy Fixes — Distractor Quality + Geometric SD Notation

External review by Grok was cross-referenced against actual codebase state (76 commands, not 24). Most suggestions were already shipped. Three actionable items remained; Codex reviewed the spec (4 findings, all incorporated).

### Distractor quality improvements (5 edits)

- `geom-pmf`: Stem anchored to AP convention ("In AP Stats, what does the geometric random variable X count?"). Wrong answer changed to "Number of failures before first success" — the classic off-by-one trap.
- `chi-sq`: "Why square" wrong answer changed from "To convert to proportions" to "Taking |O-E| would work just as well" (squaring-specific misconception). Added second blank targeting denominator E vs O.
- `std-dev`: "Why n-1" wrong answer changed from "Because one value is always zero" to "Because one data point is dropped from the sample" (common df misinterpretation).
- `phat-sd`: Added numerator blank testing p vs p̂ vs p₀ (SD formula uses population p, not sample p̂).

### Geometric SD notation polish

- `geom-sd` explain text now bridges variance→SD: "Variance form: σ² = (1-p)/p²; take √ to get SD"
- Added variance blank: σ² = (1-p)/□ with answer p² and distractors p, (1-p)²

### Codex review findings (all addressed)

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | MEDIUM | Chi-sq "Why square" distractor tested denominator, not squaring | Used squaring-specific misconception instead |
| 2 | MEDIUM | std-dev distractor "divide by n for populations" was true-but-not-best | Used actually-false "data point dropped" distractor |
| 3 | MEDIUM | phat-sd/phat-se p vs p̂ guidance too broad | Split by card: SD→p, SE→p̂, test→p₀ |
| 4 | LOW | geom-pmf "failures before success" is alternate convention | Anchored stem to "In AP Stats" convention |

### Spec artifact

- `grok-pedagogy-fixes-spec.md` — full design + Codex review findings

## Latest Update: Camera Overhaul — Zoomed-Out Default + Death Blip Fix

### Zoomed-out default camera

- Default `camZoomMult` changed from `1.0` to `2.0` — game starts at an overview angle (dist ~16, height ~8)
- Users can zoom in voluntarily via scroll wheel (desktop) or pinch (mobile) down to 0.3x
- Removed split-depth camera zoom — all enemies use the same base distance regardless of prereq depth (was: deeper prereqs got closer camera)
- Follow-mode position lerp halved from `0.04` to `0.02` — camera drifts lazily instead of chasing targets
- LookAt lerp also halved to `0.02` to match position drift rate
- Cube mode (double-tap toggle) preserved for users who want close-up orbit

### Camera death blip fix

- Bug: when a cube died, `startDeathAnimation()` immediately deleted the mesh from `enemyMeshes`, but `autoSelect()` hadn't picked the next target yet. For 1-2 frames the camera fell through to the default orbit branch (`camera.lookAt(0,0,-1)` toward the tower), causing a visible snap/blip.
- Fix: added a new camera branch — when `G.screen==='game'` and enemies exist but the selected mesh is missing (dying), the camera holds its current `camLookX/Y/Z` lookAt instead of snapping to the default orbit.

### Spec artifact

- `camera-zoom-out-spec.md` — design for zoomed-out default + cube mode preservation

### Important code areas (updated)

- `index.html` camera state: `camZoomMult=2.0` (was 1.0), `camOrbitAngle`, `camLookX/Y/Z`
- `index.html` animate() camera: follow-mode lerp 0.02, no split-depth branching, death-hold branch
- `index.html` cube mode: unchanged (orbit at cube height, lerp 0.12, double-tap toggle)

## Latest Update: Pedagogy Audit Fixes + Native High-Contrast + Music Editor Tabs + Camera Polish

### VARIABLE_BANK pedagogy fixes (external ChatGPT audit)

- `binom-pmf`: symbol `k` → `x` (formula displays `P(X=x)`, not `k`)
- `geom-pmf`: symbol `k` → `x` (formula displays `P(X=x)`, not `k`)
- `lintransform`: swapped `a`/`b` descriptions — `a` is the shift, `b` is the multiplier in `Y=a+bX` (was backwards, would teach wrong roles)

### Native high-contrast theme (performance fix)

- Removed `#game-canvas` from the CSS `filter: invert(1) hue-rotate(180deg)` selector — eliminates per-frame GPU filter on the WebGL canvas (battery drain on mobile)
- HTML elements (`#overlay`, `#input-panel`, `#hud`) still use the cheap CSS filter for correct light-mode appearance
- Added `AMB_DARK` / `AMB_LIGHT` palettes with sky shader color vectors
- `applyThemeToScene()` natively swaps: fog color, renderer clear color, ambient/directional/point light colors, terrain material, wireframe material, server material + emissive, sky shader `darkCol`/`midCol`/`brightCol` uniforms
- `toggleHighContrast()` replaces the old inline onclick — toggles DOM class + calls `applyThemeToScene()` + persists to localStorage
- Sky shader parameterized: 3 new `vec3` uniforms (`darkCol`, `midCol`, `brightCol`) replace hardcoded GLSL colors
- Vignette stays black in both modes (Codex review: colored vignette would break alpha compositing)
- Boot init: `hiContrastActive` read from localStorage at script top; `applyThemeToScene()` called after scene construction via `typeof` guards
- Removed `hiC` filter prepend from `animate()` — canvas CSS filter is now purely health-driven (`saturate` + `contrast`)

### Music editor tabs (SEQ / MIX / SYS)

- `MUSIC_EDITOR.activeTab` state field (default: `'seq'`, reset on editor open)
- Three tabs using existing `.menu-tab` CSS: `[ SEQ ]` / `[ MIX ]` / `[ SYS ]`
- SEQ tab: full step sequencer (drums + melody grid)
- MIX tab: 5 volume sliders + tempo
- SYS tab: chord picker
- Preview / Save / Reset as persistent footer across all tabs (Codex finding: avoids tab-hopping to audition changes)
- `selectMusicTab(tab)` helper function
- Tab buttons rendered after wave selector with `max-width:none` override

### Camera: death-hold expanded to cover empty enemies list

- Bug: killing the last/only enemy caused camera to swoop to default top-down orbit before new enemies spawned (dramatic, disorienting, faked end-of-wave)
- Root cause: death-hold branch only checked `G.enemies.length>0`, but when the last enemy was removed from `G.enemies` while still in `dyingEnemies`, camera fell through to default orbit
- Fix: expanded condition to `G.enemies.length>0 || dyingEnemies.length>0` — camera holds lookAt during death animations even when enemies array is empty

### Codex review findings (all addressed)

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | HIGH | Scene assets incomplete — trees/ferns/stars/particles not covered | Covered fog, lights, terrain, wireframe, server, sky shader. Trees/ferns/stars use vertex colors visible against both backgrounds. |
| 2 | HIGH | Vignette gray compositing broken | Kept vignette black in both modes |
| 3 | MEDIUM | JS inline colors via AMB.css not swapped | `applyThemeToScene()` updates `AMB.css` via `Object.assign` |
| 4 | MEDIUM | Theme init timing — null crash if scene not built | `typeof` guards on all scene objects |
| 5 | MEDIUM | Actions unreachable from SEQ/MIX tabs | Persistent footer across all tabs |
| 6 | LOW | Framebuffer readback claim overstated | Noted (spec wording) |

### Spec artifact

- `hi-contrast-music-tabs-spec.md` — full design + Codex review findings

### Important code areas (new/updated)

- `index.html` `AMB_DARK` / `AMB_LIGHT`: dual palette constants (after AMB definition)
- `index.html` `applyThemeToScene()`: swaps fog, lights, materials, sky shader uniforms
- `index.html` `toggleHighContrast()`: DOM class + scene swap + localStorage persist
- `index.html` sky shader: `darkCol`, `midCol`, `brightCol` vec3 uniforms
- `index.html` `MUSIC_EDITOR.activeTab`: tab state field
- `index.html` `selectMusicTab()`: tab switch helper
- `index.html` `renderMusicEditor()`: tab-conditional HTML with persistent action footer
- `index.html` animate() camera: death-hold branch expanded with `dyingEnemies.length>0`

### Lessons learned

- **CSS filter on WebGL canvas = per-frame GPU cost**: `filter: invert(1)` on a `<canvas>` re-applies every frame the canvas renders. On HTML elements it's cheap (only re-composites on DOM change). Split the selector.
- **CSS filter on HTML elements is fine**: Overlay/panel/HUD change infrequently — the filter cost is negligible compared to the canvas.
- **Tab UIs need persistent actions**: Hiding Save/Preview behind a tab forces users to context-switch just to audition or persist changes. Keep core actions visible.

## Latest Update: Falling Stars + Per-Pixel Mandelbrot Terrain Scar + Star Birth

### Concept

Failures scar the battlefield permanently. Stars fall from the sky on every 3rd miss, and where they land, a Mandelbrot fractal blooms on the terrain grid. The fractal starts small (central bulb only), expands with each impact, and its boundary edges shift from red through the rainbow to violet as the player scores points. Correct answers permanently sharpen the fractal detail. The scar persists across waves — a visual diary of the entire run.

### Per-Pixel Mandelbrot on Terrain

- `terrMat` is a custom `ShaderMaterial` (not MeshPhongMaterial) that computes Mandelbrot iterations per screen pixel — infinite resolution at any camera angle/zoom
- Black interior (inside the set), colored boundary glow (outside), bright white edge band at the set boundary
- ROYGBIV color shift: `hsv2rgb()` in the fragment shader maps `detail = (mbrotIter-8)/40` to hue 0→0.78 (red→violet). No new uniforms needed — color derived from `mbrotIter`
- White edge band: `edgeBand` near t=0.93 with sharpness scaling by detail level — becomes more defined as iterations increase
- Shader uses `done` flag (no `break`), proper `smoothstep` ordering, no `pow(negative)` — ANGLE/DirectX compatible
- Custom lighting: diffuse terrain shading + fog computed in same shader
- Mandelbrot only evaluated when `mbrotIntensity > 0.01` (early-out, zero cost when inactive)

### Zoom-Based Expansion (not radial mask)

- Initial `mbrotZoom = 3.5` — zoomed out, only central Mandelbrot bulb visible (~40% of terrain)
- Each star impact: `targetZoom` decreases toward 1.5 over ~7 impacts (fills entire terrain)
- Formula: `expandT = min(1, max(0, impacts-1)/6)`, `targetZoom = 3.5 - 2.0 * expandT`
- Zoom lerps smoothly at 0.04 rate per frame
- **Why not radial mask**: Adding a `mbrotRadius` uniform + `smoothstep` mask to the fragment shader caused silent shader failure on Windows/ANGLE in multiple attempts. The zoom approach reuses the existing `mbrotZoom` uniform without any shader changes.

### Persistence

- Mandelbrot persists across waves — `nextWave()` does NOT call `clearMandelbrot()`
- Only clears on new game (`startGame()`)
- Run state checkpoints save/restore full MBROT state: intensity, targetIntensity, iterations, impacts, zoom, targetZoom
- `continueGame()` restores MBROT state and directly sets terrMat uniforms

### Falling Stars

- `fallingStars` array, max 2 in flight, max 4 pooled `LineSegments` meshes
- `spawnFallingStar(targetPos)` — 16-segment trail from random sky point to Mandelbrot center
- Progressive reveal: segments appear as star descends (draw range animated)
- 800ms duration, additive blending, warm gold color
- On landing: `growMandelbrot()` — expands zoom + boosts intensity

### Born Stars

- `bornStars` array, max 5 additional fractal stars in sky
- Spawned at streak milestones: 5, 10, 15, 20, 25
- Random sky position, 2-second fade-in, same twinkle as existing fractal stars
- Cleared per wave (born stars are wave rewards, unlike the permanent Mandelbrot)

### Miss/Hit Hooks

- `handleMiss()`: increment `G.missStarCounter`, trigger star fall on every 3rd miss (any depth)
- `handleHit()`: `mbrotScoreBoost()` adds +0.5 iterations permanently, `spawnBornStar()` at streak milestones
- Wave start: `clearBornStars()`, reset falling stars and `missStarCounter`. Mandelbrot persists.
- Game start: `clearMandelbrot()` resets everything

### Lessons Learned (Mandelbrot rendering on ANGLE)

- **Custom ShaderMaterial replacing terrMat works** — the per-pixel fragment shader compiles and renders correctly
- **Adding new uniforms to a working shader can silently break it on ANGLE** — the `mbrotRadius` uniform + smoothstep mask killed rendering in multiple attempts
- **Reusing existing uniforms is safe** — zoom-based expansion through existing `mbrotZoom` works perfectly
- **onBeforeCompile chunk injection failed silently** — the `#include <emissivemap_fragment>` replacement may not resolve correctly in r128 on ANGLE
- **WebGLRenderTarget → emissiveMap also failed** — the ShaderMaterial compiled in the separate scene but the render target texture didn't transfer to the emissiveMap correctly (unclear why; may be a Three.js r128 + ANGLE interaction)
- **CPU canvas → CanvasTexture → emissiveMap DID work** — but looks like a bitmap stamp, not per-pixel quality. Adequate fallback if shader route ever breaks again.

### Spec artifacts

- `falling-stars-mandelbrot-spec.md` — original design + Codex review findings
- `mandelbrot-growth-spec.md` — expansion/persistence/ROYGBIV design for Codex
- `codex_prompt.md` — ANGLE debugging prompt

### Important code areas (new/updated)

- `index.html` `MBROT` state: intensity, targetIntensity, iterations, impacts, zoom, targetZoom
- `index.html` `terrMat` ShaderMaterial: per-pixel Mandelbrot in fragment shader with `hsv2rgb`, edge band, fog
- `index.html` `growMandelbrot()`: zoom-based expansion, no new uniforms
- `index.html` `mbrotScoreBoost()`: +0.5 iterations per correct answer
- `index.html` `clearMandelbrot()`: full reset with direct uniform writes
- `index.html` `spawnFallingStar()`: sky-to-terrain trail animation
- `index.html` `spawnBornStar()`: streak-milestone star birth
- `index.html` `buildRunStateSnapshot()`: saves MBROT state in checkpoint
- `index.html` `continueGame()`: restores MBROT state from checkpoint
- `index.html` animate(): MBROT intensity/zoom lerp, terrMat uniform updates

## Latest Update: Cartridge Module Extraction + Pedagogy Bug Fixes + Audio Polish

### Cartridge Extraction (April 5, 2026)

Separated ~1680 lines of AP Stats pedagogy data from the game engine into a standalone module.

**New file: `ap-stats-cartridge.js`** (~1700 lines)
- 76 commands with formulas, blanks, subconcepts
- VARIABLE_BANK (76 entries), APPLICATION_BANK (72), RELATIONSHIP_BANK (34)
- EXPLANATION_GLOSSARY (39 notation entries)
- AUTO_BLANK_SPECS (notation match rules for auto-generated blanks)
- DOM_LABELS (domain→curriculum unit mapping)
- SHARED_PREREQ_NODES (73 hand-authored L2-L5 DAG nodes)
- `wireL1toL2(dag)` — 52 regex rules for automatic DAG wiring
- `generateQuestion(cmd, allCommands, difficulty)` — 5-type question generator
- `validateBlank(input, answer)` — notation-aware answer validation
- `buildExplanationBank(commands)` — explanation lookup builder

**Engine changes in `index.html`**
- Loads cartridge via `window.AP_STATS_CARTRIDGE` with missing-cartridge error path
- Removed all moved constants and functions (~1680 lines)
- Initialization: `buildDAGFromSubconcepts()` → `Object.assign(PREREQ_DAG, cartridge.sharedPrereqNodes)` → `cartridge.wireL1toL2(PREREQ_DAG)` → `validateDAG()`
- Engine references banks via cartridge object, not globals

**Service worker**: cache bumped to `td-shell-v4`, `ap-stats-cartridge.js` precached

### Pedagogy Bug Fixes

- **add-rule blank**: answer `P(A∩B)` (Unicode ∩) didn't match choice `P(A\cap B)` (LaTeX). Fixed to use LaTeX form.
- **VARIABLE_BANK**: 3 fixes from external ChatGPT audit (binom-pmf k→x, geom-pmf k→x, lintransform a/b swap)

### Audio Polish

- **Miss SFX**: removed noise burst, halved FM modIndex (4→1.2), shorter duration. Gentle "wrong" tone instead of sandpaper.
- **Split SFX**: removed noise burst, softened FM tone (modIndex 3→1.5). No more static on hydra split.

### External Audit Prompts

Created `cartridge-audit-prompts.md` with 4 ready-to-paste prompts for ChatGPT/Gemini review of the cartridge:
1. Formula correctness vs 2026 AP Stats reference sheet
2. Blank answer validation (Unicode/LaTeX mismatches, giveaways, dead choices)
3. Application scenario review (keyword giveaways, ambiguity, confusion set quality)
4. DAG wiring verification (unwired subconcepts, incorrect regex, dead ends)

### Spec artifacts

- `cartridge-extraction-spec.md` — full extraction plan with API contract
- `cartridge-audit-prompts.md` — 4 external review prompts

### Important code areas (new/updated)

- `ap-stats-cartridge.js` — entire file is the cartridge module
- `index.html` cartridge loading: `window.AP_STATS_CARTRIDGE` check + init (~line 5526)
- `index.html` EXPLANATION_BANK init: built from cartridge at boot (~line 1183)
- `index.html` DOM_LABELS: references `activeCartridge.domLabels` (~line 1748)
- `sw.js`: shell cache v4, `./ap-stats-cartridge.js` in precache list

## Latest Update: Full Cartridge Audit Fixes (April 5, 2026)

Ran a comprehensive four-prompt external audit of `ap-stats-cartridge.js` (formula correctness, blank validation, application scenarios, DAG wiring). All P0-P3 findings fixed.

### P0 — Game-Breaking: 6 blank answer/choice mismatches fixed

Answer fields didn't match `choices[0]` after `validateBlank()` normalization — correct answers wouldn't validate at runtime.

| Command | Old answer | New answer | Root cause |
|---------|-----------|-----------|------------|
| `binom-pmf` | `1-p` | `(1-p)` | Parens in choice not in answer |
| `binom-sd` | `1-p` | `(1-p)` | Same |
| `residual` | `yhat` | `\hat{y}` | Plain text vs LaTeX |
| `expected-twoway` | `grand total` | `\text{grand total}` | Plain text vs `\text{}` |
| `margin-error` | `z* or t*` | `z^* \text{ or } t^*` | Plain text vs LaTeX |
| `width-ci` | `sqrt(n)` | `\sqrt{n}` | Plain text vs LaTeX |

### P0 — Game-Breaking: 2 duplicate choices fixed

| Command | Old choices | Fix | Reason |
|---------|-----------|-----|--------|
| `mean` | `n, n-1, N` | `N` → `\mu` | `n` and `N` normalize identically |
| `ten-pct-condition` blank 2 | `N, n, \mu` | `n` → `n-1` | Same normalization issue |

### P1 — Content Accuracy: slope-t β₀ confusion resolved

- **Problem**: `slope-t` formula used `β₀` for the hypothesized slope, but β₀ is the intercept in `Y = β₀ + β₁X + ε`. The `EXPLANATION_GLOSSARY` entry for `beta0` also said "intercept."
- **Fix**: Simplified formula to `t = b/s_b` (standard AP form, H₀: slope = 0). Blank now tests `s_b` in denominator. Removed ambiguous β₀ parameter from formula, variable bank, and blanks.
- Glossary entry updated to unambiguously describe β₀ as the population intercept, with reference to the full model.

### P1 — Content Accuracy: SE_b / s_b notation standardized

- `slope-ci` used `SE_b` while `slope-t` and `slope-se` used `s_b`
- Changed `slope-ci` latex, blanks, hint, and variable bank from `SE_b` to `s_b`

### P2 — Pedagogical Quality: 5 answer-giveaway scenarios rewritten

| Command | Before | After |
|---------|--------|-------|
| `slope-b` | Named "slope" and listed formula inputs | Researcher with r, SD values, wants predicted score change per hour |
| `z-test-stat` | Described formula structure | Statistic 2.4 SEs above claim, express as standardized number |
| `variance` | Named "s-squared" directly | Must express spread as squared quantity before combining variables |
| `pooled-se` | Said "pooling" (the answer keyword) | Clinical trial under null equality, quantify variability with combined estimate |
| `slope-se` | Named "SE of the slope" directly | Biologist needs to quantify slope precision from computer output |

### P2 — Pedagogical Quality: 5 unwired subconcepts wired into DAG

Added 4 new regex rules to `wireL1toL2()`:
- `/if.*r.*=|what is b\b/i` → `slope-concept` (covers slope-b SC2)
- `/n.*different|unequal.*size|n_?[12].*differ/i` → `sample-vs-population` (covers diff-x-se SC2)
- `/1\.5|multiplier|convention|cutoff.*outlier/i` → `mean-concept` (covers outlier-iqr SC0)
- `/log.*transform|curved|exponential.*pattern|linearize/i` → `residual-concept` (covers log-transform SC0)
- slope-t SC0 (rewritten) matches existing `/H.?0|null hyp|hypothes.*test/i` rule via H₀ in correct answer

### P2 — Pedagogical Quality: 4 missing application bank entries added

| Command | Scenario |
|---------|----------|
| `slope-sd` | Population of samples, slope estimate variability |
| `df-gof` | Spinner with 5 sections, GOF test df |
| `df-twoway` | 4×3 table, two-way df |
| `df-t` | Paired study with 25 subjects, t-test df |

APPLICATION_BANK now has 76 entries (was 72), matching all 76 commands.

### P3 — Polish: 3 ambiguous scenarios clarified

- `random-condition` #1: replaced systematic sampling (every 5th person) with explicit SRS (random number generator)
- `normal-condition` #2: changed n=200/p̂=0.04 (fails: np̂=8<10) to n=150/p̂=0.12 (passes: both counts ≥10)
- `chi-sq` #2: replaced vague "gender and political party" (could be 2-prop z) with explicit 3×3 table (education level × political preference)

### P3 — Polish: p-value-interp confusion set improved

- Scenario 1: swapped `type-ii-error` and `power` for `ci-formula` and `z-test-stat` (more relevant to p-value misconceptions)

### Validation

- 230/230 blanks pass `validateBlank()` (answer matches choices[0])
- 0 duplicate choices after normalization
- 76/76 application bank entries
- JS parses clean (`node --check`)

### Audit findings NOT actioned (by design)

- Formula reference sheet: all 28 AP formulas match, 0 omissions
- `linreg-mean` scenario ("what known coordinate pair"): flagged as debatable but audit said "acceptable — tests concept knowledge"
- `normal-condition` #2 scenario: audit noted this may cause confusion with `large-counts` distractor — this is intentional pedagogical overlap (students must distinguish the two conditions)
- Relationship bank gaps for core commands (`mean`, `linreg`, `rv-mean`, `phat-mean`, `xbar-mean`): noted but these are static formulas where "what happens when X changes?" questions are unnatural
- Missing L2+ DAG nodes (random variable concept, sampling with/without replacement, LINE conditions): noted for future enrichment

## Latest Update: Melody Pause Fix + Beat Playhead (April 5, 2026)

Fixed two melody/compose UX bugs: melody bleeding through pause, and no feedback on when a composed melody starts playing.

### Melody bleed-through fix

- `clearBgmAutomation()` now cancels all scheduled events on voice 14 (melody)
- Previously only voices 0-6 (pads, bass, kick, snare, hihat) were silenced
- Melody notes pre-scheduled on the Web Audio timeline would keep playing through pause/stop/title transitions
- Now: pausing, stopping BGM, or exiting to title immediately silences the melody

### Beat playhead — bar progress exposed from SFX

- New state variables `barStartTime` and `barLength` tracked in `seq()`, updated each bar
- New public API: `SFX.getBarStep()` returns current 16th-note step (0-7) or -1 if not playing
- Uses `ctx.currentTime` relative to bar start for frame-accurate step index

### Beat playhead — melody bar UI

- New `#melody-bar` div between `#selected-label` and `#ip-header` in the input panel
- 8 tiny amber cells show the melody pattern during gameplay (not during compose mode)
- Current step lights up with `.active` class (amber glow + box-shadow)
- Filled slots (notes/holds) get `.filled` class (darker amber background)
- Only touches DOM when step actually changes (at most 8 writes per bar)
- Rebuilds automatically after KEEP saves a new melody (`melodyBarBuilt` flag reset in `exitComposeMode`)
- Hidden when: composing, no melody saved, or not on game screen

### Important code areas (new/updated)

- `index.html` `clearBgmAutomation()`: voice 14 cancel + zero gain (~line 755)
- `index.html` SFX module: `barStartTime`, `barLength` state vars (~line 392)
- `index.html` `seq()`: records `barStartTime=startT; barLength=ll` each bar (~line 995)
- `index.html` SFX public API: `getBarStep()` (~line 1117)
- `index.html` `#melody-bar` CSS: `.mb`, `.mb.active`, `.mb.filled` (~line 78)
- `index.html` `buildMelodyBar()`, `updateMelodyBar()`: DOM build + per-frame step update (~line 3488)
- `index.html` `animate()`: calls `updateMelodyBar()` after pinned label update (~line 5308)
- `index.html` `exitComposeMode()`: resets `melodyBarBuilt` flag (~line 2435)

## Latest Update: startBGM Health-Gate Fix (April 5, 2026)

Fixed audio flash at wave start where the full arrangement briefly played before health gating kicked in.

### Root cause

`startBGM()` ramped pad and bass bus gains to full volume unconditionally (lines 971-974), then `seq()` would correct them to health-gated levels on the first bar — but with a `.3` time constant, creating an audible split-second of the full song before layers faded out.

### Fix

`startBGM()` now reads `musicalHealth` and applies the same gates as `seq()`:
- `padBus`: only ramps to volume if `health >= 5` (was: always)
- `bassBus`: only ramps to volume if `health >= 4` (was: always)
- `voices[3]` (bass voice): only ramps to `.6` if `health >= 4` (was: always `.6`)

Drums were already fine — they're scheduled per-step in `seq()` with health checks, not via a bus ramp.

### Important code area

- `index.html` `startBGM()`: health-gated initial bus volumes (~line 968)

## Latest Update: Unit 8 Chi-Square Procedural Cards + td-audio.js Extraction (April 5, 2026)

Two tasks shipped in a single commit (a760c62):

### Task A: 5 New Chi-Square Procedural Cards (81 total commands)

Added decision-making cards for Unit 8 that test the procedural skills scored on FRQs, complementing the existing 6 formula-recall chi-square cards.

| ID | What it tests |
|----|---------------|
| `chi-sq-select` | Choosing GOF vs homogeneity vs independence by study design |
| `chi-sq-hyp` | Writing H₀/Hₐ for each chi-square test type |
| `chi-sq-conditions` | Random, 10% condition, expected counts ≥ 5 (not observed) |
| `chi-sq-conclude` | Reject/fail to reject in context, never "accept H₀" |
| `chi-sq-output` | Reading computer output: df↔categories, p-value→decision |

Each card has:
- 2 fill-blank questions with 3-option MC
- 3 subconcepts for DAG decomposition
- VARIABLE_BANK entry (3 vars each)
- APPLICATION_BANK entry (2 scenarios each with authored confusionSets)
- RELATIONSHIP_BANK where applicable (chi-sq-conditions, chi-sq-output)

### DAG integration

- New `chi-square-design` shared L2 node: "How do the three chi-square tests differ by design?" → prereqs: `sample-vs-population`, `independence-concept`, `observed-vs-expected`
- New wireL1toL2 regex: `/goodness.?of.?fit|\bGOF\b|homogeneity|one categorical variable|claimed distribution|multiple populations|two variables.*one population|one-dimensional/i` → `['chi-square-design','sample-vs-population','independence-concept']`
- 0 unwired subconcepts after wiring

### Validation

- 81 commands (was 76)
- 13/13 new blanks pass `validateBlank()` normalization
- 0 duplicate choices after normalization
- All 5 new commands have VARIABLE_BANK (3 each), APPLICATION_BANK (2 each), RELATIONSHIP_BANK (2 of 5)
- `node --check ap-stats-cartridge.js` passes

### Task B: td-audio.js Extraction

Extracted the SFX sound engine IIFE (~810 lines) from `index.html` into a standalone module.

**New file: `td-audio.js`** (~810 lines)
- Entire SFX IIFE body moved verbatim
- Published as `window.TD_AUDIO` (same pattern as cartridge)
- Contains: FM synthesis (14 voices), drum bus, `seq()` bar loop, musical health layer gating, streak groove, melody composer, music config load/save/preview, all SFX cues

**Engine changes in `index.html`**
- `const SFX = window.TD_AUDIO;` alias at the top of the engine script
- Load guard: missing-module error page if `td-audio.js` fails to load
- SFX IIFE deleted (~808 lines removed)
- All existing `SFX.*` call sites unchanged

**Loading pattern**
- Blocking `<script src>` (not `defer`) — inline script reads `window.TD_AUDIO` at parse time, so external modules must finish loading first
- Load order: CDN libs → `ap-stats-cartridge.js` → `td-audio.js` → inline `<script>`

**Service worker**
- `td-audio.js` added to `PRECACHE_URLS`
- Cache bumped from `td-shell-v4` to `td-shell-v5`

### File sizes after extraction

| File | Lines |
|------|-------|
| `index.html` | 4802 (was ~5610) |
| `td-audio.js` | 810 (new) |
| `ap-stats-cartridge.js` | 1791 (was ~1700) |
| `sw.js` | 137 |

### Important code areas (new/updated)

- `ap-stats-cartridge.js` lines 443-507: 5 new chi-square procedural commands
- `ap-stats-cartridge.js` lines 913-917: VARIABLE_BANK entries for new commands
- `ap-stats-cartridge.js` lines 1029-1033: APPLICATION_BANK entries for new commands
- `ap-stats-cartridge.js` lines 1071-1072: RELATIONSHIP_BANK entries (conditions + output)
- `ap-stats-cartridge.js` line 1529: `chi-square-design` shared DAG node
- `ap-stats-cartridge.js` line 1718: wireL1toL2 regex for chi-square design concepts
- `td-audio.js` line 727: `window.TD_AUDIO` public API
- `index.html` line 328: `<script src="./td-audio.js">` (blocking, not defer)
- `index.html` line 389: `const SFX = window.TD_AUDIO;` alias
- `index.html` lines 390-393: missing-module load guard
- `sw.js` line 4: `CACHE_SHELL = 'td-shell-v5'`
- `sw.js` line 12: `'./td-audio.js'` in precache list

### Modularization plan (on file for post-exam)

A full Codex-generated modularization plan exists in `codex-modularize-prompt.md`. The plan proposes 14 modules (realistically ~8 merged) with extraction order, coupling analysis, and loading strategy. Decision: modularize at leisure after the May 7 exam — the audio extraction was the low-risk confidence-building first step. Next candidate would be `td-progress.js` (SRS/BKT/persistence).

### Spec artifacts

- `unit8-audio-extract-spec.md` — combined spec for both tasks
- `codex-modularize-prompt.md` — full modularization research prompt

## Likely Next Tasks

- **Mandelbrot terrain (v2)** — dedicated sprint: compute boundary path on CPU, map cubes to walk the edge, top-down camera design, trees/ferns on boundary, stars in the void
- **Accessibility pass** — ARIA labels, semantic HTML, WCAG 2.1 AA contrast (4.5:1), keyboard focus indicators
- Quality review rendered animations — verify pedagogical accuracy per formula
- Add adaptive BKT params (v2) once enough telemetry collected
- Particle pooling for main particles (trail ghosts already pooled)
- Event listener cleanup on screen transitions (memory leak prevention)
- Mobile input panel UX refinement — the swipe up/down + canvas shift needs more polish
- Further modularization (post-exam): `td-progress.js`, `td-render.js`, `td-ui.js`

## GitNexus Note

- GitNexus index was refreshed with `npx gitnexus analyze`.
- The current GitNexus CLI in this environment indexed the repo, but it did not resolve the inline JS functions in `index.html` as named symbols for `impact/context`.
- Manual call-site analysis was used for the HTML inline-script functions during this pass.
- Post-extraction: `td-audio.js` is now a separate file that GitNexus can index as named symbols. Future `gitnexus analyze` runs should resolve SFX API methods.
