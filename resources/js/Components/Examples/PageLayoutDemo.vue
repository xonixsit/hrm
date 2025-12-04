<template>
  <div class="page-layout-demo">
    <h1 class="text-2xl font-bold mb-6">PageLayout Component Demo</h1>
    
    <!-- Basic Layout Example -->
    <div class="demo-section">
      <h2 class="text-xl font-semibold mb-4">Basic Layout</h2>
      <div class="demo-container">
        <PageLayout
          title="Dashboard"
          subtitle="Welcome to your dashboard"
          :breadcrumbs="basicBreadcrumbs"
          :actions="basicActions"
          class="h-96"
        >
          <div class="p-6">
            <p>This is the main content area of the page layout.</p>
            <p>It automatically handles responsive behavior and accessibility.</p>
          </div>
        </PageLayout>
      </div>
    </div>
    
    <!-- Layout with Sidebar -->
    <div class="demo-section">
      <h2 class="text-xl font-semibold mb-4">Layout with Sidebar</h2>
      <div class="demo-container">
        <PageLayout
          title="Projects"
          subtitle="Manage your projects"
          :breadcrumbs="projectBreadcrumbs"
          :actions="projectActions"
          :tabs="projectTabs"
          :has-sidebar="true"
          :sidebar-items="sidebarItems"
          class="h-96"
        >
          <div class="p-6">
            <h3 class="text-lg font-medium mb-4">Project List</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="card-base card-md">
                <h4 class="font-medium">Project Alpha</h4>
                <p class="text-sm text-neutral-600">In Progress</p>
              </div>
              <div class="card-base card-md">
                <h4 class="font-medium">Project Beta</h4>
                <p class="text-sm text-neutral-600">Planning</p>
              </div>
            </div>
          </div>
        </PageLayout>
      </div>
    </div>
    
    <!-- Loading State -->
    <div class="demo-section">
      <h2 class="text-xl font-semibold mb-4">Loading State</h2>
      <div class="demo-container">
        <PageLayout
          title="Loading Example"
          :loading="true"
          loading-text="Loading your data..."
          class="h-64"
        />
      </div>
    </div>
    
    <!-- Error State -->
    <div class="demo-section">
      <h2 class="text-xl font-semibold mb-4">Error State</h2>
      <div class="demo-container">
        <PageLayout
          title="Error Example"
          :error="errorExample"
          class="h-64"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

// Demo data
const basicBreadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', current: true }
];

const basicActions = [
  {
    id: 'new',
    label: 'New Item',
    variant: 'primary',
    handler: () => alert('New item clicked!')
  },
  {
    id: 'settings',
    label: 'Settings',
    variant: 'secondary',
    handler: () => alert('Settings clicked!')
  }
];

const projectBreadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Projects', current: true }
];

const projectActions = [
  {
    id: 'new-project',
    label: 'New Project',
    variant: 'primary',
    handler: () => alert('New project clicked!')
  }
];

const projectTabs = [
  { id: 'all', label: 'All Projects', active: true },
  { id: 'active', label: 'Active', badge: '5' },
  { id: 'completed', label: 'Completed', badge: '12' }
];

const sidebarItems = [
  {
    id: 'overview',
    label: 'Overview',
    active: true,
    onClick: () => //console.log('Overview clicked')
  },
  {
    id: 'projects',
    label: 'Projects',
    badge: { text: '17', variant: 'primary' },
    onClick: () => //console.log('Projects clicked')
  },
  {
    id: 'team',
    label: 'Team',
    onClick: () => //console.log('Team clicked')
  },
  {
    id: 'settings',
    label: 'Settings',
    onClick: () => //console.log('Settings clicked')
  }
];

const errorExample = {
  title: 'Failed to Load Data',
  message: 'There was an error loading your projects. Please try again.',
  actions: [
    {
      label: 'Retry',
      variant: 'primary',
      handler: () => alert('Retry clicked!')
    },
    {
      label: 'Go Back',
      variant: 'secondary',
      handler: () => alert('Go back clicked!')
    }
  ]
};
</script>

<style scoped>
.page-layout-demo {
  @apply p-6 space-y-8;
}

.demo-section {
  @apply space-y-4;
}

.demo-container {
  @apply border border-neutral-200 rounded-lg overflow-hidden;
}
</style>
</script>