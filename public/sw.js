// AG Sudoku Service Worker - Offline Support
const CACHE_NAME = 'ag-sudoku-v1';

// Critical URLs to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/en',
  '/en/sudoku/play',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/Avatars/Shadow.png',  // Default avatar fallback for offline mode
];

// Install event - pre-cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching critical URLs');
      // Don't fail install if some URLs fail to cache
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.log(`[SW] Failed to cache ${url}:`, err);
          })
        )
      );
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean old caches and take control
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - handle requests with appropriate strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Chrome extension requests and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Skip API routes and Supabase requests
  if (url.pathname.startsWith('/api/') ||
      url.hostname.includes('supabase')) {
    return;
  }

  // Navigation requests (HTML pages) - Network first, fall back to cache
  if (request.mode === 'navigate' ||
      request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline - try to serve from cache
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Fall back to the main game page
            return caches.match('/en/sudoku/play').then((fallback) => {
              if (fallback) return fallback;
              // Last resort - try /en
              return caches.match('/en');
            });
          });
        })
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts) - Cache first, fall back to network
  if (url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/avatars/') ||
      url.pathname.startsWith('/Avatars/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.startsWith('/images/') ||
      url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          // Cache successful asset responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Google Fonts - Cache first with network fallback
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Default - Network first for everything else
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

console.log('[SW] Service worker loaded');
