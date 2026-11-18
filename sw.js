/* 萌学园 offline support (v0.9).
 *
 * Strategy, chosen for a kids' app that must work on patchy wifi:
 * - App shell (HTML/CSS/JS/icons/voice manifest): precached on install,
 *   served stale-while-revalidate so the UI opens instantly offline and
 *   still picks up new versions after a deploy.
 * - Narration MP3s: NOT precached (915 files, ~14 MB even after the
 *   64 kbps re-encode). They are cached on first play, cache-first
 *   afterwards, and trimmed to the 250 most recently played so the cache
 *   cannot grow without bound on a shared family tablet.
 * - Navigations: network first, falling back to the cached home page.
 *
 * Bump CACHE_VERSION on every release that changes a precached file;
 * activate() deletes older caches. Served from the site root, so its
 * scope is the whole /smart-kid/ app.
 */
const CACHE_VERSION = "smartkid-v0.9.0";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const AUDIO_CACHE = `${CACHE_VERSION}-audio`;
const MAX_AUDIO_ENTRIES = 250;

const APP_SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/style.css?v=0.9.0",
  "css/favicon.png?v=0.9.0",
  "js/data.js?v=0.3",
  "js/pictures.js?v=0.3",
  "js/characters.js?v=0.2",
  "js/audio.js?v=0.9.0",
  "js/app.js?v=0.9.0",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "audio/voices/manifest.json?v=0.9.0"
];

// Same files as plain paths, so the fetch handler can recognise them
// regardless of the ?v= query string the page uses.
const SHELL_PATHS = new Set(
  APP_SHELL.map(path => new URL(path, self.location).pathname)
);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== SHELL_CACHE && key !== AUDIO_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function trimAudioCache() {
  const cache = await caches.open(AUDIO_CACHE);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_AUDIO_ENTRIES))) {
    await cache.delete(key);
  }
}

async function cacheFirst(request, cacheName, trim) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    if (trim) await trimAudioCache();
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("index.html"))
    );
    return;
  }
  if (url.pathname.includes("/audio/voices/") && url.pathname.endsWith(".mp3")) {
    event.respondWith(
      cacheFirst(request, AUDIO_CACHE, true).catch(() => caches.match(request))
    );
    return;
  }
  if (SHELL_PATHS.has(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
