# Spec: Alt+E Cycle, Answer Lock, Speed Fix

## Problem

1. Students can answer while the explainer/video is open — breaks the "learning mode" concept
2. Alt+E and Alt+W are two separate shortcuts — one too many to teach
3. The 35% slowdown stays active during the answer feedback flash window when it should be full speed
4. Panel buttons (CLOSE, WATCH) don't reveal their keyboard shortcut

## Solution

Four changes:

### 1. Alt+E becomes a 3-state cycle

```
closed → Alt+E → text explanation → Alt+E → video → Alt+E → close
```

One shortcut. Students learn one key. Alt+W removed entirely.

### 2. Answers locked while explainer open

MC buttons disabled (no onclick, reduced opacity) when `EXPLAINER_STATE.open`. Keyboard A/B/C/D blocked. Guard in all 3 answer handlers + keyboard handler.

### 3. Full speed during answer resolution

`explainerSlow` forced to `1.0` when `QUIZ_ANSWER_FEEDBACK.locked` (the ~220ms flash window). Enemies move at full game speed while the green/red flash plays.

### 4. Panel button shows next Alt+E action

The title bar shows one contextual button revealing what Alt+E does next:

| State | Button in title bar |
|-------|-------------------|
| Text showing | `[Alt+E] watch` (or `[Alt+E] close` if no animation available) |
| Video playing | `[Alt+E] close` |

## Design

### Alt+E handler rewrite

```javascript
if(e.key==='e'&&e.altKey){
  e.preventDefault();
  if(EXPLAINER_STATE.videoUrl){
    // State 3 → closed: close video + explainer
    closeExplanation();
  } else if(EXPLAINER_STATE.open){
    // State 2 → video: load animation (or close if unavailable)
    const avail = getAnimationAvailability(EXPLAINER_STATE.animationId);
    if(avail !== 'unavailable') loadAnimation(EXPLAINER_STATE.animationId);
    else closeExplanation();
  } else {
    // State 1 → text: open explanation
    openExplanationForSelectedCommand();
  }
  return;
}
```

### Alt+W removal

- Delete the Alt+W keyboard handler block (lines 4684-4691)
- Remove Alt+W from `renderShortcutBadges()`
- Remove Alt+W from HOW TO PLAY
- Remove Alt+W from `instructionsSub`
- `openAnimationForSelectedCommand()` still exists — called by Alt+E cycle, just not by Alt+W
- Remove `closeAnimationVideo()` standalone usage — folded into `closeExplanation()` which now also clears video state

### Spacebar dismiss update

Current spacebar dismisses explainer OR video. With the cycle, spacebar should close everything (same as Alt+E from video state):
```javascript
if(EXPLAINER_STATE.open){
  closeExplanation(); // already clears video state too
  return;
}
```

### Answer lock

Guard at top of each handler:
```javascript
function handleQuizChoice(key){
  if(G.screen!=='game'||QUIZ_ANSWER_FEEDBACK.locked||EXPLAINER_STATE.open)return;
  ...
}
// Same for handleHintChoice, handleSubconceptChoice
```

Keyboard handler — block A/B/C/D when explainer open:
```javascript
if(mode==='quiz'){
  if(EXPLAINER_STATE.open) return; // block all answer keys
  ...
}
```

Visual disabled state — in `renderExplanationControls()` or the quiz rendering, when `EXPLAINER_STATE.open`:
- MC buttons get `opacity:0.3; pointer-events:none` via inline style or a CSS class

### Speed fix

In `moveEnemies()`:
```javascript
const explainerSlow = (EXPLAINER_STATE.open && !QUIZ_ANSWER_FEEDBACK.locked) ? 0.35 : 1.0;
```

### Shortcut badge simplification

`renderShortcutBadges()` renders ONE badge with contextual label:

```javascript
function renderShortcutBadges(){
  let label, action;
  if(EXPLAINER_STATE.videoUrl){
    label='close'; action='closeExplanation()';
  } else if(EXPLAINER_STATE.open){
    const avail=getAnimationAvailability(EXPLAINER_STATE.animationId);
    if(avail!=='unavailable'){ label='watch'; action='loadAnimation(\''+EXPLAINER_STATE.animationId+'\')'; }
    else { label='close'; action='closeExplanation()'; }
  } else {
    label='explain'; action='openExplanationForSelectedCommand()';
  }
  return '<div class="shortcut-row"><button class="shortcut-badge" onclick="'+action+'"><kbd>Alt+E</kbd> '+label+'</button></div>';
}
```

### Panel title bar button

Replace the separate WATCH + CLOSE buttons with one contextual button:

When text showing:
```html
<div class="explain-panel-top">
  <div class="explain-title">Sample Mean</div>
  <button class="explain-watch" onclick="loadAnimation(...)"><kbd>Alt+E</kbd> watch</button>
</div>
```

When video showing:
```html
<div class="explain-panel-top">
  <div class="explain-title">Sample Mean</div>
  <button class="explain-close" onclick="closeExplanation()"><kbd>Alt+E</kbd> close</button>
</div>
```

When no animation available:
```html
<div class="explain-panel-top">
  <div class="explain-title">Sample Mean</div>
  <button class="explain-close" onclick="closeExplanation()"><kbd>Alt+E</kbd> close</button>
</div>
```

## Blast Radius

| Area | Change |
|------|--------|
| Alt+E handler | Rewrite to 3-state cycle |
| Alt+W handler | Delete |
| `renderShortcutBadges()` | Single contextual badge |
| `renderExplanationControls()` | One contextual button, no separate WATCH+CLOSE |
| `handleQuizChoice/HintChoice/SubconceptChoice` | Add `EXPLAINER_STATE.open` guard |
| Keyboard MC handler | Block A/B/C/D when explainer open |
| `moveEnemies()` | Exclude slowdown during answer feedback |
| Spacebar handler | Simplify to just `closeExplanation()` |
| Quiz rendering (5 modes) | Disable MC buttons visually when explainer open |
| Help text / HOW TO PLAY | Remove Alt+W, keep Alt+E |
| `instructionsSub` | Remove Alt+W |

### NOT touched
- SFX/FM engine, SRS/BKT, scoring, Three.js, cloud sync, particles, service worker

## Testing

- [ ] Alt+E from closed → opens text explanation
- [ ] Alt+E from text → loads video
- [ ] Alt+E from video → closes everything
- [ ] Alt+E from text with no animation → closes
- [ ] Alt+W does nothing (removed)
- [ ] Spacebar closes from any open state
- [ ] MC buttons disabled (dimmed) while explainer open
- [ ] Keyboard A/B/C/D blocked while explainer open
- [ ] Closing explainer re-enables buttons instantly
- [ ] Enemies at 35% during explainer, full speed during answer flash
- [ ] Shortcut badge shows contextual label (explain/watch/close)
- [ ] Panel title bar shows one contextual button with `[Alt+E]` label
- [ ] HOW TO PLAY shows Alt+E only, no Alt+W
- [ ] Parse check passes

## Edge Cases

1. **Alt+E rapid double-press** — first opens text, second loads video. If video HEAD check is in-flight, nonce guard prevents stale state.
2. **Alt+E while answer feedback is locked** — should be allowed (opening explainer doesn't interfere with the flash resolve). But answer buttons stay locked.
3. **Student opens explainer then enemy dies/breaches** — `resetExplanationState()` already fires on enemy death/screen transitions. Buttons re-enable.
4. **Mobile tap badge while explainer open** — badge says "watch" or "close", tap does the right thing. Same cycle.
