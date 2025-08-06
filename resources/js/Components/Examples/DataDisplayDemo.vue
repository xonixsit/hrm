<template>
  <div class="space-y-8 p-6">
    <h1 class="text-3xl font-bold text-neutral-900">Data Display Components Demo</h1>
    
    <!-- View Switcher Demo -->
    <div class="space-y-4">
      <h2 class="text-2xl font-semibold">View Switcher</h2>
      <div class="flex items-center justify-between">
        <ViewSwitcher
          v-model="currentView"
          :show-labels="true"
          @change="handleViewChange"
        />
        <div class="text-sm text-neutral-600">
          Current view: {{ currentView }}
        </div>
      </div>
    </div>
    
    <!-- Data Display -->
    <div class="space-y-4">
      <h2 class="text-2xl font-semibold">Data Display Views</h2>
      
      <!-- Controls -->
      <div class="flex flex-wrap items-center gap-4 p-4 bg-neutral-50 rounded-lg">
        <ViewSwitcher
          v-model="currentView"
          :show-labels="true"
          variant="pills"
        />
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-neutral-700">Loading:</label>
          <input
            v-model="isLoading"
            type="checkbox"
            class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-neutral-700">Empty:</label>
          <input
            v-model="showEmpty"
            type="checkbox"
            class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
        
        <button
          @click="refreshData"
          class="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
        >
          Refresh Data
        </button>
      </div>
      
      <!-- Data Table View -->
      <div v-if="currentView === 'table'" class="bg-white rounded-lg border border-neutral-200">
        <DataTable
          :columns="tableColumns"
          :data="displayData"
          :loading="isLoading"
          :search-config="{ enabled: true, placeholder: 'Search users...' }"
          :pagination-config="{ pageSize: 10, showSizeSelector: true }"
          @row-click="handleRowClick"
          @action="handleTableAction"
        />
      </div>
      
      <!-- Data List View -->
      <DataList
        v-else-if="currentView === 'list'"
        title="User List"
        subtitle="Manage your team members"
        :items="displayData"
        :loading="isLoading"
        :clickable="true"
        :actions="listActions"
        @item-click="handleItemClick"
        @item-action="handleItemAction"
        @action="handleListAction"
      />
      
      <!-- Grid View -->
      <GridView
        v-else-if="currentView === 'grid'"
        title="User Grid"
        subtitle="Browse users in card format"
        :items="displayData"
        :loading="isLoading"
        :clickable="true"
        :columns="{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }"
        :actions="gridActions"
        @item-click="handleItemClick"
        @item-action="handleItemAction"
        @action="handleGridAction"
      />
    </div>
    
    <!-- Empty State Examples -->
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold">Empty State Variants</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Default Empty State -->
        <div class="bg-white border border-neutral-200 rounded-lg">
          <EmptyState
            title="No users found"
            description="There are no users in your organization yet."
            icon="UserGroupIcon"
            :actions="[
              { id: 'add', label: 'Add User', variant: 'primary' },
              { id: 'import', label: 'Import Users', variant: 'secondary' }
            ]"
            @action="handleEmptyAction"
          />
        </div>
        
        <!-- Minimal Empty State -->
        <div class="bg-white border border-neutral-200 rounded-lg">
          <EmptyState
            title="No results"
            description="Try adjusting your search criteria."
            variant="minimal"
            size="sm"
            icon="MagnifyingGlassIcon"
            :actions="[
              { id: 'clear', label: 'Clear Filters', variant: 'ghost' }
            ]"
            @action="handleEmptyAction"
          />
        </div>
        
        <!-- Illustration Empty State -->
        <div class="bg-white border border-neutral-200 rounded-lg">
          <EmptyState
            title="Welcome to your dashboard"
            description="Get started by creating your first project or importing existing data."
            variant="illustration"
            size="lg"
            icon="RocketLaunchIcon"
            :actions="[
              { id: 'create', label: 'Create Project', variant: 'primary' },
              { id: 'learn', label: 'Learn More', variant: 'secondary' }
            ]"
            @action="handleEmptyAction"
          />
        </div>
      </div>
    </div>
    
    <!-- Loading States Demo -->
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold">Loading States</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- List Loading -->
        <div>
          <h3 class="text-lg font-medium mb-4">List Loading State</h3>
          <DataList
            title="Loading Users"
            :items="[]"
            :loading="true"
            :skeleton-count="5"
          />
        </div>
        
        <!-- Grid Loading -->
        <div>
          <h3 class="text-lg font-medium mb-4">Grid Loading State</h3>
          <GridView
            title="Loading Projects"
            :items="[]"
            :loading="true"
            :skeleton-count="6"
            :columns="{ xs: 1, sm: 2, md: 3 }"
          />
        </div>
      </div>
    </div>
    
    <!-- Interactive Features Demo -->
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold">Interactive Features</h2>
      
      <div class="bg-white border border-neutral-200 rounded-lg p-6">
        <h3 class="text-lg font-medium mb-4">Clickable Items with Actions</h3>
        
        <DataList
          :items="interactiveData"
          :clickable="true"
          variant="bordered"
          @item-click="handleInteractiveClick"
          @item-action="handleInteractiveAction"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DataTable from '@/Components/Data/DataTable.vue';
import DataList from '@/Components/Data/DataList.vue';
import GridView from '@/Components/Data/GridView.vue';
import EmptyState from '@/Components/States/EmptyState.vue';
import ViewSwitcher from '@/Components/Data/ViewSwitcher.vue';

// Reactive state
const currentView = ref('list');
const isLoading = ref(false);
const showEmpty = ref(false);

// Sample data
const sampleData = [
  {
    id: 1,
    title: 'John Doe',
    description: 'Senior Developer with 5+ years of experience in Vue.js and Laravel.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    avatar: 'JD',
    email: 'john.doe@example.com',
    role: 'Senior Developer',
    status: 'Active',
    tags: ['Vue.js', 'Laravel', 'JavaScript'],
    actions: [
      { id: 'edit', icon: 'PencilIcon', label: 'Edit', variant: 'ghost' },
      { id: 'delete', icon: 'TrashIcon', label: 'Delete', variant: 'danger' }
    ]
  },
  {
    id: 2,
    title: 'Jane Smith',
    description: 'UX Designer focused on creating intuitive and accessible user experiences.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    avatar: 'JS',
    email: 'jane.smith@example.com',
    role: 'UX Designer',
    status: 'Active',
    tags: ['Design', 'Figma', 'User Research'],
    actions: [
      { id: 'edit', icon: 'PencilIcon', label: 'Edit', variant: 'ghost' },
      { id: 'delete', icon: 'TrashIcon', label: 'Delete', variant: 'danger' }
    ]
  },
  {
    id: 3,
    title: 'Mike Johnson',
    description: 'DevOps Engineer specializing in cloud infrastructure and automation.',
    avatar: 'MJ',
    email: 'mike.johnson@example.com',
    role: 'DevOps Engineer',
    status: 'Away',
    tags: ['AWS', 'Docker', 'Kubernetes'],
    actions: [
      { id: 'edit', icon: 'PencilIcon', label: 'Edit', variant: 'ghost' },
      { id: 'delete', icon: 'TrashIcon', label: 'Delete', variant: 'danger' }
    ]
  },
  {
    id: 4,
    title: 'Sarah Wilson',
    description: 'Product Manager with expertise in agile methodologies and user-centered design.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    avatar: 'SW',
    email: 'sarah.wilson@example.com',
    role: 'Product Manager',
    status: 'Active',
    tags: ['Product', 'Agile', 'Strategy'],
    actions: [
      { id: 'edit', icon: 'PencilIcon', label: 'Edit', variant: 'ghost' },
      { id: 'delete', icon: 'TrashIcon', label: 'Delete', variant: 'danger' }
    ]
  }
];

// Interactive demo data
const interactiveData = [
  {
    id: 1,
    title: 'Click me!',
    description: 'This item is clickable and has action buttons.',
    avatar: 'C',
    selected: false,
    actions: [
      { id: 'like', icon: 'HeartIcon', label: 'Like', variant: 'ghost' },
      { id: 'share', icon: 'ShareIcon', label: 'Share', variant: 'ghost' }
    ]
  },
  {
    id: 2,
    title: 'Another item',
    description: 'This one has different actions available.',
    avatar: 'A',
    selected: false,
    actions: [
      { id: 'bookmark', icon: 'BookmarkIcon', label: 'Bookmark', variant: 'ghost' },
      { id: 'download', icon: 'ArrowDownTrayIcon', label: 'Download', variant: 'ghost' }
    ]
  }
];

// Computed properties
const displayData = computed(() => {
  if (showEmpty.value) return [];
  return sampleData;
});

// Table configuration
const tableColumns = [
  { key: 'title', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', width: '120px' }
];

// Actions
const listActions = [
  { id: 'add', label: 'Add User', variant: 'primary' },
  { id: 'export', label: 'Export', variant: 'secondary' }
];

const gridActions = [
  { id: 'add', label: 'Add User', variant: 'primary' },
  { id: 'settings', label: 'Settings', variant: 'ghost' }
];

// Event handlers
const handleViewChange = (view) => {
  console.log('View changed to:', view);
};

const handleRowClick = (row) => {
  console.log('Table row clicked:', row);
};

const handleItemClick = ({ item, index }) => {
  console.log('Item clicked:', item, 'at index:', index);
};

const handleItemAction = ({ action, item, index }) => {
  console.log('Item action:', action, 'on item:', item, 'at index:', index);
};

const handleTableAction = (action) => {
  console.log('Table action:', action);
};

const handleListAction = (action) => {
  console.log('List action:', action);
};

const handleGridAction = (action) => {
  console.log('Grid action:', action);
};

const handleEmptyAction = (action) => {
  console.log('Empty state action:', action);
  
  if (action.id === 'add' || action.id === 'create') {
    alert('Add/Create action triggered!');
  } else if (action.id === 'clear') {
    showEmpty.value = false;
  }
};

const handleInteractiveClick = ({ item }) => {
  console.log('Interactive item clicked:', item);
  item.selected = !item.selected;
};

const handleInteractiveAction = ({ action, item }) => {
  console.log('Interactive action:', action, 'on item:', item);
  alert(`${action.label} action on "${item.title}"`);
};

const refreshData = () => {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
};
</script>

<style scoped>
/* Demo specific styles */
.space-y-8 > * + * {
  margin-top: 2rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>