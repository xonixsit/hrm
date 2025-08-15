<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 border border-transparent',
    secondary: 'text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 border border-gray-300',
    success: 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 border border-transparent',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 border border-transparent',
    warning: 'text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 border border-transparent',
    info: 'text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500 border border-transparent'
  };
  
  // Disabled classes
  const disabledClasses = props.disabled || props.loading 
    ? 'opacity-50 cursor-not-allowed' 
    : '';
  
  return [
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    disabledClasses
  ].filter(Boolean).join(' ');
});
</script>