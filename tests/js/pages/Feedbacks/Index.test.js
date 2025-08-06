import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FeedbacksIndex from '@/Pages/Feedbacks/Index.vue';

// Mock Inertia
vi.mock('@inertiajs/vue3', () => ({
    Link: {
        name: 'Link',
        template: '<a><slot /></a>',
        props: ['href']
    },
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
    template: '<div class="page-header" data-testid="page-header"><h1>Feedback Management</h1><p>Manage and review team feedback submissions</p></div>',
    props: ['title', 'description', 'icon', 'breadcrumbs', 'actions']
}));

vi.mock('@/Components/Layout/ContentSection.vue', () => ({
    name: 'ContentSection',
    template: '<div class="content-section"><slot /></div>'
}));

vi.mock('@/Components/Layout/ContentCard.vue', () => ({
    name: 'ContentCard',
    template: '<div class="content-card"><slot /></div>'
}));

vi.mock('@/Components/Dashboard/StatsCard.vue', () => ({
    name: 'StatsCard',
    template: '<div class="stats-card" data-testid="stats-card"><div class="title">{{ title }}</div><div class="value">{{ value }}</div></div>',
    props: ['title', 'value', 'icon', 'color', 'trend']
}));

vi.mock('@/Components/Data/DataTable.vue', () => ({
    name: 'DataTable',
    template: '<div class="data-table" data-testid="data-table"></div>',
    props: ['data', 'columns', 'loading', 'showHeader', 'showFooter', 'selectable', 'selectedRows', 'rowActions', 'headerActions', 'searchConfig', 'filterConfig', 'emptyState'],
    emits: ['search', 'filter', 'row-click', 'row-action', 'header-action', 'selection-change']
}));

vi.mock('@/Components/Data/TablePagination.vue', () => ({
    name: 'TablePagination',
    template: '<div class="table-pagination" data-testid="table-pagination">Showing {{ from }} to {{ to }} of {{ total }} results</div>',
    props: ['from', 'to', 'total', 'links']
}));

vi.mock('@/Components/Search/SearchBar.vue', () => ({
    name: 'SearchBar',
    template: '<input class="search-bar" data-testid="search-bar" />',
    props: ['modelValue', 'placeholder', 'suggestions'],
    emits: ['update:modelValue', 'search', 'select']
}));

vi.mock('@/Components/Search/FilterPanel.vue', () => ({
    name: 'FilterPanel',
    template: '<div class="filter-panel" data-testid="filter-panel"></div>',
    props: ['filterGroups', 'initialFilters'],
    emits: ['apply-filters', 'clear-filters']
}));

vi.mock('@/Components/Base/BaseButton.vue', () => ({
    name: 'BaseButton',
    template: '<button class="base-button" data-testid="base-button"><slot /></button>',
    props: ['href', 'variant', 'iconLeft', 'label']
}));

vi.mock('@/Components/Base/Icon.vue', () => ({
    name: 'Icon',
    template: '<span class="icon" data-testid="icon"></span>',
    props: ['name']
}));

// Mock global route function
global.route = vi.fn((name, params) => `/${name.replace('.', '/')}${params ? `/${params}` : ''}`);

describe('Feedbacks Index Page', () => {
    let wrapper;

    const defaultProps = {
        feedbacks: {
            data: [
                {
                    id: 1,
                    reviewer: { id: 1, name: 'John Doe' },
                    reviewee: { id: 2, name: 'Jane Smith' },
                    period: 'Q4 2024',
                    rating: 4,
                    sentiment: 'positive',
                    created_at: '2024-01-15T10:00:00Z',
                    reviewer_id: 1
                },
                {
                    id: 2,
                    reviewer: { id: 2, name: 'Jane Smith' },
                    reviewee: { id: 1, name: 'John Doe' },
                    period: 'Q4 2024',
                    rating: 5,
                    sentiment: 'positive',
                    created_at: '2024-01-16T10:00:00Z',
                    reviewer_id: 2
                }
            ],
            from: 1,
            to: 2,
            total: 2,
            links: [
                { label: 'Previous', url: null, active: false },
                { label: '1', url: '/feedbacks?page=1', active: true },
                { label: 'Next', url: null, active: false }
            ]
        },
        feedbackStats: {
            total: 25,
            averageRating: '4.2',
            thisMonth: 8,
            positiveTrend: '15%'
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createWrapper = (props = {}) => {
        return mount(FeedbacksIndex, {
            props: { ...defaultProps, ...props },
            global: {
                stubs: {
                    AuthenticatedLayout: true,
                    DataTable: true,
                    SearchBar: true,
                    FilterPanel: true,
                    BaseButton: true,
                    Icon: true,
                    Link: true
                }
            }
        });
    };

    describe('Modern UI Component Rendering', () => {
        it('renders the modern page layout structure', () => {
            wrapper = createWrapper();

            expect(wrapper.findComponent({ name: 'PageLayout' }).exists()).toBe(true);
            expect(wrapper.findComponent({ name: 'PageHeader' }).exists()).toBe(true);
            expect(wrapper.findAllComponents({ name: 'ContentSection' })).toHaveLength(3);
        });

        it('renders the page header with correct props', () => {
            wrapper = createWrapper();

            const pageHeader = wrapper.findComponent({ name: 'PageHeader' });
            expect(pageHeader.props('title')).toBe('Feedback Management');
            expect(pageHeader.props('description')).toBe('Manage and review team feedback submissions');
            expect(pageHeader.props('icon')).toBe('message-square');
            expect(pageHeader.props('breadcrumbs')).toEqual([
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Feedbacks', current: true }
            ]);
        });

        it('renders modern statistics cards with StatsCard components', () => {
            wrapper = createWrapper();

            const statsCards = wrapper.findAllComponents({ name: 'StatsCard' });
            expect(statsCards).toHaveLength(4);
            
            expect(statsCards[0].props('title')).toBe('Total Feedbacks');
            expect(statsCards[0].props('value')).toBe(25);
            expect(statsCards[0].props('icon')).toBe('message-square');
            expect(statsCards[0].props('color')).toBe('blue');

            expect(statsCards[1].props('title')).toBe('Average Rating');
            expect(statsCards[1].props('value')).toBe('4.2');
            expect(statsCards[1].props('icon')).toBe('star');
            expect(statsCards[1].props('color')).toBe('green');
        });

        it('renders search and filter components in modern layout', () => {
            wrapper = createWrapper();

            expect(wrapper.findComponent({ name: 'SearchBar' }).exists()).toBe(true);
            expect(wrapper.findComponent({ name: 'FilterPanel' }).exists()).toBe(true);
        });

        it('renders data table within ContentCard', () => {
            wrapper = createWrapper();

            const contentCard = wrapper.findComponent({ name: 'ContentCard' });
            expect(contentCard.exists()).toBe(true);
            
            const dataTable = wrapper.findComponent({ name: 'DataTable' });
            expect(dataTable.exists()).toBe(true);
            expect(dataTable.props('data')).toEqual(defaultProps.feedbacks.data);
        });

        it('renders modern table pagination component', () => {
            wrapper = createWrapper();

            const tablePagination = wrapper.findComponent({ name: 'TablePagination' });
            expect(tablePagination.exists()).toBe(true);
            expect(tablePagination.props('from')).toBe(1);
            expect(tablePagination.props('to')).toBe(2);
            expect(tablePagination.props('total')).toBe(2);
        });
    });

    describe('Search Functionality', () => {
        it('handles search input correctly', async () => {
            wrapper = createWrapper();

            const searchBar = wrapper.findComponent({ name: 'SearchBar' });
            await searchBar.vm.$emit('search', 'test query');

            expect(wrapper.vm.searchQuery).toBe('test query');
        });

        it('handles search suggestions selection', async () => {
            wrapper = createWrapper();

            const searchBar = wrapper.findComponent({ name: 'SearchBar' });
            await searchBar.vm.$emit('select', { text: 'Q4 2024', category: 'Period' });

            expect(wrapper.vm.searchQuery).toBe('Q4 2024');
        });

        it('provides correct search suggestions', () => {
            wrapper = createWrapper();

            const suggestions = wrapper.vm.searchSuggestions;
            expect(suggestions).toContainEqual({ text: 'Q4 2024', category: 'Period' });
            expect(suggestions).toContainEqual({ text: 'High rating', category: 'Filter' });
        });
    });

    describe('Filter Functionality', () => {
        it('handles filter application', async () => {
            wrapper = createWrapper();

            const filterPanel = wrapper.findComponent({ name: 'FilterPanel' });
            const newFilters = { rating: ['4', '5'], period: 'Q4 2024' };

            await filterPanel.vm.$emit('apply-filters', newFilters);

            expect(wrapper.vm.filters).toEqual(newFilters);
        });

        it('handles filter clearing', async () => {
            wrapper = createWrapper();
            wrapper.vm.filters = { rating: ['4', '5'] };

            const filterPanel = wrapper.findComponent({ name: 'FilterPanel' });
            await filterPanel.vm.$emit('clear-filters');

            expect(wrapper.vm.filters).toEqual({});
        });

        it('provides correct filter groups', () => {
            wrapper = createWrapper();

            const filterGroups = wrapper.vm.filterGroups;
            expect(filterGroups).toHaveLength(3);
            expect(filterGroups[0].key).toBe('rating');
            expect(filterGroups[1].key).toBe('period');
            expect(filterGroups[2].key).toBe('date_range');
        });
    });

    describe('Table Configuration', () => {
        it('configures table columns correctly', () => {
            wrapper = createWrapper();

            const columns = wrapper.vm.tableColumns;
            expect(columns).toHaveLength(6);
            expect(columns[0].key).toBe('reviewer');
            expect(columns[1].key).toBe('reviewee');
            expect(columns[2].key).toBe('period');
            expect(columns[3].key).toBe('rating');
            expect(columns[4].key).toBe('sentiment');
            expect(columns[5].key).toBe('created_at');
        });

        it('formats column data correctly', () => {
            wrapper = createWrapper();

            const columns = wrapper.vm.tableColumns;
            const reviewerColumn = columns.find(col => col.key === 'reviewer');
            const createdAtColumn = columns.find(col => col.key === 'created_at');

            expect(reviewerColumn.formatter({ name: 'John Doe' })).toBe('John Doe');
            expect(reviewerColumn.formatter(null)).toBe('N/A');
            expect(createdAtColumn.formatter('2024-01-15T10:00:00Z')).toBe('1/15/2024');
        });
    });

    describe('Row Actions', () => {
        it('provides correct row actions for own feedback', () => {
            wrapper = createWrapper();

            const feedback = { id: 1, reviewer_id: 1 }; // Current user's feedback
            const actions = wrapper.vm.getRowActions(feedback);

            expect(actions).toContainEqual(
                expect.objectContaining({ id: 'view', label: 'View Details' })
            );
            expect(actions).toContainEqual(
                expect.objectContaining({ id: 'edit', label: 'Edit' })
            );
            expect(actions).toContainEqual(
                expect.objectContaining({ id: 'delete', label: 'Delete' })
            );
        });

        it('provides limited row actions for other users feedback', () => {
            wrapper = createWrapper();

            const feedback = { id: 2, reviewer_id: 2 }; // Other user's feedback
            const actions = wrapper.vm.getRowActions(feedback);

            expect(actions).toContainEqual(
                expect.objectContaining({ id: 'view', label: 'View Details' })
            );
            expect(actions).not.toContainEqual(
                expect.objectContaining({ id: 'edit' })
            );
            expect(actions).not.toContainEqual(
                expect.objectContaining({ id: 'delete' })
            );
        });
    });

    describe('Header Actions', () => {
        it('shows export action', () => {
            wrapper = createWrapper();

            const actions = wrapper.vm.headerActions;
            expect(actions).toContainEqual(
                expect.objectContaining({ id: 'export', label: 'Export' })
            );
        });

        it('shows bulk delete action when feedbacks are selected', async () => {
            wrapper = createWrapper();
            wrapper.vm.selectedFeedbacks = [{ id: 1 }, { id: 2 }];

            await wrapper.vm.$nextTick();

            const actions = wrapper.vm.headerActions;
            expect(actions).toContainEqual(
                expect.objectContaining({ id: 'bulk-delete', label: 'Delete (2)' })
            );
        });
    });

    describe('Permission Checks', () => {
        it('checks edit permissions correctly', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.canEdit({ reviewer_id: 1 })).toBe(true); // Own feedback
            expect(wrapper.vm.canEdit({ reviewer_id: 2 })).toBe(false); // Other's feedback
        });

        it('checks delete permissions correctly', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.canDelete({ reviewer_id: 1 })).toBe(true); // Own feedback
            expect(wrapper.vm.canDelete({ reviewer_id: 2 })).toBe(false); // Other's feedback
        });

        it('sets bulk delete capability based on role', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.canBulkDelete).toBe(false); // Employee role
        });
    });

    describe('Empty State', () => {
        it('configures empty state correctly', () => {
            wrapper = createWrapper();

            const emptyState = wrapper.vm.emptyState;
            expect(emptyState.title).toBe('No feedbacks found');
            expect(emptyState.description).toContain('no feedback submissions');
            expect(emptyState.icon).toBe('message-square');
            expect(emptyState.actions).toHaveLength(1);
            expect(emptyState.actions[0].label).toBe('Submit Feedback');
        });
    });

    describe('Event Handling', () => {
        it('handles table row clicks', async () => {
            const { router } = await import('@inertiajs/vue3');
            wrapper = createWrapper();

            const feedback = { id: 1 };
            await wrapper.vm.handleRowClick(feedback);

            expect(router.visit).toHaveBeenCalledWith('/feedbacks/show/1');
        });

        it('handles row actions', async () => {
            const { router } = await import('@inertiajs/vue3');
            wrapper = createWrapper();

            const action = { id: 'view' };
            const row = { id: 1 };

            await wrapper.vm.handleRowAction({ action, row });

            expect(router.visit).toHaveBeenCalledWith('/feedbacks/show/1');
        });

        it('handles header actions', async () => {
            wrapper = createWrapper();
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            const exportAction = { id: 'export' };
            await wrapper.vm.handleHeaderAction(exportAction);

            expect(wrapper.vm.loading).toBe(true);

            consoleSpy.mockRestore();
        });

        it('handles selection changes', async () => {
            wrapper = createWrapper();

            const selection = [{ id: 1 }, { id: 2 }];
            await wrapper.vm.handleSelectionChange(selection);

            expect(wrapper.vm.selectedFeedbacks).toEqual(selection);
        });
    });

    describe('Data Operations', () => {
        it('handles feedback deletion with confirmation', async () => {
            const { router } = await import('@inertiajs/vue3');
            global.confirm = vi.fn(() => true);
            wrapper = createWrapper();

            const feedback = { id: 1, reviewer: { name: 'John Doe' } };
            await wrapper.vm.handleDelete(feedback);

            expect(global.confirm).toHaveBeenCalledWith(
                'Are you sure you want to delete the feedback from John Doe?'
            );
            expect(router.delete).toHaveBeenCalledWith('/feedbacks/destroy/1', expect.any(Object));
        });

        it('handles bulk deletion with confirmation', async () => {
            const { router } = await import('@inertiajs/vue3');
            global.confirm = vi.fn(() => true);
            wrapper = createWrapper();
            wrapper.vm.selectedFeedbacks = [{ id: 1 }, { id: 2 }];

            await wrapper.vm.handleBulkDelete();

            expect(global.confirm).toHaveBeenCalledWith(
                'Are you sure you want to delete 2 selected feedbacks?'
            );
            expect(router.post).toHaveBeenCalledWith('/feedbacks/bulk-delete', { ids: [1, 2] }, expect.any(Object));
        });

        it('handles export functionality', async () => {
            wrapper = createWrapper();
            const originalLocation = window.location;
            delete window.location;
            window.location = { href: '' };

            wrapper.vm.searchQuery = 'test';
            wrapper.vm.filters = { rating: ['4', '5'] };

            await wrapper.vm.handleExport();

            expect(window.location.href).toBe('/feedbacks/export?search=test&filters=%5Bobject%20Object%5D');
            expect(wrapper.vm.loading).toBe(true);

            window.location = originalLocation;
        });
    });

    describe('Utility Functions', () => {
        it('gets correct sentiment icon for ratings', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.getSentimentIcon(5)).toBe('heart');
            expect(wrapper.vm.getSentimentIcon(4)).toBe('heart');
            expect(wrapper.vm.getSentimentIcon(3)).toBe('star');
            expect(wrapper.vm.getSentimentIcon(2)).toBe('warning');
            expect(wrapper.vm.getSentimentIcon(1)).toBe('warning');
        });

        it('gets correct sentiment color for ratings', () => {
            wrapper = createWrapper();

            expect(wrapper.vm.getSentimentColor(5)).toBe('text-green-500');
            expect(wrapper.vm.getSentimentColor(4)).toBe('text-green-500');
            expect(wrapper.vm.getSentimentColor(3)).toBe('text-yellow-500');
            expect(wrapper.vm.getSentimentColor(2)).toBe('text-red-500');
            expect(wrapper.vm.getSentimentColor(1)).toBe('text-red-500');
        });
    });
});