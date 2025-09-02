<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex justify-between items-center">
        <div>
          <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            Reports & Analytics
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Comprehensive insights and data-driven decisions
          </p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="showScheduleModal = true"
            class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
          >
            <ClockIcon class="w-4 h-4 mr-2" />
            Schedule Report
          </button>
          <button
            @click="showCustomReportModal = true"
            class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Custom Report
          </button>
        </div>
      </div>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
        <!-- Quick Insights Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Employees Card -->
          <StatsCard
            :value="stats.totalUsers"
            label="Total Employees"
            icon="users"
            variant="primary"
            :clickable="true"
            route="employees.index"
          />

          <!-- Active Projects Card -->
          <StatsCard
            :value="stats.activeProjects"
            label="Active Projects"
            icon="folder"
            variant="success"
            :clickable="true"
            route="projects.index"
          />

          <!-- Completed Tasks Card -->
          <StatsCard
            :value="stats.completedTasks"
            label="Completed Tasks"
            icon="check-circle"
            variant="info"
            :clickable="true"
            route="work-reports.index"
          />

          <!-- Hours Logged Card -->
          <StatsCard
            :value="stats.hoursLogged"
            label="Hours Logged"
            icon="clock"
            variant="warning"
            :clickable="true"
            route="attendances.index"
          />
        </div>

        <!-- Report Categories -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Project Reports -->
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Project Reports</h3>
              <div class="space-y-3">
                <button
                  @click="generateReport('project-summary')"
                  class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center">
                    <ChartBarIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <div class="text-left">
                      <p class="text-sm font-medium text-gray-900">Project Summary</p>
                      <p class="text-xs text-gray-500">Overview of all projects and their status</p>
                    </div>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </button>

                <button
                  @click="generateReport('project-progress')"
                  class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center">
                    <ArrowTrendingUpIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <div class="text-left">
                      <p class="text-sm font-medium text-gray-900">Progress Tracking</p>
                      <p class="text-xs text-gray-500">Detailed progress analysis by project</p>
                    </div>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <!-- Team Reports -->
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Team Reports</h3>
              <div class="space-y-3">
                <button
                  @click="generateReport('team-performance')"
                  class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center">
                    <UserGroupIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <div class="text-left">
                      <p class="text-sm font-medium text-gray-900">Team Performance</p>
                      <p class="text-xs text-gray-500">Individual and team productivity metrics</p>
                    </div>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </button>

                <button
                  @click="generateReport('attendance')"
                  class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center">
                    <ClipboardDocumentCheckIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <div class="text-left">
                      <p class="text-sm font-medium text-gray-900">Attendance Report</p>
                      <p class="text-xs text-gray-500">Leave requests and attendance tracking</p>
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
                class="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Refresh
              </button>
            </div>
            
            <div v-if="recentReports.length === 0" class="text-center py-8">
              <DocumentIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No reports yet</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by generating your first report.</p>
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
                      {{ report.type }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDateForDisplay(report.created_at) }}
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
                        class="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Download
                      </button>
                      <button
                        @click="deleteReport(report)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
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
import { router } from '@inertiajs/vue3'
import axios from 'axios'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import StatsCard from '@/Components/Dashboard/StatsCard.vue'
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
  DocumentIcon
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