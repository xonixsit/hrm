<template>
  <AuthenticatedLayout>
    <DetailPage
      :title="pageTitle"
      :subtitle="pageSubtitle"
      :icon="CalendarDaysIcon"
      :status="leaveStatus"
      :breadcrumbs="breadcrumbs"
      :actions="pageActions"
      :loading="loading"
      back-url="/leaves"
    >
      <!-- Primary Content -->
      <template #primary>
        <!-- Debug Info (only in development) -->
        <div v-if="process.env.NODE_ENV === 'development'" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 class="font-bold text-yellow-800">Debug Info:</h3>
          <p><strong>Leave Object:</strong> {{ JSON.stringify(leave, null, 2) }}</p>
          <p><strong>Leave ID:</strong> {{ leave?.id || 'undefined' }}</p>
          <p><strong>Leave Type:</strong> {{ leave?.leave_type?.name || 'undefined' }}</p>
          <p><strong>Has Valid Data:</strong> {{ hasValidLeaveData }}</p>
        </div>
        
        <div class="space-y-6">
          <!-- Leave Details Card -->
          <InfoCard
            title="Leave Details"
            :icon="CalendarIcon"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Leave Type -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-neutral-600">Leave Type</label>
                <div class="flex items-center space-x-3">
                  <div :class="getLeaveTypeIconClasses(leave?.leave_type?.name || 'Unknown')">
                    <component :is="getLeaveTypeIcon(leave?.leave_type?.name || 'Unknown')" class="w-5 h-5" />
                  </div>
                  <span class="text-base font-medium text-neutral-900">
                    {{ leave?.leave_type?.name || 'Unknown Leave Type' }}
                  </span>
                </div>
              </div>

              <!-- Duration -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-neutral-600">Duration</label>
                <div class="space-y-1">
                  <p class="text-base font-medium text-neutral-900">
                    {{ calculateDuration() }}
                  </p>
                  <p class="text-sm text-neutral-600">
                    {{ formatDateRange(leave?.from_date, leave?.to_date) }}
                  </p>
                </div>
              </div>

              <!-- Employee (for approvers) -->
              <div v-if="isApprover && leave.employee?.user" class="space-y-2">
                <label class="text-sm font-medium text-neutral-600">Employee</label>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-xs font-semibold text-primary-700">
                      {{ getInitials(leave.employee?.user?.name || 'N/A') }}
                    </span>
                  </div>
                  <div>
                    <p class="text-base font-medium text-neutral-900">
                      {{ leave.employee?.user?.name || 'N/A' }}
                    </p>
                    <p class="text-sm text-neutral-600">
                      {{ leave.employee?.user?.email || 'N/A' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Status -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-neutral-600">Status</label>
                <div class="flex items-center space-x-2">
                  <span :class="getStatusClasses(leave?.status || 'pending')">
                    <component :is="getStatusIcon(leave?.status || 'pending')" class="w-3 h-3 mr-1" />
                    {{ getStatusLabel(leave?.status || 'pending') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Reason -->
            <div class="mt-6 pt-6 border-t border-neutral-200">
              <label class="text-sm font-medium text-neutral-600">Reason for Leave</label>
              <p class="mt-2 text-base text-neutral-900 leading-relaxed">
                {{ leave?.reason || 'No reason provided' }}
              </p>
            </div>

            <!-- Additional Options -->
            <div v-if="leave?.is_emergency || leave?.is_half_day" class="mt-6 pt-6 border-t border-neutral-200">
              <label class="text-sm font-medium text-neutral-600">Additional Information</label>
              <div class="mt-2 space-y-2">
                <div v-if="leave?.is_emergency" class="flex items-center space-x-2">
                  <ExclamationTriangleIcon class="w-4 h-4 text-orange-600" />
                  <span class="text-sm text-orange-700 font-medium">Emergency leave request</span>
                </div>
                <div v-if="leave?.is_half_day" class="flex items-center space-x-2">
                  <ClockIcon class="w-4 h-4 text-blue-600" />
                  <span class="text-sm text-blue-700 font-medium">Half day leave</span>
                </div>
              </div>
            </div>
          </InfoCard>

          <!-- Approval Workflow (for approvers) -->
          <div v-if="isApprover && leave?.status === 'pending'" class="bg-white rounded-lg border border-neutral-200 p-6">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0 w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <ClockIcon class="w-6 h-6 text-warning-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-neutral-900">Approval Required</h3>
                <p class="text-sm text-neutral-600 mt-1">
                  This leave request is pending your approval. Please review the details above and make a decision.
                </p>
                
                <!-- Approval Actions -->
                <div class="mt-4 flex items-center space-x-3">
                  <button
                    @click="showApprovalModal = true"
                    :disabled="loading"
                    class="inline-flex items-center px-4 py-2 bg-success-600 text-white text-sm font-medium rounded-lg hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
                  >
                    <CheckIcon class="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    @click="showRejectionModal = true"
                    :disabled="loading"
                    class="inline-flex items-center px-4 py-2 bg-error-600 text-white text-sm font-medium rounded-lg hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
                  >
                    <XMarkIcon class="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline/History -->
          <InfoCard
            title="Request Timeline"
            :icon="ClockIcon"
          >
            <div class="space-y-4">
              <!-- Created -->
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-neutral-900">Request Created</p>
                  <p class="text-xs text-neutral-600">
                    {{ formatDateTime(leave?.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Status Updates -->
              <div v-if="leave?.status !== 'pending'" class="flex items-start space-x-3">
                <div :class="getTimelineStatusClasses(leave?.status)"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-neutral-900">
                    Request {{ getStatusLabel(leave?.status) }}
                  </p>
                  <p class="text-xs text-neutral-600">
                    {{ formatDateTime(leave?.updated_at) }}
                  </p>
                </div>
              </div>
            </div>
          </InfoCard>
        </div>
      </template>

      <!-- Secondary Content (Sidebar) -->
      <template #secondary>
        <div class="space-y-6">
          <!-- Quick Actions -->
          <InfoCard
            title="Quick Actions"
            :icon="BoltIcon"
          >
            <div class="space-y-3">
              <Link
                v-if="canEdit && leave?.id"
                :href="route('leaves.edit', leave.id)"
                class="w-full inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <PencilIcon class="w-4 h-4 mr-2" />
                Edit Request
              </Link>
              
              <button
                v-if="canDelete"
                @click="showDeleteModal = true"
                class="w-full inline-flex items-center justify-center px-4 py-2 bg-error-600 text-white text-sm font-medium rounded-lg hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <TrashIcon class="w-4 h-4 mr-2" />
                Delete Request
              </button>

              <Link
                :href="route('leaves.index')"
                class="w-full inline-flex items-center justify-center px-4 py-2 bg-white text-neutral-700 text-sm font-medium rounded-lg border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <ArrowLeftIcon class="w-4 h-4 mr-2" />
                Back to Leaves
              </Link>
            </div>
          </InfoCard>

          <!-- Leave Balance (placeholder) -->
          <InfoCard
            title="Leave Balance"
            :icon="ChartBarIcon"
          >
            <div class="text-center py-4">
              <ChartBarIcon class="mx-auto w-8 h-8 text-neutral-400" />
              <p class="text-sm text-neutral-600 mt-2">Leave balance tracking</p>
              <p class="text-xs text-neutral-500">Coming soon</p>
            </div>
          </InfoCard>
        </div>
      </template>
    </DetailPage>

    <!-- Approval Modal -->
    <div v-if="showApprovalModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-neutral-500 bg-opacity-75" @click="showApprovalModal = false"></div>
        
        <div class="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-success-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <CheckIcon class="w-6 h-6 text-success-600" />
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg font-medium leading-6 text-neutral-900">
                Approve Leave Request
              </h3>
              <div class="mt-2">
                <p class="text-sm text-neutral-500">
                  Are you sure you want to approve this leave request? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              @click="approve"
              :disabled="loading"
              class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-success-600 border border-transparent rounded-md shadow-sm hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ loading ? 'Approving...' : 'Approve' }}
            </button>
            <button
              @click="showApprovalModal = false"
              :disabled="loading"
              class="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div v-if="showRejectionModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-neutral-500 bg-opacity-75" @click="showRejectionModal = false"></div>
        
        <div class="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-error-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <XMarkIcon class="w-6 h-6 text-error-600" />
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg font-medium leading-6 text-neutral-900">
                Reject Leave Request
              </h3>
              <div class="mt-2">
                <p class="text-sm text-neutral-500">
                  Are you sure you want to reject this leave request? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              @click="reject"
              :disabled="loading"
              class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-error-600 border border-transparent rounded-md shadow-sm hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ loading ? 'Rejecting...' : 'Reject' }}
            </button>
            <button
              @click="showRejectionModal = false"
              :disabled="loading"
              class="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-neutral-500 bg-opacity-75" @click="showDeleteModal = false"></div>
        
        <div class="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-error-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <TrashIcon class="w-6 h-6 text-error-600" />
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg font-medium leading-6 text-neutral-900">
                Delete Leave Request
              </h3>
              <div class="mt-2">
                <p class="text-sm text-neutral-500">
                  Are you sure you want to delete this leave request? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              @click="destroy"
              :disabled="loading"
              class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-error-600 border border-transparent rounded-md shadow-sm hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ loading ? 'Deleting...' : 'Delete' }}
            </button>
            <button
              @click="showDeleteModal = false"
              :disabled="loading"
              class="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth';
import { computed, ref } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import DetailPage from '@/Components/Layout/DetailPage.vue';
import InfoCard from '@/Components/Layout/InfoCard.vue';
import {
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  AcademicCapIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  leave: {
    type: Object,
    required: true
  },
});

const { hasAnyRole } = useAuth();

// Debug: Log the leave data to see what we're receiving
if (process.env.NODE_ENV === 'development') {
  console.log('Leave data received:', props.leave);
  console.log('Leave keys:', props.leave ? Object.keys(props.leave) : 'No leave data');
  console.log('Leave ID:', props.leave?.id);
  console.log('Leave Type (leave_type):', props.leave?.leave_type);
  console.log('Leave Type (leaveType):', props.leave?.leaveType);
  console.log('Leave Status:', props.leave?.status);
  console.log('Leave Dates:', { from: props.leave?.from_date, to: props.leave?.to_date });
  console.log('Employee data:', props.leave?.employee);
}

// Check if we have valid leave data
const hasValidLeaveData = computed(() => {
  return props.leave && 
         typeof props.leave === 'object' && 
         Object.keys(props.leave).length > 0 &&
         props.leave.id;
});

// If no valid data, show error message
if (process.env.NODE_ENV === 'development' && !hasValidLeaveData.value) {
  console.error('❌ LEAVE DATA ISSUE: No valid leave data received');
  console.log('Current URL:', window.location.href);
  console.log('Expected: Leave object with id, leaveType, dates, etc.');
  console.log('Received:', props.leave);
}

// Local state
const loading = ref(false);
const showApprovalModal = ref(false);
const showRejectionModal = ref(false);
const showDeleteModal = ref(false);

// Computed properties
const isApprover = computed(() => hasAnyRole(['Admin', 'HR', 'Manager']));
const canEdit = computed(() => props.leave?.status === 'pending' && !isApprover.value);
const canDelete = computed(() => canEdit.value);

const pageTitle = computed(() => {
  return `Leave Request #${props.leave?.id || 'N/A'}`;
});

const pageSubtitle = computed(() => {
  if (isApprover.value && props.leave?.employee?.user?.name) {
    return `Request by ${props.leave.employee.user.name}`;
  }
  return `${props.leave?.leave_type?.name || 'Leave'} - ${calculateDuration()}`;
});

const leaveStatus = computed(() => ({
  label: getStatusLabel(props.leave?.status),
  variant: getStatusVariant(props.leave?.status)
}));

const breadcrumbs = computed(() => [
  { label: 'Leaves', href: route('leaves.index') },
  { label: `Request #${props.leave?.id || 'N/A'}`, current: true }
]);

const pageActions = computed(() => {
  const actions = [];
  
  if (canEdit.value && props.leave?.id) {
    actions.push({
      id: 'edit',
      label: 'Edit',
      icon: 'pencil',
      variant: 'primary',
      handler: () => router.visit(route('leaves.edit', props.leave.id))
    });
  }
  
  if (canDelete.value && props.leave?.id) {
    actions.push({
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      variant: 'danger',
      handler: () => showDeleteModal.value = true
    });
  }
  
  return actions;
});

// Helper functions
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

const formatDateRange = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  const startFormatted = start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  
  const endFormatted = end.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${startFormatted} - ${endFormatted}`;
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const calculateDuration = () => {
  if (!props.leave?.from_date || !props.leave?.to_date) {
    return 'N/A';
  }
  
  const start = new Date(props.leave.from_date);
  const end = new Date(props.leave.to_date);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  if (props.leave.is_half_day && diffDays === 1) {
    return '0.5 days';
  }
  
  return diffDays === 1 ? '1 day' : `${diffDays} days`;
};

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

const getStatusIcon = (status) => {
  const iconMap = {
    pending: ClockIcon,
    approved: CheckIcon,
    rejected: XMarkIcon
  };
  
  return iconMap[status] || ClockIcon;
};

const getStatusLabel = (status) => {
  const labelMap = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
  };
  
  return labelMap[status] || status;
};

const getStatusVariant = (status) => {
  const variantMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error'
  };
  
  return variantMap[status] || 'neutral';
};

const getStatusClasses = (status) => {
  const classMap = {
    pending: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    approved: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    rejected: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
  };
  
  return classMap[status] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800';
};

const getTimelineStatusClasses = (status) => {
  const classMap = {
    approved: 'flex-shrink-0 w-2 h-2 bg-success-600 rounded-full mt-2',
    rejected: 'flex-shrink-0 w-2 h-2 bg-error-600 rounded-full mt-2'
  };
  
  return classMap[status] || 'flex-shrink-0 w-2 h-2 bg-neutral-400 rounded-full mt-2';
};

// Actions
const approve = () => {
  if (!props.leave?.id) return;
  
  loading.value = true;
  showApprovalModal.value = false;
  
  router.put(route('leaves.update', props.leave.id), { status: 'approved' }, {
    onFinish: () => {
      loading.value = false;
    }
  });
};

const reject = () => {
  if (!props.leave?.id) return;
  
  loading.value = true;
  showRejectionModal.value = false;
  
  router.put(route('leaves.update', props.leave.id), { status: 'rejected' }, {
    onFinish: () => {
      loading.value = false;
    }
  });
};

const destroy = () => {
  if (!props.leave?.id) return;
  
  loading.value = true;
  showDeleteModal.value = false;
  
  router.delete(route('leaves.destroy', props.leave.id), {
    onFinish: () => {
      loading.value = false;
    }
  });
};
</script>