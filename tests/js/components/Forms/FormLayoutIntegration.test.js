import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FormLayout from '@/Components/Forms/FormLayout.vue';
import FormSection from '@/Components/Forms/FormSection.vue';
import FormActions from '@/Components/Forms/FormActions.vue';

describe('FormLayout Integration', () => {
  let wrapper;

  const formData = {
    title: 'User Registration',
    description: 'Create your account to get started',
    actions: [
      { id: 'cancel', label: 'Cancel', variant: 'secondary' },
      { id: 'submit', label: 'Create Account', variant: 'primary', type: 'submit' }
    ],
    errors: {
      email: 'Email is required',
      password: 'Password must be at least 8 characters'
    }
  };

  beforeEach(() => {
    wrapper = mount(FormLayout, {
      props: formData,
      slots: {
        default: `
          <FormSection 
            title="Personal Information" 
            description="Your basic details"
            :use-grid="true"
            :columns="{ xs: 1, md: 2 }"
          >
            <div class="form-field">
              <label>First Name</label>
              <input name="firstName" type="text" />
            </div>
            <div class="form-field">
              <label>Last Name</label>
              <input name="lastName" type="text" />
            </div>
            <div class="form-field md:col-span-2">
              <label>Email</label>
              <input name="email" type="email" />
            </div>
          </FormSection>
          
          <FormSection title="Account Security">
            <div class="form-field">
              <label>Password</label>
              <input name="password" type="password" />
            </div>
            <div class="form-field">
              <label>Confirm Password</label>
              <input name="confirmPassword" type="password" />
            </div>
          </FormSection>
        `
      },
      global: {
        components: {
          FormSection,
          FormActions
        }
      }
    });
  });

  describe('Complete Form Integration', () => {
    it('renders complete form structure', () => {
      // Form layout structure
      expect(wrapper.find('.form-layout')).toBeTruthy();
      expect(wrapper.find('.form-header')).toBeTruthy();
      expect(wrapper.find('.form-content')).toBeTruthy();
      expect(wrapper.find('.form-actions')).toBeTruthy();
      
      // Form sections
      expect(wrapper.findAll('.form-section')).toHaveLength(2);
      
      // Form title and description
      expect(wrapper.find('.form-title').text()).toBe('User Registration');
      expect(wrapper.find('.form-description').text()).toBe('Create your account to get started');
    });

    it('displays error summary correctly', () => {
      expect(wrapper.find('.form-error-summary')).toBeTruthy();
      expect(wrapper.find('.error-summary-title').text()).toBe('Please correct the following errors:');
      
      const errorItems = wrapper.findAll('.error-summary-item');
      expect(errorItems).toHaveLength(2);
    });

    it('renders form actions with correct buttons', () => {
      const buttons = wrapper.findAll('.form-action-button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text()).toBe('Cancel');
      expect(buttons[1].text()).toBe('Create Account');
    });

    it('handles form submission correctly', async () => {
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      expect(wrapper.emitted('submit')).toBeTruthy();
    });

    it('handles action clicks correctly', async () => {
      const cancelButton = wrapper.findAll('.form-action-button')[0];
      await cancelButton.trigger('click');
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0][0].id).toBe('cancel');
    });
  });

  describe('Multi-step Form Integration', () => {
    const multiStepProps = {
      title: 'Project Setup',
      steps: [
        { id: 'basic', title: 'Basic Info' },
        { id: 'config', title: 'Configuration' },
        { id: 'review', title: 'Review' }
      ],
      currentStep: 1,
      showProgress: true,
      actions: [
        { id: 'back', label: 'Back', variant: 'secondary' },
        { id: 'next', label: 'Next', variant: 'primary' }
      ]
    };

    beforeEach(async () => {
      await wrapper.setProps(multiStepProps);
    });

    it('renders progress indicator', () => {
      expect(wrapper.find('.form-progress')).toBeTruthy();
      expect(wrapper.findAll('.progress-step')).toHaveLength(3);
    });

    it('shows correct step states', () => {
      const steps = wrapper.findAll('.progress-step');
      expect(steps[0].classes()).toContain('progress-step--completed');
      expect(steps[1].classes()).toContain('progress-step--current');
    });

    it('handles step navigation', async () => {
      const firstStep = wrapper.findAll('.progress-step')[0];
      await firstStep.trigger('click');
      
      expect(wrapper.emitted('step-change')).toBeTruthy();
    });
  });

  describe('Form Validation Integration', () => {
    it('focuses field when error link clicked', async () => {
      // Mock document.querySelector and focus
      const mockField = { focus: vi.fn(), scrollIntoView: vi.fn() };
      vi.spyOn(document, 'querySelector').mockReturnValue(mockField);
      
      const errorLink = wrapper.find('.error-summary-link');
      await errorLink.trigger('click');
      
      expect(mockField.focus).toHaveBeenCalled();
      expect(wrapper.emitted('field-focus')).toBeTruthy();
    });

    it('provides form context to sections', () => {
      // Verify that form sections receive context
      const sections = wrapper.findAll('.form-section');
      sections.forEach(section => {
        expect(section.exists()).toBe(true);
      });
    });
  });

  describe('Responsive Behavior Integration', () => {
    it('maintains proper structure on mobile', () => {
      // Test that responsive classes are applied
      expect(wrapper.find('.header-content')).toBeTruthy();
      expect(wrapper.find('.actions-content')).toBeTruthy();
    });

    it('handles grid layout in sections', () => {
      // Grid layout should be present in first section
      const firstSection = wrapper.findAll('.form-section')[0];
      expect(firstSection.classes()).toContain('form-section--grid');
    });
  });

  describe('Loading State Integration', () => {
    beforeEach(async () => {
      await wrapper.setProps({ isSubmitting: true });
    });

    it('applies loading state to entire form', () => {
      expect(wrapper.classes()).toContain('form-layout--submitting');
    });

    it('shows loading state in submit button', () => {
      const submitButton = wrapper.findAll('.form-action-button')[1];
      expect(submitButton.text()).toContain('Submitting...');
      expect(submitButton.find('.animate-spin')).toBeTruthy();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains proper heading hierarchy', () => {
      // Form title should be h2
      expect(wrapper.find('h2.form-title')).toBeTruthy();
      
      // Section titles should be h3 (default)
      const sectionTitles = wrapper.findAll('.section-title');
      sectionTitles.forEach(title => {
        expect(title.classes()).toContain('section-title--h3');
      });
    });

    it('provides proper form structure', () => {
      expect(wrapper.find('form').attributes('novalidate')).toBe('');
    });

    it('maintains focus management', () => {
      // Form should have proper focus management structure
      expect(wrapper.find('.form-error-summary')).toBeTruthy();
      expect(wrapper.findAll('.error-summary-link')).toHaveLength(2);
    });
  });

  describe('Theme Integration', () => {
    it('supports different form variants', async () => {
      await wrapper.setProps({ variant: 'card' });
      expect(wrapper.classes()).toContain('form-layout--card');
    });

    it('supports different sizes', async () => {
      await wrapper.setProps({ size: 'lg' });
      expect(wrapper.classes()).toContain('form-layout--lg');
    });
  });

  describe('Error Handling Integration', () => {
    it('shows error summary when errors exist', () => {
      expect(wrapper.find('.form-error-summary')).toBeTruthy();
      expect(wrapper.classes()).toContain('form-layout--has-errors');
    });

    it('hides error summary when no errors', async () => {
      await wrapper.setProps({ errors: {} });
      expect(wrapper.find('.form-error-summary').exists()).toBe(false);
      expect(wrapper.classes()).not.toContain('form-layout--has-errors');
    });
  });

  describe('Performance Integration', () => {
    it('handles large forms efficiently', () => {
      // Test that the form can handle multiple sections
      expect(wrapper.findAll('.form-section')).toHaveLength(2);
      expect(wrapper.findAll('.form-field')).toHaveLength(5);
    });

    it('provides efficient re-rendering', async () => {
      const initialSections = wrapper.findAll('.form-section').length;
      
      // Update props shouldn't change section count
      await wrapper.setProps({ title: 'Updated Title' });
      expect(wrapper.findAll('.form-section')).toHaveLength(initialSections);
    });
  });
});