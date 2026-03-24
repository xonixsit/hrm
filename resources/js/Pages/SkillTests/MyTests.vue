<template>
  <AuthenticatedLayout>
    <PageLayout
      title="My Assigned Tests"
      subtitle="View and take your assigned skill tests"
      :breadcrumbs="breadcrumbs"
    >
      <div class="max-w-7xl mx-auto space-y-4">

        <!-- Filters -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-40">
            <label class="block text-xs font-medium text-gray-600 mb-1">Search</label>
            <input v-model="search" type="text" placeholder="Search tests..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
          </div>
          <div class="min-w-36">
            <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select v-model="filterStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="min-w-36">
            <label class="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
            <select v-model="filterDifficulty"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div class="min-w-36">
            <label class="block text-xs font-medium text-gray-600 mb-1">Availability</label>
            <select v-model="filterAvail"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button v-if="hasFilters" @click="clearFilters"
            class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            Clear
          </button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Difficulty</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Q / Time</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Deadline</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Used / Max</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="filtered.length === 0">
                <td colspan="8" class="px-5 py-12 text-center text-gray-500 text-sm">
                  {{ assignments.length === 0 ? 'No tests assigned to you.' : 'No tests match your filters.' }}
                </td>
              </tr>
              <tr v-for="a in filtered" :key="a.id" class="hover:bg-gray-50 transition-colors">
                <!-- Test name + description -->
                <td class="px-4 py-4">
                  <p class="text-sm font-medium text-gray-900 whitespace-nowrap">{{ a.test.name }}</p>
                </td>
                <!-- Category -->
                <td class="px-4 py-4 text-sm text-gray-600 capitalize whitespace-nowrap">{{ a.test.category }}</td>
                <!-- Difficulty -->
                <td class="px-4 py-4">
                  <span class="px-2 py-0.5 text-xs font-medium rounded capitalize whitespace-nowrap"
                    :class="{
                      'bg-green-100 text-green-700': a.test.difficulty_level === 'easy',
                      'bg-yellow-100 text-yellow-700': a.test.difficulty_level === 'medium',
                      'bg-red-100 text-red-700': a.test.difficulty_level === 'hard',
                    }">
                    {{ a.test.difficulty_level }}
                  </span>
                </td>
                <!-- Questions / Time -->
                <td class="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                  {{ a.test.question_count }}{{ a.test.time_limit ? ` · ${a.test.time_limit}m` : '' }}
                </td>
                <!-- Deadline -->
                <td class="px-4 py-4 text-sm whitespace-nowrap">
                  <span v-if="a.available_until" :class="a.is_expired ? 'text-red-600' : 'text-gray-600'">
                    {{ formatDate(a.available_until) }}
                  </span>
                  <span v-else class="text-gray-400">No deadline</span>
                </td>
                <!-- Attempts -->
                <td class="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                  {{ a.is_virtual ? '—' : `${a.max_attempts - a.attempts_remaining} / ${a.max_attempts}` }}
                </td>
                <!-- Status -->
                <td class="px-4 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap"
                    :class="{
                      'bg-yellow-100 text-yellow-700': a.status === 'pending',
                      'bg-blue-100 text-blue-700': a.status === 'in_progress',
                      'bg-green-100 text-green-700': a.status === 'completed',
                    }">
                    {{ a.status.replace('_', ' ') }}
                  </span>
                </td>
                <!-- Action -->
                <td class="px-4 py-4 whitespace-nowrap">
                  <span v-if="a.is_expired && a.status !== 'completed'" class="text-xs text-gray-400">Expired</span>
                  <span v-else-if="!a.is_available && a.status !== 'completed'" class="text-xs text-gray-400">Not available yet</span>
                  <span v-else-if="a.attempts_remaining === 0 && a.status !== 'completed'" class="text-xs text-gray-400">No attempts left</span>
                  <Link v-else-if="a.status === 'completed' && a.result_id && a.review_status === 'pending_review'"
                    :href="route('skill-tests.my-result', a.result_id)"
                    class="inline-flex items-center px-3 py-1.5 bg-yellow-500 text-white text-xs font-medium rounded-lg hover:bg-yellow-600 transition-colors">
                    Pending Review
                  </Link>
                  <Link v-else-if="a.status === 'completed' && a.result_id"
                    :href="route('skill-tests.my-result', a.result_id)"
                    class="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                    View Result
                  </Link>
                  <span v-else-if="a.status === 'completed'" class="text-xs text-green-600 font-medium">Completed ✓</span>
                  <Link v-else
                    :href="route('skill-tests.take', a.test.id)"
                    :preserve-state="false"
                    class="inline-flex items-center px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-colors">
                    {{ a.status === 'in_progress' ? 'Continue' : 'Start Test' }}
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <p v-if="assignments.length > 0" class="text-xs text-gray-400 text-right">
          Showing {{ filtered.length }} of {{ assignments.length }} tests
        </p>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const props = defineProps({
  assignments: { type: Array, required: true }
});

const search = ref('');
const filterStatus = ref('');
const filterDifficulty = ref('');
const filterAvail = ref('');

const hasFilters = computed(() => search.value || filterStatus.value || filterDifficulty.value || filterAvail.value);

const clearFilters = () => {
  search.value = '';
  filterStatus.value = '';
  filterDifficulty.value = '';
  filterAvail.value = '';
};

const filtered = computed(() => {
  return props.assignments.filter(a => {
    if (search.value) {
      const q = search.value.toLowerCase();
      if (!a.test.name.toLowerCase().includes(q) && !a.test.category.toLowerCase().includes(q)) return false;
    }
    if (filterStatus.value && a.status !== filterStatus.value) return false;
    if (filterDifficulty.value && a.test.difficulty_level !== filterDifficulty.value) return false;
    if (filterAvail.value === 'available' && (a.is_expired || !a.is_available)) return false;
    if (filterAvail.value === 'expired' && !a.is_expired) return false;
    return true;
  });
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'My Tests', current: true }
]);

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>
