import { ref, computed, watch, nextTick } from 'vue';
import { router } from '@inertiajs/vue3';

/**
 * Composable for managing filter state with URL synchronization
 * 
 * @param {Object} options - Configuration options
 * @param {Array} options.filterGroups - Filter group definitions
 * @param {Object} options.initialFilters - Initial filter values
 * @param {Boolean} options.syncWithUrl - Enable URL synchronization
 * @param {String} options.urlPrefix - URL parameter prefix
 * @param {Boolean} options.enablePresets - Enable filter presets
 * @param {String} options.presetsKey - LocalStorage key for presets
 * @returns {Object} Filter state and methods
 */
export function useFilters(options = {}) {
  const {
    filterGroups = [],
    initialFilters = {},
    syncWithUrl = true,
    urlPrefix = 'filter',
    enablePresets = true,
    presetsKey = 'filter-presets'
  } = options;

  // Reactive state
  const filters = ref({});
  const appliedFilters = ref({});
  const filterPresets = ref([]);
  const isLoading = ref(false);

  // Initialize filters from URL or initial values
  const initializeFilters = () => {
    let initialValues = { ...initialFilters };

    // Load from URL if sync is enabled
    if (syncWithUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      
      filterGroups.forEach(group => {
        const paramKey = `${urlPrefix}_${group.key}`;
        const urlValue = urlParams.get(paramKey);
        
        if (urlValue) {
          if (group.type === 'checkbox') {
            initialValues[group.key] = urlValue.split(',');
          } else if (group.type === 'range') {
            initialValues[group.key] = Number(urlValue);
          } else if (group.type === 'daterange') {
            const fromKey = `${group.key}_from`;
            const toKey = `${group.key}_to`;
            const fromParam = urlParams.get(`${urlPrefix}_${fromKey}`);
            const toParam = urlParams.get(`${urlPrefix}_${toKey}`);
            
            if (fromParam) initialValues[fromKey] = fromParam;
            if (toParam) initialValues[toKey] = toParam;
          } else {
            initialValues[group.key] = urlValue;
          }
        }
      });
    }

    // Set default values for missing filters
    filterGroups.forEach(group => {
      if (group.type === 'checkbox') {
        if (!(group.key in initialValues)) {
          initialValues[group.key] = [];
        }
      } else if (group.type === 'daterange') {
        const fromKey = `${group.key}_from`;
        const toKey = `${group.key}_to`;
        if (!(fromKey in initialValues)) initialValues[fromKey] = '';
        if (!(toKey in initialValues)) initialValues[toKey] = '';
      } else if (group.type === 'range') {
        if (!(group.key in initialValues)) {
          initialValues[group.key] = group.min || 0;
        }
      } else {
        if (!(group.key in initialValues)) {
          initialValues[group.key] = '';
        }
      }
    });

    filters.value = initialValues;
    appliedFilters.value = { ...initialValues };
  };

  // Computed properties
  const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    });
  });

  const hasUnappliedChanges = computed(() => {
    return JSON.stringify(filters.value) !== JSON.stringify(appliedFilters.value);
  });

  const activeFilterCount = computed(() => {
    let count = 0;
    Object.values(filters.value).forEach(value => {
      if (Array.isArray(value)) {
        count += value.length;
      } else if (value !== '' && value !== null && value !== undefined) {
        count += 1;
      }
    });
    return count;
  });

  // Filter methods
  const setFilter = (key, value) => {
    filters.value[key] = value;
  };

  const removeFilter = (key) => {
    if (Array.isArray(filters.value[key])) {
      filters.value[key] = [];
    } else {
      filters.value[key] = '';
    }
  };

  const clearAllFilters = () => {
    filterGroups.forEach(group => {
      if (group.type === 'checkbox') {
        filters.value[group.key] = [];
      } else if (group.type === 'daterange') {
        filters.value[`${group.key}_from`] = '';
        filters.value[`${group.key}_to`] = '';
      } else if (group.type === 'range') {
        filters.value[group.key] = group.min || 0;
      } else {
        filters.value[group.key] = '';
      }
    });
  };

  const resetFilters = () => {
    initializeFilters();
  };

  const applyFilters = () => {
    appliedFilters.value = { ...filters.value };
    
    if (syncWithUrl) {
      updateUrl();
    }
    
    return { ...appliedFilters.value };
  };

  // URL synchronization
  const updateUrl = () => {
    if (!syncWithUrl) return;

    const params = new URLSearchParams(window.location.search);
    
    // Remove existing filter parameters
    const keysToRemove = [];
    params.forEach((value, key) => {
      if (key.startsWith(`${urlPrefix}_`)) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach(key => params.delete(key));

    // Add current filter parameters
    Object.entries(appliedFilters.value).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(`${urlPrefix}_${key}`, value.join(','));
      } else if (value !== '' && value !== null && value !== undefined) {
        params.set(`${urlPrefix}_${key}`, String(value));
      }
    });

    // Update URL without page reload
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    
    // Use Inertia router if available, otherwise use history API
    if (typeof router !== 'undefined') {
      router.get(newUrl, {}, {
        preserveState: true,
        preserveScroll: true,
        replace: true
      });
    } else {
      window.history.replaceState({}, '', newUrl);
    }
  };

  // Filter presets
  const loadPresets = () => {
    if (!enablePresets) return;
    
    try {
      const saved = localStorage.getItem(presetsKey);
      if (saved) {
        filterPresets.value = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load filter presets:', error);
      filterPresets.value = [];
    }
  };

  const savePresets = () => {
    if (!enablePresets) return;
    
    try {
      localStorage.setItem(presetsKey, JSON.stringify(filterPresets.value));
    } catch (error) {
      console.warn('Failed to save filter presets:', error);
    }
  };

  const savePreset = (presetData) => {
    if (!enablePresets) return null;

    const preset = {
      id: Date.now().toString(),
      name: presetData.name,
      filters: { ...filters.value },
      createdAt: new Date().toISOString(),
      ...presetData
    };

    // Check if preset with same name exists
    const existingIndex = filterPresets.value.findIndex(p => p.name === preset.name);
    
    if (existingIndex >= 0) {
      // Update existing preset
      filterPresets.value[existingIndex] = preset;
    } else {
      // Add new preset
      filterPresets.value.unshift(preset);
    }

    savePresets();
    return preset;
  };

  const loadPreset = (preset) => {
    filters.value = { ...filters.value, ...preset.filters };
    return preset;
  };

  const deletePreset = (presetId) => {
    filterPresets.value = filterPresets.value.filter(p => p.id !== presetId);
    savePresets();
  };

  const updatePreset = (presetId, updates) => {
    const index = filterPresets.value.findIndex(p => p.id === presetId);
    if (index >= 0) {
      filterPresets.value[index] = {
        ...filterPresets.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      savePresets();
    }
  };

  // Filter building and querying
  const buildFilterQuery = (options = {}) => {
    const {
      includeEmpty = false,
      format = 'object' // 'object', 'query', 'array'
    } = options;

    const query = {};
    
    Object.entries(appliedFilters.value).forEach(([key, value]) => {
      if (!includeEmpty) {
        if (Array.isArray(value) && value.length === 0) return;
        if (value === '' || value === null || value === undefined) return;
      }
      
      query[key] = value;
    });

    if (format === 'query') {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      });
      return params.toString();
    }

    if (format === 'array') {
      return Object.entries(query).map(([key, value]) => ({
        key,
        value,
        operator: Array.isArray(value) ? 'in' : 'eq'
      }));
    }

    return query;
  };

  const getFilterSummary = () => {
    const summary = [];
    
    Object.entries(appliedFilters.value).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length === 0) return;
      if (value === '' || value === null || value === undefined) return;
      
      const group = filterGroups.find(g => 
        g.key === key || 
        key.startsWith(`${g.key}_from`) || 
        key.startsWith(`${g.key}_to`)
      );
      
      if (group) {
        if (Array.isArray(value)) {
          value.forEach(val => {
            const option = group.options?.find(opt => opt.value === val);
            summary.push({
              group: group.label,
              key,
              value: val,
              label: option?.label || val,
              type: group.type
            });
          });
        } else {
          const option = group.options?.find(opt => opt.value === value);
          summary.push({
            group: group.label,
            key,
            value,
            label: option?.label || value,
            type: group.type
          });
        }
      }
    });
    
    return summary;
  };

  // Validation
  const validateFilters = () => {
    const errors = {};
    
    filterGroups.forEach(group => {
      const value = filters.value[group.key];
      
      // Required validation
      if (group.required) {
        if (Array.isArray(value) && value.length === 0) {
          errors[group.key] = `${group.label} is required`;
        } else if (!value || value === '') {
          errors[group.key] = `${group.label} is required`;
        }
      }
      
      // Range validation
      if (group.type === 'range' && value !== '' && value !== null) {
        if (group.min !== undefined && value < group.min) {
          errors[group.key] = `${group.label} must be at least ${group.min}`;
        }
        if (group.max !== undefined && value > group.max) {
          errors[group.key] = `${group.label} must be at most ${group.max}`;
        }
      }
      
      // Date range validation
      if (group.type === 'daterange') {
        const fromValue = filters.value[`${group.key}_from`];
        const toValue = filters.value[`${group.key}_to`];
        
        if (fromValue && toValue && new Date(fromValue) > new Date(toValue)) {
          errors[`${group.key}_from`] = 'From date must be before to date';
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Watch for filter changes to enable auto-apply
  const enableAutoApply = (delay = 500) => {
    let timeoutId;
    
    return watch(filters, () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        applyFilters();
      }, delay);
    }, { deep: true });
  };

  // Initialize
  initializeFilters();
  loadPresets();

  return {
    // State
    filters,
    appliedFilters,
    filterPresets,
    isLoading,

    // Computed
    hasActiveFilters,
    hasUnappliedChanges,
    activeFilterCount,

    // Methods
    setFilter,
    removeFilter,
    clearAllFilters,
    resetFilters,
    applyFilters,
    updateUrl,

    // Presets
    savePreset,
    loadPreset,
    deletePreset,
    updatePreset,

    // Utilities
    buildFilterQuery,
    getFilterSummary,
    validateFilters,
    enableAutoApply,

    // Advanced
    initializeFilters
  };
}

/**
 * Composable for filter state management without URL sync
 * Useful for modal filters or temporary filtering
 */
export function useLocalFilters(options = {}) {
  return useFilters({
    ...options,
    syncWithUrl: false
  });
}

/**
 * Helper function to create filter group definitions
 */
export function createFilterGroup(config) {
  const defaults = {
    type: 'checkbox',
    required: false,
    options: []
  };

  return {
    ...defaults,
    ...config
  };
}

/**
 * Helper function to create common filter types
 */
export const filterTypes = {
  checkbox: (key, label, options, config = {}) => createFilterGroup({
    key,
    label,
    type: 'checkbox',
    options,
    ...config
  }),

  radio: (key, label, options, config = {}) => createFilterGroup({
    key,
    label,
    type: 'radio',
    options,
    ...config
  }),

  range: (key, label, min = 0, max = 100, config = {}) => createFilterGroup({
    key,
    label,
    type: 'range',
    min,
    max,
    step: 1,
    ...config
  }),

  dateRange: (key, label, config = {}) => createFilterGroup({
    key,
    label,
    type: 'daterange',
    ...config
  }),

  custom: (key, label, config = {}) => createFilterGroup({
    key,
    label,
    type: 'custom',
    ...config
  })
};

export default useFilters;