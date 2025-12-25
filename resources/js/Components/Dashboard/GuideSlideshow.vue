<template>
  <!-- Slideshow Modal - Show Full Slide Below Navbar -->
  <div v-if="showSlideshow" class="fixed top-0 left-0 right-0 z-50 flex justify-center">
    <!-- Container - fixed dimensions to show full slide -->
    <div class="relative overflow-hidden bg-white" style="position:abosolute;z-index:1000;top:-120px;width: 500px; height: 630px;">
      <!-- Close Button -->
      <button 
        @click="closeSlideshow"
        class="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Image -->
      <transition name="fade" mode="out-in">
        <img 
          :key="currentSlide"
          :src="`/images/etax_guide/${slides[currentSlide].image}`"
          :alt="slides[currentSlide].image"
          class="w-full h-full object-contain"
        />
      </transition>
      
      <!-- Slide Counter -->
      <div class="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
        {{ currentSlide + 1 }} / {{ slides.length }}
      </div>

      <!-- Left Arrow -->
      <button 
        @click="previousSlide"
        :disabled="currentSlide === 0"
        class="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Right Arrow -->
      <button 
        @click="nextSlide"
        :disabled="currentSlide === slides.length - 1"
        class="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentSlide = ref(0)
const showSlideshow = ref(true) // Show by default

const slides = [
  { image: '1_Unlock-Tax-Tele-Consulting-Secrets.png' },
  { image: '2_Craft-an-Irresistible-Intro-Hook-Clients-Fast.png' },
  { image: '3_Become-a-Tax-Expert-Know-Your-Stuff-Cold.png' },
  { image: '4_Master-Communication-Build-Trust-Not-Walls.png' },
  { image: '5_Listen-Actively-Decode-Client-Needs-Easily.png' },
  { image: '6_Handle-Objections-Turn-No-into-Lets-See.png' },
  { image: '7_Close-with-Confidence-Get-the-Conversion.png' },
  { image: '8_Ready-to-Be-a-Tele-Consulting-Superstar.png' }
]

const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
  }
}

const previousSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const closeSlideshow = () => {
  showSlideshow.value = false
  localStorage.setItem('guideSlideshowSeen', 'true')
}

const openSlideshow = () => {
  showSlideshow.value = true
}

onMounted(() => {
  // Check if user has already seen the guide
  const seen = localStorage.getItem('guideSlideshowSeen')
  if (seen) {
    showSlideshow.value = false
  }
})

defineExpose({
  openSlideshow,
  closeSlideshow
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
