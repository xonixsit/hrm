<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="$emit('close')">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ question ? 'Edit Question' : 'Add Question' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="saveQuestion" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
          <select v-model="form.type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="mcq">Multiple Choice</option>
            <option value="single_answer">Single Answer</option>
            <option value="text">Text Answer</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
          <textarea
            v-model="form.question_text"
            rows="3"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Points</label>
          <input
            v-model.number="form.points"
            type="number"
            min="1"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <!-- Options for MCQ/Single Answer -->
        <div v-if="form.type !== 'text'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
          <div class="space-y-2">
            <div v-for="(option, index) in form.options" :key="index" class="flex items-center space-x-2">
              <input
                v-model="option.option_text"
                type="text"
                placeholder="Option text"
                required
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <label class="flex items-center">
                <input
                  v-if="form.type === 'single_answer'"
                  type="radio"
                  :name="'correct'"
                  :checked="option.is_correct"
                  @change="setCorrectOption(index)"
                  class="mr-2"
                />
                <input
                  v-else
                  v-model="option.is_correct"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm text-gray-600">Correct</span>
              </label>
              <button
                v-if="form.options.length > 2"
                type="button"
                @click="removeOption(index)"
                class="text-red-600 hover:text-red-700"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <button
            type="button"
            @click="addOption"
            class="mt-2 text-sm text-teal-600 hover:text-teal-700"
          >
            + Add Option
          </button>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="form.processing"
            class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {{ form.processing ? 'Saving...' : 'Save Question' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
  question: {
    type: Object,
    default: null
  },
  testId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close', 'saved']);

const form = useForm({
  type: props.question?.type || 'mcq',
  question_text: props.question?.question_text || '',
  points: props.question?.points || 1,
  options: props.question?.options || [
    { option_text: '', explanation: '', is_correct: false, order: 1 },
    { option_text: '', explanation: '', is_correct: false, order: 2 }
  ],
  text_config: props.question?.text_config || {
    min_characters: 50,
    max_characters: 500,
    expected_answer_guidelines: ''
  }
});

watch(() => form.type, (newType) => {
  if (newType === 'text') {
    form.options = [];
  } else if (form.options.length === 0) {
    form.options = [
      { option_text: '', explanation: '', is_correct: false, order: 1 },
      { option_text: '', explanation: '', is_correct: false, order: 2 }
    ];
  }
});

const addOption = () => {
  form.options.push({ 
    option_text: '', 
    explanation: '', 
    is_correct: false, 
    order: form.options.length + 1 
  });
};

const removeOption = (index) => {
  form.options.splice(index, 1);
  // Update order for remaining options
  form.options.forEach((opt, idx) => {
    opt.order = idx + 1;
  });
};

const setCorrectOption = (index) => {
  form.options.forEach((opt, i) => {
    opt.is_correct = i === index;
  });
};

const saveQuestion = () => {
  // Prepare data based on question type
  let submitData = {
    type: form.type,
    question_text: form.question_text,
    points: form.points,
  };
  
  // Add type-specific data
  if (form.type === 'text') {
    submitData.text_config = {
      min_characters: form.text_config.min_characters || 50,
      max_characters: form.text_config.max_characters || 500,
      expected_answer_guidelines: form.text_config.expected_answer_guidelines || ''
    };
  } else {
    submitData.options = form.options;
  }
  
  console.log('Submitting question:', submitData);
  
  if (props.question) {
    form.transform(() => submitData).patch(route('skill-tests.questions.update', { skillTest: props.testId, question: props.question.id }), {
      preserveState: false,
      onSuccess: () => {
        console.log('Question updated successfully');
        emit('saved');
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
      },
    });
  } else {
    form.transform(() => submitData).post(route('skill-tests.questions.store', props.testId), {
      preserveState: false,
      onSuccess: () => {
        console.log('Question created successfully');
        emit('saved');
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
      },
    });
  }
};
</script>
