<template>
  <div class="advanced-search" :class="wrapperClasses">
    <!-- Toggle Button -->
    <button
      v-if="!alwaysExpanded"
      type="button"
      class="flex items-center text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
      @click="toggleExpanded"
    >
      <Icon 
        :name="isExpanded ? 'chevron-up' : 'chevron-down'" 
        class="w-4 h-4 mr-1 transition-transform duration-200"
      />
      {{ isExpanded ? 'Hide Advanced Search' : 'Show Advanced Search' }}
    </button>

    <!-- Advanced Search Form -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="isExpanded" class="mt-4 overflow-hidden">
        <div class="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
          <form @submit.prevent="handleSearch" class="space-y-6">
            <!-- Search Fields Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Dynamic Search Fields -->
              <div
                v-for="field in searchFields"
                :key="field.key"
                class="space-y-1"
              >
                <label :for="field.key" class="block text-sm font-medium text-neutral-700">
                  {{ field.label }}
                  <span v-if="field.required" class="text-error-500 ml-1">*</span>
                </label>
                
                <!-- Text Input -->
                <BaseInput
                  v-if="field.type === 'text'"
                  :id="field.key"
                  v-model="searchCriteria[field.key]"
                  :placeholder="field.placeholder"
                  :disabled="disabled"
                  size="sm"
                />
                
                <!-- Select Input -->
                <BaseSelect
                  v-else-if="field.type === 'select'"
                  :id="field.key"
                  v-model="searchCriteria[field.key]"
                  :options="field.options"
                  :placeholder="field.placeholder"
                  :disabled="disabled"
                  size="sm"
                />
                
                <!-- Date Input -->
                <BaseInput
                  v-else-if="field.type === 'date'"
                  :id="field.key"
                  v-model="searchCriteria[field.key]"
                  type="date"
                  :disabled="disabled"
                  size="sm"
                />
                
                <!-- Number Input -->
                <BaseInput
                  v-else-if="field.type === 'number'"
                  :id="field.key"
                  v-model="searchCriteria[field.key]"
                  type="number"
                  :placeholder="field.placeholder"
                  :disabled="disabled"
                  size="sm"
                />
                
                <!-- Multi-select -->
                <BaseMultiSelect
                  v-else-if="field.type === 'multiselect'"
                  :id="field.key"
                  v-model="searchCriteria[field.key]"
                  :options="field.options"
                  :placeholder="field.placeholder"
                  :disabled="disabled"
                  size="sm"
                />
                
                <!-- Date Range -->
                <div v-else-if="field.type === 'daterange'" class="grid grid-cols-2 gap-2">
                  <BaseInput
                    :id="`${field.key}_from`"
                    v-model="searchCriteria[`${field.key}_from`]"
                    type="date"
                    placeholder="From"
                    :disabled="disabled"
                    size="sm"
                  />
                  <BaseInput
                    :id="`${field.key}_to`"
                    v-model="searchCriteria[`${field.key}_to`]"
                    type="date"
                    placeholder="To"
                    :disabled="disabled"
                    size="sm"
                  />
                </div>
                
                <!-- Number Range -->
                <div v-else-if="field.type === 'numberrange'" class="grid grid-cols-2 gap-2">
                  <BaseInput
                    :id="`${field.key}_min`"
                    v-model="searchCriteria[`${field.key}_min`]"
                    type="number"
                    :placeholder="`Min ${field.label}`"
                    :disabled="disabled"
                    size="sm"
                  />
                  <BaseInput
                    :id="`${field.key}_max`"
                    v-model="searchCriteria[`${field.key}_max`]"
                    type="number"
                    :placeholder="`Max ${field.label}`"
                    :disabled="disabled"
                    size="sm"
                  />
                </div>
                
                <!-- Help text -->
                <p v-if="field.helpText" class="text-xs text-neutral-500">
                  {{ field.helpText }}
                </p>
              </div>
            </div>

            <!-- Search Operators -->
            <div v-if="showOperators" class="space-y-3">
              <h4 class="text-sm font-medium text-neutral-700">Search Options</h4>
              <div class="flex flex-wrap gap-4">
                <label class="flex items-center">
                  <input
                    v-model="searchOptions.matchAll"
                    type="checkbox"
                    class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-neutral-700">Match all criteria</span>
                </label>
                
                <label class="flex items-center">
                  <input
                    v-model="searchOptions.caseSensitive"
                    type="checkbox"
                    class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-neutral-700">Case sensitive</span>
                </label>
                
                <label class="flex items-center">
                  <input
                    v-model="searchOptions.exactMatch"
                    type="checkbox"
                    class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-neutral-700">Exact match</span>
                </label>
              </div>
            </div>

            <!-- Saved Searches -->
            <div v-if="showSavedSearches && savedSearches.length > 0" class="space-y-3">
              <h4 class="text-sm font-medium text-neutral-700">Saved Searches</h4>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="savedSearch in savedSearches"
                  :key="savedSearch.id"
                  type="button"
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors duration-200"
                  @click="loadSavedSearch(savedSearch)"
                >
                  {{ savedSearch.name }}
                  <Icon name="x" class="w-3 h-3 ml-1 hover:text-primary-900" @click.stop="deleteSavedSearch(savedSearch.id)" />
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div class="flex items-center space-x-3">
                <BaseButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  :loading="loading"
                  :disabled="disabled || !hasSearchCriteria"
                >
                  <Icon name="search" class="w-4 h-4 mr-2" />
                  Search
                </BaseButton>
                
                <BaseButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  :disabled="disabled"
                  @click="handleClear"
                >
                  Clear All
                </BaseButton>
              </div>
              
              <div class="flex items-center space-x-2">
                <BaseButton
                  v-if="showSaveSearch && hasSearchCriteria"
                  type="button"
                  variant="ghost"
                  size="sm"
                  :disabled="disabled"
                  @click="showSaveDialog = true"
                >
                  <Icon name="bookmark" class="w-4 h-4 mr-1" />
                  Save Search
                </BaseButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Save Search Dialog -->
    <Teleport to="body">
      <div
        v-if="showSaveDialog"
        class="fixed inset-0 z-modal bg-black bg-opacity-50 flex items-center justify-center p-4"
        @click.self="showSaveDialog = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-neutral-900 mb-4">Save Search</h3>
          
          <form @submit.prevent="handleSaveSearch">
            <div class="space-y-4">
              <div>
                <label for="search-name" class="block text-sm font-medium text-neutral-700 mb-1">
                  Search Name
                </label>
                <BaseInput
                  id="search-name"
                  v-model="saveSearchName"
                  placeholder="Enter a name for this search"
                  required
                />
              </div>
              
              <div class="flex items-center justify-end space-x-3">
                <BaseButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  @click="showSaveDialog = false"
                >
                  Cancel
                </BaseButton>
                <BaseButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  :disabled="!saveSearchName.trim()"
                >
                  Save
                </BaseButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Icon from '@/Components/Base/Icon.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import BaseMultiSelect from '@/Components/Base/BaseMultiSelect.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';

const props = defineProps({
  // Search configuration
  searchFields: {
    type: Array,
    required: true,
    validator: (fields) => {
      return fields.every(field => 
        field.key && 
        field.label && 
        ['text', 'select', 'date', 'number', 'multiselect', 'daterange', 'numberrange'].includes(field.type)
      );
    }
  },
  
  // Initial values
  initialCriteria: {
    type: Object,
    default: () => ({})
  },
  
  // States
  loading: {
    type: Boolean,
    default: false
  },
  
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Display options
  alwaysExpanded: {
    type: Boolean,
    default: false
  },
  
  showOperators: {
    type: Boolean,
    default: true
  },
  
  showSavedSearches: {
    type: Boolean,
    default: true
  },
  
  showSaveSearch: {
    type: Boolean,
    default: true
  },
  
  // Saved searches
  savedSearches: {
    type: Array,
    default: () => []
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits([
  'search',
  'clear',
  'save-search',
  'load-search',
  'delete-search'
]);

// Refs
const isExpanded = ref(props.alwaysExpanded);
const searchCriteria = ref({});
const searchOptions = ref({
  matchAll: true,
  caseSensitive: false,
  exactMatch: false
});
const showSaveDialog = ref(false);
const saveSearchName = ref('');

// Computed properties
const wrapperClasses = computed(() => [
  'advanced-search',
  props.class
]);

const hasSearchCriteria = computed(() => {
  return Object.values(searchCriteria.value).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '' && value !== null && value !== undefined;
  });
});

// Initialize search criteria
const initializeSearchCriteria = () => {
  const criteria = { ...props.initialCriteria };
  
  // Initialize empty values for all fields
  props.searchFields.forEach(field => {
    if (!(field.key in criteria)) {
      if (field.type === 'multiselect') {
        criteria[field.key] = [];
      } else if (field.type === 'daterange') {
        criteria[`${field.key}_from`] = '';
        criteria[`${field.key}_to`] = '';
      } else if (field.type === 'numberrange') {
        criteria[`${field.key}_min`] = '';
        criteria[`${field.key}_max`] = '';
      } else {
        criteria[field.key] = '';
      }
    }
  });
  
  searchCriteria.value = criteria;
};

// Event handlers
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const handleSearch = () => {
  const cleanedCriteria = cleanSearchCriteria();
  emit('search', {
    criteria: cleanedCriteria,
    options: { ...searchOptions.value }
  });
};

const handleClear = () => {
  initializeSearchCriteria();
  searchOptions.value = {
    matchAll: true,
    caseSensitive: false,
    exactMatch: false
  };
  emit('clear');
};

const handleSaveSearch = () => {
  if (!saveSearchName.value.trim()) return;
  
  const searchData = {
    name: saveSearchName.value.trim(),
    criteria: cleanSearchCriteria(),
    options: { ...searchOptions.value },
    timestamp: Date.now()
  };
  
  emit('save-search', searchData);
  showSaveDialog.value = false;
  saveSearchName.value = '';
};

const loadSavedSearch = (savedSearch) => {
  searchCriteria.value = { ...searchCriteria.value, ...savedSearch.criteria };
  searchOptions.value = { ...searchOptions.value, ...savedSearch.options };
  emit('load-search', savedSearch);
};

const deleteSavedSearch = (searchId) => {
  emit('delete-search', searchId);
};

// Helper functions
const cleanSearchCriteria = () => {
  const cleaned = {};
  
  Object.entries(searchCriteria.value).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        cleaned[key] = value;
      }
    } else if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
};

// Watch for initial criteria changes
watch(() => props.initialCriteria, (newCriteria) => {
  searchCriteria.value = { ...searchCriteria.value, ...newCriteria };
}, { deep: true });

// Lifecycle
onMounted(() => {
  initializeSearchCriteria();
});
</script>

<style scoped>
/* Smooth transitions for expand/collapse */
.transition {
  transition-property: opacity, max-height;
}

/* Ensure proper overflow handling during transitions */
.overflow-hidden {
  overflow: hidden;
}

/* Custom checkbox styling */
input[type="checkbox"] {
  @apply h-4 w-4;
}

/* Modal backdrop */
.fixed.inset-0 {
  backdrop-filter: blur(4px);
}
</style>