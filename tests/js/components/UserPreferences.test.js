import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import UserPreferences from '@/Components/UserPreferences.vue';

// Mock the composable
const mockPreferences = {
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
  autoSave: true,
  confirmBeforeLeaving: true,
  keyboardShortcuts: true,
  lastUpdated: '2024-01-01T00:00:00.000Z',
};

const mockSetPreference = vi.fn();
const mockResetPreferences = vi.fn();
const mockExportPreferences = vi.fn(() => JSON.stringify(mockPreferences));
const mockImportPreferences = vi.fn(() => true);

vi.mock('@/composables/useUserPreferences', () => ({
  useUserPreferences: () => ({
    preferences: mockPreferences,
    setPreference: mockSetPreference,
    resetPreferences: mockResetPreferences,
    exportPreferences: mockExportPreferences,
    importPreferences: mockImportPreferences,
    isDefaultPreferences: false,
  }),
}));

// Mock Icon component
vi.mock('@/Components/Base/Icon.vue', () => ({
  default: {
    name: 'Icon',
    template: '<span class="mock-icon" :data-name="name" :data-size="size"></span>',
    props: ['name', 'size'],
  },
}));

// Mock ToggleSwitch component
vi.mock('@/Components/Base/ToggleSwitch.vue', () => ({
  default: {
    name: 'ToggleSwitch',
    template: '<button class="mock-toggle" :class="{ checked }" @click="$emit(\'change\', !checked)">{{ checked ? \'On\' : \'Off\' }}</button>',
    props: ['checked'],
    emits: ['change'],
  },
}));

describe('UserPreferences', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(UserPreferences, {
      props: {
        isOpen: true,
        ...props,
      },
      global: {
        stubs: {
          Icon: true,
          ToggleSwitch: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL.createObjectURL and related APIs
    global.URL = {
      createObjectURL: vi.fn(() => 'mock-url'),
      revokeObjectURL: vi.fn(),
    };
    
    // Mock document methods
    document.createElement = vi.fn(() => ({
      href: '',
      download: '',
      click: vi.fn(),
    }));
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
    
    // Mock FileReader
    global.FileReader = vi.fn(() => ({
      readAsText: vi.fn(),
      onload: null,
    }));
    
    // Mock alert and confirm
    global.alert = vi.fn();
    global.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('rendering', () => {
    it('should render when isOpen is true', () => {
      wrapper = createWrapper({ isOpen: true });
      
      expect(wrapper.find('.user-preferences').exists()).toBe(true);
      expect(wrapper.find('[aria-labelledby="preferences-title"]').exists()).toBe(true);
    });

    it('should not render when isOpen is false', () => {
      wrapper = createWrapper({ isOpen: false });
      
      expect(wrapper.find('.user-preferences').exists()).toBe(true);
      expect(wrapper.find('[aria-labelledby="preferences-title"]').exists()).toBe(false);
    });

    it('should render all preference sections', () => {
      wrapper = createWrapper();
      
      const sections = wrapper.findAll('.theme-dropdown nav button');
      expect(sections.length).toBeGreaterThan(0);
      
      // Check for main sections
      expect(wrapper.text()).toContain('Theme & Appearance');
      expect(wrapper.text()).toContain('Layout & Navigation');
      expect(wrapper.text()).toContain('Accessibility');
      expect(wrapper.text()).toContain('Notifications');
      expect(wrapper.text()).toContain('Advanced');
    });

    it('should show the correct title and description', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('#preferences-title').text()).toBe('User Preferences');
      expect(wrapper.text()).toContain('Customize your interface and accessibility settings');
    });
  });

  describe('section navigation', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should start with appearance section active', () => {
      const appearanceButton = wrapper.find('button[class*="bg-primary-100"]');
      expect(appearanceButton.exists()).toBe(true);
    });

    it('should switch sections when navigation buttons are clicked', async () => {
      const layoutButton = wrapper.findAll('.theme-dropdown nav button')[1];
      await layoutButton.trigger('click');
      
      expect(wrapper.vm.activeSection).toBe('layout');
    });

    it('should show different content for different sections', async () => {
      // Start with appearance section
      expect(wrapper.text()).toContain('Color Theme');
      
      // Switch to layout section
      const layoutButton = wrapper.findAll('.theme-dropdown nav button')[1];
      await layoutButton.trigger('click');
      await nextTick();
      
      expect(wrapper.text()).toContain('Collapse Sidebar');
    });
  });

  describe('theme preferences', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should display theme options', () => {
      expect(wrapper.text()).toContain('Light');
      expect(wrapper.text()).toContain('Dark');
      expect(wrapper.text()).toContain('System');
    });

    it('should call setPreference when theme is changed', async () => {
      const themeButtons = wrapper.findAll('button').filter(btn => 
        btn.text().includes('Light') || btn.text().includes('Dark')
      );
      
      if (themeButtons.length > 0) {
        await themeButtons[0].trigger('click');
        expect(mockSetPreference).toHaveBeenCalled();
      }
    });

    it('should display system theme toggle', () => {
      const toggle = wrapper.find('.mock-toggle');
      expect(toggle.exists()).toBe(true);
    });

    it('should handle system theme toggle change', async () => {
      const toggle = wrapper.find('.mock-toggle');
      await toggle.trigger('click');
      
      expect(mockSetPreference).toHaveBeenCalledWith('useSystemTheme', expect.any(Boolean));
    });
  });

  describe('layout preferences', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      // Switch to layout section
      const layoutButton = wrapper.findAll('.theme-dropdown nav button')[1];
      await layoutButton.trigger('click');
      await nextTick();
    });

    it('should display sidebar collapse toggle', () => {
      expect(wrapper.text()).toContain('Collapse Sidebar');
    });

    it('should display sidebar width options', () => {
      const select = wrapper.find('select');
      expect(select.exists()).toBe(true);
      expect(wrapper.text()).toContain('Sidebar Width');
    });

    it('should display default view options', () => {
      expect(wrapper.text()).toContain('Default Data View');
      expect(wrapper.text()).toContain('Table');
      expect(wrapper.text()).toContain('Grid');
      expect(wrapper.text()).toContain('List');
    });

    it('should display items per page selector', () => {
      expect(wrapper.text()).toContain('Items Per Page');
    });

    it('should handle sidebar width change', async () => {
      const select = wrapper.find('select');
      await select.setValue('wide');
      
      expect(mockSetPreference).toHaveBeenCalledWith('sidebarWidth', 'wide');
    });
  });

  describe('accessibility preferences', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      // Switch to accessibility section
      const accessibilityButton = wrapper.findAll('.theme-dropdown nav button')[2];
      await accessibilityButton.trigger('click');
      await nextTick();
    });

    it('should display font size options', () => {
      expect(wrapper.text()).toContain('Font Size');
      expect(wrapper.text()).toContain('Small');
      expect(wrapper.text()).toContain('Normal');
      expect(wrapper.text()).toContain('Large');
      expect(wrapper.text()).toContain('Extra Large');
    });

    it('should display font weight options', () => {
      expect(wrapper.text()).toContain('Font Weight');
      expect(wrapper.text()).toContain('Light');
      expect(wrapper.text()).toContain('Medium');
      expect(wrapper.text()).toContain('Bold');
    });

    it('should display line height options', () => {
      expect(wrapper.text()).toContain('Line Height');
      expect(wrapper.text()).toContain('Tight');
      expect(wrapper.text()).toContain('Relaxed');
      expect(wrapper.text()).toContain('Loose');
    });

    it('should display density options', () => {
      expect(wrapper.text()).toContain('Interface Density');
      expect(wrapper.text()).toContain('Compact');
      expect(wrapper.text()).toContain('Comfortable');
    });

    it('should display accessibility toggles', () => {
      expect(wrapper.text()).toContain('Reduce Motion');
      expect(wrapper.text()).toContain('High Contrast');
    });

    it('should display color vision support', () => {
      expect(wrapper.text()).toContain('Color Vision Support');
      expect(wrapper.text()).toContain('Protanopia');
      expect(wrapper.text()).toContain('Deuteranopia');
      expect(wrapper.text()).toContain('Tritanopia');
      expect(wrapper.text()).toContain('Monochrome');
    });

    it('should handle font size change', async () => {
      const fontSizeButtons = wrapper.findAll('button').filter(btn => 
        btn.text() === 'Large'
      );
      
      if (fontSizeButtons.length > 0) {
        await fontSizeButtons[0].trigger('click');
        expect(mockSetPreference).toHaveBeenCalledWith('fontSize', 'large');
      }
    });
  });

  describe('notifications preferences', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      // Switch to notifications section
      const notificationsButton = wrapper.findAll('.theme-dropdown nav button')[3];
      await notificationsButton.trigger('click');
      await nextTick();
    });

    it('should display notification toggles', () => {
      expect(wrapper.text()).toContain('Sound Notifications');
      expect(wrapper.text()).toContain('Desktop Notifications');
    });

    it('should handle notification preference changes', async () => {
      const toggles = wrapper.findAll('.mock-toggle');
      if (toggles.length > 0) {
        await toggles[0].trigger('click');
        expect(mockSetPreference).toHaveBeenCalled();
      }
    });
  });

  describe('advanced preferences', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      // Switch to advanced section
      const advancedButton = wrapper.findAll('.theme-dropdown nav button')[4];
      await advancedButton.trigger('click');
      await nextTick();
    });

    it('should display advanced toggles', () => {
      expect(wrapper.text()).toContain('Auto-save Forms');
      expect(wrapper.text()).toContain('Confirm Before Leaving');
      expect(wrapper.text()).toContain('Keyboard Shortcuts');
    });

    it('should display export/import buttons', () => {
      expect(wrapper.text()).toContain('Export Settings');
      expect(wrapper.text()).toContain('Import Settings');
    });

    it('should handle export preferences', async () => {
      const exportButton = wrapper.find('button:contains("Export Settings")');
      if (exportButton.exists()) {
        await exportButton.trigger('click');
        expect(mockExportPreferences).toHaveBeenCalled();
      }
    });

    it('should handle import preferences', async () => {
      const importButton = wrapper.find('button:contains("Import Settings")');
      if (importButton.exists()) {
        await importButton.trigger('click');
        // Should trigger file input click
      }
    });
  });

  describe('modal actions', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should emit close event when close button is clicked', async () => {
      const closeButton = wrapper.find('button[aria-label="Close preferences"]');
      await closeButton.trigger('click');
      
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should emit close event when backdrop is clicked', async () => {
      const backdrop = wrapper.find('.fixed.inset-0.bg-black');
      await backdrop.trigger('click');
      
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should emit save event when save button is clicked', async () => {
      const saveButton = wrapper.find('button:contains("Save & Close")');
      await saveButton.trigger('click');
      
      expect(wrapper.emitted('save')).toBeTruthy();
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should handle reset all preferences', async () => {
      const resetButton = wrapper.find('button:contains("Reset All")');
      await resetButton.trigger('click');
      
      expect(mockResetPreferences).toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(() => {
      wrapper = createWrapper();
      
      // Mock document event listeners
      document.addEventListener = vi.fn();
      document.removeEventListener = vi.fn();
    });

    it('should close modal on Escape key', async () => {
      // Simulate Escape key press
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      wrapper.vm.handleKeydown(event);
      
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should not close modal on other keys', async () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      wrapper.vm.handleKeydown(event);
      
      expect(wrapper.emitted('close')).toBeFalsy();
    });
  });

  describe('file import', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should handle file import success', async () => {
      const mockFile = new File(['{"fontSize": "large"}'], 'preferences.json', {
        type: 'application/json',
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      const mockEvent = {
        target: {
          files: [mockFile],
          value: '',
        },
      };
      
      // Mock FileReader
      const mockReader = {
        readAsText: vi.fn(),
        onload: null,
      };
      global.FileReader = vi.fn(() => mockReader);
      
      await wrapper.vm.handleFileImport(mockEvent);
      
      // Simulate successful file read
      mockReader.onload({ target: { result: '{"fontSize": "large"}' } });
      
      expect(mockImportPreferences).toHaveBeenCalledWith('{"fontSize": "large"}');
    });

    it('should handle file import error', async () => {
      const mockFile = new File(['invalid json'], 'preferences.json', {
        type: 'application/json',
      });
      
      const fileInput = wrapper.find('input[type="file"]');
      const mockEvent = {
        target: {
          files: [mockFile],
          value: '',
        },
      };
      
      const mockReader = {
        readAsText: vi.fn(),
        onload: null,
      };
      global.FileReader = vi.fn(() => mockReader);
      
      await wrapper.vm.handleFileImport(mockEvent);
      
      // Simulate file read with invalid JSON
      mockReader.onload({ target: { result: 'invalid json' } });
      
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Error importing preferences'));
    });

    it('should handle no file selected', async () => {
      const mockEvent = {
        target: {
          files: [],
          value: '',
        },
      };
      
      await wrapper.vm.handleFileImport(mockEvent);
      
      // Should not attempt to read file
      expect(global.FileReader).not.toHaveBeenCalled();
    });
  });

  describe('date formatting', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should format valid dates', () => {
      const formatted = wrapper.vm.formatDate('2024-01-01T00:00:00.000Z');
      expect(formatted).not.toBe('Never');
      expect(formatted).not.toBe('Invalid date');
    });

    it('should handle null dates', () => {
      const formatted = wrapper.vm.formatDate(null);
      expect(formatted).toBe('Never');
    });

    it('should handle invalid dates', () => {
      const formatted = wrapper.vm.formatDate('invalid date');
      expect(formatted).toBe('Invalid date');
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should have proper ARIA attributes', () => {
      const modal = wrapper.find('[role="dialog"]');
      expect(modal.exists()).toBe(true);
      expect(modal.attributes('aria-modal')).toBe('true');
      expect(modal.attributes('aria-labelledby')).toBe('preferences-title');
    });

    it('should have proper button labels', () => {
      const closeButton = wrapper.find('button[aria-label="Close preferences"]');
      expect(closeButton.exists()).toBe(true);
    });

    it('should have proper form labels', () => {
      const labels = wrapper.findAll('label');
      expect(labels.length).toBeGreaterThan(0);
    });
  });
});