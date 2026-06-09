const CACHE_NAME = 'polyomino-tris-v1';
const ASSETS = [
  'index.html',
  'manifest.json'
];

// インストール時に重要なファイルをキャッシュ
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 古いキャッシュの削除
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// オンライン優先、失敗したらキャッシュから読み込む（Tailwindなどの外部CDN対応）
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // 正常に取得できたらキャッシュにコピーを保存
        if (response && response.status === 200 && e.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワークエラー（オフラインなど）時はキャッシュから返す
        return caches.match(e.request);
      })
  );
});