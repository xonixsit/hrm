<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Competency Reports & Analytics"
      subtitle="Comprehensive competency insights and data-driven decisions"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
        <!-- Report Filters -->
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Report Filters</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select 
                  v-model="filters.department_id" 
                  @change="applyFilters"
                  class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Departments</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select 
                  v-model="filters.employee_id" 
                  @change="applyFilters"
                  class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Employees</option>
                  <option v-for="emp in filteredEmployees" :key="emp.id" :value="emp.id">
                    {{ emp.name }} - {{ emp.department?.name }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <input 
                  v-model="filters.date_from" 
                  @change="applyFilters"
                  type="date" 
                  class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input 
                  v-model="filters.date_to" 
                  @change="applyFilters"
                  type="date" 
                  class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div class="mt-4 flex items-center space-x-4">
              <button
                @click="resetFilters"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <XMarkIcon class="w-4 h-4 mr-2" />
                Reset Filters
              </button>
              
              <div class="text-sm text-gray-500">
                Showing data for {{ getFilterDescription() }}
              </div>
            </div>
          </div>
        </div>

        <!-- Pre-built Report Categories -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Overview Reports -->
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Overview Reports</h3>
              <div class="space-y-3">
                <button
                  @click="generateReport('overview')"
                  :disabled="isGenerating"
                  class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div class="flex items-center">
                    <ChartBarIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <div class="text-left">
                      <p class="text-sm font-medium text-gray-900">Competency Overview</p>
                      <p class="text-xs text-gray-500">Comprehensive competency metrics and distribution</p>
                    </div>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </button>

                <button
                  @click="generateReport('skill_gaps')"
                  :disabled="isGenerating"
                  class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div class="flex items-center">
                    <ExclamationTriangleIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <div class="text-left">
                      <p class="text-sm font-medium text-gray-900">Skill Gap Analysis</p>
                      <p class="text-xs text-gray-500">Identify critical skill gaps and development needs</p>
                    </div>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </button>

                <button
                  @click="generateReport('trend_analysis')"
                  :disabled="isGenerating"
                  class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div class="flex items-center">
                    <ArrowTrendingUpIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <div class="text-left">
                      <p class="text-sm font-medium text-gray-900">Trend Analysis</p>
                      <p class="text-xs text-gray-500">Competency trends and progress over time</p>
                    </div>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <!-- Performance Reports -->
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Performance Reports</h3>
              <div class="space-y-3">
                <button
                  @click="generateReport('employee_performance')"
                  :disabled="isGenerating"
                  class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div class="flex items-center">
                    <UserIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <div class="text-left">
                      <p class="text-sm font-medium text-gray-900">Employee Performance</p>
                      <p class="text-xs text-gray-500">Individual competency assessments and progress</p>
                    </div>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </button>

                <button
                  @click="generateReport('department_comparison')"
                  :disabled="isGenerating"
                  class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div class="flex items-center">
                    <BuildingOfficeIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <div class="text-left">
                      <p class="text-sm font-medium text-gray-900">Department Comparison</p>
                      <p class="text-xs text-gray-500">Compare competency levels across departments</p>
                    </div>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </button>

                <button
                  @click="showDevelopmentReportModal = true"
                  :disabled="isGenerating"
                  class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div class="flex items-center">
                    <AcademicCapIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <div class="text-left">
                      <p class="text-sm font-medium text-gray-900">Development Plans</p>
                      <p class="text-xs text-gray-500">Employee development progress and recommendations</p>
                    </div>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Reports -->
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Recent Reports</h3>
              <button
                @click="refreshReports"
                :disabled="isRefreshing"
                class="text-sm text-teal-600 hover:text-teal-500 disabled:opacity-50"
              >
                <ArrowPathIcon v-if="isRefreshing" class="w-4 h-4 animate-spin inline mr-1" />
                {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>
            
            <div v-if="recentReports.length === 0" class="text-center py-8">
              <DocumentIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No reports yet</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by generating your first competency report.</p>
            </div>

            <div v-else class="overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="relative px-6 py-3">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="report in recentReports" :key="report.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ report.name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatReportType(report.type) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDateForDisplay(report.created_at) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {{ report.format?.toUpperCase() || 'JSON' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        :class="{
                          'inline-flex px-2 py-1 text-xs font-semibold rounded-full': true,
                          'bg-green-100 text-green-800': report.status === 'completed',
                          'bg-yellow-100 text-yellow-800': report.status === 'processing',
                          'bg-red-100 text-red-800': report.status === 'failed'
                        }"
                      >
                        {{ report.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        v-if="report.status === 'completed'"
                        @click="downloadReport(report)"
                        class="text-teal-600 hover:text-teal-900 mr-3"
                      >
                        <ArrowDownTrayIcon class="w-4 h-4 inline mr-1" />
                        Download
                      </button>
                      <button
                        @click="deleteReport(report)"
                        class="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon class="w-4 h-4 inline mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

    <!-- Custom Report Modal -->
    <div v-if="showCustomReportModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showCustomReportModal = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Create Custom Competency Report</h3>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                <input
                  v-model="customForm.name"
                  type="text"
                  class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter custom report name"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select 
                  v-model="customForm.type" 
                  class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select report type</option>
                  <option value="overview">Competency Overview</option>
                  <option value="skill_gaps">Skill Gap Analysis</option>
                  <option value="employee_performance">Employee Performance</option>
                  <option value="department_comparison">Department Comparison</option>
                  <option value="trend_analysis">Trend Analysis</option>
                </select>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select 
                    v-model="customForm.department_id" 
                    class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Departments</option>
                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                      {{ dept.name }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Assessment Type</label>
                  <select 
                    v-model="customForm.assessment_type" 
                    class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Types</option>
                    <option value="self">Self Assessment</option>
                    <option value="manager">Manager Assessment</option>
                    <option value="peer">Peer Assessment</option>
                    <option value="360">360 Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Competencies</label>
                <div class="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      :checked="customForm.competency_ids.length === 0"
                      @change="toggleAllCompetencies"
                      class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
                    />
                    <span class="ml-2 text-sm font-medium text-gray-700">All Competencies</span>
                  </label>
                  <div v-for="competency in competencies" :key="competency.id" class="ml-4">
                    <label class="flex items-center">
                      <input 
                        v-model="customForm.competency_ids" 
                        type="checkbox" 
                        :value="competency.id"
                        class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
                      />
                      <span class="ml-2 text-sm text-gray-700">{{ competency.name }} ({{ competency.category }})</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    v-model="customForm.date_from"
                    type="date"
                    class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    v-model="customForm.date_to"
                    type="date"
                    class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input v-model="customForm.format" type="radio" value="json" class="text-indigo-600 focus:ring-indigo-500" />
                    <span class="ml-2 text-sm text-gray-700">JSON</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="customForm.format" type="radio" value="pdf" class="text-indigo-600 focus:ring-indigo-500" />
                    <span class="ml-2 text-sm text-gray-700">PDF</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="customForm.format" type="radio" value="excel" class="text-indigo-600 focus:ring-indigo-500" />
                    <span class="ml-2 text-sm text-gray-700">Excel</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Privacy Settings</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input v-model="customForm.anonymize_data" type="checkbox" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <span class="ml-2 text-sm text-gray-700">Anonymize employee data</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="customForm.exclude_comments" type="checkbox" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <span class="ml-2 text-sm text-gray-700">Exclude assessment comments</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="createCustomReport"
              :disabled="!customForm.name || !customForm.type || isGenerating"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ isGenerating ? 'Generating...' : 'Generate Report' }}
            </button>
            <button
              @click="showCustomReportModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Data Modal -->
    <div v-if="showExportModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showExportModal = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Export Competency Data</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
                <select 
                  v-model="exportForm.type" 
                  class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="dashboard">Dashboard Analytics</option>
                  <option value="skill_gaps">Skill Gap Analysis</option>
                  <option value="trends">Competency Trends</option>
                  <option value="comparison">Department Comparison</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input v-model="exportForm.format" type="radio" value="json" class="text-indigo-600 focus:ring-indigo-500" />
                    <span class="ml-2 text-sm text-gray-700">JSON</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="exportForm.format" type="radio" value="csv" class="text-indigo-600 focus:ring-indigo-500" />
                    <span class="ml-2 text-sm text-gray-700">CSV</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="exportForm.format" type="radio" value="excel" class="text-indigo-600 focus:ring-indigo-500" />
                    <span class="ml-2 text-sm text-gray-700">Excel</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Privacy Controls</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input v-model="exportForm.anonymize" type="checkbox" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <span class="ml-2 text-sm text-gray-700">Anonymize personal data</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="exportForm.aggregate_only" type="checkbox" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <span class="ml-2 text-sm text-gray-700">Export aggregated data only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="exportData"
              :disabled="isExporting"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ isExporting ? 'Exporting...' : 'Export Data' }}
            </button>
            <button
              @click="showExportModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Development Report Modal -->
    <div v-if="showDevelopmentReportModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showDevelopmentReportModal = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Development Plans Report</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Report Scope</label>
                <select 
                  v-model="developmentForm.scope" 
                  class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Development Plans</option>
                  <option value="active">Active Plans Only</option>
                  <option value="overdue">Overdue Plans</option>
                  <option value="completed">Completed Plans</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select 
                  v-model="developmentForm.department_id" 
                  class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Departments</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="generateDevelopmentReport"
              :disabled="isGenerating"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ isGenerating ? 'Generating...' : 'Generate Report' }}
            </button>
            <button
              @click="showDevelopmentReportModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { router } from '@inertiajs/vue3'
import axios from 'axios'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import { useDateUtils } from '@/composables/useDateUtils'
import {
  PlusIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ChevronRightIcon,
  DocumentIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  reportType: {
    type: String,
    default: 'overview'
  },
  reportData: {
    type: Object,
    default: () => ({})
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  departments: {
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
})

const { formatDateForDisplay } = useDateUtils()

// Reactive data
const showCustomReportModal = ref(false)
const showExportModal = ref(false)
const showDevelopmentReportModal = ref(false)
const isGenerating = ref(false)
const isExporting = ref(false)
const isRefreshing = ref(false)

const filters = reactive({
  department_id: props.filters.department_id || '',
  employee_id: props.filters.employee_id || '',
  date_from: props.filters.date_from || '',
  date_to: props.filters.date_to || '',
  competency_ids: props.filters.competency_ids || [],
  assessment_type: props.filters.assessment_type || ''
})

const recentReports = ref([])

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessment Dashboard', href: route('assessment-dashboard') },
  { label: 'Competency Reports', href: null }
])

const headerActions = computed(() => [
  {
    label: 'Back to Dashboard',
    href: route('assessment-dashboard'),
    icon: ArrowLeftIcon,
    variant: 'secondary'
  },
  {
    label: 'Export Data',
    onClick: () => showExportModal.value = true,
    icon: ArrowDownTrayIcon,
    variant: 'secondary'
  },
  {
    label: 'Custom Report',
    onClick: () => showCustomReportModal.value = true,
    icon: PlusIcon,
    variant: 'primary'
  }
])

const customForm = reactive({
  name: '',
  type: '',
  department_id: '',
  employee_ids: [],
  competency_ids: [],
  assessment_type: '',
  date_from: '',
  date_to: '',
  format: 'json',
  anonymize_data: false,
  exclude_comments: false
})

const exportForm = reactive({
  type: 'dashboard',
  format: 'json',
  anonymize: false,
  aggregate_only: false
})

const developmentForm = reactive({
  scope: 'all',
  department_id: ''
})

// Computed properties
const filteredEmployees = computed(() => {
  if (!filters.department_id) {
    return props.employees
  }
  return props.employees.filter(emp => emp.department_id == filters.department_id)
})

// Methods
const applyFilters = () => {
  // Apply filters and refresh data if needed
  console.log('Applying filters:', filters)
}

const resetFilters = () => {
  Object.assign(filters, {
    department_id: '',
    employee_id: '',
    date_from: '',
    date_to: '',
    competency_ids: [],
    assessment_type: ''
  })
  applyFilters()
}

const getFilterDescription = () => {
  const parts = []
  
  if (filters.department_id) {
    const dept = props.departments.find(d => d.id == filters.department_id)
    parts.push(`Department: ${dept?.name}`)
  }
  
  if (filters.employee_id) {
    const emp = props.employees.find(e => e.id == filters.employee_id)
    parts.push(`Employee: ${emp?.name}`)
  }
  
  if (filters.date_from && filters.date_to) {
    parts.push(`Period: ${filters.date_from} to ${filters.date_to}`)
  } else if (filters.date_from) {
    parts.push(`From: ${filters.date_from}`)
  } else if (filters.date_to) {
    parts.push(`Until: ${filters.date_to}`)
  }
  
  return parts.length > 0 ? parts.join(', ') : 'All data'
}

const generateReport = async (type) => {
  if (isGenerating.value) return
  
  isGenerating.value = true
  
  try {
    const response = await axios.post(route('competency-analytics.generate-report'), {
      type: type,
      format: 'pdf',
      ...filters
    })
    
    if (response?.data?.success) {
      await refreshReports()
      
      if (response.data.download_url) {
        // Direct download available
        window.open(response.data.download_url, '_blank')
      } else {
        alert('Report generation started. You will be notified when it\'s ready.')
      }
    }
  } catch (error) {
    console.error('Error generating report:', error)
    alert('Failed to generate report. Please try again.')
  } finally {
    isGenerating.value = false
  }
}

const createCustomReport = async () => {
  if (isGenerating.value || !customForm.name || !customForm.type) return
  
  isGenerating.value = true
  
  try {
    const reportData = {
      ...customForm,
      employee_ids: customForm.employee_ids.join(','),
      competency_ids: customForm.competency_ids.join(',')
    }
    
    const response = await axios.post(route('competency-analytics.generate-report'), reportData)
    
    if (response?.data?.success) {
      showCustomReportModal.value = false
      
      // Reset form
      Object.assign(customForm, {
        name: '',
        type: '',
        department_id: '',
        employee_ids: [],
        competency_ids: [],
        assessment_type: '',
        date_from: '',
        date_to: '',
        format: 'json',
        anonymize_data: false,
        exclude_comments: false
      })
      
      await refreshReports()
      
      if (response.data.download_url) {
        window.open(response.data.download_url, '_blank')
      } else {
        alert('Custom report generation started!')
      }
    }
  } catch (error) {
    console.error('Error creating custom report:', error)
    alert('Failed to create custom report. Please try again.')
  } finally {
    isGenerating.value = false
  }
}

const exportData = async () => {
  if (isExporting.value) return
  
  isExporting.value = true
  
  try {
    const response = await axios.post(route('competency-analytics.export'), {
      ...exportForm,
      filters: filters
    })
    
    if (response?.data?.success) {
      showExportModal.value = false
      
      if (response.data.download_url) {
        window.open(response.data.download_url, '_blank')
      } else {
        // For JSON format, display data directly
        const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
          type: 'application/json'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `competency_export_${Date.now()}.json`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
      
      alert('Data exported successfully!')
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    alert('Failed to export data. Please try again.')
  } finally {
    isExporting.value = false
  }
}

const generateDevelopmentReport = async () => {
  if (isGenerating.value) return
  
  isGenerating.value = true
  
  try {
    const response = await axios.post(route('competency-analytics.development-plans-report'), {
      ...developmentForm,
      format: 'pdf'
    })
    
    if (response?.data?.success) {
      showDevelopmentReportModal.value = false
      
      // Reset form
      Object.assign(developmentForm, {
        scope: 'all',
        department_id: ''
      })
      
      if (response.data.download_url) {
        window.open(response.data.download_url, '_blank')
      }
      
      await refreshReports()
      alert('Development plans report generated successfully!')
    }
  } catch (error) {
    console.error('Error generating development report:', error)
    alert('Failed to generate development report. Please try again.')
  } finally {
    isGenerating.value = false
  }
}

const refreshReports = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  
  try {
    // Mock recent reports - in real implementation, this would fetch from backend
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    
    recentReports.value = [
      {
        id: 1,
        name: 'Competency Overview Report',
        type: 'overview',
        format: 'pdf',
        status: 'completed',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Skill Gap Analysis',
        type: 'skill_gaps',
        format: 'excel',
        status: 'processing',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  } catch (error) {
    console.error('Error refreshing reports:', error)
    recentReports.value = []
  } finally {
    isRefreshing.value = false
  }
}

const downloadReport = async (report) => {
  try {
    if (report.download_url) {
      window.open(report.download_url, '_blank')
    } else {
      // Mock download
      alert(`Downloading ${report.name}...`)
    }
  } catch (error) {
    console.error('Error downloading report:', error)
    alert('Failed to download report. Please try again.')
  }
}

const deleteReport = async (report) => {
  if (!confirm('Are you sure you want to delete this report?')) {
    return
  }

  try {
    // Mock delete - in real implementation, this would call backend
    recentReports.value = recentReports.value.filter(r => r.id !== report.id)
    alert('Report deleted successfully!')
  } catch (error) {
    console.error('Error deleting report:', error)
    alert('Failed to delete report. Please try again.')
  }
}

const formatReportType = (type) => {
  const types = {
    overview: 'Overview',
    skill_gaps: 'Skill Gaps',
    employee_performance: 'Employee Performance',
    department_comparison: 'Department Comparison',
    trend_analysis: 'Trend Analysis'
  }
  return types[type] || type
}

const toggleAllCompetencies = (event) => {
  if (event.target.checked) {
    customForm.competency_ids = []
  } else {
    customForm.competency_ids = props.competencies.map(c => c.id)
  }
}

// Lifecycle
onMounted(async () => {
  await refreshReports()
})
</script>