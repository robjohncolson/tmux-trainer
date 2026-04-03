# Spec: Contextual Color Blend — Explainer Panel Shifts to Manim Palette

## Problem

The game uses an amber/dark theme but Manim animations use a blue/white/gold palette. When students open the explainer or watch a video, the amber panel clashes with the cool-toned video content. No visual signal distinguishes "gameplay mode" from "learning mode."

## Solution

When the explainer panel is open, shift its colors from amber to the Manim-inspired cooler palette. This creates a visual "learning mode" signal. The rest of the game stays amber.

## Design

### Color mapping

| Element | Gameplay (amber) | Learning mode (cool) |
|---------|------------------|---------------------|
| `.explain-panel` border | `#ff8c0033` | `#58C4DD33` |
| `.explain-panel` background | `#ff8c000f` | `#58C4DD0f` |
| `.explain-title` color | `#ffcc66` | `#58C4DD` |
| `.explain-close` border | `#5a2800` | `#2266aa` |
| `.explain-close` color | `#996622` | `#58C4DD` |
| `.explain-close:hover` | `#ff8c00` | `#66ccff` |
| `.explain-line` color | `#d8943d` | `#99bbcc` |
| `.shortcut-badge` border | `#5a280044` | `#58C4DD33` |
| `.shortcut-badge` color | `#996622` | `#7799aa` |
| `.shortcut-badge:hover` | `#ff8c00` | `#58C4DD` |
| `.shortcut-badge kbd` color | `#ff8c00` | `#58C4DD` |
| `.shortcut-badge kbd` bg | `#ff8c0011` | `#58C4DD11` |
| `.shortcut-badge kbd` border | `#ff8c0033` | `#58C4DD33` |

### Implementation

All done in pure CSS — no JS changes needed. The `.explain-panel` already exists as a container. Add transition properties and override colors:

```css
.explain-panel { transition: background .3s, border-color .3s; }
.explain-panel .explain-title { transition: color .3s; color: #58C4DD; }
.explain-panel .explain-close { border-color: #2266aa; color: #58C4DD; }
/* etc */
```

Since `.explain-panel` is only rendered when `EXPLAINER_STATE.open` is true, the colors are always the "learning" colors. No toggle class needed — the panel itself IS the learning mode. Simply change the CSS definitions to use the cool palette.

The `.explain-watch` button already uses `#66ccff` / `#2266aa` — it's already in the cool palette. The rest of the panel just needs to match.

## Blast Radius

- CSS only — 6 selectors modified
- Zero JS changes
- Zero interaction with game logic, SFX, SRS

## Testing

- [ ] Explainer panel renders in cool blue tones
- [ ] Video wrapper fits the cool palette
- [ ] Shortcut badges match the panel colors
- [ ] Close button hover state is blue
- [ ] Smooth transition on open (from the fade-in animation)
