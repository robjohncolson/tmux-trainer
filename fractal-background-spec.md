# Spec: Julia Set Fractal Background — Visual Health Indicator

## Problem

The game background is a flat dark color. No visual feedback reflects the student's performance. The musical health system (0-5) drives instrument layers, but there's no visual parallel.

## Solution

A fullscreen Julia set fractal rendered as a WebGL shader behind the Three.js scene. The fractal's complexity, color, and animation respond to `musicalHealth` and `currentStreak`, creating a visual "performance aura."

## Design

### Architecture

Use Three.js `ShaderMaterial` on a fullscreen `PlaneGeometry` added to the scene with `renderOrder=-1` and `depthWrite:false`. Position it far from the camera so all game objects render in front.

Alternatively, since we already have the WebGL context, render the fractal as a separate pass before `renderer.render(scene, camera)` using a dedicated orthographic scene + camera for the fullscreen quad. This avoids depth/fog interaction issues.

**Decision: separate pass.** A dedicated `fractalScene` with an `OrthographicCamera` rendered first, then the game scene rendered on top with `renderer.autoClear = false`.

### Julia Set Shader

Fragment shader computes the Julia set per pixel:

```glsl
uniform vec2 c;          // Julia parameter — different per wave
uniform float iterations; // detail level — driven by musicalHealth
uniform float colorShift; // hue rotation — driven by streak
uniform float time;       // gentle animation pulse
uniform vec2 resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - resolution * 0.5) / min(resolution.x, resolution.y) * 3.0;
  vec2 z = uv;
  float n = 0.0;
  for(float i = 0.0; i < 100.0; i++) {
    if(i >= iterations) break;
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
    if(dot(z,z) > 4.0) break;
    n = i;
  }
  float t = n / iterations;
  // Color: smooth HSL-style mapping
  vec3 col = 0.5 + 0.5 * cos(6.2831 * (t * 0.8 + colorShift + vec3(0.0, 0.33, 0.67)));
  // Fade to black for points inside the set
  if(n >= iterations - 1.0) col = vec3(0.0);
  // Dim overall based on health (low health = very dark)
  col *= smoothstep(0.0, 3.0, iterations / 20.0);
  // Subtle pulse
  col *= 0.85 + 0.15 * sin(time * 0.5);
  gl_FragColor = vec4(col * 0.35, 1.0); // keep dim so game elements read clearly
}
```

### Uniform mapping

| Uniform | Source | Range |
|---------|--------|-------|
| `c` | Per-wave Julia parameter from a preset table | `vec2(-0.7, 0.27015)` etc. |
| `iterations` | `musicalHealth * 16` | 0 → 0 (black), 5 → 80 |
| `colorShift` | `currentStreak * 0.05` | 0.0 – ~1.0+ |
| `time` | `performance.now() / 1000` | continuous |
| `resolution` | `vec2(canvas.width, canvas.height)` | viewport |

### Julia c-parameters per wave

12 visually distinct Julia set shapes:

```javascript
const JULIA_PARAMS = [
  [-0.7, 0.27015],   // W1: classic dendrite
  [-0.8, 0.156],     // W2: spiral arms
  [-0.4, 0.6],       // W3: rabbit
  [0.285, 0.01],     // W4: sea horse valley
  [-0.70176, -0.3842],// W5: branching
  [-0.835, -0.2321], // W6: Douady rabbit
  [0.355, 0.355],    // W7: geometric
  [-0.54, 0.54],     // W8: pinwheel
  [0.37, 0.1],       // W9: spiral
  [-0.123, 0.745],   // W10: Douady cauliflower
  [-0.75, 0.0],      // W11: basilica
  [-0.1, 0.651],     // W12: dendrite variant
];
```

Wave transitions smoothly interpolate `c` between values.

### Integration with animate()

In the main `animate()` loop, before `renderer.render(scene, camera)`:

```javascript
// Update fractal uniforms
fractalMaterial.uniforms.iterations.value = musicalHealth * 16;
fractalMaterial.uniforms.colorShift.value = currentStreak * 0.05;
fractalMaterial.uniforms.time.value = time * 0.001;
fractalMaterial.uniforms.c.value.set(
  JULIA_PARAMS[currentWaveIdx][0],
  JULIA_PARAMS[currentWaveIdx][1]
);

// Render fractal background first
renderer.autoClear = true;
renderer.render(fractalScene, fractalCamera);
// Then render game scene on top (don't clear)
renderer.autoClear = false;
renderer.render(scene, camera);
renderer.autoClear = true;
```

### SFX module integration

The `musicalHealth` and `currentStreak` values are inside the SFX IIFE. Need to expose read-only access:

```javascript
// Add to SFX public API:
getMusicalHealth(){ return musicalHealth; },
getStreak(){ return currentStreak; },
```

The `animate()` loop reads these each frame:
```javascript
const mh = SFX.getMusicalHealth();
const st = SFX.getStreak();
```

### Performance

- At health 0: 0 iterations → shader outputs black immediately → nearly free
- At health 1-2: 16-32 iterations → negligible GPU cost
- At health 5: 80 iterations → modest cost, well within mobile GPU budget
- The shader is a single fullscreen pass, no geometry, no textures
- On devices where this causes frame drops: detect via frame timing, reduce max iterations or disable

### Mobile

- Use `renderer.getPixelRatio()` to get actual pixel count
- On mobile, could halve the fractal resolution by rendering to a smaller offscreen target
- Or just cap iterations lower on mobile (detected via `isCompactMobileViewport()`)

### Fog interaction

The main scene has `FogExp2`. Since the fractal renders in a separate pass before the scene, fog only affects game objects, not the fractal. The fractal is the "sky" behind the fog. This actually looks great — enemies fade into the fractal through fog.

### Screen transitions

When not in gameplay (`G.screen !== 'game'`), the fractal renders at a fixed low-iteration idle state with slow color drift. This gives the title screen and menus a subtle living background.

## Blast Radius

| Area | Change |
|------|--------|
| Three.js setup | Add fractalScene, fractalCamera, fractalMaterial, fractalMesh |
| `animate()` | Add fractal uniform updates + dual-pass render |
| SFX public API | Add `getMusicalHealth()`, `getStreak()` |
| Resize handler | Update fractal `resolution` uniform |
| `renderer.setClearColor()` | Remove — fractal replaces the clear color |

### NOT touched
- Game logic, SRS, BKT, scoring — no overlap
- SFX audio engine — only adds 2 read-only getters
- Explainer, video, input panel — no overlap
- Music editor — no overlap
- MUSIC_CONFIG — no overlap

## Implementation Plan

1. Add `JULIA_PARAMS` constant array (12 entries)
2. Create fractal ShaderMaterial with vertex + fragment shaders
3. Create fractalScene, fractalCamera, fractalMesh
4. Add `getMusicalHealth()` and `getStreak()` to SFX public API
5. Update `animate()` with dual-pass rendering + uniform updates
6. Update resize handler for fractal resolution
7. Remove `renderer.setClearColor()` (fractal replaces it)
8. Parse check

## Testing

- [ ] Fractal visible as background during gameplay
- [ ] Health 0: near-black background
- [ ] Health 5: full vivid fractal
- [ ] Health changes cause fractal to grow/shrink detail
- [ ] Different waves show different fractal shapes
- [ ] Streak adds color cycling
- [ ] Game objects (cubes, labels, particles) render in front of fractal
- [ ] Fog still works (enemies fade toward fractal)
- [ ] Title screen shows subtle idle fractal
- [ ] Mobile: fractal doesn't cause frame drops
- [ ] Parse check passes

## Edge Cases

1. **WebGL1 devices** — Three.js r128 supports WebGL1. The shader uses only basic GLSL. Should work everywhere.
2. **Very slow GPU** — If frame time exceeds 32ms (30fps), could auto-reduce iterations. Not in v1.
3. **Resize** — `resolution` uniform updated in resize handler. Fractal scales correctly.
4. **Muted BGM** — Musical health still tracks. Fractal reflects performance even with sound off.
