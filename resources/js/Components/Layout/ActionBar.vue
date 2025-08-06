<template>
  <div :class="containerClasses">
    <!-- Primary Actions -->
    <div v-if="primaryActions.length" class="flex items-center space-x-2">
      <button
        v-for="action in primaryActions"
        :key="action.id"
        @click="handleAction(action)"
        :disabled="action.disabled || loading || isActionLoading(action.id)"
        :class="getActionClasses(action, 'primary')"
        :title="action.tooltip"
      >
        <!-- Loading Spinner -->
        <LoadingSpinner
          v-if="isActionLoading(action.id)"
          size="sm"
          class="mr-2"
        />
        
        <!-- Icon -->
        <component
          v-else-if="action.icon"
          :is="action.icon"
          class="w-4 h-4"
          :class="{ 'mr-2': action.label }"
        />
        
        <!-- Label -->
        <span v-if="action.label">{{ action.label }}</span>
      </button>
    </div>
    
    <!-- Secondary Actions -->
    <div v-if="secondaryActions.length" class="flex items-center space-x-2">
      <button
        v-for="action in secondaryActions"
        :key="action.id"
        @click="handleAction(action)"
        :disabled="action.disabled || loading || isActionLoading(action.id)"
        :class="getActionClasses(action, 'secondary')"
        :title="action.tooltip"
      >
        <!-- Loading Spinner -->
        <LoadingSpinner
          v-if="isActionLoading(action.id)"
          size="sm"
          class="mr-2"
        />
        
        <!-- Icon -->
        <component
          v-else-if="action.icon"
          :is="action.icon"
          class="w-4 h-4"
          :class="{ 'mr-2': action.label }"
        />
        
        <!-- Label -->
        <span v-if="action.label">{{ action.label }}</span>
      </button>
    </div>
    
    <!-- Dropdown Menu for Additional Actions -->
    <div v-if="dropdownActions.length" class="relative" ref="dropdownRef">
      <button
        @click="toggleDropdown"
        :disabled="loading"
        :class="dropdownButtonClasses"
        :aria-expanded="showDropdown"
        aria-haspopup="true"
      >
        <EllipsisVerticalIcon class="w-4 h-4" />
      </button>
      
      <!-- Dropdown Menu -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="showDropdown"
          :class="dropdownMenuClasses"
          role="menu"
          aria-orientation="vertical"
        >
          <div class="py-1" role="none">
            <button
              v-for="action in dropdownActions"
              :key="action.id"
              @click="handleDropdownAction(action)"
              :disabled="action.disabled || loading || isActionLoading(action.id)"
              :class="getDropdownActionClasses(action)"
              role="menuitem"
            >
              <!-- Loading Spinner -->
              <LoadingSpinner
                v-if="isActionLoading(action.id)"
                size="sm"
                class="mr-3"
              />
              
              <!-- Icon -->
              <component
                v-else-if="action.icon"
                :is="action.icon"
                class="w-4 h-4 mr-3"
              />
              
              <!-- Label -->
              <span>{{ action.label }}</span>
              
              <!-- Keyboard Shortcut -->
              <span
                v-if="action.shortcut"
                class="ml-auto text-xs text-neutral-400"
              >
                {{ action.shortcut }}
              </span>
            </button>
            

          </div>
        </div>
      </Transition>
    </div>
    
    <!-- Permission Guard -->
    <div v-if="hasPermissionGuard && !hasRequiredPermissions" class="text-xs text-neutral-500">
      Insufficient permissions
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/Components/States/LoadingSpinner.vue'
import { usePermissions } from '@/composables/usePermissions.js'

const props = defineProps({
  actions: {
    type: Array,
    default: () => [],
    validator: (actions) => {
      return actions.every(action => 
        action.id && 
        (action.label || action.icon) &&
        typeof action.handler === 'function'
      )
    }
  },
  layout: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical', 'compact'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingActions: {
    type: Array,
    default: () => []
  },
  maxPrimaryActions: {
    type: Number,
    default: 3
  },
  maxSecondaryActions: {
    type: Number,
    default: 2
  },
  requiredPermissions: {
    type: Array,
    default: () => []
  },
  requireAllPermissions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['action'])

// Composables
const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

// Reactive state
const showDropdown = ref(false)
const dropdownRef = ref(null)

// Computed properties
const containerClasses = computed(() => {
  const baseClasses = 'action-bar flex items-center'
  const layoutClasses = {
    horizontal: 'space-x-3',
    vertical: 'flex-col space-y-2',
    compact: 'space-x-1'
  }
  const sizeClasses = {
    sm: 'text-sm',
    md: '',
    lg: 'text-lg'
  }
  
  return `${baseClasses} ${layoutClasses[props.layout]} ${sizeClasses[props.size]}`
})

const filteredActions = computed(() => {
  return props.actions.filter(action => {
    // Check permissions if specified
    if (action.permissions && action.permissions.length) {
      const hasPermissions = action.requireAllPermissions
        ? hasAllPermissions(action.permissions)
        : hasAnyPermission(action.permissions)
      
      if (!hasPermissions) return false
    }
    
    // Check visibility condition
    if (typeof action.visible === 'function') {
      return action.visible()
    }
    
    return action.visible !== false
  })
})

const primaryActions = computed(() => {
  return filteredActions.value
    .filter(action => action.priority === 'primary')
    .slice(0, props.maxPrimaryActions)
})

const secondaryActions = computed(() => {
  return filteredActions.value
    .filter(action => action.priority === 'secondary' || !action.priority)
    .slice(0, props.maxSecondaryActions)
})

const dropdownActions = computed(() => {
  const remainingPrimary = filteredActions.value
    .filter(action => action.priority === 'primary')
    .slice(props.maxPrimaryActions)
  
  const remainingSecondary = filteredActions.value
    .filter(action => action.priority === 'secondary' || !action.priority)
    .slice(props.maxSecondaryActions)
  
  const dropdownOnly = filteredActions.value
    .filter(action => action.priority === 'dropdown')
  
  return [...remainingPrimary, ...remainingSecondary, ...dropdownOnly]
})

const dropdownButtonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200'
  const disabledClasses = props.loading ? 'opacity-50 cursor-not-allowed' : ''
  
  return `${baseClasses} ${disabledClasses}`
})

const dropdownMenuClasses = computed(() => {
  const baseClasses = 'absolute right-0 z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
  
  return baseClasses
})

const hasPermissionGuard = computed(() => {
  return props.requiredPermissions.length > 0
})

const hasRequiredPermissions = computed(() => {
  if (!hasPermissionGuard.value) return true
  
  return props.requireAllPermissions
    ? hasAllPermissions(props.requiredPermissions)
    : hasAnyPermission(props.requiredPermissions)
})

// Methods
const getActionClasses = (action, type = 'primary') => {
  const baseClasses = 'inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200'
  
  const variantClasses = {
    primary: {
      primary: 'border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:ring-primary-500',
      success: 'border-transparent text-white bg-success-600 hover:bg-success-700 focus:ring-success-500',
      warning: 'border-transparent text-white bg-warning-600 hover:bg-warning-700 focus:ring-warning-500',
      error: 'border-transparent text-white bg-error-600 hover:bg-error-700 focus:ring-error-500'
    },
    secondary: {
      primary: 'border-primary-300 text-primary-700 bg-primary-50 hover:bg-primary-100 focus:ring-primary-500',
      secondary: 'border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:ring-neutral-500',
      success: 'border-success-300 text-success-700 bg-success-50 hover:bg-success-100 focus:ring-success-500',
      warning: 'border-warning-300 text-warning-700 bg-warning-50 hover:bg-warning-100 focus:ring-warning-500',
      error: 'border-error-300 text-error-700 bg-error-50 hover:bg-error-100 focus:ring-error-500'
    }
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  const disabledClasses = (action.disabled || props.loading || isActionLoading(action.id)) 
    ? 'opacity-50 cursor-not-allowed' 
    : ''
  
  const variant = action.variant || 'primary'
  const classes = variantClasses[type][variant] || variantClasses[type].primary
  
  return `${baseClasses} ${classes} ${sizeClasses[props.size]} ${disabledClasses}`
}

const getDropdownActionClasses = (action) => {
  const baseClasses = 'group flex items-center w-full px-4 py-2 text-sm text-left hover:bg-neutral-100 focus:outline-none focus:bg-neutral-100 transition-colors duration-200'
  
  const variantClasses = {
    error: 'text-error-700 hover:bg-error-50 focus:bg-error-50',
    warning: 'text-warning-700 hover:bg-warning-50 focus:bg-warning-50',
    success: 'text-success-700 hover:bg-success-50 focus:bg-success-50'
  }
  
  const disabledClasses = (action.disabled || props.loading || isActionLoading(action.id))
    ? 'opacity-50 cursor-not-allowed'
    : ''
  
  const variant = action.variant
  const variantClass = variant && variantClasses[variant] ? variantClasses[variant] : 'text-neutral-700'
  
  return `${baseClasses} ${variantClass} ${disabledClasses}`
}

const isActionLoading = (actionId) => {
  return props.loadingActions.includes(actionId)
}

const handleAction = (action) => {
  if (action.disabled || props.loading || isActionLoading(action.id)) {
    return
  }
  
  // Check permissions before executing
  if (action.permissions && action.permissions.length) {
    const hasPermissions = action.requireAllPermissions
      ? hasAllPermissions(action.permissions)
      : hasAnyPermission(action.permissions)
    
    if (!hasPermissions) {
      console.warn(`Action ${action.id} blocked: insufficient permissions`)
      return
    }
  }
  
  // Execute action handler
  if (typeof action.handler === 'function') {
    action.handler()
  }
  
  // Emit action event
  emit('action', action)
}

const handleDropdownAction = (action) => {
  handleAction(action)
  showDropdown.value = false
}

const toggleDropdown = () => {
  if (!props.loading) {
    showDropdown.value = !showDropdown.value
  }
}

const closeDropdown = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.action-bar {
  @apply relative;
}

/* Focus styles for better accessibility */
.action-bar button:focus {
  @apply outline-none ring-2 ring-offset-2;
}

/* Hover effects */
.action-bar button:not(:disabled):hover {
  @apply transform scale-105;
}

.action-bar button:not(:disabled):active {
  @apply transform scale-95;
}

/* Loading state */
.action-bar button:disabled {
  @apply cursor-not-allowed;
}
</style>