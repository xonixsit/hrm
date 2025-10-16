<template>
  <nav :class="[
    'top-navigation w-full border-b transition-colors duration-200',
    isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
  ]">
    <!-- Main Navigation Bar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left Side - Logo & Main Nav -->
        <div class="flex items-center space-x-8">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <h1 :class="[
              'text-xl font-bold',
              isDark ? 'text-white' : 'text-gray-900'
            ]">
              HR Management
            </h1>
          </div>

          <!-- Main Navigation -->
          <div class="hidden md:flex space-x-1">
            <!-- Dashboard -->
            <a
              :href="route('dashboard')"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('dashboard')
                  ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700')
                  : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
              ]"
            >
              Dashboard
            </a>

            <!-- Employees Dropdown -->
            <div v-if="canAccessEmployees" class="relative" @mouseenter="showDropdown = 'employees'" @mouseleave="showDropdown = null">
              <button :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
                hasActiveChild(['employees', 'profile'])
                  ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700')
                  : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
              ]">
                People
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown -->
              <div v-show="showDropdown === 'employees'" :class="[
                'absolute left-0 mt-1 w-48 rounded-md shadow-lg z-50',
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              ]">
                <div class="py-1">
                  <a :href="route('profile.edit')" :class="dropdownLinkClass">My Profile</a>
                  <a v-if="canManageEmployees" :href="route('employees.index')" :class="dropdownLinkClass">All Employees</a>
                </div>
              </div>
            </div>

            <!-- Time & Attendance -->
            <div class="relative" @mouseenter="showDropdown = 'time'" @mouseleave="showDropdown = null">
              <button :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
                hasActiveChild(['attendances', 'leaves', 'leave-types'])
                  ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700')
                  : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
              ]">
                Time & Leave
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div v-show="showDropdown === 'time'" :class="[
                'absolute left-0 mt-1 w-48 rounded-md shadow-lg z-50',
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              ]">
                <div class="py-1">
                  <a :href="route('attendances.index')" :class="dropdownLinkClass">Time Tracking</a>
                  <a :href="route('leaves.index')" :class="dropdownLinkClass">Leave Requests</a>
                  <a v-if="canManageLeaves" :href="route('leave-types.index')" :class="dropdownLinkClass">Leave Policies</a>
                </div>
              </div>
            </div>

            <!-- Performance -->
            <div class="relative" @mouseenter="showDropdown = 'performance'" @mouseleave="showDropdown = null">
              <button :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
                hasActiveChild(['competency-assessments', 'work-reports', 'feedbacks'])
                  ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700')
                  : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
              ]">
                Performance
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div v-show="showDropdown === 'performance'" :class="[
                'absolute left-0 mt-1 w-56 rounded-md shadow-lg z-50',
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              ]">
                <div class="py-1">
                  <a :href="route('competency-assessments.my-assessments')" :class="dropdownLinkClass">My Assessments</a>
                  <a :href="route('work-reports.index')" :class="dropdownLinkClass">Work Reports</a>
                  <a :href="route('work-reports.leaderboard')" :class="dropdownLinkClass">Leaderboard</a>
                  <a :href="route('feedbacks.index')" :class="dropdownLinkClass">Feedback</a>
                  <div v-if="canManageAssessments" :class="[
                    'border-t my-1',
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  ]"></div>
                  <a v-if="canManageAssessments" :href="route('competency-assessments.index')" :class="dropdownLinkClass">All Assessments</a>
                  <a v-if="canManageAssessments" :href="route('assessment-dashboard')" :class="dropdownLinkClass">Assessment Dashboard</a>
                </div>
              </div>
            </div>

            <!-- Admin (if admin) -->
            <div v-if="isAdmin" class="relative" @mouseenter="showDropdown = 'admin'" @mouseleave="showDropdown = null">
              <button :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
                hasActiveChild(['admin', 'system-settings'])
                  ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700')
                  : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
              ]">
                Admin
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div v-show="showDropdown === 'admin'" :class="[
                'absolute left-0 mt-1 w-48 rounded-md shadow-lg z-50',
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              ]">
                <div class="py-1">
                  <a :href="route('admin.roles.index')" :class="dropdownLinkClass">Role Management</a>
                  <a :href="route('system-settings.index')" :class="dropdownLinkClass">System Settings</a>
                  <a :href="route('organizational-analytics.index')" :class="dropdownLinkClass">Analytics</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - User Menu -->
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            :class="[
              'p-2 rounded-md transition-colors',
              isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            ]"
          >
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- User Menu -->
          <div class="relative" @mouseenter="showDropdown = 'user'" @mouseleave="showDropdown = null">
            <button :class="[
              'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            ]">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              ]">
                {{ userInitials }}
              </div>
              <span class="hidden md:block">{{ user?.name }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div v-show="showDropdown === 'user'" :class="[
              'absolute right-0 mt-1 w-48 rounded-md shadow-lg z-50',
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            ]">
              <div class="py-1">
                <a :href="route('profile.edit')" :class="dropdownLinkClass">Profile Settings</a>
                <button @click="handleLogout" :class="[
                  dropdownLinkClass,
                  'w-full text-left text-red-600 hover:text-red-700 hover:bg-red-50'
                ]">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div v-show="showMobileMenu" :class="[
      'md:hidden border-t',
      isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
    ]">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <!-- Mobile nav items here -->
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { router } from '@inertiajs/vue3'
import { useAuth } from '@/composables/useAuth.js'
import { useTheme } from '@/composables/useTheme.js'

const props = defineProps({
  currentRoute: {
    type: String,
    required: true,
  }
})

const { user, roles: userRoles } = useAuth()
const { isDark, toggleTheme } = useTheme()

const showDropdown = ref(null)
const showMobileMenu = ref(false)

// Computed properties
const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

const canAccessEmployees = computed(() => {
  return userRoles.value.includes('Admin') || userRoles.value.includes('Manager') || userRoles.value.includes('HR')
})

const canManageEmployees = computed(() => {
  return userRoles.value.includes('Admin') || userRoles.value.includes('Manager') || userRoles.value.includes('HR')
})

const canManageLeaves = computed(() => {
  return userRoles.value.includes('Admin') || userRoles.value.includes('HR')
})

const canManageAssessments = computed(() => {
  return userRoles.value.includes('Admin') || userRoles.value.includes('Manager')
})

const isAdmin = computed(() => {
  return userRoles.value.includes('Admin')
})

const dropdownLinkClass = computed(() => [
  'block px-4 py-2 text-sm transition-colors',
  isDark.value 
    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
])

// Methods
const isActive = (routeName) => {
  return props.currentRoute === routeName
}

const hasActiveChild = (routeNames) => {
  return routeNames.some(name => props.currentRoute.startsWith(name))
}

const handleLogout = () => {
  router.post(route('logout'))
}
</script>