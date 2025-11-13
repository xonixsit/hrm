<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 transition-opacity bg-neutral-500 bg-opacity-75"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
        <!-- Modal header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon 
                :name="getDepartmentIcon(department.name)" 
                class="w-6 h-6 text-primary-600"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-neutral-900">{{ department.name }}</h3>
              <p class="text-sm text-neutral-500">{{ department.code || 'No code assigned' }}</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Department information -->
        <div class="space-y-6">
          <!-- Basic Info -->
          <div>
            <h4 class="text-sm font-medium text-neutral-900 mb-3">Department Information</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-neutral-500">Status:</span>
                <span :class="getStatusClasses(department.status)" class="ml-2">
                  {{ department.status || 'Active' }}
                </span>
              </div>
              <div>
                <span class="text-neutral-500">Employees:</span>
                <span class="ml-2 font-medium text-neutral-900">{{ department.employees_count || 0 }}</span>
              </div>
              <div v-if="department.location">
                <span class="text-neutral-500">Location:</span>
                <span class="ml-2 text-neutral-900">{{ department.location }}</span>
              </div>
              <div v-if="department.budget">
                <span class="text-neutral-500">Budget:</span>
                <span class="ml-2 text-neutral-900">${{ Number(department.budget).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Manager Info -->
          <div v-if="department.manager">
            <h4 class="text-sm font-medium text-neutral-900 mb-3">Department Manager</h4>
            <div class="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-green-700">
                  {{ getInitials(department.manager.user.name) }}
                </span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-neutral-900">{{ department.manager.user.name }}</p>
                <p class="text-sm text-neutral-500">{{ department.manager.job_title || 'Manager' }}</p>
                <p class="text-sm text-neutral-500">{{ department.manager.user.email }}</p>
              </div>
              <button
                @click="router.visit(route('employees.show', department.manager.id))"
                class="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Profile
              </button>
            </div>
          </div>

          <!-- Description -->
          <div v-if="department.description">
            <h4 class="text-sm font-medium text-neutral-900 mb-3">Description</h4>
            <p class="text-sm text-neutral-600 leading-relaxed">{{ department.description }}</p>
          </div>

          <!-- Employee List -->
          <div v-if="department.employees?.length > 0">
            <h4 class="text-sm font-medium text-neutral-900 mb-3">
              Department Employees ({{ department.employees.length }})
            </h4>
            <div class="max-h-48 overflow-y-auto space-y-2">
              <div 
                v-for="employee in department.employees" 
                :key="employee.id"
                class="flex items-center justify-between p-2 hover:bg-neutral-50 rounded-lg transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-neutral-600">
                      {{ getInitials(employee.user.name) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-neutral-900">{{ employee.user.name }}</p>
                    <p class="text-xs text-neutral-500">{{ employee.job_title || 'No title' }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span :class="getContractTypeClasses(employee.contract_type)">
                    {{ employee.contract_type || 'N/A' }}
                  </span>
                  <button
                    @click="router.visit(route('employees.show', employee.id))"
                    class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
            <button
              @click="$emit('close')"
              class="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Close
            </button>
            <button
              @click="router.visit(route('departments.show', department.id))"
              class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { router } from '@inertiajs/vue3'
import Icon from '@/Components/Base/Icon.vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  department: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

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

const getContractTypeClasses = (contractType) => {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
  
  switch (contractType) {
    case 'Full-time':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'Part-time':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'Contract':
      return `${baseClasses} bg-teal-100 text-teal-800`
    default:
      return `${baseClasses} bg-neutral-100 text-neutral-800`
  }
}
</script>