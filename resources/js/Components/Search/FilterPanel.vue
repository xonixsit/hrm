<template>
  <div class="filter-panel" :class="panelClasses">
    <!-- Panel Header -->
    <div v-if="title || $slots.header" class="filter-panel-header">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-neutral-900">{{ title }}</h3>
          <button
            v-if="collapsible && !alwaysExpanded"
            type="button"
            class="text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
            @click="toggleExpanded"
            :aria-label="isExpanded ? 'Collapse filters' : 'Expand filters'"
          >
            <Icon 
              :name="isExpanded ? 'chevron-up' : 'chevron-down'" 
              class="w-5 h-5 transition-transform duration-200"
            />
          </button>
        </div>
      </slot>
    </div>

    <!-- Active Filters Display -->
    <div v-if="showActiveFilters && activeFilters.length > 0" class="active-filters-section">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-neutral-700">Active Filters</span>
        <button
          type="button"
          class="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
          @click="handleClearAll"
          :disabled="disabled"
        >
          Clear All
        </button>
      </div>
      
      <div class="flex flex-wrap gap-2">
        <FilterChip
          v-for="filter in activeFilters"
          :key="getFilterKey(filter)"
          :label="filter.label"
          :value="filter.value"
          :icon="filter.icon"
          :variant="filter.variant || 'default'"
          :disabled="disabled"
          @remove="handleRemoveFilter"
        />
      </div>
    </div>

    <!-- Filter Controls -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-screen"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 max-h-screen"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="isExpanded" class="filter-controls overflow-hidden">
        <div class="space-y-6 pt-4">
          <!-- Filter Groups -->
          <div
            v-for="group in filterGroups"
            :key="group.key"
            class="filter-group"
          >
            <h4 class="text-sm font-medium text-neutral-700 mb-3">{{ group.label }}</h4>
            
            <!-- Checkbox Group -->
            <div v-if="group.type === 'checkbox'" class="space-y-2">
              <label
                v-for="option in group.options"
                :key="option.value"
                class="flex items-center"
              >
                <input
                  type="checkbox"
                  :value="option.value"
                  :checked="isOptionSelected(group.key, option.value)"
                  :disabled="disabled"
                  class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  @change="handleCheckboxChange(group.key, option.value, $event)"
                />
                <span class="ml-2 text-sm text-neutral-700">
                  {{ option.label }}
                  <span v-if="option.count !== undefined" class="text-neutral-500">({{ option.count }})</span>
                </span>
              </label>
            </div>
            
            <!-- Radio Group -->
            <div v-else-if="group.type === 'radio'" class="space-y-2">
              <label
                v-for="option in group.options"
                :key="option.value"
                class="flex items-center"
              >
                <input
                  type="radio"
                  :name="group.key"
                  :value="option.value"
                  :checked="filters[group.key] === option.value"
                  :disabled="disabled"
                  class="border-neutral-300 text-primary-600 focus:ring-primary-500"
                  @change="handleRadioChange(group.key, option.value)"
                />
                <span class="ml-2 text-sm text-neutral-700">
                  {{ option.label }}
                  <span v-if="option.count !== undefined" class="text-neutral-500">({{ option.count }})</span>
                </span>
              </label>
            </div>
            
            <!-- Range Slider -->
            <div v-else-if="group.type === 'range'" class="space-y-3">
              <div class="flex items-center justify-between text-sm text-neutral-600">
                <span>{{ group.min || 0 }}</span>
                <span>{{ group.max || 100 }}</span>
              </div>
              <input
                type="range"
                :min="group.min || 0"
                :max="group.max || 100"
                :step="group.step || 1"
                :value="filters[group.key] || group.min || 0"
                :disabled="disabled"
                class="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                @input="handleRangeChange(group.key, $event.target.value)"
              />
              <div class="text-center text-sm text-neutral-700">
                {{ filters[group.key] || group.min || 0 }}
              </div>
            </div>
            
            <!-- Date Range -->
            <div v-else-if="group.type === 'daterange'" class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-neutral-600 mb-1">From</label>
                <input
                  type="date"
                  :value="filters[`${group.key}_from`] || ''"
                  :disabled="disabled"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                  @change="handleDateRangeChange(group.key, 'from', $event.target.value)"
                />
              </div>
              <div>
                <label class="block text-xs text-neutral-600 mb-1">To</label>
                <input
                  type="date"
                  :value="filters[`${group.key}_to`] || ''"
                  :disabled="disabled"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                  @change="handleDateRangeChange(group.key, 'to', $event.target.value)"
                />
              </div>
            </div>
            
            <!-- Custom Slot -->
            <div v-else-if="group.type === 'custom'">
              <slot :name="`filter-${group.key}`" :group="group" :filters="filters" />
            </div>
          </div>
          
          <!-- Filter Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button
              type="button"
              class="text-sm text-neutral-600 hover:text-neutral-800 transition-colors duration-200"
              @click="handleReset"
              :disabled="disabled || !hasActiveFilters"
            >
              Reset Filters
            </button>
            
            <div class="flex items-center space-x-3">
              <button
                v-if="showSavePreset"
                type="button"
                class="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
                @click="showSavePresetDialog = true"
                :disabled="disabled || !hasActiveFilters"
              >
                Save Preset
              </button>
              
              <button
                type="button"
                class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
                @click="handleApply"
                :disabled="disabled"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Filter Presets -->
    <div v-if="showPresets && filterPresets.length > 0" class="filter-presets mt-4 pt-4 border-t border-neutral-200">
      <h4 class="text-sm font-medium text-neutral-700 mb-3">Filter Presets</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in filterPresets"
          :key="preset.id"
          type="button"
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors duration-200"
          @click="loadPreset(preset)"
          :disabled="disabled"
        >
          {{ preset.name }}
          <Icon 
            name="x" 
            class="w-3 h-3 ml-1 hover:text-neutral-900" 
            @click.stop="deletePreset(preset.id)" 
          />
        </button>
      </div>
    </div>

    <!-- Save Preset Dialog -->
    <Teleport to="body">
      <div
        v-if="showSavePresetDialog"
        class="fixed inset-0 z-modal bg-black bg-opacity-50 flex items-center justify-center p-4"
        @click.self="showSavePresetDialog = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-neutral-900 mb-4">Save Filter Preset</h3>
          
          <form @submit.prevent="handleSavePreset">
            <div class="space-y-4">
              <div>
                <label for="preset-name" class="block text-sm font-medium text-neutral-700 mb-1">
                  Preset Name
                </label>
                <input
                  id="preset-name"
                  v-model="presetName"
                  type="text"
                  placeholder="Enter a name for this preset"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div class="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors duration-200"
                  @click="showSavePresetDialog = false"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-200"
                  :disabled="!presetName.trim()"
                >
                  Save
                </button>
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
import FilterChip from './FilterChip.vue';

const props = defineProps({
  // Panel configuration
  title: {
    type: String,
    default: 'Filters'
  },
  
  // Filter groups configuration
  filterGroups: {
    type: Array,
    required: true,
    validator: (groups) => {
      return groups.every(group => 
        group.key && 
        group.label && 
        ['checkbox', 'radio', 'range', 'daterange', 'custom'].includes(group.type)
      );
    }
  },
  
  // Initial filter values
  initialFilters: {
    type: Object,
    default: () => ({})
  },
  
  // Display options
  collapsible: {
    type: Boolean,
    default: true
  },
  
  alwaysExpanded: {
    type: Boolean,
    default: false
  },
  
  showActiveFilters: {
    type: Boolean,
    default: true
  },
  
  showPresets: {
    type: Boolean,
    default: true
  },
  
  showSavePreset: {
    type: Boolean,
    default: true
  },
  
  // Filter presets
  filterPresets: {
    type: Array,
    default: () => []
  },
  
  // States
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits([
  'filter-change',
  'apply-filters',
  'clear-filters',
  'reset-filters',
  'save-preset',
  'load-preset',
  'delete-preset'
]);

// Refs
const isExpanded = ref(props.alwaysExpanded || !props.collapsible);
const filters = ref({});
const showSavePresetDialog = ref(false);
const presetName = ref('');

// Computed properties
const panelClasses = computed(() => [
  'filter-panel bg-white border border-neutral-200 rounded-lg p-4',
  props.class
]);

const activeFilters = computed(() => {
  const active = [];
  
  Object.entries(filters.value).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;
    
    // Find the corresponding filter group
    const group = props.filterGroups.find(g => 
      g.key === key || 
      key.startsWith(`${g.key}_from`) || 
      key.startsWith(`${g.key}_to`)
    );
    
    if (!group) return;
    
    // Handle different filter types
    if (group.type === 'checkbox' && Array.isArray(value)) {
      value.forEach(val => {
        const option = group.options.find(opt => opt.value === val);
        if (option) {
          active.push({
            key: `${key}-${val}`,
            label: group.label,
            value: option.label,
            icon: group.icon,
            variant: group.variant
          });
        }
      });
    } else if (group.type === 'radio') {
      const option = group.options.find(opt => opt.value === value);
      if (option) {
        active.push({
          key,
          label: group.label,
          value: option.label,
          icon: group.icon,
          variant: group.variant
        });
      }
    } else if (group.type === 'range') {
      active.push({
        key,
        label: group.label,
        value: value,
        icon: group.icon,
        variant: group.variant
      });
    } else if (group.type === 'daterange') {
      if (key.endsWith('_from') && value) {
        active.push({
          key,
          label: `${group.label} From`,
          value: value,
          icon: group.icon,
          variant: group.variant
        });
      } else if (key.endsWith('_to') && value) {
        active.push({
          key,
          label: `${group.label} To`,
          value: value,
          icon: group.icon,
          variant: group.variant
        });
      }
    }
  });
  
  return active;
});

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '' && value !== null && value !== undefined;
  });
});

// Initialize filters
const initializeFilters = () => {
  const initialFilters = { ...props.initialFilters };
  
  // Initialize empty values for all filter groups
  props.filterGroups.forEach(group => {
    if (group.type === 'checkbox') {
      if (!(group.key in initialFilters)) {
        initialFilters[group.key] = [];
      }
    } else if (group.type === 'daterange') {
      if (!(`${group.key}_from` in initialFilters)) {
        initialFilters[`${group.key}_from`] = '';
      }
      if (!(`${group.key}_to` in initialFilters)) {
        initialFilters[`${group.key}_to`] = '';
      }
    } else {
      if (!(group.key in initialFilters)) {
        initialFilters[group.key] = group.type === 'range' ? (group.min || 0) : '';
      }
    }
  });
  
  filters.value = initialFilters;
};

// Event handlers
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const isOptionSelected = (groupKey, optionValue) => {
  const filterValue = filters.value[groupKey];
  if (Array.isArray(filterValue)) {
    return filterValue.includes(optionValue);
  }
  return filterValue === optionValue;
};

const handleCheckboxChange = (groupKey, optionValue, event) => {
  const currentValues = filters.value[groupKey] || [];
  
  if (event.target.checked) {
    filters.value[groupKey] = [...currentValues, optionValue];
  } else {
    filters.value[groupKey] = currentValues.filter(val => val !== optionValue);
  }
  
  emit('filter-change', { key: groupKey, value: filters.value[groupKey] });
};

const handleRadioChange = (groupKey, optionValue) => {
  filters.value[groupKey] = optionValue;
  emit('filter-change', { key: groupKey, value: optionValue });
};

const handleRangeChange = (groupKey, value) => {
  filters.value[groupKey] = Number(value);
  emit('filter-change', { key: groupKey, value: Number(value) });
};

const handleDateRangeChange = (groupKey, type, value) => {
  const key = `${groupKey}_${type}`;
  filters.value[key] = value;
  emit('filter-change', { key, value });
};

const handleRemoveFilter = (filterData) => {
  // Find and remove the specific filter
  Object.keys(filters.value).forEach(key => {
    const value = filters.value[key];
    
    if (Array.isArray(value)) {
      const index = value.findIndex(v => {
        const group = props.filterGroups.find(g => g.key === key);
        if (group) {
          const option = group.options.find(opt => opt.value === v);
          return option && option.label === filterData.value;
        }
        return false;
      });
      
      if (index >= 0) {
        filters.value[key].splice(index, 1);
        emit('filter-change', { key, value: filters.value[key] });
      }
    } else if (key === filterData.key || 
               (key.includes('_from') && filterData.label.includes('From')) ||
               (key.includes('_to') && filterData.label.includes('To'))) {
      filters.value[key] = '';
      emit('filter-change', { key, value: '' });
    }
  });
};

const handleClearAll = () => {
  initializeFilters();
  emit('clear-filters');
};

const handleReset = () => {
  initializeFilters();
  emit('reset-filters');
};

const handleApply = () => {
  emit('apply-filters', { ...filters.value });
};

const getFilterKey = (filter) => {
  return filter.key;
};

// Preset management
const handleSavePreset = () => {
  if (!presetName.value.trim()) return;
  
  const preset = {
    name: presetName.value.trim(),
    filters: { ...filters.value },
    timestamp: Date.now()
  };
  
  emit('save-preset', preset);
  showSavePresetDialog.value = false;
  presetName.value = '';
};

const loadPreset = (preset) => {
  filters.value = { ...filters.value, ...preset.filters };
  emit('load-preset', preset);
};

const deletePreset = (presetId) => {
  emit('delete-preset', presetId);
};

// Watch for initial filters changes
watch(() => props.initialFilters, (newFilters) => {
  filters.value = { ...filters.value, ...newFilters };
}, { deep: true });

// Lifecycle
onMounted(() => {
  initializeFilters();
});
</script>

<style scoped>
/* Custom range slider styling */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Smooth transitions */
.transition {
  transition-property: opacity, max-height, transform;
}

/* Ensure proper overflow handling during transitions */
.overflow-hidden {
  overflow: hidden;
}

/* Active filters section styling */
.active-filters-section {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

/* Filter group spacing */
.filter-group:not(:last-child) {
  margin-bottom: 24px;
}

/* Custom checkbox and radio styling */
input[type="checkbox"],
input[type="radio"] {
  @apply h-4 w-4;
}

/* Modal backdrop */
.fixed.inset-0 {
  backdrop-filter: blur(4px);
}
</style>