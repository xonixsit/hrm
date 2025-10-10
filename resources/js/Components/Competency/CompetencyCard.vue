<template>
  <DashboardWidget
    :title="competency.name"
    :loading="loading"
    :error="error"
    :interactive="clickable"
    :class="cardClasses"
    class="competency-card"
    @click="handleClick"
  >
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="animate-pulse space-y-3">
        <div class="flex items-center justify-between">
          <div class="w-16 h-4 bg-gray-200 rounded"></div>
          <div class="w-8 h-4 bg-gray-200 rounded"></div>
        </div>
        <div class="w-full h-2 bg-gray-200 rounded"></div>
        <div class="flex space-x-2">
          <div class="w-16 h-6 bg-gray-200 rounded"></div>
          <div class="w-20 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="flex items-center justify-center h-24 text-error-500">
        <ExclamationTriangleIcon class="w-6 h-6 mr-2" />
        <span class="text-sm">Failed to load competency data</span>
      </div>
    </div>

    <!-- Content State -->
    <div v-else class="competency-content">
      <!-- Header with Category and Weight -->
      <div class="competency-header">
        <div class="flex items-center justify-between mb-3">
          <span :class="categoryClasses" class="category-badge">
            {{ competency.category }}
          </span>
          <div v-if="competency.weight" class="weight-indicator">
            <span class="text-xs text-neutral-500">Weight:</span>
            <span class="text-sm font-medium text-neutral-700 ml-1">
              {{ competency.weight }}
            </span>
          </div>
        </div>
      </div>

      <!-- Current Rating Display -->
      <div class="rating-section">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-neutral-700">Current Rating</span>
          <span v-if="currentRating" :class="ratingValueClasses" class="rating-value">
            {{ currentRating }}/5
          </span>
          <span v-else class="text-sm text-neutral-400">Not assessed</span>
        </div>
        
        <!-- Rating Visualization -->
        <div class="rating-display">
          <div class="flex items-center space-x-1 mb-2">
            <StarIcon
              v-for="star in 5"
              :key="star"
              :class="getStarClasses(star)"
              class="w-4 h-4"
            />
          </div>
          <div v-if="ratingText" class="rating-description">
            <span class="text-xs text-neutral-600">{{ ratingText }}</span>
          </div>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div v-if="showProgress" class="progress-section">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-neutral-600">Progress</span>
          <span class="text-xs text-neutral-600">{{ progressPercentage }}%</span>
        </div>
        <ProgressBar
          :value="progressPercentage"
          :max="100"
          :color="progressColor"
          size="sm"
          rounded="full"
        />
      </div>

      <!-- Assessment History -->
      <div v-if="lastAssessment" class="assessment-info">
        <div class="flex items-center justify-between text-xs text-neutral-500">
          <span>Last assessed:</span>
          <span>{{ formatDate(lastAssessment.created_at) }}</span>
        </div>
        <div v-if="lastAssessment.assessor" class="flex items-center justify-between text-xs text-neutral-500 mt-1">
          <span>By:</span>
          <span>{{ lastAssessment.assessor.name }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <div class="flex space-x-2 mt-4">
          <button
            v-if="canAssess"
            @click.stop="handleAssess"
            class="btn-primary"
            :disabled="loading"
          >
            <PencilSquareIcon class="w-4 h-4 mr-1" />
            {{ hasAssessment ? 'Update' : 'Assess' }}
          </button>
          
          <button
            v-if="canViewDetails"
            @click.stop="handleViewDetails"
            class="btn-secondary"
            :disabled="loading"
          >
            <EyeIcon class="w-4 h-4 mr-1" />
            Details
          </button>
        </div>
      </div>

      <!-- Development Plan Indicator -->
      <div v-if="hasDevelopmentPlan" class="development-indicator">
        <div class="flex items-center mt-3 p-2 bg-blue-50 rounded-md">
          <AcademicCapIcon class="w-4 h-4 text-blue-600 mr-2" />
          <span class="text-xs text-blue-700">Development plan active</span>
        </div>
      </div>
    </div>

    <!-- Click Overlay for Interactive Cards -->
    <div v-if="clickable && !loading && !error" class="click-overlay" @click="handleClick">
      <div class="corner-indicator">
        <ArrowTopRightOnSquareIcon class="w-4 h-4" />
      </div>
    </div>
  </DashboardWidget>
</template>

<script setup>
import { computed } from 'vue'
import { router } from '@inertiajs/vue3'
import DashboardWidget from '@/Components/Dashboard/DashboardWidget.vue'
import ProgressBar from '@/Components/States/ProgressBar.vue'
import {
  StarIcon,
  PencilSquareIcon,
  EyeIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid'

const props = defineProps({
  /**
   * Competency data object
   */
  competency: {
    type: Object,
    required: true
  },

  /**
   * Current rating for this competency
   */
  currentRating: {
    type: Number,
    default: null
  },

  /**
   * Last assessment data
   */
  lastAssessment: {
    type: Object,
    default: null
  },

  /**
   * Whether user can assess this competency
   */
  canAssess: {
    type: Boolean,
    default: false
  },

  /**
   * Whether user can view details
   */
  canViewDetails: {
    type: Boolean,
    default: true
  },

  /**
   * Loading state
   */
  loading: {
    type: Boolean,
    default: false
  },

  /**
   * Error state
   */
  error: {
    type: Boolean,
    default: false
  },

  /**
   * Whether the card is clickable
   */
  clickable: {
    type: Boolean,
    default: false
  },

  /**
   * Show progress indicator
   */
  showProgress: {
    type: Boolean,
    default: false
  },

  /**
   * Progress percentage (0-100)
   */
  progressPercentage: {
    type: Number,
    default: 0
  },

  /**
   * Whether there's an active development plan
   */
  hasDevelopmentPlan: {
    type: Boolean,
    default: false
  },

  /**
   * Card size variant
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },

  /**
   * Card variant
   */
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'compact', 'detailed'].includes(value)
  }
})

const emit = defineEmits(['assess', 'view-details', 'click'])

// Computed properties
const hasAssessment = computed(() => {
  return props.currentRating !== null && props.currentRating !== undefined
})

const ratingText = computed(() => {
  if (!props.currentRating) return null
  
  const ratingLabels = {
    1: 'Poor',
    2: 'Needs Improvement', 
    3: 'Meets Expectations',
    4: 'Exceeds Expectations',
    5: 'Outstanding'
  }
  
  return ratingLabels[props.currentRating] || 'Unknown'
})

const cardClasses = computed(() => [
  'competency-card',
  `competency-card--${props.size}`,
  `competency-card--${props.variant}`,
  {
    'competency-card--clickable': props.clickable,
    'competency-card--has-assessment': hasAssessment.value,
    'competency-card--needs-attention': props.currentRating && props.currentRating <= 2
  }
])

const categoryClasses = computed(() => {
  // Map categories to colors
  const categoryColors = {
    'Attendance & Punctuality': 'bg-blue-100 text-blue-800',
    'Performance in Sales/Targets': 'bg-green-100 text-green-800',
    'File Handling & Accuracy': 'bg-purple-100 text-purple-800',
    'Calling & Call Backs': 'bg-orange-100 text-orange-800',
    'Assessment Scores': 'bg-indigo-100 text-indigo-800',
    'Quality of Work': 'bg-emerald-100 text-emerald-800',
    'Teamwork & Cooperation': 'bg-pink-100 text-pink-800',
    'Adaptability & Learning': 'bg-yellow-100 text-yellow-800',
    'Communication Skills': 'bg-cyan-100 text-cyan-800',
    'Discipline & Integrity': 'bg-red-100 text-red-800'
  }
  
  const defaultColor = 'bg-gray-100 text-gray-800'
  const colorClass = categoryColors[props.competency.category] || defaultColor
  
  return `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`
})

const ratingValueClasses = computed(() => {
  if (!props.currentRating) return 'text-neutral-400'
  
  const ratingColors = {
    1: 'text-red-600 font-semibold',
    2: 'text-orange-600 font-semibold', 
    3: 'text-yellow-600 font-semibold',
    4: 'text-green-600 font-semibold',
    5: 'text-emerald-600 font-semibold'
  }
  
  return ratingColors[props.currentRating] || 'text-neutral-600'
})

const progressColor = computed(() => {
  if (props.progressPercentage >= 80) return 'success'
  if (props.progressPercentage >= 60) return 'primary'
  if (props.progressPercentage >= 40) return 'warning'
  return 'error'
})

// Methods
const getStarClasses = (starNumber) => {
  const isFilled = props.currentRating && starNumber <= props.currentRating
  
  return [
    'transition-colors duration-200',
    {
      'text-yellow-400': isFilled,
      'text-neutral-300': !isFilled
    }
  ]
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
  
  return date.toLocaleDateString()
}

// Event handlers
const handleAssess = () => {
  emit('assess', props.competency)
}

const handleViewDetails = () => {
  emit('view-details', props.competency)
}

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.competency)
  }
}
</script>

<style scoped>
.competency-card {
  position: relative;
  min-height: 200px;
}

.competency-card--sm {
  min-height: 160px;
}

.competency-card--lg {
  min-height: 240px;
}

.competency-card--clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.competency-card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.competency-card--needs-attention {
  border-left: 4px solid #ef4444;
}

.competency-card--has-assessment {
  border-left: 4px solid #10b981;
}

.competency-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.competency-header {
  flex-shrink: 0;
}

.rating-section {
  flex-shrink: 0;
  margin-bottom: 1rem;
}

.progress-section {
  flex-shrink: 0;
  margin-bottom: 1rem;
}

.assessment-info {
  flex-shrink: 0;
  margin-bottom: 1rem;
}

.action-buttons {
  margin-top: auto;
}

.development-indicator {
  flex-shrink: 0;
}

.category-badge {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weight-indicator {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

.rating-display {
  padding: 0.5rem 0;
}

.rating-value {
  font-weight: 600;
  font-size: 0.875rem;
}

.btn-primary {
  @apply inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200;
}

.btn-secondary {
  @apply inline-flex items-center px-3 py-1.5 border border-neutral-300 text-xs font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.click-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.competency-card--clickable:hover .click-overlay {
  opacity: 1;
}

.corner-indicator {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-center;
  width: 1.5rem;
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #6b7280;
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

.competency-card--clickable:hover .corner-indicator {
  transform: translateY(0);
  color: #374151;
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

/* Compact variant */
.competency-card--compact .competency-content {
  padding: 0.5rem 0;
}

.competency-card--compact .rating-section,
.competency-card--compact .progress-section,
.competency-card--compact .assessment-info {
  margin-bottom: 0.5rem;
}

.competency-card--compact .action-buttons {
  margin-top: 0.5rem;
}

/* Detailed variant */
.competency-card--detailed {
  min-height: 280px;
}

.competency-card--detailed .competency-content {
  padding: 0.5rem 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .competency-card {
    min-height: 180px;
  }
  
  .category-badge {
    max-width: 120px;
  }
  
  .action-buttons .flex {
    flex-direction: column;
    space-y: 0.5rem;
  }
  
  .action-buttons .flex > * {
    width: 100%;
    justify-content: center;
  }
}

/* Dark theme support */
.theme-dark .competency-card {
  background: #1f2937;
  border-color: #374151;
}

.theme-dark .category-badge {
  background: #374151;
  color: #d1d5db;
}

.theme-dark .btn-secondary {
  background: #374151;
  border-color: #4b5563;
  color: #d1d5db;
}

.theme-dark .btn-secondary:hover {
  background: #4b5563;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .competency-card--clickable,
  .corner-indicator,
  .click-overlay {
    transition: none;
  }
  
  .competency-card--clickable:hover {
    transform: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .competency-card {
    border: 2px solid;
  }
  
  .category-badge {
    border: 1px solid;
  }
  
  .btn-primary,
  .btn-secondary {
    border-width: 2px;
  }
}
</style>