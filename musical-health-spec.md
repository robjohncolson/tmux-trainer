# Spec: Musical Health — Performance Drives Instrumentation, Not Harmony

## Problem

The current model ties chord progression to kills — `advanceChord()` fires on correct answer and queues a chord change. This means the "song" doesn't exist as a song. It's a reactive harmonic blob that only progresses when the student answers correctly. A student who's struggling hears the same chord droning forever.

Real music progresses on its own timeline. Dire Straits plays through its chord changes regardless of what the audience is doing. The student's performance should shape how *rich* the arrangement sounds, not *which chord* is playing.

## Solution

1. **Auto-advancing chord progression** — chords cycle automatically every bar in `seq()`, independent of gameplay
2. **Musical health meter** (0–5) — determines which instrument layers are audible
3. **Correct answers restore layers**, wrong answers strip them
4. **Streak groove stays** as the bonus tier above full health

## Design

### Musical Health (0–5)

New module-level state:
```javascript
let musicalHealth = 5; // starts full
```

Layer thresholds:

| Health | Layers active |
|--------|--------------|
| 0 | Silence — only SFX |
| 1 | Hihat only |
| 2 | + Snare |
| 3 | + Kick |
| 4 | + Bass |
| 5 | + Pads (full arrangement) |
| 5 + streak 3+ | + Groove embellishments (ghost hats, fills, etc.) |

### Health changes

| Event | Health change |
|-------|-------------|
| Correct answer | +1 (cap at 5) |
| Wrong answer | -1 (floor at 0) |
| Breach | -2 (floor at 0) |
| Wave start | Reset to 5 |

### Implementation in seq()

**Auto-advance chord every bar:**

At the top of `seq()`, always advance `currentProgIdx`:
```javascript
// Auto-advance chord every bar (the song plays itself)
currentProgIdx = (currentProgIdx + 1) % prog.length;
const ch = prog[currentProgIdx];
// Glide pads to new chord (if pads are active)
for(let i=0;i<3;i++){
  voices[i].carrier.frequency.setTargetAtTime(ch[i], startT, .15);
  voices[i].modulator.frequency.setTargetAtTime(ch[i]*2, startT, .15);
  voices[i].modGain.gain.setTargetAtTime(ch[i]*0.5, startT, .15);
}
```

**Layer gating based on health:**

Instead of hard muting, use gain targets so layers fade in/out smoothly:

```javascript
// In seq(), after scheduling patterns:
const h = musicalHealth;

// Pads: health >= 5
const padTarget = h >= 5 ? pv : 0;
padBus.gain.setTargetAtTime(padTarget, startT, .3);

// Bass: health >= 4
const bassTarget = h >= 4 ? bv : 0;
bassBus.gain.setTargetAtTime(bassTarget, startT, .3);

// Drums: health gates which patterns schedule
// Kick: health >= 3 (just skip scheduling, don't need gain gate)
// Snare: health >= 2
// Hihat: health >= 1
```

For drums, the simplest approach is to conditionally schedule:
```javascript
// Only schedule kick if health >= 3
if(h >= 3){
  kickPattern.forEach(...);
}

// Only schedule snare if health >= 2
if(h >= 2){
  snarePattern.forEach(...);
}

// Only schedule hihat if health >= 1
if(h >= 1){
  hhPattern.forEach(...);
}
```

### advanceChord() changes

`advanceChord()` is still called from `handleHit()` but it no longer queues or previews chord changes. Instead, it becomes a pure "health up + kill melody" function:

```javascript
function advanceChord(){
  if(!ctx||!bgmPlaying) return;
  musicalHealth = Math.min(5, musicalHealth + 1);
  // Kill melody: preview note from the current chord (not next — song handles progression)
  const prog = getWaveConfig(currentWaveIdx).chords;
  const ch = prog[currentProgIdx % prog.length];
  playFmNote(ch[2]*2, .4, 3, 1, .05);
  playFmNote(ch[0]*2, .3, 2, 0.8, .04, .12);
}
```

### New public API

```javascript
function setMusicalHealth(n){ musicalHealth = Math.max(0, Math.min(5, n|0)); }
```

Exposed in the return object. Called from:
- `handleHit()`: `SFX.setMusicalHealth(Math.min(5, currentHealth + 1))` — but since `advanceChord()` already does +1, no additional call needed
- `handleMiss()`: could call `SFX.setMusicalHealth(currentHealth - 1)` — OR we add a `musicalMiss()` function
- `checkBreach()`: `SFX.setMusicalHealth(currentHealth - 2)`

Simpler: just put the health logic inside `advanceChord()` (for hits) and add a `musicalMiss()`:

```javascript
function musicalMiss(){
  musicalHealth = Math.max(0, musicalHealth - 1);
}
function musicalBreach(){
  musicalHealth = Math.max(0, musicalHealth - 2);
}
```

### What gets removed

- `pendingChordAdvances` — deleted (no more chord queueing from kills)
- The chord-resolve-at-bar-start block in `seq()` — replaced by auto-advance
- Preview melody peeking ahead — kill melody just uses current chord

### What stays

- Streak groove embellishments (ghost hihats at 3+, snare fill at 5+, syncopated kicks at 8+, bass passing tones at 10+) — these are the bonus tier above health 5
- `setStreak()` — still drives groove
- `setProgress()` — still opens pad filter as wave progresses
- `setKey()` — still changes wave on wave transition
- Music editor — unchanged (it controls the pattern templates, health controls which are audible)

### Layer fade behavior

When a layer drops (health goes from 4 to 3, bass drops):
- Bass bus gain fades to 0 over ~300ms (`setTargetAtTime` with time constant .3)
- Sounds like the bassist stopped playing — not a hard cut

When a layer restores (health goes from 3 to 4, bass returns):
- Bass bus gain fades in over ~300ms
- Feels like the bassist came back in

This happens at the start of the next bar (since `seq()` checks health each bar). The smooth gain transition prevents clicks.

### Preview mode

During music editor preview, `musicalHealth` is ignored — all layers play at full. Preview already has its own `previewConfig` path.

## Blast Radius

| Area | Change |
|------|--------|
| `seq()` | Auto-advance chord every bar. Gate layers by health. Remove pending chord resolve block. |
| `advanceChord()` | Rewrite: health +1, kill melody on current chord. Remove chord queueing. |
| New: `musicalMiss()` | Health -1 |
| New: `musicalBreach()` | Health -2 |
| `startBGM()` | Reset `musicalHealth = 5` |
| `stopBGM()` | (no change needed — health persists across pause/resume) |
| `handleHit()` in game | Already calls `SFX.advanceChord()` — no change needed |
| `handleMiss()` in game | Add `SFX.musicalMiss()` call |
| `checkBreach()` in game | Add `SFX.musicalBreach()` call |
| Wave start | Reset health to 5 via `startBGM()` path |
| Public API | Add `musicalMiss`, `musicalBreach`, `setMusicalHealth` |
| Delete: `pendingChordAdvances` | Dead state variable |

### NOT touched
- `MUSIC_CONFIG`, music editor, step patterns — unchanged
- Streak groove — stays as bonus above health 5
- Game logic, SRS, explainer, video — no overlap
- Kill SFX (`hit()`) — unchanged

## Testing

- [ ] Chords auto-advance every bar regardless of kills
- [ ] Health starts at 5 — all layers audible
- [ ] Correct answer: health +1, kill melody plays, layer fades in if restoring
- [ ] Wrong answer: health -1, layer fades out smoothly
- [ ] Breach: health -2
- [ ] Health 0: silence (only SFX on kill/miss)
- [ ] Health 1: just hihat ticking
- [ ] Health 3: kick + snare + hihat (no bass, no pads)
- [ ] Health 5 + streak 3+: full arrangement + groove embellishments
- [ ] Wave start resets health to 5
- [ ] Music editor preview plays all layers regardless of health
- [ ] Parse check passes

## Edge Cases

1. **Health already at 5 on correct answer** — capped, no change. Kill melody still plays.
2. **Health already at 0 on miss** — floored, no change. Miss SFX still plays.
3. **Rapid kills restoring layers** — each +1 takes effect at next bar check. Multiple kills in one bar only restore one layer per bar (since `seq()` reads health once per bar). This is fine — the restoration feels gradual, not instant.
4. **Muted** — health still tracks internally. Unmuting at health 2 plays only hihat + snare.
5. **Wave transition** — `setKey()` + `startBGM()` resets health to 5. Fresh start for each wave.
