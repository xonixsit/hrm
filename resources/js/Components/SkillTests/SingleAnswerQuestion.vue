<template>
  <div class="space-y-4">
    <!-- Debug info -->
    <div v-if="!question.options || question.options.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <p class="text-sm text-yellow-800">No options available for this question</p>
    </div>

    <div class="space-y-3">
      <label
        v-for="option in question.options"
        :key="option.id"
        class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
        :class="{
          'border-teal-500 bg-teal-50': isSelected(option.id),
          'border-gray-200': !isSelected(option.id)
        }"
      >
        <input
          type="radio"
          :name="`question-${question.id}`"
          :value="option.id"
          :checked="isSelected(option.id)"
          @change="selectOption(option.id)"
          class="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
        />
        <span class="ml-3 text-gray-900">{{ option.option_text }}</span>
      </label>
    </div>

    <p class="text-xs text-gray-500 mt-2">
      Select one answer
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

const selectedOption = computed(() => {
  const options = props.answer.selected_options || [];
  return options.length > 0 ? options[0] : null;
});

const isSelected = (optionId) => {
  return selectedOption.value === optionId;
};

const selectOption = (optionId) => {
  emit('update', {
    question_id: props.question.id,
    selected_options: [optionId],
    answer_text: null
  });
};
</script>
