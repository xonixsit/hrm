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
              <div class="flex justify-between items-center py-2">
                <span class="text-sm font-medium text-neutral-600">Total Work Time</span>
                <span class="text-sm font-bold text-neutral-900">{{ workDuration }}</span>
              </div>
            </div>
          </ContentCard>

          <!-- Break Sessions -->
          <ContentCard title="Break Sessions">
            <div v-if="breakSessions.length === 0" class="text-center py-8">
              <p class="text-neutral-500">No break sessions recorded</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="(session, index) in breakSessions"
                :key="index"
                class="flex justify-between items-center p-3 bg-neutral-50 rounded-lg"
              >
                <div>
                  <p class="text-sm font-medium text-neutral-900">Break {{ index + 1 }}</p>
                  <p class="text-xs text-neutral-600">
                    {{ formatTime(session.start) }} - {{ session.end ? formatTime(session.end) : 'Ongoing' }}
                  </p>
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