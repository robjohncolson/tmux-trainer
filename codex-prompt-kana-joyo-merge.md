# Codex Prompt: Merge Kana into Unified Joyo Deck

## Context

You are working in the `tmux-trainer` project. Read the full spec in `kana-joyo-merge-spec.md`.

**Key reference files** (read before writing code):
- `kana-joyo-merge-spec.md` — the specification
- `kanji-joyo-cartridge.js` — the existing merger file you will modify
- `kana-cartridge.js` — the kana data file you will modify
- `index.html` — check script load order and domain filter rendering
- `sw.js` — service worker precache list

## Task: Merge kana cartridge into the unified Joyo deck

This is a small integration task — no new files, just modifications to existing ones.

### Part 1: Make kana-cartridge.js export-only

At the bottom of `kana-cartridge.js`, find:
```javascript
window.KANA_CARTRIDGE = KANA;
window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANA);
```

Replace with:
```javascript
window.KANA_DATA = KANA;
```

This stops the kana deck from appearing as a separate deck in the selector.

### Part 2: Modify kanji-joyo-cartridge.js

**2a. Add kana to source collection**

After `const sources = GRADE_SOURCES.map(...)...`, add kana:

```javascript
const kanaSource = window.KANA_DATA;
if (kanaSource) {
  // Remap kana domains (hiragana/katakana/yoon) to single 'kana' domain
  (kanaSource.commands || []).forEach(function(cmd) { cmd.dom = 'kana'; });
  sources.unshift(kanaSource);  // kana first in array
}
```

**2b. Add kana to legacy deep link map**

In `LEGACY_DECK_DOMAINS`, add:
```javascript
'kana': ['kana'],
```

**2c. Add kana SRS key to migration**

In `migratePerGradeSRS()`, add `'td-srs-kana'` to the `oldKeys` array.

**2d. Update cartridge metadata**

```javascript
name: 'Japanese Kana & Kanji',
description: 'Kana foundations + all 1,026 elementary school kanji (Grades 1-6)',
title: 'にほんご',
instructionsSub: 'Kana + Grades 1-6 — 1,234 cards — Select levels on the PLAY tab',
```

**2e. Ensure kana domLabels merge**

The existing `Object.assign` merge of `domLabels` from all sources will automatically pick up kana's labels. But since we remapped the domains to `kana`, update kana's domLabels:

In the merger, after the domain remap:
```javascript
if (kanaSource) {
  kanaSource.domLabels = { 'kana': ['Kana (ひらがな・カタカナ)'] };
}
```

This replaces the original 3-domain labels with a single 'kana' label.

### Part 3: Update index.html

**3a. Script load order**

Ensure kana loads before the merger. Current order should be:
```html
<script src="./kana-cartridge.js"></script>
<script src="./kanji-g1-cartridge-v2.js"></script>
...
<script src="./kanji-g6-cartridge.js"></script>
<script src="./kanji-joyo-cartridge.js"></script>
```

If kana is already before the merger, no change needed.

**3b. Domain filter rendering**

Check how domain pills are rendered on the PLAY tab. The existing code reads `activeCartridge.domLabels` to build filter buttons. With the new `kana` domain added, it should automatically render a 7th pill. Verify the pill label shows "Kana (ひらがな・カタカナ)".

If the domain filter UI hard-codes "G1"-"G6" labels or pill count, update to handle the dynamic kana domain. The pills should render in this order:
```
[ かな ] [ G1 ] [ G2 ] [ G3 ] [ G4 ] [ G5 ] [ G6 ]
```

Check `index.html` for any code near the domain filter that renders grade pills (search for `domLabels`, `domainFilter`, `G1`, `g1`). If the code just iterates `domLabels` keys, it should work automatically. If it hard-codes grade-specific logic, extend it.

### Part 4: Update sw.js

Bump the cache version (e.g., `td-shell-v8` → `td-shell-v9`). No new files to add to precache — `kana-cartridge.js` should already be in the list. If not, add it.

### Part 5: Validate

Run `node validate-cartridge.js kanji-joyo-cartridge.js`

Expected:
- 1,234 commands (208 kana + 1,026 kanji)
- ~2,547 blanks
- Domains: kana, g1, g2, g3, g4, g5, g6
- 24 passed, 0 failures

Also verify:
- `#deck=kana` redirects to `#deck=joyo-kanji` with kana domain pre-selected
- `#deck=joyo-kanji` still works (shows all domains)
- Old grade deep links still work

## Important Constraints

- Do NOT create new files — only modify existing ones
- Do NOT duplicate any kana data — the merger reads from `window.KANA_DATA`
- Do NOT change the unified cartridge ID (`joyo-kanji`) — SRS and cloud sync depend on it
- Kana command IDs (`kana-*`) don't collide with kanji IDs (`k-*`) — the merge is safe
- The kana `generateQuestion` function is compatible with the kanji version — no special handling needed
- Keep the domain remap (`hiragana`/`katakana`/`yoon` → `kana`) in the merger, not in the source file
