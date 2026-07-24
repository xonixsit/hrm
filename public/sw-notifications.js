// Service Worker for background chat notifications
// Runs independently of any page — survives tab switches and navigation

const CACHE_NAME = 'xonixshr-sw-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Receive messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SHOW_NOTIFICATION') {
        const { title, body, icon, tag, data } = event.data.payload;

        event.waitUntil(
            self.registration.showNotification(title, {
                body,
                icon: icon || '/favicon.ico',
                badge: '/favicon.ico',
                tag: tag || 'chat-message',
                renotify: true,
                requireInteraction: false,
                data: data || {},
            })
        );
    }
});

// Handle notification click — focus or open the chat tab
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || '/team-messaging';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            // Focus an existing tab if it's already open
            for (const client of clients) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise navigate any existing app tab
            for (const client of clients) {
                if ('navigate' in client) {
                    return client.navigate(targetUrl).then(c => c?.focus());
                }
            }
            // Or open a new tab
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
