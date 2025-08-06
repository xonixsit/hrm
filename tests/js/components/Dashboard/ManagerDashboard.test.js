import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerDashboard from '@/Components/Dashboard/ManagerDashboard.vue';
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
    props: ['value', 'label', 'icon', 'iconColor', 'variant', 'trend', 'loading', 'unit']
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

describe('ManagerDashboard', () => {
  let wrapper;
  let mockUser;

  const defaultProps = {
    stats: {
      teamSize: 12,
      activeProjects: 8,
      pendingTasks: 24,
      teamAttendance: 92,
      teamTrend: 2,
      projectTrend: 15,
      taskTrend: -5,
      attendanceTrend: 3
    },
    teamActivities: [
      {
        id: 1,
        title: 'Task completed by John Doe',
        description: 'Finished implementing user authentication',
        timestamp: '2024-01-15T10:30:00Z',
        type: 'task',
        status: 'success'
      }
    ],
    teamPerformance: {
      completionRate: 85,
      taskVelocity: 12,
      satisfaction: 4.2
    },
    teamMembers: [
      {
        id: 1,
        name: 'John Doe',
        role: 'Developer',
        status: 'online',
        avatar: null,
        currentTask: 'Working on API integration'
      },
      {
        id: 2,
        name: 'Jane Smith',
        role: 'Designer',
        status: 'away',
        avatar: 'https://example.com/avatar.jpg',
        currentTask: 'Designing user interface'
      }
    ],
    pendingApprovals: [
      {
        id: 1,
        title: 'Leave Request',
        type: 'leave',
        requester: 'John Doe',
        created_at: '2024-01-15T09:00:00Z'
      },
      {
        id: 2,
        title: 'Timesheet Approval',
        type: 'timesheet',
        requester: 'Jane Smith',
        created_at: '2024-01-15T08:30:00Z'
      }
    ]
  };

  beforeEach(() => {
    mockUser = {
      id: 1,
      name: 'Manager User',
      email: 'manager@example.com',
      roles: ['Manager']
    };

    useAuth.mockReturnValue({
      user: { value: mockUser }
    });

    // Mock Date for consistent time-based tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T14:30:00Z')); // 2:30 PM

    wrapper = mount(ManagerDashboard, {
      props: defaultProps,
      global: {
        stubs: {
          'CheckCircleIcon': true,
          'CheckIcon': true,
          'XMarkIcon': true,
          'ArrowPathIcon': true,
          'UsersIcon': true,
          'FolderOpenIcon': true,
          'ClipboardDocumentListIcon': true,
          'CalendarDaysIcon': true,
          'EyeIcon': true,
          'ChatBubbleLeftIcon': true
        }
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('renders manager dashboard with personalized welcome message', () => {
      expect(wrapper.find('.manager-dashboard').exists()).toBe(true);
      expect(wrapper.find('.welcome-title').text()).toContain('Good afternoon, Manager User!');
      expect(wrapper.find('.welcome-subtitle').text()).toContain('team overview');
    });

    it('displays manager-specific stats cards', () => {
      const statsCards = wrapper.findAllComponents({ name: 'StatsCard' });
      expect(statsCards).toHaveLength(4);
      
      // Check if manager-specific stats are displayed
      expect(statsCards[0].props('label')).toBe('Team Members');
      expect(statsCards[0].props('value')).toBe(12);
      expect(statsCards[1].props('label')).toBe('Active Projects');
      expect(statsCards[2].props('label')).toBe('Pending Tasks');
      expect(statsCards[3].props('label')).toBe('Team Attendance');
      expect(statsCards[3].props('unit')).toBe('%');
    });

    it('shows manager quick actions', () => {
      const quickActions = wrapper.findComponent({ name: 'QuickActions' });
      expect(quickActions.exists()).toBe(true);
      expect(quickActions.props('title')).toBe('Management Tools');
      
      const actions = quickActions.props('actions');
      expect(actions).toHaveLength(6);
      expect(actions.some(action => action.label === 'New Project')).toBe(true);
      expect(actions.some(action => action.label === 'Assign Tasks')).toBe(true);
      expect(actions.some(action => action.label === 'Team Reports')).toBe(true);
    });

    it('displays team activity timeline', () => {
      const timeline = wrapper.findComponent({ name: 'ActivityTimeline' });
      expect(timeline.exists()).toBe(true);
      expect(timeline.props('title')).toBe('Team Activity');
      expect(timeline.props('activities')).toEqual(defaultProps.teamActivities);
    });
  });

  describe('Time-based Welcome Message', () => {
    it('shows morning greeting in the morning', async () => {
      vi.setSystemTime(new Date('2024-01-15T09:00:00Z')); // 9:00 AM
      
      const morningWrapper = mount(ManagerDashboard, {
        props: defaultProps,
        global: {
          stubs: {
            'CheckCircleIcon': true,
            'CheckIcon': true,
            'XMarkIcon': true,
            'ArrowPathIcon': true,
            'UsersIcon': true,
            'FolderOpenIcon': true,
            'ClipboardDocumentListIcon': true,
            'CalendarDaysIcon': true,
            'EyeIcon': true,
            'ChatBubbleLeftIcon': true
          }
        }
      });

      expect(morningWrapper.find('.welcome-title').text()).toContain('Good morning');
    });

    it('shows evening greeting in the evening', async () => {
      vi.setSystemTime(new Date('2024-01-15T19:00:00Z')); // 7:00 PM
      
      const eveningWrapper = mount(ManagerDashboard, {
        props: defaultProps,
        global: {
          stubs: {
            'CheckCircleIcon': true,
            'CheckIcon': true,
            'XMarkIcon': true,
            'ArrowPathIcon': true,
            'UsersIcon': true,
            'FolderOpenIcon': true,
            'ClipboardDocumentListIcon': true,
            'CalendarDaysIcon': true,
            'EyeIcon': true,
            'ChatBubbleLeftIcon': true
          }
        }
      });

      expect(eveningWrapper.find('.welcome-title').text()).toContain('Good evening');
    });
  });

  describe('Team Performance', () => {
    it('displays team performance metrics', () => {
      const performanceMetrics = wrapper.findAll('.metric-item');
      expect(performanceMetrics).toHaveLength(3);
      
      // Check completion rate
      expect(performanceMetrics[0].find('.metric-label').text()).toBe('Project Completion Rate');
      expect(performanceMetrics[0].find('.metric-value').text()).toBe('85%');
      
      // Check task velocity
      expect(performanceMetrics[1].find('.metric-label').text()).toBe('Average Task Velocity');
      expect(performanceMetrics[1].find('.metric-value').text()).toBe('12 tasks/week');
      
      // Check satisfaction
      expect(performanceMetrics[2].find('.metric-label').text()).toBe('Team Satisfaction');
      expect(performanceMetrics[2].find('.metric-value').text()).toBe('4.2/5');
    });

    it('displays progress bars with correct widths', () => {
      const progressBars = wrapper.findAll('.metric-progress');
      expect(progressBars).toHaveLength(3);
      
      // Completion rate: 85%
      expect(progressBars[0].attributes('style')).toContain('width: 85%');
      
      // Task velocity: 12 * 10 = 120%, capped at 100%
      expect(progressBars[1].attributes('style')).toContain('width: 100%');
      
      // Satisfaction: (4.2 / 5) * 100 = 84%
      expect(progressBars[2].attributes('style')).toContain('width: 84%');
    });
  });

  describe('Team Status', () => {
    it('displays team members with their status', () => {
      const teamMembers = wrapper.findAll('.team-member');
      expect(teamMembers).toHaveLength(2);
      
      // Check first member
      const firstMember = teamMembers[0];
      expect(firstMember.find('.member-name').text()).toBe('John Doe');
      expect(firstMember.find('.member-role').text()).toBe('Developer');
      expect(firstMember.find('.member-task').text()).toContain('Working on API integration');
      
      // Check second member
      const secondMember = teamMembers[1];
      expect(secondMember.find('.member-name').text()).toBe('Jane Smith');
      expect(secondMember.find('.member-role').text()).toBe('Designer');
    });

    it('shows avatar placeholder when no avatar provided', () => {
      const avatarPlaceholders = wrapper.findAll('.avatar-placeholder');
      expect(avatarPlaceholders).toHaveLength(1); // Only John Doe has no avatar
      expect(avatarPlaceholders[0].text()).toBe('J'); // First letter of John
    });

    it('applies correct status indicator classes', () => {
      const statusIndicators = wrapper.findAll('.team-member .member-avatar div');
      
      // John Doe is online
      expect(statusIndicators[0].classes()).toContain('bg-success-500');
      
      // Jane Smith is away (has avatar, so no placeholder div)
    });

    it('emits view-member event when view button clicked', async () => {
      const viewButtons = wrapper.findAll('.action-button');
      const viewButton = viewButtons.find(btn => btn.find('EyeIcon').exists());
      
      if (viewButton) {
        await viewButton.trigger('click');
        expect(wrapper.emitted('view-member')).toBeTruthy();
      }
    });

    it('emits send-message event when message button clicked', async () => {
      const messageButtons = wrapper.findAll('.action-button');
      const messageButton = messageButtons.find(btn => btn.find('ChatBubbleLeftIcon').exists());
      
      if (messageButton) {
        await messageButton.trigger('click');
        expect(wrapper.emitted('send-message')).toBeTruthy();
      }
    });
  });

  describe('Pending Approvals', () => {
    it('displays pending approvals with count badge', () => {
      const approvalCount = wrapper.find('.approval-count');
      expect(approvalCount.text()).toBe('2');
      
      const approvalItems = wrapper.findAll('.approval-item');
      expect(approvalItems).toHaveLength(2);
    });

    it('shows only first 5 approvals and view more button', async () => {
      const manyApprovals = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        title: `Approval ${i + 1}`,
        type: 'leave',
        requester: `User ${i + 1}`,
        created_at: '2024-01-15T09:00:00Z'
      }));

      await wrapper.setProps({ pendingApprovals: manyApprovals });

      const approvalItems = wrapper.findAll('.approval-item');
      expect(approvalItems).toHaveLength(5); // Only first 5 shown

      const viewAllButton = wrapper.find('.view-all-button');
      expect(viewAllButton.exists()).toBe(true);
      expect(viewAllButton.text()).toContain('View 3 more approvals');
    });

    it('shows empty state when no pending approvals', async () => {
      await wrapper.setProps({ pendingApprovals: [] });
      
      expect(wrapper.find('.empty-state').exists()).toBe(true);
      expect(wrapper.find('.empty-state').text()).toContain('All approvals handled!');
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
      const mockAction = { id: 'new-project', label: 'New Project' };
      await quickActions.vm.$emit('action', mockAction);
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0][0]).toEqual({
        type: 'quick-action',
        data: mockAction
      });
    });
  });

  describe('Manager-Specific Features', () => {
    it('shows manager-only quick actions', () => {
      const quickActions = wrapper.findComponent({ name: 'QuickActions' });
      const actions = quickActions.props('actions');
      
      // Check for manager-specific actions
      const managerActions = ['New Project', 'Assign Tasks', 'Team Reports', 'Schedule Meeting'];
      managerActions.forEach(actionLabel => {
        expect(actions.some(action => action.label === actionLabel)).toBe(true);
      });
    });

    it('displays team-focused statistics', () => {
      const statsCards = wrapper.findAllComponents({ name: 'StatsCard' });
      
      // Manager should see team-focused stats
      expect(statsCards[0].props('label')).toBe('Team Members');
      expect(statsCards[1].props('label')).toBe('Active Projects');
      expect(statsCards[2].props('label')).toBe('Pending Tasks');
      expect(statsCards[3].props('label')).toBe('Team Attendance');
    });

    it('shows team performance metrics', () => {
      const teamPerformance = wrapper.find('.team-performance');
      expect(teamPerformance.exists()).toBe(true);
      
      const performanceMetrics = wrapper.findAll('.metric-item');
      expect(performanceMetrics).toHaveLength(3);
    });

    it('displays team member status and actions', () => {
      const teamStatus = wrapper.find('.team-status');
      expect(teamStatus.exists()).toBe(true);
      
      const teamMembers = wrapper.findAll('.team-member');
      expect(teamMembers).toHaveLength(2);
      
      // Each member should have action buttons
      teamMembers.forEach(member => {
        const actionButtons = member.findAll('.action-button');
        expect(actionButtons.length).toBeGreaterThan(0);
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

  describe('Error Handling', () => {
    it('handles missing user data gracefully', async () => {
      useAuth.mockReturnValue({
        user: { value: null }
      });

      const wrapperWithoutUser = mount(ManagerDashboard, {
        props: defaultProps,
        global: {
          stubs: {
            'CheckCircleIcon': true,
            'CheckIcon': true,
            'XMarkIcon': true,
            'ArrowPathIcon': true,
            'UsersIcon': true,
            'FolderOpenIcon': true,
            'ClipboardDocumentListIcon': true,
            'CalendarDaysIcon': true,
            'EyeIcon': true,
            'ChatBubbleLeftIcon': true
          }
        }
      });

      expect(wrapperWithoutUser.find('.welcome-title').text()).toContain('Manager');
    });

    it('handles empty team members array gracefully', async () => {
      await wrapper.setProps({ teamMembers: [] });

      const teamMembers = wrapper.findAll('.team-member');
      expect(teamMembers).toHaveLength(0);
    });
  });
});