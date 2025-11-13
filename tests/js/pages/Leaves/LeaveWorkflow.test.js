import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createInertiaApp } from '@inertiajs/vue3';
import LeavesIndex from '@/Pages/Leaves/Index.vue';
import LeavesCreate from '@/Pages/Leaves/Create.vue';
import LeavesShow from '@/Pages/Leaves/Show.vue';
import LeavesEdit from '@/Pages/Leaves/Edit.vue';

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

describe('Leave Management Workflow', () => {
  const mockLeaveTypes = [
    { id: 1, name: 'Annual Leave' },
    { id: 2, name: 'Sick Leave' },
    { id: 3, name: 'Personal Leave' }
  ];

  const mockLeaves = {
    data: [
      {
        id: 1,
        from_date: '2024-02-01',
        to_date: '2024-02-03',
        status: 'pending',
        leave_type: { id: 1, name: 'Annual Leave' },
        employee: { user: { name: 'John Doe', email: 'john@example.com' } },
        reason: 'Family vacation',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ],
    links: []
  };

  describe('Leaves Index Page', () => {
    it('renders leave management header correctly', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: mockLeaves,
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

      expect(wrapper.text()).toContain('Leave Management');
      expect(wrapper.text()).toContain('Manage leave requests and approvals');
    });

    it('shows request leave button for employees', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: mockLeaves,
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

      expect(wrapper.text()).toContain('Request Leave');
    });

    it('displays search and filter controls', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: mockLeaves,
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

      const searchInput = wrapper.find('input[placeholder*="Search"]');
      expect(searchInput.exists()).toBe(true);

      const statusFilter = wrapper.find('select');
      expect(statusFilter.exists()).toBe(true);
    });

    it('configures table columns correctly', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: mockLeaves,
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
      expect(vm.tableColumns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ key: 'dates', label: 'Duration' }),
          expect.objectContaining({ key: 'leave_type', label: 'Leave Type' }),
          expect.objectContaining({ key: 'status', label: 'Status' })
        ])
      );
    });

    it('formats dates correctly', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: mockLeaves,
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
      const formattedDate = vm.formatDate('2024-02-01');
      expect(formattedDate).toMatch(/Feb 1, 2024/);
    });

    it('calculates duration correctly', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: mockLeaves,
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
      const duration = vm.getDuration('2024-02-01', '2024-02-03');
      expect(duration).toBe('3 days');
    });

    it('provides correct row actions for employees', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: mockLeaves,
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
      const actions = vm.getRowActions(mockLeaves.data[0]);
      
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'view', label: 'View Details' }),
          expect.objectContaining({ id: 'edit', label: 'Edit' }),
          expect.objectContaining({ id: 'delete', label: 'Delete' })
        ])
      );
    });
  });

  describe('Leaves Create Page', () => {
    it('renders step-by-step form correctly', () => {
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

      expect(wrapper.text()).toContain('Request Leave');
      expect(wrapper.text()).toContain('Submit a new leave request for approval');
    });

    it('shows progress indicator with correct steps', () => {
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
      expect(vm.formSteps).toHaveLength(4);
      expect(vm.formSteps[0].title).toBe('Leave Type');
      expect(vm.formSteps[1].title).toBe('Dates');
      expect(vm.formSteps[2].title).toBe('Details');
      expect(vm.formSteps[3].title).toBe('Review');
    });

    it('validates step progression correctly', () => {
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
      
      // Step 0: Should not proceed without leave type
      expect(vm.canProceedToNextStep()).toBe(false);
      
      // Select leave type
      vm.form.leave_type_id = 1;
      expect(vm.canProceedToNextStep()).toBe(true);
      
      // Step 1: Should not proceed without dates
      vm.currentStep = 1;
      expect(vm.canProceedToNextStep()).toBe(false);
      
      // Add dates
      vm.form.from_date = '2024-02-01';
      vm.form.to_date = '2024-02-03';
      expect(vm.canProceedToNextStep()).toBe(true);
      
      // Step 2: Should not proceed without reason
      vm.currentStep = 2;
      expect(vm.canProceedToNextStep()).toBe(false);
      
      // Add reason
      vm.form.reason = 'Family vacation';
      expect(vm.canProceedToNextStep()).toBe(true);
    });

    it('calculates duration correctly', () => {
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
      vm.form.from_date = '2024-02-01';
      vm.form.to_date = '2024-02-03';
      
      expect(vm.calculateDuration()).toBe('3 days');
      
      // Test half day
      vm.form.is_half_day = true;
      vm.form.to_date = '2024-02-01';
      expect(vm.calculateDuration()).toBe('0.5 days');
    });

    it('provides correct leave type descriptions', () => {
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
      expect(vm.getLeaveTypeDescription('Annual Leave')).toBe('Planned vacation or personal time off');
      expect(vm.getLeaveTypeDescription('Sick Leave')).toBe('Medical leave for illness or health issues');
    });

    it('validates dates correctly', () => {
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
      vm.form.from_date = '2024-02-03';
      vm.form.to_date = '2024-02-01'; // End before start
      
      vm.validateDates();
      
      expect(vm.form.to_date).toBe('2024-02-03'); // Should be corrected
    });
  });

  describe('Leaves Show Page', () => {
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

    it('renders leave details correctly', () => {
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

      expect(wrapper.text()).toContain('Leave Request #1');
      expect(wrapper.text()).toContain('Annual Leave');
      expect(wrapper.text()).toContain('Family vacation');
    });

    it('shows approval workflow for approvers', async () => {
      // Mock approver role
      vi.mocked(vi.fn()).mockReturnValue(true);
      
      const wrapper = mount(LeavesShow, {
        props: {
          leave: mockLeave
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            DetailPage: true,
            InfoCard: true
          },
          mocks: {
            hasAnyRole: () => true
          }
        }
      });

      expect(wrapper.text()).toContain('Approval Required');
      expect(wrapper.text()).toContain('Approve');
      expect(wrapper.text()).toContain('Reject');
    });

    it('calculates duration correctly', () => {
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
      expect(vm.calculateDuration()).toBe('3 days');
    });

    it('formats date range correctly', () => {
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
      const dateRange = vm.formatDateRange('2024-02-01', '2024-02-03');
      expect(dateRange).toMatch(/Thu, Feb 1 - Sat, Feb 3, 2024/);
    });

    it('shows correct status styling', () => {
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
      expect(vm.getStatusVariant('pending')).toBe('warning');
      expect(vm.getStatusVariant('approved')).toBe('success');
      expect(vm.getStatusVariant('rejected')).toBe('error');
    });

    it('shows timeline correctly', () => {
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
  });

  describe('Leaves Edit Page', () => {
    const mockLeave = {
      id: 1,
      leave_type_id: 1,
      from_date: '2024-02-01',
      to_date: '2024-02-03',
      reason: 'Family vacation',
      status: 'pending',
      is_emergency: false,
      is_half_day: false
    };

    it('renders edit form correctly', () => {
      const wrapper = mount(LeavesEdit, {
        props: {
          leave: mockLeave,
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true
          }
        }
      });

      expect(wrapper.text()).toContain('Edit Leave Request');
      expect(wrapper.text()).toContain('Update your leave request details');
    });

    it('pre-fills form with existing data', () => {
      const wrapper = mount(LeavesEdit, {
        props: {
          leave: mockLeave,
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true
          }
        }
      });

      const vm = wrapper.vm;
      expect(vm.form.leave_type_id).toBe(1);
      expect(vm.form.from_date).toBe('2024-02-01');
      expect(vm.form.to_date).toBe('2024-02-03');
      expect(vm.form.reason).toBe('Family vacation');
    });

    it('validates dates on change', () => {
      const wrapper = mount(LeavesEdit, {
        props: {
          leave: mockLeave,
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true
          }
        }
      });

      const vm = wrapper.vm;
      vm.form.from_date = '2024-02-03';
      vm.form.to_date = '2024-02-01';
      
      vm.validateDates();
      
      expect(vm.form.to_date).toBe('2024-02-03');
    });

    it('shows correct form actions', () => {
      const wrapper = mount(LeavesEdit, {
        props: {
          leave: mockLeave,
          leaveTypes: mockLeaveTypes
        },
        global: {
          stubs: {
            AuthenticatedLayout: true,
            FormLayout: true,
            FormSection: true,
            FormField: true
          }
        }
      });

      const vm = wrapper.vm;
      expect(vm.formActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'cancel', label: 'Cancel' }),
          expect.objectContaining({ id: 'submit', label: 'Update Request' })
        ])
      );
    });
  });

  describe('Leave Type Icons and Styling', () => {
    it('provides correct icons for leave types', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: mockLeaves,
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
      expect(vm.getLeaveTypeIcon('Annual Leave')).toBeDefined();
      expect(vm.getLeaveTypeIcon('Sick Leave')).toBeDefined();
      expect(vm.getLeaveTypeIcon('Personal Leave')).toBeDefined();
    });

    it('provides correct styling classes for leave types', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: mockLeaves,
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
      expect(vm.getLeaveTypeIconClasses('Annual Leave')).toContain('bg-teal-100');
      expect(vm.getLeaveTypeIconClasses('Sick Leave')).toContain('bg-red-100');
      expect(vm.getLeaveTypeIconClasses('Personal Leave')).toContain('bg-green-100');
    });
  });

  describe('Status Management', () => {
    it('provides correct status labels', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: mockLeaves,
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
      expect(vm.getStatusLabel('pending')).toBe('Pending');
      expect(vm.getStatusLabel('approved')).toBe('Approved');
      expect(vm.getStatusLabel('rejected')).toBe('Rejected');
    });

    it('provides correct status styling', () => {
      const wrapper = mount(LeavesIndex, {
        props: {
          leaves: mockLeaves,
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
      expect(vm.getStatusClasses('pending')).toContain('bg-yellow-100');
      expect(vm.getStatusClasses('approved')).toContain('bg-green-100');
      expect(vm.getStatusClasses('rejected')).toContain('bg-red-100');
    });
  });
});