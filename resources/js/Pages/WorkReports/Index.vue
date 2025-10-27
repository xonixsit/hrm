<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Performance Analytics"
      subtitle="Track and analyze employee performance metrics"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Performance Dashboard -->
      <div class="space-y-8">
        <!-- Filter Controls with Proper Information Architecture -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          
          <!-- PRIMARY: Data Filtering Section -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Filter Data</h3>
              <!-- Leaderboard Button -->
              <Link 
                v-if="employees.length > 0"
                :href="leaderboardUrl"
                class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
              >
                🏆 View Leaderboard
              </Link>
            </div>
            
            <!-- Responsive Filter Layout -->
            <div class="space-y-4">
              
              <!-- Date Range Section -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Date Range Column -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="localFilters.date_from"
                      type="date"
                      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0"
                      @change="handleDateFromChange"
                    />
                    <span class="text-gray-400 text-sm px-1">to</span>
                    <input
                      v-model="localFilters.date_to"
                      type="date"
                      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0"
                      @change="handleDateToChange"
                    />
                  </div>
                </div>

                <!-- Quick Presets Column -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Quick Select</label>
                  <div class="flex flex-wrap items-center bg-gray-100 rounded-lg p-1 gap-1">
                    <button
                      v-for="period in intelligentPeriods"
                      :key="period.key"
                      @click="selectIntelligentPeriod(period)"
                      class="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors focus:outline-none whitespace-nowrap flex-shrink-0"
                      :class="activePeriod === period.key 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'"
                    >
                      <span class="text-sm">{{ period.icon }}</span>
                      <span class="hidden sm:inline">{{ period.label }}</span>
                      <span class="sm:hidden">{{ period.label.split(' ')[1] || period.label }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Employee Filter and View Mode Section -->
              <div v-if="employees.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Employee Filter Column -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Employee Filter</label>
                  <BaseSelect
                    v-model="localFilters.user_id"
                    :options="employeeOptions"
                    placeholder="All employees"
                    class="w-full"
                    @update:modelValue="applyFilters"
                  />
                </div>

                <!-- View Mode Column -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                  <div class="flex items-center bg-gray-100 rounded-lg p-1 w-full">
                    <button
                      @click="performanceViewMode = 'individual'"
                      :class="performanceViewMode === 'individual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                      class="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 text-center"
                    >
                      📊 Overview
                    </button>
                    <button
                      @click="performanceViewMode = 'comparison'"
                      :class="performanceViewMode === 'comparison' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                      class="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 text-center"
                    >
                      ⚖️ Side-by-Side
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-medium text-gray-700">Filters:</span>
              
              <span
                v-if="activeEmployeeFilter"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ activeEmployeeFilter }}
                <button
                  @click="clearEmployeeFilter"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </span>

              <span
                v-if="localFilters.date_from || localFilters.date_to"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {{ formatDateRange() }}
                <button
                  @click="clearDateFilters"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </span>

              <button
                @click="clearAllFilters"
                class="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>



        <!-- Employee Comparison View -->
        <div v-if="performanceViewMode === 'comparison' && selectedEmployeesForComparison.length > 0" class="space-y-4">
          <!-- Employee Selection for Comparison -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Select Employees to Compare</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <label 
                v-for="employee in employees" 
                :key="employee.value"
                class="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                :class="selectedEmployeesForComparison.includes(employee.value) ? 'bg-blue-50 border-blue-300' : ''"
              >
                <input
                  type="checkbox"
                  :value="employee.value"
                  v-model="selectedEmployeesForComparison"
                  @change="loadComparisonData"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">{{ employee.label }}</span>
              </label>
            </div>
          </div>

          <!-- Comparison Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Calls Comparison</h3>
              <div class="space-y-4">
                <div v-for="employee in comparisonData" :key="employee.id" class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">{{ employee.name }}</span>
                  <div class="flex items-center space-x-3">
                    <span class="text-sm font-semibold text-gray-900">{{ employee.total_calls }}</span>
                    <div class="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-500 h-2 rounded-full" 
                        :style="{ width: `${(employee.total_calls / Math.max(...comparisonData.map(e => e.total_calls))) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Success Rate Comparison</h3>
              <div class="space-y-4">
                <div v-for="employee in comparisonData" :key="employee.id" class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">{{ employee.name }}</span>
                  <div class="flex items-center space-x-3">
                    <span class="text-sm font-semibold text-gray-900">{{ employee.success_rate }}%</span>
                    <div class="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-green-500 h-2 rounded-full" 
                        :style="{ width: `${employee.success_rate}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Overview Cards (Individual/Default View) -->
        <div v-if="performanceStats && (performanceViewMode === 'individual' || !performanceViewMode)" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <!-- Total Calls Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Calls</p>
                <p class="text-3xl font-bold text-gray-900">{{ performanceStats.total_calls || 0 }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  <span :class="performanceStats.calls_trend >= 0 ? 'text-green-600' : 'text-red-600'">
                  </span>
                  vs previous period
                </p>
              </div>
              <div class="p-3 bg-blue-50 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Success Rate Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Success Rate</p>
                <p class="text-3xl font-bold text-gray-900">{{ performanceStats.success_rate || 0 }}%</p>
                <p class="text-sm text-gray-500 mt-1">
                  {{ performanceStats.successful_calls || 0 }} successful calls
                </p>
              </div>
              <div class="p-3 bg-green-50 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Communication Channels Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Communications</p>
                <p class="text-3xl font-bold text-gray-900">{{ performanceStats.total_communications || 0 }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  Calls, emails, messages
                </p>
              </div>
              <div class="p-3 bg-purple-50 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Average Daily Performance Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Daily Average</p>
                <p class="text-3xl font-bold text-gray-900">{{ performanceStats.daily_average || 0 }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  Calls per day
                </p>
              </div>
              <div class="p-3 bg-orange-50 rounded-lg">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
          <!-- Call Performance Chart -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Call Performance Breakdown</h3>
              <div class="text-sm text-gray-500">{{ formatDateRange() || 'All time' }}</div>
            </div>
            
            <div v-if="performanceStats && performanceStats.total_calls > 0" class="space-y-4">
              <!-- Successful Calls -->
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-gray-700">Successful</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-900 mr-2">{{ performanceStats.successful_calls || 0 }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-green-500 h-2 rounded-full" 
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Not Received -->
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-gray-700">Not Received</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-900 mr-2">{{ performanceStats.calls_not_received || 0 }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-yellow-500 h-2 rounded-full" 
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Disconnected -->
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-gray-700">Disconnected</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-900 mr-2">{{ performanceStats.disconnected_calls || 0 }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-red-500 h-2 rounded-full" 
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Follow-up -->
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-gray-700">Follow-up</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-900 mr-2">{{ performanceStats.follow_up_calls || 0 }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-500 h-2 rounded-full" 
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">No call data available</p>
            </div>
          </div>

          <!-- Communication Channels Chart -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Communication Channels</h3>
              <div class="text-sm text-gray-500">{{ formatDateRange() || 'All time' }}</div>
            </div>
            
            <div v-if="performanceStats && performanceStats.total_communications > 0" class="space-y-4">
              <!-- Calls -->
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-gray-700">Phone Calls</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-900 mr-2">{{ performanceStats.total_calls || 0 }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-500 h-2 rounded-full" 
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Emails -->
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-gray-700">Emails</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-900 mr-2">{{ performanceStats.emails || 0 }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-green-500 h-2 rounded-full" 
                    ></div>
                  </div>
                </div>
              </div>

              <!-- WhatsApp -->
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-gray-700">WhatsApp</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-900 mr-2">{{ performanceStats.whatsapp || 0 }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-green-600 h-2 rounded-full" 
                    ></div>
                  </div>
                </div>
              </div>

              <!-- SMS -->
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span class="text-sm font-medium text-gray-700">SMS</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-900 mr-2">{{ performanceStats.sms || 0 }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-purple-500 h-2 rounded-full" 
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">No communication data available</p>
            </div>
          </div>
        </div>

        <!-- Recent Reports Table (Compact View) -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mt-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <button
                @click="toggleDetailedView"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {{ showDetailedView ? 'Show Summary' : 'Show Details' }}
              </button>
            </div>
          </div>

          <div v-if="workReports.data.length > 0">
            <!-- Summary View -->
            <div v-if="!showDetailedView" class="divide-y divide-gray-200">
              <div 
                v-for="report in workReports.data.slice(0, 5)" 
                :key="report.id"
                class="p-6 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="text-sm font-medium text-gray-900">
                        {{ formatDate(report.date) }}
                        <span v-if="hasAnyRole(['Admin', 'Manager']) && report.employee" class="text-gray-500">
                          - {{ report.employee.user?.name || 'Unknown' }}
                        </span>
                      </h4>
                      <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{{ report.calls || 0 }} calls</span>
                        <span>{{ calculateSuccessRate(report) }}% success</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-6 text-sm text-gray-600">
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        {{ report.successful_calls || 0 }} successful
                      </span>
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        {{ report.emails || 0 }} emails
                      </span>
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                        </svg>
                        {{ (report.whatsapp || 0) + (report.sms || 0) }} messages
                      </span>
                    </div>
                  </div>
                  
                  <div class="ml-4 flex items-center space-x-2">
                    <Link
                      :href="`/work-reports/${report.id}`"
                      class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detailed Table View -->
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th v-for="column in tableColumns" :key="column.key" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ column.label }}
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="row in workReports.data" :key="row.id" class="hover:bg-gray-50">
                    <td v-for="column in tableColumns" :key="column.key" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ column.formatter ? column.formatter(row[column.key]) : row[column.key] }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end">
                        <div class="relative" :ref="el => setDropdownRef(el, row.id)">
                          <button
                            @click="toggleDropdown(row.id)"
                            class="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          <div
                            v-if="activeDropdown === row.id"
                            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                          >
                            <Link
                              :href="`/work-reports/${row.id}`"
                              class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </Link>
                            <div class="border-t border-gray-100 my-1"></div>
                            <Link
                              :href="`/work-reports/${row.id}/edit`"
                              class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit Report
                            </Link>
                            <button
                              @click="confirmDelete(row)"
                              class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                            >
                              <svg class="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete Report
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="workReports.last_page > 1" class="px-6 py-4 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex-1 flex justify-between sm:hidden">
                  <Link 
                    v-if="workReports.prev_page_url"
                    :href="workReports.prev_page_url" 
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                  <Link 
                    v-if="workReports.next_page_url"
                    :href="workReports.next_page_url" 
                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </Link>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm text-gray-700">
                      Showing <span class="font-medium">{{ workReports.from }}</span> to <span class="font-medium">{{ workReports.to }}</span> of <span class="font-medium">{{ workReports.total }}</span> results
                    </p>
                  </div>
                  <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <Link 
                        v-if="workReports.prev_page_url"
                        :href="workReports.prev_page_url"
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span class="sr-only">Previous</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                        </svg>
                      </Link>
                      
                      <template v-for="link in workReports.links" :key="link.label">
                        <Link 
                          v-if="link.url && !link.label.includes('Previous') && !link.label.includes('Next')"
                          :href="link.url"
                          :class="[
                            'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                            link.active 
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          ]"
                        >
                          {{ link.label }}
                        </Link>
                      </template>
                      
                      <Link 
                        v-if="workReports.next_page_url"
                        :href="workReports.next_page_url"
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No performance data</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ hasActiveFilters ? 'Try adjusting your filters to see performance data' : 'Get started by submitting your first work report' }}
            </p>
            <div v-if="canCreate" class="mt-6">
              <Link 
                :href="route('work-reports.create')" 
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Submit New Report
              </Link>
            </div>
          </div>
        </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { router, Link } from '@inertiajs/vue3';
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { debounce } from 'lodash';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
  workReports: Object,
  employees: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  performanceStats: {
    type: Object,
    default: () => null
  },
  employeePerformanceList: {
    type: Array,
    default: () => []
  }
});

// Define breadcrumbs for the page
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Work Reports', href: route('work-reports.index'), current: true }
]);

const { hasAnyRole, hasRole, roles, user, isAuthenticated } = useAuth();
const loading = ref(false);
const showFilters = ref(false);
const showDetailedView = ref(false);
const performanceViewMode = ref('individual');
const selectedEmployeesForComparison = ref([]);
const comparisonData = ref([]);
const employeePerformanceList = ref([]);
const canCreate = computed(() => hasAnyRole(['Employee', 'Manager', 'Admin', 'HR']));
const activeDropdown = ref(null);
const dropdownRefs = ref({});

// Filter state
const localFilters = ref({
  search: props.filters.search || '',
  user_id: props.filters.user_id || '',
  date_from: props.filters.date_from || '',
  date_to: props.filters.date_to || ''
});

// Employee options for select dropdown
const employeeOptions = computed(() => [
  { value: '', label: 'All employees' },
  ...props.employees.map(emp => ({
    value: emp.value,
    label: emp.label
  }))
]);

// Active filters computed properties
const hasActiveFilters = computed(() => {
  return (localFilters.value.search && localFilters.value.search.trim()) ||
         localFilters.value.user_id || 
         localFilters.value.date_from || 
         localFilters.value.date_to;
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (localFilters.value.search && localFilters.value.search.trim()) count++;
  if (localFilters.value.user_id) count++;
  if (localFilters.value.date_from) count++;
  if (localFilters.value.date_to) count++;
  return count;
});

const activeEmployeeFilter = computed(() => {
  if (!localFilters.value.user_id) return null;
  
  // Find the option that matches the current filter value
  const selectedOption = employeeOptions.value.find(option => 
    option.value === localFilters.value.user_id
  );
  
  // Don't show "All employees" as an active filter (empty value)
  if (!selectedOption || selectedOption.value === '') return null;
  
  return selectedOption.label;
});

// Primary vs secondary presets for progressive disclosure
const primaryPresets = computed(() => datePresets.filter(p => p.category === 'primary'));
const secondaryPresets = computed(() => datePresets.filter(p => p.category === 'secondary'));
const showMorePresets = ref(false);
const morePresetsRef = ref(null);

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (morePresetsRef.value && !morePresetsRef.value.contains(event.target)) {
    showMorePresets.value = false;
  }
};

// Tooltip messages for better user guidance
const getPresetTooltip = (preset) => {
  const tooltips = {
    'today': 'View today\'s performance data',
    'yesterday': 'View yesterday\'s performance data', 
    'this_week': 'View current week\'s performance (Monday to Sunday)',
    'last_week': 'View previous week\'s performance',
    'this_month': 'View current month\'s performance data',
    'last_month': 'View previous month\'s performance data',
    'this_quarter': 'View current quarter\'s performance (3 months)',
    'last_quarter': 'View previous quarter\'s performance'
  };
  return tooltips[preset.key] || preset.label;
};

// Filter methods
const applyFilters = () => {
  loading.value = true;
  
  const params = {
    page: 1, // Reset to first page when filtering
    per_page: props.workReports.per_page || 10
  };
  
  // Add non-empty filters to params
  if (localFilters.value.search && localFilters.value.search.trim()) {
    params.search = localFilters.value.search.trim();
  }
  if (localFilters.value.user_id) {
    params.user_id = localFilters.value.user_id;
  }
  if (localFilters.value.date_from) {
    params.date_from = localFilters.value.date_from;
  }
  if (localFilters.value.date_to) {
    params.date_to = localFilters.value.date_to;
  }
  
  console.log('Applying filters with params:', params);
  console.log('Current localFilters:', localFilters.value);
  
  router.get(route('work-reports.index'), params, {
    preserveState: false, // Force fresh data load
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
      console.log('Filter request completed');
    },
    onError: (errors) => {
      console.error('Filter error:', errors);
      loading.value = false;
    }
  });
};

const clearSearchFilter = () => {
  localFilters.value.search = '';
  applyFilters();
};

const clearEmployeeFilter = () => {
  localFilters.value.user_id = '';
  applyFilters();
};

const clearDateFromFilter = () => {
  localFilters.value.date_from = '';
  applyFilters();
};

const clearDateToFilter = () => {
  localFilters.value.date_to = '';
  applyFilters();
};

const clearAllFilters = () => {
  localFilters.value = {
    search: '',
    user_id: '',
    date_from: '',
    date_to: ''
  };
  applyFilters();
};

// ULTRA-SIMPLE: Just the essentials
const intelligentPeriods = [
  {
    key: 'recent',
    label: 'Recent',
    icon: '⚡',
    calculate: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      return { start, end };
    }
  },
  {
    key: 'week',
    label: 'This Week',
    icon: '📊',
    calculate: () => {
      const now = new Date();
      const start = new Date(now);
      const end = new Date(now);
      
      // Get Monday of current week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Handle Sunday
      
      start.setDate(now.getDate() - daysToMonday);
      start.setHours(0, 0, 0, 0);
      
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      
      return { start, end };
    }
  },
  {
    key: 'month',
    label: 'This Month',
    icon: '📅',
    calculate: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end };
    }
  },
  {
    key: 'year',
    label: 'This Year',
    icon: '🗓️',
    calculate: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1); // January 1st
      const end = new Date(now.getFullYear(), 11, 31); // December 31st
      return { start, end };
    }
  }
];

const activePeriod = ref('recent');

// SIMPLE: Smart period selection
const selectIntelligentPeriod = (period) => {
  activePeriod.value = period.key;
  
  const { start, end } = period.calculate();
  const dateFrom = start.toISOString().split('T')[0];
  const dateTo = end.toISOString().split('T')[0];
  
  console.log(`Selected period: ${period.label}`, {
    key: period.key,
    dateFrom,
    dateTo,
    start,
    end,
    currentFilters: localFilters.value
  });
  
  // Update the local filters
  localFilters.value.date_from = dateFrom;
  localFilters.value.date_to = dateTo;
  
  console.log('Updated filters:', localFilters.value);
  
  // Apply the filters with a small delay to ensure state is updated
  nextTick(() => {
    applyFilters();
  });
};

const applyDatePreset = (preset) => {
  const today = new Date();
  let startDate, endDate;
  
  switch (preset.type) {
    case 'day':
      startDate = new Date(today);
      startDate.setDate(today.getDate() + preset.offset);
      endDate = new Date(startDate);
      break;
      
    case 'week':
      // Get start of week (Monday)
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(today);
      startDate.setDate(today.getDate() + daysToMonday + (preset.offset * 7));
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
      
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth() + preset.offset, 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + preset.offset + 1, 0);
      break;
      
    case 'quarter':
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const targetQuarter = currentQuarter + preset.offset;
      const targetYear = today.getFullYear() + Math.floor(targetQuarter / 4);
      const quarterMonth = (targetQuarter % 4) * 3;
      
      startDate = new Date(targetYear, quarterMonth, 1);
      endDate = new Date(targetYear, quarterMonth + 3, 0);
      break;
      
    default:
      startDate = today;
      endDate = today;
  }
  
  localFilters.value.date_from = startDate.toISOString().split('T')[0];
  localFilters.value.date_to = endDate.toISOString().split('T')[0];
  
  applyFilters();
};

const isActivePreset = (preset) => {
  if (!localFilters.value.date_from || !localFilters.value.date_to) return false;
  
  const today = new Date();
  let expectedStartDate, expectedEndDate;
  
  switch (preset.type) {
    case 'day':
      expectedStartDate = new Date(today);
      expectedStartDate.setDate(today.getDate() + preset.offset);
      expectedEndDate = new Date(expectedStartDate);
      break;
      
    case 'week':
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      expectedStartDate = new Date(today);
      expectedStartDate.setDate(today.getDate() + daysToMonday + (preset.offset * 7));
      expectedEndDate = new Date(expectedStartDate);
      expectedEndDate.setDate(expectedStartDate.getDate() + 6);
      break;
      
    case 'month':
      expectedStartDate = new Date(today.getFullYear(), today.getMonth() + preset.offset, 1);
      expectedEndDate = new Date(today.getFullYear(), today.getMonth() + preset.offset + 1, 0);
      break;
      
    case 'quarter':
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const targetQuarter = currentQuarter + preset.offset;
      const targetYear = today.getFullYear() + Math.floor(targetQuarter / 4);
      const quarterMonth = (targetQuarter % 4) * 3;
      
      expectedStartDate = new Date(targetYear, quarterMonth, 1);
      expectedEndDate = new Date(targetYear, quarterMonth + 3, 0);
      break;
      
    default:
      return false;
  }
  
  const expectedStartStr = expectedStartDate.toISOString().split('T')[0];
  const expectedEndStr = expectedEndDate.toISOString().split('T')[0];
  
  return localFilters.value.date_from === expectedStartStr && localFilters.value.date_to === expectedEndStr;
};

const clearDateFilters = () => {
  localFilters.value.date_from = '';
  localFilters.value.date_to = '';
  applyFilters();
};

const formatDateRange = () => {
  if (!localFilters.value.date_from && !localFilters.value.date_to) return '';
  
  if (localFilters.value.date_from && localFilters.value.date_to) {
    if (localFilters.value.date_from === localFilters.value.date_to) {
      return formatDate(localFilters.value.date_from);
    }
    return `${formatDate(localFilters.value.date_from)} - ${formatDate(localFilters.value.date_to)}`;
  }
  
  if (localFilters.value.date_from) {
    return `From ${formatDate(localFilters.value.date_from)}`;
  }
  
  if (localFilters.value.date_to) {
    return `Until ${formatDate(localFilters.value.date_to)}`;
  }
  
  return '';
};

const toggleDetailedView = () => {
  showDetailedView.value = !showDetailedView.value;
};

const calculateSuccessRate = (report) => {
  const totalCalls = report.calls || 0;
  const successfulCalls = report.successful_calls || 0;
  
  if (totalCalls === 0) return 0;
  
  return Math.round((successfulCalls / totalCalls) * 100);
};

// Employee comparison and leaderboard methods
const loadComparisonData = async () => {
  if (selectedEmployeesForComparison.value.length === 0) {
    comparisonData.value = [];
    return;
  }
  
  // This would typically make an API call to get comparison data
  // For now, we'll generate sample data
  comparisonData.value = selectedEmployeesForComparison.value.map(employeeId => {
    const employee = props.employees.find(emp => emp.value === employeeId);
    return {
      id: employeeId,
      name: employee?.label?.split(' (')[0] || 'Unknown',
      total_calls: Math.floor(Math.random() * 100) + 20,
      success_rate: Math.floor(Math.random() * 40) + 60,
      emails: Math.floor(Math.random() * 50) + 10,
      whatsapp: Math.floor(Math.random() * 30) + 5
    };
  });
};

const loadEmployeePerformanceList = () => {
  // Use the employee performance data from the backend
  employeePerformanceList.value = props.employeePerformanceList || [];
};

// Watch for performance view mode changes
watch(performanceViewMode, (newMode) => {
  if (newMode === 'comparison') {
    selectedEmployeesForComparison.value = [];
    comparisonData.value = [];
  }
});

const debouncedApplyFilters = debounce(applyFilters, 300);

// Date validation
const validateDateRange = () => {
  if (localFilters.value.date_from && localFilters.value.date_to) {
    if (localFilters.value.date_from > localFilters.value.date_to) {
      // Auto-correct: swap the dates
      const temp = localFilters.value.date_from;
      localFilters.value.date_from = localFilters.value.date_to;
      localFilters.value.date_to = temp;
    }
  }
};

// Enhanced date change handler
const handleDateFromChange = () => {
  validateDateRange();
  applyFilters();
};

const handleDateToChange = () => {
  validateDateRange();
  applyFilters();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Dropdown management
const setDropdownRef = (el, reportId) => {
  if (el) {
    dropdownRefs.value[reportId] = el;
  }
};

const toggleDropdown = (reportId) => {
  if (activeDropdown.value === reportId) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = reportId;
  }
};

const closeDropdowns = (event) => {
  const clickedInsideDropdown = Object.values(dropdownRefs.value).some(ref => 
    ref && ref.contains(event.target)
  );
  
  if (!clickedInsideDropdown) {
    activeDropdown.value = null;
  }
  
  // Close date presets dropdown if clicking outside
  const presetsDropdown = event.target.closest('.relative');
  if (!presetsDropdown || !presetsDropdown.querySelector('[class*="showMorePresets"]')) {
    showMorePresets.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdowns);
  
  // Initialize employee performance data for managers/admins
  if (hasAnyRole(['Admin', 'Manager', 'HR']) && props.employees.length > 0) {
    loadEmployeePerformanceList();
  }
  
  console.log('canCreate:', canCreate.value);
  console.log('User roles:', roles.value);
  console.log('Is authenticated:', isAuthenticated.value);
  console.log('User object:', user.value);
  console.log('Has Employee role:', hasRole('Employee'));
  console.log('Has any role check:', hasAnyRole(['Employee', 'Manager', 'Admin', 'HR']));
  
  // Debug employee data
  console.log('Employees data:', props.employees);
  console.log('Employee options:', employeeOptions.value);
  console.log('Current filters:', props.filters);
  console.log('Local filters:', localFilters.value);
  
  // Test route helper
  console.log('Testing route helper...');
  try {
    if (typeof route !== 'undefined') {
      console.log('Route helper available:', route('work-reports.index'));
    } else {
      console.warn('Route helper not available - using fallback URLs');
    }
  } catch (error) {
    console.error('Route helper error:', error);
  }
});

// Breadcrumbs are already defined above

const headerActions = computed(() => {
  const actions = [];
  
  if (canCreate.value) {
    actions.push({
      id: 'create',
      label: 'Submit New Report',
      variant: 'primary',
      icon: 'plus',
      handler: () => router.visit(route('work-reports.create'))
    });
  }
  
  return actions;
});

const tableColumns = computed(() => {
  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      formatter: (value) => {
        if (!value) return '';
        // Parse date safely without timezone issues
        const [year, month, day] = value.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString();
      }
    },
    {
      key: 'calls',
      label: 'Total Calls',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'successful_calls',
      label: 'Successful',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'calls_not_received',
      label: 'Not Received',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'disconnected_calls',
      label: 'Disconnected',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'follow_up_calls',
      label: 'Follow-up',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'emails',
      label: 'Emails',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      sortable: true,
      formatter: (value) => value || 0
    },
    {
      key: 'sms',
      label: 'SMS',
      sortable: true,
      formatter: (value) => value || 0
    },
  ];
  if (hasAnyRole(['Admin', 'Manager'])) {
    columns.splice(1, 0, {
      key: 'employee',
      label: 'Employee',
      sortable: true,
      formatter: (value) => value?.user?.name || 'Unavailable'
    });
  }
  return columns;
});

// No longer needed as actions are directly in the table
// const getRowActions = (row) => ([]);

const leaderboardUrl = computed(() => {
  const params = new URLSearchParams();
  if (localFilters.value.date_from) params.append('date_from', localFilters.value.date_from);
  if (localFilters.value.date_to) params.append('date_to', localFilters.value.date_to);
  
  const queryString = params.toString();
  return `/work-reports/leaderboard${queryString ? '?' + queryString : ''}`;
});

const emptyState = computed(() => ({
  title: 'No work reports found',
  description: 'There are no work reports to display. Submit your first report to get started.',
  icon: 'document-text',
  actions: canCreate.value ? [{
    id: 'create',
    label: 'Submit New Report',
    variant: 'primary',
    icon: 'plus',
    handler: () => router.visit('/work-reports/create')
  }] : []
}));

const confirmDelete = (row) => {
  // Format date safely without timezone issues
  const formatDateSafely = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };
  
  const confirmMessage = `Are you sure you want to delete the work report for ${formatDateSafely(row.date)}?\n\nThis action cannot be undone.`;
  
  if (confirm(confirmMessage)) {
    loading.value = true;
    router.delete(`/work-reports/${row.id}`, {
      onSuccess: () => {
        loading.value = false;
        // Success message will be handled by the backend flash message
      },
      onError: (errors) => {
        loading.value = false;
        console.error('Delete failed:', errors);
        alert('Failed to delete work report. Please try again.');
      }
    });
  }
};



// Lifecycle hooks
onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
});
</script>