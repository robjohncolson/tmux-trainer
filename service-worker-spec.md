# Spec: Service Worker — Offline Caching for AP Stats Formula Defense

## Problem

Every session re-downloads the entire app and CDN dependencies. Animation videos are fetched fresh each time a student watches one. On school wifi with 30 students, this means:
- 30 × 268KB index.html = 8MB
- 30 × ~500KB CDN libs = 15MB
- Animation videos: each student re-fetches every video they watch

After the first load, subsequent sessions should be instant — zero network for the app shell and CDN libs, and animation videos cached after first watch.

## Solution

Add a Service Worker (`sw.js`) with a two-tier caching strategy:

### Cache 1: App Shell (install-time, cache-first)

Pre-cache on SW install:
- `/index.html` (268KB)
- `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
- `https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css`
- `https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js`
- `https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js`

Strategy: **cache-first, network-fallback**. Serve from cache instantly. Update cache in background on each visit (stale-while-revalidate for index.html so new deploys propagate).

### Cache 2: Animations (runtime, cache-first)

Cache animation MP4s and the manifest on first fetch:
- `https://hgvnytaqmuybzbotosyj.supabase.co/storage/v1/object/public/videos/animations/ap-stats-formulas/*.mp4`
- `https://hgvnytaqmuybzbotosyj.supabase.co/storage/v1/object/public/videos/animations/ap-stats-formulas/manifest.json`

Strategy: **cache-first**. Once a student watches an animation, it's cached forever (these don't change). Manifest uses stale-while-revalidate (may get new animations added).

### Cache 3: API calls (network-first)

The Railway sync server calls (`/api/users`, `/api/progress/*`, `/api/users/verify`) should **not** be cached — these are live data. Pass through to network, no SW interception.

## Design

### `sw.js`

```javascript
const CACHE_SHELL = 'td-shell-v1';
const CACHE_ANIM = 'td-animations-v1';

const SHELL_URLS = [
  '/',
  '/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
];

const SUPABASE_ANIM = 'supabase.co/storage/v1/object/public/videos/animations/ap-stats-formulas';
const RAILWAY_API = 'lrsl-driller-production.up.railway.app';
```

**Install**: Pre-cache shell URLs.

**Activate**: Clean old cache versions.

**Fetch strategy**:
1. If URL matches Railway API → network only (no cache)
2. If URL matches Supabase animation path → cache-first from CACHE_ANIM, fetch+cache on miss
3. If URL is in shell cache → stale-while-revalidate from CACHE_SHELL
4. Everything else → network (default)

### Registration in `index.html`

Add SW registration at the end of the inline script:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
```

### Cache versioning

Shell cache version bumps on deploy (`td-shell-v2`, etc.). The `activate` handler deletes old versions. Animation cache never needs versioning — MP4s are immutable by command ID.

## Blast Radius

### New files
| File | Purpose |
|------|---------|
| `sw.js` | Service Worker (fetch interception + caching) |
| `service-worker-spec.md` | This spec |

### Touched in `index.html`
- Add 3-line SW registration block at end of `<script>` — zero interaction with game logic

### NOT touched
- Game logic, SRS, BKT, scoring — no overlap
- Animation fetch in `loadAnimation()` — SW intercepts transparently at the fetch layer
- Cloud sync — explicitly excluded from caching

## Implementation Plan

1. Write `sw.js` with install/activate/fetch handlers
2. Add SW registration to `index.html`
3. Parse check
4. Verify SW registers and caches shell on first load

## Testing Plan

- [ ] SW registers without errors
- [ ] Second load serves index.html from cache (DevTools → Network → "from ServiceWorker")
- [ ] CDN libs served from cache on second load
- [ ] Animation video cached after first watch, served from cache on rewatch
- [ ] Cloud sync API calls still hit network (not cached)
- [ ] Cache versioning: bumping CACHE_SHELL version clears old shell cache
- [ ] App works normally with SW disabled/unsupported (graceful degradation)

## Edge Cases

1. **First visit on bad wifi** — SW installs but shell URLs may fail to pre-cache. SW falls through to network on next fetch. No breakage.
2. **index.html updates** — Stale-while-revalidate: serves cached version immediately, fetches updated version in background. Student gets the update on next reload.
3. **New animation uploaded** — Manifest uses stale-while-revalidate. New ID appears on next manifest refresh. New MP4 cached on first watch.
4. **Cache storage full** — Browser evicts least-recently-used. Animations re-fetch from Supabase. Transparent.
5. **Multiple tabs** — SW is shared across tabs. No conflict.
