/**
 * SGG Digital — Service Worker
 *
 * Stratégie de cache :
 *   1. Cache-first pour les assets statiques (JS, CSS, images, fonts)
 *   2. Network-first pour les requêtes API
 *   3. Offline fallback page quand le réseau est indisponible
 *
 * Le SW est enregistré conditionnellement (production only) via
 * l'appel registerSW() dans main.tsx.
 */

const CACHE_VERSION = 'sgg-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Assets to precache on install
const PRECACHE_URLS = [
    '/',
    '/emblem_gabon.png',
    '/manifest.json',
];

// ── Install ─────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// ── Activate ────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key.startsWith('sgg-') && key !== STATIC_CACHE && key !== API_CACHE)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

// ── Fetch ───────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) return;

    // API requests → Network-first with cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirstStrategy(request, API_CACHE));
        return;
    }

    // Supabase requests → always network (realtime, auth)
    if (url.hostname.includes('supabase')) return;

    // Static assets → Cache-first with network fallback
    if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
        return;
    }

    // Navigation requests → Network-first with offline fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() => caches.match('/'))
                .then((response) => response || new Response('Offline', { status: 503 }))
        );
        return;
    }
});

// ── Strategies ──────────────────────────────────────────────────────────────

async function cacheFirstStrategy(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('', { status: 503, statusText: 'Offline' });
    }
}

async function networkFirstStrategy(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        return cached || new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isStaticAsset(pathname) {
    return /\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|ico|json)$/i.test(pathname);
}

// ── Push Notifications ──────────────────────────────────────────────────────

/**
 * Handle incoming push events from the server
 */
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch {
        payload = {
            title: 'SGG Digital',
            body: event.data.text(),
            icon: '/emblem_gabon.png',
        };
    }

    const options = {
        body: payload.body || 'Nouvelle notification',
        icon: payload.icon || '/emblem_gabon.png',
        badge: payload.badge || '/emblem_gabon.png',
        tag: payload.tag || 'sgg-notification',
        data: payload.data || { url: '/dashboard' },
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        actions: payload.actions || [
            { action: 'open', title: 'Ouvrir' },
            { action: 'dismiss', title: 'Fermer' },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(
            payload.title || '🏛 SGG Digital',
            options
        )
    );
});

/**
 * Handle notification click — navigate to the URL from the notification data
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url || '/dashboard';

    if (event.action === 'dismiss') return;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            // If a window is already open, focus it and navigate
            for (const client of clients) {
                if ('focus' in client) {
                    client.focus();
                    client.navigate(url);
                    return;
                }
            }
            // Otherwise open a new window
            return self.clients.openWindow(url);
        })
    );
});

