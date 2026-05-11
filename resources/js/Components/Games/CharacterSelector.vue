<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
        <div>
          <div class="text-center">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">
              Choose Your Character
            </h3>
            <p class="text-sm text-gray-600 mb-6">
              Select an avatar that represents you in the game
            </p>
          </div>

          <!-- Character Grid -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <button
              v-for="char in characters"
              :key="char.id"
              @click="selectCharacter(char.id)"
              :class="[
                'relative p-4 rounded-xl border-3 transition-all duration-200 hover:scale-105',
                selectedCharacter === char.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-500'
                  : 'border-gray-300 hover:border-blue-300 hover:shadow-md'
              ]"
            >
              <div class="flex flex-col items-center">
                <CharacterAvatar :character="char.id" :size="100" />
                <span class="mt-2 text-sm font-medium text-gray-900">{{ char.name }}</span>
                <span class="text-xs text-gray-500">{{ char.description }}</span>
              </div>
              
              <!-- Selected checkmark -->
              <div v-if="selectedCharacter === char.id" class="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>

          <!-- Action buttons -->
          <div class="flex space-x-3">
            <button
              @click="$emit('close')"
              class="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              @click="confirmSelection"
              :disabled="!selectedCharacter"
              class="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CharacterAvatar from './CharacterAvatar.vue';

const props = defineProps({
  show: Boolean,
  initialCharacter: {
    type: String,
    default: 'male-professional'
  }
});

const emit = defineEmits(['close', 'select']);

const characters = [
  {
    id: 'male-professional',
    name: 'Professional',
    description: 'Business attire'
  },
  {
    id: 'female-professional',
    name: 'Executive',
    description: 'Elegant style'
  },
  {
    id: 'young-male',
    name: 'Casual',
    description: 'Relaxed look'
  },
  {
    id: 'young-female',
    name: 'Modern',
    description: 'Trendy style'
  },
  {
    id: 'athlete-male',
    name: 'Sporty',
    description: 'Athletic wear'
  },
  {
    id: 'athlete-female',
    name: 'Active',
    description: 'Fitness style'
  }
];

const selectedCharacter = ref(props.initialCharacter);

const selectCharacter = (characterId) => {
  selectedCharacter.value = characterId;
};

const confirmSelection = () => {
  emit('select', selectedCharacter.value);
  emit('close');
};
</script>

<style scoped>
.border-3 {
  border-width: 3px;
}
</style>
