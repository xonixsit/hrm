<template>
  <div class="flex flex-col items-center space-y-4">
    <!-- Profile Picture with Hover Upload -->
    <div class="relative group">
      <!-- Current Picture or Placeholder -->
      <div class="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary-200 shadow-lg">
        <img
          v-if="currentPicture && uploadProgress === 0"
          :key="currentPicture"
          :src="currentPicture"
          alt="Profile picture"
          class="w-full h-full object-cover"
        />
        <div
          v-else-if="uploadProgress === 0"
          class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center"
        >
          <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <!-- Upload Progress -->
        <div
          v-if="uploadProgress > 0"
          class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center"
        >
          <svg class="animate-spin h-10 w-10 text-white mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-white text-sm font-medium">{{ uploadProgress }}%</span>
        </div>
      </div>

      <!-- Hover Overlay -->
      <div
        v-if="uploadProgress === 0"
        @click="$refs.fileInput.click()"
        class="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer flex flex-col items-center justify-center"
      >
        <svg class="w-10 h-10 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-white text-sm font-medium">{{ currentPicture ? 'Change' : 'Upload' }}</span>
      </div>

      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>

    <!-- Upload Instructions -->
    <div v-if="uploadProgress === 0" class="text-center">
      <button
        type="button"
        @click="$refs.fileInput.click()"
        class="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        {{ currentPicture ? 'Change photo' : 'Upload photo' }}
      </button>
      <p class="text-xs text-neutral-500 mt-1">PNG, JPG, GIF up to 5MB</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="w-full max-w-md bg-danger-50 border border-danger-200 rounded-lg p-3 flex items-start space-x-2">
      <svg class="w-5 h-5 text-danger-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <p class="text-sm text-danger-800">{{ error }}</p>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="w-full max-w-md bg-success-50 border border-success-200 rounded-lg p-3 flex items-start space-x-2">
      <svg class="w-5 h-5 text-success-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <p class="text-sm text-success-800">{{ successMessage }}</p>
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
  uploadRoute: {
    type: String,
    default: null, // If not provided, uses profile.upload-picture
  },
});

const emit = defineEmits(['picture-updated']);

const fileInput = ref(null);
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

  xhr.open('POST', props.uploadRoute || route('profile.upload-picture'));
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
