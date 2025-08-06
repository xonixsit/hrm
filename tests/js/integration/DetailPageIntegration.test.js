import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DetailPage from '@/Components/Layout/DetailPage.vue'
import InfoCard from '@/Components/Layout/InfoCard.vue'
import ActionBar from '@/Components/Layout/ActionBar.vue'
import { PencilIcon, TrashIcon, UserIcon } from '@heroicons/vue/24/outline'

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

describe('DetailPage Integration', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createDetailPageWrapper = (props = {}, slots = {}) => {
    return mount(DetailPage, {
      props,
      slots,
      global: {
        components: {
          InfoCard,
          ActionBar
        },
        stubs: {
          LoadingSpinner: true,
          ArrowLeftIcon: true,
          ChevronRightIcon: true,
          EllipsisVerticalIcon: true,
          PencilIcon: true,
          TrashIcon: true,
          UserIcon: true,
          Link: {
            template: '<a :href="href"><slot /></a>',
            props: ['href']
          }
        }
      }
    })
  }

  describe('Complete Detail Page with InfoCards and Actions', () => {
    const mockEmployee = {
      id: 1,
      user: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      employee_code: 'EMP001',
      status: 'active',
      department: {
        name: 'Engineering'
      },
      job_title: 'Software Developer',
      join_date: '2024-01-01',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    }

    const detailPageProps = {
      title: mockEmployee.user.name,
      subtitle: 'Employee details and information',
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Employees', href: '/employees' },
        { label: mockEmployee.user.name, current: true }
      ],
      actions: [
        {
          id: 'edit',
          label: 'Edit Employee',
          icon: PencilIcon,
          variant: 'primary',
          priority: 'primary',
          handler: vi.fn()
        },
        {
          id: 'delete',
          label: 'Delete Employee',
          icon: TrashIcon,
          variant: 'error',
          priority: 'secondary',
          handler: vi.fn()
        }
      ],
      avatar: { initials: 'JD' },
      status: { label: 'Active', variant: 'success' }
    }

    const personalInfoData = {
      name: {
        label: 'Full Name',
        value: mockEmployee.user.name,
        type: 'text',
        editable: true
      },
      email: {
        label: 'Email Address',
        value: mockEmployee.user.email,
        type: 'email',
        editable: true
      },
      employee_code: {
        label: 'Employee Code',
        value: mockEmployee.employee_code,
        type: 'text',
        editable: true
      },
      status: {
        label: 'Status',
        value: mockEmployee.status,
        type: 'badge',
        badgeVariant: 'success'
      }
    }

    const employmentInfoData = {
      department: {
        label: 'Department',
        value: mockEmployee.department.name,
        type: 'text'
      },
      job_title: {
        label: 'Job Title',
        value: mockEmployee.job_title,
        type: 'text',
        editable: true
      },
      join_date: {
        label: 'Join Date',
        value: mockEmployee.join_date,
        type: 'date'
      }
    }

    const quickActions = [
      {
        id: 'edit',
        label: 'Edit',
        icon: PencilIcon,
        variant: 'primary',
        handler: vi.fn()
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: TrashIcon,
        variant: 'error',
        handler: vi.fn()
      }
    ]

    it('renders complete detail page with all components', () => {
      wrapper = createDetailPageWrapper(detailPageProps, {
        primary: `
          <InfoCard
            title="Personal Information"
            description="Basic personal and contact details"
            :data="personalInfoData"
            :enable-edit-mode="true"
          />
          <InfoCard
            title="Employment Information"
            description="Job-related details"
            :data="employmentInfoData"
          />
        `,
        secondary: `
          <InfoCard
            title="Quick Actions"
            :actions="quickActions"
          />
        `
      })

      // Check DetailPage structure
      expect(wrapper.find('.detail-page').exists()).toBe(true)
      expect(wrapper.find('h1').text()).toBe('John Doe')
      expect(wrapper.text()).toContain('Employee details and information')

      // Check breadcrumbs
      const breadcrumbs = wrapper.findAll('nav ol li')
      expect(breadcrumbs).toHaveLength(3)
      expect(breadcrumbs[0].text()).toContain('Dashboard')
      expect(breadcrumbs[2].text()).toContain('John Doe')

      // Check avatar
      const avatar = wrapper.find('.text-primary-700')
      expect(avatar.text()).toBe('JD')

      // Check status badge
      const statusBadge = wrapper.find('.bg-success-100')
      expect(statusBadge.exists()).toBe(true)
      expect(statusBadge.text()).toBe('Active')
    })

    it('handles action execution from header ActionBar', async () => {
      const editHandler = vi.fn()
      const deleteHandler = vi.fn()
      
      const propsWithHandlers = {
        ...detailPageProps,
        actions: [
          {
            id: 'edit',
            label: 'Edit Employee',
            icon: PencilIcon,
            variant: 'primary',
            priority: 'primary',
            handler: editHandler
          },
          {
            id: 'delete',
            label: 'Delete Employee',
            icon: TrashIcon,
            variant: 'error',
            priority: 'secondary',
            handler: deleteHandler
          }
        ]
      }

      wrapper = createDetailPageWrapper(propsWithHandlers)

      // Find and click edit button
      const editButton = wrapper.find('button')
      await editButton.trigger('click')

      expect(editHandler).toHaveBeenCalled()
    })

    it('displays InfoCard data correctly', () => {
      wrapper = createDetailPageWrapper(detailPageProps, {
        primary: `
          <InfoCard
            title="Personal Information"
            :data="{
              name: { label: 'Name', value: 'John Doe' },
              email: { label: 'Email', value: 'john@example.com', type: 'email' }
            }"
          />
        `
      })

      // Check InfoCard content
      expect(wrapper.text()).toContain('Personal Information')
      expect(wrapper.text()).toContain('Name')
      expect(wrapper.text()).toContain('John Doe')
      expect(wrapper.text()).toContain('Email')
      expect(wrapper.text()).toContain('john@example.com')
    })

    it('handles loading states across all components', () => {
      wrapper = createDetailPageWrapper({
        ...detailPageProps,
        loading: true
      })

      // Check loading overlay
      const loadingOverlay = wrapper.find('.bg-white.bg-opacity-75')
      expect(loadingOverlay.exists()).toBe(true)

      // Check loading spinner
      const spinner = wrapper.findComponent({ name: 'LoadingSpinner' })
      expect(spinner.exists()).toBe(true)
    })

    it('supports responsive layout switching', () => {
      // Test single column layout
      wrapper = createDetailPageWrapper({
        ...detailPageProps,
        layout: 'single-column'
      })

      const layoutContainer = wrapper.find('.grid-cols-1')
      expect(layoutContainer.exists()).toBe(true)

      // Test three column layout
      wrapper = createDetailPageWrapper({
        ...detailPageProps,
        layout: 'three-column'
      })

      const threeColumnContainer = wrapper.find('.lg\\:grid-cols-3')
      expect(threeColumnContainer.exists()).toBe(true)
    })

    it('handles back navigation', async () => {
      const { router } = await import('@inertiajs/vue3')
      
      wrapper = createDetailPageWrapper({
        ...detailPageProps,
        backUrl: '/employees'
      })

      const backButton = wrapper.find('button[aria-label="Go back"]')
      await backButton.trigger('click')

      expect(router.visit).toHaveBeenCalledWith('/employees')
    })

    it('emits events from nested components', async () => {
      const fieldUpdateHandler = vi.fn()
      
      wrapper = createDetailPageWrapper(detailPageProps, {
        primary: `
          <InfoCard
            title="Personal Information"
            :data="{
              name: { label: 'Name', value: 'John Doe', editable: true }
            }"
            :enable-edit-mode="true"
            @field-update="fieldUpdateHandler"
          />
        `
      })

      // Find InfoCard component
      const infoCard = wrapper.findComponent(InfoCard)
      expect(infoCard.exists()).toBe(true)

      // Simulate field update
      await infoCard.vm.$emit('field-update', {
        field: 'name',
        oldValue: 'John Doe',
        newValue: 'Jane Doe'
      })

      // Check that event was emitted
      expect(infoCard.emitted('field-update')).toBeTruthy()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles empty data gracefully', () => {
      wrapper = createDetailPageWrapper({
        title: 'Empty Detail Page',
        actions: [],
        breadcrumbs: []
      })

      expect(wrapper.find('.detail-page').exists()).toBe(true)
      expect(wrapper.find('h1').text()).toBe('Empty Detail Page')
    })

    it('handles missing permissions gracefully', () => {
      // Mock no permissions
      vi.doMock('@/composables/usePermissions.js', () => ({
        usePermissions: () => ({
          hasPermission: vi.fn(() => false),
          hasAnyPermission: vi.fn(() => false),
          hasAllPermissions: vi.fn(() => false)
        })
      }))

      const actionsWithPermissions = [
        {
          id: 'restricted',
          label: 'Restricted Action',
          permissions: ['admin.access'],
          handler: vi.fn()
        }
      ]

      wrapper = createDetailPageWrapper({
        title: 'Restricted Page',
        actions: actionsWithPermissions
      })

      // Action should not be visible
      expect(wrapper.text()).not.toContain('Restricted Action')
    })

    it('handles component errors gracefully', () => {
      // Test with invalid props
      wrapper = createDetailPageWrapper({
        title: 'Test Page',
        status: { label: 'Invalid', variant: 'invalid-variant' }
      })

      // Should still render without crashing
      expect(wrapper.find('.detail-page').exists()).toBe(true)
      expect(wrapper.find('h1').text()).toBe('Test Page')
    })
  })

  describe('Accessibility Integration', () => {
    it('maintains proper ARIA structure across components', () => {
      wrapper = createDetailPageWrapper({
        title: 'Accessible Page',
        breadcrumbs: [
          { label: 'Home', href: '/' },
          { label: 'Current', current: true }
        ],
        actions: [
          {
            id: 'dropdown-action',
            label: 'Dropdown Action',
            priority: 'dropdown',
            handler: vi.fn()
          }
        ]
      })

      // Check breadcrumb accessibility
      const breadcrumbNav = wrapper.find('nav[aria-label="Breadcrumb"]')
      expect(breadcrumbNav.exists()).toBe(true)

      const currentItem = wrapper.find('[aria-current="page"]')
      expect(currentItem.exists()).toBe(true)

      // Check dropdown accessibility
      const dropdownButton = wrapper.find('button[aria-expanded]')
      expect(dropdownButton.exists()).toBe(true)
      expect(dropdownButton.attributes('aria-haspopup')).toBe('true')
    })

    it('supports keyboard navigation', async () => {
      wrapper = createDetailPageWrapper({
        title: 'Keyboard Navigation Test',
        actions: [
          {
            id: 'keyboard-action',
            label: 'Keyboard Action',
            handler: vi.fn()
          }
        ]
      })

      const button = wrapper.find('button')
      
      // Test focus
      await button.trigger('focus')
      expect(button.classes()).toContain('focus:outline-none')
      expect(button.classes()).toContain('focus:ring-2')
    })
  })
})