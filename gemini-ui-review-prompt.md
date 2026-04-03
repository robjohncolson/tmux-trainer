# UI Polish Review — AP Stats Formula Defense

You are reviewing `index.html`, a single-file HTML/CSS/JS tower defense game that teaches AP Statistics formulas. It uses Three.js for the 3D scene, KaTeX for math rendering, and inline CSS/JS (~4800 lines total).

## What the game does

Students defend against enemies by answering formula questions. Each enemy carries an AP Stats formula. The game has:
- A **title screen** with tabbed menus (PLAY / RANKS / MORE)
- **In-game HUD** with score, lives, streak
- An **input panel** at the bottom where quiz questions appear
- An **explainer panel** that shows 3-sentence text explanations + optional WATCH button for Manim video animations
- A **pause screen** overlay
- A **music editor** overlay
- **Wave-clear panels** between waves
- Mobile responsive design (breakpoint at 600px)

## Two known issues to fix

### 1. Clunky video display in explainer panel
The explainer panel recently gained a WATCH button that plays 3Blue1Brown-style Manim animation videos (10-20s MP4s from Supabase). The current implementation works but feels clunky:
- The video just appears inside the explain panel with no transition
- The WATCH button, CLOSE button, title, and video are all crammed together
- On mobile, the text lines hide when video plays (`has-video` class) but the transition is abrupt
- The video close button (absolute positioned top-right) can overlap with content

Look at these CSS classes and the `renderExplanationControls()` function:
- `.explain-panel`, `.explain-panel-top`, `.explain-video-wrap`, `.explain-video`, `.explain-video-close`, `.explain-watch`
- Mobile override: `.explain-panel.has-video`

Suggest specific CSS and minor JS changes to make the video experience feel polished — smooth transitions, better spacing, clearer visual hierarchy.

### 2. QR code visible on pause screen
The QR code block (rendered on the title screen inside the MORE tab) is still visible when the pause overlay appears during gameplay. The pause overlay doesn't fully occlude it, or the QR element's z-index/display state isn't being managed on screen transitions.

Look at `showPauseScreen()` and how the QR code element is created/displayed. Suggest the minimal fix.

## What I want from you

1. **Identify both issues** in the actual code — give me the specific lines/selectors involved
2. **Propose fixes** as concrete CSS/JS changes (not vague suggestions)
3. **Scan for 3-5 additional UI polish opportunities** you notice while reviewing — things like:
   - Inconsistent spacing or typography
   - Mobile touch target sizes below 44px
   - Visual hierarchy issues
   - Animation/transition smoothness
   - Overlay stacking or z-index conflicts
   - Color contrast concerns
   - Any elements that feel unfinished or placeholder-ish

For each suggestion, give me:
- **What**: one-line description
- **Where**: CSS selector or JS function name
- **Fix**: the actual CSS/JS change

Keep fixes minimal and surgical — don't redesign the whole UI. The game ships to students this month.

## Context for the video player

The animation videos are served from:
```
https://hgvnytaqmuybzbotosyj.supabase.co/storage/v1/object/public/videos/animations/ap-stats-formulas/{commandId}.mp4
```

The availability manifest is fetched on title screen load. The WATCH button only appears when the explainer is open and an animation exists for that formula. Key state: `EXPLAINER_STATE.videoUrl`, `EXPLAINER_STATE.videoLoading`, `EXPLAINER_STATE.animationId`.

## Don't do these things

- Don't suggest splitting the file into modules (known tech debt, not this review)
- Don't suggest framework migrations
- Don't change game mechanics, SRS logic, or scoring
- Don't touch the music editor or cloud sync
- Don't add new features — only polish existing ones
