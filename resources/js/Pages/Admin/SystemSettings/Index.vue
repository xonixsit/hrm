<template>
  <AuthenticatedLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Page Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <!-- Breadcrumbs -->
            <nav class="flex mb-4" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2 text-sm">
                <li>
                  <Link :href="route('dashboard')" class="text-gray-500 hover:text-gray-700 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li class="flex items-center">
                  <ChevronRightIcon class="w-4 h-4 text-gray-400 mx-2" />
                  <span class="text-gray-900 font-medium">System Settings</span>
                </li>
              </ol>
            </nav>

            <!-- Page Title and Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl font-bold text-gray-900">System Settings</h1>
                <p class="mt-1 text-sm text-gray-600">Manage system configuration and preferences</p>
              </div>
              <div class="flex items-center space-x-3">
                <SecondaryButton @click="clearCache" :disabled="loading">
                  <TrashIcon class="w-4 h-4 mr-2" />
                  Clear Cache
                </SecondaryButton>
                <SecondaryButton @click="optimizeSystem" :disabled="loading">
                  <CogIcon class="w-4 h-4 mr-2" />
                  Optimize System
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Settings Form -->
          <div class="lg:col-span-2">
            <form @submit.prevent="updateSettings" class="space-y-6">
              
              <!-- General Settings -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900">General Settings</h2>
                </div>
                <div class="p-6 space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Application Name
                      </label>
                      <input
                        v-model="form.app_name"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        v-model="form.app_timezone"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        v-model.number="form.session_timeout"
                        type="number"
                        min="5"
                        max="1440"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Max File Upload (MB)
                      </label>
                      <input
                        v-model.number="form.max_file_upload"
                        type="number"
                        min="1"
                        max="100"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Security & Access -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900">Security & Access</h2>
                </div>
                <div class="p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">Maintenance Mode</label>
                      <p class="text-sm text-gray-500">Put the system in maintenance mode</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="form.maintenance_mode"
                        type="checkbox"
                        class="sr-only peer"
                      />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">User Registration</label>
                      <p class="text-sm text-gray-500">Allow new user registration</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="form.registration_enabled"
                        type="checkbox"
                        class="sr-only peer"
                      />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">Email Notifications</label>
                      <p class="text-sm text-gray-500">Send system email notifications</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="form.email_notifications"
                        type="checkbox"
                        class="sr-only peer"
                      />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Backup Settings -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900">Backup Settings</h2>
                </div>
                <div class="p-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Backup Frequency
                    </label>
                    <select
                      v-model="form.backup_frequency"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <div class="flex justify-end">
                <PrimaryButton type="submit" :disabled="loading">
                  <span v-if="loading">Saving...</span>
                  <span v-else>Save Settings</span>
                </PrimaryButton>
              </div>
            </form>
          </div>

          <!-- System Information -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- System Health -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">System Health</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Database</span>
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span class="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Cache</span>
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span class="text-sm font-medium text-green-600">Online</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Storage</span>
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span class="text-sm font-medium text-green-600">Writable</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Uptime</span>
                    <span class="text-sm font-medium text-gray-900">99.5%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- System Information -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">System Information</h3>
              </div>
              <div class="p-6">
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">PHP Version</span>
                    <span class="font-medium">{{ systemInfo.php_version }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Laravel Version</span>
                    <span class="font-medium">{{ systemInfo.laravel_version }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Environment</span>
                    <span class="font-medium capitalize">{{ systemInfo.environment }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Database</span>
                    <span class="font-medium capitalize">{{ systemInfo.database_type }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Cache Driver</span>
                    <span class="font-medium capitalize">{{ systemInfo.cache_driver }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Queue Driver</span>
                    <span class="font-medium capitalize">{{ systemInfo.queue_driver }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useForm, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import SecondaryButton from '@/Components/SecondaryButton.vue';
import {
  ChevronRightIcon,
  CogIcon,
  TrashIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  systemInfo: {
    type: Object,
    required: true
  }
});

const loading = ref(false);

const form = useForm({
  app_name: props.settings.app_name,
  app_timezone: props.settings.app_timezone,
  maintenance_mode: props.settings.maintenance_mode,
  registration_enabled: props.settings.registration_enabled,
  email_notifications: props.settings.email_notifications,
  backup_frequency: props.settings.backup_frequency,
  session_timeout: props.settings.session_timeout,
  max_file_upload: props.settings.max_file_upload,
});

const updateSettings = () => {
  form.post(route('system-settings.update'), {
    onStart: () => loading.value = true,
    onFinish: () => loading.value = false,
  });
};

const clearCache = () => {
  loading.value = true;
  form.post(route('system-settings.clear-cache'), {
    onFinish: () => loading.value = false,
  });
};

const optimizeSystem = () => {
  loading.value = true;
  form.post(route('system-settings.optimize'), {
    onFinish: () => loading.value = false,
  });
};
</script>

<style scoped>
/* Toggle switch styles are handled by Tailwind classes */
</style>