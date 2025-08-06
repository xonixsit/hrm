import { ref, computed, watch, onMounted } from 'vue';
import { useTheme } from '@/composables/useTheme';

/**
 * User Preferences Management Composable
 * 
 * Manages user interface preferences including theme, sidebar state,
 * accessibility options, and synchronization across devices
 */

// Preference state (shared across all instances)
const preferences = ref({
  // Theme preferences
  theme: 'system',
  useSystemTheme: true,
  
  // Layout preferences
  sidebarCollapsed: false,
  sidebarWidth: 'normal', // 'narrow', 'normal', 'wide'
  
  // Accessibility preferences
  fontSize: 'normal', // 'small', 'normal', 'large', 'extra-large'
  fontWeight: 'normal', // 'light', 'normal', 'medium', 'bold'
  lineHeight: 'normal', // 'tight', 'normal', 'relaxed', 'loose'
  density: 'normal', // 'compact', 'normal', 'comfortable'
  reducedMotion: false,
  highContrast: false,
  
  // Color scheme preferences for visual needs
  colorScheme: 'default', // 'default', 'protanopia', 'deuteranopia', 'tritanopia', 'monochrome'
  
  // Notification preferences
  soundEnabled: true,
  desktopNotifications: true,
  
  // Data preferences
  itemsPerPage: 25,
  defaultView: 'table', // 'table', 'grid', 'list'
  
  // Language and locale
  language: 'en',
  timezone: 'auto',
  dateFormat: 'auto',
  
  // Advanced preferences
  autoSave: true,
  confirmBeforeLeaving: true,
  keyboardShortcuts: true,
  
  // Metadata
  lastUpdated: null,
  version: '1.0.0'
});

// Preference schemas for validation
const preferenceSchemas = {
  theme: ['light', 'dark', 'system'],
  sidebarWidth: ['narrow', 'normal', 'wide'],
  fontSize: ['small', 'normal', 'large', 'extra-large'],
  fontWeight: ['light', 'normal', 'medium', 'bold'],
  lineHeight: ['tight', 'normal', 'relaxed', 'loose'],
  density: ['compact', 'normal', 'comfortable'],
  colorScheme: ['default', 'protanopia', 'deuteranopia', 'tritanopia', 'monochrome'],
  defaultView: ['table', 'grid', 'list'],
  language: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
  timezone: ['auto', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'],
  dateFormat: ['auto', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
};

// Default preferences
const defaultPreferences = {
  theme: 'system',
  useSystemTheme: true,
  sidebarCollapsed: false,
  sidebarWidth: 'normal',
  fontSize: 'normal',
  fontWeight: 'normal',
  lineHeight: 'normal',
  density: 'normal',
  reducedMotion: false,
  highContrast: false,
  colorScheme: 'default',
  soundEnabled: true,
  desktopNotifications: true,
  itemsPerPage: 25,
  defaultView: 'table',
  language: 'en',
  timezone: 'auto',
  dateFormat: 'auto',
  autoSave: true,
  confirmBeforeLeaving: true,
  keyboardShortcuts: true,
  lastUpdated: null,
  version: '1.0.0'
};

export function useUserPreferences() {
  const { setTheme, useSystemTheme: useSystemThemeMode } = useTheme();
  
  // Computed properties
  const isDefaultPreferences = computed(() => {
    return Object.keys(defaultPreferences).every(key => {
      if (key === 'lastUpdated' || key === 'version') return true;
      return preferences.value[key] === defaultPreferences[key];
    });
  });
  
  const accessibilityPreferences = computed(() => ({
    fontSize: preferences.value.fontSize,
    fontWeight: preferences.value.fontWeight,
    lineHeight: preferences.value.lineHeight,
    density: preferences.value.density,
    reducedMotion: preferences.value.reducedMotion,
    highContrast: preferences.value.highContrast,
    colorScheme: preferences.value.colorScheme
  }));
  
  const layoutPreferences = computed(() => ({
    sidebarCollapsed: preferences.value.sidebarCollapsed,
    sidebarWidth: preferences.value.sidebarWidth,
    defaultView: preferences.value.defaultView,
    itemsPerPage: preferences.value.itemsPerPage
  }));
  
  // Validation
  const validatePreference = (key, value) => {
    if (preferenceSchemas[key]) {
      return preferenceSchemas[key].includes(value);
    }
    
    // Boolean validation
    if (typeof defaultPreferences[key] === 'boolean') {
      return typeof value === 'boolean';
    }
    
    // Number validation
    if (typeof defaultPreferences[key] === 'number') {
      return typeof value === 'number' && !isNaN(value);
    }
    
    // String validation
    if (typeof defaultPreferences[key] === 'string') {
      return typeof value === 'string';
    }
    
    return true;
  };
  
  // Preference management
  const setPreference = (key, value) => {
    if (!preferences.value.hasOwnProperty(key)) {
      console.warn(`Unknown preference key: ${key}`);
      return false;
    }
    
    if (!validatePreference(key, value)) {
      console.warn(`Invalid value for preference ${key}:`, value);
      return false;
    }
    
    const oldValue = preferences.value[key];
    preferences.value[key] = value;
    preferences.value.lastUpdated = new Date().toISOString();
    
    // Handle special preferences
    handleSpecialPreference(key, value, oldValue);
    
    // Save to localStorage
    savePreferences();
    
    // Emit change event
    window.dispatchEvent(new CustomEvent('preference-changed', {
      detail: { key, value, oldValue }
    }));
    
    return true;
  };
  
  const setPreferences = (newPreferences) => {
    const validPreferences = {};
    let hasChanges = false;
    
    Object.entries(newPreferences).forEach(([key, value]) => {
      if (preferences.value.hasOwnProperty(key) && validatePreference(key, value)) {
        if (preferences.value[key] !== value) {
          validPreferences[key] = value;
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      Object.assign(preferences.value, validPreferences);
      preferences.value.lastUpdated = new Date().toISOString();
      
      // Handle special preferences
      Object.entries(validPreferences).forEach(([key, value]) => {
        handleSpecialPreference(key, value);
      });
      
      savePreferences();
      
      window.dispatchEvent(new CustomEvent('preferences-changed', {
        detail: { preferences: validPreferences }
      }));
    }
    
    return hasChanges;
  };
  
  const resetPreferences = () => {
    const oldPreferences = { ...preferences.value };
    Object.assign(preferences.value, defaultPreferences);
    preferences.value.lastUpdated = new Date().toISOString();
    
    savePreferences();
    applyAllPreferences();
    
    window.dispatchEvent(new CustomEvent('preferences-reset', {
      detail: { oldPreferences, newPreferences: preferences.value }
    }));
  };
  
  const resetPreference = (key) => {
    if (!preferences.value.hasOwnProperty(key)) {
      console.warn(`Unknown preference key: ${key}`);
      return false;
    }
    
    const oldValue = preferences.value[key];
    const defaultValue = defaultPreferences[key];
    
    preferences.value[key] = defaultValue;
    preferences.value.lastUpdated = new Date().toISOString();
    
    handleSpecialPreference(key, defaultValue, oldValue);
    savePreferences();
    
    window.dispatchEvent(new CustomEvent('preference-reset', {
      detail: { key, value: defaultValue, oldValue }
    }));
    
    return true;
  };
  
  // Special preference handlers
  const handleSpecialPreference = (key, value, oldValue) => {
    switch (key) {
      case 'theme':
        if (value === 'system') {
          useSystemThemeMode();
        } else {
          setTheme(value);
        }
        break;
        
      case 'useSystemTheme':
        if (value) {
          useSystemThemeMode();
        } else {
          setTheme(preferences.value.theme);
        }
        break;
        
      case 'sidebarCollapsed':
        // Update sidebar state
        localStorage.setItem('sidebar-collapsed', value.toString());
        break;
        
      case 'fontSize':
      case 'fontWeight':
      case 'lineHeight':
      case 'density':
      case 'highContrast':
      case 'colorScheme':
        applyAccessibilityPreferences();
        break;
        
      case 'reducedMotion':
        applyMotionPreferences();
        break;
    }
  };
  
  // Apply preferences to DOM
  const applyAccessibilityPreferences = () => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    // Font size
    const fontSizeMap = {
      'small': '14px',
      'normal': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[preferences.value.fontSize]);
    
    // Font weight
    const fontWeightMap = {
      'light': '300',
      'normal': '400',
      'medium': '500',
      'bold': '600'
    };
    root.style.setProperty('--base-font-weight', fontWeightMap[preferences.value.fontWeight]);
    
    // Line height
    const lineHeightMap = {
      'tight': '1.25',
      'normal': '1.5',
      'relaxed': '1.625',
      'loose': '2'
    };
    root.style.setProperty('--base-line-height', lineHeightMap[preferences.value.lineHeight]);
    
    // Density
    const densityMap = {
      'compact': '0.75',
      'normal': '1',
      'comfortable': '1.25'
    };
    root.style.setProperty('--density-scale', densityMap[preferences.value.density]);
    
    // High contrast
    root.classList.toggle('high-contrast', preferences.value.highContrast);
    
    // Color scheme for visual needs
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'monochrome');
    if (preferences.value.colorScheme !== 'default') {
      root.classList.add(preferences.value.colorScheme);
    }
  };
  
  const applyMotionPreferences = () => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    root.classList.toggle('reduce-motion', preferences.value.reducedMotion);
  };
  
  const applyAllPreferences = () => {
    applyAccessibilityPreferences();
    applyMotionPreferences();
    
    // Apply theme
    if (preferences.value.useSystemTheme) {
      useSystemThemeMode();
    } else {
      setTheme(preferences.value.theme);
    }
  };
  
  // Persistence
  const savePreferences = () => {
    try {
      localStorage.setItem('user-preferences', JSON.stringify({
        ...preferences.value,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  };
  
  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('user-preferences');
      if (saved) {
        const savedPreferences = JSON.parse(saved);
        
        // Validate and merge with defaults
        const validPreferences = {};
        Object.entries(savedPreferences).forEach(([key, value]) => {
          if (preferences.value.hasOwnProperty(key) && validatePreference(key, value)) {
            validPreferences[key] = value;
          }
        });
        
        Object.assign(preferences.value, validPreferences);
        return true;
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
    
    return false;
  };
  
  // Synchronization (placeholder for future server sync)
  const syncPreferences = async () => {
    // TODO: Implement server synchronization
    console.log('Preference synchronization not yet implemented');
    return false;
  };
  
  const exportPreferences = () => {
    return JSON.stringify(preferences.value, null, 2);
  };
  
  const importPreferences = (preferencesJson) => {
    try {
      const importedPreferences = JSON.parse(preferencesJson);
      return setPreferences(importedPreferences);
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  };
  
  // Initialization
  const initializePreferences = () => {
    loadPreferences();
    applyAllPreferences();
    
    // Set up preference change listeners
    window.addEventListener('storage', (e) => {
      if (e.key === 'user-preferences' && e.newValue) {
        try {
          const newPreferences = JSON.parse(e.newValue);
          Object.assign(preferences.value, newPreferences);
          applyAllPreferences();
        } catch (error) {
          console.warn('Failed to sync preferences from storage:', error);
        }
      }
    });
  };
  
  // Lifecycle
  onMounted(() => {
    initializePreferences();
  });
  
  // Watch for preference changes
  watch(preferences, () => {
    savePreferences();
  }, { deep: true });
  
  return {
    // State
    preferences: computed(() => preferences.value),
    accessibilityPreferences,
    layoutPreferences,
    isDefaultPreferences,
    
    // Getters
    getPreference: (key) => preferences.value[key],
    getPreferences: () => ({ ...preferences.value }),
    
    // Setters
    setPreference,
    setPreferences,
    resetPreference,
    resetPreferences,
    
    // Validation
    validatePreference,
    
    // Synchronization
    syncPreferences,
    exportPreferences,
    importPreferences,
    
    // Utilities
    initializePreferences,
    applyAllPreferences,
    
    // Constants
    defaultPreferences: computed(() => defaultPreferences),
    preferenceSchemas: computed(() => preferenceSchemas)
  };
}

export default useUserPreferences;