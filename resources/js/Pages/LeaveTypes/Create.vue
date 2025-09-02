<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center space-x-4">
        <button
          @click="$inertia.visit(route('leave-types.index'))"
          class="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon class="w-5 h-5" />
        </button>
        <div>
          <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            Create Leave Policy
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Define a new leave type with policies and quotas
          </p>
        </div>
      </div>
    </template>

    <div class="py-12">
      <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <form @submit.prevent="submit" class="p-6 space-y-6">
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
              
              <div class="space-y-4">
                <div class="flex items-center">
                  <input
                    id="requires_approval"
                    v-model="form.requires_approval"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label for="requires_approval" class="ml-2 block text-sm text-gray-900">
                    Requires manager approval
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    id="carry_forward"
                    v-model="form.carry_forward"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label for="carry_forward" class="ml-2 block text-sm text-gray-900">
                    Allow unused days to carry forward to next year
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    id="is_active"
                    v-model="form.is_active"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label for="is_active" class="ml-2 block text-sm text-gray-900">
                    Active (employees can request this leave type)
                  </label>
                </div>
              </div>
            </div>

            <!-- Restrictions -->
            <div class="pb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Restrictions</h3>
              
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
                  <p class="text-xs text-gray-500 mt-1">Maximum number of consecutive days that can be taken at once</p>
                  <div v-if="errors.max_consecutive_days" class="text-red-600 text-sm mt-1">{{ errors.max_consecutive_days }}</div>
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
                  <p class="text-xs text-gray-500 mt-1">How many days in advance employees must request this leave</p>
                  <div v-if="errors.min_notice_days" class="text-red-600 text-sm mt-1">{{ errors.min_notice_days }}</div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="$inertia.visit(route('leave-types.index'))"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="processing"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ processing ? 'Creating...' : 'Create Leave Type' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { reactive } from 'vue'
import { router, useForm } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

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

const { errors, processing } = form
</script>