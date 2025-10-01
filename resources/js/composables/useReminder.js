import { onMounted, onUnmounted } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { notify } from '@/composables/useNotifications';

export function useReminder() {
  const { props } = usePage();
  let reminderInterval;

  const checkClockInStatus = () => {
    const now = new Date();
    const clockInTime = new Date(props.auth.user.clock_in_time);

    if (isNaN(clockInTime.getTime()) || now.getTime() - clockInTime.getTime() > 5 * 60 * 1000) {
      notify.info('Please clock in to start your work day.', {
        title: 'Clock-In Reminder',
        persistent: true,
      });
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