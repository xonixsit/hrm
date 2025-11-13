<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Competency Evaluation"
      subtitle="Assess employee competency and provide detailed feedback"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 text-gray-900">
          <!-- Success Message -->
          <div v-if="$page.props.flash?.success" class="mb-6">
            <div class="bg-green-50 border border-green-200 rounded-md p-4">
              <div class="flex">
                <CheckIcon class="h-5 w-5 text-green-400" />
                <div class="ml-3">
                  <p class="text-sm font-medium text-green-800">
                    {{ $page.props.flash.success }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Evaluation Form -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Employee & Competency Overview -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 class="text-xl font-semibold text-white">Assessment Overview</h2>
              </div>
              <div class="p-6">
                <div class="flex items-center space-x-6">
                  <div class="flex-shrink-0">
                    <div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-xl font-bold text-blue-600">
                        {{ getInitials(assessment.employee?.user?.name) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">{{ assessment.employee?.user?.name }}</h3>
                    <p class="text-gray-600">{{ assessment.employee?.position || 'Employee' }}</p>
                    <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span class="flex items-center">
                        <BuildingOfficeIcon class="w-4 h-4 mr-1" />
                        {{ assessment.employee?.department?.name || 'No Department' }}
                      </span>
                      <span class="flex items-center">
                        <CalendarIcon class="w-4 h-4 mr-1" />
                        {{ formatDate(assessment.created_at) }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-medium text-gray-900">{{ assessment.competency?.name }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ assessment.competency?.description }}</p>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                        {{ assessment.competency?.category }}
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {{ formatAssessmentType(assessment.assessment_type) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rating Section -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h2 class="text-xl font-semibold text-white">Performance Rating</h2>
              </div>
              <div class="p-6">
                <div class="space-y-6">
                  <!-- Rating Scale -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-4">Overall Competency Rating *</label>
                    <div class="grid grid-cols-5 gap-3">
                      <div 
                        v-for="rating in 5" 
                        :key="rating"
                        @click="canEdit ? form.rating = rating : null"
                        :class="[
                          canEdit ? 'cursor-pointer group' : 'cursor-not-allowed opacity-60'
                        ]"
                      >
                        <div :class="[
                          'p-4 rounded-lg border-2 text-center transition-all duration-200',
                          form.rating >= rating 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                        ]">
                          <div class="flex justify-center mb-2">
                            <StarIcon :class="[
                              'w-6 h-6',
                              form.rating >= rating ? 'text-purple-500 fill-current' : 'text-gray-400'
                            ]" />
                          </div>
                          <div class="text-xs font-medium text-gray-700">{{ rating }}</div>
                          <div class="text-xs text-gray-500 mt-1">{{ getRatingLabel(rating) }}</div>
                        </div>
                      </div>
                    </div>
                    <div v-if="errors.rating" class="mt-2 text-sm text-red-600">
                      {{ errors.rating }}
                    </div>
                  </div>

                  <!-- Current Rating Display -->
                  <div v-if="form.rating" class="p-4 bg-purple-50 rounded-lg">
                    <div class="flex items-center justify-between">
                      <div>
                        <h4 class="font-medium text-purple-900">Selected Rating: {{ form.rating }}/5</h4>
                        <p class="text-sm text-purple-700">{{ getRatingLabel(form.rating) }}</p>
                      </div>
                      <div class="flex">
                        <StarIcon 
                          v-for="i in 5" 
                          :key="i"
                          :class="[
                            'w-5 h-5',
                            i <= form.rating ? 'text-purple-500 fill-current' : 'text-gray-300'
                          ]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comments & Feedback -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h2 class="text-xl font-semibold text-white">Detailed Feedback</h2>
              </div>
              <div class="p-6 space-y-6">
                <!-- Comments -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Assessment Comments *</label>
                  <textarea
                    v-model="form.comments"
                    :readonly="!canEdit"
                    rows="6"
                    placeholder="Provide detailed feedback on the employee's performance in this competency. Include specific examples, strengths, and areas for improvement..."
                    :class="[
                      'w-full rounded-md border-gray-300 shadow-sm',
                      canEdit 
                        ? 'focus:border-green-500 focus:ring-green-500' 
                        : 'bg-gray-50 cursor-not-allowed'
                    ]"
                  ></textarea>
                  <div v-if="errors.comments" class="mt-1 text-sm text-red-600">
                    {{ errors.comments }}
                  </div>
                  <p class="mt-2 text-sm text-gray-500">{{ form.comments?.length || 0 }} characters</p>
                </div>

                <!-- Development Notes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Development Recommendations</label>
                  <textarea
                    v-model="form.development_notes"
                    :readonly="!canEdit"
                    rows="4"
                    placeholder="Suggest specific actions, training, or resources to help the employee improve in this competency..."
                    :class="[
                      'w-full rounded-md border-gray-300 shadow-sm',
                      canEdit 
                        ? 'focus:border-green-500 focus:ring-green-500' 
                        : 'bg-gray-50 cursor-not-allowed'
                    ]"
                  ></textarea>
                  <div v-if="errors.development_notes" class="mt-1 text-sm text-red-600">
                    {{ errors.development_notes }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Evidence & Documentation -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
                <h2 class="text-xl font-semibold text-white">Supporting Evidence</h2>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <p class="text-sm text-gray-600">Upload documents, screenshots, or other evidence that supports your assessment.</p>
                  
                  <!-- File Upload Area -->
                  <div v-if="canEdit" class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                    <DocumentArrowUpIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p class="text-sm text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                    <input type="file" multiple class="hidden" ref="fileInput" @change="handleFileUpload" />
                    <button 
                      type="button" 
                      @click="$refs.fileInput.click()"
                      :disabled="uploadingFiles"
                      class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperClipIcon v-if="!uploadingFiles" class="w-4 h-4 mr-2" />
                      <div v-else class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-orange-600"></div>
                      {{ uploadingFiles ? 'Uploading...' : 'Choose Files' }}
                    </button>
                  </div>
                  
                  <!-- Read-only message for non-editable assessments -->
                  <div v-else-if="uploadedFiles.length === 0" class="text-center py-8">
                    <DocumentIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p class="text-sm text-gray-500">No supporting evidence uploaded</p>
                  </div>

                  <!-- Uploaded Files -->
                  <div v-if="uploadedFiles.length > 0" class="space-y-2">
                    <h4 class="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                    <div class="space-y-2">
                      <div 
                        v-for="(file, index) in uploadedFiles" 
                        :key="index"
                        class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div class="flex items-center cursor-pointer" @click="viewFile(file.name)">
                          <DocumentIcon class="w-5 h-5 text-gray-400 mr-3" />
                          <span class="text-sm text-gray-900 hover:text-blue-600">{{ file.name }}</span>
                          <span v-if="file.size !== null" class="text-xs text-gray-500 ml-2">({{ formatFileSize(file.size) }})</span>
                          <span v-else-if="file.isExisting" class="text-xs text-gray-500 ml-2">(Existing file)</span>
                          <EyeIcon class="w-4 h-4 text-gray-400 ml-2" />
                        </div>
                        <button 
                          v-if="canEdit"
                          type="button"
                          @click="removeFile(index)"
                          class="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Assessment Status -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Assessment Status</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Current Status:</span>
                    <span :class="getStatusClasses(assessment.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ formatStatus(assessment.status) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Assessment Type:</span>
                    <span class="text-sm font-medium text-gray-900">{{ formatAssessmentType(assessment.assessment_type) }}</span>
                  </div>
                  <div v-if="assessment.assessment_cycle" class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Cycle:</span>
                    <span class="text-sm font-medium text-gray-900">{{ assessment.assessment_cycle.name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div v-if="canEdit" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              <div class="p-6 space-y-3">
                <button
                  @click="saveDraft"
                  :disabled="processing"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <DocumentIcon class="w-4 h-4 mr-2" />
                  Save as Draft
                </button>
                
                <button
                  @click="submitAssessment"
                  :disabled="processing || !canSubmit"
                  class="w-full inline-flex items-center justify-center px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                >
                  <CheckIcon class="w-4 h-4 mr-2" />
                  Submit Assessment
                </button>
                
                <div v-if="!canSubmit" class="text-xs text-red-600 mt-2">
                  Please provide a rating and comments before submitting.
                </div>
              </div>
            </div>

            <!-- Assessment Guidelines -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Rating Guidelines</h3>
              </div>
              <div class="p-6">
                <div class="space-y-3 text-sm">
                  <div class="flex items-start">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <span class="text-xs font-bold text-red-600">1</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">Needs Improvement</div>
                      <div class="text-gray-600">Below expectations, requires significant development</div>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span class="text-xs font-bold text-orange-600">2</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">Below Expectations</div>
                      <div class="text-gray-600">Some skills present but needs improvement</div>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                      <span class="text-xs font-bold text-yellow-600">3</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">Meets Expectations</div>
                      <div class="text-gray-600">Competent performance, meets job requirements</div>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span class="text-xs font-bold text-blue-600">4</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">Exceeds Expectations</div>
                      <div class="text-gray-600">Strong performance, above average skills</div>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <span class="text-xs font-bold text-green-600">5</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">Outstanding</div>
                      <div class="text-gray-600">Exceptional performance, role model for others</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- File Viewer Modal -->
      <FileViewerModal
        :show="showFileViewer"
        :fileName="selectedFileName"
        :fileUrl="selectedFileUrl"
        @close="closeFileViewer"
      />
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
  StarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentIcon,
  DocumentArrowUpIcon,
  PaperClipIcon,
  XMarkIcon,
  CheckIcon,
  EyeIcon
} from '@heroicons/vue/24/outline';
import FileViewerModal from '@/Components/Modals/FileViewerModal.vue';

const props = defineProps({
  assessment: Object,
  errors: Object,
  canEdit: {
    type: Boolean,
    default: false
  },
  isReadOnly: {
    type: Boolean,
    default: true
  }
});

// Initialize uploaded files from existing assessment data
const getEvidenceFiles = () => {
  let evidenceFiles = props.assessment.evidence_files || [];
  
  // Handle case where evidence_files might be a JSON string
  if (typeof evidenceFiles === 'string') {
    try {
      evidenceFiles = JSON.parse(evidenceFiles);
    } catch (e) {
      console.warn('Failed to parse evidence_files JSON:', e);
      evidenceFiles = [];
    }
  }
  
  // Ensure it's an array
  if (!Array.isArray(evidenceFiles)) {
    evidenceFiles = [];
  }
  
  return evidenceFiles;
};

const form = ref({
  rating: props.assessment.rating || null,
  comments: props.assessment.comments || '',
  development_notes: props.assessment.development_notes || '',
  evidence_files: getEvidenceFiles()
});

const processing = ref(false);
const uploadingFiles = ref(false);

const uploadedFiles = ref(
  getEvidenceFiles()
    .map(fileItem => {
      // Handle both string filenames and file objects
      if (typeof fileItem === 'string') {
        return {
          name: fileItem,
          size: null,
          type: 'application/octet-stream',
          isExisting: true
        };
      } else if (typeof fileItem === 'object' && fileItem !== null) {
        // Handle file objects that might have been stored
        const fileName = fileItem.name || fileItem.filename || fileItem.originalName;
        if (fileName) {
          return {
            name: fileName,
            size: fileItem.size || null,
            type: fileItem.type || fileItem.mimeType || 'application/octet-stream',
            isExisting: true
          };
        }
      }
      
      // Skip invalid entries
      return null;
    })
    .filter(file => file !== null) // Remove invalid entries
);

// File viewer state
const showFileViewer = ref(false);
const selectedFileName = ref('');
const selectedFileUrl = ref('');

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Competency Management', href: route('competency-assessments.index') },
  { label: 'Assessments', href: route('competency-assessments.index') },
  { label: `Evaluate ${props.assessment.employee?.user?.name || 'Assessment'}`, current: true }
]);

const headerActions = computed(() => [
  {
    id: 'back-to-assessments',
    label: 'Back to Assessments',
    icon: 'arrow-left',
    variant: 'secondary',
    href: route('competency-assessments.index')
  }
]);

const canSubmit = computed(() => {
  return form.value.rating && form.value.comments && form.value.comments.trim().length > 0;
});

const saveDraft = () => {
  processing.value = true;
  
  router.put(route('competency-assessments.update', props.assessment.id), {
    // Include all required fields for validation
    employee_id: props.assessment.employee_id,
    competency_id: props.assessment.competency_id,
    assessment_type: props.assessment.assessment_type,
    assessment_cycle_id: props.assessment.assessment_cycle_id,
    // Include form data
    ...form.value,
    status: 'draft'
  }, {
    onSuccess: () => {
      // Success handled by controller redirect
    },
    onError: () => {
      processing.value = false;
    },
    onFinish: () => {
      processing.value = false;
    }
  });
};

const submitAssessment = () => {
  if (!canSubmit.value) {
    alert('Please provide a rating and comments before submitting.');
    return;
  }
  
  processing.value = true;
  
  router.put(route('competency-assessments.update', props.assessment.id), {
    // Include all required fields for validation
    employee_id: props.assessment.employee_id,
    competency_id: props.assessment.competency_id,
    assessment_type: props.assessment.assessment_type,
    assessment_cycle_id: props.assessment.assessment_cycle_id,
    // Include form data
    ...form.value,
    status: 'submitted'
  }, {
    onSuccess: () => {
      // Success handled by controller redirect
    },
    onError: () => {
      processing.value = false;
    },
    onFinish: () => {
      processing.value = false;
    }
  });
};

const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files);
  
  if (files.length === 0) return;
  
  // Validate file sizes (10MB max per file)
  const maxSize = 10 * 1024 * 1024; // 10MB
  const oversizedFiles = files.filter(file => file.size > maxSize);
  if (oversizedFiles.length > 0) {
    alert(`The following files are too large (max 10MB): ${oversizedFiles.map(f => f.name).join(', ')}`);
    return;
  }
  
  // Create FormData for file upload
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files[]', file);
  });
  
  uploadingFiles.value = true;
  
  try {
    // Upload files to server
    const response = await fetch(`/assessment-files/${props.assessment.id}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // Add uploaded files to display
      const fileData = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        isExisting: false
      }));
      
      uploadedFiles.value.push(...fileData);
      form.value.evidence_files = result.all_files || result.files || uploadedFiles.value.map(f => f.name);
      
      // Clear the file input
      event.target.value = '';
      
      console.log('Files uploaded successfully:', result.files);
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('File upload failed:', errorData);
      alert(`File upload failed: ${errorData.error || response.statusText}`);
    }
  } catch (error) {
    console.error('File upload error:', error);
    alert('File upload failed. Please check your connection and try again.');
  } finally {
    uploadingFiles.value = false;
  }
};

const removeFile = (index) => {
  const fileToRemove = uploadedFiles.value[index];
  
  if (confirm(`Are you sure you want to remove "${fileToRemove.name}"?`)) {
    uploadedFiles.value.splice(index, 1);
    form.value.evidence_files = uploadedFiles.value.map(file => file.name);
    
    // Note: For existing files, we're just removing from the UI
    // The actual file deletion would need to be handled on the server
    // when the assessment is saved
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0 || bytes === null || bytes === undefined) return 'Unknown size';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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

// File viewer methods
const viewFile = (fileName) => {
  selectedFileName.value = fileName;
  selectedFileUrl.value = `/assessment-files/${props.assessment.id}/${fileName}`;
  showFileViewer.value = true;
};

const closeFileViewer = () => {
  showFileViewer.value = false;
  selectedFileName.value = '';
  selectedFileUrl.value = '';
};
</script>

<style scoped>
.bg-purple-25 {
  background-color: #faf5ff;
}
</style>