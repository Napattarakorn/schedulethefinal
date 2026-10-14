// เปลี่ยนเลขเวอร์ชันนี้ทุกครั้งที่แก้ไฟล์ เพื่อให้เครื่องผู้ใช้โหลดของใหม่
const CACHE = 'schedule-v12';
const FILES = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  const fb = (u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/')) ||
    (u.hostname === 'cdnjs.cloudflare.com' && u.pathname.startsWith('/ajax/libs/xlsx/'));
  if (e.request.method !== 'GET' || (u.origin !== location.origin && !fb)) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
