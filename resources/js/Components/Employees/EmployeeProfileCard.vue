<template>
  <div class="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <!-- Card Header -->
    <div class="relative p-4 pb-2">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 rounded-t-lg opacity-50"></div>
      
      <!-- Employee Avatar and Basic Info -->
      <div class="relative flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm">
            <span class="text-lg font-bold text-primary-700">
              {{ getInitials(employee.user.name) }}
            </span>
          </div>
          <!-- Status indicator -->
          <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
            <div class="w-2 h-2 bg-green-600 rounded-full"></div>
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-neutral-900 truncate">{{ employee.user.name }}</h3>
          <p class="text-sm text-neutral-600 truncate">{{ employee.job_title || 'No title assigned' }}</p>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-xs text-neutral-500">{{ employee.employee_code || 'No code' }}</span>
            <span v-if="employee.user.email_verified_at" class="text-green-600" title="Verified">
              <Icon name="check-badge" class="w-3 h-3" />
            </span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex-shrink-0">
          <div class="flex items-center space-x-1">
            <button
              @click="$emit('view-employee', employee)"
              class="p-2 text-neutral-400 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
              title="View Details"
            >
              <EyeIcon class="w-4 h-4" />
            </button>
            <button
              @click="$emit('edit-employee', employee)"
              class="p-2 text-neutral-400 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
              title="Edit Employee"
            >
              <PencilIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="px-4 pb-4 space-y-3">
      <!-- Contact Information -->
      <div class="space-y-2">
        <div class="flex items-center space-x-2 text-sm">
          <Icon name="envelope" class="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <span class="text-neutral-600 truncate">{{ employee.user.email }}</span>
        </div>
        <div v-if="employee.phone" class="flex items-center space-x-2 text-sm">
          <Icon name="phone" class="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <span class="text-neutral-600">{{ employee.phone }}</span>
        </div>
      </div>

      <!-- Department and Employment Info -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <Icon name="building-office" class="w-4 h-4 text-neutral-400" />
          <span class="text-sm text-neutral-600">
            {{ employee.department?.name || 'No department' }}
          </span>
        </div>
        <span :class="getContractTypeClasses(employee.contract_type)">
          {{ employee.contract_type || 'N/A' }}
        </span>
      </div>

      <!-- Employment Duration -->
      <div class="flex items-center space-x-2 text-sm">
        <Icon name="calendar" class="w-4 h-4 text-neutral-400" />
        <span class="text-neutral-600">
          Joined {{ formatDate(employee.join_date) }}
        </span>
        <span class="text-neutral-400">•</span>
        <span class="text-neutral-500">
          {{ getTimeWithCompany(employee.join_date) }}
        </span>
      </div>

      <!-- Skills/Tags (if available) -->
      <div v-if="employee.skills?.length > 0" class="flex flex-wrap gap-1">
        <span 
          v-for="skill in employee.skills.slice(0, 3)" 
          :key="skill"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700"
        >
          {{ skill }}
        </span>
        <span 
          v-if="employee.skills.length > 3"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500"
        >
          +{{ employee.skills.length - 3 }}
        </span>
      </div>

      <!-- Performance Indicator (if available) -->
      <div v-if="employee.performance_score" class="flex items-center justify-between">
        <span class="text-sm text-neutral-600">Performance</span>
        <div class="flex items-center space-x-2">
          <div class="w-16 bg-neutral-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full"
              :class="getPerformanceColor(employee.performance_score)"
              :style="{ width: `${employee.performance_score}%` }"
            ></div>
          </div>
          <span class="text-sm font-medium text-neutral-700">{{ employee.performance_score }}%</span>
        </div>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="px-4 py-3 bg-neutral-50 border-t border-neutral-200 rounded-b-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4 text-xs text-neutral-500">
          <span>ID: {{ employee.id }}</span>
          <span>Updated {{ getTimeAgo(employee.updated_at) }}</span>
        </div>
        <button
          @click="$emit('view-employee', employee)"
          class="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          View Profile →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/Components/Base/Icon.vue'
import { EyeIcon, PencilIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  employee: {
    type: Object,
    required: true
  }
})

defineEmits(['view-employee', 'edit-employee'])

// Methods
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getContractTypeClasses = (contractType) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  
  switch (contractType) {
    case 'Full-time':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'Part-time':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'Contract':
      return `${baseClasses} bg-teal-100 text-teal-800`
    case 'Temporary':
      return `${baseClasses} bg-purple-100 text-purple-800`
    default:
      return `${baseClasses} bg-neutral-100 text-neutral-800`
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getTimeWithCompany = (joinDate) => {
  if (!joinDate) return 'N/A'
  
  const join = new Date(joinDate)
  const now = new Date()
  const diffTime = Math.abs(now - join)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months === 1 ? '' : 's'}`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} year${years === 1 ? '' : 's'}`
  }
}

const getTimeAgo = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 1) {
    return 'today'
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}w ago`
  } else {
    const months = Math.floor(diffDays / 30)
    return `${months}mo ago`
  }
}

const getPerformanceColor = (score) => {
  if (score >= 90) return 'bg-green-500'
  if (score >= 80) return 'bg-teal-500'
  if (score >= 70) return 'bg-yellow-500'
  if (score >= 60) return 'bg-orange-500'
  return 'bg-red-500'
}
</script>