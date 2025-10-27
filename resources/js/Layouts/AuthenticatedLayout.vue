<script setup>
    import { ref, computed, useSlots, onMounted } from 'vue';
    import NavigationErrorDisplay from '@/Components/NavigationErrorDisplay.vue';
    import IntegratedTopNav from '@/Components/Navigation/IntegratedTopNav.vue';
    import NotificationContainer from '@/Components/Notifications/NotificationContainer.vue';
    import FloatingAttendanceWidget from '@/Components/Navigation/FloatingAttendanceWidget.vue';
    import SkipLinks from '@/Components/Accessibility/SkipLinks.vue';
    import LiveRegion from '@/Components/Accessibility/LiveRegion.vue';
    import AppFooter from '@/Components/Layout/AppFooter.vue';
    import { useAuth } from '@/composables/useAuth';
    import { useTheme } from '@/composables/useTheme.js';
    import { useReminder } from '@/composables/useReminder';
    import { useWorkReportReminder } from '@/composables/useWorkReportReminder';
    import { useFlashMessages } from '@/composables/useFlashMessages';

    const slots = useSlots();
    const { user, isAuthenticated, hasRole, getUserProperty, getAuthError } = useAuth();
    const { isDark, initializeTheme } = useTheme();

    useReminder();
    useWorkReportReminder();
    useFlashMessages();

    onMounted(() => {
        initializeTheme();
    });

    const authError = computed(() => getAuthError());
    const hasAuthError = computed(() => !!authError.value);

    const currentRoute = computed(() => {
        try {
            return route().current() || '';
        } catch (error) {
            console.warn('[LAYOUT] Route helper not available:', error);
            return window.location.pathname.replace('/', '') || 'dashboard';
        }
    });

    const hasHeader = computed(() => !!slots.header);
</script>

<template>
    <div :class="[
    'min-h-screen transition-all duration-300 flex flex-col',
    // Unified background system with subtle gradients
    isDark 
      ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' 
      : 'bg-gradient-to-br from-gray-50 via-white to-blue-50/30'
  ]">
        <!-- Skip Links for Accessibility -->
        <!-- <SkipLinks /> -->

        <!-- Live Regions for Screen Reader Announcements -->
        <LiveRegion />

        <!-- Navigation Error Display -->
        <NavigationErrorDisplay />

        <!-- Notification Container -->
        <NotificationContainer />

        <!-- Floating Attendance Widget (hidden for admins) -->
        <FloatingAttendanceWidget v-if="!hasRole('Admin')" />

        <!-- Error handling for missing authentication data -->
        <div v-if="hasAuthError" :class="[
      'p-4 border z-50 relative rounded-lg mx-4 mt-4',
      isDark 
        ? 'bg-red-900/20 border-red-700 text-red-300' 
        : 'bg-red-50 border-red-200 text-red-700'
    ]">
            <p class="font-semibold">Authentication Error:</p>
            <p>{{ authError }}</p>
            <p class="text-sm mt-1">Please refresh the page or contact support if the issue persists.</p>
        </div>

        <!-- Integrated Top Navigation -->
        <IntegratedTopNav :current-route="currentRoute" />

        <!-- Main Layout Container with Consistent Spacing -->
        <div class="relative">
            <!-- Page Header with Better Integration -->
            <header v-if="slots.header" :class="[
          'border-b transition-all duration-200 backdrop-blur-sm',
          isDark 
            ? 'bg-gray-800/50 border-gray-700/50 shadow-lg shadow-gray-900/20' 
            : 'bg-white/80 border-gray-200/60 shadow-lg shadow-gray-900/10'
        ]" role="banner" aria-label="Page header">
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
            <main id="main-content" class="relative flex-1" role="main" aria-label="Main content" tabindex="-1">
                <!-- Content Container with Consistent Design System -->
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <!-- Content wrapper with unified styling -->
                    <div :class="[
            'relative transition-all duration-200',
            // Subtle content background for better hierarchy
            slots.contentBackground !== false && (
              isDark 
                ? 'bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl shadow-gray-900/20' 
                : 'bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/10'
            )
          ]">
                        <!-- Content padding wrapper -->
                        <div :class="[
              slots.contentBackground !== false ? 'p-6 sm:p-8' : ''
            ]">
                            <slot />
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- App Footer -->
        <AppFooter />
    </div>
</template>

<style scoped>
    /* Ensure consistent transitions and animations */
    * {
        transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 200ms;
    }

    /* Smooth scrolling for better UX */
    html {
        scroll-behavior: smooth;
    }

    /* Focus styles for accessibility */
    *:focus {
        outline: 2px solid theme('colors.blue.500');
        outline-offset: 2px;
    }

    /* Custom scrollbar for better visual consistency */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: theme('colors.gray.100');
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
        background: theme('colors.gray.300');
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: theme('colors.gray.400');
    }

    /* Dark mode scrollbar */
    .dark ::-webkit-scrollbar-track {
        background: theme('colors.gray.800');
    }

    .dark ::-webkit-scrollbar-thumb {
        background: theme('colors.gray.600');
    }

    .dark ::-webkit-scrollbar-thumb:hover {
        background: theme('colors.gray.500');
    }
</style>