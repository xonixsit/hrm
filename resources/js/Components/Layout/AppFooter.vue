<template>
  <footer :class="[
    'mt-auto border-t transition-all duration-200',
    isDark 
      ? 'bg-gray-800/50 border-gray-700/50' 
      : 'bg-white/80 border-gray-200/60'
  ]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <!-- Left side - Logo -->
        <div class="flex items-center space-x-2">
          <div class="flex items-center space-x-1">
            <!-- Building Icon -->
            <div class="w-6 h-8 bg-blue-500 rounded-sm flex flex-col justify-center items-center">
              <div class="w-4 h-0.5 bg-white mb-0.5 rounded-sm"></div>
              <div class="w-4 h-0.5 bg-white mb-0.5 rounded-sm"></div>
              <div class="w-4 h-0.5 bg-white mb-0.5 rounded-sm"></div>
              <div class="w-4 h-0.5 bg-white rounded-sm"></div>
            </div>
            <!-- Person Circle -->
            <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center -ml-1">
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div>
            <div :class="[
              'text-sm font-semibold',
              isDark ? 'text-white' : 'text-gray-900'
            ]">
              E-Tax Planner
            </div>
          </div>
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

const { isDark } = useTheme()

const currentYear = computed(() => new Date().getFullYear())
</script>