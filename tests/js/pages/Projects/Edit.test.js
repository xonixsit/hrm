import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useForm, router } from '@inertiajs/vue3';
import ProjectsEdit from '@/Pages/Projects/Edit.vue';
import { useNotifications } from '@/composables/useNotifications.js';

// Mock dependencies
vi.mock('@inertiajs/vue3', () => ({
  useForm: vi.fn(),
  router: {
    visit: vi.fn()
  }
}));

vi.mock('@/composables/useNotifications.js', () => ({
  useNotifications: vi.fn()
}));

// Mock global route function
global.route = vi.fn((name, params) => `/${name.replace('.', '/')}${params ? `/${params}` : ''}`);

describe('Projects Edit Page', () => {
  let wrapper;
  let mockForm;
  let mockNotifications;

  const mockProject = {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    client: 'Test Client',
    status: 'active',
    priority: 'high',
    budget: 10000,
    start_date: '2024-01-01',
    due_date: '2024-12-31',
    progress: 75,
    team_members: [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ],
    manager_id: 1
  };

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];

  const mockManagers = [
    { id: 1, name: 'Manager One', email: 'manager1@example.com' },
    { id: 2, name: 'Manager Two', email: 'manager2@example.com' }
  ];

  beforeEach(() => {
    mockForm = {
      name: mockProject.name,
      description: mockProject.description,
      client: mockProject.client,
      status: mockProject.status,
      priority: mockProject.priority,
      budget: mockProject.budget,
      start_date: mockProject.start_date,
      due_date: mockProject.due_date,
      progress: mockProject.progress,
      team_members: [1, 2],
      manager_id: mockProject.manager_id,
      errors: {},
      processing: false,
      put: vi.fn()
    };

    mockNotifications = {
      showNotification: vi.fn()
    };

    useForm.mockReturnValue(mockForm);
    useNotifications.mockReturnValue(mockNotifications);

    wrapper = mount(ProjectsEdit, {
      props: {
        project: mockProject,
        users: mockUsers,
        managers: mockManagers
      },
      global: {
        stubs: {
          PageLayout: true,
          PageHeader: true,
          FormLayout: true,
          FormSection: true,
          FormField: true,
          BaseInput: true,
          BaseTextarea: true,
          BaseSelect: true,
          BaseMultiSelect: true
        }
      }
    });
  });

  it('initializes form with project data', () => {
    expect(useForm).toHaveBeenCalledWith({
      name: 'Test Project',
      description: 'Test Description',
      client: 'Test Client',
      status: 'active',
      priority: 'high',
      budget: 10000,
      start_date: '2024-01-01',
      due_date: '2024-12-31',
      progress: 75,
      team_members: [1, 2],
      manager_id: 1
    });
  });

  it('renders correct breadcrumbs', () => {
    const breadcrumbs = wrapper.vm.breadcrumbs;
    expect(breadcrumbs).toEqual([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Projects', href: '/projects/index' },
      { label: 'Test Project', href: '/projects/show/1' },
      { label: 'Edit', current: true }
    ]);
  });

  it('displays header actions', () => {
    const headerActions = wrapper.vm.headerActions;
    expect(headerActions).toHaveLength(1);
    expect(headerActions[0].label).toBe('View Project');
    expect(headerActions[0].icon).toBe('eye');
  });

  it('configures form actions correctly', () => {
    const formActions = wrapper.vm.formActions;
    expect(formActions).toHaveLength(2);
    expect(formActions[0].label).toBe('Cancel');
    expect(formActions[1].label).toBe('Update Project');
    expect(formActions[1].type).toBe('submit');
  });

  it('provides status options including cancelled', () => {
    const statusOptions = wrapper.vm.statusOptions;
    expect(statusOptions).toEqual([
      { value: 'planning', label: 'Planning' },
      { value: 'active', label: 'Active' },
      { value: 'on_hold', label: 'On Hold' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ]);
  });

  it('handles form submission successfully', async () => {
    mockForm.put.mockImplementation((url, options) => {
      options.onSuccess();
    });

    await wrapper.vm.handleSubmit();

    expect(mockForm.put).toHaveBeenCalledWith('/projects/update/1', {
      onSuccess: expect.any(Function),
      onError: expect.any(Function)
    });

    expect(mockNotifications.showNotification).toHaveBeenCalledWith({
      type: 'success',
      title: 'Project Updated',
      message: '"Test Project" has been successfully updated.'
    });
  });

  it('handles form submission errors', async () => {
    mockForm.put.mockImplementation((url, options) => {
      options.onError();
    });

    await wrapper.vm.handleSubmit();

    expect(mockNotifications.showNotification).toHaveBeenCalledWith({
      type: 'error',
      title: 'Update Failed',
      message: 'Please check the form for errors and try again.'
    });
  });

  it('navigates to project view on cancel', () => {
    const cancelAction = wrapper.vm.formActions.find(action => action.id === 'cancel');
    cancelAction.handler();
    expect(router.visit).toHaveBeenCalledWith('/projects/show/1');
  });

  it('navigates to project view from header action', () => {
    const viewAction = wrapper.vm.headerActions.find(action => action.id === 'view');
    viewAction.handler();
    expect(router.visit).toHaveBeenCalledWith('/projects/show/1');
  });

  it('handles empty project data gracefully', () => {
    const emptyProject = { id: 2 };
    
    wrapper = mount(ProjectsEdit, {
      props: {
        project: emptyProject,
        users: [],
        managers: []
      },
      global: {
        stubs: {
          PageLayout: true,
          PageHeader: true,
          FormLayout: true,
          FormSection: true,
          FormField: true,
          BaseInput: true,
          BaseTextarea: true,
          BaseSelect: true,
          BaseMultiSelect: true
        }
      }
    });

    expect(useForm).toHaveBeenCalledWith({
      name: '',
      description: '',
      client: '',
      status: 'planning',
      priority: 'medium',
      budget: '',
      start_date: '',
      due_date: '',
      progress: 0,
      team_members: [],
      manager_id: ''
    });
  });

  it('disables submit button when name is empty', () => {
    mockForm.name = '';
    const formActions = wrapper.vm.formActions;
    const submitAction = formActions.find(action => action.type === 'submit');
    expect(submitAction.disabled).toBe(true);
  });

  it('enables submit button when name is provided', () => {
    mockForm.name = 'Test Project';
    const formActions = wrapper.vm.formActions;
    const submitAction = formActions.find(action => action.type === 'submit');
    expect(submitAction.disabled).toBe(false);
  });
});