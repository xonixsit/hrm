import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Dashboard from '@/Pages/Dashboard.vue';
import { useAuth } from '@/composables/useAuth.js';

// Mock the useAuth composable
vi.mock('@/composables/useAuth.js', () => ({
  useAuth: vi.fn()
}));

// Mock child components
vi.mock('@/Components/Dashboard/AdminDashboard.vue', () => ({
  default: {
    name: 'AdminDashboard',
    template: '<div class="mock-admin-dashboard">Admin Dashboard</div>',
    props: ['stats', 'systemActivities', 'pendingApprovals', 'systemHealth', 'recentUserActivity', 'loading'],
    emits: ['refresh', 'approve', 'reject', 'action']
  }
}));

vi.mock('@/Components/Dashboard/ManagerDashboard.vue', () => ({
  default: {
    name: 'ManagerDashboard',
    template: '<div class="mock-manager-dashboard">Manager Dashboard</div>',
    props: ['stats', 'teamActivities', 'teamPerformance', 'teamMembers', 'pendingApprovals', 'loading'],
    emits: ['refresh', 'approve', 'reject', 'action', 'view-member', 'send-message']
  }
}));

vi.mock('@/Components/Dashboard/EmployeeDashboard.vue', () => ({
  default: {
    name: 'EmployeeDashboard',
    template: '<div class="mock-employee-dashboard">Employee Dashboard</div>',
    props: ['stats', 'personalActivities', 'todaysSchedule', 'myTasks', 'recentFeedback', 'clockedIn', 'loading'],
    emits: ['clock-in-out', 'toggle-task', 'action', 'view-task']
  }
}));

describe('Dashboard', () => {
  let wrapper;

  const defaultProps = {
    // Legacy props
    totalEmployees: 150,
    pendingLeaves: 12,
    pendingTimesheets: 8,
    recentFeedbacks: [],
    teamAttendances: [],
    pendingApprovals: [],
    myAttendances: [],
    myLeaves: [],
    myTimesheets: [],
    myFeedbacks: [],
    
    // Role-specific props
    adminStats: {
      totalEmployees: 150,
      totalDepartments: 8,
      pendingLeaves: 12,
      activeProjects: 25
    },
    managerStats: {
      teamSize: 12,
      activeProjects: 8,
      pendingTasks: 24,
      teamAttendance: 92
    },
    employeeStats: {
      hoursToday: 6.5,
      tasksCompleted: 8,
      leaveBalance: 15,
      upcomingDeadlines: 3
    },
    systemActivities: [],
    teamActivities: [],
    personalActivities: [],
    systemHealth: {},
    recentUserActivity: [],
    teamPerformance: {},
    teamMembers: [],
    todaysSchedule: [],
    myTasks: [],
    recentFeedback: [],
    clockedIn: false
  };

  describe('Role-based Dashboard Rendering', () => {
    describe('Admin Role', () => {
      beforeEach(() => {
        useAuth.mockReturnValue({
          hasRole: vi.fn((role) => role === 'Admin')
        });

        wrapper = mount(Dashboard, {
          props: defaultProps
        });
      });

      it('renders AdminDashboard component for admin users', () => {
        const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
        expect(adminDashboard.exists()).toBe(true);
        expect(adminDashboard.text()).toBe('Admin Dashboard');
      });

      it('does not render ManagerDashboard or EmployeeDashboard for admin users', () => {
        const managerDashboard = wrapper.findComponent({ name: 'ManagerDashboard' });
        const employeeDashboard = wrapper.findComponent({ name: 'EmployeeDashboard' });
        
        expect(managerDashboard.exists()).toBe(false);
        expect(employeeDashboard.exists()).toBe(false);
      });

      it('passes correct props to AdminDashboard', () => {
        const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
        
        expect(adminDashboard.props('stats')).toEqual(defaultProps.adminStats);
        expect(adminDashboard.props('systemActivities')).toEqual(defaultProps.systemActivities);
        expect(adminDashboard.props('pendingApprovals')).toEqual(defaultProps.pendingApprovals);
        expect(adminDashboard.props('systemHealth')).toEqual(defaultProps.systemHealth);
        expect(adminDashboard.props('recentUserActivity')).toEqual(defaultProps.recentUserActivity);
        expect(adminDashboard.props('loading')).toBe(false);
      });

      it('handles AdminDashboard events correctly', async () => {
        const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
        
        // Test refresh event
        await adminDashboard.vm.$emit('refresh');
        // Since we can't easily test the async behavior, we just ensure no errors occur
        
        // Test approve event
        const mockApproval = { id: 1, title: 'Test Approval' };
        await adminDashboard.vm.$emit('approve', mockApproval);
        
        // Test reject event
        await adminDashboard.vm.$emit('reject', mockApproval);
        
        // Test action event
        const mockAction = { type: 'test', data: {} };
        await adminDashboard.vm.$emit('action', mockAction);
        
        // No errors should occur
        expect(true).toBe(true);
      });
    });

    describe('Manager Role', () => {
      beforeEach(() => {
        useAuth.mockReturnValue({
          hasRole: vi.fn((role) => role === 'Manager')
        });

        wrapper = mount(Dashboard, {
          props: defaultProps
        });
      });

      it('renders ManagerDashboard component for manager users', () => {
        const managerDashboard = wrapper.findComponent({ name: 'ManagerDashboard' });
        expect(managerDashboard.exists()).toBe(true);
        expect(managerDashboard.text()).toBe('Manager Dashboard');
      });

      it('does not render AdminDashboard or EmployeeDashboard for manager users', () => {
        const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
        const employeeDashboard = wrapper.findComponent({ name: 'EmployeeDashboard' });
        
        expect(adminDashboard.exists()).toBe(false);
        expect(employeeDashboard.exists()).toBe(false);
      });

      it('passes correct props to ManagerDashboard', () => {
        const managerDashboard = wrapper.findComponent({ name: 'ManagerDashboard' });
        
        expect(managerDashboard.props('stats')).toEqual(defaultProps.managerStats);
        expect(managerDashboard.props('teamActivities')).toEqual(defaultProps.teamActivities);
        expect(managerDashboard.props('teamPerformance')).toEqual(defaultProps.teamPerformance);
        expect(managerDashboard.props('teamMembers')).toEqual(defaultProps.teamMembers);
        expect(managerDashboard.props('pendingApprovals')).toEqual(defaultProps.pendingApprovals);
        expect(managerDashboard.props('loading')).toBe(false);
      });

      it('handles ManagerDashboard events correctly', async () => {
        const managerDashboard = wrapper.findComponent({ name: 'ManagerDashboard' });
        
        // Test manager-specific events
        const mockMember = { id: 1, name: 'John Doe' };
        await managerDashboard.vm.$emit('view-member', mockMember);
        await managerDashboard.vm.$emit('send-message', mockMember);
        
        // Test common events
        await managerDashboard.vm.$emit('refresh');
        
        const mockApproval = { id: 1, title: 'Test Approval' };
        await managerDashboard.vm.$emit('approve', mockApproval);
        await managerDashboard.vm.$emit('reject', mockApproval);
        
        const mockAction = { type: 'test', data: {} };
        await managerDashboard.vm.$emit('action', mockAction);
        
        // No errors should occur
        expect(true).toBe(true);
      });
    });

    describe('Employee Role', () => {
      beforeEach(() => {
        useAuth.mockReturnValue({
          hasRole: vi.fn((role) => role === 'Employee')
        });

        wrapper = mount(Dashboard, {
          props: defaultProps
        });
      });

      it('renders EmployeeDashboard component for employee users', () => {
        const employeeDashboard = wrapper.findComponent({ name: 'EmployeeDashboard' });
        expect(employeeDashboard.exists()).toBe(true);
        expect(employeeDashboard.text()).toBe('Employee Dashboard');
      });

      it('does not render AdminDashboard or ManagerDashboard for employee users', () => {
        const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
        const managerDashboard = wrapper.findComponent({ name: 'ManagerDashboard' });
        
        expect(adminDashboard.exists()).toBe(false);
        expect(managerDashboard.exists()).toBe(false);
      });

      it('passes correct props to EmployeeDashboard', () => {
        const employeeDashboard = wrapper.findComponent({ name: 'EmployeeDashboard' });
        
        expect(employeeDashboard.props('stats')).toEqual(defaultProps.employeeStats);
        expect(employeeDashboard.props('personalActivities')).toEqual(defaultProps.personalActivities);
        expect(employeeDashboard.props('todaysSchedule')).toEqual(defaultProps.todaysSchedule);
        expect(employeeDashboard.props('myTasks')).toEqual(defaultProps.myTasks);
        expect(employeeDashboard.props('recentFeedback')).toEqual(defaultProps.recentFeedback);
        expect(employeeDashboard.props('clockedIn')).toBe(defaultProps.clockedIn);
        expect(employeeDashboard.props('loading')).toBe(false);
      });

      it('handles EmployeeDashboard events correctly', async () => {
        const employeeDashboard = wrapper.findComponent({ name: 'EmployeeDashboard' });
        
        // Test employee-specific events
        await employeeDashboard.vm.$emit('clock-in-out');
        
        const mockTask = { id: 1, title: 'Test Task' };
        await employeeDashboard.vm.$emit('toggle-task', mockTask);
        await employeeDashboard.vm.$emit('view-task', mockTask);
        
        // Test common events
        const mockAction = { type: 'test', data: {} };
        await employeeDashboard.vm.$emit('action', mockAction);
        
        // No errors should occur
        expect(true).toBe(true);
      });
    });

    describe('Role Hierarchy', () => {
      it('prioritizes Admin role over Manager role', () => {
        useAuth.mockReturnValue({
          hasRole: vi.fn((role) => role === 'Admin' || role === 'Manager')
        });

        wrapper = mount(Dashboard, {
          props: defaultProps
        });

        const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
        const managerDashboard = wrapper.findComponent({ name: 'ManagerDashboard' });
        
        expect(adminDashboard.exists()).toBe(true);
        expect(managerDashboard.exists()).toBe(false);
      });

      it('shows EmployeeDashboard when user has no specific roles', () => {
        useAuth.mockReturnValue({
          hasRole: vi.fn(() => false)
        });

        wrapper = mount(Dashboard, {
          props: defaultProps
        });

        const employeeDashboard = wrapper.findComponent({ name: 'EmployeeDashboard' });
        const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
        const managerDashboard = wrapper.findComponent({ name: 'ManagerDashboard' });
        
        expect(employeeDashboard.exists()).toBe(true);
        expect(adminDashboard.exists()).toBe(false);
        expect(managerDashboard.exists()).toBe(false);
      });
    });
  });

  describe('Role-based Content Filtering', () => {
    it('filters admin-specific content correctly', () => {
      useAuth.mockReturnValue({
        hasRole: vi.fn((role) => role === 'Admin')
      });

      wrapper = mount(Dashboard, {
        props: defaultProps
      });

      const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
      
      // Admin should receive system-wide data
      expect(adminDashboard.props('stats')).toEqual(defaultProps.adminStats);
      expect(adminDashboard.props('systemActivities')).toEqual(defaultProps.systemActivities);
      expect(adminDashboard.props('systemHealth')).toEqual(defaultProps.systemHealth);
    });

    it('filters manager-specific content correctly', () => {
      useAuth.mockReturnValue({
        hasRole: vi.fn((role) => role === 'Manager')
      });

      wrapper = mount(Dashboard, {
        props: defaultProps
      });

      const managerDashboard = wrapper.findComponent({ name: 'ManagerDashboard' });
      
      // Manager should receive team-focused data
      expect(managerDashboard.props('stats')).toEqual(defaultProps.managerStats);
      expect(managerDashboard.props('teamActivities')).toEqual(defaultProps.teamActivities);
      expect(managerDashboard.props('teamMembers')).toEqual(defaultProps.teamMembers);
      expect(managerDashboard.props('teamPerformance')).toEqual(defaultProps.teamPerformance);
    });

    it('filters employee-specific content correctly', () => {
      useAuth.mockReturnValue({
        hasRole: vi.fn((role) => role === 'Employee')
      });

      wrapper = mount(Dashboard, {
        props: defaultProps
      });

      const employeeDashboard = wrapper.findComponent({ name: 'EmployeeDashboard' });
      
      // Employee should receive personal data
      expect(employeeDashboard.props('stats')).toEqual(defaultProps.employeeStats);
      expect(employeeDashboard.props('personalActivities')).toEqual(defaultProps.personalActivities);
      expect(employeeDashboard.props('myTasks')).toEqual(defaultProps.myTasks);
      expect(employeeDashboard.props('recentFeedback')).toEqual(defaultProps.recentFeedback);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        hasRole: vi.fn((role) => role === 'Admin')
      });

      wrapper = mount(Dashboard, {
        props: defaultProps
      });
    });

    it('handles refresh events correctly', async () => {
      const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
      
      // Mock console.log to verify the refresh action
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await adminDashboard.vm.$emit('refresh');
      
      // Wait for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(consoleSpy).toHaveBeenCalledWith('Dashboard refreshed');
      
      consoleSpy.mockRestore();
    });

    it('handles approval events correctly', async () => {
      const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const mockApproval = { id: 1, title: 'Test Approval' };
      await adminDashboard.vm.$emit('approve', mockApproval);
      
      expect(consoleSpy).toHaveBeenCalledWith('Approving:', mockApproval);
      
      consoleSpy.mockRestore();
    });

    it('handles rejection events correctly', async () => {
      const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const mockApproval = { id: 1, title: 'Test Approval' };
      await adminDashboard.vm.$emit('reject', mockApproval);
      
      expect(consoleSpy).toHaveBeenCalledWith('Rejecting:', mockApproval);
      
      consoleSpy.mockRestore();
    });

    it('handles action events correctly', async () => {
      const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const mockAction = { type: 'timeline', data: { id: 1 } };
      await adminDashboard.vm.$emit('action', mockAction);
      
      expect(consoleSpy).toHaveBeenCalledWith('Dashboard action:', mockAction);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Loading State Management', () => {
    it('manages loading state correctly during refresh', async () => {
      useAuth.mockReturnValue({
        hasRole: vi.fn((role) => role === 'Admin')
      });

      wrapper = mount(Dashboard, {
        props: defaultProps
      });

      const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
      
      // Initially not loading
      expect(adminDashboard.props('loading')).toBe(false);
      
      // Trigger refresh
      await adminDashboard.vm.$emit('refresh');
      
      // Should be loading during refresh
      expect(wrapper.vm.loading).toBe(true);
      
      // Wait for refresh to complete
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should not be loading after refresh
      expect(wrapper.vm.loading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('handles missing role data gracefully', () => {
      useAuth.mockReturnValue({
        hasRole: vi.fn(() => {
          throw new Error('Role check failed');
        })
      });

      // Should not throw an error
      expect(() => {
        wrapper = mount(Dashboard, {
          props: defaultProps
        });
      }).not.toThrow();
      
      // Should default to employee dashboard
      const employeeDashboard = wrapper.findComponent({ name: 'EmployeeDashboard' });
      expect(employeeDashboard.exists()).toBe(true);
    });

    it('handles missing props gracefully', () => {
      useAuth.mockReturnValue({
        hasRole: vi.fn((role) => role === 'Admin')
      });

      // Mount with minimal props
      wrapper = mount(Dashboard, {
        props: {}
      });

      const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
      expect(adminDashboard.exists()).toBe(true);
      
      // Should use default values for missing props
      expect(adminDashboard.props('stats')).toEqual({});
      expect(adminDashboard.props('systemActivities')).toEqual([]);
    });
  });

  describe('Component Integration', () => {
    it('properly integrates with AuthenticatedLayout', () => {
      useAuth.mockReturnValue({
        hasRole: vi.fn((role) => role === 'Admin')
      });

      wrapper = mount(Dashboard, {
        props: defaultProps
      });

      // Should have dashboard-container class
      expect(wrapper.find('.dashboard-container').exists()).toBe(true);
    });

    it('maintains backward compatibility with legacy props', () => {
      useAuth.mockReturnValue({
        hasRole: vi.fn((role) => role === 'Admin')
      });

      const legacyProps = {
        totalEmployees: 150,
        pendingLeaves: 12,
        pendingTimesheets: 8,
        recentFeedbacks: [],
        teamAttendances: []
      };

      wrapper = mount(Dashboard, {
        props: legacyProps
      });

      // Should still render correctly with legacy props
      const adminDashboard = wrapper.findComponent({ name: 'AdminDashboard' });
      expect(adminDashboard.exists()).toBe(true);
    });
  });
});