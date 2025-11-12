/**
 * Service Worker for PWA
 * Phase 12-3: キャッシュ戦略実装
 */

// キャッシュバージョン
const CACHE_VERSION = 'v1';
const CACHE_NAME = `app025-cache-${CACHE_VERSION}`;

// キャッシュする静的アセット
const STATIC_ASSETS = [
  '/',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json',
  // Next.jsの静的アセットは動的に追加されるため、ここでは基本的なもののみ
];

// APIエンドポイントのパターン（Network First戦略用）
const API_PATTERNS = [
  /\/api\//,
  /\/gemini/,
];

// インストールイベント：静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // 新しいService Workerをすぐにアクティベート
      return self.skipWaiting();
    })
  );
});

// アクティベートイベント：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // すべてのクライアントを制御
      return self.clients.claim();
    })
  );
});

// フェッチイベント：キャッシュ戦略を実装
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 外部リソース（Gemini APIなど）はキャッシュしない
  if (url.origin !== location.origin) {
    return;
  }

  // API呼び出し：Network First戦略
  if (API_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静的アセット：Cache First戦略
  event.respondWith(cacheFirst(request));
});

/**
 * Cache First戦略
 * キャッシュを優先し、なければネットワークから取得
 */
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
      console.log('[Service Worker] Cache hit:', request.url);
      return cached;
    }

    console.log('[Service Worker] Cache miss, fetching:', request.url);
    const response = await fetch(request);

    // 成功したレスポンスのみキャッシュ
    if (response && response.status === 200) {
      // レスポンスは一度しか使えないのでクローン
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Cache First error:', error);

    // オフライン時のフォールバック
    if (request.destination === 'document') {
      const cache = await caches.open(CACHE_NAME);
      return cache.match('/') || new Response('Offline', { status: 503 });
    }

    return new Response('Network error', { status: 503 });
  }
}

/**
 * Network First戦略
 * ネットワークを優先し、失敗したらキャッシュから取得
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // 成功したレスポンスをキャッシュ
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Network First error:', error);

    // ネットワークエラー時はキャッシュから取得
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
      console.log('[Service Worker] Fallback to cache:', request.url);
      return cached;
    }

    return new Response('Network error', { status: 503 });
  }
}

// メッセージイベント：クライアントからのメッセージを処理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const { urls } = event.data;
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }
});
