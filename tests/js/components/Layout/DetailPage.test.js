import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createInertiaApp } from '@inertiajs/vue3'
import DetailPage from '@/Components/Layout/DetailPage.vue'
import ActionBar from '@/Components/Layout/ActionBar.vue'
import LoadingSpinner from '@/Components/States/LoadingSpinner.vue'
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

// Mock Inertia
vi.mock('@inertiajs/vue3', () => ({
  Link: {
    name: 'Link',
    template: '<a :href="href"><slot /></a>',
    props: ['href']
  },
  router: {
    visit: vi.fn()
  }
}))

// Mock components
vi.mock('@/Components/Layout/ActionBar.vue', () => ({
  default: {
    name: 'ActionBar',
    template: '<div class="action-bar-mock"><slot /></div>',
    props: ['actions', 'loading']
  }
}))

vi.mock('@/Components/States/LoadingSpinner.vue', () => ({
  default: {
    name: 'LoadingSpinner',
    template: '<div class="loading-spinner-mock"></div>',
    props: ['size']
  }
}))

describe('DetailPage', () => {
  let wrapper

  const defaultProps = {
    title: 'Test Detail Page',
    subtitle: 'Test subtitle',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Items', href: '/items' },
      { label: 'Current Item', current: true }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}, slots = {}) => {
    return mount(DetailPage, {
      props: { ...defaultProps, ...props },
      slots,
      global: {
        stubs: {
          ActionBar: true,
          LoadingSpinner: true,
          ArrowLeftIcon: true,
          ChevronRightIcon: true,
          Link: {
            template: '<a :href="href"><slot /></a>',
            props: ['href']
          }
        }
      }
    })
  }

  describe('Basic Rendering', () => {
    it('renders the component with required props', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.detail-page').exists()).toBe(true)
      expect(wrapper.find('h1').text()).toBe('Test Detail Page')
      expect(wrapper.text()).toContain('Test subtitle')
    })

    it('renders breadcrumbs correctly', () => {
      wrapper = createWrapper()
      
      const breadcrumbs = wrapper.findAll('nav ol li')
      expect(breadcrumbs).toHaveLength(3)
      expect(breadcrumbs[0].text()).toContain('Home')
      expect(breadcrumbs[2].text()).toContain('Current Item')
    })

    it('renders back button when showBackButton is true', () => {
      wrapper = createWrapper({ showBackButton: true })
      
      const backButton = wrapper.find('button[aria-label="Go back"]')
      expect(backButton.exists()).toBe(true)
    })

    it('hides back button when showBackButton is false', () => {
      wrapper = createWrapper({ showBackButton: false })
      
      const backButton = wrapper.find('button[aria-label="Go back"]')
      expect(backButton.exists()).toBe(false)
    })
  })

  describe('Icon and Avatar Display', () => {
    it('renders icon when provided', () => {
      wrapper = createWrapper({ icon: ArrowLeftIcon })
      
      const iconContainer = wrapper.find('.bg-primary-100')
      expect(iconContainer.exists()).toBe(true)
    })

    it('renders avatar with image when provided', () => {
      const avatar = { src: '/test-avatar.jpg', alt: 'Test User' }
      wrapper = createWrapper({ avatar })
      
      const avatarImg = wrapper.find('img[src="/test-avatar.jpg"]')
      expect(avatarImg.exists()).toBe(true)
    })

    it('renders avatar with initials when no image provided', () => {
      const avatar = { initials: 'TU' }
      wrapper = createWrapper({ avatar })
      
      const initialsSpan = wrapper.find('.text-primary-700')
      expect(initialsSpan.text()).toBe('TU')
    })
  })

  describe('Status Badge', () => {
    it('renders status badge when status is provided', () => {
      const status = { label: 'Active', variant: 'success' }
      wrapper = createWrapper({ status })
      
      const statusBadge = wrapper.find('.bg-success-100')
      expect(statusBadge.exists()).toBe(true)
      expect(statusBadge.text()).toBe('Active')
    })

    it('applies correct classes for different status variants', () => {
      const status = { label: 'Error', variant: 'error' }
      wrapper = createWrapper({ status })
      
      const statusBadge = wrapper.find('.bg-error-100')
      expect(statusBadge.exists()).toBe(true)
    })
  })

  describe('Layout Options', () => {
    it('applies single-column layout classes', () => {
      wrapper = createWrapper({ layout: 'single-column' })
      
      const layoutContainer = wrapper.find('.grid-cols-1')
      expect(layoutContainer.exists()).toBe(true)
    })

    it('applies two-column layout classes by default', () => {
      wrapper = createWrapper()
      
      const layoutContainer = wrapper.find('.lg\\:grid-cols-3')
      expect(layoutContainer.exists()).toBe(true)
    })

    it('applies three-column layout classes', () => {
      wrapper = createWrapper({ layout: 'three-column' })
      
      const layoutContainer = wrapper.find('.lg\\:grid-cols-3')
      expect(layoutContainer.exists()).toBe(true)
    })
  })

  describe('Action Bar Integration', () => {
    it('renders ActionBar when actions are provided', () => {
      const actions = [
        { id: 'edit', label: 'Edit', handler: vi.fn() }
      ]
      wrapper = createWrapper({ actions })
      
      const actionBar = wrapper.findComponent({ name: 'ActionBar' })
      expect(actionBar.exists()).toBe(true)
    })

    it('passes loading state to ActionBar', () => {
      const actions = [{ id: 'edit', label: 'Edit', handler: vi.fn() }]
      wrapper = createWrapper({ actions, loading: true })
      
      const actionBar = wrapper.findComponent({ name: 'ActionBar' })
      expect(actionBar.props('loading')).toBe(true)
    })
  })

  describe('Loading State', () => {
    it('shows loading overlay when loading is true', () => {
      wrapper = createWrapper({ loading: true })
      
      const loadingOverlay = wrapper.find('.bg-white.bg-opacity-75')
      expect(loadingOverlay.exists()).toBe(true)
      
      const spinner = wrapper.findComponent({ name: 'LoadingSpinner' })
      expect(spinner.exists()).toBe(true)
    })

    it('hides loading overlay when loading is false', () => {
      wrapper = createWrapper({ loading: false })
      
      const loadingOverlay = wrapper.find('.bg-white.bg-opacity-75')
      expect(loadingOverlay.exists()).toBe(false)
    })
  })

  describe('Slot Content', () => {
    it('renders primary slot content', () => {
      wrapper = createWrapper({}, {
        primary: '<div class="primary-content">Primary Content</div>'
      })
      
      expect(wrapper.find('.primary-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Primary Content')
    })

    it('renders secondary slot content', () => {
      wrapper = createWrapper({}, {
        secondary: '<div class="secondary-content">Secondary Content</div>'
      })
      
      expect(wrapper.find('.secondary-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Secondary Content')
    })

    it('renders default slot when no primary slot provided', () => {
      wrapper = createWrapper({}, {
        default: '<div class="default-content">Default Content</div>'
      })
      
      expect(wrapper.find('.default-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Default Content')
    })
  })

  describe('Navigation Behavior', () => {
    it('emits back event when back button is clicked', async () => {
      wrapper = createWrapper({ showBackButton: true })
      
      const backButton = wrapper.find('button[aria-label="Go back"]')
      await backButton.trigger('click')
      
      expect(wrapper.emitted('back')).toBeTruthy()
    })

    it('navigates to backUrl when provided and back button clicked', async () => {
      const { router } = await import('@inertiajs/vue3')
      wrapper = createWrapper({ 
        showBackButton: true, 
        backUrl: '/test-back-url' 
      })
      
      const backButton = wrapper.find('button[aria-label="Go back"]')
      await backButton.trigger('click')
      
      expect(router.visit).toHaveBeenCalledWith('/test-back-url')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for back button', () => {
      wrapper = createWrapper({ 
        showBackButton: true,
        backButtonLabel: 'Custom back label'
      })
      
      const backButton = wrapper.find('button')
      expect(backButton.attributes('aria-label')).toBe('Custom back label')
    })

    it('has proper breadcrumb navigation structure', () => {
      wrapper = createWrapper()
      
      const nav = wrapper.find('nav[aria-label="Breadcrumb"]')
      expect(nav.exists()).toBe(true)
      
      const currentItem = wrapper.find('[aria-current="page"]')
      expect(currentItem.exists()).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes for different screen sizes', () => {
      wrapper = createWrapper()
      
      // Check for responsive grid classes
      const gridContainer = wrapper.find('.grid-cols-1.lg\\:grid-cols-3')
      expect(gridContainer.exists()).toBe(true)
    })

    it('has proper mobile-friendly spacing', () => {
      wrapper = createWrapper()
      
      const header = wrapper.find('.detail-page-header')
      expect(header.classes()).toContain('px-6')
      expect(header.classes()).toContain('py-4')
    })
  })
})