<template>
  <div class="bg-white border border-neutral-200 rounded-lg shadow-sm">
    <!-- Search Header -->
    <div class="flex items-center justify-between p-4 border-b border-neutral-200">
      <h3 class="text-lg font-semibold text-neutral-900">Advanced Employee Search</h3>
      <button
        @click="$emit('close')"
        class="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Search Form -->
    <div class="p-4 space-y-4">
      <!-- Basic Search -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Name or Email">
          <BaseInput
            v-model="filters.search"
            type="text"
            placeholder="Search by name or email..."
          />
        </FormField>

        <FormField label="Employee Code">
          <BaseInput
            v-model="filters.employee_code"
            type="text"
            placeholder="Enter employee code..."
          />
        </FormField>
      </div>

      <!-- Department and Position -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Department">
          <BaseMultiSelect
            v-model="filters.departments"
            :options="departmentOptions"
            placeholder="Select departments..."
            multiple
          />
        </FormField>

        <FormField label="Job Title">
          <BaseInput
            v-model="filters.job_title"
            type="text"
            placeholder="Search by job title..."
          />
        </FormField>
      </div>

      <!-- Employment Details -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Contract Type">
          <BaseMultiSelect
            v-model="filters.contract_types"
            :options="contractTypeOptions"
            placeholder="Select contract types..."
            multiple
          />
        </FormField>

        <FormField label="Employment Status">
          <BaseSelect
            v-model="filters.status"
            placeholder="Select status..."
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </BaseSelect>
        </FormField>

        <FormField label="Email Verified">
          <BaseSelect
            v-model="filters.email_verified"
            placeholder="Email verification..."
          >
            <option value="">All</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </BaseSelect>
        </FormField>
      </div>

      <!-- Date Ranges -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Join Date Range">
          <DateRangePicker
            v-model="filters.join_date_range"
            placeholder="Select date range..."
          />
        </FormField>

        <FormField label="Created Date Range">
          <DateRangePicker
            v-model="filters.created_date_range"
            placeholder="Select date range..."
          />
        </FormField>
      </div>

      <!-- Advanced Options -->
      <div class="border-t border-neutral-200 pt-4">
        <h4 class="text-sm font-medium text-neutral-900 mb-3">Advanced Options</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="filters.has_manager"
                type="checkbox"
                class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-neutral-700">Has assigned manager</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="filters.is_manager"
                type="checkbox"
                class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-neutral-700">Is a manager</span>
            </label>
          </div>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="filters.has_projects"
                type="checkbox"
                class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-neutral-700">Has active projects</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="filters.recent_activity"
                type="checkbox"
                class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-neutral-700">Active in last 30 days</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Sorting Options -->
      <div class="border-t border-neutral-200 pt-4">
        <h4 class="text-sm font-medium text-neutral-900 mb-3">Sort Results</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Sort By">
            <BaseSelect
              v-model="filters.sort_by"
              placeholder="Select sort field..."
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="department">Department</option>
              <option value="job_title">Job Title</option>
              <option value="join_date">Join Date</option>
              <option value="created_at">Created Date</option>
            </BaseSelect>
          </FormField>

          <FormField label="Sort Direction">
            <BaseSelect
              v-model="filters.sort_direction"
              placeholder="Select direction..."
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </BaseSelect>
          </FormField>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-between p-4 bg-neutral-50 border-t border-neutral-200">
      <div class="flex items-center space-x-2">
        <button
          @click="clearFilters"
          class="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 font-medium"
        >
          Clear All
        </button>
        <span class="text-sm text-neutral-500">{{ activeFiltersCount }} filters active</span>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 font-medium"
        >
          Cancel
        </button>
        <button
          @click="applyFilters"
          class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import FormField from '@/Components/Forms/FormField.vue'
import BaseInput from '@/Components/Base/BaseInput.vue'
import BaseSelect from '@/Components/Base/BaseSelect.vue'
import BaseMultiSelect from '@/Components/Base/BaseMultiSelect.vue'
import DateRangePicker from '@/Components/Base/DateRangePicker.vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  departments: {
    type: Array,
    default: () => []
  },
  initialFilters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'apply-filters'])

// Reactive filters
const filters = reactive({
  search: '',
  employee_code: '',
  departments: [],
  job_title: '',
  contract_types: [],
  status: '',
  email_verified: '',
  join_date_range: null,
  created_date_range: null,
  has_manager: false,
  is_manager: false,
  has_projects: false,
  recent_activity: false,
  sort_by: 'name',
  sort_direction: 'asc',
  ...props.initialFilters
})

// Options for selects
const departmentOptions = computed(() => 
  props.departments.map(dept => ({
    value: dept.id,
    label: dept.name
  }))
)

const contractTypeOptions = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Temporary', label: 'Temporary' }
]

// Count active filters
const activeFiltersCount = computed(() => {
  let count = 0
  
  if (filters.search) count++
  if (filters.employee_code) count++
  if (filters.departments.length > 0) count++
  if (filters.job_title) count++
  if (filters.contract_types.length > 0) count++
  if (filters.status) count++
  if (filters.email_verified) count++
  if (filters.join_date_range) count++
  if (filters.created_date_range) count++
  if (filters.has_manager) count++
  if (filters.is_manager) count++
  if (filters.has_projects) count++
  if (filters.recent_activity) count++
  
  return count
})

// Methods
const clearFilters = () => {
  Object.keys(filters).forEach(key => {
    if (Array.isArray(filters[key])) {
      filters[key] = []
    } else if (typeof filters[key] === 'boolean') {
      filters[key] = false
    } else {
      filters[key] = key === 'sort_by' ? 'name' : key === 'sort_direction' ? 'asc' : ''
    }
  })
}

const applyFilters = () => {
  // Remove empty values
  const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== '' && value !== null && value !== false && 
        !(Array.isArray(value) && value.length === 0)) {
      acc[key] = value
    }
    return acc
  }, {})
  
  emit('apply-filters', cleanFilters)
}
</script>