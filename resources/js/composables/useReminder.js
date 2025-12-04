import { onMounted, onUnmounted } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth';

export function useReminder() {
  const { props } = usePage();
  const { user } = useAuth();
  let reminderInterval;

  const showNotification = () => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        const userName = user.value?.name || 'Employee';
        registration.showNotification(`Hi ${userName}, Ready to Clock In?`, {
          body: 'A new day of productivity awaits! Click here to start your timer.',
          icon: '/favicon.ico',
          tag: 'clock-in-reminder',
          actions: [
            { action: 'clock-in', title: 'Clock In' }
          ]
        });
      });
    } else {
        //console.log('notification permission not granted')
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