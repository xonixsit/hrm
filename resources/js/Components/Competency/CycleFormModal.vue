<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
              <!-- Modal Header -->
              <div class="modal-header">
                <div class="header-content">
                  <DialogTitle as="h3" class="modal-title">
                    {{ isEditing ? 'Edit Assessment Cycle' : 'Create Assessment Cycle' }}
                  </DialogTitle>
                  <p class="modal-subtitle">
                    {{ isEditing ? 'Update the assessment cycle details' : 'Set up a new assessment cycle for systematic competency evaluation' }}
                  </p>
                </div>
                <button
                  @click="$emit('close')"
                  class="close-button"
                >
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>

              <!-- Modal Content -->
              <div class="modal-content">
                <form @submit.prevent="handleSubmit" class="cycle-form">
                  <!-- Step Indicator -->
                  <div class="step-indicator">
                    <div class="steps-list">
                      <div
                        v-for="(step, index) in formSteps"
                        :key="step.id"
                        class="step-item"
                        :class="getStepClasses(index)"
                      >
                        <div class="step-number">{{ index + 1 }}</div>
                        <div class="step-label">{{ step.label }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Form Steps -->
                  <div class="form-steps">
                    <!-- Step 1: Basic Information -->
                    <div v-show="currentStep === 0" class="form-step">
                      <div class="step-header">
                        <h4 class="step-title">Basic Information</h4>
                        <p class="step-description">Provide the basic details for your assessment cycle</p>
                      </div>

                      <div class="form-grid">
                        <FormField
                          label="Cycle Name"
                          :required="true"
                          :error-message="form.errors.name"
                          help-text="A descriptive name for this assessment cycle"
                        >
                          <BaseInput
                            v-model="form.name"
                            placeholder="e.g., Q1 2024 Performance Review"
                            :error-message="form.errors.name"
                            required
                          />
                        </FormField>

                        <FormField
                          label="Description"
                          :error-message="form.errors.description"
                          help-text="Optional description of the assessment cycle's purpose"
                        >
                          <BaseTextarea
                            v-model="form.description"
                            placeholder="Describe the purpose and scope of this assessment cycle..."
                            :rows="3"
                            :error-message="form.errors.description"
                          />
                        </FormField>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            label="Start Date"
                            :required="true"
                            :error-message="form.errors.start_date"
                          >
                            <BaseInput
                              v-model="form.start_date"
                              type="date"
                              :error-message="form.errors.start_date"
                              required
                            />
                          </FormField>

                          <FormField
                            label="End Date"
                            :required="true"
                            :error-message="form.errors.end_date"
                          >
                            <BaseInput
                              v-model="form.end_date"
                              type="date"
                              :error-message="form.errors.end_date"
                              required
                            />
                          </FormField>
                        </div>

                        <FormField
                          label="Assessment Types"
                          :required="true"
                          :error-message="form.errors.assessment_types"
                          help-text="Select the types of assessments to include in this cycle"
                        >
                          <div class="assessment-types-grid">
                            <label
                              v-for="type in assessmentTypes"
                              :key="type.value"
                              class="assessment-type-option"
                            >
                              <input
                                v-model="form.assessment_types"
                                :value="type.value"
                                type="checkbox"
                                class="assessment-type-checkbox"
                              />
                              <div class="assessment-type-content">
                                <div class="assessment-type-name">{{ type.label }}</div>
                                <div class="assessment-type-description">{{ type.description }}</div>
                              </div>
                            </label>
                          </div>
                        </FormField>
                      </div>
                    </div>

                    <!-- Step 2: Participant Selection -->
                    <div v-show="currentStep === 1" class="form-step">
                      <div class="step-header">
                        <h4 class="step-title">Participant Selection</h4>
                        <p class="step-description">Choose which employees will participate in this assessment cycle</p>
                      </div>

                      <div class="participant-selection">
                        <!-- Selection Mode -->
                        <div class="selection-mode">
                          <div class="mode-options">
                            <label class="mode-option">
                              <input
                                v-model="selectionMode"
                                value="all"
                                type="radio"
                                class="mode-radio"
                              />
                              <div class="mode-content">
                                <div class="mode-title">All Employees</div>
                                <div class="mode-description">Include all active employees</div>
                              </div>
                            </label>

                            <label class="mode-option">
                              <input
                                v-model="selectionMode"
                                value="department"
                                type="radio"
                                class="mode-radio"
                              />
                              <div class="mode-content">
                                <div class="mode-title">By Department</div>
                                <div class="mode-description">Select specific departments</div>
                              </div>
                            </label>

                            <label class="mode-option">
                              <input
                                v-model="selectionMode"
                                value="individual"
                                type="radio"
                                class="mode-radio"
                              />
                              <div class="mode-content">
                                <div class="mode-title">Individual Selection</div>
                                <div class="mode-description">Choose specific employees</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        <!-- Department Selection -->
                        <div v-if="selectionMode === 'department'" class="department-selection">
                          <FormField
                            label="Select Departments"
                            :error-message="form.errors.departments"
                          >
                            <div class="department-grid">
                              <label
                                v-for="department in departments"
                                :key="department.id"
                                class="department-option"
                              >
                                <input
                                  v-model="selectedDepartments"
                                  :value="department.id"
                                  type="checkbox"
                                  class="department-checkbox"
                                />
                                <div class="department-content">
                                  <div class="department-name">{{ department.name }}</div>
                                  <div class="department-count">{{ department.employee_count || 0 }} employees</div>
                                </div>
                              </label>
                            </div>
                          </FormField>
                        </div>

                        <!-- Individual Selection -->
                        <div v-if="selectionMode === 'individual'" class="individual-selection">
                          <FormField
                            label="Select Employees"
                            :error-message="form.errors.employees"
                          >
                            <div class="employee-search">
                              <div class="search-input">
                                <MagnifyingGlassIcon class="search-icon" />
                                <input
                                  v-model="employeeSearch"
                                  type="text"
                                  placeholder="Search employees..."
                                  class="search-field"
                                />
                              </div>
                            </div>

                            <div class="employee-list">
                              <label
                                v-for="employee in filteredEmployees"
                                :key="employee.id"
                                class="employee-option"
                              >
                                <input
                                  v-model="selectedEmployees"
                                  :value="employee.id"
                                  type="checkbox"
                                  class="employee-checkbox"
                                />
                                <div class="employee-content">
                                  <div class="employee-avatar">
                                    <div class="avatar-circle">
                                      {{ getInitials(employee.name) }}
                                    </div>
                                  </div>
                                  <div class="employee-info">
                                    <div class="employee-name">{{ employee.name }}</div>
                                    <div class="employee-details">
                                      <span v-if="employee.position" class="employee-position">{{ employee.position }}</span>
                                      <span v-if="employee.department" class="employee-department">{{ employee.department.name }}</span>
                                    </div>
                                  </div>
                                </div>
                              </label>
                            </div>
                          </FormField>
                        </div>

                        <!-- Selection Summary -->
                        <div class="selection-summary">
                          <div class="summary-card">
                            <div class="summary-header">
                              <UsersIcon class="summary-icon" />
                              <h5 class="summary-title">Selected Participants</h5>
                            </div>
                            <div class="summary-content">
                              <div class="summary-count">{{ selectedParticipantCount }}</div>
                              <div class="summary-label">employees selected</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Step 3: Competency Assignment -->
                    <div v-show="currentStep === 2" class="form-step">
                      <div class="step-header">
                        <h4 class="step-title">Competency Assignment</h4>
                        <p class="step-description">Select which competencies will be assessed in this cycle</p>
                      </div>

                      <div class="competency-assignment">
                        <FormField
                          label="Select Competencies"
                          :required="true"
                          :error-message="form.errors.competencies"
                          help-text="Choose the competencies that will be evaluated"
                        >
                          <div class="competency-search">
                            <div class="search-input">
                              <MagnifyingGlassIcon class="search-icon" />
                              <input
                                v-model="competencySearch"
                                type="text"
                                placeholder="Search competencies..."
                                class="search-field"
                              />
                            </div>
                          </div>

                          <div class="competency-categories">
                            <div
                              v-for="category in competencyCategories"
                              :key="category"
                              class="category-section"
                            >
                              <div class="category-header">
                                <h6 class="category-title">{{ category }}</h6>
                                <button
                                  @click="toggleCategorySelection(category)"
                                  type="button"
                                  class="category-toggle"
                                >
                                  {{ isCategorySelected(category) ? 'Deselect All' : 'Select All' }}
                                </button>
                              </div>

                              <div class="competency-grid">
                                <label
                                  v-for="competency in getCompetenciesByCategory(category)"
                                  :key="competency.id"
                                  class="competency-option"
                                >
                                  <input
                                    v-model="selectedCompetencies"
                                    :value="competency.id"
                                    type="checkbox"
                                    class="competency-checkbox"
                                  />
                                  <div class="competency-content">
                                    <div class="competency-name">{{ competency.name }}</div>
                                    <div class="competency-description">{{ competency.description }}</div>
                                    <div v-if="competency.weight" class="competency-weight">
                                      Weight: {{ competency.weight }}
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        </FormField>
                      </div>
                    </div>

                    <!-- Step 4: Notification Settings -->
                    <div v-show="currentStep === 3" class="form-step">
                      <div class="step-header">
                        <h4 class="step-title">Notification Settings</h4>
                        <p class="step-description">Configure how participants will be notified about the assessment cycle</p>
                      </div>

                      <div class="notification-settings">
                        <FormField
                          label="Notification Preferences"
                          help-text="Choose when and how to notify participants"
                        >
                          <div class="notification-options">
                            <label class="notification-option">
                              <input
                                v-model="form.notification_settings.send_start_notification"
                                type="checkbox"
                                class="notification-checkbox"
                              />
                              <div class="notification-content">
                                <div class="notification-title">Send Start Notification</div>
                                <div class="notification-description">Notify participants when the cycle begins</div>
                              </div>
                            </label>

                            <label class="notification-option">
                              <input
                                v-model="form.notification_settings.send_reminders"
                                type="checkbox"
                                class="notification-checkbox"
                              />
                              <div class="notification-content">
                                <div class="notification-title">Send Reminders</div>
                                <div class="notification-description">Send reminder notifications for pending assessments</div>
                              </div>
                            </label>

                            <label class="notification-option">
                              <input
                                v-model="form.notification_settings.send_completion_notification"
                                type="checkbox"
                                class="notification-checkbox"
                              />
                              <div class="notification-content">
                                <div class="notification-title">Send Completion Notification</div>
                                <div class="notification-description">Notify when assessments are completed</div>
                              </div>
                            </label>
                          </div>
                        </FormField>

                        <div v-if="form.notification_settings.send_reminders" class="reminder-settings">
                          <FormField
                            label="Reminder Schedule"
                            help-text="Configure when reminders should be sent"
                          >
                            <div class="reminder-options">
                              <div class="reminder-frequency">
                                <label class="reminder-label">Reminder Frequency</label>
                                <select v-model="form.notification_settings.reminder_frequency" class="reminder-select">
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="custom">Custom</option>
                                </select>
                              </div>

                              <div class="reminder-timing">
                                <label class="reminder-label">Days Before Deadline</label>
                                <BaseInput
                                  v-model="form.notification_settings.reminder_days_before"
                                  type="number"
                                  min="1"
                                  max="30"
                                  placeholder="7"
                                />
                              </div>
                            </div>
                          </FormField>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Form Navigation -->
                  <div class="form-navigation">
                    <div class="nav-buttons">
                      <SecondaryButton
                        v-if="currentStep > 0"
                        @click="previousStep"
                        type="button"
                      >
                        <ChevronLeftIcon class="w-4 h-4 mr-2" />
                        Previous
                      </SecondaryButton>

                      <div class="nav-spacer"></div>

                      <SecondaryButton
                        @click="$emit('close')"
                        type="button"
                      >
                        Cancel
                      </SecondaryButton>

                      <PrimaryButton
                        v-if="currentStep < formSteps.length - 1"
                        @click="nextStep"
                        type="button"
                        :disabled="!canProceedToNextStep"
                      >
                        Next
                        <ChevronRightIcon class="w-4 h-4 ml-2" />
                      </PrimaryButton>

                      <PrimaryButton
                        v-else
                        type="submit"
                        :disabled="form.processing || !isFormValid"
                      >
                        <span v-if="form.processing" class="flex items-center">
                          <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {{ isEditing ? 'Updating...' : 'Creating...' }}
                        </span>
                        <span v-else>
                          {{ isEditing ? 'Update Cycle' : 'Create Cycle' }}
                        </span>
                      </PrimaryButton>
                    </div>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline';

// Import components
import FormField from '@/Components/Forms/FormField.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import BaseTextarea from '@/Components/Base/BaseTextarea.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import SecondaryButton from '@/Components/SecondaryButton.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  cycle: {
    type: Object,
    default: null
  },
  employees: {
    type: Array,
    default: () => []
  },
  competencies: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'save']);

// Local state
const currentStep = ref(0);
const selectionMode = ref('all');
const selectedDepartments = ref([]);
const selectedEmployees = ref([]);
const selectedCompetencies = ref([]);
const employeeSearch = ref('');
const competencySearch = ref('');

// Form setup
const form = useForm({
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  assessment_types: [],
  target_employees: [],
  competencies: [],
  notification_settings: {
    send_start_notification: true,
    send_reminders: true,
    send_completion_notification: true,
    reminder_frequency: 'weekly',
    reminder_days_before: 7
  }
});

// Computed properties
const isEditing = computed(() => !!props.cycle);

const formSteps = computed(() => [
  { id: 'basic', label: 'Basic Info' },
  { id: 'participants', label: 'Participants' },
  { id: 'competencies', label: 'Competencies' },
  { id: 'notifications', label: 'Notifications' }
]);

const assessmentTypes = computed(() => [
  {
    value: 'self',
    label: 'Self Assessment',
    description: 'Employees assess their own competencies'
  },
  {
    value: 'manager',
    label: 'Manager Assessment',
    description: 'Managers assess their direct reports'
  },
  {
    value: 'peer',
    label: 'Peer Assessment',
    description: 'Colleagues assess each other'
  },
  {
    value: '360',
    label: '360° Feedback',
    description: 'Multi-source feedback from all levels'
  }
]);

const departments = computed(() => {
  // Extract unique departments from employees
  const deptMap = new Map();
  props.employees.forEach(employee => {
    if (employee.department) {
      deptMap.set(employee.department.id, {
        id: employee.department.id,
        name: employee.department.name,
        employee_count: (deptMap.get(employee.department.id)?.employee_count || 0) + 1
      });
    }
  });
  return Array.from(deptMap.values());
});

const filteredEmployees = computed(() => {
  if (!employeeSearch.value) return props.employees;
  
  const search = employeeSearch.value.toLowerCase();
  return props.employees.filter(employee =>
    employee.name.toLowerCase().includes(search) ||
    (employee.position && employee.position.toLowerCase().includes(search)) ||
    (employee.department && employee.department.name.toLowerCase().includes(search))
  );
});

const competencyCategories = computed(() => {
  const categories = new Set();
  props.competencies.forEach(competency => {
    if (competency.category) {
      categories.add(competency.category);
    }
  });
  return Array.from(categories).sort();
});

const selectedParticipantCount = computed(() => {
  switch (selectionMode.value) {
    case 'all':
      return props.employees.length;
    case 'department':
      return props.employees.filter(employee =>
        employee.department && selectedDepartments.value.includes(employee.department.id)
      ).length;
    case 'individual':
      return selectedEmployees.value.length;
    default:
      return 0;
  }
});

const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 0: // Basic Info
      return form.name && form.start_date && form.end_date && form.assessment_types.length > 0;
    case 1: // Participants
      return selectedParticipantCount.value > 0;
    case 2: // Competencies
      return selectedCompetencies.value.length > 0;
    case 3: // Notifications
      return true;
    default:
      return false;
  }
});

const isFormValid = computed(() => {
  return form.name &&
         form.start_date &&
         form.end_date &&
         form.assessment_types.length > 0 &&
         selectedParticipantCount.value > 0 &&
         selectedCompetencies.value.length > 0;
});

// Methods
const getStepClasses = (index) => {
  if (index < currentStep.value) return 'completed';
  if (index === currentStep.value) return 'active';
  return 'pending';
};

const nextStep = () => {
  if (currentStep.value < formSteps.value.length - 1) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getCompetenciesByCategory = (category) => {
  const filtered = props.competencies.filter(competency => competency.category === category);
  
  if (competencySearch.value) {
    const search = competencySearch.value.toLowerCase();
    return filtered.filter(competency =>
      competency.name.toLowerCase().includes(search) ||
      (competency.description && competency.description.toLowerCase().includes(search))
    );
  }
  
  return filtered;
};

const isCategorySelected = (category) => {
  const categoryCompetencies = getCompetenciesByCategory(category);
  return categoryCompetencies.length > 0 &&
         categoryCompetencies.every(comp => selectedCompetencies.value.includes(comp.id));
};

const toggleCategorySelection = (category) => {
  const categoryCompetencies = getCompetenciesByCategory(category);
  const isSelected = isCategorySelected(category);
  
  if (isSelected) {
    // Deselect all in category
    categoryCompetencies.forEach(comp => {
      const index = selectedCompetencies.value.indexOf(comp.id);
      if (index > -1) {
        selectedCompetencies.value.splice(index, 1);
      }
    });
  } else {
    // Select all in category
    categoryCompetencies.forEach(comp => {
      if (!selectedCompetencies.value.includes(comp.id)) {
        selectedCompetencies.value.push(comp.id);
      }
    });
  }
};

const handleSubmit = () => {
  // Prepare target employees based on selection mode
  let targetEmployees = [];
  
  switch (selectionMode.value) {
    case 'all':
      targetEmployees = props.employees.map(emp => emp.id);
      break;
    case 'department':
      targetEmployees = props.employees
        .filter(emp => emp.department && selectedDepartments.value.includes(emp.department.id))
        .map(emp => emp.id);
      break;
    case 'individual':
      targetEmployees = selectedEmployees.value;
      break;
  }
  
  // Update form data
  form.target_employees = targetEmployees;
  form.competencies = selectedCompetencies.value;
  
  emit('save', form.data());
};

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    resetForm();
  }
});

watch(() => props.cycle, (newCycle) => {
  if (newCycle) {
    populateForm(newCycle);
  }
});

// Methods
const resetForm = () => {
  currentStep.value = 0;
  selectionMode.value = 'all';
  selectedDepartments.value = [];
  selectedEmployees.value = [];
  selectedCompetencies.value = [];
  employeeSearch.value = '';
  competencySearch.value = '';
  
  if (props.cycle) {
    populateForm(props.cycle);
  } else {
    form.reset();
    form.notification_settings = {
      send_start_notification: true,
      send_reminders: true,
      send_completion_notification: true,
      reminder_frequency: 'weekly',
      reminder_days_before: 7
    };
  }
};

const populateForm = (cycle) => {
  form.name = cycle.name || '';
  form.description = cycle.description || '';
  form.start_date = cycle.start_date || '';
  form.end_date = cycle.end_date || '';
  form.assessment_types = cycle.assessment_types || [];
  form.notification_settings = cycle.notification_settings || {
    send_start_notification: true,
    send_reminders: true,
    send_completion_notification: true,
    reminder_frequency: 'weekly',
    reminder_days_before: 7
  };
  
  // Set selected participants and competencies
  if (cycle.target_employees) {
    selectedEmployees.value = cycle.target_employees;
    selectionMode.value = 'individual';
  }
  
  if (cycle.competencies) {
    selectedCompetencies.value = cycle.competencies;
  }
};

// Lifecycle
onMounted(() => {
  if (props.cycle) {
    populateForm(props.cycle);
  }
});
</script>

<style scoped>
/* Modal Layout */
.modal-header {
  @apply flex items-start justify-between p-6 border-b border-gray-200;
}

.header-content {
  @apply flex-1 min-w-0;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900;
}

.modal-subtitle {
  @apply text-sm text-gray-600 mt-1;
}

.close-button {
  @apply p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200;
}

.modal-content {
  @apply p-6;
}

/* Step Indicator */
.step-indicator {
  @apply mb-8;
}

.steps-list {
  @apply flex items-center justify-between;
}

.step-item {
  @apply flex items-center space-x-2 flex-1;
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

.step-number {
  @apply w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-200;
}

.step-item.pending .step-number {
  @apply border-gray-300 bg-white text-gray-500;
}

.step-item.active .step-number {
  @apply border-blue-500 bg-blue-500 text-white;
}

.step-item.completed .step-number {
  @apply border-green-500 bg-green-500 text-white;
}

.step-label {
  @apply text-sm font-medium text-gray-700;
}

/* Form Steps */
.form-steps {
  @apply min-h-96;
}

.form-step {
  @apply space-y-6;
}

.step-header {
  @apply text-center mb-8;
}

.step-title {
  @apply text-lg font-semibold text-gray-900;
}

.step-description {
  @apply text-gray-600 mt-2;
}

.form-grid {
  @apply space-y-6;
}

/* Assessment Types */
.assessment-types-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.assessment-type-option {
  @apply flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200 cursor-pointer;
}

.assessment-type-checkbox {
  @apply mt-1;
}

.assessment-type-content {
  @apply flex-1;
}

.assessment-type-name {
  @apply font-medium text-gray-900;
}

.assessment-type-description {
  @apply text-sm text-gray-600 mt-1;
}

/* Participant Selection */
.participant-selection {
  @apply space-y-6;
}

.selection-mode {
  @apply space-y-4;
}

.mode-options {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.mode-option {
  @apply flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200 cursor-pointer;
}

.mode-radio {
  @apply mt-1;
}

.mode-content {
  @apply flex-1;
}

.mode-title {
  @apply font-medium text-gray-900;
}

.mode-description {
  @apply text-sm text-gray-600 mt-1;
}

/* Department Selection */
.department-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.department-option {
  @apply flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200 cursor-pointer;
}

.department-checkbox {
  @apply flex-shrink-0;
}

.department-content {
  @apply flex-1;
}

.department-name {
  @apply font-medium text-gray-900;
}

.department-count {
  @apply text-sm text-gray-600;
}

/* Employee Selection */
.individual-selection {
  @apply space-y-4;
}

.employee-search {
  @apply mb-4;
}

.search-input {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400;
}

.search-field {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200;
}

.employee-list {
  @apply max-h-64 overflow-y-auto space-y-2;
}

.employee-option {
  @apply flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200 cursor-pointer;
}

.employee-checkbox {
  @apply flex-shrink-0;
}

.employee-content {
  @apply flex items-center space-x-3 flex-1;
}

.employee-avatar .avatar-circle {
  @apply w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium;
}

.employee-info {
  @apply flex-1;
}

.employee-name {
  @apply font-medium text-gray-900;
}

.employee-details {
  @apply flex items-center space-x-2 text-sm text-gray-600;
}

/* Selection Summary */
.selection-summary {
  @apply mt-6;
}

.summary-card {
  @apply bg-blue-50 border border-blue-200 rounded-lg p-4;
}

.summary-header {
  @apply flex items-center space-x-2 mb-2;
}

.summary-icon {
  @apply w-5 h-5 text-blue-600;
}

.summary-title {
  @apply font-medium text-blue-900;
}

.summary-content {
  @apply text-center;
}

.summary-count {
  @apply text-2xl font-bold text-blue-900;
}

.summary-label {
  @apply text-sm text-blue-700;
}

/* Competency Assignment */
.competency-assignment {
  @apply space-y-6;
}

.competency-search {
  @apply mb-4;
}

.competency-categories {
  @apply space-y-6;
}

.category-section {
  @apply space-y-3;
}

.category-header {
  @apply flex items-center justify-between;
}

.category-title {
  @apply font-medium text-gray-900;
}

.category-toggle {
  @apply text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200;
}

.competency-grid {
  @apply grid grid-cols-1 gap-3;
}

.competency-option {
  @apply flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200 cursor-pointer;
}

.competency-checkbox {
  @apply mt-1 flex-shrink-0;
}

.competency-content {
  @apply flex-1;
}

.competency-name {
  @apply font-medium text-gray-900;
}

.competency-description {
  @apply text-sm text-gray-600 mt-1;
}

.competency-weight {
  @apply text-xs text-gray-500 mt-1;
}

/* Notification Settings */
.notification-settings {
  @apply space-y-6;
}

.notification-options {
  @apply space-y-4;
}

.notification-option {
  @apply flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200 cursor-pointer;
}

.notification-checkbox {
  @apply mt-1;
}

.notification-content {
  @apply flex-1;
}

.notification-title {
  @apply font-medium text-gray-900;
}

.notification-description {
  @apply text-sm text-gray-600 mt-1;
}

.reminder-settings {
  @apply mt-6 p-4 bg-gray-50 rounded-lg;
}

.reminder-options {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.reminder-frequency,
.reminder-timing {
  @apply space-y-2;
}

.reminder-label {
  @apply block text-sm font-medium text-gray-700;
}

.reminder-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200;
}

/* Form Navigation */
.form-navigation {
  @apply mt-8 pt-6 border-t border-gray-200;
}

.nav-buttons {
  @apply flex items-center justify-between;
}

.nav-spacer {
  @apply flex-1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .assessment-types-grid,
  .mode-options,
  .department-grid {
    @apply grid-cols-1;
  }
  
  .reminder-options {
    @apply grid-cols-1;
  }
  
  .nav-buttons {
    @apply flex-col space-y-3;
  }
  
  .nav-spacer {
    @apply hidden;
  }
}
</style>