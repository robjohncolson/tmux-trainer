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
  - overlay styles
  - mobile breakpoints
  - music editor styles
  - explainer tray styles
  - score-pop HUD styles
  - label ghosting / bracket styles
  - sticky input panel layout
  - `latex-shell` / `latex-scroll`
- `index.html` `SFX` module:
  - built-in music defaults
  - pad rhythm scheduling
  - BGM automation cleanup
  - load/save/reset/preview API
- `index.html` particle / score-funnel helpers:
  - `getScoreFunnelTarget()`
  - `buildScoreChunks()`
  - `createScoreAward()`
  - `flushPendingScoreAwards()`
  - `collectScoreAwardChunk()`
  - `spawnTrailGhost()`
  - `spawnExplosion()`
  - `animate()`
- `index.html` label projection:
  - `updateLabels()`
- `index.html` selected reticle helpers:
  - `selectedReticle`
  - `updateSelectedReticle()`
- `index.html` input layout / feedback helpers:
  - `setInputPanelContent()`
  - `syncInputPanelScroll()`
  - `queueQuizChoiceResolution()`
  - `clearQuizAnswerFeedback()`
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
- `index.html` BKT (Bayesian Knowledge Tracing):
  - `clampProb()`, `bayesPosterior()`, `effectivePGuess()`
  - `recomputeCompositePKnown()`, `bktUpdate()`
  - `infoGain()`, `pickScore()`
  - `bktBootstrapFromMastery()`, `findSubconceptIndex()`
- `index.html` anti-button-mash helpers:
  - `reshuffleQuestionOptions()`
  - `enemy.missCount` (per-enemy miss counter)
  - escalating delay in `queueQuizChoiceResolution()`
  - attempt cap in `handleMiss()`

## Latest Update: Anti-Button-Mash Mechanics

Implemented 4 reinforcing fixes to prevent brute-forcing through quiz mode by button-mashing.

What shipped:

- Fix 1 — Escalating Lockout:
  - Wrong-answer feedback delay now escalates per enemy: 800ms (1st miss), 1800ms (2nd miss), 3000ms (3rd+ miss)
  - Correct answers stay at 220ms (unchanged)
  - Miss counter stored on `enemy.missCount`, not on `G`, so tab-retargeting cannot reset it
  - `missCount` is initialized to 0 on all enemy creation paths (trySpawn, hydra depth-1, hydra depth-2)
  - `missCount` is persisted via the enemies array in run checkpoint save/restore

- Fix 2 — Harsher Miss Surge:
  - Quiz-mode surge values increased from 0.08/0.13/0.20 to 0.15/0.22/0.30
  - 3 misses at depth 0 now push the enemy 0.45 along the path (nearly half the track)
  - Non-quiz modes (prefix-key, typed) unchanged at 0.06

- Fix 3 — Option Shuffle on Miss:
  - New `reshuffleQuestionOptions(enemy)` function shuffles MC options after every wrong answer
  - Handles all 3 question types: identify (4 options), fillblank (choices array), subconcept (3 or 2 options)
  - Recomputes `correctIdx` and `correctKey` after shuffle
  - Clears `G.showHint` (keeps `G.hintUsed` for scoring) and deletes `eliminatedIdx`
  - Busts `lastInputState` render cache and calls `updateInput()` to force repaint
  - Called after `handleMiss()` in the timeout callback, with a `stillAlive` check to skip if hydra split removed the enemy

- Fix 4 — Attempt Cap with Auto-Surge:
  - After 3 misses on the same enemy, auto-surge to `t = max(current_t, 0.85)` and `speedMult = max(current, 3.0)`
  - Flashes `MAX MISS! BREACHING` warning in red
  - Placed after hydra split check so depth-0/1 enemies that split never reach the cap
  - The cap primarily affects depth-2 grandchildren and split-failure cases

Combined anti-mash effect:
- Escalating delays slow down mashing (220ms → 800ms → 1800ms → 3000ms)
- Shuffled options prevent systematic a→b→c→d elimination
- Heavy surge (0.15 per miss × 3 = 0.45) pushes enemies near breach
- Auto-surge at 3 misses virtually guarantees breach
- A knowledgeable player answering correctly sees zero difference

Spec artifact:
- `anti-button-mash-spec.md` (v3) with the full feature contract, Codex review findings, and testing plan

Verification completed:
- JavaScript parse check passed after all 4 fixes
- Agent-based code review confirmed all spec requirements met
- One code-smell fix applied (subconcept correctKey computation clarified for depth-2 binary questions)

## Latest Update: Bayesian Knowledge Tracing (BKT) Augmentation

Layered a probabilistic BKT model on top of the existing SM-2 SRS system. The SRS fields (ease, interval, streak, mastery) continue to drive scheduling and display. BKT adds a proper Bayesian model that improves question selection and hydra targeting.

What shipped:

- Core BKT math:
  - `clampProb()`, `bayesPosterior()`, `effectivePGuess()`, `recomputeCompositePKnown()`, `bktUpdate()`
  - `infoGain()` (entropy-based), `pickScore()` (hybrid: entropy + overdueness + low-knowledge boost)
  - Conservative fixed parameters in v1: pTransit=0.03, pGuess=0.25, pSlip=0.10
  - Adaptive parameter evolution deferred to v2 (Codex finding: one-way drift risk)

- Per-card BKT fields added to SRS:
  - `pKnownDirect` — direct parent-question evidence
  - `pKnown` — composite (direct + child evidence, 70/30 blend)
  - `pTransit`, `pGuess`, `pSlip` — fixed in v1
  - `subPKnown` — per-subconcept knowledge map, lazily populated

- Source-separated tree propagation:
  - Direct parent answers update `pKnownDirect`
  - Hydra child answers update `subPKnown[childIndex]`
  - `recomputeCompositePKnown()` reblends from sources each time (no compounding)
  - Child evidence contributes 30% to parent composite

- Context-sensitive P(G):
  - 4-choice MC: P(G)=0.25; with hint: P(G)=0.33; 2-choice: P(G)=0.50
  - Free recall (typed/prefix): P(G)=0.05
  - Hint-adjusted `remainingChoices` correctly decrements by 1 when hint eliminates an option

- Information-gain question selection:
  - `pickCommands` now sorts within each bucket (overdue/due/fresh/notDue) by hybrid `pickScore`
  - High-entropy (uncertain) cards are prioritized; low-knowledge cards get a boost to avoid starvation

- Weakest-subconcept hydra targeting:
  - `spawnHydraChildren` ranks subconcepts by `subPKnown` ascending (weakest first)
  - Unseen subconcepts default to 0.1 (fresh prior)

- HUD polish:
  - Uncertainty pulse animation (`.bkt-uncertain`) on enemy labels where `pKnown < 0.3`
  - End-screen mastery bar has a white vertical confidence line at avgPKnown position

- Backwards compatibility:
  - Legacy saves without BKT fields are bootstrapped: `pKnown = [0.10, 0.25, 0.45, 0.65, 0.82, 0.93][mastery]`
  - `subPKnown` deep-copied in srsHit/srsMiss to prevent aliasing bugs
  - Breach events: SRS penalty only, no BKT update (no student response to observe)

Spec artifact:
- `bkt-augmentation-spec.md` (v2) with Codex review findings, full implementation plan, and testing plan

Verification completed:
- JavaScript parse check passed
- BKT math verified: correct/wrong answers move pKnown in expected directions; 5 consecutive corrects: 0.1→0.99; 5 consecutive wrongs: 0.9→0.035; entropy=1.0 at p=0.5
- Codex spec review: 3 HIGH findings incorporated (pTransit lowered, adaptive params deferred, source-separated propagation)
- CC agent deep review: 1 MEDIUM finding fixed (hint remainingChoices), 1 LOW fixed (subPKnown deep copy)

## Likely Next Tasks

- Add a matching in-world reticle or subtle beam under the selected cube if the focus treatment should exist in both screen space and world space
- If the score-funnel effect should feel more rewarding, trigger a small HUD pop or score flash when rainbow particles reach the score target
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
