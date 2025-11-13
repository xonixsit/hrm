<template>
  <!-- Unified Card Component with Consistent Design Language -->
  <div :class="[
    'group relative transition-all duration-300',
    // Base styling with consistent shadows and borders

    
    // Unified border radius system
    size === 'small' ? 'rounded-lg' : 'rounded-2xl',
    
    // Hover effects for interactive cards
    clickable && 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl',
    clickable && (isDark 
      ? 'hover:bg-gray-700/60 hover:border-gray-600/60' 
      : 'hover:bg-white/90 hover:border-gray-300/60'),
    
    // Padding system
    size === 'small' ? 'p-3' : 'p-4',
    
    // Additional classes
    className
  ]" @click="clickable && $emit('click')" :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? '0' : undefined" @keydown.enter="clickable && $emit('click')"
    @keydown.space.prevent="clickable && $emit('click')"></div>
  <!-- Card Header -->
  <div v-if="$slots.header || title" class="flex items-center justify-between mb-4">
    <div class="flex items-center space-x-3">
      <!-- Icon -->
      <div v-if="icon || $slots.icon" :class="[
        'flex items-center justify-center rounded-xl transition-all duration-200',
        size === 'small' ? 'w-10 h-10 p-2' : 'w-12 h-12 p-3',
        // Icon background colors based on variant
        iconVariant === 'primary' && (isDark 
          ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30' 
          : 'bg-teal-50 text-teal-600 border border-teal-200/50'),
        iconVariant === 'success' && (isDark 
          ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
          : 'bg-green-50 text-green-600 border border-green-200/50'),
        iconVariant === 'warning' && (isDark 
          ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' 
          : 'bg-orange-50 text-orange-600 border border-orange-200/50'),
        iconVariant === 'danger' && (isDark 
          ? 'bg-red-600/20 text-red-400 border border-red-500/30' 
          : 'bg-red-50 text-red-600 border border-red-200/50'),
        iconVariant === 'info' && (isDark 
          ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
          : 'bg-purple-50 text-purple-600 border border-purple-200/50'),
        !iconVariant && (isDark 
          ? 'bg-gray-700/50 text-gray-300 border border-gray-600/50' 
          : 'bg-gray-100 text-gray-600 border border-gray-200/50')
      ]">
        <slot name="icon">
          <component v-if="icon" :is="icon" :class="size === 'small' ? 'w-4 h-4' : 'w-5 h-5'" />
        </slot>
      </div>

      <!-- Title and Description -->
      <div>
        <h3 v-if="title" :class="[
          'font-semibold transition-colors duration-200',
          size === 'small' ? 'text-base' : 'text-lg',
          isDark ? 'text-white' : 'text-gray-900'
        ]">
          {{ title }}
        </h3>
        <p v-if="description" :class="[
          'transition-colors duration-200',
          size === 'small' ? 'text-xs' : 'text-sm',
          isDark ? 'text-gray-400' : 'text-gray-600'
        ]">
          {{ description }}
        </p>
        <slot name="header" />
      </div>
    </div>

    <!-- Header Actions -->
    <div v-if="$slots.headerActions" class="flex items-center space-x-2">
      <slot name="headerActions" />
    </div>
  </div>

  <!-- Card Content -->
  <div class="flex-1">
    <slot>
      <!-- Enhanced empty state -->
      <div class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
        <p class="text-sm text-gray-500">This section will display content when data is available.</p>
      </div>
    </slot>
  </div>

  <!-- Card Footer -->
  <div v-if="$slots.footer" :class="[
    'mt-6 pt-4 border-t transition-colors duration-200',
    isDark ? 'border-gray-700/50' : 'border-gray-200/50'
  ]">
    <slot name="footer" />
  </div>

  <!-- Loading Overlay -->
  <div v-if="loading" :class="[
    'absolute inset-0 flex items-center justify-center rounded-2xl transition-all duration-200',
  ]">
    <div class="flex items-center space-x-3">
      <div :class="[
        'animate-spin rounded-full border-2 border-t-transparent',
        size === 'small' ? 'w-5 h-5' : 'w-6 h-6',
        isDark ? 'border-gray-400' : 'border-gray-600'
      ]"></div>
      <span :class="[
        'text-sm font-medium',
        isDark ? 'text-gray-300' : 'text-gray-600'
      ]">
        Loading...
      </span>
    </div>
  </div>

  <!-- Status Indicator -->
  <div v-if="status" :class="[
    'absolute top-4 right-4 flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
    status === 'success' && (isDark 
      ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
      : 'bg-green-50 text-green-700 border border-green-200'),
    status === 'warning' && (isDark 
      ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' 
      : 'bg-orange-50 text-orange-700 border border-orange-200'),
    status === 'error' && (isDark 
      ? 'bg-red-600/20 text-red-400 border border-red-500/30' 
      : 'bg-red-50 text-red-700 border border-red-200'),
    status === 'info' && (isDark 
      ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30' 
      : 'bg-teal-50 text-teal-700 border border-teal-200')
  ]">
    <div :class="[
      'w-1.5 h-1.5 rounded-full',
      status === 'success' && 'bg-green-400',
      status === 'warning' && 'bg-orange-400',
      status === 'error' && 'bg-red-400',
      status === 'info' && 'bg-teal-400'
    ]"></div>
    <span>{{ statusText || status }}</span>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useTheme } from '@/composables/useTheme.js'

  const props = defineProps({
    title: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    icon: {
      type: [String, Object],
      default: null
    },
    iconVariant: {
      type: String,
      default: null,
      validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'elevated'].includes(value)
    },
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['small', 'default'].includes(value)
    },
    clickable: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: null,
      validator: (value) => ['success', 'warning', 'error', 'info'].includes(value)
    },
    statusText: {
      type: String,
      default: null
    },
    className: {
      type: String,
      default: ''
    }
  })

  const emit = defineEmits(['click'])

  const { isDark } = useTheme()
</script>