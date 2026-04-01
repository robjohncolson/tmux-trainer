# Focused Labels + Sticky Input Panel Spec

Date: 2026-03-31
Repo: `tmux-trainer`
Primary file: `index.html`

## Goals

- Make the selected enemy visually obvious on both desktop and mobile without adding gameplay ambiguity.
- Keep the active prompt visible while the player scrolls through answers or explanations on small screens.
- Improve mobile input ergonomics with larger tap targets and clearer touch feedback.
- Raise text legibility over the 3D scene with a stronger bottom-stage backdrop.

## Non-Goals

- No changes to scoring, wave logic, SRS progression, or enemy pathing.
- No full module split of the single-file app.
- No changes to the existing cartridge content or explanation-bank data model.
- No tmux-bridge code changes in this repo; only spec-level upgrade suggestions.

## Agreed UX Direction

### Enemy Labels

- Keep the existing in-world selected reticle around the cube as a secondary scene cue.
- Redesign the projected DOM labels so selection is obvious even if the player is reading the text rather than the board.
- Unselected labels become "ghosts":
  - opacity reduced to about `0.55`
  - no visible border
  - slightly muted text color
  - mastery dot remains visible
- Selected labels become the only fully emphasized label:
  - full opacity
  - brighter light-grey text for depth-0 enemies
  - darker label plate for contrast
  - large corner-bracket lock-on treatment around the label shell
- Keep the small selected-arrow as a secondary mobile cue, but retint it into the same light-grey family.
- Preserve existing depth colors for selected hydra children:
  - depth 0 uses the new light-grey lock-on treatment
  - depth 1 keeps blue emphasis
  - depth 2 keeps purple emphasis

### Input Panel

- Restructure `#input-panel` into a fixed-height card with two zones:
  - sticky header
  - scrollable body
- The sticky header holds:
  - question-type badge
  - prompt text
  - LaTeX formula when present
- The scrollable body holds:
  - multiple-choice buttons or text input
  - hint text
  - explanation chips
  - explanation panel
  - input help text
- On mobile, the header should stay at or below roughly `40%` of the panel height so the answers still have room.
- Wave-clear UI can stay as a simpler single block because it is not a scroll/readability problem.

### Formula Readability

- Wide formulas should stay readable rather than shrinking aggressively.
- Add a dedicated horizontal scroll wrapper around rendered KaTeX content.
- Keep formulas centered when they fit, but allow left/right swipe when they do not.

### Touch Ergonomics

- Mobile answer buttons should use a minimum height of `56px`.
- Keep the larger tap target for both identify and fill-blank answer buttons.
- Explanation chips can remain slightly smaller, but should still stay comfortably tappable.

### Answer Feedback

- For quiz-mode answer buttons, add a short confirmation flash before resolving the answer:
  - green for correct
  - red for wrong
- Target delay: about `120ms` to `160ms`
- The flash should apply to both touch/click and keyboard-triggered multiple-choice submissions so behavior stays consistent.
- Typed-mode and prefix-key answers do not need the same delay.

### Board Legibility

- Add a subtle dark gradient rising behind the input panel.
- The gradient should dim the lower playfield enough to support formula reading without making the board feel disconnected.
- The effect should sit behind the panel and not block interaction.

## Technical Design

### 1. Label Ghosting + Lock-On Brackets

- Update the label CSS to distinguish selected and ghost states instead of relying on inline border color alone.
- `updateLabels()` should:
  - add a selected/ghost class to each `.enemy-label`
  - keep the selected-arrow markup, but retint it for the new lock-on palette
  - preserve click-to-select behavior
- The selected label shell should render bracket corners via CSS pseudo-elements or dedicated bracket spans.
- The world-space `selectedReticle` remains in place as the cube-level cue; the DOM bracket is the text-level cue.

### 2. Sticky Input Layout

- Convert `#input-panel` from a single scrolling container into a bounded flex layout.
- `updateInput()` should render quiz, typed, and prefix-key modes through a shared structure:
  - `.input-layout`
  - `.input-header`
  - `.input-body`
- The panel root should stop using direct `overflow-y:auto`; scrolling belongs to `.input-body`.
- Existing explainer open/close behavior should continue to scroll the body, not the whole panel.

### 3. Formula Scroll Wrapping

- Add a `.latex-scroll` wrapper around each rendered formula slot.
- Keep `renderLatex()` unchanged; the layout wrapper handles overflow.
- Use horizontal touch scrolling only where needed; avoid shrinking KaTeX to unreadable sizes.

### 4. Quiz Answer Flash

- Introduce a small quiz-answer feedback helper instead of pushing flash logic into `handleHit()` or `handleMiss()`.
- The helper should:
  - lock repeated quiz submissions briefly
  - apply a correct/wrong class to the chosen button
  - call `handleHit()` / `handleMiss()` after the short delay
  - ignore stale callbacks if the screen/selection changed before resolution
- This keeps the core scoring and hydra logic unchanged.

### 5. Bottom Backdrop

- Add a non-interactive gradient layer behind `#input-panel`, ideally via a pseudo-element on the panel root.
- The gradient should extend upward beyond the panel bounds so the board fades naturally into the reading surface.

## GitNexus Review

### Status

- `npx gitnexus status` reports the `tmux-trainer` index is current.

### Limitation

- `npx gitnexus impact <symbol> --repo tmux-trainer --direction upstream` does not resolve the inline JavaScript functions in `index.html`.
- On this pass, `updateInput`, `updateLabels`, and `handleQuizChoice` all returned `target-not-found`.
- That means symbol-level `impact/context` is unavailable for the functions we need to change.

### Manual Blast Radius

- `updateLabels()`
  - direct callers: continue-game restore and the main animation loop
  - affected behavior: projected label styling, click-to-select affordance, moment-to-moment gameplay readability
  - risk: `LOW-MEDIUM`
- `updateInput()`
  - direct callers: game UI show path, explainer open/close refresh, main animation loop
  - affected behavior: prompt rendering, answer layout, explainer tray, wave-clear panel
  - risk: `MEDIUM`
- `renderExplanationControls()` and explainer scroll helpers
  - affected behavior: explanation chip/panel placement within the new scroll body
  - risk: `LOW-MEDIUM`
- quiz answer handlers
  - direct callers: button `onclick` wiring and keyboard answer branches
  - affected behavior: timing of hit/miss dispatch, button-state feedback, anti-spam behavior
  - risk: `MEDIUM`

## Dependency-Aware Implementation Plan

1. Update panel/label CSS first.
   This creates the static surfaces needed by the later DOM changes without touching answer logic.
2. Refactor `updateLabels()` to emit selected/ghost state and remove the old arrow markup.
   This is visually isolated from question rendering.
3. Refactor `updateInput()` to use the shared sticky-header / scroll-body layout.
   Keep the existing question-generation logic intact while only changing markup structure.
4. Adapt explainer scroll helpers to target the new scroll body rather than the panel root.
5. Add the quiz answer feedback helper and reroute quiz-mode answer handlers through it.
   Leave `handleHit()` and `handleMiss()` unchanged unless a verification issue forces a narrower fix.
6. Verify that keyboard, click, touch, hint-elimination, and hydra split flows still resolve correctly.
7. Update the continuation prompt with the new spec and verified behavior.

## tmux-Bridge Upgrade Ideas

- Add a `send_and_wait` primitive that submits text to a pane and returns only the new completed response block.
- Add explicit message envelopes with `request_id`, `repo`, `topic`, and `status` so cross-agent work is traceable.
- Add a pane-level `submit_multiline` mode so large prompts cannot stall in a pasted-but-not-submitted state.
- Add structured transcript slicing by prompt/response boundaries instead of raw pane peeks.
- Add first-class repo-role-topic pane discovery so Codex can find the right Claude pane without manual inspection.
