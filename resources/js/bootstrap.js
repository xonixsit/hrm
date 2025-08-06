import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

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
