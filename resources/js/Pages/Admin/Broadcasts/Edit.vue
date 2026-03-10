<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Edit Broadcast"
      subtitle="Update your broadcast message"
      :breadcrumbs="breadcrumbs"
    >
      <form @submit.prevent="submit" class="max-w-4xl">
        <!-- Template Selection -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📝 Replace with Template</h3>
          <p class="text-sm text-gray-600 mb-4">Choose from our pre-made templates to replace the current content.</p>
          
          <div class="space-y-4">
            <div v-for="(category, categoryKey) in templateCategories" :key="categoryKey" class="space-y-2">
              <h4 class="text-sm font-medium text-gray-700">{{ category.label }}</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <button
                  v-for="templateKey in category.templates"
                  :key="templateKey"
                  type="button"
                  @click="applyTemplate(templateKey)"
                  class="text-left p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div class="text-sm font-medium text-gray-900">{{ templates[templateKey]?.title }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ getTypeIcon(templates[templateKey]?.type) }} {{ formatType(templates[templateKey]?.type) }}</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="e.g., New Performance Dashboard Released"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
            <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
          </div>

          <!-- Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Broadcast Type</label>
            <select
              v-model="form.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option v-for="type in types" :key="type" :value="type">
                {{ getTypeIcon(type) }} {{ formatType(type) }}
              </option>
            </select>
            <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
          </div>

          <!-- Email Template -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
            <select
              v-model="form.email_template"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="professional">📄 Professional - Clean and formal design</option>
              <option value="minimal">✨ Minimal - Simple and elegant layout</option>
              <option value="festive">🎉 Festive - Colorful and celebratory theme</option>
              <option value="celebration">🎊 Celebration - Special occasions and achievements</option>
            </select>
            <p v-if="errors.email_template" class="mt-1 text-sm text-red-600">{{ errors.email_template }}</p>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              v-model="form.content"
              rows="8"
              placeholder="Write your broadcast message here..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            ></textarea>
            <p v-if="errors.content" class="mt-1 text-sm text-red-600">{{ errors.content }}</p>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Any additional information for recipients..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Recipients Info -->
          <div class="border-t border-gray-200 pt-6">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-blue-800">Recipients</h3>
                  <p class="text-sm text-blue-700">This broadcast will be sent to all active employees in the system.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Test Email Section -->
          <div class="border-t border-gray-200 pt-6">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">🧪 Test Email Preview</h3>
              <p class="text-sm text-gray-600 mb-4">Send a test email to preview how your broadcast will look before sending to all employees.</p>
              
              <div class="flex space-x-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Test Email Address</label>
                  <input
                    v-model="testEmail"
                    type="email"
                    placeholder="admin@example.com"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div class="flex items-end">
                  <button
                    type="button"
                    @click="sendTestEmail"
                    :disabled="!testEmail || !form.title || !form.content || testEmailSending"
                    class="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ testEmailSending ? 'Sending...' : '📧 Send Test' }}
                  </button>
                </div>
              </div>
              
              <div v-if="testEmailMessage" class="mt-4 p-3 rounded-lg" :class="testEmailSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ testEmailMessage }}
              </div>
            </div>
          </div>

          <!-- Schedule -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Schedule (Optional)</h3>
            <label class="block text-sm font-medium text-gray-700 mb-2">Send At</label>
            <input
              v-model="form.scheduled_at"
              type="datetime-local"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <p class="mt-2 text-sm text-gray-600">Leave empty to save as draft. Set a time to schedule for later.</p>
          </div>

          <!-- Actions -->
          <div class="border-t border-gray-200 pt-6 flex space-x-4">
            <button
              type="submit"
              :disabled="processing"
              class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {{ form.scheduled_at ? 'Schedule Broadcast' : 'Save as Draft' }}
            </button>
            <Link
              :href="route('admin.broadcasts.index')"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Link, useForm, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const props = defineProps({
  broadcast: {
    type: Object,
    required: true
  },
  types: {
    type: Array,
    default: () => ['announcement', 'feature', 'wish', 'update', 'other']
  },
  templates: {
    type: Object,
    default: () => ({})
  },
  templateCategories: {
    type: Object,
    default: () => ({})
  },
});

const testEmail = ref('');
const testEmailSending = ref(false);
const testEmailMessage = ref('');
const testEmailSuccess = ref(false);

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Admin', href: '#' },
  { label: 'Broadcasts', href: route('admin.broadcasts.index') },
  { label: 'Edit', current: true }
]);

const { data: form, errors, processing, put } = useForm({
  title: props.broadcast.title || '',
  content: props.broadcast.content || '',
  type: props.broadcast.type || 'announcement',
  email_template: props.broadcast.email_template || 'professional',
  notes: props.broadcast.notes || '',
  scheduled_at: props.broadcast.scheduled_at || null,
});

const submit = () => {
  put(route('admin.broadcasts.update', props.broadcast.id));
};

const sendTestEmail = () => {
  if (!testEmail.value || !form.title || !form.content) {
    testEmailMessage.value = 'Please fill in the email address, title, and content before sending a test.';
    testEmailSuccess.value = false;
    return;
  }

  testEmailSending.value = true;
  testEmailMessage.value = '';

  const testData = {
    test_email: testEmail.value,
    title: form.title,
    content: form.content,
    type: form.type,
    email_template: form.email_template,
    notes: form.notes || ''
  };

  router.post(route('admin.broadcasts.test-email'), testData, {
    onSuccess: (page) => {
      testEmailMessage.value = `Test email sent successfully to ${testEmail.value}!`;
      testEmailSuccess.value = true;
      testEmailSending.value = false;
    },
    onError: (errors) => {
      testEmailMessage.value = errors.message || 'Failed to send test email. Please try again.';
      testEmailSuccess.value = false;
      testEmailSending.value = false;
    },
    onFinish: () => {
      testEmailSending.value = false;
    },
    preserveState: true,
    preserveScroll: true
  });
};

const applyTemplate = (templateKey) => {
  const template = props.templates[templateKey];
  if (template && confirm('This will replace the current content. Are you sure?')) {
    form.title = template.title;
    form.content = template.content;
    form.type = template.type;
    form.email_template = template.email_template || 'professional';
    form.notes = template.notes || '';
    
    // Scroll to the form
    setTimeout(() => {
      const formElement = document.querySelector('.bg-white.rounded-lg');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
};

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
</script>
