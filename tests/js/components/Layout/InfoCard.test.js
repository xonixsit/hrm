import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import InfoCard from '@/Components/Layout/InfoCard.vue'
import LoadingSpinner from '@/Components/States/LoadingSpinner.vue'
import { PencilIcon } from '@heroicons/vue/24/outline'

// Mock Inertia
vi.mock('@inertiajs/vue3', () => ({
  Link: {
    name: 'Link',
    template: '<a :href="href"><slot /></a>',
    props: ['href']
  }
}))

// Mock components
vi.mock('@/Components/States/LoadingSpinner.vue', () => ({
  default: {
    name: 'LoadingSpinner',
    template: '<div class="loading-spinner-mock"></div>',
    props: ['size']
  }
}))

describe('InfoCard', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}, slots = {}) => {
    return mount(InfoCard, {
      props,
      slots,
      global: {
        stubs: {
          LoadingSpinner: true,
          PencilIcon: true,
          Link: {
            template: '<a :href="href"><slot /></a>',
            props: ['href']
          }
        }
      }
    })
  }

  describe('Basic Rendering', () => {
    it('renders the component with default props', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.info-card').exists()).toBe(true)
      expect(wrapper.classes()).toContain('bg-white')
      expect(wrapper.classes()).toContain('rounded-lg')
    })

    it('renders title and description when provided', () => {
      wrapper = createWrapper({
        title: 'Test Card',
        description: 'Test description'
      })
      
      expect(wrapper.find('h3').text()).toBe('Test Card')
      expect(wrapper.text()).toContain('Test description')
    })

    it('renders icon when provided', () => {
      wrapper = createWrapper({
        title: 'Test Card',
        icon: PencilIcon,
        iconVariant: 'primary'
      })
      
      const iconContainer = wrapper.find('.bg-primary-100')
      expect(iconContainer.exists()).toBe(true)
    })
  })

  describe('Variant Styling', () => {
    it('applies bordered variant classes', () => {
      wrapper = createWrapper({ variant: 'bordered' })
      
      expect(wrapper.classes()).toContain('border')
      expect(wrapper.classes()).toContain('border-neutral-200')
    })

    it('applies elevated variant classes', () => {
      wrapper = createWrapper({ variant: 'elevated' })
      
      expect(wrapper.classes()).toContain('shadow-md')
    })

    it('applies size classes correctly', () => {
      wrapper = createWrapper({ size: 'lg' })
      
      expect(wrapper.classes()).toContain('text-lg')
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading is true', () => {
      wrapper = createWrapper({ loading: true })
      
      const spinner = wrapper.findComponent({ name: 'LoadingSpinner' })
      expect(spinner.exists()).toBe(true)
    })

    it('hides content when loading', () => {
      wrapper = createWrapper({ 
        loading: true,
        data: { field1: { label: 'Field 1', value: 'Value 1' } }
      })
      
      expect(wrapper.text()).not.toContain('Field 1')
    })
  })

  describe('Empty State', () => {
    it('shows empty state when isEmpty is true', () => {
      const emptyState = {
        title: 'No data available',
        description: 'There is no data to display',
        icon: PencilIcon
      }
      
      wrapper = createWrapper({ 
        isEmpty: true,
        emptyState
      })
      
      expect(wrapper.text()).toContain('No data available')
      expect(wrapper.text()).toContain('There is no data to display')
    })

    it('shows empty state action button when provided', async () => {
      const actionHandler = vi.fn()
      const emptyState = {
        title: 'No data',
        description: 'Add some data',
        action: {
          label: 'Add Data',
          handler: actionHandler
        }
      }
      
      wrapper = createWrapper({ 
        isEmpty: true,
        emptyState
      })
      
      const actionButton = wrapper.find('button')
      expect(actionButton.text()).toBe('Add Data')
      
      await actionButton.trigger('click')
      expect(actionHandler).toHaveBeenCalled()
    })
  })

  describe('Data Display - Grid Mode', () => {
    const testData = {
      field1: { label: 'Name', value: 'John Doe', type: 'text' },
      field2: { label: 'Email', value: 'john@example.com', type: 'email' },
      field3: { label: 'Status', value: 'active', type: 'badge', badgeVariant: 'success' }
    }

    it('displays data in grid format', () => {
      wrapper = createWrapper({ 
        data: testData,
        displayMode: 'grid'
      })
      
      expect(wrapper.text()).toContain('Name')
      expect(wrapper.text()).toContain('John Doe')
      expect(wrapper.text()).toContain('Email')
      expect(wrapper.text()).toContain('john@example.com')
    })

    it('formats different field types correctly', () => {
      wrapper = createWrapper({ 
        data: testData,
        displayMode: 'grid'
      })
      
      // Check email link
      const emailLink = wrapper.find('a[href="mailto:john@example.com"]')
      expect(emailLink.exists()).toBe(true)
      
      // Check badge
      const badge = wrapper.find('.bg-success-100')
      expect(badge.exists()).toBe(true)
    })

    it('handles structured data with sections', () => {
      const structuredData = [
        {
          title: 'Personal Information',
          fields: [
            { key: 'name', label: 'Name', value: 'John Doe' },
            { key: 'email', label: 'Email', value: 'john@example.com' }
          ]
        }
      ]
      
      wrapper = createWrapper({ 
        data: structuredData,
        displayMode: 'grid'
      })
      
      expect(wrapper.text()).toContain('Personal Information')
      expect(wrapper.text()).toContain('Name')
      expect(wrapper.text()).toContain('John Doe')
    })
  })

  describe('Data Display - List Mode', () => {
    const listData = [
      { label: 'Created', value: '2024-01-01', icon: PencilIcon },
      { label: 'Updated', value: '2024-01-02', description: 'Last modified' }
    ]

    it('displays data in list format', () => {
      wrapper = createWrapper({ 
        data: listData,
        displayMode: 'list'
      })
      
      expect(wrapper.text()).toContain('Created')
      expect(wrapper.text()).toContain('2024-01-01')
      expect(wrapper.text()).toContain('Updated')
      expect(wrapper.text()).toContain('Last modified')
    })
  })

  describe('Actions', () => {
    it('renders action buttons', () => {
      const actions = [
        { id: 'edit', label: 'Edit', variant: 'primary', handler: vi.fn() },
        { id: 'delete', label: 'Delete', variant: 'error', handler: vi.fn() }
      ]
      
      wrapper = createWrapper({ 
        title: 'Test Card',
        actions
      })
      
      const editButton = wrapper.find('button:first-child')
      const deleteButton = wrapper.find('button:last-child')
      
      expect(editButton.text()).toContain('Edit')
      expect(deleteButton.text()).toContain('Delete')
    })

    it('handles action clicks', async () => {
      const editHandler = vi.fn()
      const actions = [
        { id: 'edit', label: 'Edit', handler: editHandler }
      ]
      
      wrapper = createWrapper({ 
        title: 'Test Card',
        actions
      })
      
      const editButton = wrapper.find('button')
      await editButton.trigger('click')
      
      expect(editHandler).toHaveBeenCalled()
    })

    it('disables actions when loading', () => {
      const actions = [
        { id: 'edit', label: 'Edit', handler: vi.fn() }
      ]
      
      wrapper = createWrapper({ 
        title: 'Test Card',
        actions,
        loading: true
      })
      
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('Edit Mode', () => {
    const editableData = {
      name: { 
        label: 'Name', 
        value: 'John Doe', 
        editable: true,
        type: 'text'
      },
      email: { 
        label: 'Email', 
        value: 'john@example.com', 
        editable: true,
        type: 'email'
      }
    }

    it('shows editable fields when enableEditMode is true', () => {
      wrapper = createWrapper({ 
        data: editableData,
        enableEditMode: true
      })
      
      // Check that editable fields have the group class for hover effects
      const editableFields = wrapper.findAll('.group')
      expect(editableFields.length).toBeGreaterThan(0)
    })

    it('emits field-update event when field is edited', async () => {
      wrapper = createWrapper({ 
        data: editableData,
        enableEditMode: true
      })
      
      // Simulate field update by calling the method directly
      const fieldConfig = { key: 'name', value: 'Jane Doe' }
      wrapper.vm.editableData.name = 'Jane Doe'
      wrapper.vm.originalData.name = 'John Doe'
      
      await wrapper.vm.handleFieldSave(fieldConfig)
      
      expect(wrapper.emitted('field-update')).toBeTruthy()
    })
  })

  describe('Value Formatting', () => {
    it('formats date values correctly', () => {
      const data = {
        date: { label: 'Date', value: '2024-01-01', type: 'date' }
      }
      
      wrapper = createWrapper({ data })
      
      const formattedDate = wrapper.vm.formatValue('2024-01-01', { type: 'date' })
      expect(formattedDate).toBe(new Date('2024-01-01').toLocaleDateString())
    })

    it('formats currency values correctly', () => {
      const data = {
        price: { label: 'Price', value: 1000, type: 'currency' }
      }
      
      wrapper = createWrapper({ data })
      
      const formattedCurrency = wrapper.vm.formatValue(1000, { type: 'currency' })
      expect(formattedCurrency).toBe('$1,000.00')
    })

    it('handles empty values with fallback text', () => {
      const data = {
        empty: { label: 'Empty', value: null, emptyText: 'Not provided' }
      }
      
      wrapper = createWrapper({ data })
      
      const formattedEmpty = wrapper.vm.formatValue(null, { emptyText: 'Not provided' })
      expect(formattedEmpty).toBe('Not provided')
    })
  })

  describe('Slot Content', () => {
    it('renders header slot content', () => {
      wrapper = createWrapper({}, {
        header: '<div class="custom-header">Custom Header</div>'
      })
      
      expect(wrapper.find('.custom-header').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Header')
    })

    it('renders footer slot content', () => {
      wrapper = createWrapper({}, {
        footer: '<div class="custom-footer">Custom Footer</div>'
      })
      
      expect(wrapper.find('.custom-footer').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Footer')
    })

    it('renders default slot when no data provided', () => {
      wrapper = createWrapper({}, {
        default: '<div class="custom-content">Custom Content</div>'
      })
      
      expect(wrapper.find('.custom-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Content')
    })
  })
})