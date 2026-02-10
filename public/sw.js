/**
 * SGG Digital — Service Worker (Push Notifications ONLY)
 *
 * NEXUS-OMEGA M5 : Le cache/PWA a été intentionnellement retiré.
 * Les données gouvernementales ne doivent PAS être cachées dans le navigateur.
 * Ce SW ne gère que les notifications push entrantes.
 */

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
