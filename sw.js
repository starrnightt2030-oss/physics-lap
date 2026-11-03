/* Physics Lab — service worker: works offline after the first visit */
const BUILD = '__BUILD__';
const CORE_VER = '202611030958';
const CACHE = 'physlab-' + CORE_VER + '-' + BUILD;
const CORE = ["./", "index.html", "manifest.webmanifest", "assets/app.css?v=202611030958", "assets/app.js?v=202611030958", "assets/data.js?v=202611030958", "voice/kareem/pack.js?v=202611030958", "assets/fonts/alexandria-arabic.woff2", "assets/fonts/alexandria-latin.woff2", "assets/fonts/tajawal-arabic-500.woff2", "assets/fonts/tajawal-latin-500.woff2", "assets/fonts/tajawal-arabic-800.woff2", "assets/fonts/tajawal-latin-800.woff2", "assets/img/teacher.jpg", "assets/img/teacher-portrait.jpg", "assets/img/logo.jpg", "icons/favicon.svg", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = new Set([CACHE, 'physlab-voice']);
    for (const k of await caches.keys()) if (!keep.has(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

// audio needs byte ranges (Safari asks for them)
async function rangeResponse(req, res) {
  const range = req.headers.get('range');
  if (!range || !res) return res;
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  const size = buf.byteLength;
  let start = m && m[1] ? +m[1] : 0, end = m && m[2] ? +m[2] : size - 1;
  if (start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), { status: 206, headers: {
    'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
    'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const url = new URL(req.url);
  // pages: network first so updates arrive, cache when offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./', c)); return r; })
      .catch(() => caches.match('./').then(r => r || caches.match('index.html'))));
    return;
  }
  // voice clips: one long-lived cache, served with byte ranges
  if (url.pathname.includes('/voice/') && url.pathname.endsWith('.mp3')) {
    e.respondWith((async () => {
      const vc = await caches.open('physlab-voice');
      const key = url.origin + url.pathname;
      let res = await vc.match(key);
      if (!res) {
        try { const net = await fetch(key); if (net.ok) { await vc.put(key, net.clone()); res = net; } else return net; }
        catch (err) { return new Response('', { status: 504 }); }
      }
      return rangeResponse(req, res.clone());
    })());
    return;
  }
  // everything else: cache first
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(net => {
    if (net.ok) { const c = net.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
    return net;
  })));
});

// the page asks to store a whole voice for offline use
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type !== 'cache' || !Array.isArray(d.urls)) return;
  e.waitUntil((async () => {
    const vc = await caches.open('physlab-voice');
    let n = 0;
    for (const u of d.urls) {
      const key = new URL(u, self.registration.scope).href;
      try { if (!(await vc.match(key))) { const r = await fetch(key); if (r.ok) await vc.put(key, r); } n++; } catch (err) {}
    }
    const all = await self.clients.matchAll();
    all.forEach(c => c.postMessage({ type: 'cached', n, pack: d.pack }));
  })());
});
