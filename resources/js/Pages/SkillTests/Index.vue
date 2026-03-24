<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Skill Tests"
      subtitle="Manage and monitor employee skill assessments"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <Link
          v-if="can.update"
          :href="route('skill-tests.reviews.index')"
          class="inline-flex items-center px-4 py-2 border border-teal-600 text-teal-600 text-sm font-medium rounded-lg hover:bg-teal-50 transition-colors mr-2"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Reviews
        </Link>
        <Link
          v-if="can.create"
          :href="route('skill-tests.create')"
          class="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Test
        </Link>
      </template>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search tests..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              @input="applyFilters"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              @change="applyFilters"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              v-model="filters.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              @change="applyFilters"
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="soft-skills">Soft Skills</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              v-model="filters.difficulty_level"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              @change="applyFilters"
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tests List -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div v-if="tests.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No skill tests found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new skill test.</p>
          <div v-if="can.create" class="mt-6">
            <Link
              :href="route('skill-tests.create')"
              class="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
            >
              Create Test
            </Link>
          </div>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="test in tests"
            :key="test.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <h3 class="text-lg font-semibold text-gray-900">{{ test.name }}</h3>
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      test.status === 'active' ? 'bg-green-100 text-green-800' :
                      test.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ test.status }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-600">{{ test.description }}</p>
                <div class="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                  <span>📚 {{ test.category }}</span>
                  <span>⚡ {{ test.difficulty_level }}</span>
                  <span>⏱️ {{ test.time_limit }} min</span>
                  <span>🎯 {{ test.passing_score }}% passing</span>
                </div>
              </div>
              <div class="flex items-center space-x-2 ml-4">
                <Link
                  :href="route('skill-tests.edit', test.id)"
                  class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  View
                </Link>
                <Link
                  v-if="can.update"
                  :href="route('skill-tests.edit', test.id)"
                  class="px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const props = defineProps({
  tests: {
    type: Array,
    default: () => []
  },
  can: {
    type: Object,
    default: () => ({
      create: false,
      update: false,
      delete: false
    })
  }
});

const filters = ref({
  search: '',
  status: '',
  category: '',
  difficulty_level: ''
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Skill Tests', current: true }
]);

const applyFilters = () => {
  router.get(route('skill-tests.index'), filters.value, {
    preserveState: true,
    preserveScroll: true
  });
};
</script>
