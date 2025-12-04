<template>
  <div class="auth-error-example">
    <!-- Error Boundary Wrapper -->
    <div v-if="hasError" class="error-boundary-active">
      <AuthErrorFallback 
        :error-info="errorInfo"
        @retry="handleRetry"
        @refresh="handleRefresh"
        @continue="handleContinue"
      />
    </div>
    
    <!-- Normal Content -->
    <div v-else class="normal-content">
      <h2>Authentication-Dependent Component</h2>
      
      <!-- User Information Section -->
      <div class="user-section">
        <h3>User Information</h3>
        <div v-if="isAuthenticated" class="user-info">
          <p><strong>Name:</strong> {{ user?.name || 'Not available' }}</p>
          <p><strong>Email:</strong> {{ user?.email || 'Not available' }}</p>
          <p><strong>Roles:</strong> {{ roles.join(', ') || 'No roles assigned' }}</p>
        </div>
        <div v-else class="no-auth">
          <p>User not authenticated</p>
        </div>
      </div>
      
      <!-- Role-Based Content -->
      <div class="role-section">
        <h3>Role-Based Features</h3>
        <div class="role-checks">
          <div class="role-check">
            <label>Admin Features:</label>
            <span :class="hasAdminRole ? 'available' : 'unavailable'">
              {{ hasAdminRole ? 'Available' : 'Not Available' }}
            </span>
          </div>
          <div class="role-check">
            <label>HR Features:</label>
            <span :class="hasHRRole ? 'available' : 'unavailable'">
              {{ hasHRRole ? 'Available' : 'Not Available' }}
            </span>
          </div>
          <div class="role-check">
            <label>Manager Features:</label>
            <span :class="hasManagerRole ? 'available' : 'unavailable'">
              {{ hasManagerRole ? 'Available' : 'Not Available' }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Testing Section (Development Only) -->
      <div v-if="isDevelopment" class="testing-section">
        <h3>Error Testing (Development)</h3>
        <div class="test-buttons">
          <button @click="simulateAuthError" class="test-btn error">
            Simulate Auth Error
          </button>
          <button @click="simulateRoleError" class="test-btn warning">
            Simulate Role Error
          </button>
          <button @click="debugAuthState" class="test-btn info">
            Debug Auth State
          </button>
          <button @click="showErrorStats" class="test-btn info">
            Show Error Stats
          </button>
        </div>
      </div>
      
      <!-- Error History (Development Only) -->
      <div v-if="isDevelopment && errorStats.total > 0" class="error-history">
        <h3>Error History</h3>
        <div class="error-summary">
          <p>Total Errors: {{ errorStats.total }}</p>
          <p>Critical: {{ errorStats.byLevel.critical || 0 }}</p>
          <p>Warnings: {{ errorStats.byLevel.warning || 0 }}</p>
        </div>
        <button @click="clearErrors" class="test-btn">Clear Error History</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { useAuthErrorBoundary } from '@/composables/useAuthErrorBoundary.js'
import { useAuthErrorHandler } from '@/composables/useAuthErrorHandler.js'
import AuthErrorFallback from './AuthErrorFallback.vue'

// Setup error boundary
const { 
  hasError, 
  errorInfo, 
  resetError, 
  retryWithAuthCheck 
} = useAuthErrorBoundary()

// Setup authentication
const { 
  user, 
  isAuthenticated, 
  roles, 
  hasRole, 
  debugAuthState 
} = useAuth()

// Setup error handler
const {
  handleAuthError,
  handleRoleError,
  getErrorStats,
  clearErrorHistory,
  ERROR_LEVELS,
  ERROR_CATEGORIES
} = useAuthErrorHandler()

const isDevelopment = process.env.NODE_ENV === 'development'

// Computed properties for role checks
const hasAdminRole = computed(() => hasRole('Admin'))
const hasHRRole = computed(() => hasRole('HR'))
const hasManagerRole = computed(() => hasRole('Manager'))

// Error statistics
const errorStats = computed(() => getErrorStats.value)

// Component lifecycle
onMounted(() => {
  if (isDevelopment) {
    //console.log('🔧 [AUTH ERROR EXAMPLE] Component mounted')
    debugAuthState()
  }
})

// Error boundary handlers
const handleRetry = async () => {
  try {
    await retryWithAuthCheck(async () => {
      // Simulate retry operation
      //console.log('Retrying authentication-dependent operation...')
    })
  } catch (error) {
    handleAuthError(error, {
      component: 'AuthErrorExample',
      operation: 'retry operation',
      level: ERROR_LEVELS.WARNING
    })
  }
}

const handleRefresh = () => {
  window.location.reload()
}

const handleContinue = () => {
  resetError()
}

// Development testing functions
const simulateAuthError = () => {
  try {
    // Intentionally access undefined property to trigger error
    const fakeUser = null
    //console.log(fakeUser.auth.user.name) // This will throw an error
  } catch (error) {
    handleAuthError(error, {
      component: 'AuthErrorExample',
      operation: 'simulated auth error',
      level: ERROR_LEVELS.CRITICAL,
      category: ERROR_CATEGORIES.AUTH_DATA
    })
  }
}

const simulateRoleError = () => {
  try {
    // Simulate role checking error
    throw new Error('Cannot read properties of undefined (reading \'roles\')')
  } catch (error) {
    handleRoleError(error, 'TestRole', {
      component: 'AuthErrorExample',
      level: ERROR_LEVELS.WARNING
    })
  }
}

const showErrorStats = () => {
  if (isDevelopment) {
    console.group('📊 Current Error Statistics')
    //console.log('Error Stats:', errorStats.value)
    console.groupEnd()
  }
}

const clearErrors = () => {
  clearErrorHistory()
  resetError()
}
</script>

<style scoped>
.auth-error-example {
  @apply p-6 max-w-4xl mx-auto;
}

.error-boundary-active {
  @apply mb-6;
}

.normal-content {
  @apply space-y-6;
}

.user-section, .role-section, .testing-section, .error-history {
  @apply bg-white rounded-lg shadow p-4 border;
}

.user-info {
  @apply space-y-2;
}

.no-auth {
  @apply text-gray-500 italic;
}

.role-checks {
  @apply space-y-2;
}

.role-check {
  @apply flex justify-between items-center p-2 bg-gray-50 rounded;
}

.available {
  @apply text-green-600 font-medium;
}

.unavailable {
  @apply text-red-600 font-medium;
}

.test-buttons {
  @apply flex flex-wrap gap-2;
}

.test-btn {
  @apply px-3 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.test-btn.error {
  @apply bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500;
}

.test-btn.warning {
  @apply bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500;
}

.test-btn.info {
  @apply bg-teal-100 text-teal-800 hover:bg-teal-200 focus:ring-teal-500;
}

.error-summary {
  @apply text-sm space-y-1 mb-3;
}

h2 {
  @apply text-2xl font-bold text-gray-900 mb-4;
}

h3 {
  @apply text-lg font-semibold text-gray-800 mb-3;
}
</style>