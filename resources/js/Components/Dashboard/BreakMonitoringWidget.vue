<template>
  <UnifiedCard 
    title="Break Time Monitoring" 
    description="Employees exceeding break limits"
    :icon="ClockIcon" 
    iconVariant="warning" 
    variant="elevated"
  >
    <template #headerActions>
      <button 
        @click="refreshData"
        :disabled="loading"
        class="inline-flex items-center px-3 py-1.5 bg-orange-50 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-100 transition-colors"
      >
        <ArrowPathIcon :class="['w-4 h-4 mr-1', loading ? 'animate-spin' : '']" />
        Refresh
      </button>
    </template>

    <!-- Summary Stats -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="text-center p-4 bg-red-50 rounded-xl border border-red-100">
        <div class="text-2xl font-bold text-red-600">{{ breakViolations.length }}</div>
        <div class="text-xs text-gray-600 mt-1">Break Violations</div>
      </div>
      <div class="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
        <div class="text-2xl font-bold text-yellow-600">{{ breakViolations.filter(v => v.break_number === 1).length }}</div>
        <div class="text-xs text-gray-600 mt-1">1st Break (>15min)</div>
      </div>
      <div class="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
        <div class="text-2xl font-bold text-orange-600">{{ breakViolations.filter(v => v.break_number === 2).length }}</div>
        <div class="text-xs text-gray-600 mt-1">2nd Break (>30min)</div>
      </div>
      <div class="text-center p-4 bg-red-50 rounded-xl border border-red-100">
        <div class="text-2xl font-bold text-red-600">{{ breakViolations.filter(v => v.break_number === 3).length }}</div>
        <div class="text-xs text-gray-600 mt-1">3rd Break (>15min)</div>
      </div>
    </div>

    <!-- Break Violations List -->
    <div class="max-h-64 overflow-y-auto custom-scrollbar">
      <div v-if="breakViolations.length === 0" class="text-center py-8 text-gray-500">
        <CheckCircleIcon class="w-12 h-12 mx-auto mb-2 text-green-300" />
        <p>All employees are within break limits!</p>
      </div>
      
      <div v-else class="space-y-2">
        <div 
          v-for="violation in breakViolations" 
          :key="`${violation.employee_id}-${violation.break_number}`"
          :class="[
            'employee-card flex items-center justify-between p-3 rounded-lg border',
            violation.break_number === 1 && 'bg-yellow-50 border-yellow-200',
            violation.break_number === 2 && 'bg-orange-50 border-orange-200',
            violation.break_number === 3 && 'bg-red-50 border-red-200'
          ]"
        >
          <div class="flex items-center space-x-3">
            <div :class="[
              'w-3 h-3 rounded-full',
              violation.break_number === 1 && 'bg-yellow-400',
              violation.break_number === 2 && 'bg-orange-400', 
              violation.break_number === 3 && 'bg-red-400'
            ]"></div>
            <div>
              <div class="font-medium text-gray-900">{{ violation.employee_name }}</div>
              <div class="text-sm text-gray-600">
                {{ violation.job_title }} • {{ violation.department }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div :class="[
              'text-sm font-medium',
              violation.break_number === 1 && 'text-yellow-700',
              violation.break_number === 2 && 'text-orange-700',
              violation.break_number === 3 && 'text-red-700'
            ]">
              Break {{ violation.break_number }}: {{ violation.duration }}
            </div>
            <div class="text-xs text-gray-600">
              Limit: {{ violation.limit }} • Over by {{ violation.overtime }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex space-x-2">
        <button
          @click="sendBreakReminders"
          :disabled="breakViolations.length === 0 || loading || remindersSent"
          :class="[
            'flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            remindersSent 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          ]"
        >
          <BellIcon v-if="!remindersSent" class="w-4 h-4 mr-2" />
          <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ remindersSent ? 'Reminders Sent' : 'Send Break Reminders' }}
        </button>
        <button
          @click="exportBreakReport"
          class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
        >
          <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>
    </div>
  </UnifiedCard>
</template>

<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import UnifiedCard from '@/Components/UI/UnifiedCard.vue';
import {
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  BellIcon,
  DocumentArrowDownIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  breakViolations: {
    type: Array,
    default: () => []
  }
});

const loading = ref(false);
const remindersSent = ref(false);

const refreshData = () => {
  loading.value = true;
  try {
    router.reload({ 
      only: ['breakViolations'],
      preserveScroll: true,
      onFinish: () => {
        loading.value = false;
      }
    });
  } catch (error) {
    console.error('Failed to refresh break data:', error);
    loading.value = false;
  }
};

const sendBreakReminders = async () => {
  if (props.breakViolations.length === 0 || remindersSent.value) return;
  
  loading.value = true;
  try {
    const response = await window.axios.post('/api/attendance/send-break-reminders', {}, {
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      remindersSent.value = true;
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = `✅ Break reminders sent to ${response.data.count} employees. Admin confirmation email sent.`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 5000);
    }
  } catch (error) {
    console.error('Failed to send break reminders:', error);
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.textContent = '❌ Failed to send break reminders. Please try again.';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  } finally {
    loading.value = false;
  }
};

const exportBreakReport = async () => {
  try {
    const response = await axios.get('/api/attendance/export-break-report', {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `break-violations-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export break report:', error);
    alert('Failed to export report. Please try again.');
  }
};
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
  scroll-behavior: smooth;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.employee-card {
  transition: all 0.2s ease;
}

.employee-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>