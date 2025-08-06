import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DataTable from '@/Components/Data/DataTable.vue';

// Mock child components
vi.mock('@/Components/Data/TableHeader.vue', () => ({
  default: {
    name: 'TableHeader',
    template: '<div data-testid="table-header"><slot /></div>',
    props: ['title', 'searchConfig', 'filterConfig', 'actions', 'loading'],
    emits: ['search', 'filter', 'action']
  }
}));

vi.mock('@/Components/Data/TablePagination.vue', () => ({
  default: {
    name: 'TablePagination',
    template: '<div data-testid="table-pagination"><slot /></div>',
    props: ['currentPage', 'totalPages', 'pageSize', 'pageSizeOptions', 'totalItems'],
    emits: ['page-change', 'page-size-change']
  }
}));

vi.mock('@/Components/Data/TableSkeleton.vue', () => ({
  default: {
    name: 'TableSkeleton',
    template: '<div data-testid="table-skeleton"><slot /></div>',
    props: ['columns', 'rows']
  }
}));

vi.mock('@/Components/States/EmptyState.vue', () => ({
  default: {
    name: 'EmptyState',
    template: '<div data-testid="empty-state"><slot /></div>',
    props: ['title', 'description', 'icon', 'actions']
  }
}));

vi.mock('@/Components/Base/BaseCheckbox.vue', () => ({
  default: {
    name: 'BaseCheckbox',
    template: '<input type="checkbox" data-testid="checkbox" />',
    props: ['checked', 'indeterminate'],
    emits: ['change']
  }
}));

vi.mock('@/Components/Base/Icon.vue', () => ({
  default: {
    name: 'Icon',
    template: '<span data-testid="icon"><slot /></span>',
    props: ['name']
  }
}));

vi.mock('@/composables/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: { value: false },
    isTablet: { value: false },
    isDesktop: { value: true }
  })
}));

describe('DataTable', () => {
  let wrapper;

  const defaultColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' }
  ];

  const defaultData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active' }
  ];

  const defaultProps = {
    columns: defaultColumns,
    data: defaultData
  };

  beforeEach(() => {
    wrapper = mount(DataTable, {
      props: defaultProps
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.data-table-container').exists()).toBe(true);
    });

    it('renders table header when showHeader is true', () => {
      expect(wrapper.find('[data-testid="table-header"]').exists()).toBe(true);
    });

    it('hides table header when showHeader is false', async () => {
      await wrapper.setProps({ showHeader: false });
      expect(wrapper.find('[data-testid="table-header"]').exists()).toBe(false);
    });

    it('renders table footer when showFooter is true', () => {
      expect(wrapper.find('.table-footer').exists()).toBe(true);
    });

    it('hides table footer when showFooter is false', async () => {
      await wrapper.setProps({ showFooter: false });
      expect(wrapper.find('.table-footer').exists()).toBe(false);
    });

    it('renders data table with correct structure', () => {
      expect(wrapper.find('.data-table').exists()).toBe(true);
      expect(wrapper.find('.table-head').exists()).toBe(true);
      expect(wrapper.find('.table-body').exists()).toBe(true);
    });
  });

  describe('Column Rendering', () => {
    it('renders correct number of column headers', () => {
      const headers = wrapper.findAll('.table-head th');
      expect(headers).toHaveLength(defaultColumns.length);
    });

    it('displays column labels correctly', () => {
      const headers = wrapper.findAll('.column-label');
      expect(headers[0].text()).toBe('ID');
      expect(headers[1].text()).toBe('Name');
      expect(headers[2].text()).toBe('Email');
      expect(headers[3].text()).toBe('Status');
    });

    it('shows sort indicators for sortable columns', () => {
      const sortableHeaders = wrapper.findAll('.sortable');
      expect(sortableHeaders).toHaveLength(2); // ID and Name are sortable
    });

    it('applies correct column classes', () => {
      const firstHeader = wrapper.findAll('.table-column')[0];
      expect(firstHeader.classes()).toContain('column-id');
      expect(firstHeader.classes()).toContain('sortable');
    });
  });

  describe('Data Rendering', () => {
    it('renders correct number of data rows', () => {
      const rows = wrapper.findAll('.table-body .table-row');
      expect(rows).toHaveLength(defaultData.length);
    });

    it('displays cell data correctly', () => {
      const firstRowCells = wrapper.findAll('.table-body .table-row')[0].findAll('.cell-value');
      expect(firstRowCells[0].text()).toBe('1');
      expect(firstRowCells[1].text()).toBe('John Doe');
      expect(firstRowCells[2].text()).toBe('john@example.com');
      expect(firstRowCells[3].text()).toBe('active');
    });

    it('handles null and undefined values', async () => {
      const dataWithNulls = [
        { id: 1, name: null, email: undefined, status: 'active' }
      ];
      
      await wrapper.setProps({ data: dataWithNulls });
      
      const cells = wrapper.findAll('.cell-value');
      expect(cells[1].text()).toBe('-'); // null value
      expect(cells[2].text()).toBe('-'); // undefined value
    });

    it('applies custom cell formatters', async () => {
      const columnsWithFormatter = [
        { 
          key: 'price', 
          label: 'Price',
          formatter: (value) => `$${value.toFixed(2)}`
        }
      ];
      
      const dataWithPrice = [
        { price: 19.99 }
      ];
      
      await wrapper.setProps({ 
        columns: columnsWithFormatter,
        data: dataWithPrice
      });
      
      const cell = wrapper.find('.cell-value');
      expect(cell.text()).toBe('$19.99');
    });
  });

  describe('Loading States', () => {
    it('shows skeleton when loading and no data', async () => {
      await wrapper.setProps({ loading: true, data: [] });
      
      expect(wrapper.find('[data-testid="table-skeleton"]').exists()).toBe(true);
      expect(wrapper.find('.data-table').exists()).toBe(false);
    });

    it('shows loading overlay when loading with existing data', async () => {
      await wrapper.setProps({ loading: true });
      
      expect(wrapper.find('.table-wrapper.loading').exists()).toBe(true);
      expect(wrapper.find('.data-table').exists()).toBe(true);
    });

    it('passes correct props to skeleton component', async () => {
      await wrapper.setProps({ 
        loading: true, 
        data: [],
        skeletonRows: 8
      });
      
      const skeleton = wrapper.findComponent({ name: 'TableSkeleton' });
      expect(skeleton.props('columns')).toBe(defaultColumns.length);
      expect(skeleton.props('rows')).toBe(8);
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no data and not loading', async () => {
      await wrapper.setProps({ data: [], loading: false });
      
      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
      expect(wrapper.find('.data-table').exists()).toBe(false);
    });

    it('passes correct props to empty state component', async () => {
      const customEmptyState = {
        title: 'No users found',
        description: 'Try adjusting your search criteria',
        icon: 'users',
        actions: [{ id: 'create', label: 'Create User' }]
      };
      
      await wrapper.setProps({ 
        data: [], 
        loading: false,
        emptyState: customEmptyState
      });
      
      const emptyState = wrapper.findComponent({ name: 'EmptyState' });
      expect(emptyState.props('title')).toBe('No users found');
      expect(emptyState.props('description')).toBe('Try adjusting your search criteria');
      expect(emptyState.props('icon')).toBe('users');
    });
  });

  describe('Selection Functionality', () => {
    beforeEach(async () => {
      await wrapper.setProps({ selectable: true });
    });

    it('shows selection column when selectable is true', () => {
      expect(wrapper.findAll('.select-column')).toHaveLength(defaultData.length + 1); // +1 for header
    });

    it('renders select all checkbox in header', () => {
      const headerCheckbox = wrapper.find('.table-head .select-column [data-testid="checkbox"]');
      expect(headerCheckbox.exists()).toBe(true);
    });

    it('renders individual row checkboxes', () => {
      const rowCheckboxes = wrapper.findAll('.table-body .select-column [data-testid="checkbox"]');
      expect(rowCheckboxes).toHaveLength(defaultData.length);
    });

    it('emits selection-change when row is selected', async () => {
      const firstRowCheckbox = wrapper.findAll('.table-body .select-column [data-testid="checkbox"]')[0];
      await firstRowCheckbox.trigger('change');
      
      expect(wrapper.emitted('selection-change')).toBeTruthy();
    });

    it('handles select all functionality', async () => {
      const selectAllCheckbox = wrapper.find('.table-head .select-column [data-testid="checkbox"]');
      await selectAllCheckbox.trigger('change');
      
      expect(wrapper.emitted('selection-change')).toBeTruthy();
    });
  });

  describe('Sorting Functionality', () => {
    it('handles column sort clicks', async () => {
      const sortableHeader = wrapper.find('.sortable');
      await sortableHeader.trigger('click');
      
      expect(wrapper.emitted('sort')).toBeTruthy();
      expect(wrapper.emitted('sort')[0][0]).toEqual({
        key: 'id',
        direction: 'asc'
      });
    });

    it('toggles sort direction on repeated clicks', async () => {
      const sortableHeader = wrapper.find('.sortable');
      
      // First click - ascending
      await sortableHeader.trigger('click');
      expect(wrapper.emitted('sort')[0][0].direction).toBe('asc');
      
      // Second click - descending
      await sortableHeader.trigger('click');
      expect(wrapper.emitted('sort')[1][0].direction).toBe('desc');
    });

    it('does not sort non-sortable columns', async () => {
      const nonSortableHeader = wrapper.findAll('.table-column')[2]; // Email column
      await nonSortableHeader.trigger('click');
      
      expect(wrapper.emitted('sort')).toBeFalsy();
    });

    it('shows active sort indicator', async () => {
      // Simulate sorting by setting internal state
      await wrapper.vm.handleSort(defaultColumns[0]);
      
      const sortIcon = wrapper.find('.sort-icon.active');
      expect(sortIcon.exists()).toBe(true);
    });
  });

  describe('Pagination', () => {
    it('calculates pagination correctly', () => {
      expect(wrapper.vm.totalItems).toBe(defaultData.length);
      expect(wrapper.vm.totalPages).toBe(1);
      expect(wrapper.vm.startIndex).toBe(0);
      expect(wrapper.vm.endIndex).toBe(defaultData.length);
    });

    it('handles page changes', async () => {
      // Add more data to test pagination
      const moreData = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: 'active'
      }));
      
      await wrapper.setProps({ data: moreData, pageSize: 10 });
      
      await wrapper.vm.handlePageChange(2);
      
      expect(wrapper.emitted('page-change')).toBeTruthy();
      expect(wrapper.emitted('page-change')[0][0]).toBe(2);
    });

    it('handles page size changes', async () => {
      await wrapper.vm.handlePageSizeChange(25);
      
      expect(wrapper.emitted('page-size-change')).toBeTruthy();
      expect(wrapper.emitted('page-size-change')[0][0]).toBe(25);
    });
  });

  describe('Search and Filtering', () => {
    it('filters data based on search query', async () => {
      await wrapper.vm.handleSearch('John');
      
      expect(wrapper.vm.filteredData).toHaveLength(1);
      expect(wrapper.vm.filteredData[0].name).toBe('John Doe');
    });

    it('filters data based on active filters', async () => {
      await wrapper.vm.handleFilter({ status: 'active' });
      
      const activeUsers = wrapper.vm.filteredData;
      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.every(user => user.status === 'active')).toBe(true);
    });

    it('combines search and filters', async () => {
      await wrapper.vm.handleSearch('John');
      await wrapper.vm.handleFilter({ status: 'active' });
      
      expect(wrapper.vm.filteredData).toHaveLength(1);
      expect(wrapper.vm.filteredData[0].name).toBe('John Doe');
      expect(wrapper.vm.filteredData[0].status).toBe('active');
    });

    it('resets page when search changes', async () => {
      wrapper.vm.currentPage = 2;
      await wrapper.vm.handleSearch('test');
      
      expect(wrapper.vm.currentPage).toBe(1);
    });
  });

  describe('Row Actions', () => {
    beforeEach(async () => {
      const rowActions = [
        { id: 'edit', label: 'Edit', icon: 'pencil' },
        { id: 'delete', label: 'Delete', icon: 'trash' }
      ];
      
      await wrapper.setProps({ rowActions });
    });

    it('shows actions column when row actions are provided', () => {
      expect(wrapper.findAll('.actions-column')).toHaveLength(defaultData.length + 1); // +1 for header
    });

    it('emits row-action event when action is clicked', async () => {
      const action = { id: 'edit', label: 'Edit' };
      const row = defaultData[0];
      
      await wrapper.vm.handleRowAction(action, row);
      
      expect(wrapper.emitted('row-action')).toBeTruthy();
      expect(wrapper.emitted('row-action')[0][0]).toEqual({ action, row });
    });
  });

  describe('Event Handling', () => {
    it('emits row-click when row is clicked', async () => {
      const firstRow = wrapper.find('.table-row');
      await firstRow.trigger('click');
      
      expect(wrapper.emitted('row-click')).toBeTruthy();
      expect(wrapper.emitted('row-click')[0][0]).toEqual(defaultData[0]);
    });

    it('does not emit row-click when clicking on selection or actions', async () => {
      await wrapper.setProps({ selectable: true });
      
      const selectColumn = wrapper.find('.select-column');
      await selectColumn.trigger('click');
      
      expect(wrapper.emitted('row-click')).toBeFalsy();
    });

    it('emits header-action when header action is clicked', async () => {
      const action = { id: 'create', label: 'Create' };
      await wrapper.vm.handleHeaderAction(action);
      
      expect(wrapper.emitted('header-action')).toBeTruthy();
      expect(wrapper.emitted('header-action')[0][0]).toEqual(action);
    });
  });

  describe('Styling and Classes', () => {
    it('applies correct table classes', () => {
      const table = wrapper.find('.data-table');
      expect(table.classes()).toContain('table-md');
      expect(table.classes()).toContain('table-striped');
      expect(table.classes()).toContain('table-bordered');
      expect(table.classes()).toContain('table-hoverable');
    });

    it('applies size variant classes', async () => {
      await wrapper.setProps({ size: 'sm' });
      
      const table = wrapper.find('.data-table');
      expect(table.classes()).toContain('table-sm');
    });

    it('applies styling options', async () => {
      await wrapper.setProps({ 
        striped: false,
        bordered: false,
        hoverable: false
      });
      
      const table = wrapper.find('.data-table');
      expect(table.classes()).not.toContain('table-striped');
      expect(table.classes()).not.toContain('table-bordered');
      expect(table.classes()).not.toContain('table-hoverable');
    });
  });

  describe('Accessibility', () => {
    it('has proper table structure', () => {
      expect(wrapper.find('table').exists()).toBe(true);
      expect(wrapper.find('thead').exists()).toBe(true);
      expect(wrapper.find('tbody').exists()).toBe(true);
    });

    it('has proper ARIA labels for checkboxes', async () => {
      await wrapper.setProps({ selectable: true });
      
      const selectAllCheckbox = wrapper.find('.table-head .select-column [data-testid="checkbox"]');
      expect(selectAllCheckbox.attributes('aria-label')).toBe('Select all rows');
      
      const rowCheckboxes = wrapper.findAll('.table-body .select-column [data-testid="checkbox"]');
      expect(rowCheckboxes[0].attributes('aria-label')).toBe('Select row 1');
    });

    it('has proper ARIA attributes for sorting', () => {
      const sortableHeaders = wrapper.findAll('.sortable');
      sortableHeaders.forEach(header => {
        expect(header.attributes('role')).toBe(undefined); // Should not have explicit role
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('applies mobile classes on small screens', async () => {
      // Mock mobile responsive state
      vi.mocked(vi.importActual('@/composables/useResponsive')).useResponsive = () => ({
        isMobile: { value: true },
        isTablet: { value: false },
        isDesktop: { value: false }
      });

      // Re-mount component to pick up new responsive state
      wrapper.unmount();
      wrapper = mount(DataTable, { props: defaultProps });
      
      const table = wrapper.find('.data-table');
      expect(table.classes()).toContain('table-mobile');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data array', async () => {
      await wrapper.setProps({ data: [] });
      
      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
      expect(wrapper.findAll('.table-row')).toHaveLength(0);
    });

    it('handles invalid column configuration', () => {
      expect(() => {
        mount(DataTable, {
          props: {
            columns: [{ label: 'Invalid' }], // Missing key
            data: []
          }
        });
      }).toThrow();
    });

    it('handles nested object properties', async () => {
      const nestedData = [
        { id: 1, user: { name: 'John', profile: { email: 'john@example.com' } } }
      ];
      
      const nestedColumns = [
        { key: 'id', label: 'ID' },
        { key: 'user.name', label: 'Name' },
        { key: 'user.profile.email', label: 'Email' }
      ];
      
      await wrapper.setProps({ 
        data: nestedData,
        columns: nestedColumns
      });
      
      const cells = wrapper.findAll('.cell-value');
      expect(cells[0].text()).toBe('1');
      expect(cells[1].text()).toBe('John');
      expect(cells[2].text()).toBe('john@example.com');
    });
  });
});