<template>
  <div class="form-layout-demo space-y-8">
    <div class="demo-header">
      <h1 class="text-3xl font-bold text-neutral-900">FormLayout Framework Demo</h1>
      <p class="text-neutral-600 mt-2">
        Comprehensive demonstration of the FormLayout, FormSection, and FormActions components
        with various configurations and use cases.
      </p>
    </div>

    <!-- Basic Form Layout -->
    <div class="demo-section">
      <h2 class="text-2xl font-semibold text-neutral-900 mb-4">Basic Form Layout</h2>
      <FormLayout
        title="User Profile"
        description="Update your personal information and preferences"
        :actions="basicActions"
        :errors="basicErrors"
        @submit="handleBasicSubmit"
        @action="handleAction"
      >
        <FormSection
          title="Personal Information"
          description="Your basic profile details"
          :use-grid="true"
          :columns="{ xs: 1, md: 2 }"
        >
          <div class="form-field">
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              First Name
            </label>
            <input
              v-model="basicForm.firstName"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-error-500': basicErrors.firstName }"
            />
            <p v-if="basicErrors.firstName" class="text-error-600 text-sm mt-1">
              {{ basicErrors.firstName }}
            </p>
          </div>

          <div class="form-field">
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              Last Name
            </label>
            <input
              v-model="basicForm.lastName"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-error-500': basicErrors.lastName }"
            />
            <p v-if="basicErrors.lastName" class="text-error-600 text-sm mt-1">
              {{ basicErrors.lastName }}
            </p>
          </div>

          <div class="form-field md:col-span-2">
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              Email Address
            </label>
            <input
              v-model="basicForm.email"
              type="email"
              class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-error-500': basicErrors.email }"
            />
            <p v-if="basicErrors.email" class="text-error-600 text-sm mt-1">
              {{ basicErrors.email }}
            </p>
          </div>
        </FormSection>

        <FormSection
          title="Preferences"
          description="Customize your experience"
        >
          <div class="form-field">
            <label class="flex items-center">
              <input
                v-model="basicForm.notifications"
                type="checkbox"
                class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-neutral-700">
                Receive email notifications
              </span>
            </label>
          </div>

          <div class="form-field">
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              Theme Preference
            </label>
            <select
              v-model="basicForm.theme"
              class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </FormSection>
      </FormLayout>
    </div>

    <!-- Multi-step Form -->
    <div class="demo-section">
      <h2 class="text-2xl font-semibold text-neutral-900 mb-4">Multi-step Form</h2>
      <FormLayout
        title="Project Setup"
        description="Create a new project in your workspace"
        :steps="projectSteps"
        :current-step="currentStep"
        :show-progress="true"
        :actions="multiStepActions"
        :is-submitting="isSubmitting"
        @submit="handleMultiStepSubmit"
        @action="handleMultiStepAction"
        @step-change="handleStepChange"
      >
        <!-- Step 1: Basic Info -->
        <FormSection
          v-if="currentStep === 0"
          title="Project Details"
          description="Basic information about your project"
        >
          <div class="form-field">
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              Project Name
            </label>
            <input
              v-model="projectForm.name"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div class="form-field">
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              v-model="projectForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>
        </FormSection>

        <!-- Step 2: Configuration -->
        <FormSection
          v-if="currentStep === 1"
          title="Configuration"
          description="Set up your project configuration"
          :use-grid="true"
          :columns="{ xs: 1, md: 2 }"
        >
          <div class="form-field">
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              Framework
            </label>
            <select
              v-model="projectForm.framework"
              class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="vue">Vue.js</option>
              <option value="react">React</option>
              <option value="angular">Angular</option>
            </select>
          </div>

          <div class="form-field">
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              Build Tool
            </label>
            <select
              v-model="projectForm.buildTool"
              class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="vite">Vite</option>
              <option value="webpack">Webpack</option>
              <option value="rollup">Rollup</option>
            </select>
          </div>
        </FormSection>

        <!-- Step 3: Review -->
        <FormSection
          v-if="currentStep === 2"
          title="Review & Confirm"
          description="Review your project settings before creation"
        >
          <div class="bg-neutral-50 rounded-lg p-4 space-y-3">
            <div>
              <span class="font-medium text-neutral-700">Project Name:</span>
              <span class="ml-2 text-neutral-900">{{ projectForm.name || 'Not specified' }}</span>
            </div>
            <div>
              <span class="font-medium text-neutral-700">Description:</span>
              <span class="ml-2 text-neutral-900">{{ projectForm.description || 'Not specified' }}</span>
            </div>
            <div>
              <span class="font-medium text-neutral-700">Framework:</span>
              <span class="ml-2 text-neutral-900">{{ projectForm.framework }}</span>
            </div>
            <div>
              <span class="font-medium text-neutral-700">Build Tool:</span>
              <span class="ml-2 text-neutral-900">{{ projectForm.buildTool }}</span>
            </div>
          </div>
        </FormSection>
      </FormLayout>
    </div>

    <!-- Form Variants -->
    <div class="demo-section">
      <h2 class="text-2xl font-semibold text-neutral-900 mb-4">Form Variants</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Card Variant -->
        <FormLayout
          variant="card"
          title="Card Form"
          description="Form with card styling"
          :actions="[{ id: 'save', label: 'Save', variant: 'primary', type: 'submit' }]"
          size="sm"
        >
          <FormSection title="Settings" variant="minimal">
            <div class="form-field">
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                Setting Name
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </FormSection>
        </FormLayout>

        <!-- Minimal Variant -->
        <FormLayout
          variant="inline"
          title="Inline Form"
          :actions="[{ id: 'update', label: 'Update', variant: 'primary', type: 'submit' }]"
          size="sm"
        >
          <FormSection variant="minimal">
            <div class="form-field">
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                Quick Setting
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </FormSection>
        </FormLayout>
      </div>
    </div>

    <!-- Form Actions Demo -->
    <div class="demo-section">
      <h2 class="text-2xl font-semibold text-neutral-900 mb-4">Form Actions Variants</h2>
      
      <div class="space-y-6">
        <!-- Different Alignments -->
        <div>
          <h3 class="text-lg font-medium text-neutral-900 mb-3">Action Alignments</h3>
          <div class="space-y-4">
            <FormActions
              :actions="alignmentActions"
              alignment="left"
              help-text="Left aligned actions"
            />
            <FormActions
              :actions="alignmentActions"
              alignment="center"
              help-text="Center aligned actions"
            />
            <FormActions
              :actions="alignmentActions"
              alignment="right"
              help-text="Right aligned actions"
            />
          </div>
        </div>

        <!-- Loading States -->
        <div>
          <h3 class="text-lg font-medium text-neutral-900 mb-3">Loading States</h3>
          <FormActions
            :actions="loadingActions"
            :loading="showLoading"
            loading-label="Processing your request..."
            help-text="Click submit to see loading state"
            @action="handleLoadingAction"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import FormLayout from '@/Components/Forms/FormLayout.vue';
import FormSection from '@/Components/Forms/FormSection.vue';
import FormActions from '@/Components/Forms/FormActions.vue';

// Basic form state
const basicForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  notifications: true,
  theme: 'light'
});

const basicErrors = ref({});

const basicActions = computed(() => [
  { id: 'cancel', label: 'Cancel', variant: 'secondary' },
  { id: 'save', label: 'Save Changes', variant: 'primary', type: 'submit' }
]);

// Multi-step form state
const currentStep = ref(0);
const isSubmitting = ref(false);

const projectForm = ref({
  name: '',
  description: '',
  framework: 'vue',
  buildTool: 'vite'
});

const projectSteps = [
  { id: 'basic', title: 'Basic Info', description: 'Project details' },
  { id: 'config', title: 'Configuration', description: 'Setup options' },
  { id: 'review', title: 'Review', description: 'Confirm settings' }
];

const multiStepActions = computed(() => {
  const actions = [];
  
  if (currentStep.value > 0) {
    actions.push({ id: 'back', label: 'Back', variant: 'secondary' });
  }
  
  actions.push({ id: 'cancel', label: 'Cancel', variant: 'ghost' });
  
  if (currentStep.value < projectSteps.length - 1) {
    actions.push({ id: 'next', label: 'Next', variant: 'primary' });
  } else {
    actions.push({ 
      id: 'create', 
      label: 'Create Project', 
      variant: 'primary', 
      type: 'submit',
      loadingLabel: 'Creating...'
    });
  }
  
  return actions;
});

// Form Actions Demo
const alignmentActions = [
  { id: 'cancel', label: 'Cancel', variant: 'secondary' },
  { id: 'save', label: 'Save', variant: 'primary', type: 'submit' }
];

const showLoading = ref(false);
const loadingActions = [
  { id: 'cancel', label: 'Cancel', variant: 'secondary' },
  { id: 'submit', label: 'Submit', variant: 'primary', type: 'submit' }
];

// Event handlers
const handleBasicSubmit = (event) => {
  console.log('Basic form submitted:', basicForm.value);
  
  // Simulate validation
  const errors = {};
  if (!basicForm.value.firstName) {
    errors.firstName = 'First name is required';
  }
  if (!basicForm.value.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(basicForm.value.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  basicErrors.value = errors;
  
  if (Object.keys(errors).length === 0) {
    alert('Form submitted successfully!');
  }
};

const handleAction = (action) => {
  console.log('Action clicked:', action);
  
  if (action.id === 'cancel') {
    if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
      // Reset form
      basicForm.value = {
        firstName: '',
        lastName: '',
        email: '',
        notifications: true,
        theme: 'light'
      };
      basicErrors.value = {};
    }
  }
};

const handleMultiStepSubmit = (event) => {
  console.log('Multi-step form submitted:', projectForm.value);
  
  isSubmitting.value = true;
  
  // Simulate API call
  setTimeout(() => {
    isSubmitting.value = false;
    alert('Project created successfully!');
    
    // Reset form
    currentStep.value = 0;
    projectForm.value = {
      name: '',
      description: '',
      framework: 'vue',
      buildTool: 'vite'
    };
  }, 2000);
};

const handleMultiStepAction = (action) => {
  console.log('Multi-step action:', action);
  
  switch (action.id) {
    case 'next':
      if (currentStep.value < projectSteps.length - 1) {
        currentStep.value++;
      }
      break;
    case 'back':
      if (currentStep.value > 0) {
        currentStep.value--;
      }
      break;
    case 'cancel':
      if (confirm('Are you sure you want to cancel?')) {
        currentStep.value = 0;
        projectForm.value = {
          name: '',
          description: '',
          framework: 'vue',
          buildTool: 'vite'
        };
      }
      break;
  }
};

const handleStepChange = ({ step, index }) => {
  console.log('Step change:', step, index);
  currentStep.value = index;
};

const handleLoadingAction = (action) => {
  if (action.id === 'submit') {
    showLoading.value = true;
    
    setTimeout(() => {
      showLoading.value = false;
      alert('Action completed!');
    }, 2000);
  }
};
</script>

<style scoped>
.form-layout-demo {
  @apply max-w-4xl mx-auto p-6;
}

.demo-section {
  @apply bg-white border border-neutral-200 rounded-lg p-6;
}

.demo-header {
  @apply text-center mb-8;
}

.form-field {
  @apply space-y-1;
}

/* Custom form field styling for demo */
.form-field input,
.form-field select,
.form-field textarea {
  @apply transition-colors duration-200;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  @apply border-primary-500 ring-primary-500;
}

.form-field input.border-error-500,
.form-field select.border-error-500,
.form-field textarea.border-error-500 {
  @apply border-red-500 ring-red-500;
}

/* Demo specific styling */
.demo-section h2 {
  @apply border-b border-neutral-200 pb-2;
}

.demo-section h3 {
  @apply text-neutral-800;
}
</style>