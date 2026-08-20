<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        @click="close"
      >
        <!-- Close button -->
        <button
          type="button"
          class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
          @click.stop="close"
          title="Close (Esc)"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Download button -->
        <button
          type="button"
          class="absolute top-4 right-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
          @click.stop="downloadImage"
          title="Download image"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        <!-- Image container -->
        <div
          class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          @click.stop
        >
          <img
            v-if="imageSrc"
            :src="imageSrc"
            :alt="imageAlt"
            class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            @click.stop
          />
          
          <!-- Loading spinner -->
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
            <svg class="animate-spin h-12 w-12 text-white" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>

        <!-- Image info (optional) -->
        <div v-if="showInfo" class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md text-white text-sm">
          {{ imageAlt || 'Image' }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  imageSrc: {
    type: String,
    required: true,
  },
  imageAlt: {
    type: String,
    default: '',
  },
  showInfo: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const isLoading = ref(true);

// Close on Esc key
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    close();
  }
};

// Preload image
watch(() => props.imageSrc, (newSrc) => {
  if (newSrc) {
    isLoading.value = true;
    const img = new Image();
    img.onload = () => {
      isLoading.value = false;
    };
    img.onerror = () => {
      isLoading.value = false;
    };
    img.src = newSrc;
  }
}, { immediate: true });

// Prevent body scroll when lightbox is open
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});

function close() {
  emit('close');
}

async function downloadImage() {
  try {
    // Fetch the image as a blob
    const response = await fetch(props.imageSrc);
    const blob = await response.blob();
    
    // Create a temporary download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from URL or use default
    const filename = props.imageSrc.split('/').pop() || 'image.jpg';
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download image:', error);
    alert('Failed to download image. Please try again.');
  }
}
</script>
