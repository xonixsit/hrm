<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Feedback Management"
      subtitle="Manage and review team feedback submissions"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 text-gray-900">
          <!-- Header Actions -->
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Feedback Submissions</h3>
              <p class="mt-1 text-sm text-gray-600">
                View and manage team feedback submissions.
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Sentiment Filter (Icon + Text) -->
              <div class="flex items-center space-x-2">
                <div class="flex space-x-2">
                  <button
                    @click="toggleSentiment('positive')"
                    :class="getSentimentFilterClasses('positive')"
                    class="inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Positive (4-5 stars)"
                  >
                    <span class="text-base mr-2">😊</span>
                    Positive
                  </button>
                  
                  <button
                    @click="toggleSentiment('neutral')"
                    :class="getSentimentFilterClasses('neutral')"
                    class="inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Neutral (3 stars)"
                  >
                    <span class="text-base mr-2">😐</span>
                    Neutral
                  </button>
                  
                  <button
                    @click="toggleSentiment('negative')"
                    :class="getSentimentFilterClasses('negative')"
                    class="inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Negative (1-2 stars)"
                  >
                    <span class="text-base mr-2">😞</span>
                    Negative
                  </button>
                </div>
              </div>
              
              <!-- Show More Filters Button -->
              <button
                @click="showFilters = !showFilters"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                {{ showFilters ? 'Hide More Filters' : 'More Filters' }}
              </button>
            </div>
          </div>

          <!-- Feedback Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div class="bg-blue-50 rounded-lg p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Feedbacks</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ feedbackStats.total || 0 }}</p>
                </div>
              </div>
            </div>

            <div class="bg-green-50 rounded-lg p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Average Rating</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ feedbackStats.averageRating || '0.0' }}</p>
                </div>
              </div>
            </div>

            <div class="bg-amber-50 rounded-lg p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">This Month</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ feedbackStats.thisMonth || 0 }}</p>
                </div>
              </div>
            </div>

            <div class="bg-purple-50 rounded-lg p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Positive Sentiment</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ feedbackStats.positiveTrend || '0%' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Filter Controls -->
          <div v-if="showFilters" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <!-- Search Field (integrated) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    v-model="localFilters.search"
                    type="text"
                    placeholder="Search..."
                    class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    @input="debouncedApplyFilters"
                  />
                </div>
              </div>
              <!-- Rating Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  v-model="localFilters.rating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  @change="applyFilters"
                >
                  <option value="">All ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <!-- Period Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  v-model="localFilters.period"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  @change="applyFilters"
                >
                  <option value="">All periods</option>
                  <option value="Q1 2024">Q1 2024</option>
                  <option value="Q2 2024">Q2 2024</option>
                  <option value="Q3 2024">Q3 2024</option>
                  <option value="Q4 2024">Q4 2024</option>
                </select>
              </div>

              <!-- Date From -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  v-model="localFilters.date_from"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  @change="applyFilters"
                />
              </div>

              <!-- Date To -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  v-model="localFilters.date_to"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  @change="applyFilters"
                />
              </div>
            </div>

            <!-- Active Filters -->
            <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
              <span class="text-sm font-medium text-gray-700">Active filters:</span>
              
              <!-- Search Filter -->
              <span 
                v-if="localFilters.search"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                Search: "{{ localFilters.search }}"
                <button 
                  @click="clearFilter('search')"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none"
                >
                  <span class="sr-only">Remove search filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <span 
                v-if="localFilters.rating"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                Rating: {{ localFilters.rating }} Stars
                <button 
                  @click="clearFilter('rating')"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                >
                  <span class="sr-only">Remove rating filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <span 
                v-if="localFilters.period"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                Period: {{ localFilters.period }}
                <button 
                  @click="clearFilter('period')"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
                >
                  <span class="sr-only">Remove period filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <span 
                v-if="localFilters.date_from"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                From: {{ formatDate(localFilters.date_from) }}
                <button 
                  @click="clearFilter('date_from')"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                >
                  <span class="sr-only">Remove date from filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <span 
                v-if="localFilters.date_to"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                To: {{ formatDate(localFilters.date_to) }}
                <button 
                  @click="clearFilter('date_to')"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                >
                  <span class="sr-only">Remove date to filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <!-- Sentiment Filters -->
              <span 
                v-for="sentiment in localFilters.sentiments" 
                :key="sentiment"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getSentimentActiveFilterClasses(sentiment)"
              >
                {{ getSentimentDisplayName(sentiment) }}
                <button 
                  @click="removeSentiment(sentiment)"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-opacity-20 focus:outline-none"
                  :class="getSentimentActiveFilterButtonClasses(sentiment)"
                >
                  <span class="sr-only">Remove {{ sentiment }} sentiment filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <button 
                @click="resetFilters"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
          </div>

          <!-- Feedbacks Table -->
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewee
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sentiment
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="feedback in feedbacks.data" :key="feedback.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-700">
                            {{ getInitials(feedback.reviewer?.name || '') }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">
                          {{ feedback.reviewer?.name || 'N/A' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-700">
                            {{ getInitials(feedback.reviewee?.name || '') }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">
                          {{ feedback.reviewee?.name || 'N/A' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ feedback.period || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex items-center">
                      <div class="flex items-center">
                        <svg v-for="star in 5" :key="star" 
                             :class="star <= (feedback.rating || 0) ? 'text-yellow-400' : 'text-gray-300'"
                             class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <span class="ml-2 text-sm text-gray-600">({{ feedback.rating || 0 }})</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getSentimentClasses(feedback.rating)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getSentimentText(feedback.rating) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(feedback.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end">
                      <!-- Unified Actions Menu -->
                      <div class="relative" :ref="el => setDropdownRef(el, feedback.id)">
                        <button
                          @click="toggleDropdown(feedback.id)"
                          class="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                          :title="'Actions'"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        
                        <!-- Unified Dropdown Menu -->
                        <div
                          v-if="activeDropdown === feedback.id"
                          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                        >
                          <!-- View Action (always available) -->
                          <Link
                            :href="route('feedbacks.show', feedback.id)"
                            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </Link>

                          <!-- Divider if there are management actions -->
                          <div v-if="canEdit(feedback) || canDelete(feedback)" class="border-t border-gray-100 my-1"></div>

                          <!-- Edit Action -->
                          <Link
                            v-if="canEdit(feedback)"
                            :href="route('feedbacks.edit', feedback.id)"
                            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Feedback
                          </Link>

                          <!-- Delete Action -->
                          <button
                            v-if="canDelete(feedback)"
                            @click="confirmDelete(feedback)"
                            class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                          >
                            <svg class="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Feedback
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="feedbacks.data.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No feedback submissions</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ hasActiveFilters ? 'Try adjusting your filters' : 'Get started by submitting your first feedback' }}
            </p>
            <div v-if="hasActiveFilters" class="mt-6">
              <Link 
                :href="route('feedbacks.create')" 
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Submit Feedback
              </Link>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="feedbacks.last_page > 1" class="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div class="flex flex-1 justify-between sm:hidden">
              <Link 
                v-if="feedbacks.prev_page_url"
                :href="feedbacks.prev_page_url" 
                class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </Link>
              <Link 
                v-if="feedbacks.next_page_url"
                :href="feedbacks.next_page_url" 
                class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </Link>
            </div>
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing
                  <span class="font-medium">{{ feedbacks.from }}</span>
                  to
                  <span class="font-medium">{{ feedbacks.to }}</span>
                  of
                  <span class="font-medium">{{ feedbacks.total }}</span>
                  results
                </p>
              </div>
              <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <Link 
                    v-if="feedbacks.prev_page_url"
                    :href="feedbacks.prev_page_url"
                    class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span class="sr-only">Previous</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                    </svg>
                  </Link>
                  
                  <template v-for="link in feedbacks.links" :key="link.label">
                    <Link 
                      v-if="link.url && !link.label.includes('Previous') && !link.label.includes('Next')"
                      :href="link.url"
                      :class="[
                        'relative inline-flex items-center px-4 py-2 text-sm font-semibold',
                        link.active 
                          ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      ]"
                    >
                      {{ link.label }}
                    </Link>
                  </template>
                  
                  <Link 
                    v-if="feedbacks.next_page_url"
                    :href="feedbacks.next_page_url"
                    class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span class="sr-only">Next</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                    </svg>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showDeleteModal = false"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Delete Feedback
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Are you sure you want to delete this feedback? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                @click="deleteFeedback" 
                type="button" 
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button 
                @click="showDeleteModal = false" 
                type="button" 
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { debounce } from 'lodash';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import { useAuth } from '@/composables/useAuth.js';

const props = defineProps({
  feedbacks: {
    type: Object,
    required: true
  },
  queryParams: {
    type: Object,
    default: () => ({})
  },
  feedbackStats: {
    type: Object,
    default: () => ({})
  }
});

const { hasRole, hasAnyRole, user } = useAuth();

// Refs
const showDeleteModal = ref(false);
const showFilters = ref(false);
const loading = ref(false);
const feedbackToDelete = ref(null);
const activeDropdown = ref(null);
const dropdownRefs = ref({});
const localFilters = ref({
  search: props.queryParams.search || '',
  rating: props.queryParams.rating || '',
  sentiments: props.queryParams.sentiments ? props.queryParams.sentiments.split(',') : [],
  period: props.queryParams.period || '',
  date_from: props.queryParams.date_from || '',
  date_to: props.queryParams.date_to || ''
});

// Computed
const isAdminOrHR = computed(() => hasAnyRole(['Admin', 'HR']));

const hasActiveFilters = computed(() => {
  return (
    localFilters.value.search ||
    localFilters.value.rating ||
    localFilters.value.period ||
    localFilters.value.date_from ||
    localFilters.value.date_to ||
    localFilters.value.sentiments.length > 0
  );
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Feedback Management', current: true }
]);

const headerActions = computed(() => [
  {
    id: 'new-feedback',
    label: 'Submit Feedback',
    icon: 'plus',
    variant: 'primary',
    href: route('feedbacks.create')
  }
]);

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getInitials = (name) => {
  if (!name) return '--';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getSentimentClasses = (rating) => {
  if (rating >= 4) return 'bg-green-100 text-green-800';
  if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getSentimentText = (rating) => {
  if (rating >= 4) return 'Positive';
  if (rating >= 3) return 'Neutral';
  return 'Negative';
};

// Sentiment filter functions
const toggleSentiment = (sentiment) => {
  const index = localFilters.value.sentiments.indexOf(sentiment);
  if (index > -1) {
    localFilters.value.sentiments.splice(index, 1);
  } else {
    localFilters.value.sentiments.push(sentiment);
  }
  applyFilters();
};

const getSentimentFilterClasses = (sentiment) => {
  const isActive = localFilters.value.sentiments.includes(sentiment);
  
  if (sentiment === 'positive') {
    return isActive 
      ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-green-300';
  }
  if (sentiment === 'neutral') {
    return isActive 
      ? 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200'
      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-yellow-300';
  }
  if (sentiment === 'negative') {
    return isActive 
      ? 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-red-300';
  }
};

const getSentimentIconClasses = (sentiment) => {
  const isActive = localFilters.value.sentiments.includes(sentiment);
  
  if (sentiment === 'positive') {
    return isActive 
      ? 'bg-green-500 text-white shadow-lg'
      : 'bg-green-100 text-green-600 hover:bg-green-200';
  }
  if (sentiment === 'neutral') {
    return isActive 
      ? 'bg-yellow-500 text-white shadow-lg'
      : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200';
  }
  if (sentiment === 'negative') {
    return isActive 
      ? 'bg-red-500 text-white shadow-lg'
      : 'bg-red-100 text-red-600 hover:bg-red-200';
  }
};

const getSentimentDisplayName = (sentiment) => {
  const names = {
    'positive': 'Positive',
    'neutral': 'Neutral', 
    'negative': 'Negative'
  };
  return names[sentiment] || sentiment;
};

const getSentimentActiveFilterClasses = (sentiment) => {
  const classMap = {
    'positive': 'bg-green-100 text-green-800',
    'neutral': 'bg-yellow-100 text-yellow-800',
    'negative': 'bg-red-100 text-red-800'
  };
  return classMap[sentiment] || 'bg-gray-100 text-gray-800';
};

const getSentimentActiveFilterButtonClasses = (sentiment) => {
  const classMap = {
    'positive': 'text-green-400 hover:text-green-500',
    'neutral': 'text-yellow-400 hover:text-yellow-500',
    'negative': 'text-red-400 hover:text-red-500'
  };
  return classMap[sentiment] || 'text-gray-400 hover:text-gray-500';
};

const removeSentiment = (sentiment) => {
  const index = localFilters.value.sentiments.indexOf(sentiment);
  if (index > -1) {
    localFilters.value.sentiments.splice(index, 1);
    applyFilters();
  }
};

// Permission checks
const canEdit = (feedback) => {
  // Users can edit their own feedback, admins/HR can edit any
  return isAdminOrHR.value || feedback.reviewer_id === user?.id;
};

const canDelete = (feedback) => {
  return canEdit(feedback);
};

// Dropdown management
const setDropdownRef = (el, feedbackId) => {
  if (el) {
    dropdownRefs.value[feedbackId] = el;
  }
};

const toggleDropdown = (feedbackId) => {
  if (activeDropdown.value === feedbackId) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = feedbackId;
  }
};

const closeDropdowns = (event) => {
  const clickedInsideDropdown = Object.values(dropdownRefs.value).some(ref => 
    ref && ref.contains(event.target)
  );
  
  if (!clickedInsideDropdown) {
    activeDropdown.value = null;
  }
};

// Filter methods
const applyFilters = () => {
  const params = { ...localFilters.value };
  
  // Convert sentiments array to comma-separated string
  if (params.sentiments && params.sentiments.length > 0) {
    params.sentiments = params.sentiments.join(',');
  }
  
  // Remove empty values
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
      delete params[key];
    }
  });
  
  loading.value = true;
  router.get(route('feedbacks.index'), params, {
    preserveState: true,
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
    }
  });
};

const debouncedApplyFilters = debounce(applyFilters, 300);

const clearFilter = (filterKey) => {
  if (filterKey === 'sentiments') {
    localFilters.value[filterKey] = [];
  } else {
    localFilters.value[filterKey] = '';
  }
  applyFilters();
};

const resetFilters = () => {
  localFilters.value = {
    search: '',
    rating: '',
    period: '',
    date_from: '',
    date_to: '',
    sentiments: []
  };
  
  // Navigate to the clean URL without any query parameters
  loading.value = true;
  router.get(route('feedbacks.index'), {}, {
    preserveState: false,
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
    }
  });
};

// Action methods
const confirmDelete = (feedback) => {
  feedbackToDelete.value = feedback;
  showDeleteModal.value = true;
};

const deleteFeedback = () => {
  if (feedbackToDelete.value) {
    loading.value = true;
    router.delete(route('feedbacks.destroy', feedbackToDelete.value.id), {
      onSuccess: () => {
        showDeleteModal.value = false;
        feedbackToDelete.value = null;
      },
      onFinish: () => {
        loading.value = false;
      }
    });
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
});
</script>