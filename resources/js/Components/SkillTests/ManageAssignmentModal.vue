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
                Manage Assignment
              </DialogTitle>

              <div class="space-y-4">
                <p class="text-sm text-gray-600">
                  This modal is for managing test assignments. You can view and edit assignment details here.
                </p>

                <!-- Assignment details would go here -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm text-gray-500">Assignment management interface</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end space-x-3 mt-6">
                <button
                  @click="closeModal"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  assignment: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>
