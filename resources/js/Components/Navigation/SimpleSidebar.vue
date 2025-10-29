<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <nav :class="[
      'sidebar flex flex-col transition-all duration-300 ease-in-out border-r',
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      isCollapsed ? 'w-16' : 'w-64'
    ]">
      <!-- Header -->
      <div :class="[
        'flex items-center justify-between p-4 border-b',
        isDark ? 'border-gray-700' : 'border-gray-200'
      ]">
        <div v-if="!isCollapsed" class="flex-1">
          <h1 :class="[
            'text-lg font-semibold',
            isDark ? 'text-white' : 'text-gray-900'
          ]">
            HR System
          </h1>
        </div>
        <button
          @click="toggleCollapse"
          :class="[
            'p-2 rounded-lg transition-colors',
            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          ]"
        >
          <svg class="w-5 h-5" :class="{ 'rotate-180': isCollapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto py-4">
        <div :class="['space-y-1', isCollapsed ? 'px-2' : 'px-4']">
          <template v-for="item in navigationItems" :key="item.id">
            <!-- Section Header -->
            <div v-if="item.type === 'section' && !isCollapsed" :class="[
              'px-3 py-2 text-xs font-semibold uppercase tracking-wider',
              isDark ? 'text-gray-400' : 'text-gray-500'
            ]">
              {{ item.label }}
            </div>

            <!-- Navigation Item -->
            <a
              v-else
              :href="route(item.route)"
              :class="[
                'flex items-center rounded-lg transition-colors group',
                isCollapsed ? 'p-3 justify-center' : 'px-3 py-2',
                isActive(item.route)
                  ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700')
                  : (isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100')
              ]"
              :title="isCollapsed ? item.label : ''"
            >
              <component :is="item.icon" :class="[
                'flex-shrink-0',
                isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'
              ]" />
              <span v-if="!isCollapsed" class="text-sm font-medium">{{ item.label }}</span>
            </a>
          </template>
        </div>
      </div>

      <!-- Footer -->
      <div :class="[
        'p-4 border-t',
        isDark ? 'border-gray-700' : 'border-gray-200'
      ]">
        <button
          @click="handleLogout"
          :class="[
            'flex items-center w-full rounded-lg transition-colors text-red-600 hover:bg-red-50',
            isCollapsed ? 'p-3 justify-center' : 'px-3 py-2'
          ]"
          :title="isCollapsed ? 'Logout' : ''"
        >
          <svg :class="[
            'flex-shrink-0',
            isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'
          ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-if="!isCollapsed" class="text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header :class="[
        'flex items-center justify-between px-6 py-4 border-b',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      ]">
        <div class="flex items-center space-x-4">
          <h2 :class="[
            'text-xl font-semibold',
            isDark ? 'text-white' : 'text-gray-900'
          ]">
            {{ pageTitle }}
          </h2>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            :class="[
              'p-2 rounded-lg transition-colors',
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
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
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { router } from '@inertiajs/vue3'
import { useAuth } from '@/composables/useAuth.js'
import { useTheme } from '@/composables/useTheme.js'

const props = defineProps({
  currentRoute: String,
  pageTitle: String
})

const { user, roles: userRoles } = useAuth()
const { isDark, toggleTheme } = useTheme()

const isCollapsed = ref(false)

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

// Simplified navigation structure
const navigationItems = computed(() => {
  const roles = userRoles.value
  const items = []

  // Core items for everyone
  items.push(
    { id: 'dashboard', label: 'Dashboard', route: 'dashboard', icon: 'HomeIcon' },
    { id: 'profile', label: 'My Profile', route: 'profile.edit', icon: 'UserIcon' },
    { id: 'attendance', label: 'Time Tracking', route: 'attendances.index', icon: 'ClockIcon' },
    { id: 'leaves', label: 'Leave Requests', route: 'leaves.index', icon: 'CalendarIcon' },
    { id: 'assessments', label: 'My Assessments', route: 'competency-assessments.my-assessments', icon: 'ClipboardIcon' },
    { id: 'reports', label: 'Work Reports', route: 'work-reports.index', icon: 'DocumentIcon' },
    { id: 'handbook', label: 'Employee Handbook', route: 'employee-handbook', icon: 'BookOpenIcon' }
  )

  // Management items
  if (roles.includes('Admin') || roles.includes('Manager') || roles.includes('HR')) {
    items.push(
      { type: 'section', label: 'Management' },
      { id: 'employees', label: 'Employees', route: 'employees.index', icon: 'UsersIcon' },
      { id: 'all-assessments', label: 'All Assessments', route: 'competency-assessments.index', icon: 'ClipboardListIcon' }
    )
  }

  // Admin items
  if (roles.includes('Admin')) {
    items.push(
      { type: 'section', label: 'Administration' },
      { id: 'roles', label: 'Role Management', route: 'admin.roles.index', icon: 'ShieldCheckIcon' },
      { id: 'settings', label: 'System Settings', route: 'system-settings.index', icon: 'CogIcon' }
    )
  }

  return items
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const isActive = (routeName) => {
  return props.currentRoute === routeName || props.currentRoute?.startsWith(routeName.split('.')[0])
}

const handleLogout = () => {
  router.post(route('logout'))
}
</script>