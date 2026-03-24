<template>
  <TransitionRoot appear :show="true" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
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
                Review Your Answers
              </DialogTitle>

              <!-- Progress Summary -->
              <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p class="text-2xl font-bold text-gray-900">{{ progress.total_questions }}</p>
                    <p class="text-sm text-gray-600">Total Questions</p>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-green-600">{{ progress.answered_questions }}</p>
                    <p class="text-sm text-gray-600">Answered</p>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-red-600">{{ unansweredCount }}</p>
                    <p class="text-sm text-gray-600">Unanswered</p>
                  </div>
                </div>
              </div>

              <!-- Warning if unanswered questions -->
              <div v-if="unansweredCount > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div class="flex items-start">
                  <svg class="h-5 w-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-yellow-800">
                      You have {{ unansweredCount }} unanswered question{{ unansweredCount > 1 ? 's' : '' }}
                    </p>
                    <p class="text-sm text-yellow-700 mt-1">
                      Unanswered questions will receive zero points.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Confirmation Message -->
              <div class="mb-6">
                <p class="text-gray-700">
                  Are you sure you want to submit your test? Once submitted, you cannot change your answers.
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end space-x-3">
                <button
                  @click="$emit('close')"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Review Answers
                </button>
                <button
                  @click="$emit('submit')"
                  class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Test
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { computed } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  answers: {
    type: Object,
    required: true
  },
  progress: {
    type: Object,
    required: true
  }
});

defineEmits(['close', 'submit']);

const unansweredCount = computed(() => {
  return props.progress.total_questions - props.progress.answered_questions;
});
</script>
