import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { useFilters, useLocalFilters, filterTypes } from '@/composables/useFilters.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location and history
const mockLocation = {
  pathname: '/test',
  search: ''
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

const mockHistory = {
  replaceState: vi.fn()
};
Object.defineProperty(window, 'history', {
  value: mockHistory
});

// Mock Inertia router
vi.mock('@inertiajs/vue3', () => ({
  router: {
    get: vi.fn()
  }
}));

describe('useFilters', () => {
  let filtersComposable;

  const defaultFilterGroups = [
    {
      key: 'category',
      label: 'Category',
      type: 'checkbox',
      options: [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'radio',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      key: 'price',
      label: 'Price',
      type: 'range',
      min: 0,
      max: 1000
    },
    {
      key: 'date',
      label: 'Date Range',
      type: 'daterange'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockLocation.search = '';
    
    filtersComposable = useFilters({
      filterGroups: defaultFilterGroups,
      syncWithUrl: false // Disable URL sync for most tests
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    it('initializes with correct default values', () => {
      expect(filtersComposable.filters.value).toBeDefined();
      expect(filtersComposable.appliedFilters.value).toBeDefined();
      expect(filtersComposable.filterPresets.value).toEqual([]);
      expect(filtersComposable.isLoading.value).toBe(false);
    });

    it('initializes filters with default values for each group type', () => {
      const filters = filtersComposable.filters.value;
      
      expect(filters.category).toEqual([]);
      expect(filters.status).toBe('');
      expect(filters.price).toBe(0);
      expect(filters.date_from).toBe('');
      expect(filters.date_to).toBe('');
    });

    it('initializes with provided initial filters', () => {
      const composable = useFilters({
        filterGroups: defaultFilterGroups,
        initialFilters: {
          category: ['electronics'],
          status: 'active',
          price: 500
        },
        syncWithUrl: false
      });
      
      expect(composable.filters.value.category).toEqual(['electronics']);
      expect(composable.filters.value.status).toBe('active');
      expect(composable.filters.value.price).toBe(500);
    });
  });

  describe('Computed Properties', () => {
    it('calculates hasActiveFilters correctly', () => {
      expect(filtersComposable.hasActiveFilters.value).toBe(false);
      
      filtersComposable.setFilter('category', ['electronics']);
      expect(filtersComposable.hasActiveFilters.value).toBe(true);
      
      filtersComposable.setFilter('category', []);
      expect(filtersComposable.hasActiveFilters.value).toBe(false);
    });

    it('calculates hasUnappliedChanges correctly', () => {
      expect(filtersComposable.hasUnappliedChanges.value).toBe(false);
      
      filtersComposable.setFilter('category', ['electronics']);
      expect(filtersComposable.hasUnappliedChanges.value).toBe(true);
      
      filtersComposable.applyFilters();
      expect(filtersComposable.hasUnappliedChanges.value).toBe(false);
    });

    it('calculates activeFilterCount correctly', () => {
      expect(filtersComposable.activeFilterCount.value).toBe(0);
      
      filtersComposable.setFilter('category', ['electronics', 'clothing']);
      filtersComposable.setFilter('status', 'active');
      
      expect(filtersComposable.activeFilterCount.value).toBe(3); // 2 categories + 1 status
    });
  });

  describe('Filter Methods', () => {
    it('sets filter values correctly', () => {
      filtersComposable.setFilter('category', ['electronics']);
      
      expect(filtersComposable.filters.value.category).toEqual(['electronics']);
    });

    it('removes filter values correctly', () => {
      filtersComposable.setFilter('category', ['electronics']);
      filtersComposable.setFilter('status', 'active');
      
      filtersComposable.removeFilter('category');
      filtersComposable.removeFilter('status');
      
      expect(filtersComposable.filters.value.category).toEqual([]);
      expect(filtersComposable.filters.value.status).toBe('');
    });

    it('clears all filters correctly', () => {
      filtersComposable.setFilter('category', ['electronics']);
      filtersComposable.setFilter('status', 'active');
      filtersComposable.setFilter('price', 500);
      
      filtersComposable.clearAllFilters();
      
      expect(filtersComposable.filters.value.category).toEqual([]);
      expect(filtersComposable.filters.value.status).toBe('');
      expect(filtersComposable.filters.value.price).toBe(0);
    });

    it('applies filters correctly', () => {
      filtersComposable.setFilter('category', ['electronics']);
      
      const appliedFilters = filtersComposable.applyFilters();
      
      expect(filtersComposable.appliedFilters.value.category).toEqual(['electronics']);
      expect(appliedFilters.category).toEqual(['electronics']);
    });

    it('resets filters to initial state', () => {
      const composable = useFilters({
        filterGroups: defaultFilterGroups,
        initialFilters: { category: ['electronics'] },
        syncWithUrl: false
      });
      
      composable.setFilter('category', ['clothing']);
      composable.setFilter('status', 'active');
      
      composable.resetFilters();
      
      expect(composable.filters.value.category).toEqual(['electronics']);
      expect(composable.filters.value.status).toBe('');
    });
  });

  describe('URL Synchronization', () => {
    it('loads filters from URL parameters', () => {
      mockLocation.search = '?filter_category=electronics,clothing&filter_status=active&filter_price=500';
      
      const composable = useFilters({
        filterGroups: defaultFilterGroups,
        syncWithUrl: true
      });
      
      expect(composable.filters.value.category).toEqual(['electronics', 'clothing']);
      expect(composable.filters.value.status).toBe('active');
      expect(composable.filters.value.price).toBe(500);
    });

    it('updates URL when filters are applied', () => {
      const composable = useFilters({
        filterGroups: defaultFilterGroups,
        syncWithUrl: true
      });
      
      composable.setFilter('category', ['electronics']);
      composable.setFilter('status', 'active');
      composable.applyFilters();
      
      expect(mockHistory.replaceState).toHaveBeenCalled();
    });

    it('handles date range URL parameters correctly', () => {
      mockLocation.search = '?filter_date_from=2023-01-01&filter_date_to=2023-12-31';
      
      const composable = useFilters({
        filterGroups: defaultFilterGroups,
        syncWithUrl: true
      });
      
      expect(composable.filters.value.date_from).toBe('2023-01-01');
      expect(composable.filters.value.date_to).toBe('2023-12-31');
    });
  });

  describe('Filter Presets', () => {
    it('loads presets from localStorage on initialization', () => {
      const presets = [
        { id: '1', name: 'Electronics', filters: { category: ['electronics'] } }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(presets));
      
      const composable = useFilters({
        filterGroups: defaultFilterGroups,
        syncWithUrl: false
      });
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('filter-presets');
      expect(composable.filterPresets.value).toEqual(presets);
    });

    it('saves new preset correctly', () => {
      filtersComposable.setFilter('category', ['electronics']);
      
      const preset = filtersComposable.savePreset({
        name: 'Electronics Only'
      });
      
      expect(preset.name).toBe('Electronics Only');
      expect(preset.filters.category).toEqual(['electronics']);
      expect(preset.id).toBeDefined();
      expect(preset.createdAt).toBeDefined();
      
      expect(filtersComposable.filterPresets.value).toHaveLength(1);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('updates existing preset with same name', () => {
      filtersComposable.setFilter('category', ['electronics']);
      filtersComposable.savePreset({ name: 'Test Preset' });
      
      filtersComposable.setFilter('category', ['clothing']);
      filtersComposable.savePreset({ name: 'Test Preset' });
      
      expect(filtersComposable.filterPresets.value).toHaveLength(1);
      expect(filtersComposable.filterPresets.value[0].filters.category).toEqual(['clothing']);
    });

    it('loads preset correctly', () => {
      const preset = {
        id: '1',
        name: 'Test Preset',
        filters: { category: ['electronics'], status: 'active' }
      };
      
      const result = filtersComposable.loadPreset(preset);
      
      expect(filtersComposable.filters.value.category).toEqual(['electronics']);
      expect(filtersComposable.filters.value.status).toBe('active');
      expect(result).toEqual(preset);
    });

    it('deletes preset correctly', () => {
      filtersComposable.setFilter('category', ['electronics']);
      const preset = filtersComposable.savePreset({ name: 'Test Preset' });
      
      filtersComposable.deletePreset(preset.id);
      
      expect(filtersComposable.filterPresets.value).toHaveLength(0);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('filter-presets', '[]');
    });

    it('updates preset correctly', () => {
      filtersComposable.setFilter('category', ['electronics']);
      const preset = filtersComposable.savePreset({ name: 'Test Preset' });
      
      filtersComposable.updatePreset(preset.id, { name: 'Updated Preset' });
      
      expect(filtersComposable.filterPresets.value[0].name).toBe('Updated Preset');
      expect(filtersComposable.filterPresets.value[0].updatedAt).toBeDefined();
    });
  });

  describe('Filter Query Building', () => {
    beforeEach(() => {
      filtersComposable.setFilter('category', ['electronics', 'clothing']);
      filtersComposable.setFilter('status', 'active');
      filtersComposable.setFilter('price', 500);
      filtersComposable.applyFilters();
    });

    it('builds object query correctly', () => {
      const query = filtersComposable.buildFilterQuery();
      
      expect(query.category).toEqual(['electronics', 'clothing']);
      expect(query.status).toBe('active');
      expect(query.price).toBe(500);
    });

    it('builds query string correctly', () => {
      const queryString = filtersComposable.buildFilterQuery({ format: 'query' });
      
      expect(queryString).toContain('category=electronics%2Cclothing');
      expect(queryString).toContain('status=active');
      expect(queryString).toContain('price=500');
    });

    it('builds array query correctly', () => {
      const queryArray = filtersComposable.buildFilterQuery({ format: 'array' });
      
      expect(queryArray).toContainEqual({
        key: 'category',
        value: ['electronics', 'clothing'],
        operator: 'in'
      });
      expect(queryArray).toContainEqual({
        key: 'status',
        value: 'active',
        operator: 'eq'
      });
    });

    it('excludes empty values by default', () => {
      filtersComposable.setFilter('category', []);
      filtersComposable.setFilter('status', '');
      filtersComposable.applyFilters();
      
      const query = filtersComposable.buildFilterQuery();
      
      expect(query.category).toBeUndefined();
      expect(query.status).toBeUndefined();
      expect(query.price).toBe(500); // Non-empty value should be included
    });

    it('includes empty values when requested', () => {
      filtersComposable.setFilter('category', []);
      filtersComposable.applyFilters();
      
      const query = filtersComposable.buildFilterQuery({ includeEmpty: true });
      
      expect(query.category).toEqual([]);
    });
  });

  describe('Filter Summary', () => {
    it('generates filter summary correctly', () => {
      filtersComposable.setFilter('category', ['electronics']);
      filtersComposable.setFilter('status', 'active');
      filtersComposable.applyFilters();
      
      const summary = filtersComposable.getFilterSummary();
      
      expect(summary).toHaveLength(2);
      expect(summary[0]).toMatchObject({
        group: 'Category',
        key: 'category',
        value: 'electronics',
        label: 'Electronics',
        type: 'checkbox'
      });
      expect(summary[1]).toMatchObject({
        group: 'Status',
        key: 'status',
        value: 'active',
        label: 'Active',
        type: 'radio'
      });
    });
  });

  describe('Filter Validation', () => {
    it('validates required filters', () => {
      const requiredFilterGroups = [
        {
          key: 'required_field',
          label: 'Required Field',
          type: 'checkbox',
          required: true,
          options: [{ value: 'option1', label: 'Option 1' }]
        }
      ];
      
      const composable = useFilters({
        filterGroups: requiredFilterGroups,
        syncWithUrl: false
      });
      
      const validation = composable.validateFilters();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.required_field).toBe('Required Field is required');
    });

    it('validates range filters', () => {
      const rangeFilterGroups = [
        {
          key: 'range_field',
          label: 'Range Field',
          type: 'range',
          min: 10,
          max: 100
        }
      ];
      
      const composable = useFilters({
        filterGroups: rangeFilterGroups,
        syncWithUrl: false
      });
      
      composable.setFilter('range_field', 5); // Below minimum
      
      const validation = composable.validateFilters();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.range_field).toBe('Range Field must be at least 10');
    });

    it('validates date range filters', () => {
      filtersComposable.setFilter('date_from', '2023-12-31');
      filtersComposable.setFilter('date_to', '2023-01-01');
      
      const validation = filtersComposable.validateFilters();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.date_from).toBe('From date must be before to date');
    });

    it('returns valid when all filters pass validation', () => {
      filtersComposable.setFilter('category', ['electronics']);
      filtersComposable.setFilter('price', 500);
      
      const validation = filtersComposable.validateFilters();
      
      expect(validation.isValid).toBe(true);
      expect(Object.keys(validation.errors)).toHaveLength(0);
    });
  });

  describe('Auto Apply', () => {
    it('enables auto apply with debouncing', async () => {
      const stopWatcher = filtersComposable.enableAutoApply(100);
      
      filtersComposable.setFilter('category', ['electronics']);
      
      // Should not be applied immediately
      expect(filtersComposable.hasUnappliedChanges.value).toBe(true);
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(filtersComposable.hasUnappliedChanges.value).toBe(false);
      
      // Clean up
      stopWatcher();
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(() => {
        useFilters({
          filterGroups: defaultFilterGroups,
          syncWithUrl: false
        });
      }).not.toThrow();
    });

    it('handles JSON parsing errors in presets', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const composable = useFilters({
        filterGroups: defaultFilterGroups,
        syncWithUrl: false
      });
      
      expect(composable.filterPresets.value).toEqual([]);
    });
  });
});

describe('useLocalFilters', () => {
  it('creates filters without URL synchronization', () => {
    const composable = useLocalFilters({
      filterGroups: [
        {
          key: 'category',
          label: 'Category',
          type: 'checkbox',
          options: []
        }
      ]
    });
    
    // Should not attempt to read from URL
    expect(composable.filters.value).toBeDefined();
  });
});

describe('filterTypes helpers', () => {
  it('creates checkbox filter group correctly', () => {
    const group = filterTypes.checkbox('category', 'Category', [
      { value: 'electronics', label: 'Electronics' }
    ]);
    
    expect(group).toMatchObject({
      key: 'category',
      label: 'Category',
      type: 'checkbox',
      options: [{ value: 'electronics', label: 'Electronics' }]
    });
  });

  it('creates radio filter group correctly', () => {
    const group = filterTypes.radio('status', 'Status', [
      { value: 'active', label: 'Active' }
    ]);
    
    expect(group).toMatchObject({
      key: 'status',
      label: 'Status',
      type: 'radio',
      options: [{ value: 'active', label: 'Active' }]
    });
  });

  it('creates range filter group correctly', () => {
    const group = filterTypes.range('price', 'Price', 0, 1000);
    
    expect(group).toMatchObject({
      key: 'price',
      label: 'Price',
      type: 'range',
      min: 0,
      max: 1000,
      step: 1
    });
  });

  it('creates date range filter group correctly', () => {
    const group = filterTypes.dateRange('date', 'Date Range');
    
    expect(group).toMatchObject({
      key: 'date',
      label: 'Date Range',
      type: 'daterange'
    });
  });

  it('creates custom filter group correctly', () => {
    const group = filterTypes.custom('custom', 'Custom Filter');
    
    expect(group).toMatchObject({
      key: 'custom',
      label: 'Custom Filter',
      type: 'custom'
    });
  });
});