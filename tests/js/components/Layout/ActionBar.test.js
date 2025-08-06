import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionBar from '@/Components/Layout/ActionBar.vue'
import LoadingSpinner from '@/Components/States/LoadingSpinner.vue'
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

// Mock usePermissions composable
vi.mock('@/composables/usePermissions.js', () => ({
  usePermissions: () => ({
    hasPermission: vi.fn(() => true),
    hasAnyPermission: vi.fn(() => true),
    hasAllPermissions: vi.fn(() => true)
  })
}))

// Mock components
vi.mock('@/Components/States/LoadingSpinner.vue', () => ({
  default: {
    name: 'LoadingSpinner',
    template: '<div class="loading-spinner-mock"></div>',
    props: ['size']
  }
}))

describe('ActionBar', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(ActionBar, {
      props,
      global: {
        stubs: {
          LoadingSpinner: true,
          EllipsisVerticalIcon: true,
          PencilIcon: true,
          TrashIcon: true
        }
      }
    })
  }

  describe('Basic Rendering', () => {
    it('renders the component with default props', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.action-bar').exists()).toBe(true)
      expect(wrapper.classes()).toContain('flex')
      expect(wrapper.classes()).toContain('items-center')
    })

    it('applies layout classes correctly', () => {
      wrapper = createWrapper({ layout: 'vertical' })
      
      expect(wrapper.classes()).toContain('flex-col')
      expect(wrapper.classes()).toContain('space-y-2')
    })

    it('applies size classes correctly', () => {
      wrapper = createWrapper({ size: 'lg' })
      
      expect(wrapper.classes()).toContain('text-lg')
    })
  })

  describe('Action Filtering and Categorization', () => {
    const testActions = [
      { 
        id: 'edit', 
        label: 'Edit', 
        icon: PencilIcon,
        priority: 'primary',
        handler: vi.fn()
      },
      { 
        id: 'delete', 
        label: 'Delete', 
        icon: TrashIcon,
        priority: 'secondary',
        variant: 'error',
        handler: vi.fn()
      },
      { 
        id: 'archive', 
        label: 'Archive',
        priority: 'dropdown',
        handler: vi.fn()
      },
      {
        id: 'hidden',
        label: 'Hidden',
        visible: false,
        handler: vi.fn()
      }
    ]

    it('categorizes actions correctly', () => {
      wrapper = createWrapper({ actions: testActions })
      
      // Primary actions should be visible
      expect(wrapper.text()).toContain('Edit')
      
      // Secondary actions should be visible
      expect(wrapper.text()).toContain('Delete')
      
      // Hidden actions should not be visible
      expect(wrapper.text()).not.toContain('Hidden')
    })

    it('shows dropdown button when there are dropdown actions', () => {
      wrapper = createWrapper({ actions: testActions })
      
      const dropdownButton = wrapper.find('button[aria-expanded]')
      expect(dropdownButton.exists()).toBe(true)
    })

    it('filters actions based on visibility function', () => {
      const actionsWithVisibility = [
        {
          id: 'conditional',
          label: 'Conditional',
          visible: () => false,
          handler: vi.fn()
        }
      ]
      
      wrapper = createWrapper({ actions: actionsWithVisibility })
      
      expect(wrapper.text()).not.toContain('Conditional')
    })
  })

  describe('Action Execution', () => {
    it('executes action handler when button is clicked', async () => {
      const handler = vi.fn()
      const actions = [
        { id: 'test', label: 'Test', handler }
      ]
      
      wrapper = createWrapper({ actions })
      
      const button = wrapper.find('button')
      await button.trigger('click')
      
      expect(handler).toHaveBeenCalled()
    })

    it('emits action event when action is executed', async () => {
      const actions = [
        { id: 'test', label: 'Test', handler: vi.fn() }
      ]
      
      wrapper = createWrapper({ actions })
      
      const button = wrapper.find('button')
      await button.trigger('click')
      
      expect(wrapper.emitted('action')).toBeTruthy()
      expect(wrapper.emitted('action')[0][0]).toEqual(actions[0])
    })

    it('does not execute disabled actions', async () => {
      const handler = vi.fn()
      const actions = [
        { id: 'test', label: 'Test', disabled: true, handler }
      ]
      
      wrapper = createWrapper({ actions })
      
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
      
      await button.trigger('click')
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not execute actions when loading', async () => {
      const handler = vi.fn()
      const actions = [
        { id: 'test', label: 'Test', handler }
      ]
      
      wrapper = createWrapper({ actions, loading: true })
      
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
      
      await button.trigger('click')
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('shows loading spinner for specific actions', () => {
      const actions = [
        { id: 'test', label: 'Test', handler: vi.fn() }
      ]
      
      wrapper = createWrapper({ 
        actions, 
        loadingActions: ['test'] 
      })
      
      const spinner = wrapper.findComponent({ name: 'LoadingSpinner' })
      expect(spinner.exists()).toBe(true)
    })

    it('disables actions that are loading', () => {
      const actions = [
        { id: 'test', label: 'Test', handler: vi.fn() }
      ]
      
      wrapper = createWrapper({ 
        actions, 
        loadingActions: ['test'] 
      })
      
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('applies loading classes to all actions when globally loading', () => {
      const actions = [
        { id: 'test', label: 'Test', handler: vi.fn() }
      ]
      
      wrapper = createWrapper({ actions, loading: true })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('opacity-50')
      expect(button.classes()).toContain('cursor-not-allowed')
    })
  })

  describe('Dropdown Menu', () => {
    const dropdownActions = [
      { id: 'action1', label: 'Action 1', priority: 'dropdown', handler: vi.fn() },
      { id: 'action2', label: 'Action 2', priority: 'dropdown', handler: vi.fn() }
    ]

    it('toggles dropdown menu when button is clicked', async () => {
      wrapper = createWrapper({ actions: dropdownActions })
      
      const dropdownButton = wrapper.find('button[aria-expanded]')
      
      // Initially closed
      expect(dropdownButton.attributes('aria-expanded')).toBe('false')
      
      // Click to open
      await dropdownButton.trigger('click')
      expect(wrapper.vm.showDropdown).toBe(true)
      
      // Click to close
      await dropdownButton.trigger('click')
      expect(wrapper.vm.showDropdown).toBe(false)
    })

    it('renders dropdown menu items', async () => {
      wrapper = createWrapper({ actions: dropdownActions })
      
      // Open dropdown
      const dropdownButton = wrapper.find('button[aria-expanded]')
      await dropdownButton.trigger('click')
      
      // Check menu items
      const menuItems = wrapper.findAll('[role="menuitem"]')
      expect(menuItems).toHaveLength(2)
      expect(menuItems[0].text()).toContain('Action 1')
      expect(menuItems[1].text()).toContain('Action 2')
    })

    it('executes dropdown action and closes menu', async () => {
      const handler = vi.fn()
      const actions = [
        { id: 'dropdown-action', label: 'Dropdown Action', priority: 'dropdown', handler }
      ]
      
      wrapper = createWrapper({ actions })
      
      // Open dropdown
      const dropdownButton = wrapper.find('button[aria-expanded]')
      await dropdownButton.trigger('click')
      
      // Click menu item
      const menuItem = wrapper.find('[role="menuitem"]')
      await menuItem.trigger('click')
      
      expect(handler).toHaveBeenCalled()
      expect(wrapper.vm.showDropdown).toBe(false)
    })
  })

  describe('Action Variants and Styling', () => {
    it('applies primary variant classes', () => {
      const actions = [
        { id: 'primary', label: 'Primary', variant: 'primary', priority: 'primary', handler: vi.fn() }
      ]
      
      wrapper = createWrapper({ actions })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('bg-primary-600')
      expect(button.classes()).toContain('text-white')
    })

    it('applies error variant classes', () => {
      const actions = [
        { id: 'error', label: 'Error', variant: 'error', priority: 'primary', handler: vi.fn() }
      ]
      
      wrapper = createWrapper({ actions })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('bg-error-600')
      expect(button.classes()).toContain('text-white')
    })

    it('applies size-specific classes', () => {
      const actions = [
        { id: 'test', label: 'Test', handler: vi.fn() }
      ]
      
      wrapper = createWrapper({ actions, size: 'sm' })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('px-2')
      expect(button.classes()).toContain('py-1')
      expect(button.classes()).toContain('text-xs')
    })
  })

  describe('Permission Handling', () => {
    it('filters actions based on permissions', () => {
      // Mock the permissions to return false for restricted actions
      vi.doMock('@/composables/usePermissions.js', () => ({
        usePermissions: () => ({
          hasPermission: vi.fn(() => false),
          hasAnyPermission: vi.fn(() => false),
          hasAllPermissions: vi.fn(() => false)
        })
      }))
      
      const actions = [
        { 
          id: 'restricted', 
          label: 'Restricted', 
          permissions: ['admin.access'],
          handler: vi.fn() 
        }
      ]
      
      wrapper = createWrapper({ actions })
      
      expect(wrapper.text()).not.toContain('Restricted')
    })

    it('shows permission warning when user lacks required permissions', () => {
      // Mock insufficient permissions
      vi.doMock('@/composables/usePermissions.js', () => ({
        usePermissions: () => ({
          hasPermission: vi.fn(() => false),
          hasAnyPermission: vi.fn(() => false),
          hasAllPermissions: vi.fn(() => false)
        })
      }))
      
      wrapper = createWrapper({ 
        requiredPermissions: ['admin.access'],
        actions: []
      })
      
      expect(wrapper.text()).toContain('Insufficient permissions')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes for dropdown', () => {
      const actions = [
        { id: 'dropdown', label: 'Dropdown', priority: 'dropdown', handler: vi.fn() }
      ]
      
      wrapper = createWrapper({ actions })
      
      const dropdownButton = wrapper.find('button[aria-expanded]')
      expect(dropdownButton.attributes('aria-haspopup')).toBe('true')
      expect(dropdownButton.attributes('aria-expanded')).toBe('false')
    })

    it('has proper role attributes for menu items', async () => {
      const actions = [
        { id: 'menu-item', label: 'Menu Item', priority: 'dropdown', handler: vi.fn() }
      ]
      
      wrapper = createWrapper({ actions })
      
      // Open dropdown
      const dropdownButton = wrapper.find('button[aria-expanded]')
      await dropdownButton.trigger('click')
      
      const menu = wrapper.find('[role="menu"]')
      expect(menu.exists()).toBe(true)
      expect(menu.attributes('aria-orientation')).toBe('vertical')
      
      const menuItem = wrapper.find('[role="menuitem"]')
      expect(menuItem.exists()).toBe(true)
    })

    it('supports keyboard shortcuts display', async () => {
      const actions = [
        { 
          id: 'shortcut', 
          label: 'With Shortcut', 
          shortcut: 'Ctrl+S',
          priority: 'dropdown',
          handler: vi.fn() 
        }
      ]
      
      wrapper = createWrapper({ actions })
      
      // Open dropdown
      const dropdownButton = wrapper.find('button[aria-expanded]')
      await dropdownButton.trigger('click')
      
      expect(wrapper.text()).toContain('Ctrl+S')
    })
  })

  describe('Action Limits', () => {
    it('respects maxPrimaryActions limit', () => {
      const actions = Array.from({ length: 5 }, (_, i) => ({
        id: `primary-${i}`,
        label: `Primary ${i}`,
        priority: 'primary',
        handler: vi.fn()
      }))
      
      wrapper = createWrapper({ actions, maxPrimaryActions: 2 })
      
      // Should only show 2 primary actions, rest go to dropdown
      const primaryButtons = wrapper.findAll('button').filter(btn => 
        !btn.attributes('aria-expanded')
      )
      expect(primaryButtons.length).toBeLessThanOrEqual(3) // 2 primary + dropdown button
    })

    it('respects maxSecondaryActions limit', () => {
      const actions = Array.from({ length: 5 }, (_, i) => ({
        id: `secondary-${i}`,
        label: `Secondary ${i}`,
        priority: 'secondary',
        handler: vi.fn()
      }))
      
      wrapper = createWrapper({ actions, maxSecondaryActions: 1 })
      
      // Excess secondary actions should go to dropdown
      const dropdownButton = wrapper.find('button[aria-expanded]')
      expect(dropdownButton.exists()).toBe(true)
    })
  })
})