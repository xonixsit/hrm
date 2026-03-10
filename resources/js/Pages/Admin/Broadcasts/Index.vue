<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Broadcast Management"
      subtitle="Send announcements, features, wishes, and updates to employees"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Stats Cards -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="text-3xl font-bold text-gray-900">{{ stats.total }}</div>
          <div class="text-sm text-gray-600 mt-1">Total Broadcasts</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="text-3xl font-bold text-blue-600">{{ stats.draft }}</div>
          <div class="text-sm text-gray-600 mt-1">Drafts</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="text-3xl font-bold text-yellow-600">{{ stats.scheduled }}</div>
          <div class="text-sm text-gray-600 mt-1">Scheduled</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="text-3xl font-bold text-green-600">{{ stats.sent }}</div>
          <div class="text-sm text-gray-600 mt-1">Sent</div>
        </div>
      </div>

      <!-- Broadcasts Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="broadcast in broadcasts.data" :key="broadcast.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ broadcast.title }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTypeClasses(broadcast.type)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getTypeIcon(broadcast.type) }} {{ formatType(broadcast.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClasses(broadcast.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ formatStatus(broadcast.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ broadcast.recipients_count }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ broadcast.created_by.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ formatDate(broadcast.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <Link :href="route('admin.broadcasts.show', broadcast.id)" class="text-teal-600 hover:text-teal-900">
                      View
                    </Link>
                    <Link v-if="broadcast.status === 'draft'" :href="route('admin.broadcasts.edit', broadcast.id)" class="text-blue-600 hover:text-blue-900">
                      Edit
                    </Link>
                    <button v-if="broadcast.status === 'draft'" @click="deleteBroadcast(broadcast.id)" class="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="broadcasts.last_page > 1" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Showing {{ broadcasts.from }} to {{ broadcasts.to }} of {{ broadcasts.total }} results
        </div>
        <div class="flex space-x-2">
          <Link v-if="broadcasts.prev_page_url" :href="broadcasts.prev_page_url" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Previous
          </Link>
          <Link v-if="broadcasts.next_page_url" :href="broadcasts.next_page_url" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Next
          </Link>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const props = defineProps({
  broadcasts: Object,
  stats: Object,
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Admin', href: '#' },
  { label: 'Broadcasts', current: true }
]);

const headerActions = computed(() => [
  {
    label: 'Create Broadcast',
    href: route('admin.broadcasts.create'),
    variant: 'primary'
  }
]);

const getTypeIcon = (type) => {
  const icons = {
    announcement: '📢',
    feature: '✨',
    wish: '🎉',
    update: '🔄',
    other: '📧'
  };
  return icons[type] || '📧';
};

const formatType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const getTypeClasses = (type) => {
  const classes = {
    announcement: 'bg-blue-100 text-blue-800',
    feature: 'bg-purple-100 text-purple-800',
    wish: 'bg-pink-100 text-pink-800',
    update: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return classes[type] || 'bg-gray-100 text-gray-800';
};

const getStatusClasses = (status) => {
  const classes = {
    draft: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const deleteBroadcast = (id) => {
  if (confirm('Are you sure you want to delete this broadcast?')) {
    router.delete(route('admin.broadcasts.delete', id));
  }
};
</script>
