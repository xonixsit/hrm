<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        🏆 Game Leaderboard
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Game & Period Selector -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Game</label>
              <select
                :value="game_type"
                @change="changeGame($event.target.value)"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="objection_crusher">🎯 Objection Crusher</option>
                <option value="tax_trivia">🏢 Tax Trivia Tower</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <select
                :value="period"
                @change="changePeriod($event.target.value)"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="all_time">All Time</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Leaderboard Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ game_type === 'objection_crusher' ? 'Objection Crusher' : 'Tax Trivia Tower' }} - 
              {{ period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : 'All Time' }}
            </h3>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th v-if="game_type === 'objection_crusher'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Score
                  </th>
                  <th v-if="game_type === 'objection_crusher'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Best Score
                  </th>
                  <th v-if="game_type === 'tax_trivia'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Best Floors
                  </th>
                  <th v-if="game_type === 'tax_trivia'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Correct
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Games Played
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="entry in leaderboard" :key="entry.rank" :class="entry.rank <= 3 ? 'bg-yellow-50' : ''">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span v-if="entry.rank === 1" class="text-2xl">🥇</span>
                      <span v-else-if="entry.rank === 2" class="text-2xl">🥈</span>
                      <span v-else-if="entry.rank === 3" class="text-2xl">🥉</span>
                      <span v-else class="text-lg font-semibold text-gray-700">{{ entry.rank }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div v-if="entry.profile_pic" class="h-10 w-10 rounded-full overflow-hidden mr-3">
                        <img :src="`/${entry.profile_pic}`" :alt="entry.employee_name" class="h-full w-full object-cover" />
                      </div>
                      <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span class="text-sm font-medium text-gray-600">{{ getInitials(entry.employee_name) }}</span>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ entry.employee_name }}</div>
                        <div class="text-sm text-gray-500">{{ entry.employee_code }}</div>
                      </div>
                    </div>
                  </td>
                  <td v-if="game_type === 'objection_crusher'" class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-purple-600">{{ entry.total_score }}</div>
                  </td>
                  <td v-if="game_type === 'objection_crusher'" class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-green-600">{{ entry.best_score }}</div>
                  </td>
                  <td v-if="game_type === 'tax_trivia'" class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-blue-600">{{ entry.best_floors }}</div>
                  </td>
                  <td v-if="game_type === 'tax_trivia'" class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-green-600">{{ entry.total_correct }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ entry.games_played }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="leaderboard.length === 0" class="px-6 py-12 text-center text-gray-500">
            No games played yet for this period. Be the first!
          </div>
        </div>

        <!-- Play Game Buttons -->
        <div class="mt-6 grid grid-cols-2 gap-4">
          <button
            @click="playObjectionCrusher"
            class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg"
          >
            🎯 Play Objection Crusher
          </button>
          <button
            @click="playTaxTrivia"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg"
          >
            🏢 Play Tax Trivia Tower
          </button>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
  leaderboard: Array,
  game_type: String,
  period: String
});

const changeGame = (game) => {
  router.visit(route('games.leaderboard', { game, period: props.period }));
};

const changePeriod = (period) => {
  router.visit(route('games.leaderboard', { game: props.game_type, period }));
};

const playObjectionCrusher = () => {
  router.visit(route('games.objection-crusher'));
};

const playTaxTrivia = () => {
  router.visit(route('games.tax-trivia'));
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};
</script>
