# Spec: FM Synthesis Audio Overhaul — Genesis/YM2612-Inspired Sound Engine

## Problem

The current SFX module uses basic Web Audio oscillators (triangle pads, sawtooth bass, noise hihat). It sounds like a ringtone. The game deserves a richer, more characterful audio identity inspired by FM synthesis (Yamaha YM2612 / Sega Genesis era).

## Solution

Replace the basic oscillator voices with FM synthesis techniques. No samples needed — all procedural, zero file downloads. Add kick and snare drum voices alongside the existing hihat.

## FM Synthesis Primer

FM = one oscillator (modulator) modulates the frequency of another (carrier). The result has rich harmonics controlled by:
- **Ratio** (modulator freq / carrier freq) — integer ratios = harmonic, non-integer = metallic/bell
- **Depth** (modulation amount) — more = brighter/harsher
- **Envelope** — how modulation depth changes over time

## Design

### New drum voices

Currently the drum bus has only hihat (filtered noise burst). Add kick and snare:

**FM Kick:**
- Carrier: sine at 55Hz
- Pitch envelope: start at 150Hz, exponential decay to 55Hz in ~60ms
- Amplitude: fast attack (2ms), sustain ~120ms, release ~80ms
- No modulator needed — the pitch sweep creates the "thump"

**FM Snare:**
- Carrier: sine at ~200Hz with short pitch sweep (200→120Hz in 30ms)
- Modulator: sine at ratio ~2.3 (inharmonic), depth decays quickly
- Plus: filtered noise burst (existing noise source, bandpass ~2000Hz)
- Amplitude: 5ms attack, ~100ms decay
- Mix: ~60% tone + ~40% noise

**FM Hihat (upgrade from noise-only):**
- Carrier: sine at ~400Hz
- Modulator: sine at ratio ~1.414 (√2, maximally inharmonic)
- High modulation depth = metallic sheen
- Closed: 25ms decay. Open: 150ms decay.
- Mix with existing noise at reduced level for texture

### FM Bass (upgrade from sawtooth)

Replace the single sawtooth oscillator with a 2-operator FM patch:
- Carrier: sine
- Modulator: sine at ratio 1 (same frequency), moderate depth
- Creates a warm, fat tone with controlled harmonics
- Depth envelope: slight decay gives an attack "pluck"

### FM Pads (upgrade from triangle chords)

Replace the 3 triangle oscillators with FM voices:
- Carrier: sine (3 voices for the chord)
- Modulator: sine at ratio 2 (octave), low depth
- Creates a softer bell/electric piano timbre
- Slow LFO on modulation depth for gentle shimmer (existing pad LFO can drive this)

### FM SFX

- **hit()**: FM bell tone — carrier at chord freq, modulator at ratio 3, quick decay. Brighter than current triangle.
- **miss()**: FM metallic dissonance — detuned carriers with high mod depth, harsh but short
- **breach()**: Low FM growl — carrier at chord root/2, ratio 7 modulator, moderate depth, ~500ms
- **waveClear()**: FM arpeggio — ascending chord tones with bell-like FM timbre
- **combo()**: Quick bright FM chirp ascending in pitch
- **select()**: Soft FM "tick" — very short, ratio 2, low depth
- **victory()**: Full FM chord arpeggio with longer sustain

### Music editor changes

#### New step sequencer rows

Current grid: 3 rows (pad, bass, hihat) × 8 steps.
New grid: 5 rows × 8 steps:

```
KICK    [x][ ][ ][ ][x][ ][ ][ ]
SNARE   [ ][ ][ ][ ][ ][ ][x][ ]
HIHAT   [x][ ][x][ ][x][ ][x][ ]
BASS    [x][ ][ ][x][ ][ ][x][ ]
PAD     [C][ ][ ][ ][Am][ ][ ][ ]
```

#### MUSIC_CONFIG extension

Add per-wave fields:
```javascript
{
  // Existing
  chords: [...], bass: [...], pad: [...], hihat: [...],
  tempo: 90, padVol: 0.05, bassVol: 0.60, hihatVol: 0.11,
  // New
  kick: [1,0,0,0,1,0,0,0],     // 8-step pattern (1=hit, 0=rest)
  snare: [0,0,0,0,0,0,1,0],    // 8-step pattern
  kickVol: 0.30,                 // volume ceiling
  snareVol: 0.25,                // volume ceiling
}
```

Backward compat: `sanitizeWaveConfig()` fills missing `kick`/`snare` fields with defaults.

#### Volume mix card

Add kick and snare sliders to the VOLUME MIX card (currently has pad/bass/hihat).

### Web Audio implementation

The current architecture has:
- 12 oscillator voices: 0-2 pad, 3 bass, 4-11 SFX
- Noise source for hihat
- 3 gain buses: padBus, bassBus, sfxBus

FM synthesis adds modulator oscillators. For each FM voice:
```javascript
// Create FM pair
const carrier = ctx.createOscillator();    carrier.type = 'sine';
const modulator = ctx.createOscillator();  modulator.type = 'sine';
const modGain = ctx.createGain();          modGain.gain.value = 0; // mod depth

modulator.connect(modGain);
modGain.connect(carrier.frequency);  // FM: mod → carrier.frequency
carrier.connect(outputGain);
```

New voice allocation:
- Voices 0-2: FM pad (carrier + modulator pairs, connected to padBus via padFilter)
- Voice 3: FM bass (carrier + modulator, connected to bassBus via bassFilter)
- Voice 4: FM kick (dedicated, connected to a new drumBus)
- Voice 5: FM snare tone (dedicated, connected to drumBus) + noise burst
- Voices 6-11: FM SFX pool (carrier + modulator pairs, connected to sfxBus)

New: `drumBus` gain node connected to masterGain.

### Scheduling changes in seq()

The `seq()` function currently schedules: bass notes, pad steps, hihat noise bursts.

Add: kick scheduling and snare scheduling per step:

```javascript
// Kick pattern
const kickPattern = cfg.kick || [1,0,0,0,1,0,0,0];
kickPattern.forEach((hit, i) => {
  if (!hit) return;
  const kt = startT + i * st;
  if (kt > now - .01) scheduleFmKick(kt);
});

// Snare pattern
const snarePattern = cfg.snare || [0,0,0,0,0,0,1,0];
snarePattern.forEach((hit, i) => {
  if (!hit) return;
  const snt = startT + i * st;
  if (snt > now - .01) scheduleFmSnare(snt);
});
```

## Blast Radius

### Touched
| Area | Change |
|------|--------|
| `SFX` module `init()` | Replace basic oscillators with FM pairs, add drumBus, add kick/snare voices |
| `SFX` module `seq()` | Add kick/snare scheduling |
| `SFX` module `schedulePadStep()` | Drive FM modulation depth envelope alongside amplitude |
| `SFX` module voice helpers | `playNote()` → `playFmNote()` with ratio + depth params |
| `SFX` module `hit/miss/breach/waveClear/combo/select/victory` | Rewrite with FM timbres |
| `DEFAULT_MUSIC_CONFIG` | Add `kick`, `snare`, `kickVol`, `snareVol` to all 12 waves |
| `sanitizeWaveConfig()` | Handle new fields with defaults |
| `MUSIC_CONFIG` load/save | Backward compat for configs without kick/snare |
| Music editor `renderMusicEditor()` | Add kick + snare rows to step sequencer, add volume sliders |
| Music editor step handlers | Add `cycleKickStep()`, `cycleSnareStep()` |

### NOT touched
- Game logic, SRS, BKT, scoring — no overlap
- Explainer panel, video player — no overlap
- Cloud sync, leaderboard — no overlap
- Three.js scene, particles — no overlap

## Implementation Plan

1. Extend `DEFAULT_MUSIC_CONFIG` with kick/snare patterns + volumes
2. Update `sanitizeWaveConfig()` for backward compat
3. Rewrite `init()` — FM voice pairs, drumBus, kick/snare oscillators
4. Add `scheduleFmKick()`, `scheduleFmSnare()`, update hihat to FM
5. Rewrite `schedulePadStep()` with FM modulation envelope
6. Update bass voice to FM
7. Rewrite SFX functions (hit, miss, breach, etc.) with FM timbres
8. Update `seq()` to schedule kick + snare patterns
9. Update music editor with kick/snare rows + volume sliders
10. Parse check

## Testing

- [ ] BGM plays with FM voices (pads sound like electric piano, bass has warmth)
- [ ] Kick drum sounds punchy on beat
- [ ] Snare has metallic crack + noise body
- [ ] Hihat sounds metallic (not just noise)
- [ ] SFX (hit, miss, breach, waveClear) sound richer than before
- [ ] Music editor shows 5 rows (kick, snare, hihat, bass, pad)
- [ ] Kick/snare volume sliders work
- [ ] Old saved music configs load without crash (missing kick/snare get defaults)
- [ ] Preview plays all 5 drum/instrument tracks
- [ ] Parse check passes

## Edge Cases

1. **Old music configs** — `sanitizeWaveConfig()` fills kick/snare with defaults. Zero breakage.
2. **Muted state** — All FM scheduling respects `muted` flag (existing guard).
3. **Mobile performance** — FM adds ~4 extra oscillators. Total is still under 20. Modern phones handle this fine.
4. **AudioContext resume** — `ensure()` already handles suspended context. FM voices start on same trigger.
