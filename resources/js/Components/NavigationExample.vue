<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h3 class="text-lg font-medium text-gray-900 mb-4">
      Enhanced Navigation System Demo
    </h3>
    
    <!-- Navigation Status -->
    <div class="mb-6 p-4 bg-gray-50 rounded-md">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Navigation Status</h4>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Is Navigating:</span>
          <span :class="isNavigating ? 'text-orange-600' : 'text-green-600'" class="ml-2 font-medium">
            {{ isNavigating ? 'Yes' : 'No' }}
          </span>
        </div>
        <div>
          <span class="text-gray-600">Last Error:</span>
          <span :class="lastNavigationError ? 'text-red-600' : 'text-green-600'" class="ml-2 font-medium">
            {{ lastNavigationError ? 'Yes' : 'None' }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Available Navigation Items -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Available Navigation (Based on Permissions)</h4>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="navItem in availableNavigation"
          :key="navItem.key"
          @click="handleNavigation(navItem.path)"
          :disabled="isNavigating"
          class="flex items-center px-3 py-2 text-sm bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="mr-2">{{ getIcon(navItem.icon) }}</span>
          {{ navItem.label }}
        </button>
      </div>
    </div>
    
    <!-- Test Navigation Scenarios -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Test Navigation Scenarios</h4>
      <div class="space-y-2">
        <button
          @click="testAuthenticationError"
          :disabled="isNavigating"
          class="w-full px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          Test Authentication Error
        </button>
        <button
          @click="testPermissionError"
          :disabled="isNavigating"
          class="w-full px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          Test Permission Error
        </button>
        <button
          @click="testNetworkError"
          :disabled="isNavigating"
          class="w-full px-3 py-2 text-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          Test Network Error
        </button>
        <button
          @click="testRateLimitError"
          :disabled="isNavigating"
          class="w-full px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          Test Rate Limit (Click Multiple Times)
        </button>
      </div>
    </div>
    
    <!-- Navigation Statistics -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Navigation Statistics</h4>
      <div class="bg-gray-50 rounded-md p-3">
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div class="text-center">
            <div class="text-lg font-semibold text-gray-900">{{ navigationStats.total }}</div>
            <div class="text-gray-600">Total</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-green-600">{{ navigationStats.successful }}</div>
            <div class="text-gray-600">Successful</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-red-600">{{ navigationStats.failed }}</div>
            <div class="text-gray-600">Failed</div>
          </div>
        </div>
        <div class="mt-2 text-center">
          <span class="text-sm text-gray-600">Success Rate: </span>
          <span class="text-sm font-medium text-gray-900">{{ navigationStats.successRate }}%</span>
        </div>
      </div>
    </div>
    
    <!-- Recent Navigation History -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Recent Navigation History</h4>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="(nav, index) in navigationStats.recentHistory"
          :key="index"
          class="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
        >
          <div class="flex items-center">
            <span :class="nav.success ? 'text-green-500' : 'text-red-500'" class="mr-2">
              {{ nav.success ? '✓' : '✗' }}
            </span>
            <span class="font-medium">{{ nav.path }}</span>
          </div>
          <span class="text-gray-500">
            {{ formatTime(nav.timestamp) }}
          </span>
        </div>
        <div v-if="navigationStats.recentHistory.length === 0" class="text-center text-gray-500 text-sm py-4">
          No navigation history yet
        </div>
      </div>
    </div>
    
    <!-- Guard Information -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Active Navigation Guards</h4>
      <div class="space-y-2">
        <div
          v-for="guard in guardStats.guards"
          :key="guard.name"
          class="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
        >
          <div class="flex items-center">
            <span :class="guard.enabled ? 'text-green-500' : 'text-gray-400'" class="mr-2">
              {{ guard.enabled ? '●' : '○' }}
            </span>
            <span class="font-medium">{{ guard.name }}</span>
            <span class="ml-2 text-gray-500">(Priority: {{ guard.priority }})</span>
          </div>
          <button
            @click="toggleGuard(guard.name, !guard.enabled)"
            class="text-teal-600 hover:text-teal-800"
          >
            {{ guard.enabled ? 'Disable' : 'Enable' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex space-x-2">
      <button
        @click="clearHistory"
        class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
      >
        Clear History
      </button>
      <button
        @click="debugNavigation"
        class="px-3 py-2 text-sm bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-md transition-colors duration-200"
      >
        Debug Navigation
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useNavigation } from '@/composables/useNavigation'
import { navigationGuardService } from '@/services/NavigationGuardService'

const {
  navigateTo,
  getAvailableNavigation,
  isNavigating,
  lastNavigationError,
  getNavigationStats,
  clearNavigationHistory,
  debugNavigation
} = useNavigation()

const availableNavigation = computed(() => getAvailableNavigation.value)
const navigationStats = computed(() => getNavigationStats.value)
const guardStats = computed(() => navigationGuardService.getGuardStats())

// Handle navigation with error handling
const handleNavigation = async (path) => {
  try {
    const success = await navigateTo(path)
    if (!success) {
      console.warn(`Navigation to ${path} failed`)
    }
  } catch (error) {
    console.error(`Navigation error for ${path}:`, error)
  }
}

// Test different error scenarios
const testAuthenticationError = async () => {
  // Simulate authentication error by trying to navigate with invalid auth
  try {
    await navigateTo('/admin/secret-page', { requiresAuth: true })
  } catch (error) {
    //console.log('Authentication error test triggered:', error)
  }
}

const testPermissionError = async () => {
  // Try to access a restricted route
  try {
    await navigateTo('/employees', { strictMode: true })
  } catch (error) {
    //console.log('Permission error test triggered:', error)
  }
}

const testNetworkError = async () => {
  // Simulate network error
  const originalFetch = window.fetch
  window.fetch = () => Promise.reject(new Error('Network error: Connection failed'))
  
  try {
    await navigateTo('/test-network-error')
  } catch (error) {
    //console.log('Network error test triggered:', error)
  } finally {
    window.fetch = originalFetch
  }
}

const testRateLimitError = async () => {
  // Trigger multiple rapid navigations to test rate limiting
  for (let i = 0; i < 5; i++) {
    try {
      await navigateTo(`/test-rate-limit-${i}`)
    } catch (error) {
      //console.log(`Rate limit test ${i} triggered:`, error)
    }
  }
}

// Toggle guard enabled/disabled state
const toggleGuard = (guardName, enabled) => {
  navigationGuardService.toggleGuard(guardName, enabled)
}

// Clear navigation history
const clearHistory = () => {
  clearNavigationHistory()
  navigationGuardService.clearErrorHistory()
}

// Format timestamp for display
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Get icon for navigation items
const getIcon = (iconName) => {
  const icons = {
    dashboard: '📊',
    users: '👥',
    building: '🏢',
    calendar: '📅',
    clock: '⏰',
    message: '💬',
    folder: '📁',
    'check-square': '✅',
    time: '⏱️'
  }
  return icons[iconName] || '📄'
}

onMounted(() => {
  //console.log('Navigation Example component mounted')
  //console.log('Available navigation:', availableNavigation.value)
  //console.log('Guard stats:', guardStats.value)
})
</script>