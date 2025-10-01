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
    // Fetch CSRF token from a dedicated endpoint
    fetch('/api/csrf-token')
      .then(response => response.json())
      .then(data => {
        const csrfToken = data.csrf_token;

        // Now make the API call to clock in
        fetch('/api/attendance/clock-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
          },
          body: JSON.stringify({ source: 'notification' })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Clocked in successfully from notification');
            // Optionally, you can communicate with the client to update the UI
          } else {
            console.error('Failed to clock in from notification', data.message);
          }
        })
        .catch(error => {
          console.error('Error clocking in from notification', error);
        });
      })
      .catch(error => {
        console.error('Failed to fetch CSRF token', error);
      });
  }
});