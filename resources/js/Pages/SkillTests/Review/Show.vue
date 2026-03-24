<template>
  <AuthenticatedLayout>
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <Link :href="route('skill-tests.reviews.index')" class="text-sm text-teal-600 hover:text-teal-700">
            ← Back to Reviews
          </Link>
          <h1 class="text-2xl font-semibold text-gray-900 mt-1">{{ test.name }}</h1>
          <p class="text-sm text-gray-500">{{ employee.name }}</p>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 text-sm font-medium rounded-full"
            :class="{
              'bg-yellow-100 text-yellow-700': response.review_status === 'auto_scored',
              'bg-orange-100 text-orange-700': response.review_status === 'pending_review',
              'bg-green-100 text-green-700': response.review_status === 'reviewed',
            }">
            {{ statusLabel(response.review_status) }}
          </span>
        </div>
      </div>

      <!-- Summary Card -->
      <div class="bg-white rounded-lg border border-gray-200 p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ localScore.toFixed(1) }}</p>
          <p class="text-xs text-gray-500 mt-1">Total Score</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ test.total_points }}</p>
          <p class="text-xs text-gray-500 mt-1">Max Points</p>
        </div>
        <div>
          <p class="text-2xl font-bold" :class="localPercentage >= test.passing_score ? 'text-green-600' : 'text-red-600'">
            {{ localPercentage }}%
          </p>
          <p class="text-xs text-gray-500 mt-1">Percentage (pass: {{ test.passing_score }}%)</p>
        </div>
        <div>
          <span class="text-lg font-bold" :class="localPassed ? 'text-green-600' : 'text-red-600'">
            {{ localPassed ? 'Passed' : 'Failed' }}
          </span>
          <p class="text-xs text-gray-500 mt-1">Result</p>
        </div>
      </div>

      <!-- Success/Error message -->
      <div v-if="message" class="mb-4 p-3 rounded-lg text-sm"
        :class="messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'">
        {{ message }}
      </div>

      <!-- Answers -->
      <div class="space-y-6">
        <div v-for="(answer, index) in localAnswers" :key="answer.id"
          class="bg-white rounded-lg border border-gray-200 p-6">
          <!-- Question -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-gray-500">Q{{ index + 1 }}</span>
                <span class="px-2 py-0.5 text-xs rounded-full"
                  :class="{
                    'bg-blue-100 text-blue-700': answer.question.type === 'mcq',
                    'bg-green-100 text-green-700': answer.question.type === 'single_answer',
                    'bg-purple-100 text-purple-700': answer.question.type === 'text',
                  }">
                  {{ typeLabel(answer.question.type) }}
                </span>
              </div>
              <p class="text-gray-900 font-medium">{{ answer.question.question_text }}</p>
            </div>
            <div class="ml-4 text-right shrink-0">
              <p class="text-xs text-gray-500">Max: {{ answer.question.points }} pts</p>
            </div>
          </div>

          <!-- MCQ / Single Answer display -->
          <div v-if="answer.question.type !== 'text'" class="space-y-2 mb-4">
            <div v-for="option in answer.question.options" :key="option.id"
              class="flex items-center gap-3 px-3 py-2 rounded-lg border"
              :class="{
                'border-green-400 bg-green-50': option.is_correct,
                'border-red-300 bg-red-50': !option.is_correct && answer.selected_option_ids.includes(option.id),
                'border-gray-200': !option.is_correct && !answer.selected_option_ids.includes(option.id),
              }">
              <span class="text-sm">
                <span v-if="answer.selected_option_ids.includes(option.id)" class="font-semibold">✓ </span>
                {{ option.option_text }}
              </span>
              <span v-if="option.is_correct" class="ml-auto text-xs text-green-600 font-medium">Correct answer</span>
            </div>
          </div>

          <!-- Text answer display -->
          <div v-else class="mb-4">
            <p class="text-xs font-medium text-gray-500 mb-1">Employee's answer:</p>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap min-h-16">
              {{ answer.answer_text || '(No answer provided)' }}
            </div>
            <div v-if="answer.text_review?.comment" class="mt-2 text-xs text-gray-500">
              Previous comment: {{ answer.text_review.comment }}
            </div>
          </div>

          <!-- Scoring controls -->
          <div class="border-t border-gray-100 pt-4 flex flex-wrap items-end gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Score</label>
              <input v-model.number="answer.editScore" type="number" min="0" :max="answer.question.points" step="0.5"
                class="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              <span class="text-xs text-gray-400 ml-1">/ {{ answer.question.points }}</span>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Mark as</label>
              <select v-model="answer.editCorrect"
                class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option :value="true">Correct</option>
                <option :value="false">Incorrect</option>
                <option :value="null">Unscored</option>
              </select>
            </div>
            <div v-if="answer.question.type === 'text'" class="flex-1 min-w-48">
              <label class="block text-xs font-medium text-gray-600 mb-1">Comment (optional)</label>
              <input v-model="answer.editComment" type="text" placeholder="Feedback for this answer..."
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <button @click="saveAnswer(answer)" :disabled="answer.saving"
              class="px-4 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {{ answer.saving ? 'Saving...' : 'Save' }}
            </button>
            <span v-if="answer.saved" class="text-xs text-green-600">Saved ✓</span>
          </div>
        </div>
      </div>

      <!-- Finalize -->
      <div class="mt-8 bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-900">Finalize Review</p>
          <p class="text-xs text-gray-500 mt-0.5">Recalculates total score from all saved answers and marks as reviewed.</p>
        </div>
        <button @click="finalizeReview" :disabled="finalizing"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
          {{ finalizing ? 'Finalizing...' : 'Finalize & Save' }}
        </button>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import axios from 'axios';

const props = defineProps({
  response: Object,
  employee: Object,
  test: Object,
  answers: Array,
});

// Local editable answers
const localAnswers = reactive(
  props.answers.map(a => ({
    ...a,
    editScore: a.score ?? (a.is_correct ? a.question.points : 0),
    editCorrect: a.is_correct,
    editComment: a.text_review?.comment ?? '',
    saving: false,
    saved: false,
  }))
);

const message = ref('');
const messageType = ref('success');
const finalizing = ref(false);

const localScore = computed(() => localAnswers.reduce((sum, a) => sum + (a.editScore || 0), 0));
const localPercentage = computed(() => {
  const total = props.test.total_points;
  return total > 0 ? Math.round((localScore.value / total) * 100) : 0;
});
const localPassed = computed(() => localPercentage.value >= props.test.passing_score);

const statusLabel = (s) => ({ auto_scored: 'Auto Scored', pending_review: 'Pending Review', reviewed: 'Reviewed' }[s] || s);
const typeLabel = (t) => ({ mcq: 'Multiple Choice', single_answer: 'Single Answer', text: 'Text Answer' }[t] || t);

const saveAnswer = async (answer) => {
  answer.saving = true;
  answer.saved = false;
  try {
    await axios.post(route('skill-tests.reviews.answer', { testResponse: props.response.id, answer: answer.id }), {
      score: answer.editScore,
      is_correct: answer.editCorrect ?? false,
      comment: answer.editComment || null,
    });
    answer.saved = true;
    setTimeout(() => { answer.saved = false; }, 2000);
  } catch (e) {
    message.value = e.response?.data?.error || 'Failed to save answer.';
    messageType.value = 'error';
  } finally {
    answer.saving = false;
  }
};

const finalizeReview = async () => {
  finalizing.value = true;
  message.value = '';
  try {
    const res = await axios.post(route('skill-tests.reviews.finalize', props.response.id));
    message.value = `Review finalized. Score: ${res.data.percentage_score}% — ${res.data.passed ? 'Passed' : 'Failed'}`;
    messageType.value = 'success';
  } catch (e) {
    message.value = e.response?.data?.error || 'Failed to finalize review.';
    messageType.value = 'error';
  } finally {
    finalizing.value = false;
  }
};
</script>
