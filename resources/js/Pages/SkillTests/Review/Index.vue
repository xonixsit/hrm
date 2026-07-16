<template>
  <AuthenticatedLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Test Reviews</h1>
          <p class="text-sm text-gray-500 mt-1">Review and score submitted test responses</p>
        </div>
        <div class="flex items-center gap-3">
          <a :href="route('skill-tests.reviews.export', filters)" 
            class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </a>
          <Link :href="route('skill-tests.index')" class="text-sm text-teal-600 hover:text-teal-700">
            ← Back to Tests
          </Link>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap gap-4">
        <div class="flex-1 min-w-48">
          <label class="block text-xs font-medium text-gray-600 mb-1">Filter by Test</label>
          <select v-model="filters.test_id" @change="applyFilters"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent">
            <option value="">All Tests</option>
            <option v-for="test in tests" :key="test.id" :value="test.id">{{ test.name }}</option>
          </select>
        </div>
        <div class="flex-1 min-w-48">
          <label class="block text-xs font-medium text-gray-600 mb-1">Review Status</label>
          <select v-model="filters.review_status" @change="applyFilters"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent">
            <option value="">All Statuses</option>
            <option value="auto_scored">Auto Scored</option>
            <option value="pending_review">Pending Review</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="responses.data.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500 text-sm">No submitted responses found.</td>
            </tr>
            <tr v-for="r in responses.data" :key="r.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ r.employee.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ r.test.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <span v-if="r.percentage_score !== null">{{ r.percentage_score }}%</span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-6 py-4">
                <span v-if="r.passed !== null"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ r.passed ? 'Passed' : 'Failed' }}
                </span>
                <span v-else class="text-gray-400 text-xs">—</span>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-700': r.review_status === 'auto_scored',
                    'bg-orange-100 text-orange-700': r.review_status === 'pending_review',
                    'bg-green-100 text-green-700': r.review_status === 'reviewed',
                  }">
                  {{ statusLabel(r.review_status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(r.submitted_at) }}</td>
              <td class="px-6 py-4">
                <Link :href="route('skill-tests.reviews.show', r.id)"
                  class="text-teal-600 hover:text-teal-700 text-sm font-medium">
                  Review →
                </Link>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="responses.last_page > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <span>Showing {{ responses.from }}–{{ responses.to }} of {{ responses.total }}</span>
          <div class="flex gap-2">
            <Link v-if="responses.prev_page_url" :href="responses.prev_page_url"
              class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Prev</Link>
            <Link v-if="responses.next_page_url" :href="responses.next_page_url"
              class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Next</Link>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { reactive } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
  responses: Object,
  tests: Array,
  filters: Object,
});

const filters = reactive({
  test_id: props.filters.test_id || '',
  review_status: props.filters.review_status || '',
});

const applyFilters = () => {
  router.get(route('skill-tests.reviews.index'), filters, { preserveState: true, replace: true });
};

const statusLabel = (status) => {
  return { auto_scored: 'Auto Scored', pending_review: 'Pending Review', reviewed: 'Reviewed' }[status] || status;
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
</script>
