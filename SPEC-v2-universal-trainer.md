# Universal Tower Defense Trainer — v2 Specification

**Date:** 2026-03-28
**Status:** Draft
**Base:** `tmux-tower-defense.html` (v1)

---

## 1. Goal

Transform the tmux-specific tower defense trainer into a **universal knowledge trainer** that supports any domain where the learner must produce a short, specific answer from a prompt. The game engine, SRS, 3D scene, and sound remain identical — we add a **cartridge system** for swappable content, a **question generator** for procedural domains like math, and **persistent progress** via localStorage so mastery survives page reloads.

---

## 2. Cartridge System

A **cartridge** is a self-contained knowledge domain. The game loads one cartridge at a time. Each cartridge defines its content, input model, and display behavior.

### 2.1 Cartridge Interface

```javascript
const cartridge = {
  id: 'multiplication',           // Stable key for localStorage
  name: 'Times Tables',           // Display name
  description: '1×1 through 12×12',
  icon: '×',                      // Single char for title screen
  accent: '#ff8c00',                       // Accent color for selector card and title only

  // --- Content ---
  type: 'generated' | 'static',   // 'static' = fixed COMMANDS array
                                   // 'generated' = uses generator function

  // For static cartridges (like tmux):
  commands: [ /* same {id, action, key, tier, dom, hint} shape */ ],

  // For generated cartridges (like math):
  generator: {
    pool: function() { /* returns full array of possible items */ },
    // Each item has the standard shape: {id, action, key, tier, dom, hint}
    // Generator builds these programmatically
  },

  // --- Input Model ---
  inputMode: 'prefix-key' | 'single-key' | 'typed',

  // prefix-key:  Two-stage (Ctrl+b → key). Current tmux behavior.
  // single-key:  One keystroke answer, no prefix. Good for single-digit math.
  // typed:       Multi-character text input, submit on Enter.
  //              Used for multi-digit answers, vocabulary, etc.

  // --- Validation ---
  validate: function(userInput, expectedKey) {
    // Returns { correct: boolean, partial: boolean }
    // Default: exact match. Override for fuzzy matching, numeric parsing, etc.
  },

  // --- Display ---
  formatPrompt: function(cmd) {
    // Returns HTML string for the prompt area. Default: cmd.action
  },
  formatAnswer: function(cmd) {
    // Returns display string for the answer (shown on kill). Default: cmd.key
  },
  prefixLabel: null,              // e.g., 'Ctrl+b' for tmux, null for others
  title: 'TIMES TABLES',         // Title screen line 1
  subtitle: 'TOWER DEFENSE',     // Title screen line 2
  startButton: '[ DEPLOY ]',     // Start button text
  instructions: 'Type the answer to destroy enemies.',
};
```

### 2.2 Built-In Cartridges

**Ship with 3 cartridges at launch:**

| Cartridge | Type | Input Mode | Content |
|-----------|------|------------|---------|
| `tmux` | static | prefix-key | Current 28 commands, unchanged |
| `multiplication` | generated | typed | 1×1 through 12×12 (78 unique facts, deduped) |
| `us-states-capitals` | static | typed | 50 states → capitals |

### 2.3 Cartridge Selection Screen

New screen injected **before** the current title screen:

```
┌──────────────────────────────────┐
│       TOWER DEFENSE TRAINER      │
│                                  │
│   Select your training module:   │
│                                  │
│   ┌──────────┐  ┌──────────┐    │
│   │  ⌨ tmux  │  │ × Times  │    │
│   │ Shortcuts│  │  Tables  │    │
│   │  ●●●○○   │  │  ●○○○○   │    │
│   └──────────┘  └──────────┘    │
│                                  │
│   ┌──────────┐                   │
│   │ 🏛 US    │                   │
│   │ Capitals │                   │
│   │  ○○○○○   │                   │
│   └──────────┘                   │
│                                  │
│   ● = mastery progress dots      │
└──────────────────────────────────┘
```

Each card shows:
- Cartridge name and icon
- **Mini progress indicator**: 5 dots representing overall mastery distribution
  - Filled dots = proportion of items at mastery 3+
- Click to enter that cartridge's title screen

---

## 3. Math Question Generator

The multiplication cartridge demonstrates the generator pattern. Instead of a hardcoded COMMANDS array, it builds one programmatically.

### 3.1 Generator Implementation

```javascript
generator: {
  pool() {
    const items = [];
    for (let a = 1; a <= 12; a++) {
      for (let b = a; b <= 12; b++) {  // b >= a avoids duplicates (3×7 = 7×3)
        const answer = a * b;
        items.push({
          id: `mul-${a}x${b}`,
          action: `${a} × ${b}`,
          key: String(answer),
          tier: getTier(a, b),
          dom: `${a}s`,             // Group by first factor
          hint: getHint(a, b),
        });
      }
    }
    return items;                    // 78 unique facts
  }
}
```

### 3.2 Tier Assignment for Math

| Tier | Rule | Examples | Rationale |
|------|------|----------|-----------|
| `core` | Involves 1, 2, 5, 10, or perfect squares | 2×7, 5×9, 6×6, 10×4 | Most kids learn these first |
| `regular` | Both factors ≤ 9 and not core | 3×7, 4×8, 6×9 | Medium difficulty |
| `power` | Any factor ≥ 10 (not in core) | 7×11, 8×12, 11×12 | Hardest facts |

```javascript
function getTier(a, b) {
  if (a === b) return 'core';                    // perfect squares
  if ([1,2,5,10].includes(a) || [1,2,5,10].includes(b)) return 'core';
  if (a >= 10 || b >= 10) return 'power';
  return 'regular';
}
```

### 3.3 Hint Generation for Math

```javascript
function getHint(a, b) {
  const answer = a * b;
  // Use nearby known fact as anchor
  if (b === 9) return `${a}×10 = ${a*10}, minus ${a}`;
  if (b === 11) return `${a}×10 = ${a*10}, plus ${a}`;
  if (a === b) return `${a} squared`;
  return `${a}×${b-1} = ${a*(b-1)}, plus ${a}`;
}
```

### 3.4 Bidirectional Presentation (Future Enhancement)

For v2.1: randomly present `3 × 7` vs `7 × 3` to build commutativity fluency. Both map to the same SRS card (same `id`), but the visual prompt alternates. Not in initial release — adds complexity to the prompt rendering.

---

## 4. Input Mode Implementations

### 4.1 `prefix-key` (existing tmux behavior)

No changes. Two-stage state machine: `idle → await_prefix → await_command`.

### 4.2 `single-key`

Simplified state machine: `idle → await_answer`. On enemy auto-select, immediately enter `await_answer`. Match `e.key` against `cmd.key`. No prefix step.

Use case: single-digit answers, keyboard shortcuts without a prefix.

### 4.3 `typed` (new)

New state machine with a text accumulator:

```
                ┌──────────────┐
                │     idle     │◄── enemy killed / no enemy
                └──────┬───────┘
                       │ auto-select enemy
                ┌──────▼───────┐
          ┌────►│    typing    │
          │     └──┬───────┬───┘
          │        │       │
          │    keystroke  Enter
          │    (append)  (submit)
          │        │       │
          │   ┌────▼──┐  ┌─▼──────────┐
          │   │typing │  │  validate   │
          │   │(cont) │  └──┬──────┬───┘
          │   └───────┘     │      │
          │            correct   wrong
          │                 │      │
          │            ┌────▼──┐   │
          │            │ idle  │   │
          │            └───────┘   │
          └────────────────────────┘
```

**Input display:** Show a text input box in the input panel. Characters appear as typed. Backspace deletes last character. Enter submits.

**Validation for math:**
```javascript
validate(userInput, expectedKey) {
  const parsed = parseInt(userInput.trim(), 10);
  const expected = parseInt(expectedKey, 10);
  return { correct: parsed === expected, partial: false };
}
```

**Input panel rendering:**
```
┌─────────────────────────────┐
│       TARGET: 7 × 8        │
│                             │
│       ┌─────────────┐      │
│       │ 56_          │      │  ← blinking cursor
│       └─────────────┘      │
│       Enter to submit       │
└─────────────────────────────┘
```

---

## 5. Persistent Progress (localStorage)

### 5.1 Storage Schema

Each cartridge stores its SRS state independently under a namespaced key:

```
Key:    td-srs-{cartridge.id}
Value:  JSON string of the SRS state object
```

Example keys:
- `td-srs-tmux`
- `td-srs-multiplication`
- `td-srs-us-states-capitals`

### 5.2 Save Points

SRS state is saved to localStorage at these moments:
1. **After each wave completes** (wave clear screen)
2. **On game over**
3. **On victory**
4. **On page unload** (`beforeunload` event, as safety net)

### 5.3 Load on Startup

```javascript
function loadSRS(cartridge) {
  const saved = localStorage.getItem(`td-srs-${cartridge.id}`);
  if (!saved) return initSRS(cartridge);

  const parsed = JSON.parse(saved);

  // Merge: keep saved state for known items, add defaults for new items
  const fresh = initSRS(cartridge);
  for (const id of Object.keys(fresh)) {
    if (parsed[id]) fresh[id] = parsed[id];
  }
  return fresh;
}
```

**Key behavior:** If the cartridge adds new items (e.g., math generator expands from 10×10 to 12×12), new items get default SRS state. Existing mastery is preserved. If items are removed from a cartridge, their orphaned SRS data is silently ignored (not loaded into the active state, but not deleted from storage either).

### 5.4 Progress Summary for Cartridge Select

On the cartridge selection screen, compute a quick summary from saved SRS:

```javascript
function getCartridgeProgress(cartridgeId) {
  const saved = localStorage.getItem(`td-srs-${cartridgeId}`);
  if (!saved) return { total: 0, mastered: 0, seen: 0 };

  const srs = JSON.parse(saved);
  const entries = Object.values(srs);
  return {
    total: entries.length,
    seen: entries.filter(s => s.totalAttempts > 0).length,
    mastered: entries.filter(s => s.mastery >= 4).length,
    avgMastery: entries.reduce((sum, s) => sum + s.mastery, 0) / entries.length,
  };
}
```

### 5.5 Reset Option

Each cartridge's title screen includes a small "Reset Progress" link that clears `td-srs-{id}` after a confirmation prompt. This is a destructive action — confirm with the user.

---

## 6. Changes to Existing Code

### 6.1 What Stays the Same
- 3D scene (terrain, path, server tower, enemies, particles, beams)
- Sound engine (all SFX and BGM)
- Scoring system
- SRS algorithm (`srsHit`, `srsMiss`, `pickCommands`)
- Game loop timing and spawn logic
- Color system (amber for all gameplay)
- HUD layout

### 6.2 What Changes

| Component | Change | Scope |
|-----------|--------|-------|
| `COMMANDS` array | Replaced by `cartridge.commands` or `cartridge.generator.pool()` | Moderate — wire up at init |
| `initSRS()` | Takes cartridge's command list as parameter instead of global `COMMANDS` | Small |
| Input handler | Branched by `cartridge.inputMode` | Moderate — new `typed` mode |
| `updateInput()` | Branched by input mode | Moderate — new text input UI |
| Title screen | Dynamic text from cartridge, back button to selector | Small |
| Screen flow | New `select` screen before `title` | Small |
| `startGame()` | Calls `loadSRS()` instead of `initSRS()` | Small |
| Wave clear / game over / victory | Calls `saveSRS()` | Small |
| `displayKey()` | Delegated to `cartridge.formatAnswer()` | Small |

### 6.3 New Screen Flow

```
┌──────────┐  click card   ┌─────────┐   click DEPLOY   ┌─────────┐
│ CARTRIDGE│ ─────────────► │  TITLE  │ ────────────────► │  GAME   │  ...
│ SELECT   │                │ SCREEN  │                   │ SCREEN  │
└──────────┘                └─────────┘                   └─────────┘
     ▲                           │
     │                      back button
     └───────────────────────────┘
```

Game over and victory screens gain a "Back to Menu" button alongside the existing "Redeploy" button.

### 6.4 Spacebar as Universal Advance Key

**Spacebar activates any "advance" button** on non-gameplay screens. This means:

- Cartridge select: no effect (selection is by click/arrow keys)
- Title screen: Space = click DEPLOY
- Wave clear screen: Space = click NEXT WAVE
- Game over screen: Space = click REDEPLOY
- Victory screen: Space = click REDEPLOY

**Implementation:** A single global keydown listener checks `e.key === ' '` when `G.screen !== 'game'`. If the currently visible overlay contains an active `.btn` element, `.click()` it. During gameplay, Space is **not** intercepted by this handler — it passes through to the input handler normally (tmux cartridge uses Space for "cycle layout"; typed-mode cartridges would ignore it or treat it as a character depending on context).

**Edge case — tmux cartridge conflict:** The tmux `next-layout` command is bound to Space (`key: ' '`). This is safe because the advance handler only fires on non-game screens, and during gameplay the input handler owns Space.

---

## 7. Implementation Plan (Ordered)

| Step | Description | Estimated Complexity |
|------|-------------|---------------------|
| 1 | Extract current tmux content into a `tmuxCartridge` object | Low |
| 2 | Build cartridge loader: `loadCartridge(cart)` wires commands, input mode, display | Medium |
| 3 | Add `typed` input mode (text accumulator, Enter submit, Backspace) | Medium |
| 4 | Build multiplication cartridge with generator and tier/hint logic | Low |
| 5 | Add localStorage save/load for SRS state | Low |
| 6 | Build cartridge selection screen with progress indicators | Medium |
| 7 | Wire up screen flow (select → title → game, back buttons) | Low |
| 8 | Build US states/capitals cartridge (static, typed input) | Low |
| 9 | Test persistence: play a few waves, reload, verify mastery preserved | Testing |

---

## 8. Resolved Design Decisions

1. **Duplicate math facts**: Same SRS item. One canonical `id` per fact (e.g., `mul-3x7`). SRS is card-id based, so splitting 3×7 and 7×3 doubles the pool without adding a new answer. Bidirectional prompt randomization deferred to v2.1.
2. **Custom cartridge import**: Not in v2. The cartridge interface is sufficient. If added later, use JSON (not CSV) — JSON cleanly represents input mode, validation, hints, and formatting.
3. **Color theming**: Amber for all gameplay in v2. The palette is wired deeply through scene, HUD, and materials. Cartridge-specific color limited to selector card accents and title screen only.
4. **Difficulty scaling**: Keep tiers. Wave progression already unlocks by core/regular/power, and the structure is proven. Generated cartridges compute difficulty internally and bucket into the 3 tiers.
5. **Mobile support**: Deferred. Current game assumes desktop keyboard (global keydown, Tab, Alt+H, prefix). `typed` mode will use a real focusable `<input>` element (good practice), but mobile is not a v2 target.
