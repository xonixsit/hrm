import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { router } from '@inertiajs/vue3';
import ProjectsShow from '@/Pages/Projects/Show.vue';
import { useAuth } from '@/composables/useAuth.js';
import { useNotifications } from '@/composables/useNotifications.js';

// Mock dependencies
vi.mock('@inertiajs/vue3', () => ({
  router: {
    visit: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('@/composables/useAuth.js', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/composables/useNotifications.js', () => ({
  useNotifications: vi.fn()
}));

// Mock global route function
global.route = vi.fn((name, params) => `/${name.replace('.', '/')}${params ? `/${params}` : ''}`);

describe('Projects Show Page', () => {
  let wrapper;
  let mockAuth;
  let mockNotifications;

  const mockProject = {
    id: 1,
    name: 'Test Project',
    description: 'Test project description',
    client: 'Test Client',
    status: 'active',
    priority: 'high',
    budget: 10000,
    start_date: '2024-01-01',
    due_date: '2024-12-31',
    progress: 75,
    tasks_completed: 15,
    tasks_total: 20,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
    manager: {
      id: 1,
      name: 'Project Manager',
      email: 'manager@example.com',
      avatar: null
    },
    team_members: [
      { id: 1, name: 'John Doe', role: 'Developer', avatar: null },
      { id: 2, name: 'Jane Smith', role: 'Designer', avatar: null }
    ]
  };

  beforeEach(() => {
    mockAuth = {
      user: { id: 1, name: 'Test User' },
      hasRole: vi.fn(),
      hasAnyRole: vi.fn()
    };

    mockNotifications = {
      showNotification: vi.fn()
    };

    useAuth.mockReturnValue(mockAuth);
    useNotifications.mockReturnValue(mockNotifications);

    wrapper = mount(ProjectsShow, {
      props: {
        project: mockProject
      },
      global: {
        stubs: {
          PageLayout: true,
          PageHeader: true,
          InfoCard: true,
          BaseButton: true,
          Icon: true
        }
      }
    });
  });

  it('renders correct breadcrumbs', () => {
    const breadcrumbs = wrapper.vm.breadcrumbs;
    expect(breadcrumbs).toEqual([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Projects', href: '/projects/index' },
      { label: 'Test Project', current: true }
    ]);
  });

  it('displays header actions for authorized users', () => {
    mockAuth.hasAnyRole.mockReturnValue(true);
    
    const headerActions = wrapper.vm.headerActions;
    expect(headerActions).toHaveLength(2);
    expect(headerActions[0].label).toBe('Edit Project');
    expect(headerActions[1].label).toBe('Back to Projects');
  });

  it('displays only back action for unauthorized users', () => {
    mockAuth.hasAnyRole.mockReturnValue(false);
    
    const headerActions = wrapper.vm.headerActions;
    expect(headerActions).toHaveLength(1);
    expect(headerActions[0].label).toBe('Back to Projects');
  });

  it('formats dates correctly', () => {
    expect(wrapper.vm.formatDate('2024-01-01')).toBe('January 1, 2024');
    expect(wrapper.vm.formatDate(null)).toBe('Not set');
    expect(wrapper.vm.formatDate('')).toBe('Not set');
  });

  it('formats currency correctly', () => {
    expect(wrapper.vm.formatCurrency(10000)).toBe('$10,000.00');
  });

  it('returns correct status classes and labels', () => {
    expect(wrapper.vm.getStatusClasses('active')).toContain('bg-success-100');
    expect(wrapper.vm.getStatusLabel('active')).toBe('Active');
    expect(wrapper.vm.getStatusIcon('active')).toBe('check-circle');
  });

  it('returns correct priority classes and labels', () => {
    expect(wrapper.vm.getPriorityClasses('high')).toContain('bg-warning-100');
    expect(wrapper.vm.getPriorityLabel('high')).toBe('High');
    expect(wrapper.vm.getPriorityIcon('high')).toBe('arrow-up');
  });

  it('handles header action clicks', () => {
    const action = { handler: vi.fn() };
    wrapper.vm.handleHeaderAction(action);
    expect(action.handler).toHaveBeenCalled();
  });

  it('handles clone project action', () => {
    wrapper.vm.handleClone();
    expect(router.visit).toHaveBeenCalledWith('/projects/create', {
      data: { clone_from: 1 }
    });
  });

  it('handles export action', () => {
    wrapper.vm.handleExport();
    expect(mockNotifications.showNotification).toHaveBeenCalledWith({
      type: 'info',
      title: 'Export Started',
      message: 'Project details are being exported...'
    });
  });

  it('handles delete with confirmation', async () => {
    global.confirm = vi.fn().mockReturnValue(true);
    router.delete.mockResolvedValue();
    
    await wrapper.vm.handleDelete();
    
    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Test Project"? This action cannot be undone.'
    );
    expect(router.delete).toHaveBeenCalledWith('/projects/destroy/1');
    expect(mockNotifications.showNotification).toHaveBeenCalledWith({
      type: 'success',
      title: 'Project Deleted',
      message: '"Test Project" has been successfully deleted.'
    });
  });

  it('cancels delete when not confirmed', async () => {
    global.confirm = vi.fn().mockReturnValue(false);
    
    await wrapper.vm.handleDelete();
    
    expect(router.delete).not.toHaveBeenCalled();
  });

  it('handles delete error', async () => {
    global.confirm = vi.fn().mockReturnValue(true);
    router.delete.mockRejectedValue(new Error('Delete failed'));
    
    await wrapper.vm.handleDelete();
    
    expect(mockNotifications.showNotification).toHaveBeenCalledWith({
      type: 'error',
      title: 'Delete Failed',
      message: 'Failed to delete the project. Please try again.'
    });
  });

  it('shows correct permission-based visibility', () => {
    mockAuth.hasAnyRole.mockReturnValue(true);
    mockAuth.hasRole.mockReturnValue(true);
    
    expect(wrapper.vm.canEdit).toBe(true);
    expect(wrapper.vm.canDelete).toBe(true);
  });

  it('hides actions for unauthorized users', () => {
    mockAuth.hasAnyRole.mockReturnValue(false);
    mockAuth.hasRole.mockReturnValue(false);
    
    expect(wrapper.vm.canEdit).toBe(false);
    expect(wrapper.vm.canDelete).toBe(false);
  });

  it('handles project without optional fields', () => {
    const minimalProject = {
      id: 2,
      name: 'Minimal Project',
      status: 'planning',
      priority: 'medium',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    wrapper = mount(ProjectsShow, {
      props: {
        project: minimalProject
      },
      global: {
        stubs: {
          PageLayout: true,
          PageHeader: true,
          InfoCard: true,
          BaseButton: true,
          Icon: true
        }
      }
    });

    expect(wrapper.vm.formatDate(minimalProject.start_date)).toBe('Not set');
    expect(wrapper.vm.formatCurrency(minimalProject.budget)).toBe('$0.00');
  });
});