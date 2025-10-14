<template>
  <AuthenticatedLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Page Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <!-- Breadcrumbs -->
            <nav class="flex mb-4" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2 text-sm">
                <li>
                  <Link :href="route('dashboard')" class="text-gray-500 hover:text-gray-700 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li class="flex items-center">
                  <ChevronRightIcon class="w-4 h-4 text-gray-400 mx-2" />
                  <Link :href="route('assessment-dashboard')" class="text-gray-500 hover:text-gray-700 transition-colors">
                    Assessment Dashboard
                  </Link>
                </li>
                <li class="flex items-center">
                  <ChevronRightIcon class="w-4 h-4 text-gray-400 mx-2" />
                  <span class="text-gray-900 font-medium">Assessment Cycles</span>
                </li>
              </ol>
            </nav>

            <!-- Page Title and Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl font-bold text-gray-900">Assessment Cycle Manager</h1>
                <p class="mt-1 text-sm text-gray-600">Create and manage assessment cycles for systematic competency evaluation</p>
              </div>
              <div class="flex items-center space-x-3">
                <SecondaryButton @click="refreshData" :disabled="loading">
                  <ArrowPathIcon class="w-4 h-4 mr-2" />
                  Refresh
                </SecondaryButton>
                <PrimaryButton @click="createNewCycle">
                  <PlusIcon class="w-4 h-4 mr-2" />
                  New Assessment Cycle
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Filters and Search -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div class="p-6">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <!-- Search and Filters -->
              <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <!-- Search Input -->
                <div class="relative">
                  <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    v-model="filters.search"
                    type="text"
                    placeholder="Search cycles..."
                    class="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    @input="debouncedSearch"
                  />
                </div>
                
                <!-- Status Filter -->
                <div class="relative">
                  <select 
                    v-model="filters.status" 
                    @change="applyFilters" 
                    class="appearance-none pl-10 pr-10 py-2.5 min-w-40 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 hover:border-gray-400 cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <!-- Status Icon -->
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div class="w-4 h-4 text-gray-400">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <!-- Dropdown Arrow -->
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDownIcon class="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                <!-- Date Range Filter -->
                <div class="relative">
                  <select 
                    v-model="filters.dateRange" 
                    @change="applyFilters" 
                    class="appearance-none pl-10 pr-10 py-2.5 min-w-40 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 hover:border-gray-400 cursor-pointer"
                  >
                    <option value="">All Dates</option>
                    <option value="current">Current Month</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past Cycles</option>
                  </select>
                  <!-- Calendar Icon -->
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon class="w-4 h-4 text-gray-400" />
                  </div>
                  <!-- Dropdown Arrow -->
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDownIcon class="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <!-- Clear Filters -->
                <SecondaryButton 
                  v-if="hasActiveFilters" 
                  @click="clearFilters"
                  size="sm"
                >
                  Clear Filters
                </SecondaryButton>
              </div>
              
              <!-- View Toggle -->
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-700">View:</span>
                <div class="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                  <button
                    @click="viewMode = 'grid'"
                    :class="[
                      'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm border border-blue-200' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    ]"
                  >
                    <Squares2X2Icon class="w-4 h-4 mr-2" />
                    Grid
                  </button>
                  <button
                    @click="viewMode = 'list'"
                    :class="[
                      'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm border border-blue-200' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    ]"
                  >
                    <ListBulletIcon class="w-4 h-4 mr-2" />
                    List
                  </button>
                </div>
              </div>
            </div>

            <!-- Active Filters Display -->
            <div v-if="hasActiveFilters" class="mt-6 pt-4 border-t border-gray-200">
              <div class="flex flex-wrap items-center gap-3">
                <span class="text-sm font-medium text-gray-700">Active filters:</span>
                <div class="flex flex-wrap gap-2">
                  <span v-if="filters.search" class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    <MagnifyingGlassIcon class="w-4 h-4 mr-1.5" />
                    "{{ filters.search }}"
                    <button @click="filters.search = ''" class="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-blue-200 transition-colors">
                      <XMarkIcon class="w-3 h-3" />
                    </button>
                  </span>
                  <span v-if="filters.status" class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                    <div class="w-4 h-4 mr-1.5">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    {{ formatStatus(filters.status) }}
                    <button @click="filters.status = ''" class="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-green-200 transition-colors">
                      <XMarkIcon class="w-3 h-3" />
                    </button>
                  </span>
                  <span v-if="filters.dateRange" class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    <CalendarIcon class="w-4 h-4 mr-1.5" />
                    {{ formatDateRangeFilter(filters.dateRange) }}
                    <button @click="filters.dateRange = ''" class="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-purple-200 transition-colors">
                      <XMarkIcon class="w-3 h-3" />
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Summary -->
        <div v-if="!loading" class="mb-6 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            <span v-if="filteredCycles.length > 0">
              Showing {{ filteredCycles.length }} of {{ props.cycles.length }} assessment cycles
            </span>
            <span v-else>
              No assessment cycles found
            </span>
          </div>
          <div v-if="filteredCycles.length > 0" class="text-sm text-gray-500">
            {{ viewMode === 'grid' ? 'Grid' : 'List' }} view
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="animate-pulse space-y-4">
                <div class="flex items-center justify-between">
                  <div class="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-6 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div class="h-4 bg-gray-200 rounded w-full"></div>
                <div class="h-3 bg-gray-200 rounded w-2/3"></div>
                <div class="space-y-2">
                  <div class="h-2 bg-gray-200 rounded w-full"></div>
                  <div class="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div class="flex justify-between">
                  <div class="h-8 bg-gray-200 rounded w-16"></div>
                  <div class="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredCycles.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="text-center py-16 px-6">
            <CalendarIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No Assessment Cycles Found</h3>
            <p class="text-gray-600 mb-6 max-w-md mx-auto">
              {{ hasActiveFilters 
                 ? 'No cycles match your current filters. Try adjusting your search criteria.' 
                 : 'Get started by creating your first assessment cycle to begin systematic competency evaluation.' }}
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
              <PrimaryButton v-if="!hasActiveFilters" @click="createNewCycle">
                <PlusIcon class="w-4 h-4 mr-2" />
                Create Assessment Cycle
              </PrimaryButton>
              <SecondaryButton v-if="hasActiveFilters" @click="clearFilters">
                Clear Filters
              </SecondaryButton>
              <SecondaryButton @click="refreshData">
                <ArrowPathIcon class="w-4 h-4 mr-2" />
                Refresh
              </SecondaryButton>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="cycle in filteredCycles"
            :key="cycle.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
            @click="viewCycle(cycle)"
          >
            <!-- Card Header -->
            <div class="p-6 pb-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {{ cycle.name }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                    {{ cycle.description || 'No description provided' }}
                  </p>
                </div>
                <span :class="getStatusClasses(cycle.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 flex-shrink-0">
                  {{ formatStatus(cycle.status) }}
                </span>
              </div>

              <!-- Date Range -->
              <div class="flex items-center text-sm text-gray-500 mb-4">
                <CalendarIcon class="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{{ formatDateRange(cycle.start_date, cycle.end_date) }}</span>
              </div>

              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Progress</span>
                  <span class="text-sm text-gray-600">{{ cycle.completion_percentage || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getProgressBarColor(cycle.status)"
                    :style="{ width: `${cycle.completion_percentage || 0}%` }"
                  ></div>
                </div>
              </div>

              <!-- Statistics -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center justify-center mb-1">
                    <UsersIcon class="w-4 h-4 text-gray-500 mr-1" />
                    <span class="text-lg font-semibold text-gray-900">{{ cycle.participant_count || 0 }}</span>
                  </div>
                  <span class="text-xs text-gray-600">Participants</span>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center justify-center mb-1">
                    <DocumentTextIcon class="w-4 h-4 text-gray-500 mr-1" />
                    <span class="text-lg font-semibold text-gray-900">{{ cycle.assessment_count || 0 }}</span>
                  </div>
                  <span class="text-xs text-gray-600">Assessments</span>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <button
                    @click.stop="createAssessmentForCycle(cycle)"
                    :disabled="cycle.status !== 'active'"
                    :class="[
                      'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                      cycle.status === 'active'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    ]"
                  >
                    <PlusIcon class="w-3 h-3 mr-1" />
                    Create Assessment
                  </button>
                  
                  <button
                    @click.stop="editCycle(cycle)"
                    :disabled="cycle.status === 'completed'"
                    :class="[
                      'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                      cycle.status !== 'completed'
                        ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    ]"
                  >
                    <PencilIcon class="w-3 h-3 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    v-if="cycle.status === 'planned'"
                    @click.stop="startCycle(cycle)"
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  >
                    <PlayIcon class="w-3 h-3 mr-1" />
                    Start
                  </button>
                  
                  <button
                    v-else-if="cycle.status === 'active'"
                    @click.stop="completeCycle(cycle)"
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  >
                    <CheckIcon class="w-3 h-3 mr-1" />
                    Complete
                  </button>
                </div>

                <div class="relative">
                  <button
                    @click.stop="showCycleMenu(cycle, $event)"
                    class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <EllipsisVerticalIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <!-- Table Header - Hidden on mobile -->
          <div class="bg-gray-50 border-b border-gray-200 hidden md:block">
            <div class="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-gray-700">
              <div class="col-span-3">Name & Description</div>
              <div class="col-span-2">Status</div>
              <div class="col-span-2">Date Range</div>
              <div class="col-span-2">Progress</div>
              <div class="col-span-2">Participants</div>
              <div class="col-span-1 text-right">Actions</div>
            </div>
          </div>
          
          <!-- Table Body -->
          <div class="divide-y divide-gray-200">
            <div
              v-for="cycle in filteredCycles"
              :key="cycle.id"
              class="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              @click="viewCycle(cycle)"
            >
              <!-- Desktop Layout -->
              <div class="hidden md:grid md:grid-cols-12 md:gap-4">
                <!-- Name & Description -->
                <div class="col-span-3">
                  <div class="min-w-0">
                    <h4 class="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {{ cycle.name }}
                    </h4>
                    <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                      {{ cycle.description || 'No description provided' }}
                    </p>
                  </div>
                </div>
                
                <!-- Status -->
                <div class="col-span-2 flex items-center">
                  <span :class="getStatusClasses(cycle.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ formatStatus(cycle.status) }}
                  </span>
                </div>
                
                <!-- Date Range -->
                <div class="col-span-2 flex items-center">
                  <div class="text-sm text-gray-900">
                    <div class="flex items-center">
                      <CalendarIcon class="w-4 h-4 text-gray-400 mr-2" />
                      {{ formatDateRange(cycle.start_date, cycle.end_date) }}
                    </div>
                  </div>
                </div>
                
                <!-- Progress -->
                <div class="col-span-2 flex items-center">
                  <div class="w-full">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs text-gray-600">{{ cycle.completion_percentage || 0 }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="h-2 rounded-full transition-all duration-300"
                        :class="getProgressBarColor(cycle.status)"
                        :style="{ width: `${cycle.completion_percentage || 0}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
                
                <!-- Participants -->
                <div class="col-span-2 flex items-center">
                  <div class="flex items-center text-sm text-gray-900">
                    <UsersIcon class="w-4 h-4 text-gray-400 mr-2" />
                    <span class="font-medium">{{ cycle.participant_count || 0 }}</span>
                    <span class="text-gray-500 ml-1">participants</span>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="col-span-1 flex items-center justify-end space-x-2">
                  <button
                    @click.stop="createAssessmentForCycle(cycle)"
                    :disabled="cycle.status !== 'active'"
                    :class="[
                      'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                      cycle.status === 'active'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    ]"
                  >
                    <PlusIcon class="w-3 h-3 mr-1" />
                    Assess
                  </button>
                  
                  <button
                    @click.stop="editCycle(cycle)"
                    :disabled="cycle.status === 'completed'"
                    :class="[
                      'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                      cycle.status !== 'completed'
                        ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    ]"
                  >
                    <PencilIcon class="w-3 h-3 mr-1" />
                    Edit
                  </button>
                  
                  <div class="relative">
                    <button
                      @click.stop="showCycleMenu(cycle, $event)"
                      class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <EllipsisVerticalIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Mobile Layout -->
              <div class="md:hidden space-y-3">
                <!-- Header -->
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {{ cycle.name }}
                    </h4>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ cycle.description || 'No description provided' }}
                    </p>
                  </div>
                  <span :class="getStatusClasses(cycle.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 flex-shrink-0">
                    {{ formatStatus(cycle.status) }}
                  </span>
                </div>

                <!-- Date and Progress -->
                <div class="space-y-2">
                  <div class="flex items-center text-sm text-gray-500">
                    <CalendarIcon class="w-4 h-4 mr-2" />
                    {{ formatDateRange(cycle.start_date, cycle.end_date) }}
                  </div>
                  
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs text-gray-600">Progress</span>
                      <span class="text-xs text-gray-600">{{ cycle.completion_percentage || 0 }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="h-2 rounded-full transition-all duration-300"
                        :class="getProgressBarColor(cycle.status)"
                        :style="{ width: `${cycle.completion_percentage || 0}%` }"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Stats and Actions -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center text-sm text-gray-600">
                    <UsersIcon class="w-4 h-4 mr-1" />
                    <span>{{ cycle.participant_count || 0 }} participants</span>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <button
                      @click.stop="createAssessmentForCycle(cycle)"
                      :disabled="cycle.status !== 'active'"
                      :class="[
                        'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                        cycle.status === 'active'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                          : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                      ]"
                    >
                      <PlusIcon class="w-3 h-3 mr-1" />
                      Assess
                    </button>
                    
                    <button
                      @click.stop="editCycle(cycle)"
                      :disabled="cycle.status === 'completed'"
                      :class="[
                        'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                        cycle.status !== 'completed'
                          ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                      ]"
                    >
                      <PencilIcon class="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    
                    <div class="relative">
                      <button
                        @click.stop="showCycleMenu(cycle, $event)"
                        class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <EllipsisVerticalIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.show"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      class="context-menu"
      @click.stop
    >
      <div class="menu-items">
        <button
          v-if="contextMenu.cycle?.status === 'active'"
          @click="createAssessmentForCycle(contextMenu.cycle)"
          class="menu-item"
        >
          <PlusIcon class="menu-icon" />
          Create Assessment
        </button>
        
        <button
          v-if="contextMenu.cycle?.status === 'planned'"
          @click="startCycle(contextMenu.cycle)"
          class="menu-item"
        >
          <PlayIcon class="menu-icon" />
          Start Cycle
        </button>
        
        <button
          v-if="contextMenu.cycle?.status === 'active'"
          @click="completeCycle(contextMenu.cycle)"
          class="menu-item"
        >
          <CheckIcon class="menu-icon" />
          Complete Cycle
        </button>
        
        <hr v-if="contextMenu.cycle?.status === 'active'" class="menu-divider" />
        
        <button
          @click="duplicateCycle(contextMenu.cycle)"
          class="menu-item"
        >
          <DocumentDuplicateIcon class="menu-icon" />
          Duplicate
        </button>
        
        <button
          @click="sendReminders(contextMenu.cycle)"
          class="menu-item"
          :disabled="contextMenu.cycle?.status !== 'active'"
        >
          <BellIcon class="menu-icon" />
          Send Reminders
        </button>
        
        <button
          @click="exportCycle(contextMenu.cycle)"
          class="menu-item"
        >
          <ArrowDownTrayIcon class="menu-icon" />
          Export Data
        </button>
        
        <hr class="menu-divider" />
        
        <button
          @click="deleteCycle(contextMenu.cycle)"
          class="menu-item danger"
          :disabled="contextMenu.cycle?.status === 'active'"
        >
          <TrashIcon class="menu-icon" />
          Delete
        </button>
      </div>
    </div>

    <!-- Create/Edit Cycle Modal -->
    <CycleFormModal
      :show="showCycleModal"
      :cycle="selectedCycle"
      :employees="employees"
      :competencies="competencies"
      @close="closeCycleModal"
      @save="saveCycle"
    />

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmation"
      :title="confirmationTitle"
      :message="confirmationMessage"
      :confirm-text="confirmationConfirmText"
      @confirm="handleConfirmationConfirm"
      @cancel="handleConfirmationCancel"
    />

    <!-- Notification Toast -->
    <div v-if="notifications.length > 0" class="notification-overlay">
      <div class="notification-center">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="getNotificationClasses(notification.type)"
          class="notification-card"
        >
          <div class="notification-icon">
            <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
          </div>
          <div class="notification-text">
            <p class="notification-message">{{ notification.message }}</p>
          </div>
          <button
            @click="removeNotification(notification.id)"
            class="notification-close"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import { debounce } from 'lodash';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import SecondaryButton from '@/Components/SecondaryButton.vue';
import ConfirmationModal from '@/Components/Modals/ConfirmationModal.vue';
import CycleFormModal from '@/Components/Competency/CycleFormModal.vue';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CalendarIcon,
  UsersIcon,
  DocumentTextIcon,
  PencilIcon,
  PlayIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  DocumentDuplicateIcon,
  BellIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  cycles: {
    type: Array,
    default: () => []
  },
  employees: {
    type: Array,
    default: () => []
  },
  competencies: {
    type: Array,
    default: () => []
  }
});

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(filters.value.search || filters.value.status || filters.value.dateRange);
});

// Local state
const loading = ref(false);
const viewMode = ref('grid');
const notifications = ref([]);

// Filters
const filters = ref({
  search: '',
  status: '',
  dateRange: ''
});

// Selected cycle for operations
const selectedCycle = ref(null);

const showConfirmation = ref(false);
const confirmationTitle = ref('');
const confirmationMessage = ref('');
const confirmationConfirmText = ref('Confirm');
const confirmationCallback = ref(null);

// Context menu
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  cycle: null
});

// Computed properties
const filteredCycles = computed(() => {
  let filtered = [...props.cycles];

  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    filtered = filtered.filter(cycle =>
      cycle.name.toLowerCase().includes(search) ||
      (cycle.description && cycle.description.toLowerCase().includes(search))
    );
  }

  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter(cycle => cycle.status === filters.value.status);
  }

  // Date range filter
  if (filters.value.dateRange) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    filtered = filtered.filter(cycle => {
      const startDate = new Date(cycle.start_date);
      const endDate = new Date(cycle.end_date);

      switch (filters.value.dateRange) {
        case 'current':
          return (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
                 (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear);
        case 'upcoming':
          return startDate > now;
        case 'past':
          return endDate < now;
        default:
          return true;
      }
    });
  }

  return filtered;
});

// Methods
const refreshData = () => {
  loading.value = true;
  router.reload({
    only: ['cycles'],
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
      showNotification('Data refreshed successfully', 'success');
    }
  });
};

const debouncedSearch = debounce(() => {
  applyFilters();
}, 300);

const applyFilters = () => {
  // Filters are reactive, so the computed property will update automatically
};

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    dateRange: ''
  };
};

// Cycle actions
const editCycle = (cycle) => {
  router.visit(route('assessment-cycles.edit', cycle.id));
};

const viewCycle = (cycle) => {
  router.visit(route('assessment-cycles.show', cycle.id));
};

const startCycle = (cycle) => {
  confirmationTitle.value = 'Start Assessment Cycle';
  confirmationMessage.value = `Are you sure you want to start "${cycle.name}"? This will notify all participants and begin the assessment process.`;
  confirmationConfirmText.value = 'Start Cycle';
  confirmationCallback.value = () => {
    performCycleAction(cycle.id, 'start', 'Assessment cycle started successfully');
  };
  showConfirmation.value = true;
  hideContextMenu();
};

const completeCycle = (cycle) => {
  confirmationTitle.value = 'Complete Assessment Cycle';
  confirmationMessage.value = `Are you sure you want to complete "${cycle.name}"? This action cannot be undone.`;
  confirmationConfirmText.value = 'Complete Cycle';
  confirmationCallback.value = () => {
    performCycleAction(cycle.id, 'complete', 'Assessment cycle completed successfully');
  };
  showConfirmation.value = true;
  hideContextMenu();
};

const duplicateCycle = (cycle) => {
  router.post(route('assessment-cycles.duplicate', cycle.id), {}, {
    onSuccess: () => {
      showNotification('Assessment cycle duplicated successfully', 'success');
    },
    onError: () => {
      showNotification('Failed to duplicate assessment cycle', 'error');
    }
  });
  hideContextMenu();
};

const sendReminders = (cycle) => {
  router.post(route('assessment-cycles.send-reminders', cycle.id), {}, {
    onSuccess: () => {
      showNotification('Reminders sent successfully', 'success');
    },
    onError: () => {
      showNotification('Failed to send reminders', 'error');
    }
  });
  hideContextMenu();
};

const exportCycle = (cycle) => {
  window.open(route('assessment-cycles.export', cycle.id), '_blank');
  hideContextMenu();
};

const deleteCycle = (cycle) => {
  confirmationTitle.value = 'Delete Assessment Cycle';
  confirmationMessage.value = `Are you sure you want to delete "${cycle.name}"? This action cannot be undone and will remove all associated data.`;
  confirmationConfirmText.value = 'Delete';
  confirmationCallback.value = () => {
    router.delete(route('assessment-cycles.destroy', cycle.id), {
      onSuccess: () => {
        showNotification('Assessment cycle deleted successfully', 'success');
      },
      onError: () => {
        showNotification('Failed to delete assessment cycle', 'error');
      }
    });
  };
  showConfirmation.value = true;
  hideContextMenu();
};

const createAssessmentForCycle = (cycle) => {
  // Navigate to assessment creation page with the cycle pre-selected
  const params = new URLSearchParams({
    assessment_cycle_id: cycle.id,
    assessment_type: 'manager'
  });
  
  const url = `${route('competency-assessments.create')}?${params.toString()}`;
  router.visit(url);
};

const performCycleAction = (cycleId, action, successMessage) => {
  router.post(route(`assessment-cycles.${action}`, cycleId), {}, {
    onSuccess: () => {
      showNotification(successMessage, 'success');
    },
    onError: () => {
      showNotification(`Failed to ${action} assessment cycle`, 'error');
    }
  });
};

// Context menu
const showCycleMenu = (cycle, event) => {
  event.preventDefault();
  
  // Calculate position to ensure menu stays within viewport
  const menuWidth = 200; // Approximate menu width
  const menuHeight = 250; // Approximate menu height
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let x = event.clientX;
  let y = event.clientY;
  
  // Adjust horizontal position if menu would go off-screen
  if (x + menuWidth > viewportWidth) {
    x = viewportWidth - menuWidth - 10;
  }
  
  // Adjust vertical position if menu would go off-screen
  if (y + menuHeight > viewportHeight) {
    y = viewportHeight - menuHeight - 10;
  }
  
  contextMenu.value = {
    show: true,
    x: Math.max(10, x), // Ensure minimum 10px from left edge
    y: Math.max(10, y), // Ensure minimum 10px from top edge
    cycle
  };
};

const hideContextMenu = () => {
  contextMenu.value.show = false;
};

// Modal handlers
const closeCycleModal = () => {
  showCycleModal.value = false;
  selectedCycle.value = null;
};

const saveCycle = (cycleData) => {
  const isEditing = !!selectedCycle.value;
  const route_name = isEditing ? 'assessment-cycles.update' : 'assessment-cycles.store';
  const method = isEditing ? 'put' : 'post';
  const params = isEditing ? [selectedCycle.value.id] : [];

  router[method](route(route_name, ...params), cycleData, {
    onSuccess: () => {
      showNotification(
        `Assessment cycle ${isEditing ? 'updated' : 'created'} successfully`,
        'success'
      );
      closeCycleModal();
    },
    onError: () => {
      showNotification(
        `Failed to ${isEditing ? 'update' : 'create'} assessment cycle`,
        'error'
      );
    }
  });
};

const handleConfirmationConfirm = () => {
  showConfirmation.value = false;
  if (confirmationCallback.value) {
    confirmationCallback.value();
    confirmationCallback.value = null;
  }
};

const handleConfirmationCancel = () => {
  showConfirmation.value = false;
  confirmationCallback.value = null;
};

// Utility methods
const formatStatus = (status) => {
  const statuses = {
    planned: 'Planned',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return statuses[status] || status;
};

const getStatusClasses = (status) => {
  const classes = {
    planned: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${start} - ${end}`;
};

const formatDateRangeFilter = (dateRange) => {
  const labels = {
    current: 'Current Month',
    upcoming: 'Upcoming',
    past: 'Past Cycles'
  };
  return labels[dateRange] || dateRange;
};

const getProgressBarColor = (status) => {
  const colors = {
    planned: 'bg-gray-400',
    active: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500'
  };
  return colors[status] || 'bg-gray-400';
};

const createNewCycle = () => {
  try {
    if (typeof route !== 'undefined') {
      router.visit(route('assessment-cycles.create'));
    } else {
      router.visit('/assessment-cycles/create');
    }
  } catch (error) {
    console.error('Navigation error:', error);
    window.location.href = '/assessment-cycles/create';
  }
};

// Notification system
const showNotification = (message, type = 'info', duration = 4000) => {
  const id = Date.now();
  const notification = {
    id,
    message,
    type,
    visible: true
  };
  
  notifications.value.push(notification);
  
  setTimeout(() => {
    removeNotification(id);
  }, duration);
};

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

const getNotificationClasses = (type) => {
  const baseClasses = 'notification-toast';
  const typeClasses = {
    success: 'notification-success',
    error: 'notification-error',
    warning: 'notification-warning',
    info: 'notification-info'
  };
  return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
};

const getNotificationIcon = (type) => {
  const iconMap = {
    success: CheckIcon,
    error: ExclamationTriangleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };
  return iconMap[type] || InformationCircleIcon;
};

// Event listeners
const handleClickOutside = (event) => {
  if (contextMenu.value.show && !event.target.closest('.context-menu')) {
    hideContextMenu();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  
  // Debug route helper availability
  console.log('AssessmentCycleManager mounted');
  console.log('Route helper available:', typeof route !== 'undefined');
  if (typeof route !== 'undefined') {
    console.log('Test route generation:', route('assessment-cycles.create'));
  } else {
    console.warn('Route helper not available - using fallback URLs');
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Utility classes for text truncation */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Enhanced Dropdown Styling */
select {
  background-image: none;
}

select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

select option {
  padding: 8px 12px;
  background-color: white;
  color: #374151;
}

select option:hover {
  background-color: #f3f4f6;
}

select option:checked {
  background-color: #dbeafe;
  color: #1d4ed8;
}

/* Custom dropdown arrow animation */
.dropdown-wrapper:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-arrow {
  transition: transform 0.2s ease-in-out;
}

/* Context Menu */
.context-menu {
  @apply fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48;
}

.menu-items {
  @apply space-y-1;
}

.menu-item {
  @apply w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors;
}

.menu-item.danger {
  @apply text-red-600 hover:bg-red-50;
}

.menu-item:disabled {
  @apply text-gray-400 cursor-not-allowed hover:bg-transparent;
}

.menu-icon {
  @apply w-4 h-4 mr-3;
}

.menu-divider {
  @apply border-t border-gray-200 my-2;
}

/* Notification System */
.notification-overlay {
  @apply fixed inset-0 z-50 pointer-events-none;
}

.notification-center {
  @apply absolute top-4 right-4 space-y-3;
}

.notification-card {
  @apply flex items-center p-4 bg-white rounded-lg shadow-lg border pointer-events-auto max-w-sm;
}

.notification-success {
  @apply border-green-200 bg-green-50;
}

.notification-error {
  @apply border-red-200 bg-red-50;
}

.notification-warning {
  @apply border-yellow-200 bg-yellow-50;
}

.notification-info {
  @apply border-blue-200 bg-blue-50;
}

.notification-icon {
  @apply flex-shrink-0 mr-3;
}

.notification-success .notification-icon {
  @apply text-green-500;
}

.notification-error .notification-icon {
  @apply text-red-500;
}

.notification-warning .notification-icon {
  @apply text-yellow-500;
}

.notification-info .notification-icon {
  @apply text-blue-500;
}

.notification-text {
  @apply flex-1 min-w-0;
}

.notification-message {
  @apply text-sm font-medium text-gray-900;
}

.notification-close {
  @apply flex-shrink-0 ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .responsive-grid {
    display: block;
  }
  
  .responsive-grid > div {
    margin-bottom: 1rem;
  }
  
  .responsive-grid > div:last-child {
    margin-bottom: 0;
  }
}

/* Animation for loading states */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.card-header {
  @apply flex items-start justify-between p-6 pb-4;
}

.cycle-info {
  @apply flex-1 min-w-0;
}

.cycle-name {
  @apply text-lg font-semibold text-gray-900 truncate;
}

.cycle-description {
  @apply text-sm text-gray-600 mt-1 line-clamp-2;
}

.status-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.card-content {
  @apply px-6 pb-4 space-y-4;
}

.cycle-dates {
  @apply space-y-2;
}

.date-item {
  @apply flex items-center space-x-2 text-sm text-gray-600;
}

.date-icon {
  @apply w-4 h-4;
}

.cycle-progress {
  @apply space-y-2;
}

.progress-header {
  @apply flex items-center justify-between text-sm;
}

.progress-label {
  @apply text-gray-600;
}

.progress-percentage {
  @apply font-medium text-gray-900;
}

.progress-bar {
  @apply w-full h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-500 transition-all duration-300;
}

.cycle-stats {
  @apply flex items-center space-x-4;
}

.stat-item {
  @apply flex items-center space-x-2 text-sm text-gray-600;
}

.stat-icon {
  @apply w-4 h-4;
}

.stat-value {
  @apply font-medium text-gray-900;
}

.card-actions {
  @apply px-6 py-4 bg-gray-50 border-t border-gray-200;
}

.action-buttons {
  @apply flex items-center justify-between;
}

.menu-button {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200;
}

/* List View */
.cycles-list {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden;
}

.list-header {
  @apply bg-gray-50 border-b border-gray-200 px-6 py-3;
}

.list-columns {
  @apply grid grid-cols-12 gap-4 items-center;
}

.column-header {
  @apply text-xs font-medium text-gray-500 uppercase tracking-wide;
}

.name-column {
  @apply col-span-3;
}

.status-column {
  @apply col-span-2;
}

.dates-column {
  @apply col-span-2;
}

.progress-column {
  @apply col-span-2;
}

.participants-column {
  @apply col-span-1;
}

.actions-column {
  @apply col-span-2;
}

.list-body {
  @apply divide-y divide-gray-200;
}

.list-row {
  @apply px-6 py-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer;
}

.column-content {
  @apply flex items-center;
}

.cycle-name-cell {
  @apply min-w-0;
}

.cycle-name-cell .cycle-name {
  @apply font-medium text-gray-900 truncate;
}

.cycle-name-cell .cycle-description {
  @apply text-sm text-gray-500 truncate;
}

.progress-cell {
  @apply flex items-center space-x-2;
}

.progress-cell .progress-bar {
  @apply w-16 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-text {
  @apply text-xs text-gray-600;
}

.participants-cell {
  @apply flex items-center space-x-1 text-sm text-gray-600;
}

.participants-icon {
  @apply w-4 h-4;
}

/* Context Menu */
.context-menu {
  @apply fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-48;
  max-width: 250px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
}

.menu-items {
  @apply space-y-1;
}

.menu-item {
  @apply flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 w-full text-left;
}

.menu-item.danger {
  @apply text-red-700 hover:bg-red-50;
}

.menu-item:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.menu-icon {
  @apply w-4 h-4;
}

.menu-divider {
  @apply my-1 border-gray-200;
}

/* Notifications */
.notification-overlay {
  @apply fixed top-4 right-4 z-50 space-y-2;
}

.notification-card {
  @apply flex items-center space-x-3 p-4 rounded-lg shadow-lg max-w-sm;
}

.notification-success {
  @apply bg-green-50 border border-green-200 text-green-800;
}

.notification-error {
  @apply bg-red-50 border border-red-200 text-red-800;
}

.notification-warning {
  @apply bg-yellow-50 border border-yellow-200 text-yellow-800;
}

.notification-info {
  @apply bg-blue-50 border border-blue-200 text-blue-800;
}

.notification-close {
  @apply text-gray-400 hover:text-gray-600 transition-colors duration-200;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .cycles-grid {
    @apply grid-cols-1 md:grid-cols-2;
  }
  
  .filters-container {
    @apply flex-col space-y-4 items-stretch;
  }
  
  .search-filters {
    @apply flex-col space-y-3 space-x-0;
  }
  
  .filter-selects {
    @apply flex-wrap;
  }
}

@media (max-width: 768px) {
  .cycles-grid {
    @apply grid-cols-1;
  }
  
  .list-columns {
    @apply grid-cols-1 gap-2;
  }
  
  .column-header,
  .column-content {
    @apply col-span-1;
  }
  
  .list-row {
    @apply space-y-2;
  }
  
  .header-content {
    @apply flex-col space-y-4 items-stretch;
  }
  
  .header-actions {
    @apply justify-end;
  }
}
</style>