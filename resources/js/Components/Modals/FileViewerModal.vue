<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
              <!-- Header -->
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DocumentIcon class="h-6 w-6 text-teal-600" aria-hidden="true" />
                  </div>
                  <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                      {{ fileName }}
                    </DialogTitle>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        {{ getFileTypeDescription() }}
                      </p>
                    </div>
                  </div>
                  <div class="mt-3 sm:mt-0 sm:ml-4">
                    <button
                      @click="closeModal"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <XMarkIcon class="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="px-4 pb-4 sm:px-6 sm:pb-6">
                <div class="bg-gray-50 rounded-lg p-4" style="height: 500px;">
                  <!-- PDF Preview -->
                  <div v-if="isPdf" class="w-full h-full">
                    <iframe 
                      :src="fileUrl" 
                      class="w-full h-full border-0 rounded"
                    >
                      <div class="flex flex-col items-center justify-center h-full text-center">
                        <DocumentIcon class="h-16 w-16 text-gray-400 mb-4" />
                        <p class="text-gray-600 mb-4">Your browser does not support PDF viewing.</p>
                        <a 
                          :href="fileUrl" 
                          target="_blank"
                          class="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                          <ArrowTopRightOnSquareIcon class="mr-2 h-4 w-4" />
                          Open in New Tab
                        </a>
                      </div>
                    </iframe>
                  </div>

                  <!-- Image Preview -->
                  <div v-else-if="isImage" class="flex justify-center items-center h-full">
                    <img 
                      :src="fileUrl" 
                      :alt="fileName"
                      class="max-w-full max-h-full object-contain rounded shadow-sm"
                      @error="handleImageError"
                    />
                  </div>

                  <!-- Text Preview -->
                  <div v-else-if="isText" class="bg-white p-4 rounded border h-full overflow-auto">
                    <pre class="whitespace-pre-wrap text-sm text-gray-800 font-mono">{{ fileContent }}</pre>
                  </div>

                  <!-- Unsupported File Type -->
                  <div v-else class="flex flex-col items-center justify-center h-full text-center">
                    <DocumentIcon class="h-16 w-16 text-gray-400 mb-4" />
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Preview not available</h3>
                    <p class="text-gray-500 mb-6 max-w-md">
                      This file type ({{ fileExtension.toUpperCase() }}) cannot be previewed in the browser. 
                      You can download it to view with the appropriate application.
                    </p>
                    <a
                      :href="fileUrl"
                      download
                      class="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      <ArrowDownTrayIcon class="mr-2 h-4 w-4" />
                      Download File
                    </a>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <a
                  :href="fileUrl"
                  download
                  class="inline-flex w-full justify-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 sm:ml-3 sm:w-auto"
                >
                  <ArrowDownTrayIcon class="mr-2 h-4 w-4" />
                  Download
                </a>
                <a
                  :href="fileUrl"
                  target="_blank"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:ml-3"
                >
                  <ArrowTopRightOnSquareIcon class="mr-2 h-4 w-4" />
                  Open in New Tab
                </a>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  @click="closeModal"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { 
  DocumentIcon, 
  XMarkIcon, 
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const fileContent = ref('')

// File type detection
const fileExtension = computed(() => {
  return props.fileName.split('.').pop()?.toLowerCase() || ''
})

const isImage = computed(() => {
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension.value)
})

const isPdf = computed(() => {
  return fileExtension.value === 'pdf'
})

const isText = computed(() => {
  return ['txt', 'md', 'json', 'xml', 'csv', 'log'].includes(fileExtension.value)
})

// Load text content for text files
watch(() => props.show, async (newShow) => {
  if (newShow && isText.value) {
    try {
      const response = await fetch(props.fileUrl)
      fileContent.value = await response.text()
    } catch (error) {
      fileContent.value = 'Error loading file content.'
    }
  }
})

const closeModal = () => {
  emit('close')
}

const handleImageError = () => {
  console.error('Failed to load image:', props.fileUrl)
}

const getFileTypeDescription = () => {
  const descriptions = {
    'pdf': 'PDF Document',
    'jpg': 'JPEG Image',
    'jpeg': 'JPEG Image', 
    'png': 'PNG Image',
    'gif': 'GIF Image',
    'bmp': 'Bitmap Image',
    'webp': 'WebP Image',
    'svg': 'SVG Vector Image',
    'txt': 'Text Document',
    'md': 'Markdown Document',
    'json': 'JSON Data',
    'xml': 'XML Document',
    'csv': 'CSV Spreadsheet',
    'log': 'Log File'
  }
  return descriptions[fileExtension.value] || `${fileExtension.value.toUpperCase()} File`
}
</script>