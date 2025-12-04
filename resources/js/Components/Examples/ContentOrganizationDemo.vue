<template>
  <div class="space-y-8 p-6">
    <h1 class="text-3xl font-bold text-neutral-900">Content Organization Components Demo</h1>
    
    <!-- ContentSection Examples -->
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold">ContentSection Component</h2>
      
      <!-- Basic Section -->
      <ContentSection
        title="Basic Section"
        description="This is a basic content section with title and description"
      >
        <p class="text-neutral-600">
          This is the main content of the section. It can contain any type of content
          including text, forms, tables, or other components.
        </p>
      </ContentSection>
      
      <!-- Card Variant Section -->
      <ContentSection
        title="Card Section"
        description="This section uses the card variant for better visual separation"
        variant="card"
        :header-actions="sectionActions"
        @header-action="handleSectionAction"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-neutral-50 rounded-lg">
            <h4 class="font-medium mb-2">Feature 1</h4>
            <p class="text-sm text-neutral-600">Description of feature 1</p>
          </div>
          <div class="p-4 bg-neutral-50 rounded-lg">
            <h4 class="font-medium mb-2">Feature 2</h4>
            <p class="text-sm text-neutral-600">Description of feature 2</p>
          </div>
        </div>
      </ContentSection>
      
      <!-- Elevated Section with Footer -->
      <ContentSection
        title="Elevated Section"
        variant="elevated"
        size="lg"
        spacing="loose"
      >
        <p class="text-neutral-600 mb-4">
          This is an elevated section with loose spacing and a footer.
        </p>
        <div class="bg-teal-50 p-4 rounded-lg">
          <p class="text-teal-800">This is a highlighted content area within the section.</p>
        </div>
        
        <template #footer>
          <div class="flex justify-between items-center">
            <span class="text-sm text-neutral-500">Last updated: 2 hours ago</span>
            <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View Details
            </button>
          </div>
        </template>
      </ContentSection>
    </div>
    
    <!-- ContentCard Examples -->
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold">ContentCard Component</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Basic Card -->
        <ContentCard
          title="Basic Card"
          subtitle="Simple card with title and subtitle"
        >
          <p class="text-neutral-600">
            This is a basic card component with standard styling and content.
          </p>
        </ContentCard>
        
        <!-- Card with Actions -->
        <ContentCard
          title="Interactive Card"
          subtitle="Card with action buttons"
          :actions="cardActions"
          @action="handleCardAction"
        >
          <p class="text-neutral-600 mb-4">
            This card includes action buttons in the header.
          </p>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span class="text-sm text-neutral-600">Active</span>
          </div>
        </ContentCard>
        
        <!-- Clickable Card -->
        <ContentCard
          title="Clickable Card"
          subtitle="Click anywhere on this card"
          variant="outlined"
          :clickable="true"
          @click="handleCardClick"
        >
          <p class="text-neutral-600">
            This entire card is clickable and will respond to click events.
          </p>
        </ContentCard>
        
        <!-- Card with Media -->
        <ContentCard
          title="Media Card"
          subtitle="Card with media content"
          variant="elevated"
        >
          <template #media>
            <div class="h-32 bg-gradient-to-r from-teal-400 to-purple-500 flex items-center justify-center">
              <span class="text-white font-medium">Media Content</span>
            </div>
          </template>
          
          <p class="text-neutral-600">
            This card includes a media section above the content.
          </p>
        </ContentCard>
        
        <!-- Card with Footer -->
        <ContentCard
          title="Card with Footer"
          subtitle="Includes footer section"
          size="sm"
        >
          <p class="text-neutral-600">
            This card demonstrates the footer slot functionality.
          </p>
          
          <template #footer>
            <div class="flex justify-between items-center text-sm">
              <span class="text-neutral-500">Created: Jan 15, 2024</span>
              <span class="text-green-600 font-medium">Published</span>
            </div>
          </template>
        </ContentCard>
        
        <!-- Large Card -->
        <ContentCard
          title="Large Card"
          subtitle="Demonstrates large size variant"
          size="lg"
          variant="flat"
        >
          <div class="space-y-4">
            <p class="text-neutral-600">
              This is a large card with more spacious padding and typography.
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-primary-600">42</div>
                <div class="text-sm text-neutral-500">Metric 1</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-success-600">98%</div>
                <div class="text-sm text-neutral-500">Metric 2</div>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
    
    <!-- Combined Layout Example -->
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold">Combined Layout Example</h2>
      
      <ContentSection
        title="Dashboard Overview"
        description="A comprehensive view of your system metrics and recent activity"
        variant="card"
        :header-actions="[
          { id: 'refresh', label: 'Refresh', variant: 'secondary' },
          { id: 'export', label: 'Export', variant: 'primary' }
        ]"
        @header-action="handleSectionAction"
      >
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Stats Cards -->
          <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ContentCard
              title="Total Users"
              size="sm"
              variant="outlined"
            >
              <div class="text-3xl font-bold text-primary-600">1,234</div>
              <div class="text-sm text-green-600 mt-1">↗ +12% from last month</div>
            </ContentCard>
            
            <ContentCard
              title="Revenue"
              size="sm"
              variant="outlined"
            >
              <div class="text-3xl font-bold text-success-600">$45,678</div>
              <div class="text-sm text-green-600 mt-1">↗ +8% from last month</div>
            </ContentCard>
            
            <ContentCard
              title="Active Sessions"
              size="sm"
              variant="outlined"
            >
              <div class="text-3xl font-bold text-warning-600">89</div>
              <div class="text-sm text-neutral-600 mt-1">Currently online</div>
            </ContentCard>
            
            <ContentCard
              title="Conversion Rate"
              size="sm"
              variant="outlined"
            >
              <div class="text-3xl font-bold text-info-600">3.2%</div>
              <div class="text-sm text-red-600 mt-1">↘ -2% from last month</div>
            </ContentCard>
          </div>
          
          <!-- Activity Feed -->
          <ContentCard
            title="Recent Activity"
            subtitle="Latest system events"
            size="sm"
          >
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-neutral-900">New user registered</p>
                  <p class="text-xs text-neutral-500">2 minutes ago</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-neutral-900">Payment processed</p>
                  <p class="text-xs text-neutral-500">5 minutes ago</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-neutral-900">System maintenance</p>
                  <p class="text-xs text-neutral-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </ContentCard>
        </div>
      </ContentSection>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ContentSection from '@/Components/Layout/ContentSection.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';

// Demo data
const sectionActions = [
  { 
    id: 'edit', 
    label: 'Edit', 
    variant: 'secondary',
    handler: () => //console.log('Edit section')
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    variant: 'ghost',
    handler: () => //console.log('Section settings')
  }
];

const cardActions = [
  { 
    id: 'view', 
    label: 'View', 
    variant: 'primary',
    size: 'sm'
  },
  { 
    id: 'edit', 
    label: 'Edit', 
    variant: 'secondary',
    size: 'sm'
  },
  { 
    id: 'delete', 
    label: 'Delete', 
    variant: 'danger',
    size: 'sm'
  }
];

// Event handlers
const handleSectionAction = (action) => {
  //console.log('Section action:', action);
  if (action.handler) {
    action.handler();
  }
};

const handleCardAction = (action) => {
  //console.log('Card action:', action);
};

const handleCardClick = (event) => {
  //console.log('Card clicked:', event);
  alert('Card was clicked!');
};
</script>

<style scoped>
/* Demo specific styles */
.space-y-8 > * + * {
  margin-top: 2rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}
</style>