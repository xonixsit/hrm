import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { router } from '@inertiajs/vue3';
import ProjectsIndex from '@/Pages/Projects/Index.vue';
import { useAuth } from '@/composables/useAuth.js';
import { useNotifications } from '@/composables/useNotifications.js';

// Mock dependencies
vi.mock('@inertiajs/vue3', () => ({
  router: {
    visit: vi.fn(),
    get: vi.fn(),
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

describe('Projects Index Page', () => {
  let wrapper;
  let mockAuth;
  let mockNotifications;

  const mockProjects = {
    data: [
      {
        id: 1,
        name: 'Test Project 1',
        client: 'Test Client',
        status: 'active',
        priority: 'high',
        progress: 75,
        team_members: [
          { id: 1, name: 'John Doe', avatar: null },
          { id: 2, name: 'Jane Smith', avatar: null }
        ],
        due_date: '2024-12-31',
        created_at: '2024-01-01'
      },
      {
        id: 2,
        name: 'Test Project 2',
        client: null,
        status: 'planning',
        priority: 'medium',
        progress: 25,
        team_members: [],
        due_date: null,
        created_at: '2024-01-15'
      }
    ],
    total: 2,
    current_page: 1,
    last_page: 1,
    per_page: 10
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

    wrapper = mount(ProjectsIndex, {
      props: {
        projects: mockProjects,
        filters: {}
      },
      global: {
        stubs: {
          PageLayout: true,
          PageHeader: true,
          DataTable: true,
          Icon: true
        }
      }
    });
  });

  it('renders the page with correct title and subtitle', () => {
    expect(wrapper.vm.breadcrumbs).toEqual([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Projects', current: true }
    ]);
  });

  it('displays header actions for authorized users', () => {
    mockAuth.hasAnyRole.mockReturnValue(true);
    
    const headerActions = wrapper.vm.headerActions;
    expect(headerActions).toHaveLength(2);
    expect(headerActions[0].label).toBe('New Project');
    expect(headerActions[1].label).toBe('Export');
  });

  it('configures table columns correctly', () => {
    const columns = wrapper.vm.tableColumns;
    expect(columns).toHaveLength(6);
    expect(columns[0].key).toBe('name');
    expect(columns[1].key).toBe('status');
    expect(columns[2].key).toBe('progress');
  });

  it('handles search functionality', async () => {
    await wrapper.vm.handleSearch('test query');
    
    expect(router.get).toHaveBeenCalledWith(
      '/projects/index',
      { search: 'test query' },
      { preserveState: true, preserveScroll: true }
    );
  });

  it('handles filter functionality', async () => {
    const filters = { status: 'active', priority: 'high' };
    await wrapper.vm.handleFilter(filters);
    
    expect(router.get).toHaveBeenCalledWith(
      '/projects/index',
      filters,
      { preserveState: true, preserveScroll: true }
    );
  });

  it('handles pagination correctly', async () => {
    await wrapper.vm.handlePageChange(2);
    
    expect(router.get).toHaveBeenCalledWith(
      '/projects/index',
      { page: 2 },
      { preserveState: true, preserveScroll: true }
    );
  });

  it('handles page size change correctly', async () => {
    await wrapper.vm.handlePageSizeChange(25);
    
    expect(router.get).toHaveBeenCalledWith(
      '/projects/index',
      { per_page: 25, page: 1 },
      { preserveState: true, preserveScroll: true }
    );
  });

  it('navigates to project details on row click', async () => {
    const project = mockProjects.data[0];
    await wrapper.vm.handleRowClick(project);
    
    expect(router.visit).toHaveBeenCalledWith('/projects/show/1');
  });

  it('generates correct status classes and labels', () => {
    expect(wrapper.vm.getStatusClasses('active')).toContain('bg-success-100');
    expect(wrapper.vm.getStatusLabel('active')).toBe('Active');
    expect(wrapper.vm.getStatusIcon('active')).toBe('check-circle');
  });

  it('shows correct row actions based on permissions', () => {
    mockAuth.hasAnyRole.mockReturnValue(true);
    mockAuth.hasRole.mockReturnValue(true);
    
    const project = mockProjects.data[0];
    const actions = wrapper.vm.getRowActions(project);
    
    expect(actions).toHaveLength(3);
    expect(actions.find(a => a.id === 'view')).toBeDefined();
    expect(actions.find(a => a.id === 'edit')).toBeDefined();
    expect(actions.find(a => a.id === 'delete')).toBeDefined();
  });

  it('handles project deletion with confirmation', async () => {
    global.confirm = vi.fn().mockReturnValue(true);
    router.delete.mockResolvedValue();
    
    const project = mockProjects.data[0];
    await wrapper.vm.handleDelete(project);
    
    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Test Project 1"? This action cannot be undone.'
    );
    expect(router.delete).toHaveBeenCalledWith('/projects/destroy/1');
    expect(mockNotifications.showNotification).toHaveBeenCalledWith({
      type: 'success',
      title: 'Project Deleted',
      message: '"Test Project 1" has been successfully deleted.'
    });
  });

  it('handles export functionality', async () => {
    await wrapper.vm.handleExport();
    
    expect(mockNotifications.showNotification).toHaveBeenCalledWith({
      type: 'info',
      title: 'Export Started',
      message: 'Your project export is being prepared...'
    });
  });

  it('displays empty state when no projects exist', () => {
    const emptyState = wrapper.vm.emptyState;
    expect(emptyState.title).toBe('No projects found');
    expect(emptyState.description).toBe('Get started by creating your first project.');
    expect(emptyState.icon).toBe('folder-open');
  });
});