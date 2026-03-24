<template>
  <AuthenticatedLayout>
    <PageLayout
      :title="test.name"
      subtitle="Manage test details and questions"
      :breadcrumbs="breadcrumbs"
    >
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Test Status Banner -->
        <div v-if="test.status === 'draft'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="ml-2 text-sm font-medium text-yellow-800">
                This test is in draft mode. Add questions and publish to make it available.
              </span>
            </div>
            <button
              v-if="test.questions.length > 0"
              @click="publishTest"
              :disabled="publishing"
              class="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {{ publishing ? 'Publishing...' : 'Publish Test' }}
            </button>
          </div>
        </div>

        <!-- Test Information Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Test Information</h3>
            <button
              @click="showEditInfo = !showEditInfo"
              class="text-sm text-teal-600 hover:text-teal-700"
            >
              {{ showEditInfo ? 'Cancel' : 'Edit Info' }}
            </button>
          </div>

          <div v-if="!showEditInfo" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Category</p>
              <p class="text-gray-900 capitalize">{{ test.category }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Difficulty</p>
              <p class="text-gray-900 capitalize">{{ test.difficulty_level }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Passing Score</p>
              <p class="text-gray-900">{{ test.passing_score }}%</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Time Limit</p>
              <p class="text-gray-900">{{ test.time_limit ? `${test.time_limit} minutes` : 'No limit' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Max Attempts</p>
              <p class="text-gray-900">{{ test.max_attempts }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Questions</p>
              <p class="text-gray-900">{{ test.questions.length }}</p>
            </div>
          </div>

          <!-- Edit Form (shown when editing) -->
          <form v-else @submit.prevent="updateTestInfo" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                <input
                  v-model="infoForm.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="infoForm.description"
                  rows="3"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select v-model="infoForm.category" required class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="technical">Technical</option>
                  <option value="soft-skills">Soft Skills</option>
                  <option value="compliance">Compliance</option>
                  <option value="leadership">Leadership</option>
                  <option value="communication">Communication</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select v-model="infoForm.difficulty_level" required class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                <input
                  v-model.number="infoForm.passing_score"
                  type="number"
                  min="0"
                  max="100"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                <input
                  v-model.number="infoForm.time_limit"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div class="flex justify-end space-x-2">
              <button
                type="button"
                @click="showEditInfo = false"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="infoForm.processing"
                class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {{ infoForm.processing ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Questions Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Questions</h3>
            <button
              v-if="test.status === 'draft'"
              @click="showAddQuestion = true"
              class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              + Add Question
            </button>
          </div>

          <!-- Questions List -->
          <div v-if="test.questions.length > 0" class="space-y-4">
            <div
              v-for="(question, index) in test.questions"
              :key="question.id"
              class="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="text-sm font-medium text-gray-500">Q{{ index + 1 }}</span>
                    <span class="px-2 py-1 text-xs font-medium rounded-full"
                          :class="{
                            'bg-blue-100 text-blue-700': question.type === 'mcq',
                            'bg-green-100 text-green-700': question.type === 'single_answer',
                            'bg-purple-100 text-purple-700': question.type === 'text'
                          }">
                      {{ { mcq: 'Multiple Choice', single_answer: 'Single Answer', text: 'Text Answer' }[question.type] || question.type }}
                    </span>
                    <span class="text-sm text-gray-500">{{ question.points }} points</span>
                  </div>
                  <p class="text-gray-900 mb-2">{{ question.question_text }}</p>
                  
                  <!-- Show options for MCQ/Single Answer -->
                  <div v-if="question.options && question.options.length > 0" class="ml-4 space-y-1">
                    <div
                      v-for="option in question.options"
                      :key="option.id"
                      class="flex items-center text-sm"
                      :class="option.is_correct ? 'text-green-600 font-medium' : 'text-gray-600'"
                    >
                      <span class="mr-2">{{ option.is_correct ? '✓' : '○' }}</span>
                      {{ option.option_text }}
                    </div>
                  </div>
                </div>
                
                <div v-if="test.status === 'draft'" class="flex space-x-2 ml-4">
                  <button
                    @click="editQuestion(question)"
                    class="text-gray-400 hover:text-teal-600"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteQuestion(question.id)"
                    class="text-gray-400 hover:text-red-600"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by adding your first question.</p>
            <div class="mt-6">
              <button
                @click="showAddQuestion = true"
                class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                + Add Question
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between">
          <Link
            :href="route('skill-tests.index')"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            ← Back to Tests
          </Link>
          
          <div class="flex space-x-3">
            <button
              v-if="test.status === 'published'"
              @click="showAssignModal = true"
              class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Assign Test
            </button>
            <button
              v-if="test.status === 'published'"
              @click="viewAssignments"
              class="px-6 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50"
            >
              View Assignments
            </button>
            <button
              v-if="test.status === 'published'"
              @click="archiveTest"
              :disabled="archiving"
              class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {{ archiving ? 'Archiving...' : 'Archive Test' }}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>

    <!-- Add/Edit Question Modal -->
    <QuestionFormModal
      v-if="showAddQuestion || editingQuestion"
      :key="editingQuestion ? `edit-${editingQuestion.id}` : 'add-new'"
      :question="editingQuestion"
      :test-id="test.id"
      @close="closeQuestionModal"
      @saved="handleQuestionSaved"
    />

    <!-- Assign Test Modal -->
    <AssignTestModal
      v-if="showAssignModal"
      :show="showAssignModal"
      :test-id="test.id"
      :test-max-attempts="test.max_attempts"
      @close="showAssignModal = false"
      @assigned="handleTestAssigned"
    />

    <!-- Assignments List Modal -->
    <AssignmentsListModal
      v-if="showAssignmentsModal"
      :show="showAssignmentsModal"
      :test-id="test.id"
      :test-name="test.name"
      @close="showAssignmentsModal = false"
    />
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Link, useForm, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import QuestionFormModal from '@/Components/SkillTests/QuestionFormModal.vue';
import AssignTestModal from '@/Components/SkillTests/AssignTestModal.vue';
import AssignmentsListModal from '@/Components/SkillTests/AssignmentsListModal.vue';

const props = defineProps({
  test: {
    type: Object,
    required: true
  }
});

const showEditInfo = ref(false);
const showAddQuestion = ref(false);
const editingQuestion = ref(null);
const publishing = ref(false);
const archiving = ref(false);
const showAssignModal = ref(false);
const showAssignmentsModal = ref(false);

const infoForm = useForm({
  name: props.test.name,
  description: props.test.description,
  category: props.test.category,
  difficulty_level: props.test.difficulty_level,
  passing_score: props.test.passing_score,
  time_limit: props.test.time_limit,
  max_attempts: props.test.max_attempts,
  randomize_questions: props.test.randomize_questions,
  randomize_answers: props.test.randomize_answers,
  show_correct_answers: props.test.show_correct_answers,
  show_explanations: props.test.show_explanations,
  feedback_timing: props.test.feedback_timing,
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Skill Tests', href: route('skill-tests.index') },
  { label: props.test.name, current: true }
]);

const updateTestInfo = () => {
  infoForm.patch(route('skill-tests.update', props.test.id), {
    onSuccess: () => {
      showEditInfo.value = false;
    },
  });
};

const publishTest = () => {
  if (confirm('Are you sure you want to publish this test? Once published, you cannot edit questions.')) {
    publishing.value = true;
    router.post(route('skill-tests.publish', props.test.id), {}, {
      onFinish: () => {
        publishing.value = false;
      },
    });
  }
};

const archiveTest = () => {
  if (confirm('Are you sure you want to archive this test? It will no longer be available for new assignments.')) {
    archiving.value = true;
    router.post(route('skill-tests.archive', props.test.id), {}, {
      onFinish: () => {
        archiving.value = false;
      },
    });
  }
};

const editQuestion = (question) => {
  editingQuestion.value = question;
};

const deleteQuestion = (questionId) => {
  if (confirm('Are you sure you want to delete this question?')) {
    router.delete(route('skill-tests.questions.destroy', { skillTest: props.test.id, question: questionId }), {
      preserveScroll: true,
    });
  }
};

const closeQuestionModal = () => {
  showAddQuestion.value = false;
  editingQuestion.value = null;
};

const handleQuestionSaved = () => {
  closeQuestionModal();
  router.reload();
};

const viewAssignments = () => {
  showAssignmentsModal.value = true;
};

const handleTestAssigned = () => {
  // Optionally refresh assignments or show success message
  router.reload({ only: ['test'] });
};
</script>
