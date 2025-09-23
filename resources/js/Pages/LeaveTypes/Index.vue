<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Leave Policies"
      subtitle="Manage leave types, quotas, and approval policies"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ClipboardDocumentListIcon class="h-8 w-8 text-blue-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Leave Types</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ leaveTypes.length }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CheckCircleIcon class="h-8 w-8 text-green-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Active Policies</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ activeCount }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CalendarDaysIcon class="h-8 w-8 text-purple-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Quota Days</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ totalQuota }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <DocumentTextIcon class="h-8 w-8 text-orange-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Leave Requests</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ totalLeaves }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Leave Types Table -->
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quota
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Policies
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="relative px-6 py-3">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="leaveType in leaveTypes" :key="leaveType.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ leaveType.name }}
                        </div>
                        <div v-if="leaveType.description" class="text-sm text-gray-500">
                          {{ leaveType.description }}
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ leaveType.quota }} days
                      </div>
                      <div v-if="leaveType.carry_forward" class="text-xs text-green-600">
                        Carry forward enabled
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="space-y-1">
                        <div v-if="leaveType.requires_approval" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Requires Approval
                        </div>
                        <div v-if="leaveType.max_consecutive_days" class="text-xs text-gray-600">
                          Max {{ leaveType.max_consecutive_days }} consecutive days
                        </div>
                        <div v-if="leaveType.min_notice_days" class="text-xs text-gray-600">
                          {{ leaveType.min_notice_days }} days notice required
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ leaveType.leaves_count }} requests
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <button
                        @click="toggleStatus(leaveType)"
                        :class="{
                          'bg-green-100 text-green-800': leaveType.is_active,
                          'bg-red-100 text-red-800': !leaveType.is_active
                        }"
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80"
                      >
                        {{ leaveType.is_active ? 'Active' : 'Inactive' }}
                      </button>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center space-x-2">
                        <button
                          @click="$inertia.visit(route('leave-types.show', leaveType.id))"
                          class="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                        <button
                          @click="$inertia.visit(route('leave-types.edit', leaveType.id))"
                          class="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          v-if="leaveType.leaves_count === 0"
                          @click="deleteLeaveType(leaveType)"
                          class="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue'
import { router } from '@inertiajs/vue3'
import axios from 'axios'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  leaveTypes: Array,
  canCreate: Boolean
})

const activeCount = computed(() => {
  return props.leaveTypes.filter(type => type.is_active).length
})

const totalQuota = computed(() => {
  return props.leaveTypes.reduce((sum, type) => sum + type.quota, 0)
})

const totalLeaves = computed(() => {
  return props.leaveTypes.reduce((sum, type) => sum + type.leaves_count, 0)
})

// Breadcrumbs for consistent navigation
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Leave Policies', current: true }
])

// Header actions for consistent layout
const headerActions = computed(() => {
  const actions = []
  
  if (props.canCreate) {
    actions.push({
      id: 'add-leave-type',
      label: 'Add Leave Type',
      icon: 'plus',
      variant: 'primary',
      handler: () => router.visit(route('leave-types.create'))
    })
  }
  
  return actions
})

const toggleStatus = async (leaveType) => {
  try {
    const response = await axios.post(route('leave-types.toggle-status', leaveType.id))
    
    if (response.data.success) {
      // Update the local data
      leaveType.is_active = !leaveType.is_active
      
      // Show success message
      const status = leaveType.is_active ? 'activated' : 'deactivated'
      // You can add a notification system here
      console.log(`Leave type ${status} successfully`)
    }
  } catch (error) {
    console.error('Error toggling status:', error)
    // You can add error notification here
  }
}

const deleteLeaveType = (leaveType) => {
  if (confirm(`Are you sure you want to delete "${leaveType.name}"? This action cannot be undone.`)) {
    router.delete(route('leave-types.destroy', leaveType.id), {
      onSuccess: () => {
        // Success handled by redirect
      },
      onError: (errors) => {
        console.error('Delete failed:', errors)
      }
    })
  }
}
</script>