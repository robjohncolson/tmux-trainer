# Spec: Student Melody Input

## Concept

When the fractal forest is sufficiently grown (treeDepth >= 7), students can compose a 1-bar monophonic melody using the keyboard as a piano. The melody loops every 4 bars, layered over the existing chord/groove/pad stack. The student literally grows the forest and writes its song.

## Keyboard Mapping

Two octaves across QWERTY and number rows, laid out like a piano:

### Lower octave (QWERTY row) — unlocks at treeDepth 7
```
Black: W  E     R  T     Y  U     I  O
       C# D#    F# G#    A# C#5   D#5 F#5
White: A  S  D  F  G  H  J  K  L  ;
       C4 D4 E4 F4 G4 A4 B4 C5 D5 E5
```

### Upper octave (123 row) — unlocks at treeDepth 9
```
Black: 2  3     5  6     8  9
       C# D#    F# G#    A# C#
White: Q  W  E  R  T  Y  U  I  O  P  (remapped in compose mode)
```

Wait — conflict. QWERTY serves double duty. Simpler approach:

### Piano layout (compose mode only — quiz keys disabled)
```
Sharps: W E   T Y U   O P
        C#D#  F#G#A#  C#D#
Whites: A S D F G H J K L ;
        C4D4E4F4G4A4B4C5D5E5
```

At treeDepth 7: white keys only (A-; = C4-E5, 10 notes = diatonic range)
At treeDepth 9+: sharps unlock (W,E,T,Y,U,O,P = black keys)

Number row is NOT used for piano — reserved for potential future features.

## Recording Flow

### Entry
1. `G.treeDepth >= 7` during gameplay
2. A small pulsing note icon appears in the input panel: `[compose]`
3. Student clicks it (or presses backtick `` ` `` as shortcut)
4. Quiz pauses — enemy movement freezes, timers stop
5. Input panel transforms into the composition interface

### Composition Interface
```
┌─────────────────────────────────┐
│  YOUR MELODY           ♩= 120  │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┐     │
│  │  │  │♩ │  │  │♩ │  │♩ │     │  ← beat grid (8 eighth-note slots)
│  └──┴──┴──┴──┴──┴──┴──┴──┘     │
│  [ASDFGHJKL;]  ← key hints     │
│                                 │
│  [ REDO ]  [ KEEP ]  [ BACK ]  │
│  Space = preview loop           │
└─────────────────────────────────┘
```

- **Grid**: 1 bar = 8 slots (eighth notes at current BPM). Slots can be notes OR rests (null).
- **Input**: Each key press adds the note to the next empty slot. Press `-` or `0` to insert a rest. Student does NOT need to fill all 8 — unfilled trailing slots are rests.
- **Visual**: Slots fill left-to-right. Notes show name (C4, D4, etc.), rests show `·`
- **Audio**: Each key press plays the note immediately (FM synth voice)
- **Backspace**: Removes last entry (note or rest)
- **Space**: Plays the current melody as a loop (so they can hear it)

### Confirmation
- **REDO**: Clears all 8 slots, start over
- **KEEP**: Saves melody, exits compose mode, resumes quiz
- **BACK**: Exits without changing (keeps previous melody if any)

### Persistence
- Saved to `localStorage` key `td-melody-{cartridgeId}`
- Format: array of MIDI note numbers, e.g. `[60, 64, 67, 72, 60, 64, 67, 72]`
- Also included in `buildRunStateSnapshot()` so page refresh preserves it
- Cloud sync deferred to v2 (local-only for now — avoids merge conflicts across devices)
- Student can re-enter compose mode any time treeDepth >= 7 to overwrite

## Playback Integration

### When it plays
- `G.treeDepth >= 7` AND melody exists in storage
- Melody layer activates alongside existing groove/chords/pad
- Uses a **dedicated FM synth voice** at voice index 14 (not shared SFX pool, avoids contention with hit/miss sounds)
- Routed through new `melodyBus` → `masterGain` (independent volume control)

### Musical integration
- Melody plays **every bar** (not once per 4 bars), transposed to the current chord root
- The 4-bar chord progression cycle means the melody repeats 4 times with different transpositions per cycle
- If melody was composed in C, and current chord is Am, shift all notes down 3 semitones
- Quantized to the existing 8-step rhythmic grid (matches `chord-quantize-groove`)
- Volume: slightly below pad, above groove — student's melody is prominent but not overpowering

### Silence when struggling
- If `G.treeDepth < 7`, melody layer mutes (forest isn't lush enough)
- If `G.treeDepth < 5`, melody data persists but is fully silent
- Creates a motivational loop: play well → hear your melody → feel ownership

## Depth-gated features

| treeDepth | Feature |
|-----------|---------|
| 0-6 | No compose option visible |
| 7 | Compose unlocks (white keys only, 10 notes: C4-E5) |
| 8 | Melody volume increases |
| 9+ | Sharp keys unlock (full chromatic) |
| 10 | Melody at full volume, compose button glows gold |

## Implementation Plan

### New state
```javascript
const MELODY_STATE = {
  composing: false,    // true when in compose mode (separate from G.paused!)
  notes: [],           // current recording buffer (0-8 entries: MIDI number or null for rest)
  savedMelody: null,   // persisted melody (array of 8 entries: MIDI number or null)
  previewLoop: null    // interval ID for preview playback
};
```

**Critical: `G.composing` vs `G.paused`**
- Do NOT use `G.paused` for compose mode — it kills `updateInput()` and the compose UI
- Add `G.composing` flag checked in the game loop: freeze `moveEnemies()`, `trySpawn()`, `checkBreach()` but keep `updateInput()` and render loop alive
- The compose UI renders via `updateInput()` which must stay active

### Keyboard routing
- Compose guard goes at the TOP of the keydown handler, BEFORE Escape/P/Space logic
- When `MELODY_STATE.composing`: route piano keys, Backspace, Space (preview), Enter (keep), Escape (back) to compose handlers. Suppress ALL other key handling.
- This prevents P from pausing, Space from dismissing feedback, A-D from answering quiz

### Key functions
- `enterComposeMode()` — set `G.composing=true`, clear compose buffer, bust input cache
- `exitComposeMode(save)` — set `G.composing=false`, optionally save melody, bust input cache
- `handleComposeKey(key)` — map key to MIDI note or rest, add to buffer, play sound
- `playMelodyNote(midiNote)` — FM synth one-shot via dedicated voice

### SFX integration
- `SFX.setMelody(midiNotes)` — data setter only, stores melody array
- `SFX.clearMelody()` — clears stored melody
- Melody playback scheduled **inside the existing bar sequencer** (same loop as bass/pad/drums), NOT via render-loop. This prevents timing drift.
- Dedicated FM voice at index 14, routed through new `melodyBus` → `masterGain`
- Melody oscillator: `OscillatorNode` with slight detune + `GainNode` envelope

### Blast radius

| Area | Change |
|------|--------|
| Input panel rendering | Add compose button when treeDepth >= 7 |
| Keyboard handler | **Top-level** compose guard before Escape/P/Space |
| `updateInput()` | Render compose UI when `G.composing` |
| Game loop | Check `G.composing` to freeze enemies but keep UI alive |
| SFX bar sequencer | Schedule melody notes alongside bass/pad/drums |
| SFX voice pool | Add voice 14 + `melodyBus` |
| `saveRunState`/`loadRunState` | Persist melody array |

## Testing

- [ ] Compose button appears only at treeDepth >= 7
- [ ] White keys play correct notes (C4-E5)
- [ ] Sharp keys locked until treeDepth >= 9
- [ ] Notes fill grid left-to-right, backspace removes last
- [ ] Space previews melody as loop
- [ ] KEEP saves, REDO clears, BACK exits without saving
- [ ] Melody plays during gameplay when treeDepth >= 7
- [ ] Melody transposes with chord changes
- [ ] Melody mutes when treeDepth drops below 7
- [ ] Melody persists across sessions (localStorage)
- [ ] Quiz is fully paused during compose mode
- [ ] Returning from compose mode resumes gameplay normally

## Edge Cases

- Student enters compose mode, enemy breaches while paused → enemy movement is frozen, no breach possible
- Student has melody from previous session, starts new game at treeDepth 3 → melody silent until depth 7
- Student records melody, then trees shrink below 7, then grow back → melody resumes
- No melody recorded yet, treeDepth >= 7 → compose button pulses to draw attention
- Student presses quiz answer keys during compose → routed to compose, not quiz
