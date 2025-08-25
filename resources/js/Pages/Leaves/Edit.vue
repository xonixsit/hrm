<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Edit Leave Request"
      subtitle="Update your leave request details"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Admin Notice -->
      <div v-if="isEditingAsAdmin" class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-blue-800">Admin Edit Mode</h3>
            <p class="text-sm text-blue-700 mt-1">
              You are editing {{ props.leave.employee?.user?.name || 'an employee' }}'s leave request. 
              You can modify the details and approve it in one action.
            </p>
          </div>
        </div>
      </div>

      <!-- Employee Information (for admins editing other's leaves) -->
      <div v-if="isEditingAsAdmin && props.leave.employee?.user" class="mb-6 bg-white shadow-sm rounded-lg border border-neutral-200">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Employee Information</h3>
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span class="text-xl font-bold text-white">
                  {{ getInitials(props.leave.employee.user.name) }}
                </span>
              </div>
            </div>
            <div class="flex-1">
              <h4 class="text-lg font-medium text-gray-900">{{ props.leave.employee.user.name }}</h4>
              <p class="text-sm text-gray-600">{{ props.leave.employee.user.email }}</p>
              <div class="flex items-center mt-2 space-x-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Employee ID: {{ props.leave.employee.employee_code || 'N/A' }}
                </span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Department: {{ props.leave.employee.department || 'N/A' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="bg-white shadow-sm rounded-lg border border-neutral-200">
        <FormLayout
          title="Update Leave Request"
          description="Modify the details of your leave request"
          :errors="form.errors"
          :is-submitting="form.processing"
          :actions="formActions"
          variant="card"
          @submit="handleSubmit"
          @action="handleFormAction"
        >
          <div class="space-y-6">
            <!-- Leave Type Selection -->
            <FormSection title="Leave Type" description="Select the type of leave you want to request">
              <FormField
                label="Leave Type"
                :error="form.errors.leave_type_id"
                required
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="type in leaveTypes"
                    :key="type.id"
                    :class="getLeaveTypeCardClasses(type)"
                    @click="selectLeaveType(type)"
                  >
                    <div class="flex items-center space-x-3">
                      <div :class="getLeaveTypeIconClasses(type.name)">
                        <component :is="getLeaveTypeIcon(type.name)" class="w-5 h-5" />
                      </div>
                      <div class="flex-1">
                        <h3 class="text-sm font-medium text-neutral-900">{{ type.name }}</h3>
                        <p class="text-xs text-neutral-500 mt-1">{{ getLeaveTypeDescription(type.name) }}</p>
                      </div>
                      <div v-if="form.leave_type_id === type.id" class="flex-shrink-0">
                        <CheckCircleIcon class="w-5 h-5 text-primary-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </FormField>
            </FormSection>

            <!-- Date Selection -->
            <FormSection title="Leave Dates" description="Choose your leave start and end dates">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Start Date"
                  :error="form.errors.from_date"
                  required
                >
                  <input
                    v-model="form.from_date"
                    type="date"
                    :min="minDate"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    @change="validateDates"
                  />
                </FormField>

                <FormField
                  label="End Date"
                  :error="form.errors.to_date"
                  required
                >
                  <input
                    v-model="form.to_date"
                    type="date"
                    :min="form.from_date || minDate"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    @change="validateDates"
                  />
                </FormField>
              </div>

              <!-- Leave Calendar Visualization -->
              <div v-if="form.from_date && form.to_date" class="mt-4">
                <HorizontalCalendar
                  :start-date="form.from_date"
                  :end-date="form.to_date"
                  :leave-type="getSelectedLeaveTypeName()"
                  :status="props.leave.status || 'pending'"
                />
              </div>
            </FormSection>

            <!-- Reason and Details -->
            <FormSection title="Leave Details" description="Provide a reason for your leave request">
              <FormField
                label="Reason for Leave"
                :error="form.errors.reason"
                required
              >
                <textarea
                  v-model="form.reason"
                  rows="4"
                  placeholder="Please provide a detailed reason for your leave request..."
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                ></textarea>
                <p class="text-xs text-neutral-500 mt-1">
                  {{ form.reason?.length || 0 }}/500 characters
                </p>
              </FormField>

              <!-- Additional Options -->
              <div class="space-y-4 mt-4">
                <div class="flex items-center">
                  <input
                    id="emergency"
                    v-model="form.is_emergency"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <label for="emergency" class="ml-2 block text-sm text-neutral-900">
                    This is an emergency leave request
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    id="half-day"
                    v-model="form.is_half_day"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <label for="half-day" class="ml-2 block text-sm text-neutral-900">
                    Half day leave
                  </label>
                </div>
              </div>
            </FormSection>
            </div>
        </FormLayout>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, useForm, router } from '@inertiajs/vue3';
import { computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { useAuth } from '@/composables/useAuth';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import HorizontalCalendar from '@/Components/Calendar/HorizontalCalendar.vue';
import FormLayout from '@/Components/Forms/FormLayout.vue';
import FormSection from '@/Components/Forms/FormSection.vue';
import FormField from '@/Components/Forms/FormField.vue';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  HeartIcon,
  AcademicCapIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  leave: {
    type: Object,
    required: true
  },
  leaveTypes: {
    type: Array,
    default: () => []
  }
});

const { hasAnyRole } = useAuth();

// Helper functions (defined before form to avoid hoisting issues)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  // Handle different date formats that might come from the backend
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  // Format as YYYY-MM-DD for HTML date input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Form state
const form = useForm({
  leave_type_id: props.leave.leave_type_id,
  from_date: formatDateForInput(props.leave.from_date),
  to_date: formatDateForInput(props.leave.to_date),
  reason: props.leave.reason,
  is_emergency: props.leave.is_emergency || false,
  is_half_day: props.leave.is_half_day || false
});

// Computed properties for permissions
const canApprove = computed(() => hasAnyRole(['Admin', 'HR', 'Manager']));
const isEditingAsAdmin = computed(() => hasAnyRole(['Admin', 'HR']) && props.leave.employee?.user);

// PageLayout configuration
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Leave Management', href: route('leaves.index') },
  { label: `Request #${props.leave.id}`, href: route('leaves.show', props.leave.id) },
  { label: 'Edit', current: true }
]);

const headerActions = computed(() => [
  {
    id: 'back-to-details',
    label: 'Back to Details',
    icon: 'arrow-left',
    variant: 'secondary',
    handler: () => router.visit(route('leaves.show', props.leave.id))
  }
]);

// Computed properties
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const formActions = computed(() => {
  const actions = [
    {
      id: 'cancel',
      label: 'Cancel',
      variant: 'secondary',
      type: 'button'
    },
    {
      id: 'submit',
      label: 'Update Request',
      variant: 'primary',
      type: 'submit',
      loadingLabel: 'Updating...'
    }
  ];

  // Add "Update & Approve" option for admins/HR on pending leaves
  if (canApprove.value && props.leave.status === 'pending') {
    actions.push({
      id: 'update-and-approve',
      label: 'Update & Approve',
      variant: 'success',
      type: 'button',
      loadingLabel: 'Updating & Approving...'
    });
  }

  return actions;
});

// Helper functions

const getLeaveTypeIcon = (leaveType) => {
  const iconMap = {
    'Annual Leave': CalendarIcon,
    'Sick Leave': HeartIcon,
    'Personal Leave': UserIcon,
    'Study Leave': AcademicCapIcon,
    'Emergency Leave': ExclamationTriangleIcon
  };
  
  return iconMap[leaveType] || CalendarIcon;
};

const getLeaveTypeIconClasses = (leaveType) => {
  const classMap = {
    'Annual Leave': 'w-8 h-8 p-1.5 bg-blue-100 text-blue-600 rounded-lg',
    'Sick Leave': 'w-8 h-8 p-1.5 bg-red-100 text-red-600 rounded-lg',
    'Personal Leave': 'w-8 h-8 p-1.5 bg-green-100 text-green-600 rounded-lg',
    'Study Leave': 'w-8 h-8 p-1.5 bg-purple-100 text-purple-600 rounded-lg',
    'Emergency Leave': 'w-8 h-8 p-1.5 bg-orange-100 text-orange-600 rounded-lg'
  };
  
  return classMap[leaveType] || 'w-8 h-8 p-1.5 bg-neutral-100 text-neutral-600 rounded-lg';
};

const getLeaveTypeDescription = (leaveType) => {
  const descriptionMap = {
    'Annual Leave': 'Planned vacation or personal time off',
    'Sick Leave': 'Medical leave for illness or health issues',
    'Personal Leave': 'Personal matters and family obligations',
    'Study Leave': 'Educational purposes and training',
    'Emergency Leave': 'Urgent and unexpected situations'
  };
  
  return descriptionMap[leaveType] || 'Standard leave request';
};

const getLeaveTypeCardClasses = (type) => {
  const baseClasses = 'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md';
  const selectedClasses = form.leave_type_id === type.id 
    ? 'border-primary-500 bg-primary-50' 
    : 'border-neutral-200 bg-white hover:border-neutral-300';
  
  return `${baseClasses} ${selectedClasses}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // Parse date as local date to avoid timezone issues
  const parts = dateString.split('-');
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateDuration = () => {
  if (!form.from_date || !form.to_date) return '';
  
  // Parse dates as local dates to avoid timezone issues
  const startParts = form.from_date.split('-');
  const endParts = form.to_date.split('-');
  
  const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
  const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
  
  // Calculate difference in days
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  if (form.is_half_day && diffDays === 1) {
    return '0.5 days';
  }
  
  return diffDays === 1 ? '1 day' : `${diffDays} days`;
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') {
    return '--';
  }
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getSelectedLeaveTypeName = () => {
  if (!form.leave_type_id) return 'Leave';
  const selectedType = props.leaveTypes.find(type => type.id === form.leave_type_id);
  return selectedType?.name || 'Leave';
};

// Event handlers
const selectLeaveType = (type) => {
  form.leave_type_id = type.id;
};

const validateDates = () => {
  if (form.from_date && form.to_date) {
    const start = new Date(form.from_date);
    const end = new Date(form.to_date);
    
    if (end < start) {
      form.to_date = form.from_date;
    }
  }
};

const handleFormAction = (action) => {
  switch (action.id) {
    case 'cancel':
      window.history.back();
      break;
    case 'submit':
      handleSubmit();
      break;
    case 'update-and-approve':
      handleUpdateAndApprove();
      break;
  }
};

const handleSubmit = () => {
  form.put(route('leaves.update', props.leave.id), {
    onSuccess: () => {
      // Handle success - redirect will be handled by Inertia
    }
  });
};

const handleUpdateAndApprove = () => {
  if (confirm('Are you sure you want to update and approve this leave request?')) {
    // Add approval comments to the form data
    const formData = {
      ...form.data(),
      comments: 'Updated and approved by admin'
    };
    
    // Use the combined update-and-approve route
    router.put(route('leaves.update-and-approve', props.leave.id), formData, {
      onSuccess: () => {
        // Success message and redirect will be handled by the backend
      },
      onError: (errors) => {
        // Handle validation errors
        Object.keys(errors).forEach(key => {
          form.setError(key, errors[key]);
        });
      }
    });
  }
};
</script>