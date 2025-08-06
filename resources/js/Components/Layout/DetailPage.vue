<template>
  <div class="detail-page">
    <!-- Page Header -->
    <div class="detail-page-header bg-white border-b border-neutral-200 px-6 py-4 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Back Button -->
          <button
            v-if="showBackButton"
            @click="handleBack"
            class="inline-flex items-center p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            :aria-label="backButtonLabel"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          
          <!-- Title Section -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center space-x-3">
              <!-- Icon -->
              <div 
                v-if="icon"
                class="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"
              >
                <component :is="icon" class="w-6 h-6 text-primary-600" />
              </div>
              
              <!-- Avatar -->
              <div 
                v-else-if="avatar"
                class="flex-shrink-0"
              >
                <img
                  v-if="avatar.src"
                  :src="avatar.src"
                  :alt="avatar.alt || title"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"
                >
                  <span class="text-sm font-semibold text-primary-700">
                    {{ avatar.initials }}
                  </span>
                </div>
              </div>
              
              <!-- Title and Subtitle -->
              <div class="min-w-0 flex-1">
                <h1 class="text-2xl font-bold text-neutral-900 truncate">
                  {{ title }}
                </h1>
                <p 
                  v-if="subtitle"
                  class="text-sm text-neutral-600 mt-1"
                >
                  {{ subtitle }}
                </p>
              </div>
              
              <!-- Status Badge -->
              <div v-if="status" class="flex-shrink-0">
                <span :class="getStatusClasses(status)">
                  {{ status.label }}
                </span>
              </div>
            </div>
            
            <!-- Breadcrumbs -->
            <nav 
              v-if="breadcrumbs && breadcrumbs.length"
              class="flex mt-2"
              aria-label="Breadcrumb"
            >
              <ol class="flex items-center space-x-2 text-sm">
                <li v-for="(crumb, index) in breadcrumbs" :key="index">
                  <div class="flex items-center">
                    <ChevronRightIcon 
                      v-if="index > 0"
                      class="w-4 h-4 text-neutral-400 mr-2"
                    />
                    <Link
                      v-if="crumb.href && !crumb.current"
                      :href="crumb.href"
                      class="text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                    >
                      {{ crumb.label }}
                    </Link>
                    <span
                      v-else
                      class="text-neutral-900 font-medium"
                      :aria-current="crumb.current ? 'page' : undefined"
                    >
                      {{ crumb.label }}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
        
        <!-- Action Bar -->
        <ActionBar
          v-if="actions && actions.length"
          :actions="actions"
          :loading="loading"
          class="flex-shrink-0 ml-6"
        />
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="detail-page-content px-6 pb-6">
      <div :class="layoutClasses">
        <!-- Primary Content -->
        <div :class="primaryContentClasses">
          <slot name="primary" />
          <slot />
        </div>
        
        <!-- Secondary Content (Sidebar) -->
        <div 
          v-if="$slots.secondary"
          :class="secondaryContentClasses"
        >
          <slot name="secondary" />
        </div>
      </div>
    </div>
    
    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"
    >
      <LoadingSpinner size="lg" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Link, router } from '@inertiajs/vue3'
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import ActionBar from './ActionBar.vue'
import LoadingSpinner from '@/Components/States/LoadingSpinner.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: null
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  avatar: {
    type: Object,
    default: null,
    validator: (value) => {
      if (!value) return true
      return typeof value === 'object' && (value.src || value.initials)
    }
  },
  status: {
    type: Object,
    default: null,
    validator: (value) => {
      if (!value) return true
      return typeof value === 'object' && value.label
    }
  },
  breadcrumbs: {
    type: Array,
    default: () => []
  },
  actions: {
    type: Array,
    default: () => []
  },
  layout: {
    type: String,
    default: 'two-column',
    validator: (value) => ['single-column', 'two-column', 'three-column'].includes(value)
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  backButtonLabel: {
    type: String,
    default: 'Go back'
  },
  backUrl: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['back'])

// Computed classes for layout
const layoutClasses = computed(() => {
  const baseClasses = 'grid gap-6'
  
  switch (props.layout) {
    case 'single-column':
      return `${baseClasses} grid-cols-1`
    case 'two-column':
      return `${baseClasses} grid-cols-1 lg:grid-cols-3`
    case 'three-column':
      return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
    default:
      return `${baseClasses} grid-cols-1 lg:grid-cols-3`
  }
})

const primaryContentClasses = computed(() => {
  switch (props.layout) {
    case 'single-column':
      return 'col-span-1'
    case 'two-column':
      return 'lg:col-span-2'
    case 'three-column':
      return 'md:col-span-1 lg:col-span-2'
    default:
      return 'lg:col-span-2'
  }
})

const secondaryContentClasses = computed(() => {
  switch (props.layout) {
    case 'single-column':
      return 'col-span-1'
    case 'two-column':
      return 'lg:col-span-1'
    case 'three-column':
      return 'md:col-span-1 lg:col-span-1'
    default:
      return 'lg:col-span-1'
  }
})

// Status badge styling
const getStatusClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  const variantClasses = {
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-info-100 text-info-800',
    neutral: 'bg-neutral-100 text-neutral-800',
    primary: 'bg-primary-100 text-primary-800'
  }
  
  return `${baseClasses} ${variantClasses[status.variant] || variantClasses.neutral}`
}

// Handle back navigation
const handleBack = () => {
  if (props.backUrl) {
    router.visit(props.backUrl)
  } else {
    emit('back')
    // Fallback to browser back if no handler
    if (!props.backUrl) {
      window.history.back()
    }
  }
}
</script>

<style scoped>
.detail-page {
  @apply relative min-h-screen bg-neutral-50;
}

.detail-page-header {
  @apply sticky top-0 z-20;
}

.detail-page-content {
  @apply max-w-7xl mx-auto;
}
</style>