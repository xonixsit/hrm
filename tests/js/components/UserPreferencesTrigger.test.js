import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import UserPreferencesTrigger from '@/Components/UserPreferencesTrigger.vue';

// Mock Icon component
vi.mock('@/Components/Base/Icon.vue', () => ({
  default: {
    name: 'Icon',
    template: '<span class="mock-icon" :data-name="name" :data-size="size"></span>',
    props: ['name', 'size'],
  },
}));

// Mock UserPreferences component
vi.mock('@/Components/UserPreferences.vue', () => ({
  default: {
    name: 'UserPreferences',
    template: '<div class="mock-user-preferences" v-if="isOpen" @click="$emit(\'close\')">Mock Preferences Modal</div>',
    props: ['isOpen'],
    emits: ['close', 'save'],
  },
}));

describe('UserPreferencesTrigger', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(UserPreferencesTrigger, {
      props: {
        ...props,
      },
      global: {
        stubs: {
          Icon: true,
          UserPreferences: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('rendering', () => {
    it('should render trigger button', () => {
      wrapper = createWrapper();
      
      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
    });

    it('should render with default props', () => {
      wrapper = createWrapper();
      
      const icon = wrapper.find('.mock-icon');
      expect(icon.attributes('data-name')).toBe('cog');
      expect(icon.attributes('data-size')).toBe('md');
      
      expect(wrapper.text()).toContain('Preferences');
    });

    it('should render with custom props', () => {
      wrapper = createWrapper({
        triggerIcon: 'settings',
        triggerLabel: 'Settings',
        iconSize: 'lg',
        showLabel: false,
      });
      
      const icon = wrapper.find('.mock-icon');
      expect(icon.attributes('data-name')).toBe('settings');
      expect(icon.attributes('data-size')).toBe('lg');
      
      expect(wrapper.text()).not.toContain('Settings');
    });

    it('should apply custom trigger class', () => {
      wrapper = createWrapper({
        triggerClass: 'custom-class',
      });
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('custom-class');
    });

    it('should set title attribute', () => {
      wrapper = createWrapper({
        triggerTitle: 'Custom title',
      });
      
      const button = wrapper.find('button');
      expect(button.attributes('title')).toBe('Custom title');
    });
  });

  describe('label visibility', () => {
    it('should show label when showLabel is true', () => {
      wrapper = createWrapper({
        showLabel: true,
        triggerLabel: 'Test Label',
      });
      
      expect(wrapper.text()).toContain('Test Label');
    });

    it('should hide label when showLabel is false', () => {
      wrapper = createWrapper({
        showLabel: false,
        triggerLabel: 'Test Label',
      });
      
      expect(wrapper.text()).not.toContain('Test Label');
    });
  });

  describe('modal interaction', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should not show preferences modal initially', () => {
      const modal = wrapper.find('.mock-user-preferences');
      expect(modal.exists()).toBe(false);
    });

    it('should open preferences modal when button is clicked', async () => {
      const button = wrapper.find('button');
      await button.trigger('click');
      
      expect(wrapper.vm.isPreferencesOpen).toBe(true);
      
      await nextTick();
      const modal = wrapper.find('.mock-user-preferences');
      expect(modal.exists()).toBe(true);
    });

    it('should close preferences modal when close event is emitted', async () => {
      // Open modal first
      const button = wrapper.find('button');
      await button.trigger('click');
      expect(wrapper.vm.isPreferencesOpen).toBe(true);
      
      // Close modal
      await wrapper.vm.closePreferences();
      expect(wrapper.vm.isPreferencesOpen).toBe(false);
    });

    it('should handle preferences save and close', async () => {
      const mockPreferences = { theme: 'dark', fontSize: 'large' };
      
      // Open modal first
      const button = wrapper.find('button');
      await button.trigger('click');
      
      // Trigger save
      await wrapper.vm.handlePreferencesSave(mockPreferences);
      
      expect(wrapper.emitted('preferences-saved')).toBeTruthy();
      expect(wrapper.emitted('preferences-saved')[0][0]).toEqual(mockPreferences);
      expect(wrapper.vm.isPreferencesOpen).toBe(false);
    });
  });

  describe('events', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should emit preferences-opened when modal is opened', async () => {
      const button = wrapper.find('button');
      await button.trigger('click');
      
      expect(wrapper.emitted('preferences-opened')).toBeTruthy();
      expect(wrapper.emitted('preferences-opened')).toHaveLength(1);
    });

    it('should emit preferences-closed when modal is closed', async () => {
      // Open modal first
      await wrapper.vm.openPreferences();
      
      // Close modal
      await wrapper.vm.closePreferences();
      
      expect(wrapper.emitted('preferences-closed')).toBeTruthy();
      expect(wrapper.emitted('preferences-closed')).toHaveLength(1);
    });

    it('should emit preferences-saved when preferences are saved', async () => {
      const mockPreferences = { theme: 'dark' };
      
      await wrapper.vm.handlePreferencesSave(mockPreferences);
      
      expect(wrapper.emitted('preferences-saved')).toBeTruthy();
      expect(wrapper.emitted('preferences-saved')[0][0]).toEqual(mockPreferences);
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should have proper button attributes', () => {
      const button = wrapper.find('button');
      
      expect(button.attributes('title')).toBe('Open user preferences');
    });

    it('should have focus styles', () => {
      const button = wrapper.find('button');
      
      expect(button.classes()).toContain('focus:outline-none');
      expect(button.classes()).toContain('focus:ring-2');
      expect(button.classes()).toContain('focus:ring-primary-500');
    });

    it('should be keyboard accessible', async () => {
      const button = wrapper.find('button');
      
      // Simulate Enter key press
      await button.trigger('keydown.enter');
      // Button click should still work normally
      await button.trigger('click');
      
      expect(wrapper.vm.isPreferencesOpen).toBe(true);
    });
  });

  describe('styling', () => {
    it('should apply default styling classes', () => {
      wrapper = createWrapper();
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('inline-flex');
      expect(button.classes()).toContain('items-center');
      expect(button.classes()).toContain('px-3');
      expect(button.classes()).toContain('py-2');
      expect(button.classes()).toContain('text-sm');
      expect(button.classes()).toContain('font-medium');
      expect(button.classes()).toContain('rounded-lg');
      expect(button.classes()).toContain('transition-colors');
    });

    it('should apply hover styles', () => {
      wrapper = createWrapper();
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('hover:bg-neutral-100');
      expect(button.classes()).toContain('hover:text-neutral-900');
    });

    it('should merge custom classes with default classes', () => {
      wrapper = createWrapper({
        triggerClass: ['custom-class', 'another-class'],
      });
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('custom-class');
      expect(button.classes()).toContain('another-class');
      expect(button.classes()).toContain('inline-flex'); // Default class should still be there
    });

    it('should handle object-style custom classes', () => {
      wrapper = createWrapper({
        triggerClass: {
          'custom-class': true,
          'inactive-class': false,
        },
      });
      
      const button = wrapper.find('button');
      expect(button.classes()).toContain('custom-class');
      expect(button.classes()).not.toContain('inactive-class');
    });
  });

  describe('icon configuration', () => {
    it('should render icon with correct size', () => {
      wrapper = createWrapper({
        iconSize: 'lg',
      });
      
      const icon = wrapper.find('.mock-icon');
      expect(icon.attributes('data-size')).toBe('lg');
    });

    it('should render icon with correct name', () => {
      wrapper = createWrapper({
        triggerIcon: 'settings',
      });
      
      const icon = wrapper.find('.mock-icon');
      expect(icon.attributes('data-name')).toBe('settings');
    });

    it('should position icon correctly with label', () => {
      wrapper = createWrapper({
        showLabel: true,
        triggerLabel: 'Settings',
      });
      
      const icon = wrapper.find('.mock-icon');
      const label = wrapper.find('span');
      
      expect(icon.exists()).toBe(true);
      expect(label.exists()).toBe(true);
      expect(label.classes()).toContain('ml-2');
    });
  });

  describe('component integration', () => {
    it('should pass correct props to UserPreferences component', async () => {
      wrapper = createWrapper();
      
      // Open modal
      await wrapper.vm.openPreferences();
      await nextTick();
      
      const preferencesComponent = wrapper.findComponent({ name: 'UserPreferences' });
      expect(preferencesComponent.exists()).toBe(true);
      expect(preferencesComponent.props('isOpen')).toBe(true);
    });

    it('should handle UserPreferences close event', async () => {
      wrapper = createWrapper();
      
      // Open modal
      await wrapper.vm.openPreferences();
      await nextTick();
      
      // Simulate close event from UserPreferences
      const preferencesComponent = wrapper.findComponent({ name: 'UserPreferences' });
      await preferencesComponent.vm.$emit('close');
      
      expect(wrapper.vm.isPreferencesOpen).toBe(false);
      expect(wrapper.emitted('preferences-closed')).toBeTruthy();
    });

    it('should handle UserPreferences save event', async () => {
      wrapper = createWrapper();
      const mockPreferences = { theme: 'dark' };
      
      // Open modal
      await wrapper.vm.openPreferences();
      await nextTick();
      
      // Simulate save event from UserPreferences
      const preferencesComponent = wrapper.findComponent({ name: 'UserPreferences' });
      await preferencesComponent.vm.$emit('save', mockPreferences);
      
      expect(wrapper.emitted('preferences-saved')).toBeTruthy();
      expect(wrapper.emitted('preferences-saved')[0][0]).toEqual(mockPreferences);
      expect(wrapper.vm.isPreferencesOpen).toBe(false);
    });
  });
});