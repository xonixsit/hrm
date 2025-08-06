<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
          Animation & Micro-interactions Demo
        </h1>
        <p class="text-lg text-gray-600 animate-slide-up">
          Showcasing modern UI animations and smooth interactions
        </p>
      </div>

      <!-- Button Animations Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Button Animations & Ripple Effects</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md hover-lift">
            <h3 class="text-lg font-medium mb-4">Primary Buttons</h3>
            <div class="space-y-3">
              <BaseButton variant="primary" size="sm">Small Button</BaseButton>
              <BaseButton variant="primary" size="md">Medium Button</BaseButton>
              <BaseButton variant="primary" size="lg">Large Button</BaseButton>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md hover-lift">
            <h3 class="text-lg font-medium mb-4">Secondary Buttons</h3>
            <div class="space-y-3">
              <BaseButton variant="secondary" size="sm">Small Button</BaseButton>
              <BaseButton variant="secondary" size="md">Medium Button</BaseButton>
              <BaseButton variant="secondary" size="lg">Large Button</BaseButton>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md hover-lift">
            <h3 class="text-lg font-medium mb-4">Loading States</h3>
            <div class="space-y-3">
              <BaseButton variant="primary" :loading="true">Loading...</BaseButton>
              <BaseButton variant="secondary" :loading="true">Processing...</BaseButton>
              <BaseButton variant="ghost" :loading="true">Saving...</BaseButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Page Transitions Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Page Transitions</h2>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex flex-wrap gap-4 mb-6">
            <BaseButton 
              v-for="transition in transitions" 
              :key="transition.name"
              variant="secondary"
              @click="currentTransition = transition.name"
              :class="{ 'bg-blue-100 border-blue-300': currentTransition === transition.name }"
            >
              {{ transition.label }}
            </BaseButton>
          </div>
          
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[200px]">
            <PageTransition :name="currentTransition" :key="transitionKey">
              <div class="text-center">
                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4"></div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ currentTransition }} Transition</h3>
                <p class="text-gray-600">This content animates with the {{ currentTransition }} transition effect.</p>
              </div>
            </PageTransition>
          </div>
        </div>
      </section>

      <!-- Modal Transitions Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Modal Transitions</h2>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <BaseButton variant="primary" @click="showModal = true">
            Open Modal
          </BaseButton>
          
          <ModalTransition :show="showModal" @close="showModal = false">
            <div class="bg-white p-6 rounded-lg max-w-md mx-auto">
              <h3 class="text-xl font-semibold mb-4">Modal with Smooth Animation</h3>
              <p class="text-gray-600 mb-6">
                This modal appears with a smooth scale and fade animation, 
                with backdrop blur effect for modern aesthetics.
              </p>
              <div class="flex justify-end space-x-3">
                <BaseButton variant="secondary" @click="showModal = false">
                  Cancel
                </BaseButton>
                <BaseButton variant="primary" @click="showModal = false">
                  Confirm
                </BaseButton>
              </div>
            </div>
          </ModalTransition>
        </div>
      </section>

      <!-- Dropdown Transitions Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Dropdown Transitions</h2>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="relative">
              <BaseButton 
                variant="secondary" 
                @click="showDropdown1 = !showDropdown1"
                class="w-full"
              >
                Bottom Left Dropdown
              </BaseButton>
              <DropdownTransition 
                :show="showDropdown1" 
                position="bottom-left"
                class="absolute top-full left-0 mt-2 z-10"
              >
                <div class="p-4 min-w-48">
                  <div class="space-y-2">
                    <a href="#" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Option 1</a>
                    <a href="#" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Option 2</a>
                    <a href="#" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Option 3</a>
                  </div>
                </div>
              </DropdownTransition>
            </div>
            
            <div class="relative">
              <BaseButton 
                variant="secondary" 
                @click="showDropdown2 = !showDropdown2"
                class="w-full"
              >
                Bottom Right Dropdown
              </BaseButton>
              <DropdownTransition 
                :show="showDropdown2" 
                position="bottom-right"
                class="absolute top-full right-0 mt-2 z-10"
              >
                <div class="p-4 min-w-48">
                  <div class="space-y-2">
                    <a href="#" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Action 1</a>
                    <a href="#" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Action 2</a>
                    <a href="#" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Action 3</a>
                  </div>
                </div>
              </DropdownTransition>
            </div>
          </div>
        </div>
      </section>

      <!-- Scroll Animations Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Scroll Reveal Animations</h2>
        <div class="space-y-8">
          <ScrollReveal animation="fade-up" :delay="0">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold mb-2">Fade Up Animation</h3>
              <p class="text-gray-600">This content fades in and slides up when it comes into view.</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-left" :delay="100">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold mb-2">Fade Left Animation</h3>
              <p class="text-gray-600">This content fades in from the right when scrolled into view.</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal animation="scale" :delay="200">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold mb-2">Scale Animation</h3>
              <p class="text-gray-600">This content scales up with a fade effect when revealed.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <!-- Stagger Animations Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Stagger Animations</h2>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold">Animated List Items</h3>
            <BaseButton variant="secondary" @click="triggerStagger">
              Replay Animation
            </BaseButton>
          </div>
          
          <StaggerContainer 
            ref="staggerContainer"
            animation="fade-up" 
            :delay="100"
            :auto-play="false"
          >
            <div 
              v-for="(item, index) in staggerItems" 
              :key="index"
              class="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-4"></div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ item.title }}</h4>
                  <p class="text-sm text-gray-600">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </StaggerContainer>
        </div>
      </section>

      <!-- Smooth Scroll Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Smooth Scroll</h2>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex flex-wrap gap-4 mb-6">
            <SmoothScroll target="#scroll-target-1" class="btn-base btn-md btn-secondary">
              Scroll to Section 1
            </SmoothScroll>
            <SmoothScroll target="#scroll-target-2" class="btn-base btn-md btn-secondary">
              Scroll to Section 2
            </SmoothScroll>
            <SmoothScroll target="#scroll-target-3" class="btn-base btn-md btn-secondary">
              Scroll to Section 3
            </SmoothScroll>
          </div>
          
          <div class="space-y-8">
            <div id="scroll-target-1" class="bg-blue-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold mb-2">Section 1</h3>
              <p class="text-gray-600">This is the first scroll target section with smooth scrolling animation.</p>
            </div>
            
            <div id="scroll-target-2" class="bg-green-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold mb-2">Section 2</h3>
              <p class="text-gray-600">This is the second scroll target section with eased animation.</p>
            </div>
            
            <div id="scroll-target-3" class="bg-purple-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold mb-2">Section 3</h3>
              <p class="text-gray-600">This is the third scroll target section with customizable timing.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Parallax Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Parallax Effects</h2>
        <div class="bg-white p-6 rounded-lg shadow-md overflow-hidden" style="height: 400px;">
          <ParallaxContainer :speed="0.3" class="h-full">
            <div class="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-lg flex items-center justify-center">
              <div class="text-center text-white">
                <h3 class="text-2xl font-bold mb-2">Parallax Background</h3>
                <p class="text-lg opacity-90">This background moves slower than the scroll</p>
              </div>
            </div>
          </ParallaxContainer>
        </div>
      </section>

      <!-- Performance Info -->
      <section class="mb-16">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Performance Features</h2>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold mb-3">Accessibility</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Respects prefers-reduced-motion</li>
                <li>• Keyboard navigation support</li>
                <li>• Screen reader compatible</li>
                <li>• Focus management</li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-3">Performance</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• 60fps optimized animations</li>
                <li>• Hardware acceleration</li>
                <li>• Intersection Observer API</li>
                <li>• Memory leak prevention</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import BaseButton from '@/Components/Base/BaseButton.vue';
import PageTransition from '@/Components/Transitions/PageTransition.vue';
import ModalTransition from '@/Components/Transitions/ModalTransition.vue';
import DropdownTransition from '@/Components/Transitions/DropdownTransition.vue';
import ScrollReveal from '@/Components/Animations/ScrollReveal.vue';
import StaggerContainer from '@/Components/Animations/StaggerContainer.vue';
import ParallaxContainer from '@/Components/Animations/ParallaxContainer.vue';
import SmoothScroll from '@/Components/Animations/SmoothScroll.vue';

// Reactive state
const showModal = ref(false);
const showDropdown1 = ref(false);
const showDropdown2 = ref(false);
const currentTransition = ref('fade');
const transitionKey = ref(0);
const staggerContainer = ref(null);

// Data
const transitions = [
  { name: 'fade', label: 'Fade' },
  { name: 'slide-left', label: 'Slide Left' },
  { name: 'slide-right', label: 'Slide Right' },
  { name: 'slide-up', label: 'Slide Up' },
  { name: 'scale', label: 'Scale' }
];

const staggerItems = [
  { title: 'First Item', description: 'This item animates first' },
  { title: 'Second Item', description: 'This item follows with a delay' },
  { title: 'Third Item', description: 'This item comes next in sequence' },
  { title: 'Fourth Item', description: 'This item completes the stagger' },
  { title: 'Fifth Item', description: 'Final item in the animated sequence' }
];

// Methods
const triggerStagger = () => {
  if (staggerContainer.value) {
    staggerContainer.value.animate();
  }
};

// Watch for transition changes to trigger re-render
const changeTransition = () => {
  transitionKey.value++;
};

// Auto-trigger stagger animation on mount
nextTick(() => {
  if (staggerContainer.value) {
    setTimeout(() => {
      staggerContainer.value.animate();
    }, 1000);
  }
});
</script>

<style scoped>
/* Additional demo-specific styles */
.demo-section {
  scroll-margin-top: 2rem;
}

/* Close dropdowns when clicking outside */
@media (max-width: 768px) {
  .relative {
    position: static;
  }
  
  .absolute {
    position: fixed;
    top: auto !important;
    left: 1rem !important;
    right: 1rem !important;
    width: auto !important;
  }
}
</style>