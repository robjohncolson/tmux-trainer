# Spec: Inline Shortcut Badges in Question Pane

## Problem

Keyboard shortcuts Alt+E (explain) and Alt+W (watch animation) are buried in faded `.input-help` text at `opacity:0.5` that's hidden by default on mobile. Students don't discover these powerful learning tools.

## Solution

Replace the faded help line with prominent inline shortcut badges rendered as styled pills directly in the question pane body, always visible during gameplay.

### Design

Render a row of shortcut badges below the answer buttons, above the explainer panel:

```html
<div class="shortcut-row">
  <button class="shortcut-badge" onclick="..."><kbd>Alt+E</kbd> explain</button>
  <button class="shortcut-badge" onclick="..."><kbd>Alt+W</kbd> watch</button>
</div>
```

- **Clickable** — badges work as buttons too (click = same as pressing the shortcut)
- **Always visible** — no opacity fade, no display:none
- **Styled as pills** — match existing UI: small, bordered, amber theme
- **Desktop + mobile** — on mobile, badges are the primary way to access these features (no keyboard)
- **Contextual** — WATCH badge only shows when animation available for current command
- **Replace** the old `.input-help` lines entirely (remove all 5 instances)

### CSS

```css
.shortcut-row { display:flex; gap:6px; margin-top:8px; flex-wrap:wrap; }
.shortcut-badge {
  font-family:inherit; font-size:10px; color:#996622; background:transparent;
  border:1px solid #5a280044; border-radius:6px; padding:4px 10px;
  cursor:pointer; transition:all .15s; display:inline-flex; align-items:center; gap:4px;
}
.shortcut-badge:hover { border-color:#ff8c00; color:#ff8c00; }
.shortcut-badge:active { transform:scale(.96); }
.shortcut-badge kbd {
  font-family:inherit; font-size:9px; font-weight:700; color:#ff8c00;
  background:#ff8c0011; border:1px solid #ff8c0033; border-radius:3px;
  padding:1px 5px;
}
```

### Blast radius

- Replace 5 `.input-help` div insertions in `updateInput()` with `renderShortcutBadges()` calls
- Remove `.input-help` CSS (dead after this change)
- Remove mobile `.input-help{display:none}` override
- `renderExplanationControls()` unchanged
- No state changes
