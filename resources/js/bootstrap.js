import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set up CSRF token for all requests
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: Please ensure the CSRF token is properly set.');
}

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// Only initialize Echo if Pusher credentials are available
const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1';

if (pusherKey) {
    import('laravel-echo').then(({ default: Echo }) => {
        import('pusher-js').then(({ default: Pusher }) => {
            window.Pusher = Pusher;

            window.Echo = new Echo({
                broadcaster: 'pusher',
                key: pusherKey,
                cluster: pusherCluster,
                wsHost: import.meta.env.VITE_PUSHER_HOST ? import.meta.env.VITE_PUSHER_HOST : `ws-${pusherCluster}.pusherapp.com`,
                wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
                wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
                forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
                enabledTransports: ['ws', 'wss'],
                auth: {
                    headers: {
                        'X-CSRF-TOKEN': token?.content,
                    },
                },
            });

            //console.log('✅ Laravel Echo initialized with Pusher');
        }).catch(error => {
            console.warn('⚠️ Failed to load Pusher:', error);
            //console.log('📝 Run: npm install pusher-js');
        });
    }).catch(error => {
        console.warn('⚠️ Failed to load Laravel Echo:', error);
        //console.log('📝 Run: npm install laravel-echo');
    });
} else {
    console.warn('⚠️ Pusher credentials not found. Real-time features disabled.');
    //console.log('📝 Add VITE_PUSHER_APP_KEY to your .env file to enable real-time features.');
    
    // Set Echo to null so components can check for its availability
    window.Echo = null;
}

// Add axios interceptors to handle response errors safely
axios.interceptors.response.use(
  (response) => {
    // Successful response - return as is
    return response;
  },
  (error) => {
    // Enhanced error handling for axios responses
    if (error && typeof error === 'object') {
      // Ensure response object exists and has required properties
      if (!error.response) {
        error.response = {
          status: 0,
          statusText: 'Network Error',
          data: null
        };
      } else if (typeof error.response !== 'object') {
        // If response exists but is not an object, create a proper response object
        const originalResponse = error.response;
        error.response = {
          status: 0,
          statusText: 'Invalid Response',
          data: originalResponse
        };
      } else {
        // Ensure status property exists
        if (typeof error.response.status === 'undefined') {
          error.response.status = 0;
        }
        if (typeof error.response.statusText === 'undefined') {
          error.response.statusText = 'Unknown Error';
        }
      }
      
      // Ensure request object exists
      if (!error.request) {
        error.request = {};
      }
      
      // Add safe error message
      if (!error.message) {
        error.message = `HTTP ${error.response.status}: ${error.response.statusText}`;
      }
    }
    
    // Log the error in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AXIOS INTERCEPTOR] Request failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
    }
    
    return Promise.reject(error);
  }
);
