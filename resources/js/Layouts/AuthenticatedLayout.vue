<script setup>
import { ref, computed, useSlots, onMounted } from 'vue';
import NavigationErrorDisplay from '@/Components/NavigationErrorDisplay.vue';
import SimpleTopNav from '@/Components/Navigation/SimpleTopNav.vue';
import NotificationContainer from '@/Components/Notifications/NotificationContainer.vue';
import FloatingAttendanceWidget from '@/Components/Navigation/FloatingAttendanceWidget.vue';
import SkipLinks from '@/Components/Accessibility/SkipLinks.vue';
import LiveRegion from '@/Components/Accessibility/LiveRegion.vue';
import { useAuth } from '@/composables/useAuth';
import { useTheme } from '@/composables/useTheme.js';
import { useReminder } from '@/composables/useReminder';
import { useWorkReportReminder } from '@/composables/useWorkReportReminder';
import { useFlashMessages } from '@/composables/useFlashMessages';

// Access slots in script setup
const slots = useSlots();

// Simplified navigation state
const currentNavigationType = ref('desktop');

// Use authentication composable for safe access to user data
const { user, isAuthenticated, hasRole, getUserProperty, getAuthError } = useAuth();

// Use theme composable and initialize theme system
const { isDark, initializeTheme } = useTheme();

useReminder();
useWorkReportReminder();
useFlashMessages();

// Initialize theme system on mount
onMounted(() => {
  initializeTheme();
});

// Computed properties for user data with fallbacks
const userName = computed(() => getUserProperty('name', 'User'));
const userEmail = computed(() => getUserProperty('email', ''));

// Error handling for missing authentication data
const authError = computed(() => getAuthError());
const hasAuthError = computed(() => !!authError.value);

// Get current route name
const currentRoute = computed(() => {
  try {
    return route().current() || '';
  } catch (error) {
    console.warn('[LAYOUT] Route helper not available:', error);
    return window.location.pathname.replace('/', '') || 'dashboard';
  }
});

// Header presence detection
const hasHeader = computed(() => !!slots.header);
</script>

<template>
    <div>
        <!-- Skip Links for Accessibility -->
        <SkipLinks />
        
        <!-- Live Regions for Screen Reader Announcements -->
        <LiveRegion />
        
        <!-- Navigation Error Display -->
        <NavigationErrorDisplay />
        
        <!-- Notification Container -->
        <NotificationContainer />
        
        <!-- Floating Attendance Widget -->
        <FloatingAttendanceWidget />
        
        <!-- Error handling for missing authentication data -->
        <div v-if="hasAuthError" class="p-4 bg-red-100 border border-red-400 text-red-700 z-50 relative">
            <p class="font-semibold">Authentication Error:</p>
            <p>{{ authError }}</p>
            <p class="text-sm mt-1">Please refresh the page or contact support if the issue persists.</p>
        </div>
        
        <!-- Simple Top Navigation -->
        <SimpleTopNav />

        <!-- Main Layout Container -->
        <div :class="[
            'min-h-screen transition-colors duration-200',
            isDark ? 'bg-gray-50' : 'bg-gray-50'
        ]">
            <!-- Page Header (if provided) -->
            <header 
                v-if="slots.header" 
                :class="[
                    'border-b transition-colors duration-200',
                    isDark ? 'bg-white border-gray-200' : 'bg-white border-gray-200'
                ]"
                role="banner"
                aria-label="Page header"
            >
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div :class="[
                        'text-2xl font-bold transition-colors duration-200',
                        isDark ? 'text-gray-900' : 'text-gray-900'
                    ]">
                        <slot name="header" />
                    </div>
                </div>
            </header>
            
            <!-- Main Content Area -->
            <main 
                id="main-content"
                class="flex-1"
                role="main"
                aria-label="Main content"
                tabindex="-1"
            >
                <!-- Content Container with Proper Spacing -->
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <slot />
                </div>
            </main>
        </div>
    </div>
</template>
