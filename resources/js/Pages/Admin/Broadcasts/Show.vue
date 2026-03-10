<template>
  <AuthenticatedLayout>
    <PageLayout
      :title="broadcast.title"
      :subtitle="`${getTypeIcon(broadcast.type)} ${formatType(broadcast.type)} • ${formatStatus(broadcast.status)}`"
      :breadcrumbs="breadcrumbs"
    >
      <div class="grid grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="col-span-2 space-y-6">
          <!-- Broadcast Content -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Message Content</h3>
            <div class="prose prose-sm max-w-none">
              {{ broadcast.content }}
            </div>
            
            <div v-if="broadcast.notes" class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 class="font-semibold text-blue-900 mb-2">Additional Notes</h4>
              <p class="text-blue-800">{{ broadcast.notes }}</p>
            </div>
          </div>

          <!-- Recipients List -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recipients</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="recipient in recipients.data" :key="recipient.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm text-gray-900">{{ recipient.email }}</td>
                    <td class="px-6 py-4 text-sm">
                      <span :class="getStatusClasses(recipient.pivot.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ formatStatus(recipient.pivot.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">
                      {{ recipient.pivot.sent_at ? formatDate(recipient.pivot.sent_at) : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Stats -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div class="space-y-4">
              <div>
                <div class="text-sm text-gray-600">Total Recipients</div>
                <div class="text-2xl font-bold text-gray-900">{{ broadcast.recipients_count }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">Sent</div>
                <div class="text-2xl font-bold text-green-600">{{ broadcast.sent_count }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">Failed</div>
                <div class="text-2xl font-bold text-red-600">{{ broadcast.failed_count }}</div>
              </div>
            </div>
          </div>

          <!-- Details -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            <div class="space-y-4 text-sm">
              <div>
                <div class="text-gray-600">Type</div>
                <div class="font-medium text-gray-900">{{ formatType(broadcast.type) }}</div>
              </div>
              <div>
                <div class="text-gray-600">Status</div>
                <div class="font-medium text-gray-900">{{ formatStatus(broadcast.status) }}</div>
              </div>
              <div>
                <div class="text-gray-600">Created By</div>
                <div class="font-medium text-gray-900">{{ broadcast.created_by.name }}</div>
              </div>
              <div>
                <div class="text-gray-600">Created At</div>
                <div class="font-medium text-gray-900">{{ formatDate(broadcast.created_at) }}</div>
              </div>
              <div v-if="broadcast.sent_at">
                <div class="text-gray-600">Sent At</div>
                <div class="font-medium text-gray-900">{{ formatDate(broadcast.sent_at) }}</div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-2">
            <button
              v-if="broadcast.status === 'draft' || broadcast.status === 'scheduled'"
              @click="sendBroadcast"
              :disabled="sending"
              class="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {{ sending ? 'Sending...' : 'Send Now' }}
            </button>
            <Link
              v-if="broadcast.status === 'draft'"
              :href="route('admin.broadcasts.edit', broadcast.id)"
              class="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
            >
              Edit
            </Link>
            <Link
              :href="route('admin.broadcasts.index')"
              class="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const props = defineProps({
  broadcast: Object,
  recipients: Object,
});

const sending = ref(false);

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Admin', href: '#' },
  { label: 'Broadcasts', href: route('admin.broadcasts.index') },
  { label: props.broadcast.title, current: true }
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

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusClasses = (status) => {
  const classes = {
    pending: 'bg-gray-100 text-gray-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    bounced: 'bg-yellow-100 text-yellow-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const sendBroadcast = () => {
  if (confirm('Are you sure you want to send this broadcast to all recipients?')) {
    sending.value = true;
    router.post(route('admin.broadcasts.send', props.broadcast.id), {}, {
      onFinish: () => {
        sending.value = false;
      }
    });
  }
};
</script>
