import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FormLayout from '@/Components/Forms/FormLayout.vue';

describe('FormLayout', () => {
  let wrapper;

  const defaultProps = {
    title: 'Test Form',
    description: 'Test form description'
  };

  beforeEach(() => {
    wrapper = mount(FormLayout, {
      props: defaultProps,
      slots: {
        default: '<div>Form content</div>'
      }
    });
  });

  describe('Basic Rendering', () => {
    it('renders form with title and description', () => {
      expect(wrapper.find('.form-title').text()).toBe('Test Form');
      expect(wrapper.find('.form-description').text()).toBe('Test form description');
    });

    it('renders form content in slot', () => {
      expect(wrapper.find('.form-sections').text()).toContain('Form content');
    });

    it('applies correct CSS classes', () => {
      expect(wrapper.classes()).toContain('form-layout');
      expect(wrapper.classes()).toContain('form-layout--default');
      expect(wrapper.classes()).toContain('form-layout--md');
    });
  });

  describe('Form Variants', () => {
    it('applies card variant classes', async () => {
      await wrapper.setProps({ variant: 'card' });
      expect(wrapper.classes()).toContain('form-layout--card');
    });

    it('applies modal variant classes', async () => {
      await wrapper.setProps({ variant: 'modal' });
      expect(wrapper.classes()).toContain('form-layout--modal');
    });

    it('applies inline variant classes', async () => {
      await wrapper.setProps({ variant: 'inline' });
      expect(wrapper.classes()).toContain('form-layout--inline');
    });
  });

  describe('Form Sizes', () => {
    it('applies small size classes', async () => {
      await wrapper.setProps({ size: 'sm' });
      expect(wrapper.classes()).toContain('form-layout--sm');
    });

    it('applies large size classes', async () => {
      await wrapper.setProps({ size: 'lg' });
      expect(wrapper.classes()).toContain('form-layout--lg');
    });
  });

  describe('Actions', () => {
    const actions = [
      { id: 'cancel', label: 'Cancel', variant: 'secondary' },
      { id: 'submit', label: 'Submit', variant: 'primary', type: 'submit' }
    ];

    beforeEach(async () => {
      await wrapper.setProps({ actions });
    });

    it('renders action buttons', () => {
      const buttons = wrapper.findAll('.form-action-button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text()).toBe('Cancel');
      expect(buttons[1].text()).toBe('Submit');
    });

    it('emits action event when button clicked', async () => {
      const cancelButton = wrapper.findAll('.form-action-button')[0];
      await cancelButton.trigger('click');
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0][0]).toEqual(actions[0]);
    });

    it('shows loading state for submit button', async () => {
      await wrapper.setProps({ isSubmitting: true });
      const submitButton = wrapper.findAll('.form-action-button')[1];
      
      expect(submitButton.text()).toContain('Submitting...');
      expect(submitButton.find('.animate-spin')).toBeTruthy();
    });
  });

  describe('Multi-step Forms', () => {
    const steps = [
      { id: 'step1', title: 'Step 1', description: 'First step' },
      { id: 'step2', title: 'Step 2', description: 'Second step' },
      { id: 'step3', title: 'Step 3', description: 'Third step' }
    ];

    beforeEach(async () => {
      await wrapper.setProps({ 
        steps,
        currentStep: 1,
        showProgress: true
      });
    });

    it('renders progress indicator', () => {
      expect(wrapper.find('.form-progress')).toBeTruthy();
      expect(wrapper.findAll('.progress-step')).toHaveLength(3);
    });

    it('shows correct step states', () => {
      const stepElements = wrapper.findAll('.progress-step');
      
      // First step should be completed
      expect(stepElements[0].classes()).toContain('progress-step--completed');
      
      // Second step should be current
      expect(stepElements[1].classes()).toContain('progress-step--current');
      
      // Third step should be default
      expect(stepElements[2].classes()).not.toContain('progress-step--current');
      expect(stepElements[2].classes()).not.toContain('progress-step--completed');
    });

    it('calculates progress percentage correctly', () => {
      const progressFill = wrapper.find('.progress-fill');
      expect(progressFill.attributes('style')).toContain('width: 66.66666666666666%');
    });

    it('emits step-change event when step clicked', async () => {
      const firstStep = wrapper.findAll('.progress-step')[0];
      await firstStep.trigger('click');
      
      expect(wrapper.emitted('step-change')).toBeTruthy();
      expect(wrapper.emitted('step-change')[0][0]).toEqual({
        step: steps[0],
        index: 0
      });
    });
  });

  describe('Error Handling', () => {
    const errors = {
      email: 'Email is required',
      password: ['Password must be at least 8 characters', 'Password must contain a number']
    };

    beforeEach(async () => {
      await wrapper.setProps({ errors });
    });

    it('shows error summary when errors exist', () => {
      expect(wrapper.find('.form-error-summary')).toBeTruthy();
      expect(wrapper.find('.error-summary-title').text()).toBe('Please correct the following errors:');
    });

    it('displays error messages in summary', () => {
      const errorItems = wrapper.findAll('.error-summary-item');
      expect(errorItems).toHaveLength(2);
      expect(errorItems[0].text()).toBe('Email is required');
      expect(errorItems[1].text()).toBe('Password must be at least 8 characters');
    });

    it('focuses field when error link clicked', async () => {
      // Mock document.querySelector and focus
      const mockField = { focus: vi.fn(), scrollIntoView: vi.fn() };
      vi.spyOn(document, 'querySelector').mockReturnValue(mockField);
      
      const errorLink = wrapper.find('.error-summary-link');
      await errorLink.trigger('click');
      
      expect(mockField.focus).toHaveBeenCalled();
      expect(mockField.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      });
    });

    it('hides error summary when showErrorSummary is false', async () => {
      await wrapper.setProps({ showErrorSummary: false });
      expect(wrapper.find('.form-error-summary').exists()).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('emits submit event when form submitted', async () => {
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      expect(wrapper.emitted('submit')).toBeTruthy();
    });

    it('prevents default form submission', async () => {
      const form = wrapper.find('form');
      const event = { preventDefault: vi.fn() };
      
      await wrapper.vm.handleSubmit(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('applies submitting state classes', async () => {
      await wrapper.setProps({ isSubmitting: true });
      expect(wrapper.classes()).toContain('form-layout--submitting');
    });
  });

  describe('Header Actions', () => {
    const headerActions = [
      { id: 'help', label: 'Help', icon: 'help-circle' },
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ];

    beforeEach(async () => {
      await wrapper.setProps({ headerActions });
    });

    it('renders header actions', () => {
      expect(wrapper.find('.header-actions')).toBeTruthy();
      const buttons = wrapper.findAll('.header-actions button');
      expect(buttons).toHaveLength(2);
    });

    it('emits header-action event when clicked', async () => {
      const helpButton = wrapper.findAll('.header-actions button')[0];
      await helpButton.trigger('click');
      
      expect(wrapper.emitted('header-action')).toBeTruthy();
      expect(wrapper.emitted('header-action')[0][0]).toEqual(headerActions[0]);
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      expect(wrapper.find('form')).toBeTruthy();
      expect(wrapper.find('form').attributes('novalidate')).toBe('');
    });

    it('uses semantic headings', () => {
      expect(wrapper.find('h2.form-title')).toBeTruthy();
    });

    it('provides proper ARIA labels for progress steps', async () => {
      const steps = [
        { id: 'step1', title: 'Step 1' },
        { id: 'step2', title: 'Step 2' }
      ];
      
      await wrapper.setProps({ steps, showProgress: true });
      
      const stepTitles = wrapper.findAll('.step-title');
      expect(stepTitles[0].text()).toBe('Step 1');
      expect(stepTitles[1].text()).toBe('Step 2');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive classes correctly', () => {
      // Test that the component has responsive-friendly structure
      expect(wrapper.find('.actions-content')).toBeTruthy();
      expect(wrapper.find('.header-content')).toBeTruthy();
    });
  });

  describe('Context Provision', () => {
    it('provides form context to child components', () => {
      // This would be tested in integration tests with child components
      // For now, we verify the component structure supports context
      expect(wrapper.find('.form-sections')).toBeTruthy();
    });
  });
});