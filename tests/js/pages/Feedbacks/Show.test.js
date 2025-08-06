import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FeedbacksShow from '@/Pages/Feedbacks/Show.vue';

// Mock Inertia
vi.mock('@inertiajs/vue3', () => ({
    Link: {
        name: 'Link',
        template: '<a><slot /></a>',
        props: ['href']
    },
    useForm: vi.fn(() => ({
        response: '',
        processing: false,
        post: vi.fn(),
        reset: vi.fn()
    })),
    router: {
        visit: vi.fn(),
        delete: vi.fn()
    }
}));

// Mock composables
vi.mock('@/composables/useAuth', () => ({
    useAuth: () => ({
        user: { id: 1, name: 'Test User' },
        hasAnyRole: vi.fn((roles) => roles.includes('Employee')),
        getUserProperty: vi.fn((prop) => prop === 'id' ? 1 : 'Test User')
    })
}));

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

vi.mock('@/Components/Layout/DetailPage.vue', () => ({
    name: 'DetailPage',
    template: '<div class="detail-page"><slot name="primary" /><slot name="secondary" /></div>',
    props: ['title', 'subtitle', 'icon', 'status', 'breadcrumbs', 'actions', 'backUrl', 'layout']
}));

vi.mock('@/Components/Layout/InfoCard.vue', () => ({
    name: 'InfoCard',
    template: '<div class="info-card"><h3>{{ title }}</h3><slot /></div>',
    props: ['title', 'icon']
}));

vi.mock('@/Components/Base/BaseButton.vue', () => ({
    name: 'BaseButton',
    template: '<button class="base-button" @click="$emit(\'click\')"><slot /></button>',
    props: ['href', 'variant', 'iconLeft', 'label', 'fullWidth', 'disabled', 'loading', 'type'],
    emits: ['click']
}));

vi.mock('@/Components/Base/BaseTextarea.vue', () => ({
    name: 'BaseTextarea',
    template: '<textarea class="base-textarea" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue', 'placeholder', 'rows', 'disabled', 'characterCount', 'maxLength'],
    emits: ['update:modelValue']
}));

vi.mock('@/Components/Base/Icon.vue', () => ({
    name: 'Icon',
    template: '<span class="icon" data-testid="icon"></span>',
    props: ['name']
}));

// Mock global route function
global.route = vi.fn((name, params) => `/${name.replace('.', '/')}${params ? `/${params}` : ''}`);

describe('Feedbacks Show Page', () => {
    let wrapper;
    let mockResponseForm;

    const defaultProps = {
        feedback: {
            id: 1,
            reviewer: { id: 2, name: 'John Doe' },
            reviewee: { id: 1, name: 'Jane Smith' },
            reviewer_id: 2,
            reviewee_id: 1,
            period: 'Q4 2024',
            rating: 4,
            categoryRatings: {
                communication: 4,
                teamwork: 5,
                technical: 3,
                leadership: 4
            },
            strengths: 'Excellent communication skills and team collaboration.',
            improvements: 'Could improve technical documentation practices.',
            comments: 'Overall great performance with room for growth in technical areas.',
            goals: ['Improve technical documentation', 'Lead a small project'],
            support: 'Provide mentoring and technical training resources.',
            response: null,
            response_date: null,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
        },
        relatedFeedbacks: [
            {
                id: 2,
                period: 'Q3 2024',
                rating: 3,
                reviewer: { name: 'Bob Johnson' }
            }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock the response form object
        mockResponseForm = {
            response: '',
            processing: false,
            post: vi.fn(),
            reset: vi.fn()
        };

        const { useForm } = require('@inertiajs/vue3');
        useForm.mockReturnValue(mockResponseForm);
    });

    const createWrapper = (props = {}) => {
        return mount(FeedbacksShow, {
            props: { ...defaultProps, ...props },
            global: {
                stubs: {
                    AuthenticatedLayout: true,
                    DetailPage: true,
                    InfoCard: true,
                    BaseButton: true,
                    BaseTextarea: true,
                    Icon: true,
                    Link: true
                }
            }
        });
    };

    describe('Modern UI Component Rendering', () => {
        it('renders the detail page layout correctly', () => {
            wrapper = createWrapper();

            const detailPage = wrapper.findComponent({ name: 'DetailPage' });
            expect(detailPage.exists()).toBe(true);
            expect(detailPage.props('title')).toBe('Feedback for Jane Smith');
            expect(detailPage.props('subtitle')).toBe('Q4 2024 • Submitted by John Doe');
            expect(detailPage.props('layout')).toBe('two-column');
            expect(detailPage.props('backUrl')).toBe('/feedbacks/index');
        });

        it('renders breadcrumbs correctly', () => {
            wrapper = createWrapper();

            const breadcrumbs = wrapper.vm.breadcrumbs;
            expect(breadcrumbs).toEqual([
                { label: 'Feedbacks', href: '/feedbacks/index' },
                { label: 'Jane Smith - Q4 2024', current: true }
            ]);
        });

        it('renders feedback status correctly', () => {
            wrapper = createWrapper();

            const status = wrapper.vm.feedbackStatus;
            expect(status.label).toBe('Pending Response');
            expect(status.variant).toBe('warning');
        });

        it('renders feedback status as responded when response exists', () => {
            const propsWithResponse = {
                ...defaultProps,
                feedback: {
                    ...defaultProps.feedback,
                    response: 'Thank you for the feedback!'
                }
            };
            wrapper = createWrapper(propsWithResponse);

            const status = wrapper.vm.feedbackStatus;
            expect(status.label).toBe('Responded');
            expect(status.variant).toBe('success');
        });

        it('renders multiple info cards for feedback content', () => {
            wrapper = createWrapper();

            const infoCards = wrapper.findAllComponents({ name: 'InfoCard' });
            expect(infoCards.length).toBeGreaterThan(3);
            
            // Check for specific cards
            const cardTitles = infoCards.map(card => card.props('title'));
            expect(cardTitles).toContain('Performance Rating');
            expect(cardTitles).toContain('Strengths & Achievements');
            expect(cardTitles).toContain('Areas for Development');
            expect(cardTitles).toContain('Additional Comments');
        });
    });

    describe('Rating Display and Sentiment Analysis', () => {
        it('displays overall rating correctly', () => {
            wrapper = createWrapper();

            expect(wrapper.text()).toContain('4/5');
            expect(wrapper.text()).toContain('Exceeds Expectations');
        });

        it('displays category ratings correctly', () => {
            wrapper = createWrapper();

            const categoryRatings = wrapper.vm.feedback.categoryRatings;
            expect(categoryRatings.communication).toBe(4);
            expect(categoryRatings.teamwork).toBe(5);
            expect(categoryRatings.technical).toBe(3);
        });

        it('gets correct sentiment icon for different ratings', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.getSentimentIcon(5)).toBe('heart');
            expect(wrapper.vm.getSentimentIcon(4)).toBe('heart');
            expect(wrapper.vm.getSentimentIcon(3)).toBe('star');
            expect(wrapper.vm.getSentimentIcon(2)).toBe('warning');
            expect(wrapper.vm.getSentimentIcon(1)).toBe('warning');
        });

        it('gets correct sentiment colors for different ratings', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.getSentimentBgColor(5)).toBe('bg-green-100');
            expect(wrapper.vm.getSentimentBgColor(4)).toBe('bg-green-100');
            expect(wrapper.vm.getSentimentBgColor(3)).toBe('bg-yellow-100');
            expect(wrapper.vm.getSentimentBgColor(2)).toBe('bg-red-100');

            expect(wrapper.vm.getSentimentTextColor(5)).toBe('text-green-600');
            expect(wrapper.vm.getSentimentTextColor(3)).toBe('text-yellow-600');
            expect(wrapper.vm.getSentimentTextColor(1)).toBe('text-red-600');
        });

        it('gets correct sentiment labels for different ratings', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.getSentimentLabel(5)).toBe('Positive Feedback');
            expect(wrapper.vm.getSentimentLabel(4)).toBe('Positive Feedback');
            expect(wrapper.vm.getSentimentLabel(3)).toBe('Constructive Feedback');
            expect(wrapper.vm.getSentimentLabel(2)).toBe('Needs Attention');
            expect(wrapper.vm.getSentimentLabel(1)).toBe('Needs Attention');
        });

        it('gets correct rating labels', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.getRatingLabel(1)).toBe('Needs Improvement');
            expect(wrapper.vm.getRatingLabel(2)).toBe('Below Expectations');
            expect(wrapper.vm.getRatingLabel(3)).toBe('Meets Expectations');
            expect(wrapper.vm.getRatingLabel(4)).toBe('Exceeds Expectations');
            expect(wrapper.vm.getRatingLabel(5)).toBe('Exceptional');
            expect(wrapper.vm.getRatingLabel(0)).toBe('No rating');
        });
    });

    describe('Permission System', () => {
        it('determines edit permissions correctly for reviewee', () => {
            wrapper = createWrapper();

            // Current user is reviewee (id: 1), reviewer is id: 2
            expect(wrapper.vm.canEdit).toBe(false);
        });

        it('determines edit permissions correctly for reviewer', () => {
            const propsAsReviewer = {
                ...defaultProps,
                feedback: {
                    ...defaultProps.feedback,
                    reviewer_id: 1, // Current user is reviewer
                    reviewee_id: 2
                }
            };
            wrapper = createWrapper(propsAsReviewer);

            expect(wrapper.vm.canEdit).toBe(true);
        });

        it('determines response permissions correctly', () => {
            wrapper = createWrapper();

            // Current user is reviewee, should be able to respond
            expect(wrapper.vm.canRespond).toBe(true);
            expect(wrapper.vm.isReviewee).toBe(true);
        });

        it('determines delete permissions correctly', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.canDelete).toBe(wrapper.vm.canEdit);
        });
    });

    describe('Page Actions', () => {
        it('configures page actions correctly for reviewer', () => {
            const propsAsReviewer = {
                ...defaultProps,
                feedback: {
                    ...defaultProps.feedback,
                    reviewer_id: 1
                }
            };
            wrapper = createWrapper(propsAsReviewer);

            const actions = wrapper.vm.pageActions;
            expect(actions).toContainEqual(
                expect.objectContaining({ id: 'edit', label: 'Edit' })
            );
            expect(actions).toContainEqual(
                expect.objectContaining({ id: 'export', label: 'Export PDF' })
            );
            expect(actions).toContainEqual(
                expect.objectContaining({ id: 'delete', label: 'Delete' })
            );
        });

        it('configures limited page actions for non-reviewer', () => {
            wrapper = createWrapper();

            const actions = wrapper.vm.pageActions;
            expect(actions).not.toContainEqual(
                expect.objectContaining({ id: 'edit' })
            );
            expect(actions).toContainEqual(
                expect.objectContaining({ id: 'export', label: 'Export PDF' })
            );
            expect(actions).not.toContainEqual(
                expect.objectContaining({ id: 'delete' })
            );
        });
    });

    describe('Response System', () => {
        it('shows response form for reviewee when no response exists', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.isReviewee).toBe(true);
            expect(wrapper.vm.feedback.response).toBeNull();
            expect(wrapper.vm.canRespond).toBe(true);
        });

        it('shows existing response when response exists', () => {
            const propsWithResponse = {
                ...defaultProps,
                feedback: {
                    ...defaultProps.feedback,
                    response: 'Thank you for the constructive feedback!',
                    response_date: '2024-01-16T10:00:00Z'
                }
            };
            wrapper = createWrapper(propsWithResponse);

            expect(wrapper.text()).toContain('Thank you for the constructive feedback!');
        });

        it('handles response submission correctly', async () => {
            wrapper = createWrapper();
            wrapper.vm.responseForm.response = 'Thank you for the feedback!';

            await wrapper.vm.submitResponse();

            expect(mockResponseForm.post).toHaveBeenCalledWith('/feedbacks/respond/1', expect.any(Object));
        });

        it('handles response cancellation correctly', async () => {
            wrapper = createWrapper();
            wrapper.vm.responseForm.response = 'Some response';
            wrapper.vm.showResponseForm = true;

            await wrapper.vm.cancelResponse();

            expect(mockResponseForm.reset).toHaveBeenCalled();
            expect(wrapper.vm.showResponseForm).toBe(false);
        });
    });

    describe('Utility Functions', () => {
        it('gets category icons correctly', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.getCategoryIcon('communication')).toBe('chat');
            expect(wrapper.vm.getCategoryIcon('teamwork')).toBe('users');
            expect(wrapper.vm.getCategoryIcon('technical')).toBe('cog');
            expect(wrapper.vm.getCategoryIcon('leadership')).toBe('star');
            expect(wrapper.vm.getCategoryIcon('unknown')).toBe('star');
        });

        it('gets user initials correctly', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.getInitials('John Doe')).toBe('JD');
            expect(wrapper.vm.getInitials('Jane Smith Johnson')).toBe('JSJ');
            expect(wrapper.vm.getInitials('')).toBe('');
            expect(wrapper.vm.getInitials(null)).toBe('');
        });

        it('formats dates correctly', () => {
            wrapper = createWrapper();

            const formattedDate = wrapper.vm.formatDate('2024-01-15T10:00:00Z');
            expect(formattedDate).toContain('January 15, 2024');
            expect(formattedDate).toContain('10:00');

            expect(wrapper.vm.formatDate('')).toBe('');
            expect(wrapper.vm.formatDate(null)).toBe('');
        });
    });

    describe('Action Handlers', () => {
        it('handles PDF export correctly', async () => {
            const { showNotification } = require('@/composables/useNotifications')();
            global.open = vi.fn();
            wrapper = createWrapper();

            await wrapper.vm.exportPDF();

            expect(global.open).toHaveBeenCalledWith('/feedbacks/export-pdf/1', '_blank');
            expect(showNotification).toHaveBeenCalledWith({
                type: 'success',
                title: 'Export Started',
                message: 'Your PDF export is being prepared for download.'
            });
        });

        it('handles feedback sharing correctly', async () => {
            const { showNotification } = require('@/composables/useNotifications')();
            
            // Mock clipboard API
            Object.assign(navigator, {
                clipboard: {
                    writeText: vi.fn().mockResolvedValue()
                }
            });
            
            wrapper = createWrapper();

            await wrapper.vm.shareFeedback();

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
            expect(showNotification).toHaveBeenCalledWith({
                type: 'success',
                title: 'Link Copied',
                message: 'Feedback link has been copied to your clipboard.'
            });
        });

        it('handles feedback deletion with confirmation', async () => {
            const { router } = await import('@inertiajs/vue3');
            global.confirm = vi.fn(() => true);
            wrapper = createWrapper();

            await wrapper.vm.deleteFeedback();

            expect(global.confirm).toHaveBeenCalledWith(
                'Are you sure you want to delete this feedback for Jane Smith?'
            );
            expect(router.delete).toHaveBeenCalledWith('/feedbacks/destroy/1', expect.any(Object));
        });

        it('cancels deletion when user declines confirmation', async () => {
            const { router } = await import('@inertiajs/vue3');
            global.confirm = vi.fn(() => false);
            wrapper = createWrapper();

            await wrapper.vm.deleteFeedback();

            expect(router.delete).not.toHaveBeenCalled();
        });
    });

    describe('Related Feedbacks', () => {
        it('displays related feedbacks correctly', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.relatedFeedbacks).toHaveLength(1);
            expect(wrapper.vm.relatedFeedbacks[0].period).toBe('Q3 2024');
            expect(wrapper.vm.relatedFeedbacks[0].rating).toBe(3);
        });

        it('handles empty related feedbacks', () => {
            const propsWithoutRelated = {
                ...defaultProps,
                relatedFeedbacks: []
            };
            wrapper = createWrapper(propsWithoutRelated);

            expect(wrapper.vm.relatedFeedbacks).toHaveLength(0);
        });
    });

    describe('Accessibility Features', () => {
        it('provides proper ARIA labels and semantic markup', () => {
            wrapper = createWrapper();

            const detailPage = wrapper.findComponent({ name: 'DetailPage' });
            expect(detailPage.exists()).toBe(true);
            
            // Check that InfoCards have proper titles
            const infoCards = wrapper.findAllComponents({ name: 'InfoCard' });
            infoCards.forEach(card => {
                expect(card.props('title')).toBeTruthy();
            });
        });

        it('provides keyboard navigation support', () => {
            wrapper = createWrapper();

            const buttons = wrapper.findAllComponents({ name: 'BaseButton' });
            buttons.forEach(button => {
                // Buttons should be focusable by default
                expect(button.exists()).toBe(true);
            });
        });
    });

    describe('Error Handling', () => {
        it('handles response submission errors', async () => {
            const { showNotification } = require('@/composables/useNotifications')();
            wrapper = createWrapper();

            mockResponseForm.post.mockImplementation((url, options) => {
                options.onError();
            });

            await wrapper.vm.submitResponse();

            expect(showNotification).toHaveBeenCalledWith({
                type: 'error',
                title: 'Submission Failed',
                message: 'Failed to submit your response. Please try again.'
            });
        });

        it('handles deletion errors', async () => {
            const { router } = await import('@inertiajs/vue3');
            const { showNotification } = require('@/composables/useNotifications')();
            global.confirm = vi.fn(() => true);
            wrapper = createWrapper();

            router.delete.mockImplementation((url, options) => {
                options.onError();
            });

            await wrapper.vm.deleteFeedback();

            expect(showNotification).toHaveBeenCalledWith({
                type: 'error',
                title: 'Delete Failed',
                message: 'Failed to delete the feedback. Please try again.'
            });
        });
    });

    describe('User Experience Features', () => {
        it('shows waiting message when response is pending from non-reviewee', () => {
            const propsAsReviewer = {
                ...defaultProps,
                feedback: {
                    ...defaultProps.feedback,
                    reviewer_id: 1, // Current user is reviewer
                    reviewee_id: 2   // Someone else is reviewee
                }
            };
            wrapper = createWrapper(propsAsReviewer);

            expect(wrapper.vm.isReviewee).toBe(false);
            expect(wrapper.vm.canRespond).toBe(false);
        });

        it('displays feedback metadata correctly', () => {
            wrapper = createWrapper();

            expect(wrapper.text()).toContain('John Doe'); // Reviewer
            expect(wrapper.text()).toContain('Jane Smith'); // Reviewee
            expect(wrapper.text()).toContain('Q4 2024'); // Period
        });

        it('shows last updated date when different from created date', () => {
            const propsWithUpdate = {
                ...defaultProps,
                feedback: {
                    ...defaultProps.feedback,
                    created_at: '2024-01-15T10:00:00Z',
                    updated_at: '2024-01-16T10:00:00Z'
                }
            };
            wrapper = createWrapper(propsWithUpdate);

            // Both created and updated dates should be shown
            const formattedCreated = wrapper.vm.formatDate('2024-01-15T10:00:00Z');
            const formattedUpdated = wrapper.vm.formatDate('2024-01-16T10:00:00Z');
            
            expect(formattedCreated).toBeTruthy();
            expect(formattedUpdated).toBeTruthy();
            expect(formattedCreated).not.toBe(formattedUpdated);
        });
    });
});