<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Leave Management"
      subtitle="Manage leave requests and approvals"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Filters and Search -->
      <div class="mb-6 bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label for="search" class="sr-only">Search leaves</label>
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by employee name, leave type..."
                class="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                @input="handleSearch"
              />
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label for="status-filter" class="sr-only">Filter by status</label>
            <select
              id="status-filter"
              v-model="statusFilter"
              class="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              @change="handleFilter"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <!-- Leave Type Filter -->
          <div>
            <label for="type-filter" class="sr-only">Filter by leave type</label>
            <select
              id="type-filter"
              v-model="typeFilter"
              class="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              @change="handleFilter"
            >
              <option value="">All Types</option>
              <option v-for="type in leaveTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <DataTable
          :data="leaves.data"
          :columns="tableColumns"
          :loading="loading"
          :actions="tableActions"
          :row-actions="getRowActions"
          :empty-state="{
            title: 'No leave requests found',
            description: 'There are no leave requests to display. Create your first leave request to get started.',
            icon: 'calendar-days',
            actions: canCreate ? [{
              id: 'create-leave',
              label: 'Request Leave',
              variant: 'primary',
              icon: 'plus',
              handler: () => router.visit(route('leaves.create'))
            }] : []
          }"
          @row-click="handleRowClick"
          @row-action="handleRowAction"
          @header-action="handleHeaderAction"
        >
          <!-- Employee Column -->
          <template #cell-employee="{ row }">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-xs font-semibold text-primary-700">
                    {{ getInitials(row.employee.user.name) }}
                  </span>
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-neutral-900 truncate">
                  {{ row.employee.user.name }}
                </p>
                <p class="text-xs text-neutral-500 truncate">
                  {{ row.employee.user.email }}
                </p>
              </div>
            </div>
          </template>

          <!-- Date Range Column -->
          <template #cell-dates="{ row }">
            <div class="text-sm">
              <div class="flex items-center space-x-1 text-neutral-900">
                <CalendarIcon class="w-4 h-4 text-neutral-400" />
                <span>{{ formatDate(row.from_date) }}</span>
              </div>
              <div class="flex items-center space-x-1 text-neutral-600 mt-1">
                <ArrowRightIcon class="w-3 h-3 text-neutral-400" />
                <span>{{ formatDate(row.to_date) }}</span>
              </div>
              <div class="text-xs text-neutral-500 mt-1">
                {{ getDuration(row.from_date, row.to_date) }}
              </div>
            </div>
          </template>

          <!-- Leave Type Column -->
          <template #cell-leave_type="{ row }">
            <div class="flex items-center space-x-2">
              <div :class="getLeaveTypeIconClasses(row.leave_type.name)">
                <component :is="getLeaveTypeIcon(row.leave_type.name)" class="w-4 h-4" />
              </div>
              <span class="text-sm font-medium text-neutral-900">
                {{ row.leave_type.name }}
              </span>
            </div>
          </template>

          <!-- Status Column -->
          <template #cell-status="{ row }">
            <span :class="getStatusClasses(row.status)">
              <component :is="getStatusIcon(row.status)" class="w-3 h-3 mr-1" />
              {{ getStatusLabel(row.status) }}
            </span>
          </template>
        </DataTable>

        <!-- Pagination -->
        <div v-if="leaves.links && leaves.links.length > 3" class="mt-6">
          <Pagination :links="leaves.links" />
        </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import DataTable from '@/Components/Data/DataTable.vue';
import Pagination from '@/Components/Pagination.vue';
import { useAuth } from '@/composables/useAuth';
import {
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  HeartIcon,
  AcademicCapIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  leaves: Object,
  leaveTypes: {
    type: Array,
    default: () => []
  }
});

const { user, roles, hasRole, hasAnyRole } = useAuth();

// Local state
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');

// Computed properties
const isApprover = computed(() => hasAnyRole(['Admin', 'HR', 'Manager']));
const canCreate = computed(() => hasRole('Employee'));

// PageLayout configuration
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Leave Management', current: true }
]);

const headerActions = computed(() => {
  const actions = [];
  
  if (canCreate.value) {
    actions.push({
      id: 'create-leave',
      label: 'Request Leave',
      icon: 'plus',
      variant: 'primary',
      handler: () => router.visit(route('leaves.create'))
    });
  }
  
  return actions;
});

// Table configuration
const tableColumns = computed(() => {
  const columns = [
    {
      key: 'dates',
      label: 'Duration',
      sortable: true,
      minWidth: '180px'
    },
    {
      key: 'leave_type',
      label: 'Leave Type',
      sortable: true,
      minWidth: '140px'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      minWidth: '120px'
    }
  ];

  // Add employee column for approvers
  if (isApprover.value) {
    columns.unshift({
      key: 'employee',
      label: 'Employee',
      sortable: true,
      minWidth: '200px'
    });
  }

  return columns;
});

const tableActions = computed(() => [
  {
    id: 'export',
    label: 'Export',
    icon: 'document-arrow-down',
    variant: 'secondary'
  }
]);

// Helper functions
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getDuration = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
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
    'Annual Leave': 'w-6 h-6 p-1 bg-blue-100 text-blue-600 rounded',
    'Sick Leave': 'w-6 h-6 p-1 bg-red-100 text-red-600 rounded',
    'Personal Leave': 'w-6 h-6 p-1 bg-green-100 text-green-600 rounded',
    'Study Leave': 'w-6 h-6 p-1 bg-purple-100 text-purple-600 rounded',
    'Emergency Leave': 'w-6 h-6 p-1 bg-orange-100 text-orange-600 rounded'
  };
  
  return classMap[leaveType] || 'w-6 h-6 p-1 bg-neutral-100 text-neutral-600 rounded';
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

const getStatusClasses = (status) => {
  const classMap = {
    pending: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    approved: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    rejected: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
  };
  
  return classMap[status] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800';
};

const getRowActions = (row) => {
  const actions = [
    {
      id: 'view',
      label: 'View Details',
      icon: 'eye',
      handler: () => router.visit(route('leaves.show', row.id))
    }
  ];

  // Add edit action for pending leaves (non-approvers only)
  if (canEdit(row)) {
    actions.push({
      id: 'edit',
      label: 'Edit',
      icon: 'pencil',
      handler: () => router.visit(route('leaves.edit', row.id))
    });
  }

  // Add delete action for pending leaves (non-approvers only)
  if (canDelete(row)) {
    actions.push({
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      variant: 'danger',
      handler: () => destroy(row.id)
    });
  }

  // Add approval actions for approvers
  if (isApprover.value && row.status === 'pending') {
    actions.push(
      {
        id: 'approve',
        label: 'Approve',
        icon: 'check',
        variant: 'success',
        handler: () => approve(row.id)
      },
      {
        id: 'reject',
        label: 'Reject',
        icon: 'x-mark',
        variant: 'danger',
        handler: () => reject(row.id)
      }
    );
  }

  return actions;
};

// Permission checks
const canEdit = (leave) => {
  return !isApprover.value && leave.status === 'pending';
};

const canDelete = (leave) => {
  return canEdit(leave);
};

// Event handlers
const handleSearch = () => {
  // Implement search functionality
  console.log('Search:', searchQuery.value);
};

const handleFilter = () => {
  // Implement filter functionality
  console.log('Filters:', { status: statusFilter.value, type: typeFilter.value });
};

const handleRowClick = (row) => {
  router.visit(route('leaves.show', row.id));
};

const handleRowAction = ({ action, row }) => {
  if (action.handler) {
    action.handler();
  }
};

const handleHeaderAction = (action) => {
  if (action.id === 'export') {
    // Implement export functionality
    console.log('Export leaves');
  }
};

// Actions
const destroy = (id) => {
  if (confirm('Are you sure you want to delete this leave request?')) {
    loading.value = true;
    router.delete(route('leaves.destroy', id), {
      onFinish: () => {
        loading.value = false;
      }
    });
  }
};

const approve = (id) => {
  if (confirm('Are you sure you want to approve this leave request?')) {
    loading.value = true;
    router.put(route('leaves.update', id), { status: 'approved' }, {
      onFinish: () => {
        loading.value = false;
      }
    });
  }
};

const reject = (id) => {
  if (confirm('Are you sure you want to reject this leave request?')) {
    loading.value = true;
    router.put(route('leaves.update', id), { status: 'rejected' }, {
      onFinish: () => {
        loading.value = false;
      }
    });
  }
};
</script>