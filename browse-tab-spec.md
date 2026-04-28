# BROWSE Tab — AP Stats Unit/Topic Navigation (Offline)

## Goal

Add a curriculum-grounded entry path to AP Stats Formula Defense: a unit/topic Table of Contents that lets a student navigate by AP unit (U1–U9) and topic (1.1, 1.2, …), filter a run to a single topic's commands, and deep-link to the CollegeBoard / Drive / Blooket lesson resources for that topic. Works fully offline after first install (DAG, drilling, navigation all local; only video playback needs internet).

## Non-goals

- No live sync with `school/curriculum_render`. The trainer ships a frozen snapshot.
- No import of `curriculum.js` (817 practice questions). Only `units.js` (the structural tree).
- No changes to BKT/SRS, hydra split, or DAG behavior. BROWSE is purely an entry-path overlay.
- AP Stats only. Other cartridges (joyo-kanji) keep current PLAY/RANKS/MORE tabs unchanged.

## Files added

### 1. `apstats-units.js` (new, ~50 KB)

Frozen snapshot of `school/curriculum_render/data/units.js`. One object exported on `window`:

```javascript
window.AP_STATS_UNITS = [
  { unitId: 'unit1', displayName: 'Unit 1: …', examWeight: '15-23%',
    topics: [ { id:'1-1', name:'Topic 1.1', description:'…',
                videos:[{url, altUrl}], blookets:[{url,title}] }, … ] },
  …9 units total
];
```

Source of truth: `C:/Users/rober/Downloads/Projects/school/curriculum_render/data/units.js`. Wrap the existing `const ALL_UNITS_DATA = […]` as `window.AP_STATS_UNITS = […]`. Keep the structure verbatim — do not edit URLs, descriptions, or ordering.

### 2. `apstats-topic-map.js` (new, hand-authored)

Maps each topic id (`"1-1"`, `"1-2"`, …) to an array of command ids from `ap-stats-cartridge.js`. Single object:

```javascript
window.AP_STATS_TOPIC_MAP = {
  '1-7': ['mean', 'std-dev', 'variance', 'iqr'],
  '1-9': ['empirical-rule', 'zscore'],
  '1-10': ['outlier-iqr'],
  '2-7': ['corr-r'],
  '2-8': ['linreg', 'linreg-mean', 'slope-b', 'y-intercept'],
  '2-9': ['residual', 'r-squared', 'resid-s'],
  '2-12': ['log-transform'],
  // … one entry per topic that maps to ≥1 command
};
```

Authoring rules:
- Use `description` field of each topic + `action` field of each command to align.
- Each command should appear in **at least one** topic. Tally at the end: every command id from the cartridge must be reachable from BROWSE.
- A command MAY appear in multiple topics (e.g., `ci-formula` shows up under U6 proportions CI and U7 means CI). Prefer specific topics over the generic "Setting Up a Test" ones.
- Topics with no matching command (e.g., U3 study-design topics, U1 graphical-display topics) get **no entry** in the map — they render as "📖 Lesson only, no drill" in the UI.
- Use `DOM_LABELS` in `ap-stats-cartridge.js` lines 1455–1464 as a starting hint, but the topic granularity is much finer.

### 3. Update `index.html`

#### 3a. Script tags (around line 337, near other cartridge tags)

Add `<script src="./apstats-units.js"></script>` and `<script src="./apstats-topic-map.js"></script>` BEFORE the inline engine `<script>` block. They should load synchronously like other cartridge files.

#### 3b. Tab system (existing `_menuTab`)

Find the title-screen tab rendering (`G._menuTab`, currently `'play' | 'ranks' | 'more'`). Add `'browse'` as a 4th tab — but only when active cartridge is AP Stats (`activeCartridge.id === 'ap-stats-formulas'`) AND `window.AP_STATS_UNITS` is loaded. For other cartridges (joyo-kanji), the tab does not appear.

Tab order: `[ PLAY ]  [ BROWSE ]  [ RANKS ]  [ MORE ]`. Keyboard shortcut `[B]` for browse.

#### 3c. BROWSE tab content

Render a scrollable accordion:

```
▼ Unit 1: Exploring One-Variable Data            (15-23%)
   Topic 1.1 — Introducing Statistics: What Can…    📖
   Topic 1.7 — Summary Statistics for a Quantita… 📖 [DRILL 4]
   Topic 1.8 — Graphical Representations of Sum… 📖
   …
▶ Unit 2: Exploring Two-Variable Data            (5-7%)
▶ Unit 3: Collecting Data                        (12-15%)
…
```

Per topic row:
- Description text (truncated with ellipsis on mobile, full on desktop)
- 📖 button → opens first `videos[0].url` in new tab (`target="_blank" rel="noopener"`). Falls back to `altUrl` on right-click context menu (or just always show one link, simplest).
- `[DRILL N]` button (only if topic appears in `AP_STATS_TOPIC_MAP`) → starts a run filtered to those N commands.

Default state: all 9 units collapsed except Unit 1. Persist last expanded unit in `localStorage` key `td-browse-expanded` so the student returns to where they were.

#### 3d. Topic-filtered run

When `[DRILL N]` is tapped:
1. Set `G.topicFilter = ['mean', 'std-dev', …]` (array of command ids from the topic map).
2. Set `G.topicFilterId = '1-7'` (for HUD display).
3. Call existing `startGame()` flow.
4. Modify `pickCommands()` (in `index.html`) to honor `G.topicFilter` if set: filter the candidate pool to commands whose `id` is in the filter array, then apply existing BKT priority within that subset. If filter has <3 commands, allow repeats (don't error).
5. HUD shows `📖 Topic 1.7` chip in place of the difficulty badge, tappable to abort filter (returns to title).
6. `Escape` / save+exit clears `G.topicFilter` AND `G.topicFilterId` so the next normal `[DEPLOY]` is unfiltered.
7. `td-run-state-ap-stats-formulas` checkpoint includes `topicFilter` + `topicFilterId` so a topic-locked run resumes correctly.

#### 3e. Deep link support

Add hash handler: `#topic=1-7` on page load → auto-expand U1, scroll to topic 1.7. Existing `#deck=…` handler stays.

### 4. Update `sw.js`

Bump cache from `td-shell-v11` to `td-shell-v12`. Add `'./apstats-units.js'` and `'./apstats-topic-map.js'` to `PRECACHE_URLS`.

## Validation

1. `node --check apstats-units.js` and `apstats-topic-map.js` — parses clean.
2. Coverage check (manual or scriptable): every command id in `ap-stats-cartridge.js` (`COMMANDS` array) appears in at least one topic's `commandIds`. Print missing if any.
3. No dangling refs: every command id in `AP_STATS_TOPIC_MAP` exists in the cartridge.
4. Browser headless smoke: open `http://127.0.0.1:4173/index.html`, verify:
   - BROWSE tab visible (AP Stats), absent (kanji)
   - Expanding U1 shows topic list with 📖 + [DRILL N] buttons
   - Click [DRILL N] starts a run; only commands from that topic appear over 3-4 enemy spawns
   - HUD shows topic chip, Escape clears filter
   - Refresh after `Escape` doesn't auto-resume into a filtered run unless checkpoint was saved with the filter
   - Deep link `#topic=1-7` opens BROWSE with U1 expanded
   - DevTools → Application → Service Workers shows cache `td-shell-v12` populated; offline reload still works

## Out of scope (future)

- Per-topic mastery indicator (would need to query SRS pKnown for the topic's commands)
- Cloud-synced topic completion stamps
- Importing `curriculum.js` practice questions
- Multi-cartridge BROWSE (joyo-kanji equivalent would need its own units file)

## Implementation order

1. Snapshot `units.js` → `apstats-units.js` (mechanical copy)
2. Author `apstats-topic-map.js` (manual; ~70 topics × command lookup)
3. Engine wiring in `index.html`: script tags, BROWSE tab, `pickCommands` filter, HUD chip, deep link, checkpoint fields
4. SW cache bump
5. Validation + headless smoke test

## Codex review focus

- Accuracy of `apstats-topic-map.js` (topic ↔ formula alignment vs AP CED)
- Coverage: any cartridge command that has zero topic? Any topic that should map but is missing?
- `pickCommands()` filter correctness — must not break unfiltered runs, must not crash when filter array is empty
- Checkpoint save/restore round-trip with `topicFilter` field
- Deep link `#topic=…` does not collide with existing `#deck=…` handling
