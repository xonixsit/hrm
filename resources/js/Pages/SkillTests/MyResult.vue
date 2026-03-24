<template>
  <AuthenticatedLayout>
    <PageLayout
      :title="test.name"
      subtitle="Your test result"
      :breadcrumbs="breadcrumbs"
    >
      <div class="max-w-4xl mx-auto space-y-6">

        <!-- Result Summary Card -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p class="text-3xl font-bold text-gray-900">{{ response.total_score }}</p>
              <p class="text-xs text-gray-500 mt-1">Score Earned</p>
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-900">{{ test.total_points }}</p>
              <p class="text-xs text-gray-500 mt-1">Total Points</p>
            </div>
            <div>
              <p class="text-3xl font-bold" :class="response.passed ? 'text-green-600' : 'text-red-600'">
                {{ response.percentage_score }}%
              </p>
              <p class="text-xs text-gray-500 mt-1">Percentage (pass: {{ test.passing_score }}%)</p>
            </div>
            <div class="flex flex-col items-center justify-center">
              <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold"
                :class="response.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                {{ response.passed ? '✓ Passed' : '✗ Failed' }}
              </span>
              <p class="text-xs text-gray-500 mt-2">Result</p>
            </div>
          </div>

          <!-- Meta info -->
          <div class="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
            <span>Submitted: {{ formatDate(response.submitted_at) }}</span>
            <span class="px-2 py-0.5 rounded-full"
              :class="{
                'bg-yellow-100 text-yellow-700': response.review_status === 'auto_scored',
                'bg-green-100 text-green-700': response.review_status === 'reviewed',
              }">
              {{ response.review_status === 'reviewed' ? 'Reviewed by admin' : 'Auto scored' }}
            </span>
            <span>{{ correctCount }} correct · {{ incorrectCount }} incorrect · {{ unansweredCount }} unanswered</span>
          </div>
        </div>

        <!-- Answers breakdown -->
        <div class="space-y-4">
          <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Answer Breakdown</h2>

          <div v-for="(answer, index) in answers" :key="answer.id"
            class="bg-white rounded-lg border overflow-hidden"
            :class="{
              'border-green-300': answer.is_correct === true,
              'border-red-300': answer.is_correct === false,
              'border-gray-200': answer.is_correct === null,
            }">

            <!-- Question header -->
            <div class="px-5 py-4 flex items-start justify-between gap-4"
              :class="{
                'bg-green-50': answer.is_correct === true,
                'bg-red-50': answer.is_correct === false,
                'bg-gray-50': answer.is_correct === null,
              }">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-medium text-gray-500">Q{{ index + 1 }}</span>
                  <span class="px-2 py-0.5 text-xs rounded-full"
                    :class="{
                      'bg-blue-100 text-blue-700': answer.question.type === 'mcq',
                      'bg-green-100 text-green-700': answer.question.type === 'single_answer',
                      'bg-purple-100 text-purple-700': answer.question.type === 'text',
                    }">
                    {{ typeLabel(answer.question.type) }}
                  </span>
                </div>
                <p class="text-sm font-medium text-gray-900">{{ answer.question.question_text }}</p>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-sm font-semibold"
                  :class="{
                    'text-green-600': answer.is_correct === true,
                    'text-red-600': answer.is_correct === false,
                    'text-gray-400': answer.is_correct === null,
                  }">
                  {{ answer.score ?? 0 }} / {{ answer.question.points }} pts
                </p>
                <p class="text-xs mt-0.5"
                  :class="{
                    'text-green-600': answer.is_correct === true,
                    'text-red-500': answer.is_correct === false,
                    'text-gray-400': answer.is_correct === null,
                  }">
                  {{ answer.is_correct === true ? 'Correct' : answer.is_correct === false ? 'Incorrect' : 'Not scored' }}
                </p>
              </div>
            </div>

            <!-- Options (MCQ / Single Answer) -->
            <div v-if="answer.question.type !== 'text'" class="px-5 py-4 space-y-2">
              <div v-for="option in answer.question.options" :key="option.id"
                class="flex items-center gap-3 px-3 py-2 rounded-lg border text-sm"
                :class="optionClass(option, answer)">
                <span v-if="answer.selected_option_ids.includes(option.id)" class="font-bold">✓</span>
                <span v-else class="w-4"></span>
                <span>{{ option.option_text }}</span>
                <span v-if="test.show_correct_answers && option.is_correct"
                  class="ml-auto text-xs font-medium text-green-600">Correct answer</span>
              </div>
            </div>

            <!-- Text answer -->
            <div v-else class="px-5 py-4">
              <p class="text-xs font-medium text-gray-500 mb-1">Your answer:</p>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap min-h-12">
                {{ answer.answer_text || '(No answer provided)' }}
              </div>
              <div v-if="answer.reviewer_comment" class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-xs font-medium text-blue-700 mb-0.5">Reviewer comment:</p>
                <p class="text-sm text-blue-800">{{ answer.reviewer_comment }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Back button -->
        <div class="flex justify-end pb-4">
          <Link :href="route('skill-tests.my-tests')"
            class="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
            ← Back to My Tests
          </Link>
        </div>

      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const props = defineProps({
  response: Object,
  test: Object,
  answers: Array,
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'My Tests', href: route('skill-tests.my-tests') },
  { label: 'Result', current: true },
]);

const correctCount = computed(() => props.answers.filter(a => a.is_correct === true).length);
const incorrectCount = computed(() => props.answers.filter(a => a.is_correct === false).length);
const unansweredCount = computed(() => props.answers.filter(a => a.is_correct === null).length);

const typeLabel = (t) => ({ mcq: 'Multiple Choice', single_answer: 'Single Answer', text: 'Text Answer' }[t] || t);

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const optionClass = (option, answer) => {
  const selected = answer.selected_option_ids.includes(option.id);
  if (selected && option.is_correct) return 'border-green-400 bg-green-50 text-green-800';
  if (selected && !option.is_correct) return 'border-red-300 bg-red-50 text-red-800';
  if (!selected && option.is_correct && props.test.show_correct_answers) return 'border-green-300 bg-green-50 text-green-700';
  return 'border-gray-200 text-gray-700';
};
</script>
