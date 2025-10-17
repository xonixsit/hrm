<template>
  <footer :class="[
    'mt-auto border-t transition-all duration-200',
    isDark 
      ? 'bg-gray-800/50 border-gray-700/50' 
      : 'bg-white/80 border-gray-200/60'
  ]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <!-- Left side - Logo and company info -->
        <div class="flex items-center space-x-3">
          <ETaxPlannerLogo className="h-8 w-auto" />
        </div>

        <!-- Center - Links -->
        <div class="flex items-center space-x-6">
          <a :href="route('dashboard')" :class="[
            'text-sm hover:underline transition-colors',
            isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          ]">
            Dashboard
          </a>
          <a href="#" :class="[
            'text-sm hover:underline transition-colors',
            isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          ]">
            Support
          </a>
          <a href="#" :class="[
            'text-sm hover:underline transition-colors',
            isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          ]">
            Privacy
          </a>
        </div>

        <!-- Right side - Copyright -->
        <div :class="[
          'text-sm',
          isDark ? 'text-gray-400' : 'text-gray-500'
        ]">
          © {{ currentYear }} eTaxPlanner. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme.js'
import ETaxPlannerLogo from '@/Components/UI/ETaxPlannerLogo.vue'

const { isDark } = useTheme()

const currentYear = computed(() => new Date().getFullYear())
</script>