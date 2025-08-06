<template>
  <div class="min-h-screen bg-neutral-50">
    <div class="p-8">
      <h1 class="text-2xl font-bold text-neutral-900 mb-6">Sidebar Navigation Demo</h1>
      
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Responsive Collapse/Expand Features</h2>
        <div class="space-y-2 text-sm text-neutral-600">
          <p>✅ Sidebar width changes from 256px (w-64) to 64px (w-16) when collapsed</p>
          <p>✅ Smooth animations with 300ms duration and ease-in-out timing</p>
          <p>✅ State persistence using localStorage and user preferences</p>
          <p>✅ Tooltip support for collapsed state navigation items</p>
          <p>✅ Responsive behavior - auto-collapse on screens smaller than 1024px</p>
          <p>✅ Mobile-friendly navigation patterns</p>
          <p>✅ Keyboard shortcut support (Ctrl+B to toggle)</p>
          <p>✅ Proper ARIA attributes and accessibility features</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-lg font-semibold mb-4">Test Instructions</h2>
        <div class="space-y-3 text-sm text-neutral-600">
          <div class="flex items-start space-x-2">
            <span class="font-medium text-primary-600">1.</span>
            <span>Click the collapse button (chevron icon) in the sidebar header to toggle between expanded and collapsed states</span>
          </div>
          <div class="flex items-start space-x-2">
            <span class="font-medium text-primary-600">2.</span>
            <span>Use keyboard shortcut Ctrl+B to toggle the sidebar</span>
          </div>
          <div class="flex items-start space-x-2">
            <span class="font-medium text-primary-600">3.</span>
            <span>Hover over navigation items in collapsed state to see tooltips</span>
          </div>
          <div class="flex items-start space-x-2">
            <span class="font-medium text-primary-600">4.</span>
            <span>Resize your browser window below 1024px to see responsive auto-collapse</span>
          </div>
          <div class="flex items-start space-x-2">
            <span class="font-medium text-primary-600">5.</span>
            <span>Refresh the page to verify state persistence</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Head } from '@inertiajs/vue3';

// This page is just for demonstration purposes
// The actual sidebar functionality is implemented in the SidebarNavigation component
// and integrated into the AuthenticatedLayout
</script>