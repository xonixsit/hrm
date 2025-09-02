<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center space-x-4">
        <button
          @click="$inertia.visit(route('leave-types.show', leaveType.id))"
          class="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon class="w-5 h-5" />
        </button>
        <div>
          <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            Edit Leave Policy: {{ leaveType.name }}
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Update leave type policies and restrictions
          </p>
        </div>
      </div>
    </template>

    <div class="py-12">
      <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <form @submit.prevent="submit" class="p-6 space-y-6">
            <!-- Warning for Active Leave Type -->
            <div v-if="hasActiveRequests" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div class="flex">
                <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                <div>
                  <h3 class="text-sm font-medium text-yellow-800">
                    Active Leave Requests Exist
                  </h3>
                  <p class="text-sm text-yellow-700 mt-1">
                    This leave type has {{ activeRequestsCount }} active leave requests. 
                    Changes to policies may affect existing requests. Please review carefully.
                  </p>
                </div>
              </div>
            </div>

            <!-- Basic Information -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Annual Leave, Sick Leave"
                    required
                  />
                  <div v-if="errors.name" class="text-red-600 text-sm mt-1">{{ errors.name }}</div>
                </div>

                <div>
                  <label for="quota" class="block text-sm font-medium text-gray-700 mb-2">
                    Annual Quota (Days) <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="quota"
                    v-model.number="form.quota"
                    type="number"
                    min="0"
                    max="365"
                    class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 25"
                    required
                  />
                  <div v-if="errors.quota" class="text-red-600 text-sm mt-1">{{ errors.quota }}</div>
                  <div v-if="quotaChanged" class="text-amber-600 text-sm mt-1">
                    ⚠️ Changing quota may affect employee leave balances
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="3"
                  class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Brief description of this leave type and when it can be used..."
                ></textarea>
                <div v-if="errors.description" class="text-red-600 text-sm mt-1">{{ errors.description }}</div>
              </div>
            </div>

            <!-- Policy Settings -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Policy Settings</h3>
              
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <div class="flex items-start">
                      <input
                        id="requires_approval"
                        v-model="form.requires_approval"
                        type="checkbox"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                      />
                      <div class="ml-3">
                        <label for="requires_approval" class="block text-sm font-medium text-gray-900">
                          Requires manager approval
                        </label>
                        <p class="text-xs text-gray-500 mt-1">
                          When enabled, all requests must be approved by a manager
                        </p>
                        <div v-if="approvalChanged" class="text-amber-600 text-xs mt-1">
                          ⚠️ This will affect how future requests are processed
                        </div>
                      </div>
                    </div>

                    <div class="flex items-start">
                      <input
                        id="carry_forward"
                        v-model="form.carry_forward"
                        type="checkbox"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                      />
                      <div class="ml-3">
                        <label for="carry_forward" class="block text-sm font-medium text-gray-900">
                          Allow unused days to carry forward
                        </label>
                        <p class="text-xs text-gray-500 mt-1">
                          Unused leave days will roll over to the next year
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div class="flex items-start">
                      <input
                        id="is_active"
                        v-model="form.is_active"
                        type="checkbox"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                      />
                      <div class="ml-3">
                        <label for="is_active" class="block text-sm font-medium text-gray-900">
                          Active policy
                        </label>
                        <p class="text-xs text-gray-500 mt-1">
                          Employees can request this leave type when active
                        </p>
                        <div v-if="statusChanged && !form.is_active" class="text-red-600 text-xs mt-1">
                          ⚠️ Deactivating will prevent new leave requests
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Restrictions -->
            <div class="pb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Restrictions & Limits</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="max_consecutive_days" class="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Consecutive Days
                  </label>
                  <input
                    id="max_consecutive_days"
                    v-model.number="form.max_consecutive_days"
                    type="number"
                    min="1"
                    max="365"
                    class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 30 (leave blank for no limit)"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Maximum number of consecutive days that can be taken at once
                  </p>
                  <div v-if="errors.max_consecutive_days" class="text-red-600 text-sm mt-1">
                    {{ errors.max_consecutive_days }}
                  </div>
                  <div v-if="maxDaysChanged && form.max_consecutive_days" class="text-amber-600 text-xs mt-1">
                    ⚠️ This may affect pending leave requests exceeding {{ form.max_consecutive_days }} days
                  </div>
                </div>

                <div>
                  <label for="min_notice_days" class="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Notice Period (Days)
                  </label>
                  <input
                    id="min_notice_days"
                    v-model.number="form.min_notice_days"
                    type="number"
                    min="0"
                    max="365"
                    class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 7 (leave blank for no requirement)"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    How many days in advance employees must request this leave
                  </p>
                  <div v-if="errors.min_notice_days" class="text-red-600 text-sm mt-1">
                    {{ errors.min_notice_days }}
                  </div>
                  <div v-if="noticeChanged && form.min_notice_days" class="text-amber-600 text-xs mt-1">
                    ⚠️ Future requests will require {{ form.min_notice_days }} days advance notice
                  </div>
                </div>
              </div>
            </div>

            <!-- Change Summary -->
            <div v-if="hasChanges" class="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div class="flex">
                <InformationCircleIcon class="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                <div>
                  <h3 class="text-sm font-medium text-blue-800">
                    Changes Summary
                  </h3>
                  <div class="text-sm text-blue-700 mt-1">
                    <ul class="list-disc list-inside space-y-1">
                      <li v-if="quotaChanged">
                        Annual quota: {{ originalLeaveType.quota }} → {{ form.quota }} days
                      </li>
                      <li v-if="approvalChanged">
                        Approval requirement: {{ originalLeaveType.requires_approval ? 'Required' : 'Not required' }} → {{ form.requires_approval ? 'Required' : 'Not required' }}
                      </li>
                      <li v-if="statusChanged">
                        Status: {{ originalLeaveType.is_active ? 'Active' : 'Inactive' }} → {{ form.is_active ? 'Active' : 'Inactive' }}
                      </li>
                      <li v-if="maxDaysChanged">
                        Max consecutive days: {{ originalLeaveType.max_consecutive_days || 'No limit' }} → {{ form.max_consecutive_days || 'No limit' }}
                      </li>
                      <li v-if="noticeChanged">
                        Notice period: {{ originalLeaveType.min_notice_days || 'No requirement' }} → {{ form.min_notice_days || 'No requirement' }} days
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
              <div class="flex items-center space-x-4">
                <button
                  type="button"
                  @click="$inertia.visit(route('leave-types.show', leaveType.id))"
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  @click="resetForm"
                  :disabled="!hasChanges"
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset Changes
                </button>
              </div>
              <button
                type="submit"
                :disabled="processing || !hasChanges"
                class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ processing ? 'Updating...' : 'Update Leave Policy' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { router, useForm } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  leaveType: Object
})

// Store original values for comparison
const originalLeaveType = reactive({ ...props.leaveType })

const form = useForm({
  name: props.leaveType.name,
  quota: props.leaveType.quota,
  description: props.leaveType.description || '',
  is_active: props.leaveType.is_active,
  requires_approval: props.leaveType.requires_approval,
  max_consecutive_days: props.leaveType.max_consecutive_days,
  min_notice_days: props.leaveType.min_notice_days,
  carry_forward: props.leaveType.carry_forward,
})

// Computed properties for change detection
const quotaChanged = computed(() => form.quota !== originalLeaveType.quota)
const approvalChanged = computed(() => form.requires_approval !== originalLeaveType.requires_approval)
const statusChanged = computed(() => form.is_active !== originalLeaveType.is_active)
const maxDaysChanged = computed(() => form.max_consecutive_days !== originalLeaveType.max_consecutive_days)
const noticeChanged = computed(() => form.min_notice_days !== originalLeaveType.min_notice_days)

const hasChanges = computed(() => {
  return form.name !== originalLeaveType.name ||
         form.quota !== originalLeaveType.quota ||
         form.description !== (originalLeaveType.description || '') ||
         form.is_active !== originalLeaveType.is_active ||
         form.requires_approval !== originalLeaveType.requires_approval ||
         form.max_consecutive_days !== originalLeaveType.max_consecutive_days ||
         form.min_notice_days !== originalLeaveType.min_notice_days ||
         form.carry_forward !== originalLeaveType.carry_forward
})

const hasActiveRequests = computed(() => {
  return props.leaveType.leaves?.some(leave => leave.status === 'pending') || false
})

const activeRequestsCount = computed(() => {
  return props.leaveType.leaves?.filter(leave => leave.status === 'pending').length || 0
})

const submit = () => {
  form.put(route('leave-types.update', props.leaveType.id), {
    onSuccess: () => {
      // Success handled by redirect
    },
    onError: (errors) => {
      console.error('Validation errors:', errors)
    }
  })
}

const resetForm = () => {
  form.reset()
  form.clearErrors()
}

const { errors, processing } = form
</script>