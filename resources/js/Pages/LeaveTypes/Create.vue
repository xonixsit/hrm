<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Create Leave Policy"
      subtitle="Define a new leave type with policies and quotas"
      :breadcrumbs="breadcrumbs"
    >
      <ContentCard>
        <form @submit.prevent="submit" class="space-y-8">
          <!-- Basic Information -->
          <ContentSection title="Basic Information" subtitle="Define the leave type name, quota, and description">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="name" class="block text-sm font-medium text-neutral-700 mb-2">
                  Leave Type Name <span class="text-error-500">*</span>
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="w-full border border-neutral-300 rounded-md shadow-sm px-3 py-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150"
                  placeholder="e.g., Annual Leave, Sick Leave"
                  required
                />
                <div v-if="errors.name" class="text-error-600 text-sm mt-1 flex items-center">
                  <ExclamationCircleIcon class="w-4 h-4 mr-1" />
                  {{ errors.name }}
                </div>
              </div>

              <div>
                <label for="quota" class="block text-sm font-medium text-neutral-700 mb-2">
                  Annual Quota (Days) <span class="text-error-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="quota"
                    v-model.number="form.quota"
                    type="number"
                    min="0"
                    max="365"
                    class="w-full border border-neutral-300 rounded-md shadow-sm px-3 py-2 pr-12 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150"
                    placeholder="25"
                    required
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span class="text-neutral-500 text-sm">days</span>
                  </div>
                </div>
                <div v-if="errors.quota" class="text-error-600 text-sm mt-1 flex items-center">
                  <ExclamationCircleIcon class="w-4 h-4 mr-1" />
                  {{ errors.quota }}
                </div>
              </div>
            </div>

            <div class="mt-6">
              <label for="description" class="block text-sm font-medium text-neutral-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                v-model="form.description"
                rows="3"
                class="w-full border border-neutral-300 rounded-md shadow-sm px-3 py-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150"
                placeholder="Brief description of this leave type and when it can be used..."
              ></textarea>
              <p class="text-xs text-neutral-500 mt-1">Optional: Provide context for when this leave type should be used</p>
              <div v-if="errors.description" class="text-error-600 text-sm mt-1 flex items-center">
                <ExclamationCircleIcon class="w-4 h-4 mr-1" />
                {{ errors.description }}
              </div>
            </div>
          </ContentSection>

          <!-- Policy Settings -->
          <ContentSection title="Policy Settings" subtitle="Configure approval requirements and carry-forward rules">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-6">
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      id="requires_approval"
                      v-model="form.requires_approval"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors duration-150"
                    />
                  </div>
                  <div class="ml-3">
                    <label for="requires_approval" class="text-sm font-medium text-neutral-900">
                      Requires manager approval
                    </label>
                    <p class="text-xs text-neutral-500 mt-1">
                      When enabled, all leave requests must be approved by a manager before being granted
                    </p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      id="carry_forward"
                      v-model="form.carry_forward"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors duration-150"
                    />
                  </div>
                  <div class="ml-3">
                    <label for="carry_forward" class="text-sm font-medium text-neutral-900">
                      Allow carry forward
                    </label>
                    <p class="text-xs text-neutral-500 mt-1">
                      Unused leave days will roll over to the next year
                    </p>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      id="is_active"
                      v-model="form.is_active"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors duration-150"
                    />
                  </div>
                  <div class="ml-3">
                    <label for="is_active" class="text-sm font-medium text-neutral-900">
                      Active policy
                    </label>
                    <p class="text-xs text-neutral-500 mt-1">
                      Employees can request this leave type when active
                    </p>
                  </div>
                </div>

                <!-- Policy Preview -->
                <div class="bg-neutral-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-neutral-900 mb-2">Policy Preview</h4>
                  <div class="space-y-1 text-xs text-neutral-600">
                    <div class="flex items-center">
                      <CheckIcon v-if="form.requires_approval" class="w-3 h-3 text-success-500 mr-2" />
                      <XMarkIcon v-else class="w-3 h-3 text-neutral-400 mr-2" />
                      <span>{{ form.requires_approval ? 'Requires approval' : 'Auto-approved' }}</span>
                    </div>
                    <div class="flex items-center">
                      <CheckIcon v-if="form.carry_forward" class="w-3 h-3 text-success-500 mr-2" />
                      <XMarkIcon v-else class="w-3 h-3 text-neutral-400 mr-2" />
                      <span>{{ form.carry_forward ? 'Carry forward enabled' : 'No carry forward' }}</span>
                    </div>
                    <div class="flex items-center">
                      <CheckIcon v-if="form.is_active" class="w-3 h-3 text-success-500 mr-2" />
                      <XMarkIcon v-else class="w-3 h-3 text-neutral-400 mr-2" />
                      <span>{{ form.is_active ? 'Active policy' : 'Inactive policy' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ContentSection>

          <!-- Restrictions -->
          <ContentSection title="Restrictions & Limits" subtitle="Set limits on consecutive days and notice requirements">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="max_consecutive_days" class="block text-sm font-medium text-neutral-700 mb-2">
                  Maximum Consecutive Days
                </label>
                <div class="relative">
                  <input
                    id="max_consecutive_days"
                    v-model.number="form.max_consecutive_days"
                    type="number"
                    min="1"
                    max="365"
                    class="w-full border border-neutral-300 rounded-md shadow-sm px-3 py-2 pr-12 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150"
                    placeholder="30"
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span class="text-neutral-500 text-sm">days</span>
                  </div>
                </div>
                <p class="text-xs text-neutral-500 mt-1">
                  <InformationCircleIcon class="w-3 h-3 inline mr-1" />
                  Leave blank for no limit. Maximum consecutive days that can be taken at once.
                </p>
                <div v-if="errors.max_consecutive_days" class="text-error-600 text-sm mt-1 flex items-center">
                  <ExclamationCircleIcon class="w-4 h-4 mr-1" />
                  {{ errors.max_consecutive_days }}
                </div>
              </div>

              <div>
                <label for="min_notice_days" class="block text-sm font-medium text-neutral-700 mb-2">
                  Minimum Notice Period
                </label>
                <div class="relative">
                  <input
                    id="min_notice_days"
                    v-model.number="form.min_notice_days"
                    type="number"
                    min="0"
                    max="365"
                    class="w-full border border-neutral-300 rounded-md shadow-sm px-3 py-2 pr-12 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150"
                    placeholder="7"
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span class="text-neutral-500 text-sm">days</span>
                  </div>
                </div>
                <p class="text-xs text-neutral-500 mt-1">
                  <InformationCircleIcon class="w-3 h-3 inline mr-1" />
                  Leave blank for no requirement. How many days in advance employees must request this leave.
                </p>
                <div v-if="errors.min_notice_days" class="text-error-600 text-sm mt-1 flex items-center">
                  <ExclamationCircleIcon class="w-4 h-4 mr-1" />
                  {{ errors.min_notice_days }}
                </div>
              </div>
            </div>

            <!-- Restrictions Summary -->
            <div class="mt-6 bg-info-50 border border-info-200 rounded-lg p-4">
              <div class="flex">
                <InformationCircleIcon class="h-5 w-5 text-info-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 class="text-sm font-medium text-info-800">Restrictions Summary</h4>
                  <div class="text-sm text-info-700 mt-1 space-y-1">
                    <p v-if="form.max_consecutive_days">
                      • Employees can take a maximum of {{ form.max_consecutive_days }} consecutive days
                    </p>
                    <p v-else>
                      • No limit on consecutive days
                    </p>
                    <p v-if="form.min_notice_days">
                      • Employees must provide at least {{ form.min_notice_days }} days notice
                    </p>
                    <p v-else>
                      • No advance notice required
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ContentSection>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-8 border-t border-neutral-200">
            <button
              type="button"
              @click="$inertia.visit(route('leave-types.index'))"
              class="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
            >
              <ArrowLeftIcon class="w-4 h-4 mr-2" />
              Back to Policies
            </button>
            <div class="flex items-center space-x-3">
              <button
                type="button"
                @click="resetForm"
                class="px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
              >
                Reset Form
              </button>
              <button
                type="submit"
                :disabled="processing || !isFormValid"
                class="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <span v-if="processing" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
                <span v-else class="flex items-center">
                  <CheckIcon class="w-4 h-4 mr-2" />
                  Create Leave Policy
                </span>
              </button>
            </div>
          </div>
        </form>
      </ContentCard>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue'
import { router, useForm } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import ContentCard from '@/Components/Layout/ContentCard.vue'
import ContentSection from '@/Components/Layout/ContentSection.vue'
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

const form = useForm({
  name: '',
  quota: 25,
  description: '',
  is_active: true,
  requires_approval: true,
  max_consecutive_days: null,
  min_notice_days: null,
  carry_forward: false,
})

// Breadcrumbs for consistent navigation
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Leave Policies', href: route('leave-types.index') },
  { label: 'Create Policy', current: true }
])

// Form validation
const isFormValid = computed(() => {
  return form.name.trim() !== '' && form.quota > 0
})

const submit = () => {
  form.post(route('leave-types.store'), {
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