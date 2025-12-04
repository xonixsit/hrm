<template>
  <div class="space-y-8">
    <!-- Basic Header -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Basic Page Header</h2>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your projects."
      />
    </section>

    <!-- Header with Breadcrumbs -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Header with Breadcrumbs</h2>
      <PageHeader
        title="User Profile"
        subtitle="Manage your account settings and preferences"
        :breadcrumbs="breadcrumbs"
      />
    </section>

    <!-- Header with Actions -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Header with Actions</h2>
      <PageHeader
        title="Projects"
        subtitle="Manage and track your active projects"
        :actions="actions"
        @action="handleAction"
      />
    </section>

    <!-- Header with Tabs -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Header with Tabs</h2>
      <PageHeader
        title="Settings"
        subtitle="Configure your application preferences"
        :tabs="tabs"
        :active-tab="activeTab"
        @tab-change="handleTabChange"
      />
    </section>

    <!-- Complete Header -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Complete Header (All Features)</h2>
      <PageHeader
        title="Project Management"
        subtitle="Comprehensive project tracking and team collaboration"
        :breadcrumbs="breadcrumbs"
        :actions="actions"
        :tabs="tabs"
        :active-tab="activeTab"
        sticky
        @action="handleAction"
        @tab-change="handleTabChange"
      />
    </section>

    <!-- Responsive Demo -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Responsive Header (Many Actions)</h2>
      <PageHeader
        title="Data Management"
        subtitle="Import, export, and manage your data efficiently"
        :actions="manyActions"
        :max-visible-actions="2"
        @action="handleAction"
      />
    </section>

    <!-- Custom Styling -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Custom Styled Header</h2>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Real-time insights and performance metrics"
        background="neutral"
        :border="false"
        class="rounded-lg"
      />
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PageHeader from '@/Components/Layout/PageHeader.vue';

// Demo data
const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Users', href: '/users' },
  { label: 'Profile', current: true }
];

const actions = [
  {
    id: 'create',
    label: 'Create New',
    variant: 'primary',
    handler: () => //console.log('Create clicked')
  },
  {
    id: 'export',
    label: 'Export',
    variant: 'secondary',
    handler: () => //console.log('Export clicked')
  },
  {
    id: 'settings',
    label: 'Settings',
    variant: 'ghost',
    handler: () => //console.log('Settings clicked')
  }
];

const manyActions = [
  { id: 'action1', label: 'Import', variant: 'primary' },
  { id: 'action2', label: 'Export', variant: 'secondary' },
  { id: 'action3', label: 'Sync', variant: 'secondary' },
  { id: 'action4', label: 'Archive', variant: 'ghost' },
  { id: 'action5', label: 'Delete', variant: 'danger' },
  { id: 'action6', label: 'Settings', variant: 'ghost' }
];

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'settings', label: 'Settings' },
  { id: 'history', label: 'History' }
];

const activeTab = ref('overview');

// Event handlers
const handleAction = (action) => {
  //console.log('Action clicked:', action);
  if (action.handler) {
    action.handler();
  }
};

const handleTabChange = (tab) => {
  //console.log('Tab changed:', tab);
  activeTab.value = tab.id;
};
</script>
</template>