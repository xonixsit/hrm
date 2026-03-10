<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Create Broadcast"
      subtitle="Send a new announcement, feature, wish, or update"
      :breadcrumbs="breadcrumbs"
    >
      <form @submit.prevent="handleSubmit" class="max-w-4xl">
        <!-- Template Selection -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📝 Quick Start with Templates</h3>
          <p class="text-sm text-gray-600 mb-4">Choose from our pre-made templates for common occasions and events.</p>
          
          <div class="space-y-4">
            <div v-for="(category, categoryKey) in templateCategories" :key="categoryKey" class="space-y-2">
              <h4 class="text-sm font-medium text-gray-700">{{ category.label }}</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <button
                  v-for="templateKey in category.templates"
                  :key="templateKey"
                  type="button"
                  @click="applyTemplate(templateKey)"
                  class="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  :class="{ 'border-blue-500 bg-blue-50': appliedTemplate === templateKey }"
                >
                  <div class="text-sm font-medium text-gray-900">{{ templates[templateKey]?.title }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ getTypeIcon(templates[templateKey]?.type) }} {{ formatType(templates[templateKey]?.type) }}</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <!-- Applied Template Indicator -->
          <div v-if="appliedTemplate" class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium text-green-800">Template Applied: {{ templates[appliedTemplate]?.title }}</span>
            </div>
            <button
              type="button"
              @click="clearTemplate"
              class="text-green-600 hover:text-green-800 text-sm"
            >
              Clear Template
            </button>
          </div>

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
            <p v-if="form.errors.title" class="mt-1 text-sm text-red-600">{{ form.errors.title }}</p>
          </div>

          <!-- Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Broadcast Type</label>
            <select
              v-model="form.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option v-for="type in props.types" :key="type" :value="type">
                {{ getTypeIcon(type) }} {{ formatType(type) }}
              </option>
            </select>
            <p v-if="form.errors.type" class="mt-1 text-sm text-red-600">{{ form.errors.type }}</p>
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
            <p v-if="form.errors.email_template" class="mt-1 text-sm text-red-600">{{ form.errors.email_template }}</p>
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
            <p v-if="form.errors.content" class="mt-1 text-sm text-red-600">{{ form.errors.content }}</p>
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

          <!-- Attachments -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref="fileInput"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                @change="handleFileSelect"
                class="hidden"
              />
              <div v-if="selectedFiles.length === 0">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-8l-3.172-3.172a4 4 0 00-5.656 0L28 20M9 20l3.172-3.172a4 4 0 015.656 0L28 20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="mt-4">
                  <button
                    type="button"
                    @click="$refs.fileInput.click()"
                    class="text-teal-600 hover:text-teal-500 font-medium"
                  >
                    Click to upload files
                  </button>
                  <p class="text-gray-500">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  PDF, DOC, XLS, PPT, TXT, JPG, PNG, GIF up to 10MB each
                </p>
              </div>
              <div v-else class="space-y-2">
                <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div class="flex items-center space-x-3">
                    <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                      <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="removeFile(index)"
                    class="text-red-500 hover:text-red-700"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="text-teal-600 hover:text-teal-500 text-sm font-medium"
                >
                  Add more files
                </button>
              </div>
            </div>
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
              :disabled="form.processing"
              class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {{ form.processing ? 'Creating...' : (form.scheduled_at ? 'Schedule Broadcast' : 'Save as Draft') }}
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
import { Link, useForm } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const props = defineProps({
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

const appliedTemplate = ref(null);
const testEmail = ref('');
const testEmailSending = ref(false);
const testEmailMessage = ref('');
const testEmailSuccess = ref(false);
const selectedFiles = ref([]);

const form = useForm({
  title: '',
  content: '',
  type: 'announcement',
  email_template: 'professional',
  notes: '',
  scheduled_at: null,
  attachments: [],
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Admin', href: '#' },
  { label: 'Broadcasts', href: route('admin.broadcasts.index') },
  { label: 'Create', current: true }
]);

const handleSubmit = () => {
  console.log('Submitting form data:', form.data());
  
  // Create FormData to handle file uploads
  const formData = new FormData();
  formData.append('title', form.title);
  formData.append('content', form.content);
  formData.append('type', form.type);
  formData.append('email_template', form.email_template);
  formData.append('notes', form.notes || '');
  if (form.scheduled_at) {
    formData.append('scheduled_at', form.scheduled_at);
  }
  
  // Add files
  selectedFiles.value.forEach((file, index) => {
    formData.append(`attachments[${index}]`, file);
  });
  
  form.post(route('admin.broadcasts.store'), {
    data: formData,
    forceFormData: true,
    onSuccess: () => {
      console.log('Form submitted successfully');
    },
    onError: (errors) => {
      console.log('Form submission errors:', errors);
    }
  });
};

const sendTestEmail = async () => {
  if (!testEmail.value || !form.title || !form.content) {
    testEmailMessage.value = 'Please fill in the email address, title, and content before sending a test.';
    testEmailSuccess.value = false;
    return;
  }

  testEmailSending.value = true;
  testEmailMessage.value = '';

  // Create FormData for test email with attachments
  const formData = new FormData();
  formData.append('test_email', testEmail.value);
  formData.append('title', form.title);
  formData.append('content', form.content);
  formData.append('type', form.type);
  formData.append('email_template', form.email_template);
  formData.append('notes', form.notes || '');
  
  // Add files to test email
  selectedFiles.value.forEach((file, index) => {
    formData.append(`attachments[${index}]`, file);
  });

  try {
    const response = await fetch(route('admin.broadcasts.test-email'), {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      body: formData
    });

    const data = await response.json();
    
    if (data.success || data.message) {
      let message = data.message || `Test email sent successfully to ${testEmail.value}!`;
      if (data.attachments_count > 0) {
        message += ` (${data.attachments_count} attachment${data.attachments_count > 1 ? 's' : ''} included)`;
      }
      testEmailMessage.value = message;
      testEmailSuccess.value = true;
    } else {
      testEmailMessage.value = data.error || 'Failed to send test email. Please try again.';
      testEmailSuccess.value = false;
    }
  } catch (error) {
    testEmailMessage.value = 'Network error. Please try again.';
    testEmailSuccess.value = false;
    console.error('Test email error:', error);
  } finally {
    testEmailSending.value = false;
  }
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];

  const validFiles = files.filter(file => {
    if (file.size > maxSize) {
      alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
      return false;
    }
    if (!allowedTypes.includes(file.type)) {
      alert(`File "${file.name}" is not a supported format.`);
      return false;
    }
    return true;
  });

  selectedFiles.value = [...selectedFiles.value, ...validFiles];
  event.target.value = ''; // Reset input
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const applyTemplate = (templateKey) => {
  const template = props.templates[templateKey];
  if (template) {
    form.title = template.title;
    form.content = template.content;
    form.type = template.type;
    form.email_template = template.email_template || 'professional';
    form.notes = template.notes || '';
    appliedTemplate.value = templateKey;
    
    // Scroll to the form
    setTimeout(() => {
      const formElement = document.querySelector('.bg-white.rounded-lg');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
};

const clearTemplate = () => {
  appliedTemplate.value = null;
  form.title = '';
  form.content = '';
  form.type = 'announcement';
  form.email_template = 'professional';
  form.notes = '';
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