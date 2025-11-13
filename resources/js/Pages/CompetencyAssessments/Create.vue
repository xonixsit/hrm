<template>
  <AuthenticatedLayout>
    <PageLayout title="Create Assessment"
      subtitle="Set up assessment context, select employees and competencies to evaluate" :breadcrumbs="breadcrumbs"
      :actions="headerActions">
      <!-- Progress Indicator -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
            1
          </div>
          <div>
            <p class="text-sm font-medium text-blue-900">Setup Assessment</p>
            <p class="text-xs text-blue-700">Configure context, select participants, and create assessments</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 text-gray-900">
          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Assessment Context -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">Assessment Context</h3>

              <!-- Assessment Cycle and Type -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Assessment Cycle</label>
                  <select v-model="form.assessment_cycle_id"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">No specific cycle</option>
                    <option v-for="cycle in assessmentCycles" :key="cycle.id" :value="cycle.id">
                      {{ cycle.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
                  <select v-model="form.assessment_type"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="manager">Manager Assessment</option>
                    <option value="self">Self Assessment</option>
                    <option value="peer">Peer Assessment</option>
                    <option value="360">360° Feedback</option>
                  </select>
                </div>
              </div>

              <!-- Selected Cycle Info -->
              <div v-if="selectedCycle" class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-blue-900">{{ selectedCycle.name }}</span>
                  <span class="text-blue-700">{{ formatDate(selectedCycle.start_date) }} - {{
                    formatDate(selectedCycle.end_date) }}</span>
                </div>
              </div>
            </div>

            <!-- Employee Selection -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Select Employees</h3>
                <div v-if="selectedEmployees.length > 0" class="text-sm text-blue-600 font-medium">
                  {{ selectedEmployees.length }} selected
                </div>
              </div>

              <!-- Search and Filter Row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="relative">
                  <input v-model="employeeSearch" type="text" placeholder="Search employees..."
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  <MagnifyingGlassIcon class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>

                <select v-model="selectedDepartment"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option value="">All Departments</option>
                  <option v-for="department in departments" :key="department.id" :value="department.id">
                    {{ department.name }}
                  </option>
                </select>
              </div>

              <!-- Select All / Clear All Actions -->
              <div v-if="displayedEmployees.length > 0" class="flex items-center justify-between text-sm">
                <button type="button" @click="selectAllEmployees" class="text-blue-600 hover:text-blue-800 font-medium"
                  :disabled="allDisplayedEmployeesSelected">
                  Select All ({{ displayedEmployees.length }})
                </button>
                <button v-if="selectedEmployees.length > 0" type="button" @click="clearAllEmployees"
                  class="text-blue-600 hover:text-blue-800 font-medium">
                  Clear All
                </button>
              </div>

              <!-- Employee List -->
              <div v-if="displayedEmployees.length > 0"
                class="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                <div v-for="employee in displayedEmployees" :key="employee.id"
                  class="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
                  :class="{ 'bg-blue-50 border-blue-200': form.employee_ids.includes(employee.id) }"
                  @click="selectEmployee(employee)">
                  <div class="flex items-center space-x-3 flex-1">
                    <div
                      class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-xs flex-shrink-0">
                      {{ getInitials(employee.name) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ employee.name }}</p>
                      <p class="text-xs text-gray-500 truncate">
                        {{ employee.position || 'Employee' }}
                        <span v-if="employee.department"> • {{ employee.department.name }}</span>
                      </p>
                    </div>
                  </div>
                  <div class="flex-shrink-0">
                    <div class="w-4 h-4 rounded border-2 flex items-center justify-center" :class="form.employee_ids.includes(employee.id) 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300'">
                      <CheckIcon v-if="form.employee_ids.includes(employee.id)" class="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Competency Selection -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Select Competencies</h3>
                <div v-if="selectedCompetencies.length > 0" class="text-sm text-blue-600 font-medium">
                  {{ selectedCompetencies.length }} selected
                </div>
              </div>

              <!-- Category Selection -->
              <div>
                <select v-model="selectedCategory"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option value="">Choose a competency category...</option>
                  <option v-for="category in competencyCategories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>

              <!-- Select All / Clear All Actions -->
              <div v-if="selectedCategory && competenciesByCategory.length > 0"
                class="flex items-center justify-between text-sm">
                <button type="button" @click="selectAllCompetencies"
                  class="text-blue-600 hover:text-blue-800 font-medium" :disabled="allCategoryCompetenciesSelected">
                  Select All ({{ competenciesByCategory.length }})
                </button>
                <button v-if="selectedCompetencies.length > 0" type="button" @click="clearAllCompetencies"
                  class="text-blue-600 hover:text-blue-800 font-medium">
                  Clear All
                </button>
              </div>

              <!-- Competency List -->
              <div v-if="selectedCategory && competenciesByCategory.length > 0"
                class="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                <div v-for="competency in competenciesByCategory" :key="competency.id"
                  class="flex items-start p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
                  :class="{ 'bg-blue-50 border-blue-200': form.competency_ids.includes(competency.id) }"
                  @click="selectCompetency(competency)">
                  <div class="flex-1 min-w-0 pr-3">
                    <p class="text-sm font-medium text-gray-900">{{ competency.name }}</p>
                    <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ competency.description }}</p>
                  </div>
                  <div class="flex-shrink-0">
                    <div class="w-4 h-4 rounded border-2 flex items-center justify-center" :class="form.competency_ids.includes(competency.id) 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300'">
                      <CheckIcon v-if="form.competency_ids.includes(competency.id)" class="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>



            <!-- Form Actions -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
              <div class="flex items-center space-x-3">
                <SecondaryButton @click="goBack" type="button">
                  Cancel
                </SecondaryButton>
                <!-- Add Assessment Button - Navigate directly to assessment form -->
                <SecondaryButton v-if="canSubmit && totalAssessments === 1" @click="navigateToAssessment" type="button"
                  class="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add Assessment
                </SecondaryButton>
              </div>
              <button type="button" :disabled="!canSubmit" @click="handleSubmit"
                class="inline-flex items-center px-6 py-3 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg v-if="form.processing" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                {{ totalAssessments > 1 ? `Create ${totalAssessments} Assessments` : 'Create & Complete Assessment' }}
              </button>
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

  // Select All computed properties
  const allDisplayedEmployeesSelected = computed(() => {
    if (displayedEmployees.value.length === 0) return false;
    return displayedEmployees.value.every(employee => form.employee_ids.includes(employee.id));
  });

  const allCategoryCompetenciesSelected = computed(() => {
    if (competenciesByCategory.value.length === 0) return false;
    return competenciesByCategory.value.every(competency => form.competency_ids.includes(competency.id));
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

  const selectAllEmployees = () => {
    const displayedEmployeeIds = displayedEmployees.value.map(employee => employee.id);
    // Add all displayed employees that aren't already selected
    const newIds = displayedEmployeeIds.filter(id => !form.employee_ids.includes(id));
    form.employee_ids = [...form.employee_ids, ...newIds];
  };

  const selectAllCompetencies = () => {
    const categoryCompetencyIds = competenciesByCategory.value.map(competency => competency.id);
    // Add all competencies in the category that aren't already selected
    const newIds = categoryCompetencyIds.filter(id => !form.competency_ids.includes(id));
    form.competency_ids = [...form.competency_ids, ...newIds];
  };

  const handleSubmit = async () => {
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
      form.processing = true;

      try {
        let successCount = 0;

        // Create assessments for each competency sequentially
        for (const competencyId of form.competency_ids) {
          await new Promise((resolve, reject) => {
            // Use Inertia's router.post for proper CSRF handling
            router.post(route('competency-assessments.bulk-create'), {
              employee_ids: form.employee_ids,
              competency_id: competencyId,
              assessment_type: form.assessment_type,
              assessment_cycle_id: form.assessment_cycle_id
            }, {
              preserveState: true,
              preserveScroll: true,
              onSuccess: () => {
                successCount++;
                resolve();
              },
              onError: (errors) => {
                console.error('Bulk create error:', errors);
                reject(new Error(Object.values(errors).flat().join(', ')));
              }
            });
          });
        }

        // Success - redirect to assessments index
        form.processing = false;
        router.visit(route('competency-assessments.index'));

      } catch (error) {
        console.error('Error creating bulk assessments:', error);
        form.processing = false;
        alert(`Failed to create assessments: ${error.message}`);
      }
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



  const goBack = () => {
    router.visit(route('assessment-dashboard'));
  };
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>