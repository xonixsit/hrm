<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight flex items-center gap-2">
          <!-- Coin Stack Icon -->
          <div class="relative inline-block" style="width: 32px; height: 32px;">
            <!-- Back coin -->
            <svg class="absolute" style="left: 8px; top: 0px;" width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="coinGradientHeader1" cx="30%" cy="30%">
                  <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                  <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                  <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#coinGradientHeader1)" stroke="#8b6914" stroke-width="2" opacity="0.7"/>
              <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
            </svg>
            <!-- Middle coin -->
            <svg class="absolute" style="left: 4px; top: 4px;" width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="coinGradientHeader2" cx="30%" cy="30%">
                  <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                  <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                  <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#coinGradientHeader2)" stroke="#8b6914" stroke-width="2" opacity="0.85"/>
              <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
            </svg>
            <!-- Front coin -->
            <svg class="absolute" style="left: 0px; top: 8px;" width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="coinGradientHeader3" cx="30%" cy="30%">
                  <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                  <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                  <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#coinGradientHeader3)" stroke="#8b6914" stroke-width="2"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#cc7000" stroke-width="1.5" opacity="0.6"/>
              <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
              <ellipse cx="35" cy="35" rx="15" ry="10" fill="white" opacity="0.4"/>
            </svg>
          </div>
          Tax Trivia - Earn Coins!
        </h2>
        
        <!-- Total Coins Display -->
        <div class="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-2 rounded-full shadow-lg">
          <div class="relative" style="width: 40px; height: 40px;">
            <!-- Stacked coins -->
            <svg class="absolute" style="left: 10px; top: 0px;" width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="coinStackHeader1" cx="30%" cy="30%">
                  <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                  <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                  <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#coinStackHeader1)" stroke="#8b6914" stroke-width="2" opacity="0.6"/>
              <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
            </svg>
            <svg class="absolute" style="left: 5px; top: 5px;" width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="coinStackHeader2" cx="30%" cy="30%">
                  <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                  <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                  <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#coinStackHeader2)" stroke="#8b6914" stroke-width="2" opacity="0.8"/>
              <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
            </svg>
            <svg class="absolute" style="left: 0px; top: 10px;" width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="coinStackHeader3" cx="30%" cy="30%">
                  <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                  <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                  <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#coinStackHeader3)" stroke="#8b6914" stroke-width="2"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#cc7000" stroke-width="1.5" opacity="0.6"/>
              <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
              <ellipse cx="35" cy="35" rx="15" ry="10" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <div class="text-white">
            <div class="text-xs font-medium opacity-90">Total Coins</div>
            <div class="text-2xl font-bold">{{ stats.total_coins || 0 }}</div>
          </div>
        </div>
      </div>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Coin Animation Container -->
        <div class="coin-animation-container"></div>
        
        <!-- Stats Bar -->
        <div class="grid grid-cols-5 gap-4 mb-6">
          <div class="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-4 text-white">
            <div class="text-sm font-medium opacity-90">Total Coins</div>
            <div class="text-3xl font-bold flex items-center gap-2">
              <div class="relative" style="width: 50px; height: 50px;">
                <!-- Stacked coins -->
                <svg class="absolute" style="left: 12px; top: 0px;" width="38" height="38" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="coinStackStats1" cx="30%" cy="30%">
                      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                      <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                      <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                    </radialGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" fill="url(#coinStackStats1)" stroke="#8b6914" stroke-width="2" opacity="0.6"/>
                  <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
                </svg>
                <svg class="absolute" style="left: 6px; top: 6px;" width="38" height="38" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="coinStackStats2" cx="30%" cy="30%">
                      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                      <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                      <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                    </radialGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" fill="url(#coinStackStats2)" stroke="#8b6914" stroke-width="2" opacity="0.8"/>
                  <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
                </svg>
                <svg class="absolute" style="left: 0px; top: 12px;" width="38" height="38" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="coinStackStats3" cx="30%" cy="30%">
                      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                      <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                      <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                    </radialGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" fill="url(#coinStackStats3)" stroke="#8b6914" stroke-width="2"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#cc7000" stroke-width="1.5" opacity="0.6"/>
                  <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
                  <ellipse cx="35" cy="35" rx="15" ry="10" fill="white" opacity="0.4"/>
                </svg>
              </div>
              {{ stats.total_coins || 0 }}
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-sm text-gray-600">Games Played</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.games_played }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-sm text-gray-600">Best Score</div>
            <div class="text-2xl font-bold text-green-600">{{ stats.best_score }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-sm text-gray-600">Total Questions</div>
            <div class="text-2xl font-bold text-blue-600">{{ stats.total_questions }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-sm text-gray-600">Accuracy</div>
            <div class="text-2xl font-bold text-purple-600">{{ stats.accuracy }}%</div>
          </div>
        </div>

        <!-- Game Setup -->
        <div v-if="!gameStarted" class="bg-white rounded-lg shadow-lg p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Earn Coins with Tax Trivia!</h3>
          <p class="text-gray-600 mb-6">
            Answer tax questions correctly to earn coins. Each correct answer earns you <span class="font-bold text-green-600">+10 coins</span>, 
            while wrong answers cost you <span class="font-bold text-red-600">-5 coins</span>.
          </p>

          <div class="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                v-model="gameSettings.difficulty"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="easy">Easy - Basic concepts</option>
                <option value="medium">Medium - Standard knowledge</option>
                <option value="hard">Hard - Expert level</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Questions</label>
              <select
                v-model.number="gameSettings.count"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option :value="10">10 questions</option>
                <option :value="15">15 questions</option>
                <option :value="20">20 questions</option>
              </select>
            </div>
          </div>

          <button
            @click="startGame"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:opacity-50"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>🎮 Start Game</span>
          </button>
        </div>

        <!-- Game Board -->
        <div v-else-if="!gameComplete" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Coin Display -->
          <div class="lg:col-span-1">
            <div class="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg shadow-2xl p-8 sticky top-6">
              <div class="text-center mb-6">
                <div class="text-white text-sm font-medium mb-2">Coins This Game</div>
                <div class="text-6xl font-bold text-white mb-4 coin-counter-target flex items-center justify-center gap-3">
                  <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="coinGradientGame" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                        <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                        <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                      </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#coinGradientGame)" stroke="#8b6914" stroke-width="2"/>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#cc7000" stroke-width="1.5" opacity="0.6"/>
                    <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
                    <ellipse cx="35" cy="35" rx="15" ry="10" fill="white" opacity="0.4"/>
                  </svg>
                  {{ coinsThisGame >= 0 ? '+' : '' }}{{ coinsThisGame }}
                </div>
                <div class="text-yellow-100 text-sm">
                  Total: {{ stats.total_coins + coinsThisGame }} coins
                </div>
              </div>

              <div class="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center text-white mb-2">
                  <span class="text-sm">Progress:</span>
                  <span class="font-bold">{{ currentQuestion }}/{{ questions.length }}</span>
                </div>
                <div class="w-full bg-white/30 rounded-full h-3">
                  <div 
                    class="bg-white rounded-full h-3 transition-all duration-300"
                    :style="{ width: (currentQuestion / questions.length * 100) + '%' }"
                  ></div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="bg-green-500/30 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div class="text-white text-xs mb-1">Correct</div>
                  <div class="text-white text-2xl font-bold">{{ correctAnswers }}</div>
                  <div class="text-green-100 text-xs">+{{ correctAnswers * 10 }} coins</div>
                </div>
                <div class="bg-red-500/30 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div class="text-white text-xs mb-1">Wrong</div>
                  <div class="text-white text-2xl font-bold">{{ currentQuestion - correctAnswers }}</div>
                  <div class="text-red-100 text-xs">{{ (currentQuestion - correctAnswers) * -5 }} coins</div>
                </div>
              </div>

              <div class="mt-6 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div class="flex justify-between items-center text-white">
                  <span class="text-sm">Time:</span>
                  <span class="font-bold text-lg">{{ formatTime(elapsedTime) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Question Card -->
          <div class="lg:col-span-2">
            <div v-if="currentQuestionData" class="bg-white rounded-lg shadow-lg p-8">
              <div class="mb-2 text-sm text-gray-500">
                Question {{ currentQuestion }} of {{ questions.length }}
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-6">
                {{ currentQuestionData.question }}
              </h3>

              <div class="space-y-3">
                <button
                  v-for="option in currentQuestionData.options"
                  :key="option.id"
                  @click="selectAnswer(option)"
                  :disabled="answerSelected"
                  :class="[
                    'w-full p-4 rounded-lg border-2 text-left transition-all',
                    answerSelected && option.id === selectedOption?.id && option.is_correct ? 'bg-green-100 border-green-500' :
                    answerSelected && option.id === selectedOption?.id && !option.is_correct ? 'bg-red-100 border-red-500' :
                    answerSelected && option.is_correct ? 'bg-green-50 border-green-300' :
                    'bg-white border-gray-300 hover:border-blue-400 hover:shadow'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-medium">{{ option.text }}</span>
                    <span v-if="answerSelected && option.id === selectedOption?.id && option.is_correct" class="text-green-600 text-xl flex items-center gap-1">
                      ✓ +10 
                      <svg class="inline-block" width="20" height="20" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <radialGradient id="coinGradientCorrect" cx="30%" cy="30%">
                            <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                          </radialGradient>
                        </defs>
                        <circle cx="50" cy="50" r="48" fill="url(#coinGradientCorrect)" stroke="#8b6914" stroke-width="2"/>
                        <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
                      </svg>
                    </span>
                    <span v-if="answerSelected && option.id === selectedOption?.id && !option.is_correct" class="text-red-600 text-xl flex items-center gap-1">
                      ✗ -5 
                      <svg class="inline-block" width="20" height="20" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <radialGradient id="coinGradientWrong" cx="30%" cy="30%">
                            <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                          </radialGradient>
                        </defs>
                        <circle cx="50" cy="50" r="48" fill="url(#coinGradientWrong)" stroke="#8b6914" stroke-width="2"/>
                        <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
                      </svg>
                    </span>
                  </div>
                </button>
              </div>

              <!-- Explanation -->
              <div v-if="answerSelected && currentQuestionData.explanation" class="mt-6 p-4 bg-blue-50 rounded-lg">
                <div class="text-sm font-medium text-blue-900 mb-1">Explanation:</div>
                <div class="text-sm text-blue-800">{{ currentQuestionData.explanation }}</div>
              </div>

              <!-- Next Button -->
              <button
                v-if="answerSelected"
                @click="nextQuestion"
                class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                {{ currentQuestion < questions.length ? 'Next Question →' : 'Finish Game' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Game Complete Modal -->
        <div v-if="gameComplete" class="bg-white rounded-lg shadow-xl p-8">
          <h3 class="text-3xl font-bold text-gray-900 mb-6 text-center">
            🎉 Game Complete!
          </h3>
          
          <div class="text-center mb-6">
            <div class="inline-block bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-8 shadow-2xl">
              <div class="text-white text-sm font-medium mb-2">Coins Earned</div>
              <div class="text-7xl font-bold text-white mb-2 flex items-center justify-center gap-4">
                {{ coinsThisGame >= 0 ? '+' : '' }}{{ coinsThisGame }}
                <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="coinGradientFinal" cx="30%" cy="30%">
                      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                      <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
                      <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                    </radialGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" fill="url(#coinGradientFinal)" stroke="#8b6914" stroke-width="2"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#cc7000" stroke-width="1.5" opacity="0.6"/>
                  <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
                  <ellipse cx="35" cy="35" rx="15" ry="10" fill="white" opacity="0.4"/>
                </svg>
              </div>
              <div class="text-yellow-100 text-lg">
                Total: {{ stats.total_coins + coinsThisGame }} coins
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div class="text-sm text-green-700 mb-1">Correct Answers</div>
              <div class="text-3xl font-bold text-green-600">{{ correctAnswers }}</div>
              <div class="text-sm text-green-600">+{{ correctAnswers * 10 }} coins</div>
            </div>
            <div class="p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div class="text-sm text-red-700 mb-1">Wrong Answers</div>
              <div class="text-3xl font-bold text-red-600">{{ questions.length - correctAnswers }}</div>
              <div class="text-sm text-red-600">{{ (questions.length - correctAnswers) * -5 }} coins</div>
            </div>
          </div>

          <div class="space-y-3 mb-6">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span class="text-gray-600">Accuracy:</span>
              <span class="text-xl font-bold text-blue-600">{{ Math.round((correctAnswers / questions.length) * 100) }}%</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span class="text-gray-600">Time:</span>
              <span class="text-xl font-bold text-gray-900">{{ formatTime(elapsedTime) }}</span>
            </div>
          </div>

          <div class="flex space-x-4">
            <button
              @click="playAgain"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
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
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import confetti from 'canvas-confetti';
import { gsap } from 'gsap';

const props = defineProps({
  stats: Object
});

const gameSettings = ref({
  difficulty: 'medium',
  count: 15
});

const loading = ref(false);
const gameStarted = ref(false);
const gameComplete = ref(false);

const questions = ref([]);
const currentQuestion = ref(0);
const correctAnswers = ref(0);
const coinsThisGame = ref(0);
const answers = ref([]);
const elapsedTime = ref(0);

const answerSelected = ref(false);
const selectedOption = ref(null);

let gameTimer = null;

const currentQuestionData = computed(() => {
  return questions.value[currentQuestion.value] || null;
});

const startGame = async () => {
  loading.value = true;
  
  try {
    const response = await axios.get(route('games.tax-trivia.questions'), {
      params: gameSettings.value
    });
    
    questions.value = response.data.questions;
    gameStarted.value = true;
    currentQuestion.value = 0;
    correctAnswers.value = 0;
    coinsThisGame.value = 0;
    answers.value = [];
    elapsedTime.value = 0;
    
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

const selectAnswer = async (option) => {
  if (answerSelected.value) return;
  
  answerSelected.value = true;
  selectedOption.value = option;
  
  const isCorrect = option.is_correct;
  
  answers.value.push({
    question_id: currentQuestionData.value.id,
    selected_option_id: option.id,
    is_correct: isCorrect
  });
  
  await nextTick();
  
  if (isCorrect) {
    correctAnswers.value++;
    
    // Animate coins flying up
    animateCoinsFlying(10, true);
    
    // Update total after animation
    setTimeout(() => {
      coinsThisGame.value += 10;
    }, 800);
    
    // Confetti
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FFFF00']
    });
  } else {
    // Animate coins flying down (losing coins)
    animateCoinsFlying(-5, false);
    
    setTimeout(() => {
      coinsThisGame.value -= 5;
    }, 800);
  }
};

const animateCoinsFlying = (amount, isPositive) => {
  const coinCount = Math.abs(amount);
  const container = document.querySelector('.coin-animation-container');
  
  if (!container) return;
  
  for (let i = 0; i < coinCount; i++) {
    setTimeout(() => {
      const coin = document.createElement('div');
      coin.className = 'flying-coin';
      
      // Create realistic 3D coin with SVG
      coin.innerHTML = `
        <svg class="coin-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="coinGradient${i}" cx="30%" cy="30%">
              <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
              <stop offset="30%" style="stop-color:#ffed4e;stop-opacity:1" />
              <stop offset="60%" style="stop-color:#ffa500;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
            </radialGradient>
            <filter id="coinShadow${i}">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="2" dy="4" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <!-- Outer ring -->
          <circle cx="50" cy="50" r="48" fill="url(#coinGradient${i})" stroke="#8b6914" stroke-width="2" filter="url(#coinShadow${i})"/>
          
          <!-- Inner ring -->
          <circle cx="50" cy="50" r="42" fill="none" stroke="#cc7000" stroke-width="1.5" opacity="0.6"/>
          
          <!-- Dollar sign -->
          <text x="50" y="65" font-family="Arial Black, sans-serif" font-size="45" font-weight="bold" fill="#8b6914" text-anchor="middle">$</text>
          
          <!-- Highlight -->
          <ellipse cx="35" cy="35" rx="15" ry="10" fill="white" opacity="0.4"/>
        </svg>
      `;
      
      coin.style.cssText = `
        position: fixed;
        width: 50px;
        height: 50px;
        pointer-events: none;
        z-index: 9999;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      `;
      
      container.appendChild(coin);
      
      // Get target position (coin counter at top)
      const targetElement = document.querySelector('.coin-counter-target');
      const targetRect = targetElement?.getBoundingClientRect();
      
      if (targetRect) {
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;
        const endX = targetRect.left + targetRect.width / 2;
        const endY = targetRect.top + targetRect.height / 2;
        
        // Animate coin flying to target
        gsap.to(coin, {
          x: endX - startX + (Math.random() - 0.5) * 50,
          y: endY - startY + (Math.random() - 0.5) * 30,
          scale: isPositive ? 1.2 : 0.5,
          rotationY: 1080, // 3D rotation
          rotationZ: 360,
          opacity: isPositive ? 1 : 0.3,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => {
            // Pulse effect on target
            if (targetElement) {
              gsap.fromTo(targetElement, 
                { scale: 1 },
                { 
                  scale: 1.15, 
                  duration: 0.1, 
                  yoyo: true, 
                  repeat: 1,
                  ease: 'power2.inOut'
                }
              );
            }
            coin.remove();
          }
        });
        
        // Add arc motion
        gsap.to(coin, {
          y: endY - startY - 100,
          duration: 0.4,
          ease: 'power1.out'
        });
      }
    }, i * 100);
  }
};

const nextQuestion = () => {
  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++;
    answerSelected.value = false;
    selectedOption.value = null;
  } else {
    endGame();
  }
};

const endGame = async () => {
  clearInterval(gameTimer);
  
  // Victory confetti
  if (correctAnswers.value > questions.value.length / 2) {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#FFFF00']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#FFFF00']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }
  
  try {
    await axios.post(route('games.tax-trivia.save'), {
      score: correctAnswers.value,
      floors_climbed: correctAnswers.value,
      correct_answers: correctAnswers.value,
      total_questions: questions.value.length,
      time_taken_seconds: elapsedTime.value,
      answers: answers.value
    });
    
    gameComplete.value = true;
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};

const playAgain = () => {
  gameComplete.value = false;
  gameStarted.value = false;
  router.reload({ only: ['stats'] });
};

const viewLeaderboard = () => {
  router.visit(route('games.leaderboard', { game: 'tax_trivia' }));
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<style>
/* Global styles for flying coins - must be unscoped for dynamic elements */
.flying-coin {
  animation: coinPulse 0.3s ease-in-out;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.coin-svg {
  width: 100%;
  height: 100%;
  display: block;
}

@keyframes coinPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>

<style scoped>
.coin-counter-target {
  transition: all 0.3s ease;
}
</style>
