<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Attendance Details"
      :subtitle="`${attendance.employee?.user?.name || 'Employee'} - ${formatDate(attendance.date)}`"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="space-y-6">
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <InfoCard
            title="Work Duration"
            :value="workDuration"
            icon="clock"
            color="blue"
          />
          <InfoCard
            title="Break Duration"
            :value="breakDuration"
            icon="pause"
            color="orange"
          />
          <InfoCard
            title="Break Sessions"
            :value="breakSessions.length.toString()"
            icon="list"
            color="green"
          />
          <InfoCard
            title="Status"
            :value="attendance.status ? attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1).replace('_', ' ') : 'Unknown'"
            icon="status"
            :color="getStatusColor(attendance.status)"
          />
        </div>

        <!-- Main Details -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Time Details -->
          <ContentCard title="Time Details">
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Date</span>
                <span class="text-sm text-neutral-900">{{ formatDate(attendance.date) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Clock In</span>
                <span class="text-sm text-neutral-900">
                  {{ attendance.clock_in ? formatTime(attendance.clock_in) : '—' }}
                </span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Clock Out</span>
                <span class="text-sm text-neutral-900">
                  {{ attendance.clock_out ? formatTime(attendance.clock_out) : '—' }}
                </span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Total Minutes</span>
                <span class="text-sm text-neutral-900">{{ totalMinutes }} minutes</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-sm font-medium text-neutral-600">Current Status</span>
                <span :class="getStatusBadgeClasses(attendance.status)">
                  {{ attendance.status ? attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1).replace('_', ' ') : 'Unknown' }}
                </span>
              </div>
            </div>
          </ContentCard>

          <!-- Employee & Location Details -->
          <ContentCard title="Employee & Location">
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Employee</span>
                <span class="text-sm text-neutral-900">{{ attendance.employee?.user?.name || 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">IP Address</span>
                <span class="text-sm text-neutral-900 font-mono">{{ attendance.ip_address || 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Location</span>
                <span class="text-sm text-neutral-900">{{ attendance.location || 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-neutral-200">
                <span class="text-sm font-medium text-neutral-600">Coordinates</span>
                <span class="text-sm text-neutral-900">
                  {{ attendance.latitude && attendance.longitude 
                     ? `${attendance.latitude}, ${attendance.longitude}` 
                     : 'N/A' }}
                </span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-sm font-medium text-neutral-600">Location Verified</span>
                <span :class="attendance.location_verified ? 'text-green-600' : 'text-red-600'">
                  {{ attendance.location_verified ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
          </ContentCard>
        </div>

        <!-- Break Sessions -->
        <ContentCard v-if="breakSessions.length > 0" title="Break Sessions">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-200">
              <thead class="bg-neutral-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-neutral-200">
                <tr v-for="(session, index) in breakSessions" :key="index">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    Break {{ index + 1 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {{ formatTime(session.start) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {{ session.end ? formatTime(session.end) : 'Ongoing' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {{ formatDuration(session.duration_minutes) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ContentCard>

        <!-- Notes -->
        <ContentCard v-if="attendance.notes" title="Notes">
          <div class="bg-neutral-50 rounded-lg p-4">
            <p class="text-sm text-neutral-700">{{ attendance.notes }}</p>
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
import { Link, router } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import InfoCard from '@/Components/Layout/InfoCard.vue';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

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
    second: '2-digit'
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
    minute: '2-digit'
  });
};

const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const getStatusColor = (status) => {
  const colorMap = {
    'clocked_in': 'green',
    'clocked_out': 'blue',
    'on_break': 'orange',
    'absent': 'red'
  };
  return colorMap[status] || 'neutral';
};

const getStatusBadgeClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const colorMap = {
    'clocked_in': 'bg-green-100 text-green-800',
    'clocked_out': 'bg-blue-100 text-blue-800',
    'on_break': 'bg-orange-100 text-orange-800',
    'absent': 'bg-red-100 text-red-800'
  };
  
  return `${baseClasses} ${colorMap[status] || 'bg-neutral-100 text-neutral-800'}`;
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
</template>