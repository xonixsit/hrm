<script setup>
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import ApplicationLogo from '@/Components/ApplicationLogo.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import BaseCheckbox from '@/Components/Base/BaseCheckbox.vue';
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
    canResetPassword: {
        type: Boolean,
    },
    status: {
        type: String,
    },
    departments: {
        type: Array,
        default: () => []
    },
});

// Toggle between login and signup
const isSignup = ref(false);

// Login form
const loginForm = useForm({
    email: '',
    password: '',
    remember: false,
});

// Signup form
const signupForm = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
});

// Department options for signup - use dynamic departments from database
const departmentOptions = computed(() => {
    if (props.departments && props.departments.length > 0) {
        return props.departments.map(dept => ({
            value: dept.id,
            label: dept.name
        }));
    }
    
    // Fallback to static options if no departments are loaded
    return [
        { value: 'engineering', label: 'Engineering' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'Human Resources' },
        { value: 'finance', label: 'Finance' },
        { value: 'operations', label: 'Operations' },
        { value: 'support', label: 'Customer Support' },
        { value: 'management', label: 'Management' }
    ];
});

const isLoading = ref(false);

// Login submission
const submitLogin = () => {
    isLoading.value = true;
    loginForm.post(route('login'), {
        onFinish: () => {
            loginForm.reset('password');
            isLoading.value = false;
        },
    });
};

// Signup submission
const submitSignup = () => {
    isLoading.value = true;
    signupForm.post(route('register'), {
        onFinish: () => {
            signupForm.reset('password', 'password_confirmation');
            isLoading.value = false;
        },
    });
};

// Toggle between forms
const toggleForm = () => {
    isSignup.value = !isSignup.value;
    // Reset forms when switching
    loginForm.reset();
    signupForm.reset();
};

// Signup form validation
const isSignupFormValid = computed(() => {
    return signupForm.name.trim() && 
           signupForm.email.trim() && 
           signupForm.password && 
           signupForm.password_confirmation && 
           signupForm.password === signupForm.password_confirmation;
});

</script>

<template>
    <div class="min-h-screen flex">
        <Head title="HR Management - Sign In" />
        
        <!-- Left Side - Branding/Hero Section -->
        <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
            <!-- Background Pattern -->
            <div class="absolute inset-0 bg-black/10"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            
            <!-- Decorative Elements -->
            <div class="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div class="absolute bottom-40 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            <div class="absolute top-1/2 left-10 w-24 h-24 bg-accent-400/20 rounded-full blur-lg"></div>
            
            <!-- Content -->
            <div class="relative z-10 flex flex-col justify-center items-start px-16 py-12 text-white">
                <div class="mb-8">
                    <ApplicationLogo class="h-auto w-64 text-white" />
                </div>
                
                <h1 class="text-5xl font-bold mb-6 leading-tight">
                    Welcome to
                    <span class="text-accent-300">HR Management</span>
                </h1>
                
                <p class="text-xl text-white/80 mb-8 leading-relaxed max-w-md">
                    Sign in to access your HR dashboard, manage employee records, and streamline internal workflows.
                </p>
                
                <!-- Feature highlights -->
                <div class="space-y-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Icon name="check" class="w-4 h-4" />
                        </div>
                        <span class="text-white/90">Employee attendance tracking</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Icon name="shield-check" class="w-4 h-4" />
                        </div>
                        <span class="text-white/90">Leave management system</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Icon name="users" class="w-4 h-4" />
                        </div>
                        <span class="text-white/90">Department collaboration tools</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Right Side - Login Form -->
        <div class="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-neutral-50">
            <div class="mx-auto w-full max-w-md">
                <!-- Mobile Logo -->
                <div class="lg:hidden flex justify-center mb-8">
                    <ApplicationLogo class="h-auto w-48 text-primary-600" />
                </div>
                
                <!-- Header -->
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-neutral-900 mb-2">
                        {{ isSignup ? 'Create your HR Management account' : 'Sign in to HR Management' }}
                    </h2>
                    <p class="text-neutral-600">
                        {{ isSignup ? 'Already have an account?' : "Don't have an account?" }}
                        <button 
                            @click="toggleForm"
                            class="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200 underline"
                        >
                            {{ isSignup ? 'Sign in here' : 'Create one here' }}
                        </button>
                    </p>
                </div>
                
                <!-- Status Message -->
                <div 
                    v-if="status" 
                    class="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg"
                >
                    <div class="flex items-center">
                        <Icon name="check-circle" class="w-5 h-5 text-success-500 mr-2" />
                        <p class="text-sm font-medium text-success-800">{{ status }}</p>
                    </div>
                </div>
                
                <!-- Login Form -->
                <form v-if="!isSignup" @submit.prevent="submitLogin" class="space-y-6">
                    <!-- Email Field -->
                    <div>
                        <BaseInput
                            id="email"
                            v-model="loginForm.email"
                            type="email"
                            placeholder="employee2@example.com"
                            :error-message="loginForm.errors.email"
                            :icon-left="'mail'"
                            :floating-label="false"
                            required
                            autofocus
                            autocomplete="username"
                            size="lg"
                        />
                    </div>
                    
                    <!-- Password Field -->
                    <div>
                        <BaseInput
                            id="password"
                            v-model="loginForm.password"
                            type="password"
                            placeholder="••••••••"
                            :error-message="loginForm.errors.password"
                            :icon-left="'lock-closed'"
                            :floating-label="false"
                            required
                            autocomplete="current-password"
                            size="lg"
                        />
                    </div>
                    
                    <!-- Remember Me & Forgot Password -->
                    <div class="flex items-center justify-between">
                        <BaseCheckbox
                            v-model="loginForm.remember"
                            label="Remember me"
                            size="md"
                        />
                        
                        <Link
                            v-if="canResetPassword"
                            :href="route('password.request')"
                            class="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    
                    <!-- Submit Button -->
                    <BaseButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        full-width
                        :loading="loginForm.processing || isLoading"
                        :disabled="loginForm.processing || isLoading"
                        class="justify-center"
                    >
                        <Icon name="arrow-right" class="w-5 h-5 ml-2" />
                        Sign in
                    </BaseButton>
                </form>

                <!-- Signup Form -->
                <form v-else @submit.prevent="submitSignup" class="space-y-4">
                    <!-- Name Field -->
                    <div>
                        <BaseInput
                            id="name"
                            v-model="signupForm.name"
                            type="text"
                            placeholder="Enter your full name"
                            :error-message="signupForm.errors.name"
                            :icon-left="'user'"
                            :floating-label="false"
                            required
                            autocomplete="name"
                            size="lg"
                        />
                    </div>
                    
                    <!-- Email Field -->
                    <div>
                        <BaseInput
                            id="signup-email"
                            v-model="signupForm.email"
                            type="email"
                            placeholder="Enter your email address"
                            :error-message="signupForm.errors.email"
                            :icon-left="'mail'"
                            :floating-label="false"
                            required
                            autocomplete="email"
                            size="lg"
                        />
                    </div>
                    
                    <!-- Password Field -->
                    <div>
                        <BaseInput
                            id="signup-password"
                            v-model="signupForm.password"
                            type="password"
                            placeholder="Create a password"
                            :error-message="signupForm.errors.password"
                            :icon-left="'lock-closed'"
                            :floating-label="false"
                            required
                            autocomplete="new-password"
                            size="lg"
                        />
                    </div>
                    
                    <!-- Confirm Password Field -->
                    <div>
                        <BaseInput
                            id="password-confirmation"
                            v-model="signupForm.password_confirmation"
                            type="password"
                            placeholder="Confirm your password"
                            :error-message="signupForm.errors.password_confirmation"
                            :icon-left="'lock-closed'"
                            :floating-label="false"
                            required
                            autocomplete="new-password"
                            size="lg"
                        />
                    </div>
                    
                    <!-- Department Field -->
                    
                    <!-- Position Field -->
                    
                    <!-- Employee ID Field -->
                    
                    <!-- Submit Button -->
                    <BaseButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        full-width
                        :loading="signupForm.processing || isLoading"
                        :disabled="!isSignupFormValid || signupForm.processing || isLoading"
                        class="justify-center mt-6"
                    >
                        <Icon name="user-plus" class="w-5 h-5 ml-2" />
                        Create Account
                    </BaseButton>
                </form>
                
                <!-- Footer -->
                <div class="mt-8 text-center">
                    <p class="text-xs text-neutral-500">
                        By signing in, you agree to our
                        <a href="#" class="font-medium text-primary-600 hover:text-primary-500">Terms of Service</a>
                        and
                        <a href="#" class="font-medium text-primary-600 hover:text-primary-500">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Custom animations for smooth transitions */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in-up {
    animation: fadeInUp 0.6s ease-out;
}

/* Gradient background animation */
@keyframes gradientShift {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

.animated-gradient {
    background-size: 200% 200%;
    animation: gradientShift 8s ease infinite;
}

/* Loading state styles */
.loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

/* Focus enhancements */
.focus-enhanced:focus-within {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

/* Hover effects for social buttons */
.social-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
