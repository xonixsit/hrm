<script setup>
import { computed } from 'vue';
import GuestLayout from '@/Layouts/GuestLayout.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import FormField from '@/Components/Forms/FormField.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';

// Simple form data for intranet application
const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: '',
    position: '',
    employee_id: '',
});

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

// Form validation
const isFormValid = computed(() => {
    return form.name.trim() && 
           form.email.trim() && 
           form.password && 
           form.password_confirmation && 
           form.password === form.password_confirmation &&
           form.department &&
           form.position.trim() &&
           form.employee_id.trim();
});

// Form submission
const handleSubmit = () => {
    form.post(route('register'), {
        onFinish: () => {
            form.reset('password', 'password_confirmation');
        }
    });
};
</script>

<template>
    <GuestLayout>
        <Head title="Create Account" />

        <div class="registration-container">
            <!-- Registration Header -->
            <div class="registration-header">
                <h1 class="registration-title">Create Your Account</h1>
                <p class="registration-subtitle">
                    Join our team and get started
                </p>
            </div>

            <!-- Simple Registration Form -->
            <form @submit.prevent="handleSubmit" class="registration-form">
                <div class="form-fields">
                    <!-- Personal Information -->
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

                    <!-- Account Security -->
                    <FormField
                        name="password"
                        label="Password"
                        required
                        :error-message="form.errors.password"
                        help-text="Must be at least 8 characters"
                    >
                        <BaseInput
                            v-model="form.password"
                            type="password"
                            placeholder="Create a password"
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

                    <!-- Work Information -->
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
                </div>

                <!-- Submit Button -->
                <div class="form-actions">
                    <BaseButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        :disabled="!isFormValid || form.processing"
                        :loading="form.processing"
                        class="submit-button"
                    >
                        Create Account
                    </BaseButton>
                </div>
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
    </GuestLayout>
</template>

<style scoped>
/* Registration container */
.registration-container {
  @apply max-w-lg mx-auto px-4 py-6 space-y-4;
}

/* Registration header */
.registration-header {
  @apply text-center space-y-1 mb-6;
}

.registration-title {
  @apply text-2xl font-bold text-neutral-900;
}

.registration-subtitle {
  @apply text-base text-neutral-600;
}

/* Registration form */
.registration-form {
  @apply bg-white rounded-lg border border-neutral-200 p-5 shadow-sm;
}

.form-fields {
  @apply space-y-4 mb-5;
}

/* Form actions */
.form-actions {
  @apply flex justify-center pt-4 border-t border-neutral-200;
}

.submit-button {
  @apply min-w-48;
}

/* Login link section */
.login-link-section {
  @apply text-center mt-6;
}

.login-text {
  @apply text-sm text-neutral-600;
}

.login-link {
  @apply text-primary-600 hover:text-primary-700 underline font-medium;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 rounded;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .form-grid {
    @apply grid-cols-1 gap-6;
  }
}

@media (max-width: 640px) {
  .registration-container {
    @apply px-4 py-6 space-y-6;
  }
  
  .registration-title {
    @apply text-2xl;
  }
  
  .registration-subtitle {
    @apply text-base;
  }
  
  .registration-form {
    @apply p-6;
  }
  
  .form-grid {
    @apply gap-6;
  }
  
  .form-fields {
    @apply space-y-4;
  }
  
  .submit-button {
    @apply w-full min-w-0;
  }
}

/* Dark theme adjustments */
.theme-dark .registration-title {
  @apply text-neutral-100;
}

.theme-dark .registration-subtitle {
  @apply text-neutral-400;
}

.theme-dark .registration-form {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .section-title {
  @apply text-neutral-100 border-neutral-700;
}

.theme-dark .form-actions {
  @apply border-neutral-700;
}

.theme-dark .login-text {
  @apply text-neutral-400;
}

/* Focus states and animations */
.registration-form {
  transition: all 0.2s ease-out;
}

.form-section {
  transition: all 0.2s ease-out;
}

.submit-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Hover effects */
.registration-form:hover {
  @apply shadow-md;
}
</style>
