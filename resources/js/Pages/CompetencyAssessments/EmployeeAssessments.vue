<template>
  <AuthenticatedLayout>
    <PageLayout
      :title="`${employee.name} - Assessments`"
      :subtitle="`${employee.position}${employee.department ? ' • ' + employee.department.name : ''}`"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ChartBarIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Assessments</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CheckCircleIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Completed</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.completed }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClockIcon class="h-8 w-8 text-yellow-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Pending</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <StarIcon class="h-8 w-8 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Average Rating</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatRating(stats.average_rating) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Competency</label>
                <select
                  v-model="filters.competency_id"
                  @change="applyFilters"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Competencies</option>
                  <option v-for="competency in competencies" :key="competency.id" :value="competency.id">
                    {{ competency.name }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  v-model="filters.status"
                  @change="applyFilters"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option v-for="status in statusOptions" :key="status" :value="status">
                    {{ formatStatus(status) }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  v-model="filters.assessment_type"
                  @change="applyFilters"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option v-for="type in assessmentTypes" :key="type" :value="type">
                    {{ formatAssessmentType(type) }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  v-model="filters.date_from"
                  @change="applyFilters"
                  type="date"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div class="flex items-end">
                <button
                  @click="clearFilters"
                  class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                @click="createAssessmentForCompetency"
                class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <DocumentPlusIcon class="w-5 h-5 text-blue-600 mr-2" />
                <span class="text-sm font-medium text-gray-700">Create Assessment</span>
              </button>
              
              <button
                @click="viewCompetencyGaps"
                class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <ChartBarIcon class="w-5 h-5 text-purple-600 mr-2" />
                <span class="text-sm font-medium text-gray-700">Competency Gaps</span>
              </button>
              
              <button
                @click="generateReport"
                class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <DocumentArrowDownIcon class="w-5 h-5 text-green-600 mr-2" />
                <span class="text-sm font-medium text-gray-700">Generate Report</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Assessments List -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Assessments ({{ assessments.total }})
            </h3>
          </div>
          
          <div v-if="assessments.data.length === 0" class="p-12 text-center">
            <DocumentIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
            <p class="text-gray-500 mb-6">This employee doesn't have any assessments yet.</p>
            <Link
              :href="route('competency-assessments.create', { employee_id: employee.id })"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Create First Assessment
            </Link>
          </div>
          
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="assessment in assessments.data"
              :key="assessment.id"
              class="p-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h4 class="text-lg font-medium text-gray-900">
                      {{ assessment.competency?.name }}
                    </h4>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ formatAssessmentType(assessment.assessment_type) }}
                    </span>
                    <span :class="getStatusClasses(assessment.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ formatStatus(assessment.status) }}
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-6 text-sm text-gray-600">
                    <div class="flex items-center">
                      <CalendarIcon class="w-4 h-4 mr-1" />
                      {{ formatDate(assessment.created_at) }}
                    </div>
                    <div v-if="assessment.assessor" class="flex items-center">
                      <UserIcon class="w-4 h-4 mr-1" />
                      {{ assessment.assessor.name }}
                    </div>
                    <div v-if="assessment.assessment_cycle" class="flex items-center">
                      <TagIcon class="w-4 h-4 mr-1" />
                      {{ assessment.assessment_cycle.name }}
                    </div>
                  </div>
                  
                  <!-- Rating Display -->
                  <div v-if="assessment.rating" class="mt-3 flex items-center">
                    <span class="text-sm font-medium text-gray-700 mr-2">Rating:</span>
                    <div class="flex items-center">
                      <div class="flex">
                        <StarIcon
                          v-for="i in 5"
                          :key="i"
                          :class="[
                            i <= assessment.rating ? 'text-yellow-400' : 'text-gray-300',
                            'h-4 w-4'
                          ]"
                        />
                      </div>
                      <span class="ml-2 text-sm font-medium text-gray-900">{{ assessment.rating }}/5</span>
                      <span class="ml-2 text-sm text-gray-500">({{ getRatingLabel(assessment.rating) }})</span>
                    </div>
                  </div>
                  
                  <!-- Comments Preview -->
                  <div v-if="assessment.comments" class="mt-3">
                    <p class="text-sm text-gray-700 line-clamp-2">{{ assessment.comments }}</p>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center space-x-3 ml-6">
                  <Link
                    :href="route('competency-assessments.show', assessment.id)"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <EyeIcon class="w-4 h-4 mr-2" />
                    View
                  </Link>
                  <Link
                    v-if="assessment.status === 'draft'"
                    :href="route('competency-assessments.evaluate', assessment.id)"
                    class="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PencilIcon class="w-4 h-4 mr-2" />
                    Complete
                  </Link>
                  <button
                    v-if="assessment.status === 'submitted'"
                    @click="quickApprove(assessment)"
                    class="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckIcon class="w-4 h-4 mr-2" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="assessments.links" class="px-6 py-3 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Showing {{ assessments.from }} to {{ assessments.to }} of {{ assessments.total }} results
              </div>
              <div class="flex space-x-1">
                <Link
                  v-for="link in assessments.links"
                  :key="link.label"
                  :href="link.url"
                  :class="[
                    'px-3 py-2 text-sm font-medium rounded-md',
                    link.active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  ]"
                  v-html="link.label"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Competency Overview & Development Plans -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Competency Overview -->
          <div v-if="stats.total > 0" class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Competency Overview</h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div
                  v-for="competency in getCompetencyOverview()"
                  :key="competency.id"
                  class="p-4 border border-gray-200 rounded-lg"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-gray-900">{{ competency.name }}</h4>
                    <span class="text-xs text-gray-500">{{ competency.category }}</span>
                  </div>
                  <div v-if="competency.latestRating" class="flex items-center">
                    <div class="flex">
                      <StarIcon
                        v-for="i in 5"
                        :key="i"
                        :class="[
                          i <= competency.latestRating ? 'text-yellow-400' : 'text-gray-300',
                          'h-3 w-3'
                        ]"
                      />
                    </div>
                    <span class="ml-2 text-sm text-gray-600">{{ competency.latestRating }}/5</span>
                  </div>
                  <div v-else class="text-sm text-gray-400">Not assessed</div>
                  <div class="mt-2 text-xs text-gray-500">
                    {{ competency.assessmentCount }} assessment{{ competency.assessmentCount !== 1 ? 's' : '' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Development Plans -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Development Plans</h3>
              <button
                @click="createDevelopmentPlan"
                class="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon class="w-4 h-4 mr-1" />
                New Plan
              </button>
            </div>
            <div class="p-6">
              <div v-if="developmentPlans && developmentPlans.length === 0" class="text-center py-8">
                <DocumentIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 class="text-lg font-medium text-gray-900 mb-2">No Development Plans</h4>
                <p class="text-gray-500 mb-4">Create development plans to track competency improvement goals.</p>
                <button
                  @click="createDevelopmentPlan"
                  class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  <PlusIcon class="w-4 h-4 mr-2" />
                  Create First Plan
                </button>
              </div>
              
              <div v-else class="space-y-4">
                <div
                  v-for="plan in developmentPlans"
                  :key="plan.id"
                  class="p-4 border border-gray-200 rounded-lg"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <h4 class="font-medium text-gray-900">{{ plan.competency?.name }}</h4>
                      <div class="flex items-center space-x-4 mt-1">
                        <span class="text-sm text-gray-600">
                          {{ plan.current_rating || 'N/A' }}/5 → {{ plan.target_rating }}/5
                        </span>
                        <span :class="getDevelopmentPlanStatusClasses(plan.status)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                          {{ formatDevelopmentPlanStatus(plan.status) }}
                        </span>
                      </div>
                    </div>
                    <div class="text-right">
                      <div v-if="plan.target_date" class="text-sm text-gray-600">
                        Due: {{ formatDate(plan.target_date) }}
                      </div>
                      <div v-if="plan.status === 'active'" class="text-xs" :class="plan.is_overdue ? 'text-red-600' : 'text-gray-500'">
                        {{ plan.days_remaining !== null ? `${plan.days_remaining} days left` : 'No deadline' }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div class="mb-3">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium text-gray-700">Progress</span>
                      <span class="text-sm text-gray-600">{{ Math.round(plan.progress_percentage || 0) }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-blue-600 h-2 rounded-full"
                        :style="{ width: `${plan.progress_percentage || 0}%` }"
                      ></div>
                    </div>
                  </div>
                  
                  <!-- Development Actions -->
                  <div v-if="plan.development_actions && plan.development_actions.length > 0" class="mb-3">
                    <div class="text-sm font-medium text-gray-700 mb-2">Development Actions</div>
                    <div class="space-y-1">
                      <div
                        v-for="action in plan.development_actions.slice(0, 3)"
                        :key="action.id"
                        class="flex items-center text-sm"
                      >
                        <CheckCircleIcon
                          v-if="action.status === 'completed'"
                          class="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                        />
                        <ClockIcon
                          v-else
                          class="w-4 h-4 text-gray-400 mr-2 flex-shrink-0"
                        />
                        <span :class="action.status === 'completed' ? 'text-gray-600 line-through' : 'text-gray-700'">
                          {{ action.title || action.description }}
                        </span>
                      </div>
                      <div v-if="plan.development_actions.length > 3" class="text-xs text-gray-500 ml-6">
                        +{{ plan.development_actions.length - 3 }} more actions
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                      {{ plan.completed_actions_count || 0 }}/{{ plan.total_actions_count || 0 }} actions completed
                    </div>
                    <div class="flex space-x-2">
                      <button
                        @click="viewDevelopmentPlan(plan)"
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        v-if="plan.status === 'active'"
                        @click="updateDevelopmentPlan(plan)"
                        class="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Update Progress
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feedback History & Peer Comparisons -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Feedback History -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Recent Feedback</h3>
            </div>
            <div class="p-6">
              <div v-if="!feedbackHistory || feedbackHistory.length === 0" class="text-center py-8">
                <ChatBubbleLeftRightIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 class="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h4>
                <p class="text-gray-500">Feedback from assessments will appear here.</p>
              </div>
              
              <div v-else class="space-y-4">
                <div
                  v-for="feedback in feedbackHistory.slice(0, 5)"
                  :key="feedback.id"
                  class="p-4 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h5 class="font-medium text-gray-900">{{ feedback.competency_name }}</h5>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="text-sm text-gray-600">{{ feedback.assessor_name }}</span>
                        <span class="text-xs text-gray-400">•</span>
                        <span class="text-sm text-gray-600">{{ formatDate(feedback.created_at) }}</span>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <div class="flex">
                        <StarIcon
                          v-for="i in 5"
                          :key="i"
                          :class="[
                            i <= feedback.rating ? 'text-yellow-400' : 'text-gray-300',
                            'h-3 w-3'
                          ]"
                        />
                      </div>
                      <span class="ml-1 text-sm text-gray-600">{{ feedback.rating }}/5</span>
                    </div>
                  </div>
                  <p v-if="feedback.comments" class="text-sm text-gray-700 line-clamp-3">{{ feedback.comments }}</p>
                  <div v-if="feedback.assessment_type" class="mt-2">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ formatAssessmentType(feedback.assessment_type) }}
                    </span>
                  </div>
                </div>
                
                <div v-if="feedbackHistory.length > 5" class="text-center">
                  <button
                    @click="viewAllFeedback"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Feedback ({{ feedbackHistory.length }})
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Peer Comparisons -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Peer Comparison</h3>
            </div>
            <div class="p-6">
              <div v-if="!peerComparisons || Object.keys(peerComparisons).length === 0" class="text-center py-8">
                <UsersIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 class="text-lg font-medium text-gray-900 mb-2">No Peer Data</h4>
                <p class="text-gray-500">Peer comparison data will appear when more assessments are available.</p>
              </div>
              
              <div v-else class="space-y-4">
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">Overall Performance</span>
                    <span class="text-sm text-gray-600">vs Department Average</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-blue-600 h-2 rounded-full"
                        :style="{ width: `${Math.min(100, (peerComparisons.employee_average / peerComparisons.department_average) * 100)}%` }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900">
                      {{ formatRating(peerComparisons.employee_average) }} / {{ formatRating(peerComparisons.department_average) }}
                    </span>
                  </div>
                </div>
                
                <div v-if="peerComparisons.competency_comparisons" class="space-y-3">
                  <h5 class="text-sm font-medium text-gray-700">By Competency</h5>
                  <div
                    v-for="comp in peerComparisons.competency_comparisons.slice(0, 5)"
                    :key="comp.competency_id"
                    class="flex items-center justify-between py-2"
                  >
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-sm text-gray-700">{{ comp.competency_name }}</span>
                        <span class="text-xs text-gray-500">
                          {{ formatRating(comp.employee_rating) }} vs {{ formatRating(comp.peer_average) }}
                        </span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <div class="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            :class="[
                              'h-1.5 rounded-full',
                              comp.employee_rating >= comp.peer_average ? 'bg-green-500' : 'bg-red-500'
                            ]"
                            :style="{ width: `${Math.min(100, (comp.employee_rating / 5) * 100)}%` }"
                          ></div>
                        </div>
                        <ArrowTrendingUpIcon
                          v-if="comp.employee_rating > comp.peer_average"
                          class="w-3 h-3 text-green-500"
                        />
                        <ArrowTrendingDownIcon
                          v-else-if="comp.employee_rating < comp.peer_average"
                          class="w-3 h-3 text-red-500"
                        />
                        <MinusIcon
                          v-else
                          class="w-3 h-3 text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="pt-3 border-t border-gray-200">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">Ranking in Department</span>
                    <span class="font-medium text-gray-900">
                      #{{ peerComparisons.department_rank || 'N/A' }} of {{ peerComparisons.total_peers || 'N/A' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import {
  ArrowLeftIcon,
  PlusIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  DocumentIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  DocumentPlusIcon,
  DocumentArrowDownIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  employee: Object,
  assessments: Object,
  stats: Object,
  competencies: Array,
  assessmentTypes: Array,
  statusOptions: Array,
  filters: Object,
  developmentPlans: Array,
  feedbackHistory: Array,
  peerComparisons: Object
});

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessments', href: route('competency-assessments.index') },
  { label: `${props.employee.name} - Assessments`, href: null }
]);

const headerActions = computed(() => [
  {
    label: 'All Assessments',
    href: route('competency-assessments.index'),
    icon: ArrowLeftIcon,
    variant: 'secondary'
  },
  {
    label: 'New Assessment',
    href: route('competency-assessments.create', { employee_id: props.employee.id }),
    icon: PlusIcon,
    variant: 'primary'
  }
]);

const filters = ref({
  competency_id: props.filters?.competency_id || '',
  status: props.filters?.status || '',
  assessment_type: props.filters?.assessment_type || '',
  date_from: props.filters?.date_from || '',
  date_to: props.filters?.date_to || ''
});

const applyFilters = () => {
  router.get(route('competency-assessments.by-employee', props.employee.id), filters.value, {
    preserveState: true,
    preserveScroll: true
  });
};

const clearFilters = () => {
  filters.value = {
    competency_id: '',
    status: '',
    assessment_type: '',
    date_from: '',
    date_to: ''
  };
  applyFilters();
};

const createAssessmentForCompetency = () => {
  router.visit(route('competency-assessments.create', { employee_id: props.employee.id }));
};

const viewCompetencyGaps = () => {
  // Could navigate to a competency gap analysis page
  alert('Competency gap analysis feature coming soon!');
};

const generateReport = () => {
  // Could generate a PDF report for this employee
  alert('Report generation feature coming soon!');
};

const quickApprove = (assessment) => {
  if (confirm(`Are you sure you want to approve the ${assessment.competency?.name} assessment?`)) {
    router.post(route('competency-assessments.approve', assessment.id));
  }
};

const getCompetencyOverview = () => {
  const competencyMap = new Map();
  
  // Group assessments by competency
  props.assessments.data.forEach(assessment => {
    const compId = assessment.competency?.id;
    if (!compId) return;
    
    if (!competencyMap.has(compId)) {
      competencyMap.set(compId, {
        id: compId,
        name: assessment.competency.name,
        category: assessment.competency.category,
        assessmentCount: 0,
        latestRating: null,
        latestDate: null
      });
    }
    
    const comp = competencyMap.get(compId);
    comp.assessmentCount++;
    
    if (assessment.rating && (!comp.latestDate || new Date(assessment.created_at) > new Date(comp.latestDate))) {
      comp.latestRating = assessment.rating;
      comp.latestDate = assessment.created_at;
    }
  });
  
  return Array.from(competencyMap.values());
};

const formatAssessmentType = (type) => {
  const types = {
    'self': 'Self Assessment',
    'manager': 'Manager Assessment',
    'peer': 'Peer Assessment',
    '360': '360° Feedback'
  };
  return types[type] || type;
};

const formatStatus = (status) => {
  const statuses = {
    'draft': 'Draft',
    'submitted': 'Submitted',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  return statuses[status] || status;
};

const getStatusClasses = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getRatingLabel = (rating) => {
  const labels = {
    1: 'Needs Improvement',
    2: 'Below Expectations',
    3: 'Meets Expectations',
    4: 'Exceeds Expectations',
    5: 'Outstanding'
  };
  return labels[rating] || '';
};

const formatRating = (rating) => {
  return rating ? parseFloat(rating).toFixed(1) : '0.0';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Development Plan Methods
const createDevelopmentPlan = () => {
  // Navigate to development plan creation page
  router.visit(route('development-plans.create', { employee_id: props.employee.id }));
};

const viewDevelopmentPlan = (plan) => {
  // Navigate to development plan details page
  router.visit(route('development-plans.show', plan.id));
};

const updateDevelopmentPlan = (plan) => {
  // Navigate to development plan update page
  router.visit(route('development-plans.edit', plan.id));
};

const formatDevelopmentPlanStatus = (status) => {
  const statuses = {
    'active': 'Active',
    'completed': 'Completed',
    'paused': 'Paused',
    'cancelled': 'Cancelled'
  };
  return statuses[status] || status;
};

const getDevelopmentPlanStatusClasses = (status) => {
  const classes = {
    'active': 'bg-green-100 text-green-800',
    'completed': 'bg-blue-100 text-blue-800',
    'paused': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

// Feedback Methods
const viewAllFeedback = () => {
  // Navigate to comprehensive feedback history page
  router.visit(route('competency-assessments.feedback-history', props.employee.id));
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>