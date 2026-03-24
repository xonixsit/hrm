<template>
  <div class="space-y-4">
    <div>
      <textarea
        :value="answerText"
        @input="updateText"
        rows="8"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        placeholder="Type your answer here..."
      ></textarea>
    </div>

    <p class="text-xs text-gray-500">
      Provide a detailed text answer
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  answer: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update']);

const answerText = computed(() => props.answer.answer_text || '');

const updateText = (event) => {
  emit('update', {
    question_id: props.question.id,
    selected_options: [],
    answer_text: event.target.value
  });
};
</script>
