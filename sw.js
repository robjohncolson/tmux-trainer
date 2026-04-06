// Service Worker for AP Stats Formula Defense
// Two caches: shell (app + CDN) and animations (Supabase MP4s)

const CACHE_SHELL = 'td-shell-v8';
const CACHE_ANIM = 'td-anim-v1';

// Same-origin assets pre-cached on install (guaranteed)
const PRECACHE_URLS = [
  './',
  './index.html',
  './ap-stats-cartridge.js',
  './kanji-g1-cartridge-v2.js',
  './kanji-g2-cartridge.js',
  './kanji-g3-cartridge.js',
  './kanji-g4-cartridge.js',
  './kanji-g5-cartridge.js',
  './kanji-g6-cartridge.js',
  './kanji-joyo-cartridge.js',
];

// CDN assets cached individually (non-blocking, version-pinned = immutable)
const CDN_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
];

const SUPABASE_ANIM_HOST = 'hgvnytaqmuybzbotosyj.supabase.co';
const SUPABASE_ANIM_PATH = '/storage/v1/object/public/videos/animations/ap-stats-formulas/';
const RAILWAY_HOST = 'lrsl-driller-production.up.railway.app';

// ── Install: precache same-origin shell, then CDN individually ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then(async (cache) => {
      // Same-origin: must succeed
      await cache.addAll(PRECACHE_URLS);
      // CDN: best-effort, don't block install on CDN failure
      for (const url of CDN_URLS) {
        try {
          const resp = await fetch(url, { mode: 'cors' });
          if (resp.ok) await cache.put(url, resp);
        } catch (_) { /* CDN unavailable — will fetch at runtime */ }
      }
    })
  );
  self.skipWaiting(); // Activate immediately
});

// ── Activate: clean old caches, claim all clients ──
self.addEventListener('activate', (event) => {
  const keep = new Set([CACHE_SHELL, CACHE_ANIM]);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => !keep.has(n)).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim()) // Take control immediately
  );
});

// ── Fetch: route by URL ──
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Railway API — always network, never cache
  if (url.hostname === RAILWAY_HOST) return;

  // 2. Supabase animation videos/manifest
  if (url.hostname === SUPABASE_ANIM_HOST && url.pathname.startsWith(SUPABASE_ANIM_PATH)) {
    // Range requests (video seeking) — bypass SW, let browser handle natively
    if (event.request.headers.has('Range')) return;

    const isManifest = url.pathname.endsWith('manifest.json');
    event.respondWith(
      isManifest
        ? staleWhileRevalidate(event.request, CACHE_ANIM)
        : cacheFirst(event.request, CACHE_ANIM)
    );
    return;
  }

  // 3. Navigation (index.html) — network-first so deploys propagate immediately
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, CACHE_SHELL));
    return;
  }

  // 4. CDN and other shell assets — cache-first (version-pinned, immutable)
  if (url.hostname.includes('cdnjs.cloudflare.com') ||
      url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(cacheFirst(event.request, CACHE_SHELL));
    return;
  }

  // 5. Same-origin assets — cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request, CACHE_SHELL));
    return;
  }

  // Everything else — network (no interception)
});

// ── Strategies ──

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const resp = await fetch(request);
    if (resp.ok || resp.type === 'opaque') {
      const cache = await caches.open(cacheName);
      cache.put(request, resp.clone());
    }
    return resp;
  } catch (_) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const resp = await fetch(request);
    if (resp.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, resp.clone());
    }
    return resp;
  } catch (_) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((resp) => {
    if (resp.ok) cache.put(request, resp.clone());
    return resp;
  }).catch(() => null);
  return cached || await fetchPromise || new Response('Offline', { status: 503 });
}
