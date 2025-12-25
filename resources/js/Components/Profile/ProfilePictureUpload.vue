<template>
  <div class="space-y-4">
    <!-- Upload Area -->
    <div
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      :class="[
        'relative border-2 border-dashed rounded-lg p-8 transition-colors duration-200',
        isDragging
          ? 'border-primary-500 bg-primary-50'
          : 'border-neutral-300 bg-neutral-50 hover:border-primary-400'
      ]"
    >
      <!-- Current Picture Preview -->
      <div v-if="currentPicture && uploadProgress === 0" class="mb-6 flex justify-center">
        <div class="relative">
          <img
            :src="currentPicture"
            alt="Current profile picture"
            class="w-24 h-24 rounded-full object-cover border-4 border-primary-200"
          />
          <div class="absolute -bottom-1 -right-1 bg-success-500 rounded-full p-1">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Upload Input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Upload Content -->
      <div v-if="uploadProgress === 0" class="text-center">
        <svg class="mx-auto h-12 w-12 text-neutral-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-8l-3.172-3.172a4 4 0 00-5.656 0L28 20M9 20l3.172-3.172a4 4 0 015.656 0L28 20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p class="mt-2 text-sm font-medium text-neutral-900">
          <button
            type="button"
            @click="$refs.fileInput.click()"
            class="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Click to upload
          </button>
          or drag and drop
        </p>
        <p class="text-xs text-neutral-500 mt-1">PNG, JPG, GIF up to 5MB</p>
      </div>

      <!-- Progress Bar -->
      <div v-if="uploadProgress > 0" class="space-y-3">
        <div class="flex items-center justify-center">
          <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div class="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
          <div
            class="bg-gradient-to-r from-primary-500 to-primary-600 h-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
        <p class="text-center text-sm text-neutral-600">{{ uploadProgress }}% Uploading...</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-danger-50 border border-danger-200 rounded-lg p-4 flex items-start space-x-3">
      <svg class="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <div>
        <p class="text-sm font-medium text-danger-800">{{ error }}</p>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="bg-success-50 border border-success-200 rounded-lg p-4 flex items-start space-x-3">
      <svg class="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <div>
        <p class="text-sm font-medium text-success-800">{{ successMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import confetti from 'canvas-confetti';

const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['picture-updated']);

const fileInput = ref(null);
const isDragging = ref(false);
const uploadProgress = ref(0);
const error = ref('');
const successMessage = ref('');
const currentPicture = ref('');

onMounted(() => {
  if (props.employee?.profile_pic) {
    currentPicture.value = `/storage/${props.employee.profile_pic}`;
  }
});

watch(() => props.employee?.profile_pic, (newPic) => {
  if (newPic) {
    currentPicture.value = `/storage/${newPic}`;
  }
});

const handleFileSelect = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    uploadFile(files[0]);
  }
};

const handleDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    uploadFile(files[0]);
  }
};

const uploadFile = (file) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select a valid image file.';
    setTimeout(() => {
      error.value = '';
    }, 5000);
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File size must be less than 5MB.';
    setTimeout(() => {
      error.value = '';
    }, 5000);
    return;
  }

  error.value = '';
  successMessage.value = '';
  uploadProgress.value = 0;

  const formData = new FormData();
  formData.append('profile_pic', file);

  // Get CSRF token from meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

  const xhr = new XMLHttpRequest();

  // Track upload progress
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      uploadProgress.value = Math.round((event.loaded / event.total) * 100);
    }
  });

  xhr.addEventListener('load', () => {
    try {
      const response = JSON.parse(xhr.responseText);

      if (xhr.status === 200 && response.success) {
        currentPicture.value = response.profile_pic;
        successMessage.value = response.message;
        uploadProgress.value = 0;

        // Emit event to update parent component
        emit('picture-updated', {
          profile_pic: response.profile_pic,
          path: response.profile_pic.replace('/storage/', '')
        });

        // Trigger confetti animation
        triggerConfetti();

        // Clear success message after 5 seconds
        setTimeout(() => {
          successMessage.value = '';
        }, 5000);

        // Reset file input
        if (fileInput.value) {
          fileInput.value.value = '';
        }

        // Reload page after 2 seconds to refresh user data globally
        setTimeout(() => {
          router.reload();
        }, 2000);
      } else {
        error.value = response.error || 'Upload failed. Please try again.';
        uploadProgress.value = 0;

        setTimeout(() => {
          error.value = '';
        }, 5000);
      }
    } catch (e) {
      error.value = 'Server error. Please try again.';
      uploadProgress.value = 0;

      setTimeout(() => {
        error.value = '';
      }, 5000);
    }
  });

  xhr.addEventListener('error', () => {
    error.value = 'Network error. Please try again.';
    uploadProgress.value = 0;

    setTimeout(() => {
      error.value = '';
    }, 5000);
  });

  xhr.addEventListener('abort', () => {
    error.value = 'Upload cancelled.';
    uploadProgress.value = 0;

    setTimeout(() => {
      error.value = '';
    }, 5000);
  });

  xhr.open('POST', route('profile.upload-picture'));
  xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken || '');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.send(formData);
};

const triggerConfetti = () => {
  const duration = 2000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      particleCount,
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    });
  }, 250);
};
</script>
