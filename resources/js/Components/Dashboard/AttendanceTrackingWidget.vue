<template>
  <UnifiedCard 
    title="Today's Attendance Tracking" 
    description="Employee clock-in status overview"
    :icon="ClockIcon" 
    iconVariant="primary" 
    variant="elevated"
  >
    <template #headerActions>
      <button 
        @click="refreshData"
        :disabled="loading"
        class="inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-100 transition-colors"
      >
        <ArrowPathIcon :class="['w-4 h-4 mr-1', loading ? 'animate-spin' : '']" />
        Refresh
      </button>
    </template>

    <!-- Summary Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="text-center p-4 bg-green-50 rounded-xl border border-green-100">
        <div class="text-2xl font-bold text-green-600">{{ attendanceData.clockedInCount }}</div>
        <div class="text-xs text-gray-600 mt-1">Clocked In</div>
      </div>
      <div class="text-center p-4 bg-red-50 rounded-xl border border-red-100">
        <div class="text-2xl font-bold text-red-600">{{ attendanceData.missedClockInCount }}</div>
        <div class="text-xs text-gray-600 mt-1">Missed Clock-in</div>
      </div>
      <div class="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div class="text-2xl font-bold text-blue-600">{{ attendanceData.totalEmployeeCount }}</div>
        <div class="text-xs text-gray-600 mt-1">Total Employees</div>
      </div>
    </div>

    <!-- Attendance Rate Progress -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700">Attendance Rate</span>
        <span class="text-sm font-bold text-gray-900">{{ attendanceData.attendanceRate }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-300"
          :class="getAttendanceRateColor(attendanceData.attendanceRate)"
          :style="{ width: attendanceData.attendanceRate + '%' }"
        ></div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
      <button
        @click="handleTabChange('clocked-in')"
        :class="[
          'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          activeTab === 'clocked-in' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        ]"
      >
        Clocked In ({{ attendanceData.clockedInCount }})
      </button>
      <button
        @click="activeTab = 'missed'"
        :class="[
          'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          activeTab === 'missed' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        ]"
      >
        Missed ({{ attendanceData.missedClockInCount }})
      </button>
    </div>

    <!-- Employee Lists -->
    <div class="relative">
      <!-- Scroll fade indicators -->
      <div 
        v-if="showTopFade" 
        class="absolute top-0 left-0 right-0 h-6 scroll-fade-top z-10 pointer-events-none rounded-t-lg"
      ></div>
      <div 
        v-if="showBottomFade" 
        class="absolute bottom-0 left-0 right-0 h-6 scroll-fade-bottom z-10 pointer-events-none rounded-b-lg"
      ></div>
      
      <div 
        ref="scrollContainer"
        class="max-h-64 overflow-y-auto custom-scrollbar"
        @scroll="handleScroll"
      >
      <!-- Clocked In Employees -->
      <div v-if="activeTab === 'clocked-in'" class="space-y-2">
        <div 
          v-if="attendanceData.clockedInEmployees.length === 0" 
          class="text-center py-8 text-gray-500"
        >
          <ClockIcon class="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No employees clocked in yet today</p>
        </div>
        <div 
          v-for="employee in attendanceData.clockedInEmployees" 
          :key="employee.id"
          class="employee-card flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100 gap-4"
        >
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <div class="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
            <div class="min-w-0 flex-1">
              <div class="font-medium text-gray-900 truncate">{{ employee.name }}</div>
              <div class="text-sm text-gray-600 truncate">
                {{ employee.job_title }} • {{ employee.department }}
              </div>
            </div>
          </div>
          <div class="text-right flex-shrink-0 min-w-[100px]">
            <div class="text-sm font-medium text-gray-900">Clock-In : {{ getFormattedTime(employee.clock_in_time) }}</div>
            <div class="text-xs text-gray-600 whitespace-nowrap">
              <!-- {{ employee.work_duration }} -->
              <span v-if="employee.on_break" class="text-orange-600 ml-1">(On Break)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Missed Clock-in Employees -->
      <div v-if="activeTab === 'missed'" class="space-y-2">
        <div 
          v-if="attendanceData.missedClockInEmployees.length === 0" 
          class="text-center py-8 text-gray-500"
        >
          <CheckCircleIcon class="w-12 h-12 mx-auto mb-2 text-green-300" />
          <p>All employees have clocked in today!</p>
        </div>
        <div 
          v-for="employee in attendanceData.missedClockInEmployees" 
          :key="employee.id"
          class="employee-card flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
        >
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-red-400 rounded-full"></div>
            <div>
              <div class="font-medium text-gray-900">{{ employee.name }}</div>
              <div class="text-sm text-gray-600">
                {{ employee.job_title }} • {{ employee.department }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-red-600 font-medium">Not clocked in</div>
            <div class="text-xs text-gray-500">{{ employee.employee_code }}</div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex space-x-2">
        <button
          @click="sendReminder"
          :disabled="attendanceData.missedClockInCount === 0 || loading || reminderSent"
          :class="[
            'flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            reminderSent 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
          ]"
        >
          <BellIcon v-if="!reminderSent" class="w-4 h-4 mr-2" />
          <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ reminderSent ? 'Reminders Sent' : 'Send Reminder' }}
        </button>
        <button
          @click="exportReport"
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
import { ref, onMounted, nextTick } from 'vue';
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
  attendanceData: {
    type: Object,
    required: true,
    default: () => ({
      totalEmployeeCount: 0,
      clockedInCount: 0,
      missedClockInCount: 0,
      clockedInEmployees: [],
      missedClockInEmployees: [],
      attendanceRate: 0,
    })
  }
});

const activeTab = ref('clocked-in');
const loading = ref(false);
const scrollContainer = ref(null);
const showTopFade = ref(false);
const showBottomFade = ref(false);
const reminderSent = ref(false);

const getAttendanceRateColor = (rate) => {
  if (rate >= 90) return 'bg-green-500';
  if (rate >= 75) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getFormattedTime = (timeString) => {
  if (!timeString || timeString === 'Invalid Date') return '-';
  
  try {
    const time = new Date(timeString);
    if (isNaN(time.getTime())) return '-';
    
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '-';
  }
};

const refreshData = () => {
  loading.value = true;
  try {
    router.reload({ 
      only: ['attendanceTracking', 'adminStats'],
      preserveScroll: true,
      onFinish: () => {
        loading.value = false;
      }
    });
  } catch (error) {
    console.error('Failed to refresh attendance data:', error);
    loading.value = false;
  }
};

const sendReminder = async () => {
  if (props.attendanceData.missedClockInCount === 0 || reminderSent.value) return;
  
  loading.value = true;
  try {
    const response = await window.axios.post('/api/attendance/send-clock-in-reminders', {}, {
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      reminderSent.value = true;
      // Show success message
      const message = `✅ Clock-in reminders sent to ${response.data.count} employees. Admin confirmation email sent.`;
      
      // Create and show toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 5000);
    }
  } catch (error) {
    console.error('Failed to send reminder:', error);
    
    // Show error toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.textContent = '❌ Failed to send reminders. Please try again.';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  } finally {
    loading.value = false;
  }
};
const exportReport = async () => {
  try {
    const response = await window.axios.get('/api/attendance/export-report', {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export attendance report:', error);
    alert('Failed to export report. Please try again.');
  }
};

const handleScroll = () => {
  if (!scrollContainer.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  
  // Show top fade if scrolled down
  showTopFade.value = scrollTop > 10;
  
  // Show bottom fade if not at bottom
  showBottomFade.value = scrollTop < scrollHeight - clientHeight - 10;
};

const checkScrollable = async () => {
  await nextTick();
  if (!scrollContainer.value) return;
  
  const { scrollHeight, clientHeight } = scrollContainer.value;
  const isScrollable = scrollHeight > clientHeight;
  
  // Initially show bottom fade if content is scrollable
  showBottomFade.value = isScrollable;
  showTopFade.value = false;
};

// Watch for tab changes and check scrollable content
const handleTabChange = async (tab) => {
  activeTab.value = tab;
  await checkScrollable();
};



onMounted(() => {
  checkScrollable();
});
</script>

<style scoped>
/* Custom Scrollbar Styles */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
  scroll-behavior: smooth;
  position: relative;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
  margin: 4px 0;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: all 0.2s ease;
  border: 1px solid #f8fafc;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
  border-color: #e2e8f0;
}

.custom-scrollbar::-webkit-scrollbar-thumb:active {
  background: #64748b;
}

/* Fade indicators */
.custom-scrollbar::before,
.custom-scrollbar::after {
  content: '';
  position: absolute;
  left: 0;
  right: 6px; /* Account for scrollbar width */
  height: 8px;
  pointer-events: none;
  z-index: 10;
  transition: opacity 0.2s ease;
}

/* Enhanced scroll indicators with better visibility */
.scroll-fade-top {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.scroll-fade-bottom {
  background: linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

/* Hide scrollbar on mobile for cleaner look */
@media (max-width: 640px) {
  .custom-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .custom-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

/* Smooth transitions for employee cards */
.employee-card {
  transition: all 0.2s ease;
}

.employee-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>