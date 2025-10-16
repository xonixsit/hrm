<template>
  <AuthenticatedLayout>
    <!-- Modern Dashboard Header -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-8">
          <!-- Welcome Section -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div class="mb-6 lg:mb-0">
              <h1 class="text-3xl font-bold text-white mb-2">
                {{ pageTitle }}
              </h1>
              <p class="text-blue-100 text-lg">
                {{ pageSubtitle }}
              </p>
              <div class="mt-4 flex items-center text-blue-100">
                <div class="flex items-center mr-6">
                  <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span class="text-sm">System Online</span>
                </div>
                <div class="flex items-center">
                  <ClockIcon class="w-4 h-4 mr-2" />
                  <span class="text-sm">{{ currentTime }}</span>
                </div>
              </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="flex flex-wrap gap-3">
              <button
                v-for="action in headerActions"
                :key="action.id"
                @click="action.handler"
                :disabled="action.disabled"
                class="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <component :is="getIconComponent(action.icon)" class="w-4 h-4 mr-2" />
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div class="bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Modern Admin Dashboard Layout -->
        <div v-if="isAdmin" class="space-y-6">
          
          <!-- Key Metrics Overview -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Employees -->
            <div class="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer" @click="navigateTo('employees.index')">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <UsersIcon class="w-6 h-6 text-white" />
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-900">{{ adminStats.totalEmployees || 274 }}</div>
                  <div class="text-xs text-gray-500">Total Employees</div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Active workforce</span>
                <div class="flex items-center text-green-600">
                  <ArrowTrendingUpIcon class="w-4 h-4 mr-1" />
                  <span class="text-sm font-medium">+5.2%</span>
                </div>
              </div>
            </div>

            <!-- Pending Approvals -->
            <div class="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 cursor-pointer" @click="navigateTo('approvals.index')">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                  <ExclamationTriangleIcon class="w-6 h-6 text-white" />
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-900">{{ adminStats.pendingLeaves || 19 }}</div>
                  <div class="text-xs text-gray-500">Pending Approvals</div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Requires attention</span>
                <div class="flex items-center text-orange-600">
                  <ClockIcon class="w-4 h-4 mr-1" />
                  <span class="text-sm font-medium">{{ adminStats.pendingLeaves > 10 ? 'High' : 'Normal' }}</span>
                </div>
              </div>
            </div>

            <!-- Pending Assessments -->
            <div class="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer" @click="navigateTo('assessment-dashboard')">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                  <AcademicCapIcon class="w-6 h-6 text-white" />
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-900">{{ adminStats.pendingAssessments || 9 }}</div>
                  <div class="text-xs text-gray-500">Pending Assessments</div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Review status</span>
                <div class="flex items-center text-purple-600">
                  <AcademicCapIcon class="w-4 h-4 mr-1" />
                  <span class="text-sm font-medium">{{ adminStats.pendingAssessments > 5 ? 'Review' : 'On Track' }}</span>
                </div>
              </div>
            </div>

            <!-- System Health -->
            <div class="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <CheckCircleIcon class="w-6 h-6 text-white" />
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-green-600">98.5%</div>
                  <div class="text-xs text-gray-500">System Health</div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Uptime</span>
                <div class="flex items-center text-green-600">
                  <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span class="text-sm font-medium">Excellent</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Dashboard Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left Column: Action Required & Approvals -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Action Required Section -->
              <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div class="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-red-100">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="p-2 bg-red-100 rounded-lg">
                        <ExclamationTriangleIcon class="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h2 class="text-lg font-semibold text-gray-900">Action Required</h2>
                        <p class="text-sm text-gray-600">Items needing your immediate attention</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        {{ (adminStats.pendingLeaves || 19) + (adminStats.pendingAssessments || 9) }} pending
                      </span>
                      <button @click="handleRefresh" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all">
                        <ArrowPathIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="p-6">
                  <PendingApprovalsWidget
                    :approvals="pendingApprovals"
                    :loading="loading"
                    @approve="handleApproval"
                    @reject="handleRejection"
                    @view-all="() => router.visit(route('approvals.index'))"
                  />
                </div>
              </div>

              <!-- Competency Management Dashboard -->
              <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="p-2 bg-blue-100 rounded-lg">
                        <AcademicCapIcon class="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 class="text-lg font-semibold text-gray-900">Competency Management</h2>
                        <p class="text-sm text-gray-600">Track and manage employee competencies</p>
                      </div>
                    </div>
                    <button 
                      @click="navigateTo('assessment-dashboard')" 
                      class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                      <ChevronRightIcon class="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
                
                <div class="p-6">
                  <!-- Competency Metrics Grid -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                      <div class="text-2xl font-bold text-green-600">{{ adminStats.completedAssessmentsThisMonth || 0 }}</div>
                      <div class="text-xs text-gray-600 mt-1">Completed</div>
                    </div>
                    <div class="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <div class="text-2xl font-bold text-orange-600">{{ adminStats.pendingAssessments || 9 }}</div>
                      <div class="text-xs text-gray-600 mt-1">Pending</div>
                    </div>
                    <div class="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <div class="text-2xl font-bold text-purple-600">{{ adminStats.activeAssessmentCycles || 4 }}</div>
                      <div class="text-xs text-gray-600 mt-1">Active Cycles</div>
                    </div>
                    <div class="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div class="text-2xl font-bold text-blue-600">4.2</div>
                      <div class="text-xs text-gray-600 mt-1">Avg Rating</div>
                    </div>
                  </div>

                  <!-- Recent Activity -->
                  <div class="space-y-3">
                    <h3 class="text-sm font-medium text-gray-900 mb-3">Recent Competency Activity</h3>
                    <div class="space-y-2">
                      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-3">
                          <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span class="text-sm text-gray-700">Q4 Performance Review cycle started</span>
                        </div>
                        <span class="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-3">
                          <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span class="text-sm text-gray-700">5 new assessments submitted</span>
                        </div>
                        <span class="text-xs text-gray-500">4 hours ago</span>
                      </div>
                      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-3">
                          <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span class="text-sm text-gray-700">Leadership competency updated</span>
                        </div>
                        <span class="text-xs text-gray-500">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Quick Actions & Insights -->
            <div class="lg:col-span-1 space-y-6">
              
              <!-- Quick Actions -->
              <div class="bg-white rounded-2xl border border-gray-100 p-6">
                <div class="flex items-center space-x-3 mb-6">
                  <div class="p-2 bg-blue-100 rounded-lg">
                    <PlusIcon class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    <p class="text-sm text-gray-600">Common tasks</p>
                  </div>
                </div>
                
                <div class="space-y-3">
                  <button 
                    @click="navigateTo('competencies.create')"
                    class="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all group"
                  >
                    <div class="flex items-center">
                      <AcademicCapIcon class="w-5 h-5 mr-3" />
                      <span class="font-medium">Add Competency</span>
                    </div>
                    <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button 
                    @click="navigateTo('employees.index')"
                    class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all group"
                  >
                    <div class="flex items-center">
                      <UsersIcon class="w-5 h-5 mr-3" />
                      <span class="font-medium">Manage Employees</span>
                    </div>
                    <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button 
                    @click="navigateTo('assessment-cycles.create')"
                    class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all group"
                  >
                    <div class="flex items-center">
                      <PlusIcon class="w-5 h-5 mr-3" />
                      <span class="font-medium">New Assessment Cycle</span>
                    </div>
                    <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button 
                    @click="navigateTo('reports.index')"
                    class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all group"
                  >
                    <div class="flex items-center">
                      <ChartBarIcon class="w-5 h-5 mr-3" />
                      <span class="font-medium">View Reports</span>
                    </div>
                    <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button 
                    @click="navigateTo('system-settings.index')"
                    class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all group"
                  >
                    <div class="flex items-center">
                      <CogIcon class="w-5 h-5 mr-3" />
                      <span class="font-medium">System Settings</span>
                    </div>
                    <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              <!-- Birthday Notifications -->
              <BirthdayNotifications 
                :todays-birthdays="birthdayData.todaysBirthdays"
                :upcoming-birthdays="birthdayData.upcomingBirthdays"
                :stats="birthdayData.stats"
              />

              <!-- Performance Insights -->
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-6">
                <div class="flex items-center space-x-3 mb-6">
                  <div class="p-2 bg-green-100 rounded-lg">
                    <ChartBarIcon class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">Performance Insights</h3>
                    <p class="text-sm text-gray-600">Key metrics</p>
                  </div>
                </div>
                
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 bg-white rounded-xl">
                    <div class="flex items-center space-x-3">
                      <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span class="text-sm font-medium text-gray-700">Top Performing</span>
                    </div>
                    <span class="text-sm font-semibold text-green-600">Communication</span>
                  </div>
                  
                  <div class="flex items-center justify-between p-3 bg-white rounded-xl">
                    <div class="flex items-center space-x-3">
                      <div class="w-3 h-3 bg-orange-400 rounded-full"></div>
                      <span class="text-sm font-medium text-gray-700">Needs Attention</span>
                    </div>
                    <span class="text-sm font-semibold text-orange-600">Technical Skills</span>
                  </div>
                  
                  <div class="flex items-center justify-between p-3 bg-white rounded-xl">
                    <div class="flex items-center space-x-3">
                      <div class="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span class="text-sm font-medium text-gray-700">Average Rating</span>
                    </div>
                    <span class="text-sm font-semibold text-blue-600">4.2/5.0</span>
                  </div>
                  
                  <div class="pt-4 border-t border-green-200">
                    <button 
                      @click="navigateTo('competency-analytics.reports')"
                      class="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <span class="font-medium">View Detailed Analytics</span>
                      <ChevronRightIcon class="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- System Status -->
              <div class="bg-white rounded-2xl border border-gray-100 p-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">System Status</h3>
                    <p class="text-sm text-gray-600">All systems operational</p>
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Database</span>
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span class="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">API Services</span>
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span class="text-sm font-medium text-green-600">Online</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Uptime</span>
                    <span class="text-sm font-medium text-gray-900">98.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      <!-- Manager Dashboard Layout -->
      <div v-else-if="isManager" class="manager-layout">
        <!-- Team Overview -->
        <div class="team-overview-section">
          <h2 class="section-title">Team Overview</h2>
          <div class="stats-grid-primary">
            <StatsCard
              :value="managerStats.teamSize"
              label="Team Members"
              icon="users"
              variant="primary"
              :trend="managerStats.teamTrend"
              :loading="loading"
              size="large"
              :clickable="true"
              route="employees.index"
            />
            <StatsCard
              :value="managerStats.pendingLeaves"
              label="Pending Team Leaves"
              icon="calendar"
              variant="warning"
              :loading="loading"
              size="large"
              :urgent="managerStats.pendingLeaves > 5"
              :clickable="true"
              route="leaves.index"
            />
            <StatsCard
              :value="managerStats.activeProjects"
              label="Active Projects"
              icon="folder"
              variant="success"
              :trend="managerStats.projectTrend"
              :loading="loading"
              size="large"
              :clickable="true"
              route="projects.index"
            />
            <StatsCard
              :value="managerStats.teamPerformance"
              label="Team Performance"
              icon="chart-bar"
              variant="info"
              suffix="%"
              :loading="loading"
              size="large"
              :clickable="true"
              route="reports.index"
            />
          </div>
        </div>

        <!-- Team Management -->
        <div class="team-management-section">
          <h2 class="section-title">Team Management</h2>
          <div class="content-grid-main">
            <!-- Team Members - Direct Reports -->
            <div class="team-members-card priority-high">
              <TeamMembersWidget
                :members="teamMembers"
                :loading="loading"
                @view-member="handleViewMember"
                @send-message="handleSendMessage"
              />
            </div>

            <!-- Team Competency Overview -->
            <div class="team-competency-card priority-high">
              <CompetencyDashboardWidget
                title="Team Competencies"
                :metrics="{
                  completedAssessments: managerStats.teamCompletedAssessments || 0,
                  pendingAssessments: managerStats.teamPendingAssessments || 0,
                  activeCycles: 0,
                  averageRating: null
                }"
                :loading="loading"
                @view-details="() => $inertia.visit(route('competency-assessments.index'))"
              />
            </div>
          </div>
        </div>

        <!-- Team Performance -->
        <div class="team-performance-section">
          <h2 class="section-title">Performance Insights</h2>
          <div class="content-grid-secondary">
            <!-- Team Performance Metrics -->
            <div class="team-performance-card priority-medium">
              <TeamPerformanceWidget
                :performance="teamPerformance"
                :loading="loading"
              />
            </div>

            <!-- Team Activities -->
            <div class="team-activities-card priority-medium">
              <TeamActivitiesWidget
                :activities="teamActivities"
                :loading="loading"
              />
            </div>
          </div>
        </div>

        <!-- Birthday Notifications for Managers -->
        <div class="birthday-section">
          <BirthdayNotifications 
            :todays-birthdays="birthdayData.todaysBirthdays"
            :upcoming-birthdays="birthdayData.upcomingBirthdays"
            :stats="birthdayData.stats"
          />
        </div>
      </div>

      <!-- Employee Dashboard Layout -->
      <div v-else class="employee-layout">
        <EmployeeDashboard
          :stats="employeeStats"
          :personal-activities="personalActivities"
          :todays-schedule="todaysSchedule"
          :my-tasks="myTasks"
          :recent-feedback="recentFeedback"
          :clocked-in="clockedIn"
          :current-attendance="currentAttendance"
          :loading="loading"
          @clock-in-out="handleClockInOut"
          @action="handleAction"
          @toggle-task="handleToggleTask"
          @view-task="handleViewTask"
        />

        <!-- Birthday Notifications for Employees -->
        <div class="birthday-section mt-6">
          <BirthdayNotifications 
            :todays-birthdays="birthdayData.todaysBirthdays"
            :upcoming-birthdays="birthdayData.upcomingBirthdays"
            :stats="birthdayData.stats"
          />
        </div>
      </div>
    </div></div>

    <!-- Rejection Modal -->
    <div v-if="showRejectionModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="cancelRejection"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Reject {{ rejectionItem?.title || 'Request' }}
                </h3>
                <div class="space-y-4">
                  <div>
                    <p class="text-sm text-gray-600 mb-2">
                      <strong>Requester:</strong> {{ rejectionItem?.requester }}
                    </p>
                    <p class="text-sm text-gray-600 mb-4">
                      <strong>Request:</strong> {{ rejectionItem?.description }}
                    </p>
                  </div>
                  <div>
                    <label for="rejection-reason" class="block text-sm font-medium text-gray-700 mb-2">
                      Reason for rejection <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      id="rejection-reason"
                      v-model="rejectionReason"
                      rows="4"
                      class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Please provide a clear reason for rejecting this request..."
                      required
                    ></textarea>
                    <p class="text-xs text-gray-500 mt-1">
                      This reason will be sent to the employee and recorded in the system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="confirmRejection"
              :disabled="!rejectionReason.trim()"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject Request
            </button>
            <button
              @click="cancelRejection"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Approval Modal -->
    <ApprovalModal
      :show="showApprovalModal"
      :approval="selectedApproval"
      :action="approvalAction"
      @close="closeApprovalModal"
      @submit="handleApprovalSubmit"
    />

    <!-- Floating Notifications -->
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
import { computed, ref } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import { router } from '@inertiajs/vue3';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentSection from '@/Components/Layout/ContentSection.vue';
// Dashboard Components
import AdminDashboard from '@/Components/Dashboard/AdminDashboard.vue';
import ManagerDashboard from '@/Components/Dashboard/ManagerDashboard.vue';
import EmployeeDashboard from '@/Components/Dashboard/EmployeeDashboard.vue';
import ApprovalModal from '@/Components/Dashboard/ApprovalModal.vue';

// Widget Components (these would need to be created)
import StatsCard from '@/Components/Dashboard/StatsCard.vue';
import SystemHealthWidget from '@/Components/Dashboard/SystemHealthWidget.vue';
import PendingApprovalsWidget from '@/Components/Dashboard/PendingApprovalsWidget.vue';
import SystemActivitiesWidget from '@/Components/Dashboard/SystemActivitiesWidget.vue';
import RecentUserActivityWidget from '@/Components/Dashboard/RecentUserActivityWidget.vue';
import QuickActionsWidget from '@/Components/Dashboard/QuickActionsWidget.vue';
import TeamMembersWidget from '@/Components/Dashboard/TeamMembersWidget.vue';
import TeamPerformanceWidget from '@/Components/Dashboard/TeamPerformanceWidget.vue';
import TeamActivitiesWidget from '@/Components/Dashboard/TeamActivitiesWidget.vue';
import TimeTrackingWidget from '@/Components/Dashboard/TimeTrackingWidget.vue';
import TodaysScheduleWidget from '@/Components/Dashboard/TodaysScheduleWidget.vue';
import MyTasksWidget from '@/Components/Dashboard/MyTasksWidget.vue';
import RecentFeedbackWidget from '@/Components/Dashboard/RecentFeedbackWidget.vue';
import PersonalActivitiesWidget from '@/Components/Dashboard/PersonalActivitiesWidget.vue';
import CompetencyDashboardWidget from '@/Components/Dashboard/CompetencyDashboardWidget.vue';
import BirthdayNotifications from '@/Components/Dashboard/BirthdayNotifications.vue';

// Icons
import {
  CogIcon,
  ChartBarIcon,
  ArrowPathIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  UsersIcon,
  AcademicCapIcon,
  ServerIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  // Legacy props for backward compatibility
  totalEmployees: Number,
  pendingLeaves: Number,
  pendingTimesheets: Number,
  recentFeedbacks: Array,
  teamAttendances: Array,
  pendingApprovals: Array,
  myAttendances: Array,
  myLeaves: Array,
  myTimesheets: Array,
  myFeedbacks: Array,
  
  // Role-specific data props
  adminStats: {
    type: Object,
    default: () => ({})
  },
  managerStats: {
    type: Object,
    default: () => ({})
  },
  employeeStats: {
    type: Object,
    default: () => ({})
  },
  systemActivities: {
    type: Array,
    default: () => []
  },
  teamActivities: {
    type: Array,
    default: () => []
  },
  personalActivities: {
    type: Array,
    default: () => []
  },
  systemHealth: {
    type: Object,
    default: () => ({})
  },
  recentUserActivity: {
    type: Array,
    default: () => []
  },
  teamPerformance: {
    type: Object,
    default: () => ({})
  },
  teamMembers: {
    type: Array,
    default: () => []
  },
  todaysSchedule: {
    type: Array,
    default: () => []
  },
  myTasks: {
    type: Array,
    default: () => []
  },
  recentFeedback: {
    type: Array,
    default: () => []
  },
  clockedIn: {
    type: Boolean,
    default: false
  },
  currentAttendance: {
    type: Object,
    default: () => ({
      clocked_in: false,
      on_break: false,
      clock_in_time: null,
      todays_summary: {
        total_hours: '0h 0m',
        break_time: '0h 0m',
        sessions: 0,
        clock_ins: 0
      },
      recent_activities: [],
      stats: {
        weekly_hours: '0h 0m',
        monthly_hours: '0h 0m',
        average_daily: '0h 0m'
      }
    })
  },
  birthdayData: {
    type: Object,
    default: () => ({
      todaysBirthdays: [],
      upcomingBirthdays: [],
      stats: null
    })
  }
});

// Composables
const { hasRole, user } = useAuth();

// Local state
const loading = ref(false);
const notifications = ref([]);

// Rejection modal state
const showRejectionModal = ref(false);
const rejectionItem = ref(null);
const rejectionReason = ref('');

// Approval modal state
const showApprovalModal = ref(false);
const selectedApproval = ref(null);
const approvalAction = ref('approve');

// Role detection computed properties
const isAdmin = computed(() => hasRole('Admin'));
const isManager = computed(() => hasRole('Manager') && !isAdmin.value);

// Dynamic page title and subtitle based on user role
const pageTitle = computed(() => {
  if (isAdmin.value) return 'Admin Dashboard';
  if (isManager.value) return 'Manager Dashboard';
  return `Welcome back, ${user.value?.name || 'Employee'}!`;
});

const pageSubtitle = computed(() => {
  if (isAdmin.value) return 'System overview and administrative management tools.';
  if (isManager.value) return 'Team overview and management tools.';
  return "Here's your personal workspace and productivity tools.";
});

// Quick actions for different roles
const adminQuickActions = computed(() => [
  {
    id: 'add-employee',
    label: 'Add Employee',
    icon: 'user-plus',
    variant: 'primary',
    handler: () => router.visit(route('employees.create'))
  },
  {
    id: 'system-reports',
    label: 'System Reports',
    icon: 'chart-bar',
    variant: 'secondary',
    handler: () => router.visit(route('reports.index'))
  },
  {
    id: 'manage-departments',
    label: 'Manage Departments',
    icon: 'building-office',
    variant: 'secondary',
    handler: () => router.visit(route('departments.index'))
  },
  {
    id: 'backup-system',
    label: 'Backup System',
    icon: 'cloud-arrow-up',
    variant: 'ghost',
    handler: () => handleAction({ type: 'backup-system' })
  }
]);

// Breadcrumb navigation - Dashboard is the root page
const breadcrumbs = computed(() => [
  {
    label: 'Dashboard',
    href: route('dashboard'),
    current: true
  }
]);

// Header actions - can be customized based on role
const headerActions = computed(() => {
  const actions = [];
  
  if (isAdmin.value) {
    actions.push({
      id: 'system-settings',
      label: 'System Settings',
      icon: 'cog-6-tooth',
      variant: 'secondary',
      handler: () => {
        navigateTo('system-settings.index');
      }
    });
  }
  
  if (isAdmin.value || isManager.value) {
    actions.push({
      id: 'reports',
      label: 'View Reports',
      icon: 'chart-bar',
      variant: 'secondary',
      handler: () => {
        navigateTo('reports.index');
      }
    });
  }
  
  actions.push({
    id: 'refresh',
    label: 'Refresh',
    icon: 'arrow-path',
    variant: 'ghost',
    handler: handleRefresh,
    disabled: loading.value
  });
  
  return actions;
});

// UI Helper Methods
const getActionButtonClasses = (variant) => {
  const baseClasses = 'action-button';
  return `${baseClasses} ${variant}`;
};

const getIconComponent = (iconName) => {
  // Map icon names to actual icon components
  const iconMap = {
    'cog-6-tooth': 'CogIcon',
    'chart-bar': 'ChartBarIcon',
    'arrow-path': 'ArrowPathIcon',
    'user-plus': 'UserPlusIcon',
    'building-office': 'BuildingOfficeIcon',
    'cloud-arrow-up': 'CloudArrowUpIcon'
  };
  return iconMap[iconName] || 'QuestionMarkCircleIcon';
};

const getNotificationIcon = (type) => {
  const iconMap = {
    success: 'CheckCircleIcon',
    error: 'XCircleIcon',
    warning: 'ExclamationTriangleIcon',
    info: 'InformationCircleIcon'
  };
  return iconMap[type] || 'InformationCircleIcon';
};

// Event handlers for role-specific dashboard components
const handleRefresh = async () => {
  loading.value = true;
  try {
    // Refresh dashboard data - this would typically make API calls
    // For now, we'll just simulate a refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    showNotification('Dashboard refreshed successfully', 'success');
  } finally {
    loading.value = false;
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
  
  // Auto-remove notification after duration
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

// Current time display
const currentTime = ref(new Date().toLocaleTimeString());

// Update time every minute
setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString();
}, 60000);

// Navigation helper
const navigateTo = (routeName) => {
  try {
    // Handle special cases for routes that might not exist
    if (routeName === 'competency-analytics.reports') {
      // Fallback to general reports if competency analytics reports don't exist
      router.visit(route('reports.index'));
      return;
    }
    
    router.visit(route(routeName));
  } catch (error) {
    console.error('Navigation error:', error);
    
    // Fallback navigation for common routes
    if (routeName.includes('reports')) {
      try {
        router.visit(route('reports.index'));
        return;
      } catch (fallbackError) {
        console.error('Fallback navigation failed:', fallbackError);
      }
    }
    
    showNotification('Navigation failed - route not found', 'error');
  }
};

const handleApproval = (approval) => {
  console.log('🎯 Opening approval modal for:', approval);
  console.log('🎯 Modal state before:', showApprovalModal.value);
  selectedApproval.value = approval;
  approvalAction.value = 'approve';
  showApprovalModal.value = true;
  console.log('🎯 Modal state after:', showApprovalModal.value);
  console.log('🎯 Selected approval:', selectedApproval.value);
};

const handleRejection = (approval) => {
  console.log('🚫 Opening rejection modal for:', approval);
  console.log('🚫 Modal state before:', showApprovalModal.value);
  selectedApproval.value = approval;
  approvalAction.value = 'reject';
  showApprovalModal.value = true;
  console.log('🚫 Modal state after:', showApprovalModal.value);
  console.log('🚫 Selected approval:', selectedApproval.value);
};

// Close approval modal
const closeApprovalModal = () => {
  showApprovalModal.value = false;
  selectedApproval.value = null;
  approvalAction.value = 'approve';
};


const confirmRejection = async () => {
  if (!rejectionReason.value.trim()) {
    showNotification('❌ Please provide a reason for rejection', 'error');
    return;
  }
  
  const approval = rejectionItem.value;
  const comments = rejectionReason.value.trim();
  
  try {
    console.log('🚫 Rejecting approval item:', approval);
    console.log('📋 Approval type:', approval.type);
    console.log('🆔 Approval ID:', approval.id);
    console.log('💬 Rejection reason:', comments);
    
    // Close modal and show loading state
    showRejectionModal.value = false;
    showNotification('Processing rejection...', 'info');
    
    let response;
    let endpoint;
    
    // Handle different approval types
    const requestConfig = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    };
    
    if (approval.type === 'timesheet') {
      endpoint = `/timesheets/${approval.id}/reject`;
      response = await axios.post(endpoint, {
        comments: comments
      }, requestConfig);
    } else if (approval.type === 'leave' || approval.type === 'Leave Request') {
      endpoint = `/leaves/${approval.id}/reject`;
      response = await axios.post(endpoint, {
        comments: comments
      }, requestConfig);
    } else {
      // Generic rejection endpoint - adjust as needed
      endpoint = `/${approval.type}s/${approval.id}/reject`;
      response = await axios.post(endpoint, {
        comments: comments
      }, requestConfig);
    }
    
    console.log('📡 Making request to:', endpoint);
    console.log('✅ Response received:', response.data);
    
    if (response.data.success) {
      const itemType = approval.type === 'Leave Request' ? 'Leave request' : approval.type;
      console.log(`${itemType} rejected successfully`);
      showNotification(`✅ ${itemType} rejected successfully!`, 'success');
      
      // Refresh dashboard data with a small delay to avoid Inertia conflicts
      setTimeout(() => {
        router.reload({
          only: ['pendingApprovals', 'adminStats', 'managerStats'],
          preserveScroll: true
        });
      }, 100);
    } else {
      console.warn('⚠️ Rejection succeeded but response indicates failure:', response.data);
      showNotification('⚠️ Rejection may not have been processed correctly', 'warning');
    }
    
  } catch (error) {
    console.error('❌ Error rejecting item:', error);
    console.error('📄 Error response:', error.response?.data);
    console.error('🔢 Error status:', error.response?.status);
    
    let errorMessage = 'Failed to reject item. Please try again.';
    
    if (error.response?.status === 403) {
      errorMessage = 'You are not authorized to reject this request. Please contact your administrator.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    showNotification('❌ ' + errorMessage, 'error');
  }
};

const cancelRejection = () => {
  showRejectionModal.value = false;
  rejectionItem.value = null;
  rejectionReason.value = '';
};

// Approval modal handlers (closeApprovalModal already declared above)

const handleApprovalSubmit = async (data) => {
  const { approval, action, comments } = data;
  
  try {
    console.log(`🎯 ${action === 'approve' ? 'Approving' : 'Rejecting'} approval item:`, approval);
    console.log('📋 Approval type:', approval.type);
    console.log('🆔 Approval ID:', approval.id);
    console.log('💬 Comments:', comments);
    
    // Close modal first
    closeApprovalModal();
    
    // Show loading state
    showNotification(`Processing ${action}...`, 'info');
    
    let response;
    let endpoint;
    
    // Handle different approval types
    const requestConfig = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    };
    
    if (approval.type === 'timesheet') {
      endpoint = `/timesheets/${approval.id}/${action}`;
      response = await axios.post(endpoint, {
        comments: comments || `${action === 'approve' ? 'Approved' : 'Rejected'} from dashboard`
      }, requestConfig);
    } else if (approval.type === 'leave' || approval.type === 'Leave Request') {
      endpoint = `/leaves/${approval.id}/${action}`;
      response = await axios.post(endpoint, {
        comments: comments || `${action === 'approve' ? 'Approved' : 'Rejected'} from dashboard`
      }, requestConfig);
    } else if (approval.type === 'competency-assessment') {
      endpoint = `/competency-assessments/${approval.id}/${action}`;
      response = await axios.post(endpoint, {
        comments: comments || `${action === 'approve' ? 'Approved' : 'Rejected'} from dashboard`
      }, requestConfig);
    } else {
      // Generic approval endpoint - adjust as needed
      endpoint = `/${approval.type}s/${approval.id}/${action}`;
      response = await axios.post(endpoint, {
        comments: comments || `${action === 'approve' ? 'Approved' : 'Rejected'} from dashboard`
      }, requestConfig);
    }
    
    console.log('📡 Making request to:', endpoint);
    console.log('✅ Response received:', response.data);
    
    if (response.data.success) {
      const itemType = approval.type === 'Leave Request' ? 'Leave request' : approval.type;
      const actionText = action === 'approve' ? 'approved' : 'rejected';
      console.log(`${itemType} ${actionText} successfully`);
      showNotification(`✅ ${itemType} ${actionText} successfully!`, 'success');
      
      // Refresh dashboard data with a small delay to avoid Inertia conflicts
      setTimeout(() => {
        router.reload({
          only: ['pendingApprovals', 'adminStats', 'managerStats'],
          preserveScroll: true
        });
      }, 100);
    } else {
      console.warn(`⚠️ ${action} succeeded but response indicates failure:`, response.data);
      showNotification(`⚠️ ${action} may not have been processed correctly`, 'warning');
    }
    
  } catch (error) {
    console.error(`❌ Error ${action}ing item:`, error);
    console.error('📄 Error response:', error.response?.data);
    console.error('🔢 Error status:', error.response?.status);
    
    let errorMessage = `Failed to ${action} item. Please try again.`;
    
    if (error.response?.status === 403) {
      errorMessage = `You are not authorized to ${action} this request. Please contact your administrator.`;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    showNotification('❌ ' + errorMessage, 'error');
  }
};

const handleAction = async (actionData) => {
  console.log('Dashboard action:', actionData);
  loading.value = true;
  
  try {
    // Handle different types of actions
    switch (actionData.type) {
      case 'take-break':
        console.log('Taking break...');
        const breakResponse = await axios.post('/api/attendance/break-start');
        if (breakResponse.data.success) {
          console.log('Break started successfully');
          showNotification('Break started successfully!', 'success');
          
          // Reload dashboard data
          router.reload({
            only: ['currentAttendance', 'clockedIn', 'employeeStats'],
            preserveScroll: true
          });
        }
        break;
        
      case 'end-break':
        console.log('Ending break...');
        const endBreakResponse = await axios.post('/api/attendance/break-end');
        if (endBreakResponse.data.success) {
          console.log('Break ended successfully');
          showNotification('Break ended successfully!', 'success');
          
          // Reload dashboard data
          router.reload({
            only: ['currentAttendance', 'clockedIn', 'employeeStats'],
            preserveScroll: true
          });
        }
        break;
        
      case 'quick-action':
        if (actionData.data?.route) {
          router.visit(route(actionData.data.route));
        }
        break;
        
      case 'view-calendar':
        // Navigate to calendar view
        console.log('Navigate to calendar');
        break;
        
      case 'view-all-approvals':
        // Navigate to approvals page
        router.visit(route('timesheets.pending-approvals'));
        break;
        
      default:
        console.log('Unhandled action type:', actionData.type);
    }
  } catch (error) {
    console.error('Error handling action:', error);
    showNotification('Action failed. Please try again.', 'error');
  } finally {
    loading.value = false;
  }
};

// Manager-specific event handlers
const handleViewMember = (member) => {
  console.log('Viewing member:', member);
  // Navigate to member details page or open modal
};

const handleSendMessage = (member) => {
  console.log('Sending message to:', member);
  // Open messaging interface or navigate to chat
};

// Employee-specific event handlers
const handleClockInOut = async () => {
  loading.value = true;
  
  try {
    console.log('Clock in/out action');
    
    // Determine if we're clocking in or out
    const isClockedIn = props.currentAttendance.clocked_in;
    const endpoint = isClockedIn ? '/api/attendance/clock-out' : '/api/attendance/clock-in';
    
    console.log(`Making ${isClockedIn ? 'clock out' : 'clock in'} request to ${endpoint}`);
    
    // Make API call
    const response = await axios.post(endpoint, {
      location: 'Dashboard', // Optional location data
    });
    
    if (response.data.success) {
      console.log('Clock in/out successful:', response.data);
      
      // Show success message
      console.log(response.data.message);
      
      // Broadcast update to floating widget
      try {
        // Use a more reliable broadcasting method
        const updateEvent = new CustomEvent('attendance-state-changed', {
          detail: {
            clockedIn: !isClockedIn,
            onBreak: false,
            clockInTime: isClockedIn ? null : new Date().toISOString(),
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(updateEvent);
        
        // Also update localStorage for persistence
        localStorage.setItem('attendance-update', Date.now().toString());
        setTimeout(() => localStorage.removeItem('attendance-update'), 100);
      } catch (error) {
        console.warn('Failed to broadcast attendance update:', error);
      }
      
      // Reload the dashboard to get updated attendance data
      router.reload({
        only: ['currentAttendance', 'clockedIn', 'employeeStats'],
        preserveScroll: true
      });
      
    } else {
      console.error('Clock in/out failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('Error with clock in/out:', error);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data.message);
    } else if (error.response?.status === 401) {
      console.error('Unauthorized - please log in again');
    } else {
      console.error('Network or server error');
    }
  } finally {
    loading.value = false;
  }
};

const handleToggleTask = async (task) => {
  try {
    console.log('Toggling task completion:', task);
    // Handle task completion toggle - make API call
    // This would typically update the task status
  } catch (error) {
    console.error('Error toggling task:', error);
  }
};

const handleViewTask = (task) => {
  console.log('Viewing task:', task);
  // Navigate to task details page or open modal
};

// Break functionality
const handleTakeBreak = async () => {
  loading.value = true;
  
  try {
    console.log('Starting break...');
    
    // Make API call to start break
    const response = await axios.post('/api/attendance/break-start', {
      timestamp: new Date().toISOString(),
    });
    
    if (response.data.success) {
      console.log('Break started successfully:', response.data);
      
      // Broadcast update to floating widget
      try {
        // Use a more reliable broadcasting method
        const updateEvent = new CustomEvent('attendance-state-changed', {
          detail: {
            clockedIn: true,
            onBreak: true,
            clockInTime: props.currentAttendance.clock_in_time,
            breakStartTime: new Date().toISOString(),
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(updateEvent);
        
        // Also update localStorage for persistence
        localStorage.setItem('attendance-update', Date.now().toString());
        setTimeout(() => localStorage.removeItem('attendance-update'), 100);
      } catch (error) {
        console.warn('Failed to broadcast attendance update:', error);
      }
      
      // Reload the dashboard to get updated attendance data
      router.reload({
        only: ['currentAttendance', 'clockedIn', 'employeeStats'],
        preserveScroll: true
      });
      
    } else {
      console.error('Break start failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('Error starting break:', error);
    
    if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data.message);
    } else if (error.response?.status === 401) {
      console.error('Unauthorized - please log in again');
    } else {
      console.error('Network or server error');
    }
  } finally {
    loading.value = false;
  }
};

const handleEndBreak = async () => {
  loading.value = true;
  
  try {
    console.log('Ending break...');
    
    // Make API call to end break
    const response = await axios.post('/api/attendance/break-end', {
      timestamp: new Date().toISOString(),
    });
    
    if (response.data.success) {
      console.log('Break ended successfully:', response.data);
      
      // Broadcast update to floating widget
      try {
        // Use a more reliable broadcasting method
        const updateEvent = new CustomEvent('attendance-state-changed', {
          detail: {
            clockedIn: true,
            onBreak: false,
            clockInTime: props.currentAttendance.clock_in_time,
            breakStartTime: null,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(updateEvent);
        
        // Also update localStorage for persistence
        localStorage.setItem('attendance-update', Date.now().toString());
        setTimeout(() => localStorage.removeItem('attendance-update'), 100);
      } catch (error) {
        console.warn('Failed to broadcast attendance update:', error);
      }
      
      // Reload the dashboard to get updated attendance data
      router.reload({
        only: ['currentAttendance', 'clockedIn', 'employeeStats'],
        preserveScroll: true
      });
      
    } else {
      console.error('Break end failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('Error ending break:', error);
    
    if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data.message);
    } else if (error.response?.status === 401) {
      console.error('Unauthorized - please log in again');
    } else {
      console.error('Network or server error');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* =============================================================================
   DASHBOARD VISUAL HIERARCHY & HIG PRINCIPLES
   Following Human Interface Guidelines for optimal UX
   ============================================================================= */

/* Dashboard Header - Clear Information Architecture */
.dashboard-header {
  @apply bg-white border-b border-gray-200 sticky top-0 z-40;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}

.header-container {
  @apply max-w-7xl mx-auto;
}

.header-content {
  @apply flex items-center justify-between px-6 py-4;
}

.title-section {
  @apply flex-1;
}

.dashboard-title {
  @apply text-2xl font-semibold text-gray-900 mb-1;
  letter-spacing: -0.025em;
}

.dashboard-subtitle {
  @apply text-sm text-gray-600 font-medium;
}

.header-actions {
  @apply flex items-center space-x-3;
}

.action-button {
  @apply inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.action-button.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.action-button.secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500;
}

.action-button.ghost {
  @apply text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:ring-gray-500;
}

/* Main Dashboard Container - Proper Spacing & Layout */
.dashboard-container {
  @apply min-h-screen bg-gray-50;
  padding: 24px 0;
}

.dashboard-container.clean-layout {
  @apply space-y-8;
}

.dashboard-container.clean-layout .primary-stats-section,
.dashboard-container.clean-layout .main-content-section,
.dashboard-container.clean-layout .secondary-content-section,
.dashboard-container.clean-layout .team-overview-section,
.dashboard-container.clean-layout .team-management-section,
.dashboard-container.clean-layout .team-performance-section {
  @apply bg-white rounded-lg shadow-sm border border-neutral-200 p-6;
}

.section-title {
  @apply text-lg font-semibold text-neutral-900 mb-6 pb-2 border-b border-neutral-200;
}

/* =============================================================================
   ADMIN DASHBOARD LAYOUT - Information Hierarchy
   ============================================================================= */
.admin-layout {
  @apply max-w-7xl mx-auto px-6 space-y-8;
}

/* Primary Stats - Most Important Metrics (F-Pattern Top) */
.primary-stats-section {
  @apply mb-8;
}

.stats-grid-primary {
  @apply grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6;
}

/* Secondary Content - Supporting Information (F-Pattern Middle) */
.secondary-content-section {
  @apply mb-8;
}

.content-grid-main {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-8;
}

.content-grid-secondary {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

/* Tertiary Content - Additional Context (F-Pattern Bottom) */
.tertiary-content-section {
  @apply mb-8;
}

.main-content-section {
  @apply mb-8;
}

.secondary-content-section {
  @apply mb-6;
}

.team-management-section {
  @apply mb-8;
}

.team-performance-section {
  @apply mb-6;
}

/* =============================================================================
   MANAGER DASHBOARD LAYOUT - Team-Focused Hierarchy
   ============================================================================= */
.manager-layout {
  @apply max-w-7xl mx-auto px-6 space-y-8;
}

.team-overview-section {
  @apply mb-8;
}

.team-management-section {
  @apply mb-8;
}

.content-grid-main {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-8;
}

/* =============================================================================
   EMPLOYEE DASHBOARD LAYOUT - Personal Productivity Focus
   ============================================================================= */
.employee-layout {
  @apply max-w-7xl mx-auto px-6 space-y-8;
}

/* Time Tracking Hero - Primary Focus for Employees */
.productivity-section {
  @apply mb-8;
}

.time-tracking-hero {
  @apply mb-6;
}

.personal-stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}

/* Personal Workspace - Secondary Actions */
.workspace-section {
  @apply mb-8;
}

.content-grid-employee {
  @apply grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6;
}

/* =============================================================================
   PRIORITY-BASED VISUAL HIERARCHY
   Following HFI principles for attention management
   ============================================================================= */

/* High Priority Cards - Immediate Attention Required */
.priority-high {
  @apply ring-2 ring-blue-100 bg-white shadow-lg;
  transform: translateY(-2px);
}

.priority-high:hover {
  @apply shadow-xl;
  transform: translateY(-4px);
}

/* Medium Priority Cards - Important but Not Urgent */
.priority-medium {
  @apply bg-white shadow-md;
}

.priority-medium:hover {
  @apply shadow-lg;
  transform: translateY(-1px);
}

/* Low Priority Cards - Contextual Information */
.priority-low {
  @apply bg-white shadow-sm;
}

.priority-low:hover {
  @apply shadow-md;
}

/* =============================================================================
   CARD COMPONENTS - Consistent Design System
   ============================================================================= */

/* System Health - Critical Status Indicator */
.system-health-card {
  @apply rounded-xl p-6 border border-gray-200 transition-all duration-200;
}

/* Pending Approvals - Action Required Indicator */
.pending-approvals-card {
  @apply rounded-xl p-6 border border-orange-200 bg-orange-50/30 transition-all duration-200;
}

/* Activities & Monitoring Cards */
.system-activities-card,
.team-activities-card,
.activities-card {
  @apply rounded-xl p-6 border border-gray-200 transition-all duration-200;
}

/* User & Team Management Cards */
.user-activity-card,
.team-members-card,
.team-performance-card {
  @apply rounded-xl p-6 border border-gray-200 transition-all duration-200;
}

/* Personal Productivity Cards */
.schedule-card,
.tasks-card,
.feedback-card {
  @apply rounded-xl p-6 border border-gray-200 transition-all duration-200;
}

/* Quick Actions Panel */
.quick-actions-card {
  @apply rounded-xl p-6 border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 transition-all duration-200;
}

/* =============================================================================
   NOTIFICATION SYSTEM - HIG Compliant Feedback
   ============================================================================= */
.notification-overlay {
  @apply fixed inset-0 z-50 flex items-start justify-end pointer-events-none;
  padding: 24px;
}

.notification-center {
  @apply pointer-events-auto space-y-3;
  max-width: 400px;
  width: 100%;
}

.notification-card {
  @apply flex items-start space-x-4 p-4 rounded-xl shadow-lg border backdrop-blur-sm;
  animation: slideInRight 0.3s ease-out;
}

.notification-success {
  @apply bg-green-50/95 border-green-200 text-green-800;
}

.notification-error {
  @apply bg-red-50/95 border-red-200 text-red-800;
}

.notification-warning {
  @apply bg-yellow-50/95 border-yellow-200 text-yellow-800;
}

.notification-info {
  @apply bg-blue-50/95 border-blue-200 text-blue-800;
}

.notification-icon {
  @apply flex-shrink-0 mt-0.5;
}

.notification-text {
  @apply flex-1 min-w-0;
}

.notification-message {
  @apply text-sm font-medium leading-relaxed;
}

.notification-close {
  @apply flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors;
}

/* =============================================================================
   ANIMATIONS & MICRO-INTERACTIONS
   ============================================================================= */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Card hover animations */
.system-health-card,
.pending-approvals-card,
.system-activities-card,
.team-activities-card,
.activities-card,
.user-activity-card,
.team-members-card,
.team-performance-card,
.schedule-card,
.tasks-card,
.feedback-card,
.quick-actions-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* =============================================================================
   RESPONSIVE DESIGN - Mobile-First Approach
   ============================================================================= */

/* Mobile Optimizations */
@media (max-width: 640px) {
  .dashboard-container {
    padding: 16px 0;
  }
  
  .admin-layout,
  .manager-layout,
  .employee-layout {
    @apply px-4 space-y-6;
  }
  
  .header-content {
    @apply flex-col items-start space-y-3 py-4;
  }
  
  .header-actions {
    @apply w-full justify-end;
  }
  
  .stats-grid-primary {
    @apply grid-cols-1 gap-4;
  }
  
  .content-grid-secondary,
  .content-grid-main,
  .content-grid-employee {
    @apply grid-cols-1 gap-4;
  }
  
  .personal-stats-grid {
    @apply grid-cols-1 gap-3;
  }
  
  .notification-overlay {
    @apply items-end justify-center;
    padding: 16px;
  }
  
  .notification-center {
    width: 100%;
    max-width: none;
  }
}

/* Tablet Optimizations */
@media (min-width: 641px) and (max-width: 1024px) {
  .stats-grid-primary {
    @apply grid-cols-2 gap-5;
  }
  
  .content-grid-secondary {
    @apply grid-cols-1 gap-5;
  }
  
  .content-grid-main,
  .content-grid-employee {
    @apply grid-cols-2 gap-5;
  }
  
  .personal-stats-grid {
    @apply grid-cols-2 gap-4;
  }
}

/* Desktop Optimizations */
@media (min-width: 1025px) {
  .stats-grid-primary {
    @apply grid-cols-3;
  }
  
  .content-grid-secondary {
    @apply grid-cols-3;
  }
  
  .content-grid-main,
  .content-grid-employee {
    @apply grid-cols-2;
  }
  
  .personal-stats-grid {
    @apply grid-cols-4;
  }
}

/* =============================================================================
   ACCESSIBILITY & FOCUS STATES
   ============================================================================= */
.action-button:focus,
.notification-close:focus {
  @apply outline-none ring-2 ring-offset-2;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .dashboard-header {
    @apply border-b-2 border-gray-900;
  }
  
  .priority-high {
    @apply ring-4 ring-blue-600;
  }
  
  .notification-card {
    @apply border-2;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .notification-card,
  .system-health-card,
  .pending-approvals-card,
  .system-activities-card,
  .team-activities-card,
  .activities-card,
  .user-activity-card,
  .team-members-card,
  .team-performance-card,
  .schedule-card,
  .tasks-card,
  .feedback-card,
  .quick-actions-card {
    transition: none;
    animation: none;
  }
  
  .priority-high:hover,
  .priority-medium:hover {
    transform: none;
  }
}
</style>
<style sco
ped>
/* Dashboard Layout Improvements */
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

/* Action Required Section Styling */
.action-required-section {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 mb-8;
}

.action-required-header {
  @apply px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50;
}

.action-required-content {
  @apply p-6;
}

/* System Overview Section Styling */
.system-overview-section {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
}

.system-health-card {
  @apply lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 h-full;
}

.quick-actions-card {
  @apply lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 h-full;
}

/* Card Headers */
.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-content {
  @apply p-6;
}

/* Status Indicators */
.status-indicator {
  @apply flex items-center;
}

.status-dot {
  @apply w-2 h-2 rounded-full mr-2;
}

.status-dot.online {
  @apply bg-green-400;
}

.status-dot.warning {
  @apply bg-yellow-400;
}

.status-dot.error {
  @apply bg-red-400;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .system-overview-section {
    @apply grid-cols-1;
  }
  
  .system-health-card,
  .quick-actions-card {
    @apply col-span-1;
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

/* Hover effects for interactive elements */
.hover-lift {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Gradient backgrounds for different sections */
.gradient-orange {
  @apply bg-gradient-to-br from-orange-50 to-red-50 border-orange-200;
}

.gradient-blue {
  @apply bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200;
}

.gradient-green {
  @apply bg-gradient-to-br from-green-50 to-emerald-50 border-green-200;
}

.gradient-purple {
  @apply bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200;
}
</style>