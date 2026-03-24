<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900 mb-4">
                Assign Test to Employees
              </DialogTitle>

              <form @submit.prevent="submitAssignment" class="space-y-4">
                <!-- Employee Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Select Employees <span class="text-red-500">*</span>
                  </label>
                  
                  <!-- Search Input -->
                  <div class="relative mb-2">
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search employees..."
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Select All -->
                  <div class="flex items-center justify-between mb-2 px-1">
                    <span class="text-xs text-gray-500">{{ form.employee_ids.length }} selected</span>
                    <button type="button" @click="toggleSelectAll"
                      class="text-xs font-medium text-teal-600 hover:text-teal-800">
                      {{ allFilteredSelected ? 'Deselect All' : 'Select All' }}
                    </button>
                  </div>

                  <!-- Selected Employees -->
                  <div v-if="form.employee_ids.length > 0" class="flex flex-wrap gap-2 mb-2">
                    <span
                      v-for="employeeId in form.employee_ids"
                      :key="employeeId"
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-700"
                    >
                      {{ getEmployeeName(employeeId) }}
                      <button
                        type="button"
                        @click="removeEmployee(employeeId)"
                        class="ml-2 text-teal-600 hover:text-teal-800"
                      >
                        ×
                      </button>
                    </span>
                  </div>

                  <!-- Employee List -->
                  <div class="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                    <div v-if="loading" class="p-4 text-center text-gray-500">
                      Loading employees...
                    </div>
                    <div v-else-if="filteredEmployees.length === 0" class="p-4 text-center text-gray-500">
                      No employees found
                    </div>
                    <label
                      v-else
                      v-for="employee in filteredEmployees"
                      :key="employee.id"
                      class="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        :value="employee.id"
                        v-model="form.employee_ids"
                        class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span class="ml-3 text-sm text-gray-900">
                        {{ employee.full_name }}
                        <span class="text-gray-500">({{ employee.email }})</span>
                      </span>
                    </label>
                  </div>
                  
                  <p v-if="form.errors.employee_ids" class="mt-1 text-sm text-red-600">
                    {{ form.errors.employee_ids }}
                  </p>
                </div>

                <!-- Available From -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Available From
                  </label>
                  <input
                    v-model="form.available_from"
                    type="datetime-local"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p v-if="form.errors.available_from" class="mt-1 text-sm text-red-600">
                    {{ form.errors.available_from }}
                  </p>
                </div>

                <!-- Deadline -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    v-model="form.available_until"
                    type="datetime-local"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p v-if="form.errors.available_until" class="mt-1 text-sm text-red-600">
                    {{ form.errors.available_until }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500">
                    Leave empty for no deadline
                  </p>
                </div>

                <!-- Max Attempts -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Attempts
                  </label>
                  <input
                    v-model.number="form.max_attempts"
                    type="number"
                    min="1"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p v-if="form.errors.max_attempts" class="mt-1 text-sm text-red-600">
                    {{ form.errors.max_attempts }}
                  </p>
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    v-model="form.notes"
                    rows="3"
                    placeholder="Add any additional instructions or notes for the employees..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  ></textarea>
                  <p v-if="form.errors.notes" class="mt-1 text-sm text-red-600">
                    {{ form.errors.notes }}
                  </p>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="form.processing || form.employee_ids.length === 0"
                    class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ form.processing ? 'Assigning...' : 'Assign Test' }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  testId: {
    type: Number,
    required: true
  },
  testMaxAttempts: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['close', 'assigned']);

const employees = ref([]);
const loading = ref(false);
const searchQuery = ref('');

const form = useForm({
  employee_ids: [],
  available_from: null,
  available_until: null,
  max_attempts: props.testMaxAttempts,
  notes: ''
});

const filteredEmployees = computed(() => {
  if (!searchQuery.value) {
    return employees.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return employees.value.filter(employee => 
    employee.full_name.toLowerCase().includes(query) ||
    employee.email.toLowerCase().includes(query)
  );
});

const allFilteredSelected = computed(() =>
  filteredEmployees.value.length > 0 &&
  filteredEmployees.value.every(e => form.employee_ids.includes(e.id))
);

const toggleSelectAll = () => {
  if (allFilteredSelected.value) {
    // Deselect only the filtered ones
    const filteredIds = filteredEmployees.value.map(e => e.id);
    form.employee_ids = form.employee_ids.filter(id => !filteredIds.includes(id));
  } else {
    // Add all filtered that aren't already selected
    const filteredIds = filteredEmployees.value.map(e => e.id);
    const merged = [...new Set([...form.employee_ids, ...filteredIds])];
    form.employee_ids = merged;
  }
};

// Fetch employees on mount
onMounted(async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/employees');
    const data = await response.json();
    employees.value = data.employees || [];
  } catch (error) {
    console.error('Failed to fetch employees:', error);
  } finally {
    loading.value = false;
  }
});

const getEmployeeName = (employeeId) => {
  const employee = employees.value.find(e => e.id === employeeId);
  return employee ? employee.full_name : '';
};

const removeEmployee = (employeeId) => {
  form.employee_ids = form.employee_ids.filter(id => id !== employeeId);
};

const submitAssignment = () => {
  form.post(route('skill-tests.assign', props.testId), {
    preserveScroll: true,
    onSuccess: () => {
      emit('assigned');
      closeModal();
    },
  });
};

const closeModal = () => {
  form.reset();
  form.clearErrors();
  searchQuery.value = '';
  emit('close');
};
</script>
