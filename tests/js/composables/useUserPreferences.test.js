import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ref } from 'vue';
import { useUserPreferences } from '@/composables/useUserPreferences';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock useTheme composable
const mockSetTheme = vi.fn();
const mockUseSystemTheme = vi.fn();

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    useSystemTheme: mockUseSystemTheme,
  }),
}));

describe('useUserPreferences', () => {
  let preferences;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockSetTheme.mockClear();
    mockUseSystemTheme.mockClear();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // Mock document
    Object.defineProperty(window, 'document', {
      value: {
        documentElement: {
          style: {
            setProperty: vi.fn(),
          },
          classList: {
            add: vi.fn(),
            remove: vi.fn(),
            toggle: vi.fn(),
          },
        },
      },
      writable: true,
    });
    
    // Mock window events
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
    window.dispatchEvent = vi.fn();
    
    // Initialize the composable directly
    preferences = useUserPreferences();
  });

  afterEach(() => {
    // Clean up if needed
  });

  describe('initialization', () => {
    it('should initialize with default preferences', () => {
      expect(preferences.preferences.theme).toBe('system');
      expect(preferences.preferences.useSystemTheme).toBe(true);
      expect(preferences.preferences.sidebarCollapsed).toBe(false);
      expect(preferences.preferences.fontSize).toBe('normal');
      expect(preferences.preferences.density).toBe('normal');
    });

    it('should load preferences from localStorage', () => {
      const savedPreferences = {
        theme: 'dark',
        fontSize: 'large',
        sidebarCollapsed: true,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPreferences));
      
      // Re-initialize the composable to test loading
      preferences = useUserPreferences();
      
      expect(preferences.preferences.theme).toBe('dark');
      expect(preferences.preferences.fontSize).toBe('large');
      expect(preferences.preferences.sidebarCollapsed).toBe(true);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // Re-initialize the composable to test error handling
      preferences = useUserPreferences();
      
      // Should fall back to defaults
      expect(preferences.preferences.theme).toBe('system');
      expect(preferences.preferences.fontSize).toBe('normal');
    });
  });

  describe('preference management', () => {
    it('should set a valid preference', () => {
      const result = preferences.setPreference('fontSize', 'large');
      
      expect(result).toBe(true);
      expect(preferences.preferences.fontSize).toBe('large');
      expect(preferences.preferences.lastUpdated).toBeTruthy();
    });

    it('should reject invalid preference keys', () => {
      const result = preferences.setPreference('invalidKey', 'value');
      
      expect(result).toBe(false);
    });

    it('should reject invalid preference values', () => {
      const result = preferences.setPreference('fontSize', 'invalid');
      
      expect(result).toBe(false);
      expect(preferences.preferences.fontSize).toBe('normal'); // Should remain unchanged
    });

    it('should validate boolean preferences', () => {
      const validResult = preferences.setPreference('reducedMotion', true);
      const invalidResult = preferences.setPreference('reducedMotion', 'not-boolean');
      
      expect(validResult).toBe(true);
      expect(invalidResult).toBe(false);
      expect(preferences.preferences.reducedMotion).toBe(true);
    });

    it('should validate number preferences', () => {
      const validResult = preferences.setPreference('itemsPerPage', 50);
      const invalidResult = preferences.setPreference('itemsPerPage', 'not-number');
      
      expect(validResult).toBe(true);
      expect(invalidResult).toBe(false);
      expect(preferences.preferences.itemsPerPage).toBe(50);
    });

    it('should set multiple preferences at once', () => {
      const newPreferences = {
        fontSize: 'large',
        density: 'compact',
        theme: 'dark',
      };
      
      const result = preferences.setPreferences(newPreferences);
      
      expect(result).toBe(true);
      expect(preferences.preferences.fontSize).toBe('large');
      expect(preferences.preferences.density).toBe('compact');
      expect(preferences.preferences.theme).toBe('dark');
    });

    it('should ignore invalid preferences when setting multiple', () => {
      const newPreferences = {
        fontSize: 'large', // valid
        invalidKey: 'value', // invalid key
        density: 'invalid', // invalid value
      };
      
      const result = preferences.setPreferences(newPreferences);
      
      expect(result).toBe(true); // Should still return true for valid changes
      expect(preferences.preferences.fontSize).toBe('large');
      expect(preferences.preferences.density).toBe('normal'); // Should remain unchanged
    });
  });

  describe('preference reset', () => {
    it('should reset a single preference to default', () => {
      preferences.setPreference('fontSize', 'large');
      
      const result = preferences.resetPreference('fontSize');
      
      expect(result).toBe(true);
      expect(preferences.preferences.fontSize).toBe('normal');
    });

    it('should reset all preferences to defaults', () => {
      preferences.setPreference('fontSize', 'large');
      preferences.setPreference('density', 'compact');
      preferences.setPreference('theme', 'dark');
      
      preferences.resetPreferences();
      
      expect(preferences.preferences.fontSize).toBe('normal');
      expect(preferences.preferences.density).toBe('normal');
      expect(preferences.preferences.theme).toBe('system');
    });

    it('should handle invalid preference key for reset', () => {
      const result = preferences.resetPreference('invalidKey');
      
      expect(result).toBe(false);
    });
  });

  describe('computed properties', () => {
    it('should correctly identify default preferences', () => {
      expect(preferences.isDefaultPreferences).toBe(true);
      
      preferences.setPreference('fontSize', 'large');
      expect(preferences.isDefaultPreferences).toBe(false);
      
      preferences.resetPreferences();
      expect(preferences.isDefaultPreferences).toBe(true);
    });

    it('should provide accessibility preferences', () => {
      preferences.setPreference('fontSize', 'large');
      preferences.setPreference('reducedMotion', true);
      preferences.setPreference('highContrast', true);
      
      const accessibilityPrefs = preferences.accessibilityPreferences;
      
      expect(accessibilityPrefs.fontSize).toBe('large');
      expect(accessibilityPrefs.reducedMotion).toBe(true);
      expect(accessibilityPrefs.highContrast).toBe(true);
    });

    it('should provide layout preferences', () => {
      preferences.setPreference('sidebarCollapsed', true);
      preferences.setPreference('sidebarWidth', 'wide');
      preferences.setPreference('defaultView', 'grid');
      
      const layoutPrefs = preferences.layoutPreferences;
      
      expect(layoutPrefs.sidebarCollapsed).toBe(true);
      expect(layoutPrefs.sidebarWidth).toBe('wide');
      expect(layoutPrefs.defaultView).toBe('grid');
    });
  });

  describe('persistence', () => {
    it('should save preferences to localStorage', () => {
      preferences.setPreference('fontSize', 'large');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user-preferences',
        expect.stringContaining('"fontSize":"large"')
      );
    });

    it('should handle localStorage save errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      // Should not throw an error
      expect(() => {
        preferences.setPreference('fontSize', 'large');
      }).not.toThrow();
    });
  });

  describe('export and import', () => {
    it('should export preferences as JSON', () => {
      preferences.setPreference('fontSize', 'large');
      preferences.setPreference('theme', 'dark');
      
      const exported = preferences.exportPreferences();
      const parsed = JSON.parse(exported);
      
      expect(parsed.fontSize).toBe('large');
      expect(parsed.theme).toBe('dark');
    });

    it('should import valid preferences', () => {
      const importData = JSON.stringify({
        fontSize: 'large',
        density: 'compact',
        theme: 'dark',
      });
      
      const result = preferences.importPreferences(importData);
      
      expect(result).toBe(true);
      expect(preferences.preferences.fontSize).toBe('large');
      expect(preferences.preferences.density).toBe('compact');
      expect(preferences.preferences.theme).toBe('dark');
    });

    it('should handle invalid import data', () => {
      const result = preferences.importPreferences('invalid json');
      
      expect(result).toBe(false);
    });

    it('should validate imported preferences', () => {
      const importData = JSON.stringify({
        fontSize: 'large', // valid
        invalidKey: 'value', // invalid
        density: 'invalid', // invalid value
      });
      
      const result = preferences.importPreferences(importData);
      
      expect(result).toBe(true); // Should still import valid preferences
      expect(preferences.preferences.fontSize).toBe('large');
      expect(preferences.preferences.density).toBe('normal'); // Should remain unchanged
    });
  });

  describe('DOM application', () => {
    it('should apply accessibility preferences to DOM', () => {
      preferences.setPreference('fontSize', 'large');
      preferences.setPreference('highContrast', true);
      preferences.setPreference('reducedMotion', true);
      
      // Trigger DOM application
      preferences.applyAllPreferences();
      
      const root = document.documentElement;
      expect(root.style.setProperty).toHaveBeenCalledWith('--base-font-size', '18px');
      expect(root.classList.toggle).toHaveBeenCalledWith('high-contrast', true);
      expect(root.classList.toggle).toHaveBeenCalledWith('reduce-motion', true);
    });

    it('should apply color scheme preferences', () => {
      preferences.setPreference('colorScheme', 'protanopia');
      
      preferences.applyAllPreferences();
      
      const root = document.documentElement;
      expect(root.classList.remove).toHaveBeenCalledWith('protanopia', 'deuteranopia', 'tritanopia', 'monochrome');
      expect(root.classList.add).toHaveBeenCalledWith('protanopia');
    });

    it('should handle missing document gracefully', () => {
      // Mock document as undefined
      Object.defineProperty(window, 'document', {
        value: undefined,
        writable: true,
      });
      
      // Should not throw an error
      expect(() => {
        preferences.applyAllPreferences();
      }).not.toThrow();
    });
  });

  describe('event handling', () => {
    it('should dispatch preference change events', () => {
      preferences.setPreference('fontSize', 'large');
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'preference-changed',
          detail: expect.objectContaining({
            key: 'fontSize',
            value: 'large',
          }),
        })
      );
    });

    it('should dispatch preferences change events for bulk updates', () => {
      preferences.setPreferences({
        fontSize: 'large',
        density: 'compact',
      });
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'preferences-changed',
          detail: expect.objectContaining({
            preferences: expect.objectContaining({
              fontSize: 'large',
              density: 'compact',
            }),
          }),
        })
      );
    });

    it('should dispatch reset events', () => {
      preferences.resetPreferences();
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'preferences-reset',
        })
      );
    });
  });

  describe('validation', () => {
    it('should validate preference values correctly', () => {
      expect(preferences.validatePreference('fontSize', 'large')).toBe(true);
      expect(preferences.validatePreference('fontSize', 'invalid')).toBe(false);
      expect(preferences.validatePreference('reducedMotion', true)).toBe(true);
      expect(preferences.validatePreference('reducedMotion', 'not-boolean')).toBe(false);
      expect(preferences.validatePreference('itemsPerPage', 25)).toBe(true);
      expect(preferences.validatePreference('itemsPerPage', 'not-number')).toBe(false);
    });
  });

  describe('special preference handling', () => {
    it('should handle sidebar collapse preference', () => {
      preferences.setPreference('sidebarCollapsed', true);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
    });

    it('should handle theme preferences', () => {
      const { setTheme, useSystemTheme } = require('@/composables/useTheme').useTheme();
      
      preferences.setPreference('theme', 'dark');
      expect(setTheme).toHaveBeenCalledWith('dark');
      
      preferences.setPreference('useSystemTheme', true);
      expect(useSystemTheme).toHaveBeenCalled();
    });
  });
});