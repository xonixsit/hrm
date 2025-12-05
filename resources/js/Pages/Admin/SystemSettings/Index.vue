<template>
  <AuthenticatedLayout>
    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8 flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">System Settings</h1>
            <p class="mt-2 text-gray-600">Manage system configuration and preferences</p>
          </div>
          <div class="flex space-x-3">
            <button
              type="button"
              @click="clearCache"
              :disabled="processing"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            >
              <SparklesIcon class="w-4 h-4 mr-2" />
              CLEAR CACHE
            </button>
            <button
              type="button"
              @click="optimize"
              :disabled="processing"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            >
              <SparklesIcon class="w-4 h-4 mr-2" />
              OPTIMIZE SYSTEM
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            
            <!-- Left Column: Settings -->
            <div class="lg:col-span-2 space-y-8">
              
              <!-- General Settings -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
                <form @submit.prevent="updateSettings" class="space-y-6">
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Application Name -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Application Name</label>
                      <input
                        v-model="form.app_name"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    </div>

                    <!-- Company Location -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Company Location</label>
                      <input
                        v-model="form.company_location"
                        type="text"
                        placeholder="e.g., Chicago"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    </div>

                    <!-- Timezone -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        :value="form.app_timezone"
                        @change="(e) => updateTimezone(e.target.value)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="America/Chicago">America/Chicago</option>
                        <option value="America/Denver">America/Denver</option>
                        <option value="America/Los_Angeles">America/Los_Angeles</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="Europe/Paris">Europe/Paris</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                        <option value="Asia/Shanghai">Asia/Shanghai</option>
                        <option value="Asia/Kolkata">Asia/Kolkata</option>
                        <option value="Australia/Sydney">Australia/Sydney</option>
                      </select>
                    </div>

                    <!-- Session Timeout -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        v-model.number="form.session_timeout"
                        type="number"
                        min="5"
                        max="1440"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    </div>

                    <!-- Max File Upload -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Max File Upload (MB)</label>
                      <input
                        v-model.number="form.max_file_upload"
                        type="number"
                        min="1"
                        max="100"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>

              <!-- Security & Access -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Security & Access</h3>
                
                <div class="space-y-6">
                  <!-- Maintenance Mode -->
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Maintenance Mode</h4>
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

                  <!-- User Registration -->
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">User Registration</h4>
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

                  <!-- Email Notifications -->
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
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
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Backup Settings</h3>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                  <select
                    v-model="form.backup_frequency"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <!-- Save Button -->
              <div class="flex justify-center pt-6">
                <button
                  type="submit"
                  @click="updateSettings"
                  :disabled="processing"
                  class="px-8 py-3 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  {{ processing ? 'SAVING...' : 'SAVE SETTINGS' }}
                </button>
              </div>
            </div>

            <!-- Right Column: System Info -->
            <div class="space-y-8">
              
              <!-- System Health -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
                
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Database</span>
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span class="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Cache</span>
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span class="text-sm font-medium text-green-600">Online</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Storage</span>
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span class="text-sm font-medium text-green-600">Writable</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Uptime</span>
                    <span class="text-sm font-medium text-gray-900">99.5%</span>
                  </div>
                </div>
              </div>

              <!-- System Information -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">System Information</h3>
                
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">PHP Version</span>
                    <span class="text-sm font-medium text-gray-900">{{ systemInfo.php_version || '8.2.29' }}</span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Laravel Version</span>
                    <span class="text-sm font-medium text-gray-900">{{ systemInfo.laravel_version || '12.20.0' }}</span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Environment</span>
                    <span class="text-sm font-medium text-gray-900">{{ systemInfo.environment || 'Development' }}</span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Database</span>
                    <span class="text-sm font-medium text-gray-900">{{ systemInfo.database_type || 'Mysql' }}</span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Cache Driver</span>
                    <span class="text-sm font-medium text-gray-900">Database</span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Queue Driver</span>
                    <span class="text-sm font-medium text-gray-900">Database</span>
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
import { ref, reactive } from 'vue'
import { router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'

// Icons
import {
  CheckIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  systemInfo: {
    type: Object,
    required: true
  }
})

const processing = ref(false)

const timezoneLocationMap = {
  'UTC': 'UTC',
  'America/New_York': 'New York',
  'America/Chicago': 'Chicago',
  'America/Denver': 'Denver',
  'America/Los_Angeles': 'Los Angeles',
  'Europe/London': 'London',
  'Europe/Paris': 'Paris',
  'Asia/Tokyo': 'Tokyo',
  'Asia/Shanghai': 'Shanghai',
  'Asia/Kolkata': 'Kolkata',
  'Australia/Sydney': 'Sydney',
}

const form = reactive({
  app_name: props.settings.app_name,
  app_timezone: props.settings.app_timezone,
  company_location: props.settings.company_location,
  maintenance_mode: props.settings.maintenance_mode,
  registration_enabled: props.settings.registration_enabled,
  email_notifications: props.settings.email_notifications,
  backup_frequency: props.settings.backup_frequency,
  session_timeout: props.settings.session_timeout,
  max_file_upload: props.settings.max_file_upload,
})

const updateTimezone = (timezone) => {
  form.app_timezone = timezone
  // Auto-populate location based on timezone
  if (timezoneLocationMap[timezone]) {
    form.company_location = timezoneLocationMap[timezone]
  }
}

const updateSettings = () => {
  processing.value = true
  
  router.post(route('admin.system-settings.update'), form, {
    onFinish: () => {
      processing.value = false
    }
  })
}

const clearCache = () => {
  processing.value = true
  
  router.post(route('admin.system-settings.clear-cache'), {}, {
    onFinish: () => {
      processing.value = false
    }
  })
}

const optimize = () => {
  processing.value = true
  
  router.post(route('admin.system-settings.optimize'), {}, {
    onFinish: () => {
      processing.value = false
    }
  })
}
</script>