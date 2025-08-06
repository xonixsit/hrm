import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AdminDashboard from '@/Components/Dashboard/AdminDashboard.vue';
import { useAuth } from '@/composables/useAuth.js';

// Mock the useAuth composable
vi.mock('@/composables/useAuth.js', () => ({
  useAuth: vi.fn()
}));

// Mock child components
vi.mock('@/Components/Dashboard/DashboardWidget.vue', () => ({
  default: {
    name: 'DashboardWidget',
    template: '<div class="mock-dashboard-widget"><slot /></div>',
    props: ['title', 'loading', 'class'],
    emits: ['action']
  }
}));

vi.mock('@/Components/Dashboard/StatsCard.vue', () => ({
  default: {
    name: 'StatsCard',
    template: '<div class="mock-stats-card">{{ value }} {{ label }}</div>',
    props: ['value', 'label', 'icon', 'iconColor', 'variant', 'trend', 'loading']
  }
}));

vi.mock('@/Components/Dashboard/ActivityTimeline.vue', () => ({
  default: {
    name: 'ActivityTimeline',
    template: '<div class="mock-activity-timeline">{{ title }}</div>',
    props: ['activities', 'title', 'maxItems', 'loading'],
    emits: ['action']
  }
}));

vi.mock('@/Components/Dashboard/QuickActions.vue', () => ({
  default: {
    name: 'QuickActions',
    template: '<div class="mock-quick-actions">{{ title }}</div>',
    props: ['actions', 'title', 'maxVisible'],
    emits: ['action']
  }
}));

describe('AdminDashboard', () => {
  let wrapper;
  let mockUser;

  const defaultProps = {
    stats: {
      totalEmployees: 150,
      totalDepartments: 8,
      pendingLeaves: 12,
      activeProjects: 25,
      employeeTrend: 5,
      departmentTrend: 0,
      leaveTrend: -3,
      projectTrend: 8
    },
    systemActivities: [
      {
        id: 1,
        title: 'New employee registered',
        description: 'John Doe joined the Engineering team',
        timestamp: '2024-01-15T10:30:00Z',
        type: 'user',
        status: 'success'
      }
    ],
    pendingApprovals: [
      {
        id: 1,
        title: 'Leave Request - Jane Smith',
        description: 'Annual leave for 5 days',
        type: 'leave',
        requester: 'Jane Smith',
        created_at: '2024-01-15T09:00:00Z'
      }
    ],
    systemHealth: {
      database: { status: 'healthy', responseTime: 45 },
      cache: { status: 'healthy', hitRate: 94 },
      queue: { status: 'healthy', pending: 3 }
    },
    recentUserActivity: [
      {
        id: 1,
        user: { name: 'Alice Johnson', avatar: null },
        action: 'updated their profile',
        created_at: '2024-01-15T11:00:00Z'
      }
    ]
  };

  beforeEach(() => {
    mockUser = {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      roles: ['Admin']
    };

    useAuth.mockReturnValue({
      user: { value: mockUser }
    });

    wrapper = mount(AdminDashboard, {
      props: defaultProps,
      global: {
        stubs: {
          'CheckCircleIcon': true,
          'CheckIcon': true,
          'XMarkIcon': true,
          'ArrowPathIcon': true,
          'UsersIcon': true,
          'BuildingOfficeIcon': true,
          'CalendarDaysIcon': true,
          'FolderOpenIcon': true
        }
      }
    });
  });

  describe('Component Rendering', () => {
    it('renders admin dashboard with welcome message', () => {
      expect(wrapper.find('.admin-dashboard').exists()).toBe(true);
      expect(wrapper.find('.welcome-title').text()).toContain('Admin User');
      expect(wrapper.find('.welcome-subtitle').text()).toContain('comprehensive system overview');
    });

    it('displays admin-specific stats cards', () => {
      const statsCards = wrapper.findAllComponents({ name: 'StatsCard' });
      expect(statsCards).toHaveLength(4);
      
      // Check if admin-specific stats are displayed
      expect(statsCards[0].props('label')).toBe('Total Employees');
      expect(statsCards[0].props('value')).toBe(150);
      expect(statsCards[1].props('label')).toBe('Departments');
      expect(statsCards[2].props('label')).toBe('Pending Leaves');
      expect(statsCards[3].props('label')).toBe('Active Projects');
    });

    it('shows admin quick actions', () => {
      const quickActions = wrapper.findComponent({ name: 'QuickActions' });
      expect(quickActions.exists()).toBe(true);
      expect(quickActions.props('title')).toBe('Admin Tools');
      
      const actions = quickActions.props('actions');
      expect(actions).toHaveLength(8);
      expect(actions.some(action => action.label === 'Manage Users')).toBe(true);
      expect(actions.some(action => action.label === 'System Settings')).toBe(true);
      expect(actions.some(action => action.label === 'Security Center')).toBe(true);
    });

    it('displays system activity timeline', () => {
      const timeline = wrapper.findComponent({ name: 'ActivityTimeline' });
      expect(timeline.exists()).toBe(true);
      expect(timeline.props('title')).toBe('System Activity');
      expect(timeline.props('activities')).toEqual(defaultProps.systemActivities);
    });
  });

  describe('Pending Approvals', () => {
    it('displays pending approvals list', () => {
      const approvalItems = wrapper.findAll('.approval-item');
      expect(approvalItems).toHaveLength(1);
      
      const firstApproval = approvalItems[0];
      expect(firstApproval.find('.approval-title').text()).toBe('Leave Request - Jane Smith');
      expect(firstApproval.find('.approval-description').text()).toBe('Annual leave for 5 days');
    });

    it('shows empty state when no pending approvals', async () => {
      await wrapper.setProps({ pendingApprovals: [] });
      
      expect(wrapper.find('.empty-state').exists()).toBe(true);
      expect(wrapper.find('.empty-state').text()).toContain('All caught up!');
    });

    it('emits approve event when approve button clicked', async () => {
      const approveButton = wrapper.find('.approve-button');
      await approveButton.trigger('click');
      
      expect(wrapper.emitted('approve')).toBeTruthy();
      expect(wrapper.emitted('approve')[0][0]).toEqual(defaultProps.pendingApprovals[0]);
    });

    it('emits reject event when reject button clicked', async () => {
      const rejectButton = wrapper.find('.reject-button');
      await rejectButton.trigger('click');
      
      expect(wrapper.emitted('reject')).toBeTruthy();
      expect(wrapper.emitted('reject')[0][0]).toEqual(defaultProps.pendingApprovals[0]);
    });
  });

  describe('System Health', () => {
    it('displays system health metrics', () => {
      const healthItems = wrapper.findAll('.health-item');
      expect(healthItems).toHaveLength(3);
      
      // Check database health
      expect(healthItems[0].find('.health-label').text()).toBe('Database');
      expect(healthItems[0].find('.health-status').text()).toBe('healthy');
      expect(healthItems[0].find('.health-value').text()).toBe('45ms');
      
      // Check cache health
      expect(healthItems[1].find('.health-label').text()).toBe('Cache');
      expect(healthItems[1].find('.health-value').text()).toBe('94%');
      
      // Check queue health
      expect(healthItems[2].find('.health-label').text()).toBe('Queue');
      expect(healthItems[2].find('.health-value').text()).toBe('3 pending');
    });

    it('applies correct health indicator classes', () => {
      const healthIndicators = wrapper.findAll('.health-indicator div');
      
      // All services are healthy, so should have success color
      healthIndicators.forEach(indicator => {
        expect(indicator.classes()).toContain('bg-success-500');
      });
    });
  });

  describe('User Activity', () => {
    it('displays recent user activity', () => {
      const activityItems = wrapper.findAll('.activity-item');
      expect(activityItems).toHaveLength(1);
      
      const firstActivity = activityItems[0];
      expect(firstActivity.find('.activity-text').text()).toContain('Alice Johnson');
      expect(firstActivity.find('.activity-text').text()).toContain('updated their profile');
    });

    it('shows avatar placeholder when no avatar provided', () => {
      const avatarPlaceholder = wrapper.find('.avatar-placeholder');
      expect(avatarPlaceholder.exists()).toBe(true);
      expect(avatarPlaceholder.text()).toBe('A'); // First letter of Alice
    });
  });

  describe('Interactions', () => {
    it('emits refresh event when refresh button clicked', async () => {
      const refreshButton = wrapper.find('.refresh-button');
      await refreshButton.trigger('click');
      
      expect(wrapper.emitted('refresh')).toBeTruthy();
    });

    it('handles loading state correctly', async () => {
      await wrapper.setProps({ loading: true });
      
      const statsCards = wrapper.findAllComponents({ name: 'StatsCard' });
      statsCards.forEach(card => {
        expect(card.props('loading')).toBe(true);
      });
    });

    it('emits action event for timeline interactions', async () => {
      const timeline = wrapper.findComponent({ name: 'ActivityTimeline' });
      await timeline.vm.$emit('action', { type: 'view', data: { id: 1 } });
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0][0]).toEqual({
        type: 'timeline',
        data: { type: 'view', data: { id: 1 } }
      });
    });

    it('emits action event for quick actions', async () => {
      const quickActions = wrapper.findComponent({ name: 'QuickActions' });
      const mockAction = { id: 'manage-users', label: 'Manage Users' };
      await quickActions.vm.$emit('action', mockAction);
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0][0]).toEqual({
        type: 'quick-action',
        data: mockAction
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      expect(wrapper.find('.stats-grid').classes()).toContain('grid-cols-1');
      expect(wrapper.find('.stats-grid').classes()).toContain('md:grid-cols-2');
      expect(wrapper.find('.stats-grid').classes()).toContain('lg:grid-cols-4');
      
      expect(wrapper.find('.dashboard-content').classes()).toContain('lg:grid-cols-3');
    });
  });

  describe('Admin-Specific Features', () => {
    it('shows admin-only quick actions', () => {
      const quickActions = wrapper.findComponent({ name: 'QuickActions' });
      const actions = quickActions.props('actions');
      
      // Check for admin-specific actions
      const adminActions = ['Manage Users', 'System Settings', 'Security Center', 'System Monitor'];
      adminActions.forEach(actionLabel => {
        expect(actions.some(action => action.label === actionLabel)).toBe(true);
      });
    });

    it('displays comprehensive system statistics', () => {
      const statsCards = wrapper.findAllComponents({ name: 'StatsCard' });
      
      // Admin should see system-wide stats
      expect(statsCards[0].props('label')).toBe('Total Employees');
      expect(statsCards[1].props('label')).toBe('Departments');
      expect(statsCards[2].props('label')).toBe('Pending Leaves');
      expect(statsCards[3].props('label')).toBe('Active Projects');
    });

    it('shows system health monitoring', () => {
      const systemHealth = wrapper.find('.system-health');
      expect(systemHealth.exists()).toBe(true);
      
      const healthMetrics = wrapper.findAll('.health-item');
      expect(healthMetrics).toHaveLength(3);
    });
  });

  describe('Error Handling', () => {
    it('handles missing user data gracefully', async () => {
      useAuth.mockReturnValue({
        user: { value: null }
      });

      const wrapperWithoutUser = mount(AdminDashboard, {
        props: defaultProps,
        global: {
          stubs: {
            'CheckCircleIcon': true,
            'CheckIcon': true,
            'XMarkIcon': true,
            'ArrowPathIcon': true,
            'UsersIcon': true,
            'BuildingOfficeIcon': true,
            'CalendarDaysIcon': true,
            'FolderOpenIcon': true
          }
        }
      });

      expect(wrapperWithoutUser.find('.welcome-title').text()).toContain('Admin');
    });

    it('handles empty data arrays gracefully', async () => {
      await wrapper.setProps({
        systemActivities: [],
        pendingApprovals: [],
        recentUserActivity: []
      });

      expect(wrapper.find('.empty-state').exists()).toBe(true);
    });
  });
});