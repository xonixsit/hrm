import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';

// Mock Inertia globally
vi.mock('@inertiajs/vue3', () => ({
    Link: {
        name: 'Link',
        template: '<a><slot /></a>',
        props: ['href']
    },
    useForm: vi.fn(() => ({
        reviewee_id: '',
        period: '',
        rating: 0,
        categoryRatings: {},
        strengths: '',
        improvements: '',
        comments: '',
        goals: [''],
        support: '',
        response: '',
        processing: false,
        errors: {},
        post: vi.fn(),
        reset: vi.fn()
    })),
    router: {
        visit: vi.fn(),
        delete: vi.fn(),
        post: vi.fn()
    }
}));

// Mock composables
vi.mock('@/composables/useAuth', () => ({
    useAuth: () => ({
        user: { id: 1, name: 'Test User' },
        roles: ['Employee'],
        hasRole: vi.fn((role) => role === 'Employee'),
        hasAnyRole: vi.fn((roles) => roles.includes('Employee')),
        getUserProperty: vi.fn((prop) => prop === 'id' ? 1 : 'Test User')
    })
}));

vi.mock('@/composables/useNotifications', () => ({
    useNotifications: () => ({
        showNotification: vi.fn()
    })
}));

// Mock global route function
global.route = vi.fn((name, params) => `/${name.replace('.', '/')}${params ? `/${params}` : ''}`);

describe('Feedback System Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('End-to-End Feedback Workflow', () => {
        it('completes full feedback submission workflow', async () => {
            // This test simulates the complete user journey from viewing feedbacks to submitting new feedback
            
            // 1. User views feedback index page
            const FeedbacksIndex = await import('@/Pages/Feedbacks/Index.vue');
            const indexWrapper = mount(FeedbacksIndex.default, {
                props: {
                    feedbacks: {
                        data: [],
                        from: 0,
                        to: 0,
                        total: 0,
                        links: []
                    },
                    feedbackStats: {
                        total: 0,
                        averageRating: '0.0',
                        thisMonth: 0,
                        positiveTrend: '0%'
                    }
                },
                global: {
                    stubs: {
                        AuthenticatedLayout: true,
                        PageLayout: true,
                        PageHeader: true,
                        ContentSection: true,
                        ContentCard: true,
                        StatsCard: true,
                        DataTable: true,
                        TablePagination: true,
                        SearchBar: true,
                        FilterPanel: true,
                        BaseButton: true,
                        Icon: true,
                        Link: true
                    }
                }
            });

            expect(indexWrapper.exists()).toBe(true);
            expect(indexWrapper.vm.feedbacks.data).toHaveLength(0);

            // 2. User navigates to create feedback page
            const { router } = await import('@inertiajs/vue3');
            
            // Simulate clicking "Submit Feedback" button
            const headerActions = indexWrapper.vm.headerActions;
            const createAction = headerActions.find(action => action.id === 'create');
            expect(createAction).toBeTruthy();
            expect(createAction.href).toBe('/feedbacks/create');

            // 3. User fills out feedback form
            const FeedbacksCreate = await import('@/Pages/Feedbacks/Create.vue');
            const createWrapper = mount(FeedbacksCreate.default, {
                props: {
                    users: [
                        { id: 2, name: 'Jane Smith', department: 'Engineering' },
                        { id: 3, name: 'Bob Johnson', department: 'Marketing' }
                    ]
                },
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

            // Fill out form fields
            createWrapper.vm.form.reviewee_id = 2;
            createWrapper.vm.form.period = 'Q4 2024';
            createWrapper.vm.form.rating = 4;
            createWrapper.vm.form.categoryRatings.communication = 4;
            createWrapper.vm.form.categoryRatings.teamwork = 5;
            createWrapper.vm.form.strengths = 'Excellent communication skills';
            createWrapper.vm.form.improvements = 'Could improve technical documentation';
            createWrapper.vm.form.comments = 'Overall great performance';
            createWrapper.vm.form.goals = ['Improve documentation', 'Lead a project'];
            createWrapper.vm.form.support = 'Provide mentoring resources';

            // Verify form validation
            expect(createWrapper.vm.isFormValid).toBe(true);

            // Submit form
            const mockForm = createWrapper.vm.form;
            await createWrapper.vm.handleSubmit();

            expect(mockForm.post).toHaveBeenCalledWith('/feedbacks/store', expect.any(Object));

            // 4. User views submitted feedback
            const FeedbacksShow = await import('@/Pages/Feedbacks/Show.vue');
            const showWrapper = mount(FeedbacksShow.default, {
                props: {
                    feedback: {
                        id: 1,
                        reviewer: { id: 1, name: 'Test User' },
                        reviewee: { id: 2, name: 'Jane Smith' },
                        reviewer_id: 1,
                        reviewee_id: 2,
                        period: 'Q4 2024',
                        rating: 4,
                        categoryRatings: {
                            communication: 4,
                            teamwork: 5
                        },
                        strengths: 'Excellent communication skills',
                        improvements: 'Could improve technical documentation',
                        comments: 'Overall great performance',
                        goals: ['Improve documentation', 'Lead a project'],
                        support: 'Provide mentoring resources',
                        response: null,
                        created_at: '2024-01-15T10:00:00Z',
                        updated_at: '2024-01-15T10:00:00Z'
                    },
                    relatedFeedbacks: []
                },
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

            expect(showWrapper.exists()).toBe(true);
            expect(showWrapper.vm.feedback.rating).toBe(4);
            expect(showWrapper.vm.feedback.comments).toBe('Overall great performance');
        });

        it('handles feedback response workflow', async () => {
            // Test the response workflow from reviewee perspective
            const FeedbacksShow = await import('@/Pages/Feedbacks/Show.vue');
            
            const showWrapper = mount(FeedbacksShow.default, {
                props: {
                    feedback: {
                        id: 1,
                        reviewer: { id: 2, name: 'John Doe' },
                        reviewee: { id: 1, name: 'Test User' },
                        reviewer_id: 2,
                        reviewee_id: 1, // Current user is reviewee
                        period: 'Q4 2024',
                        rating: 4,
                        comments: 'Great work overall',
                        response: null,
                        created_at: '2024-01-15T10:00:00Z',
                        updated_at: '2024-01-15T10:00:00Z'
                    },
                    relatedFeedbacks: []
                },
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

            // Verify user can respond
            expect(showWrapper.vm.isReviewee).toBe(true);
            expect(showWrapper.vm.canRespond).toBe(true);

            // Submit response
            showWrapper.vm.responseForm.response = 'Thank you for the constructive feedback!';
            await showWrapper.vm.submitResponse();

            expect(showWrapper.vm.responseForm.post).toHaveBeenCalledWith(
                '/feedbacks/respond/1',
                expect.any(Object)
            );
        });
    });

    describe('Search and Filter Integration', () => {
        it('integrates search functionality across feedback system', async () => {
            const FeedbacksIndex = await import('@/Pages/Feedbacks/Index.vue');
            
            const wrapper = mount(FeedbacksIndex.default, {
                props: {
                    feedbacks: {
                        data: [
                            {
                                id: 1,
                                reviewer: { name: 'John Doe' },
                                reviewee: { name: 'Jane Smith' },
                                period: 'Q4 2024',
                                rating: 4,
                                created_at: '2024-01-15T10:00:00Z'
                            },
                            {
                                id: 2,
                                reviewer: { name: 'Bob Johnson' },
                                reviewee: { name: 'Alice Brown' },
                                period: 'Q3 2024',
                                rating: 5,
                                created_at: '2024-01-10T10:00:00Z'
                            }
                        ],
                        from: 1,
                        to: 2,
                        total: 2,
                        links: []
                    },
                    feedbackStats: {
                        total: 2,
                        averageRating: '4.5',
                        thisMonth: 1,
                        positiveTrend: '20%'
                    }
                },
                global: {
                    stubs: {
                        AuthenticatedLayout: true,
                        PageLayout: true,
                        PageHeader: true,
                        ContentSection: true,
                        ContentCard: true,
                        StatsCard: true,
                        DataTable: true,
                        TablePagination: true,
                        SearchBar: true,
                        FilterPanel: true,
                        BaseButton: true,
                        Icon: true,
                        Link: true
                    }
                }
            });

            // Test search functionality
            await wrapper.vm.handleSearch('Jane Smith');
            expect(wrapper.vm.searchQuery).toBe('Jane Smith');

            // Test filter functionality
            const filters = { rating: ['4', '5'], period: 'Q4 2024' };
            await wrapper.vm.handleFilters(filters);
            expect(wrapper.vm.filters).toEqual(filters);

            // Test search suggestions
            const suggestions = wrapper.vm.searchSuggestions;
            expect(suggestions).toContainEqual({ text: 'Q4 2024', category: 'Period' });
            expect(suggestions).toContainEqual({ text: 'High rating', category: 'Filter' });
        });

        it('handles advanced filtering with multiple criteria', async () => {
            const FeedbacksIndex = await import('@/Pages/Feedbacks/Index.vue');
            
            const wrapper = mount(FeedbacksIndex.default, {
                props: {
                    feedbacks: { data: [], from: 0, to: 0, total: 0, links: [] },
                    feedbackStats: {}
                },
                global: {
                    stubs: {
                        AuthenticatedLayout: true,
                        PageLayout: true,
                        PageHeader: true,
                        ContentSection: true,
                        ContentCard: true,
                        StatsCard: true,
                        DataTable: true,
                        TablePagination: true,
                        SearchBar: true,
                        FilterPanel: true,
                        BaseButton: true,
                        Icon: true,
                        Link: true
                    }
                }
            });

            // Test filter groups configuration
            const filterGroups = wrapper.vm.filterGroups;
            expect(filterGroups).toHaveLength(3);
            
            const ratingFilter = filterGroups.find(group => group.key === 'rating');
            expect(ratingFilter.type).toBe('checkbox');
            expect(ratingFilter.options).toHaveLength(5);

            const periodFilter = filterGroups.find(group => group.key === 'period');
            expect(periodFilter.type).toBe('radio');

            const dateRangeFilter = filterGroups.find(group => group.key === 'date_range');
            expect(dateRangeFilter.type).toBe('daterange');
        });
    });

    describe('Permission and Role Integration', () => {
        it('enforces role-based permissions across feedback system', async () => {
            // Test with different user roles
            const mockAuthEmployee = {
                user: { id: 1, name: 'Employee User' },
                roles: ['Employee'],
                hasRole: vi.fn((role) => role === 'Employee'),
                hasAnyRole: vi.fn((roles) => roles.includes('Employee')),
                getUserProperty: vi.fn((prop) => prop === 'id' ? 1 : 'Employee User')
            };

            const mockAuthAdmin = {
                user: { id: 2, name: 'Admin User' },
                roles: ['Admin'],
                hasRole: vi.fn((role) => role === 'Admin'),
                hasAnyRole: vi.fn((roles) => roles.includes('Admin')),
                getUserProperty: vi.fn((prop) => prop === 'id' ? 2 : 'Admin User')
            };

            // Test employee permissions
            vi.mocked(require('@/composables/useAuth').useAuth).mockReturnValue(mockAuthEmployee);

            const FeedbacksIndex = await import('@/Pages/Feedbacks/Index.vue');
            const employeeWrapper = mount(FeedbacksIndex.default, {
                props: {
                    feedbacks: { data: [], from: 0, to: 0, total: 0, links: [] },
                    feedbackStats: {}
                },
                global: {
                    stubs: {
                        AuthenticatedLayout: true,
                        PageLayout: true,
                        PageHeader: true,
                        ContentSection: true,
                        ContentCard: true,
                        StatsCard: true,
                        DataTable: true,
                        TablePagination: true,
                        SearchBar: true,
                        FilterPanel: true,
                        BaseButton: true,
                        Icon: true,
                        Link: true
                    }
                }
            });

            expect(employeeWrapper.vm.canBulkDelete).toBe(false);

            // Test admin permissions
            vi.mocked(require('@/composables/useAuth').useAuth).mockReturnValue(mockAuthAdmin);

            const adminWrapper = mount(FeedbacksIndex.default, {
                props: {
                    feedbacks: { data: [], from: 0, to: 0, total: 0, links: [] },
                    feedbackStats: {}
                },
                global: {
                    stubs: {
                        AuthenticatedLayout: true,
                        PageLayout: true,
                        PageHeader: true,
                        ContentSection: true,
                        ContentCard: true,
                        StatsCard: true,
                        DataTable: true,
                        TablePagination: true,
                        SearchBar: true,
                        FilterPanel: true,
                        BaseButton: true,
                        Icon: true,
                        Link: true
                    }
                }
            });

            expect(adminWrapper.vm.canBulkDelete).toBe(true);
        });

        it('handles feedback ownership permissions correctly', async () => {
            const FeedbacksShow = await import('@/Pages/Feedbacks/Show.vue');
            
            // Test as feedback owner (reviewer)
            const ownerWrapper = mount(FeedbacksShow.default, {
                props: {
                    feedback: {
                        id: 1,
                        reviewer_id: 1, // Current user is reviewer
                        reviewee_id: 2,
                        reviewer: { name: 'Test User' },
                        reviewee: { name: 'Jane Smith' },
                        rating: 4,
                        comments: 'Good work',
                        created_at: '2024-01-15T10:00:00Z',
                        updated_at: '2024-01-15T10:00:00Z'
                    }
                },
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

            expect(ownerWrapper.vm.canEdit).toBe(true);
            expect(ownerWrapper.vm.canDelete).toBe(true);

            // Test as non-owner
            const nonOwnerWrapper = mount(FeedbacksShow.default, {
                props: {
                    feedback: {
                        id: 1,
                        reviewer_id: 3, // Different user is reviewer
                        reviewee_id: 2,
                        reviewer: { name: 'Other User' },
                        reviewee: { name: 'Jane Smith' },
                        rating: 4,
                        comments: 'Good work',
                        created_at: '2024-01-15T10:00:00Z',
                        updated_at: '2024-01-15T10:00:00Z'
                    }
                },
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

            expect(nonOwnerWrapper.vm.canEdit).toBe(false);
            expect(nonOwnerWrapper.vm.canDelete).toBe(false);
        });
    });

    describe('Data Operations Integration', () => {
        it('handles bulk operations correctly', async () => {
            const FeedbacksIndex = await import('@/Pages/Feedbacks/Index.vue');
            
            // Mock admin user for bulk operations
            const mockAuthAdmin = {
                user: { id: 1, name: 'Admin User' },
                roles: ['Admin'],
                hasRole: vi.fn((role) => role === 'Admin'),
                hasAnyRole: vi.fn((roles) => roles.includes('Admin')),
                getUserProperty: vi.fn((prop) => prop === 'id' ? 1 : 'Admin User')
            };

            vi.mocked(require('@/composables/useAuth').useAuth).mockReturnValue(mockAuthAdmin);

            const wrapper = mount(FeedbacksIndex.default, {
                props: {
                    feedbacks: {
                        data: [
                            { id: 1, reviewer_id: 1, reviewer: { name: 'User 1' } },
                            { id: 2, reviewer_id: 1, reviewer: { name: 'User 1' } }
                        ],
                        from: 1,
                        to: 2,
                        total: 2,
                        links: []
                    },
                    feedbackStats: {}
                },
                global: {
                    stubs: {
                        AuthenticatedLayout: true,
                        PageLayout: true,
                        PageHeader: true,
                        ContentSection: true,
                        ContentCard: true,
                        StatsCard: true,
                        DataTable: true,
                        TablePagination: true,
                        SearchBar: true,
                        FilterPanel: true,
                        BaseButton: true,
                        Icon: true,
                        Link: true
                    }
                }
            });

            // Select feedbacks for bulk operation
            const selectedFeedbacks = [{ id: 1 }, { id: 2 }];
            await wrapper.vm.handleSelectionChange(selectedFeedbacks);

            expect(wrapper.vm.selectedFeedbacks).toEqual(selectedFeedbacks);

            // Test bulk delete
            global.confirm = vi.fn(() => true);
            const { router } = await import('@inertiajs/vue3');

            await wrapper.vm.handleBulkDelete();

            expect(router.post).toHaveBeenCalledWith(
                '/feedbacks/bulk-delete',
                { ids: [1, 2] },
                expect.any(Object)
            );
        });

        it('handles export functionality', async () => {
            const FeedbacksIndex = await import('@/Pages/Feedbacks/Index.vue');
            
            const wrapper = mount(FeedbacksIndex.default, {
                props: {
                    feedbacks: { data: [], from: 0, to: 0, total: 0, links: [] },
                    feedbackStats: {}
                },
                global: {
                    stubs: {
                        AuthenticatedLayout: true,
                        PageLayout: true,
                        PageHeader: true,
                        ContentSection: true,
                        ContentCard: true,
                        StatsCard: true,
                        DataTable: true,
                        TablePagination: true,
                        SearchBar: true,
                        FilterPanel: true,
                        BaseButton: true,
                        Icon: true,
                        Link: true
                    }
                }
            });

            // Mock window.location
            const originalLocation = window.location;
            delete window.location;
            window.location = { href: '' };

            wrapper.vm.searchQuery = 'test search';
            wrapper.vm.filters = { rating: ['4', '5'] };

            await wrapper.vm.handleExport();

            expect(window.location.href).toContain('/feedbacks/export');
            expect(wrapper.vm.loading).toBe(true);

            // Restore window.location
            window.location = originalLocation;
        });
    });

    describe('User Experience Integration', () => {
        it('provides consistent navigation experience', async () => {
            // Test navigation consistency across all feedback pages
            const pages = [
                { component: '@/Pages/Feedbacks/Index.vue', name: 'Index' },
                { component: '@/Pages/Feedbacks/Create.vue', name: 'Create' },
                { component: '@/Pages/Feedbacks/Show.vue', name: 'Show' }
            ];

            for (const page of pages) {
                const PageComponent = await import(page.component);
                
                const props = page.name === 'Index' 
                    ? { feedbacks: { data: [], from: 0, to: 0, total: 0, links: [] }, feedbackStats: {} }
                    : page.name === 'Create'
                    ? { users: [] }
                    : { feedback: { id: 1, reviewer: {}, reviewee: {}, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' } };

                const wrapper = mount(PageComponent.default, {
                    props,
                    global: {
                        stubs: true
                    }
                });

                // All pages should have breadcrumbs
                expect(wrapper.vm.breadcrumbs).toBeDefined();
                expect(Array.isArray(wrapper.vm.breadcrumbs)).toBe(true);
                expect(wrapper.vm.breadcrumbs.length).toBeGreaterThan(0);
            }
        });

        it('maintains consistent error handling across pages', async () => {
            const { showNotification } = require('@/composables/useNotifications')();
            
            // Test error handling in Create page
            const FeedbacksCreate = await import('@/Pages/Feedbacks/Create.vue');
            const createWrapper = mount(FeedbacksCreate.default, {
                props: { users: [] },
                global: { stubs: true }
            });

            const mockForm = createWrapper.vm.form;
            mockForm.post.mockImplementation((url, options) => {
                options.onError();
            });

            await createWrapper.vm.handleSubmit();

            expect(showNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'error',
                    title: 'Submission Failed'
                })
            );

            // Test error handling in Show page
            const FeedbacksShow = await import('@/Pages/Feedbacks/Show.vue');
            const showWrapper = mount(FeedbacksShow.default, {
                props: {
                    feedback: {
                        id: 1,
                        reviewer: {},
                        reviewee: {},
                        created_at: '2024-01-15T10:00:00Z',
                        updated_at: '2024-01-15T10:00:00Z'
                    }
                },
                global: { stubs: true }
            });

            const mockResponseForm = showWrapper.vm.responseForm;
            mockResponseForm.post.mockImplementation((url, options) => {
                options.onError();
            });

            await showWrapper.vm.submitResponse();

            expect(showNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'error',
                    title: 'Submission Failed'
                })
            );
        });
    });

    describe('Performance and Optimization', () => {
        it('handles large datasets efficiently', async () => {
            const FeedbacksIndex = await import('@/Pages/Feedbacks/Index.vue');
            
            // Create large dataset
            const largeFeedbackData = Array.from({ length: 100 }, (_, i) => ({
                id: i + 1,
                reviewer: { name: `Reviewer ${i + 1}` },
                reviewee: { name: `Reviewee ${i + 1}` },
                period: 'Q4 2024',
                rating: Math.floor(Math.random() * 5) + 1,
                created_at: '2024-01-15T10:00:00Z'
            }));

            const wrapper = mount(FeedbacksIndex.default, {
                props: {
                    feedbacks: {
                        data: largeFeedbackData,
                        from: 1,
                        to: 100,
                        total: 100,
                        links: []
                    },
                    feedbackStats: {
                        total: 100,
                        averageRating: '4.2',
                        thisMonth: 25,
                        positiveTrend: '15%'
                    }
                },
                global: { stubs: true }
            });

            expect(wrapper.exists()).toBe(true);
            expect(wrapper.vm.feedbacks.data).toHaveLength(100);
            
            // Test that table configuration handles large datasets
            const tableColumns = wrapper.vm.tableColumns;
            expect(tableColumns).toHaveLength(6);
            
            // Test pagination with large dataset
            expect(wrapper.vm.feedbacks.total).toBe(100);
        });

        it('optimizes form validation for better UX', async () => {
            const FeedbacksCreate = await import('@/Pages/Feedbacks/Create.vue');
            
            const wrapper = mount(FeedbacksCreate.default, {
                props: { users: [{ id: 1, name: 'Test User' }] },
                global: { stubs: true }
            });

            // Test that validation is reactive
            expect(wrapper.vm.isFormValid).toBe(false);

            // Fill required fields one by one and test validation
            wrapper.vm.form.reviewee_id = 1;
            expect(wrapper.vm.isFormValid).toBe(false);

            wrapper.vm.form.period = 'Q4 2024';
            expect(wrapper.vm.isFormValid).toBe(false);

            wrapper.vm.form.rating = 4;
            expect(wrapper.vm.isFormValid).toBe(false);

            wrapper.vm.form.comments = 'Great work!';
            expect(wrapper.vm.isFormValid).toBe(true);
        });
    });
});