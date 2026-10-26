// 願望清單離線快取：沒有網路時也能打開
// 快取名稱以 et-wishlist- 開頭，清舊快取時只清自己的，不會動到小錢包
const CACHE = "et-wishlist-v1";
const FILES = ["./", "index.html", "manifest.json", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith("et-wishlist-") && k !== CACHE).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

// 先抓網路上的最新版，抓不到才用快取
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
