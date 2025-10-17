<template>
  <!-- Integrated Top Navigation with Better Visual Cohesion -->
  <nav :class="[
    'w-full transition-all duration-200 sticky top-0 z-50',
    // Enhanced background with subtle gradient and better shadow
    isDark 
      ? 'bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border-b border-gray-700 shadow-lg shadow-gray-900/20' 
      : 'bg-gradient-to-r from-white via-white to-blue-50/30 border-b border-gray-200/60 shadow-lg shadow-gray-900/10 backdrop-blur-sm'
  ]" 
  style="display: block !important; visibility: visible !important;"
  data-testid="integrated-top-navigation">
    
    <!-- Main Navigation Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-20">
        <!-- Left Side - Logo & Navigation -->
        <div class="flex items-center space-x-8">
          <!-- Enhanced Logo with Better Visual Weight -->
          <div class="flex-shrink-0 flex items-center">
            <div :class="[
              'flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200',
              isDark 
                ? 'bg-gray-800/50 border border-gray-700/50' 
                : 'bg-white/80 border border-gray-200/50 shadow-sm'
            ]">
              <!-- Logo Icon -->
              <div :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center',
                isDark ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              ]">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              
              <!-- Logo Text -->
              <div>
                <h1 :class="[
                  'text-xl font-bold leading-tight',
                  isDark ? 'text-white' : 'text-gray-900'
                ]">
                  eTaxPlanner
                </h1>
                <!-- Admin Badge with Better Integration -->
                <span v-if="Array.isArray(userRoles) && userRoles.includes('Admin')" :class="[
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  isDark 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : 'bg-red-50 text-red-600 border border-red-200'
                ]">
                  ADMIN
                </span>
              </div>
            </div>
          </div>

          <!-- Enhanced Main Navigation -->
          <div class="hidden lg:flex space-x-1">
            <a
              v-for="item in mainNavItems"
              :key="item.route"
              :href="route(item.route)"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 whitespace-nowrap',
                isActive(item.route)
                  ? (isDark 
                      ? 'bg-blue-600/20 text-blue-300' 
                      : 'bg-blue-50 text-blue-700')
                  : (isDark 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/60')
              ]"
            >
              <svg v-if="item.route === 'dashboard'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              <svg v-else-if="item.route === 'attendances.index'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else-if="item.route === 'leaves.index'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="hidden xl:inline">{{ item.label }}</span>
            </a>

            <!-- Enhanced More Menu -->
            <div class="relative">
              <button 
                @click="showMore = !showMore"
                :class="[
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1.5',
                  showMore
                    ? (isDark 
                        ? 'bg-gray-700/50 text-white' 
                        : 'bg-white/60 text-gray-900')
                    : (isDark 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-white/60')
                ]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span class="hidden xl:inline">More</span>
                <svg :class="['w-4 h-4 transition-transform duration-200', { 'rotate-180': showMore }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Enhanced Dropdown with Better Visual Integration -->
              <div v-show="showMore" :class="[
                'absolute left-0 mt-2 w-64 rounded-xl shadow-xl z-50 transition-all duration-200',
                isDark 
                  ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' 
                  : 'bg-white border border-gray-200/60 shadow-gray-900/20 backdrop-blur-sm'
              ]">
                <div class="p-2">
                  <div v-if="moreNavItems.length > 0" class="space-y-1">
                    <!-- Regular Items -->
                    <div class="space-y-1">
                      <a
                        v-for="item in regularMoreItems"
                        :key="item.route"
                        :href="route(item.route)"
                        :class="[
                          'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                          isActive(item.route)
                            ? (isDark 
                                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                                : 'bg-blue-50 text-blue-700 border border-blue-200/50')
                            : (isDark 
                                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50')
                        ]"
                      >
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{{ item.label }}</span>
                      </a>
                    </div>

                    <!-- Management Section -->
                    <div v-if="managementItems.length > 0" :class="[
                      'border-t pt-2 mt-2',
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    ]">
                      <div :class="[
                        'px-3 py-1 text-xs font-semibold uppercase tracking-wider',
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      ]">
                        Management
                      </div>
                      <div class="space-y-1 mt-1">
                        <a
                          v-for="item in managementItems"
                          :key="item.route"
                          :href="route(item.route)"
                          :class="[
                            'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                            isActive(item.route)
                              ? (isDark 
                                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                                  : 'bg-blue-50 text-blue-700 border border-blue-200/50')
                              : (isDark 
                                  ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50')
                          ]"
                        >
                          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{{ item.label }}</span>
                        </a>
                      </div>
                    </div>

                    <!-- Admin Section -->
                    <div v-if="adminItems.length > 0" :class="[
                      'border-t pt-2 mt-2',
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    ]">
                      <div :class="[
                        'px-3 py-1 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1',
                        isDark ? 'text-red-400' : 'text-red-600'
                      ]">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Admin</span>
                      </div>
                      <div class="space-y-1 mt-1">
                        <a
                          v-for="item in adminItems"
                          :key="item.route"
                          :href="route(item.route)"
                          :class="[
                            'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                            isActive(item.route)
                              ? (isDark 
                                  ? 'bg-red-600/20 text-red-300 border border-red-500/30' 
                                  : 'bg-red-50 text-red-700 border border-red-200/50')
                              : (isDark 
                                  ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50')
                          ]"
                        >
                          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{{ item.label }}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Enhanced User Controls -->
        <div class="flex items-center space-x-3">
          <!-- Theme Toggle with Better Integration -->
          <button
            @click="toggleTheme"
            :class="[
              'p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center',
              isDark 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50 border border-transparent hover:border-gray-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/60 border border-transparent hover:border-gray-200 hover:shadow-sm'
            ]"
          >
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Enhanced User Menu -->
          <div class="relative">
            <button 
              @click="showUserMenu = !showUserMenu"
              :class="[
                'flex items-center space-x-2 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                showUserMenu
                  ? (isDark 
                      ? 'bg-gray-700/50 text-white' 
                      : 'bg-white/60 text-gray-900')
                  : (isDark 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/60')
              ]">
              <div :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold',
                isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              ]">
                {{ userInitials }}
              </div>
              <div class="hidden lg:block text-left">
                <div class="font-medium text-sm">{{ user?.name }}</div>
                <div :class="[
                  'text-xs',
                  isDark ? 'text-gray-400' : 'text-gray-500'
                ]">
                  {{ userRoles?.join(', ') || 'User' }}
                </div>
              </div>
              <svg :class="['w-4 h-4 transition-transform duration-200', { 'rotate-180': showUserMenu }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Enhanced User Dropdown -->
            <div v-show="showUserMenu" :class="[
              'absolute right-0 mt-2 w-56 rounded-xl shadow-xl z-50 transition-all duration-200',
              isDark 
                ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' 
                : 'bg-white border border-gray-200/60 shadow-gray-900/20 backdrop-blur-sm'
            ]">
              <div class="p-2">
                <div :class="[
                  'px-3 py-2 border-b',
                  isDark ? 'border-gray-700' : 'border-gray-200'
                ]">
                  <div :class="[
                    'font-medium',
                    isDark ? 'text-white' : 'text-gray-900'
                  ]">{{ user?.name }}</div>
                  <div :class="[
                    'text-sm',
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  ]">{{ user?.email }}</div>
                </div>
                <div class="py-1 space-y-1">
                  <a :href="route('profile.edit')" :class="[
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isDark 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  ]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile Settings</span>
                  </a>
                  <button @click="handleLogout" :class="[
                    'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    'text-red-600 hover:text-red-700 hover:bg-red-50'
                  ]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="md:hidden px-4 pb-3">
      <button
        @click="showMobileMenu = !showMobileMenu"
        :class="[
          'w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
          isDark 
            ? 'text-gray-300 hover:bg-gray-700/50 border border-gray-700' 
            : 'text-gray-700 hover:bg-white/60 border border-gray-200'
        ]"
      >
        <span>Menu</span>
        <svg :class="['w-5 h-5 transition-transform duration-200', { 'rotate-180': showMobileMenu }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div v-show="showMobileMenu" class="mt-3 space-y-2">
        <a
          v-for="item in allNavItems"
          :key="item.route"
          :href="route(item.route)"
          :class="[
            'block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
            isActive(item.route)
              ? (isDark 
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                  : 'bg-blue-50 text-blue-700 border border-blue-200/50')
              : (isDark 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/60')
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

const showMore = ref(false)
const showUserMenu = ref(false)
const showMobileMenu = ref(false)

// Debug logging
console.log('IntegratedTopNav - User:', user.value)
console.log('IntegratedTopNav - Roles:', userRoles.value)
console.log('IntegratedTopNav - Is Admin:', userRoles.value?.includes('Admin'))
console.log('IntegratedTopNav - Component Loaded Successfully')

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

// Main navigation items
const mainNavItems = computed(() => [
  { route: 'dashboard', label: 'Dashboard' },
  { route: 'attendances.index', label: 'Time Tracking' },
  { route: 'leaves.index', label: 'Leave Requests' },
  { route: 'competency-assessments.my-assessments', label: 'My Assessments' }
])

// Categorized navigation items
const moreNavItems = computed(() => {
  try {
    const roles = userRoles.value || []
    const rolesArray = Array.isArray(roles) ? roles : []
    
    const items = [
      { route: 'work-reports.index', label: 'Work Reports', category: 'regular' },
      { route: 'work-reports.leaderboard', label: 'Leaderboard', category: 'regular' },
      { route: 'feedbacks.index', label: 'Feedback', category: 'regular' }
    ]

    const isManagement = rolesArray.includes('Admin') || rolesArray.includes('Manager') || rolesArray.includes('HR')
    const isAdmin = rolesArray.includes('Admin')

    if (isManagement) {
      items.push(
        { route: 'employees.index', label: 'Employee Management', category: 'management' },
        { route: 'competency-assessments.index', label: 'All Assessments', category: 'management' }
      )
    }

    if (isAdmin) {
      items.push(
        { route: 'admin.roles.index', label: 'Role Management', category: 'admin' },
        { route: 'admin.system-settings.index', label: 'System Settings', category: 'admin' },
        { route: 'organizational-analytics.index', label: 'Analytics', category: 'admin' }
      )
    }

    return items
  } catch (error) {
    console.error('Error computing moreNavItems:', error)
    return [
      { route: 'work-reports.index', label: 'Work Reports', category: 'regular' },
      { route: 'work-reports.leaderboard', label: 'Leaderboard', category: 'regular' },
      { route: 'feedbacks.index', label: 'Feedback', category: 'regular' }
    ]
  }
})

// Categorized items for better organization
const regularMoreItems = computed(() => 
  moreNavItems.value.filter(item => item.category === 'regular')
)

const managementItems = computed(() => 
  moreNavItems.value.filter(item => item.category === 'management')
)

const adminItems = computed(() => 
  moreNavItems.value.filter(item => item.category === 'admin')
)

// All items for mobile menu
const allNavItems = computed(() => [
  ...mainNavItems.value,
  ...moreNavItems.value
])

const isActive = (routeName) => {
  return props.currentRoute === routeName || props.currentRoute?.startsWith(routeName.split('.')[0])
}

const handleLogout = () => {
  router.post(route('logout'))
}
</script>