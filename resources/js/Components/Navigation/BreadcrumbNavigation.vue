<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Top Navigation Bar -->
    <nav :class="[
      'border-b',
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    ]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Left: Logo & Quick Nav -->
          <div class="flex items-center space-x-8">
            <div class="flex-shrink-0">
              <h1 :class="[
                'text-xl font-bold',
                isDark ? 'text-white' : 'text-gray-900'
              ]">
                HR Management
              </h1>
            </div>

            <!-- Quick Access Tabs -->
            <div class="hidden md:flex space-x-1">
              <button
                v-for="tab in quickTabs"
                :key="tab.id"
                @click="setActiveTab(tab.id)"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === tab.id
                    ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700')
                    : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                ]"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- Right: User & Settings -->
          <div class="flex items-center space-x-4">
            <button
              @click="toggleTheme"
              :class="[
                'p-2 rounded-lg transition-colors',
                isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
              ]"
            >
              <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <div class="flex items-center space-x-3">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              ]">
                {{ userInitials }}
              </div>
              <span :class="[
                'text-sm font-medium',
                isDark ? 'text-white' : 'text-gray-900'
              ]">
                {{ user?.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Breadcrumb Navigation -->
    <div :class="[
      'border-b',
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    ]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center space-x-4 py-3">
          <!-- Breadcrumbs -->
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
                <a
                  v-if="crumb.href && index < breadcrumbs.length - 1"
                  :href="crumb.href"
                  :class="[
                    'text-sm font-medium transition-colors',
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  ]"
                >
                  {{ crumb.label }}
                </a>
                <span
                  v-else
                  :class="[
                    'text-sm font-medium',
                    isDark ? 'text-white' : 'text-gray-900'
                  ]"
                >
                  {{ crumb.label }}
                </span>
                <svg
                  v-if="index < breadcrumbs.length - 1"
                  class="ml-2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </div>

    <!-- Tab Content Area -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Tab Content -->
      <div v-show="activeTab === 'personal'">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavCard
            title="My Profile"
            description="Update your personal information"
            :href="route('profile.edit')"
            icon="UserIcon"
          />
          <NavCard
            title="Time Tracking"
            description="Clock in/out and view attendance"
            :href="route('attendances.index')"
            icon="ClockIcon"
          />
          <NavCard
            title="Leave Applications"
            description="Apply for time off and view status"
            :href="route('leaves.index')"
            icon="CalendarIcon"
          />
          <NavCard
            title="My Assessments"
            description="View and complete assessments"
            :href="route('competency-assessments.my-assessments')"
            icon="ClipboardIcon"
          />
          <NavCard
            title="Work Reports"
            description="Submit and track work reports"
            :href="route('work-reports.index')"
            icon="DocumentIcon"
          />
          <NavCard
            title="Feedback"
            description="Give and receive feedback"
            :href="route('feedbacks.index')"
            icon="ChatIcon"
          />
        </div>
      </div>

      <div v-show="activeTab === 'management'" v-if="canManage">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavCard
            title="Employee Management"
            description="Manage employee records"
            :href="route('employees.index')"
            icon="UsersIcon"
          />
          <NavCard
            title="All Assessments"
            description="Review team assessments"
            :href="route('competency-assessments.index')"
            icon="ClipboardListIcon"
          />
          <NavCard
            title="Leave Policies"
            description="Manage leave types and policies"
            :href="route('leave-types.index')"
            icon="DocumentTextIcon"
          />
          <NavCard
            title="Analytics"
            description="View organizational insights"
            :href="route('organizational-analytics.index')"
            icon="ChartBarIcon"
          />
        </div>
      </div>

      <div v-show="activeTab === 'admin'" v-if="isAdmin">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavCard
            title="Role Management"
            description="Manage user roles and permissions"
            :href="route('admin.roles.index')"
            icon="ShieldCheckIcon"
          />
          <NavCard
            title="System Settings"
            description="Configure system preferences"
            :href="route('system-settings.index')"
            icon="CogIcon"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { useTheme } from '@/composables/useTheme.js'
import NavCard from './NavCard.vue'

const props = defineProps({
  currentRoute: String,
  breadcrumbs: {
    type: Array,
    default: () => []
  }
})

const { user, roles: userRoles } = useAuth()
const { isDark, toggleTheme } = useTheme()

const activeTab = ref('personal')

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

const canManage = computed(() => {
  return userRoles.value.includes('Admin') || userRoles.value.includes('Manager') || userRoles.value.includes('HR')
})

const isAdmin = computed(() => {
  return userRoles.value.includes('Admin')
})

const quickTabs = computed(() => {
  const tabs = [
    { id: 'personal', label: 'Personal' }
  ]
  
  if (canManage.value) {
    tabs.push({ id: 'management', label: 'Management' })
  }
  
  if (isAdmin.value) {
    tabs.push({ id: 'admin', label: 'Administration' })
  }
  
  return tabs
})

const setActiveTab = (tabId) => {
  activeTab.value = tabId
}
</script>