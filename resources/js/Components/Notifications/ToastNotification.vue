<template>
  <Teleport to="body">
    <div
      v-if="visible"
      :class="toastClasses"
      :style="toastStyle"
      role="alert"
      :aria-live="priority === 'high' ? 'assertive' : 'polite'"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <!-- Toast Content -->
      <div class="toast-content">
        <!-- Icon -->
        <div v-if="showIcon" class="toast-icon">
          <component :is="iconComponent" :class="iconClasses" />
        </div>

        <!-- Message Content -->
        <div class="toast-message">
          <div v-if="title" class="toast-title">{{ title }}</div>
          <div class="toast-text">
            <slot>{{ message }}</slot>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="showActions" class="toast-actions">
          <button
            v-if="actionText"
            @click="handleAction"
            class="toast-action-button"
          >
            {{ actionText }}
          </button>
          
          <button
            v-if="closable"
            @click="close"
            class="toast-close-button"
            :aria-label="closeLabel"
          >
            <component :is="closeIcon" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div
        v-if="showProgress && duration > 0"
        class="toast-progress"
        :class="progressClasses"
        :style="progressStyle"
      ></div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { getIcon } from '@/config/icons'

const props = defineProps({
  /**
   * Toast message
   */
  message: {
    type: String,
    required: true
  },

  /**
   * Toast title
   */
  title: {
    type: String,
    default: ''
  },

  /**
   * Toast type/variant
   */
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info', 'loading'].includes(value)
  },

  /**
   * Toast position
   */
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => [
      'top-left', 'top-center', 'top-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    ].includes(value)
  },

  /**
   * Auto-dismiss duration in milliseconds (0 = no auto-dismiss)
   */
  duration: {
    type: Number,
    default: 5000
  },

  /**
   * Toast priority for screen readers
   */
  priority: {
    type: String,
    default: 'normal',
    validator: (value) => ['low', 'normal', 'high'].includes(value)
  },

  /**
   * Show close button
   */
  closable: {
    type: Boolean,
    default: true
  },

  /**
   * Show icon
   */
  showIcon: {
    type: Boolean,
    default: true
  },

  /**
   * Show progress bar
   */
  showProgress: {
    type: Boolean,
    default: true
  },

  /**
   * Action button text
   */
  actionText: {
    type: String,
    default: ''
  },

  /**
   * Custom icon
   */
  icon: {
    type: String,
    default: ''
  },

  /**
   * Toast size
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },

  /**
   * Enable sound notification
   */
  sound: {
    type: Boolean,
    default: false
  },

  /**
   * Persistent toast (no auto-dismiss)
   */
  persistent: {
    type: Boolean,
    default: false
  },

  /**
   * Z-index for stacking
   */
  zIndex: {
    type: Number,
    default: 1000
  },

  /**
   * Close button label for accessibility
   */
  closeLabel: {
    type: String,
    default: 'Close notification'
  }
})

const emit = defineEmits(['close', 'action'])

// Local state
const visible = ref(false)
const timer = ref(null)
const progressTimer = ref(null)
const progressWidth = ref(100)
const isPaused = ref(false)
const startTime = ref(0)
const remainingTime = ref(0)

// Icons
const closeIcon = computed(() => getIcon('x-mark'))
const iconComponent = computed(() => {
  if (props.icon) return getIcon(props.icon)
  
  const iconMap = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'exclamation-triangle',
    info: 'information-circle',
    loading: 'loading'
  }
  
  return getIcon(iconMap[props.type] || iconMap.info)
})

// Computed properties
const toastClasses = computed(() => [
  'toast-notification',
  `toast-notification--${props.type}`,
  `toast-notification--${props.size}`,
  `toast-notification--${props.position}`,
  {
    'toast-notification--with-title': props.title,
    'toast-notification--persistent': props.persistent,
    'toast-notification--with-action': props.actionText
  }
])

const toastStyle = computed(() => ({
  zIndex: props.zIndex
}))

const iconClasses = computed(() => [
  'w-5 h-5',
  {
    'animate-spin': props.type === 'loading'
  }
])

const showActions = computed(() => props.closable || props.actionText)

const progressClasses = computed(() => [
  `toast-progress--${props.type}`
])

const progressStyle = computed(() => ({
  width: `${progressWidth.value}%`
}))

// Methods
const show = () => {
  visible.value = true
  
  if (props.sound) {
    playNotificationSound()
  }
  
  if (!props.persistent && props.duration > 0) {
    startTimer()
  }
}

const close = () => {
  visible.value = false
  clearTimers()
  emit('close')
}

const handleAction = () => {
  emit('action')
  if (!props.persistent) {
    close()
  }
}

const startTimer = () => {
  if (props.duration <= 0) return
  
  startTime.value = Date.now()
  remainingTime.value = props.duration
  
  timer.value = setTimeout(() => {
    close()
  }, props.duration)
  
  startProgressAnimation()
}

const startProgressAnimation = () => {
  if (!props.showProgress) return
  
  const startTime = Date.now()
  const animate = () => {
    if (!visible.value || isPaused.value) return
    
    const elapsed = Date.now() - startTime
    const progress = Math.max(0, 100 - (elapsed / props.duration) * 100)
    progressWidth.value = progress
    
    if (progress > 0) {
      progressTimer.value = requestAnimationFrame(animate)
    }
  }
  
  animate()
}

const pauseTimer = () => {
  if (!timer.value || props.persistent) return
  
  isPaused.value = true
  clearTimeout(timer.value)
  cancelAnimationFrame(progressTimer.value)
  
  const elapsed = Date.now() - startTime.value
  remainingTime.value = Math.max(0, props.duration - elapsed)
}

const resumeTimer = () => {
  if (!isPaused.value || props.persistent) return
  
  isPaused.value = false
  
  if (remainingTime.value > 0) {
    startTime.value = Date.now()
    timer.value = setTimeout(() => {
      close()
    }, remainingTime.value)
    
    startProgressAnimation()
  }
}

const clearTimers = () => {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
  
  if (progressTimer.value) {
    cancelAnimationFrame(progressTimer.value)
    progressTimer.value = null
  }
}

const playNotificationSound = () => {
  try {
    const audio = new Audio()
    const soundMap = {
      success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
      error: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
      warning: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
      info: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    }
    
    audio.src = soundMap[props.type] || soundMap.info
    audio.volume = 0.3
    audio.play().catch(() => {
      // Ignore audio play errors (user interaction required)
    })
  } catch (error) {
    // Ignore audio errors
  }
}

// Lifecycle
onMounted(() => {
  show()
})

onUnmounted(() => {
  clearTimers()
})

// Watch for duration changes
watch(() => props.duration, () => {
  if (visible.value && !props.persistent) {
    clearTimers()
    startTimer()
  }
})

// Expose methods for external control
defineExpose({
  show,
  close,
  pauseTimer,
  resumeTimer
})
</script>

<style scoped>
/* Toast Container */
.toast-notification {
  @apply fixed max-w-sm w-full bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden transform transition-all duration-300 ease-out;
}

/* Position Variants */
.toast-notification--top-left {
  @apply top-4 left-4;
}

.toast-notification--top-center {
  @apply top-4 left-1/2 transform -translate-x-1/2;
}

.toast-notification--top-right {
  @apply top-4 right-4;
}

.toast-notification--bottom-left {
  @apply bottom-4 left-4;
}

.toast-notification--bottom-center {
  @apply bottom-4 left-1/2 transform -translate-x-1/2;
}

.toast-notification--bottom-right {
  @apply bottom-4 right-4;
}

/* Size Variants */
.toast-notification--sm {
  @apply max-w-xs text-sm;
}

.toast-notification--md {
  @apply max-w-sm;
}

.toast-notification--lg {
  @apply max-w-md text-lg;
}

/* Type Variants */
.toast-notification--success {
  @apply border-l-4 border-success-500;
}

.toast-notification--error {
  @apply border-l-4 border-error-500;
}

.toast-notification--warning {
  @apply border-l-4 border-warning-500;
}

.toast-notification--info {
  @apply border-l-4 border-info-500;
}

.toast-notification--loading {
  @apply border-l-4 border-primary-500;
}

/* Toast Content */
.toast-content {
  @apply flex items-start p-4 space-x-3;
}

.toast-icon {
  @apply flex-shrink-0 mt-0.5;
}

.toast-notification--success .toast-icon {
  @apply text-success-600;
}

.toast-notification--error .toast-icon {
  @apply text-error-600;
}

.toast-notification--warning .toast-icon {
  @apply text-warning-600;
}

.toast-notification--info .toast-icon {
  @apply text-info-600;
}

.toast-notification--loading .toast-icon {
  @apply text-primary-600;
}

.toast-message {
  @apply flex-1 min-w-0;
}

.toast-title {
  @apply font-semibold text-neutral-900 mb-1;
}

.toast-text {
  @apply text-neutral-700 leading-relaxed;
}

.toast-notification--sm .toast-title {
  @apply text-sm;
}

.toast-notification--sm .toast-text {
  @apply text-xs;
}

.toast-notification--lg .toast-title {
  @apply text-lg;
}

.toast-notification--lg .toast-text {
  @apply text-base;
}

/* Toast Actions */
.toast-actions {
  @apply flex items-start space-x-2 ml-auto;
}

.toast-action-button {
  @apply text-sm font-medium text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50 transition-colors;
}

.toast-close-button {
  @apply text-neutral-400 hover:text-neutral-600 p-1 rounded hover:bg-neutral-100 transition-colors;
}

/* Progress Bar */
.toast-progress {
  @apply h-1 transition-all duration-100 ease-linear;
}

.toast-progress--success {
  @apply bg-success-500;
}

.toast-progress--error {
  @apply bg-error-500;
}

.toast-progress--warning {
  @apply bg-warning-500;
}

.toast-progress--info {
  @apply bg-info-500;
}

.toast-progress--loading {
  @apply bg-primary-500;
}

/* Dark Theme */
.theme-dark .toast-notification {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .toast-title {
  @apply text-neutral-100;
}

.theme-dark .toast-text {
  @apply text-neutral-300;
}

.theme-dark .toast-close-button {
  @apply text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700;
}

.theme-dark .toast-action-button {
  @apply hover:bg-primary-900;
}

/* Animations */
.toast-notification {
  animation: toast-slide-in 0.3s ease-out;
}

@keyframes toast-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-notification--top-left,
.toast-notification--bottom-left {
  animation: toast-slide-in-left 0.3s ease-out;
}

@keyframes toast-slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-notification--top-center,
.toast-notification--bottom-center {
  animation: toast-slide-in-center 0.3s ease-out;
}

@keyframes toast-slide-in-center {
  from {
    transform: translateX(-50%) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .toast-notification {
    @apply left-4 right-4 max-w-none;
  }
  
  .toast-notification--top-center,
  .toast-notification--bottom-center {
    @apply left-4 right-4 transform-none;
  }
  
  .toast-content {
    @apply p-3;
  }
  
  .toast-notification--sm .toast-content {
    @apply p-2;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .toast-notification {
    animation: none;
    @apply transition-none;
  }
  
  .toast-progress {
    @apply transition-none;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .toast-notification {
    @apply border-2 border-neutral-900;
  }
  
  .toast-notification--success {
    @apply border-l-8 border-success-600;
  }
  
  .toast-notification--error {
    @apply border-l-8 border-error-600;
  }
  
  .toast-notification--warning {
    @apply border-l-8 border-warning-600;
  }
  
  .toast-notification--info {
    @apply border-l-8 border-info-600;
  }
}

/* Focus States */
.toast-action-button:focus,
.toast-close-button:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2;
}

/* Hover Effects */
.toast-notification:hover .toast-progress {
  animation-play-state: paused;
}
</style>