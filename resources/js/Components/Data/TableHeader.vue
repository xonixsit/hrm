<template>
  <div class="table-header" :data-theme="theme">
    <!-- Header Content -->
    <div class="header-main">
      <div class="header-content">
        <h3 v-if="title" class="table-title">{{ title }}</h3>
        <p v-if="subtitle" class="table-subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="header-actions">
        <slot name="actions">
          <BaseButton
            v-for="action in actions"
            :key="action.id"
            v-bind="action"
            @click="handleAction(action)"
          >
            <Icon v-if="action.icon" :name="action.icon" class="w-4 h-4 mr-2" />
            {{ action.label }}
          </BaseButton>
        </slot>
      </div>
    </div>
    
    <!-- Search and Filter Bar -->
    <div v-if="showSearchAndFilters" class="search-filter-bar relative z-[10000] transform translate-z-0">
      <!-- Search Input -->
      <div v-if="searchConfig.enabled" class="search-section">
        <SearchBar
          v-model="searchQuery"
          :placeholder="searchConfig.placeholder"
          :min-search-length="searchConfig.minSearchLength || 3"
          :suggestions="searchConfig.suggestions || []"
          :loading="loading"
          @search="handleSearchSubmit"
          @clear="clearSearch"
        />
      </div>
      
      <!-- Filter Controls -->
      <div v-if="filterConfig.enabled && filterConfig.filters.length" class="filter-section">
        <div class="filter-controls">
          <!-- Quick Filters -->
          <div v-if="quickFilters.length" class="quick-filters">
            <FilterChip
              v-for="filter in quickFilters"
              :key="filter.key"
              :filter="filter"
              :active="activeFilters[filter.key] !== undefined"
              :value="activeFilters[filter.key]"
              @change="handleFilterChange"
              @clear="handleFilterClear"
            />
          </div>
          
          <!-- Advanced Filter Toggle -->
          <button
            v-if="hasAdvancedFilters"
            @click="toggleAdvancedFilters"
            class="advanced-filter-toggle"
          >
            <Icon name="filter" class="w-4 h-4 mr-2" />
            Advanced Filters
            <Icon 
              :name="showAdvancedFilters ? 'chevron-up' : 'chevron-down'" 
              class="w-4 h-4 ml-2" 
            />
          </button>
          
          <!-- Clear All Filters -->
          <button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="clear-filters"
          >
            <Icon name="x" class="w-4 h-4 mr-1" />
            Clear All
          </button>
        </div>
        
        <!-- Advanced Filters Panel -->
        <Transition name="slide-down">
          <div v-if="showAdvancedFilters" class="advanced-filters-panel">
            <div class="filter-grid">
              <div
                v-for="filter in advancedFilters"
                :key="filter.key"
                class="filter-field"
              >
                <label :for="`filter-${filter.key}`" class="filter-label">
                  {{ filter.label }}
                </label>
                
                <!-- Select Filter -->
                <BaseSelect
                  v-if="filter.type === 'select'"
                  :id="`filter-${filter.key}`"
                  :model-value="activeFilters[filter.key]"
                  :options="filter.options"
                  :placeholder="filter.placeholder"
                  @update:model-value="value => handleFilterChange(filter.key, value)"
                />
                
                <!-- Multi-Select Filter -->
                <BaseMultiSelect
                  v-else-if="filter.type === 'multiselect'"
                  :id="`filter-${filter.key}`"
                  :model-value="activeFilters[filter.key] || []"
                  :options="filter.options"
                  :placeholder="filter.placeholder"
                  @update:model-value="value => handleFilterChange(filter.key, value)"
                />
                
                <!-- Date Range Filter -->
                <DateRangePicker
                  v-else-if="filter.type === 'daterange'"
                  :id="`filter-${filter.key}`"
                  :model-value="activeFilters[filter.key]"
                  :placeholder="filter.placeholder"
                  @update:model-value="value => handleFilterChange(filter.key, value)"
                />
                
                <!-- Text Filter -->
                <BaseInput
                  v-else
                  :id="`filter-${filter.key}`"
                  :model-value="activeFilters[filter.key]"
                  :placeholder="filter.placeholder"
                  @update:model-value="value => handleFilterChange(filter.key, value)"
                />
              </div>
            </div>
            
            <div class="filter-actions">
              <BaseButton variant="secondary" @click="clearAllFilters">
                Clear All
              </BaseButton>
              <BaseButton variant="primary" @click="applyFilters">
                Apply Filters
              </BaseButton>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    
    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="active-filters">
      <div class="active-filters-list">
        <span class="active-filters-label">Active filters:</span>
        <FilterTag
          v-for="(value, key) in activeFilters"
          :key="key"
          :filter="getFilterConfig(key)"
          :value="value"
          @remove="handleFilterClear(key)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import BaseButton from '@/Components/Base/BaseButton.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import BaseMultiSelect from '@/Components/Base/BaseMultiSelect.vue';
import DateRangePicker from '@/Components/Base/DateRangePicker.vue';
import Icon from '@/Components/Base/Icon.vue';
import FilterChip from './FilterChip.vue';
import FilterTag from './FilterTag.vue';
import SearchBar from '@/Components/Search/SearchBar.vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  
  subtitle: {
    type: String,
    default: ''
  },
  
  searchConfig: {
    type: Object,
    default: () => ({
      enabled: true,
      placeholder: 'Search...',
      debounce: 300
    })
  },
  
  filterConfig: {
    type: Object,
    default: () => ({
      enabled: true,
      filters: []
    })
  },
  
  actions: {
    type: Array,
    default: () => []
  },
  
  loading: {
    type: Boolean,
    default: false
  },
  
  theme: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'dark'].includes(value)
  }
});

const emit = defineEmits(['search', 'filter', 'action']);

// Local state
const searchQuery = ref('');
const activeFilters = ref({});
const showAdvancedFilters = ref(false);

// Computed properties
const showSearchAndFilters = computed(() => {
  return props.searchConfig.enabled || 
         (props.filterConfig.enabled && props.filterConfig.filters.length);
});

const quickFilters = computed(() => {
  return props.filterConfig.filters.filter(filter => filter.quick);
});

const advancedFilters = computed(() => {
  return props.filterConfig.filters.filter(filter => !filter.quick);
});

const hasAdvancedFilters = computed(() => {
  return advancedFilters.value.length > 0;
});

const hasActiveFilters = computed(() => {
  return Object.keys(activeFilters.value).some(key => {
    const value = activeFilters.value[key];
    return value !== null && value !== undefined && value !== '' && 
           (!Array.isArray(value) || value.length > 0);
  });
});



// Methods


const handleSearchSubmit = (query) => {
  emit('search', query);
};

const clearSearch = () => {
  searchQuery.value = '';
  emit('search', '');
};

const handleFilterChange = (key, value) => {
  if (value === null || value === undefined || value === '' || 
      (Array.isArray(value) && value.length === 0)) {
    delete activeFilters.value[key];
  } else {
    activeFilters.value[key] = value;
  }
  
  emit('filter', { ...activeFilters.value });
};

const handleFilterClear = (key) => {
  delete activeFilters.value[key];
  emit('filter', { ...activeFilters.value });
};

const clearAllFilters = () => {
  activeFilters.value = {};
  emit('filter', {});
};

const applyFilters = () => {
  showAdvancedFilters.value = false;
  emit('filter', { ...activeFilters.value });
};

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const getFilterConfig = (key) => {
  return props.filterConfig.filters.find(filter => filter.key === key);
};

const handleAction = (action) => {
  emit('action', action);
  if (action.handler) {
    action.handler();
  }
};

// Watchers
watch(() => props.searchConfig, () => {
  if (!props.searchConfig.enabled) {
    searchQuery.value = '';
  }
});

watch(() => props.filterConfig, () => {
  if (!props.filterConfig.enabled) {
    activeFilters.value = {};
    showAdvancedFilters.value = false;
  }
});
</script>

<style scoped>
.table-header {
  @apply bg-white border-b border-neutral-200 p-4 space-y-4;
}

/* Header Main */
.header-main {
  @apply flex items-start justify-between gap-4;
}

.header-content {
  @apply flex-1 min-w-0;
}

.table-title {
  @apply text-lg font-semibold text-neutral-900;
}

.table-subtitle {
  @apply text-sm text-neutral-600 mt-1;
}

.header-actions {
  @apply flex items-center space-x-2 flex-shrink-0;
}

/* Search and Filter Bar */
.search-filter-bar {
  @apply flex flex-col sm:flex-row sm:items-center gap-4;
}

.search-section {
  @apply flex-1 max-w-md;
}

.search-input-wrapper {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400;
}

.search-input {
  @apply w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-md;
  @apply focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
  @apply placeholder-neutral-500 text-sm;
}

.clear-search {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2;
  @apply p-1 rounded-sm text-neutral-400 hover:text-neutral-600;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500;
}

/* Filter Section */
.filter-section {
  @apply flex-shrink-0;
}

.filter-controls {
  @apply flex items-center space-x-3;
}

.quick-filters {
  @apply flex items-center space-x-2;
}

.advanced-filter-toggle {
  @apply inline-flex items-center px-3 py-2 text-sm font-medium;
  @apply text-neutral-700 bg-white border border-neutral-300 rounded-md;
  @apply hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.clear-filters {
  @apply inline-flex items-center px-2 py-1 text-xs font-medium;
  @apply text-error-600 hover:text-error-700 hover:bg-error-50 rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-error-500;
}

/* Advanced Filters Panel */
.advanced-filters-panel {
  @apply mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-md;
}

.filter-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4;
}

.filter-field {
  @apply space-y-1;
}

.filter-label {
  @apply block text-sm font-medium text-neutral-700;
}

.filter-actions {
  @apply flex justify-end space-x-2 pt-4 border-t border-neutral-200;
}

/* Active Filters */
.active-filters {
  @apply bg-neutral-50 border border-neutral-200 rounded-md p-3;
}

.active-filters-list {
  @apply flex flex-wrap items-center gap-2;
}

.active-filters-label {
  @apply text-sm font-medium text-neutral-700 mr-2;
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  @apply transition-all duration-200 ease-out;
}

.slide-down-enter-from {
  @apply opacity-0 transform -translate-y-2;
}

.slide-down-leave-to {
  @apply opacity-0 transform -translate-y-2;
}

/* Responsive */
@media (max-width: 640px) {
  .header-main {
    @apply flex-col items-stretch gap-3;
  }
  
  .header-actions {
    @apply justify-end;
  }
  
  .search-filter-bar {
    @apply flex-col gap-3;
  }
  
  .filter-controls {
    @apply flex-wrap gap-2;
  }
  
  .filter-grid {
    @apply grid-cols-1;
  }
}

/* Component-level theme control */
.table-header[data-theme="dark"] {
  @apply bg-neutral-800 border-neutral-700;
}

.table-header[data-theme="dark"] .table-title {
  @apply text-neutral-100;
}

.table-header[data-theme="dark"] .table-subtitle {
  @apply text-neutral-400;
}

.table-header[data-theme="dark"] .search-input {
  @apply bg-neutral-700 border-neutral-600 text-neutral-100;
  @apply placeholder-neutral-400;
}

.table-header[data-theme="dark"] .advanced-filter-toggle {
  @apply bg-neutral-700 border-neutral-600 text-neutral-200;
  @apply hover:bg-neutral-600;
}

.table-header[data-theme="dark"] .advanced-filters-panel {
  @apply bg-neutral-700 border-neutral-600;
}

.table-header[data-theme="dark"] .active-filters {
  @apply bg-neutral-700 border-neutral-600;
}

.table-header[data-theme="dark"] .active-filters-label {
  @apply text-neutral-300;
}
</style>