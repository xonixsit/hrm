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
          <SimpleInfoCard
            title="Total Leave Types"
            :value="leaveTypes.length"
            icon="clipboard-document-list"
            color="primary"
          />
          <SimpleInfoCard
            title="Active Policies"
            :value="activeCount"
            icon="check-circle"
            color="success"
          />
          <SimpleInfoCard
            title="Total Quota Days"
            :value="totalQuota"
            icon="calendar-days"
            color="info"
          />
          <SimpleInfoCard
            title="Leave Requests"
            :value="totalLeaves"
            icon="document-text"
            color="warning"
          />
        </div>

        <!-- Leave Types Table -->
        <ContentCard title="Leave Policies" subtitle="Manage and configure leave types">
          <template #actions>
            <div class="flex items-center space-x-3">
              <button
                @click="exportPolicies"
                class="inline-flex items-center px-3 py-2 border border-neutral-300 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </template>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-200">
              <thead class="bg-neutral-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Quota & Settings
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Policies
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-neutral-200">
                <tr v-for="leaveType in leaveTypes" :key="leaveType.id" class="hover:bg-neutral-50 transition-colors duration-150">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <CalendarDaysIcon class="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-neutral-900">
                          {{ leaveType.name }}
                        </div>
                        <div v-if="leaveType.description" class="text-sm text-neutral-500 max-w-xs truncate">
                          {{ leaveType.description }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-neutral-900 font-medium">
                      {{ leaveType.quota }} days/year
                    </div>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <span v-if="leaveType.carry_forward" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800">
                        Carry Forward
                      </span>
                      <span v-if="leaveType.max_consecutive_days" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-info-100 text-info-800">
                        Max {{ leaveType.max_consecutive_days }}d
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="space-y-1">
                      <div v-if="leaveType.requires_approval" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                        <ShieldCheckIcon class="w-3 h-3 mr-1" />
                        Requires Approval
                      </div>
                      <div v-if="leaveType.min_notice_days" class="text-xs text-neutral-600 flex items-center">
                        <ClockIcon class="w-3 h-3 mr-1" />
                        {{ leaveType.min_notice_days }} days notice
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-neutral-900">
                      {{ leaveType.leaves_count }}
                    </div>
                    <div class="text-xs text-neutral-500">
                      requests
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <button
                      @click="toggleStatus(leaveType)"
                      :class="{
                        'bg-success-100 text-success-800 hover:bg-success-200': leaveType.is_active,
                        'bg-neutral-100 text-neutral-800 hover:bg-neutral-200': !leaveType.is_active
                      }"
                      class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <div :class="{
                        'bg-success-400': leaveType.is_active,
                        'bg-neutral-400': !leaveType.is_active
                      }" class="w-1.5 h-1.5 rounded-full mr-2"></div>
                      {{ leaveType.is_active ? 'Active' : 'Inactive' }}
                    </button>
                  </td>
                  <td class="px-6 py-4 text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <button
                        @click="$inertia.visit(route('leave-types.show', leaveType.id))"
                        class="text-primary-600 hover:text-primary-900 transition-colors duration-150"
                        title="View Details"
                      >
                        <EyeIcon class="w-4 h-4" />
                      </button>
                      <button
                        @click="$inertia.visit(route('leave-types.edit', leaveType.id))"
                        class="text-info-600 hover:text-info-900 transition-colors duration-150"
                        title="Edit Policy"
                      >
                        <PencilIcon class="w-4 h-4" />
                      </button>
                      <button
                        v-if="leaveType.leaves_count === 0"
                        @click="deleteLeaveType(leaveType)"
                        class="text-error-600 hover:text-error-900 transition-colors duration-150"
                        title="Delete Policy"
                      >
                        <TrashIcon class="w-4 h-4" />
                      </button>
                      <span v-else class="text-neutral-400" title="Cannot delete - has associated leave requests">
                        <TrashIcon class="w-4 h-4" />
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="leaveTypes.length === 0" class="text-center py-12">
            <CalendarDaysIcon class="mx-auto h-12 w-12 text-neutral-400" />
            <h3 class="mt-2 text-sm font-medium text-neutral-900">No leave policies</h3>
            <p class="mt-1 text-sm text-neutral-500">Get started by creating your first leave policy.</p>
            <div class="mt-6">
              <button
                v-if="canCreate"
                @click="$inertia.visit(route('leave-types.create'))"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon class="w-4 h-4 mr-2" />
                Create Leave Policy
              </button>
            </div>
          </div>
        </ContentCard>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue'
import { router } from '@inertiajs/vue3'
import axios from 'axios'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import SimpleInfoCard from '@/Components/UI/SimpleInfoCard.vue'
import ContentCard from '@/Components/Layout/ContentCard.vue'
import {
  PlusIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon
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
      //console.log(`Leave type ${status} successfully`)
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

const exportPolicies = () => {
  // Export functionality - could be implemented to download CSV/PDF
  //console.log('Export policies functionality')
}
</script>