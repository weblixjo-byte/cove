// Cove Loyalty & Rewards - Web Push Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle incoming Web Push notifications from server
self.addEventListener('push', (event) => {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    data = {
      title: 'Cove Coffee House',
      body: event.data ? event.data.text() : 'لديك إشعار جديد في حسابك!',
    };
  }

  const title = data.title || 'Cove Coffee House';
  const options = {
    body: data.body || data.message || 'لديك تحديث جديد في رصيد نقاطك ومكافآتك!',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    data: {
      url: data.url || '/customer',
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    vibrate: [200, 100, 200],
    tag: data.tag || 'cove-notification-' + Date.now(),
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click by opening the customer pass
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/customer';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
