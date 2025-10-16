<template>
  <!-- Bulletproof Top Navigation -->
  <nav class="w-full border-b bg-white border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left Side -->
        <div class="flex items-center space-x-8">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <h1 class="text-xl font-bold text-gray-900">
              HR Management
              <span v-if="isAdmin" class="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">
                ADMIN
              </span>
            </h1>
          </div>

          <!-- Main Navigation -->
          <div class="hidden md:flex space-x-1">
            <a href="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700">
              Dashboard
            </a>
            <a href="/profile" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              My Profile
            </a>
            <a href="/attendances" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Time Tracking
            </a>
            <a href="/leaves" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Leave Requests
            </a>
            <a href="/competency-assessments/my-assessments" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              My Assessments
            </a>
            
            <!-- More Dropdown -->
            <div class="relative group">
              <button class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center">
                More
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div class="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div class="py-1">
                  <a href="/work-reports" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Work Reports</a>
                  <a href="/work-reports/leaderboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Leaderboard</a>
                  <a href="/feedbacks" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Feedback</a>
                  
                  <!-- Management Items -->
                  <template v-if="isManagement">
                    <div class="border-t border-gray-100 my-1"></div>
                    <a href="/employees" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Employee Management</a>
                    <a href="/competency-assessments" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">All Assessments</a>
                  </template>
                  
                  <!-- Admin Items -->
                  <template v-if="isAdmin">
                    <div class="border-t border-gray-100 my-1"></div>
                    <a href="/admin/roles" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Role Management</a>
                    <a href="/system-settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">System Settings</a>
                    <a href="/organizational-analytics" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Analytics</a>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side -->
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button class="p-2 rounded-md text-gray-500 hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          <!-- User Menu -->
          <div class="relative group">
            <button class="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                {{ userInitials }}
              </div>
              <span class="hidden md:block">{{ userName }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div class="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div class="py-1">
                <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile Settings</a>
                <form method="POST" action="/logout" class="inline">
                  <button type="submit" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'

// Simple, safe access to user data
const page = usePage()
const user = computed(() => page.props.auth?.user || null)
const userRoles = computed(() => user.value?.roles || [])

// Safe role checks
const isAdmin = computed(() => {
  try {
    return Array.isArray(userRoles.value) && userRoles.value.includes('Admin')
  } catch {
    return false
  }
})

const isManagement = computed(() => {
  try {
    const roles = userRoles.value
    return Array.isArray(roles) && (roles.includes('Admin') || roles.includes('Manager') || roles.includes('HR'))
  } catch {
    return false
  }
})

const userName = computed(() => user.value?.name || 'User')
const userInitials = computed(() => {
  try {
    const name = userName.value
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  } catch {
    return 'U'
  }
})

// Debug logging
console.log('SimpleTopNav - User:', user.value)
console.log('SimpleTopNav - Roles:', userRoles.value)
console.log('SimpleTopNav - Is Admin:', isAdmin.value)
console.log('SimpleTopNav - Is Management:', isManagement.value)
</script>