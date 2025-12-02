<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Pending Timesheet Approvals"
      subtitle="Review and approve employee timesheet submissions"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 text-gray-900">
          <!-- Header Actions -->
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Pending Timesheet Approvals</h3>
              <p class="mt-1 text-sm text-gray-600">
                Review and approve employee timesheet submissions with work report context.
              </p>
            </div>
            <div class="flex items-center space-x-3">
              <!-- Search Field -->
              <div class="relative flex-1 max-w-md">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="localFilters.search"
                  type="text"
                  placeholder="Search employees, projects..."
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  @input="debouncedApplyFilters"
                />
              </div>
              
              <!-- Show More Filters Button -->
              <button
                @click="showFilters = !showFilters"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 whitespace-nowrap"
              >
                <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                <span class="hidden sm:inline">{{ showFilters ? 'Hide Filters' : 'Show Filters' }}</span>
                <span class="sm:hidden">Filters</span>
              </button>
            </div>
          </div>

          <!-- Filter Controls -->
          <div v-if="showFilters" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <!-- Employee Filter -->
              <div v-if="availableEmployees.length > 0">
                <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  v-model="localFilters.employee"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  @change="applyFilters"
                >
                  <option value="">All employees</option>
                  <option v-for="employee in availableEmployees" :key="employee.id" :value="employee.id">
                    {{ employee.name }}
                  </option>
                </select>
              </div>

              <!-- Project Filter -->
              <div v-if="availableProjects.length > 0">
                <label class="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  v-model="localFilters.project"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  @change="applyFilters"
                >
                  <option value="">All projects</option>
                  <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </div>
              
              <!-- Date From Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  v-model="localFilters.date_from"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  @change="applyFilters"
                />
              </div>
              
              <!-- Date To Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  v-model="localFilters.date_to"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
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
                  @click="clearSearchFilter"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none"
                >
                  <span class="sr-only">Remove search filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <span
                v-if="activeEmployeeFilter"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
              >
                Employee: {{ activeEmployeeFilter }}
                <button
                  @click="clearEmployeeFilter"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-teal-400 hover:bg-teal-200 hover:text-teal-500 focus:outline-none"
                >
                  <span class="sr-only">Remove employee filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <span
                v-if="activeProjectFilter"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                Project: {{ activeProjectFilter }}
                <button
                  @click="clearProjectFilter"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
                >
                  <span class="sr-only">Remove project filter</span>
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
                  @click="clearDateFromFilter"
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
                  @click="clearDateToFilter"
                  class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                >
                  <span class="sr-only">Remove date to filter</span>
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                  </svg>
                </button>
              </span>

              <button
                @click="clearAllFilters"
                class="text-sm text-teal-600 hover:text-teal-800"
              >
                Clear all
              </button>
            </div>
          </div>

          <!-- Header with Stats -->
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <span class="flex items-center">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                {{ timesheets.total }} pending
              </span>
              <button
                v-if="selectedTimesheets.length > 0"
                @click="showBulkApprovalModal = true"
                class="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                Bulk Approve ({{ selectedTimesheets.length }})
              </button>
            </div>
          </div>

          <!-- Timesheets Table -->
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        :checked="allSelected"
                        @change="toggleSelectAll"
                        class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Report</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="timesheet in timesheets.data" :key="timesheet.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                      <input
                        type="checkbox"
                        :value="timesheet.id"
                        v-model="selectedTimesheets"
                        class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                          <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span class="text-sm font-medium text-indigo-700">
                              {{ getInitials(timesheet.employee?.user?.name) }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900">
                            {{ timesheet.employee?.user?.name || 'Unknown' }}
                          </div>
                          <div class="text-sm text-gray-500">
                            {{ timesheet.employee?.employee_code || 'N/A' }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(timesheet.date) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ timesheet.project?.name || 'N/A' }}</div>
                      <div class="text-sm text-gray-500">{{ timesheet.task?.name || 'No task' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center space-x-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {{ timesheet.hours }}h
                        </span>
                        <div v-if="timesheet.has_discrepancy" class="flex items-center">
                          <svg 
                            :class="[
                              'w-4 h-4',
                              timesheet.has_discrepancy.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                            ]" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div v-if="timesheet.work_report" class="text-xs">
                        <div class="text-gray-900">{{ timesheet.work_report.interested_count || 0 }} interested</div>
                        <div class="text-gray-500">{{ timesheet.work_report.emails }} emails</div>
                      </div>
                      <div v-else class="text-xs text-gray-400">No report</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {{ timesheet.description || 'No description' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatTimeAgo(timesheet.created_at) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-2">
                        <button
                          @click="approveTimesheet(timesheet)"
                          class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Approve
                        </button>
                        <button
                          @click="rejectTimesheet(timesheet)"
                          class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-if="!timesheets.data.length" class="py-12 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
              <p class="mt-1 text-sm text-gray-500">
                All timesheets have been reviewed.
              </p>
            </div>
          </div>

          <!-- Approval Modal -->
          <div v-if="showApprovalModal" class="fixed inset-0 bg-black bg-opacity-50 z-50" @click="closeModalOnBackdrop">
            <div class="flex items-center justify-center min-h-screen px-4 py-6">
              <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" @click.stop>
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ approvalAction === 'approve' ? 'Approve' : 'Reject' }} Timesheet
              </h3>
              
              <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="text-sm">
                    <div class="font-medium text-gray-900">{{ selectedTimesheet?.employee?.user?.name }}</div>
                    <div class="text-gray-600">{{ formatDate(selectedTimesheet?.date) }} - {{ selectedTimesheet?.hours }}h</div>
                    <div class="text-gray-600">{{ selectedTimesheet?.project?.name }}</div>
                  </div>
                </div>

                <!-- Work Report Context -->
                <div v-if="selectedTimesheet?.work_report" class="bg-teal-50 p-4 rounded-lg">
                  <h4 class="text-sm font-medium text-teal-900 mb-2">Work Report Context</h4>
                  <div class="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span class="text-teal-700">Interested:</span> {{ selectedTimesheet.work_report.interested_count || 0 }}/{{ selectedTimesheet.work_report.calls }}
                    </div>
                    <div>
                      <span class="text-teal-700">Emails:</span> {{ selectedTimesheet.work_report.emails }}
                    </div>
                    <div>
                      <span class="text-teal-700">WhatsApp:</span> {{ selectedTimesheet.work_report.whatsapp }}
                    </div>
                  </div>
                </div>

                <!-- Discrepancy Warning -->
                <div v-if="selectedTimesheet?.has_discrepancy" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <div>
                      <h4 class="text-sm font-medium text-yellow-800">Time Discrepancy Detected</h4>
                      <p class="text-sm text-yellow-700 mt-1">{{ selectedTimesheet.has_discrepancy.message }}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Comments {{ approvalAction === 'reject' ? '(Required)' : '(Optional)' }}
                  </label>
                  <textarea
                    v-model="approvalComments"
                    rows="3"
                    :required="approvalAction === 'reject'"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :placeholder="approvalAction === 'approve' ? 'Add approval comments...' : 'Please provide reason for rejection...'"
                  ></textarea>
                </div>
              </div>
              
              <div class="flex justify-end space-x-3 mt-6">
                <button
                  @click="showApprovalModal = false"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  @click="performApproval"
                  :disabled="approvalAction === 'reject' && !approvalComments.trim()"
                  :class="[
                    'px-4 py-2 text-sm font-medium text-white rounded-lg',
                    approvalAction === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700',
                    (approvalAction === 'reject' && !approvalComments.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                  ]"
                >
                  {{ approvalAction === 'approve' ? 'Approve' : 'Reject' }}
                </button>
              </div>
              </div>
            </div>
          </div>

          <!-- Bulk Approval Modal -->
          <div v-if="showBulkApprovalModal" class="fixed inset-0 bg-black bg-opacity-50 z-50" @click="closeBulkModalOnBackdrop">
            <div class="flex items-center justify-center min-h-screen px-4 py-6">
              <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl" @click.stop>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Bulk Approve Timesheets</h3>
              
              <div class="space-y-4">
                <p class="text-sm text-gray-600">
                  You are about to approve {{ selectedTimesheets.length }} timesheet(s).
                </p>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Comments (Optional)</label>
                  <textarea
                    v-model="bulkApprovalComments"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add comments for all selected timesheets..."
                  ></textarea>
                </div>
              </div>
              
              <div class="flex justify-end space-x-3 mt-6">
                <button
                  @click="showBulkApprovalModal = false"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  @click="performBulkApproval"
                  class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Approve All
                </button>
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
import { ref, computed } from 'vue'
import { router } from '@inertiajs/vue3'
import { debounce } from 'lodash'
import { useNotifications } from '@/composables/useNotifications'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'

const props = defineProps({
  timesheets: {
    type: Object,
    required: true
  },
  availableEmployees: {
    type: Array,
    default: () => []
  },
  availableProjects: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  }
})

// Initialize notifications
const { showSuccess, showError, showLoading, removeNotification } = useNotifications()

// Local state
const showFilters = ref(false)
const selectedTimesheets = ref([])
const showBulkApprovalModal = ref(false)
const showApprovalModal = ref(false)
const selectedTimesheet = ref(null)
const approvalAction = ref('approve')
const approvalComments = ref('')
const bulkApprovalComments = ref('')

// Filter state
const localFilters = ref({
  search: props.filters.search || '',
  employee: props.filters.employee || '',
  project: props.filters.project || '',
  date_from: props.filters.date_from || '',
  date_to: props.filters.date_to || ''
})

// Computed properties
const allSelected = computed(() => {
  return props.timesheets.data.length > 0 && 
         selectedTimesheets.value.length === props.timesheets.data.length
})

// Active filters computed properties
const hasActiveFilters = computed(() => {
  return (localFilters.value.search && localFilters.value.search.trim()) ||
         localFilters.value.employee || 
         localFilters.value.project || 
         localFilters.value.date_from || 
         localFilters.value.date_to
})

const activeEmployeeFilter = computed(() => {
  if (!localFilters.value.employee) return null;
  
  const employee = props.availableEmployees.find(emp => 
    emp.id.toString() === localFilters.value.employee.toString()
  );
  
  return employee ? employee.name : null;
})

const activeProjectFilter = computed(() => {
  if (!localFilters.value.project) return null;
  
  const project = props.availableProjects.find(proj => 
    proj.id.toString() === localFilters.value.project.toString()
  );
  
  return project ? project.name : null;
})

// Breadcrumbs
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Timesheets', href: route('timesheets.index') },
  { label: 'Pending Approvals', current: true }
]

// Header actions
const headerActions = [
  {
    id: 'view-all-timesheets',
    label: 'View All Timesheets',
    variant: 'secondary',
    handler: () => router.visit(route('timesheets.index'))
  }
]

// Methods
const getInitials = (name) => {
  if (!name) return 'N/A'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedTimesheets.value = []
  } else {
    selectedTimesheets.value = props.timesheets.data.map(t => t.id)
  }
}

const approveTimesheet = (timesheet) => {
  selectedTimesheet.value = timesheet
  approvalAction.value = 'approve'
  approvalComments.value = ''
  showApprovalModal.value = true
}

const rejectTimesheet = (timesheet) => {
  selectedTimesheet.value = timesheet
  approvalAction.value = 'reject'
  approvalComments.value = ''
  showApprovalModal.value = true
}

const performApproval = async () => {
  if (!selectedTimesheet.value) {
    showError('No timesheet selected for approval.')
    return
  }

  const endpoint = approvalAction.value === 'approve' 
    ? route('timesheets.approve', selectedTimesheet.value.id)
    : route('timesheets.reject', selectedTimesheet.value.id)
  
  const action = approvalAction.value === 'approve' ? 'approving' : 'rejecting'
  const loadingId = showLoading(`${action.charAt(0).toUpperCase() + action.slice(1)} timesheet...`)
  
  try {
    console.log('Making approval request to:', endpoint)
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        comments: approvalComments.value.trim()
      })
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    
    // Remove loading notification first
    removeNotification(loadingId)
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    console.log('Content-Type:', contentType)
    
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text()
      console.error('Non-JSON response:', responseText)
      throw new Error('Server returned an invalid response format. Please try again.')
    }
    
    const data = await response.json()
    console.log('Response data:', data)
    
    if (response.ok && data.success) {
      // Close modal first
      showApprovalModal.value = false
      selectedTimesheet.value = null
      approvalComments.value = ''
      
      // Show success message
      const actionPast = approvalAction.value === 'approve' ? 'approved' : 'rejected'
      console.log('Showing success message:', `Timesheet ${actionPast} successfully!`)
      showSuccess(`Timesheet ${actionPast} successfully!`)
      
      // Refresh the page to get updated data
      router.reload({ only: ['timesheets'] })
      
    } else {
      throw new Error(data.message || `Failed to ${approvalAction.value} timesheet`)
    }
  } catch (error) {
    removeNotification(loadingId)
    console.error('Approval failed:', error)
    
    // Close modal on error too
    showApprovalModal.value = false
    selectedTimesheet.value = null
    approvalComments.value = ''
    
    showError(error.message || 'Failed to process approval. Please try again.')
  }
}

const applyFilters = () => {
  router.get(route('timesheets.pending-approvals'), localFilters.value, {
    preserveState: true,
    replace: true
  })
}

const debouncedApplyFilters = debounce(applyFilters, 300)

// Clear filter methods
const clearSearchFilter = () => {
  localFilters.value.search = ''
  applyFilters()
}

const clearEmployeeFilter = () => {
  localFilters.value.employee = ''
  applyFilters()
}

const clearProjectFilter = () => {
  localFilters.value.project = ''
  applyFilters()
}

const clearDateFromFilter = () => {
  localFilters.value.date_from = ''
  applyFilters()
}

const clearDateToFilter = () => {
  localFilters.value.date_to = ''
  applyFilters()
}

const clearAllFilters = () => {
  localFilters.value = {
    search: '',
    employee: '',
    project: '',
    date_from: '',
    date_to: ''
  }
  applyFilters()
}

// Bulk approval functionality
const performBulkApproval = async () => {
  if (selectedTimesheets.value.length === 0) {
    showError('No timesheets selected for approval.')
    return
  }
  
  const loadingId = showLoading(`Approving ${selectedTimesheets.value.length} timesheet(s)...`)
  
  try {
    const response = await fetch(route('timesheets.bulk-approve'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        timesheet_ids: selectedTimesheets.value,
        comments: bulkApprovalComments.value.trim()
      })
    })
    
    // Remove loading notification first
    removeNotification(loadingId)
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format. Please try again.')
    }
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      // Close modal first
      showBulkApprovalModal.value = false
      selectedTimesheets.value = []
      bulkApprovalComments.value = ''
      
      // Show success message
      showSuccess(`Successfully approved ${data.approved_count} timesheet(s)!`)
      
      // Refresh the page to get updated data
      router.reload({ only: ['timesheets'] })
      
    } else {
      throw new Error(data.message || 'Bulk approval failed')
    }
  } catch (error) {
    removeNotification(loadingId)
    console.error('Bulk approval failed:', error)
    
    // Close modal on error too
    showBulkApprovalModal.value = false
    selectedTimesheets.value = []
    bulkApprovalComments.value = ''
    
    showError(error.message || 'Failed to process bulk approval. Please try again.')
  }
}
</script>
//
 Modal backdrop click handlers
const closeModalOnBackdrop = (event) => {
  if (event.target === event.currentTarget) {
    showApprovalModal.value = false
    selectedTimesheet.value = null
    approvalComments.value = ''
  }
}

const closeBulkModalOnBackdrop = (event) => {
  if (event.target === event.currentTarget) {
    showBulkApprovalModal.value = false
    bulkApprovalComments.value = ''
  }
}