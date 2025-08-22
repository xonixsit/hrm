<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="close">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            >
              <div class="sm:flex sm:items-start">
                <div
                  v-if="icon"
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
                  :class="iconContainerClass"
                >
                  <component :is="icon" class="h-6 w-6" :class="iconClass" aria-hidden="true" />
                </div>
                <div :class="{ 'sm:ml-4 sm:mt-0.5': icon, 'mt-3 text-center sm:mt-0 sm:text-left': !icon }">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    {{ title }}
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      {{ message }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  class="inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  :class="confirmButtonClass"
                  @click="confirm"
                >
                  {{ confirmButtonText }}
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  @click="close"
                  ref="cancelButtonRef"
                >
                  {{ cancelButtonText }}
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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Are you sure?',
  },
  message: {
    type: String,
    default: 'This action cannot be undone.',
  },
  confirmButtonText: {
    type: String,
    default: 'Confirm',
  },
  confirmButtonVariant: {
    type: String,
    default: 'danger', // 'danger', 'primary', 'success', 'warning'
    validator: (value) => ['danger', 'primary', 'success', 'warning'].includes(value),
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel',
  },
  icon: {
    type: String,
    default: 'exclamation', // 'exclamation', 'info', or null for no icon
    validator: (value) => ['exclamation', 'info', null].includes(value),
  },
});

const emit = defineEmits(['confirm', 'cancel', 'update:show']);

const iconMap = {
  exclamation: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const icon = computed(() => props.icon ? iconMap[props.icon] : null);

const confirmButtonClass = computed(() => {
  const base = 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500';
  const variants = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  };
  return variants[props.confirmButtonVariant] || base;
});

const iconContainerClass = computed(() => {
  const variants = {
    danger: 'bg-red-100',
    primary: 'bg-primary-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
  };
  return variants[props.confirmButtonVariant] || 'bg-gray-100';
});

const iconClass = computed(() => {
  const variants = {
    danger: 'text-red-600',
    primary: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  };
  return variants[props.confirmButtonVariant] || 'text-gray-600';
});

const close = () => {
  emit('update:show', false);
  emit('cancel');
};

const confirm = () => {
  emit('confirm');
  close();
};

// Handle escape key
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.show) {
    close();
  }
};

// Add event listeners when component is mounted
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>
