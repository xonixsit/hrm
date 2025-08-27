<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Attendance Details"
      :subtitle="`${attendance.employee?.user?.name || 'Employee'} - ${formatDate(attendance.date)}`"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="space-y-8">
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            label="Work Duration"
            :value="workDuration || '0h 0m'"
            icon="ClockIcon"
            color="blue"
            class="transform hover:scale-105 transition-transform duration-200"
          />
          <StatsCard
            label="Break Duration"
            :value="breakDuration || '-'"
            icon="PauseIcon"
            color="orange"
            class="transform hover:scale-105 transition-transform duration-200"
          />
          <StatsCard
            label="Break Sessions"
            :value="breakSessions.length"
            icon="ListBulletIcon"
            color="green"
            class="transform hover:scale-105 transition-transform duration-200"
          />
          <StatsCard
            label="Status"
            :value="formatStatus(attendance.status)"
            icon="CheckCircleIcon"
            :color="getStatusColor(attendance.status)"
            class="transform hover:scale-105 transition-transform duration-200"
          />
        </div>

        <!-- Main Details -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <!-- Time Details -->
          <ContentCard title="Time Details" class="shadow-sm hover:shadow-md transition-shadow duration-200">
            <div class="space-y-1">
              <div class="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-2">
                  <CalendarIcon class="w-4 h-4 text-gray-500" />
                  <span class="text-sm font-medium text-gray-700">Date</span>
                </div>
                <span class="text-sm font-semibold text-gray-900">{{ formatDate(attendance.date) }}</span>
              </div>
              
              <div class="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg">
                <div class="flex items-center space-x-2">
                  <ArrowRightOnRectangleIcon class="w-4 h-4 text-green-600" />
                  <span class="text-sm font-medium text-green-700">Clock In</span>
                </div>
                <span class="text-sm font-semibold text-green-900">
                  {{ attendance.clock_in ? formatTime(attendance.clock_in) : '—' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-3 px-4 bg-red-50 rounded-lg">
                <div class="flex items-center space-x-2">
                  <ArrowLeftOnRectangleIcon class="w-4 h-4 text-red-600" />
                  <span class="text-sm font-medium text-red-700">Clock Out</span>
                </div>
                <span class="text-sm font-semibold text-red-900">
                  {{ attendance.clock_out ? formatTime(attendance.clock_out) : '—' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div class="flex items-center space-x-2">
                  <ClockIcon class="w-4 h-4 text-blue-600" />
                  <span class="text-sm font-medium text-blue-700">Total Work Time</span>
                </div>
                <span class="text-lg font-bold text-blue-900">{{ workDuration || '0h 0m' }}</span>
              </div>
            </div>
          </ContentCard>

          <!-- Break Sessions -->
          <ContentCard title="Break Sessions" class="shadow-sm hover:shadow-md transition-shadow duration-200">
            <div v-if="breakSessions.length === 0" class="text-center py-12">
              <PauseIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500 font-medium">No break sessions recorded</p>
              <p class="text-sm text-gray-400 mt-1">All work time was continuous</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="(session, index) in breakSessions"
                :key="index"
                class="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors duration-150"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                    <span class="text-xs font-bold text-orange-700">{{ index + 1 }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-orange-900">Break {{ index + 1 }}</p>
                    <p class="text-xs text-orange-700">
                      {{ formatTime(session.start) }} - {{ session.end ? formatTime(session.end) : 'Ongoing' }}
                    </p>
                  </div>
                </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-neutral-900">
                    {{ session.duration_minutes ? `${session.duration_minutes}m` : '—' }}
                  </p>
                </div>
              </div>
            </div>
          </ContentCard>
        </div>

        <!-- Additional Information -->
        <ContentCard title="Additional Information">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Employee</span>
                <span class="text-sm text-neutral-900">{{ attendance.employee?.user?.name || 'Unknown' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">IP Address</span>
                <span class="text-sm text-neutral-900">{{ attendance.ip_address || '—' }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-sm font-medium text-neutral-600">Location</span>
                <span class="text-sm text-neutral-900">{{ attendance.location || '—' }}</span>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Created</span>
                <span class="text-sm text-neutral-900">{{ formatDateTime(attendance.created_at) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Last Updated</span>
                <span class="text-sm text-neutral-900">{{ formatDateTime(attendance.updated_at) }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-sm font-medium text-neutral-600">Notes</span>
                <span class="text-sm text-neutral-900">{{ attendance.notes || '—' }}</span>
              </div>
            </div>
          </div>
        </ContentCard>

        <!-- Edit History -->
        <ContentCard v-if="attendance.editor" title="Edit History">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center space-x-2">
              <ExclamationTriangleIcon class="w-5 h-5 text-yellow-600" />
              <div>
                <p class="text-sm font-medium text-yellow-800">This record has been edited</p>
                <p class="text-sm text-yellow-700">
                  Last edited by {{ attendance.editor.name }} on {{ formatDateTime(attendance.updated_at) }}
                </p>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue';
import { router } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import StatsCard from '@/Components/Dashboard/StatsCard.vue';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  PauseIcon,
  ListBulletIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  attendance: Object,
  workDuration: String,
  breakDuration: String,
  totalMinutes: Number,
  breakSessions: Array
});

const { user, hasRole, hasAnyRole } = useAuth();

const isAdminOrHR = computed(() => hasAnyRole(['Admin', 'HR']));

// Breadcrumbs configuration
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Attendance Management', href: route('attendances.index') },
  { label: 'Details', current: true }
]);

// Header actions
const headerActions = computed(() => {
  const actions = [];
  
  if (isAdminOrHR.value) {
    actions.push(
      {
        id: 'edit',
        label: 'Edit Record',
        variant: 'primary',
        handler: () => router.visit(route('attendances.edit', props.attendance.id))
      },
      {
        id: 'export',
        label: 'Export',
        variant: 'secondary',
        handler: () => window.open(route('attendances.export', props.attendance.id), '_blank')
      }
    );
  }
  
  if (hasRole('Admin')) {
    actions.push({
      id: 'delete',
      label: 'Delete',
      variant: 'danger',
      handler: deleteRecord
    });
  }
  
  return actions;
});

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const getStatusColor = (status) => {
  const colors = {
    'clocked_in': 'green',
    'clocked_out': 'gray',
    'on_break': 'yellow'
  };
  return colors[status] || 'gray';
};

const deleteRecord = () => {
  if (!confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
    return;
  }
  
  router.delete(route('attendances.destroy', props.attendance.id), {
    onSuccess: () => {
      router.visit(route('attendances.index'));
    }
  });
};
</script>