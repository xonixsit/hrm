self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/favicon.ico' // You can change this to your app's icon
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'clock-in') {
    clients.openWindow('/attendance'); // Redirect to the attendance page to clock in
  }
});