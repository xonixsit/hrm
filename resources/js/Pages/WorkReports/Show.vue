<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Work Report Details"
      subtitle="View sales activity report"
      :breadcrumbs="breadcrumbs"
    >
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Employee Information Section -->
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4" v-if="isManagerOrAdmin">
          <h3 class="text-lg font-medium text-gray-900">Employee Information</h3>
        </div>
        <div class="px-6 py-4" v-if="isManagerOrAdmin">
          <table class="min-w-full divide-y divide-gray-200">
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="py-3 text-sm font-medium text-gray-500 w-1/4">Name</td>
                <td class="py-3 text-sm text-gray-900">{{ workReport.employee.user.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Report Details Section -->
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h3 class="text-lg font-medium text-gray-900">Report Details</h3>
        </div>
        <div class="px-6 py-4">
          <table class="min-w-full divide-y divide-gray-200">
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="py-3 text-sm font-medium text-gray-500 w-1/4">Date</td>
                <td class="py-3 text-sm text-gray-900">{{ formattedDate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Call Statistics Section -->
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h3 class="text-lg font-medium text-gray-900">Call Statistics</h3>
        </div>
        <div class="px-6 py-4">
          <table class="min-w-full divide-y divide-gray-200">
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="py-3 text-sm font-medium text-gray-500 w-1/4">Total Calls Made</td>
                <td class="py-3 text-sm text-gray-900">{{ workReport.calls }}</td>
              </tr>
              <tr>
                <td class="py-3 text-sm font-medium text-gray-500 w-1/4">Calls Not Received</td>
                <td class="py-3 text-sm text-gray-900">{{ workReport.calls_not_received || 0 }}</td>
              </tr>
              <tr>
                <td class="py-3 text-sm font-medium text-gray-500 w-1/4">Disconnected Calls</td>
                <td class="py-3 text-sm text-gray-900">{{ workReport.disconnected_calls || 0 }}</td>
              </tr>
              <tr>
                <td class="py-3 text-sm font-medium text-gray-500 w-1/4">Follow-up Calls</td>
                <td class="py-3 text-sm text-gray-900">{{ workReport.follow_up_calls || 0 }}</td>
              </tr>
              <tr>
                <td class="py-3 text-sm font-medium text-gray-500 w-1/4">Successful Calls</td>
                <td class="py-3 text-sm text-gray-900">{{ workReport.successful_calls || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Other Communication Section -->
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h3 class="text-lg font-medium text-gray-900">Other Communication</h3>
        </div>
        <div class="px-6 py-4">
          <table class="min-w-full divide-y divide-gray-200">
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="py-3 text-sm font-medium text-gray-500 w-1/4">Emails</td>
                <td class="py-3 text-sm text-gray-900">{{ workReport.emails }}</td>
              </tr>
              <tr>
                <td class="py-3 text-sm font-medium text-gray-500 w-1/4">WhatsApp</td>
                <td class="py-3 text-sm text-gray-900">{{ workReport.whatsapp }}</td>
              </tr>
              <tr>
                <td class="py-3 text-sm font-medium text-gray-500 w-1/4">SMS</td>
                <td class="py-3 text-sm text-gray-900">{{ workReport.sms }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Notes Section -->
        <div v-if="workReport.notes" class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h3 class="text-lg font-medium text-gray-900">Notes</h3>
        </div>
        <div v-if="workReport.notes" class="px-6 py-4">
          <div class="prose max-w-none">
            <p class="whitespace-pre-line text-sm text-gray-900">{{ workReport.notes }}</p>
          </div>
        </div>
        
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <Link
            :href="route('work-reports.index')"
            class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to List
          </Link>
          <Link
            v-if="canEdit"
            :href="route('work-reports.edit', workReport.id)"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Report
          </Link>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth';
import { computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const props = defineProps({
  workReport: Object,
});

const { hasAnyRole, user } = useAuth();
const isManagerOrAdmin = computed(() => hasAnyRole(['Admin', 'Manager', 'HR']));

// Format date for display
const formattedDate = computed(() => {
  if (!props.workReport.date) return '';
  return new Date(props.workReport.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Check if user can edit this report
const canEdit = computed(() => {
  if (isManagerOrAdmin.value) return true;
  if (user.value && user.value.employee && props.workReport.employee_id === user.value.employee.id) return true;
  return false;
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Work Reports', href: route('work-reports.index') },
  { label: 'View Report', current: true }
]);
</script>