<template>
  <AuthenticatedLayout>
    <!-- Page Header -->
    <div class="assessment-page-header">
      <div class="header-container">
        <div class="header-content">
          <div class="breadcrumb-section">
            <nav class="breadcrumb-nav">
              <Link :href="route('assessment-dashboard')" class="breadcrumb-link">
                Assessment Dashboard
              </Link>
              <ChevronRightIcon class="breadcrumb-separator" />
              <span class="breadcrumb-current">
                {{ isEditing ? 'Edit Assessment' : 'New Assessment' }}
              </span>
            </nav>
          </div>
          
          <div class="title-section">
            <h1 class="page-title">
              {{ isEditing ? 'Edit Assessment' : 'Create Assessment' }}
            </h1>
            <p class="page-subtitle">
              {{ getPageSubtitle() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="assessment-page-container">
      <!-- Progress Steps (for new assessments) -->
      <div v-if="!isEditing && showSteps" class="progress-steps">
        <div class="steps-container">
          <div class="steps-list">
            <div
              v-for="(step, index) in assessmentSteps"
              :key="step.id"
              class="step-item"
              :class="getStepClasses(index)"
            >
              <div class="step-indicator">
                <component
                  :is="getStepIcon(index)"
                  class="step-icon"
                />
                <span class="step-number">{{ index + 1 }}</span>
              </div>
              <div class="step-content">
                <div class="step-title">{{ step.title }}</div>
                <div class="step-description">{{ step.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Form Container -->
      <div class="form-container">
        <div class="form-wrapper">
          <!-- Loading State -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p class="loading-text">Loading assessment data...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-container">
            <div class="error-content">
              <ExclamationTriangleIcon class="error-icon" />
              <h3 class="error-title">Unable to Load Assessment</h3>
              <p class="error-message">{{ error }}</p>
              <div class="error-actions">
                <SecondaryButton @click="retryLoad">
                  <ArrowPathIcon class="w-4 h-4 mr-2" />
                  Retry
                </SecondaryButton>
                <PrimaryButton @click="goBack">
                  Go Back
                </PrimaryButton>
              </div>
            </div>
          </div>

          <!-- Assessment Form -->
          <div v-else class="assessment-form-container">
            <!-- Form Header with Context -->
            <div class="form-header">
              <div class="context-cards">
                <!-- Employee Context Card -->
                <div class="context-card employee-card">
                  <div class="card-header">
                    <UserIcon class="card-icon" />
                    <h3 class="card-title">Employee</h3>
                  </div>
                  <div class="card-content">
                    <div class="employee-summary">
                      <div class="employee-avatar">
                        <div class="avatar-circle">
                          {{ getInitials(employee.name) }}
                        </div>
                      </div>
                      <div class="employee-info">
                        <div class="employee-name">{{ employee.name }}</div>
                        <div class="employee-details">
                          <span v-if="employee.position" class="employee-position">
                            {{ employee.position }}
                          </span>
                          <span v-if="employee.department" class="employee-department">
                            {{ employee.department.name }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Competency Context Card -->
                <div class="context-card competency-card">
                  <div class="card-header">
                    <ChartBarIcon class="card-icon" />
                    <h3 class="card-title">Competency</h3>
                  </div>
                  <div class="card-content">
                    <div class="competency-summary">
                      <div class="competency-name">{{ competency.name }}</div>
                      <div class="competency-meta">
                        <span class="competency-category">{{ competency.category }}</span>
                        <span v-if="competency.weight" class="competency-weight">
                          Weight: {{ competency.weight }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Assessment Cycle Context Card (if applicable) -->
                <div v-if="assessmentCycle" class="context-card cycle-card">
                  <div class="card-header">
                    <CalendarIcon class="card-icon" />
                    <h3 class="card-title">Assessment Cycle</h3>
                  </div>
                  <div class="card-content">
                    <div class="cycle-summary">
                      <div class="cycle-name">{{ assessmentCycle.name }}</div>
                      <div class="cycle-period">
                        {{ formatDateRange(assessmentCycle.start_date, assessmentCycle.end_date) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Main Assessment Form -->
            <div class="main-form">
              <AssessmentForm
                ref="assessmentFormRef"
                :employee="employee"
                :competency="competency"
                :assessment-type="assessmentType"
                :assessment-cycle="assessmentCycle"
                :existing-assessment="existingAssessment"
                :previous-assessments="previousAssessments"
                :show-progress="true"
                :auto-save="true"
                @submit="handleSubmit"
                @cancel="handleCancel"
                @draft-saved="handleDraftSaved"
                @rating-changed="handleRatingChanged"
                @validation-error="handleValidationError"
              />
            </div>
          </div>
        </div>

        <!-- Sidebar with Additional Information -->
        <div class="sidebar">
          <!-- Assessment Guidelines -->
          <div class="sidebar-card guidelines-card">
            <div class="card-header">
              <InformationCircleIcon class="card-icon" />
              <h3 class="card-title">Assessment Guidelines</h3>
            </div>
            <div class="card-content">
              <div class="guidelines-content">
                <div class="guideline-item">
                  <div class="guideline-title">Rating Scale</div>
                  <div class="rating-scale">
                    <div v-for="(level, index) in ratingLevels" :key="index" class="rating-level">
                      <div class="rating-number">{{ index + 1 }}</div>
                      <div class="rating-label">{{ level }}</div>
                    </div>
                  </div>
                </div>
                
                <div v-if="competency.rating_guidelines?.length" class="guideline-item">
                  <div class="guideline-title">Specific Guidelines</div>
                  <ul class="guidelines-list">
                    <li
                      v-for="(guideline, index) in competency.rating_guidelines"
                      :key="index"
                      class="guideline-point"
                    >
                      {{ guideline }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Previous Assessments Summary -->
          <div v-if="previousAssessments?.length" class="sidebar-card history-card">
            <div class="card-header">
              <ClockIcon class="card-icon" />
              <h3 class="card-title">Assessment History</h3>
            </div>
            <div class="card-content">
              <div class="history-summary">
                <div class="history-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ previousAssessments.length }}</div>
                    <div class="stat-label">Previous Assessments</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ averageRating }}</div>
                    <div class="stat-label">Average Rating</div>
                  </div>
                </div>
                
                <div class="recent-assessments">
                  <div class="recent-title">Recent Assessments</div>
                  <div class="recent-list">
                    <div
                      v-for="assessment in previousAssessments.slice(0, 3)"
                      :key="assessment.id"
                      class="recent-item"
                    >
                      <div class="recent-date">{{ formatDate(assessment.submitted_at) }}</div>
                      <div class="recent-rating">
                        <RatingDisplay :rating="assessment.rating" :max="5" size="sm" />
                      </div>
                      <div class="recent-assessor">{{ assessment.assessor.name }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Help and Support -->
          <div class="sidebar-card help-card">
            <div class="card-header">
              <QuestionMarkCircleIcon class="card-icon" />
              <h3 class="card-title">Need Help?</h3>
            </div>
            <div class="card-content">
              <div class="help-content">
                <p class="help-text">
                  If you need assistance with this assessment, you can:
                </p>
                <ul class="help-actions">
                  <li>
                    <button @click="contactSupport" class="help-link">
                      Contact Support
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmation"
      :title="confirmationTitle"
      :message="confirmationMessage"
      :confirm-text="confirmationConfirmText"
      :cancel-text="confirmationCancelText"
      @confirm="handleConfirmationConfirm"
      @cancel="handleConfirmationCancel"
    />

    <!-- Success Modal -->
    <SuccessModal
      :show="showSuccess"
      :title="successTitle"
      :message="successMessage"
      @close="handleSuccessClose"
    />

    <!-- Notification Toast -->
    <div v-if="notifications.length > 0" class="notification-overlay">
      <div class="notification-center">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="getNotificationClasses(notification.type)"
          class="notification-card"
        >
          <div class="notification-icon">
            <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
          </div>
          <div class="notification-text">
            <p class="notification-message">{{ notification.message }}</p>
          </div>
          <button
            @click="removeNotification(notification.id)"
            class="notification-close"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import AssessmentForm from '@/Components/Competency/AssessmentForm.vue';
import RatingDisplay from '@/Components/Competency/RatingDisplay.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import SecondaryButton from '@/Components/SecondaryButton.vue';
import ConfirmationModal from '@/Components/Modals/ConfirmationModal.vue';
import SuccessModal from '@/Components/Modals/SuccessModal.vue';
import {
  ChevronRightIcon,
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  InformationCircleIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  // Core data
  employee: {
    type: Object,
    required: true
  },
  competency: {
    type: Object,
    required: true
  },
  assessmentType: {
    type: String,
    default: 'manager'
  },
  assessmentCycle: {
    type: Object,
    default: null
  },
  existingAssessment: {
    type: Object,
    default: null
  },
  previousAssessments: {
    type: Array,
    default: () => []
  },
  
  // UI options
  showSteps: {
    type: Boolean,
    default: true
  }
});

// Local state
const loading = ref(false);
const error = ref(null);
const assessmentFormRef = ref(null);
const currentStep = ref(0);
const notifications = ref([]);

// Modal states
const showConfirmation = ref(false);
const confirmationTitle = ref('');
const confirmationMessage = ref('');
const confirmationConfirmText = ref('Confirm');
const confirmationCancelText = ref('Cancel');
const confirmationCallback = ref(null);

const showSuccess = ref(false);
const successTitle = ref('');
const successMessage = ref('');

// Computed properties
const isEditing = computed(() => !!props.existingAssessment);

const assessmentSteps = computed(() => [
  {
    id: 'context',
    title: 'Review Context',
    description: 'Review employee and competency information'
  },
  {
    id: 'rating',
    title: 'Provide Rating',
    description: 'Rate the employee\'s performance'
  },
  {
    id: 'feedback',
    title: 'Add Feedback',
    description: 'Provide detailed comments and evidence'
  },
  {
    id: 'submit',
    title: 'Submit Assessment',
    description: 'Review and submit your assessment'
  }
]);

const ratingLevels = computed(() => [
  'Poor',
  'Needs Improvement',
  'Meets Expectations',
  'Exceeds Expectations',
  'Outstanding'
]);

const averageRating = computed(() => {
  if (!props.previousAssessments?.length) return 'N/A';
  
  const sum = props.previousAssessments.reduce((acc, assessment) => acc + assessment.rating, 0);
  return (sum / props.previousAssessments.length).toFixed(1);
});

// Methods
const getPageSubtitle = () => {
  if (isEditing.value) {
    return `Editing assessment for ${props.employee.name} - ${props.competency.name}`;
  }
  return `Assessing ${props.employee.name} on ${props.competency.name}`;
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${start} - ${end}`;
};

const getStepClasses = (index) => {
  const baseClasses = 'step-item';
  if (index < currentStep.value) return `${baseClasses} completed`;
  if (index === currentStep.value) return `${baseClasses} active`;
  return `${baseClasses} pending`;
};

const getStepIcon = (index) => {
  if (index < currentStep.value) return CheckIcon;
  return 'div'; // Will show step number instead
};

// Event handlers
const handleSubmit = (assessmentData) => {
  confirmationTitle.value = 'Submit Assessment';
  confirmationMessage.value = 'Are you sure you want to submit this assessment? Once submitted, it cannot be edited.';
  confirmationConfirmText.value = 'Submit Assessment';
  confirmationCallback.value = () => {
    performSubmit(assessmentData);
  };
  showConfirmation.value = true;
};

const performSubmit = (assessmentData) => {
  loading.value = true;
  
  // The form submission is handled by the AssessmentForm component
  // We just need to show success feedback
  setTimeout(() => {
    loading.value = false;
    successTitle.value = 'Assessment Submitted';
    successMessage.value = 'The assessment has been successfully submitted and the employee will be notified.';
    showSuccess.value = true;
  }, 1000);
};

const handleCancel = () => {
  if (assessmentFormRef.value?.hasUnsavedChanges()) {
    confirmationTitle.value = 'Cancel Assessment';
    confirmationMessage.value = 'You have unsaved changes. Are you sure you want to cancel?';
    confirmationConfirmText.value = 'Yes, Cancel';
    confirmationCallback.value = () => {
      goBack();
    };
    showConfirmation.value = true;
  } else {
    goBack();
  }
};

const handleDraftSaved = (assessmentData) => {
  showNotification('Draft saved successfully', 'success');
};

const handleRatingChanged = (rating) => {
  // Update current step based on progress
  if (rating && currentStep.value < 1) {
    currentStep.value = 1;
  }
};

const handleValidationError = (errors) => {
  if (typeof errors === 'object' && errors.field) {
    showNotification(`${errors.field}: ${errors.message}`, 'error');
  } else {
    showNotification('Please check the form for errors', 'error');
  }
};

const goBack = () => {
  router.visit(route('assessment-dashboard'));
};

const retryLoad = () => {
  error.value = null;
  loading.value = true;
  
  // Simulate retry
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};

const contactSupport = () => {
  // Implement support contact logic
  showNotification('Support contact feature coming soon', 'info');
};

// Modal handlers
const handleConfirmationConfirm = () => {
  showConfirmation.value = false;
  if (confirmationCallback.value) {
    confirmationCallback.value();
    confirmationCallback.value = null;
  }
};

const handleConfirmationCancel = () => {
  showConfirmation.value = false;
  confirmationCallback.value = null;
};

const handleSuccessClose = () => {
  showSuccess.value = false;
  goBack();
};

// Notification system
const showNotification = (message, type = 'info', duration = 4000) => {
  const id = Date.now();
  const notification = {
    id,
    message,
    type,
    visible: true
  };
  
  notifications.value.push(notification);
  
  setTimeout(() => {
    removeNotification(id);
  }, duration);
};

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

const getNotificationClasses = (type) => {
  const baseClasses = 'notification-toast';
  const typeClasses = {
    success: 'notification-success',
    error: 'notification-error',
    warning: 'notification-warning',
    info: 'notification-info'
  };
  return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
};

const getNotificationIcon = (type) => {
  const iconMap = {
    success: CheckIcon,
    error: ExclamationTriangleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };
  return iconMap[type] || InformationCircleIcon;
};

// Lifecycle
onMounted(() => {
  // Any initialization logic
});

onBeforeUnmount(() => {
  // Cleanup
});
</script>

<style scoped>
/* Page Layout */
.assessment-page-header {
  @apply bg-white border-b border-gray-200 px-6 py-6;
}

.header-container {
  @apply max-w-7xl mx-auto;
}

.breadcrumb-nav {
  @apply flex items-center space-x-2 text-sm text-gray-500 mb-4;
}

.breadcrumb-link {
  @apply hover:text-gray-700 transition-colors duration-200;
}

.breadcrumb-separator {
  @apply w-4 h-4;
}

.breadcrumb-current {
  @apply text-gray-900 font-medium;
}

.page-title {
  @apply text-3xl font-bold text-gray-900;
}

.page-subtitle {
  @apply text-gray-600 mt-2;
}

.assessment-page-container {
  @apply max-w-7xl mx-auto px-6 py-6;
}

/* Progress Steps */
.progress-steps {
  @apply mb-8;
}

.steps-container {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
}

.steps-list {
  @apply flex items-center justify-between;
}

.step-item {
  @apply flex items-center space-x-3 flex-1;
}

.step-item:not(:last-child)::after {
  content: '';
  @apply flex-1 h-px bg-gray-200 mx-4;
}

.step-item.completed::after {
  @apply bg-green-300;
}

.step-item.active::after {
  @apply bg-blue-300;
}

.step-indicator {
  @apply relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200;
}

.step-item.pending .step-indicator {
  @apply border-gray-300 bg-white text-gray-500;
}

.step-item.active .step-indicator {
  @apply border-blue-500 bg-blue-500 text-white;
}

.step-item.completed .step-indicator {
  @apply border-green-500 bg-green-500 text-white;
}

.step-icon {
  @apply w-5 h-5;
}

.step-number {
  @apply text-sm font-medium;
}

.step-content {
  @apply text-left;
}

.step-title {
  @apply font-medium text-gray-900;
}

.step-description {
  @apply text-sm text-gray-500 mt-1;
}

/* Form Container */
.form-container {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-8;
}

.form-wrapper {
  @apply lg:col-span-2;
}

.loading-container,
.error-container {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center;
}

.loading-spinner {
  @apply flex justify-center mb-4;
}

.loading-text {
  @apply text-gray-600;
}

.error-content {
  @apply space-y-4;
}

.error-icon {
  @apply w-12 h-12 text-red-500 mx-auto;
}

.error-title {
  @apply text-lg font-semibold text-gray-900;
}

.error-message {
  @apply text-gray-600;
}

.error-actions {
  @apply flex items-center justify-center space-x-3;
}

/* Form Header */
.form-header {
  @apply mb-8;
}

.context-cards {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.context-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden;
}

.card-header {
  @apply flex items-center space-x-2 px-4 py-3 bg-gray-50 border-b border-gray-200;
}

.card-icon {
  @apply w-5 h-5 text-gray-600;
}

.card-title {
  @apply font-medium text-gray-900;
}

.card-content {
  @apply p-4;
}

/* Employee Card */
.employee-summary {
  @apply flex items-center space-x-3;
}

.employee-avatar .avatar-circle {
  @apply w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium;
}

.employee-name {
  @apply font-semibold text-gray-900;
}

.employee-details {
  @apply flex flex-col space-y-1 text-sm text-gray-600;
}

/* Competency Card */
.competency-name {
  @apply font-semibold text-gray-900 mb-2;
}

.competency-meta {
  @apply flex items-center space-x-2 text-sm;
}

.competency-category {
  @apply px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium;
}

.competency-weight {
  @apply text-gray-600;
}

/* Cycle Card */
.cycle-name {
  @apply font-semibold text-gray-900 mb-1;
}

.cycle-period {
  @apply text-sm text-gray-600;
}

/* Main Form */
.main-form {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
}

/* Sidebar */
.sidebar {
  @apply space-y-6;
}

.sidebar-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden;
}

/* Guidelines Card */
.guidelines-content {
  @apply space-y-4;
}

.guideline-item {
  @apply space-y-2;
}

.guideline-title {
  @apply font-medium text-gray-900;
}

.rating-scale {
  @apply space-y-2;
}

.rating-level {
  @apply flex items-center space-x-2 text-sm;
}

.rating-number {
  @apply w-6 h-6 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium;
}

.rating-label {
  @apply text-gray-600;
}

.guidelines-list {
  @apply space-y-1 text-sm text-gray-600;
}

.guideline-point {
  @apply flex items-start space-x-2;
}

.guideline-point::before {
  content: '•';
  @apply text-gray-400 font-bold;
}

/* History Card */
.history-summary {
  @apply space-y-4;
}

.history-stats {
  @apply grid grid-cols-2 gap-4;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply text-lg font-semibold text-gray-900;
}

.stat-label {
  @apply text-xs text-gray-500 mt-1;
}

.recent-title {
  @apply font-medium text-gray-900 mb-2;
}

.recent-list {
  @apply space-y-2;
}

.recent-item {
  @apply flex items-center justify-between text-sm;
}

.recent-date {
  @apply text-gray-600;
}

.recent-assessor {
  @apply text-gray-500 text-xs;
}

/* Help Card */
.help-text {
  @apply text-sm text-gray-600 mb-3;
}

.help-actions {
  @apply space-y-2;
}

.help-link {
  @apply text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200;
}

/* Notifications */
.notification-overlay {
  @apply fixed top-4 right-4 z-50 space-y-2;
}

.notification-card {
  @apply flex items-center space-x-3 p-4 rounded-lg shadow-lg max-w-sm;
}

.notification-success {
  @apply bg-green-50 border border-green-200 text-green-800;
}

.notification-error {
  @apply bg-red-50 border border-red-200 text-red-800;
}

.notification-warning {
  @apply bg-yellow-50 border border-yellow-200 text-yellow-800;
}

.notification-info {
  @apply bg-blue-50 border border-blue-200 text-blue-800;
}

.notification-close {
  @apply text-gray-400 hover:text-gray-600 transition-colors duration-200;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .context-cards {
    @apply grid-cols-1 md:grid-cols-2;
  }
  
  .form-container {
    @apply grid-cols-1;
  }
  
  .sidebar {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
  }
}

@media (max-width: 768px) {
  .steps-list {
    @apply flex-col space-y-4;
  }
  
  .step-item::after {
    @apply hidden;
  }
  
  .context-cards {
    @apply grid-cols-1;
  }
  
  .sidebar {
    @apply grid-cols-1;
  }
}
</style>