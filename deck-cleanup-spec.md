# Spec: Deck Cleanup — Only Two Decks, Deep Links Work

## Problem

1. **Vercel is stale**: 3 commits haven't been pushed yet. The live site still has old code where individual grade cartridges self-register as separate decks.
2. **Old kanji-g1-cartridge.js (v1) is still tracked**: The superseded v1 file is in git and still contains `TD_CARTRIDGES.push()`. While no `<script>` tag loads it currently, it's deployed as a static file and could be cached by stale service workers.
3. **Deep link skipping**: `#deck=joyo-kanji` should skip the selector and go straight to the title screen. The boot code (index.html ~line 5865) already does this — it matches the hash, finds the cartridge, calls `loadCartridge()` + `showTitleScreen('boot')`. But if extra cartridges inflate the registry, the selector may flash before the deep link resolves.
4. **Service worker cache stale**: Old SW versions may have cached removed cartridge files. The cache version bump (td-shell-v9) will force a full re-cache on next visit, but the old SW stays active until the page is closed and reopened.

## Fix Plan

### 1. Delete kanji-g1-cartridge.js (v1)

The old v1 file was replaced by `kanji-g1-cartridge-v2.js` months ago. It's still tracked in git but no longer loaded. Delete it:

```bash
git rm kanji-g1-cartridge.js
```

This prevents:
- Stale SW from finding and caching it
- Confusion about which G1 file is canonical
- Any tooling accidentally discovering and loading it

### 2. Verify only 2 cartridges register

After the push, `window.TD_CARTRIDGES` should contain exactly:
1. AP Stats (`ap-stats-formulas`) — from `ap-stats-cartridge.js`
2. Joyo Kanji (`joyo-kanji`) — from `kanji-joyo-cartridge.js`

**Audit all `TD_CARTRIDGES.push()` calls across all `.js` files:**
- `ap-stats-cartridge.js` → pushes `ap-stats-formulas` ✓
- `kanji-joyo-cartridge.js` → pushes `joyo-kanji` ���
- All grade files → export-only (no push) ✓
- `kana-cartridge.js` → export-only (no push) ✓
- `kanji-g1-cartridge.js` (v1) → DELETE this file

### 3. Deep link behavior (already correct)

The boot code at index.html ~line 5865 already handles deep links correctly:
```javascript
if (deepCart) {
  loadCartridge(deepCart);
  showTitleScreen('boot');
} else if (carts.length === 1) {
  loadCartridge(carts[0]);
  showTitleScreen('boot');
} else {
  showCartridgeSelector();
}
```

With exactly 2 registered cartridges:
- `#deck=joyo-kanji` → finds match → skips selector → title screen
- `#deck=ap-stats-formulas` → finds match → skips selector → title screen
- No hash → 2 cartridges → shows selector (correct)
- `#deck=kana` → rewritten to `#deck=joyo-kanji` by merger → works

### 4. Service worker forced refresh

The cache version is already bumped to `td-shell-v9`. On next visit:
- New SW installs with updated precache list
- `skipWaiting()` + `clients.claim()` activates immediately
- Old cache (`td-shell-v8` and earlier) deleted in `activate` handler
- Removed files (alg2, dummy, v1) won't be re-cached

### 5. Push to deploy

```bash
git push origin master
```

Vercel auto-deploys from GitHub. After push:
- Old cartridge files no longer served
- Only AP Stats + Joyo Kanji register
- Deep links work
- Service worker refreshes cache

## Verification (post-deploy)

1. Open `https://tmux-trainer.vercel.app/` — should show deck selector with exactly 2 cards
2. Open `https://tmux-trainer.vercel.app/#deck=joyo-kanji` — should skip selector, show title screen with domain pills: かな G1 G2 G3 G4 G5 G6
3. Open `https://tmux-trainer.vercel.app/#deck=kana` — should redirect to joyo-kanji with kana pre-selected
4. Open `https://tmux-trainer.vercel.app/#deck=ap-stats-formulas` — should skip selector, show AP Stats title
5. Open DevTools → Application → Service Workers — new SW should be active with `td-shell-v9`
6. `window.TD_CARTRIDGES.length` in console should be `2`
