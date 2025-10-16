<template>
  <div class="bg-white overflow-hidden shadow-sm rounded-lg">
    <div class="p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <component :is="iconComponent" :class="iconClasses" />
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-neutral-500">{{ title }}</p>
          <p class="text-2xl font-semibold text-neutral-900">{{ value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import {
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    UserGroupIcon,
    ChartBarIcon
  } from '@heroicons/vue/24/outline'

  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    icon: {
      type: String,
      default: 'chart-bar'
    },
    color: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'success', 'info', 'warning', 'error'].includes(value)
    }
  })

  const iconComponents = {
    'clipboard-document-list': ClipboardDocumentListIcon,
    'check-circle': CheckCircleIcon,
    'calendar-days': CalendarDaysIcon,
    'document-text': DocumentTextIcon,
    'user-group': UserGroupIcon,
    'chart-bar': ChartBarIcon
  }

  const iconComponent = computed(() => {
    return iconComponents[props.icon] || ChartBarIcon
  })

  const iconClasses = computed(() => {
    const colorClasses = {
      primary: 'h-8 w-8 text-primary-500',
      success: 'h-8 w-8 text-success-500',
      info: 'h-8 w-8 text-info-500',
      warning: 'h-8 w-8 text-warning-500',
      error: 'h-8 w-8 text-error-500'
    }

    return colorClasses[props.color] || colorClasses.primary
  })
</script>