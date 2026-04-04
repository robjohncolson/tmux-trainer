# Bloom Post-Processing Spec — Health-Driven Visual Focus

## Problem Statement

The game scene renders with sharp, unfiltered edges. There's no visual "reward layer" beyond the fractal trees and fBm sky. A bloom/glow post-processing pass would:

1. Soften the scene into a warmer, more atmospheric look
2. Create a reactive visual signal tied to tree health (0-10)
3. Make high-health gameplay feel vivid and full-health feel triumphant
4. Make low-health gameplay feel hazy and unfocused — visual pressure to improve

## Solution Design

### Approach: Three.js EffectComposer + UnrealBloomPass

Use the non-module `examples/js/` postprocessing chain from Three.js r128, loaded via jsdelivr CDN. These files register on the global `THREE` object, matching the existing setup.

### CDN Dependencies (6 new scripts)

```
https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js
https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js
https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js
https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js
https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js
https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js
```

All verified available. Load order matters: shaders first, then EffectComposer, then ShaderPass (needed internally by EffectComposer for the final copy-to-screen blit), then RenderPass, then UnrealBloomPass.

### Health-to-Bloom Mapping

| Tree Depth | Bloom Strength | Bloom Radius | Bloom Threshold | Visual Feel |
|-----------|---------------|-------------|-----------------|-------------|
| 0 | 0.0 | 0.0 | 1.0 | No bloom — flat, dead |
| 1-2 | 0.15 | 0.2 | 0.85 | Faint warmth, barely there |
| 3-4 | 0.3 | 0.3 | 0.7 | Noticeable glow on bright elements |
| 5-6 | 0.5 | 0.4 | 0.6 | Healthy warm bloom |
| 7-8 | 0.7 | 0.5 | 0.5 | Rich glow, scene feels alive |
| 9-10 | 0.9 | 0.6 | 0.4 | Full vivid bloom, triumphant |

Parameters interpolate smoothly via `lerp()` each frame (same pattern as `treeDisplayDepth`).

### Render Pipeline Change

Current:
```
1. renderer.clear()
2. renderer.render(skyScene, skyCamera)   // fBm amber sky
3. renderer.clearDepth()
4. renderer.render(scene, camera)          // game scene
```

New (sky rendered into composer's FBO):
```
1. renderPass.clear = false                // don't wipe what we pre-rendered
2. renderer.setRenderTarget(composer.renderTarget1)
3. renderer.clear()                        // clear the FBO
4. renderer.render(skyScene, skyCamera)    // sky into FBO
5. renderer.clearDepth()                   // keep sky pixels, reset depth
6. renderer.setRenderTarget(null)          // release
7. composer.render()                       // RenderPass composites game on top of sky → bloom → screen
```

**Why not just `composer.render()` after the sky backbuffer pass?** EffectComposer renders into its own internal framebuffer (renderTarget1), not the screen backbuffer. RenderPass clears that FBO by default, wiping any sky pixels drawn to the backbuffer. By pre-rendering the sky directly into the composer's FBO and setting `renderPass.clear = false`, the game scene composites on top of the sky within the same FBO, and bloom processes the combined image.

Only the game scene elements (enemies, trees, particles, terrain) contribute new bloom — the sky is already a soft shader that won't exceed the luminance threshold. Net result:
- Trees glowing at high health = strong visual reward
- Enemy labels and reticles glowing = better focus cue
- Score particles glowing = more satisfying funnel effect
- Sky stays visually soft = bloom enhances foreground only

### EffectComposer Setup

```js
let composer = null, bloomPass = null;
if (typeof THREE.EffectComposer !== 'undefined') {
  const renderPass = new THREE.RenderPass(scene, camera);
  renderPass.clear = false;  // sky is pre-rendered into the FBO
  const isMobile = navigator.maxTouchPoints > 0;
  const bloomRes = isMobile
    ? new THREE.Vector2(window.innerWidth * 0.5, window.innerHeight * 0.5)
    : new THREE.Vector2(window.innerWidth, window.innerHeight);
  bloomPass = new THREE.UnrealBloomPass(
    bloomRes,
    0.5,   // strength (overridden per frame)
    0.4,   // radius (overridden per frame)
    0.6    // threshold (overridden per frame)
  );
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
}
```

CDN failure guard: if any bloom script fails to load, `composer` stays `null` and the animate loop falls back to direct `renderer.render(scene, camera)`.

### Per-Frame Update (in animate())

```js
// Smooth bloom parameters toward health targets
const t = G.treeDepth || 0;
const norm = Math.min(t, 10) / 10; // 0.0 to 1.0
const targetStrength = norm * 0.9;
const targetRadius = norm * 0.6;
const targetThreshold = 1.0 - norm * 0.6;

// Asymmetric lerp: faster fade-out (0.1) for visual urgency, slower fade-in (0.05) for reward
const lerpRate = (targetStrength < bloomPass.strength) ? 0.1 : 0.05;
bloomPass.strength += (targetStrength - bloomPass.strength) * lerpRate;
bloomPass.radius += (targetRadius - bloomPass.radius) * lerpRate;
bloomPass.threshold += (targetThreshold - bloomPass.threshold) * lerpRate;
```

### Resize Handling

```js
composer.setSize(w, h);
```
Added to `handleResize()` alongside `renderer.setSize()`.

### Mobile Performance

Mobile default: bloom at 0.5x resolution (set at init via `bloomRes` above). This is always-on for mobile, not an opt-in fallback. The `composer.setSize()` call accepts CSS pixel dimensions — EffectComposer reads `renderer.getPixelRatio()` internally, so never multiply by pixel ratio manually.

Resize handler for mobile bloom resolution:
```js
if (composer) {
  const isMobile = navigator.maxTouchPoints > 0;
  const scale = isMobile ? 0.5 : 1.0;
  bloomPass.resolution.set(w * scale, h * scale);
  composer.setSize(w, h);  // CSS pixels only
}
```

### Service Worker Update

Add the 6 new CDN URLs to `CDN_URLS` in `sw.js` for offline caching:

```js
const CDN_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
];
```

Bump cache version to `td-shell-v2` to force re-precache.

### crossorigin Attributes

All 5 new `<script>` tags need `crossorigin="anonymous"` (same as existing CDN tags) so the SW gets CORS responses.

## Blast Radius

| Area | Impact | Risk |
|------|--------|------|
| Render loop (`animate()`) | Replace `renderer.render(scene, camera)` with `composer.render()` | LOW — isolated change |
| Scene setup | Add composer, renderPass, bloomPass after renderer init | LOW — additive |
| Resize handler | Add `composer.setSize()` | LOW — additive |
| `sw.js` | Add 5 CDN URLs, bump cache version | LOW — additive |
| `index.html` `<head>` | Add 5 `<script>` tags | LOW — additive |
| Sky render pass | Unchanged — still uses `renderer.render(skyScene, skyCamera)` | NONE |
| DOM labels / HUD | Unchanged — bloom only affects WebGL canvas | NONE |
| Music / SFX | Unchanged | NONE |
| Mobile canvas targeting | Unchanged — raycasting uses `scene`/`camera` not composer | NONE |

## Edge Cases

1. **CDN failure**: If bloom scripts fail to load, `composer` stays `null`. Animate loop uses: `if (composer) { /* bloom path */ } else { renderer.render(scene, camera); }`.
2. **treeDepth undefined on title screen**: Already handled — `G.treeDepth || 0` defaults to 0, bloom strength = 0.
3. **Bloom during non-game screens**: The game canvas is hidden during title/pause/end. Bloom only runs inside the `animate()` game loop, so no wasted GPU cycles.
4. **autoClear + FBO interaction**: Resolved by pre-rendering sky into `composer.renderTarget1` and setting `renderPass.clear = false`. The composer never touches the backbuffer sky because there is no backbuffer sky — everything goes through the FBO.
5. **WebGL context lost**: Three.js handles this natively. EffectComposer render targets are recreated on context restore.

## Testing Plan

1. Parse check: inline JS parse after adding script tags
2. Desktop: confirm bloom visible at treeDepth 5+ (enemy cubes and trees should glow)
3. Desktop: confirm bloom absent at treeDepth 0 (flat scene)
4. Desktop: confirm sky pass still renders behind game scene
5. Mobile: confirm no performance regression at 375x812
6. Mobile: confirm bloom still renders (reduced if needed)
7. CDN failure: test with blocked script — verify fallback renders correctly
8. Resize: confirm bloom scales with window resize

## Implementation Plan

1. Add 6 `<script>` tags to `<head>` with `crossorigin="anonymous"` (after three.min.js, before katex): CopyShader, LuminosityHighPassShader, EffectComposer, ShaderPass, RenderPass, UnrealBloomPass
2. After renderer + scene init, create EffectComposer + passes with CDN-failure null guard and mobile 0.5x bloom resolution
3. In `animate()`, replace the sky+game dual-pass with: sky into composer FBO → `composer.render()`. Include null guard fallback to direct `renderer.render()`.
4. In `animate()`, add asymmetric bloom parameter lerp (0.1 decay, 0.05 growth)
5. In `handleResize()`, add `composer.setSize(w, h)` + mobile bloom resolution update
6. Update `sw.js`: add 6 CDN URLs, bump cache to `td-shell-v2`
7. Parse check
8. Browser verify (desktop + mobile)

## Review Findings (incorporated)

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| 1 | HIGH | Composer renders to internal FBO, sky on backbuffer would be overwritten | Pre-render sky into `composer.renderTarget1`, set `renderPass.clear = false` |
| 2 | MEDIUM | Missing `ShaderPass.js` — EffectComposer needs it for final copy-to-screen | Added 6th script tag |
| 3 | MEDIUM | Mobile bloom resolution fallback was opt-in | Default 0.5x on all mobile devices |
| 4 | MEDIUM | CDN failure guard incomplete — no animate-loop fallback | `if (composer) { ... } else { renderer.render() }` |
| 5 | LOW | `composer.setSize(w * pr, h * pr)` would double-count pixel ratio | Removed — use CSS pixels only |
| 6 | LOW | Bloom lerp 0.05 sluggish on rapid health loss | Asymmetric: 0.1 decay, 0.05 growth |
