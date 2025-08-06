import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EmployeeDashboard from '@/Components/Dashboard/EmployeeDashboard.vue';
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

describe('EmployeeDashboard', () => {
  let wrapper;
  let mockUser;

  const defaultProps = {
    stats: {
      hoursToday: 6.5,
      tasksCompleted: 8,
      leaveBalance: 15,
      upcomingDeadlines: 3,
      taskTrend: 12
    },
    personalActivities: [
      {
        id: 1,
        title: 'Completed task: API Integration',
        description: 'Successfully integrated payment API',
        timestamp: '2024-01-15T10:30:00Z',
        type: 'task',
        status: 'success'
      }
    ],
    todaysSchedule: [
      {
        id: 1,
        title: 'Team Standup',
        description: 'Daily team synchronization meeting',
        start_time: '09:00:00',
        end_time: '09:30:00',
        location: 'Conference Room A',
        attendees: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }],
        meeting_link: 'https://meet.example.com/standup'
      },
      {
        id: 2,
        title: 'Code Review',
        description: 'Review pull requests',
        start_time: '14:00:00',
        end_time: '15:00:00',
        location: null,
        attendees: null,
        meeting_link: null
      }
    ],
    myTasks: [
      {
        id: 1,
        title: 'Implement user authentication',
        completed: false,
        priority: 'high',
        status: 'in-progress',
        project: { name: 'Web App' },
        due_date: '2024-01-16T17:00:00Z'
      },
      {
        id: 2,
        title: 'Write unit tests',
        completed: true,
        priority: 'medium',
        status: 'completed',
        project: { name: 'API Service' },
        due_date: '2024-01-14T17:00:00Z'
      },
      {
        id: 3,
        title: 'Update documentation',
        completed: false,
        priority: 'low',
        status: 'pending',
        project: { name: 'Documentation' },
        due_date: '2024-01-20T17:00:00Z'
      }
    ],
    recentFeedback: [
      {
        id: 1,
        from: { name: 'Manager Smith', role: 'Manager' },
        rating: 4,
        comment: 'Great work on the recent project!',
        created_at: '2024-01-14T15:00:00Z'
      },
      {
        id: 2,
        from: { name: 'Team Lead Johnson', role: 'Team Lead' },
        rating: 5,
        comment: 'Excellent problem-solving skills.',
        created_at: '2024-01-13T10:00:00Z'
      }
    ],
    clockedIn: false
  };

  beforeEach(() => {
    mockUser = {
      id: 1,
      name: 'John Employee',
      email: 'employee@example.com',
      roles: ['Employee']
    };

    useAuth.mockReturnValue({
      user: { value: mockUser }
    });

    // Mock Date for consistent time-based tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T14:30:00Z')); // 2:30 PM

    wrapper = mount(EmployeeDashboard, {
      props: defaultProps,
      global: {
        stubs: {
          'ClockIcon': true,
          'CheckCircleIcon': true,
          'CalendarDaysIcon': true,
          'ExclamationTriangleIcon': true,
          'CalendarIcon': true,
          'MapPinIcon': true,
          'UsersIcon': true,
          'EyeIcon': true,
          'ChatBubbleLeftIcon': true,
          'StarIcon': true
        }
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('renders employee dashboard with personalized welcome message', () => {
      expect(wrapper.find('.employee-dashboard').exists()).toBe(true);
      expect(wrapper.find('.welcome-title').text()).toContain('Welcome back, John!');
      expect(wrapper.find('.welcome-subtitle').text()).toContain('productive day');
    });

    it('displays employee-specific stats cards', () => {
      const statsCards = wrapper.findAllComponents({ name: 'StatsCard' });
      expect(statsCards).toHaveLength(4);
      
      // Check if employee-specific stats are displayed
      expect(statsCards[0].props('label')).toBe('Hours Today');
      expect(statsCards[0].props('value')).toBe(6.5);
      expect(statsCards[0].props('unit')).toBe('h');
      expect(statsCards[1].props('label')).toBe('Tasks Completed');
      expect(statsCards[2].props('label')).toBe('Leave Balance');
      expect(statsCards[3].props('label')).toBe('Upcoming Deadlines');
    });

    it('shows employee quick actions', () => {
      const quickActions = wrapper.findComponent({ name: 'QuickActions' });
      expect(quickActions.exists()).toBe(true);
      expect(quickActions.props('title')).toBe('Quick Actions');
      
      const actions = quickActions.props('actions');
      expect(actions).toHaveLength(6);
      expect(actions.some(action => action.label === 'Request Leave')).toBe(true);
      expect(actions.some(action => action.label === 'Log Time')).toBe(true);
      expect(actions.some(action => action.label === 'View Payslip')).toBe(true);
    });

    it('displays personal activity timeline', () => {
      const timeline = wrapper.findComponent({ name: 'ActivityTimeline' });
      expect(timeline.exists()).toBe(true);
      expect(timeline.props('title')).toBe('Your Recent Activity');
      expect(timeline.props('activities')).toEqual(defaultProps.personalActivities);
    });
  });

  describe('Clock In/Out Functionality', () => {
    it('shows clock in button when not clocked in', () => {
      const clockButton = wrapper.find('.welcome-actions button');
      expect(clockButton.text()).toContain('Clock In');
      expect(clockButton.classes()).toContain('text-success-700');
      expect(clockButton.classes()).toContain('bg-success-100');
    });

    it('shows clock out button when clocked in', async () => {
      await wrapper.setProps({ clockedIn: true });
      
      const clockButton = wrapper.find('.welcome-actions button');
      expect(clockButton.text()).toContain('Clock Out');
      expect(clockButton.classes()).toContain('text-error-700');
      expect(clockButton.classes()).toContain('bg-error-100');
    });

    it('emits clock-in-out event when button clicked', async () => {
      const clockButton = wrapper.find('.welcome-actions button');
      await clockButton.trigger('click');
      
      expect(wrapper.emitted('clock-in-out')).toBeTruthy();
    });

    it('disables button and shows processing state during clock action', async () => {
      const clockButton = wrapper.find('.welcome-actions button');
      
      // Simulate processing state by setting internal ref
      wrapper.vm.clockingInOut = true;
      await wrapper.vm.$nextTick();
      
      expect(clockButton.attributes('disabled')).toBeDefined();
      expect(clockButton.text()).toContain('Processing...');
    });
  });

  describe('Today\'s Schedule', () => {
    it('displays scheduled events for today', () => {
      const scheduleItems = wrapper.findAll('.schedule-item');
      expect(scheduleItems).toHaveLength(2);
      
      // Check first event
      const firstEvent = scheduleItems[0];
      expect(firstEvent.find('.schedule-title').text()).toBe('Team Standup');
      expect(firstEvent.find('.schedule-description').text()).toBe('Daily team synchronization meeting');
      expect(firstEvent.find('.time-start').text()).toBe('9:00 AM');
      expect(firstEvent.find('.time-end').text()).toBe('9:30 AM');
      
      // Check location and attendees
      expect(firstEvent.find('.schedule-location').text()).toContain('Conference Room A');
      expect(firstEvent.find('.schedule-attendees').text()).toContain('2 attendees');
    });

    it('shows join button for events with meeting links', () => {
      const scheduleItems = wrapper.findAll('.schedule-item');
      const firstEvent = scheduleItems[0];
      
      const joinButton = firstEvent.find('.join-button');
      expect(joinButton.exists()).toBe(true);
      expect(joinButton.text()).toBe('Join');
    });

    it('opens meeting link in new tab when join button clicked', async () => {
      const originalOpen = window.open;
      window.open = vi.fn();
      
      const joinButton = wrapper.find('.join-button');
      await joinButton.trigger('click');
      
      expect(window.open).toHaveBeenCalledWith('https://meet.example.com/standup', '_blank');
      
      window.open = originalOpen;
    });

    it('shows empty state when no scheduled events', async () => {
      await wrapper.setProps({ todaysSchedule: [] });
      
      expect(wrapper.find('.empty-state').exists()).toBe(true);
      expect(wrapper.find('.empty-state').text()).toContain('No scheduled events for today');
    });
  });

  describe('My Tasks', () => {
    it('displays task list with filtering', () => {
      const taskItems = wrapper.findAll('.task-item');
      expect(taskItems).toHaveLength(3);
      
      // Check first task
      const firstTask = taskItems[0];
      expect(firstTask.find('.task-title').text()).toBe('Implement user authentication');
      expect(firstTask.find('.task-project').text()).toBe('Web App');
    });

    it('shows task filters', () => {
      const taskFilters = wrapper.findAll('.task-filters button');
      expect(taskFilters).toHaveLength(4);
      
      const filterLabels = taskFilters.map(filter => filter.text());
      expect(filterLabels).toEqual(['All', 'Pending', 'In Progress', 'Completed']);
    });

    it('filters tasks when filter button clicked', async () => {
      const completedFilter = wrapper.findAll('.task-filters button')[3]; // Completed filter
      await completedFilter.trigger('click');
      
      // Should show only completed tasks
      const taskItems = wrapper.findAll('.task-item');
      expect(taskItems).toHaveLength(1);
      expect(taskItems[0].find('.task-title').text()).toBe('Write unit tests');
    });

    it('applies correct priority classes', () => {
      const taskItems = wrapper.findAll('.task-item');
      
      // High priority task should have error styling
      const highPriorityBadge = taskItems[0].find('.task-meta span:nth-child(2)');
      expect(highPriorityBadge.classes()).toContain('bg-error-100');
      expect(highPriorityBadge.classes()).toContain('text-error-800');
    });

    it('emits toggle-task event when checkbox clicked', async () => {
      const checkbox = wrapper.find('.task-checkbox-input');
      await checkbox.trigger('change');
      
      expect(wrapper.emitted('toggle-task')).toBeTruthy();
      expect(wrapper.emitted('toggle-task')[0][0]).toEqual(defaultProps.myTasks[0]);
    });

    it('emits view-task event when view button clicked', async () => {
      const viewButton = wrapper.find('.task-action-button');
      await viewButton.trigger('click');
      
      expect(wrapper.emitted('view-task')).toBeTruthy();
      expect(wrapper.emitted('view-task')[0][0]).toEqual(defaultProps.myTasks[0]);
    });

    it('shows view all button when more than 8 tasks', async () => {
      const manyTasks = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Task ${i + 1}`,
        completed: false,
        priority: 'medium',
        status: 'pending',
        project: { name: 'Project' },
        due_date: '2024-01-20T17:00:00Z'
      }));

      await wrapper.setProps({ myTasks: manyTasks });

      const taskItems = wrapper.findAll('.task-item');
      expect(taskItems).toHaveLength(8); // Only first 8 shown

      const viewAllButton = wrapper.find('.view-all-button');
      expect(viewAllButton.exists()).toBe(true);
      expect(viewAllButton.text()).toContain('View 2 more tasks');
    });

    it('shows empty state when no tasks', async () => {
      await wrapper.setProps({ myTasks: [] });
      
      expect(wrapper.find('.empty-state').exists()).toBe(true);
      expect(wrapper.find('.empty-state').text()).toContain('No tasks assigned');
    });
  });

  describe('Recent Feedback', () => {
    it('displays recent feedback with ratings', () => {
      const feedbackItems = wrapper.findAll('.feedback-item');
      expect(feedbackItems).toHaveLength(2);
      
      // Check first feedback
      const firstFeedback = feedbackItems[0];
      expect(firstFeedback.find('.feedback-author').text()).toBe('Manager Smith');
      expect(firstFeedback.find('.feedback-role').text()).toBe('Manager');
      expect(firstFeedback.find('.feedback-comment').text()).toBe('Great work on the recent project!');
    });

    it('displays star ratings correctly', () => {
      const feedbackItems = wrapper.findAll('.feedback-item');
      const firstFeedback = feedbackItems[0];
      
      const stars = firstFeedback.findAll('.rating-stars StarIcon');
      expect(stars).toHaveLength(5);
      
      // First 4 stars should be filled (rating is 4)
      expect(stars[0].classes()).toContain('text-warning-400');
      expect(stars[0].classes()).toContain('fill-current');
      expect(stars[3].classes()).toContain('text-warning-400');
      expect(stars[3].classes()).toContain('fill-current');
      
      // 5th star should be empty
      expect(stars[4].classes()).toContain('text-neutral-300');
      expect(stars[4].classes()).not.toContain('fill-current');
    });

    it('shows empty state when no feedback', async () => {
      await wrapper.setProps({ recentFeedback: [] });
      
      expect(wrapper.find('.empty-state').exists()).toBe(true);
      expect(wrapper.find('.empty-state').text()).toContain('No recent feedback');
    });

    it('limits feedback display to 3 items', async () => {
      const manyFeedback = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        from: { name: `Person ${i + 1}`, role: 'Manager' },
        rating: 4,
        comment: `Feedback ${i + 1}`,
        created_at: '2024-01-14T15:00:00Z'
      }));

      await wrapper.setProps({ recentFeedback: manyFeedback });

      const feedbackItems = wrapper.findAll('.feedback-item');
      expect(feedbackItems).toHaveLength(3); // Only first 3 shown
    });
  });

  describe('Time-based Welcome Message', () => {
    it('shows morning message in the morning', async () => {
      vi.setSystemTime(new Date('2024-01-15T09:00:00Z')); // 9:00 AM
      
      const morningWrapper = mount(EmployeeDashboard, {
        props: defaultProps,
        global: {
          stubs: {
            'ClockIcon': true,
            'CheckCircleIcon': true,
            'CalendarDaysIcon': true,
            'ExclamationTriangleIcon': true,
            'CalendarIcon': true,
            'MapPinIcon': true,
            'UsersIcon': true,
            'EyeIcon': true,
            'ChatBubbleLeftIcon': true,
            'StarIcon': true
          }
        }
      });

      expect(morningWrapper.find('.welcome-subtitle').text()).toContain('tackle today\'s challenges');
    });

    it('shows evening message in the evening', async () => {
      vi.setSystemTime(new Date('2024-01-15T19:00:00Z')); // 7:00 PM
      
      const eveningWrapper = mount(EmployeeDashboard, {
        props: defaultProps,
        global: {
          stubs: {
            'ClockIcon': true,
            'CheckCircleIcon': true,
            'CalendarDaysIcon': true,
            'ExclamationTriangleIcon': true,
            'CalendarIcon': true,
            'MapPinIcon': true,
            'UsersIcon': true,
            'EyeIcon': true,
            'ChatBubbleLeftIcon': true,
            'StarIcon': true
          }
        }
      });

      expect(eveningWrapper.find('.welcome-subtitle').text()).toContain('Wrapping up another great day');
    });
  });

  describe('Interactions', () => {
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
      const mockAction = { id: 'request-leave', label: 'Request Leave' };
      await quickActions.vm.$emit('action', mockAction);
      
      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')[0][0]).toEqual({
        type: 'quick-action',
        data: mockAction
      });
    });

    it('handles loading state correctly', async () => {
      await wrapper.setProps({ loading: true });
      
      const statsCards = wrapper.findAllComponents({ name: 'StatsCard' });
      statsCards.forEach(card => {
        expect(card.props('loading')).toBe(true);
      });
    });
  });

  describe('Employee-Specific Features', () => {
    it('shows employee-only quick actions', () => {
      const quickActions = wrapper.findComponent({ name: 'QuickActions' });
      const actions = quickActions.props('actions');
      
      // Check for employee-specific actions
      const employeeActions = ['Request Leave', 'Log Time', 'View Payslip', 'Update Profile'];
      employeeActions.forEach(actionLabel => {
        expect(actions.some(action => action.label === actionLabel)).toBe(true);
      });
    });

    it('displays personal productivity statistics', () => {
      const statsCards = wrapper.findAllComponents({ name: 'StatsCard' });
      
      // Employee should see personal stats
      expect(statsCards[0].props('label')).toBe('Hours Today');
      expect(statsCards[1].props('label')).toBe('Tasks Completed');
      expect(statsCards[2].props('label')).toBe('Leave Balance');
      expect(statsCards[3].props('label')).toBe('Upcoming Deadlines');
    });

    it('shows personal schedule and tasks', () => {
      const todaysSchedule = wrapper.find('.todays-schedule');
      expect(todaysSchedule.exists()).toBe(true);
      
      const myTasks = wrapper.find('.my-tasks');
      expect(myTasks.exists()).toBe(true);
    });

    it('displays personal feedback received', () => {
      const recentFeedback = wrapper.find('.recent-feedback');
      expect(recentFeedback.exists()).toBe(true);
      
      const feedbackItems = wrapper.findAll('.feedback-item');
      expect(feedbackItems).toHaveLength(2);
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

      const wrapperWithoutUser = mount(EmployeeDashboard, {
        props: defaultProps,
        global: {
          stubs: {
            'ClockIcon': true,
            'CheckCircleIcon': true,
            'CalendarDaysIcon': true,
            'ExclamationTriangleIcon': true,
            'CalendarIcon': true,
            'MapPinIcon': true,
            'UsersIcon': true,
            'EyeIcon': true,
            'ChatBubbleLeftIcon': true,
            'StarIcon': true
          }
        }
      });

      expect(wrapperWithoutUser.find('.welcome-title').text()).toContain('Employee');
    });

    it('handles empty data arrays gracefully', async () => {
      await wrapper.setProps({
        personalActivities: [],
        todaysSchedule: [],
        myTasks: [],
        recentFeedback: []
      });

      const emptyStates = wrapper.findAll('.empty-state');
      expect(emptyStates.length).toBeGreaterThan(0);
    });
  });
});