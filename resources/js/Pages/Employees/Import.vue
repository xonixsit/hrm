<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Import Employees"
      subtitle="Bulk import employees from Excel or CSV files"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Import Progress Card -->
        <div v-if="importStatus.active" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Import Progress</h3>
              <div class="flex items-center space-x-2">
                <button
                  v-if="importStatus.canPause && !importStatus.paused"
                  @click="pauseImport"
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PauseIcon class="w-4 h-4 mr-1" />
                  Pause
                </button>
                <button
                  v-if="importStatus.paused"
                  @click="resumeImport"
                  class="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                >
                  <PlayIcon class="w-4 h-4 mr-1" />
                  Resume
                </button>
                <button
                  @click="cancelImport"
                  class="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                >
                  <XMarkIcon class="w-4 h-4 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <!-- Progress Bar -->
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing {{ importStatus.fileName }}</span>
                <span>{{ importStatus.processed }} / {{ importStatus.total }} records</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: importStatus.progress + '%' }"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>{{ importStatus.progress }}% complete</span>
                <span v-if="importStatus.paused" class="text-yellow-600">Paused</span>
                <span v-else-if="importStatus.estimatedTime">{{ importStatus.estimatedTime }} remaining</span>
              </div>
            </div>

            <!-- Status Messages -->
            <div class="space-y-2">
              <div v-if="importStatus.currentRecord" class="text-sm text-gray-600">
                Currently processing: {{ importStatus.currentRecord }}
              </div>
              <div v-if="importStatus.successCount > 0" class="text-sm text-green-600">
                ✓ {{ importStatus.successCount }} employees imported successfully
              </div>
              <div v-if="importStatus.errorCount > 0" class="text-sm text-red-600">
                ✗ {{ importStatus.errorCount }} errors encountered
              </div>
            </div>
          </div>
        </div>

        <!-- File Upload Card -->
        <div v-if="!importStatus.active" class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Upload File</h3>
            <p class="mt-1 text-sm text-gray-500">
              Select an Excel (.xlsx, .xls) or CSV file containing employee data
            </p>
          </div>
          
          <div class="p-6">
            <!-- File Drop Zone -->
            <div
              @drop="handleDrop"
              @dragover.prevent
              @dragenter.prevent
              :class="[
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              ]"
            >
              <DocumentArrowUpIcon class="mx-auto h-12 w-12 text-gray-400" />
              <div class="mt-4">
                <p class="text-lg font-medium text-gray-900">
                  Drop your file here, or 
                  <button
                    @click="$refs.fileInput.click()"
                    class="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    browse
                  </button>
                </p>
                <p class="mt-2 text-sm text-gray-500">
                  Supports Excel (.xlsx, .xls) and CSV files up to 10MB
                </p>
              </div>
              
              <input
                ref="fileInput"
                type="file"
                accept=".xlsx,.xls,.csv"
                @change="handleFileSelect"
                class="hidden"
              />
            </div>

            <!-- Selected File Info -->
            <div v-if="selectedFile" class="mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <DocumentTextIcon class="h-8 w-8 text-gray-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                </div>
                <button
                  @click="removeFile"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Import Options -->
        <div v-if="selectedFile && !importStatus.active" class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Import Options</h3>
          </div>
          
          <div class="p-6 space-y-6">
            <!-- Column Mapping -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Column Mapping
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="field in requiredFields" :key="field.key" class="space-y-2">
                  <label class="block text-xs font-medium text-gray-600">
                    {{ field.label }} {{ field.required ? '*' : '' }}
                  </label>
                  <select
                    v-model="columnMapping[field.key]"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Select column...</option>
                    <option v-for="column in detectedColumns" :key="column" :value="column">
                      {{ column }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Import Settings -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Batch Size
                </label>
                <select
                  v-model="importOptions.batchSize"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="10">10 records per batch</option>
                  <option value="25">25 records per batch</option>
                  <option value="50">50 records per batch</option>
                  <option value="100">100 records per batch</option>
                </select>
                <p class="mt-1 text-xs text-gray-500">
                  Smaller batches are more reliable but slower
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Error Handling
                </label>
                <select
                  v-model="importOptions.errorHandling"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="continue">Continue on errors</option>
                  <option value="stop">Stop on first error</option>
                </select>
              </div>
            </div>

            <!-- Additional Options -->
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="importOptions.skipFirstRow"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Skip first row (headers)</span>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="importOptions.updateExisting"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Update existing employees (match by email)</span>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="importOptions.sendWelcomeEmails"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Send welcome emails to new employees</span>
              </label>
            </div>

            <!-- Start Import Button -->
            <div class="flex justify-end pt-4">
              <button
                @click="startImport"
                :disabled="!canStartImport"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUpTrayIcon class="w-5 h-5 mr-2" />
                Start Import
              </button>
            </div>
          </div>
        </div>

        <!-- Template Download -->
        <div v-if="!importStatus.active" class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Need a Template?</h3>
          </div>
          
          <div class="p-6">
            <p class="text-sm text-gray-600 mb-4">
              Download our template file to ensure your data is formatted correctly for import.
            </p>
            <div class="flex space-x-3">
              <button
                @click="downloadTemplate('excel')"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
                Download Excel Template
              </button>
              <button
                @click="downloadTemplate('csv')"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
                Download CSV Template
              </button>
            </div>
          </div>
        </div>

        <!-- Import Results -->
        <div v-if="importResults" class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Import Results</h3>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ importResults.successful }}</div>
                <div class="text-sm text-gray-600">Successful</div>
              </div>
              <div class="text-center p-4 bg-red-50 rounded-lg">
                <div class="text-2xl font-bold text-red-600">{{ importResults.failed }}</div>
                <div class="text-sm text-gray-600">Failed</div>
              </div>
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ importResults.total }}</div>
                <div class="text-sm text-gray-600">Total Processed</div>
              </div>
            </div>

            <!-- Error Details -->
            <div v-if="importResults.errors && importResults.errors.length > 0" class="mt-6">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Import Errors</h4>
              <div class="bg-red-50 border border-red-200 rounded-md p-4 max-h-60 overflow-y-auto">
                <div v-for="error in importResults.errors" :key="error.row" class="text-sm text-red-700 mb-2">
                  <strong>Row {{ error.row }}:</strong> {{ error.message }}
                </div>
              </div>
            </div>

            <div class="flex justify-end mt-6 space-x-3">
              <button
                v-if="importResults.failed > 0"
                @click="downloadErrorReport"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
                Download Error Report
              </button>
              <button
                @click="resetImport"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Import Another File
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { router } from '@inertiajs/vue3'
import axios from 'axios'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import {
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  PauseIcon,
  PlayIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  departments: {
    type: Array,
    default: () => []
  }
})

// Reactive state
const selectedFile = ref(null)
const dragOver = ref(false)
const detectedColumns = ref([])
const columnMapping = ref({})
const importOptions = ref({
  batchSize: 25,
  errorHandling: 'continue',
  skipFirstRow: true,
  updateExisting: false,
  sendWelcomeEmails: true
})
const importStatus = ref({
  active: false,
  paused: false,
  canPause: true,
  fileName: '',
  progress: 0,
  processed: 0,
  total: 0,
  successCount: 0,
  errorCount: 0,
  currentRecord: '',
  estimatedTime: ''
})
const importResults = ref(null)

// Required fields configuration
const requiredFields = [
  { key: 'name', label: 'Full Name', required: true },
  { key: 'email', label: 'Email Address', required: true },
  { key: 'job_title', label: 'Job Title', required: false },
  { key: 'department', label: 'Department', required: false },
  { key: 'phone', label: 'Phone Number', required: false },
  { key: 'join_date', label: 'Join Date', required: false },
  { key: 'salary', label: 'Salary', required: false },
  { key: 'contract_type', label: 'Contract Type', required: false }
]

// Breadcrumbs
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Employees', href: route('employees.index') },
  { label: 'Import', current: true }
]

// Header actions
const headerActions = [
  {
    id: 'back',
    label: 'Back to Employees',
    variant: 'secondary',
    handler: () => router.visit(route('employees.index'))
  }
]

// Computed properties
const canStartImport = computed(() => {
  if (!selectedFile.value) return false
  
  // Check if required fields are mapped
  const requiredMapped = requiredFields
    .filter(field => field.required)
    .every(field => columnMapping.value[field.key])
  
  return requiredMapped
})

// Methods
const handleDrop = (e) => {
  e.preventDefault()
  dragOver.value = false
  
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFileSelect({ target: { files } })
  }
}

const handleFileSelect = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  // Validate file type
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]
  
  if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
    alert('Please select a valid Excel or CSV file.')
    return
  }
  
  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB.')
    return
  }
  
  selectedFile.value = file
  
  // Detect columns from file
  await detectColumns(file)
}

const detectColumns = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axios.post(route('employees.import.preview'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    detectedColumns.value = response.data.columns
    autoMapColumns()
  } catch (error) {
    console.error('Failed to detect columns:', error)
    // Fallback to common column names
    detectedColumns.value = [
      'Name', 'Full Name', 'Employee Name',
      'Email', 'Email Address', 'Work Email',
      'Job Title', 'Position', 'Role',
      'Department', 'Dept', 'Division',
      'Phone', 'Phone Number', 'Mobile',
      'Join Date', 'Start Date', 'Hire Date',
      'Salary', 'Basic Salary', 'Annual Salary',
      'Contract Type', 'Employment Type', 'Status'
    ]
    autoMapColumns()
  }
}

const autoMapColumns = () => {
  const mappings = {
    name: ['name', 'full name', 'employee name', 'full_name', 'employee_name'],
    email: ['email', 'email address', 'work email', 'email_address', 'work_email'],
    job_title: ['job title', 'position', 'role', 'job_title'],
    department: ['department', 'dept', 'division'],
    phone: ['phone', 'phone number', 'mobile', 'phone_number'],
    join_date: ['join date', 'start date', 'hire date', 'join_date', 'start_date', 'hire_date'],
    salary: ['salary', 'basic salary', 'annual salary', 'basic_salary', 'annual_salary'],
    contract_type: ['contract type', 'employment type', 'status', 'contract_type', 'employment_type']
  }
  
  Object.keys(mappings).forEach(field => {
    const matchingColumn = detectedColumns.value.find(col => 
      mappings[field].includes(col.toLowerCase())
    )
    if (matchingColumn) {
      columnMapping.value[field] = matchingColumn
    }
  })
}

const removeFile = () => {
  selectedFile.value = null
  detectedColumns.value = []
  columnMapping.value = {}
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const startImport = async () => {
  if (!canStartImport.value) return
  
  // Prepare form data
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('column_mapping', JSON.stringify(columnMapping.value))
  formData.append('options', JSON.stringify(importOptions.value))
  
  // Start import process
  importStatus.value = {
    active: true,
    paused: false,
    canPause: true,
    fileName: selectedFile.value.name,
    progress: 0,
    processed: 0,
    total: 0,
    successCount: 0,
    errorCount: 0,
    currentRecord: '',
    estimatedTime: 'Calculating...'
  }
  
  try {
    const response = await axios.post(route('employees.import.store'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        importStatus.value.progress = progress
      }
    })
    
    if (response.data.success) {
      importResults.value = response.data.results
      importStatus.value.active = false
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error('Import failed:', error)
    alert('Import failed: ' + (error.response?.data?.message || error.message))
    resetImport()
  }
}



const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

const pauseImport = () => {
  importStatus.value.paused = true
}

const resumeImport = () => {
  importStatus.value.paused = false
}

const cancelImport = () => {
  if (confirm('Are you sure you want to cancel the import? This action cannot be undone.')) {
    resetImport()
  }
}



const resetImport = () => {
  selectedFile.value = null
  detectedColumns.value = []
  columnMapping.value = {}
  importStatus.value = {
    active: false,
    paused: false,
    canPause: true,
    fileName: '',
    progress: 0,
    processed: 0,
    total: 0,
    successCount: 0,
    errorCount: 0,
    currentRecord: '',
    estimatedTime: ''
  }
  importResults.value = null
}

const downloadTemplate = (format) => {
  window.open(route('employees.template', { format }), '_blank')
}

const downloadErrorReport = () => {
  // In a real implementation, this would generate and download an error report
  console.log('Downloading error report...')
}

// Event listeners
onMounted(() => {
  // Add drag and drop event listeners to prevent default browser behavior
  document.addEventListener('dragover', (e) => e.preventDefault())
  document.addEventListener('drop', (e) => e.preventDefault())
})
</script>