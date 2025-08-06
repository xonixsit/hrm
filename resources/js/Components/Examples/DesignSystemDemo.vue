<template>
  <div class="container-lg space-y-section">
    <!-- Typography Examples -->
    <section class="card-base card-lg">
      <h2 class="text-h2 mb-6">Typography System</h2>
      <div class="space-y-content">
        <div class="text-display">Display Text</div>
        <div class="text-h1">Heading 1</div>
        <div class="text-h2">Heading 2</div>
        <div class="text-h3">Heading 3</div>
        <div class="text-h4">Heading 4</div>
        <div class="text-body-lg">Large body text for important content</div>
        <div class="text-body">Regular body text for general content</div>
        <div class="text-body-sm">Small body text for secondary information</div>
        <div class="text-caption">Caption text for labels and metadata</div>
      </div>
    </section>

    <!-- Color System Examples -->
    <section class="card-base card-lg">
      <h2 class="text-h2 mb-6">Color System</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <div class="h-16 bg-primary-500 rounded-lg"></div>
          <div class="text-body-sm text-center">Primary</div>
        </div>
        <div class="space-y-2">
          <div class="h-16 bg-secondary-500 rounded-lg"></div>
          <div class="text-body-sm text-center">Secondary</div>
        </div>
        <div class="space-y-2">
          <div class="h-16 bg-accent-500 rounded-lg"></div>
          <div class="text-body-sm text-center">Accent</div>
        </div>
        <div class="space-y-2">
          <div class="h-16 bg-neutral-500 rounded-lg"></div>
          <div class="text-body-sm text-center">Neutral</div>
        </div>
      </div>
    </section>

    <!-- Button Examples -->
    <section class="card-base card-lg">
      <h2 class="text-h2 mb-6">Button System</h2>
      <div class="space-y-4">
        <div class="flex flex-wrap gap-4">
          <button class="btn-base btn-md btn-primary">
            <Icon name="plus" size="sm" class="mr-2" />
            Primary Button
          </button>
          <button class="btn-base btn-md btn-secondary">
            <Icon name="edit" size="sm" class="mr-2" />
            Secondary Button
          </button>
          <button class="btn-base btn-md btn-ghost">
            <Icon name="view" size="sm" class="mr-2" />
            Ghost Button
          </button>
        </div>
        
        <div class="flex flex-wrap gap-4">
          <button class="btn-base btn-sm btn-primary">Small</button>
          <button class="btn-base btn-md btn-primary">Medium</button>
          <button class="btn-base btn-lg btn-primary">Large</button>
          <button class="btn-base btn-xl btn-primary">Extra Large</button>
        </div>
      </div>
    </section>

    <!-- Icon Examples -->
    <section class="card-base card-lg">
      <h2 class="text-h2 mb-6">Icon System</h2>
      <div class="space-y-4">
        <div class="flex flex-wrap gap-4 items-center">
          <Icon name="home" size="sm" />
          <Icon name="users" size="md" />
          <Icon name="settings" size="lg" />
          <Icon name="bell" size="xl" />
          <Icon name="heart" size="2xl" color="error" />
        </div>
        
        <div class="flex flex-wrap gap-4 items-center">
          <Icon name="check-circle" color="success" />
          <Icon name="warning" color="warning" />
          <Icon name="x-circle" color="error" />
          <Icon name="info" color="info" />
        </div>
      </div>
    </section>

    <!-- Form Examples -->
    <section class="card-base card-lg">
      <h2 class="text-h2 mb-6">Form System</h2>
      <div class="space-y-4 max-w-md">
        <div>
          <label class="block text-body-sm font-medium text-neutral-700 mb-2">
            Regular Input
          </label>
          <input type="text" class="input-base input-md" placeholder="Enter text..." />
        </div>
        
        <div>
          <label class="block text-body-sm font-medium text-neutral-700 mb-2">
            Error State
          </label>
          <input type="text" class="input-base input-md input-error" placeholder="Error state..." />
          <p class="text-body-sm text-error-500 mt-1">This field has an error</p>
        </div>
        
        <div>
          <label class="block text-body-sm font-medium text-neutral-700 mb-2">
            Success State
          </label>
          <input type="text" class="input-base input-md input-success" placeholder="Success state..." />
          <p class="text-body-sm text-success-500 mt-1">This field is valid</p>
        </div>
      </div>
    </section>

    <!-- Card Examples -->
    <section class="space-y-4">
      <h2 class="text-h2">Card System</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card-base card-sm">
          <h3 class="text-h4 mb-2">Small Card</h3>
          <p class="text-body-sm text-neutral-600">This is a small card with minimal padding.</p>
        </div>
        
        <div class="card-base card-md card-hover">
          <h3 class="text-h4 mb-2">Medium Card</h3>
          <p class="text-body-sm text-neutral-600">This is a medium card with hover effects.</p>
        </div>
        
        <div class="card-base card-lg">
          <h3 class="text-h4 mb-2">Large Card</h3>
          <p class="text-body-sm text-neutral-600">This is a large card with generous padding.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import Icon from '@/Components/Base/Icon.vue';
</script>