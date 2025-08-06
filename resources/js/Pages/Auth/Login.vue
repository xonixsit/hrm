<script setup>
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import ApplicationLogo from '@/Components/ApplicationLogo.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import BaseCheckbox from '@/Components/Base/BaseCheckbox.vue';
import Icon from '@/Components/Base/Icon.vue';

defineProps({
    canResetPassword: {
        type: Boolean,
    },
    status: {
        type: String,
    },
});

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

const isLoading = ref(false);

const submit = () => {
    isLoading.value = true;
    form.post(route('login'), {
        onFinish: () => {
            form.reset('password');
            isLoading.value = false;
        },
    });
};

// Social login handlers (placeholder for future implementation)
const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login clicked');
};

const handleGithubLogin = () => {
    // TODO: Implement GitHub OAuth
    console.log('GitHub login clicked');
};
</script>

<template>
    <div class="min-h-screen flex">
        <Head title="Sign In" />
        
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
                    <ApplicationLogo class="h-16 w-16 text-white fill-current" />
                </div>
                
                <h1 class="text-5xl font-bold mb-6 leading-tight">
                    Welcome back to your
                    <span class="text-accent-300">workspace</span>
                </h1>
                
                <p class="text-xl text-white/80 mb-8 leading-relaxed max-w-md">
                    Sign in to access your dashboard, manage projects, and collaborate with your team.
                </p>
                
                <!-- Feature highlights -->
                <div class="space-y-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Icon name="check" class="w-4 h-4" />
                        </div>
                        <span class="text-white/90">Secure authentication</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Icon name="shield-check" class="w-4 h-4" />
                        </div>
                        <span class="text-white/90">Role-based access control</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Icon name="users" class="w-4 h-4" />
                        </div>
                        <span class="text-white/90">Team collaboration tools</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Right Side - Login Form -->
        <div class="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-neutral-50">
            <div class="mx-auto w-full max-w-md">
                <!-- Mobile Logo -->
                <div class="lg:hidden flex justify-center mb-8">
                    <ApplicationLogo class="h-12 w-12 text-primary-600 fill-current" />
                </div>
                
                <!-- Header -->
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-neutral-900 mb-2">
                        Sign in to your account
                    </h2>
                    <p class="text-neutral-600">
                        Don't have an account?
                        <Link 
                            :href="route('register')" 
                            class="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                        >
                            Create one here
                        </Link>
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
                
                <!-- Social Login Buttons -->
                <div class="mb-6 space-y-3">
                    <BaseButton
                        variant="secondary"
                        size="lg"
                        full-width
                        @click="handleGoogleLogin"
                        class="justify-center"
                    >
                        <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </BaseButton>
                    
                    <BaseButton
                        variant="secondary"
                        size="lg"
                        full-width
                        @click="handleGithubLogin"
                        class="justify-center"
                    >
                        <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        Continue with GitHub
                    </BaseButton>
                </div>
                
                <!-- Divider -->
                <div class="relative mb-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-neutral-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-4 bg-neutral-50 text-neutral-500">Or continue with email</span>
                    </div>
                </div>
                
                <!-- Login Form -->
                <form @submit.prevent="submit" class="space-y-6">
                    <!-- Email Field -->
                    <div>
                        <BaseInput
                            id="email"
                            v-model="form.email"
                            type="email"
                            label="Email address"
                            placeholder="Enter your email"
                            :error-message="form.errors.email"
                            :icon-left="'mail'"
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
                            v-model="form.password"
                            type="password"
                            label="Password"
                            placeholder="Enter your password"
                            :error-message="form.errors.password"
                            :icon-left="'lock-closed'"
                            required
                            autocomplete="current-password"
                            size="lg"
                        />
                    </div>
                    
                    <!-- Remember Me & Forgot Password -->
                    <div class="flex items-center justify-between">
                        <BaseCheckbox
                            v-model="form.remember"
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
                        :loading="form.processing || isLoading"
                        :disabled="form.processing || isLoading"
                        class="justify-center"
                    >
                        <Icon name="arrow-right" class="w-5 h-5 ml-2" />
                        Sign in
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
