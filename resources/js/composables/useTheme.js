import { ref, computed, watch, onMounted } from 'vue';

/**
 * Theme Management Composable
 * 
 * Provides theme switching functionality with persistence and system theme detection
 * Supports light/dark themes with smooth transitions
 */

// Theme state (shared across all instances)
const currentTheme = ref('light');
const systemTheme = ref('light');
const isSystemThemePreferred = ref(false); // Default to false to ensure light theme by default

// Available themes
const themes = {
  light: {
    name: 'Light',
    key: 'light',
    colors: {
      background: '#fafafa',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e5e5'
    }
  },
  dark: {
    name: 'Dark',
    key: 'dark',
    colors: {
      background: '#0a0a0a',
      surface: '#111827',
      text: '#fafafa',
      textSecondary: '#d4d4d4',
      border: '#404040'
    }
  }
};

export function useTheme() {
  // Computed properties
  const activeTheme = computed(() => {
    if (isSystemThemePreferred.value) {
      return systemTheme.value;
    }
    return currentTheme.value;
  });

  const themeConfig = computed(() => themes[activeTheme.value]);

  const isDark = computed(() => activeTheme.value === 'dark');
  const isLight = computed(() => activeTheme.value === 'light');

  // Theme detection with error handling
  const detectSystemTheme = () => {
    if (typeof window === 'undefined') return 'light';
    
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? 'dark' : 'light';
    } catch (error) {
      console.warn('Failed to detect system theme:', error);
      return 'light'; // Safe fallback
    }
  };

  // Enhanced theme persistence with validation
  const saveThemePreference = (theme, useSystem = false) => {
    try {
      // Validate theme before saving
      const validatedTheme = validateTheme(theme) ? theme : 'light';
      
      const preference = {
        theme: validatedTheme,
        useSystem: Boolean(useSystem),
        timestamp: new Date().toISOString(),
        version: 1 // For future migration compatibility
      };
      
      localStorage.setItem('theme-preference', JSON.stringify(preference));
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
      // Attempt to clear corrupted data
      try {
        localStorage.removeItem('theme-preference');
      } catch (clearError) {
        console.warn('Failed to clear corrupted theme preference:', clearError);
      }
    }
  };

  const loadThemePreference = () => {
    try {
      const saved = localStorage.getItem('theme-preference');
      if (saved) {
        const preference = JSON.parse(saved);
        
        // Validate loaded preference structure
        if (typeof preference === 'object' && preference !== null) {
          const validatedTheme = validateTheme(preference.theme) ? preference.theme : 'light';
          const validatedUseSystem = typeof preference.useSystem === 'boolean' ? preference.useSystem : false;
          
          return {
            theme: validatedTheme,
            useSystem: validatedUseSystem,
            timestamp: preference.timestamp || null,
            version: preference.version || 1
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      // Clear corrupted localStorage data
      try {
        localStorage.removeItem('theme-preference');
      } catch (clearError) {
        console.warn('Failed to clear corrupted theme preference:', clearError);
      }
    }
    
    // Return safe defaults
    return {
      theme: 'light',
      useSystem: false, // Changed to false to ensure light theme by default
      timestamp: null,
      version: 1
    };
  };

  // Enhanced theme application with cleanup and error recovery
  const cleanupAndApplyTheme = (theme) => {
    if (typeof document === 'undefined') return;

    try {
      const root = document.documentElement;
      
      // Ensure we have a valid theme
      const safeTheme = validateTheme(theme) ? theme : 'light';
      
      // Remove ALL theme classes first (cleanup any potential conflicts)
      root.classList.remove('theme-light', 'theme-dark');
      
      // Add the correct theme class
      root.classList.add(`theme-${safeTheme}`);
      
      // Update CSS custom properties
      updateThemeProperties(safeTheme);
      
      // Emit theme change event
      try {
        window.dispatchEvent(new CustomEvent('theme-changed', {
          detail: { theme: safeTheme, config: themes[safeTheme] }
        }));
      } catch (eventError) {
        console.warn('Failed to dispatch theme change event:', eventError);
      }
      
    } catch (error) {
      console.error('Failed to apply theme:', error);
      // Fallback: try to apply light theme
      try {
        const root = document.documentElement;
        root.classList.remove('theme-light', 'theme-dark');
        root.classList.add('theme-light');
        updateThemeProperties('light');
      } catch (fallbackError) {
        console.error('Failed to apply fallback theme:', fallbackError);
      }
    }
  };

  // Separate method for updating CSS custom properties
  const updateThemeProperties = (theme) => {
    if (typeof document === 'undefined') return;
    
    try {
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.style.setProperty('--color-neutral-50', '#0a0a0a');
        root.style.setProperty('--color-neutral-100', '#111827');
        root.style.setProperty('--color-neutral-200', '#262626');
        root.style.setProperty('--color-neutral-300', '#404040');
        root.style.setProperty('--color-neutral-400', '#525252');
        root.style.setProperty('--color-neutral-500', '#6b7280');
        root.style.setProperty('--color-neutral-600', '#a3a3a3');
        root.style.setProperty('--color-neutral-700', '#d4d4d4');
        root.style.setProperty('--color-neutral-800', '#e5e5e5');
        root.style.setProperty('--color-neutral-900', '#fafafa');
        root.style.setProperty('--color-neutral-950', '#ffffff');
      } else {
        // Reset to light theme values
        root.style.setProperty('--color-neutral-50', '#fafafa');
        root.style.setProperty('--color-neutral-100', '#f5f5f5');
        root.style.setProperty('--color-neutral-200', '#e5e5e5');
        root.style.setProperty('--color-neutral-300', '#d4d4d4');
        root.style.setProperty('--color-neutral-400', '#a3a3a3');
        root.style.setProperty('--color-neutral-500', '#6b7280');
        root.style.setProperty('--color-neutral-600', '#525252');
        root.style.setProperty('--color-neutral-700', '#404040');
        root.style.setProperty('--color-neutral-800', '#262626');
        root.style.setProperty('--color-neutral-900', '#111827');
        root.style.setProperty('--color-neutral-950', '#0a0a0a');
      }
    } catch (error) {
      console.warn('Failed to update theme properties:', error);
    }
  };

  // Legacy method for backward compatibility
  const applyTheme = (theme) => {
    cleanupAndApplyTheme(theme);
  };

  // Theme switching methods
  const setTheme = (theme) => {
    if (!themes[theme]) {
      console.warn(`Theme "${theme}" not found`);
      return;
    }

    currentTheme.value = theme;
    isSystemThemePreferred.value = false;
    saveThemePreference(theme, false);
    cleanupAndApplyTheme(theme);
  };

  const useSystemTheme = () => {
    isSystemThemePreferred.value = true;
    const detected = detectSystemTheme();
    systemTheme.value = detected;
    saveThemePreference(detected, true);
    applyTheme(detected);
  };

  const toggleTheme = () => {
    const newTheme = activeTheme.value === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // System theme change listener
  const setupSystemThemeListener = () => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      systemTheme.value = newSystemTheme;
      
      if (isSystemThemePreferred.value) {
        applyTheme(newSystemTheme);
        saveThemePreference(newSystemTheme, true);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Return cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  };

  // Theme validation
  const validateTheme = (theme) => {
    return themes.hasOwnProperty(theme);
  };

  // Get theme list
  const getAvailableThemes = () => {
    return Object.values(themes);
  };

  // Enhanced theme debugging and validation utilities
  const debugThemeState = () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🎨 Theme Debug Info');
      console.log('Current theme:', currentTheme.value);
      console.log('System theme:', systemTheme.value);
      console.log('Active theme:', activeTheme.value);
      console.log('Use system theme:', isSystemThemePreferred.value);
      console.log('Is dark:', isDark.value);
      console.log('Theme config:', themeConfig.value);
      console.log('Available themes:', Object.keys(themes));
      
      // Additional debugging info
      console.log('DOM theme class:', document.documentElement.className);
      console.log('LocalStorage preference:', localStorage.getItem('theme-preference'));
      console.log('System prefers dark:', window.matchMedia('(prefers-color-scheme: dark)').matches);
      console.groupEnd();
    }
  };

  // Theme state validation method
  const validateThemeState = () => {
    const issues = [];
    
    // Check if current theme is valid
    if (!validateTheme(currentTheme.value)) {
      issues.push(`Invalid current theme: ${currentTheme.value}`);
    }
    
    // Check if system theme is valid
    if (!validateTheme(systemTheme.value)) {
      issues.push(`Invalid system theme: ${systemTheme.value}`);
    }
    
    // Check if active theme is valid
    if (!validateTheme(activeTheme.value)) {
      issues.push(`Invalid active theme: ${activeTheme.value}`);
    }
    
    // Check DOM state
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const hasLightClass = root.classList.contains('theme-light');
      const hasDarkClass = root.classList.contains('theme-dark');
      
      if (!hasLightClass && !hasDarkClass) {
        issues.push('No theme class found on document root');
      }
      
      if (hasLightClass && hasDarkClass) {
        issues.push('Multiple theme classes found on document root');
      }
      
      const expectedClass = `theme-${activeTheme.value}`;
      if (!root.classList.contains(expectedClass)) {
        issues.push(`Expected theme class ${expectedClass} not found on document root`);
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  };

  // Theme cleanup utilities
  const cleanupThemeClasses = () => {
    if (typeof document === 'undefined') return;
    
    try {
      const root = document.documentElement;
      
      // Remove all possible theme classes
      const themeClasses = ['theme-light', 'theme-dark'];
      themeClasses.forEach(className => {
        root.classList.remove(className);
      });
      
      return true;
    } catch (error) {
      console.warn('Failed to cleanup theme classes:', error);
      return false;
    }
  };

  const resetThemeToDefault = () => {
    try {
      // Reset all state to defaults
      currentTheme.value = 'light';
      systemTheme.value = detectSystemTheme();
      isSystemThemePreferred.value = false;
      
      // Clear localStorage
      try {
        localStorage.removeItem('theme-preference');
      } catch (storageError) {
        console.warn('Failed to clear theme preference from localStorage:', storageError);
      }
      
      // Apply light theme
      cleanupAndApplyTheme('light');
      
      return true;
    } catch (error) {
      console.error('Failed to reset theme to default:', error);
      return false;
    }
  };

  // Theme recovery method for emergency situations
  const recoverThemeSystem = () => {
    console.warn('Attempting theme system recovery...');
    
    try {
      // Step 1: Clean up DOM classes
      cleanupThemeClasses();
      
      // Step 2: Reset to safe defaults
      const success = resetThemeToDefault();
      
      if (success) {
        console.log('Theme system recovery successful');
        return true;
      } else {
        throw new Error('Failed to reset theme to default');
      }
    } catch (error) {
      console.error('Theme system recovery failed:', error);
      
      // Last resort: force light theme class on DOM
      try {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.add('theme-light');
        }
        return false;
      } catch (lastResortError) {
        console.error('Last resort theme recovery failed:', lastResortError);
        return false;
      }
    }
  };

  // Enhanced theme system initialization with robust error recovery
  const initializeTheme = () => {
    try {
      // Load saved theme preference
      const preference = loadThemePreference();
      
      // Initialize system theme detection
      systemTheme.value = detectSystemTheme();
      
      // Apply saved preferences or defaults
      if (preference.useSystem) {
        isSystemThemePreferred.value = true;
        currentTheme.value = systemTheme.value;
      } else {
        isSystemThemePreferred.value = false;
        currentTheme.value = preference.theme;
      }
      
      // Apply the theme to DOM
      cleanupAndApplyTheme(activeTheme.value);
      
      // Setup system theme change listener
      const cleanup = setupSystemThemeListener();
      
      return cleanup;
      
    } catch (error) {
      console.error('Theme initialization failed:', error);
      
      // Emergency fallback: force light theme directly on DOM
      try {
        currentTheme.value = 'light';
        systemTheme.value = 'light';
        isSystemThemePreferred.value = false;
        
        if (typeof document !== 'undefined') {
          document.documentElement.classList.add('theme-light');
          document.documentElement.classList.remove('theme-dark', 'dark');
        }
      } catch (fallbackError) {
        console.error('Emergency theme fallback failed:', fallbackError);
      }
      
      return null;
    }
  };

  // Lifecycle management
  onMounted(() => {
    initializeTheme();
  });

  // Watch for theme changes
  watch(activeTheme, (newTheme) => {
    applyTheme(newTheme);
  });

  return {
    // State
    currentTheme: computed(() => currentTheme.value),
    systemTheme: computed(() => systemTheme.value),
    activeTheme,
    themeConfig,
    isDark,
    isLight,
    isSystemThemePreferred: computed(() => isSystemThemePreferred.value),
    
    // Methods
    setTheme,
    toggleTheme,
    useSystemTheme,
    validateTheme,
    getAvailableThemes,
    debugThemeState,
    initializeTheme,
    
    // Enhanced validation and cleanup utilities
    validateThemeState,
    cleanupThemeClasses,
    resetThemeToDefault,
    recoverThemeSystem,
    cleanupAndApplyTheme,
    
    // Utilities
    themes: computed(() => themes)
  };
}

// Export theme constants for external use
export { themes };
export default useTheme;