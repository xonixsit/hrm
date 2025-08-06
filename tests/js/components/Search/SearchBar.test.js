import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import SearchBar from '@/Components/Search/SearchBar.vue';

// Mock Icon component
vi.mock('@/Components/Base/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name'],
    template: '<span :data-icon="name"></span>'
  }
}));

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

describe('SearchBar', () => {
  let wrapper;

  const defaultProps = {
    placeholder: 'Search...',
    suggestions: [
      { id: 1, text: 'Apple', category: 'Fruit' },
      { id: 2, text: 'Banana', category: 'Fruit' },
      { id: 3, text: 'Carrot', category: 'Vegetable' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const createWrapper = (props = {}) => {
    return mount(SearchBar, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          Icon: true,
          Transition: false
        }
      }
    });
  };

  describe('Basic Functionality', () => {
    it('renders correctly with default props', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('input[type="search"]').exists()).toBe(true);
      expect(wrapper.find('input').attributes('placeholder')).toBe('Search...');
      expect(wrapper.find('[data-icon="search"]').exists()).toBe(true);
    });

    it('updates v-model when typing', async () => {
      wrapper = createWrapper({ modelValue: '' });
      const input = wrapper.find('input');
      
      await input.setValue('test query');
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['test query']);
    });

    it('shows clear button when there is text', async () => {
      wrapper = createWrapper({ modelValue: 'test' });
      
      expect(wrapper.find('button[aria-label="Clear search"]').exists()).toBe(true);
    });

    it('clears input when clear button is clicked', async () => {
      wrapper = createWrapper({ modelValue: 'test' });
      const clearButton = wrapper.find('button[aria-label="Clear search"]');
      
      await clearButton.trigger('click');
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('clear')).toBeTruthy();
    });
  });

  describe('Suggestions', () => {
    it('shows suggestions when input is focused and has minimum length', async () => {
      wrapper = createWrapper({ minSearchLength: 1 });
      const input = wrapper.find('input');
      
      await input.setValue('a');
      await input.trigger('focus');
      await nextTick();
      
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    });

    it('hides suggestions when input is blurred', async () => {
      wrapper = createWrapper();
      const input = wrapper.find('input');
      
      await input.setValue('apple');
      await input.trigger('focus');
      await nextTick();
      
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
      
      await input.trigger('blur');
      await new Promise(resolve => setTimeout(resolve, 200)); // Wait for blur delay
      await nextTick();
      
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    });

    it('highlights matching text in suggestions', async () => {
      wrapper = createWrapper();
      const input = wrapper.find('input');
      
      await input.setValue('app');
      await input.trigger('focus');
      await nextTick();
      
      const suggestionButtons = wrapper.findAll('[role="option"]');
      expect(suggestionButtons.length).toBeGreaterThan(0);
      
      // Check if Apple suggestion contains highlighted text
      const appleSuggestion = suggestionButtons.find(btn => 
        btn.text().includes('Apple')
      );
      expect(appleSuggestion).toBeTruthy();
    });

    it('selects suggestion when clicked', async () => {
      wrapper = createWrapper();
      const input = wrapper.find('input');
      
      await input.setValue('app');
      await input.trigger('focus');
      await nextTick();
      
      const firstSuggestion = wrapper.find('[role="option"]');
      await firstSuggestion.trigger('click');
      
      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('search')).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates suggestions with arrow keys', async () => {
      wrapper = createWrapper();
      const input = wrapper.find('input');
      
      await input.setValue('a');
      await input.trigger('focus');
      await nextTick();
      
      // Arrow down should highlight first suggestion
      await input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      
      const highlightedSuggestion = wrapper.find('.bg-primary-50');
      expect(highlightedSuggestion.exists()).toBe(true);
    });

    it('selects highlighted suggestion with Enter key', async () => {
      wrapper = createWrapper();
      const input = wrapper.find('input');
      
      await input.setValue('apple');
      await input.trigger('focus');
      await nextTick();
      
      // Navigate to first suggestion and select
      await input.trigger('keydown', { key: 'ArrowDown' });
      await input.trigger('keydown', { key: 'Enter' });
      
      expect(wrapper.emitted('select')).toBeTruthy();
    });

    it('closes suggestions with Escape key', async () => {
      wrapper = createWrapper();
      const input = wrapper.find('input');
      
      await input.setValue('apple');
      await input.trigger('focus');
      await nextTick();
      
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
      
      await input.trigger('keyup', { key: 'Escape' });
      await nextTick();
      
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    });
  });

  describe('Recent Searches', () => {
    it('loads recent searches from localStorage on mount', () => {
      const recentSearches = [
        { text: 'previous search', timestamp: Date.now() }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(recentSearches));
      
      wrapper = createWrapper({ showRecentSearches: true });
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('searchbar-recent-searches');
    });

    it('shows recent searches when input is focused with empty query', async () => {
      const recentSearches = [
        { text: 'previous search', timestamp: Date.now() }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(recentSearches));
      
      wrapper = createWrapper({ showRecentSearches: true });
      const input = wrapper.find('input');
      
      await input.trigger('focus');
      await nextTick();
      
      expect(wrapper.text()).toContain('Recent Searches');
      expect(wrapper.text()).toContain('previous search');
    });

    it('saves search to recent searches when selected', async () => {
      wrapper = createWrapper({ showRecentSearches: true });
      const input = wrapper.find('input');
      
      await input.setValue('apple');
      await input.trigger('focus');
      await nextTick();
      
      const firstSuggestion = wrapper.find('[role="option"]');
      await firstSuggestion.trigger('click');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'searchbar-recent-searches',
        expect.stringContaining('Apple')
      );
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when loading prop is true', async () => {
      wrapper = createWrapper({ loading: true });
      const input = wrapper.find('input');
      
      await input.setValue('test');
      await input.trigger('focus');
      await nextTick();
      
      expect(wrapper.text()).toContain('Searching...');
      expect(wrapper.find('.animate-spin').exists()).toBe(true);
    });
  });

  describe('Debouncing', () => {
    it('debounces search events', async () => {
      const searchSpy = vi.fn();
      wrapper = createWrapper({ 
        debounceMs: 100,
        onSearch: searchSpy
      });
      
      const input = wrapper.find('input');
      
      // Type multiple characters quickly
      await input.setValue('a');
      await input.setValue('ap');
      await input.setValue('app');
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(wrapper.emitted('search')).toBeTruthy();
      // Should only emit once due to debouncing
      expect(wrapper.emitted('search').length).toBe(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      wrapper = createWrapper();
      const input = wrapper.find('input');
      
      expect(input.attributes('role')).toBe('combobox');
      expect(input.attributes('aria-expanded')).toBe('false');
      
      await input.setValue('test');
      await input.trigger('focus');
      await nextTick();
      
      expect(input.attributes('aria-expanded')).toBe('true');
      expect(input.attributes('aria-owns')).toBeTruthy();
    });

    it('sets aria-activedescendant when suggestion is highlighted', async () => {
      wrapper = createWrapper();
      const input = wrapper.find('input');
      
      await input.setValue('apple');
      await input.trigger('focus');
      await nextTick();
      
      await input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      
      expect(input.attributes('aria-activedescendant')).toBeTruthy();
    });

    it('has proper role attributes on suggestions', async () => {
      wrapper = createWrapper();
      const input = wrapper.find('input');
      
      await input.setValue('apple');
      await input.trigger('focus');
      await nextTick();
      
      const listbox = wrapper.find('[role="listbox"]');
      const options = wrapper.findAll('[role="option"]');
      
      expect(listbox.exists()).toBe(true);
      expect(options.length).toBeGreaterThan(0);
      
      options.forEach(option => {
        expect(option.attributes('aria-selected')).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      // Should not throw error
      expect(() => {
        wrapper = createWrapper({ showRecentSearches: true });
      }).not.toThrow();
    });

    it('shows no results message when suggestions are empty', async () => {
      wrapper = createWrapper({ suggestions: [] });
      const input = wrapper.find('input');
      
      await input.setValue('nonexistent');
      await input.trigger('focus');
      await nextTick();
      
      expect(wrapper.text()).toContain('No results found');
    });
  });

  describe('Props Validation', () => {
    it('validates size prop', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      wrapper = createWrapper({ size: 'invalid' });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('uses default values for optional props', () => {
      wrapper = createWrapper({});
      
      expect(wrapper.find('input').attributes('placeholder')).toBe('Search...');
      expect(wrapper.vm.minSearchLength).toBe(1);
      expect(wrapper.vm.debounceMs).toBe(300);
    });
  });
});