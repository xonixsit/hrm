<template>
  <div class="assessment-form-wrapper">
    <!-- Assessment Header -->
    <div class="assessment-header">
      <div class="employee-context">
        <div class="employee-info">
          <div class="employee-avatar">
            <div class="avatar-placeholder">
              {{ getInitials(employee.name) }}
            </div>
          </div>
          <div class="employee-details">
            <h3 class="employee-name">{{ employee.name }}</h3>
            <p class="employee-role">{{ employee.position || 'Employee' }}</p>
            <p v-if="employee.department" class="employee-department">{{ employee.department.name }}</p>
          </div>
        </div>
        
        <!-- Assessment Type Badge -->
        <div class="assessment-type-badge" :class="getAssessmentTypeBadgeClasses()">
          {{ getAssessmentTypeLabel() }}
        </div>
      </div>

      <!-- Previous Assessment History -->
      <div v-if="previousAssessments?.length" class="previous-assessments">
        <button
          @click="showHistory = !showHistory"
          class="history-toggle"
          type="button"
        >
          <ChartBarIcon class="w-4 h-4" />
          <span>Assessment History</span>
          <ChevronDownIcon 
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-180': showHistory }"
          />
        </button>
        
        <div v-if="showHistory" class="history-content">
          <div class="history-timeline">
            <div
              v-for="assessment in previousAssessments.slice(0, 3)"
              :key="assessment.id"
              class="history-item"
            >
              <div class="history-date">{{ formatDate(assessment.submitted_at) }}</div>
              <div class="history-rating">
                <RatingDisplay :rating="assessment.rating" :max="5" size="sm" />
              </div>
              <div class="history-assessor">by {{ assessment.assessor.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Competency Context -->
    <div class="competency-context">
      <div class="competency-header">
        <div class="competency-info">
          <h2 class="competency-name">{{ competency.name }}</h2>
          <div class="competency-meta">
            <span class="competency-category">{{ competency.category }}</span>
            <span v-if="competency.weight" class="competency-weight">
              Weight: {{ competency.weight }}
            </span>
          </div>
        </div>
      </div>

      <div class="competency-description">
        <p>{{ competency.description }}</p>
      </div>

      <!-- Measurement Indicators -->
      <div v-if="competency.measurement_indicators?.length" class="measurement-indicators">
        <h4 class="indicators-title">Key Performance Indicators</h4>
        <ul class="indicators-list">
          <li
            v-for="(indicator, index) in competency.measurement_indicators"
            :key="index"
            class="indicator-item"
          >
            <CheckCircleIcon class="indicator-icon" />
            <span>{{ indicator }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Assessment Form -->
    <form @submit.prevent="handleSubmit" class="assessment-form">
      <!-- Rating Section -->
      <FormField
        label="Rating"
        :required="true"
        :error-message="form.errors.rating"
        help-text="Select a rating based on the employee's performance in this competency"
      >
        <RatingInput
          v-model="form.rating"
          :guidelines="competency.rating_guidelines"
          :show-guidelines="true"
          :require-comments-for-extremes="true"
          :error-message="form.errors.rating"
          size="lg"
          @change="handleRatingChange"
        />
      </FormField>

      <!-- Comments Section -->
      <FormField
        label="Comments"
        :required="requiresComments"
        :error-message="form.errors.comments"
        :help-text="getCommentsHelpText()"
      >
        <RichTextEditor
          v-model="form.comments"
          :placeholder="getCommentsPlaceholder()"
          :required="requiresComments"
          :min-length="requiresComments ? 50 : 0"
          :max-length="2000"
          :show-character-count="true"
          :error-message="form.errors.comments"
        />
      </FormField>

      <!-- Evidence Files Section -->
      <FormField
        label="Supporting Evidence"
        :error-message="form.errors.evidence_files"
        help-text="Upload documents, images, or other files that support your assessment (optional)"
      >
        <FileUpload
          v-model="form.evidence_files"
          :multiple="true"
          :max-files="5"
          :max-file-size="10"
          :accepted-types="['image/*', 'application/pdf', '.doc', '.docx', '.txt']"
          :error-message="form.errors.evidence_files"
        />
      </FormField>

      <!-- Development Notes Section (Optional) -->
      <FormField
        label="Development Recommendations"
        :error-message="form.errors.development_notes"
        help-text="Suggest specific actions or resources for improvement (optional)"
      >
        <BaseTextarea
          v-model="form.development_notes"
          placeholder="Provide specific recommendations for skill development, training opportunities, or areas of focus..."
          :rows="4"
          :max-length="1000"
          :show-character-count="true"
          :error-message="form.errors.development_notes"
        />
      </FormField>

      <!-- Form Actions -->
      <div class="form-actions">
        <div class="action-buttons">
          <!-- Save Draft Button -->
          <SecondaryButton
            @click="saveDraft"
            :disabled="form.processing"
            type="button"
          >
            <DocumentIcon class="w-4 h-4 mr-2" />
            Save Draft
          </SecondaryButton>

          <!-- Cancel Button -->
          <SecondaryButton
            @click="handleCancel"
            :disabled="form.processing"
            type="button"
          >
            Cancel
          </SecondaryButton>

          <!-- Submit Button -->
          <PrimaryButton
            type="submit"
            :disabled="!canSubmit || form.processing"
            :class="{ 'opacity-50': form.processing }"
          >
            <span v-if="form.processing" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
            <span v-else class="flex items-center">
              <CheckIcon class="w-4 h-4 mr-2" />
              Submit Assessment
            </span>
          </PrimaryButton>
        </div>

        <!-- Progress Indicator -->
        <div v-if="showProgress" class="progress-indicator">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${completionPercentage}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ completionPercentage }}% Complete</span>
        </div>
      </div>
    </form>

    <!-- Auto-save Indicator -->
    <div v-if="autoSaveStatus" class="auto-save-indicator" :class="getAutoSaveClasses()">
      <div class="flex items-center space-x-2">
        <component :is="getAutoSaveIcon()" class="w-4 h-4" />
        <span class="text-sm">{{ autoSaveStatus }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { 
  ChartBarIcon, 
  ChevronDownIcon, 
  CheckCircleIcon, 
  DocumentIcon, 
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// Import components
import FormField from '@/Components/Forms/FormField.vue'
import RatingInput from '@/Components/Competency/RatingInput.vue'
import RichTextEditor from '@/Components/Competency/RichTextEditor.vue'
import FileUpload from '@/Components/Competency/FileUpload.vue'
import RatingDisplay from '@/Components/Competency/RatingDisplay.vue'
import BaseTextarea from '@/Components/Base/BaseTextarea.vue'
import PrimaryButton from '@/Components/PrimaryButton.vue'
import SecondaryButton from '@/Components/SecondaryButton.vue'

const props = defineProps({
  // Required data
  employee: {
    type: Object,
    required: true
  },
  
  competency: {
    type: Object,
    required: true
  },
  
  // Assessment context
  assessmentType: {
    type: String,
    default: 'manager',
    validator: (value) => ['self', 'manager', 'peer', '360'].includes(value)
  },
  
  assessmentCycle: {
    type: Object,
    default: null
  },
  
  // Existing assessment (for editing)
  existingAssessment: {
    type: Object,
    default: null
  },
  
  // Historical data
  previousAssessments: {
    type: Array,
    default: () => []
  },
  
  // Form options
  showProgress: {
    type: Boolean,
    default: true
  },
  
  autoSave: {
    type: Boolean,
    default: true
  },
  
  autoSaveInterval: {
    type: Number,
    default: 30000 // 30 seconds
  }
})

const emit = defineEmits([
  'submit', 
  'cancel', 
  'draft-saved', 
  'rating-changed',
  'validation-error'
])

// Local state
const showHistory = ref(false)
const autoSaveStatus = ref('')
const autoSaveTimer = ref(null)
const lastSavedData = ref(null)

// Form setup
const form = useForm({
  employee_id: props.employee?.id,
  competency_id: props.competency?.id,
  assessment_cycle_id: props.assessmentCycle?.id || null,
  rating: props.existingAssessment?.rating || null,
  comments: props.existingAssessment?.comments || '',
  evidence_files: props.existingAssessment?.evidence_files || [],
  development_notes: props.existingAssessment?.development_notes || '',
  assessment_type: props.assessmentType,
  status: 'draft'
})

// Computed properties
const requiresComments = computed(() => {
  if (!form.rating) return false
  const rating = parseInt(form.rating)
  return rating <= 2 || rating >= 4
})

const canSubmit = computed(() => {
  return form.rating && 
         (!requiresComments.value || (form.comments && form.comments.length >= 50)) &&
         !form.processing
})

const completionPercentage = computed(() => {
  let completed = 0
  let total = 2 // rating and comments are required
  
  if (form.rating) completed++
  if (form.comments && (!requiresComments.value || form.comments.length >= 50)) completed++
  
  return Math.round((completed / total) * 100)
})

// Helper methods
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getAssessmentTypeLabel = () => {
  const labels = {
    self: 'Self Assessment',
    manager: 'Manager Assessment',
    peer: 'Peer Assessment',
    '360': '360° Feedback'
  }
  return labels[props.assessmentType] || 'Assessment'
}

const getAssessmentTypeBadgeClasses = () => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  const variants = {
    self: 'bg-blue-100 text-blue-800',
    manager: 'bg-green-100 text-green-800',
    peer: 'bg-purple-100 text-purple-800',
    '360': 'bg-orange-100 text-orange-800'
  }
  return `${baseClasses} ${variants[props.assessmentType] || variants.manager}`
}

const getCommentsHelpText = () => {
  if (!form.rating) return 'Comments will be required based on your rating selection'
  
  const rating = parseInt(form.rating)
  if (rating <= 2) {
    return 'Detailed comments are required for ratings of 2 or below. Please explain areas for improvement and provide specific examples.'
  }
  if (rating >= 4) {
    return 'Detailed comments are required for ratings of 4 or above. Please highlight exceptional performance and specific achievements.'
  }
  return 'Comments are optional for this rating, but encouraged to provide context.'
}

const getCommentsPlaceholder = () => {
  if (!form.rating) return 'Provide detailed feedback about the employee\'s performance in this competency...'
  
  const rating = parseInt(form.rating)
  if (rating <= 2) {
    return 'Describe specific areas where improvement is needed, provide examples of performance gaps, and suggest actionable steps for development...'
  }
  if (rating >= 4) {
    return 'Highlight specific examples of exceptional performance, describe how the employee exceeded expectations, and note any leadership or innovation demonstrated...'
  }
  return 'Provide context for your rating, specific examples of performance, and any observations that support your assessment...'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getAutoSaveClasses = () => {
  const baseClasses = 'fixed bottom-4 right-4 bg-white border rounded-lg px-3 py-2 shadow-lg z-50'
  
  if (autoSaveStatus.value.includes('Error')) {
    return `${baseClasses} border-error-200 text-error-700`
  }
  if (autoSaveStatus.value.includes('Saved')) {
    return `${baseClasses} border-success-200 text-success-700`
  }
  return `${baseClasses} border-neutral-200 text-neutral-600`
}

const getAutoSaveIcon = () => {
  if (autoSaveStatus.value.includes('Error')) return ExclamationTriangleIcon
  if (autoSaveStatus.value.includes('Saved')) return CheckIcon
  return ClockIcon
}

// Event handlers
const handleRatingChange = (rating) => {
  emit('rating-changed', rating)
  
  // Clear comments if no longer required
  if (!requiresComments.value && form.comments.length < 50) {
    // Don't clear, just make it optional
  }
  
  // Trigger auto-save
  if (props.autoSave) {
    scheduleAutoSave()
  }
}

const handleSubmit = () => {
  // Validate required fields
  if (!form.rating) {
    emit('validation-error', { field: 'rating', message: 'Rating is required' })
    return
  }
  
  if (requiresComments.value && (!form.comments || form.comments.length < 50)) {
    emit('validation-error', { 
      field: 'comments', 
      message: 'Detailed comments are required for this rating' 
    })
    return
  }
  
  form.status = 'submitted'
  
  // Extract only filenames from file objects before submission
  const submissionData = {
    ...form.data(),
    evidence_files: form.evidence_files.map(file => 
      typeof file === 'string' ? file : (file.name || file.filename || file.originalName)
    ).filter(Boolean)
  }
  
  form.post(route('competency-assessments.store'), {
    data: submissionData,
    onSuccess: () => {
      emit('submit', submissionData)
    },
    onError: (errors) => {
      emit('validation-error', errors)
    }
  })
}

const saveDraft = () => {
  form.status = 'draft'
  
  // Extract only filenames from file objects before submission
  const submissionData = {
    ...form.data(),
    evidence_files: form.evidence_files.map(file => 
      typeof file === 'string' ? file : (file.name || file.filename || file.originalName)
    ).filter(Boolean)
  }
  
  form.post(route('competency-assessments.store'), {
    data: submissionData,
    onSuccess: () => {
      emit('draft-saved', form.data())
      autoSaveStatus.value = 'Draft saved'
      setTimeout(() => {
        autoSaveStatus.value = ''
      }, 3000)
    },
    onError: () => {
      autoSaveStatus.value = 'Error saving draft'
      setTimeout(() => {
        autoSaveStatus.value = ''
      }, 5000)
    }
  })
}

const handleCancel = () => {
  if (hasUnsavedChanges()) {
    if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      emit('cancel')
    }
  } else {
    emit('cancel')
  }
}

const hasUnsavedChanges = () => {
  if (!lastSavedData.value) return true
  
  return JSON.stringify(form.data()) !== JSON.stringify(lastSavedData.value)
}

const scheduleAutoSave = () => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
  
  autoSaveTimer.value = setTimeout(() => {
    if (hasUnsavedChanges() && (form.rating || form.comments)) {
      performAutoSave()
    }
  }, props.autoSaveInterval)
}

const performAutoSave = () => {
  if (form.processing) return
  
  autoSaveStatus.value = 'Saving...'
  
  form.status = 'draft'
  
  // Extract only filenames from file objects before submission
  const submissionData = {
    ...form.data(),
    evidence_files: form.evidence_files.map(file => 
      typeof file === 'string' ? file : (file.name || file.filename || file.originalName)
    ).filter(Boolean)
  }
  
  form.post(route('competency-assessments.store'), {
    data: submissionData,
    preserveScroll: true,
    onSuccess: () => {
      lastSavedData.value = { ...submissionData }
      autoSaveStatus.value = 'Auto-saved'
      setTimeout(() => {
        autoSaveStatus.value = ''
      }, 3000)
    },
    onError: () => {
      autoSaveStatus.value = 'Auto-save failed'
      setTimeout(() => {
        autoSaveStatus.value = ''
      }, 5000)
    }
  })
}

// Watchers
watch([() => form.rating, () => form.comments, () => form.development_notes], () => {
  if (props.autoSave) {
    scheduleAutoSave()
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  lastSavedData.value = { ...form.data() }
})

onUnmounted(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
})

// Expose methods for parent components
defineExpose({
  saveDraft,
  hasUnsavedChanges,
  form
})
</script>