<script setup>
import { ref, computed } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { useFlashMessages } from '@/composables/useFlashMessages';
import {
  PlusIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ChartBarIcon,
  UsersIcon,
  TagIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
    competencies: Object,
    departments: Array,
    categories: Array,
    filters: Object,
    stats: Object
});

// Initialize flash messages
useFlashMessages();

const selectedCompetencies = ref([]);
const showFilters = ref(false);
const searchQuery = ref(props.filters?.search || '');
const showImpactModal = ref(false);
const selectedCompetencyForImpact = ref(null);

const filters = ref({
    category: props.filters?.category || '',
    department_id: props.filters?.department_id || '',
    is_active: props.filters?.is_active || '',
    search: props.filters?.search || ''
});

const selectAll = computed({
    get: () => selectedCompetencies.value.length === props.competencies.data.length,
    set: (value) => {
        selectedCompetencies.value = value ? props.competencies.data.map(c => c.id) : [];
    }
});

const applyFilters = () => {
    router.get(route('competencies.index'), filters.value, {
        preserveState: true,
        preserveScroll: true
    });
};

const clearFilters = () => {
    filters.value = {
        category: '',
        department_id: '',
        is_active: '',
        search: ''
    };
    searchQuery.value = '';
    applyFilters();
};

const search = () => {
    filters.value.search = searchQuery.value;
    applyFilters();
};

const deleteCompetency = (id) => {
    console.log('Delete competency clicked:', id);
    if (confirm('Are you sure you want to delete this competency?')) {
        router.delete(route('competencies.destroy', id));
    }
};

const bulkActivate = () => {
    if (selectedCompetencies.value.length === 0) {
        alert('Please select competencies to activate.');
        return;
    }
    
    if (confirm(`Are you sure you want to activate ${selectedCompetencies.value.length} competencies?`)) {
        router.post(route('competencies.bulk-activate'), {
            competency_ids: selectedCompetencies.value
        }, {
            onSuccess: () => {
                selectedCompetencies.value = [];
            }
        });
    }
};

const bulkDeactivate = () => {
    if (selectedCompetencies.value.length === 0) {
        alert('Please select competencies to deactivate.');
        return;
    }
    
    if (confirm(`Are you sure you want to deactivate ${selectedCompetencies.value.length} competencies?`)) {
        router.post(route('competencies.bulk-deactivate'), {
            competency_ids: selectedCompetencies.value
        }, {
            onSuccess: () => {
                selectedCompetencies.value = [];
            }
        });
    }
};

const bulkDelete = () => {
    if (selectedCompetencies.value.length === 0) {
        alert('Please select competencies to delete.');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedCompetencies.value.length} competencies? This action cannot be undone.`)) {
        router.post(route('competencies.bulk-delete'), {
            competency_ids: selectedCompetencies.value
        }, {
            onSuccess: () => {
                selectedCompetencies.value = [];
            }
        });
    }
};

const toggleCompetencyStatus = (competency) => {
    const action = competency.is_active ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} "${competency.name}"?`)) {
        router.post(route('competencies.toggle-status', competency.id));
    }
};

const getStatusClasses = (isActive) => {
    return isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800';
};

const getCategoryClasses = (category) => {
    const classes = {
        'Attendance & Punctuality': 'bg-blue-100 text-blue-800',
        'Performance in Sales/Targets': 'bg-green-100 text-green-800',
        'File Handling & Accuracy': 'bg-purple-100 text-purple-800',
        'Calling & Call Backs': 'bg-yellow-100 text-yellow-800',
        'Assessment Scores': 'bg-red-100 text-red-800',
        'Quality of Work': 'bg-indigo-100 text-indigo-800',
        'Teamwork & Cooperation': 'bg-pink-100 text-pink-800',
        'Adaptability & Learning': 'bg-orange-100 text-orange-800',
        'Communication Skills': 'bg-teal-100 text-teal-800',
        'Discipline & Integrity': 'bg-gray-100 text-gray-800'
    };
    return classes[category] || 'bg-gray-100 text-gray-800';
};

const showImpactAnalysis = (competency) => {
    selectedCompetencyForImpact.value = competency;
    showImpactModal.value = true;
};

const duplicateCompetency = (competency) => {
    if (confirm(`Are you sure you want to duplicate "${competency.name}"?`)) {
        router.post(route('competencies.duplicate', competency.id));
    }
};

const exportCompetencies = () => {
    // Build query string from current filters
    const params = new URLSearchParams();
    
    Object.keys(filters.value).forEach(key => {
        if (filters.value[key] !== null && filters.value[key] !== '') {
            params.append(key, filters.value[key]);
        }
    });
    
    // Create download URL with filters
    const exportUrl = route('competencies.export') + (params.toString() ? '?' + params.toString() : '');
    
    // Trigger download
    window.location.href = exportUrl;
};
</script>

<template>
    <AuthenticatedLayout>
        <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Header -->
                <div class="mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">Competency Framework</h1>
                            <p class="text-gray-600 mt-1">Manage competencies, categories, and assessment criteria</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <button
                                @click="exportCompetencies"
                                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
                                Export
                            </button>
                            <button
                                @click="showFilters = !showFilters"
                                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FunnelIcon class="w-4 h-4 mr-2" />
                                Filters
                            </button>
                            <Link
                                :href="route('competencies.create')"
                                class="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                <PlusIcon class="w-4 h-4 mr-2" />
                                Add Competency
                            </Link>
                        </div>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <TagIcon class="h-8 w-8 text-blue-600" />
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Total Competencies</p>
                                <p class="text-2xl font-bold text-gray-900">{{ stats.total || 0 }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <CheckIcon class="h-8 w-8 text-green-600" />
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Active</p>
                                <p class="text-2xl font-bold text-gray-900">{{ stats.active || 0 }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <ChartBarIcon class="h-8 w-8 text-purple-600" />
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Categories</p>
                                <p class="text-2xl font-bold text-gray-900">{{ stats.categories || 0 }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <UsersIcon class="h-8 w-8 text-yellow-600" />
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Assessments</p>
                                <p class="text-2xl font-bold text-gray-900">{{ stats.assessments || 0 }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Search and Filters -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div class="p-6">
                        <!-- Search Bar -->
                        <div class="mb-4">
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    v-model="searchQuery"
                                    @keyup.enter="search"
                                    type="text"
                                    placeholder="Search competencies..."
                                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <!-- Filters -->
                        <div v-show="showFilters" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    v-model="filters.category"
                                    @change="applyFilters"
                                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Categories</option>
                                    <option v-for="category in categories" :key="category" :value="category">
                                        {{ category }}
                                    </option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select
                                    v-model="filters.department_id"
                                    @change="applyFilters"
                                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Departments</option>
                                    <option v-for="department in departments" :key="department.id" :value="department.id">
                                        {{ department.name }}
                                    </option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    v-model="filters.is_active"
                                    @change="applyFilters"
                                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>
                            
                            <div class="flex items-end">
                                <button
                                    @click="clearFilters"
                                    class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bulk Actions -->
                <div v-if="selectedCompetencies.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <span class="text-sm font-medium text-blue-900">
                                {{ selectedCompetencies.length }} competencies selected
                            </span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <button
                                @click="bulkActivate"
                                class="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                            >
                                <CheckIcon class="w-4 h-4 mr-1" />
                                Activate
                            </button>
                            <button
                                @click="bulkDeactivate"
                                class="inline-flex items-center px-3 py-1 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700"
                            >
                                <XMarkIcon class="w-4 h-4 mr-1" />
                                Deactivate
                            </button>
                            <button
                                @click="bulkDelete"
                                class="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                            >
                                <TrashIcon class="w-4 h-4 mr-1" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Competencies Table -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left">
                                        <input
                                            v-model="selectAll"
                                            type="checkbox"
                                            class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Weight
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usage
                                    </th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="competency in competencies.data" :key="competency.id" class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <input
                                            v-model="selectedCompetencies"
                                            :value="competency.id"
                                            type="checkbox"
                                            class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                    </td>
                                    <td class="px-6 py-4">
                                        <div>
                                            <div class="text-sm font-medium text-gray-900">{{ competency.name }}</div>
                                            <div v-if="competency.description" class="text-sm text-gray-500 line-clamp-2">
                                                {{ competency.description }}
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span v-if="competency.category" :class="getCategoryClasses(competency.category)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                            {{ competency.category }}
                                        </span>
                                        <span v-else class="text-sm text-gray-400">No category</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ competency.weight || 'N/A' }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ competency.department?.name || 'All Departments' }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <button
                                            @click="toggleCompetencyStatus(competency)"
                                            :class="getStatusClasses(competency.is_active)"
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80"
                                        >
                                            {{ competency.is_active ? 'Active' : 'Inactive' }}
                                        </button>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div class="flex items-center">
                                            <div class="flex flex-col">
                                                <span class="text-sm font-medium">{{ competency.assessments_count || 0 }} assessments</span>
                                                <span v-if="competency.average_rating" class="text-xs text-gray-500">
                                                    Avg: {{ parseFloat(competency.average_rating).toFixed(1) }}/5
                                                </span>
                                            </div>
                                            <div class="ml-2 w-16 bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    class="bg-teal-600 h-1.5 rounded-full"
                                                    :style="{ width: `${Math.min(100, (competency.assessments_count || 0) * 2)}%` }"
                                                ></div>
                                            </div>
                                            <button
                                                @click="showImpactAnalysis(competency)"
                                                class="ml-2 text-gray-400 hover:text-gray-600"
                                                title="View Impact Analysis"
                                            >
                                                <InformationCircleIcon class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div class="flex items-center justify-end space-x-1">
                                            <Link
                                                :href="route('competencies.show', competency.id)"
                                                @click="console.log('View competency clicked:', competency.id)"
                                                class="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors duration-200"
                                                title="View Competency"
                                            >
                                                <EyeIcon class="w-4 h-4" />
                                            </Link>
                                            <Link
                                                :href="route('competencies.edit', competency.id)"
                                                @click="console.log('Edit competency clicked:', competency.id)"
                                                class="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors duration-200"
                                                title="Edit Competency"
                                            >
                                                <PencilIcon class="w-4 h-4" />
                                            </Link>
                                            <button
                                                @click="duplicateCompetency(competency)"
                                                class="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors duration-200"
                                                title="Duplicate Competency"
                                            >
                                                <DocumentDuplicateIcon class="w-4 h-4" />
                                            </button>
                                            <button
                                                @click="deleteCompetency(competency.id)"
                                                class="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors duration-200"
                                                title="Delete Competency"
                                            >
                                                <TrashIcon class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div v-if="competencies.links" class="px-6 py-3 border-t border-gray-200">
                        <div class="flex items-center justify-between">
                            <div class="text-sm text-gray-700">
                                Showing {{ competencies.from }} to {{ competencies.to }} of {{ competencies.total }} results
                            </div>
                            <div class="flex space-x-1">
                                <Link
                                    v-for="link in competencies.links"
                                    :key="link.label"
                                    :href="link.url"
                                    :class="[
                                        'px-3 py-2 text-sm font-medium rounded-md',
                                        link.active
                                            ? 'bg-teal-600 text-white'
                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                    ]"
                                    v-html="link.label"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Impact Analysis Modal -->
        <div v-if="showImpactModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showImpactModal = false"></div>

                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <ChartBarIcon class="h-6 w-6 text-blue-600" aria-hidden="true" />
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Impact Analysis: {{ selectedCompetencyForImpact?.name }}
                                </h3>
                                <div class="mt-4">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div class="bg-gray-50 p-3 rounded-lg">
                                            <div class="text-sm font-medium text-gray-500">Total Assessments</div>
                                            <div class="text-2xl font-bold text-gray-900">{{ selectedCompetencyForImpact?.assessments_count || 0 }}</div>
                                        </div>
                                        <div class="bg-gray-50 p-3 rounded-lg">
                                            <div class="text-sm font-medium text-gray-500">Average Rating</div>
                                            <div class="text-2xl font-bold text-gray-900">
                                                {{ selectedCompetencyForImpact?.average_rating ? parseFloat(selectedCompetencyForImpact.average_rating).toFixed(1) : 'N/A' }}
                                            </div>
                                        </div>
                                        <div class="bg-gray-50 p-3 rounded-lg">
                                            <div class="text-sm font-medium text-gray-500">Weight</div>
                                            <div class="text-2xl font-bold text-gray-900">{{ selectedCompetencyForImpact?.weight || 'N/A' }}</div>
                                        </div>
                                        <div class="bg-gray-50 p-3 rounded-lg">
                                            <div class="text-sm font-medium text-gray-500">Status</div>
                                            <div class="text-sm font-bold" :class="selectedCompetencyForImpact?.is_active ? 'text-green-600' : 'text-red-600'">
                                                {{ selectedCompetencyForImpact?.is_active ? 'Active' : 'Inactive' }}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="mt-4">
                                        <div class="text-sm font-medium text-gray-500 mb-2">Category & Department</div>
                                        <div class="flex flex-wrap gap-2">
                                            <span v-if="selectedCompetencyForImpact?.category" 
                                                  :class="getCategoryClasses(selectedCompetencyForImpact.category)" 
                                                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                                {{ selectedCompetencyForImpact.category }}
                                            </span>
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {{ selectedCompetencyForImpact?.department?.name || 'All Departments' }}
                                            </span>
                                        </div>
                                    </div>

                                    <div v-if="selectedCompetencyForImpact?.description" class="mt-4">
                                        <div class="text-sm font-medium text-gray-500 mb-2">Description</div>
                                        <p class="text-sm text-gray-700">{{ selectedCompetencyForImpact.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" 
                                @click="showImpactModal = false"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>