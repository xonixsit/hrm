<template>
  <a
    :href="href"
    :class="[
      'block p-6 rounded-lg border transition-all duration-200 hover:shadow-lg hover:scale-105',
      isDark 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    ]"
  >
    <div class="flex items-center space-x-4">
      <div :class="[
        'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
        isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-600'
      ]">
        <component :is="iconComponent" class="w-6 h-6" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 :class="[
          'text-lg font-semibold',
          isDark ? 'text-white' : 'text-gray-900'
        ]">
          {{ title }}
        </h3>
        <p :class="[
          'text-sm mt-1',
          isDark ? 'text-gray-400' : 'text-gray-500'
        ]">
          {{ description }}
        </p>
      </div>
      <svg :class="[
        'w-5 h-5 transition-transform group-hover:translate-x-1',
        isDark ? 'text-gray-400' : 'text-gray-400'
      ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </a>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme.js'

const props = defineProps({
  title: String,
  description: String,
  href: String,
  icon: String
})

const { isDark } = useTheme()

// Icon mapping
const iconComponents = {
  UserIcon: () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
  ]),
  ClockIcon: () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
  ]),
  CalendarIcon: () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
  ]),
  // Add more icons as needed
}

const iconComponent = computed(() => {
  return iconComponents[props.icon] || iconComponents.UserIcon
})
</script>