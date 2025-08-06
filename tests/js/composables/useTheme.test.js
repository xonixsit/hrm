import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { useTheme } from '@/composables/useTheme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.matchMedia
const matchMediaMock = vi.fn();

// Mock document
const documentMock = {
  documentElement: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    },
    style: {
      setProperty: vi.fn(),
    },
    className: '',
  },
};

// Mock window
const windowMock = {
  matchMedia: matchMediaMock,
  dispatchEvent: vi.fn(),
};

describe('useTheme Enhanced', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // Setup window.matchMedia mock
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      writable: true,
    });
    
    // Setup document mock
    Object.defineProperty(global, 'document', {
      value: documentMock,
      writable: true,
    });
    
    // Setup window mock
    Object.defineProperty(global, 'window', {
      value: windowMock,
      writable: true,
    });
    
    // Reset document element state
    documentMock.documentElement.className = '';
    documentMock.documentElement.classList.contains.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Enhanced Initialization', () => {
    it('should initialize with light theme as default when no preferences exist', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const { activeTheme, currentTheme, isSystemThemePreferred, initializeTheme } = useTheme();
      
      // Call initializeTheme to trigger the initialization logic
      initializeTheme();
      await nextTick();
      
      expect(currentTheme.value).toBe('light');
      expect(activeTheme.value).toBe('light');
      expect(isSystemThemePreferred.value).toBe(false);
    });

    it('should handle corrupted localStorage gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      const { activeTheme, currentTheme, initializeTheme } = useTheme();
      
      // Call initializeTheme to trigger the initialization logic
      initializeTheme();
      await nextTick();
      
      expect(currentTheme.value).toBe('light');
      expect(activeTheme.value).toBe('light');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('theme-preference');
    });

    it('should validate and sanitize loaded preferences', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        theme: 'invalid-theme',
        useSystem: 'not-boolean',
        timestamp: '2023-01-01T00:00:00.000Z'
      }));
      
      const { currentTheme, isSystemThemePreferred, initializeTheme } = useTheme();
      
      // Call initializeTheme to trigger the initialization logic
      initializeTheme();
      await nextTick();
      
      expect(currentTheme.value).toBe('light'); // Should fallback to light
      expect(isSystemThemePreferred.value).toBe(false); // Should fallback to false
    });

    it('should handle system theme detection errors', () => {
      matchMediaMock.mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });
      
      const { systemTheme } = useTheme();
      
      expect(systemTheme.value).toBe('light'); // Should fallback to light
    });
  });

  describe('Enhanced Theme Application', () => {
    it('should cleanup existing theme classes before applying new ones', () => {
      const { cleanupAndApplyTheme } = useTheme();
      
      cleanupAndApplyTheme('dark');
      
      expect(documentMock.documentElement.classList.remove).toHaveBeenCalledWith('theme-light', 'theme-dark');
      expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('theme-dark');
    });

    it('should fallback to light theme for invalid themes', () => {
      const { cleanupAndApplyTheme } = useTheme();
      
      cleanupAndApplyTheme('invalid-theme');
      
      expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('theme-light');
    });

    it('should handle DOM manipulation errors gracefully', () => {
      documentMock.documentElement.classList.add.mockImplementation(() => {
        throw new Error('DOM error');
      });
      
      const { cleanupAndApplyTheme } = useTheme();
      
      // Should not throw error
      expect(() => cleanupAndApplyTheme('dark')).not.toThrow();
    });

    it('should update CSS custom properties correctly', () => {
      const { cleanupAndApplyTheme } = useTheme();
      
      cleanupAndApplyTheme('dark');
      
      expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith('--color-neutral-50', '#0a0a0a');
      expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith('--color-neutral-950', '#ffffff');
    });
  });

  describe('Theme Validation and Cleanup Utilities', () => {
    it('should validate theme state correctly', () => {
      documentMock.documentElement.classList.contains.mockImplementation((className) => {
        return className === 'theme-light';
      });
      
      const { validateThemeState } = useTheme();
      const result = validateThemeState();
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect missing theme classes', () => {
      documentMock.documentElement.classList.contains.mockReturnValue(false);
      
      const { validateThemeState } = useTheme();
      const result = validateThemeState();
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('No theme class found on document root');
    });

    it('should detect multiple theme classes', () => {
      documentMock.documentElement.classList.contains.mockReturnValue(true);
      
      const { validateThemeState } = useTheme();
      const result = validateThemeState();
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Multiple theme classes found on document root');
    });

    it('should cleanup theme classes successfully', () => {
      const { cleanupThemeClasses } = useTheme();
      const result = cleanupThemeClasses();
      
      expect(result).toBe(true);
      expect(documentMock.documentElement.classList.remove).toHaveBeenCalledWith('theme-light');
      expect(documentMock.documentElement.classList.remove).toHaveBeenCalledWith('theme-dark');
    });

    it('should reset theme to default successfully', () => {
      const { resetThemeToDefault, currentTheme, isSystemThemePreferred } = useTheme();
      const result = resetThemeToDefault();
      
      expect(result).toBe(true);
      expect(currentTheme.value).toBe('light');
      expect(isSystemThemePreferred.value).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('theme-preference');
    });
  });

  describe('Theme Recovery System', () => {
    it('should recover theme system successfully', () => {
      const { recoverThemeSystem } = useTheme();
      const result = recoverThemeSystem();
      
      expect(result).toBe(true);
      expect(documentMock.documentElement.classList.remove).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('theme-preference');
    });

    it('should handle recovery failures gracefully', () => {
      // Mock resetThemeToDefault to fail
      documentMock.documentElement.classList.remove.mockImplementation(() => {
        throw new Error('DOM error');
      });
      
      const { recoverThemeSystem } = useTheme();
      const result = recoverThemeSystem();
      
      // The recovery should still succeed because cleanupThemeClasses handles errors gracefully
      // and resetThemeToDefault will still work even if cleanup fails
      expect(result).toBe(true);
    });
  });

  describe('Enhanced Persistence', () => {
    it('should save theme preference with validation', () => {
      const { setTheme } = useTheme();
      
      setTheme('dark');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'theme-preference',
        expect.stringContaining('"theme":"dark"')
      );
    });

    it('should handle localStorage save errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const { setTheme } = useTheme();
      
      // Should not throw error
      expect(() => setTheme('dark')).not.toThrow();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('theme-preference');
    });

    it('should validate theme before saving', () => {
      const { setTheme } = useTheme();
      
      // Try to set invalid theme
      setTheme('invalid-theme');
      
      // Should not save invalid theme
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('System Theme Integration', () => {
    it('should setup system theme listener with error handling', () => {
      const mockMediaQuery = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      matchMediaMock.mockReturnValue(mockMediaQuery);
      
      const { initializeTheme } = useTheme();
      const cleanup = initializeTheme();
      
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(typeof cleanup).toBe('function');
    });

    it('should handle system theme listener setup errors', () => {
      matchMediaMock.mockImplementation(() => {
        throw new Error('matchMedia error');
      });
      
      const { initializeTheme } = useTheme();
      const cleanup = initializeTheme();
      
      expect(cleanup).toBe(null);
    });
  });

  describe('Debug and Development Utilities', () => {
    it('should provide debug information in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
      
      const { debugThemeState } = useTheme();
      debugThemeState();
      
      expect(consoleSpy).toHaveBeenCalledWith('🎨 Theme Debug Info');
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });

    it('should not debug in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      
      const { debugThemeState } = useTheme();
      debugThemeState();
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain backward compatibility with legacy applyTheme method', () => {
      const { setTheme } = useTheme();
      
      // Should not throw error and should work as expected
      expect(() => setTheme('dark')).not.toThrow();
      expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('theme-dark');
    });
  });
});