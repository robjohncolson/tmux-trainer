# Spec: Merge Kana into Unified Joyo Deck

## Goal
Fold the 208-command kana cartridge into the existing unified Joyo deck so students get one deck covering kana → kanji G1-G6. Domain filters become:

```
[ かな ] [ G1 ] [ G2 ] [ G3 ] [ G4 ] [ G5 ] [ G6 ]
```

Students starting from zero enable only かな. As they advance, they add G1, G2, etc.

## Current State

- `kana-cartridge.js` — 208 commands, self-registers as `kana`, domains: hiragana/katakana/yoon
- `kanji-joyo-cartridge.js` — merger that reads G1-G6 data exports, registers as `joyo-kanji`, domains: g1-g6
- Grade files (G1-G6) — export data only via `window.KANJI_G{N}_DATA`

## Approach

### Step 1: Make kana-cartridge.js export-only

Same pattern as the grade files. Change the bottom of the IIFE from:
```javascript
window.KANA_CARTRIDGE = KANA;
window.TD_CARTRIDGES = window.TD_CARTRIDGES || [];
window.TD_CARTRIDGES.push(KANA);
```
To:
```javascript
window.KANA_DATA = KANA;
```

### Step 2: Modify kanji-joyo-cartridge.js to include kana

Add kana as a data source alongside the 6 grades:

```javascript
// After reading grade sources...
const kanaSource = window.KANA_DATA;
if (kanaSource) sources.unshift(kanaSource);  // kana first in the array
```

Key changes to the merger:
1. **Commands**: kana commands concatenated with kanji commands (kana first so they appear at the start)
2. **Banks**: kana variableBank, applicationBank, explanationGlossary merged in
3. **DAG**: kana sharedPrereqNodes merged, kana wireL1toL2 called in the composed function
4. **domLabels**: add kana's 3 domains (hiragana, katakana, yoon)
5. **generateQuestion**: kana's version is compatible (same 4-type weight system) — use whichever source loads first
6. **validateBlank**: kana uses the same normalization pattern

### Step 3: Remap kana domains

The kana cartridge currently uses 3 domains: `hiragana`, `katakana`, `yoon`. These should be consolidated into a single domain `kana` so the filter pill is one toggle:

Option A: Change all kana command `dom` fields to `kana` in the merger (lose sub-filtering)
Option B: Keep 3 sub-domains but render them as a single pill group

**Recommended: Option A** — change `dom` to `kana` in the merger. Sub-filtering within kana (hiragana vs katakana) can be added later if needed. This keeps the domain filter clean:

```
[ かな ] [ G1 ] [ G2 ] [ G3 ] [ G4 ] [ G5 ] [ G6 ]
```

In the merger, after pulling kana commands:
```javascript
if (kanaSource) {
  kanaSource.commands.forEach(cmd => { cmd.dom = 'kana'; });
}
```

domLabels addition:
```javascript
'kana': ['Kana (ひらがな・カタカナ)']
```

### Step 4: Legacy deep link handling

Add `kana` to the legacy deck domains map:
```javascript
const LEGACY_DECK_DOMAINS = {
  'kana': ['kana'],
  'joyo-kanji-g1': ['g1'],
  // ... etc
};
```

So `#deck=kana` redirects to `#deck=joyo-kanji` with kana domain pre-selected.

### Step 5: SRS migration

Add the old kana SRS key to the migration function:
```javascript
const oldKeys = [
  'td-srs-kana',  // ← add this
  'td-srs-joyo-kanji-g1', 'td-srs-joyo-kanji-g2', ...
];
```

Kana card IDs (`kana-3042`, etc.) don't collide with kanji card IDs (`k-6f22`, etc.) so the merge is safe.

### Step 6: Update index.html load order

```html
<script src="./kana-cartridge.js"></script>           <!-- data export -->
<script src="./kanji-g1-cartridge-v2.js"></script>    <!-- data export -->
...
<script src="./kanji-g6-cartridge.js"></script>        <!-- data export -->
<script src="./kanji-joyo-cartridge.js"></script>      <!-- merger -->
```

Kana loads first (it's the foundation layer), then grades, then the merger combines everything.

### Step 7: Update sw.js

No new files to precache (kana-cartridge.js is already there). Bump cache version.

### Step 8: Update cartridge metadata

The unified cartridge metadata should reflect that it now includes kana:

```javascript
{
  id: 'joyo-kanji',
  name: 'Japanese Kana & Kanji',
  description: 'Kana foundations + all 1,026 elementary school kanji (Grades 1-6)',
  icon: '漢',
  title: 'にほんご',
  subtitle: 'DEFENSE',
  instructionsSub: 'Kana + Grades 1-6 — 1,234 cards — Select levels on the PLAY tab',
}
```

Total commands: 208 (kana) + 1,026 (kanji) = 1,234.

## Validation

`node validate-cartridge.js kanji-joyo-cartridge.js` must pass with 0 failures.

Expected: 1,234 commands, ~2,547 blanks, domains: kana + g1-g6.

## Deep Links

- `#deck=joyo-kanji` — opens the unified deck (unchanged)
- `#deck=kana` — redirects to unified deck with kana domain pre-selected (new)
- `#deck=joyo-kanji-g{N}` — unchanged, redirects with grade preset

## Benefits

1. **One SRS pool**: kana and kanji share spaced repetition — struggling with あ surfaces in the kana domain while kanji compounds using あ reinforce it
2. **Progressive unlock**: students start with かな, add G1 when ready, naturally builds up
3. **Cross-domain DAG**: kana DAG nodes already exist in kanji cartridges at L4-L5 — having them in one deck means kanji decomposition can naturally drill kana reading
4. **Simpler deck selector**: 2 entries total (AP Stats + Japanese) instead of 3
