<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @before-enter="onBeforeEnter"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="show"
        class="modal-overlay"
        @click="handleOverlayClick"
      >
        <Transition
          name="modal-content"
          appear
        >
          <div
            v-if="show"
            class="modal-content"
            :class="contentClass"
            @click.stop
          >
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted } from 'vue';
import { prefersReducedMotion } from '@/utils/animations';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  contentClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'opened', 'closed']);

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    emit('close');
  }
};

const onBeforeEnter = () => {
  document.body.style.overflow = 'hidden';
  nextTick(() => {
    emit('opened');
  });
};

const onAfterLeave = () => {
  document.body.style.overflow = '';
  emit('closed');
};

// Handle escape key
const handleEscape = (e) => {
  if (e.key === 'Escape' && props.show) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

/* Modal overlay transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-normal) var(--easing-ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Modal content transitions */
.modal-content-enter-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.modal-content-leave-active {
  transition: all var(--duration-fast) var(--easing-ease-in);
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-content-enter-active,
  .modal-content-leave-active {
    transition: none !important;
  }
  
  .modal-content-enter-from,
  .modal-content-leave-to {
    transform: none !important;
  }
}
</style>