import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import AdvancedSearch from '@/Components/Search/AdvancedSearch.vue';

// Mock components
vi.mock('@/Components/Base/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name'],
    template: '<span :data-icon="name"></span>'
  }
}));

vi.mock('@/Components/Base/BaseInput.vue', () => ({
  default: {
    name: 'BaseInput',
    props: ['modelValue', 'placeholder', 'disabled', 'size', 'type', 'id'],
    emits: ['update:modelValue'],
    template: `
      <input 
        :value="modelValue" 
        :placeholder="placeholder"
        :disabled="disabled"
        :type="type || 'text'"
        :id="id"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    `
  }
}));

vi.mock('@/Components/Base/BaseSelect.vue', () => ({
  default: {
    name: 'BaseSelect',
    props: ['modelValue', 'options', 'placeholder', 'disabled', 'size', 'id'],
    emits: ['update:modelValue'],
    template: `
      <select 
        :value="modelValue" 
        :disabled="disabled"
        :id="id"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    `
  }
}));

vi.mock('@/Components/Base/BaseMultiSelect.vue', () => ({
  default: {
    name: 'BaseMultiSelect',
    props: ['modelValue', 'options', 'placeholder', 'disabled', 'size', 'id'],
    emits: ['update:modelValue'],
    template: `
      <div>
        <select multiple :disabled="disabled" :id="id">
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    `
  }
}));

vi.mock('@/Components/Base/BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    props: ['type', 'variant', 'size', 'loading', 'disabled'],
    template: `
      <button 
        :type="type || 'button'" 
        :disabled="disabled || loading"
        :class="[variant, size]"
      >
        <slot />
      </button>
    `
  }
}));

describe('AdvancedSearch', () => {
  let wrapper;

  const defaultSearchFields = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter name'
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'fruit', label: 'Fruit' },
        { value: 'vegetable', label: 'Vegetable' }
      ],
      placeholder: 'Select category'
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date'
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      placeholder: 'Enter price'
    },
    {
      key: 'tags',
      label: 'Tags',
      type: 'multiselect',
      options: [
        { value: 'organic', label: 'Organic' },
        { value: 'fresh', label: 'Fresh' }
      ],
      placeholder: 'Select tags'
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange'
    },
    {
      key: 'priceRange',
      label: 'Price Range',
      type: 'numberrange'
    }
  ];

  const defaultProps = {
    searchFields: defaultSearchFields
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
    return mount(AdvancedSearch, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          Icon: true,
          BaseInput: true,
          BaseSelect: true,
          BaseMultiSelect: true,
          BaseButton: true,
          Transition: false,
          Teleport: false
        }
      }
    });
  };

  describe('Basic Functionality', () => {
    it('renders correctly with default props', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('button').text()).toContain('Show Advanced Search');
      expect(wrapper.find('.advanced-search').exists()).toBe(true);
    });

    it('toggles expanded state when toggle button is clicked', async () => {
      wrapper = createWrapper();
      const toggleButton = wrapper.find('button');
      
      expect(wrapper.text()).toContain('Show Advanced Search');
      
      await toggleButton.trigger('click');
      await nextTick();
      
      expect(wrapper.text()).toContain('Hide Advanced Search');
      expect(wrapper.find('form').exists()).toBe(true);
    });

    it('is always expanded when alwaysExpanded prop is true', () => {
      wrapper = createWrapper({ alwaysExpanded: true });
      
      expect(wrapper.find('form').exists()).toBe(true);
      expect(wrapper.find('button').exists()).toBe(false);
    });
  });

  describe('Search Fields Rendering', () => {
    beforeEach(async () => {
      wrapper = createWrapper({ alwaysExpanded: true });
      await nextTick();
    });

    it('renders all search field types correctly', () => {
      // Text input
      const nameField = wrapper.find('#name');
      expect(nameField.exists()).toBe(true);
      expect(nameField.attributes('type')).toBe('text');

      // Select input
      const categoryField = wrapper.find('#category');
      expect(categoryField.exists()).toBe(true);

      // Date input
      const dateField = wrapper.find('#date');
      expect(dateField.exists()).toBe(true);
      expect(dateField.attributes('type')).toBe('date');

      // Number input
      const priceField = wrapper.find('#price');
      expect(priceField.exists()).toBe(true);
      expect(priceField.attributes('type')).toBe('number');

      // Multi-select
      const tagsField = wrapper.find('#tags');
      expect(tagsField.exists()).toBe(true);
    });

    it('renders date range fields correctly', () => {
      const dateRangeFromField = wrapper.find('#dateRange_from');
      const dateRangeToField = wrapper.find('#dateRange_to');
      
      expect(dateRangeFromField.exists()).toBe(true);
      expect(dateRangeToField.exists()).toBe(true);
      expect(dateRangeFromField.attributes('type')).toBe('date');
      expect(dateRangeToField.attributes('type')).toBe('date');
    });

    it('renders number range fields correctly', () => {
      const priceRangeMinField = wrapper.find('#priceRange_min');
      const priceRangeMaxField = wrapper.find('#priceRange_max');
      
      expect(priceRangeMinField.exists()).toBe(true);
      expect(priceRangeMaxField.exists()).toBe(true);
      expect(priceRangeMinField.attributes('type')).toBe('number');
      expect(priceRangeMaxField.attributes('type')).toBe('number');
    });

    it('shows required asterisk for required fields', () => {
      const requiredFields = [
        {
          key: 'required_field',
          label: 'Required Field',
          type: 'text',
          required: true
        }
      ];

      wrapper = createWrapper({ 
        searchFields: requiredFields,
        alwaysExpanded: true 
      });

      expect(wrapper.text()).toContain('Required Field *');
    });

    it('shows help text when provided', () => {
      const fieldsWithHelp = [
        {
          key: 'field_with_help',
          label: 'Field with Help',
          type: 'text',
          helpText: 'This is helpful information'
        }
      ];

      wrapper = createWrapper({ 
        searchFields: fieldsWithHelp,
        alwaysExpanded: true 
      });

      expect(wrapper.text()).toContain('This is helpful information');
    });
  });

  describe('Search Options', () => {
    beforeEach(async () => {
      wrapper = createWrapper({ 
        alwaysExpanded: true,
        showOperators: true 
      });
      await nextTick();
    });

    it('renders search options when showOperators is true', () => {
      expect(wrapper.text()).toContain('Search Options');
      expect(wrapper.text()).toContain('Match all criteria');
      expect(wrapper.text()).toContain('Case sensitive');
      expect(wrapper.text()).toContain('Exact match');
    });

    it('toggles search options correctly', async () => {
      const matchAllCheckbox = wrapper.find('input[type="checkbox"]');
      
      expect(matchAllCheckbox.element.checked).toBe(true); // Default value
      
      await matchAllCheckbox.setChecked(false);
      
      expect(matchAllCheckbox.element.checked).toBe(false);
    });
  });

  describe('Saved Searches', () => {
    const savedSearches = [
      {
        id: '1',
        name: 'Fruit Search',
        criteria: { category: 'fruit' },
        options: { matchAll: true }
      },
      {
        id: '2',
        name: 'Price Range Search',
        criteria: { priceRange_min: '10', priceRange_max: '50' },
        options: { matchAll: false }
      }
    ];

    beforeEach(async () => {
      wrapper = createWrapper({ 
        alwaysExpanded: true,
        showSavedSearches: true,
        savedSearches
      });
      await nextTick();
    });

    it('renders saved searches when available', () => {
      expect(wrapper.text()).toContain('Saved Searches');
      expect(wrapper.text()).toContain('Fruit Search');
      expect(wrapper.text()).toContain('Price Range Search');
    });

    it('loads saved search when clicked', async () => {
      const fruitSearchButton = wrapper.find('button:contains("Fruit Search")');
      
      await fruitSearchButton.trigger('click');
      
      expect(wrapper.emitted('load-search')).toBeTruthy();
      expect(wrapper.emitted('load-search')[0][0]).toEqual(savedSearches[0]);
    });

    it('deletes saved search when delete icon is clicked', async () => {
      const deleteButtons = wrapper.findAll('[data-icon="x"]');
      
      await deleteButtons[0].trigger('click');
      
      expect(wrapper.emitted('delete-search')).toBeTruthy();
      expect(wrapper.emitted('delete-search')[0][0]).toBe('1');
    });
  });

  describe('Form Submission', () => {
    beforeEach(async () => {
      wrapper = createWrapper({ alwaysExpanded: true });
      await nextTick();
    });

    it('emits search event when form is submitted', async () => {
      const form = wrapper.find('form');
      
      // Fill in some search criteria
      const nameInput = wrapper.find('#name');
      await nameInput.setValue('Apple');
      
      await form.trigger('submit');
      
      expect(wrapper.emitted('search')).toBeTruthy();
      const searchData = wrapper.emitted('search')[0][0];
      expect(searchData.criteria).toEqual({ name: 'Apple' });
      expect(searchData.options).toBeDefined();
    });

    it('clears all fields when clear button is clicked', async () => {
      // Fill in some data
      const nameInput = wrapper.find('#name');
      await nameInput.setValue('Apple');
      
      const clearButton = wrapper.find('button:contains("Clear All")');
      await clearButton.trigger('click');
      
      expect(wrapper.emitted('clear')).toBeTruthy();
      expect(nameInput.element.value).toBe('');
    });

    it('disables search button when no criteria are provided', async () => {
      const searchButton = wrapper.find('button[type="submit"]');
      
      expect(searchButton.attributes('disabled')).toBeDefined();
    });

    it('enables search button when criteria are provided', async () => {
      const nameInput = wrapper.find('#name');
      await nameInput.setValue('Apple');
      await nextTick();
      
      const searchButton = wrapper.find('button[type="submit"]');
      
      expect(searchButton.attributes('disabled')).toBeUndefined();
    });
  });

  describe('Save Search Dialog', () => {
    beforeEach(async () => {
      wrapper = createWrapper({ 
        alwaysExpanded: true,
        showSaveSearch: true 
      });
      await nextTick();
      
      // Add some search criteria to enable save button
      const nameInput = wrapper.find('#name');
      await nameInput.setValue('Apple');
      await nextTick();
    });

    it('shows save search button when criteria exist', () => {
      const saveButton = wrapper.find('button:contains("Save Search")');
      expect(saveButton.exists()).toBe(true);
    });

    it('opens save dialog when save button is clicked', async () => {
      const saveButton = wrapper.find('button:contains("Save Search")');
      await saveButton.trigger('click');
      await nextTick();
      
      expect(wrapper.text()).toContain('Save Search');
      expect(wrapper.find('#search-name').exists()).toBe(true);
    });

    it('saves search when save dialog is submitted', async () => {
      const saveButton = wrapper.find('button:contains("Save Search")');
      await saveButton.trigger('click');
      await nextTick();
      
      const nameInput = wrapper.find('#search-name');
      await nameInput.setValue('My Saved Search');
      
      const saveForm = wrapper.find('form:last-of-type');
      await saveForm.trigger('submit');
      
      expect(wrapper.emitted('save-search')).toBeTruthy();
      const savedData = wrapper.emitted('save-search')[0][0];
      expect(savedData.name).toBe('My Saved Search');
      expect(savedData.criteria).toEqual({ name: 'Apple' });
    });

    it('closes save dialog when cancel is clicked', async () => {
      const saveButton = wrapper.find('button:contains("Save Search")');
      await saveButton.trigger('click');
      await nextTick();
      
      const cancelButton = wrapper.find('button:contains("Cancel")');
      await cancelButton.trigger('click');
      await nextTick();
      
      expect(wrapper.find('#search-name').exists()).toBe(false);
    });
  });

  describe('Initial Criteria', () => {
    it('initializes with provided initial criteria', async () => {
      const initialCriteria = {
        name: 'Initial Name',
        category: 'fruit'
      };
      
      wrapper = createWrapper({ 
        alwaysExpanded: true,
        initialCriteria 
      });
      await nextTick();
      
      const nameInput = wrapper.find('#name');
      const categorySelect = wrapper.find('#category');
      
      expect(nameInput.element.value).toBe('Initial Name');
      expect(categorySelect.element.value).toBe('fruit');
    });
  });

  describe('Loading and Disabled States', () => {
    it('shows loading state on search button when loading', async () => {
      wrapper = createWrapper({ 
        alwaysExpanded: true,
        loading: true 
      });
      await nextTick();
      
      const searchButton = wrapper.find('button[type="submit"]');
      expect(searchButton.attributes('disabled')).toBeDefined();
    });

    it('disables all inputs when disabled prop is true', async () => {
      wrapper = createWrapper({ 
        alwaysExpanded: true,
        disabled: true 
      });
      await nextTick();
      
      const inputs = wrapper.findAll('input, select');
      inputs.forEach(input => {
        expect(input.attributes('disabled')).toBeDefined();
      });
    });
  });

  describe('Props Validation', () => {
    it('validates searchFields prop structure', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const invalidFields = [
        { key: 'invalid', type: 'invalid_type' } // Missing label and invalid type
      ];
      
      wrapper = createWrapper({ searchFields: invalidFields });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      wrapper = createWrapper({ alwaysExpanded: true });
      await nextTick();
    });

    it('has proper labels for all form fields', () => {
      const labels = wrapper.findAll('label');
      const inputs = wrapper.findAll('input, select');
      
      expect(labels.length).toBeGreaterThan(0);
      
      labels.forEach(label => {
        const forAttr = label.attributes('for');
        if (forAttr) {
          const associatedInput = wrapper.find(`#${forAttr}`);
          expect(associatedInput.exists()).toBe(true);
        }
      });
    });

    it('has proper form structure', () => {
      const form = wrapper.find('form');
      expect(form.exists()).toBe(true);
      
      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.exists()).toBe(true);
    });
  });
});