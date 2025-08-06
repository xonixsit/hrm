<template>
  <div class="space-y-8">
    <!-- Basic Data Table -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Basic Data Table</h2>
      <DataTable
        title="Users"
        :columns="basicColumns"
        :data="users"
        :loading="loading"
        @search="handleSearch"
        @sort="handleSort"
        @page-change="handlePageChange"
      />
    </section>

    <!-- Advanced Data Table with All Features -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Advanced Data Table</h2>
      <DataTable
        title="Advanced User Management"
        :columns="advancedColumns"
        :data="filteredUsers"
        :loading="loading"
        :selectable="true"
        :selected-rows="selectedUsers"
        :search-config="searchConfig"
        :filter-config="filterConfig"
        :header-actions="headerActions"
        :row-actions="rowActions"
        :page-size="pageSize"
        :page-size-options="[5, 10, 25, 50]"
        @search="handleAdvancedSearch"
        @filter="handleFilter"
        @sort="handleAdvancedSort"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        @row-action="handleRowAction"
        @header-action="handleHeaderAction"
      >
        <!-- Custom Status Cell -->
        <template #cell-status="{ value, row }">
          <span :class="getStatusClasses(value)">
            {{ value }}
          </span>
        </template>
        
        <!-- Custom Avatar Cell -->
        <template #cell-avatar="{ row }">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-primary-600 font-medium text-sm">
                {{ getInitials(row.name) }}
              </span>
            </div>
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>
      </DataTable>
    </section>

    <!-- Compact Data Table -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Compact Data Table</h2>
      <DataTable
        title="Compact View"
        :columns="compactColumns"
        :data="users.slice(0, 5)"
        size="sm"
        :striped="false"
        :show-footer="false"
      />
    </section>

    <!-- Loading State Demo -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Loading States</h2>
      <div class="space-y-4">
        <div class="flex space-x-4">
          <button
            @click="toggleLoading"
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            {{ loading ? 'Stop Loading' : 'Start Loading' }}
          </button>
          <button
            @click="clearData"
            class="px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700"
          >
            Clear Data
          </button>
          <button
            @click="resetData"
            class="px-4 py-2 bg-success-600 text-white rounded-md hover:bg-success-700"
          >
            Reset Data
          </button>
        </div>
        
        <DataTable
          title="Loading Demo"
          :columns="basicColumns"
          :data="demoData"
          :loading="loading"
          :skeleton-rows="8"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import DataTable from '@/Components/Data/DataTable.vue';

// Demo data
const users = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', role: 'admin', lastLogin: '2024-01-15', department: 'Engineering' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', role: 'user', lastLogin: '2024-01-14', department: 'Marketing' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', role: 'user', lastLogin: '2024-01-10', department: 'Sales' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'active', role: 'moderator', lastLogin: '2024-01-16', department: 'Support' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'pending', role: 'user', lastLogin: null, department: 'Engineering' },
  { id: 6, name: 'Diana Davis', email: 'diana@example.com', status: 'active', role: 'admin', lastLogin: '2024-01-15', department: 'HR' },
  { id: 7, name: 'Eve Miller', email: 'eve@example.com', status: 'inactive', role: 'user', lastLogin: '2024-01-08', department: 'Finance' },
  { id: 8, name: 'Frank Garcia', email: 'frank@example.com', status: 'active', role: 'user', lastLogin: '2024-01-16', department: 'Marketing' },
  { id: 9, name: 'Grace Lee', email: 'grace@example.com', status: 'active', role: 'moderator', lastLogin: '2024-01-15', department: 'Support' },
  { id: 10, name: 'Henry Taylor', email: 'henry@example.com', status: 'pending', role: 'user', lastLogin: null, department: 'Sales' }
]);

// State
const loading = ref(false);
const selectedUsers = ref([]);
const pageSize = ref(10);
const searchQuery = ref('');
const activeFilters = ref({});
const sortConfig = ref({ key: null, direction: null });
const demoData = ref([...users.value]);

// Column configurations
const basicColumns = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', sortable: true }
];

const advancedColumns = [
  { key: 'avatar', label: 'User', width: '200px' },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { 
    key: 'lastLogin', 
    label: 'Last Login', 
    sortable: true,
    formatter: (value) => value ? new Date(value).toLocaleDateString() : 'Never'
  }
];

const compactColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' }
];

// Search and filter configuration
const searchConfig = {
  enabled: true,
  placeholder: 'Search users...',
  fields: ['name', 'email', 'department']
};

const filterConfig = {
  enabled: true,
  filters: [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      quick: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    },
    {
      key: 'role',
      label: 'Role',
      type: 'multiselect',
      quick: true,
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'moderator', label: 'Moderator' },
        { value: 'user', label: 'User' }
      ]
    },
    {
      key: 'department',
      label: 'Department',
      type: 'select',
      options: [
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Sales', label: 'Sales' },
        { value: 'Support', label: 'Support' },
        { value: 'HR', label: 'HR' },
        { value: 'Finance', label: 'Finance' }
      ]
    }
  ]
};

// Actions
const headerActions = [
  {
    id: 'create',
    label: 'Add User',
    variant: 'primary',
    icon: 'plus'
  },
  {
    id: 'export',
    label: 'Export',
    variant: 'secondary',
    icon: 'download'
  },
  {
    id: 'import',
    label: 'Import',
    variant: 'secondary',
    icon: 'upload'
  }
];

const rowActions = [
  { id: 'view', label: 'View', icon: 'eye' },
  { id: 'edit', label: 'Edit', icon: 'pencil' },
  { id: 'delete', label: 'Delete', icon: 'trash', variant: 'danger' }
];

// Computed
const filteredUsers = computed(() => {
  let result = [...users.value];
  
  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.department.toLowerCase().includes(query)
    );
  }
  
  // Apply filters
  Object.entries(activeFilters.value).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        result = result.filter(user => value.includes(user[key]));
      } else if (!Array.isArray(value)) {
        result = result.filter(user => user[key] === value);
      }
    }
  });
  
  // Apply sorting
  if (sortConfig.value.key) {
    result.sort((a, b) => {
      const aValue = a[sortConfig.value.key];
      const bValue = b[sortConfig.value.key];
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return sortConfig.value.direction === 'desc' ? -comparison : comparison;
    });
  }
  
  return result;
});

// Methods
const handleSearch = (query) => {
  console.log('Search:', query);
};

const handleAdvancedSearch = (query) => {
  searchQuery.value = query;
  console.log('Advanced Search:', query);
};

const handleFilter = (filters) => {
  activeFilters.value = filters;
  console.log('Filter:', filters);
};

const handleSort = (sort) => {
  console.log('Sort:', sort);
};

const handleAdvancedSort = (sort) => {
  sortConfig.value = sort;
  console.log('Advanced Sort:', sort);
};

const handlePageChange = (page) => {
  console.log('Page Change:', page);
};

const handlePageSizeChange = (size) => {
  pageSize.value = size;
  console.log('Page Size Change:', size);
};

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection;
  console.log('Selection Change:', selection);
};

const handleRowClick = (row) => {
  console.log('Row Click:', row);
};

const handleRowAction = ({ action, row }) => {
  console.log('Row Action:', action, row);
  
  if (action.id === 'delete') {
    if (confirm(`Are you sure you want to delete ${row.name}?`)) {
      const index = users.value.findIndex(u => u.id === row.id);
      if (index > -1) {
        users.value.splice(index, 1);
      }
    }
  }
};

const handleHeaderAction = (action) => {
  console.log('Header Action:', action);
  
  if (action.id === 'create') {
    const newUser = {
      id: users.value.length + 1,
      name: `New User ${users.value.length + 1}`,
      email: `user${users.value.length + 1}@example.com`,
      status: 'pending',
      role: 'user',
      lastLogin: null,
      department: 'Engineering'
    };
    users.value.push(newUser);
  }
};

const getStatusClasses = (status) => [
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  {
    'bg-success-100 text-success-800': status === 'active',
    'bg-error-100 text-error-800': status === 'inactive',
    'bg-warning-100 text-warning-800': status === 'pending'
  }
];

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const toggleLoading = () => {
  loading.value = !loading.value;
};

const clearData = () => {
  demoData.value = [];
};

const resetData = () => {
  demoData.value = [...users.value];
};

// Lifecycle
onMounted(() => {
  console.log('DataTable Demo mounted');
});
</script>
</template>