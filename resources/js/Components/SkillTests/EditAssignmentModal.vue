<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" class="relative z-50" :static="true">
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
                Edit Assignment
              </DialogTitle>

              <div v-if="form.errors.general" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {{ form.errors.general }}
              </div>

              <form @submit.prevent="submitUpdate" class="space-y-4">
                <!-- Employee (read-only display) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                  <input
                    type="text"
                    :value="assignment?.employee?.name || 'Unknown'"
                    disabled
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <!-- Available From -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Available From</label>
                  <input
                    v-model="form.available_from"
                    type="datetime-local"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p v-if="form.errors.available_from" class="mt-1 text-sm text-red-600">{{ form.errors.available_from }}</p>
                </div>

                <!-- Deadline -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                  <input
                    v-model="form.available_until"
                    type="datetime-local"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p v-if="form.errors.available_until" class="mt-1 text-sm text-red-600">{{ form.errors.available_until }}</p>
                  <p class="mt-1 text-xs text-gray-500">Leave empty for no deadline</p>
                </div>

                <!-- Max Attempts -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Maximum Attempts</label>
                  <input
                    v-model.number="form.max_attempts"
                    type="number"
                    min="1"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p v-if="form.errors.max_attempts" class="mt-1 text-sm text-red-600">{{ form.errors.max_attempts }}</p>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="form.processing"
                    class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {{ form.processing ? 'Updating...' : 'Update Assignment' }}
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
import { reactive, watch } from 'vue';
import axios from 'axios';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  assignment: { type: Object, required: true },
});

const emit = defineEmits(['close', 'updated']);

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const form = reactive({
  available_from: '',
  available_until: '',
  max_attempts: 1,
  processing: false,
  errors: {},
});

// Reset form whenever the assignment changes
watch(
  () => props.assignment?.id,
  () => {
    form.available_from = formatDateForInput(props.assignment?.available_from);
    form.available_until = formatDateForInput(props.assignment?.available_until);
    form.max_attempts = props.assignment?.max_attempts ?? 1;
    form.errors = {};
  },
  { immediate: true }
);

const submitUpdate = async () => {
  form.processing = true;
  form.errors = {};
  try {
    await axios.patch(route('skill-tests.update-assignment', props.assignment.id), {
      available_from: form.available_from || null,
      available_until: form.available_until || null,
      max_attempts: form.max_attempts,
    });
    emit('updated');
  } catch (error) {
    if (error.response?.data?.errors) {
      form.errors = error.response.data.errors;
    } else {
      form.errors = { general: error.response?.data?.message || error.response?.data?.error || 'Update failed.' };
    }
  } finally {
    form.processing = false;
  }
};

const closeModal = () => {
  form.errors = {};
  emit('close');
};
</script>
