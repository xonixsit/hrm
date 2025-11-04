<template>
  <AuthenticatedLayout>
    <PageLayout
      :title="`Leave Request #${leave?.id}`"
      :subtitle="`${leave?.leave_type?.name} • ${formatDateRange(leave?.from_date, leave?.to_date)}`"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <ContentCard>
            <!-- Status Badge -->
            <div class="flex justify-end mb-6">
              <span :class="getStatusClasses(leave?.status)" class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full">
                {{ getStatusLabel(leave?.status) }}
              </span>
            </div>

            <!-- Leave Calendar Visualization -->
            <div class="mb-8">
              <HorizontalCalendar
                v-if="leave?.from_date && leave?.to_date"
                :start-date="leave.from_date"
                :end-date="leave.to_date"
                :leave-type="leave?.leave_type?.name || 'Leave'"
                :status="leave?.status || 'pending'"
              />
            </div>

            <!-- Employee Information (for approvers) -->
            <div v-if="isApprover && leave?.employee?.user" class="border-t border-gray-200 pt-6 mb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Employee Information</h3>
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div class="h-16 w-16 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center">
                    <span class="text-xl font-bold text-white">
                      {{ getInitials(leave.employee.user.name) }}
                    </span>
                  </div>
                </div>
                <div class="flex-1">
                  <h4 class="text-lg font-medium text-gray-900">{{ leave.employee.user.name }}</h4>
                  <p class="text-sm text-gray-600">{{ leave.employee.user.email }}</p>
                  <div class="flex items-center mt-2 space-x-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Employee ID: {{ leave.employee.employee_code || 'N/A' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Leave Details -->
            <div class="border-t border-gray-200 pt-6 mb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Leave Details</h3>
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Leave Type</dt>
                  <dd class="flex items-center">
                    <div class="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                    <span class="text-sm font-medium text-gray-900">{{ leave?.leave_type?.name || 'N/A' }}</span>
                  </dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Duration</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ calculateDuration() }}</dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Start Date</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ formatDate(leave?.from_date) }}</dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">End Date</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ formatDate(leave?.to_date) }}</dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Submitted On</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ formatDateTime(leave?.created_at) }}</dd>
                </div>

                <div v-if="leave?.approved_at">
                  <dt class="text-sm font-medium text-gray-500 mb-1">
                    {{ leave.status === 'approved' ? 'Approved On' : 'Processed On' }}
                  </dt>
                  <dd class="text-sm font-medium text-gray-900">{{ formatDateTime(leave.approved_at) }}</dd>
                </div>
              </dl>
            </div>

            <!-- Reason Section -->
            <div class="border-t border-gray-200 pt-6 mb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Reason for Leave</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-900 leading-relaxed">
                  {{ leave?.reason || 'No reason provided' }}
                </p>
              </div>
            </div>

            <!-- Approval Comments (if any) -->
            <div v-if="leave?.approval_comments" class="border-t border-gray-200 pt-6 mb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ leave.status === 'approved' ? 'Approval Comments' : 'Rejection Comments' }}
              </h3>
              <div :class="[
                'rounded-lg p-4',
                leave.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
              ]">
                <p :class="[
                  'text-sm leading-relaxed',
                  leave.status === 'approved' ? 'text-green-900' : 'text-red-900'
                ]">
                  {{ leave.approval_comments }}
                </p>
              </div>
            </div>

            <!-- Approval Actions for Managers/Admins -->
            <div v-if="isApprover && leave?.status === 'pending'" class="border-t border-gray-200 pt-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Review & Approval</h3>
              <div class="space-y-4">
                <div>
                  <label for="approval-comments" class="block text-sm font-medium text-gray-700 mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    id="approval-comments"
                    v-model="approvalComments"
                    rows="3"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    placeholder="Add any comments about this leave request..."
                  ></textarea>
                </div>
                <div class="flex space-x-3">
                  <button
                    @click="approve"
                    :disabled="loading"
                    class="inline-flex items-center px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ loading ? 'Approving...' : 'Approve Request' }}
                  </button>
                  <button
                    @click="reject"
                    :disabled="loading"
                    class="inline-flex items-center px-6 py-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {{ loading ? 'Rejecting...' : 'Reject Request' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="border-t border-gray-200 pt-6">
              <Link 
                :href="route('leaves.index')" 
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Leaves
              </Link>
          </div>
      </ContentCard>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import HorizontalCalendar from '@/Components/Calendar/HorizontalCalendar.vue';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
  leave: {
    type: Object,
    required: true
  },
  leaveBalance: {
    type: Number,
    default: null
  }
});

const { hasAnyRole, hasRole } = useAuth();

// Local state
const loading = ref(false);
const approvalComments = ref('');

// Computed properties
const isApprover = computed(() => hasAnyRole(['Admin', 'HR', 'Manager']));
const canEdit = computed(() => {
  // Admins and HR can edit any leave
  if (hasAnyRole(['Admin', 'HR'])) {
    return true;
  }
  
  // Employees can only edit their own pending leaves
  return props.leave?.status === 'pending' && !isApprover.value;
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Leave Management', href: route('leaves.index') },
  { label: `Request #${props.leave?.id}`, current: true }
]);

const headerActions = computed(() => {
  const actions = [];
  
  if (canEdit.value) {
    actions.push({
      id: 'edit',
      label: 'Edit Request',
      icon: 'pencil',
      variant: 'secondary',
      href: route('leaves.edit', props.leave?.id)
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateRange = (fromDate, toDate) => {
  if (!fromDate || !toDate) return 'N/A';
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  const startFormatted = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  const endFormatted = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${startFormatted} - ${endFormatted}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
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
  
  // Parse dates as local dates to avoid timezone issues
  const fromDate = props.leave.from_date;
  const toDate = props.leave.to_date;
  
  // Handle both date string formats (YYYY-MM-DD and full datetime)
  const startParts = fromDate.split(/[-T\s]/);
  const endParts = toDate.split(/[-T\s]/);
  
  const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
  const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
  
  // Calculate difference in days
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  if (diffDays === 1) return '1 day';
  if (diffDays <= 7) return `${diffDays} days`;
  
  const weeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;
  
  if (remainingDays === 0) {
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  } else {
    return `${weeks} week${weeks > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  }
};

const getStatusLabel = (status) => {
  const labelMap = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled'
  };
  
  return labelMap[status] || status;
};

const getStatusClasses = (status) => {
  const classMap = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  return classMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Actions
const approve = () => {
  if (!props.leave?.id) return;
  
  if (confirm('Are you sure you want to approve this leave request?')) {
    loading.value = true;
    router.post(route('leaves.approve', props.leave.id), {
      comments: approvalComments.value
    }, {
      onFinish: () => {
        loading.value = false;
      }
    });
  }
};

const reject = () => {
  if (!props.leave?.id) return;
  
  if (confirm('Are you sure you want to reject this leave request?')) {
    loading.value = true;
    router.post(route('leaves.reject', props.leave.id), {
      comments: approvalComments.value || 'Request rejected'
    }, {
      onFinish: () => {
        loading.value = false;
      }
    });
  }
};
</script>