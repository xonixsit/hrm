<template>
  <div class="role-guard">
    <!-- Error State -->
    <div v-if="hasError" class="role-guard-error">
      <AuthErrorFallback 
        :error-info="errorInfo"
        custom-message="Unable to verify permissions for this content."
        @retry="handleRetry"
        @continue="handleContinue"
      >
        <template #fallback>
          <div class="permission-error">
            <div class="error-icon">
              <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3>Permission Check Failed</h3>
            <p>We couldn't verify your permissions for this content.</p>
            <div class="error-actions">
              <button @click="handleRetry" class="retry-btn">
                Try Again
              </button>
              <button @click="handleContinue" class="continue-btn">
                Continue Anyway
              </button>
            </div>
          </div>
        </template>
      </AuthErrorFallback>
    </div>
    
    <!-- Access Granted -->
    <div v-else-if="hasAccess" class="role-guard-content">
      <slot />
    </div>
    
    <!-- Access Denied -->
    <div v-else-if="showFallback" class="role-guard-denied">
      <slot name="denied">
        <div class="access-denied">
          <div class="denied-icon">
            <svg class="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h3>Access Denied</h3>
          <p v-if="customDeniedMessage">{{ customDeniedMessage }}</p>
          <p v-else>You don't have permission to access this content.</p>
          
          <!-- Show required roles/permissions in development -->
          <div v-if="isDevelopment" class="debug-info">
            <details>
              <summary>Debug Information</summary>
              <div class="debug-content">
                <p><strong>Required Roles:</strong> {{ roles.join(', ') || 'None' }}</p>
                <p><strong>Required Permissions:</strong> {{ permissions.join(', ') || 'None' }}</p>
                <p><strong>User Roles:</strong> {{ userRoles.join(', ') || 'None' }}</p>
                <p><strong>User Permissions:</strong> {{ userPermissions.length }} permissions</p>
                <p><strong>Match Type:</strong> {{ matchType }}</p>
                <p><strong>Authenticated:</strong> {{ isAuthenticated }}</p>
              </div>
            </details>
          </div>
          
          <!-- Action buttons -->
          <div v-if="showActions" class="denied-actions">
            <button v-if="showLoginButton && !isAuthenticated" @click="handleLogin" class="login-btn">
              Sign In
            </button>
            <button v-if="showContactButton" @click="handleContact" class="contact-btn">
              Request Access
            </button>
          </div>
        </div>
      </slot>
    </div>
    
    <!-- Silent mode - render nothing -->
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { usePermissions } from '@/composables/usePermissions.js'
import { useNavigation } from '@/composables/useNavigation.js'
import { useAuthErrorBoundary } from '@/composables/useAuthErrorBoundary.js'
import { useAuthErrorHandler } from '@/composables/useAuthErrorHandler.js'
import AuthErrorFallback from './AuthErrorFallback.vue'

const props = defineProps({
  // Role-based access
  roles: {
    type: Array,
    default: () => []
  },
  
  // Permission-based access
  permissions: {
    type: Array,
    default: () => []
  },
  
  // Match type: 'any' (default) or 'all'
  matchType: {
    type: String,
    default: 'any',
    validator: (value) => ['any', 'all'].includes(value)
  },
  
  // UI behavior
  showFallback: {
    type: Boolean,
    default: true
  },
  
  showActions: {
    type: Boolean,
    default: true
  },
  
  showLoginButton: {
    type: Boolean,
    default: true
  },
  
  showContactButton: {
    type: Boolean,
    default: false
  },
  
  // Custom messages
  customDeniedMessage: {
    type: String,
    default: null
  },
  
  // Behavior options
  redirectOnDenied: {
    type: String,
    default: null
  },
  
  logAccess: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['access-granted', 'access-denied', 'error', 'login', 'contact'])

// Setup composables
const { 
  isAuthenticated, 
  roles: userRoles, 
  hasRole, 
  hasAnyRole, 
  hasAllRoles,
  debugAuthState 
} = useAuth()

const { 
  userPermissions, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions 
} = usePermissions()

const { navigateToLogin } = useNavigation()

const { 
  hasError, 
  errorInfo, 
  resetError 
} = useAuthErrorBoundary()

const {
  handleAuthError,
  safeExecute,
  ERROR_LEVELS
} = useAuthErrorHandler()

const isDevelopment = process.env.NODE_ENV === 'development'

// Computed access control
const hasAccess = computed(() => {
  return safeExecute(
    () => {
      // If no roles or permissions specified, allow access for authenticated users
      if (props.roles.length === 0 && props.permissions.length === 0) {
        return isAuthenticated.value
      }
      
      let roleAccess = true
      let permissionAccess = true
      
      // Check role requirements
      if (props.roles.length > 0) {
        if (props.matchType === 'all') {
          roleAccess = hasAllRoles(props.roles)
        } else {
          roleAccess = hasAnyRole(props.roles)
        }
      }
      
      // Check permission requirements
      if (props.permissions.length > 0) {
        if (props.matchType === 'all') {
          permissionAccess = hasAllPermissions(props.permissions)
        } else {
          permissionAccess = hasAnyPermission(props.permissions)
        }
      }
      
      // Both role and permission checks must pass
      const access = roleAccess && permissionAccess
      
      // Log access attempt if requested
      if (props.logAccess && isDevelopment) {
        console.log(`[ROLE GUARD] Access ${access ? 'granted' : 'denied'}`, {
          roles: props.roles,
          permissions: props.permissions,
          matchType: props.matchType,
          userRoles: userRoles.value,
          userPermissions: userPermissions.value.length,
          roleAccess,
          permissionAccess
        })
      }
      
      return access
    },
    {
      fallback: false,
      operation: 'checking role guard access',
      component: 'RoleGuard'
    }
  )
})

// Component lifecycle
onMounted(() => {
  try {
    // Emit appropriate events based on access
    if (hasError.value) {
      emit('error', errorInfo.value)
    } else if (hasAccess.value) {
      emit('access-granted', {
        roles: props.roles,
        permissions: props.permissions,
        userRoles: userRoles.value,
        userPermissions: userPermissions.value
      })
    } else {
      emit('access-denied', {
        roles: props.roles,
        permissions: props.permissions,
        userRoles: userRoles.value,
        userPermissions: userPermissions.value,
        reason: getAccessDeniedReason()
      })
      
      // Handle redirect if specified
      if (props.redirectOnDenied) {
        handleRedirect()
      }
    }
  } catch (error) {
    handleAuthError(error, {
      component: 'RoleGuard',
      operation: 'component initialization',
      level: ERROR_LEVELS.WARNING
    })
  }
})

// Helper functions
const getAccessDeniedReason = () => {
  if (!isAuthenticated.value) {
    return 'not_authenticated'
  }
  
  if (props.roles.length > 0 && !hasAnyRole(props.roles)) {
    return 'insufficient_roles'
  }
  
  if (props.permissions.length > 0 && !hasAnyPermission(props.permissions)) {
    return 'insufficient_permissions'
  }
  
  return 'unknown'
}

const handleRedirect = async () => {
  try {
    if (props.redirectOnDenied === 'login' && !isAuthenticated.value) {
      await navigateToLogin()
    } else {
      // Custom redirect path
      window.location.href = props.redirectOnDenied
    }
  } catch (error) {
    handleAuthError(error, {
      component: 'RoleGuard',
      operation: 'handling redirect',
      level: ERROR_LEVELS.WARNING
    })
  }
}

// Event handlers
const handleRetry = () => {
  resetError()
  
  if (isDevelopment) {
    console.log('[ROLE GUARD] Retrying access check')
    debugAuthState()
  }
}

const handleContinue = () => {
  resetError()
  
  if (isDevelopment) {
    console.warn('[ROLE GUARD] Continuing despite permission errors')
  }
}

const handleLogin = async () => {
  emit('login')
  await navigateToLogin()
}

const handleContact = () => {
  emit('contact', {
    requiredRoles: props.roles,
    requiredPermissions: props.permissions,
    userRoles: userRoles.value
  })
}
</script>

<style scoped>
.role-guard {
  @apply w-full;
}

.role-guard-error,
.role-guard-content,
.role-guard-denied {
  @apply w-full;
}

.permission-error {
  @apply text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg;
}

.permission-error .error-icon {
  @apply flex justify-center mb-4;
}

.permission-error h3 {
  @apply text-lg font-semibold text-yellow-800 mb-2;
}

.permission-error p {
  @apply text-yellow-700 mb-4;
}

.error-actions {
  @apply flex gap-3 justify-center;
}

.retry-btn, .continue-btn {
  @apply px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.retry-btn {
  @apply bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500;
}

.continue-btn {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}

.access-denied {
  @apply text-center p-8 bg-red-50 border border-red-200 rounded-lg;
}

.denied-icon {
  @apply flex justify-center mb-4;
}

.access-denied h3 {
  @apply text-xl font-semibold text-red-800 mb-2;
}

.access-denied p {
  @apply text-red-700 mb-4;
}

.debug-info {
  @apply mt-4 text-left;
}

.debug-info details {
  @apply bg-red-100 p-3 rounded text-sm;
}

.debug-info summary {
  @apply cursor-pointer font-medium text-red-800 hover:text-red-900;
}

.debug-content {
  @apply mt-2 space-y-1 text-red-700;
}

.denied-actions {
  @apply flex gap-3 justify-center mt-6;
}

.login-btn, .contact-btn {
  @apply px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.login-btn {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.contact-btn {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}
</style>