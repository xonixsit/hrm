<template>
  <AuthenticatedLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header with Timer -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900">{{ test.name }}</h1>
              <p class="text-sm text-gray-500">
                Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
              </p>
            </div>
            
            <!-- Timer -->
            <div v-if="test.time_limit" class="flex items-center space-x-4">
              <div
                class="flex items-center px-4 py-2 rounded-lg"
                :class="{
                  'bg-red-100 text-red-700': timeRemaining < 300,
                  'bg-yellow-100 text-yellow-700': timeRemaining >= 300 && timeRemaining < 600,
                  'bg-green-100 text-green-700': timeRemaining >= 600
                }"
              >
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-mono font-semibold">{{ formattedTime }}</span>
              </div>
            </div>
          </div>

          <!-- Progress Bar with milestone question markers -->
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{{ localProgress.answered_questions }} / {{ localProgress.total_questions }} answered</span>
              <span>{{ localProgress.progress_percentage }}%</span>
            </div>
            <!-- Track with markers -->
            <div class="relative h-8 px-3">
              <!-- Background track -->
              <div class="absolute top-1/2 -translate-y-1/2 left-3 right-3 h-2 bg-gray-200 rounded-full"></div>
              <!-- Fill: scales within the padded track -->
              <div class="absolute top-1/2 -translate-y-1/2 h-2 bg-teal-500 rounded-full transition-all duration-300"
                :style="{ left: '12px', width: `calc(${localProgress.progress_percentage}% * (100% - 24px) / 100%)` }"></div>
              <!-- Question markers: evenly spaced across the padded track -->
              <button
                v-for="(question, index) in questions"
                :key="question.id"
                @click="goToQuestion(index)"
                class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition-all z-10 border-2"
                :style="{ left: `calc(12px + ((100% - 24px) * ${(index + 1) / questions.length}))` }"
                :class="{
                  'bg-teal-600 border-teal-700 text-white shadow-md scale-110': index === currentQuestionIndex,
                  'bg-green-500 border-green-600 text-white': index !== currentQuestionIndex && isAnswered(question.id),
                  'bg-white border-gray-300 text-gray-500 hover:border-teal-400 hover:text-teal-600': index !== currentQuestionIndex && !isAnswered(question.id),
                }"
                :title="`Question ${index + 1}`"
              >
                {{ index + 1 }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="max-w-4xl mx-auto">
          <!-- Question Display Area -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div v-if="currentQuestion">
                <!-- Question Header -->
                <div class="flex items-start justify-between mb-6">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="text-sm font-medium text-gray-500">
                        Question {{ currentQuestionIndex + 1 }}
                      </span>
                      <span
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="{
                          'bg-blue-100 text-blue-700': currentQuestion.type === 'mcq',
                          'bg-green-100 text-green-700': currentQuestion.type === 'single_answer',
                          'bg-purple-100 text-purple-700': currentQuestion.type === 'text'
                        }"
                      >
                        {{ getQuestionTypeLabel(currentQuestion.type) }}
                      </span>
                    </div>
                    <h2 class="text-lg font-medium text-gray-900">{{ currentQuestion.question_text }}</h2>
                  </div>
                  <div class="text-sm font-medium text-gray-500 ml-4">
                    {{ currentQuestion.points }} {{ currentQuestion.points === 1 ? 'point' : 'points' }}
                  </div>
                </div>

                <MCQQuestion
                  v-if="currentQuestion.type === 'mcq'"
                  :question="currentQuestion"
                  :answer="currentAnswer"
                  @update="updateAnswer"
                />
                
                <SingleAnswerQuestion
                  v-else-if="currentQuestion.type === 'single_answer'"
                  :question="currentQuestion"
                  :answer="currentAnswer"
                  @update="updateAnswer"
                />
                
                <TextQuestion
                  v-else-if="currentQuestion.type === 'text'"
                  :question="currentQuestion"
                  :answer="currentAnswer"
                  @update="updateAnswer"
                />

                <div v-else class="bg-red-50 p-4 rounded">
                  <p class="text-red-800">Unknown question type: {{ currentQuestion.type }}</p>
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  @click="previousQuestion"
                  :disabled="currentQuestionIndex === 0"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <button
                  v-if="currentQuestionIndex < questions.length - 1"
                  @click="nextQuestion"
                  class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Next →
                </button>

                <button
                  v-else
                  @click="showSubmitConfirmation = true"
                  class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Review & Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Submit Confirmation Modal -->
    <SubmitConfirmationModal
      v-if="showSubmitConfirmation"
      :questions="questions"
      :answers="localAnswers"
      :progress="localProgress"
      @close="showSubmitConfirmation = false"
      @submit="submitTest"
    />
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import MCQQuestion from '@/Components/SkillTests/MCQQuestion.vue';
import SingleAnswerQuestion from '@/Components/SkillTests/SingleAnswerQuestion.vue';
import TextQuestion from '@/Components/SkillTests/TextQuestion.vue';
import SubmitConfirmationModal from '@/Components/SkillTests/SubmitConfirmationModal.vue';

const props = defineProps({
  session: Object,
  test: Object,
  questions: Array,
  answers: Object,
  progress: Object
});

const currentQuestionIndex = ref(0);
const localAnswers = ref({ ...props.answers });
const timeRemaining = ref(props.session.time_remaining);
const showSubmitConfirmation = ref(false);
let timerInterval = null;

const currentQuestion = computed(() => props.questions[currentQuestionIndex.value]);
const currentAnswer = computed(() => localAnswers.value[currentQuestion.value?.id] || {});

const isAnswered = (questionId) => {
  const answer = localAnswers.value[questionId];
  if (!answer) return false;
  if (answer.answer_text) return true;
  if (answer.selected_options && answer.selected_options.length > 0) return true;
  return false;
};

const localProgress = computed(() => {
  const total = props.questions.length;
  const answered = props.questions.filter(q => isAnswered(q.id)).length;
  return {
    total_questions: total,
    answered_questions: answered,
    progress_percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
  };
});

const formattedTime = computed(() => {
  if (timeRemaining.value === null) return 'No limit';
  const total = Math.floor(timeRemaining.value);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

onMounted(() => {
  if (props.test.time_limit && timeRemaining.value !== null) {
    timerInterval = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--;
        
        // Warning at 5 minutes
        if (timeRemaining.value === 300) {
          alert('Warning: 5 minutes remaining!');
        }
        
        // Auto-submit when time expires
        if (timeRemaining.value === 0) {
          alert('Time has expired! Your test will be submitted automatically.');
          submitTest();
        }
      }
    }, 1000);
  }
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});


const getQuestionTypeLabel = (type) => {
  const labels = {
    'mcq': 'Multiple Choice',
    'single_answer': 'Single Answer',
    'text': 'Text Answer'
  };
  return labels[type] || type;
};

const goToQuestion = (index) => {
  currentQuestionIndex.value = index;
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < props.questions.length - 1) {
    currentQuestionIndex.value++;
  }
};

const updateAnswer = async (answerData) => {
  // Update local state
  localAnswers.value[currentQuestion.value.id] = answerData;

  // Format data for API based on question type
  const apiData = {};
  
  if (currentQuestion.value.type === 'mcq') {
    apiData.selected_option_ids = answerData.selected_options || [];
  } else if (currentQuestion.value.type === 'single_answer') {
    apiData.selected_option_id = answerData.selected_options?.[0] || null;
  } else if (currentQuestion.value.type === 'text') {
    apiData.answer_text = answerData.answer_text || '';
  }

  // Save to server
  try {
    await fetch(route('skill-tests.save-answer', {
      testSession: props.session.id,
      question: currentQuestion.value.id
    }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify(apiData)
    });
  } catch (error) {
    console.error('Failed to save answer:', error);
  }
};

const submitTest = async () => {
  try {
    const response = await fetch(route('skill-tests.submit-session', props.session.id), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      }
    });

    const data = await response.json();
    
    if (data.success) {
      router.visit(data.redirect, {
        onSuccess: () => {
          alert('Test submitted successfully!');
        }
      });
    }
  } catch (error) {
    console.error('Failed to submit test:', error);
    alert('Failed to submit test. Please try again.');
  }
};
</script>
