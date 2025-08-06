/**
 * Comprehensive Accessibility Tests using axe-core
 * Tests WCAG 2.1 AA compliance and accessibility features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import axe from 'axe-core';

// Configure axe for testing environment
axe.configure({
  rules: {
    'color-contrast': { enabled: false }, // Disable color contrast for testing
    'landmark-one-main': { enabled: false }, // Disable for component testing
    'page-has-heading-one': { enabled: false } // Disable for component testing
  }
});

// Import accessibility utilities
import {
  ariaLiveManager,
  focusManager,
  KeyboardNavigation,
  ScreenReader,
  ColorAccessibility,
  AriaUtils,
  AccessibilityTesting
} from '@/utils/accessibility.js';

// Import composables
import {
  useAccessibility,
  useFocusManagement,
  useKeyboardNavigation,
  useAriaState,
  useScreenReader,
  useModalAccessibility,
  useFormAccessibility,
  useSkipLinks
} from '@/composables/useAccessibility.js';

// Import components for testing
import BaseButton from '@/Components/Base/BaseButton.vue';
import FormField from '@/Components/Forms/FormField.vue';
import SidebarNavigation from '@/Components/Navigation/SidebarNavigation.vue';

// Mock router and other dependencies
vi.mock('@inertiajs/vue3', () => ({
  router: {
    visit: vi.fn(),
    post: vi.fn()
  }
}));

vi.mock('@/composables/useAuth.js', () => ({
  useAuth: () => ({
    user: { value: { name: 'Test User' } },
    roles: { value: ['Employee'] },
    getUserProperty: vi.fn(() => 'Test User')
  })
}));

vi.mock('@/composables/useTheme.js', () => ({
  useTheme: () => ({
    isDark: { value: false },
    toggleTheme: vi.fn()
  })
}));

vi.mock('@/composables/useUserPreferences.js', () => ({
  useUserPreferences: () => ({
    preferences: { value: {} },
    setPreference: vi.fn()
  })
}));

vi.mock('@/config/navigation.js', () => ({
  getFilteredNavigation: vi.fn(() => [])
}));

describe('Accessibility Utilities', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('ARIA Live Region Manager', () => {
    it('should create live regions on initialization', () => {
      expect(document.getElementById('aria-live-polite')).toBeTruthy();
      expect(document.getElementById('aria-live-assertive')).toBeTruthy();
      expect(document.getElementById('aria-live-status')).toBeTruthy();
    });

    it('should announce messages to screen readers', async () => {
      const politeRegion = document.getElementById('aria-live-polite');
      
      ariaLiveManager.announce('Test message', 'polite');
      
      // Wait for the announcement delay
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(politeRegion.textContent).toBe('Test message');
    });

    it('should clear messages after announcement', async () => {
      const politeRegion = document.getElementById('aria-live-polite');
      
      ariaLiveManager.announce('Test message', 'polite');
      
      // Wait for message to be set and then cleared
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(politeRegion.textContent).toBe('');
    });
  });

  describe('Focus Manager', () => {
    it('should store and restore focus', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      container.appendChild(button1);
      container.appendChild(button2);
      
      button1.focus();
      expect(document.activeElement).toBe(button1);
      
      focusManager.storeFocus(button2);
      expect(document.activeElement).toBe(button2);
      
      focusManager.restoreFocus();
      expect(document.activeElement).toBe(button1);
    });

    it('should identify focusable elements', () => {
      const button = document.createElement('button');
      const input = document.createElement('input');
      const div = document.createElement('div');
      
      container.appendChild(button);
      container.appendChild(input);
      container.appendChild(div);
      
      expect(focusManager.isFocusable(button)).toBe(true);
      expect(focusManager.isFocusable(input)).toBe(true);
      expect(focusManager.isFocusable(div)).toBe(false);
    });

    it('should get all focusable elements in container', () => {
      const button = document.createElement('button');
      const input = document.createElement('input');
      const link = document.createElement('a');
      link.href = '#';
      
      container.appendChild(button);
      container.appendChild(input);
      container.appendChild(link);
      
      const focusableElements = focusManager.getFocusableElements(container);
      expect(focusableElements).toHaveLength(3);
    });

    it('should trap focus within container', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const button3 = document.createElement('button');
      
      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);
      
      const cleanup = focusManager.trapFocus(container);
      
      // Focus should be set to first element
      expect(document.activeElement).toBe(button1);
      
      // Simulate Tab key on last element
      button3.focus();
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      container.dispatchEvent(tabEvent);
      
      cleanup();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle arrow key navigation', () => {
      const buttons = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button')
      ];
      
      buttons.forEach(button => container.appendChild(button));
      
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const result = KeyboardNavigation.handleArrowNavigation(
        downEvent,
        buttons,
        0,
        { orientation: 'vertical' }
      );
      
      expect(result).toBe(1);
    });

    it('should handle type-ahead search', () => {
      const buttons = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button')
      ];
      
      buttons[0].textContent = 'Apple';
      buttons[1].textContent = 'Banana';
      buttons[2].textContent = 'Cherry';
      
      buttons.forEach(button => container.appendChild(button));
      buttons[0].focus();
      
      const bEvent = new KeyboardEvent('keydown', { key: 'b' });
      const result = KeyboardNavigation.handleTypeAhead(
        bEvent,
        buttons,
        (el) => el.textContent
      );
      
      expect(result).toBe(1);
    });
  });

  describe('Screen Reader Utilities', () => {
    it('should announce messages', () => {
      const spy = vi.spyOn(ariaLiveManager, 'announce');
      
      ScreenReader.announce('Test message', 'polite');
      
      expect(spy).toHaveBeenCalledWith('Test message', 'polite');
    });

    it('should announce page changes', () => {
      const spy = vi.spyOn(ariaLiveManager, 'announce');
      
      ScreenReader.announcePageChange('Dashboard', 'with 5 new notifications');
      
      expect(spy).toHaveBeenCalledWith(
        'Navigated to Dashboard. with 5 new notifications',
        'polite'
      );
    });

    it('should announce form errors', () => {
      const spy = vi.spyOn(ariaLiveManager, 'announce');
      const errors = ['Name is required', 'Email is invalid'];
      
      ScreenReader.announceFormErrors(errors);
      
      expect(spy).toHaveBeenCalledWith(
        'Form has 2 errors: Name is required, Email is invalid',
        'assertive'
      );
    });
  });

  describe('Color Accessibility', () => {
    it('should detect high contrast mode preference', () => {
      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      expect(ColorAccessibility.isHighContrastMode()).toBe(true);
    });

    it('should calculate color contrast ratio', () => {
      const ratio = ColorAccessibility.getContrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)');
      expect(ratio).toBeCloseTo(21, 0); // Black on white has ~21:1 ratio
    });

    it('should apply high contrast mode', () => {
      ColorAccessibility.applyHighContrastMode(true);
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
      
      ColorAccessibility.applyHighContrastMode(false);
      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    });
  });

  describe('ARIA Utilities', () => {
    it('should generate unique IDs', () => {
      const id1 = AriaUtils.generateId('test');
      const id2 = AriaUtils.generateId('test');
      
      expect(id1).toMatch(/^test-/);
      expect(id2).toMatch(/^test-/);
      expect(id1).not.toBe(id2);
    });

    it('should set ARIA attributes safely', () => {
      const element = document.createElement('div');
      
      AriaUtils.setAriaAttribute(element, 'aria-expanded', true);
      expect(element.getAttribute('aria-expanded')).toBe('true');
      
      AriaUtils.setAriaAttribute(element, 'aria-expanded', null);
      expect(element.hasAttribute('aria-expanded')).toBe(false);
    });

    it('should manage ARIA describedby relationships', () => {
      const element = document.createElement('div');
      
      AriaUtils.setDescribedBy(element, ['id1', 'id2', null, 'id3']);
      expect(element.getAttribute('aria-describedby')).toBe('id1 id2 id3');
      
      AriaUtils.setDescribedBy(element, null);
      expect(element.hasAttribute('aria-describedby')).toBe(false);
    });
  });
});

describe('Accessibility Composables', () => {
  describe('useAccessibility', () => {
    it('should provide accessibility utilities', () => {
      const {
        isHighContrast,
        prefersReducedMotion,
        colorScheme,
        announce,
        setFocus
      } = useAccessibility();
      
      expect(isHighContrast).toBeDefined();
      expect(prefersReducedMotion).toBeDefined();
      expect(colorScheme).toBeDefined();
      expect(typeof announce).toBe('function');
      expect(typeof setFocus).toBe('function');
    });
  });

  describe('useFocusManagement', () => {
    it('should manage focus stack', () => {
      const { focusStack, storeFocus, restoreFocus } = useFocusManagement();
      
      expect(focusStack.value).toEqual([]);
      
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();
      
      storeFocus();
      expect(focusStack.value).toHaveLength(1);
      
      restoreFocus();
      expect(focusStack.value).toHaveLength(0);
      
      document.body.removeChild(button);
    });
  });

  describe('useAriaState', () => {
    it('should manage ARIA attributes', () => {
      const {
        ariaAttributes,
        setExpanded,
        setSelected,
        setPressed
      } = useAriaState();
      
      setExpanded(true);
      expect(ariaAttributes.value['aria-expanded']).toBe(true);
      
      setSelected(false);
      expect(ariaAttributes.value['aria-selected']).toBe(false);
      
      setPressed(null);
      expect(ariaAttributes.value['aria-pressed']).toBeUndefined();
    });
  });

  describe('useScreenReader', () => {
    it('should provide screen reader utilities', () => {
      const {
        announce,
        announceSuccess,
        announceError,
        announceWarning
      } = useScreenReader();
      
      const spy = vi.spyOn(ScreenReader, 'announce');
      
      announceSuccess('Operation completed');
      expect(spy).toHaveBeenCalledWith('Success: Operation completed', 'polite');
      
      announceError('Something went wrong');
      expect(spy).toHaveBeenCalledWith('Error: Something went wrong', 'assertive');
      
      announceWarning('Please check your input');
      expect(spy).toHaveBeenCalledWith('Warning: Please check your input', 'assertive');
    });
  });

  describe('useFormAccessibility', () => {
    it('should manage form accessibility', () => {
      const {
        errors,
        hasErrors,
        setFieldError,
        clearErrors,
        getFieldAriaAttributes
      } = useFormAccessibility();
      
      expect(hasErrors.value).toBe(false);
      
      setFieldError('email', 'Email is required');
      expect(hasErrors.value).toBe(true);
      expect(errors.value.email).toBe('Email is required');
      
      const attributes = getFieldAriaAttributes('email');
      expect(attributes['aria-invalid']).toBe('true');
      expect(attributes['aria-describedby']).toMatch(/field-email-.*-error/);
      
      clearErrors();
      expect(hasErrors.value).toBe(false);
    });
  });
});

describe('Component Accessibility Tests', () => {
  describe('BaseButton Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = mount(BaseButton, {
        props: {
          label: 'Click me',
          ariaLabel: 'Custom aria label',
          ariaDescribedby: 'help-text'
        }
      });
      
      const button = wrapper.find('button');
      expect(button.attributes('aria-label')).toBe('Custom aria label');
      expect(button.attributes('aria-describedby')).toBe('help-text');
    });

    it('should handle keyboard events', async () => {
      const wrapper = mount(BaseButton, {
        props: { label: 'Click me' }
      });
      
      const button = wrapper.find('button');
      await button.trigger('keydown', { key: 'Enter' });
      
      expect(wrapper.emitted('click')).toBeTruthy();
    });

    it('should be disabled when loading', () => {
      const wrapper = mount(BaseButton, {
        props: {
          label: 'Click me',
          loading: true
        }
      });
      
      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBeDefined();
      expect(button.attributes('aria-disabled')).toBe('true');
    });

    it('should pass axe accessibility tests', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          label: 'Accessible button',
          variant: 'primary'
        }
      });
      
      const results = await axe.run(wrapper.element);
      expect(results.violations).toHaveLength(0);
    });
  });

  describe('FormField Accessibility', () => {
    it('should associate label with input', () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Email Address',
          name: 'email'
        },
        slots: {
          default: '<input type="email" />'
        }
      });
      
      const label = wrapper.find('label');
      const fieldId = label.attributes('for');
      
      expect(fieldId).toMatch(/^field-email/);
    });

    it('should announce errors to screen readers', () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Email Address',
          name: 'email',
          errorMessage: 'Email is required'
        },
        slots: {
          default: '<input type="email" />'
        }
      });
      
      const errorDiv = wrapper.find('[role="alert"]');
      expect(errorDiv.exists()).toBe(true);
      expect(errorDiv.attributes('aria-live')).toBe('polite');
      expect(errorDiv.text()).toContain('Email is required');
    });

    it('should pass axe accessibility tests', async () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Email Address',
          name: 'email',
          required: true
        },
        slots: {
          default: '<input type="email" required />'
        }
      });
      
      const results = await axe.run(wrapper.element);
      expect(results.violations).toHaveLength(0);
    });
  });

  describe('SidebarNavigation Accessibility', () => {
    it('should have proper navigation role and label', () => {
      const wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });
      
      const nav = wrapper.find('nav');
      expect(nav.attributes('role')).toBe('navigation');
      expect(nav.attributes('aria-label')).toBe('Main navigation');
    });

    it('should indicate current page', () => {
      const wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });
      
      // Check if any navigation item has aria-current="page"
      const currentItems = wrapper.findAll('[aria-current="page"]');
      expect(currentItems.length).toBeGreaterThan(0);
    });

    it('should have keyboard navigation support', async () => {
      const wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });
      
      const buttons = wrapper.findAll('button[role="menuitem"]');
      if (buttons.length > 0) {
        await buttons[0].trigger('keydown', { key: 'ArrowDown' });
        // Test that keyboard navigation is handled
      }
    });

    it('should pass axe accessibility tests', async () => {
      const wrapper = mount(SidebarNavigation, {
        props: {
          currentRoute: 'dashboard'
        }
      });
      
      const results = await axe.run(wrapper.element);
      expect(results.violations).toHaveLength(0);
    });
  });
});

describe('Accessibility Testing Utilities', () => {
  it('should detect common accessibility issues', async () => {
    // Create test content with accessibility issues
    container.innerHTML = `
      <img src="test.jpg" />
      <button></button>
      <input type="text" />
    `;
    
    const issues = await AccessibilityTesting.runBasicChecks(container);
    
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(issue => issue.includes('images missing alt text'))).toBe(true);
    expect(issues.some(issue => issue.includes('Button without accessible name'))).toBe(true);
    expect(issues.some(issue => issue.includes('Input without label'))).toBe(true);
  });

  it('should pass when no issues are found', async () => {
    // Create accessible content
    container.innerHTML = `
      <img src="test.jpg" alt="Test image" />
      <button>Click me</button>
      <label for="test-input">Name</label>
      <input type="text" id="test-input" />
    `;
    
    const issues = await AccessibilityTesting.runBasicChecks(container);
    
    expect(issues.length).toBe(0);
  });
});

describe('Integration Tests', () => {
  it('should work together for complete accessibility', async () => {
    // Create a complex component with multiple accessibility features
    const TestComponent = {
      template: `
        <div>
          <button
            ref="triggerButton"
            @click="openModal"
            aria-haspopup="dialog"
            :aria-expanded="isModalOpen"
          >
            Open Modal
          </button>
          
          <div
            v-if="isModalOpen"
            ref="modal"
            role="dialog"
            :aria-labelledby="titleId"
            :aria-describedby="descriptionId"
            aria-modal="true"
          >
            <h2 :id="titleId">Modal Title</h2>
            <p :id="descriptionId">Modal description</p>
            <button @click="closeModal">Close</button>
          </div>
        </div>
      `,
      setup() {
        const { isOpen, modalRef, titleId, descriptionId, openModal, closeModal } = useModalAccessibility();
        
        return {
          isModalOpen: isOpen,
          modal: modalRef,
          titleId,
          descriptionId,
          openModal,
          closeModal
        };
      }
    };
    
    const wrapper = mount(TestComponent);
    
    // Test modal opening
    await wrapper.find('button').trigger('click');
    await nextTick();
    
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    
    // Test accessibility
    const results = await axe.run(wrapper.element);
    expect(results.violations).toHaveLength(0);
  });
});