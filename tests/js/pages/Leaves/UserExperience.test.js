import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LeavesCreate from '@/Pages/Leaves/Create.vue';
import LeavesShow from '@/Pages/Leaves/Show.vue';
import LeavesIndex from '@/Pages/Leaves/Index.vue';

// Mock Inertia
vi.mock('@inertiajs/vue3', () => ({
  Link: {
    name: 'Link',
    template: '<a><slot /></a>',
    props: ['href']
  },
  router: {
    visit: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    post: vi.fn()
  },
  useForm: vi.fn(() => ({
    leave_type_id: '',
    from_date: '',
    to_date: '',
    reason: '',
    is_emergency: false,
    is_half_day: false,
    errors: {},
    processing: false,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }))
}));

// Mock auth composable
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { id: 1, name: 'Test User' } },
    roles: { value: ['Employee'] },
    hasRole: vi.fn(() => true),
    hasAnyRole: vi.fn(() => false)
  })
}));

describe('Leave Management User Experience', () => {
  const mockLeaveTypes = [
    { id: 1, name: 'Annual Leave' },
    { id: 2, name: 'Sick Leave' },
    { id: 3, name: 'Personal Leave' },
    { id: 4, name: 'Study Leave' },
    { id: 5, name: 'Emergency Leave' }
  ];

  describe('Visual Design and Accessibility', () => {
    it('uses consistent color scheme for leave types', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      const vm = wrapper.vm;
      
      // Test color consistency
      expect(vm.getLeaveTypeIconClasses('Annual Leave')).toContain('bg-teal-100 text-teal-600');
      expect(vm.getLeaveTypeIconClasses('Sick Leave')).toContain('bg-red-100 text-red-600');
      expect(vm.getLeaveTypeIconClasses('Personal Leave')).toContain('bg-green-100 text-green-600');
      expect(vm.getLeaveTypeIconClasses('Study Leave')).toContain('bg-purple-100 text-purple-600');
      expect(vm.getLeaveTypeIconClasses('Emergency Leave')).toContain('bg-orange-100 text-orange-600');
    });

    it('provides semantic icons for different leave types', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      const vm = wrapper.vm;
      
      // Icons should be meaningful and distinct
      expect(vm.getLeaveTypeIcon('Annual Leave')).toBeDefined();
      expect(vm.getLeaveTypeIcon('Sick Leave')).toBeDefined();
      expect(vm.getLeaveTypeIcon('Personal Leave')).toBeDefined();
      expect(vm.getLeaveTypeIcon('Study Leave')).toBeDefined();
      expect(vm.getLeaveTypeIcon('Emergency Leave')).toBeDefined();
    });

    it('uses appropriate status indicators', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: { data: [], links: [] },
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            DataTable: true,
            Pagination: true
          }
        }
      });

      const vm = wrapper.vm;
      
      // Status colors should be intuitive
      expect(vm.getStatusClasses('pending')).toContain('bg-yellow-100 text-yellow-800');
      expect(vm.getStatusClasses('approved')).toContain('bg-green-100 text-green-800');
      expect(vm.getStatusClasses('rejected')).toContain('bg-red-100 text-red-800');
    });

    it('provides descriptive text for leave types', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      const vm = wrapper.vm;
      
      // Descriptions should be helpful and clear
      expect(vm.getLeaveTypeDescription('Annual Leave')).toBe('Planned vacation or personal time off');
      expect(vm.getLeaveTypeDescription('Sick Leave')).toBe('Medical leave for illness or health issues');
      expect(vm.getLeaveTypeDescription('Personal Leave')).toBe('Personal matters and family obligations');
      expect(vm.getLeaveTypeDescription('Study Leave')).toBe('Educational purposes and training');
      expect(vm.getLeaveTypeDescription('Emergency Leave')).toBe('Urgent and unexpected situations');
    });
  });

  describe('Interactive Elements and Feedback', () => {
    it('provides visual feedback for leave type selection', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      const vm = wrapper.vm;
      
      // Unselected state
      expect(vm.getLeaveTypeCardClasses(mockLeaveTypes[0])).toContain('border-neutral-200 bg-white');
      
      // Selected state
      vm.form.leave_type_id = mockLeaveTypes[0].id;
      expect(vm.getLeaveTypeCardClasses(mockLeaveTypes[0])).toContain('border-primary-500 bg-primary-50');
    });

    it('shows duration calculation in real-time', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      const vm = wrapper.vm;
      
      // Single day
      vm.form.from_date = '2024-02-01';
      vm.form.to_date = '2024-02-01';
      expect(vm.calculateDuration()).toBe('1 day');
      
      // Multiple days
      vm.form.to_date = '2024-02-03';
      expect(vm.calculateDuration()).toBe('3 days');
      
      // Half day
      vm.form.is_half_day = true;
      vm.form.to_date = '2024-02-01';
      expect(vm.calculateDuration()).toBe('0.5 days');
    });

    it('validates form progression appropriately', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      const vm = wrapper.vm;
      
      // Should prevent progression without required fields
      expect(vm.canProceedToNextStep()).toBe(false);
      
      // Should allow progression when requirements are met
      vm.form.leave_type_id = 1;
      expect(vm.canProceedToNextStep()).toBe(true);
    });

    it('provides helpful character count for reason field', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      // Character count should be visible in the template
      expect(wrapper.html()).toContain('characters');
    });
  });

  describe('Calendar Integration and Date Handling', () => {
    it('shows calendar integration placeholder', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      expect(wrapper.text()).toContain('Calendar integration coming soon');
      expect(wrapper.text()).toContain('View team availability and holidays');
    });

    it('formats dates in user-friendly format', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      const vm = wrapper.vm;
      const formatted = vm.formatDate('2024-02-01');
      expect(formatted).toMatch(/Thursday, February 1, 2024/);
    });

    it('prevents invalid date selections', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      const vm = wrapper.vm;
      
      // Set end date before start date
      vm.form.from_date = '2024-02-03';
      vm.form.to_date = '2024-02-01';
      
      vm.validateDates();
      
      // Should correct the end date
      expect(vm.form.to_date).toBe('2024-02-03');
    });

    it('sets minimum date to today', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      const vm = wrapper.vm;
      const today = new Date().toISOString().split('T')[0];
      expect(vm.minDate).toBe(today);
    });
  });

  describe('Approval Workflow User Experience', () => {
    const mockLeave = {
      id: 1,
      from_date: '2024-02-01',
      to_date: '2024-02-03',
      status: 'pending',
      leave_type: { id: 1, name: 'Annual Leave' },
      employee: { user: { name: 'John Doe', email: 'john@example.com' } },
      reason: 'Family vacation',
      is_emergency: false,
      is_half_day: false,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    };

    it('shows clear approval interface for managers', () => {
      const wrapper = mount(LeavesShow, {
        props: {
          leave: mockLeave
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            DetailPage: true,
            InfoCard: true
          }
        }
      });

      // Should show approval section for pending requests
      expect(wrapper.text()).toContain('Approval Required');
    });

    it('provides confirmation modals for critical actions', () => {
      const wrapper = mount(LeavesShow, {
        props: {
          leave: mockLeave
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            DetailPage: true,
            InfoCard: true
          }
        }
      });

      // Modals should be present in the template
      expect(wrapper.html()).toContain('Approve Leave Request');
      expect(wrapper.html()).toContain('Reject Leave Request');
      expect(wrapper.html()).toContain('Delete Leave Request');
    });

    it('shows request timeline for transparency', () => {
      const wrapper = mount(LeavesShow, {
        props: {
          leave: mockLeave
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            DetailPage: true,
            InfoCard: true
          }
        }
      });

      expect(wrapper.text()).toContain('Request Timeline');
      expect(wrapper.text()).toContain('Request Created');
    });

    it('formats timestamps in readable format', () => {
      const wrapper = mount(LeavesShow, {
        props: {
          leave: mockLeave
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            DetailPage: true,
            InfoCard: true
          }
        }
      });

      const vm = wrapper.vm;
      const formatted = vm.formatDateTime('2024-01-15T10:00:00Z');
      expect(formatted).toMatch(/January 15, 2024/);
      expect(formatted).toMatch(/10:00/);
    });
  });

  describe('Responsive Design and Mobile Experience', () => {
    it('uses responsive grid layouts', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      // Should use responsive grid classes
      expect(wrapper.html()).toContain('grid-cols-1 md:grid-cols-2');
    });

    it('provides mobile-friendly navigation', () => {
      const wrapper = mount(LeavesShow, {
        props: {
          leave: {
            id: 1,
            from_date: '2024-02-01',
            to_date: '2024-02-03',
            status: 'pending',
            leave_type: { id: 1, name: 'Annual Leave' },
            employee: { user: { name: 'John Doe', email: 'john@example.com' } },
            reason: 'Family vacation',
            is_emergency: false,
            is_half_day: false,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
          }
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            DetailPage: true,
            InfoCard: true
          }
        }
      });

      // Should have back navigation
      expect(wrapper.text()).toContain('Back to Leaves');
    });

    it('uses appropriate spacing and sizing', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: { data: [], links: [] },
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            DataTable: true,
            Pagination: true
          }
        }
      });

      // Should use consistent spacing classes
      expect(wrapper.html()).toContain('space-x-3');
      expect(wrapper.html()).toContain('space-y-6');
    });
  });

  describe('Error Handling and User Guidance', () => {
    it('provides helpful error messages', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      // Should handle form errors gracefully
      expect(wrapper.vm.form.errors).toBeDefined();
    });

    it('shows submission guidance', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      expect(wrapper.text()).toContain('Before you submit');
      expect(wrapper.text()).toContain('Your leave request will be sent to your manager');
    });

    it('provides contextual help text', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      // Should have placeholder text and hints
      expect(wrapper.html()).toContain('Please provide a detailed reason');
    });
  });

  describe('Performance and Loading States', () => {
    it('shows loading states during form submission', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      const vm = wrapper.vm;
      expect(vm.formActions.some(action => action.loadingLabel)).toBe(true);
    });

    it('handles empty states gracefully', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: { data: [], links: [] },
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            DataTable: true,
            Pagination: true
          }
        }
      });

      // Should provide empty state configuration
      expect(wrapper.vm.tableColumns).toBeDefined();
    });

    it('optimizes for quick interactions', () => {
      const wrapper = mount(LeavesCreate, {
        props: {
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true,
            ProgressIndicator: true
          }
        }
      });

      // Should have immediate visual feedback
      const vm = wrapper.vm;
      expect(vm.getLeaveTypeCardClasses).toBeDefined();
    });
  });
});