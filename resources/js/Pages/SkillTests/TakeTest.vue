<template>
  <AuthenticatedLayout :key="`take-test-${test.id}`">
    <PageLayout
      :title="test.name"
      subtitle="Test Instructions"
      :breadcrumbs="breadcrumbs"
    >
      <div class="max-w-4xl mx-auto">
        <!-- Warning Banner -->
        <div v-if="assignment.is_expired" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm font-medium text-red-800">
              This test has expired and is no longer available.
            </span>
          </div>
        </div>

        <div v-else-if="!assignment.is_available" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm font-medium text-yellow-800">
              This test is not yet available.
            </span>
          </div>
        </div>

        <!-- Test Information Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ test.name }}</h2>
          <p class="text-gray-600 mb-6">{{ test.description }}</p>

          <!-- Test Details Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p class="text-sm text-gray-500 mb-1">Category</p>
              <p class="text-base font-medium text-gray-900 capitalize">{{ test.category }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Difficulty</p>
              <span
                class="inline-block px-3 py-1 text-sm font-medium rounded capitalize"
                :class="{
                  'bg-green-100 text-green-700': test.difficulty_level === 'easy',
                  'bg-yellow-100 text-yellow-700': test.difficulty_level === 'medium',
                  'bg-red-100 text-red-700': test.difficulty_level === 'hard'
                }"
              >
                {{ test.difficulty_level }}
              </span>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Questions</p>
              <p class="text-base font-medium text-gray-900">{{ test.question_count }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Total Points</p>
              <p class="text-base font-medium text-gray-900">{{ test.total_points }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Passing Score</p>
              <p class="text-base font-medium text-gray-900">{{ test.passing_score }}%</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Time Limit</p>
              <p class="text-base font-medium text-gray-900">
                {{ test.time_limit ? `${test.time_limit} minutes` : 'No limit' }}
              </p>
            </div>
          </div>

          <!-- Assignment Info -->
          <div class="border-t border-gray-200 pt-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm text-gray-500 mb-1">Attempts Remaining</p>
                <p class="text-base font-medium text-gray-900">{{ assignment.attempts_remaining }}</p>
              </div>
              <div v-if="assignment.available_until">
                <p class="text-sm text-gray-500 mb-1">Deadline</p>
                <p class="text-base font-medium text-gray-900">{{ formatDate(assignment.available_until) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions Card -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-blue-900 mb-3">Important Instructions</h3>
          <ul class="space-y-2 text-sm text-blue-800">
            <li class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Read each question carefully before answering.</span>
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Your answers are automatically saved as you progress.</span>
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>You can navigate between questions and review your answers before submitting.</span>
            </li>
            <li v-if="test.time_limit" class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>The test will automatically submit when time expires.</span>
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Once submitted, you cannot change your answers.</span>
            </li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between">
          <Link
            :href="route('skill-tests.my-tests')"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            ← Back to My Tests
          </Link>

          <button
            v-if="!assignment.is_expired && assignment.is_available && assignment.attempts_remaining > 0"
            @click="startTest"
            :disabled="starting"
            class="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
          >
            {{ starting ? 'Starting...' : 'Start Test' }}
          </button>
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
  test: {
    type: Object,
    required: true
  },
  assignment: {
    type: Object,
    required: true
  }
});

const starting = ref(false);

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'My Tests', href: route('skill-tests.my-tests') },
  { label: props.test.name, current: true }
]);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const startTest = () => {
  if (confirm('Are you ready to start the test? The timer will begin immediately.')) {
    starting.value = true;
    router.post(route('skill-tests.start', props.test.id), {}, {
      onFinish: () => {
        starting.value = false;
      }
    });
  }
};
</script>
