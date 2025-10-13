<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Create Assessment"
      subtitle="Set up assessment context, select employees and competencies to evaluate"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Progress Steps -->
      <div class="bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <!-- Step 1: Assessment Context -->
            <div class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                1
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Assessment Context</p>
                <p class="text-xs text-gray-500">Set cycle and assessment type</p>
              </div>
            </div>

            <!-- Step 2: Select Participants -->
            <div class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium">
                2
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Select Participants</p>
                <p class="text-xs text-gray-400">Choose employees and competencies</p>
              </div>
            </div>

            <!-- Step 3: Create Assessments -->
            <div class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium">
                3
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Create Assessments</p>
                <p class="text-xs text-gray-400">Generate assessment records</p>
              </div>
            </div>

            <!-- Step 4: Begin Evaluation -->
            <div class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium">
                4
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Begin Evaluation</p>
                <p class="text-xs text-gray-400">Start rating and providing feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 text-gray-900">
          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Assessment Context -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Assessment Context</h3>
              
              <!-- Assessment Cycle and Type -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Assessment Cycle</label>
                  <select v-model="form.assessment_cycle_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">No specific cycle</option>
                    <option
                      v-for="cycle in assessmentCycles"
                      :key="cycle.id"
                      :value="cycle.id"
                    >
                      {{ cycle.name }}
                    </option>
                  </select>
                  <p class="text-xs text-gray-500">Select an assessment cycle to organize assessments by period or campaign</p>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Assessment Type</label>
                  <select v-model="form.assessment_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="manager">Manager Assessment</option>
                    <option value="self">Self Assessment</option>
                    <option value="peer">Peer Assessment</option>
                    <option value="360">360° Feedback</option>
                  </select>
                  <p class="text-xs text-gray-500">Choose the type of assessment to be conducted</p>
                </div>
              </div>

              <!-- Selected Cycle Info -->
              <div v-if="selectedCycle" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h4 class="text-sm font-medium text-blue-900">{{ selectedCycle.name }}</h4>
                </div>
                <div class="text-sm text-blue-700 grid grid-cols-2 gap-4">
                  <div>
                    <span class="font-medium">Start Date:</span> {{ formatDate(selectedCycle.start_date) }}
                  </div>
                  <div>
                    <span class="font-medium">End Date:</span> {{ formatDate(selectedCycle.end_date) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Employee Selection -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Select Employees</h3>
              
              <!-- Department Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Department (Optional)
                </label>
                <select
                  v-model="selectedDepartment"
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

              <!-- Employee Search -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Select Employees
                </label>
                <div class="relative mb-2">
                  <input
                    v-model="employeeSearch"
                    type="text"
                    placeholder="Search by name or position..."
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <MagnifyingGlassIcon class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                
                <!-- Employee Cards -->
                <div v-if="displayedEmployees.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
                  <div
                    v-for="employee in displayedEmployees"
                    :key="employee.id"
                    class="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md"
                    :class="{ 'ring-2 ring-blue-500 border-blue-200 bg-blue-50': form.employee_ids.includes(employee.id) }"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3 flex-1 cursor-pointer" @click="selectEmployee(employee)">
                        <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
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
                      
                      <!-- Quick Assessment Button -->
                      <div class="ml-4 flex items-center space-x-2">
                        <button
                          @click.stop="quickCreateAssessment(employee)"
                          class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 transition-colors"
                          title="Quick create assessment for this employee"
                        >
                          <PlusIcon class="w-3 h-3 mr-1" />
                          Assess
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Selected Employees Summary -->
                <div v-if="selectedEmployees.length > 0" class="mt-3">
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
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Select Competencies</h3>
              
              <!-- Category Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Choose Category
                </label>
                <select
                  v-model="selectedCategory"
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
                  Choose Competencies
                </label>
                
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  <div
                    v-for="competency in competenciesByCategory"
                    :key="competency.id"
                    class="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md"
                    :class="{ 'ring-2 ring-blue-500 border-blue-200 bg-blue-50': form.competency_ids.includes(competency.id) }"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1 cursor-pointer" @click="selectCompetency(competency)">
                        <h4 class="font-medium text-gray-900">{{ competency.name }}</h4>
                        <p class="text-sm text-gray-600 mt-1">{{ competency.description }}</p>
                        <div class="flex items-center mt-2">
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {{ competency.category }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-3 flex items-start space-x-2">
                        <div class="flex-shrink-0">
                          <CheckIcon 
                            v-if="form.competency_ids.includes(competency.id)" 
                            class="w-5 h-5 text-blue-600" 
                          />
                          <div v-else class="w-5 h-5 border-2 border-gray-300 rounded"></div>
                        </div>
                        <!-- Quick Assessment Button -->
                        <button
                          @click.stop="quickCreateAssessmentForCompetency(competency)"
                          class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200 transition-colors"
                          title="Quick create assessment for this competency"
                        >
                          <PlusIcon class="w-3 h-3 mr-1" />
                          Assess
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected Competencies Summary -->
              <div v-if="selectedCompetencies.length > 0" class="mt-3">
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
            </div>

            <!-- Action Options Info -->
            <div v-if="canSubmit && totalAssessments === 1" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 class="text-sm font-medium text-blue-900 mb-2">Choose how to proceed:</h4>
              <div class="text-sm text-blue-700 space-y-1">
                <p><strong>Add Assessment:</strong> Navigate directly to the assessment form to start rating</p>
                <p><strong>Create & Complete Assessment:</strong> Create the assessment record first, then proceed to rating</p>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
              <div class="flex items-center space-x-3">
                <SecondaryButton @click="goBack" type="button">
                  Cancel
                </SecondaryButton>
                <!-- Add Assessment Button - Navigate directly to assessment form -->
                <SecondaryButton 
                  v-if="canSubmit && totalAssessments === 1"
                  @click="navigateToAssessment" 
                  type="button"
                  class="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add Assessment
                </SecondaryButton>
              </div>
              <PrimaryButton
                type="button"
                :disabled="!canSubmit"
                :loading="form.processing"
                @click="handleSubmit"
              >
                {{ totalAssessments > 1 ? `Create ${totalAssessments} Assessments` : 'Create & Complete Assessment' }}
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
  XMarkIcon,
  PlusIcon
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
  return filteredEmployees.value;
});

const selectedEmployees = computed(() => {
  return props.employees.filter(e => form.employee_ids.includes(e.id));
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

const selectedCycle = computed(() => {
  if (!form.assessment_cycle_id) return null;
  return props.assessmentCycles.find(cycle => cycle.id === form.assessment_cycle_id);
});

const canSubmit = computed(() => {
  return form.employee_ids.length > 0 && form.competency_ids.length > 0 && !form.processing;
});

const totalAssessments = computed(() => {
  return form.employee_ids.length * form.competency_ids.length;
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessment Dashboard', href: route('assessment-dashboard') },
  { label: 'Create Assessment', current: true }
]);

const headerActions = computed(() => [
  {
    label: 'Back to Dashboard',
    href: route('assessment-dashboard'),
    variant: 'secondary',
    icon: 'ArrowLeftIcon'
  }
]);

// Methods
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const selectEmployee = (employee) => {
  const index = form.employee_ids.indexOf(employee.id);
  if (index > -1) {
    form.employee_ids = form.employee_ids.filter(id => id !== employee.id);
  } else {
    form.employee_ids = [...form.employee_ids, employee.id];
  }
};

const selectCompetency = (competency) => {
  const index = form.competency_ids.indexOf(competency.id);
  if (index > -1) {
    form.competency_ids = form.competency_ids.filter(id => id !== competency.id);
  } else {
    form.competency_ids = [...form.competency_ids, competency.id];
  }
};

const clearAllEmployees = () => {
  form.employee_ids = [];
};

const clearAllCompetencies = () => {
  form.competency_ids = [];
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
    // Multiple assessments - create in bulk for each competency
    // Since backend expects one competency at a time, we'll create multiple requests
    const promises = form.competency_ids.map(competencyId => {
      const bulkForm = useForm({
        employee_ids: form.employee_ids,
        competency_id: competencyId, // Single competency ID as expected by backend
        assessment_type: form.assessment_type,
        assessment_cycle_id: form.assessment_cycle_id
      });
      
      return new Promise((resolve, reject) => {
        bulkForm.post(route('competency-assessments.bulk-create'), {
          onSuccess: () => resolve(),
          onError: (errors) => reject(errors)
        });
      });
    });

    form.processing = true;
    
    Promise.all(promises)
      .then(() => {
        router.visit(route('competency-assessments.index'));
      })
      .catch((error) => {
        console.error('Error creating bulk assessments:', error);
        form.processing = false;
      });
  }
};

const navigateToAssessment = () => {
  if (form.employee_ids.length === 0 || form.competency_ids.length === 0) {
    alert('Please select at least one employee and one competency');
    return;
  }

  // Navigate directly to assessment form without creating the assessment first
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
};

const quickCreateAssessment = (employee) => {
  // If no competency selected, show alert
  if (form.competency_ids.length === 0) {
    alert('Please select at least one competency first');
    return;
  }

  // Use the first selected competency or prompt user to select one
  const competencyId = form.competency_ids[0];
  
  const params = new URLSearchParams({
    employee_id: employee.id,
    competency_id: competencyId,
    assessment_type: form.assessment_type
  });

  if (form.assessment_cycle_id) {
    params.append('assessment_cycle_id', form.assessment_cycle_id);
  }

  const url = `${route('assessment-form')}?${params.toString()}`;
  router.visit(url);
};

const quickCreateAssessmentForCompetency = (competency) => {
  // If no employee selected, show alert
  if (form.employee_ids.length === 0) {
    alert('Please select at least one employee first');
    return;
  }

  // Use the first selected employee
  const employeeId = form.employee_ids[0];
  
  const params = new URLSearchParams({
    employee_id: employeeId,
    competency_id: competency.id,
    assessment_type: form.assessment_type
  });

  if (form.assessment_cycle_id) {
    params.append('assessment_cycle_id', form.assessment_cycle_id);
  }

  const url = `${route('assessment-form')}?${params.toString()}`;
  router.visit(url);
};

const goBack = () => {
  router.visit(route('assessment-dashboard'));
};
</script>

<style scoped>
/* Custom styles for the assessment creation page */
</style>