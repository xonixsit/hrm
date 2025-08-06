import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import FilterPanel from '@/Components/Search/FilterPanel.vue';

// Mock components
vi.mock('@/Components/Base/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name'],
    template: '<span :data-icon="name"></span>'
  }
}));

vi.mock('@/Components/Search/FilterChip.vue', () => ({
  default: {
    name: 'FilterChip',
    props: ['label', 'value', 'icon', 'variant', 'disabled'],
    emits: ['remove'],
    template: `
      <div class="filter-chip" @click="$emit('remove', { label, value })">
        {{ label }}: {{ value }}
      </div>
    `
  }
}));

describe('FilterPanel', () => {
  let wrapper;

  const defaultFilterGroups = [
    {
      key: 'category',
      label: 'Category',
      type: 'checkbox',
      options: [
        { value: 'electronics', label: 'Electronics', count: 10 },
        { value: 'clothing', label: 'Clothing', count: 5 },
        { value: 'books', label: 'Books', count: 8 }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'radio',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    },
    {
      key: 'price',
      label: 'Price Range',
      type: 'range',
      min: 0,
      max: 1000,
      step: 10
    },
    {
      key: 'date',
      label: 'Date Range',
      type: 'daterange'
    }
  ];

  const defaultProps = {
    filterGroups: defaultFilterGroups
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const createWrapper = (props = {}) => {
    return mount(FilterPanel, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          Icon: true,
          FilterChip: true,
          Transition: false,
          Teleport: false
        }
      }
    });
  };

  describe('Basic Functionality', () => {
    it('renders correctly with default props', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.filter-panel').exists()).toBe(true);
      expect(wrapper.text()).toContain('Filters');
    });

    it('displays custom title when provided', () => {
      wrapper = createWrapper({ title: 'Custom Filters' });
      
      expect(wrapper.text()).toContain('Custom Filters');
    });

    it('is expanded by default when not collapsible', () => {
      wrapper = createWrapper({ collapsible: false });
      
      expect(wrapper.find('.filter-controls').exists()).toBe(true);
    });

    it('is collapsed by default when collapsible', () => {
      wrapper = createWrapper({ collapsible: true });
      
      expect(wrapper.find('.filter-controls').exists()).toBe(false);
    });

    it('is always expanded when alwaysExpanded is true', () => {
      wrapper = createWrapper({ alwaysExpanded: true });
      
      expect(wrapper.find('.filter-controls').exists()).toBe(true);
      expect(wrapper.find('[data-icon="chevron-down"]').exists()).toBe(false);
    });
  });

  describe('Filter Groups Rendering', () => {
    beforeEach(async () => {
      wrapper = createWrapper({ alwaysExpanded: true });
      await nextTick();
    });

    it('renders all filter groups', () => {
      expect(wrapper.text()).toContain('Category');
      expect(wrapper.text()).toContain('Status');
      expect(wrapper.text()).toContain('Price Range');
      expect(wrapper.text()).toContain('Date Range');
    });

    it('renders checkbox options correctly', () => {
      expect(wrapper.text()).toContain('Electronics');
      expect(wrapper.text()).toContain('Clothing');
      expect(wrapper.text()).toContain('Books');
      
      // Check for counts
      expect(wrapper.text()).toContain('(10)');
      expect(wrapper.text()).toContain('(5)');
      expect(wrapper.text()).toContain('(8)');
    });

    it('renders radio options correctly', () => {
      const radioInputs = wrapper.findAll('input[type="radio"]');
      expect(radioInputs.length).toBeGreaterThan(0);
      
      expect(wrapper.text()).toContain('Active');
      expect(wrapper.text()).toContain('Inactive');
      expect(wrapper.text()).toContain('Pending');
    });

    it('renders range slider correctly', () => {
      const rangeInput = wrapper.find('input[type="range"]');
      expect(rangeInput.exists()).toBe(true);
      expect(rangeInput.attributes('min')).toBe('0');
      expect(rangeInput.attributes('max')).toBe('1000');
      expect(rangeInput.attributes('step')).toBe('10');
    });

    it('renders date range inputs correctly', () => {
      const dateInputs = wrapper.findAll('input[type="date"]');
      expect(dateInputs.length).toBe(2); // From and To
    });
  });

  describe('Filter Interactions', () => {
    beforeEach(async () => {
      wrapper = createWrapper({ alwaysExpanded: true });
      await nextTick();
    });

    it('handles checkbox changes', async () => {
      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.setChecked(true);
      
      expect(wrapper.emitted('filter-change')).toBeTruthy();
    });

    it('handles radio changes', async () => {
      const radio = wrapper.find('input[type="radio"]');
      await radio.setChecked(true);
      
      expect(wrapper.emitted('filter-change')).toBeTruthy();
    });

    it('handles range changes', async () => {
      const range = wrapper.find('input[type="range"]');
      await range.setValue('500');
      
      expect(wrapper.emitted('filter-change')).toBeTruthy();
    });

    it('handles date range changes', async () => {
      const dateInputs = wrapper.findAll('input[type="date"]');
      await dateInputs[0].setValue('2023-01-01');
      
      expect(wrapper.emitted('filter-change')).toBeTruthy();
    });
  });

  describe('Active Filters', () => {
    it('shows active filters when showActiveFilters is true', async () => {
      wrapper = createWrapper({ 
        showActiveFilters: true,
        initialFilters: { category: ['electronics'] }
      });
      await nextTick();
      
      expect(wrapper.text()).toContain('Active Filters');
    });

    it('hides active filters when showActiveFilters is false', async () => {
      wrapper = createWrapper({ 
        showActiveFilters: false,
        initialFilters: { category: ['electronics'] }
      });
      await nextTick();
      
      expect(wrapper.text()).not.toContain('Active Filters');
    });

    it('shows clear all button when there are active filters', async () => {
      wrapper = createWrapper({ 
        showActiveFilters: true,
        initialFilters: { category: ['electronics'] }
      });
      await nextTick();
      
      expect(wrapper.text()).toContain('Clear All');
    });

    it('emits clear-filters when clear all is clicked', async () => {
      wrapper = createWrapper({ 
        showActiveFilters: true,
        initialFilters: { category: ['electronics'] }
      });
      await nextTick();
      
      const clearButton = wrapper.find('button:contains("Clear All")');
      await clearButton.trigger('click');
      
      expect(wrapper.emitted('clear-filters')).toBeTruthy();
    });
  });

  describe('Filter Actions', () => {
    beforeEach(async () => {
      wrapper = createWrapper({ alwaysExpanded: true });
      await nextTick();
    });

    it('emits apply-filters when apply button is clicked', async () => {
      const applyButton = wrapper.find('button:contains("Apply Filters")');
      await applyButton.trigger('click');
      
      expect(wrapper.emitted('apply-filters')).toBeTruthy();
    });

    it('emits reset-filters when reset button is clicked', async () => {
      const resetButton = wrapper.find('button:contains("Reset Filters")');
      await resetButton.trigger('click');
      
      expect(wrapper.emitted('reset-filters')).toBeTruthy();
    });

    it('disables buttons when disabled prop is true', async () => {
      wrapper = createWrapper({ disabled: true, alwaysExpanded: true });
      await nextTick();
      
      const applyButton = wrapper.find('button:contains("Apply Filters")');
      const resetButton = wrapper.find('button:contains("Reset Filters")');
      
      expect(applyButton.attributes('disabled')).toBeDefined();
      expect(resetButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('Collapsible Behavior', () => {
    it('toggles expanded state when toggle button is clicked', async () => {
      wrapper = createWrapper({ collapsible: true });
      
      expect(wrapper.find('.filter-controls').exists()).toBe(false);
      
      const toggleButton = wrapper.find('button[aria-label*="Expand"]');
      await toggleButton.trigger('click');
      await nextTick();
      
      expect(wrapper.find('.filter-controls').exists()).toBe(true);
    });

    it('shows correct chevron icon based on expanded state', async () => {
      wrapper = createWrapper({ collapsible: true });
      
      expect(wrapper.find('[data-icon="chevron-down"]').exists()).toBe(true);
      
      const toggleButton = wrapper.find('button');
      await toggleButton.trigger('click');
      await nextTick();
      
      expect(wrapper.find('[data-icon="chevron-up"]').exists()).toBe(true);
    });
  });

  describe('Filter Presets', () => {
    const presets = [
      { id: '1', name: 'Electronics Only', filters: { category: ['electronics'] } },
      { id: '2', name: 'Active Items', filters: { status: 'active' } }
    ];

    it('shows presets when showPresets is true and presets exist', () => {
      wrapper = createWrapper({ 
        showPresets: true,
        filterPresets: presets
      });
      
      expect(wrapper.text()).toContain('Filter Presets');
      expect(wrapper.text()).toContain('Electronics Only');
      expect(wrapper.text()).toContain('Active Items');
    });

    it('hides presets when showPresets is false', () => {
      wrapper = createWrapper({ 
        showPresets: false,
        filterPresets: presets
      });
      
      expect(wrapper.text()).not.toContain('Filter Presets');
    });

    it('emits load-preset when preset is clicked', async () => {
      wrapper = createWrapper({ 
        showPresets: true,
        filterPresets: presets
      });
      
      const presetButton = wrapper.find('button:contains("Electronics Only")');
      await presetButton.trigger('click');
      
      expect(wrapper.emitted('load-preset')).toBeTruthy();
      expect(wrapper.emitted('load-preset')[0][0]).toEqual(presets[0]);
    });

    it('emits delete-preset when delete icon is clicked', async () => {
      wrapper = createWrapper({ 
        showPresets: true,
        filterPresets: presets
      });
      
      const deleteIcon = wrapper.find('[data-icon="x"]');
      await deleteIcon.trigger('click');
      
      expect(wrapper.emitted('delete-preset')).toBeTruthy();
    });
  });

  describe('Save Preset Dialog', () => {
    beforeEach(async () => {
      wrapper = createWrapper({ 
        alwaysExpanded: true,
        showSavePreset: true,
        initialFilters: { category: ['electronics'] }
      });
      await nextTick();
    });

    it('shows save preset button when showSavePreset is true and has filters', () => {
      expect(wrapper.text()).toContain('Save Preset');
    });

    it('opens save dialog when save preset button is clicked', async () => {
      const saveButton = wrapper.find('button:contains("Save Preset")');
      await saveButton.trigger('click');
      await nextTick();
      
      expect(wrapper.text()).toContain('Save Filter Preset');
      expect(wrapper.find('#preset-name').exists()).toBe(true);
    });

    it('emits save-preset when save dialog is submitted', async () => {
      const saveButton = wrapper.find('button:contains("Save Preset")');
      await saveButton.trigger('click');
      await nextTick();
      
      const nameInput = wrapper.find('#preset-name');
      await nameInput.setValue('My Preset');
      
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      expect(wrapper.emitted('save-preset')).toBeTruthy();
      const emittedData = wrapper.emitted('save-preset')[0][0];
      expect(emittedData.name).toBe('My Preset');
    });

    it('closes save dialog when cancel is clicked', async () => {
      const saveButton = wrapper.find('button:contains("Save Preset")');
      await saveButton.trigger('click');
      await nextTick();
      
      const cancelButton = wrapper.find('button:contains("Cancel")');
      await cancelButton.trigger('click');
      await nextTick();
      
      expect(wrapper.find('#preset-name').exists()).toBe(false);
    });
  });

  describe('Initial Filters', () => {
    it('initializes with provided initial filters', async () => {
      wrapper = createWrapper({ 
        alwaysExpanded: true,
        initialFilters: { 
          category: ['electronics'],
          status: 'active',
          price: 500
        }
      });
      await nextTick();
      
      // Check checkbox is checked
      const electronicsCheckbox = wrapper.find('input[value="electronics"]');
      expect(electronicsCheckbox.element.checked).toBe(true);
      
      // Check radio is selected
      const activeRadio = wrapper.find('input[value="active"]');
      expect(activeRadio.element.checked).toBe(true);
      
      // Check range value
      const rangeInput = wrapper.find('input[type="range"]');
      expect(rangeInput.element.value).toBe('500');
    });
  });

  describe('Props Validation', () => {
    it('validates filterGroups prop structure', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const invalidGroups = [
        { key: 'invalid', type: 'invalid_type' } // Missing label and invalid type
      ];
      
      wrapper = createWrapper({ filterGroups: invalidGroups });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      wrapper = createWrapper({ alwaysExpanded: true });
      await nextTick();
    });

    it('has proper labels for form controls', () => {
      const labels = wrapper.findAll('label');
      expect(labels.length).toBeGreaterThan(0);
      
      labels.forEach(label => {
        expect(label.text().length).toBeGreaterThan(0);
      });
    });

    it('has proper aria-labels for toggle button', () => {
      wrapper = createWrapper({ collapsible: true });
      
      const toggleButton = wrapper.find('button[aria-label*="Expand"]');
      expect(toggleButton.exists()).toBe(true);
    });

    it('associates form controls with labels', () => {
      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      const radios = wrapper.findAll('input[type="radio"]');
      
      [...checkboxes, ...radios].forEach(input => {
        const label = input.element.closest('label');
        expect(label).toBeTruthy();
      });
    });
  });

  describe('Custom Slots', () => {
    it('renders custom header slot', () => {
      wrapper = mount(FilterPanel, {
        props: defaultProps,
        slots: {
          header: '<div class="custom-header">Custom Header</div>'
        },
        global: {
          stubs: {
            Icon: true,
            FilterChip: true,
            Transition: false,
            Teleport: false
          }
        }
      });
      
      expect(wrapper.find('.custom-header').exists()).toBe(true);
      expect(wrapper.text()).toContain('Custom Header');
    });

    it('renders custom filter slots', () => {
      const customFilterGroups = [
        ...defaultFilterGroups,
        {
          key: 'custom',
          label: 'Custom Filter',
          type: 'custom'
        }
      ];

      wrapper = mount(FilterPanel, {
        props: { 
          ...defaultProps,
          filterGroups: customFilterGroups,
          alwaysExpanded: true
        },
        slots: {
          'filter-custom': '<div class="custom-filter">Custom Filter Content</div>'
        },
        global: {
          stubs: {
            Icon: true,
            FilterChip: true,
            Transition: false,
            Teleport: false
          }
        }
      });
      
      expect(wrapper.find('.custom-filter').exists()).toBe(true);
      expect(wrapper.text()).toContain('Custom Filter Content');
    });
  });
});