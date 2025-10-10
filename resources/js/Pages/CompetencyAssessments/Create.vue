<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Create Individual Assessment"
      subtitle="Select employees and competency to create assessments (can be linked to a cycle or standalone)"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-8">
          <form @submit.prevent="handleSubmit" class="assessment-selection-form">
            <!-- Employee Selection -->
            <div class="form-section">
              <h3 class="section-title">Select Employee</h3>
              
              <!-- Simple Employee Selection -->
              <div class="space-y-4">
                <!-- Department First (Optional) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Department (Optional)
                  </label>
                  <select
                    v-model="selectedDepartment"
                    @change="handleDepartmentChange"
                    class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Departments</option>
                    <option
                      v-for="department in departments"
                      :key="department.id"
                      :value="department.id"
                    >
                      {{ department.name }}
                    </option>
                  </select>
                </div>

                <!-- Employee Search & Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Select Employees
                    <span class="text-xs text-gray-500 font-normal">(Click multiple employees to select them)</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="employeeSearch"
                      type="text"
                      placeholder="Search by name or position (optional)..."
                      class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <MagnifyingGlassIcon class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  
                  <!-- Select All Option -->
                  <div v-if="displayedEmployees.length > 0" class="mt-2 flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <button
                        type="button"
                        @click="toggleSelectAll"
                        class="flex items-center space-x-2 text-sm font-medium transition-colors duration-200"
                        :class="allDisplayedSelected ? 'text-blue-700 hover:text-blue-800' : 'text-gray-700 hover:text-gray-800'"
                      >
                        <div class="flex-shrink-0">
                          <CheckIcon 
                            v-if="allDisplayedSelected" 
                            class="w-5 h-5 text-blue-600" 
                          />
                          <div 
                            v-else-if="someDisplayedSelected"
                            class="w-5 h-5 bg-blue-600 rounded border-2 border-blue-600 flex items-center justify-center"
                          >
                            <div class="w-2 h-2 bg-white rounded-sm"></div>
                          </div>
                          <div v-else class="w-5 h-5 border-2 border-gray-300 rounded"></div>
                        </div>
                        <span>
                          {{ allDisplayedSelected ? 'Deselect All' : 'Select All' }}
                          ({{ displayedEmployees.length }} employees)
                        </span>
                      </button>
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ selectedFromDisplayed.length }} of {{ displayedEmployees.length }} selected
                    </div>
                  </div>
                  
                  <!-- Employee Results -->
                  <div v-if="displayedEmployees.length > 0" class="mt-2 space-y-1 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <div
                      v-for="employee in displayedEmployees"
                      :key="employee.id"
                      @click="selectEmployee(employee)"
                      class="employee-option"
                      :class="{ 'selected': form.employee_ids.includes(employee.id) }"
                    >
                      <div class="flex items-center space-x-3">
                        <div class="employee-avatar-small">
                          {{ getInitials(employee.name) }}
                        </div>
                        <div class="flex-1">
                          <h4 class="font-medium text-gray-900">{{ employee.name }}</h4>
                          <div class="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{{ employee.position || 'Employee' }}</span>
                            <span v-if="employee.department" class="text-gray-400">•</span>
                            <span v-if="employee.department" class="text-gray-500">{{ employee.department.name }}</span>
                          </div>
                        </div>
                        <div class="flex-shrink-0">
                          <CheckIcon 
                            v-if="form.employee_ids.includes(employee.id)" 
                            class="w-5 h-5 text-blue-600" 
                          />
                          <div v-else class="w-5 h-5 border-2 border-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- No Results -->
                  <div v-else-if="employeeSearch && employeeSearch.length > 0" class="mt-2 text-center py-8 border border-gray-200 rounded-lg">
                    <UsersIcon class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p class="text-sm text-gray-500">No employees found matching "{{ employeeSearch }}"</p>
                  </div>

                  <!-- Initial State Help -->
                  <div v-else-if="!selectedDepartment && displayedEmployees.length === 0" class="mt-2 text-center py-8 border border-gray-200 rounded-lg">
                    <UsersIcon class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p class="text-sm text-gray-500">Select a department to see employees, or search by name</p>
                  </div>

                  <!-- Results Count -->
                  <div v-if="displayedEmployees.length > 0" class="mt-2 text-xs text-gray-500">
                    {{ displayedEmployees.length }} employee{{ displayedEmployees.length !== 1 ? 's' : '' }} available
                    <span v-if="selectedEmployees.length > 0" class="text-blue-600 font-medium">
                      • {{ selectedEmployees.length }} selected
                    </span>
                  </div>
                </div>

                <!-- Selected Employees Summary (Minimalistic) -->
                <div v-if="selectedEmployees.length > 0" class="selected-employees-summary">
                  <div class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="flex items-center space-x-2">
                      <CheckIcon class="w-5 h-5 text-blue-600" />
                      <span class="text-sm font-medium text-blue-900">
                        {{ selectedEmployees.length }} employee{{ selectedEmployees.length !== 1 ? 's' : '' }} selected
                      </span>
                    </div>
                    <button
                      type="button"
                      @click="clearAllEmployees"
                      class="text-sm text-blue-700 hover:text-blue-900 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Competency Selection -->
            <div class="form-section">
              <h3 class="section-title">Select Competency</h3>
              
              <!-- Simple Competency Selection -->
              <div class="space-y-4">
                <!-- Category First -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Step 1: Choose Category
                  </label>
                  <select
                    v-model="selectedCategory"
                    @change="form.competency_id = null"
                    class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select a competency category...</option>
                    <option
                      v-for="category in competencyCategories"
                      :key="category"
                      :value="category"
                    >
                      {{ category }}
                    </option>
                  </select>
                </div>

                <!-- Competency Selection -->
                <div v-if="selectedCategory">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Step 2: Choose Competencies
                    <span class="text-xs text-gray-500 font-normal">(Click multiple competencies to select them)</span>
                  </label>
                  
                  <!-- Select All Competencies -->
                  <div v-if="competenciesByCategory.length > 0" class="mb-2 flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <button
                        type="button"
                        @click="toggleSelectAllCompetencies"
                        class="flex items-center space-x-2 text-sm font-medium transition-colors duration-200"
                        :class="allCategoryCompetenciesSelected ? 'text-blue-700 hover:text-blue-800' : 'text-gray-700 hover:text-gray-800'"
                      >
                        <div class="flex-shrink-0">
                          <CheckIcon 
                            v-if="allCategoryCompetenciesSelected" 
                            class="w-5 h-5 text-blue-600" 
                          />
                          <div 
                            v-else-if="someCategoryCompetenciesSelected"
                            class="w-5 h-5 bg-blue-600 rounded border-2 border-blue-600 flex items-center justify-center"
                          >
                            <div class="w-2 h-2 bg-white rounded-sm"></div>
                          </div>
                          <div v-else class="w-5 h-5 border-2 border-gray-300 rounded"></div>
                        </div>
                        <span>
                          {{ allCategoryCompetenciesSelected ? 'Deselect All' : 'Select All' }}
                          ({{ competenciesByCategory.length }} competencies)
                        </span>
                      </button>
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ selectedFromCategory.length }} of {{ competenciesByCategory.length }} selected
                    </div>
                  </div>
                  
                  <div class="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <div
                      v-for="competency in competenciesByCategory"
                      :key="competency.id"
                      @click="selectCompetency(competency)"
                      class="competency-option"
                      :class="{ 'selected': form.competency_ids.includes(competency.id) }"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h4 class="font-medium text-gray-900">{{ competency.name }}</h4>
                          <p class="text-sm text-gray-600 mt-1">{{ competency.description }}</p>
                        </div>
                        <div class="ml-3 flex-shrink-0">
                          <CheckIcon 
                            v-if="form.competency_ids.includes(competency.id)" 
                            class="w-5 h-5 text-blue-600" 
                          />
                          <div v-else class="w-5 h-5 border-2 border-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Selected Competencies Summary -->
                <div v-if="selectedCompetencies.length > 0" class="selected-competencies-summary">
                  <div class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="flex items-center space-x-2">
                      <CheckIcon class="w-5 h-5 text-blue-600" />
                      <span class="text-sm font-medium text-blue-900">
                        {{ selectedCompetencies.length }} competenc{{ selectedCompetencies.length !== 1 ? 'ies' : 'y' }} selected
                      </span>
                    </div>
                    <button
                      type="button"
                      @click="clearAllCompetencies"
                      class="text-sm text-blue-700 hover:text-blue-900 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <!-- Quick Search (Optional) -->
                <div v-if="!selectedCategory" class="border-t pt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Or search directly:
                  </label>
                  <div class="relative">
                    <input
                      v-model="competencySearch"
                      type="text"
                      placeholder="Type competency name..."
                      class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <MagnifyingGlassIcon class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  
                  <!-- Search Results -->
                  <div v-if="competencySearch && searchResults.length > 0" class="mt-2 space-y-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    <div
                      v-for="competency in searchResults"
                      :key="competency.id"
                      @click="selectCompetencyFromSearch(competency)"
                      class="search-result-item"
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <h4 class="font-medium text-gray-900">{{ competency.name }}</h4>
                          <p class="text-xs text-gray-500">{{ competency.category }}</p>
                        </div>
                        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {{ competency.category }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Assessment Options -->
            <div class="form-section">
              <h3 class="section-title">Assessment Options</h3>
              <div class="options-grid">
                <!-- Assessment Type -->
                <div class="form-field">
                  <label class="field-label">Assessment Type</label>
                  <select v-model="form.assessment_type" class="form-select">
                    <option value="manager">Manager Assessment</option>
                    <option value="self">Self Assessment</option>
                    <option value="peer">Peer Assessment</option>
                    <option value="360">360° Feedback</option>
                  </select>
                </div>

                <!-- Assessment Cycle (Optional) -->
                <div class="form-field">
                  <label class="field-label">Assessment Cycle (Optional)</label>
                  <select v-model="form.assessment_cycle_id" class="form-select">
                    <option value="">No specific cycle</option>
                    <option
                      v-for="cycle in assessmentCycles"
                      :key="cycle.id"
                      :value="cycle.id"
                    >
                      {{ cycle.name }} ({{ formatDateRange(cycle.start_date, cycle.end_date) }})
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <SecondaryButton @click="goBack" type="button">
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="button"
                :disabled="!canSubmit"
                :loading="form.processing"
                @click="handleSubmit"
              >
                {{ totalAssessments > 1 ? `Create ${totalAssessments} Assessments` : 'Create Assessment' }}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useForm, router, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import SecondaryButton from '@/Components/SecondaryButton.vue';
import {
  ArrowLeftIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  employees: {
    type: Array,
    required: true
  },
  competencies: {
    type: Array,
    required: true
  },
  assessmentCycles: {
    type: Array,
    default: () => []
  },
  departments: {
    type: Array,
    default: () => []
  }
});

// Form setup
const form = useForm({
  employee_ids: [], // Array for multiple employee selection
  competency_ids: [], // Array for multiple competency selection
  assessment_type: 'manager',
  assessment_cycle_id: null
});

// Filter state
const employeeSearch = ref('');
const selectedDepartment = ref('');
const competencySearch = ref('');
const selectedCategory = ref('');

// Computed properties for filtering
const filteredEmployees = computed(() => {
  let filtered = props.employees;

  // Filter by department first
  if (selectedDepartment.value) {
    filtered = filtered.filter(employee => 
      employee.department && employee.department.id === selectedDepartment.value
    );
  }

  // Filter by search term (only if user is actively searching)
  if (employeeSearch.value && employeeSearch.value.length >= 2) {
    const searchTerm = employeeSearch.value.toLowerCase();
    filtered = filtered.filter(employee => 
      employee.name.toLowerCase().includes(searchTerm) ||
      (employee.position && employee.position.toLowerCase().includes(searchTerm))
    );
  }

  return filtered.sort((a, b) => a.name.localeCompare(b.name));
});

const displayedEmployees = computed(() => {
  // Always show all filtered employees (no artificial limits)
  return filteredEmployees.value;
});

const selectedEmployees = computed(() => {
  return props.employees.filter(e => form.employee_ids.includes(e.id));
});

// Select All functionality
const selectedFromDisplayed = computed(() => {
  return displayedEmployees.value.filter(e => form.employee_ids.includes(e.id));
});

const allDisplayedSelected = computed(() => {
  return displayedEmployees.value.length > 0 && 
         displayedEmployees.value.every(e => form.employee_ids.includes(e.id));
});

const someDisplayedSelected = computed(() => {
  return displayedEmployees.value.some(e => form.employee_ids.includes(e.id)) && 
         !allDisplayedSelected.value;
});

const competencyCategories = computed(() => {
  const categories = [...new Set(props.competencies.map(c => c.category))];
  return categories.sort();
});

const competenciesByCategory = computed(() => {
  if (!selectedCategory.value) return [];
  return props.competencies
    .filter(c => c.category === selectedCategory.value)
    .sort((a, b) => a.name.localeCompare(b.name));
});

const selectedCompetencies = computed(() => {
  return props.competencies.filter(c => form.competency_ids.includes(c.id));
});

// Competency Select All functionality
const selectedFromCategory = computed(() => {
  return competenciesByCategory.value.filter(c => form.competency_ids.includes(c.id));
});

const allCategoryCompetenciesSelected = computed(() => {
  return competenciesByCategory.value.length > 0 && 
         competenciesByCategory.value.every(c => form.competency_ids.includes(c.id));
});

const someCategoryCompetenciesSelected = computed(() => {
  return competenciesByCategory.value.some(c => form.competency_ids.includes(c.id)) && 
         !allCategoryCompetenciesSelected.value;
});

const searchResults = computed(() => {
  if (!competencySearch.value || competencySearch.value.length < 2) return [];
  
  const searchTerm = competencySearch.value.toLowerCase();
  return props.competencies
    .filter(competency => 
      competency.name.toLowerCase().includes(searchTerm) ||
      (competency.description && competency.description.toLowerCase().includes(searchTerm))
    )
    .slice(0, 5) // Limit to 5 results
    .sort((a, b) => a.name.localeCompare(b.name));
});

const selectedCompetency = computed(() => {
  if (!form.competency_id) return null;
  return props.competencies.find(c => c.id === form.competency_id);
});

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessment Dashboard', href: route('assessment-dashboard') },
  { label: 'Create Assessment', href: null }
]);

const headerActions = computed(() => [
  {
    label: 'Back to Dashboard',
    href: route('assessment-dashboard'),
    icon: ArrowLeftIcon,
    variant: 'secondary'
  }
]);

const canSubmit = computed(() => {
  return form.employee_ids.length > 0 && form.competency_ids.length > 0 && !form.processing;
});

const totalAssessments = computed(() => {
  return form.employee_ids.length * form.competency_ids.length;
});

// Methods
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${start} - ${end}`;
};

const clearEmployeeFilters = () => {
  employeeSearch.value = '';
  selectedDepartment.value = '';
};

const clearAllEmployees = () => {
  form.employee_ids = [];
};

const removeEmployee = (employeeId) => {
  form.employee_ids = form.employee_ids.filter(id => id !== employeeId);
};

const clearCompetencyFilters = () => {
  competencySearch.value = '';
  selectedCategory.value = '';
  form.competency_id = null;
};

const selectEmployee = (employee) => {
  const index = form.employee_ids.indexOf(employee.id);
  if (index > -1) {
    // Employee already selected, remove them
    form.employee_ids = form.employee_ids.filter(id => id !== employee.id);
  } else {
    // Employee not selected, add them
    form.employee_ids = [...form.employee_ids, employee.id];
  }
  console.log('Selected employee IDs:', form.employee_ids);
  console.log('Selected employees count:', selectedEmployees.value.length);
};

const toggleSelectAll = () => {
  if (allDisplayedSelected.value) {
    // Deselect all displayed employees
    const displayedIds = displayedEmployees.value.map(e => e.id);
    form.employee_ids = form.employee_ids.filter(id => !displayedIds.includes(id));
  } else {
    // Select all displayed employees
    const displayedIds = displayedEmployees.value.map(e => e.id);
    const newIds = displayedIds.filter(id => !form.employee_ids.includes(id));
    form.employee_ids = [...form.employee_ids, ...newIds];
  }
  console.log('Toggle Select All - Selected employee IDs:', form.employee_ids);
};

const handleDepartmentChange = () => {
  // Clear all employee selections when department changes (exclusive selection)
  form.employee_ids = [];
  // Also clear search to show all employees from new department
  employeeSearch.value = '';
  console.log('Department changed - cleared all employee selections');
};

const selectCompetency = (competency) => {
  const index = form.competency_ids.indexOf(competency.id);
  if (index > -1) {
    // Competency already selected, remove it
    form.competency_ids = form.competency_ids.filter(id => id !== competency.id);
  } else {
    // Competency not selected, add it
    form.competency_ids = [...form.competency_ids, competency.id];
  }
  console.log('Selected competency IDs:', form.competency_ids);
};

const toggleSelectAllCompetencies = () => {
  if (allCategoryCompetenciesSelected.value) {
    // Deselect all competencies from current category
    const categoryIds = competenciesByCategory.value.map(c => c.id);
    form.competency_ids = form.competency_ids.filter(id => !categoryIds.includes(id));
  } else {
    // Select all competencies from current category
    const categoryIds = competenciesByCategory.value.map(c => c.id);
    const newIds = categoryIds.filter(id => !form.competency_ids.includes(id));
    form.competency_ids = [...form.competency_ids, ...newIds];
  }
  console.log('Toggle Select All Competencies - Selected IDs:', form.competency_ids);
};

const clearAllCompetencies = () => {
  form.competency_ids = [];
};

const selectCompetencyFromSearch = (competency) => {
  // Add to selection instead of replacing
  if (!form.competency_ids.includes(competency.id)) {
    form.competency_ids = [...form.competency_ids, competency.id];
  }
  selectedCategory.value = competency.category;
  competencySearch.value = '';
};

const handleSubmit = () => {
  if (form.employee_ids.length === 0 || form.competency_ids.length === 0) {
    alert('Please select at least one employee and one competency');
    return;
  }

  // Calculate total assessments to be created
  const totalAssessments = form.employee_ids.length * form.competency_ids.length;
  
  if (totalAssessments === 1) {
    // Single assessment - redirect to assessment form
    const params = new URLSearchParams({
      employee_id: form.employee_ids[0],
      competency_id: form.competency_ids[0],
      assessment_type: form.assessment_type
    });

    if (form.assessment_cycle_id) {
      params.append('assessment_cycle_id', form.assessment_cycle_id);
    }

    const url = `${route('assessment-form')}?${params.toString()}`;
    router.visit(url);
  } else {
    // Multiple assessments - create in bulk
    form.post(route('competency-assessments.bulk-create'), {
      onSuccess: () => {
        router.visit(route('competency-assessments.index'));
      }
    });
  }
};

const goBack = () => {
  router.visit(route('assessment-dashboard'));
};
</script>

<style scoped>
.assessment-selection-form {
  @apply space-y-8;
}

.form-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2;
}

.employee-option {
  @apply p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 border-b border-gray-100 last:border-b-0;
}

.employee-option.selected {
  @apply bg-blue-50 border-blue-200;
}

.employee-option:hover {
  @apply bg-gray-50;
}

.employee-option.selected:hover {
  @apply bg-blue-100;
}

.employee-avatar-small {
  @apply w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0;
}

.selected-employees-summary {
  @apply mt-3;
}

.selected-competencies-summary {
  @apply mt-3;
}

.competency-option {
  @apply p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 border-b border-gray-100 last:border-b-0;
}

.competency-option.selected {
  @apply bg-blue-50 border-blue-200;
}

.competency-option:hover {
  @apply bg-gray-50;
}

.competency-option.selected:hover {
  @apply bg-blue-100;
}



.search-result-item {
  @apply p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0;
}

.selection-indicator {
  @apply absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center;
}

.options-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.form-field {
  @apply space-y-2;
}

.field-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-actions {
  @apply flex items-center justify-end space-x-4 pt-6 border-t border-gray-200;
}
</style>