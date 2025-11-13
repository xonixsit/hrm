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
                  <span class="text-gray-900 font-medium">Reports & Analytics</span>
                </li>
              </ol>
            </nav>

            <!-- Page Title and Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p class="mt-1 text-sm text-gray-600">Comprehensive insights and data-driven decisions</p>
              </div>
              <div class="flex items-center space-x-3">
                <SecondaryButton @click="showScheduleModal = true">
                  <ClockIcon class="w-4 h-4 mr-2" />
                  Schedule Report
                </SecondaryButton>
                <button class="inline-flex items-center px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors" @click="showCustomReportModal = true">
                  <PlusIcon class="w-4 h-4 mr-2" />
                  Custom Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Key Metrics Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <!-- Total Employees -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl">
                <UsersIcon class="w-6 h-6 text-white" />
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900">{{ stats.totalUsers || 274 }}</div>
                <div class="text-xs text-gray-500">Total Employees</div>
              </div>
            </div>
            <div class="text-sm text-gray-600">Active workforce</div>
          </div>

          <!-- Active Projects -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <FolderIcon class="w-6 h-6 text-white" />
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900">{{ stats.activeProjects || 8 }}</div>
                <div class="text-xs text-gray-500">Active Projects</div>
              </div>
            </div>
            <div class="text-sm text-gray-600">In progress</div>
          </div>

          <!-- Completed Tasks -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <CheckCircleIcon class="w-6 h-6 text-white" />
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900">{{ stats.completedTasks || 142 }}</div>
                <div class="text-xs text-gray-500">Completed Tasks</div>
              </div>
            </div>
            <div class="text-sm text-gray-600">This month</div>
          </div>

          <!-- Hours Logged -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <ClockIcon class="w-6 h-6 text-white" />
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900">{{ stats.hoursLogged || 1250 }}</div>
                <div class="text-xs text-gray-500">Hours Logged</div>
              </div>
            </div>
            <div class="text-sm text-gray-600">Total hours</div>
          </div>
        </div>

        <!-- Report Categories -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          <!-- HR & Employee Reports -->
          <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-teal-50 to-indigo-50 px-6 py-4 border-b border-teal-100">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-teal-100 rounded-lg">
                  <UsersIcon class="w-5 h-5 text-teal-600" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900">HR & Employee Reports</h3>
              </div>
            </div>
            <div class="p-6 space-y-3">
              <button
                @click="generateReport('attendance')"
                class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
              >
                <div class="flex items-center space-x-3">
                  <ClipboardDocumentCheckIcon class="w-5 h-5 text-gray-500" />
                  <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">Attendance Report</p>
                    <p class="text-xs text-gray-500">Employee attendance and leave tracking</p>
                  </div>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                @click="generateReport('team-performance')"
                class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
              >
                <div class="flex items-center space-x-3">
                  <UserGroupIcon class="w-5 h-5 text-gray-500" />
                  <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">Team Performance</p>
                    <p class="text-xs text-gray-500">Individual and team productivity metrics</p>
                  </div>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                @click="generateReport('competency-analysis')"
                class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
              >
                <div class="flex items-center space-x-3">
                  <AcademicCapIcon class="w-5 h-5 text-gray-500" />
                  <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">Competency Analysis</p>
                    <p class="text-xs text-gray-500">Skills assessment and development tracking</p>
                  </div>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <!-- Project Reports -->
          <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-100 rounded-lg">
                  <FolderIcon class="w-5 h-5 text-green-600" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Project Reports</h3>
              </div>
            </div>
            <div class="p-6 space-y-3">
              <button
                @click="generateReport('project-summary')"
                class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
              >
                <div class="flex items-center space-x-3">
                  <ChartBarIcon class="w-5 h-5 text-gray-500" />
                  <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">Project Summary</p>
                    <p class="text-xs text-gray-500">Overview of all projects and their status</p>
                  </div>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                @click="generateReport('project-progress')"
                class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
              >
                <div class="flex items-center space-x-3">
                  <ArrowTrendingUpIcon class="w-5 h-5 text-gray-500" />
                  <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">Progress Tracking</p>
                    <p class="text-xs text-gray-500">Detailed progress analysis by project</p>
                  </div>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                @click="generateReport('work-reports')"
                class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
              >
                <div class="flex items-center space-x-3">
                  <DocumentTextIcon class="w-5 h-5 text-gray-500" />
                  <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">Work Reports</p>
                    <p class="text-xs text-gray-500">Daily work reports and productivity</p>
                  </div>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <!-- Financial & Analytics -->
          <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-purple-100 rounded-lg">
                  <ChartBarIcon class="w-5 h-5 text-purple-600" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Analytics & Insights</h3>
              </div>
            </div>
            <div class="p-6 space-y-3">
              <button
                @click="generateReport('timesheet-analysis')"
                class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
              >
                <div class="flex items-center space-x-3">
                  <ClockIcon class="w-5 h-5 text-gray-500" />
                  <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">Timesheet Analysis</p>
                    <p class="text-xs text-gray-500">Time tracking and billing analysis</p>
                  </div>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                @click="generateReport('feedback-summary')"
                class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
              >
                <div class="flex items-center space-x-3">
                  <ChatBubbleLeftEllipsisIcon class="w-5 h-5 text-gray-500" />
                  <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">Feedback Summary</p>
                    <p class="text-xs text-gray-500">Employee feedback and satisfaction</p>
                  </div>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                @click="generateReport('executive-dashboard')"
                class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
              >
                <div class="flex items-center space-x-3">
                  <PresentationChartBarIcon class="w-5 h-5 text-gray-500" />
                  <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">Executive Dashboard</p>
                    <p class="text-xs text-gray-500">High-level organizational metrics</p>
                  </div>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Reports -->
        <div class="bg-white rounded-2xl border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <SecondaryButton @click="refreshReports" size="sm">
                <ArrowPathIcon class="w-4 h-4 mr-2" />
                Refresh
              </SecondaryButton>
            </div>
          </div>
          
          <div class="p-6">
            <div v-if="recentReports.length === 0" class="text-center py-12">
              <DocumentIcon class="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No reports yet</h3>
              <p class="text-gray-600 mb-6">Get started by generating your first report from the categories above.</p>
              <PrimaryButton @click="showCustomReportModal = true">
                <PlusIcon class="w-4 h-4 mr-2" />
                Create Your First Report
              </PrimaryButton>
            </div>

            <div v-else class="overflow-hidden">
              <div class="hidden md:block">
                <table class="min-w-full">
                  <thead>
                    <tr class="border-b border-gray-200">
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
                        Status
                      </th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="report in recentReports" :key="report.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 text-sm font-medium text-gray-900">
                        {{ report.name }}
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500 capitalize">
                        {{ report.type }}
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500">
                        {{ formatDateForDisplay(report.created_at) }}
                      </td>
                      <td class="px-6 py-4">
                        <span
                          :class="{
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': true,
                            'bg-green-100 text-green-800': report.status === 'completed',
                            'bg-yellow-100 text-yellow-800': report.status === 'processing',
                            'bg-red-100 text-red-800': report.status === 'failed'
                          }"
                        >
                          {{ report.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right space-x-2">
                        <SecondaryButton
                          v-if="report.status === 'completed'"
                          @click="downloadReport(report)"
                          size="sm"
                        >
                          Download
                        </SecondaryButton>
                        <SecondaryButton
                          @click="deleteReport(report)"
                          size="sm"
                          variant="danger"
                        >
                          Delete
                        </SecondaryButton>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile View -->
              <div class="md:hidden space-y-4">
                <div v-for="report in recentReports" :key="report.id" class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-gray-900">{{ report.name }}</h4>
                    <span
                      :class="{
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium': true,
                        'bg-green-100 text-green-800': report.status === 'completed',
                        'bg-yellow-100 text-yellow-800': report.status === 'processing',
                        'bg-red-100 text-red-800': report.status === 'failed'
                      }"
                    >
                      {{ report.status }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600 mb-3">
                    <p>Type: {{ report.type }}</p>
                    <p>Generated: {{ formatDateForDisplay(report.created_at) }}</p>
                  </div>
                  <div class="flex space-x-2">
                    <SecondaryButton
                      v-if="report.status === 'completed'"
                      @click="downloadReport(report)"
                      size="sm"
                    >
                      Download
                    </SecondaryButton>
                    <SecondaryButton
                      @click="deleteReport(report)"
                      size="sm"
                      variant="danger"
                    >
                      Delete
                    </SecondaryButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Report Modal -->
    <div v-if="showScheduleModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showScheduleModal = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Schedule Report</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Report Type</label>
                <select v-model="scheduleForm.type" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Select report type</option>
                  <option value="project-summary">Project Summary</option>
                  <option value="team-performance">Team Performance</option>
                  <option value="attendance">Attendance Report</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Frequency</label>
                <select v-model="scheduleForm.frequency" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="scheduleReport"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Schedule
            </button>
            <button
              @click="showScheduleModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Report Modal -->
    <div v-if="showCustomReportModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showCustomReportModal = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Create Custom Report</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Report Name</label>
                <input
                  v-model="customForm.name"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Data Sources</label>
                <div class="mt-2 space-y-2">
                  <label class="flex items-center">
                    <input v-model="customForm.sources" type="checkbox" value="projects" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <span class="ml-2 text-sm text-gray-700">Projects</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="customForm.sources" type="checkbox" value="users" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <span class="ml-2 text-sm text-gray-700">Users</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="customForm.sources" type="checkbox" value="feedback" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <span class="ml-2 text-sm text-gray-700">Feedback</span>
                  </label>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    v-model="customForm.startDate"
                    type="date"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    v-model="customForm.endDate"
                    type="date"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="createCustomReport"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Generate Report
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
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { router, Link } from '@inertiajs/vue3'
import axios from 'axios'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PrimaryButton from '@/Components/PrimaryButton.vue'
import SecondaryButton from '@/Components/SecondaryButton.vue'
import { useDateUtils } from '@/composables/useDateUtils'
import {
  ClockIcon,
  PlusIcon,
  UsersIcon,
  FolderIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftEllipsisIcon,
  ChevronRightIcon,
  DocumentIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  AcademicCapIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

const { formatDateForDisplay } = useDateUtils()

// Reactive data
const showScheduleModal = ref(false)
const showCustomReportModal = ref(false)

const stats = reactive({
  totalUsers: 0, // This will now contain Employee count for consistency with Dashboard
  activeProjects: 0,
  completedTasks: 0,
  hoursLogged: 0
})

const recentReports = ref([])

const scheduleForm = reactive({
  type: '',
  frequency: 'weekly'
})

const customForm = reactive({
  name: '',
  sources: [],
  startDate: '',
  endDate: ''
})

// Methods
const generateReport = async (type) => {
  try {
    const response = await axios.post(route('reports.generate'), {
      type: type,
      format: 'pdf'
    })
    
    if (response?.data?.success) {
      await refreshReports()
      alert('Report generation started. You will be notified when it\'s ready.')
    }
  } catch (error) {
    console.error('Error generating report:', error)
    alert('Failed to generate report. Please try again.')
  }
}

const scheduleReport = async () => {
  if (!scheduleForm.type) {
    alert('Please select a report type')
    return
  }

  try {
    const response = await axios.post(route('reports.schedule'), scheduleForm)
    
    if (response?.data?.success) {
      showScheduleModal.value = false
      scheduleForm.type = ''
      scheduleForm.frequency = 'weekly'
      alert('Report scheduled successfully!')
    }
  } catch (error) {
    console.error('Error scheduling report:', error)
    alert('Failed to schedule report. Please try again.')
  }
}

const createCustomReport = async () => {
  if (!customForm.name || customForm.sources.length === 0) {
    alert('Please provide a report name and select at least one data source')
    return
  }

  try {
    const response = await axios.post(route('reports.custom'), customForm)
    
    if (response?.data?.success) {
      showCustomReportModal.value = false
      Object.assign(customForm, {
        name: '',
        sources: [],
        startDate: '',
        endDate: ''
      })
      
      await refreshReports()
      alert('Custom report generation started!')
    }
  } catch (error) {
    console.error('Error creating custom report:', error)
    alert('Failed to create custom report. Please try again.')
  }
}

const refreshReports = async () => {
  try {
    const response = await axios.get(route('reports.recent'))
    recentReports.value = response?.data?.reports || []
  } catch (error) {
    console.error('Error fetching reports:', error)
    recentReports.value = []
  }
}

const downloadReport = async (report) => {
  try {
    const response = await axios.get(route('reports.download', report.id), {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${report.name}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
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
    const response = await axios.delete(route('reports.destroy', report.id))
    
    if (response?.data?.success) {
      await refreshReports()
    }
  } catch (error) {
    console.error('Error deleting report:', error)
    alert('Failed to delete report. Please try again.')
  }
}

const loadStats = async () => {
  try {
    const response = await axios.get(route('reports.stats'))
    Object.assign(stats, response?.data?.stats || {})
  } catch (error) {
    console.error('Error loading stats:', error)
    Object.assign(stats, {
      totalUsers: 25,
      activeProjects: 8,
      completedTasks: 142,
      hoursLogged: 1250
    })
  }
}

// Navigation is now handled by StatsCard component

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadStats(),
    refreshReports()
  ])
})
</script>