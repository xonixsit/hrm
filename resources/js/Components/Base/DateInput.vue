<template>
  <div class="relative">
    <input
      :value="formattedValue"
      @input="handleInput"
      type="date"
      :class="[
        'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
        error ? 'border-red-300 text-red-900' : 'border-gray-300',
        disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
      ]"
      :disabled="disabled"
      :placeholder="placeholder"
      :min="min"
      :max="max"
    />
    <div v-if="showCalendarIcon" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
      <Icon name="calendar" class="w-4 h-4 text-gray-400" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: {
    type: [String, Date, null],
    default: null
  },
  error: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  min: {
    type: String,
    default: null
  },
  max: {
    type: String,
    default: null
  },
  showCalendarIcon: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// Format date for HTML input (YYYY-MM-DD)
const formatDateForInput = (date) => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return ''
  
  // Return in YYYY-MM-DD format
  return dateObj.toISOString().split('T')[0]
}

const formattedValue = computed(() => {
  return formatDateForInput(props.modelValue)
})

const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value || null)
}
</script>