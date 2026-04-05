# Spec: High-Contrast Performance Fix + Music Editor Tabs

## Problem Statement

### High-Contrast Battery Drain
The current high-contrast mode applies `filter: invert(1) hue-rotate(180deg)` to the WebGL canvas every frame. The GPU must:
1. Render the full 3D scene
2. Read back the framebuffer
3. Apply per-pixel inversion + hue rotation
4. Composite to screen

At 60fps this is expensive on mobile, causing battery drain and potential frame drops. The fix: swap colors natively (CSS variables for HTML, material/light/shader swaps for Three.js) so the GPU draws the right colors directly.

### Music Editor Scroll Overload
The music editor shows all sections (chord picker, step sequencer, volume mix, tempo, actions) in one scrolling panel. On mobile, users must scroll extensively to reach Save/Reset. Tabifying into SEQ / MIX / SYS reduces cognitive load and scroll distance.

## Solution Design

### Feature 1: Native High-Contrast Theme

#### CSS Variables
Define a `:root` palette and override in `body.hi-contrast`:

```css
:root {
  --bg-deep: #0d0500;      /* primary background */
  --bg-card: #1a0800;       /* card/button background */
  --bg-input: #130700;      /* input/music card bg */
  --text-hot: #ff8c00;      /* primary accent */
  --text-bright: #cc6600;   /* secondary accent */
  --text-warm: #ffcc66;     /* light text */
  --text-label: #5a3800;    /* label text */
  --text-muted: #3d1f00;    /* muted text/borders */
  --text-desc: #996622;     /* description text */
  --border-soft: #ff8c0033; /* soft amber border */
  --border-med: #ff8c0055;  /* medium amber border */
  --success: #44ff88;       /* correct answer */
  --error: #ff4422;         /* wrong answer */
  --cyan-accent: #58C4DD;   /* explainer accent */
}

body.hi-contrast {
  --bg-deep: #f0f4f8;
  --bg-card: #e8ecf0;
  --bg-input: #dde2e8;
  --text-hot: #cc5500;
  --text-bright: #884400;
  --text-warm: #553300;
  --text-label: #555555;
  --text-muted: #888888;
  --text-desc: #666666;
  --border-soft: rgba(0,60,120,0.15);
  --border-med: rgba(0,60,120,0.25);
  --success: #008833;
  --error: #cc2200;
  --cyan-accent: #2266aa;
}
```

Replace hardcoded colors throughout the CSS with `var(--name)`.

#### AMB Palette Swap (Three.js)
Add `AMB_LIGHT` palette alongside `AMB`:

```javascript
const AMB_LIGHT = {
  black: 0xf0f4f8, darkest: 0xe0e4e8, dark: 0xaabbcc,
  mid: 0x667788, bright: 0x884400, hot: 0xcc5500,
  glow: 0xff7700, white: 0x553300,
  css: { black:'#f0f4f8', dark:'#aabbcc', mid:'#667788',
         bright:'#884400', hot:'#cc5500', glow:'#ff7700', white:'#553300' }
};
```

`toggleHighContrast()` function:
1. Toggle `body.hi-contrast` class
2. Swap AMB values (or use a reference like `AMB_ACTIVE`)
3. Update scene fog color
4. Update ambient/directional/point light colors
5. Update sky shader uniforms (add `darkColor`, `midColor`, `brightColor` uniforms)
6. Update terrain material, wireframe material
7. Update vignette: black edges → white edges (swap vec4 in shader or add uniform)
8. Persist to localStorage
9. Clear CSS filter cache (`lastCssFilter=''`)

#### Sky Shader: Parameterize Colors
Current: hardcoded `vec3(0.05,0.02,0.0)`, `vec3(0.35,0.18,0.02)`, `vec3(1.0,0.55,0.0)` in GLSL.
Change: add `uniform vec3 darkCol, midCol, brightCol;` and set from JS on toggle.

#### Vignette Shader: Add Color Uniform
Current: `gl_FragColor = vec4(0.0, 0.0, 0.0, vig)` (always black edges).
Change: add `uniform vec3 vigColor;` — dark mode = `(0,0,0)`, light mode = `(0.3,0.35,0.4)` (cool gray edges).

#### Remove filter: invert(1)
Delete the two CSS rules on line 10-11 (`body.hi-contrast ... filter:invert(1) hue-rotate(180deg)`).
Delete the `hiC?'invert(1) hue-rotate(180deg) ':''` prepend in animate() (line 6870).

#### Materials Not Swapped
Enemy materials (eMat, childMat, etc.) keep their current colors in both modes — they're already saturated enough to read against both dark and light backgrounds. The fog color change handles the main visual shift.

### Feature 2: Music Editor Tabs

Add `activeTab` to `MUSIC_EDITOR` state (default: `'seq'`).

Three tabs using existing `.menu-tab` CSS:
- **SEQ** — Step sequencer (drums + melody grid)
- **MIX** — Volume sliders + tempo
- **SYS** — Chord picker + actions (preview/save/reset)

Implementation: wrap existing HTML blocks in `renderMusicEditor()` inside `if(tab==='seq')` conditionals. Tab buttons re-call `renderMusicEditor()`.

Tab state resets to `'seq'` on editor open. Wave selector stays visible in all tabs (it's in the header).

## Implementation Plan

### Step 1: CSS Variables (CSS section only)
1. Add `:root { ... }` and `body.hi-contrast { ... }` variable blocks
2. Replace hardcoded colors with `var()` references throughout the CSS
3. Delete the old `filter: invert(1) hue-rotate(180deg)` rules

### Step 2: Sky + Vignette Shader Parameterization
1. Add color uniforms to sky shader
2. Add vigColor uniform to vignette shader
3. Set initial values from AMB

### Step 3: toggleHighContrast() Function
1. Create `AMB_LIGHT` palette
2. Write `applyThemeToScene(isLight)` that updates fog, lights, materials, shaders
3. Wire into existing toggle button
4. Remove the `hiC` filter prepend from animate()

### Step 4: Music Editor Tabs
1. Add `activeTab:'seq'` to MUSIC_EDITOR
2. Add tab buttons after wave selector
3. Wrap chord picker + actions in `tab==='sys'`
4. Wrap volume mix + tempo in `tab==='mix'`
5. Leave step sequencer in `tab==='seq'`

### Step 5: Verify
- Parse check
- Desktop: toggle hi-contrast, verify no filter on canvas, colors swap natively
- Mobile: verify no battery-draining filter, music editor tabs work

## Blast Radius

### High-Contrast
- CSS `<style>` section: ~40 rules get `var()` replacements
- JS `AMB` object: unchanged (dark mode default); new `AMB_LIGHT` added
- `toggleHighContrast()`: new function replaces inline onclick
- `animate()`: remove hiC filter prepend (~line 6870)
- Sky shader: add 3 uniforms (non-breaking, additive)
- Vignette shader: add 1 uniform (non-breaking, additive)
- `sw.js`: no changes needed
- Enemy materials: untouched
- SRS/BKT/DAG: untouched

### Music Editor Tabs
- `MUSIC_EDITOR` object: add `activeTab` field
- `renderMusicEditor()`: wrap existing blocks in conditionals
- No other functions affected

## Edge Cases

- Old localStorage `td-hi-contrast=1` still works (toggle on boot applies new native theme)
- Particles use additive blending — bright-on-light may wash out. Mitigate: fog handles most of it; particles are brief
- QR code uses hardcoded colors in `renderQR()` — needs light-mode swap
- Music editor tab state lost on re-render — acceptable (always re-renders from `MUSIC_EDITOR.activeTab`)

## Testing Plan

1. Parse check passes
2. Desktop dark mode: visually identical to current
3. Desktop light mode: readable, no CSS filter on canvas element
4. Mobile light mode: no `filter` property on canvas (verify via computed style)
5. Music editor: all 3 tabs render, wave selector persists across tabs
6. Music editor: save/preview/reset still functional from SYS tab
7. Toggle persists across page reload
8. Vignette renders correctly in both modes
9. Sky shader renders correctly in both modes
