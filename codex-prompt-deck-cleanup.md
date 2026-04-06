# Codex Prompt: Deck Cleanup ��� Delete Old Files, Verify 2-Deck State

## Context

You are working in the `tmux-trainer` project. Read the full spec in `deck-cleanup-spec.md`.

The project should have exactly 2 decks registered at runtime:
1. AP Statistics (81 commands)
2. Joyo Kanji including kana (1,234 commands)

An old superseded file `kanji-g1-cartridge.js` (v1) is still tracked in git and contains a `TD_CARTRIDGES.push()` call. While no `<script>` tag loads it, it needs to be deleted to prevent confusion and stale-cache issues.

## Task

### Step 1: Delete old v1 file

```bash
git rm kanji-g1-cartridge.js
```

This is the old Grade 1 cartridge that was replaced by `kanji-g1-cartridge-v2.js`. It still contains `TD_CARTRIDGES.push(KANJI_G1)` which could cause phantom deck registration if accidentally loaded.

### Step 2: Audit TD_CARTRIDGES.push calls

Search all `.js` files for `TD_CARTRIDGES.push` and verify ONLY these two remain:
- `ap-stats-cartridge.js` → pushes AP Stats cartridge ✓
- `kanji-joyo-cartridge.js` → pushes unified Joyo cartridge ✓

All other cartridge files should export data only (no push):
- `kana-cartridge.js` → `window.KANA_DATA = ...`
- `kanji-g1-cartridge-v2.js` → `window.KANJI_G1_DATA = ...`
- `kanji-g2-cartridge.js` → `window.KANJI_G2_DATA = ...`
- `kanji-g3-cartridge.js` → `window.KANJI_G3_DATA = ...`
- `kanji-g4-cartridge.js` → `window.KANJI_G4_DATA = ...`
- `kanji-g5-cartridge.js` → `window.KANJI_G5_DATA = ...`
- `kanji-g6-cartridge.js` → `window.KANJI_G6_DATA = ...`

If any file other than `ap-stats-cartridge.js` and `kanji-joyo-cartridge.js` still calls `TD_CARTRIDGES.push()`, fix it.

### Step 3: Verify sw.js precache list

Check `sw.js` `PRECACHE_URLS` array:
- Must NOT contain `kanji-g1-cartridge.js` (the deleted v1)
- Must NOT contain `alg2-dividing-polynomials-cartridge.js` (deleted)
- Must NOT contain `dummy-cartridge.js` (deleted)
- Should contain: `index.html`, `ap-stats-cartridge.js`, all grade v2 files, `kana-cartridge.js`, `kanji-joyo-cartridge.js`

### Step 4: Verify index.html script tags

Check the `<script>` tags in `index.html`:
- Must NOT have `kanji-g1-cartridge.js` (v1)
- Must NOT have `alg2-dividing-polynomials-cartridge.js`
- Must NOT have `dummy-cartridge.js`
- Should have (in this order):
  1. CDN scripts (Three.js, KaTeX, etc.)
  2. `ap-stats-cartridge.js`
  3. `kana-cartridge.js`
  4. `kanji-g1-cartridge-v2.js` through `kanji-g6-cartridge.js`
  5. `kanji-joyo-cartridge.js`
  6. Inline `<script>` (engine)

### Step 5: Verify boot flow

Read the boot code near the end of the inline `<script>` in `index.html` (around line 5865). Confirm:
1. It reads `window.TD_CARTRIDGES`
2. It checks for `#deck=` hash parameter
3. If hash matches a cartridge ID → `loadCartridge()` + `showTitleScreen('boot')` (skips selector)
4. If only 1 cartridge → auto-load (skips selector)
5. If 2+ cartridges and no hash → shows selector

With exactly 2 cartridges and `#deck=joyo-kanji` in the URL, the selector should never appear.

### Step 6: Console verification script

Create a quick test you can run in browser console after deploy:

```javascript
console.log('Registered decks:', window.TD_CARTRIDGES.length);
window.TD_CARTRIDGES.forEach(c => console.log(' -', c.id, ':', c.commands.length, 'commands'));
// Expected:
// Registered decks: 2
//  - ap-stats-formulas : 81 commands
//  - joyo-kanji : 1234 commands
```

## Important Constraints

- Only delete `kanji-g1-cartridge.js` — do NOT delete `kanji-g1-cartridge-v2.js`
- Do NOT modify any cartridge data or game logic
- Do NOT modify the boot flow unless it's broken
- This is a cleanup task, not a feature task
