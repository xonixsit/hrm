import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FeedbacksCreate from '@/Pages/Feedbacks/Create.vue';

// Mock Inertia
vi.mock('@inertiajs/vue3', () => ({
    useForm: vi.fn(() => ({
        reviewee_id: '',
        period: '',
        rating: 0,
        categoryRatings: {
            communication: 0,
            teamwork: 0,
            technical: 0,
            leadership: 0,
            initiative: 0,
            reliability: 0
        },
        strengths: '',
        improvements: '',
        comments: '',
        goals: [''],
        support: '',
        processing: false,
        errors: {},
        post: vi.fn(),
        reset: vi.fn()
    })),
    router: {
        visit: vi.fn()
    }
}));

// Mock composables
vi.mock('@/composables/useNotifications', () => ({
    useNotifications: () => ({
        showNotification: vi.fn()
    })
}));

// Mock components
vi.mock('@/Layouts/AuthenticatedLayout.vue', () => ({
    name: 'AuthenticatedLayout',
    template: '<div class="authenticated-layout"><slot /></div>'
}));

vi.mock('@/Components/Layout/PageLayout.vue', () => ({
    name: 'PageLayout',
    template: '<div class="page-layout"><slot name="header" /><slot name="content" /></div>'
}));

vi.mock('@/Components/Layout/PageHeader.vue', () => ({
    name: 'PageHeader',
    template: '<div class="page-header" data-testid="page-header"><h1>Submit Feedback</h1></div>',
    props: ['title', 'description', 'icon', 'breadcrumbs', 'backUrl']
}));

vi.mock('@/Components/Layout/ContentSection.vue', () => ({
    name: 'ContentSection',
    template: '<div class="content-section"><slot /></div>'
}));

vi.mock('@/Components/Layout/ContentCard.vue', () => ({
    name: 'ContentCard',
    template: '<div class="content-card"><slot /></div>'
}));

vi.mock('@/Components/Forms/FormLayout.vue', () => ({
    name: 'FormLayout',
    template: '<form class="form-layout" @submit.prevent="$emit(\'submit\')"><slot /></form>',
    props: ['title', 'actions', 'errors', 'isSubmitting', 'variant'],
    emits: ['submit', 'action']
}));

vi.mock('@/Components/Forms/FormSection.vue', () => ({
    name: 'FormSection',
    template: '<div class="form-section"><h3>{{ title }}</h3><p>{{ description }}</p><slot /></div>',
    props: ['title', 'description']
}));

vi.mock('@/Components/Forms/FormField.vue', () => ({
    name: 'FormField',
    template: '<div class="form-field"><label>{{ label }}</label><slot /></div>',
    props: ['label', 'description', 'required', 'error']
}));

vi.mock('@/Components/Base/BaseSelect.vue', () => ({
    name: 'BaseSelect',
    template: '<select class="base-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select>',
    props: ['modelValue', 'options', 'placeholder', 'searchable', 'disabled'],
    emits: ['update:modelValue']
}));

vi.mock('@/Components/Base/BaseInput.vue', () => ({
    name: 'BaseInput',
    template: '<input class="base-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder', 'disabled'],
    emits: ['update:modelValue']
}));

vi.mock('@/Components/Base/BaseTextarea.vue', () => ({
    name: 'BaseTextarea',
    template: '<textarea class="base-textarea" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue', 'placeholder', 'rows', 'disabled', 'characterCount', 'maxLength'],
    emits: ['update:modelValue']
}));

vi.mock('@/Components/Base/BaseButton.vue', () => ({
    name: 'BaseButton',
    template: '<button class="base-button" @click="$emit(\'click\')"><slot /></button>',
    props: ['variant', 'iconLeft', 'disabled', 'size'],
    emits: ['click']
}));

vi.mock('@/Components/Base/Icon.vue', () => ({
    name: 'Icon',
    template: '<span class="icon" data-testid="icon"></span>',
    props: ['name']
}));

// Mock global route function
global.route = vi.fn((name, params) => `/${name.replace('.', '/')}${params ? `/${params}` : ''}`);

describe('Feedbacks Create Page', () => {
    let wrapper;
    let mockForm;

    const defaultProps = {
        users: [
            { id: 1, name: 'John Doe', department: 'Engineering' },
            { id: 2, name: 'Jane Smith', department: 'Marketing' },
            { id: 3, name: 'Bob Johnson', department: 'Sales' }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock the form object
        mockForm = {
            reviewee_id: '',
            period: '',
            rating: 0,
            categoryRatings: {
                communication: 0,
                teamwork: 0,
                technical: 0,
                leadership: 0,
                initiative: 0,
                reliability: 0
            },
            strengths: '',
            improvements: '',
            comments: '',
            goals: [''],
            support: '',
            processing: false,
            errors: {},
            post: vi.fn(),
            reset: vi.fn()
        };

        const { useForm } = require('@inertiajs/vue3');
        useForm.mockReturnValue(mockForm);
    });

    const createWrapper = (props = {}) => {
        return mount(FeedbacksCreate, {
            props: { ...defaultProps, ...props },
            global: {
                stubs: {
                    AuthenticatedLayout: true,
                    PageLayout: true,
                    PageHeader: true,
                    ContentSection: true,
                    ContentCard: true,
                    FormLayout: true,
                    FormSection: true,
                    FormField: true,
                    BaseSelect: true,
                    BaseInput: true,
                    BaseTextarea: true,
                    BaseButton: true,
                    Icon: true
                }
            }
        });
    };

    describe('Modern UI Component Rendering', () => {
        it('renders the modern page layout structure', () => {
            wrapper = createWrapper();

            expect(wrapper.findComponent({ name: 'PageLayout' }).exists()).toBe(true);
            expect(wrapper.findComponent({ name: 'PageHeader' }).exists()).toBe(true);
            expect(wrapper.findComponent({ name: 'ContentSection' }).exists()).toBe(true);
            expect(wrapper.findComponent({ name: 'ContentCard' }).exists()).toBe(true);
        });

        it('renders the page header with correct props', () => {
            wrapper = createWrapper();

            const pageHeader = wrapper.findComponent({ name: 'PageHeader' });
            expect(pageHeader.props('title')).toBe('Submit Feedback');
            expect(pageHeader.props('description')).toBe('Provide constructive feedback to help team members grow');
            expect(pageHeader.props('icon')).toBe('message-square');
            expect(pageHeader.props('backUrl')).toBe('/feedbacks/index');
        });

        it('renders form layout with correct structure', () => {
            wrapper = createWrapper();

            const formLayout = wrapper.findComponent({ name: 'FormLayout' });
            expect(formLayout.exists()).toBe(true);
            expect(formLayout.props('variant')).toBe('card');
        });

        it('renders all form sections', () => {
            wrapper = createWrapper();

            const formSections = wrapper.findAllComponents({ name: 'FormSection' });
            expect(formSections).toHaveLength(4);
            
            expect(formSections[0].props('title')).toBe('Feedback Details');
            expect(formSections[1].props('title')).toBe('Overall Rating');
            expect(formSections[2].props('title')).toBe('Detailed Comments');
            expect(formSections[3].props('title')).toBe('Future Goals & Recommendations');
        });
    });

    describe('Form Fields and Validation', () => {
        it('renders user selection dropdown with correct options', () => {
            wrapper = createWrapper();

            const userOptions = wrapper.vm.userOptions;
            expect(userOptions).toHaveLength(3);
            expect(userOptions[0]).toEqual({
                value: 1,
                label: 'John Doe',
                department: 'Engineering',
                initials: 'JD'
            });
        });

        it('renders period selection with correct options', () => {
            wrapper = createWrapper();

            const periodOptions = wrapper.vm.periodOptions;
            expect(periodOptions).toHaveLength(7);
            expect(periodOptions[0].value).toBe('Q1 2024');
            expect(periodOptions[6].value).toBe('Annual 2024');
        });

        it('validates form correctly', () => {
            wrapper = createWrapper();

            // Initially invalid
            expect(wrapper.vm.isFormValid).toBe(false);

            // Set required fields
            wrapper.vm.form.reviewee_id = 1;
            wrapper.vm.form.period = 'Q4 2024';
            wrapper.vm.form.rating = 4;
            wrapper.vm.form.comments = 'Great work!';

            expect(wrapper.vm.isFormValid).toBe(true);
        });

        it('configures form actions correctly', () => {
            wrapper = createWrapper();

            const actions = wrapper.vm.formActions;
            expect(actions).toHaveLength(3);
            expect(actions[0].id).toBe('cancel');
            expect(actions[1].id).toBe('save-draft');
            expect(actions[2].id).toBe('submit');
        });
    });

    describe('Rating System', () => {
        it('handles star rating selection', async () => {
            wrapper = createWrapper();

            await wrapper.vm.setRating(4);

            expect(wrapper.vm.form.rating).toBe(4);
            expect(wrapper.vm.hoverRating).toBe(0);
        });

        it('handles category rating selection', async () => {
            wrapper = createWrapper();

            await wrapper.vm.setCategoryRating('communication', 5);

            expect(wrapper.vm.form.categoryRatings.communication).toBe(5);
        });

        it('provides correct rating labels', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.getRatingLabel(0)).toBe('No rating');
            expect(wrapper.vm.getRatingLabel(1)).toBe('Needs Improvement');
            expect(wrapper.vm.getRatingLabel(3)).toBe('Meets Expectations');
            expect(wrapper.vm.getRatingLabel(5)).toBe('Exceptional');
        });

        it('renders rating categories correctly', () => {
            wrapper = createWrapper();

            const categories = wrapper.vm.ratingCategories;
            expect(categories).toHaveLength(6);
            expect(categories[0].key).toBe('communication');
            expect(categories[0].icon).toBe('chat');
            expect(categories[1].key).toBe('teamwork');
            expect(categories[1].icon).toBe('users');
        });
    });

    describe('Goals Management', () => {
        it('adds new goals correctly', async () => {
            wrapper = createWrapper();

            expect(wrapper.vm.form.goals).toHaveLength(1);

            await wrapper.vm.addGoal();

            expect(wrapper.vm.form.goals).toHaveLength(2);
        });

        it('removes goals correctly', async () => {
            wrapper = createWrapper();
            wrapper.vm.form.goals = ['Goal 1', 'Goal 2', 'Goal 3'];

            await wrapper.vm.removeGoal(1);

            expect(wrapper.vm.form.goals).toHaveLength(2);
            expect(wrapper.vm.form.goals).toEqual(['Goal 1', 'Goal 3']);
        });

        it('prevents removing the last goal', async () => {
            wrapper = createWrapper();

            await wrapper.vm.removeGoal(0);

            expect(wrapper.vm.form.goals).toHaveLength(1);
        });

        it('limits maximum goals to 5', async () => {
            wrapper = createWrapper();
            wrapper.vm.form.goals = ['1', '2', '3', '4', '5'];

            await wrapper.vm.addGoal();

            expect(wrapper.vm.form.goals).toHaveLength(5);
        });
    });

    describe('Form Submission', () => {
        it('handles form submission correctly', async () => {
            wrapper = createWrapper();
            wrapper.vm.form.goals = ['Goal 1', '', 'Goal 2', ''];

            await wrapper.vm.handleSubmit();

            expect(wrapper.vm.form.goals).toEqual(['Goal 1', 'Goal 2']);
            expect(mockForm.post).toHaveBeenCalledWith('/feedbacks/store', expect.any(Object));
        });

        it('handles draft saving correctly', async () => {
            wrapper = createWrapper();
            wrapper.vm.form.goals = ['Goal 1', '', 'Goal 2'];

            await wrapper.vm.handleSaveDraft();

            expect(wrapper.vm.form.goals).toEqual(['Goal 1', 'Goal 2']);
            expect(mockForm.post).toHaveBeenCalledWith('/feedbacks/save-draft', expect.any(Object));
        });

        it('handles form actions correctly', async () => {
            wrapper = createWrapper();
            const handleBackSpy = vi.spyOn(wrapper.vm, 'handleBack').mockImplementation(() => {});
            const handleSaveDraftSpy = vi.spyOn(wrapper.vm, 'handleSaveDraft').mockImplementation(() => {});
            const handleSubmitSpy = vi.spyOn(wrapper.vm, 'handleSubmit').mockImplementation(() => {});

            await wrapper.vm.handleFormAction({ id: 'cancel' });
            expect(handleBackSpy).toHaveBeenCalled();

            await wrapper.vm.handleFormAction({ id: 'save-draft' });
            expect(handleSaveDraftSpy).toHaveBeenCalled();

            await wrapper.vm.handleFormAction({ id: 'submit' });
            expect(handleSubmitSpy).toHaveBeenCalled();
        });
    });

    describe('Navigation and Back Handling', () => {
        it('handles back navigation with unsaved changes', async () => {
            const { router } = await import('@inertiajs/vue3');
            global.confirm = vi.fn(() => true);
            wrapper = createWrapper();
            wrapper.vm.form.comments = 'Some feedback';

            await wrapper.vm.handleBack();

            expect(global.confirm).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to leave?');
            expect(router.visit).toHaveBeenCalledWith('/feedbacks/index');
        });

        it('handles back navigation without unsaved changes', async () => {
            const { router } = await import('@inertiajs/vue3');
            wrapper = createWrapper();

            await wrapper.vm.handleBack();

            expect(router.visit).toHaveBeenCalledWith('/feedbacks/index');
        });

        it('detects unsaved changes correctly', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.hasUnsavedChanges()).toBe(false);

            wrapper.vm.form.comments = 'Some feedback';
            expect(wrapper.vm.hasUnsavedChanges()).toBe(true);

            wrapper.vm.form.comments = '';
            wrapper.vm.form.rating = 4;
            expect(wrapper.vm.hasUnsavedChanges()).toBe(true);
        });
    });

    describe('User Experience Features', () => {
        it('provides breadcrumbs correctly', () => {
            wrapper = createWrapper();

            const breadcrumbs = wrapper.vm.breadcrumbs;
            expect(breadcrumbs).toEqual([
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Feedbacks', href: '/feedbacks/index' },
                { label: 'Submit Feedback', current: true }
            ]);
        });

        it('handles hover rating correctly', async () => {
            wrapper = createWrapper();

            wrapper.vm.hoverRating = 3;
            expect(wrapper.vm.hoverRating).toBe(3);

            await wrapper.vm.setRating(4);
            expect(wrapper.vm.hoverRating).toBe(0);
        });

        it('shows character count for text areas', () => {
            wrapper = createWrapper();

            const textareas = wrapper.findAllComponents({ name: 'BaseTextarea' });
            textareas.forEach(textarea => {
                expect(textarea.props('characterCount')).toBe(true);
                expect(textarea.props('maxLength')).toBeGreaterThan(0);
            });
        });
    });

    describe('Error Handling', () => {
        it('handles form submission errors', async () => {
            const { showNotification } = require('@/composables/useNotifications')();
            wrapper = createWrapper();

            mockForm.post.mockImplementation((url, options) => {
                options.onError();
            });

            await wrapper.vm.handleSubmit();

            expect(showNotification).toHaveBeenCalledWith({
                type: 'error',
                title: 'Submission Failed',
                message: 'There was an error submitting your feedback. Please check the form and try again.'
            });
        });

        it('handles draft save errors', async () => {
            const { showNotification } = require('@/composables/useNotifications')();
            wrapper = createWrapper();

            mockForm.post.mockImplementation((url, options) => {
                options.onError();
            });

            await wrapper.vm.handleSaveDraft();

            expect(showNotification).toHaveBeenCalledWith({
                type: 'error',
                title: 'Save Failed',
                message: 'Failed to save your draft. Please try again.'
            });
        });
    });

    describe('Accessibility Features', () => {
        it('provides proper form field labels', () => {
            wrapper = createWrapper();

            const formFields = wrapper.findAllComponents({ name: 'FormField' });
            formFields.forEach(field => {
                expect(field.props('label')).toBeTruthy();
            });
        });

        it('indicates required fields', () => {
            wrapper = createWrapper();

            const requiredFields = wrapper.findAllComponents({ name: 'FormField' }).filter(
                field => field.props('required')
            );
            expect(requiredFields.length).toBeGreaterThan(0);
        });

        it('provides helpful descriptions for form sections', () => {
            wrapper = createWrapper();

            const formSections = wrapper.findAllComponents({ name: 'FormSection' });
            formSections.forEach(section => {
                expect(section.props('description')).toBeTruthy();
            });
        });
    });
});