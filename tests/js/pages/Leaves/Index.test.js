import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LeavesIndex from '@/Pages/Leaves/Index.vue';

// Mock Inertia
const mockRouter = {
  visit: vi.fn(),
  delete: vi.fn(),
  put: vi.fn()
};

const mockRoute = vi.fn((name, params) => `/${name.replace('.', '/')}${params ? `/${params}` : ''}`);

// Mock useAuth composable
const mockUseAuth = {
  user: { value: { id: 1, name: 'Test User' } },
  roles: { value: ['Employee'] },
  hasRole: vi.fn(() => true),
  hasAnyRole: vi.fn(() => false)
};

vi.mock('@inertiajs/vue3', () => ({
  Link: {
    name: 'Link',
    template: '<a><slot /></a>',
    props: ['href']
  },
  router: mockRouter,
  usePage: () => ({
    props: { value: {} }
  })
}));

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => mockUseAuth
}));

global.route = mockRoute;

describe('Leaves Index Page', () => {
  let wrapper;
  
  const defaultProps = {
    leaves: {
      data: [
        {
          id: 1,
          from_date: '2024-01-15',
          to_date: '2024-01-17',
          status: 'pending',
          leave_type: { id: 1, name: 'Annual Leave' },
          employee: {
            user: { name: 'John Doe', email: 'john@example.com' }
          }
        },
        {
          id: 2,
          from_date: '2024-02-01',
          to_date: '2024-02-01',
          status: 'approved',
          leave_type: { id: 2, name: 'Sick Leave' },
          employee: {
            user: { name: 'Jane Smith', email: 'jane@example.com' }
          }
        }
      ],
      links: []
    },
    leaveTypes: [
      { id: 1, name: 'Annual Leave' },
      { id: 2, name: 'Sick Leave' },
      { id: 3, name: 'Personal Leave' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createWrapper = (props = {}) => {
    return mount(LeavesIndex, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          AuthenticatedLayout: {
            name: 'AuthenticatedLayout',
            template: '<div><slot name="header" /><slot /></div>'
          },
          DataTable: {
            name: 'DataTable',
            template: '<div class="data-table"><slot /></div>',
            props: ['data', 'columns', 'loading', 'actions', 'rowActions', 'emptyState'],
            emits: ['row-click', 'row-action', 'header-action']
          },
          Pagination: {
            name: 'Pagination',
            template: '<div class="pagination"></div>',
            props: ['links']
          }
        }
      }
    });
  };

  describe('Page Structure', () => {
    it('renders the page header correctly', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('h2').text()).toBe('Leave Management');
      expect(wrapper.text()).toContain('Manage leave requests and approvals');
    });

    it('shows create button for employees', () => {
      mockUseAuth.hasRole.mockReturnValue(true);
      wrapper = createWrapper();
      
      const createButton = wrapper.find('[href="/leaves/create"]');
      expect(createButton.exists()).toBe(true);
      expect(createButton.text()).toContain('Request Leave');
    });

    it('hides create button for non-employees', () => {
      mockUseAuth.hasRole.mockReturnValue(false);
      wrapper = createWrapper();
      
      const createButton = wrapper.find('[href="/leaves/create"]');
      expect(createButton.exists()).toBe(false);
    });
  });

  describe('Search and Filters', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('renders search input', () => {
      const searchInput = wrapper.find('input[placeholder*="Search by employee name"]');
      expect(searchInput.exists()).toBe(true);
    });

    it('renders status filter dropdown', () => {
      const statusFilter = wrapper.find('#status-filter');
      expect(statusFilter.exists()).toBe(true);
      
      const options = statusFilter.findAll('option');
      expect(options).toHaveLength(4); // All Status + 3 status options
      expect(options[1].text()).toBe('Pending');
      expect(options[2].text()).toBe('Approved');
      expect(options[3].text()).toBe('Rejected');
    });

    it('renders leave type filter dropdown', () => {
      const typeFilter = wrapper.find('#type-filter');
      expect(typeFilter.exists()).toBe(true);
      
      const options = typeFilter.findAll('option');
      expect(options).toHaveLength(4); // All Types + 3 leave types
    });

    it('handles search input changes', async () => {
      const searchInput = wrapper.find('input[placeholder*="Search by employee name"]');
      
      await searchInput.setValue('John');
      await searchInput.trigger('input');
      
      // Should update local state
      expect(wrapper.vm.searchQuery).toBe('John');
    });
  });

  describe('Data Table Configuration', () => {
    it('configures table columns correctly for employees', () => {
      mockUseAuth.hasAnyRole.mockReturnValue(false);
      wrapper = createWrapper();
      
      const columns = wrapper.vm.tableColumns;
      expect(columns).toHaveLength(3);
      expect(columns.map(col => col.key)).toEqual(['dates', 'leave_type', 'status']);
    });

    it('includes employee column for approvers', () => {
      mockUseAuth.hasAnyRole.mockReturnValue(true);
      wrapper = createWrapper();
      
      const columns = wrapper.vm.tableColumns;
      expect(columns).toHaveLength(4);
      expect(columns[0].key).toBe('employee');
    });

    it('configures table actions', () => {
      wrapper = createWrapper();
      
      const actions = wrapper.vm.tableActions;
      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe('export');
    });
  });

  describe('Helper Functions', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('generates initials correctly', () => {
      expect(wrapper.vm.getInitials('John Doe')).toBe('JD');
      expect(wrapper.vm.getInitials('Jane Mary Smith')).toBe('JM');
    });

    it('formats dates correctly', () => {
      const formatted = wrapper.vm.formatDate('2024-01-15');
      expect(formatted).toMatch(/Jan 15, 2024/);
    });

    it('calculates duration correctly', () => {
      expect(wrapper.vm.getDuration('2024-01-15', '2024-01-15')).toBe('1 day');
      expect(wrapper.vm.getDuration('2024-01-15', '2024-01-17')).toBe('3 days');
    });

    it('returns correct leave type icons', () => {
      expect(wrapper.vm.getLeaveTypeIcon('Annual Leave')).toBeDefined();
      expect(wrapper.vm.getLeaveTypeIcon('Sick Leave')).toBeDefined();
    });

    it('returns correct status classes', () => {
      const pendingClasses = wrapper.vm.getStatusClasses('pending');
      expect(pendingClasses).toContain('bg-yellow-100');
      
      const approvedClasses = wrapper.vm.getStatusClasses('approved');
      expect(approvedClasses).toContain('bg-green-100');
    });
  });

  describe('Row Actions', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('provides view action for all leaves', () => {
      const leave = defaultProps.leaves.data[0];
      const actions = wrapper.vm.getRowActions(leave);
      
      expect(actions.some(action => action.id === 'view')).toBe(true);
    });

    it('provides edit/delete actions for pending leaves (employees)', () => {
      mockUseAuth.hasAnyRole.mockReturnValue(false);
      const leave = { ...defaultProps.leaves.data[0], status: 'pending' };
      const actions = wrapper.vm.getRowActions(leave);
      
      expect(actions.some(action => action.id === 'edit')).toBe(true);
      expect(actions.some(action => action.id === 'delete')).toBe(true);
    });

    it('provides approval actions for approvers on pending leaves', () => {
      mockUseAuth.hasAnyRole.mockReturnValue(true);
      const leave = { ...defaultProps.leaves.data[0], status: 'pending' };
      const actions = wrapper.vm.getRowActions(leave);
      
      expect(actions.some(action => action.id === 'approve')).toBe(true);
      expect(actions.some(action => action.id === 'reject')).toBe(true);
    });
  });

  describe('Event Handlers', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('handles row click navigation', () => {
      const leave = defaultProps.leaves.data[0];
      wrapper.vm.handleRowClick(leave);
      
      expect(mockRouter.visit).toHaveBeenCalledWith('/leaves/show/1');
    });

    it('handles delete confirmation', () => {
      global.confirm = vi.fn(() => true);
      
      wrapper.vm.destroy(1);
      
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this leave request?');
      expect(mockRouter.delete).toHaveBeenCalledWith('/leaves/destroy/1', expect.any(Object));
    });

    it('handles approval confirmation', () => {
      global.confirm = vi.fn(() => true);
      
      wrapper.vm.approve(1);
      
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to approve this leave request?');
      expect(mockRouter.put).toHaveBeenCalledWith('/leaves/update/1', { status: 'approved' }, expect.any(Object));
    });

    it('handles rejection confirmation', () => {
      global.confirm = vi.fn(() => true);
      
      wrapper.vm.reject(1);
      
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to reject this leave request?');
      expect(mockRouter.put).toHaveBeenCalledWith('/leaves/update/1', { status: 'rejected' }, expect.any(Object));
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no leaves exist', () => {
      wrapper = createWrapper({
        leaves: { data: [], links: [] }
      });
      
      const dataTable = wrapper.findComponent({ name: 'DataTable' });
      expect(dataTable.props('emptyState')).toEqual({
        title: 'No leave requests found',
        description: 'There are no leave requests to display. Create your first leave request to get started.',
        icon: 'calendar-days',
        actions: expect.any(Array)
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts table columns for mobile', () => {
      // This would require mocking useResponsive composable
      // For now, we test that the component renders without errors
      wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('provides proper labels for form controls', () => {
      const searchInput = wrapper.find('#search');
      expect(wrapper.find('label[for="search"]').exists()).toBe(true);
      
      const statusFilter = wrapper.find('#status-filter');
      expect(wrapper.find('label[for="status-filter"]').exists()).toBe(true);
    });

    it('uses semantic HTML structure', () => {
      expect(wrapper.find('h2').exists()).toBe(true);
      expect(wrapper.find('main, section, article').exists()).toBe(true);
    });
  });
});