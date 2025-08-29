<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Projects"
      subtitle="Manage and track all your projects"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
      @action="handleHeaderAction"
    >
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Table Header with Filters -->
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Project List</h3>
            <div class="flex items-center space-x-4">
              <!-- Search Field -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="localFilters.search"
                  type="text"
                  placeholder="Name, client, description..."
                  class="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  @input="debounceSearch"
                />
              </div>
              
              <!-- Show Filters Button -->
              <button
                @click="showFilters = !showFilters"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
                </svg>
                {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
                <span v-if="activeFiltersCount > 0" class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">
                  {{ activeFiltersCount }}
                </span>
              </button>
            </div>
          </div>
          
          <!-- Filter Controls -->
          <div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="localFilters.status"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All statuses</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <!-- Priority Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                v-model="localFilters.priority"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <!-- Manager Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <select
                v-model="localFilters.manager_id"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All managers</option>
                <option v-for="manager in managerOptions" :key="manager.id" :value="manager.id">
                  {{ manager.name }}
                </option>
              </select>
            </div>

            <!-- Due Date Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Due Before</label>
              <input
                v-model="localFilters.due_before"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                @change="applyFilters"
              />
            </div>
          </div>
          
          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
            <span class="text-sm font-medium text-gray-700">Active filters:</span>
            <span
              v-if="activeStatusFilter"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              Status: {{ getStatusLabel(localFilters.status) }}
              <button @click="clearFilter('status')" class="ml-1 text-blue-600 hover:text-blue-800">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <span
              v-if="activePriorityFilter"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              Priority: {{ getPriorityLabel(localFilters.priority) }}
              <button @click="clearFilter('priority')" class="ml-1 text-green-600 hover:text-green-800">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <span
              v-if="activeManagerFilter"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
            >
              Manager: {{ getManagerName(localFilters.manager_id) }}
              <button @click="clearFilter('manager_id')" class="ml-1 text-purple-600 hover:text-purple-800">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <span
              v-if="activeDueDateFilter"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              Due before: {{ formatDate(localFilters.due_before) }}
              <button @click="clearFilter('due_before')" class="ml-1 text-yellow-600 hover:text-yellow-800">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
            <button
              @click="clearAllFilters"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Clear all
            </button>
          </div>
        </div>

        <!-- Projects Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortBy('name')">
                  <div class="flex items-center space-x-1">
                    <span>Project</span>
                    <svg v-if="sortField === 'name'" class="w-4 h-4" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortBy('status')">
                  <div class="flex items-center space-x-1">
                    <span>Status</span>
                    <svg v-if="sortField === 'status'" class="w-4 h-4" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortBy('priority')">
                  <div class="flex items-center space-x-1">
                    <span>Priority</span>
                    <svg v-if="sortField === 'priority'" class="w-4 h-4" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortBy('due_date')">
                  <div class="flex items-center space-x-1">
                    <span>Due Date</span>
                    <svg v-if="sortField === 'due_date'" class="w-4 h-4" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="project in projects.data" :key="project.id" class="hover:bg-gray-50 cursor-pointer" @click="handleRowClick(project)">
                <!-- Project Name & Client -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Icon name="folder-open" class="w-5 h-5 text-indigo-600" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ project.name }}</div>
                      <div v-if="project.client" class="text-sm text-gray-500">{{ project.client }}</div>
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClasses(project.status)">
                    <Icon :name="getStatusIcon(project.status)" class="w-3 h-3 mr-1" />
                    {{ getStatusLabel(project.status) }}
                  </span>
                </td>

                <!-- Priority -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getPriorityClasses(project.priority)">
                    <Icon :name="getPriorityIcon(project.priority)" class="w-3 h-3 mr-1" />
                    {{ getPriorityLabel(project.priority) }}
                  </span>
                </td>

                <!-- Progress -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-1 bg-gray-200 rounded-full h-2 mr-3" style="width: 60px;">
                      <div 
                        class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${project.progress || 0}%` }"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-600 font-medium">{{ project.progress || 0 }}%</span>
                  </div>
                </td>

                <!-- Team Members -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex -space-x-2">
                    <div
                      v-for="(member, index) in (project.team_members || []).slice(0, 3)"
                      :key="member.id"
                      class="relative"
                    >
                      <div
                        class="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center"
                        :title="member.name"
                      >
                        <span class="text-xs font-medium text-gray-600">
                          {{ member.name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                    <div
                      v-if="(project.team_members || []).length > 3"
                      class="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center"
                      :title="`+${(project.team_members || []).length - 3} more`"
                    >
                      <span class="text-xs font-medium text-gray-600">
                        +{{ (project.team_members || []).length - 3 }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Due Date -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ project.due_date ? formatDate(project.due_date) : '-' }}
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click.stop="router.visit(route('projects.show', project.id))"
                      class="text-indigo-600 hover:text-indigo-900"
                      title="View project"
                    >
                      <Icon name="eye" class="w-4 h-4" />
                    </button>
                    <button
                      v-if="canEdit(project)"
                      @click.stop="router.visit(route('projects.edit', project.id))"
                      class="text-gray-600 hover:text-gray-900"
                      title="Edit project"
                    >
                      <Icon name="pencil" class="w-4 h-4" />
                    </button>
                    <button
                      v-if="canDelete(project)"
                      @click.stop="handleDelete(project)"
                      class="text-red-600 hover:text-red-900"
                      title="Delete project"
                    >
                      <Icon name="trash" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="projects.data.length === 0" class="text-center py-12">
            <Icon name="folder-open" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p class="text-gray-500 mb-6">Get started by creating your first project.</p>
            <button
              @click="router.visit(route('projects.create'))"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Icon name="plus" class="w-4 h-4 mr-2" />
              Create Project
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="projects.data.length > 0" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                :disabled="!projects.prev_page_url"
                @click="changePage(projects.current_page - 1)"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                :disabled="!projects.next_page_url"
                @click="changePage(projects.current_page + 1)"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing
                  <span class="font-medium">{{ projects.from || 0 }}</span>
                  to
                  <span class="font-medium">{{ projects.to || 0 }}</span>
                  of
                  <span class="font-medium">{{ projects.total }}</span>
                  results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    :disabled="!projects.prev_page_url"
                    @click="changePage(projects.current_page - 1)"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Previous</span>
                    <Icon name="chevron-left" class="w-5 h-5" />
                  </button>
                  
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="changePage(page)"
                    :class="[
                      page === projects.current_page
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                    ]"
                  >
                    {{ page }}
                  </button>
                  
                  <button
                    :disabled="!projects.next_page_url"
                    @click="changePage(projects.current_page + 1)"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Next</span>
                    <Icon name="chevron-right" class="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth.js';
import { useNotifications } from '@/composables/useNotifications.js';
import { debounce } from 'lodash';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  projects: Object,
  filters: {
    type: Object,
    default: () => ({})
  },
  managers: {
    type: Array,
    default: () => []
  }
});

const { user, hasRole, hasAnyRole } = useAuth();
const { showNotification } = useNotifications();

// Local state
const loading = ref(false);
const showFilters = ref(false);
const sortField = ref('created_at');
const sortDirection = ref('desc');

// Local filters state
const localFilters = ref({
  search: props.filters.search || '',
  status: props.filters.status || '',
  priority: props.filters.priority || '',
  manager_id: props.filters.manager_id || '',
  due_before: props.filters.due_before || ''
});

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

// Filter-related computed properties
const managerOptions = computed(() => props.managers || []);

const hasActiveFilters = computed(() => {
  return localFilters.value.search ||
         localFilters.value.status ||
         localFilters.value.priority ||
         localFilters.value.manager_id ||
         localFilters.value.due_before;
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (localFilters.value.status) count++;
  if (localFilters.value.priority) count++;
  if (localFilters.value.manager_id) count++;
  if (localFilters.value.due_before) count++;
  return count;
});

const activeStatusFilter = computed(() => localFilters.value.status);
const activePriorityFilter = computed(() => localFilters.value.priority);
const activeManagerFilter = computed(() => localFilters.value.manager_id);
const activeDueDateFilter = computed(() => localFilters.value.due_before);

const visiblePages = computed(() => {
  const current = props.projects.current_page;
  const last = props.projects.last_page;
  const pages = [];
  
  // Always show first page
  if (current > 3) pages.push(1);
  
  // Show pages around current
  for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
    pages.push(i);
  }
  
  // Always show last page
  if (current < last - 2) pages.push(last);
  
  return [...new Set(pages)].sort((a, b) => a - b);
});

// Debounced search
const debounceSearch = debounce(() => {
  applyFilters();
}, 300);

// Methods
const canEdit = (project) => {
  return isManagerOrAdmin.value;
};

const canDelete = (project) => {
  return hasRole('Admin');
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const applyFilters = () => {
  const params = {
    search: localFilters.value.search || undefined,
    status: localFilters.value.status || undefined,
    priority: localFilters.value.priority || undefined,
    manager_id: localFilters.value.manager_id || undefined,
    due_before: localFilters.value.due_before || undefined,
    sort: sortField.value,
    direction: sortDirection.value,
    page: 1 // Reset to first page when filtering
  };

  // Remove undefined values
  Object.keys(params).forEach(key => {
    if (params[key] === undefined) {
      delete params[key];
    }
  });

  router.get(route('projects.index'), params, {
    preserveState: true,
    preserveScroll: true
  });
};

const clearFilter = (filterKey) => {
  localFilters.value[filterKey] = '';
  applyFilters();
};

const clearAllFilters = () => {
  localFilters.value = {
    search: '',
    status: '',
    priority: '',
    manager_id: '',
    due_before: ''
  };
  applyFilters();
};

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
  applyFilters();
};

const changePage = (page) => {
  if (page < 1 || page > props.projects.last_page) return;
  
  const params = {
    ...localFilters.value,
    sort: sortField.value,
    direction: sortDirection.value,
    page
  };

  router.get(route('projects.index'), params, {
    preserveState: true,
    preserveScroll: true
  });
};

const getManagerName = (managerId) => {
  const manager = managerOptions.value.find(m => m.id == managerId);
  return manager ? manager.name : 'Unknown';
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

const getPriorityClasses = (priority) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const priorityClasses = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  
  return `${baseClasses} ${priorityClasses[priority] || 'bg-gray-100 text-gray-800'}`;
};

const getPriorityIcon = (priority) => {
  const priorityIcons = {
    low: 'arrow-down',
    medium: 'minus',
    high: 'arrow-up',
    urgent: 'exclamation'
  };
  
  return priorityIcons[priority] || 'minus';
};

const getPriorityLabel = (priority) => {
  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  };
  
  return priorityLabels[priority] || 'Unknown';
};

// Event handlers
const handleRowClick = (row) => {
  router.visit(route('projects.show', row.id));
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

const handleHeaderAction = (actionId) => {
  const action = headerActions.value.find(a => a.id === actionId);
  if (action && action.handler) {
    action.handler();
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