<template>
  <EmptyState
    :title="title"
    :description="description"
    :icon="icon"
    :actions="actions"
    :size="size"
    :variant="variant"
    :class="customClass"
    empty-type="no-data"
    @action="handleAction"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
    
    <template v-if="$slots.default">
      <slot />
    </template>
    
    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
  </EmptyState>
</template>

<script setup>
import EmptyState from './EmptyState.vue'

const props = defineProps({
  /**
   * Custom title for the no data state
   */
  title: {
    type: String,
    default: ''
  },
  
  /**
   * Custom description for the no data state
   */
  description: {
    type: String,
    default: ''
  },
  
  /**
   * Icon to display
   */
  icon: {
    type: String,
    default: 'document-text'
  },
  
  /**
   * Actions to display
   */
  actions: {
    type: Array,
    default: () => []
  },
  
  /**
   * Size variant
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  /**
   * Visual variant
   */
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'illustration'].includes(value)
  },
  
  /**
   * Additional CSS classes
   */
  class: {
    type: [String, Array, Object],
    default: ''
  }
})

const emit = defineEmits(['action'])

// Computed
const customClass = computed(() => [
  'no-data-state',
  props.class
])

// Methods
const handleAction = (action) => {
  emit('action', action)
}
</script>

<style scoped>
.no-data-state {
  /* Additional styling specific to no-data state if needed */
}
</style>