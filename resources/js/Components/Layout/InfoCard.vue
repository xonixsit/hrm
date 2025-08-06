<template>
  <div :class="cardClasses">
    <!-- Card Header -->
    <div 
      v-if="title || $slots.header || actions.length"
      class="info-card-header"
    >
      <div class="flex items-center justify-between">
        <!-- Title Section -->
        <div v-if="title || $slots.header" class="flex items-center space-x-3">
          <!-- Icon -->
          <div 
            v-if="icon"
            :class="iconClasses"
          >
            <component :is="icon" class="w-5 h-5" />
          </div>
          
          <!-- Title and Description -->
          <div class="min-w-0 flex-1">
            <slot name="header">
              <h3 class="text-lg font-semibold text-neutral-900">
                {{ title }}
              </h3>
              <p 
                v-if="description"
                class="text-sm text-neutral-600 mt-1"
              >
                {{ description }}
              </p>
            </slot>
          </div>
        </div>
        
        <!-- Actions -->
        <div 
          v-if="actions.length"
          class="flex items-center space-x-2"
        >
          <button
            v-for="action in actions"
            :key="action.id"
            @click="handleAction(action)"
            :disabled="action.disabled || loading"
            :class="getActionClasses(action)"
            :title="action.tooltip"
          >
            <component 
              v-if="action.icon"
              :is="action.icon" 
              class="w-4 h-4"
            />
            <span v-if="action.label" class="ml-1">{{ action.label }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Card Content -->
    <div :class="contentClasses">
      <!-- Loading State -->
      <div 
        v-if="loading"
        class="flex items-center justify-center py-8"
      >
        <LoadingSpinner size="md" />
      </div>
      
      <!-- Empty State -->
      <div 
        v-else-if="isEmpty && emptyState"
        class="text-center py-8"
      >
        <div class="w-12 h-12 mx-auto mb-4 text-neutral-400">
          <component 
            v-if="emptyState.icon"
            :is="emptyState.icon"
            class="w-full h-full"
          />
        </div>
        <h4 class="text-sm font-medium text-neutral-900 mb-1">
          {{ emptyState.title }}
        </h4>
        <p class="text-sm text-neutral-600">
          {{ emptyState.description }}
        </p>
        <button
          v-if="emptyState.action"
          @click="handleAction(emptyState.action)"
          class="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {{ emptyState.action.label }}
        </button>
      </div>
      
      <!-- Data Display -->
      <div v-else-if="data && displayMode === 'grid'" class="space-y-4">
        <div 
          v-for="(section, sectionIndex) in processedData"
          :key="sectionIndex"
          class="info-section"
        >
          <h4 
            v-if="section.title"
            class="text-sm font-medium text-neutral-700 mb-3 uppercase tracking-wide"
          >
            {{ section.title }}
          </h4>
          <div :class="getGridClasses(section.columns)">
            <div
              v-for="(field, fieldIndex) in section.fields"
              :key="fieldIndex"
              class="info-field"
            >
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                {{ field.label }}
              </label>
              <div class="info-field-value">
                <!-- Editable Field -->
                <div 
                  v-if="field.editable && editMode"
                  class="editable-field"
                >
                  <component
                    :is="getFieldComponent(field.type)"
                    v-model="editableData[field.key]"
                    :field="field"
                    @blur="handleFieldBlur(field)"
                    @keydown.enter="handleFieldSave(field)"
                    @keydown.escape="handleFieldCancel(field)"
                  />
                </div>
                
                <!-- Display Value -->
                <div 
                  v-else
                  :class="getValueClasses(field)"
                  @click="field.editable && enableEditMode ? startEditing(field) : null"
                >
                  <component
                    v-if="field.component"
                    :is="field.component"
                    :value="field.value"
                    :field="field"
                  />
                  <span v-else-if="field.type === 'badge'">
                    <span :class="getBadgeClasses(field.value, field.badgeVariant)">
                      {{ formatValue(field.value, field) }}
                    </span>
                  </span>
                  <span v-else-if="field.type === 'link'">
                    <Link
                      :href="field.href"
                      class="text-primary-600 hover:text-primary-700 underline"
                    >
                      {{ formatValue(field.value, field) }}
                    </Link>
                  </span>
                  <span v-else-if="field.type === 'email'">
                    <a
                      :href="`mailto:${field.value}`"
                      class="text-primary-600 hover:text-primary-700 underline"
                    >
                      {{ formatValue(field.value, field) }}
                    </a>
                  </span>
                  <span v-else-if="field.type === 'phone'">
                    <a
                      :href="`tel:${field.value}`"
                      class="text-primary-600 hover:text-primary-700 underline"
                    >
                      {{ formatValue(field.value, field) }}
                    </a>
                  </span>
                  <span v-else>
                    {{ formatValue(field.value, field) }}
                  </span>
                  
                  <!-- Edit Icon -->
                  <PencilIcon
                    v-if="field.editable && enableEditMode && !editMode"
                    class="w-4 h-4 text-neutral-400 hover:text-neutral-600 ml-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- List Display -->
      <div v-else-if="data && displayMode === 'list'" class="space-y-3">
        <div
          v-for="(item, index) in data"
          :key="index"
          class="flex items-center justify-between py-2 border-b border-neutral-100 last:border-b-0"
        >
          <div class="flex items-center space-x-3">
            <component
              v-if="item.icon"
              :is="item.icon"
              class="w-5 h-5 text-neutral-400"
            />
            <div>
              <p class="text-sm font-medium text-neutral-900">{{ item.label }}</p>
              <p v-if="item.description" class="text-xs text-neutral-600">{{ item.description }}</p>
            </div>
          </div>
          <div class="text-sm text-neutral-600">
            {{ formatValue(item.value, item) }}
          </div>
        </div>
      </div>
      
      <!-- Custom Content -->
      <div v-else>
        <slot />
      </div>
    </div>
    
    <!-- Card Footer -->
    <div 
      v-if="$slots.footer"
      class="info-card-footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watch } from 'vue'
import { Link } from '@inertiajs/vue3'
import { PencilIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/Components/States/LoadingSpinner.vue'

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
    type: [Object, Function],
    default: null
  },
  iconVariant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'error', 'neutral'].includes(value)
  },
  data: {
    type: [Array, Object],
    default: null
  },
  displayMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  },
  actions: {
    type: Array,
    default: () => []
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'bordered', 'elevated'].includes(value)
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
  isEmpty: {
    type: Boolean,
    default: false
  },
  emptyState: {
    type: Object,
    default: null
  },
  enableEditMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['action', 'field-update'])

// Reactive state
const editMode = ref(false)
const editableData = reactive({})
const originalData = reactive({})

// Computed properties
const cardClasses = computed(() => {
  const baseClasses = 'info-card bg-white rounded-lg overflow-hidden'
  const variantClasses = {
    default: '',
    bordered: 'border border-neutral-200',
    elevated: 'shadow-md'
  }
  const sizeClasses = {
    sm: 'text-sm',
    md: '',
    lg: 'text-lg'
  }
  
  return `${baseClasses} ${variantClasses[props.variant]} ${sizeClasses[props.size]}`
})

const contentClasses = computed(() => {
  const baseClasses = 'info-card-content'
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  return `${baseClasses} ${sizeClasses[props.size]}`
})

const iconClasses = computed(() => {
  const baseClasses = 'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center'
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
    neutral: 'bg-neutral-100 text-neutral-600'
  }
  
  return `${baseClasses} ${variantClasses[props.iconVariant]}`
})

const processedData = computed(() => {
  if (!props.data) return []
  
  // If data is already structured with sections
  if (Array.isArray(props.data) && props.data[0]?.title) {
    return props.data
  }
  
  // If data is a flat object, create a single section
  if (typeof props.data === 'object' && !Array.isArray(props.data)) {
    return [{
      fields: Object.entries(props.data).map(([key, config]) => ({
        key,
        label: config.label || key,
        value: config.value,
        type: config.type || 'text',
        editable: config.editable || false,
        ...config
      }))
    }]
  }
  
  return []
})

// Methods
const getGridClasses = (columns = 2) => {
  const columnClasses = {
    1: 'grid grid-cols-1 gap-4',
    2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
  }
  
  return columnClasses[columns] || columnClasses[2]
}

const getActionClasses = (action) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'text-primary-700 bg-primary-100 hover:bg-primary-200 focus:ring-primary-500',
    secondary: 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200 focus:ring-neutral-500',
    success: 'text-success-700 bg-success-100 hover:bg-success-200 focus:ring-success-500',
    warning: 'text-warning-700 bg-warning-100 hover:bg-warning-200 focus:ring-warning-500',
    error: 'text-error-700 bg-error-100 hover:bg-error-200 focus:ring-error-500'
  }
  
  const disabledClasses = 'opacity-50 cursor-not-allowed'
  
  return `${baseClasses} ${variantClasses[action.variant] || variantClasses.secondary} ${action.disabled ? disabledClasses : ''}`
}

const getValueClasses = (field) => {
  const baseClasses = 'text-sm text-neutral-900'
  const editableClasses = field.editable && props.enableEditMode ? 'group cursor-pointer hover:bg-neutral-50 rounded px-2 py-1 -mx-2 -my-1' : ''
  
  return `${baseClasses} ${editableClasses}`
}

const getBadgeClasses = (value, variant = 'neutral') => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    neutral: 'bg-neutral-100 text-neutral-800'
  }
  
  return `${baseClasses} ${variantClasses[variant]}`
}

const formatValue = (value, field = {}) => {
  if (value === null || value === undefined || value === '') {
    return field.emptyText || 'N/A'
  }
  
  switch (field.type) {
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'datetime':
      return new Date(value).toLocaleString()
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: field.currency || 'USD'
      }).format(value)
    case 'number':
      return new Intl.NumberFormat().format(value)
    case 'percentage':
      return `${value}%`
    default:
      return value
  }
}

const getFieldComponent = (type) => {
  // Return appropriate input component based on field type
  const components = {
    text: 'input',
    email: 'input',
    number: 'input',
    date: 'input',
    select: 'select',
    textarea: 'textarea'
  }
  
  return components[type] || 'input'
}

const handleAction = (action) => {
  if (action.disabled || props.loading) return
  
  if (action.handler) {
    action.handler()
  } else {
    emit('action', action)
  }
}

const startEditing = (field) => {
  if (!field.editable || !props.enableEditMode) return
  
  editMode.value = true
  editableData[field.key] = field.value
  originalData[field.key] = field.value
}

const handleFieldBlur = (field) => {
  // Auto-save on blur if configured
  if (field.autoSave !== false) {
    handleFieldSave(field)
  }
}

const handleFieldSave = (field) => {
  const newValue = editableData[field.key]
  const oldValue = originalData[field.key]
  
  if (newValue !== oldValue) {
    emit('field-update', {
      field: field.key,
      oldValue,
      newValue,
      fieldConfig: field
    })
  }
  
  editMode.value = false
}

const handleFieldCancel = (field) => {
  editableData[field.key] = originalData[field.key]
  editMode.value = false
}

// Watch for data changes to update editable data
watch(() => props.data, (newData) => {
  if (newData && typeof newData === 'object') {
    Object.keys(editableData).forEach(key => {
      delete editableData[key]
    })
  }
}, { deep: true })
</script>

<style scoped>
.info-card {
  @apply transition-shadow duration-200;
}

.info-card:hover {
  @apply shadow-sm;
}

.info-card-header {
  @apply px-6 py-4 border-b border-neutral-100;
}

.info-card-footer {
  @apply px-6 py-4 border-t border-neutral-100 bg-neutral-50;
}

.info-field-value {
  @apply flex items-center;
}

.editable-field input,
.editable-field select,
.editable-field textarea {
  @apply w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}
</style>