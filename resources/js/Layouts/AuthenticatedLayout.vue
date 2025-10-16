<script setup>
import { ref, computed, useSlots, onMounted } from 'vue';
import NavigationErrorDisplay from '@/Components/NavigationErrorDisplay.vue';
import IntegratedTopNav from '@/Components/Navigation/IntegratedTopNav.vue';
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
        
        <!-- Integrated Top Navigation -->
        <IntegratedTopNav :current-route="currentRoute" />

        <!-- Main Layout Container with Unified Background -->
        <div :class="[
            'min-h-screen transition-all duration-300',
            // Unified background system with subtle gradients
            isDark 
                ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' 
                : 'bg-gradient-to-br from-gray-50 via-white to-blue-50/30'
        ]">
            <!-- Page Header with Better Integration -->
            <header 
                v-if="slots.header" 
                :class="[
                    'border-b transition-all duration-200 backdrop-blur-sm',
                    isDark 
                        ? 'bg-gray-800/50 border-gray-700/50 shadow-lg shadow-gray-900/20' 
                        : 'bg-white/80 border-gray-200/60 shadow-lg shadow-gray-900/10'
                ]"
                role="banner"
                aria-label="Page header"
            >
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <!-- Enhanced header with consistent styling -->
                    <div :class="[
                        'flex items-center justify-between',
                        isDark ? 'text-white' : 'text-gray-900'
                    ]">
                        <div>
                            <h1 :class="[
                                'text-2xl font-bold transition-colors duration-200',
                                isDark ? 'text-white' : 'text-gray-900'
                            ]">
                                <slot name="header" />
                            </h1>
                            <!-- Optional breadcrumb or subtitle area -->
                            <div v-if="slots.subtitle" :class="[
                                'mt-1 text-sm',
                                isDark ? 'text-gray-300' : 'text-gray-600'
                            ]">
                                <slot name="subtitle" />
                            </div>
                        </div>
                        
                        <!-- Header actions area -->
                        <div v-if="slots.headerActions" class="flex items-center space-x-3">
                            <slot name="headerActions" />
                        </div>
                    </div>
                </div>
            </header>
            
            <!-- Main Content Area with Unified Spacing System -->
            <main 
                id="main-content"
                class="relative"
                role="main"
                aria-label="Main content"
                tabindex="-1"
            >
                <!-- Content Container with Consistent Design System -->
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <slot />
                </div>
            </main>
        </div>
    </div>
</template>
