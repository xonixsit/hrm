import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FormLayout from '@/Components/Forms/FormLayout.vue';
import FormSection from '@/Components/Forms/FormSection.vue';
import FormActions from '@/Components/Forms/FormActions.vue';

describe('FormLayout End-to-End Integration', () => {
  describe('Complete User Registration Flow', () => {
    let wrapper;
    let formData;

    beforeEach(() => {
      formData = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
        newsletter: true
      };

      wrapper = mount({
        template: `
          <FormLayout
            title="Create Your Account"
            description="Join our platform to get started with amazing features"
            :actions="actions"
            :errors="errors"
            :is-submitting="isSubmitting"
            @submit="handleSubmit"
            @action="handleAction"
          >
            <FormSection
              title="Personal Information"
              description="Tell us about yourself"
              :use-grid="true"
              :columns="{ xs: 1, md: 2 }"
            >
              <div class="form-field">
                <label for="firstName" class="block text-sm font-medium text-neutral-700 mb-1">
                  First Name *
                </label>
                <input
                  id="firstName"
                  v-model="formData.firstName"
                  name="firstName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  :class="{ 'border-error-500': errors.firstName }"
                />
                <p v-if="errors.firstName" class="text-error-600 text-sm mt-1">
                  {{ errors.firstName }}
                </p>
              </div>

              <div class="form-field">
                <label for="lastName" class="block text-sm font-medium text-neutral-700 mb-1">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  v-model="formData.lastName"
                  name="lastName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  :class="{ 'border-error-500': errors.lastName }"
                />
                <p v-if="errors.lastName" class="text-error-600 text-sm mt-1">
                  {{ errors.lastName }}
                </p>
              </div>

              <div class="form-field md:col-span-2">
                <label for="email" class="block text-sm font-medium text-neutral-700 mb-1">
                  Email Address *
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  name="email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  :class="{ 'border-error-500': errors.email }"
                />
                <p v-if="errors.email" class="text-error-600 text-sm mt-1">
                  {{ errors.email }}
                </p>
              </div>
            </FormSection>

            <FormSection
              title="Account Security"
              description="Choose a secure password"
            >
              <div class="form-field">
                <label for="password" class="block text-sm font-medium text-neutral-700 mb-1">
                  Password *
                </label>
                <input
                  id="password"
                  v-model="formData.password"
                  name="password"
                  type="password"
                  required
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  :class="{ 'border-error-500': errors.password }"
                />
                <p v-if="errors.password" class="text-error-600 text-sm mt-1">
                  {{ errors.password }}
                </p>
                <p class="text-neutral-500 text-sm mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div class="form-field">
                <label for="confirmPassword" class="block text-sm font-medium text-neutral-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  :class="{ 'border-error-500': errors.confirmPassword }"
                />
                <p v-if="errors.confirmPassword" class="text-error-600 text-sm mt-1">
                  {{ errors.confirmPassword }}
                </p>
              </div>
            </FormSection>

            <FormSection
              title="Preferences"
              description="Customize your experience"
              variant="bordered"
            >
              <div class="form-field">
                <label class="flex items-start">
                  <input
                    v-model="formData.agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    required
                    class="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    :class="{ 'border-error-500': errors.agreeToTerms }"
                  />
                  <span class="ml-2 text-sm text-neutral-700">
                    I agree to the <a href="#" class="text-primary-600 hover:text-primary-700">Terms of Service</a> 
                    and <a href="#" class="text-primary-600 hover:text-primary-700">Privacy Policy</a> *
                  </span>
                </label>
                <p v-if="errors.agreeToTerms" class="text-error-600 text-sm mt-1 ml-6">
                  {{ errors.agreeToTerms }}
                </p>
              </div>

              <div class="form-field">
                <label class="flex items-center">
                  <input
                    v-model="formData.newsletter"
                    name="newsletter"
                    type="checkbox"
                    class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-neutral-700">
                    Subscribe to our newsletter for updates and tips
                  </span>
                </label>
              </div>
            </FormSection>
          </FormLayout>
        `,
        components: {
          FormLayout,
          FormSection,
          FormActions
        },
        data() {
          return {
            formData,
            errors: {},
            isSubmitting: false,
            actions: [
              { id: 'cancel', label: 'Cancel', variant: 'secondary' },
              { 
                id: 'submit', 
                label: 'Create Account', 
                variant: 'primary', 
                type: 'submit',
                loadingLabel: 'Creating Account...'
              }
            ]
          };
        },
        methods: {
          handleSubmit(event) {
            this.validateForm();
            if (Object.keys(this.errors).length === 0) {
              this.isSubmitting = true;
              // Simulate API call
              setTimeout(() => {
                this.isSubmitting = false;
                this.$emit('registration-success', this.formData);
              }, 2000);
            }
          },
          handleAction(action) {
            if (action.id === 'cancel') {
              this.$emit('registration-cancelled');
            }
          },
          validateForm() {
            const errors = {};
            
            if (!this.formData.firstName.trim()) {
              errors.firstName = 'First name is required';
            }
            
            if (!this.formData.lastName.trim()) {
              errors.lastName = 'Last name is required';
            }
            
            if (!this.formData.email.trim()) {
              errors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(this.formData.email)) {
              errors.email = 'Please enter a valid email address';
            }
            
            if (!this.formData.password) {
              errors.password = 'Password is required';
            } else if (this.formData.password.length < 8) {
              errors.password = 'Password must be at least 8 characters';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.formData.password)) {
              errors.password = 'Password must contain uppercase, lowercase, and number';
            }
            
            if (!this.formData.confirmPassword) {
              errors.confirmPassword = 'Please confirm your password';
            } else if (this.formData.password !== this.formData.confirmPassword) {
              errors.confirmPassword = 'Passwords do not match';
            }
            
            if (!this.formData.agreeToTerms) {
              errors.agreeToTerms = 'You must agree to the terms and conditions';
            }
            
            this.errors = errors;
          }
        }
      });
    });

    it('renders complete registration form', () => {
      expect(wrapper.find('.form-layout')).toBeTruthy();
      expect(wrapper.find('.form-title').text()).toBe('Create Your Account');
      expect(wrapper.findAll('.form-section')).toHaveLength(3);
      
      // Check all form fields are present
      expect(wrapper.find('#firstName')).toBeTruthy();
      expect(wrapper.find('#lastName')).toBeTruthy();
      expect(wrapper.find('#email')).toBeTruthy();
      expect(wrapper.find('#password')).toBeTruthy();
      expect(wrapper.find('#confirmPassword')).toBeTruthy();
      expect(wrapper.find('[name="agreeToTerms"]')).toBeTruthy();
      expect(wrapper.find('[name="newsletter"]')).toBeTruthy();
    });

    it('validates form on submission', async () => {
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      // Should show validation errors
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.form-error-summary')).toBeTruthy();
      expect(wrapper.findAll('.error-summary-item').length).toBeGreaterThan(0);
    });

    it('handles successful form submission', async () => {
      // Fill out valid form data
      await wrapper.find('#firstName').setValue('John');
      await wrapper.find('#lastName').setValue('Doe');
      await wrapper.find('#email').setValue('john.doe@example.com');
      await wrapper.find('#password').setValue('SecurePass123');
      await wrapper.find('#confirmPassword').setValue('SecurePass123');
      await wrapper.find('[name="agreeToTerms"]').setChecked(true);
      
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      // Should start loading
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.isSubmitting).toBe(true);
      const submitButton = wrapper.findAll('.form-action-button').find(btn => btn.attributes('type') === 'submit');
      expect(submitButton.text()).toContain('Creating Account...');
    });

    it('handles form cancellation', async () => {
      const cancelButton = wrapper.findAll('.form-action-button')[0];
      await cancelButton.trigger('click');
      
      expect(wrapper.emitted('registration-cancelled')).toBeTruthy();
    });

    it('provides proper accessibility features', () => {
      // Check for proper labels
      expect(wrapper.find('label[for="firstName"]')).toBeTruthy();
      expect(wrapper.find('label[for="email"]')).toBeTruthy();
      
      // Check for required field indicators
      expect(wrapper.find('#firstName').attributes('required')).toBeDefined();
      expect(wrapper.find('#email').attributes('required')).toBeDefined();
      
      // Check form structure
      expect(wrapper.find('form').attributes('novalidate')).toBe('');
    });
  });

  describe('Multi-step Project Setup Flow', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount({
        template: `
          <FormLayout
            title="Create New Project"
            description="Set up your project in a few simple steps"
            :steps="steps"
            :current-step="currentStep"
            :show-progress="true"
            :actions="currentActions"
            :is-submitting="isSubmitting"
            @submit="handleSubmit"
            @action="handleAction"
            @step-change="handleStepChange"
          >
            <!-- Step 1: Basic Information -->
            <FormSection
              v-if="currentStep === 0"
              title="Project Details"
              description="Basic information about your project"
            >
              <div class="form-field">
                <label for="projectName" class="block text-sm font-medium text-neutral-700 mb-1">
                  Project Name *
                </label>
                <input
                  id="projectName"
                  v-model="projectData.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div class="form-field">
                <label for="projectDescription" class="block text-sm font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  id="projectDescription"
                  v-model="projectData.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>
            </FormSection>

            <!-- Step 2: Configuration -->
            <FormSection
              v-if="currentStep === 1"
              title="Project Configuration"
              description="Choose your technology stack"
              :use-grid="true"
              :columns="{ xs: 1, md: 2 }"
            >
              <div class="form-field">
                <label for="framework" class="block text-sm font-medium text-neutral-700 mb-1">
                  Framework
                </label>
                <select
                  id="framework"
                  v-model="projectData.framework"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="vue">Vue.js</option>
                  <option value="react">React</option>
                  <option value="angular">Angular</option>
                  <option value="svelte">Svelte</option>
                </select>
              </div>

              <div class="form-field">
                <label for="buildTool" class="block text-sm font-medium text-neutral-700 mb-1">
                  Build Tool
                </label>
                <select
                  id="buildTool"
                  v-model="projectData.buildTool"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="vite">Vite</option>
                  <option value="webpack">Webpack</option>
                  <option value="rollup">Rollup</option>
                  <option value="parcel">Parcel</option>
                </select>
              </div>

              <div class="form-field md:col-span-2">
                <label class="block text-sm font-medium text-neutral-700 mb-2">
                  Additional Features
                </label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="projectData.features"
                      value="typescript"
                      type="checkbox"
                      class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-neutral-700">TypeScript</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="projectData.features"
                      value="testing"
                      type="checkbox"
                      class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-neutral-700">Testing Setup</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="projectData.features"
                      value="linting"
                      type="checkbox"
                      class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-neutral-700">ESLint & Prettier</span>
                  </label>
                </div>
              </div>
            </FormSection>

            <!-- Step 3: Review -->
            <FormSection
              v-if="currentStep === 2"
              title="Review & Confirm"
              description="Please review your project settings"
            >
              <div class="bg-neutral-50 rounded-lg p-4 space-y-3">
                <div class="flex justify-between">
                  <span class="font-medium text-neutral-700">Project Name:</span>
                  <span class="text-neutral-900">{{ projectData.name || 'Not specified' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-neutral-700">Framework:</span>
                  <span class="text-neutral-900">{{ projectData.framework }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-neutral-700">Build Tool:</span>
                  <span class="text-neutral-900">{{ projectData.buildTool }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-neutral-700">Features:</span>
                  <span class="text-neutral-900">
                    {{ projectData.features.length ? projectData.features.join(', ') : 'None selected' }}
                  </span>
                </div>
              </div>
            </FormSection>
          </FormLayout>
        `,
        components: {
          FormLayout,
          FormSection
        },
        data() {
          return {
            currentStep: 0,
            isSubmitting: false,
            projectData: {
              name: '',
              description: '',
              framework: 'vue',
              buildTool: 'vite',
              features: []
            },
            steps: [
              { id: 'basic', title: 'Basic Info', description: 'Project details' },
              { id: 'config', title: 'Configuration', description: 'Tech stack' },
              { id: 'review', title: 'Review', description: 'Confirm settings' }
            ]
          };
        },
        computed: {
          currentActions() {
            const actions = [];
            
            if (this.currentStep > 0) {
              actions.push({ id: 'back', label: 'Back', variant: 'secondary' });
            }
            
            actions.push({ id: 'cancel', label: 'Cancel', variant: 'ghost' });
            
            if (this.currentStep < this.steps.length - 1) {
              actions.push({ id: 'next', label: 'Next', variant: 'primary' });
            } else {
              actions.push({ 
                id: 'create', 
                label: 'Create Project', 
                variant: 'primary', 
                type: 'submit',
                loadingLabel: 'Creating Project...'
              });
            }
            
            return actions;
          }
        },
        methods: {
          handleSubmit() {
            this.isSubmitting = true;
            setTimeout(() => {
              this.isSubmitting = false;
              this.$emit('project-created', this.projectData);
            }, 2000);
          },
          handleAction(action) {
            switch (action.id) {
              case 'next':
                if (this.currentStep < this.steps.length - 1) {
                  this.currentStep++;
                }
                break;
              case 'back':
                if (this.currentStep > 0) {
                  this.currentStep--;
                }
                break;
              case 'cancel':
                this.$emit('project-cancelled');
                break;
            }
          },
          handleStepChange({ index }) {
            if (index <= this.currentStep) {
              this.currentStep = index;
            }
          }
        }
      });
    });

    it('renders multi-step form with progress indicator', () => {
      expect(wrapper.find('.form-progress')).toBeTruthy();
      expect(wrapper.findAll('.progress-step')).toHaveLength(3);
      expect(wrapper.find('.progress-step--current')).toBeTruthy();
    });

    it('navigates between steps correctly', async () => {
      // Should be on step 1 initially
      expect(wrapper.vm.currentStep).toBe(0);
      expect(wrapper.find('#projectName')).toBeTruthy();
      
      // Click next - find the "Next" button specifically
      const nextButton = wrapper.findAll('.form-action-button').find(btn => btn.text() === 'Next');
      await nextButton.trigger('click');
      
      expect(wrapper.vm.currentStep).toBe(1);
      expect(wrapper.find('#framework')).toBeTruthy();
    });

    it('handles step navigation via progress indicator', async () => {
      // Go to step 2 first
      wrapper.vm.currentStep = 1;
      await wrapper.vm.$nextTick();
      
      // Click on step 1 in progress indicator
      const firstStep = wrapper.findAll('.progress-step')[0];
      await firstStep.trigger('click');
      
      expect(wrapper.vm.currentStep).toBe(0);
    });

    it('shows review step with project summary', async () => {
      // Set some data and go to review step
      wrapper.vm.projectData.name = 'My Awesome Project';
      wrapper.vm.projectData.features = ['typescript', 'testing'];
      wrapper.vm.currentStep = 2;
      await wrapper.vm.$nextTick();
      
      expect(wrapper.text()).toContain('My Awesome Project');
      expect(wrapper.text()).toContain('typescript, testing');
    });

    it('handles final submission', async () => {
      wrapper.vm.currentStep = 2;
      await wrapper.vm.$nextTick();
      
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      expect(wrapper.vm.isSubmitting).toBe(true);
      const submitButton = wrapper.findAll('.form-action-button').find(btn => btn.attributes('type') === 'submit');
      expect(submitButton.text()).toContain('Creating Project...');
    });
  });

  describe('Form Accessibility and UX', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(FormLayout, {
        props: {
          title: 'Accessibility Test Form',
          actions: [
            { id: 'submit', label: 'Submit', variant: 'primary', type: 'submit' }
          ],
          errors: {
            email: 'Email is required',
            password: 'Password is too weak'
          }
        },
        slots: {
          default: `
            <FormSection title="Test Section">
              <div class="form-field">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" />
              </div>
              <div class="form-field">
                <label for="password">Password</label>
                <input id="password" name="password" type="password" />
              </div>
            </FormSection>
          `
        },
        global: {
          components: { FormSection }
        }
      });
    });

    it('provides proper error summary for screen readers', () => {
      const errorSummary = wrapper.find('.form-error-summary');
      expect(errorSummary.exists()).toBe(true);
      
      const errorTitle = wrapper.find('.error-summary-title');
      expect(errorTitle.text()).toBe('Please correct the following errors:');
      
      const errorLinks = wrapper.findAll('.error-summary-link');
      expect(errorLinks).toHaveLength(2);
    });

    it('focuses field when error link is clicked', async () => {
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

    it('maintains proper heading hierarchy', () => {
      expect(wrapper.find('h2.form-title')).toBeTruthy();
      expect(wrapper.find('.section-title--h3')).toBeTruthy();
    });

    it('provides proper form structure', () => {
      expect(wrapper.find('form').attributes('novalidate')).toBe('');
      expect(wrapper.find('form').element.tagName).toBe('FORM');
    });
  });
});