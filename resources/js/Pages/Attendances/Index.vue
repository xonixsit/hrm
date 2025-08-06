<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Attendance Management"
      subtitle="View and manage attendance records"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <ContentSection>
        <ContentCard>
          <!-- Simple Table for now -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-200">
              <thead class="bg-neutral-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Clock In</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Clock Out</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-neutral-200">
                <tr v-if="!attendances?.data?.length">
                  <td colspan="4" class="px-6 py-4 text-center text-neutral-500">
                    No attendance records found
                  </td>
                </tr>
                <tr v-for="attendance in attendances?.data || []" :key="attendance.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {{ attendance.date || '—' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {{ attendance.clock_in || '—' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {{ attendance.clock_out || '—' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    <Link 
                      v-if="isAdminOrHR" 
                      :href="route('attendances.edit', attendance.id)" 
                      class="text-primary-600 hover:text-primary-800"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ContentCard>
      </ContentSection>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentSection from '@/Components/Layout/ContentSection.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';

const props = defineProps({
  attendances: Object,
});

const { user, roles, hasRole, hasAnyRole } = useAuth();
const isSubmitting = ref(false);

// Convert roles array to role names for compatibility
const userRoles = computed(() => {
  try {
    return roles.value.map(role => typeof role === 'string' ? role : role.name);
  } catch (error) {
    console.error('Error processing user roles:', error);
    return [];
  }
});

const isAdminOrHR = computed(() => hasAnyRole(['Admin', 'HR']));
const canClockInOut = computed(() => hasRole('Employee'));

// Breadcrumbs configuration
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Attendance Management', current: true }
]);

// Header actions
const headerActions = computed(() => {
  const actions = [];
  
  if (canClockInOut.value) {
    actions.push(
      {
        id: 'clock-in',
        label: 'Clock In',
        variant: 'success',
        handler: clockIn,
        disabled: isSubmitting.value
      },
      {
        id: 'clock-out',
        label: 'Clock Out',
        variant: 'danger', 
        handler: clockOut,
        disabled: isSubmitting.value
      }
    );
  }
  
  return actions;
});

// Define table columns
const columns = computed(() => {
  const baseColumns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'clock_in', label: 'Clock In', sortable: true },
    { key: 'clock_out', label: 'Clock Out', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];
  
  // Add employee column for admin/HR
  if (isAdminOrHR.value) {
    baseColumns.splice(1, 0, { key: 'employee', label: 'Employee', sortable: true });
  }
  
  return baseColumns;
});

const clockIn = () => {
  isSubmitting.value = true;
  router.post(route('attendances.clockIn'), {}, {
    onSuccess: () => {
      isSubmitting.value = false;
    },
    onError: () => {
      isSubmitting.value = false;
    }
  });
};

const clockOut = () => {
  isSubmitting.value = true;
  router.post(route('attendances.clockOut'), {}, {
    onSuccess: () => {
      isSubmitting.value = false;
    },
    onError: () => {
      isSubmitting.value = false;
    }
  });
};
</script>

<style scoped>
.attendance-page {
  @apply min-h-screen bg-neutral-50 py-8;
}
</style>