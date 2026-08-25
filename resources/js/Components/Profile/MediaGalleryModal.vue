<template>
  <TransitionRoot :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="relative w-full max-w-5xl transform overflow-hidden rounded-lg bg-white shadow-2xl transition-all">
              <!-- Header -->
              <div class="border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div>
                    <DialogTitle class="text-lg font-semibold text-gray-900">
                      {{ mode === 'avatar' ? 'Profile Picture Gallery' : 'Shared Media' }}
                    </DialogTitle>
                    <p class="mt-1 text-sm text-gray-600">
                      {{ mode === 'avatar' ? 'Select an existing photo or upload a new one' : 'Images shared in this conversation' }}
                    </p>
                  </div>
                  <button
                    @click="$emit('close')"
                    class="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="px-6 py-6">
                <!-- Upload New Button (Only for avatar mode) -->
                <div v-if="mode === 'avatar'" class="mb-6">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileSelect"
                  />
                  <button
                    @click="$refs.fileInput.click()"
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-primary-300 shadow-sm text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <ArrowUpTrayIcon class="h-5 w-5 mr-2" />
                    Upload New Image
                  </button>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex items-center justify-center py-12">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>

                <!-- Gallery Grid -->
                <div v-else-if="displayImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto pr-2">
                  <div
                    v-for="image in displayImages"
                    :key="image.id"
                    @click="mode === 'avatar' ? selectImage(image) : openImageLightbox(image)"
                    class="relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all"
                    :class="mode === 'avatar' && selectedImage?.id === image.id ? 'border-primary-600 ring-2 ring-primary-500' : 'border-gray-200 hover:border-primary-400'"
                  >
                    <div class="aspect-square bg-gray-100">
                      <img
                        :src="image.url"
                        :alt="image.name"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    
                    <!-- Selected Indicator (avatar mode only) -->
                    <div
                      v-if="mode === 'avatar' && selectedImage?.id === image.id"
                      class="absolute inset-0 bg-primary-600/20 flex items-center justify-center"
                    >
                      <div class="bg-primary-600 rounded-full p-2">
                        <CheckIcon class="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <!-- View Icon (chat mode) -->
                    <div
                      v-if="mode === 'chat'"
                      class="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <div class="bg-white rounded-full p-3">
                        <PhotoIcon class="h-6 w-6 text-gray-700" />
                      </div>
                    </div>

                    <!-- Hover Overlay with Date -->
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-all">
                      <p class="text-white text-xs">{{ formatDate(image.date) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-else class="text-center py-12">
                  <PhotoIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <h3 class="mt-2 text-sm font-medium text-gray-900">
                    {{ mode === 'avatar' ? 'No profile pictures yet' : 'No media shared yet' }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-500">
                    {{ mode === 'avatar' ? 'Upload your first profile picture' : 'Images sent in this conversation will appear here' }}
                  </p>
                </div>
              </div>

              <!-- Footer (Only for avatar mode) -->
              <div v-if="mode === 'avatar'" class="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  @click="$emit('close')"
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  @click="confirmSelection"
                  :disabled="!selectedImage"
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use Selected Image
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
import { ref, computed, onMounted, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue';
import { XMarkIcon, ArrowUpTrayIcon, PhotoIcon, CheckIcon } from '@heroicons/vue/24/outline';
import axios from 'axios';

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    default: 'avatar', // 'avatar' (admin selecting profile pic) or 'chat' (user viewing shared media)
    validator: (value) => ['avatar', 'chat'].includes(value)
  },
  conversationId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['close', 'select', 'viewImage']);

const profileImages = ref([]);
const chatImages = ref([]);
const selectedImage = ref(null);
const loading = ref(false);

const displayImages = computed(() => {
  if (props.mode === 'avatar') {
    return profileImages.value;
  } else {
    // Chat mode: show only images from this conversation
    return chatImages.value;
  }
});

watch(() => props.open, (newVal) => {
  if (newVal) {
    loadImages();
  }
});

onMounted(() => {
  if (props.open) {
    loadImages();
  }
});

async function loadImages() {
  loading.value = true;
  try {
    if (props.mode === 'avatar') {
      // Load profile pictures for admin
      const response = await axios.get('/api/media/profile-pictures');
      console.log('Profile pictures loaded:', response.data);
      profileImages.value = (response.data.images || []).map(img => ({
        id: `profile_${img.filename}`,
        name: img.filename,
        url: img.url,
        type: 'profile',
        date: img.created_at || img.uploaded_at,
        filename: img.filename
      }));
    } else if (props.mode === 'chat' && props.conversationId) {
      // Load chat images for this conversation
      const response = await axios.get(`/api/conversations/${props.conversationId}/media`);
      console.log('Chat images loaded:', response.data);
      chatImages.value = (response.data.images || []).map(img => ({
        id: `chat_${img.filename}`,
        name: img.filename,
        url: img.url,
        type: 'chat',
        date: img.created_at,
        filename: img.filename
      }));
    }
  } catch (error) {
    console.error('Failed to load images:', error);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
  } finally {
    loading.value = false;
  }
}

function selectImage(image) {
  selectedImage.value = image;
}

function openImageLightbox(image) {
  // Emit event to parent to open lightbox
  emit('viewImage', image);
}

function confirmSelection() {
  if (selectedImage.value) {
    emit('select', selectedImage.value);
    emit('close');
  }
}

function handleFileSelect(event) {
  const file = event.target.files?.[0];
  if (file) {
    emit('select', { file, isNew: true });
    emit('close');
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString();
}
</script>
