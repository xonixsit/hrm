<script setup>
import { ref, computed, reactive, watch } from 'vue';
import GuestLayout from '@/Layouts/GuestLayout.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import ProgressIndicator from '@/Components/Forms/ProgressIndicator.vue';
import RegistrationStep from '@/Components/Forms/RegistrationStep.vue';
import FormField from '@/Components/Forms/FormField.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';
import TermsAndConditionsModal from '@/Components/Modals/TermsAndConditionsModal.vue';

// Form data
const form = useForm({
    // Step 1: Personal Information
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    
    // Step 2: Account Security
    password: '',
    password_confirmation: '',
    security_question: '',
    security_answer: '',
    
    // Step 3: Profile Details
    department: '',
    position: '',
    employee_id: '',
    start_date: '',
    
    // Step 4: Terms and Preferences
    terms_accepted: false,
    privacy_accepted: false,
    marketing_emails: false,
    notifications_enabled: true,
});

// Multi-step state
const currentStep = ref(0);
const stepValidation = reactive({
    0: false, // Personal Information
    1: false, // Account Security
    2: false, // Profile Details
    3: false, // Terms and Preferences
});

// Modal state
const showTermsModal = ref(false);

// Registration steps configuration
const registrationSteps = [
    {
        id: 'personal',
        title: 'Personal Information',
        description: 'Tell us about yourself',
        fields: ['name', 'email', 'phone', 'date_of_birth']
    },
    {
        id: 'security',
        title: 'Account Security',
        description: 'Secure your account',
        fields: ['password', 'password_confirmation', 'security_question', 'security_answer']
    },
    {
        id: 'profile',
        title: 'Profile Details',
        description: 'Complete your profile',
        fields: ['department', 'position', 'employee_id', 'start_date']
    },
    {
        id: 'terms',
        title: 'Terms & Preferences',
        description: 'Review and accept terms',
        fields: ['terms_accepted', 'privacy_accepted', 'marketing_emails', 'notifications_enabled']
    }
];

// Department options
const departmentOptions = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'support', label: 'Customer Support' }
];

// Security question options
const securityQuestions = [
    { value: 'pet_name', label: 'What was the name of your first pet?' },
    { value: 'birth_city', label: 'In what city were you born?' },
    { value: 'school_name', label: 'What was the name of your elementary school?' },
    { value: 'mother_maiden', label: "What is your mother's maiden name?" },
    { value: 'first_car', label: 'What was your first car?' }
];

// Terms and conditions content
const termsContent = [
    {
        id: 'acceptance',
        title: '1. Acceptance of Terms',
        content: `
            <p>By creating an account and using our services, you agree to be bound by these Terms and Conditions. 
            If you do not agree to these terms, please do not use our services.</p>
        `
    },
    {
        id: 'account',
        title: '2. Account Responsibilities',
        items: [
            'You are responsible for maintaining the confidentiality of your account credentials',
            'You must provide accurate and complete information during registration',
            'You are responsible for all activities that occur under your account',
            'You must notify us immediately of any unauthorized use of your account'
        ]
    },
    {
        id: 'usage',
        title: '3. Acceptable Use',
        content: `
            <p>You agree to use our services only for lawful purposes and in accordance with company policies. 
            Prohibited activities include but are not limited to harassment, unauthorized access, and misuse of company resources.</p>
        `
    },
    {
        id: 'privacy',
        title: '4. Privacy and Data Protection',
        content: `
            <p>We are committed to protecting your privacy. Your personal information will be handled in accordance 
            with our Privacy Policy and applicable data protection laws.</p>
        `
    },
    {
        id: 'termination',
        title: '5. Account Termination',
        content: `
            <p>We reserve the right to suspend or terminate your account at any time for violation of these terms 
            or for any other reason deemed necessary by the company.</p>
        `
    }
];

// Computed properties
const canProceedToNext = computed(() => {
    return stepValidation[currentStep.value];
});

const isLastStep = computed(() => {
    return currentStep.value === registrationSteps.length - 1;
});

const currentStepData = computed(() => {
    return registrationSteps[currentStep.value];
});

// Validation methods
const validatePersonalInfo = () => {
    const errors = {};
    
    if (!form.name.trim()) {
        errors.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
    }
    
    if (!form.email.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    if (!form.phone.trim()) {
        errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(form.phone)) {
        errors.phone = 'Please enter a valid phone number';
    }
    
    if (!form.date_of_birth) {
        errors.date_of_birth = 'Date of birth is required';
    } else {
        const birthDate = new Date(form.date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 16) {
            errors.date_of_birth = 'You must be at least 16 years old';
        }
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
};

const validateAccountSecurity = () => {
    const errors = {};
    
    if (!form.password) {
        errors.password = 'Password is required';
    } else if (form.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
        errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!form.password_confirmation) {
        errors.password_confirmation = 'Password confirmation is required';
    } else if (form.password !== form.password_confirmation) {
        errors.password_confirmation = 'Passwords do not match';
    }
    
    if (!form.security_question) {
        errors.security_question = 'Please select a security question';
    }
    
    if (!form.security_answer.trim()) {
        errors.security_answer = 'Security answer is required';
    } else if (form.security_answer.trim().length < 3) {
        errors.security_answer = 'Security answer must be at least 3 characters';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
};

const validateProfileDetails = () => {
    const errors = {};
    
    if (!form.department) {
        errors.department = 'Department is required';
    }
    
    if (!form.position.trim()) {
        errors.position = 'Position is required';
    }
    
    if (!form.employee_id.trim()) {
        errors.employee_id = 'Employee ID is required';
    }
    
    if (!form.start_date) {
        errors.start_date = 'Start date is required';
    } else {
        const startDate = new Date(form.start_date);
        const today = new Date();
        if (startDate > today) {
            errors.start_date = 'Start date cannot be in the future';
        }
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
};

const validateTermsAndPreferences = () => {
    const errors = {};
    
    if (!form.terms_accepted) {
        errors.terms_accepted = 'You must accept the Terms and Conditions';
    }
    
    if (!form.privacy_accepted) {
        errors.privacy_accepted = 'You must accept the Privacy Policy';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
};

// Step validation handler
const handleStepValidation = ({ stepId, resolve }) => {
    let result = { isValid: true, errors: {} };
    
    switch (stepId) {
        case 'personal':
            result = validatePersonalInfo();
            break;
        case 'security':
            result = validateAccountSecurity();
            break;
        case 'profile':
            result = validateProfileDetails();
            break;
        case 'terms':
            result = validateTermsAndPreferences();
            break;
    }
    
    stepValidation[currentStep.value] = result.isValid;
    resolve(result);
};

// Navigation methods
const handleNext = () => {
    if (currentStep.value < registrationSteps.length - 1) {
        currentStep.value++;
    }
};

const handleBack = () => {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
};

const handleStepClick = ({ index }) => {
    // Allow navigation to previous steps or current step
    if (index <= currentStep.value) {
        currentStep.value = index;
    }
};

// Form submission
const handleSubmit = () => {
    form.post(route('register'), {
        onFinish: () => {
            form.reset('password', 'password_confirmation');
        },
        onError: (errors) => {
            // Handle server-side validation errors
            console.error('Registration errors:', errors);
        }
    });
};

// Terms modal handlers
const showTerms = () => {
    showTermsModal.value = true;
};

const handleTermsAccept = () => {
    form.terms_accepted = true;
    showTermsModal.value = false;
};

const handleTermsClose = () => {
    showTermsModal.value = false;
};

// Watch for form changes to update validation
watch(() => form.data(), () => {
    // Reset validation when form data changes
    const currentStepId = registrationSteps[currentStep.value].id;
    if (stepValidation[currentStep.value]) {
        // Re-validate current step
        handleStepValidation({ 
            stepId: currentStepId, 
            resolve: (result) => {
                stepValidation[currentStep.value] = result.isValid;
            }
        });
    }
}, { deep: true });
</script>

<template>
    <GuestLayout>
        <Head title="Create Account" />

        <div class="registration-container">
            <!-- Registration Header -->
            <div class="registration-header">
                <h1 class="registration-title">Create Your Account</h1>
                <p class="registration-subtitle">
                    Join our team and get started with your new account
                </p>
            </div>

            <!-- Progress Indicator -->
            <div class="progress-section">
                <ProgressIndicator
                    :steps="registrationSteps"
                    :current-step="currentStep"
                    :allow-click-navigation="true"
                    @step-click="handleStepClick"
                />
            </div>

            <!-- Registration Form -->
            <form @submit.prevent="handleSubmit" class="registration-form">
                <!-- Step 1: Personal Information -->
                <RegistrationStep
                    v-if="currentStep === 0"
                    step-id="personal"
                    :step-number="1"
                    title="Personal Information"
                    description="Tell us about yourself to get started"
                    :is-active="currentStep === 0"
                    :is-valid="stepValidation[0]"
                    :form-data="form.data()"
                    :errors="form.errors"
                    :is-submitting="form.processing"
                    :show-back-button="false"
                    @next="handleNext"
                    @validate="handleStepValidation"
                    @update:is-valid="(valid) => stepValidation[0] = valid"
                >
                    <div class="step-fields">
                        <FormField
                            name="name"
                            label="Full Name"
                            required
                            :error-message="form.errors.name"
                        >
                            <BaseInput
                                v-model="form.name"
                                type="text"
                                placeholder="Enter your full name"
                                autocomplete="name"
                                required
                            />
                        </FormField>

                        <FormField
                            name="email"
                            label="Email Address"
                            required
                            :error-message="form.errors.email"
                        >
                            <BaseInput
                                v-model="form.email"
                                type="email"
                                placeholder="Enter your email address"
                                autocomplete="email"
                                required
                            />
                        </FormField>

                        <FormField
                            name="phone"
                            label="Phone Number"
                            required
                            :error-message="form.errors.phone"
                        >
                            <BaseInput
                                v-model="form.phone"
                                type="tel"
                                placeholder="Enter your phone number"
                                autocomplete="tel"
                                required
                            />
                        </FormField>

                        <FormField
                            name="date_of_birth"
                            label="Date of Birth"
                            required
                            :error-message="form.errors.date_of_birth"
                        >
                            <BaseInput
                                v-model="form.date_of_birth"
                                type="date"
                                required
                            />
                        </FormField>
                    </div>
                </RegistrationStep>

                <!-- Step 2: Account Security -->
                <RegistrationStep
                    v-if="currentStep === 1"
                    step-id="security"
                    :step-number="2"
                    title="Account Security"
                    description="Create a secure password and set up account recovery"
                    :is-active="currentStep === 1"
                    :is-valid="stepValidation[1]"
                    :form-data="form.data()"
                    :errors="form.errors"
                    :is-submitting="form.processing"
                    @next="handleNext"
                    @back="handleBack"
                    @validate="handleStepValidation"
                    @update:is-valid="(valid) => stepValidation[1] = valid"
                >
                    <div class="step-fields">
                        <FormField
                            name="password"
                            label="Password"
                            required
                            :error-message="form.errors.password"
                            help-text="Must be at least 8 characters with uppercase, lowercase, and number"
                        >
                            <BaseInput
                                v-model="form.password"
                                type="password"
                                placeholder="Create a strong password"
                                autocomplete="new-password"
                                required
                            />
                        </FormField>

                        <FormField
                            name="password_confirmation"
                            label="Confirm Password"
                            required
                            :error-message="form.errors.password_confirmation"
                        >
                            <BaseInput
                                v-model="form.password_confirmation"
                                type="password"
                                placeholder="Confirm your password"
                                autocomplete="new-password"
                                required
                            />
                        </FormField>

                        <FormField
                            name="security_question"
                            label="Security Question"
                            required
                            :error-message="form.errors.security_question"
                        >
                            <BaseSelect
                                v-model="form.security_question"
                                :options="securityQuestions"
                                placeholder="Choose a security question"
                                required
                            />
                        </FormField>

                        <FormField
                            name="security_answer"
                            label="Security Answer"
                            required
                            :error-message="form.errors.security_answer"
                        >
                            <BaseInput
                                v-model="form.security_answer"
                                type="text"
                                placeholder="Enter your answer"
                                required
                            />
                        </FormField>
                    </div>
                </RegistrationStep>

                <!-- Step 3: Profile Details -->
                <RegistrationStep
                    v-if="currentStep === 2"
                    step-id="profile"
                    :step-number="3"
                    title="Profile Details"
                    description="Complete your professional profile information"
                    :is-active="currentStep === 2"
                    :is-valid="stepValidation[2]"
                    :form-data="form.data()"
                    :errors="form.errors"
                    :is-submitting="form.processing"
                    @next="handleNext"
                    @back="handleBack"
                    @validate="handleStepValidation"
                    @update:is-valid="(valid) => stepValidation[2] = valid"
                >
                    <div class="step-fields">
                        <FormField
                            name="department"
                            label="Department"
                            required
                            :error-message="form.errors.department"
                        >
                            <BaseSelect
                                v-model="form.department"
                                :options="departmentOptions"
                                placeholder="Select your department"
                                required
                            />
                        </FormField>

                        <FormField
                            name="position"
                            label="Position/Job Title"
                            required
                            :error-message="form.errors.position"
                        >
                            <BaseInput
                                v-model="form.position"
                                type="text"
                                placeholder="Enter your job title"
                                required
                            />
                        </FormField>

                        <FormField
                            name="employee_id"
                            label="Employee ID"
                            required
                            :error-message="form.errors.employee_id"
                        >
                            <BaseInput
                                v-model="form.employee_id"
                                type="text"
                                placeholder="Enter your employee ID"
                                required
                            />
                        </FormField>

                        <FormField
                            name="start_date"
                            label="Start Date"
                            required
                            :error-message="form.errors.start_date"
                        >
                            <BaseInput
                                v-model="form.start_date"
                                type="date"
                                required
                            />
                        </FormField>
                    </div>
                </RegistrationStep>

                <!-- Step 4: Terms and Preferences -->
                <RegistrationStep
                    v-if="currentStep === 3"
                    step-id="terms"
                    :step-number="4"
                    title="Terms & Preferences"
                    description="Review our terms and set your preferences"
                    :is-active="currentStep === 3"
                    :is-valid="stepValidation[3]"
                    :form-data="form.data()"
                    :errors="form.errors"
                    :is-submitting="form.processing"
                    :show-next-button="false"
                    :show-submit-button="true"
                    @back="handleBack"
                    @submit="handleSubmit"
                    @validate="handleStepValidation"
                    @update:is-valid="(valid) => stepValidation[3] = valid"
                >
                    <div class="step-fields">
                        <!-- Terms Acceptance -->
                        <div class="terms-section">
                            <div class="checkbox-field">
                                <label class="checkbox-label">
                                    <input
                                        v-model="form.terms_accepted"
                                        type="checkbox"
                                        class="checkbox-input"
                                        required
                                    />
                                    <span class="checkbox-text">
                                        I have read and agree to the 
                                        <button
                                            type="button"
                                            @click="showTerms"
                                            class="terms-link"
                                        >
                                            Terms and Conditions
                                        </button>
                                    </span>
                                </label>
                                <p v-if="form.errors.terms_accepted" class="error-message">
                                    {{ form.errors.terms_accepted }}
                                </p>
                            </div>

                            <div class="checkbox-field">
                                <label class="checkbox-label">
                                    <input
                                        v-model="form.privacy_accepted"
                                        type="checkbox"
                                        class="checkbox-input"
                                        required
                                    />
                                    <span class="checkbox-text">
                                        I accept the Privacy Policy
                                    </span>
                                </label>
                                <p v-if="form.errors.privacy_accepted" class="error-message">
                                    {{ form.errors.privacy_accepted }}
                                </p>
                            </div>
                        </div>

                        <!-- Preferences -->
                        <div class="preferences-section">
                            <h4 class="preferences-title">Communication Preferences</h4>
                            
                            <div class="checkbox-field">
                                <label class="checkbox-label">
                                    <input
                                        v-model="form.marketing_emails"
                                        type="checkbox"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-text">
                                        Send me marketing emails and updates
                                    </span>
                                </label>
                            </div>

                            <div class="checkbox-field">
                                <label class="checkbox-label">
                                    <input
                                        v-model="form.notifications_enabled"
                                        type="checkbox"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-text">
                                        Enable system notifications
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </RegistrationStep>
            </form>

            <!-- Login Link -->
            <div class="login-link-section">
                <p class="login-text">
                    Already have an account?
                    <Link
                        :href="route('login')"
                        class="login-link"
                    >
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>

        <!-- Terms and Conditions Modal -->
        <TermsAndConditionsModal
            :is-open="showTermsModal"
            :terms-sections="termsContent"
            :last-updated="new Date('2024-01-01')"
            :contact-info="{
                email: 'legal@company.com',
                phone: '+1 (555) 123-4567',
                address: '123 Business St, City, State 12345'
            }"
            @accept="handleTermsAccept"
            @close="handleTermsClose"
        />
    </GuestLayout>
</template>

<style scoped>
/* Registration container */
.registration-container {
  @apply max-w-4xl mx-auto px-4 py-8 space-y-8;
}

/* Registration header */
.registration-header {
  @apply text-center space-y-2;
}

.registration-title {
  @apply text-3xl font-bold text-neutral-900;
}

.registration-subtitle {
  @apply text-lg text-neutral-600;
}

/* Progress section */
.progress-section {
  @apply bg-white rounded-lg border border-neutral-200 p-6;
}

/* Registration form */
.registration-form {
  @apply bg-white rounded-lg border border-neutral-200 p-6;
}

/* Step fields */
.step-fields {
  @apply space-y-6;
}

/* Terms section */
.terms-section {
  @apply space-y-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200;
}

.checkbox-field {
  @apply space-y-2;
}

.checkbox-label {
  @apply flex items-start space-x-3 cursor-pointer;
}

.checkbox-input {
  @apply w-4 h-4 text-primary-600 border-neutral-300 rounded;
  @apply focus:ring-primary-500 focus:ring-2 focus:ring-offset-2;
  @apply mt-0.5 flex-shrink-0;
}

.checkbox-text {
  @apply text-sm text-neutral-700 leading-relaxed;
}

.terms-link {
  @apply text-primary-600 hover:text-primary-700 underline;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 rounded;
}

.error-message {
  @apply text-sm text-error-600 mt-1;
}

/* Preferences section */
.preferences-section {
  @apply space-y-4 pt-4 border-t border-neutral-200;
}

.preferences-title {
  @apply text-base font-medium text-neutral-900 mb-3;
}

/* Login link section */
.login-link-section {
  @apply text-center;
}

.login-text {
  @apply text-sm text-neutral-600;
}

.login-link {
  @apply text-primary-600 hover:text-primary-700 underline font-medium;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 rounded;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .registration-container {
    @apply px-2 py-4 space-y-6;
  }
  
  .registration-title {
    @apply text-2xl;
  }
  
  .registration-subtitle {
    @apply text-base;
  }
  
  .progress-section,
  .registration-form {
    @apply p-4;
  }
  
  .step-fields {
    @apply space-y-4;
  }
}

/* Dark theme adjustments */
.theme-dark .registration-title {
  @apply text-neutral-100;
}

.theme-dark .registration-subtitle {
  @apply text-neutral-400;
}

.theme-dark .progress-section,
.theme-dark .registration-form {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .terms-section {
  @apply bg-neutral-700 border-neutral-600;
}

.theme-dark .preferences-section {
  @apply border-neutral-600;
}

.theme-dark .preferences-title {
  @apply text-neutral-100;
}

.theme-dark .checkbox-text {
  @apply text-neutral-300;
}

.theme-dark .checkbox-input {
  @apply border-neutral-600 bg-neutral-700;
}

.theme-dark .login-text {
  @apply text-neutral-400;
}

/* Animation for step transitions */
.registration-form {
  min-height: 400px;
}

/* Focus states */
.terms-link:focus,
.login-link:focus {
  @apply outline-none ring-2 ring-offset-2 ring-primary-500;
}
</style>
