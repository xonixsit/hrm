<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Projects"
      subtitle="Manage and track all your projects"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
      @action="handleHeaderAction"
    >
      <ContentSection>
        <ContentCard>
          <DataTable
            :data="projects.data"
            :columns="tableColumns"
            :loading="loading"
            :total-items="projects.total"
            :current-page="projects.current_page"
            :total-pages="projects.last_page"
            :page-size="projects.per_page"
            :server-side-pagination="true"
            :search-config="searchConfig"
            :filter-config="filterConfig"
            :row-actions="getRowActions"
            :empty-state="emptyState"
            @search="handleSearch"
            @filter="handleFilter"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
            @row-action="handleRowAction"
            @row-click="handleRowClick"
          >
        <!-- Custom cell for project name with icon -->
        <template #cell-name="{ row }">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon name="folder-open" class="w-4 h-4 text-primary-600" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-medium text-neutral-900 truncate">{{ row.name }}</div>
              <div v-if="row.client" class="text-sm text-neutral-500 truncate">{{ row.client }}</div>
            </div>
          </div>
        </template>

        <!-- Custom cell for status -->
        <template #cell-status="{ row }">
          <span :class="getStatusClasses(row.status)">
            <Icon :name="getStatusIcon(row.status)" class="w-3 h-3 mr-1" />
            {{ getStatusLabel(row.status) }}
          </span>
        </template>

        <!-- Custom cell for progress -->
        <template #cell-progress="{ row }">
          <div class="flex items-center space-x-2">
            <div class="flex-1 bg-neutral-200 rounded-full h-2">
              <div 
                class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${row.progress || 0}%` }"
              ></div>
            </div>
            <span class="text-sm text-neutral-600 font-medium">{{ row.progress || 0 }}%</span>
          </div>
        </template>

        <!-- Custom cell for team members -->
        <template #cell-team="{ row }">
          <div class="flex -space-x-2">
            <div
              v-for="(member, index) in (row.team_members || []).slice(0, 3)"
              :key="member.id"
              class="relative"
            >
              <img
                v-if="member.avatar"
                :src="member.avatar"
                :alt="member.name"
                class="w-6 h-6 rounded-full border-2 border-white"
                :title="member.name"
              />
              <div
                v-else
                class="w-6 h-6 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center"
                :title="member.name"
              >
                <span class="text-xs font-medium text-primary-700">
                  {{ member.name.charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>
            <div
              v-if="(row.team_members || []).length > 3"
              class="w-6 h-6 rounded-full border-2 border-white bg-neutral-100 flex items-center justify-center"
              :title="`+${(row.team_members || []).length - 3} more`"
            >
              <span class="text-xs font-medium text-neutral-600">
                +{{ (row.team_members || []).length - 3 }}
              </span>
            </div>
          </div>
        </template>
          </DataTable>
        </ContentCard>
      </ContentSection>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth.js';
import { useNotifications } from '@/composables/useNotifications.js';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentSection from '@/Components/Layout/ContentSection.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import DataTable from '@/Components/Data/DataTable.vue';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  projects: Object,
  filters: {
    type: Object,
    default: () => ({})
  }
});

const { user, hasRole, hasAnyRole } = useAuth();
const { showNotification } = useNotifications();

// Local state
const loading = ref(false);

// Computed properties
const isManagerOrAdmin = computed(() => hasAnyRole(['Admin', 'Manager']));

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Projects', current: true }
]);

const headerActions = computed(() => [
  {
    id: 'create',
    label: 'New Project',
    icon: 'plus',
    variant: 'primary',
    handler: () => router.visit(route('projects.create'))
  },
  {
    id: 'export',
    label: 'Export',
    icon: 'document-download',
    variant: 'secondary',
    handler: handleExport
  }
]);

const tableColumns = computed(() => [
  {
    key: 'name',
    label: 'Project',
    sortable: true,
    priority: 'high'
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    priority: 'high',
    align: 'center'
  },
  {
    key: 'progress',
    label: 'Progress',
    sortable: true,
    priority: 'medium',
    align: 'center'
  },
  {
    key: 'team',
    label: 'Team',
    priority: 'medium',
    align: 'center'
  },
  {
    key: 'due_date',
    label: 'Due Date',
    sortable: true,
    priority: 'low',
    formatter: (value) => value ? new Date(value).toLocaleDateString() : '-'
  },
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
    priority: 'low',
    formatter: (value) => new Date(value).toLocaleDateString()
  }
]);

const searchConfig = computed(() => ({
  enabled: true,
  placeholder: 'Search projects...',
  fields: ['name', 'description', 'client']
}));

const filterConfig = computed(() => ({
  enabled: true,
  filters: [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'planning', label: 'Planning' },
        { value: 'active', label: 'Active' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ]
    }
  ]
}));

const emptyState = computed(() => ({
  title: 'No projects found',
  description: 'Get started by creating your first project.',
  icon: 'folder-open',
  actions: [
    {
      id: 'create',
      label: 'Create Project',
      variant: 'primary',
      handler: () => router.visit(route('projects.create'))
    }
  ]
}));

// Methods
const getRowActions = (row) => {
  const actions = [
    {
      id: 'view',
      label: 'View Details',
      icon: 'eye',
      handler: () => router.visit(route('projects.show', row.id))
    }
  ];

  if (canEdit(row)) {
    actions.push({
      id: 'edit',
      label: 'Edit Project',
      icon: 'pencil',
      handler: () => router.visit(route('projects.edit', row.id))
    });
  }

  if (canDelete(row)) {
    actions.push({
      id: 'delete',
      label: 'Delete Project',
      icon: 'trash',
      variant: 'danger',
      handler: () => handleDelete(row)
    });
  }

  return actions;
};

const canEdit = (project) => {
  return isManagerOrAdmin.value;
};

const canDelete = (project) => {
  return hasRole('Admin');
};

const getStatusClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const statusClasses = {
    planning: 'bg-neutral-100 text-neutral-800',
    active: 'bg-success-100 text-success-800',
    on_hold: 'bg-warning-100 text-warning-800',
    completed: 'bg-primary-100 text-primary-800',
    cancelled: 'bg-error-100 text-error-800'
  };
  
  return `${baseClasses} ${statusClasses[status] || statusClasses.planning}`;
};

const getStatusIcon = (status) => {
  const statusIcons = {
    planning: 'clock',
    active: 'check-circle',
    on_hold: 'warning',
    completed: 'check-circle-solid',
    cancelled: 'x-circle'
  };
  
  return statusIcons[status] || 'clock';
};

const getStatusLabel = (status) => {
  const statusLabels = {
    planning: 'Planning',
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  
  return statusLabels[status] || 'Unknown';
};

// Event handlers
const handleHeaderAction = (action) => {
  if (action.handler) {
    action.handler();
  }
};

const handleRowAction = ({ action, row }) => {
  if (action.handler) {
    action.handler();
  }
};

const handleRowClick = (row) => {
  router.visit(route('projects.show', row.id));
};

const handleSearch = (query) => {
  router.get(route('projects.index'), { search: query }, {
    preserveState: true,
    preserveScroll: true
  });
};

const handleFilter = (filters) => {
  router.get(route('projects.index'), { ...filters }, {
    preserveState: true,
    preserveScroll: true
  });
};

const handlePageChange = (page) => {
  router.get(route('projects.index'), { page }, {
    preserveState: true,
    preserveScroll: true
  });
};

const handlePageSizeChange = (pageSize) => {
  router.get(route('projects.index'), { per_page: pageSize, page: 1 }, {
    preserveState: true,
    preserveScroll: true
  });
};

const handleDelete = async (project) => {
  if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
    return;
  }

  loading.value = true;
  
  try {
    await router.delete(route('projects.destroy', project.id));
    showNotification({
      type: 'success',
      title: 'Project Deleted',
      message: `"${project.name}" has been successfully deleted.`
    });
  } catch (error) {
    showNotification({
      type: 'error',
      title: 'Delete Failed',
      message: 'Failed to delete the project. Please try again.'
    });
  } finally {
    loading.value = false;
  }
};

const handleExport = () => {
  // Implementation for export functionality
  showNotification({
    type: 'info',
    title: 'Export Started',
    message: 'Your project export is being prepared...'
  });
};
</script>