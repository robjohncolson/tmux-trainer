# CSS Filter + Vignette Shader — Spec

## Problem
The game scene lacks visual depth/atmosphere. Bloom post-processing caused severe ghosting on moving objects. Need a health-reactive visual layer with zero temporal artifacts.

## Solution: Two layers, no blur

### Layer 1: CSS Filter (color warmth)
Apply `canvas.style.filter` driven by tree health:
- Health 0: `saturate(0.85) contrast(0.92)` — washed out, cold
- Health 10: `saturate(1.10) contrast(1.0)` — vivid, warm
- Smooth lerp each frame (same pattern as `treeDisplayDepth`)

No render targets, no ghosting. Browser composites after WebGL.

### Layer 2: Vignette Shader (cinematic edges)
Fullscreen quad rendered AFTER game scene (same pattern as skyScene):
- Orthographic camera, transparent material, `depthTest: false`
- Fragment shader: darken edges based on distance from center
- `intensity` uniform: high at low health (tunnel vision), low at high health
- `renderer.autoClear = false` — composites on top of everything
- Health 0: intensity 0.6 (heavy dark edges), Health 10: intensity 0.15 (subtle)

### Render pipeline (updated)
```
1. renderer.clear()
2. renderer.render(skyScene, skyCamera)     // fBm amber sky
3. renderer.clearDepth()
4. renderer.render(scene, camera)            // game scene
5. renderer.render(vignetteScene, vigCamera) // vignette overlay
6. renderer.autoClear = true
7. canvas.style.filter = computed value      // CSS color grading
```

### Health mapping
| Tree Depth | Saturation | Contrast | Vignette Intensity | Feel |
|-----------|-----------|---------|-------------------|------|
| 0 | 0.85 | 0.92 | 0.60 | Washed out, tunnel vision |
| 3 | 0.92 | 0.95 | 0.40 | Warming up |
| 5 | 0.97 | 0.97 | 0.30 | Neutral, comfortable |
| 7 | 1.02 | 0.98 | 0.22 | Vivid |
| 10 | 1.10 | 1.00 | 0.15 | Full warmth, wide open |

### Resize handling
- Vignette uses `resolution` uniform (same as sky shader)
- CSS filter is resolution-independent

### Mobile
- CSS filter: identical on mobile (free, GPU-composited)
- Vignette: identical shader, same cost as sky pass (~negligible)

### Blast radius
- `animate()`: add vignette render + CSS filter line
- Scene setup: add vignetteScene/vigCamera/vignetteMaterial
- `handleResize()`: update vignette resolution uniform
- No changes to game logic, enemies, SRS, DAG, or music

## Review Findings (all addressed)

| # | Severity | Source | Issue | Resolution |
|---|----------|--------|-------|------------|
| 1 | HIGH | Codex | autoClear ordering underspecified | Implementation uses explicit autoClear=false → clear → sky → clearDepth → game → vignette → autoClear=true |
| 2 | MEDIUM | Codex | CSS filter not free on mobile | Quantized to 2dp, cached string comparison avoids unnecessary DOM writes |
| 3 | MEDIUM | Codex | depthWrite missing, CSS remaps vignette | depthWrite:false set; CSS contrast on black vignette effect is negligible |
| 4 | MEDIUM | CC | Alpha blending only correct for black vignette | Documented; premultiplied alpha works by accident for vec4(0,0,0,a) |
| 5 | LOW | CC | depthWrite not in spec | Added to implementation |
| 6 | LOW | CC | autoClear toggled per-frame unnecessarily | Kept for clarity matching existing codebase pattern |

## Deferred upgrades (not this pass)
- **Color grading shader (#1)**: replace CSS filter with a render-to-texture + tone map shader for finer control
- **Selective static blur (#5)**: render trees/terrain to separate FBO with single Gaussian pass, composite sharp enemies on top
