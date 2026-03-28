# Gamified Tower Defense Trainer — Technical Specification

**Version:** 1.0  
**Platform:** tmux Tower Defense 3D  
**Date:** 2026-03-28  
**Companion files:** `tmux-tower-defense.html` (implementation), `tmux-trainer-deepresearch.md` (research basis)

---

## 1. Purpose and Design Philosophy

This application is a **knowledge-recall training platform disguised as a 3D tower defense game**. The current implementation trains tmux keyboard shortcuts, but the architecture is designed to be **content-swappable** — the game engine, SRS system, input model, and visual layer are all separated from the knowledge domain.

The core pedagogical insight (from the research document) is that tmux-style training requires **automatic recall under time pressure**, not conceptual reasoning. This generalizes: any domain where the learner must produce a short, specific answer from a prompt (keyboard shortcuts, math facts, vocabulary, chemical formulas, musical intervals, etc.) fits this platform.

The learning science backbone combines two evidence-backed principles:
- **Spaced repetition** (SM-2 inspired) — items reappear at increasing intervals as mastery grows
- **Retrieval practice** — testing beats restudy; the game IS the test

The game adds a **time-pressure dimension** that flashcard apps lack: enemies marching toward your base create authentic urgency that mirrors real-world "I need this shortcut NOW" situations.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                MONOLITHIC HTML FILE               │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌─── CSS Layer ──────────────────────────────┐  │
│  │  Amber phosphor color system (AMB palette) │  │
│  │  HUD positioning (fixed overlays)          │  │
│  │  CSS animations (blink, float-up, shake)   │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  ┌─── HTML Layer ─────────────────────────────┐  │
│  │  <canvas> — Three.js render target          │  │
│  │  #hud — score/wave/lives/streak             │  │
│  │  #labels — 3D-projected enemy labels (DOM)  │  │
│  │  #input-panel — prompt + keystroke display  │  │
│  │  #overlay — title/gameover/victory screens  │  │
│  │  #queue-bar — incoming enemy preview        │  │
│  │  #mute-btn — sound toggle                   │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  ┌─── JavaScript Layer ───────────────────────┐  │
│  │                                             │  │
│  │  ┌── Sound Engine (SFX) ──────────────┐    │  │
│  │  │  Web Audio API synth               │    │  │
│  │  │  BGM loop, layered SFX             │    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  │  ┌── Knowledge Domain (COMMANDS) ─────┐    │  │
│  │  │  Array of {id, action, key, tier,  │    │  │
│  │  │   dom, hint} objects               │    │  │
│  │  │  ★ THIS IS WHAT YOU SWAP ★         │    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  │  ┌── SRS Engine ──────────────────────┐    │  │
│  │  │  initSRS(), srsHit(), srsMiss()    │    │  │
│  │  │  pickCommands() — wave builder     │    │  │
│  │  │  Per-card: ease, interval, streak, │    │  │
│  │  │   mastery, avgTimeMs, attempts     │    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  │  ┌── Game State (G) ─────────────────┐    │  │
│  │  │  Single mutable object             │    │  │
│  │  │  Screen, wave, enemies, input, SRS │    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  │  ┌── Input Handler ──────────────────┐    │  │
│  │  │  Modifier guard (Shift/Ctrl/etc)   │    │  │
│  │  │  Two-stage state machine           │    │  │
│  │  │  ★ INPUT MODEL IS DOMAIN-SPECIFIC ★│    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  │  ┌── 3D Scene (Three.js r128) ───────┐    │  │
│  │  │  Terrain, path, server tower       │    │  │
│  │  │  Enemy meshes + label projection   │    │  │
│  │  │  Particles, beams, camera          │    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  │  ┌── Game Loop Functions ────────────┐    │  │
│  │  │  trySpawn, moveEnemies,            │    │  │
│  │  │  checkBreach, checkWaveComplete,   │    │  │
│  │  │  autoSelect, animate               │    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  │  ┌── HUD / UI Update Functions ──────┐    │  │
│  │  │  updateHUD, updateInput,           │    │  │
│  │  │  updateLabels, updateQueue,        │    │  │
│  │  │  updateTierBar, showEndScreen      │    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  External dependency: Three.js r128 via CDN       │
│  https://cdnjs.cloudflare.com/ajax/libs/          │
│    three.js/r128/three.min.js                     │
└─────────────────────────────────────────────────┘
```

---

## 3. Module Specifications

### 3.1 Knowledge Domain — `COMMANDS` Array

This is the **primary content you replace** when adapting to a new subject. Each entry is an object:

```javascript
{
  id: string,      // Unique stable identifier (used as SRS key)
  action: string,  // The PROMPT shown to the player ("Split pane vertically")
  key: string,     // The EXPECTED ANSWER — matched against e.key from KeyboardEvent
  tier: string,    // Difficulty tier: 'core' | 'regular' | 'power'
  dom: string,     // Domain/category tag (for grouping/display)
  hint: string     // Mnemonic hint revealed on Alt+H (costs points)
}
```

**Tier unlock schedule** (currently hardcoded in `genWave()`):
- Waves 1–3: `core` only
- Waves 4–6: `core` + `regular`
- Waves 7–12: `core` + `regular` + `power`

**Adaptation notes:**
- For math facts: `action` = "7 × 8", `key` could be matched differently (see Input Handler)
- For vocabulary: `action` = "ephemeral", `key` = free-text answer (requires input model change)
- The `key` field is currently matched as a single `e.key` character. Multi-character answers require replacing the input handler's matching logic (see Section 3.4)
- Tier names and count are cosmetic — change the `TIER_ORDER` array and the `genWave()` thresholds

**Current tmux inventory:** 28 commands across 3 tiers and 5 domains (sessions, windows, panes, copy, general). These map directly to tmux(1) default bindings per the research document's "Essential shortcuts" table.

### 3.2 SRS Engine — Spaced Repetition System

#### Data Model — Per-Card State

```javascript
{
  ease: 2.5,        // SM-2 easiness factor (minimum 1.3, start 2.5)
  interval: 0,      // Waves until next review (0 = due now)
  streak: 0,        // Consecutive correct answers
  correct: 0,       // Lifetime correct count
  wrong: 0,         // Lifetime wrong count
  lastSeen: 0,      // Wave number when last reviewed
  mastery: 0,       // 0-5 mastery level (see below)
  avgTimeMs: 0,     // Running average response time in milliseconds
  totalAttempts: 0   // Total attempts (correct + wrong) across all encounters
}
```

#### Mastery Levels

| Level | Label      | Color   | Requirements |
|-------|-----------|---------|-------------|
| 0     | New       | #ff4422 | Default state |
| 1     | Learning  | #ff6b35 | streak ≥ 1 |
| 2     | Familiar  | #ffaa22 | streak ≥ 2 |
| 3     | Practiced | #66aaff | streak ≥ 3, ease ≥ 1.8 |
| 4     | Proficient| #44ff88 | streak ≥ 5, ease ≥ 2.0, avgTime < 3000ms |
| 5     | Mastered  | #44ff88 | streak ≥ 8, ease ≥ 2.2, avgTime < 1800ms |

**Key design decision:** Mastery 4 and 5 require BOTH accuracy consistency AND speed proficiency. You cannot reach "Mastered" by being slow but correct. This models real-world fluency.

#### `srsHit(card, wave, timeMs, usedHint, attempts)` — Correct Answer

1. Increment `correct`, `streak`, `lastSeen`, `totalAttempts`
2. Update rolling `avgTimeMs`
3. Compute quality score `q` (0–5):
   - Start at 5
   - Penalize slow responses: >6s: −2, >4s: −1.5, >2.5s: −0.5
   - Reward fast responses: <1.5s: +0.5
   - Penalize hint usage: −2
   - Penalize retries: −1 per attempt beyond the first (capped at −2)
   - Clamp to [0, 5]
4. Update ease factor using SM-2 formula: `ease = max(1.3, ease + (0.1 − (5−q) × (0.08 + (5−q) × 0.02)))`
5. Update interval:
   - If interval was 0 → 1
   - If interval was 1 → 3
   - Otherwise → `round(interval × ease)`, capped at 20
6. Update mastery level based on streak + ease + speed thresholds

#### `srsMiss(card, wave)` — Wrong Answer or Breach

1. Increment `wrong`, `totalAttempts`; reset `streak` to 0
2. Set `interval` to 0 (due immediately)
3. Reduce `ease` by 0.2 (minimum 1.3)
4. Demote `mastery` by 1 (minimum 0)

#### `pickCommands(pool, srs, count, wave)` — Wave Composition

Priority queue algorithm (fills the wave in this order):

1. **Overdue** (lastSeen + interval + 2 < currentWave) — sorted by lowest mastery first
2. **Due** (lastSeen + interval ≤ currentWave) — sorted by lowest mastery first
3. **Fresh/New** (never seen, max 3 per wave or 30% of wave size)
4. **Not-yet-due** (filler, lowest mastery first, for reinforcement)
5. **Any remaining** (fallback to fill)
6. **Shuffle** — Fisher-Yates to avoid predictable ordering

### 3.3 Game State — `G` Object

Single mutable state object. **Not reactive** — mutations are direct property assignments, and the UI is updated explicitly via function calls in the animation loop.

```javascript
const G = {
  screen: 'title',          // 'title' | 'game' | 'victory' | 'gameover'
  wave: 1,                  // Current wave number (1-12)
  score: 0,                 // Cumulative score
  lives: 5,                 // Remaining lives (BASE_LIVES = 5)
  streak: 0,                // Current consecutive correct
  maxStreak: 0,             // Session high streak
  srs: initSRS(),           // SRS state object (keyed by command id)
  enemies: [],              // Active enemy array [{id, cmd, t, spawned}]
  selectedId: null,          // ID of currently targeted enemy
  inputState: 'idle',       // 'idle' | 'await_prefix' | 'await_command'
  hintUsed: false,          // Whether hint was used on current target
  showHint: false,          // Whether hint is currently visible
  waveCommands: [],          // Commands for current wave (from pickCommands)
  spawnIdx: 0,              // Next index to spawn from waveCommands
  waveComplete: false,       // Whether all enemies cleared this wave
  totalCorrect: 0,          // Session-wide correct count
  totalWrong: 0,            // Session-wide wrong count
  combo: 1,                 // Combo multiplier (1.0 to 3.0, +0.25 per hit)
  unlockedTiers: ['core'],  // Currently available tiers
  nextEnemyId: 0,           // Auto-incrementing enemy ID
  attemptsOnCurrent: 0,     // Wrong guesses on currently selected enemy
  commandStartTime: 0       // Timestamp when current enemy was first targeted
};
```

**Enemy object structure:**
```javascript
{
  id: number,       // Unique ID
  cmd: object,      // Reference to COMMANDS entry
  t: number,        // Position along path (0.0 = spawn, 1.0 = server/breach)
  spawned: number   // Date.now() timestamp of spawn
}
```

### 3.4 Input Handler — Two-Stage State Machine

The input model implements tmux's "prefix then command key" pattern:

```
                    ┌──────────────┐
                    │     idle     │◄── enemy killed / no enemy
                    └──────┬───────┘
                           │ auto-select enemy
                    ┌──────▼───────┐
              ┌────►│ await_prefix │◄── miss resets here
              │     └──────┬───────┘
              │            │ Ctrl+b detected
              │     ┌──────▼───────┐
              │     │await_command  │
              │     └──┬───────┬───┘
              │        │       │
              │   correct    wrong
              │        │       │
              │   ┌────▼──┐   │
              │   │ idle  │   │
              │   └───────┘   │
              └───────────────┘
```

**Modifier key guard:** Bare Shift, Control, Alt, Meta, CapsLock, NumLock, ScrollLock keypresses are ignored via the `MODKEYS` Set. This is critical because pressing Shift+5 to produce `%` fires a Shift keydown first — without the guard, Shift would be treated as a wrong answer.

**Matching logic:** `e.key === enemy.cmd.key` — uses the KeyboardEvent `key` property which returns the CHARACTER produced (e.g., `%` for Shift+5 on US layout), not the physical key.

**Special controls:**
- `Tab` — cycle selected enemy (sorted by proximity to base)
- `Alt+H` — reveal hint (sets `hintUsed = true`, costs 30 points)

**Adaptation for other domains:**

For domains that don't use a prefix+key model, the input handler is the primary thing you rewrite:

- **Math facts (single keystroke answer):** Remove the prefix stage entirely. Go straight from `idle` → `await_answer` on enemy select, match `e.key` against expected digit.
- **Math facts (multi-digit):** Add a text input accumulator. Show typed digits in the input box. Submit on Enter. Compare accumulated string to expected answer.
- **Vocabulary/free-text:** Replace keyboard capture with a visible `<input>` field. Submit on Enter. Use fuzzy matching (Levenshtein distance) for partial credit.
- **Musical intervals:** Could use Web Audio to play an interval, then expect a keystroke answer (e.g., 'm3' for minor third).

### 3.5 Sound Engine — `SFX` Module

Self-contained IIFE (Immediately Invoked Function Expression) returning a public API. Uses Web Audio API exclusively — no external audio files.

**Internal primitives:**
- `tone(freq, duration, waveType, volume, delay, filterFreq)` — basic oscillator with optional lowpass filter
- `sweep(startFreq, endFreq, duration, waveType, volume, delay)` — frequency-sweeping oscillator
- `noiseBurst(duration, volume, delay, highCut, lowBoost)` — filtered white noise with parametric EQ boost
- `crunch(freq, duration, volume, delay)` — waveshaper-distorted sawtooth (distortion curve: arctan)
- `subBass(freq, duration, volume, delay)` — sine wave through lowpass at 150Hz

**Public SFX methods:**

| Method | Layers | When |
|--------|--------|------|
| `prefix()` | 2 tones (1100Hz, 1650Hz) | Ctrl+b accepted |
| `hit(intensity)` | subBass + noiseBurst + crunch + sweep + sparkle tones | Correct answer, intensity 0-1 scales particle count and volume |
| `miss()` | crunch + sweep + noiseBurst | Wrong answer |
| `breach()` | subBass + 2×noiseBurst + crunch + sweep + alarm tones | Enemy reaches server |
| `waveClear()` | subBass + 5-note arpeggio + detuned layer + sweep | All enemies cleared |
| `victory()` | subBass + 7-note arpeggio + detuned layer + sweep | All 12 waves beaten |
| `gameOver()` | subBass + 5 descending crunch+tone + noise + sweep | Lives reach 0 |
| `spawn()` | 2 tones + sweep | Enemy appears |
| `select()` | tone + noiseBurst | Target changed |
| `click()` | 2 tones | Button pressed |
| `combo()` | sweep + tone | Streak milestones (5, 10, 15) |

**Background Music (`startBGM` / `stopBGM`):**
Three-layer synthwave loop:
1. Sawtooth bass arpeggio (Am pentatonic: A1-A1-C2-D2-A1-A1-E2-D2) through LFO-modulated lowpass filter, 16th notes at ~120bpm
2. Triangle-wave pad chord (A3-C4-E4, detuned ±5 cents) through slowly sweeping lowpass
3. Looping white noise hi-hat through highpass at 7kHz, pulsed on 8th notes

BGM master gain is 0.06 (very low) so SFX cut through.

### 3.6 Three.js 3D Scene

**Renderer:** WebGL, no shadows, antialiasing on, pixelRatio capped at 2.

**Camera:** Perspective, 50° FOV, positioned at (0, 18, 14) looking at (0, 0, -1). Subtle sinusoidal drift: X ±0.3 over 5s, Y ±0.2 over 3.3s. This creates a Virus/Zarch-style elevated fixed-angle view over the terrain.

**Lighting:**
- Ambient light (dark amber, intensity 0.4)
- Directional light (bright amber, intensity 0.6, from upper-right)
- Point light at server position (hot amber, intensity 1.5, pulsing ±0.3)

**Scene objects:**

| Object | Geometry | Material | Notes |
|--------|----------|----------|-------|
| Terrain | PlaneGeometry 24×24, 24 segments | MeshPhong, flatShading | Vertex displacement: sin/cos height map |
| Wireframe overlay | Clone of terrain | MeshBasic wireframe, opacity 0.25 | +0.02 Y offset to avoid z-fighting |
| Path | CatmullRomCurve3, 8 control points | LineBasic, opacity 0.5 | 80 interpolated segments |
| Path dots | SphereGeometry 0.06, 4 segments | MeshBasic | 21 dots evenly spaced along curve |
| Server tower | 3 stacked BoxGeometry + CylinderGeometry | MeshPhong with emissive | Top box rotates, antenna blinks |
| Spawn marker | BoxGeometry 0.3 | MeshBasic, transparent | Pulses opacity, rotates |
| Enemies | BoxGeometry 0.45 | MeshPhong, cloned material per instance | Float via sin(time), rotate continuously |
| Particles | BoxGeometry 0.08 | MeshBasic per instance, transparent | Gravity, decay, scale-to-zero |
| Beams | Line from 2 points | LineBasic, transparent | Fade over 20 frames |

**Fog:** Exponential² at density 0.035, color matches background (AMB.black).

**Label projection:** Enemy labels are HTML divs, positioned by projecting the 3D mesh position to screen coordinates via `Vector3.project(camera)`. This avoids rendering text in WebGL while keeping labels crisp and clickable.

### 3.7 Game Loop and Timing

The animation loop runs via `requestAnimationFrame`. All game logic runs per-frame inside the `animate(time)` callback when `G.screen === 'game'`:

```
animate(time)
  ├── camera bob (sinusoidal)
  ├── server tower animations (light pulse, rotation, antenna blink)
  ├── spawn marker pulse
  │
  ├── [if game screen]
  │   ├── trySpawn(time)          — check spawn timer, add enemy
  │   ├── moveEnemies()           — advance enemy.t by speed
  │   ├── checkBreach()           — remove enemies at t≥1, deduct lives
  │   ├── checkWaveComplete()     — all spawned + none alive = wave clear
  │   ├── autoSelect()            — pick nearest enemy if none selected
  │   ├── updateEnemyMeshes()     — sync 3D positions + selection glow
  │   ├── updateLabels()          — project labels to screen
  │   ├── updateHUD()             — update score/lives/streak text
  │   ├── updateInput()           — render input panel (with re-render guard)
  │   └── updateQueue()           — render incoming enemy dots
  │
  ├── particle physics (position += velocity, gravity, decay, remove at life≤0)
  ├── beam fade (opacity decay, remove at life≤0)
  └── renderer.render(scene, camera)
```

**Timing constants:**

| Constant | Value | Effect |
|----------|-------|--------|
| `MOVE_SPEED_BASE` | 0.0018 | Path units per frame at wave 1 (~8.5s crossing at 60fps) |
| Wave speed increment | +0.00015 per wave | Wave 12 ≈ 4.6s crossing |
| `SPAWN_DELAY_BASE` | 4500ms | Time between spawns at wave 1 |
| Spawn delay minimum | 2500ms | Floor for late waves |
| Spawn delay reduction | −150ms per wave | Gradual increase in pressure |
| First spawn delay | 1500ms | Grace period at wave start |

**Re-render guard (`lastInputState`):** The `updateInput()` function tracks a state key string. If the key hasn't changed since last call, it skips innerHTML replacement. This prevents the NEXT WAVE button from being destroyed/recreated 60× per second (which would eat click events).

**`lastSpawnTime` reset:** Both `startGame()` and `nextWave()` reset `lastSpawnTime = 0` so that `trySpawn()` begins spawning immediately on the new wave instead of waiting for the old wave's timer to elapse.

---

## 4. Color System — Amber Phosphor Monochrome

```javascript
const AMB = {
  black:   0x0d0500,  // Background, deepest shadows
  darkest: 0x1a0800,  // Terrain fill, UI panel backgrounds
  dark:    0x2d1200,  // Wireframe grid, disabled text, borders
  mid:     0x5a2800,  // Path elements, secondary text, dim UI
  bright:  0xcc6600,  // Directional light, emissive base
  hot:     0xff8c00,  // Primary UI color, enemy default, buttons
  glow:    0xffaa22,  // Highlights, selection glow, particles
  white:   0xffcc66   // Brightest elements, selected enemy, fast-kill flash
};
```

All UI elements use only these amber values at various opacities. This creates a unified warm phosphor CRT aesthetic. When adapting to a new theme, replace this palette.

The mastery level colors are the ONE exception to the monochrome rule — they use a red→orange→yellow→blue→green gradient for at-a-glance skill assessment.

---

## 5. Scoring System

**Base score per kill:** 100 points

**Speed bonus:** `max(0, 50 − floor(responseTimeMs / 200))` — ranges from 50 (instant) to 0 (10+ seconds)

**Speed multiplier (compounds with combo):**
- Response < 1.5s: ×2.0
- Response < 3.0s: ×1.5
- Response < 5.0s: ×1.2
- Response ≥ 5.0s: ×1.0

**Combo multiplier:** Starts at 1.0, increases by 0.25 per consecutive correct answer, capped at 3.0. Resets to 1.0 on miss or breach.

**Hint penalty:** −30 points if hint was used on the current enemy.

**Final formula:** `floor((100 + speedBonus − hintPenalty) × comboMultiplier × speedMultiplier)`

**Visual feedback:** Fast kills (speedMult ≥ 1.5) show a ⚡ in the flash message. The explosion particle count scales with speed: `8 + floor(intensity × 20)` where intensity = min(1, speedMult/2). The SFX.hit() method also accepts intensity to scale the sound layers.

**Combo milestones:** SFX.combo() plays at streaks of 5, 10, 15.

---

## 6. Screen Flow

```
┌─────────┐   click DEPLOY   ┌─────────┐   all enemies     ┌──────────┐
│  TITLE  │ ────────────────► │  GAME   │ ──── cleared ───► │  WAVE    │
│ SCREEN  │                   │ SCREEN  │                    │ CLEARED  │
└─────────┘                   └────┬────┘                    └────┬─────┘
                                   │                              │
                              lives ≤ 0                    click NEXT WAVE
                                   │                              │
                              ┌────▼─────┐                   ┌────▼─────┐
                              │ GAME     │                    │  GAME    │
                              │ OVER     │                    │  wave+1  │
                              └────┬─────┘                    └──────────┘
                                   │                              │
                              click REDEPLOY              wave 12 cleared
                                   │                              │
                              ┌────▼─────┐                   ┌────▼─────┐
                              │  TITLE   │                    │ VICTORY  │
                              │  SCREEN  │                    │ SCREEN   │
                              └──────────┘                    └──────────┘
```

**End screens show:**
- Score, wave reached, accuracy percentage, max streak
- Mastery bar (colored segments proportional to commands at each level)
- Mastery legend with counts per level
- "Focus Next Session" section: weakest commands sorted by mastery then errors, showing average response time

---

## 7. Adaptation Guide — Swapping Knowledge Domains

### 7.1 Minimal swap (keyboard shortcut domain)

If your new domain also uses single-keystroke answers (e.g., Vim shortcuts, Emacs bindings, DAW hotkeys):

1. **Replace the `COMMANDS` array** with your new content. Keep the same object shape.
2. **Update tier unlock thresholds** in `genWave()` if your tier structure differs.
3. **Update the title screen text** in the HTML overlay.
4. **Optionally update the color palette** in the `AMB` object for a different mood.

Everything else (SRS, scoring, input handler, 3D scene, sound) works as-is.

### 7.2 Medium swap (multi-character answer domain)

For domains where the answer is a typed word or number (math facts, vocabulary):

1. Replace `COMMANDS` array.
2. **Replace the input handler** (the `window.addEventListener('keydown', ...)` block):
   - Remove the two-stage prefix model
   - Add a text accumulator: capture keystrokes into a buffer string
   - Display the buffer in the input panel
   - Submit on Enter, compare buffer to expected answer
   - For math: `parseInt(buffer) === expectedNumber`
   - For vocabulary: `buffer.toLowerCase().trim() === expected`
3. **Update `updateInput()`** to show a text input field or live-typed characters.
4. **Adjust time thresholds** in `srsHit()` — math facts may be faster/slower than hotkeys.
5. **Adjust mastery time thresholds** — `fastEnough` and `veryFast` may need different values.

### 7.3 Large swap (non-keyboard domain)

For domains using click-based, drag-based, or audio-based input:

1. Replace `COMMANDS` with your content model.
2. **Replace the entire input handler** with your interaction model.
3. **Replace `updateInput()`** with your custom UI.
4. The SRS engine, game loop, 3D scene, sound engine, and scoring system remain unchanged — they only care about receiving a "correct" or "wrong" signal with timing data.

### 7.4 Content model extension patterns

**Adding more metadata per item:**
```javascript
{
  id: 'pythagorean',
  action: 'a² + b² = ?²',       // Prompt
  key: 'c',                       // Answer (or answer field for your validator)
  tier: 'core',
  dom: 'geometry',                // Category
  hint: 'Think right triangles',
  // Extensions:
  explanation: 'Pythagorean theorem: in a right triangle...',
  image: null,                    // Future: could render an image
  difficulty: 2,                  // Numeric difficulty for finer-grained SRS
  tags: ['triangles', 'algebra'], // For filtering/search
}
```

**Adding persistent state (IndexedDB):**

The research document recommends IndexedDB for persistence (via Dexie.js or raw API). The SRS state object `G.srs` is designed to be serializable — it's a plain object keyed by command ID with numeric/string values. To persist:

```javascript
// Save after each wave
localStorage.setItem('td-srs', JSON.stringify(G.srs));

// Load on startup
const saved = localStorage.getItem('td-srs');
if (saved) G.srs = JSON.parse(saved);
```

For larger state, use IndexedDB per the research document's recommendations.

---

## 8. Known Limitations and Future Work

**Current limitations:**
- No persistence — SRS state resets on page reload
- No custom keymap import (research doc describes `list-keys` parsing)
- No copy-mode module (research doc recommends it as separate skill tree)
- Single path layout (no branching or multiple lanes)
- No accessibility mode (screen reader support, reduced motion)
- Labels are DOM-projected, which creates slight visual lag vs pure 3D text

**Planned enhancements (from research doc roadmap):**
- IndexedDB persistence with Dexie.js
- Keymap import via `list-keys` paste
- Copy-mode vi/emacs module (opt-in unlock)
- PWA offline support via service worker
- Stats dashboard with accuracy/speed heatmaps per command
- Competitive modes with leaderboards (requires backend)
- Internationalization via ECMAScript `Intl` API

---

## 9. File Manifest

| File | Purpose |
|------|---------|
| `tmux-tower-defense.html` | Complete self-contained application (HTML + CSS + JS) |
| `tmux-trainer-deepresearch.md` | Research basis: learning science, tmux inventory, architecture recommendations, landscape analysis, roadmap, and implementation sketches |
| `tmux-td-spec.md` | This specification document |

**External runtime dependency:** Three.js r128 loaded from cdnjs.cloudflare.com. The application will not render the 3D scene without network access to this CDN on first load (browser cache serves subsequent loads).

**No build step required.** The file runs by double-clicking in any modern browser. Chrome recommended for keyboard capture compatibility (Firefox reserves Ctrl+B for bookmarks bar).
