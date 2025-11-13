<template>
  <div class="horizontal-calendar">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="month-year">
        <h3 class="text-lg font-semibold text-gray-900">{{ monthYear }}</h3>
        <p class="text-sm text-gray-600">{{ durationText }}</p>
      </div>
      <div class="leave-type-indicator">
        <div :class="leaveTypeClasses">
          <component v-if="leaveTypeIcon" :is="leaveTypeIcon" class="w-4 h-4" />
          <span class="text-sm font-medium">{{ leaveTypeName }}</span>
        </div>
      </div>
    </div>

    <!-- Calendar Days -->
    <div class="calendar-days">
      <div class="days-container">
        <div
          v-for="day in calendarDays"
          :key="day.key"
          :class="getDayClasses(day)"
          :title="getDayTitle(day)"
        >
          <div class="day-number">{{ day.date }}</div>
          <div class="day-name">{{ day.dayName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  CalendarIcon,
  HeartIcon,
  UserIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    default: 'Annual Leave'
  },
  status: {
    type: String,
    default: 'pending'
  }
});

// Helper function to parse date safely
const parseDate = (dateString) => {
  const parts = dateString.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};

// Computed properties
const startDateObj = computed(() => parseDate(props.startDate));
const endDateObj = computed(() => parseDate(props.endDate));

const monthYear = computed(() => {
  const start = startDateObj.value;
  const end = endDateObj.value;
  
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else {
    return `${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  }
});

const durationText = computed(() => {
  const diffTime = endDateObj.value.getTime() - startDateObj.value.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays === 1 ? '1 day' : `${diffDays} days`;
});

const leaveTypeIcon = computed(() => {
  const iconMap = {
    'Annual Leave': CalendarIcon,
    'Sick Leave': HeartIcon,
    'Personal Leave': UserIcon,
    'Study Leave': AcademicCapIcon,
    'Emergency Leave': ExclamationTriangleIcon
  };
  return iconMap[props.leaveType] || CalendarIcon;
});

const leaveTypeName = computed(() => props.leaveType);

const leaveTypeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium';
  const typeClasses = {
    'Annual Leave': 'bg-teal-100 text-teal-800',
    'Sick Leave': 'bg-red-100 text-red-800',
    'Personal Leave': 'bg-green-100 text-green-800',
    'Study Leave': 'bg-purple-100 text-purple-800',
    'Emergency Leave': 'bg-orange-100 text-orange-800'
  };
  return `${baseClasses} ${typeClasses[props.leaveType] || 'bg-gray-100 text-gray-800'}`;
});

const calendarDays = computed(() => {
  const days = [];
  const start = startDateObj.value;
  const end = endDateObj.value;
  
  // Add a few days before start for context
  const contextStart = new Date(start);
  contextStart.setDate(contextStart.getDate() - 3);
  
  // Add a few days after end for context
  const contextEnd = new Date(end);
  contextEnd.setDate(contextEnd.getDate() + 3);
  
  const current = new Date(contextStart);
  
  while (current <= contextEnd) {
    const isLeaveDay = current >= start && current <= end;
    const isStartDay = current.getTime() === start.getTime();
    const isEndDay = current.getTime() === end.getTime();
    const isToday = current.toDateString() === new Date().toDateString();
    
    days.push({
      key: current.getTime(),
      date: current.getDate(),
      dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: new Date(current),
      isLeaveDay,
      isStartDay,
      isEndDay,
      isToday,
      isWeekend: current.getDay() === 0 || current.getDay() === 6
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return days;
});

// Methods
const getDayClasses = (day) => {
  const baseClasses = 'day-item flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200';
  
  if (day.isLeaveDay) {
    const statusClasses = {
      'approved': 'bg-green-100 text-green-800 border-2 border-green-300',
      'pending': 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300',
      'rejected': 'bg-red-100 text-red-800 border-2 border-red-300'
    };
    
    let leaveClasses = statusClasses[props.status] || statusClasses.pending;
    
    if (day.isStartDay) {
      leaveClasses += ' rounded-l-xl';
    }
    if (day.isEndDay) {
      leaveClasses += ' rounded-r-xl';
    }
    
    return `${baseClasses} ${leaveClasses}`;
  }
  
  if (day.isToday) {
    return `${baseClasses} bg-teal-50 text-teal-600 border border-teal-200`;
  }
  
  if (day.isWeekend) {
    return `${baseClasses} text-gray-400`;
  }
  
  return `${baseClasses} text-gray-600 hover:bg-gray-50`;
};

const getDayTitle = (day) => {
  if (day.isLeaveDay) {
    if (day.isStartDay && day.isEndDay) {
      return `${props.leaveType} - Single day`;
    } else if (day.isStartDay) {
      return `${props.leaveType} - Start date`;
    } else if (day.isEndDay) {
      return `${props.leaveType} - End date`;
    } else {
      return `${props.leaveType} - Leave day`;
    }
  }
  
  if (day.isToday) {
    return 'Today';
  }
  
  return day.fullDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
};
</script>

<style scoped>
.horizontal-calendar {
  @apply bg-white rounded-xl border border-gray-200 overflow-hidden;
}

.calendar-header {
  @apply flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200;
}

.month-year h3 {
  @apply text-lg font-semibold text-gray-900;
}

.month-year p {
  @apply text-sm text-gray-600 mt-1;
}

.calendar-days {
  @apply p-4;
}

.days-container {
  @apply flex space-x-2 overflow-x-auto pb-2;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb #f9fafb;
}

.days-container::-webkit-scrollbar {
  height: 6px;
}

.days-container::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded-full;
}

.days-container::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-full;
}

.days-container::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}

.day-item {
  @apply min-w-[60px] h-16 flex-shrink-0;
}

.day-number {
  @apply text-lg font-semibold;
}

.day-name {
  @apply text-xs uppercase tracking-wide mt-1;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .calendar-header {
    @apply flex-col items-start space-y-2;
  }
  
  .day-item {
    @apply min-w-[50px] h-14;
  }
  
  .day-number {
    @apply text-base;
  }
}
</style>