import { onMounted, onUnmounted } from 'vue';
import { usePage } from '@inertiajs/vue3';

export function useReminder() {
  const { props } = usePage();
  let reminderInterval;

  const showNotification = () => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Clock-In Reminder', {
          body: 'Please clock in to start your work day.',
          icon: '/favicon.ico'
        });
      });
    } else {
        console.log('notification permission not granted')
    }
  };

  const checkClockInStatus = () => {
    const now = new Date();
    const clockInTime = new Date(props.auth.user.clock_in_time);

    if (isNaN(clockInTime.getTime()) || now.getTime() - clockInTime.getTime() > 5 * 60 * 1000) {
      showNotification();
    }
  };

  onMounted(() => {
    checkClockInStatus();
    reminderInterval = setInterval(checkClockInStatus, 5 * 60 * 1000); // Check every 5 minutes
  });

  onUnmounted(() => {
    clearInterval(reminderInterval);
  });
}