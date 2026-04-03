# Spec: 3Blue1Brown-Style Manim Animations for AP Stats Formulas

## Problem Statement

The tmux-trainer AP Stats Formula Defense game teaches 66 formulas via SRS-driven quiz gameplay. The existing explainer panel provides 3-sentence text explanations per formula, but students lack the visual "aha" intuition that animated mathematical walkthroughs provide. 3Blue1Brown-style animations would show *why* each formula works, not just *what* it is.

## Solution Overview

Three coordinated deliverables:

1. **Video player integration** — extend the existing explainer panel in `index.html` to play short (10-20s) MP4 animations fetched from Supabase
2. **Batch generation pipeline** — manifest + scripts that use the Math-To-Manim six-agent pipeline to produce Manim scripts for all 66 formulas, enriched with AP Stats curriculum context from `school/curriculum_render/data/frameworks.js`
3. **Upload pipeline** — script to render Manim scripts to MP4 and upload to the existing Supabase `videos` bucket

## Design

### 1. Supabase Storage Layout

Reuse the existing `videos` bucket at `hgvnytaqmuybzbotosyj.supabase.co`.

```
videos/
  animations/
    ap-stats-formulas/        <-- new cartridge folder
      mean.mp4
      std-dev.mp4
      linreg.mp4
      ...66 files total
```

Public URL pattern:
```
https://hgvnytaqmuybzbotosyj.supabase.co/storage/v1/object/public/videos/animations/ap-stats-formulas/{commandId}.mp4
```

Convention: filename = command `id` field from the deck (e.g., `mean`, `std-dev`, `binom-pmf`). No manifest lookup needed — the mapping is deterministic.

### 2. Video Player in Explainer Panel

#### Constants

```javascript
const ANIMATION_BASE = 'https://hgvnytaqmuybzbotosyj.supabase.co/storage/v1/object/public/videos/animations/ap-stats-formulas';
```

#### State Extension

```javascript
// Add to EXPLAINER_STATE
EXPLAINER_STATE.animationId = null;       // command id for storage path lookup
EXPLAINER_STATE.videoUrl = null;          // direct public URL (not blob)
EXPLAINER_STATE.videoLoading = false;
EXPLAINER_STATE.videoError = false;
EXPLAINER_STATE.videoAvailability = 'unknown'; // 'unknown' | 'available' | 'unavailable'
EXPLAINER_STATE.videoAbort = null;        // AbortController for in-flight loads
EXPLAINER_STATE.videoNonce = 0;           // incremented per open, stale responses ignored
```

#### No Blob Cache — Direct URL Streaming

~~Original plan used blob fetch + in-memory cache.~~

**Revised (per Codex review):** Use direct public Supabase URLs in the `<video src>` attribute. Let the browser handle HTTP caching, range requests, and memory management. This is simpler, better for mobile (streaming vs full download), and avoids the blob-URL-revocation-poisons-cache bug.

No `animationCache` Map needed. No `URL.revokeObjectURL()` needed.

#### Availability Check

On first load, fetch a small manifest of which animations exist (avoids 404s per formula):

```javascript
// Option A: HEAD request per command (simple, 66 requests on first open)
// Option B: Static JSON manifest listing available IDs (1 request)
```

**Decision: Option B.** Generate `animation-manifest.json` alongside uploads. Fetch once on title screen load, cache in memory. Structure:

```json
{
  "version": 1,
  "animations": ["mean", "std-dev", "linreg", "zscore", ...]
}
```

Availability uses a **tri-state model** per Codex review:
- `unknown` — manifest not yet loaded or load failed. Show WATCH button that probes the direct URL on click.
- `available` — manifest confirms animation exists. Show WATCH button.
- `unavailable` — manifest loaded and ID not present. Hide WATCH button.

If manifest fetch fails entirely, all formulas start as `unknown` and degrade to try-on-click. Late manifest resolution updates any currently-open explainer panel.

#### Fetch Flow

```
User clicks WATCH →
  1. Increment videoNonce, create new AbortController
  2. Set videoLoading=true, clear lastInputState, call updateInput()
  3. If availability='unknown': HEAD request to check URL exists first
  4. Set videoUrl = ANIMATION_BASE + '/' + animationId + '.mp4'
  5. Render <video src={videoUrl} preload="metadata">
  6. On video 'loadeddata' event: set videoLoading=false, re-render
  7. On video 'error' event: set videoError=true, re-render
  8. On close/reset: abort controller, check nonce match, clear state
```

**Memoization fix (Codex HIGH #1):** Every video state change must clear `lastInputState=''` before calling `updateInput()` to force a re-render of the input panel.

#### UI Additions

**WATCH button**: Rendered in `renderExplanationControls()` when `EXPLAINER_STATE.videoAvailable` is true and the explainer is open.

```html
<button class="explain-watch" onclick="loadAnimation('{commandId}')">
  WATCH
</button>
```

After load, replaced by inline `<video>`:

```html
<div class="explain-video-wrap">
  <video class="explain-video" src="{blobUrl}" 
    autoplay playsinline muted loop
    onclick="this.muted=!this.muted"></video>
  <button class="explain-video-close" onclick="closeAnimationVideo()">CLOSE</button>
</div>
```

- `playsinline` + `muted` + `preload="metadata"` = autoplay works on iOS/mobile, streams instead of full download
- Click/tap video to toggle mute (students can hear narration if present)
- `loop` for rewatchability
- CLOSE button returns to text-only explainer
- On mobile: 3 text explanation lines are hidden while video plays to save space; entire explainer panel capped, not just video element

**Loading state**: Spinner text "Loading animation..." in place of video.

**Error state**: "Animation not available yet" in muted text. WATCH button hidden for `unavailable`, remains for `unknown` (retry on click).

#### CSS

```css
.explain-watch {
  font-family: inherit; font-size: 10px; font-weight: 700;
  color: #66ccff; background: transparent;
  border: 1px solid #2266aa; border-radius: 999px;
  padding: 4px 9px; cursor: pointer; margin-left: auto;
}
.explain-watch:hover { border-color: #66ccff; }

.explain-video-wrap {
  position: relative; margin-bottom: 8px;
  border-radius: 8px; overflow: hidden;
  background: #000;
}
.explain-video {
  width: 100%; display: block;
  border-radius: 8px;
}
.explain-video-close {
  position: absolute; top: 4px; right: 4px;
  font-family: inherit; font-size: 9px; font-weight: 700;
  color: #fff; background: #0008; border: none;
  border-radius: 999px; padding: 3px 8px; cursor: pointer;
}

/* Mobile */
@media (max-width:600px) {
  .explain-video-wrap { max-height: 40vh; }
  .explain-video { max-height: 40vh; object-fit: contain; }
}
```

#### Keyboard

- `Alt+W` — toggle animation video (load if not cached, close if playing)
- Reuses the existing `Alt+E` toggle for the explainer panel itself

#### Cleanup

- `resetExplanationState()` — abort any in-flight AbortController, clear video state fields, increment nonce
- No blob URL revocation needed (direct URLs, browser manages)
- Screen transitions — same cleanup path already calls `resetExplanationState()`
- Stale response guard: any async completion checks `videoNonce` against the nonce at call time; mismatches are silently dropped

### 3. Batch Generation Pipeline

#### Manifest: `scripts/animation-manifest.json`

Maps each of the 66 command IDs to the generation prompt context:

```json
[
  {
    "id": "mean",
    "name": "Sample Mean (x-bar)",
    "latex": "\\bar{x} = \\frac{\\sum x_i}{n}",
    "domain": "descriptive",
    "prompt": "Create a 15-second animation explaining the sample mean...",
    "curriculum_context": {
      "unit": 1,
      "learning_objectives": ["DAT-1.A"],
      "key_concepts": ["..."],
      "misconceptions": ["..."]
    }
  },
  ...
]
```

The `prompt` field is auto-generated from the formula data + curriculum context. It tells the Math-To-Manim pipeline:
- Target audience: AP Statistics students (high school)
- Duration: 10-20 seconds
- Style: clean, minimal, 3Blue1Brown-inspired
- Must show the formula building up step by step
- Must connect to the AP Stats exam context
- Output quality: 720p30 (balance of quality vs file size)

#### Generation Script: `scripts/generate-animations.py`

```python
# Pseudocode
for formula in manifest:
    orchestrator = ReverseKnowledgeTreeOrchestrator(
        max_tree_depth=2,  # shallow — these are focused explainers, not full courses
        enable_code_generation=True
    )
    result = orchestrator.process(
        user_input=formula["prompt"],
        output_dir=f"animations/output/{formula['id']}/"
    )
    # Save manim script
    # Render: manim render -qm {script}.py {SceneClass} -o {id}.mp4
```

**Codex parallelization**: The 66 formulas can be batched into 6-8 parallel Codex agents (one per domain), each generating ~8-11 Manim scripts. Independent — no cross-formula dependencies.

#### Upload Script: `scripts/upload-ap-stats-animations.mjs`

Adapted from lrsl-driller's `upload-animations.mjs`:
- Reads `.env` for Supabase credentials
- Scans `animations/output/` for rendered MP4s
- Uploads to `videos/animations/ap-stats-formulas/{id}.mp4`
- Generates `animation-availability.json` listing successfully uploaded IDs
- Uploads the availability manifest too

### 4. Availability Manifest Hosting

After upload, `animation-availability.json` is placed at:
```
videos/animations/ap-stats-formulas/manifest.json
```

Fetched once by the game on title screen load. Cached in `G._animationManifest`.

## Blast Radius

### Touched in `index.html`

| Area | Lines (approx) | Change |
|------|----------------|--------|
| CSS block | 52-57 | Add `.explain-watch`, `.explain-video-wrap`, `.explain-video`, `.explain-video-close` styles |
| Mobile CSS | 215-216 | Add video max-height constraint |
| `EXPLAINER_STATE` | ~1809 | Add `videoUrl`, `videoLoading`, `videoError`, `videoAvailable` fields |
| `resetExplanationState()` | ~1826 | Add blob URL revocation + video state reset |
| `openExplanationEntry()` | ~1838 | Check animation availability, set `videoAvailable` |
| `renderExplanationControls()` | ~1871 | Add WATCH button + video element + loading/error states |
| Keyboard handler | ~4290 | Add `Alt+W` binding |
| `showTitleScreen()` | ~3600s | Fetch animation manifest on load |

### NOT touched

- SRS logic, BKT, scoring, enemy movement, quiz resolution — zero interaction
- Music editor, pause menu, leaderboard — no overlap
- Cloud sync — no overlap
- Three.js scene, particles, reticle — no overlap

### New files

| File | Purpose |
|------|---------|
| `manim-animation-spec.md` | This spec |
| `scripts/animation-manifest.json` | 66-formula generation manifest with curriculum context |
| `scripts/generate-animations.py` | Batch Manim script generation via Math-To-Manim pipeline |
| `scripts/upload-ap-stats-animations.mjs` | Render + upload to Supabase |

## Implementation Plan

### Phase 1: Integration (this session — CC)

1. Add CSS for video player
2. Add `ANIMATION_BASE` constant and `animationCache` Map
3. Extend `EXPLAINER_STATE` with video fields
4. Add manifest fetch to `showTitleScreen()`
5. Update `openExplanationEntry()` to check availability
6. Update `renderExplanationControls()` with WATCH button + video element
7. Add `loadAnimation()`, `closeAnimationVideo()` functions
8. Update `resetExplanationState()` with cleanup
9. Add `Alt+W` keyboard binding
10. Parse check

### Phase 2: Generation Pipeline (this session — CC + Codex)

1. Build `scripts/animation-manifest.json` from deck + frameworks.js
2. Write `scripts/generate-animations.py` batch script
3. Write `scripts/upload-ap-stats-animations.mjs` upload script
4. Test with 1 formula end-to-end (generate → render → upload → play in game)

### Phase 3: Batch Generation (follow-up — Codex agents)

1. Dispatch 7 parallel Codex agents (one per domain)
2. Each generates Manim scripts for its domain's formulas
3. Render all to MP4
4. Upload batch to Supabase
5. Update availability manifest

## Testing Plan

### Parse check
```bash
node -e "const fs=require('fs'),html=fs.readFileSync('index.html','utf8');const m=html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);let ok=true;m.forEach((s,i)=>{const c=s.replace(/<\/?script[^>]*>/g,'');try{new Function(c)}catch(e){console.log('Block '+i+': '+e.message);ok=false}});console.log(ok?'PASS':'FAIL');"
```

### Manual verification (headless browser)

- [ ] Explainer panel opens normally (text-only) when no animation exists
- [ ] WATCH button appears when animation is available
- [ ] Clicking WATCH shows loading state then plays video
- [ ] Video autoplays muted, click toggles sound
- [ ] CLOSE button returns to text-only explainer
- [ ] Alt+W toggles video from keyboard
- [ ] Mobile: video constrained to 40vh, playsinline works
- [ ] Animation cache prevents re-fetch on second open
- [ ] Manifest fetch failure degrades gracefully (no WATCH buttons, no errors)
- [ ] resetExplanationState() cleans up blob URLs
- [ ] Screen transitions don't leak video elements

## Edge Cases

1. **No animations uploaded yet** — Manifest returns empty array or 404. No WATCH buttons rendered. Text explainer works normally. Zero regression.
2. **Partial uploads** — Only some IDs in manifest. WATCH only appears for available ones.
3. **Slow network** — Loading state visible. Cancel on panel close (abort controller).
4. **Manifest stale** — Video URL returns 404 despite being in manifest. Treat as videoError, hide button for that command.
5. **Mobile data concerns** — Videos are 10-20s at 720p30, roughly 1-3MB each. Loaded on demand, not preloaded. Acceptable for classroom wifi.
6. **Multiple rapid opens** — Cache prevents duplicate fetches. AbortController cancels in-flight on close.
7. **Blob URL leak** — No longer applicable (direct URLs, no blobs).

## Codex Review Findings (incorporated)

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | Input render memoization — video state changes won't re-render | Clear `lastInputState` before `updateInput()` on every video state change |
| 2 | HIGH | Blob URL cache vs revokeObjectURL conflict | Dropped blob fetching entirely — use direct public URLs with browser HTTP caching |
| 3 | MEDIUM | Manifest fallback unreachable when `videoAvailable=false` | Tri-state availability model: `unknown`/`available`/`unavailable` with probe-on-click |
| 4 | MEDIUM | No explicit `animationId` field in EXPLAINER_STATE | Added `EXPLAINER_STATE.animationId` set from `entry.id` |
| 5 | MEDIUM | AbortController + nonce not in actual design | Added AbortController + videoNonce to state, abort in resetExplanationState() |
| 6 | LOW | Blob fetch worse than streaming for mobile; 40vh only caps video | Direct URL + `preload="metadata"` + cap entire panel + hide text lines on mobile during video |
