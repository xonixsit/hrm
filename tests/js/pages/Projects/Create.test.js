import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useForm, router } from '@inertiajs/vue3';
import ProjectsCreate from '@/Pages/Projects/Create.vue';
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

describe('Projects Create Page', () => {
  let wrapper;
  let mockForm;
  let mockNotifications;

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
      name: '',
      description: '',
      client: '',
      status: 'planning',
      priority: 'medium',
      budget: '',
      start_date: '',
      due_date: '',
      team_members: [],
      manager_id: '',
      errors: {},
      processing: false,
      post: vi.fn()
    };

    mockNotifications = {
      showNotification: vi.fn()
    };

    useForm.mockReturnValue(mockForm);
    useNotifications.mockReturnValue(mockNotifications);

    wrapper = mount(ProjectsCreate, {
      props: {
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

  it('initializes form with default values', () => {
    expect(useForm).toHaveBeenCalledWith({
      name: '',
      description: '',
      client: '',
      status: 'planning',
      priority: 'medium',
      budget: '',
      start_date: '',
      due_date: '',
      team_members: [],
      manager_id: ''
    });
  });

  it('renders correct breadcrumbs', () => {
    const breadcrumbs = wrapper.vm.breadcrumbs;
    expect(breadcrumbs).toEqual([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Projects', href: '/projects/index' },
      { label: 'Create Project', current: true }
    ]);
  });

  it('displays header actions', () => {
    const headerActions = wrapper.vm.headerActions;
    expect(headerActions).toHaveLength(1);
    expect(headerActions[0].label).toBe('Cancel');
    expect(headerActions[0].variant).toBe('secondary');
  });

  it('configures form actions correctly', () => {
    const formActions = wrapper.vm.formActions;
    expect(formActions).toHaveLength(2);
    expect(formActions[0].label).toBe('Cancel');
    expect(formActions[1].label).toBe('Create Project');
    expect(formActions[1].type).toBe('submit');
  });

  it('provides status options', () => {
    const statusOptions = wrapper.vm.statusOptions;
    expect(statusOptions).toEqual([
      { value: 'planning', label: 'Planning' },
      { value: 'active', label: 'Active' },
      { value: 'on_hold', label: 'On Hold' },
      { value: 'completed', label: 'Completed' }
    ]);
  });

  it('provides priority options', () => {
    const priorityOptions = wrapper.vm.priorityOptions;
    expect(priorityOptions).toEqual([
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' }
    ]);
  });

  it('transforms users into team member options', () => {
    const teamMemberOptions = wrapper.vm.teamMemberOptions;
    expect(teamMemberOptions).toEqual([
      { value: 1, label: 'John Doe', description: 'john@example.com' },
      { value: 2, label: 'Jane Smith', description: 'jane@example.com' }
    ]);
  });

  it('transforms managers into manager options', () => {
    const managerOptions = wrapper.vm.managerOptions;
    expect(managerOptions).toEqual([
      { value: 1, label: 'Manager One', description: 'manager1@example.com' },
      { value: 2, label: 'Manager Two', description: 'manager2@example.com' }
    ]);
  });

  it('handles header action clicks', () => {
    const action = { handler: vi.fn() };
    wrapper.vm.handleHeaderAction(action);
    expect(action.handler).toHaveBeenCalled();
  });

  it('handles form action clicks', () => {
    const action = { handler: vi.fn() };
    wrapper.vm.handleFormAction(action);
    expect(action.handler).toHaveBeenCalled();
  });

  it('handles form submission successfully', async () => {
    mockForm.name = 'Test Project';
    mockForm.post.mockImplementation((url, options) => {
      options.onSuccess();
    });

    await wrapper.vm.handleSubmit();

    expect(mockForm.post).toHaveBeenCalledWith('/projects/store', {
      onSuccess: expect.any(Function),
      onError: expect.any(Function)
    });

    expect(mockNotifications.showNotification).toHaveBeenCalledWith({
      type: 'success',
      title: 'Project Created',
      message: '"Test Project" has been successfully created.'
    });
  });

  it('handles form submission errors', async () => {
    mockForm.post.mockImplementation((url, options) => {
      options.onError();
    });

    await wrapper.vm.handleSubmit();

    expect(mockNotifications.showNotification).toHaveBeenCalledWith({
      type: 'error',
      title: 'Creation Failed',
      message: 'Please check the form for errors and try again.'
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

  it('navigates to projects index on cancel', () => {
    const cancelAction = wrapper.vm.headerActions.find(action => action.id === 'cancel');
    cancelAction.handler();
    expect(router.visit).toHaveBeenCalledWith('/projects/index');
  });
});