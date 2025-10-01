import { onMounted, onUnmounted } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth';

export function useWorkReportReminder() {
  const { isAuthenticated, user } = useAuth();
  const page = usePage();
  let timer = null;

  const showNotification = () => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        const userName = user.value?.name || 'Employee';
        registration.showNotification(`Hi ${userName}, Gentle Reminder to Submit Your Work Report`, {
          body: 'Please submit your work report for today.',
          icon: '/favicon.ico',
          tag: 'work-report-reminder',
          actions: [
            { action: 'submit-work-report', title: 'Submit Now' }
          ]
        });
      });
    } else {
        console.log('notification permission not granted')
    }
  };

  const checkWorkHours = () => {
    if (!isAuthenticated.value) {
      return;
    }

    const attendance = page.props.auth.user.todays_attendance;

    if (attendance && attendance.clock_in_time && !attendance.clock_out_time) {
      const clockInTime = new Date(attendance.clock_in_time);
      const now = new Date();
      const hoursWorked = (now - clockInTime) / 1000 / 60 / 60;

      if (hoursWorked >= 7.5) {
        showNotification();
      }
    }
  };

  onMounted(() => {
    // Check every 5 minutes
    timer = setInterval(checkWorkHours, 5 * 60 * 1000);
    // Also check immediately on mount
    checkWorkHours();
  });

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer);
    }
  });
}