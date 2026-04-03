# Spec: Quantized Chord Changes + Streak-Driven Groove

## Problem

When a student kills an enemy, `advanceChord()` immediately changes the pad/bass chord voicing at whatever random beat position the kill happens. Chord changes at beat 2.7 sound like musical mistakes. Real music changes chords on beat 1.

Additionally, the audio is static regardless of player performance — a student on a 10-kill streak hears the same rhythm as one who just started.

## Solution

Two changes to the `SFX` module:

### 1. Quantize chord changes to next bar start

Instead of instant chord changes, queue them. `seq()` picks up the queued change at the start of the next bar. The kill SFX still plays immediately — only the harmonic resolution is deferred.

### 2. Streak-driven rhythmic groove

The rhythm gets progressively more complex as the streak builds, rewarding flow state with richer audio. Miss resets to straight beats.

## Design

### Chord Quantization

New module-level state:
```javascript
let pendingChordAdvances = 0; // queued chord advances from kills
```

**`advanceChord()` becomes a queue operation:**
```javascript
function advanceChord(){
  if(!ctx||!bgmPlaying) return;
  pendingChordAdvances++;
  // Immediate: play preview melody note from the NEXT chord
  const prog = getWaveConfig(currentWaveIdx).chords;
  const peekIdx = (currentProgIdx + pendingChordAdvances) % prog.length;
  const peekCh = prog[peekIdx];
  playFmNote(peekCh[2]*2, .4, 3, 1, .05);        // 5th, bell
  playFmNote(peekCh[0]*2, .3, 2, 0.8, .04, .12);  // root, delayed
}
```

The melody SFX is immediate (instant kill satisfaction). The chord *resolves* on the next downbeat.

**`seq()` consumes the queue at bar start:**
```javascript
function seq(){
  if(!bgmPlaying) return;
  // Resolve any pending chord advances
  if(pendingChordAdvances > 0){
    // Advance by exactly 1 per bar (cap at 1)
    currentProgIdx = (currentProgIdx + 1) % prog.length;
    pendingChordAdvances = Math.max(0, pendingChordAdvances - 1);
    // Glide pad voices to new chord over first beat of bar
    const ch = prog[currentProgIdx];
    for(let i=0;i<3;i++){
      voices[i].carrier.frequency.setTargetAtTime(ch[i], startT, .15);
      voices[i].modulator.frequency.setTargetAtTime(ch[i]*2, startT, .15);
      voices[i].modGain.gain.setTargetAtTime(ch[i]*0.5, startT, .15);
    }
  }
  // ... rest of seq() scheduling
}
```

**One advance per bar** — multiple kills in one bar queue up and resolve across subsequent bars. No chord salad.

**Bass tracks the new chord automatically** — bass root is already derived from `ch[0]/4` at bar start.

### Streak-Driven Groove

New module-level state:
```javascript
let currentStreak = 0; // mirrors G.streak, set via public API
```

New public API method:
```javascript
function setStreak(streak){ currentStreak = streak; }
```

Called from `handleHit()` (after G.streak++) and `handleMiss()` (after G.streak=0).

**In `seq()`, add groove embellishments based on streak:**

```javascript
// After scheduling the base patterns...
const streak = currentStreak;

// Streak 3+: offbeat hihat ghost notes (quiet, between main beats)
if(streak >= 3){
  for(let i=0; i<8; i++){
    if(hhPattern[i]) continue; // skip beats that already have a hat
    const ght = startT + i*st + st*0.5; // halfway between beats
    if(ght > now-.01) scheduleFmHihat(ght, hhPeak * 0.3, true); // quiet ghost
  }
}

// Streak 5+: ghost snare on "and" of beat before downbeat
if(streak >= 5){
  const fillTime = startT + 7*st + st*0.5; // "and" of beat 8
  if(fillTime > now-.01) scheduleFmSnare(fillTime, snarePeak * 0.4);
}

// Streak 8+: syncopated kick on offbeats (add to existing pattern)
if(streak >= 8){
  [2,5].forEach(i => {
    if(kickPattern[i]) return; // don't double-hit
    const kt = startT + i*st + st*0.5;
    if(kt > now-.01) scheduleFmKick(kt, kickPeak * 0.5);
  });
}

// Streak 10+: bass passing tones between root notes
if(streak >= 10){
  bp.forEach((r,i) => {
    if(r === 0 || i >= bp.length-1) return;
    const nextR = bp[(i+1)%bp.length];
    if(nextR === 0) return;
    const passFreq = root * (r + nextR) / 2; // midpoint
    const passT = startT + i*st + st*0.75;
    if(passT > now-.01){
      voices[3].carrier.frequency.setValueAtTime(passFreq, Math.max(passT, now));
      voices[3].modulator.frequency.setValueAtTime(passFreq, Math.max(passT, now));
      voices[3].outputGain.gain.setValueAtTime(.3, Math.max(passT, now));
    }
  });
}
```

**Miss resets groove** — `setStreak(0)` from `handleMiss()`. Next bar renders with straight beats only.

### Summary of streak tiers

| Streak | Addition | Musical effect |
|--------|----------|---------------|
| 0-2 | None | Straight beats from config |
| 3-4 | Ghost hihats on offbeats | Light swing feel |
| 5-7 | + snare fill before downbeat | Anticipation before chord change |
| 8-9 | + syncopated kick offbeats | Driving groove |
| 10+ | + bass passing tones | Walking bassline feel |

## Blast Radius

| Area | Change |
|------|--------|
| `advanceChord()` | Queue instead of immediate chord change; preview melody stays instant |
| `seq()` | Consume chord queue at bar start; add streak groove embellishments |
| `startBGM()` | Reset `pendingChordAdvances` to 0 |
| `stopBGM()` | Reset `pendingChordAdvances` to 0 |
| Public API | Add `setStreak(n)` method |
| `handleHit()` in game code | Call `SFX.setStreak(G.streak)` after streak update |
| `handleMiss()` in game code | Call `SFX.setStreak(0)` after streak reset |

### NOT touched
- `MUSIC_CONFIG`, music editor, step patterns — unchanged (groove is additive overlay)
- Kill SFX (`hit()`) — unchanged, still plays immediately
- Pad filter, setProgress, setKey — unchanged
- Game logic, SRS, explainer, video — no overlap

## Implementation Plan

1. Add `pendingChordAdvances` and `currentStreak` state variables
2. Rewrite `advanceChord()` to queue + preview melody
3. Add chord resolution at bar start in `seq()`
4. Add streak groove embellishments in `seq()`
5. Add `setStreak()` public API method
6. Call `SFX.setStreak()` from `handleHit()` and `handleMiss()`
7. Reset `pendingChordAdvances` in `startBGM()` and `stopBGM()`
8. Parse check

## Testing

- [ ] Kill SFX plays immediately (melody preview note)
- [ ] Chord change resolves on next bar start, not instantly
- [ ] Multiple kills in one bar resolve one-per-bar across subsequent bars
- [ ] Streak 0-2: straight beats only
- [ ] Streak 3+: ghost hihats audible on offbeats
- [ ] Streak 5+: snare fill before downbeat
- [ ] Streak 8+: syncopated kicks
- [ ] Streak 10+: bass passing tones
- [ ] Miss resets to straight beats on next bar
- [ ] Parse check passes
- [ ] Music editor preview still works (no streak embellishments during preview)

## Edge Cases

1. **Multiple kills in one bar** — `pendingChordAdvances` accumulates. Resolved 1/bar. No chord salad.
2. **Kill while preview melody of last kill still ringing** — New preview note plays over the old one. SFX pool handles concurrent notes fine.
3. **Wave transition mid-bar** — `setKey()` changes the wave, `seq()` picks up the new wave config. Pending chord advances apply to the new wave's progression.
4. **Muted** — `advanceChord()` already guards on `muted`. Queued advances still accumulate so chord position stays correct if unmuted.
5. **Music editor preview** — Preview sets `previewConfig` which already has its own chord advance logic. `currentStreak` doesn't affect preview (it's a snapshot playback).
