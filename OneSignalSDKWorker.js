// Service worker MLBB Academy: notifikasi OneSignal + mode offline sederhana.
// Satu situs hanya boleh punya satu service worker per scope, jadi keduanya digabung di file ini.
try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch (e) {
  // Tanpa internet saat pemasangan: aplikasi tetap jalan, notifikasi menyusul.
}

const CACHE = 'mlbb-academy-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './offline.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => null));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// Halaman: coba jaringan dulu (selalu versi terbaru), bila offline pakai salinan tersimpan.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  e.respondWith(
    fetch(req)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res; })
      .catch(() => caches.match('./index.html').then((r) => r || caches.match('./offline.html'))),
  );
});
