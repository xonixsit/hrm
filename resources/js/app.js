import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createApp, h } from 'vue';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';
import { conflictDetector } from '@/services/NavigationConflictDetector.js';

// Define process.env for compatibility with code that uses it
try {
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.NODE_ENV = import.meta.env.MODE || 'production';
  //console.log('[APP] Successfully defined process.env');
} catch (error) {
  console.warn('[APP] Error defining process.env:', error);
  // Create a fallback process object
  window.process = {
    env: {
      NODE_ENV: 'production'
    }
  };
}

// Import accessibility initialization
import { initializeAccessibility } from '@/utils/accessibility.js';

const appName = import.meta.env.VITE_APP_NAME || 'Xonobics';

// Enhanced error handling for Inertia responses
const handleInertiaError = (error, context = 'unknown') => {
  console.warn(`[INERTIA ERROR HANDLER] Intercepted error in ${context}:`, error);
  
  // Check for the specific status property error
  if (error && error.message && (
    error.message.includes("Cannot read properties of undefined (reading 'status')") ||
    error.message.includes("Cannot read properties of undefined (reading 'x-inertia')")
  )) {
    console.warn('[INERTIA ERROR HANDLER] Status property error detected - preventing app crash');
    return true; // Indicate error was handled
  }
  
  return false; // Let other errors propagate
};

// Set up Inertia error handlers before creating the app
if (typeof window !== 'undefined') {
  // Global error handler for Inertia-related errors
  window.addEventListener('error', (event) => {
    if (handleInertiaError(event.error, 'window.error')) {
      event.preventDefault();
    }
  });
  
  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    if (handleInertiaError(event.reason, 'unhandledrejection')) {
      event.preventDefault();
    }
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Unregister any existing service workers to ensure the new one is used
    navigator.serviceWorker.getRegistrations().then(registrations => {
      const unregisterPromises = registrations.map(registration => registration.unregister());
      return Promise.all(unregisterPromises);
    }).then(() => {
      navigator.serviceWorker.register('/sw.js?v=4').then(registration => {
        //console.log('ServiceWorker registration successful with scope: ', registration.scope);
        // Request permission as soon as the service worker is ready
        return Notification.requestPermission();
      }).then(permission => {
        if (permission === 'granted') {
          //console.log('Notification permission granted.');
        }
      }).catch(err => {
        //console.log('ServiceWorker registration failed: ', err);
      });
    });
  });
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.vue`,
            import.meta.glob('./Pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        const app = createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue);

        // Make conflictDetector globally available
        app.config.globalProperties.$conflictDetector = conflictDetector;
        
        // Add global error handler to Vue app
        app.config.errorHandler = (error, instance, info) => {
          // Check for process.env errors and suppress them
          if (error && error.message && error.message.includes("Cannot read properties of undefined (reading 'env')")) {
            console.warn('[VUE ERROR HANDLER] Process.env error detected - preventing app crash');
            return;
          }
          
          if (!handleInertiaError(error, `vue.${info}`)) {
            console.error('[VUE ERROR]', error, info);
          }
        };
        
        // Initialize accessibility features
        initializeAccessibility();
        
        return app.mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});

// Add Inertia router error handling
if (router) {
  router.on('error', (error) => {
    handleInertiaError(error, 'inertia.router');
  });
  
  router.on('exception', (error) => {
    handleInertiaError(error, 'inertia.exception');
  });
}
