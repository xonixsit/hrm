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
            <DialogPanel class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900 mb-4">
                Test Assignments - {{ testName }}
              </DialogTitle>

              <!-- Loading State -->
              <div v-if="loading" class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              </div>

              <!-- Assignments List -->
              <div v-else-if="assignments.length > 0" class="space-y-4">
                <div
                  v-for="assignment in assignments"
                  :key="assignment.id"
                  class="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 mb-2">
                        <h4 class="text-base font-medium text-gray-900">
                          {{ assignment.employee.name }}
                        </h4>
                        <span
                          class="px-2 py-1 text-xs font-medium rounded-full"
                          :class="{
                            'bg-yellow-100 text-yellow-700': assignment.status === 'pending',
                            'bg-blue-100 text-blue-700': assignment.status === 'in_progress',
                            'bg-green-100 text-green-700': assignment.status === 'completed'
                          }"
                        >
                          {{ assignment.status.replace('_', ' ') }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-600 mb-2">{{ assignment.employee.email }}</p>
                      
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span class="text-gray-500">Assigned by:</span>
                          <span class="ml-1 text-gray-900">{{ assignment.assigned_by }}</span>
                        </div>
                        <div>
                          <span class="text-gray-500">Deadline:</span>
                          <span class="ml-1 text-gray-900">
                            {{ assignment.available_until ? formatDate(assignment.available_until) : 'No deadline' }}
                          </span>
                        </div>
                        <div>
                          <span class="text-gray-500">Max Attempts:</span>
                          <span class="ml-1 text-gray-900">{{ assignment.max_attempts }}</span>
                        </div>
                        <div>
                          <span class="text-gray-500">Attempts Remaining:</span>
                          <span class="ml-1 text-gray-900">{{ assignment.attempts_remaining }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Edit Button -->
                    <button
                      v-if="assignment.status !== 'completed'"
                      @click="editAssignment(assignment)"
                      class="ml-4 text-teal-600 hover:text-teal-700"
                      title="Edit assignment"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No assignments yet</h3>
                <p class="mt-1 text-sm text-gray-500">This test has not been assigned to any employees.</p>
              </div>

              <!-- Close Button -->
              <div class="flex justify-end mt-6">
                <button
                  @click="closeModal"
                  class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- Edit Assignment Modal -->
  <EditAssignmentModal
    v-if="showEditModal && editingAssignment"
    :show="showEditModal"
    :assignment="editingAssignment"
    @close="handleEditModalClose"
    @updated="handleAssignmentUpdated"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import EditAssignmentModal from './EditAssignmentModal.vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  testId: {
    type: Number,
    required: true
  },
  testName: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

const assignments = ref([]);
const loading = ref(false);
const editingAssignment = ref(null);
const showEditModal = ref(false);

onMounted(async () => {
  if (props.show) {
    await fetchAssignments();
  }
});

const fetchAssignments = async () => {
  loading.value = true;
  try {
    const response = await fetch(route('skill-tests.assignments', props.testId));
    const data = await response.json();
    assignments.value = data.assignments || [];
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const closeModal = () => {
  emit('close');
};

const editAssignment = (assignment) => {
  // Create a fresh copy to ensure reactivity
  editingAssignment.value = { ...assignment };
  showEditModal.value = true;
};

const handleAssignmentUpdated = async () => {
  showEditModal.value = false;
  editingAssignment.value = null;
  await fetchAssignments();
};

const handleEditModalClose = () => {
  showEditModal.value = false;
  editingAssignment.value = null;
};
</script>
