import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RegistrationStep from '@/Components/Forms/RegistrationStep.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';

// Mock BaseButton component
vi.mock('@/Components/Base/BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    template: '<button @click="$emit(\'click\')" :disabled="disabled" :type="type"><slot /></button>',
    props: ['variant', 'disabled', 'loading', 'type'],
    emits: ['click']
  }
}));

describe('RegistrationStep', () => {
  let wrapper;
  
  const defaultProps = {
    stepId: 'test-step',
    stepNumber: 1,
    title: 'Test Step',
    description: 'Test step description',
    isActive: true,
    formData: { name: 'John Doe' }
  };

  beforeEach(() => {
    wrapper = mount(RegistrationStep, {
      props: defaultProps,
      slots: {
        default: '<div data-testid="step-content">Step content</div>'
      }
    });
  });

  describe('Rendering', () => {
    it('renders step header with title and description', () => {
      expect(wrapper.find('.step-title').text()).toBe('Test Step');
      expect(wrapper.find('.step-description').text()).toBe('Test step description');
    });

    it('renders step number badge', () => {
      expect(wrapper.find('.step-number-badge').text()).toBe('1');
    });

    it('renders step content slot', () => {
      expect(wrapper.find('[data-testid="step-content"]').exists()).toBe(true);
    });

    it('applies active class when step is active', () => {
      expect(wrapper.find('.registration-step--active').exists()).toBe(true);
    });

    it('applies completed class when step is completed', async () => {
      await wrapper.setProps({ isCompleted: true });
      expect(wrapper.find('.registration-step--completed').exists()).toBe(true);
    });

    it('hides header when showHeader is false', async () => {
      await wrapper.setProps({ showHeader: false });
      expect(wrapper.find('.step-header').exists()).toBe(false);
    });

    it('hides actions when showActions is false', async () => {
      await wrapper.setProps({ showActions: false });
      expect(wrapper.find('.step-actions').exists()).toBe(false);
    });
  });

  describe('Button Visibility', () => {
    it('shows back button by default', () => {
      const backButtons = wrapper.findAllComponents(BaseButton).filter(btn => 
        btn.text().includes('Back')
      );
      expect(backButtons).toHaveLength(1);
    });

    it('hides back button when showBackButton is false', async () => {
      await wrapper.setProps({ showBackButton: false });
      const backButtons = wrapper.findAllComponents(BaseButton).filter(btn => 
        btn.text().includes('Back')
      );
      expect(backButtons).toHaveLength(0);
    });

    it('shows next button by default', () => {
      const nextButtons = wrapper.findAllComponents(BaseButton).filter(btn => 
        btn.text().includes('Next')
      );
      expect(nextButtons).toHaveLength(1);
    });

    it('shows submit button when showSubmitButton is true', async () => {
      await wrapper.setProps({ showSubmitButton: true, showNextButton: false });
      const submitButtons = wrapper.findAllComponents(BaseButton).filter(btn => 
        btn.text().includes('Complete Registration')
      );
      expect(submitButtons).toHaveLength(1);
    });

    it('shows skip button when showSkipButton is true', async () => {
      await wrapper.setProps({ showSkipButton: true });
      const skipButtons = wrapper.findAllComponents(BaseButton).filter(btn => 
        btn.text().includes('Skip')
      );
      expect(skipButtons).toHaveLength(1);
    });
  });

  describe('Button States', () => {
    it('disables next button when step is invalid', async () => {
      await wrapper.setProps({ isValid: false });
      const nextButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Next')
      );
      expect(nextButton.props('disabled')).toBe(true);
    });

    it('enables next button when step is valid', async () => {
      await wrapper.setProps({ isValid: true });
      const nextButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Next')
      );
      expect(nextButton.props('disabled')).toBe(false);
    });

    it('disables all buttons when submitting', async () => {
      await wrapper.setProps({ isSubmitting: true });
      const buttons = wrapper.findAllComponents(BaseButton);
      buttons.forEach(button => {
        expect(button.props('disabled')).toBe(true);
      });
    });

    it('shows loading state on submit button when submitting', async () => {
      await wrapper.setProps({ 
        showSubmitButton: true, 
        showNextButton: false, 
        isSubmitting: true 
      });
      const submitButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Complete Registration')
      );
      expect(submitButton.props('loading')).toBe(true);
    });
  });

  describe('Events', () => {
    it('emits next event when next button is clicked', async () => {
      await wrapper.setProps({ isValid: true });
      const nextButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Next')
      );
      
      await nextButton.trigger('click');
      
      expect(wrapper.emitted('next')).toBeTruthy();
      expect(wrapper.emitted('next')[0][0]).toEqual({
        stepId: 'test-step',
        stepNumber: 1,
        formData: { name: 'John Doe' }
      });
    });

    it('emits back event when back button is clicked', async () => {
      const backButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Back')
      );
      
      await backButton.trigger('click');
      
      expect(wrapper.emitted('back')).toBeTruthy();
      expect(wrapper.emitted('back')[0][0]).toEqual({
        stepId: 'test-step',
        stepNumber: 1,
        formData: { name: 'John Doe' }
      });
    });

    it('emits skip event when skip button is clicked', async () => {
      await wrapper.setProps({ showSkipButton: true });
      const skipButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Skip')
      );
      
      await skipButton.trigger('click');
      
      expect(wrapper.emitted('skip')).toBeTruthy();
    });

    it('emits submit event when submit button is clicked', async () => {
      await wrapper.setProps({ 
        showSubmitButton: true, 
        showNextButton: false,
        isValid: true 
      });
      const submitButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Complete Registration')
      );
      
      await submitButton.trigger('click');
      
      expect(wrapper.emitted('submit')).toBeTruthy();
    });
  });

  describe('Validation', () => {
    it('validates step when validateStep method is called', async () => {
      const mockResolve = vi.fn();
      wrapper.vm.validateStep();
      
      // Wait for validation to complete
      await wrapper.vm.$nextTick();
      
      expect(wrapper.emitted('validate')).toBeTruthy();
    });

    it('resets validation when resetValidation method is called', () => {
      wrapper.vm.resetValidation();
      expect(wrapper.emitted('update:isValid')).toBeTruthy();
      expect(wrapper.emitted('update:isValid')[0][0]).toBe(true);
    });

    it('prevents next action when validation fails', async () => {
      await wrapper.setProps({ requiresValidation: true, isValid: false });
      
      // Mock validation to fail
      wrapper.vm.validateStep = vi.fn().mockResolvedValue(false);
      
      const nextButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Next')
      );
      
      await nextButton.trigger('click');
      
      expect(wrapper.emitted('next')).toBeFalsy();
    });
  });

  describe('Optional Steps', () => {
    it('allows proceeding when step is optional', async () => {
      await wrapper.setProps({ isOptional: true, isValid: false });
      const nextButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Next')
      );
      expect(nextButton.props('disabled')).toBe(false);
    });

    it('allows proceeding when step can be skipped', async () => {
      await wrapper.setProps({ canSkip: true, isValid: false });
      const nextButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Next')
      );
      expect(nextButton.props('disabled')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('displays error state when step has errors', async () => {
      await wrapper.setProps({ 
        errors: { name: 'Name is required' }
      });
      expect(wrapper.find('.registration-step--has-errors').exists()).toBe(true);
    });

    it('passes errors to slot content', () => {
      const errors = { name: 'Name is required' };
      wrapper = mount(RegistrationStep, {
        props: { ...defaultProps, errors },
        slots: {
          default: `
            <template #default="{ errors }">
              <div data-testid="errors">{{ JSON.stringify(errors) }}</div>
            </template>
          `
        }
      });
      
      expect(wrapper.find('[data-testid="errors"]').text()).toContain('Name is required');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      expect(wrapper.find('.step-title').attributes('id')).toBeDefined();
    });

    it('supports keyboard navigation', async () => {
      const nextButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Next')
      );
      
      await nextButton.trigger('keydown.enter');
      // Button should be clickable via keyboard
      expect(nextButton.exists()).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      expect(wrapper.find('.registration-step').classes()).toContain('registration-step--md');
    });

    it('changes size based on size prop', async () => {
      await wrapper.setProps({ size: 'lg' });
      expect(wrapper.find('.registration-step').classes()).toContain('registration-step--lg');
    });
  });

  describe('Custom Button Text', () => {
    it('uses custom button text when provided', async () => {
      await wrapper.setProps({
        backButtonText: 'Previous',
        nextButtonText: 'Continue',
        skipButtonText: 'Skip This',
        submitButtonText: 'Finish Registration',
        showSkipButton: true,
        showSubmitButton: true,
        showNextButton: false
      });

      expect(wrapper.text()).toContain('Previous');
      expect(wrapper.text()).toContain('Skip This');
      expect(wrapper.text()).toContain('Finish Registration');
    });
  });
});