<template>
  <div 
    class="department-node cursor-pointer transform transition-all duration-200 hover:scale-105"
    :class="nodeClasses"
    @click="$emit('node-click', department)"
  >
    <!-- Department Card -->
    <div class="bg-white rounded-lg border-2 shadow-sm p-4 min-w-[200px]">
      <!-- Department Header -->
      <div class="flex items-center space-x-3 mb-3">
        <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon 
            :name="getDepartmentIcon(department.name)" 
            class="w-5 h-5 text-primary-600"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-neutral-900 truncate">{{ department.name }}</h3>
          <p class="text-sm text-neutral-500 truncate">{{ department.code || 'No code' }}</p>
        </div>
      </div>

      <!-- Manager Information -->
      <div v-if="department.manager && (viewMode === 'employees' || viewMode === 'mixed')" class="mb-3">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <span class="text-xs font-medium text-green-700">
              {{ getInitials(department.manager.user.name) }}
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-neutral-900 truncate">{{ department.manager.user.name }}</p>
            <p class="text-xs text-neutral-500 truncate">{{ department.manager.job_title || 'Manager' }}</p>
          </div>
        </div>
      </div>

      <!-- Department Stats -->
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center space-x-1">
          <UsersIcon class="w-4 h-4 text-neutral-400" />
          <span class="text-neutral-600">{{ department.employees_count || 0 }}</span>
        </div>
        <div class="flex items-center space-x-1">
          <span :class="getStatusClasses(department.status)">
            {{ department.status || 'Active' }}
          </span>
        </div>
      </div>

      <!-- Employee List (for mixed/employee view) -->
      <div v-if="viewMode === 'employees' && department.employees?.length > 0" class="mt-3 pt-3 border-t border-neutral-200">
        <div class="space-y-2 max-h-32 overflow-y-auto">
          <div 
            v-for="employee in department.employees.slice(0, 5)" 
            :key="employee.id"
            class="flex items-center space-x-2"
          >
            <div class="w-5 h-5 bg-neutral-200 rounded-full flex items-center justify-center">
              <span class="text-xs font-medium text-neutral-600">
                {{ getInitials(employee.user.name) }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-neutral-900 truncate">{{ employee.user.name }}</p>
              <p class="text-xs text-neutral-500 truncate">{{ employee.job_title || 'No title' }}</p>
            </div>
          </div>
          <div v-if="department.employees.length > 5" class="text-xs text-neutral-500 text-center">
            +{{ department.employees.length - 5 }} more
          </div>
        </div>
      </div>
    </div>

    <!-- Connection Point (for drawing lines) -->
    <div class="connection-point absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-neutral-300 rounded-full border-2 border-white"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/Components/Base/Icon.vue'
import { UsersIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  department: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'departments'
  },
  isRoot: {
    type: Boolean,
    default: false
  }
})

defineEmits(['node-click'])

// Computed properties
const nodeClasses = computed(() => {
  const classes = []
  
  if (props.isRoot) {
    classes.push('border-primary-300 bg-primary-50')
  }
  
  return classes.join(' ')
})

// Methods
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getDepartmentIcon = (departmentName) => {
  const iconMap = {
    'Engineering': 'code-bracket',
    'Marketing': 'megaphone',
    'Sales': 'chart-bar',
    'HR': 'users',
    'Finance': 'currency-dollar',
    'Operations': 'cog',
    'Support': 'lifebuoy',
    'Legal': 'scale',
    'Design': 'paint-brush',
    'Product': 'light-bulb'
  }
  
  return iconMap[departmentName] || 'building-office'
}

const getStatusClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
  
  switch (status?.toLowerCase()) {
    case 'active':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'inactive':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'restructuring':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    default:
      return `${baseClasses} bg-green-100 text-green-800`
  }
}
</script>

<style scoped>
.department-node {
  position: relative;
}

.connection-point {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.department-node:hover .connection-point {
  opacity: 1;
}
</style>