<template>
  <div class="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs font-mono z-50">
    <div class="space-y-1">
      <div>Screen: {{ screenWidth }}px</div>
      <div>Container: {{ containerWidth }}px</div>
      <div>Sidebar: {{ hasSidebar ? 'Present' : 'Removed' }}</div>
      <div>Layout: {{ layoutStatus }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const screenWidth = ref(0)
const containerWidth = ref(0)
const hasSidebar = ref(false)
const layoutStatus = ref('Checking...')

const updateDiagnostics = () => {
  screenWidth.value = window.innerWidth
  
  // Check for main container
  const container = document.querySelector('.max-w-7xl')
  if (container) {
    containerWidth.value = container.offsetWidth
  }
  
  // Check for sidebar
  const sidebar = document.querySelector('[class*="sidebar"]')
  hasSidebar.value = !!sidebar
  
  // Determine layout status
  if (!hasSidebar.value && container) {
    layoutStatus.value = '✅ Fixed'
  } else if (hasSidebar.value) {
    layoutStatus.value = '❌ Sidebar Found'
  } else {
    layoutStatus.value = '⚠️ No Container'
  }
}

onMounted(() => {
  updateDiagnostics()
  window.addEventListener('resize', updateDiagnostics)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDiagnostics)
})
</script>