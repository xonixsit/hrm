<template>
  <div class="user-preferences">
    <!-- Preferences Modal -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="preferences-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="closePreferences"
      ></div>
      
      <!-- Modal Content -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div
          class="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl transform transition-all"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-neutral-200">
            <div>
              <h2 id="preferences-title" class="text-2xl font-bold text-neutral-900">
                User Preferences
              </h2>
              <p class="text-sm text-neutral-600 mt-1">
                Customize your interface and accessibility settings
              </p>
            </div>
            
            <div class="flex items-center space-x-2">
              <!-- Reset Button -->
              <button
                @click="handleResetPreferences"
                class="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                :disabled="isDefaultPreferences"
              >
                Reset All
              </button>
              
              <!-- Close Button -->
              <button
                @click="closePreferences"
                class="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Close preferences"
              >
                <Icon name="x" size="md" />
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex">
            <!-- Sidebar Navigation -->
            <div class="w-64 bg-neutral-50 border-r border-neutral-200">
              <nav class="p-4 space-y-1">
                <button
                  v-for="section in preferenceSections"
                  :key="section.id"
                  @click="activeSection = section.id"
                  :class="[
                    'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left',
                    activeSection === section.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  ]"
                >
                  <Icon :name="section.icon" size="sm" class="mr-3" />
                  {{ section.label }}
                </button>
              </nav>
            </div>
            
            <!-- Main Content -->
            <div class="flex-1 p-6 max-h-96 overflow-y-auto">
              <!-- Theme & Appearance -->
              <div v-if="activeSection === 'appearance'" class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-neutral-900 mb-4">Theme & Appearance</h3>
                  
                  <!-- Theme Selection -->
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">
                        Color Theme
                      </label>
                      <div class="grid grid-cols-3 gap-3">
                        <button
                          v-for="theme in themeOptions"
                          :key="theme.value"
                          @click="setPreference('theme', theme.value)"
                          :class="[
                            'flex flex-col items-center p-4 border-2 rounded-lg transition-all',
                            preferences.theme === theme.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-neutral-200 hover:border-neutral-300'
                          ]"
                        >
                          <Icon :name="theme.icon" size="lg" class="mb-2" />
                          <span class="text-sm font-medium">{{ theme.label }}</span>
                        </button>
                      </div>
                    </div>
                    
                    <!-- System Theme Toggle -->
                    <div class="flex items-center justify-between">
                      <div>
                        <label class="text-sm font-medium text-neutral-700">
                          Use System Theme
                        </label>
                        <p class="text-xs text-neutral-500">
                          Automatically switch between light and dark themes based on your system settings
                        </p>
                      </div>
                      <ToggleSwitch
                        :checked="preferences.useSystemTheme"
                        @change="setPreference('useSystemTheme', $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Layout & Navigation -->
              <div v-if="activeSection === 'layout'" class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-neutral-900 mb-4">Layout & Navigation</h3>
                  
                  <!-- Sidebar Settings -->
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <label class="text-sm font-medium text-neutral-700">
                          Collapse Sidebar
                        </label>
                        <p class="text-xs text-neutral-500">
                          Start with the sidebar collapsed to save screen space
                        </p>
                      </div>
                      <ToggleSwitch
                        :checked="preferences.sidebarCollapsed"
                        @change="setPreference('sidebarCollapsed', $event)"
                      />
                    </div>
                    
                    <!-- Sidebar Width -->
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">
                        Sidebar Width
                      </label>
                      <select
                        :value="preferences.sidebarWidth"
                        @change="setPreference('sidebarWidth', $event.target.value)"
                        class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="narrow">Narrow</option>
                        <option value="normal">Normal</option>
                        <option value="wide">Wide</option>
                      </select>
                    </div>
                    
                    <!-- Default View -->
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">
                        Default Data View
                      </label>
                      <div class="grid grid-cols-3 gap-3">
                        <button
                          v-for="view in viewOptions"
                          :key="view.value"
                          @click="setPreference('defaultView', view.value)"
                          :class="[
                            'flex flex-col items-center p-3 border-2 rounded-lg transition-all',
                            preferences.defaultView === view.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-neutral-200 hover:border-neutral-300'
                          ]"
                        >
                          <Icon :name="view.icon" size="md" class="mb-1" />
                          <span class="text-xs font-medium">{{ view.label }}</span>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Items Per Page -->
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">
                        Items Per Page
                      </label>
                      <select
                        :value="preferences.itemsPerPage"
                        @change="setPreference('itemsPerPage', parseInt($event.target.value))"
                        class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option :value="10">10 items</option>
                        <option :value="25">25 items</option>
                        <option :value="50">50 items</option>
                        <option :value="100">100 items</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Accessibility -->
              <div v-if="activeSection === 'accessibility'" class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-neutral-900 mb-4">Accessibility</h3>
                  
                  <!-- Font Settings -->
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">
                        Font Size
                      </label>
                      <div class="grid grid-cols-4 gap-2">
                        <button
                          v-for="size in fontSizeOptions"
                          :key="size.value"
                          @click="setPreference('fontSize', size.value)"
                          :class="[
                            'px-3 py-2 text-center border-2 rounded-lg transition-all',
                            preferences.fontSize === size.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-neutral-200 hover:border-neutral-300'
                          ]"
                          :style="{ fontSize: size.preview }"
                        >
                          {{ size.label }}
                        </button>
                      </div>
                    </div>
                    
                    <!-- Font Weight -->
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">
                        Font Weight
                      </label>
                      <div class="grid grid-cols-4 gap-2">
                        <button
                          v-for="weight in fontWeightOptions"
                          :key="weight.value"
                          @click="setPreference('fontWeight', weight.value)"
                          :class="[
                            'px-3 py-2 text-center border-2 rounded-lg transition-all',
                            preferences.fontWeight === weight.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-neutral-200 hover:border-neutral-300'
                          ]"
                          :style="{ fontWeight: weight.preview }"
                        >
                          {{ weight.label }}
                        </button>
                      </div>
                    </div>
                    
                    <!-- Line Height -->
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">
                        Line Height
                      </label>
                      <div class="grid grid-cols-4 gap-2">
                        <button
                          v-for="height in lineHeightOptions"
                          :key="height.value"
                          @click="setPreference('lineHeight', height.value)"
                          :class="[
                            'px-3 py-2 text-center border-2 rounded-lg transition-all',
                            preferences.lineHeight === height.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-neutral-200 hover:border-neutral-300'
                          ]"
                        >
                          {{ height.label }}
                        </button>
                      </div>
                    </div>
                    
                    <!-- Density -->
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">
                        Interface Density
                      </label>
                      <div class="grid grid-cols-3 gap-2">
                        <button
                          v-for="density in densityOptions"
                          :key="density.value"
                          @click="setPreference('density', density.value)"
                          :class="[
                            'px-3 py-2 text-center border-2 rounded-lg transition-all',
                            preferences.density === density.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-neutral-200 hover:border-neutral-300'
                          ]"
                        >
                          {{ density.label }}
                        </button>
                      </div>
                    </div>
                    
                    <!-- Accessibility Toggles -->
                    <div class="space-y-3">
                      <div class="flex items-center justify-between">
                        <div>
                          <label class="text-sm font-medium text-neutral-700">
                            Reduce Motion
                          </label>
                          <p class="text-xs text-neutral-500">
                            Minimize animations and transitions
                          </p>
                        </div>
                        <ToggleSwitch
                          :checked="preferences.reducedMotion"
                          @change="setPreference('reducedMotion', $event)"
                        />
                      </div>
                      
                      <div class="flex items-center justify-between">
                        <div>
                          <label class="text-sm font-medium text-neutral-700">
                            High Contrast
                          </label>
                          <p class="text-xs text-neutral-500">
                            Increase contrast for better visibility
                          </p>
                        </div>
                        <ToggleSwitch
                          :checked="preferences.highContrast"
                          @change="setPreference('highContrast', $event)"
                        />
                      </div>
                    </div>
                    
                    <!-- Color Scheme for Visual Needs -->
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">
                        Color Vision Support
                      </label>
                      <select
                        :value="preferences.colorScheme"
                        @change="setPreference('colorScheme', $event.target.value)"
                        class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="default">Default Colors</option>
                        <option value="protanopia">Protanopia (Red-blind)</option>
                        <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                        <option value="tritanopia">Tritanopia (Blue-blind)</option>
                        <option value="monochrome">Monochrome</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Notifications -->
              <div v-if="activeSection === 'notifications'" class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-neutral-900 mb-4">Notifications</h3>
                  
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <label class="text-sm font-medium text-neutral-700">
                          Sound Notifications
                        </label>
                        <p class="text-xs text-neutral-500">
                          Play sounds for notifications and alerts
                        </p>
                      </div>
                      <ToggleSwitch
                        :checked="preferences.soundEnabled"
                        @change="setPreference('soundEnabled', $event)"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div>
                        <label class="text-sm font-medium text-neutral-700">
                          Desktop Notifications
                        </label>
                        <p class="text-xs text-neutral-500">
                          Show browser notifications for important updates
                        </p>
                      </div>
                      <ToggleSwitch
                        :checked="preferences.desktopNotifications"
                        @change="setPreference('desktopNotifications', $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Advanced -->
              <div v-if="activeSection === 'advanced'" class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-neutral-900 mb-4">Advanced Settings</h3>
                  
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <label class="text-sm font-medium text-neutral-700">
                          Auto-save Forms
                        </label>
                        <p class="text-xs text-neutral-500">
                          Automatically save form data as you type
                        </p>
                      </div>
                      <ToggleSwitch
                        :checked="preferences.autoSave"
                        @change="setPreference('autoSave', $event)"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div>
                        <label class="text-sm font-medium text-neutral-700">
                          Confirm Before Leaving
                        </label>
                        <p class="text-xs text-neutral-500">
                          Show confirmation when leaving pages with unsaved changes
                        </p>
                      </div>
                      <ToggleSwitch
                        :checked="preferences.confirmBeforeLeaving"
                        @change="setPreference('confirmBeforeLeaving', $event)"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div>
                        <label class="text-sm font-medium text-neutral-700">
                          Keyboard Shortcuts
                        </label>
                        <p class="text-xs text-neutral-500">
                          Enable keyboard shortcuts for faster navigation
                        </p>
                      </div>
                      <ToggleSwitch
                        :checked="preferences.keyboardShortcuts"
                        @change="setPreference('keyboardShortcuts', $event)"
                      />
                    </div>
                    
                    <!-- Export/Import -->
                    <div class="border-t border-neutral-200 pt-4">
                      <h4 class="text-sm font-medium text-neutral-700 mb-3">
                        Backup & Restore
                      </h4>
                      <div class="flex space-x-3">
                        <button
                          @click="handleExportPreferences"
                          class="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                        >
                          Export Settings
                        </button>
                        <button
                          @click="handleImportPreferences"
                          class="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                        >
                          Import Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="flex items-center justify-between p-6 border-t border-neutral-200 bg-neutral-50">
            <div class="text-sm text-neutral-500">
              Last updated: {{ formatDate(preferences.lastUpdated) }}
            </div>
            
            <div class="flex space-x-3">
              <button
                @click="closePreferences"
                class="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                @click="handleSaveAndClose"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Hidden file input for import -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Icon from '@/Components/Base/Icon.vue';
import ToggleSwitch from '@/Components/Base/ToggleSwitch.vue';
import { useUserPreferences } from '@/composables/useUserPreferences';

const props = defineProps({
  /**
   * Whether the preferences modal is open
   */
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

// Composables
const {
  preferences,
  setPreference,
  resetPreferences,
  exportPreferences,
  importPreferences,
  isDefaultPreferences
} = useUserPreferences();

// Local state
const activeSection = ref('appearance');
const fileInput = ref(null);

// Preference sections
const preferenceSections = [
  { id: 'appearance', label: 'Theme & Appearance', icon: 'palette' },
  { id: 'layout', label: 'Layout & Navigation', icon: 'layout' },
  { id: 'accessibility', label: 'Accessibility', icon: 'accessibility' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'advanced', label: 'Advanced', icon: 'settings' }
];

// Option definitions
const themeOptions = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'computer' }
];

const viewOptions = [
  { value: 'table', label: 'Table', icon: 'table' },
  { value: 'grid', label: 'Grid', icon: 'grid' },
  { value: 'list', label: 'List', icon: 'list' }
];

const fontSizeOptions = [
  { value: 'small', label: 'Small', preview: '12px' },
  { value: 'normal', label: 'Normal', preview: '14px' },
  { value: 'large', label: 'Large', preview: '16px' },
  { value: 'extra-large', label: 'Extra Large', preview: '18px' }
];

const fontWeightOptions = [
  { value: 'light', label: 'Light', preview: '300' },
  { value: 'normal', label: 'Normal', preview: '400' },
  { value: 'medium', label: 'Medium', preview: '500' },
  { value: 'bold', label: 'Bold', preview: '600' }
];

const lineHeightOptions = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'loose', label: 'Loose' }
];

const densityOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'comfortable', label: 'Comfortable' }
];

// Methods
const closePreferences = () => {
  emit('close');
};

const handleSaveAndClose = () => {
  emit('save', preferences.value);
  closePreferences();
};

const handleResetPreferences = () => {
  if (confirm('Are you sure you want to reset all preferences to their default values?')) {
    resetPreferences();
  }
};

const handleExportPreferences = () => {
  const data = exportPreferences();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `user-preferences-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

const handleImportPreferences = () => {
  fileInput.value?.click();
};

const handleFileImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const success = importPreferences(e.target.result);
      if (success) {
        alert('Preferences imported successfully!');
      } else {
        alert('Failed to import preferences. Please check the file format.');
      }
    } catch (error) {
      alert('Error importing preferences: ' + error.message);
    }
  };
  reader.readAsText(file);
  
  // Reset file input
  event.target.value = '';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    return 'Invalid date';
  }
};

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (!props.isOpen) return;
  
  if (event.key === 'Escape') {
    closePreferences();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Custom scrollbar for content area */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: theme('colors.neutral.300');
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: theme('colors.neutral.400');
}

/* Smooth transitions for all interactive elements */
.user-preferences button,
.user-preferences select {
  transition: all 0.2s ease-in-out;
}

/* Focus styles for accessibility */
.user-preferences button:focus,
.user-preferences select:focus {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* High contrast mode adjustments */
:global(.high-contrast) .user-preferences {
  --tw-border-opacity: 1;
  border-color: rgb(0 0 0 / var(--tw-border-opacity));
}

:global(.high-contrast) .user-preferences button {
  border-width: 2px;
}

/* Reduced motion adjustments */
:global(.reduce-motion) .user-preferences * {
  transition: none !important;
  animation: none !important;
}
</style>