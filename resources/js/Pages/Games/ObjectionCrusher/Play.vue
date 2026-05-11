<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        🎯 Objection Crusher
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Stats Bar -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-sm text-gray-600">Games Played</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.games_played }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-sm text-gray-600">Best Score</div>
            <div class="text-2xl font-bold text-green-600">{{ stats.best_score }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-sm text-gray-600">Total Score</div>
            <div class="text-2xl font-bold text-blue-600">{{ stats.total_score }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-sm text-gray-600">Accuracy</div>
            <div class="text-2xl font-bold text-purple-600">{{ stats.accuracy }}%</div>
          </div>
        </div>

        <!-- Game Setup -->
        <div v-if="!gameStarted" class="bg-white rounded-lg shadow-lg p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Start New Game</h3>
          <p class="text-gray-600 mb-6">
            Match customer objections with the best professional responses. Test your sales skills!
          </p>

          <div class="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                v-model="gameSettings.difficulty"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="easy">Easy - Basic objections</option>
                <option value="medium">Medium - Common scenarios</option>
                <option value="hard">Hard - Complex situations</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Number of Pairs</label>
              <select
                v-model.number="gameSettings.count"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option :value="5">5 pairs - Quick game</option>
                <option :value="10">10 pairs - Standard</option>
                <option :value="15">15 pairs - Challenge</option>
              </select>
            </div>
          </div>

          <button
            @click="startGame"
            :disabled="loading"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:opacity-50"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>🎮 Start Game</span>
          </button>
        </div>

        <!-- Game Board -->
        <div v-else class="space-y-6">
          <!-- Game Header with Character -->
          <div class="bg-white rounded-lg shadow p-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-4">
                <!-- Animated Character -->
                <div class="text-5xl animate-bounce">
                  🎯
                </div>
                <div class="flex space-x-6">
                  <div>
                    <span class="text-sm text-gray-600">Score:</span>
                    <span class="text-xl font-bold text-purple-600 ml-2">{{ currentScore }}</span>
                  </div>
                  <div>
                    <span class="text-sm text-gray-600">Matches:</span>
                    <span class="text-xl font-bold text-green-600 ml-2">{{ correctMatches }}/{{ gameSettings.count }}</span>
                  </div>
                  <div>
                    <span class="text-sm text-gray-600">Time:</span>
                    <span class="text-xl font-bold text-blue-600 ml-2">{{ formatTime(elapsedTime) }}</span>
                  </div>
                </div>
              </div>
              <button
                @click="quitGame"
                class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Quit Game
              </button>
            </div>

            <!-- Progress Indicator -->
            <div class="mt-4 relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                :style="{ width: `${(correctMatches / gameSettings.count) * 100}%` }"
                class="absolute h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
              >
                <div class="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-2xl animate-pulse">
                  🎯
                </div>
              </div>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="grid grid-cols-2 gap-6">
            <!-- Objections Column -->
            <div class="space-y-3">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Customer Objections</h3>
              <div
                v-for="card in objectionCards"
                :key="card.id"
                @click="selectCard(card)"
                :class="[
                  'p-4 rounded-lg border-2 cursor-pointer transition-all',
                  card.matched ? 'bg-green-50 border-green-500 opacity-50' : 
                  selectedCard?.id === card.id ? 'bg-purple-100 border-purple-500 shadow-lg' :
                  'bg-white border-gray-300 hover:border-purple-300 hover:shadow'
                ]"
              >
                <div class="text-sm font-medium text-gray-900">
                  {{ card.text }}
                </div>
                <div v-if="card.matched" class="mt-2 text-xs text-green-600 font-medium">
                  ✓ Matched!
                </div>
              </div>
            </div>

            <!-- Responses Column -->
            <div class="space-y-3">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Professional Responses</h3>
              <div
                v-for="card in responseCards"
                :key="card.id"
                @click="selectCard(card)"
                :class="[
                  'p-4 rounded-lg border-2 cursor-pointer transition-all',
                  card.matched ? 'bg-green-50 border-green-500 opacity-50' : 
                  selectedCard?.id === card.id ? 'bg-purple-100 border-purple-500 shadow-lg' :
                  'bg-white border-gray-300 hover:border-purple-300 hover:shadow'
                ]"
              >
                <div class="text-sm font-medium text-gray-900">
                  {{ card.text }}
                </div>
                <div v-if="card.matched" class="mt-2 text-xs text-green-600 font-medium">
                  ✓ Matched!
                </div>
              </div>
            </div>
          </div>

          <!-- Feedback Message -->
          <div v-if="feedbackMessage" :class="[
            'p-4 rounded-lg text-center font-medium',
            feedbackMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]">
            {{ feedbackMessage.text }}
          </div>
        </div>

        <!-- Game Complete Modal -->
        <div v-if="gameComplete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h3 class="text-2xl font-bold text-gray-900 mb-4 text-center">🎉 Game Complete!</h3>
            
            <div class="space-y-3 mb-6">
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span class="text-gray-600">Final Score:</span>
                <span class="text-2xl font-bold text-purple-600">{{ currentScore }}</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span class="text-gray-600">Correct Matches:</span>
                <span class="text-xl font-bold text-green-600">{{ correctMatches }}/{{ gameSettings.count }}</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span class="text-gray-600">Accuracy:</span>
                <span class="text-xl font-bold text-blue-600">{{ Math.round((correctMatches / totalAttempts) * 100) }}%</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span class="text-gray-600">Time:</span>
                <span class="text-xl font-bold text-gray-900">{{ formatTime(elapsedTime) }}</span>
              </div>
            </div>

            <div class="flex space-x-4">
              <button
                @click="playAgain"
                class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Play Again
              </button>
              <button
                @click="viewLeaderboard"
                class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
  stats: Object
});

const gameSettings = ref({
  difficulty: 'medium',
  count: 10
});

const loading = ref(false);
const gameStarted = ref(false);
const gameComplete = ref(false);

const objectionCards = ref([]);
const responseCards = ref([]);
const selectedCard = ref(null);
const matches = ref([]);

const currentScore = ref(0);
const correctMatches = ref(0);
const totalAttempts = ref(0);
const elapsedTime = ref(0);
const feedbackMessage = ref(null);

let gameTimer = null;

const startGame = async () => {
  loading.value = true;
  
  try {
    const response = await axios.get(route('games.objection-crusher.cards'), {
      params: gameSettings.value
    });
    
    objectionCards.value = response.data.objections.map(c => ({ ...c, matched: false }));
    responseCards.value = response.data.responses.map(c => ({ ...c, matched: false }));
    
    gameStarted.value = true;
    elapsedTime.value = 0;
    currentScore.value = 0;
    correctMatches.value = 0;
    totalAttempts.value = 0;
    matches.value = [];
    
    // Start timer
    gameTimer = setInterval(() => {
      elapsedTime.value++;
    }, 1000);
    
  } catch (error) {
    console.error('Failed to start game:', error);
    alert('Failed to load game. Please try again.');
  } finally {
    loading.value = false;
  }
};

const selectCard = (card) => {
  if (card.matched) return;
  
  if (!selectedCard.value) {
    selectedCard.value = card;
  } else {
    if (selectedCard.value.id === card.id) {
      selectedCard.value = null;
      return;
    }
    
    if (selectedCard.value.type === card.type) {
      selectedCard.value = card;
      return;
    }
    
    checkMatch(selectedCard.value, card);
  }
};

const checkMatch = (card1, card2) => {
  const objection = card1.type === 'objection' ? card1 : card2;
  const response = card1.type === 'response' ? card1 : card2;
  
  totalAttempts.value++;
  
  if (response.objection_id === objection.id && response.is_correct) {
    // Correct match
    objection.matched = true;
    response.matched = true;
    correctMatches.value++;
    currentScore.value += 100;
    
    matches.value.push({
      objection_id: objection.id,
      response_id: response.id,
      is_correct: true
    });
    
    showFeedback('Correct! Great match! 🎉', 'success');
    
    if (correctMatches.value === gameSettings.value.count) {
      endGame();
    }
  } else {
    // Incorrect match
    currentScore.value = Math.max(0, currentScore.value - 10);
    
    matches.value.push({
      objection_id: objection.id,
      response_id: response.id,
      is_correct: false
    });
    
    showFeedback('Not quite right. Try again! 💪', 'error');
  }
  
  selectedCard.value = null;
};

const showFeedback = (text, type) => {
  feedbackMessage.value = { text, type };
  setTimeout(() => {
    feedbackMessage.value = null;
  }, 2000);
};

const endGame = async () => {
  clearInterval(gameTimer);
  
  try {
    await axios.post(route('games.objection-crusher.save'), {
      score: currentScore.value,
      correct_matches: correctMatches.value,
      total_attempts: totalAttempts.value,
      time_taken_seconds: elapsedTime.value,
      matches: matches.value
    });
    
    gameComplete.value = true;
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};

const quitGame = () => {
  if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
    clearInterval(gameTimer);
    gameStarted.value = false;
    gameComplete.value = false;
  }
};

const playAgain = () => {
  gameComplete.value = false;
  gameStarted.value = false;
  selectedCard.value = null;
  matches.value = [];
};

const viewLeaderboard = () => {
  router.visit(route('games.leaderboard', { game: 'objection_crusher' }));
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

onUnmounted(() => {
  if (gameTimer) {
    clearInterval(gameTimer);
  }
});
</script>
