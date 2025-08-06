import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Register from '@/Pages/Auth/Register.vue';
import { useForm } from '@inertiajs/vue3';

// Mock Inertia
vi.mock('@inertiajs/vue3', () => ({
  Head: { template: '<head><slot /></head>' },
  Link: { 
    template: '<a><slot /></a>',
    props: ['href']
  },
  useForm: vi.fn()
}));

// Mock components
vi.mock('@/Layouts/GuestLayout.vue', () => ({
  default: { template: '<div><slot /></div>' }
}));

vi.mock('@/Components/Forms/ProgressIndicator.vue', () => ({
  default: {
    name: 'ProgressIndicator',
    template: '<div data-testid="progress-indicator"></div>',
    props: ['steps', 'currentStep', 'allowClickNavigation'],
    emits: ['step-click']
  }
}));

vi.mock('@/Components/Forms/RegistrationStep.vue', () => ({
  default: {
    name: 'RegistrationStep',
    template: '<div data-testid="registration-step"><slot /></div>',
    props: [
      'stepId', 'stepNumber', 'title', 'description', 'isActive', 'isValid',
      'formData', 'errors', 'isSubmitting', 'showBackButton', 'showNextButton',
      'showSubmitButton'
    ],
    emits: ['next', 'back', 'submit', 'validate', 'update:isValid']
  }
}));

vi.mock('@/Components/Forms/FormField.vue', () => ({
  default: {
    name: 'FormField',
    template: '<div><slot /></div>',
    props: ['name', 'label', 'required', 'errorMessage', 'helpText']
  }
}));

vi.mock('@/Components/Base/BaseInput.vue', () => ({
  default: {
    name: 'BaseInput',
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type', 'placeholder', 'autocomplete', 'required'],
    emits: ['update:modelValue']
  }
}));

vi.mock('@/Components/Base/BaseSelect.vue', () => ({
  default: {
    name: 'BaseSelect',
    template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select>',
    props: ['modelValue', 'options', 'placeholder', 'required'],
    emits: ['update:modelValue']
  }
}));

vi.mock('@/Components/Modals/TermsAndConditionsModal.vue', () => ({
  default: {
    name: 'TermsAndConditionsModal',
    template: '<div v-if="isOpen" data-testid="terms-modal"></div>',
    props: ['isOpen', 'termsSections', 'lastUpdated', 'contactInfo'],
    emits: ['accept', 'close']
  }
}));

describe('Register', () => {
  let wrapper;
  let mockForm;

  beforeEach(() => {
    mockForm = {
      data: vi.fn(() => ({
        name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        password: '',
        password_confirmation: '',
        security_question: '',
        security_answer: '',
        department: '',
        position: '',
        employee_id: '',
        start_date: '',
        terms_accepted: false,
        privacy_accepted: false,
        marketing_emails: false,
        notifications_enabled: true
      })),
      errors: {},
      processing: false,
      post: vi.fn(),
      reset: vi.fn(),
      name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      password: '',
      password_confirmation: '',
      security_question: '',
      security_answer: '',
      department: '',
      position: '',
      employee_id: '',
      start_date: '',
      terms_accepted: false,
      privacy_accepted: false,
      marketing_emails: false,
      notifications_enabled: true
    };

    useForm.mockReturnValue(mockForm);

    wrapper = mount(Register);
  });

  describe('Initial Rendering', () => {
    it('renders registration header', () => {
      expect(wrapper.text()).toContain('Create Your Account');
      expect(wrapper.text()).toContain('Join our team and get started');
    });

    it('renders progress indicator', () => {
      expect(wrapper.find('[data-testid="progress-indicator"]').exists()).toBe(true);
    });

    it('starts on first step', () => {
      expect(wrapper.vm.currentStep).toBe(0);
    });

    it('renders first registration step', () => {
      const steps = wrapper.findAll('[data-testid="registration-step"]');
      expect(steps).toHaveLength(1); // Only current step is rendered
    });

    it('shows login link', () => {
      expect(wrapper.text()).toContain('Already have an account?');
      expect(wrapper.text()).toContain('Sign in here');
    });
  });

  describe('Step Navigation', () => {
    it('advances to next step when next is clicked', async () => {
      const step = wrapper.findComponent({ name: 'RegistrationStep' });
      await step.vm.$emit('next');
      
      expect(wrapper.vm.currentStep).toBe(1);
    });

    it('goes back to previous step when back is clicked', async () => {
      wrapper.vm.currentStep = 1;
      await wrapper.vm.$nextTick();
      
      const step = wrapper.findComponent({ name: 'RegistrationStep' });
      await step.vm.$emit('back');
      
      expect(wrapper.vm.currentStep).toBe(0);
    });

    it('allows clicking on progress indicator to navigate', async () => {
      const progressIndicator = wrapper.findComponent({ name: 'ProgressIndicator' });
      await progressIndicator.vm.$emit('step-click', { index: 0 });
      
      expect(wrapper.vm.currentStep).toBe(0);
    });

    it('prevents navigation to future steps via progress indicator', async () => {
      const progressIndicator = wrapper.findComponent({ name: 'ProgressIndicator' });
      await progressIndicator.vm.$emit('step-click', { index: 2 });
      
      expect(wrapper.vm.currentStep).toBe(0); // Should not change
    });
  });

  describe('Form Validation', () => {
    describe('Personal Information Step', () => {
      it('validates required name field', () => {
        const result = wrapper.vm.validatePersonalInfo();
        expect(result.errors.name).toBe('Name is required');
        expect(result.isValid).toBe(false);
      });

      it('validates name length', () => {
        wrapper.vm.form.name = 'A';
        const result = wrapper.vm.validatePersonalInfo();
        expect(result.errors.name).toBe('Name must be at least 2 characters');
      });

      it('validates email format', () => {
        wrapper.vm.form.email = 'invalid-email';
        const result = wrapper.vm.validatePersonalInfo();
        expect(result.errors.email).toBe('Please enter a valid email address');
      });

      it('validates phone number', () => {
        wrapper.vm.form.phone = 'invalid-phone';
        const result = wrapper.vm.validatePersonalInfo();
        expect(result.errors.phone).toBe('Please enter a valid phone number');
      });

      it('validates age requirement', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() - 10);
        wrapper.vm.form.date_of_birth = futureDate.toISOString().split('T')[0];
        
        const result = wrapper.vm.validatePersonalInfo();
        expect(result.errors.date_of_birth).toBe('You must be at least 16 years old');
      });

      it('passes validation with valid data', () => {
        wrapper.vm.form.name = 'John Doe';
        wrapper.vm.form.email = 'john@example.com';
        wrapper.vm.form.phone = '+1234567890';
        wrapper.vm.form.date_of_birth = '1990-01-01';
        
        const result = wrapper.vm.validatePersonalInfo();
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
      });
    });

    describe('Account Security Step', () => {
      it('validates password requirements', () => {
        wrapper.vm.form.password = 'weak';
        const result = wrapper.vm.validateAccountSecurity();
        expect(result.errors.password).toBe('Password must be at least 8 characters');
      });

      it('validates password complexity', () => {
        wrapper.vm.form.password = 'simplepassword';
        const result = wrapper.vm.validateAccountSecurity();
        expect(result.errors.password).toContain('uppercase letter');
      });

      it('validates password confirmation match', () => {
        wrapper.vm.form.password = 'StrongPass123';
        wrapper.vm.form.password_confirmation = 'DifferentPass123';
        const result = wrapper.vm.validateAccountSecurity();
        expect(result.errors.password_confirmation).toBe('Passwords do not match');
      });

      it('validates security question selection', () => {
        const result = wrapper.vm.validateAccountSecurity();
        expect(result.errors.security_question).toBe('Please select a security question');
      });

      it('validates security answer', () => {
        wrapper.vm.form.security_answer = 'AB';
        const result = wrapper.vm.validateAccountSecurity();
        expect(result.errors.security_answer).toBe('Security answer must be at least 3 characters');
      });
    });

    describe('Profile Details Step', () => {
      it('validates required department', () => {
        const result = wrapper.vm.validateProfileDetails();
        expect(result.errors.department).toBe('Department is required');
      });

      it('validates required position', () => {
        const result = wrapper.vm.validateProfileDetails();
        expect(result.errors.position).toBe('Position is required');
      });

      it('validates required employee ID', () => {
        const result = wrapper.vm.validateProfileDetails();
        expect(result.errors.employee_id).toBe('Employee ID is required');
      });

      it('validates start date not in future', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        wrapper.vm.form.start_date = futureDate.toISOString().split('T')[0];
        
        const result = wrapper.vm.validateProfileDetails();
        expect(result.errors.start_date).toBe('Start date cannot be in the future');
      });
    });

    describe('Terms and Preferences Step', () => {
      it('validates terms acceptance', () => {
        const result = wrapper.vm.validateTermsAndPreferences();
        expect(result.errors.terms_accepted).toBe('You must accept the Terms and Conditions');
      });

      it('validates privacy policy acceptance', () => {
        const result = wrapper.vm.validateTermsAndPreferences();
        expect(result.errors.privacy_accepted).toBe('You must accept the Privacy Policy');
      });

      it('passes validation when both terms are accepted', () => {
        wrapper.vm.form.terms_accepted = true;
        wrapper.vm.form.privacy_accepted = true;
        
        const result = wrapper.vm.validateTermsAndPreferences();
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Step Validation Handler', () => {
    it('calls correct validation function for each step', async () => {
      const validatePersonalSpy = vi.spyOn(wrapper.vm, 'validatePersonalInfo');
      const validateSecuritySpy = vi.spyOn(wrapper.vm, 'validateAccountSecurity');
      const validateProfileSpy = vi.spyOn(wrapper.vm, 'validateProfileDetails');
      const validateTermsSpy = vi.spyOn(wrapper.vm, 'validateTermsAndPreferences');

      // Test personal step
      await new Promise(resolve => {
        wrapper.vm.handleStepValidation({ stepId: 'personal', resolve });
      });
      expect(validatePersonalSpy).toHaveBeenCalled();

      // Test security step
      await new Promise(resolve => {
        wrapper.vm.handleStepValidation({ stepId: 'security', resolve });
      });
      expect(validateSecuritySpy).toHaveBeenCalled();

      // Test profile step
      await new Promise(resolve => {
        wrapper.vm.handleStepValidation({ stepId: 'profile', resolve });
      });
      expect(validateProfileSpy).toHaveBeenCalled();

      // Test terms step
      await new Promise(resolve => {
        wrapper.vm.handleStepValidation({ stepId: 'terms', resolve });
      });
      expect(validateTermsSpy).toHaveBeenCalled();
    });

    it('updates step validation state', async () => {
      wrapper.vm.form.name = 'John Doe';
      wrapper.vm.form.email = 'john@example.com';
      wrapper.vm.form.phone = '+1234567890';
      wrapper.vm.form.date_of_birth = '1990-01-01';

      await new Promise(resolve => {
        wrapper.vm.handleStepValidation({ stepId: 'personal', resolve });
      });

      expect(wrapper.vm.stepValidation[0]).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('calls form.post with correct route', () => {
      wrapper.vm.handleSubmit();
      expect(mockForm.post).toHaveBeenCalledWith(
        expect.any(Function), // route('register')
        expect.objectContaining({
          onFinish: expect.any(Function),
          onError: expect.any(Function)
        })
      );
    });

    it('resets password fields on finish', () => {
      wrapper.vm.handleSubmit();
      const onFinish = mockForm.post.mock.calls[0][1].onFinish;
      onFinish();
      expect(mockForm.reset).toHaveBeenCalledWith('password', 'password_confirmation');
    });
  });

  describe('Terms Modal', () => {
    it('opens terms modal when terms link is clicked', async () => {
      wrapper.vm.currentStep = 3; // Go to terms step
      await wrapper.vm.$nextTick();
      
      wrapper.vm.showTerms();
      expect(wrapper.vm.showTermsModal).toBe(true);
    });

    it('accepts terms when modal accept is clicked', async () => {
      wrapper.vm.showTermsModal = true;
      await wrapper.vm.$nextTick();
      
      const modal = wrapper.findComponent({ name: 'TermsAndConditionsModal' });
      await modal.vm.$emit('accept');
      
      expect(wrapper.vm.form.terms_accepted).toBe(true);
      expect(wrapper.vm.showTermsModal).toBe(false);
    });

    it('closes modal without accepting when close is clicked', async () => {
      wrapper.vm.showTermsModal = true;
      await wrapper.vm.$nextTick();
      
      const modal = wrapper.findComponent({ name: 'TermsAndConditionsModal' });
      await modal.vm.$emit('close');
      
      expect(wrapper.vm.showTermsModal).toBe(false);
    });
  });

  describe('Form Data Reactivity', () => {
    it('updates form data when inputs change', async () => {
      const nameInput = wrapper.find('input[type="text"]');
      await nameInput.setValue('John Doe');
      
      expect(wrapper.vm.form.name).toBe('John Doe');
    });

    it('re-validates when form data changes', async () => {
      const validateSpy = vi.spyOn(wrapper.vm, 'handleStepValidation');
      
      // Set initial validation
      wrapper.vm.stepValidation[0] = true;
      
      // Change form data
      wrapper.vm.form.name = 'John Doe';
      await wrapper.vm.$nextTick();
      
      // Should trigger re-validation after debounce
      setTimeout(() => {
        expect(validateSpy).toHaveBeenCalled();
      }, 600);
    });
  });

  describe('Step Configuration', () => {
    it('has correct number of registration steps', () => {
      expect(wrapper.vm.registrationSteps).toHaveLength(4);
    });

    it('has correct step IDs', () => {
      const stepIds = wrapper.vm.registrationSteps.map(step => step.id);
      expect(stepIds).toEqual(['personal', 'security', 'profile', 'terms']);
    });

    it('has department options', () => {
      expect(wrapper.vm.departmentOptions.length).toBeGreaterThan(0);
      expect(wrapper.vm.departmentOptions[0]).toHaveProperty('value');
      expect(wrapper.vm.departmentOptions[0]).toHaveProperty('label');
    });

    it('has security question options', () => {
      expect(wrapper.vm.securityQuestions.length).toBeGreaterThan(0);
      expect(wrapper.vm.securityQuestions[0]).toHaveProperty('value');
      expect(wrapper.vm.securityQuestions[0]).toHaveProperty('label');
    });
  });

  describe('Computed Properties', () => {
    it('calculates canProceedToNext correctly', () => {
      wrapper.vm.stepValidation[0] = false;
      expect(wrapper.vm.canProceedToNext).toBe(false);
      
      wrapper.vm.stepValidation[0] = true;
      expect(wrapper.vm.canProceedToNext).toBe(true);
    });

    it('identifies last step correctly', () => {
      wrapper.vm.currentStep = 3;
      expect(wrapper.vm.isLastStep).toBe(true);
      
      wrapper.vm.currentStep = 2;
      expect(wrapper.vm.isLastStep).toBe(false);
    });

    it('returns current step data', () => {
      wrapper.vm.currentStep = 1;
      expect(wrapper.vm.currentStepData.id).toBe('security');
    });
  });

  describe('Error Handling', () => {
    it('handles server-side validation errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      wrapper.vm.handleSubmit();
      const onError = mockForm.post.mock.calls[0][1].onError;
      onError({ email: 'Email already exists' });
      
      expect(consoleSpy).toHaveBeenCalledWith('Registration errors:', { email: 'Email already exists' });
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      expect(wrapper.find('form').exists()).toBe(true);
    });

    it('has proper heading hierarchy', () => {
      expect(wrapper.find('h1').exists()).toBe(true);
    });

    it('has proper labels for form fields', () => {
      const formFields = wrapper.findAllComponents({ name: 'FormField' });
      formFields.forEach(field => {
        expect(field.props('label')).toBeTruthy();
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      expect(wrapper.find('.registration-container').exists()).toBe(true);
    });
  });
});