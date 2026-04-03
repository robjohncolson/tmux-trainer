# Spec: fBm Amber Fractal + Pitch Stability Fix

## Two bundled changes

### 1. Replace Julia shader with fBm fractal noise in amber tones

The Julia set fractal clashes with the game's amber palette and doesn't show perceivable complexity growth per health level. Replace with fractal Brownian motion (fBm) noise rendered in amber/gold tones:
- Number of octaves (1-5) = health level → dramatically visible complexity difference
- Pure amber palette — no rainbow, matches the game aesthetic
- Low opacity background texture, not a competing foreground shape

### 2. Fix pitch instability — remove `setProgress()` pad detuning

`setProgress()` shifts pad frequencies up by 50% as the wave progresses (`ch[i] * (1 + p * 0.5)`). This fights the auto-advancing chord progression and sounds like the key is changing on every kill. With the musical health system handling responsiveness through layer gating, `setProgress()` detuning is obsolete.

## Audit: all code paths that touch voice frequencies

| Path | What it does | Status |
|------|-------------|--------|
| `seq()` pad scheduling | Glides voices to current chord at bar start | CORRECT — uses `ch[i]` from `currentProgIdx` |
| `seq()` bass scheduling | Sets bass to `root * r` per step | CORRECT |
| `seq()` auto-advance | Increments `currentProgIdx` at bar end | CORRECT |
| `setKey(wave)` | Changes `currentWaveIdx` + resets `currentProgIdx` to 0 + glides voices | CORRECT — wave transitions |
| `syncCurrentVoicing()` | Glides voices to current chord | CORRECT — used by preview/editor |
| **`setProgress(frac)`** | Detunes pads: `ch[i] * (1 + p * 0.5)` + boosts padBus volume | **BUG — causes perceived key changes** |
| `musicalHit()` | Plays kill melody on current chord | CORRECT — melody SFX, no voice change |
| Caller: `animate()` loop (line 4964) | Calls `SFX.setProgress()` every frame | **Remove this call** |

### Fix plan

1. **Delete `setProgress()` function body** — replace with no-op or remove entirely
2. **Remove the `SFX.setProgress()` call in `animate()`** (line 4964)
3. **Remove `setProgress` from the public API** — or keep as no-op for backward compat
4. **Keep `padBus.gain` control exclusively in `seq()`** via health gating (already implemented)

Note: `setProgress` also boosted `padBus.gain` based on progress. This is now handled by the health system in `seq()` (`padBus.gain.setTargetAtTime(h>=5?pv:0, ...)`), so removing it doesn't lose any needed behavior.

## fBm Shader Design

### Math

Fractal Brownian motion layers sine-based noise at increasing frequencies:

```glsl
float noise(vec2 p) {
  return sin(p.x * 1.7 + sin(p.y * 1.3)) * sin(p.y * 2.1 + sin(p.x * 1.9));
}

float fbm(vec2 p, int octaves) {
  float value = 0.0, amplitude = 0.5, frequency = 1.0;
  for(int i = 0; i < 6; i++) {
    if(i >= octaves) break;
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
```

### Uniforms

| Uniform | Source | Range |
|---------|--------|-------|
| `octaves` | `musicalHealth` (1-5, 0 = skip pass) | int 0-5 |
| `time` | `performance.now() / 1000` | continuous |
| `speed` | `1.0 + currentStreak * 0.1` | 1.0 – ~2.5 |
| `resolution` | canvas size | vec2 |

### Color mapping

All amber tones:
```glsl
// Map fBm value (-1 to 1) to amber palette
float v = fbm(uv + time * speed * 0.1, octaves) * 0.5 + 0.5;
vec3 dark = vec3(0.05, 0.02, 0.0);    // near-black amber
vec3 mid = vec3(0.3, 0.15, 0.02);     // dark amber
vec3 bright = vec3(1.0, 0.55, 0.0);   // #ff8c00 amber
vec3 col = mix(dark, mix(mid, bright, v), v);
col *= 0.3; // keep dim
```

### What students see

| Health | Octaves | Visual |
|--------|---------|--------|
| 0 | 0 | Black (pass skipped) |
| 1 | 1 | Soft slow amber undulation — like candlelight |
| 2 | 2 | Slightly more textured amber fog |
| 3 | 3 | Recognizable turbulence patterns, swirling |
| 4 | 4 | Detailed amber atmosphere |
| 5 | 5 | Rich intricate amber fractal noise — the background breathes |
| 5+streak | 5+fast | Turbulence flows faster, more alive |

## Blast Radius

| Area | Change |
|------|--------|
| Fractal shader | Replace Julia fragment shader with fBm amber shader |
| Fractal uniforms | Replace `c`/`maxIter`/`colorShift` with `octaves`/`speed` |
| `animate()` fractal update | Simpler uniform mapping (octaves = health, speed = streak) |
| `JULIA_PARAMS` | Delete (no longer needed — fBm has no per-wave params) |
| `setProgress()` | Delete function body (or entire function) |
| `animate()` game loop | Remove `SFX.setProgress()` call |
| SFX public API | Remove `setProgress` export |

### NOT touched
- Musical health system — works the same, just read by different shader
- Streak groove — unchanged
- Game logic, SRS — no overlap
- Music editor — no overlap
- `setKey()`, `syncCurrentVoicing()` — correct, stay as-is

## Testing

- [ ] Background shows amber noise, not rainbow Julia
- [ ] Health 1: soft amber glow. Health 5: detailed turbulence
- [ ] Streak speeds up the flow
- [ ] Health 0: pure black
- [ ] Pads stay in tune throughout the wave (no pitch drift on kills)
- [ ] Chord progression sounds stable — auto-advances every bar
- [ ] Layer gating still works (pads drop at health <5, bass at <4, etc.)
- [ ] Wave transitions still change key correctly (setKey)
- [ ] Music editor preview still works
- [ ] Parse check passes
