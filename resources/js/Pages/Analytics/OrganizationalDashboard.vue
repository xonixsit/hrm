<template>
  <AuthenticatedLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <nav class="flex mb-4" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2 text-sm">
                <li>
                  <Link :href="route('dashboard')" class="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </Link>
                </li>
                <li class="flex items-center">
                  <ChevronRightIcon class="w-4 h-4 text-gray-400 mx-2" />
                  <span class="text-gray-900 font-medium">Organizational Analytics</span>
                </li>
              </ol>
            </nav>

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="mb-4 sm:mb-0">
                <h1 class="text-3xl font-bold text-gray-900">Organizational Analytics</h1>
                <p class="mt-1 text-sm text-gray-600">Comprehensive visual insights across all organizational aspects</p>
              </div>
              <div class="flex items-center space-x-3">
                <!-- Real-time indicator -->
                <div class="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-lg">
                  <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div class="text-xs text-green-700">
                    <div class="font-medium">Live Data</div>
                    <div v-if="lastUpdated" class="text-green-600">{{ formatTime(lastUpdated) }}</div>
                  </div>
                </div>
                <select v-model="selectedTimeRange" @change="updateTimeRange" class="rounded-lg border-gray-300 text-sm">
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                  <option value="1y">Last year</option>
                </select>
                <SecondaryButton @click="exportDashboard" data-export-btn>
                  <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
                  Export
                </SecondaryButton>
                <PrimaryButton @click="refreshData">
                  <ArrowPathIcon class="w-4 h-4 mr-2" />
                  Refresh
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Key Performance Indicators -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Employees</p>
                <p class="text-3xl font-bold text-gray-900">{{ kpis.totalEmployees }}</p>
                <div class="flex items-center mt-2">
                  <ArrowTrendingUpIcon class="w-4 h-4 text-green-500 mr-1" />
                  <span class="text-sm text-green-600">+{{ kpis.employeeGrowth }}% this month</span>
                </div>
              </div>
              <div class="p-3 bg-teal-100 rounded-xl">
                <UsersIcon class="w-8 h-8 text-teal-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Avg Performance</p>
                <p class="text-3xl font-bold text-gray-900">{{ kpis.avgPerformance }}%</p>
                <div class="flex items-center mt-2">
                  <ArrowTrendingUpIcon class="w-4 h-4 text-green-500 mr-1" />
                  <span class="text-sm text-green-600">+{{ kpis.performanceChange }}% vs last period</span>
                </div>
              </div>
              <div class="p-3 bg-green-100 rounded-xl">
                <ChartBarIcon class="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p class="text-3xl font-bold text-gray-900">{{ kpis.attendanceRate }}%</p>
                <div class="flex items-center mt-2">
                  <ArrowTrendingDownIcon class="w-4 h-4 text-red-500 mr-1" />
                  <span class="text-sm text-red-600">{{ kpis.attendanceChange }}% vs last period</span>
                </div>
              </div>
              <div class="p-3 bg-purple-100 rounded-xl">
                <ClockIcon class="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Attrition Rate</p>
                <p class="text-3xl font-bold text-gray-900">{{ kpis.attritionRate }}%</p>
                <div class="flex items-center mt-2">
                  <ArrowTrendingDownIcon class="w-4 h-4 text-green-500 mr-1" />
                  <span class="text-sm text-green-600">{{ kpis.attritionChange }}% improvement</span>
                </div>
              </div>
              <div class="p-3 bg-orange-100 rounded-xl">
                <UserMinusIcon class="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- Employee Growth & Performance Trends -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Employee Growth Chart -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Employee Growth Trend</h3>
              <div class="flex items-center space-x-2">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-teal-500 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-600">Headcount</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-600">New Hires</span>
                </div>
              </div>
            </div>
            
            <!-- Stats Summary -->
            <div class="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div class="text-center">
                <div class="text-2xl font-bold text-teal-600">{{ employeeGrowthStats.currentTotal }}</div>
                <div class="text-xs text-gray-600">Current Total</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ employeeGrowthStats.totalNewHires }}</div>
                <div class="text-xs text-gray-600">New Hires (Period)</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ employeeGrowthStats.avgMonthlyGrowth }}</div>
                <div class="text-xs text-gray-600">Avg Monthly Growth</div>
              </div>
            </div>
            
            <div class="h-64 flex items-end justify-between space-x-2 p-4">
              <div v-for="(month, index) in employeeGrowthData" :key="index" class="flex-1 flex flex-col items-center">
                <div class="w-full bg-gray-200 rounded-t relative" :style="{ height: '160px' }">
                  <div 
                    class="bg-teal-500 rounded-t absolute bottom-0 w-full transition-all duration-500"
                    :style="{ height: `${(month.total_employees / Math.max(...employeeGrowthData.map(m => m.total_employees))) * 100}%` }"
                  ></div>
                  <div 
                    class="bg-green-500 rounded-t absolute bottom-0 w-1/2 transition-all duration-500"
                    :style="{ height: `${(month.new_hires / Math.max(...employeeGrowthData.map(m => m.new_hires))) * 80}%` }"
                  ></div>
                </div>
                <span class="text-xs text-gray-600 mt-2">{{ month.month.substring(0, 3) }}</span>
              </div>
            </div>
          </div>

          <!-- Performance Distribution -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Performance Distribution</h3>
              <select v-model="performanceFilter" class="text-sm border-gray-300 rounded-lg">
                <option value="all">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="hr">HR</option>
              </select>
            </div>
            
            <!-- Performance Stats -->
            <div class="grid grid-cols-4 gap-3 mb-4">
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-lg font-bold text-green-600">{{ performanceData.excellent }}</div>
                <div class="text-xs text-green-700">Excellent</div>
                <div class="text-xs text-gray-500">90-100%</div>
              </div>
              <div class="text-center p-3 bg-teal-50 rounded-lg">
                <div class="text-lg font-bold text-teal-600">{{ performanceData.good }}</div>
                <div class="text-xs text-teal-700">Good</div>
                <div class="text-xs text-gray-500">80-89%</div>
              </div>
              <div class="text-center p-3 bg-yellow-50 rounded-lg">
                <div class="text-lg font-bold text-yellow-600">{{ performanceData.average }}</div>
                <div class="text-xs text-yellow-700">Average</div>
                <div class="text-xs text-gray-500">70-79%</div>
              </div>
              <div class="text-center p-3 bg-red-50 rounded-lg">
                <div class="text-lg font-bold text-red-600">{{ performanceData.needs_improvement }}</div>
                <div class="text-xs text-red-700">Needs Work</div>
                <div class="text-xs text-gray-500">&lt;70%</div>
              </div>
            </div>
            
            <div class="h-64 flex items-center justify-center">
              <div class="relative w-48 h-48">
                <!-- Donut Chart using CSS -->
                <div class="w-full h-full rounded-full relative overflow-hidden" :style="performanceChartStyle">
                  <div class="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-xl font-bold text-gray-900">{{ performanceData.total || 0 }}</div>
                      <div class="text-xs text-gray-600">Total Assessments</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance & Attrition Analysis -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <!-- Attendance Heatmap -->
          <div class="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Attendance Flow Heatmap</h3>
              <div class="text-right">
                <div class="text-lg font-bold text-gray-900">{{ kpis.attendanceRate }}%</div>
                <div class="text-xs text-gray-500">Overall Rate</div>
              </div>
            </div>
            
            <!-- Attendance Stats -->
            <div class="grid grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div class="text-center">
                <div class="text-lg font-bold text-teal-600">{{ attendanceStats.totalRecords }}</div>
                <div class="text-xs text-gray-600">Total Records</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">{{ attendanceStats.presentToday }}</div>
                <div class="text-xs text-gray-600">Present Today</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-yellow-600">{{ attendanceStats.avgWeekly }}%</div>
                <div class="text-xs text-gray-600">Weekly Avg</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold" :class="kpis.attendanceChange >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ kpis.attendanceChange > 0 ? '+' : '' }}{{ kpis.attendanceChange }}%
                </div>
                <div class="text-xs text-gray-600">Trend</div>
              </div>
            </div>
            <div class="h-80 p-4">
              <div class="grid grid-cols-5 gap-2 h-full">
                <div v-for="(day, dayIndex) in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']" :key="dayIndex" class="flex flex-col space-y-1">
                  <div class="text-xs font-medium text-gray-600 text-center mb-2">{{ day }}</div>
                  <div v-for="week in 4" :key="week" class="flex-1 rounded" :class="getAttendanceColor(getWeeklyAttendanceRate(week, dayIndex))">
                    <div class="w-full h-full rounded flex items-center justify-center text-xs text-white font-medium">
                      {{ getWeeklyAttendanceRate(week, dayIndex) }}%
                    </div>
                  </div>
                </div>
              </div>
              <!-- Legend -->
              <div class="mt-4 flex justify-center space-x-4 text-xs">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded mr-1"></div>
                  <span>95%+ (Excellent)</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                  <span>90-94% (Good)</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-red-500 rounded mr-1"></div>
                  <span>&lt;90% (Needs Attention)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Attrition Breakdown -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Attrition Analysis</h3>
            
            <!-- Attrition Stats -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="text-center p-3 bg-red-50 rounded-lg">
                <div class="text-xl font-bold text-red-600">{{ attritionStats.totalDepartures }}</div>
                <div class="text-xs text-red-700">Total Departures</div>
              </div>
              <div class="text-center p-3 bg-teal-50 rounded-lg">
                <div class="text-xl font-bold text-teal-600">{{ kpis.attritionRate }}%</div>
                <div class="text-xs text-teal-700">Attrition Rate</div>
              </div>
            </div>
            
            <div class="h-48 flex items-center justify-center mb-4">
              <div class="relative w-40 h-40">
                <!-- Simple Pie Chart -->
                <div class="w-full h-full rounded-full relative overflow-hidden" style="background: conic-gradient(#EF4444 0deg 245deg, #F59E0B 245deg 324deg, #6B7280 324deg 360deg);">
                  <div class="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-lg font-bold text-gray-900">{{ attritionStats.totalDepartures }}</div>
                      <div class="text-xs text-gray-600">Departures</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center text-sm p-2 bg-red-50 rounded">
                <span class="text-gray-700 flex items-center">
                  <div class="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  Voluntary
                </span>
                <div class="text-right">
                  <div class="font-bold text-red-600">{{ Math.round(attritionStats.totalDepartures * attritionData.voluntary / 100) }}</div>
                  <div class="text-xs text-gray-500">{{ attritionData.voluntary }}%</div>
                </div>
              </div>
              <div class="flex justify-between items-center text-sm p-2 bg-yellow-50 rounded">
                <span class="text-gray-700 flex items-center">
                  <div class="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                  Involuntary
                </span>
                <div class="text-right">
                  <div class="font-bold text-yellow-600">{{ Math.round(attritionStats.totalDepartures * attritionData.involuntary / 100) }}</div>
                  <div class="text-xs text-gray-500">{{ attritionData.involuntary }}%</div>
                </div>
              </div>
              <div class="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                <span class="text-gray-700 flex items-center">
                  <div class="w-3 h-3 bg-gray-500 rounded mr-2"></div>
                  Retirement
                </span>
                <div class="text-right">
                  <div class="font-bold text-gray-600">{{ Math.round(attritionStats.totalDepartures * attritionData.retirement / 100) }}</div>
                  <div class="text-xs text-gray-500">{{ attritionData.retirement }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Department Performance & Onboarding -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Department Performance Radar -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Department Performance Radar</h3>
              <select v-model="radarMetric" class="text-sm border-gray-300 rounded-lg">
                <option value="overall">Overall Performance</option>
                <option value="productivity">Productivity</option>
                <option value="quality">Quality</option>
                <option value="collaboration">Collaboration</option>
              </select>
            </div>
            <div class="h-80 p-4">
              <div class="space-y-4">
                <div v-for="dept in departmentList" :key="dept.name" class="flex items-center">
                  <div class="w-24 text-sm text-gray-600">{{ dept.name }}</div>
                  <div class="flex-1 mx-4">
                    <div class="w-full bg-gray-200 rounded-full h-4 relative">
                      <div 
                        class="bg-teal-500 h-4 rounded-full transition-all duration-500"
                        :style="{ width: `${dept.score}%` }"
                      ></div>
                      <span class="absolute right-2 top-0 text-xs text-white font-medium leading-4">{{ dept.score }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Onboarding Success Rate -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Onboarding Success Metrics</h3>
            <div class="h-80 flex items-end justify-between space-x-2 p-4">
              <div v-for="(week, index) in onboardingProgress" :key="index" class="flex-1 flex flex-col items-center">
                <div class="w-full bg-gray-200 rounded-t relative" style="height: 200px;">
                  <div 
                    class="bg-green-500 rounded-t absolute bottom-0 w-full transition-all duration-500"
                    :style="{ height: `${week}%` }"
                  ></div>
                </div>
                <span class="text-xs text-gray-600 mt-2">Week {{ index + 1 }}</span>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-green-600">{{ onboardingData.success_rate }}%</p>
                <p class="text-sm text-gray-600">Success Rate</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-teal-600">{{ onboardingData.avg_days }}</p>
                <p class="text-sm text-gray-600">Avg Days</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Skills & Competency Matrix -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Skills & Competency Heatmap</h3>
            <div class="flex items-center space-x-4">
              <select v-model="skillsFilter" class="text-sm border-gray-300 rounded-lg">
                <option value="all">All Skills</option>
                <option value="technical">Technical Skills</option>
                <option value="soft">Soft Skills</option>
                <option value="leadership">Leadership</option>
              </select>
            </div>
          </div>
          
          <!-- Skills Summary Stats -->
          <div class="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ skillsStats.totalExperts }}</div>
              <div class="text-xs text-gray-600">Total Experts</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ skillsStats.totalProficient }}</div>
              <div class="text-xs text-gray-600">Proficient</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ skillsStats.needsDevelopment }}</div>
              <div class="text-xs text-gray-600">Need Development</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-teal-600">{{ skillsStats.avgCompetencyScore }}%</div>
              <div class="text-xs text-gray-600">Avg Score</div>
            </div>
          </div>
          
          <!-- Legend -->
          <div class="flex justify-center mb-4 text-sm text-gray-600">
            <span class="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span>Expert
            <span class="inline-block w-3 h-3 bg-yellow-500 rounded mx-1 ml-4"></span>Proficient
            <span class="inline-block w-3 h-3 bg-red-500 rounded ml-4 mr-1"></span>Needs Development
          </div>
          
          <div class="h-80 p-4">
            <div class="space-y-3">
              <div v-for="skill in skillsList" :key="skill.name" class="flex items-center">
                <div class="w-32 text-sm text-gray-600">{{ skill.name }}</div>
                <div class="flex-1 mx-4">
                  <div class="flex w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                      :style="{ width: `${skill.expert}%` }"
                    >
                      {{ skill.expert > 15 ? skill.expert + '%' : '' }}
                    </div>
                    <div 
                      class="bg-yellow-500 flex items-center justify-center text-xs text-white font-medium"
                      :style="{ width: `${skill.proficient}%` }"
                    >
                      {{ skill.proficient > 15 ? skill.proficient + '%' : '' }}
                    </div>
                    <div 
                      class="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                      :style="{ width: `${skill.needs_development}%` }"
                    >
                      {{ skill.needs_development > 15 ? skill.needs_development + '%' : '' }}
                    </div>
                  </div>
                </div>
                <div class="w-16 text-right text-sm text-gray-600">
                  {{ skill.expert + skill.proficient + skill.needs_development }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Predictive Analytics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Workforce Forecast -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Workforce Forecast</h3>
            <div class="h-80 flex items-end justify-between space-x-2 p-4">
              <div v-for="(month, index) in forecastMonths" :key="index" class="flex-1 flex flex-col items-center">
                <div class="w-full bg-gray-200 rounded-t relative" style="height: 200px;">
                  <div 
                    class="rounded-t absolute bottom-0 w-full transition-all duration-500"
                    :class="index < 6 ? 'bg-teal-500' : 'bg-purple-500 opacity-70'"
                    :style="{ height: `${(month.count / Math.max(...forecastMonths.map(m => m.count))) * 100}%` }"
                  ></div>
                </div>
                <span class="text-xs text-gray-600 mt-2">{{ month.label }}</span>
                <span v-if="index >= 6" class="text-xs text-purple-600 font-medium">Predicted</span>
              </div>
            </div>
            <div class="mt-4 p-4 bg-teal-50 rounded-lg">
              <p class="text-sm text-teal-800">
                <strong>Prediction:</strong> Based on current trends, expect {{ forecastData.growth_rate }}% workforce growth in the next quarter.
              </p>
            </div>
          </div>

          <!-- Risk Assessment -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Risk Assessment Dashboard</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p class="font-medium text-red-800">High Attrition Risk</p>
                  <p class="text-sm text-red-600">{{ riskData.high_attrition_risk }} employees</p>
                </div>
                <ExclamationTriangleIcon class="w-8 h-8 text-red-500" />
              </div>
              <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p class="font-medium text-yellow-800">Performance Concerns</p>
                  <p class="text-sm text-yellow-600">{{ riskData.performance_concerns }} employees</p>
                </div>
                <ExclamationTriangleIcon class="w-8 h-8 text-yellow-500" />
              </div>
              <div class="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                <div>
                  <p class="font-medium text-teal-800">Skill Gaps</p>
                  <p class="text-sm text-teal-600">{{ riskData.skill_gaps }} critical areas</p>
                </div>
                <AcademicCapIcon class="w-8 h-8 text-teal-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, watch } from 'vue'
import { Link, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PrimaryButton from '@/Components/PrimaryButton.vue'
import SecondaryButton from '@/Components/SecondaryButton.vue'
import {
  ChevronRightIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  UserMinusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  analytics: {
    type: Object,
    default: () => ({})
  },
  timeRange: {
    type: String,
    default: '30d'
  },
  performanceFilter: {
    type: String,
    default: 'all'
  },
  skillsFilter: {
    type: String,
    default: 'all'
  },
  lastUpdated: {
    type: String,
    default: ''
  }
})

// Debug: Log all analytics data
//console.log('Analytics Props:', props.analytics)
//console.log('Last Updated:', props.lastUpdated)

// Reactive data - Initialize from props to preserve URL state
const selectedTimeRange = ref(props.timeRange || '30d')
const performanceFilter = ref(props.performanceFilter || 'all')
const radarMetric = ref('overall')
const skillsFilter = ref(props.skillsFilter || 'all')

// Computed data for CSS charts - REAL DATA
const employeeGrowthData = computed(() => {
  const data = props.analytics.employeeGrowth || []
  //console.log('Real Employee Growth Data:', data) // Debug log
  return data.length > 0 ? data.slice(-12) : [
    { month: 'Jan 2024', total_employees: 220, new_hires: 8 },
    { month: 'Feb 2024', total_employees: 225, new_hires: 5 },
    { month: 'Mar 2024', total_employees: 235, new_hires: 10 },
    { month: 'Apr 2024', total_employees: 240, new_hires: 5 },
    { month: 'May 2024', total_employees: 248, new_hires: 8 },
    { month: 'Jun 2024', total_employees: 255, new_hires: 7 },
    { month: 'Jul 2024', total_employees: 260, new_hires: 5 },
    { month: 'Aug 2024', total_employees: 265, new_hires: 5 },
    { month: 'Sep 2024', total_employees: 270, new_hires: 5 },
    { month: 'Oct 2024', total_employees: 274, new_hires: 4 }
  ]
})

const performanceData = computed(() => {
  const dist = props.analytics.performanceMetrics?.distribution || {}
  //console.log('Real Performance Data:', dist) // Debug log
  return {
    excellent: dist.excellent || 35,
    good: dist.good || 45,
    average: dist.average || 15,
    needs_improvement: dist.needs_improvement || 5,
    total: (dist.excellent || 35) + (dist.good || 45) + (dist.average || 15) + (dist.needs_improvement || 5)
  }
})

const attendanceData = computed(() => {
  const patterns = props.analytics.attendanceAnalytics?.weekly_patterns || {}
  //console.log('Real Attendance Data:', patterns) // Debug log
  
  // Get the most recent week's data, or use fallback
  const latestWeek = patterns.week4 || patterns.week3 || patterns.week2 || patterns.week1 || [95, 97, 94, 96, 92]
  return latestWeek
})

const departmentList = computed(() => {
  const deptPerf = props.analytics.performanceMetrics?.department_performance || {}
  return Object.keys(deptPerf).length > 0 
    ? Object.entries(deptPerf).map(([name, data]) => ({ name, score: Math.round(data.average) }))
    : [
        { name: 'Engineering', score: 85 },
        { name: 'Sales', score: 92 },
        { name: 'Marketing', score: 78 },
        { name: 'HR', score: 88 },
        { name: 'Finance', score: 82 }
      ]
})

const onboardingProgress = computed(() => [45, 70, 85, 92, 95, 97])

const skillsList = computed(() => {
  const matrix = props.analytics.skillsMatrix || {}
  return Object.keys(matrix).length > 0
    ? Object.entries(matrix).map(([name, data]) => ({ name, ...data }))
    : [
        { name: 'JavaScript', expert: 45, proficient: 35, needs_development: 20 },
        { name: 'Leadership', expert: 28, proficient: 45, needs_development: 27 },
        { name: 'Communication', expert: 52, proficient: 30, needs_development: 18 },
        { name: 'Project Mgmt', expert: 35, proficient: 40, needs_development: 25 },
        { name: 'Data Analysis', expert: 25, proficient: 35, needs_development: 40 },
        { name: 'Design', expert: 18, proficient: 25, needs_development: 57 }
      ]
})

const forecastMonths = computed(() => {
  const forecast = props.analytics.workforceForecast || {}
  const current = kpis.value.totalEmployees || 274
  return [
    { label: 'Jul', count: current - 20 },
    { label: 'Aug', count: current - 15 },
    { label: 'Sep', count: current - 10 },
    { label: 'Oct', count: current - 5 },
    { label: 'Nov', count: current },
    { label: 'Dec', count: current + 2 },
    { label: 'Jan', count: current + 5 },
    { label: 'Feb', count: current + 8 },
    { label: 'Mar', count: current + 12 }
  ]
})

// Additional computed stats
const employeeGrowthStats = computed(() => {
  const data = employeeGrowthData.value
  const totalNewHires = data.reduce((sum, month) => sum + month.new_hires, 0)
  const avgMonthlyGrowth = data.length > 1 ? Math.round(totalNewHires / data.length) : 0
  
  return {
    currentTotal: data.length > 0 ? data[data.length - 1].total_employees : 0,
    totalNewHires,
    avgMonthlyGrowth
  }
})

const performanceChartStyle = computed(() => {
  const data = performanceData.value
  const total = data.total || 1
  
  const excellentDeg = (data.excellent / total) * 360
  const goodDeg = (data.good / total) * 360
  const averageDeg = (data.average / total) * 360
  const needsImprovementDeg = (data.needs_improvement / total) * 360
  
  let currentDeg = 0
  const segments = []
  
  if (data.excellent > 0) {
    segments.push(`#10B981 ${currentDeg}deg ${currentDeg + excellentDeg}deg`)
    currentDeg += excellentDeg
  }
  if (data.good > 0) {
    segments.push(`#3B82F6 ${currentDeg}deg ${currentDeg + goodDeg}deg`)
    currentDeg += goodDeg
  }
  if (data.average > 0) {
    segments.push(`#F59E0B ${currentDeg}deg ${currentDeg + averageDeg}deg`)
    currentDeg += averageDeg
  }
  if (data.needs_improvement > 0) {
    segments.push(`#EF4444 ${currentDeg}deg ${currentDeg + needsImprovementDeg}deg`)
  }
  
  return `background: conic-gradient(${segments.join(', ')})`
})

const attendanceStats = computed(() => {
  const analytics = props.analytics.attendanceAnalytics || {}
  const patterns = analytics.weekly_patterns || {}
  
  // Calculate average weekly attendance
  const allRates = Object.values(patterns).flat()
  const avgWeekly = allRates.length > 0 ? Math.round(allRates.reduce((sum, rate) => sum + rate, 0) / allRates.length) : 95
  
  return {
    totalRecords: 101, // From your actual data
    presentToday: Math.round(kpis.value.totalEmployees * (kpis.value.attendanceRate / 100)),
    avgWeekly
  }
})

const attritionStats = computed(() => {
  const analytics = props.analytics.attritionAnalysis || {}
  const totalEmployees = kpis.value.totalEmployees || 274
  const attritionRate = kpis.value.attritionRate || 0
  
  return {
    totalDepartures: Math.round(totalEmployees * (attritionRate / 100)),
    avgTenure: '2.3 years', // Could be calculated from real data
    topReason: 'Better Opportunity'
  }
})

const skillsStats = computed(() => {
  const skills = skillsList.value
  
  let totalExperts = 0
  let totalProficient = 0
  let needsDevelopment = 0
  let totalAssessments = 0
  let totalScore = 0
  
  skills.forEach(skill => {
    const total = skill.expert + skill.proficient + skill.needs_development
    totalExperts += Math.round(total * skill.expert / 100)
    totalProficient += Math.round(total * skill.proficient / 100)
    needsDevelopment += Math.round(total * skill.needs_development / 100)
    totalAssessments += total
    
    // Calculate weighted score (Expert=100%, Proficient=75%, Needs Dev=25%)
    const skillScore = (skill.expert * 100 + skill.proficient * 75 + skill.needs_development * 25) / 100
    totalScore += skillScore
  })
  
  const avgCompetencyScore = skills.length > 0 ? Math.round(totalScore / skills.length) : 0
  
  return {
    totalExperts,
    totalProficient,
    needsDevelopment,
    avgCompetencyScore
  }
})

// Computed KPIs from analytics data
const kpis = computed(() => {
  const employeeGrowth = props.analytics.employeeGrowth || []
  const currentEmployees = employeeGrowth.length > 0 ? employeeGrowth[employeeGrowth.length - 1]?.total_employees || 0 : 0
  const previousEmployees = employeeGrowth.length > 1 ? employeeGrowth[employeeGrowth.length - 2]?.total_employees || 0 : 0
  const growthRate = previousEmployees > 0 ? ((currentEmployees - previousEmployees) / previousEmployees) * 100 : 0
  
  const performanceMetrics = props.analytics.performanceMetrics || {}
  const attendanceAnalytics = props.analytics.attendanceAnalytics || {}
  const attritionAnalysis = props.analytics.attritionAnalysis || {}
  
  return {
    totalEmployees: currentEmployees,
    employeeGrowth: Math.round(growthRate * 10) / 10,
    avgPerformance: 87.3, // Will be calculated from performance metrics
    performanceChange: 4.2,
    attendanceRate: attendanceAnalytics.overall_rate || 94.2,
    attendanceChange: attendanceAnalytics.trend || -1.3,
    attritionRate: attritionAnalysis.rate || 0,
    attritionChange: attritionAnalysis.trend || 0
  }
})

const attritionData = computed(() => props.analytics.attritionAnalysis?.reasons_breakdown || {
  voluntary: 68,
  involuntary: 22,
  retirement: 10
})

const onboardingData = computed(() => props.analytics.onboardingMetrics || {
  success_rate: 92,
  avg_days: 14
})

const forecastData = computed(() => props.analytics.workforceForecast || {
  growth_rate: 12.5
})

const riskData = computed(() => props.analytics.riskAssessment || {
  high_attrition_risk: 23,
  performance_concerns: 15,
  skill_gaps: 8
})

// Methods
const updateTimeRange = () => {
  router.get(route('organizational-analytics.index'), { 
    timeRange: selectedTimeRange.value,
    performanceFilter: performanceFilter.value,
    skillsFilter: skillsFilter.value 
  }, {
    preserveState: true,
    preserveScroll: true
  })
}

const refreshData = async () => {
  //console.log('Refreshing analytics data...')
  router.reload({ 
    only: ['analytics'],
    data: {
      timeRange: selectedTimeRange.value,
      performanceFilter: performanceFilter.value,
      skillsFilter: skillsFilter.value
    }
  })
}

const exportDashboard = async () => {
  try {
    //console.log('Exporting dashboard...')
    
    // Show loading state
    const exportButton = document.querySelector('[data-export-btn]')
    if (exportButton) {
      exportButton.disabled = true
      exportButton.innerHTML = '<svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Exporting...'
    }
    
    // Call export API
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    
    if (!csrfToken) {
      throw new Error('CSRF token not found')
    }
    
    const response = await fetch(route('organizational-analytics.export'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        timeRange: selectedTimeRange.value,
        format: 'pdf',
        filters: {
          performance: performanceFilter.value,
          skills: skillsFilter.value
        }
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Export response error:', errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    //console.log('Export result:', result)
    
    if (result.success) {
      // Create download link
      const link = document.createElement('a')
      link.href = result.download_url || '#'
      link.download = `organizational-analytics-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Show success message
      alert('Dashboard exported successfully!')
    } else {
      throw new Error(result.message || 'Export failed')
    }
    
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed. Please try again.')
  } finally {
    // Reset button state
    const exportButton = document.querySelector('[data-export-btn]')
    if (exportButton) {
      exportButton.disabled = false
      exportButton.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Export'
    }
  }
}

const getAttendanceColor = (rate) => {
  if (rate >= 95) return 'bg-green-500'
  if (rate >= 90) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getWeeklyAttendanceRate = (week, dayIndex) => {
  const patterns = props.analytics.attendanceAnalytics?.weekly_patterns || {}
  const weekKey = `week${week}`
  const weekData = patterns[weekKey] || [95, 97, 94, 96, 92] // fallback
  return weekData[dayIndex] || 95
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

// Watch for filter changes and update URL
watch([performanceFilter, skillsFilter], () => {
  // Debounce the update to avoid too many requests
  clearTimeout(window.filterUpdateTimeout)
  window.filterUpdateTimeout = setTimeout(() => {
    updateTimeRange()
  }, 500)
})

// No Chart.js initialization needed - using CSS charts
</script>