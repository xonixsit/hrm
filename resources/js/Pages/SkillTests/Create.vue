<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Create Skill Test"
      subtitle="Create a new skill assessment test"
      :breadcrumbs="breadcrumbs"
    >
      <div class="max-w-6xl mx-auto">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Test Basic Information -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Test Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Test Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="e.g., JavaScript Fundamentals Assessment"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p v-if="form.errors.name" class="mt-1 text-sm text-red-600">{{ form.errors.name }}</p>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  required
                  placeholder="Describe what this test assesses..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                ></textarea>
                <p v-if="form.errors.description" class="mt-1 text-sm text-red-600">{{ form.errors.description }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  v-model="form.category"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="technical">Technical</option>
                  <option value="soft-skills">Soft Skills</option>
                  <option value="compliance">Compliance</option>
                  <option value="leadership">Leadership</option>
                  <option value="communication">Communication</option>
                </select>
                <p v-if="form.errors.category" class="mt-1 text-sm text-red-600">{{ form.errors.category }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty Level *</label>
                <select
                  v-model="form.difficulty_level"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <p v-if="form.errors.difficulty_level" class="mt-1 text-sm text-red-600">{{ form.errors.difficulty_level }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Passing Score (%) *</label>
                <input
                  v-model.number="form.passing_score"
                  type="number"
                  min="0"
                  max="100"
                  required
                  placeholder="70"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p v-if="form.errors.passing_score" class="mt-1 text-sm text-red-600">{{ form.errors.passing_score }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
                <input
                  v-model.number="form.time_limit"
                  type="number"
                  min="1"
                  placeholder="60 (optional)"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p class="mt-1 text-xs text-gray-500">Leave empty for no time limit</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Maximum Attempts *</label>
                <input
                  v-model.number="form.max_attempts"
                  type="number"
                  min="1"
                  required
                  placeholder="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p v-if="form.errors.max_attempts" class="mt-1 text-sm text-red-600">{{ form.errors.max_attempts }}</p>
              </div>
            </div>
          </div>

          <!-- Test Settings -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Test Settings</h3>
            
            <div class="space-y-4">
              <div class="flex items-center">
                <input
                  v-model="form.randomize_questions"
                  type="checkbox"
                  id="randomize_questions"
                  class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label for="randomize_questions" class="ml-2 block text-sm text-gray-700">
                  Randomize question order for each attempt
                </label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.randomize_answers"
                  type="checkbox"
                  id="randomize_answers"
                  class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label for="randomize_answers" class="ml-2 block text-sm text-gray-700">
                  Randomize answer options for multiple choice questions
                </label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.show_correct_answers"
                  type="checkbox"
                  id="show_correct_answers"
                  class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label for="show_correct_answers" class="ml-2 block text-sm text-gray-700">
                  Show correct answers after submission
                </label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.show_explanations"
                  type="checkbox"
                  id="show_explanations"
                  class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label for="show_explanations" class="ml-2 block text-sm text-gray-700">
                  Show answer explanations after submission
                </label>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Feedback Timing *</label>
                <select
                  v-model="form.feedback_timing"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="immediate">Immediate (after submission)</option>
                  <option value="after_deadline">After deadline</option>
                  <option value="manual">Manual (admin controlled)</option>
                </select>
                <p class="mt-1 text-xs text-gray-500">When should employees see their results and feedback?</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Link
              :href="route('skill-tests.index')"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            
            <div class="flex space-x-3">
              <button
                type="submit"
                :disabled="form.processing"
                class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ form.processing ? 'Creating...' : 'Create Test' }}
              </button>
            </div>
          </div>
        </form>

        <!-- Info Box -->
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">Next Steps</h3>
              <p class="mt-1 text-sm text-blue-700">
                After creating the test, you'll be able to add questions (Multiple Choice, Text Answer, or Single Answer). 
                Once you've added at least one question, you can publish the test and assign it to employees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue';
import { Link, useForm } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const form = useForm({
  name: '',
  description: '',
  category: '',
  difficulty_level: '',
  passing_score: 70,
  time_limit: null,
  max_attempts: 3,
  randomize_questions: false,
  randomize_answers: false,
  show_correct_answers: true,
  show_explanations: true,
  feedback_timing: 'immediate',
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Skill Tests', href: route('skill-tests.index') },
  { label: 'Create', current: true }
]);

const handleSubmit = () => {
  form.post(route('skill-tests.store'), {
    onSuccess: () => {
      // Will redirect to edit page to add questions
    },
  });
};
</script>
