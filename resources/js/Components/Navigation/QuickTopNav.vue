<template>
  <!-- Simple Top Navigation Bar -->
  <nav :class="[
    'w-full border-b transition-colors duration-200 sticky top-0 z-50',
    isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
  ]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left Side -->
        <div class="flex items-center space-x-8">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <h1 :class="[
              'text-xl font-bold',
              isDark ? 'text-white' : 'text-gray-900'
            ]">
              HR Management
            </h1>
          </div>

          <!-- Main Navigation -->
          <div class="hidden md:flex space-x-1">
            <a
              v-for="item in mainNavItems"
              :key="item.route"
              :href="route(item.route)"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive(item.route)
                  ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700')
                  : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
              ]"
            >
              {{ item.label }}
            </a>

            <!-- More Menu for Additional Items -->
            <div class="relative" @mouseenter="showMore = true" @mouseleave="showMore = false">
              <button :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
                isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              ]">
                More
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div v-show="showMore" :class="[
                'absolute left-0 mt-1 w-56 rounded-md shadow-lg z-50',
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              ]">
                <div class="py-1">
                  <a
                    v-for="item in moreNavItems"
                    :key="item.route"
                    :href="route(item.route)"
                    :class="[
                      'block px-4 py-2 text-sm transition-colors',
                      isActive(item.route)
                        ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700')
                        : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
                    ]"
                  >
                    {{ item.label }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side -->
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
          <div class="relative" @mouseenter="showUserMenu = true" @mouseleave="showUserMenu = false">
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
            
            <div v-show="showUserMenu" :class="[
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

    <!-- Mobile Menu Button -->
    <div class="md:hidden px-4 pb-3">
      <button
        @click="showMobileMenu = !showMobileMenu"
        :class="[
          'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium',
          isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
        ]"
      >
        Menu
        <svg :class="['w-4 h-4 transition-transform', { 'rotate-180': showMobileMenu }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <!-- Mobile Menu Items -->
      <div v-show="showMobileMenu" class="mt-2 space-y-1">
        <a
          v-for="item in allNavItems"
          :key="item.route"
          :href="route(item.route)"
          :class="[
            'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive(item.route)
              ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700')
              : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
          ]"
        >
          {{ item.label }}
        </a>
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

// Debug logging to check user and roles
console.log('QuickTopNav - User:', user.value)
console.log('QuickTopNav - Roles:', userRoles.value)

const showMore = ref(false)
const showUserMenu = ref(false)
const showMobileMenu = ref(false)

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

// Ensure roles is always an array
const safeUserRoles = computed(() => {
  return Array.isArray(userRoles.value) ? userRoles.value : []
})

// Main navigation items (always visible)
const mainNavItems = computed(() => [
  { route: 'dashboard', label: 'Dashboard' },
  { route: 'profile.edit', label: 'My Profile' },
  { route: 'attendances.index', label: 'Time Tracking' },
  { route: 'leaves.index', label: 'Leave Requests' },
  { route: 'competency-assessments.my-assessments', label: 'My Assessments' }
])

// Additional navigation items (in dropdown)
const moreNavItems = computed(() => {
  const roles = userRoles.value
  const items = [
    { route: 'work-reports.index', label: 'Work Reports' },
    { route: 'work-reports.leaderboard', label: 'Leaderboard' },
    { route: 'feedbacks.index', label: 'Feedback' }
  ]

  // Add management items
  if (roles.includes('Admin') || roles.includes('Manager') || roles.includes('HR')) {
    items.push(
      { route: 'employees.index', label: 'Employee Management' },
      { route: 'competency-assessments.index', label: 'All Assessments' }
    )
  }

  // Add admin items
  if (roles.includes('Admin')) {
    items.push(
      { route: 'admin.roles.index', label: 'Role Management' },
      { route: 'system-settings.index', label: 'System Settings' },
      { route: 'organizational-analytics.index', label: 'Analytics' }
    )
  }

  return items
})

// All items for mobile menu
const allNavItems = computed(() => [
  ...mainNavItems.value,
  ...moreNavItems.value
])

const dropdownLinkClass = computed(() => [
  'block px-4 py-2 text-sm transition-colors',
  isDark.value 
    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
])

const isActive = (routeName) => {
  return props.currentRoute === routeName || props.currentRoute?.startsWith(routeName.split('.')[0])
}

const handleLogout = () => {
  router.post(route('logout'))
}
</script>