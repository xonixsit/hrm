<template>
  <div class="file-upload-wrapper" :class="wrapperClasses">
    <!-- Upload Area -->
    <div
      ref="dropZoneRef"
      :class="uploadAreaClasses"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- Hidden File Input -->
      <input
        ref="fileInputRef"
        type="file"
        :multiple="multiple"
        :accept="acceptedTypesString"
        :disabled="disabled"
        class="sr-only"
        @change="handleFileSelect"
      />

      <!-- Upload Content -->
      <div class="upload-content">
        <div class="upload-icon">
          <CloudArrowUpIcon class="w-8 h-8 text-neutral-400" />
        </div>
        
        <div class="upload-text">
          <p class="upload-primary-text">
            <span class="upload-link">Click to upload</span>
            <span v-if="!disabled"> or drag and drop</span>
          </p>
          <p class="upload-secondary-text">
            {{ getUploadHelpText() }}
          </p>
        </div>
      </div>
    </div>

    <!-- File List -->
    <div v-if="files.length > 0" class="file-list">
      <div class="file-list-header">
        <h4 class="file-list-title">Uploaded Files ({{ files.length }}{{ maxFiles ? `/${maxFiles}` : '' }})</h4>
        <button
          v-if="files.length > 0 && !disabled"
          @click="clearAllFiles"
          class="clear-all-button"
          type="button"
        >
          <XMarkIcon class="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div class="file-items">
        <div
          v-for="(file, index) in files"
          :key="file.id || index"
          class="file-item"
          :class="getFileItemClasses(file)"
        >
          <!-- File Icon -->
          <div class="file-icon">
            <component :is="getFileIcon(file)" class="w-5 h-5" />
          </div>

          <!-- File Info -->
          <div class="file-info">
            <div class="file-name" :title="file.name">
              {{ file.name }}
            </div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span v-if="file.status" class="file-status" :class="getFileStatusClasses(file.status)">
                {{ getFileStatusText(file.status) }}
              </span>
            </div>
          </div>

          <!-- File Actions -->
          <div class="file-actions">
            <!-- Preview Button (for images) -->
            <button
              v-if="canPreview(file)"
              @click="previewFile(file)"
              class="file-action-button"
              type="button"
              title="Preview"
            >
              <EyeIcon class="w-4 h-4" />
            </button>

            <!-- Download Button (for uploaded files) -->
            <button
              v-if="file.url"
              @click="downloadFile(file)"
              class="file-action-button"
              type="button"
              title="Download"
            >
              <ArrowDownTrayIcon class="w-4 h-4" />
            </button>

            <!-- Remove Button -->
            <button
              v-if="!disabled"
              @click="removeFile(index)"
              class="file-action-button file-action-button--danger"
              type="button"
              title="Remove"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Upload Progress -->
          <div v-if="file.status === 'uploading'" class="file-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${file.progress || 0}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ file.progress || 0 }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="uploadErrors.length > 0" class="upload-errors">
      <div class="error-header">
        <ExclamationTriangleIcon class="w-4 h-4 text-error-500" />
        <span class="error-title">Upload Errors</span>
      </div>
      <ul class="error-list">
        <li v-for="(error, index) in uploadErrors" :key="index" class="error-item">
          {{ error }}
        </li>
      </ul>
    </div>

    <!-- Help Text / Error Message -->
    <div v-if="helpText || errorMessage" class="upload-footer">
      <p
        v-if="errorMessage"
        class="text-sm text-error-500"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <p
        v-else-if="helpText"
        class="text-sm text-neutral-500"
      >
        {{ helpText }}
      </p>
    </div>

    <!-- File Preview Modal -->
    <Modal v-if="previewFile" :show="showPreview" @close="closePreview">
      <div class="preview-modal">
        <div class="preview-header">
          <h3 class="preview-title">{{ previewFile?.name }}</h3>
          <button @click="closePreview" class="preview-close">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="preview-content">
          <img
            v-if="previewFile && isImage(previewFile)"
            :src="getFilePreviewUrl(previewFile)"
            :alt="previewFile.name"
            class="preview-image"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  DocumentTextIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import Modal from '@/Components/Modal.vue'

const props = defineProps({
  // v-model
  modelValue: {
    type: Array,
    default: () => []
  },
  
  // Upload options
  multiple: {
    type: Boolean,
    default: false
  },
  
  maxFiles: {
    type: Number,
    default: null
  },
  
  maxFileSize: {
    type: Number,
    default: 10 // MB
  },
  
  acceptedTypes: {
    type: Array,
    default: () => ['image/*', 'application/pdf', '.doc', '.docx', '.txt']
  },
  
  // Upload behavior
  autoUpload: {
    type: Boolean,
    default: false
  },
  
  uploadUrl: {
    type: String,
    default: ''
  },
  
  // States
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Validation
  errorMessage: {
    type: String,
    default: ''
  },
  
  helpText: {
    type: String,
    default: ''
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
})

const emit = defineEmits([
  'update:modelValue', 
  'files-added', 
  'file-removed', 
  'upload-progress', 
  'upload-complete',
  'upload-error'
])

// Local state
const files = ref([...props.modelValue])
const isDragOver = ref(false)
const uploadErrors = ref([])
const previewFile = ref(null)
const showPreview = ref(false)

// Refs
const fileInputRef = ref(null)
const dropZoneRef = ref(null)

// Computed properties
const acceptedTypesString = computed(() => {
  return props.acceptedTypes.join(',')
})

const canAddMoreFiles = computed(() => {
  if (!props.maxFiles) return true
  return files.value.length < props.maxFiles
})

const wrapperClasses = computed(() => [
  'file-upload-wrapper',
  {
    'file-upload--disabled': props.disabled,
    'file-upload--error': props.errorMessage
  },
  props.class
])

const uploadAreaClasses = computed(() => [
  'upload-area',
  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
  {
    'border-neutral-300 hover:border-neutral-400': !isDragOver.value && !props.disabled && !props.errorMessage,
    'border-primary-400 bg-primary-50': isDragOver.value && !props.disabled,
    'border-error-300 bg-error-50': props.errorMessage,
    'border-neutral-200 bg-neutral-50 cursor-not-allowed': props.disabled,
    'opacity-50': !canAddMoreFiles.value
  }
])

// Helper methods
const getUploadHelpText = () => {
  const parts = []
  
  if (props.acceptedTypes.length > 0) {
    const types = props.acceptedTypes.map(type => {
      if (type === 'image/*') return 'Images'
      if (type === 'application/pdf') return 'PDF'
      if (type.startsWith('.')) return type.toUpperCase().slice(1)
      return type
    }).join(', ')
    parts.push(types)
  }
  
  if (props.maxFileSize) {
    parts.push(`up to ${props.maxFileSize}MB each`)
  }
  
  if (props.maxFiles) {
    parts.push(`maximum ${props.maxFiles} files`)
  }
  
  return parts.join(' • ')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (file) => {
  const type = file.type || ''
  
  if (type.startsWith('image/')) return PhotoIcon
  if (type.startsWith('video/')) return FilmIcon
  if (type === 'application/pdf') return DocumentTextIcon
  if (type.includes('text/')) return DocumentTextIcon
  
  return DocumentIcon
}

const getFileItemClasses = (file) => [
  'file-item',
  {
    'file-item--uploading': file.status === 'uploading',
    'file-item--error': file.status === 'error',
    'file-item--success': file.status === 'success'
  }
]

const getFileStatusClasses = (status) => [
  'file-status',
  {
    'text-blue-600': status === 'uploading',
    'text-error-600': status === 'error',
    'text-success-600': status === 'success'
  }
]

const getFileStatusText = (status) => {
  const statusTexts = {
    uploading: 'Uploading...',
    error: 'Failed',
    success: 'Uploaded'
  }
  return statusTexts[status] || ''
}

const isImage = (file) => {
  return file.type?.startsWith('image/')
}

const canPreview = (file) => {
  return isImage(file)
}

const getFilePreviewUrl = (file) => {
  if (file.url) return file.url
  if (file instanceof File) return URL.createObjectURL(file)
  return ''
}

// Validation methods
const validateFile = (file) => {
  const errors = []
  
  // Check file size
  if (props.maxFileSize && file.size > props.maxFileSize * 1024 * 1024) {
    errors.push(`${file.name} is too large (max ${props.maxFileSize}MB)`)
  }
  
  // Check file type
  if (props.acceptedTypes.length > 0) {
    const isAccepted = props.acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/')
      if (type === 'video/*') return file.type.startsWith('video/')
      if (type === 'audio/*') return file.type.startsWith('audio/')
      if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type.toLowerCase())
      return file.type === type
    })
    
    if (!isAccepted) {
      errors.push(`${file.name} is not an accepted file type`)
    }
  }
  
  return errors
}

// Event handlers
const triggerFileInput = () => {
  if (props.disabled || !canAddMoreFiles.value) return
  fileInputRef.value?.click()
}

const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files || [])
  addFiles(selectedFiles)
  
  // Clear the input so the same file can be selected again
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleDragOver = (event) => {
  if (props.disabled || !canAddMoreFiles.value) return
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  isDragOver.value = false
  
  if (props.disabled || !canAddMoreFiles.value) return
  
  const droppedFiles = Array.from(event.dataTransfer.files || [])
  addFiles(droppedFiles)
}

const addFiles = (newFiles) => {
  uploadErrors.value = []
  
  // Check if we can add more files
  const availableSlots = props.maxFiles ? props.maxFiles - files.value.length : newFiles.length
  const filesToAdd = newFiles.slice(0, availableSlots)
  
  if (newFiles.length > filesToAdd.length) {
    uploadErrors.value.push(`Only ${availableSlots} more files can be added`)
  }
  
  // Validate and add files
  const validFiles = []
  
  filesToAdd.forEach(file => {
    const errors = validateFile(file)
    
    if (errors.length > 0) {
      uploadErrors.value.push(...errors)
    } else {
      // Add unique ID and initial status
      const fileWithMeta = {
        ...file,
        id: Date.now() + Math.random(),
        status: props.autoUpload ? 'uploading' : null,
        progress: 0
      }
      
      validFiles.push(fileWithMeta)
    }
  })
  
  if (validFiles.length > 0) {
    files.value.push(...validFiles)
    updateModelValue()
    emit('files-added', validFiles)
    
    // Auto upload if enabled
    if (props.autoUpload && props.uploadUrl) {
      validFiles.forEach(file => uploadFile(file))
    }
  }
}

const removeFile = (index) => {
  const removedFile = files.value[index]
  files.value.splice(index, 1)
  updateModelValue()
  emit('file-removed', removedFile)
  
  // Revoke object URL if it exists
  if (removedFile.url && removedFile.url.startsWith('blob:')) {
    URL.revokeObjectURL(removedFile.url)
  }
}

const clearAllFiles = () => {
  files.value.forEach(file => {
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
  })
  
  files.value = []
  uploadErrors.value = []
  updateModelValue()
}

const openPreview = (file) => {
  if (!canPreview(file)) return
  
  previewFile.value = file
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
  previewFile.value = null
}

const downloadFile = (file) => {
  if (!file.url) return
  
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const uploadFile = async (file) => {
  if (!props.uploadUrl) return
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await fetch(props.uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      
      // Update file with server response
      const fileIndex = files.value.findIndex(f => f.id === file.id)
      if (fileIndex !== -1) {
        files.value[fileIndex] = {
          ...files.value[fileIndex],
          status: 'success',
          progress: 100,
          url: result.url,
          id: result.id
        }
        updateModelValue()
        emit('upload-complete', files.value[fileIndex])
      }
    } else {
      throw new Error('Upload failed')
    }
  } catch (error) {
    // Update file status to error
    const fileIndex = files.value.findIndex(f => f.id === file.id)
    if (fileIndex !== -1) {
      files.value[fileIndex].status = 'error'
      updateModelValue()
    }
    
    emit('upload-error', { file, error })
    uploadErrors.value.push(`Failed to upload ${file.name}`)
  }
}

const updateModelValue = () => {
  emit('update:modelValue', [...files.value])
}

// Public methods
const addFile = (file) => {
  addFiles([file])
}

const removeFileById = (id) => {
  const index = files.value.findIndex(f => f.id === id)
  if (index !== -1) {
    removeFile(index)
  }
}

const clearFiles = () => {
  clearAllFiles()
}

// Expose methods
defineExpose({
  addFile,
  removeFileById,
  clearFiles,
  triggerFileInput
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (JSON.stringify(newValue) !== JSON.stringify(files.value)) {
    files.value = [...newValue]
  }
}, { deep: true })
</script>

<style scoped>
/* Base styles */
.file-upload-wrapper {
  @apply w-full;
}

/* Upload area */
.upload-area {
  @apply border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors;
}

.upload-area:hover:not(.file-upload--disabled .upload-area) {
  @apply border-neutral-400 bg-neutral-50;
}

.upload-content {
  @apply flex flex-col items-center space-y-3;
}

.upload-icon {
  @apply flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100;
}

.upload-text {
  @apply space-y-1;
}

.upload-primary-text {
  @apply text-sm font-medium text-neutral-900;
}

.upload-link {
  @apply text-primary-600 hover:text-primary-500 cursor-pointer;
}

.upload-secondary-text {
  @apply text-xs text-neutral-500;
}

/* File list */
.file-list {
  @apply mt-4 space-y-3;
}

.file-list-header {
  @apply flex items-center justify-between;
}

.file-list-title {
  @apply text-sm font-medium text-neutral-900;
}

.clear-all-button {
  @apply inline-flex items-center space-x-1 text-xs text-neutral-500 hover:text-neutral-700;
  @apply transition-colors;
}

.file-items {
  @apply space-y-2;
}

/* File item */
.file-item {
  @apply relative flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200;
  @apply transition-colors;
}

.file-item--uploading {
  @apply bg-blue-50 border-blue-200;
}

.file-item--error {
  @apply bg-error-50 border-error-200;
}

.file-item--success {
  @apply bg-success-50 border-success-200;
}

.file-icon {
  @apply flex-shrink-0 text-neutral-400;
}

.file-item--uploading .file-icon {
  @apply text-blue-500;
}

.file-item--error .file-icon {
  @apply text-error-500;
}

.file-item--success .file-icon {
  @apply text-success-500;
}

.file-info {
  @apply flex-1 min-w-0;
}

.file-name {
  @apply text-sm font-medium text-neutral-900 truncate;
}

.file-meta {
  @apply flex items-center space-x-2 text-xs text-neutral-500 mt-1;
}

.file-size {
  @apply flex-shrink-0;
}

.file-status {
  @apply font-medium;
}

.file-actions {
  @apply flex items-center space-x-1 flex-shrink-0;
}

.file-action-button {
  @apply p-1 text-neutral-400 hover:text-neutral-600 rounded transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.file-action-button--danger {
  @apply text-error-400 hover:text-error-600;
}

/* File progress */
.file-progress {
  @apply absolute bottom-0 left-0 right-0 flex items-center space-x-2 p-2 bg-white border-t border-blue-200;
}

.progress-bar {
  @apply flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-500 transition-all duration-300;
}

.progress-text {
  @apply text-xs text-blue-600 font-medium flex-shrink-0;
}

/* Upload errors */
.upload-errors {
  @apply mt-3 p-3 bg-error-50 border border-error-200 rounded-lg;
}

.error-header {
  @apply flex items-center space-x-2 mb-2;
}

.error-title {
  @apply text-sm font-medium text-error-900;
}

.error-list {
  @apply space-y-1;
}

.error-item {
  @apply text-sm text-error-700;
}

/* Upload footer */
.upload-footer {
  @apply mt-2;
}

/* Preview modal */
.preview-modal {
  @apply bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden;
}

.preview-header {
  @apply flex items-center justify-between p-4 border-b border-neutral-200;
}

.preview-title {
  @apply text-lg font-medium text-neutral-900 truncate;
}

.preview-close {
  @apply p-1 text-neutral-400 hover:text-neutral-600 rounded transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.preview-content {
  @apply p-4 max-h-[70vh] overflow-auto;
}

.preview-image {
  @apply max-w-full h-auto rounded-lg;
}

/* State styles */
.file-upload--disabled {
  @apply opacity-60 pointer-events-none;
}

.file-upload--error .upload-area {
  @apply border-error-300 bg-error-50;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .upload-area {
    @apply p-4;
  }
  
  .file-item {
    @apply p-2 space-x-2;
  }
  
  .file-actions {
    @apply space-x-0.5;
  }
  
  .file-action-button {
    @apply p-0.5;
  }
}

/* Dark theme support */
.theme-dark .upload-area {
  @apply bg-neutral-800 border-neutral-600;
}

.theme-dark .upload-area:hover {
  @apply bg-neutral-700 border-neutral-500;
}

.theme-dark .upload-icon {
  @apply bg-neutral-700;
}

.theme-dark .upload-primary-text {
  @apply text-neutral-100;
}

.theme-dark .upload-secondary-text {
  @apply text-neutral-400;
}

.theme-dark .file-item {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .file-name {
  @apply text-neutral-100;
}

.theme-dark .file-meta {
  @apply text-neutral-400;
}

.theme-dark .preview-modal {
  @apply bg-neutral-800;
}

.theme-dark .preview-header {
  @apply border-neutral-700;
}

.theme-dark .preview-title {
  @apply text-neutral-100;
}
</style>