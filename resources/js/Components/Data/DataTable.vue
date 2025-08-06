<template>
  <div class="data-table-container" :data-theme="theme">
    <!-- Table Header with Search and Filters -->
    <TableHeader
      v-if="showHeader"
      :title="title"
      :search-config="searchConfig"
      :filter-config="filterConfig"
      :actions="headerActions"
      :loading="loading"
      :theme="theme"
      @search="handleSearch"
      @filter="handleFilter"
      @action="handleHeaderAction"
    />

    <!-- Table Content -->
    <div class="table-wrapper" :class="{ 'loading': loading }">
      <!-- Loading Skeleton -->
      <TableSkeleton v-if="loading && !data.length" :columns="columns.length" :rows="skeletonRows" />
      
      <!-- Empty State -->
      <EmptyState
        v-else-if="!loading && !filteredData.length"
        :title="emptyState.title"
        :description="emptyState.description"
        :icon="emptyState.icon"
        :actions="emptyState.actions"
      />
      
      <!-- Data Table -->
      <div v-else class="table-scroll-container">
        <table class="data-table" :class="tableClasses">
          <!-- Table Header -->
          <thead class="table-head">
            <tr>
              <!-- Selection Column -->
              <th v-if="selectable" class="select-column">
                <BaseCheckbox
                  :checked="isAllSelected"
                  :indeterminate="isPartiallySelected"
                  @change="toggleSelectAll"
                  aria-label="Select all rows"
                />
              </th>
              
              <!-- Data Columns -->
              <th
                v-for="column in columns"
                :key="column.key"
                :class="getColumnClasses(column)"
                :style="getColumnStyles(column)"
                :data-priority="column.priority || 'high'"
                @click="handleSort(column)"
              >
                <div class="column-header">
                  <span class="column-label">{{ column.label }}</span>
                  
                  <!-- Sort Indicator -->
                  <div v-if="column.sortable" class="sort-indicator">
                    <Icon
                      v-if="sortConfig.key === column.key"
                      :name="sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'"
                      class="sort-icon active"
                    />
                    <Icon v-else name="chevron-up-down" class="sort-icon" />
                  </div>
                </div>
              </th>
              
              <!-- Actions Column -->
              <th v-if="hasRowActions" class="actions-column">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          
          <!-- Table Body -->
          <tbody class="table-body">
            <tr
              v-for="(row, index) in paginatedData"
              :key="getRowKey(row, index)"
              :class="getRowClasses(row, index)"
              @click="handleRowClick(row, $event)"
            >
              <!-- Selection Column -->
              <td v-if="selectable" class="select-column">
                <BaseCheckbox
                  :checked="isRowSelected(row)"
                  @change="toggleRowSelection(row)"
                  :aria-label="`Select row ${index + 1}`"
                />
              </td>
              
              <!-- Data Columns -->
              <td
                v-for="column in columns"
                :key="column.key"
                :class="getCellClasses(column, row)"
                :style="getColumnStyles(column)"
                :data-priority="column.priority || 'high'"
              >
                <div class="cell-content">
                  <!-- Custom Cell Slot -->
                  <slot
                    v-if="$slots[`cell-${column.key}`]"
                    :name="`cell-${column.key}`"
                    :row="row"
                    :value="getCellValue(row, column.key)"
                    :column="column"
                    :index="index"
                  />
                  
                  <!-- Default Cell Content -->
                  <span v-else class="cell-value">
                    {{ formatCellValue(getCellValue(row, column.key), column) }}
                  </span>
                </div>
              </td>
              
              <!-- Actions Column -->
              <td v-if="hasRowActions" class="actions-column">
                <div class="row-actions">
                  <slot name="row-actions" :row="row" :index="index">
                    <Dropdown align="right" width="48">
                      <template #trigger>
                        <button class="action-trigger" aria-label="Row actions">
                          <Icon name="dots-vertical" class="w-4 h-4" />
                        </button>
                      </template>
                      
                      <template #content>
                        <button
                          v-for="action in getRowActions(row)"
                          :key="action.id"
                          @click="handleRowAction(action, row)"
                          :disabled="action.disabled"
                          class="dropdown-action-item"
                        >
                          <Icon v-if="action.icon" :name="action.icon" class="w-4 h-4 mr-2" />
                          {{ action.label }}
                        </button>
                      </template>
                    </Dropdown>
                  </slot>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Table Footer with Pagination -->
    <div v-if="showFooter" class="table-footer">
      
      
      <TablePagination
        :current-page="currentPageValue"
        :total-pages="totalPages"
        :page-size="pageSizeValue"
        :page-size-options="pageSizeOptions"
        :total-items="totalItems"
        :theme="theme"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, useSlots } from 'vue';
import { useResponsive } from '@/composables/useResponsive';
import TableHeader from './TableHeader.vue';
import TablePagination from './TablePagination.vue';
import TableSkeleton from './TableSkeleton.vue';
import EmptyState from '@/Components/States/EmptyState.vue';
import BaseCheckbox from '@/Components/Base/BaseCheckbox.vue';
import Icon from '@/Components/Base/Icon.vue';
import Dropdown from '@/Components/Dropdown.vue';

const props = defineProps({
  // Data
  data: {
    type: Array,
    default: () => []
  },
  
  columns: {
    type: Array,
    required: true,
    validator: (columns) => {
      return columns.every(col => 
        typeof col === 'object' && 
        col.key && 
        col.label
      );
    }
  },
  
  // Configuration
  title: {
    type: String,
    default: ''
  },
  
  loading: {
    type: Boolean,
    default: false
  },
  
  // Pagination
  pageSize: {
    type: Number,
    default: 10
  },
  
  pageSizeOptions: {
    type: Array,
    default: () => [10, 25, 50, 100]
  },
  
  // Server-side pagination
  serverSidePagination: {
    type: Boolean,
    default: false
  },
  
  currentPage: {
    type: Number,
    default: 1
  },
  
  totalPages: {
    type: Number,
    default: 1
  },
  
  totalItems: {
    type: Number,
    default: 0
  },
  
  // Selection
  selectable: {
    type: Boolean,
    default: false
  },
  
  selectedRows: {
    type: Array,
    default: () => []
  },
  
  // Search and Filtering
  searchConfig: {
    type: Object,
    default: () => ({
      enabled: true,
      placeholder: 'Search...',
      fields: [] // Empty means search all columns
    })
  },
  
  filterConfig: {
    type: Object,
    default: () => ({
      enabled: true,
      filters: []
    })
  },
  
  // Actions
  headerActions: {
    type: Array,
    default: () => []
  },
  
  rowActions: {
    type: [Array, Function],
    default: () => []
  },
  
  // Styling
  striped: {
    type: Boolean,
    default: true
  },
  
  bordered: {
    type: Boolean,
    default: true
  },
  
  hoverable: {
    type: Boolean,
    default: true
  },
  
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // Display Options
  showHeader: {
    type: Boolean,
    default: true
  },
  
  showFooter: {
    type: Boolean,
    default: true
  },
  
  skeletonRows: {
    type: Number,
    default: 5
  },
  
  // Empty State
  emptyState: {
    type: Object,
    default: () => ({
      title: 'No data available',
      description: 'There are no items to display.',
      icon: 'table',
      actions: []
    })
  },
  
  // Row Key
  rowKey: {
    type: [String, Function],
    default: 'id'
  },
  
  // Theme Control
  theme: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'dark', 'auto'].includes(value)
  }
});

const emit = defineEmits([
  'search',
  'filter', 
  'sort',
  'page-change',
  'page-size-change',
  'row-click',
  'row-action',
  'header-action',
  'selection-change'
]);

// Composables
const { isMobile, isTablet } = useResponsive();
const slots = useSlots();

// Local state
const currentPage = ref(1);
const currentPageSize = ref(props.pageSize);
const searchQuery = ref('');
const activeFilters = ref({});
const sortConfig = ref({
  key: null,
  direction: null
});

// Computed properties
const tableClasses = computed(() => [
  'data-table',
  `table-${props.size}`,
  {
    'table-striped': props.striped,
    'table-bordered': props.bordered,
    'table-hoverable': props.hoverable,
    'table-mobile': isMobile.value
  }
]);

const hasRowActions = computed(() => {
  return props.rowActions.length > 0 || !!slots['row-actions'];
});

// Search and filter logic
const filteredData = computed(() => {
  // For server-side pagination, return data as-is (filtering/searching handled by server)
  if (props.serverSidePagination) {
    return [...props.data];
  }
  
  // For client-side pagination, apply filtering and searching
  let result = [...props.data];
  
  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    const searchFields = props.searchConfig.fields.length 
      ? props.searchConfig.fields 
      : props.columns.map(col => col.key);
    
    result = result.filter(row => {
      return searchFields.some(field => {
        const value = getCellValue(row, field);
        return String(value).toLowerCase().includes(query);
      });
    });
  }
  
  // Apply filters
  Object.entries(activeFilters.value).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      result = result.filter(row => {
        const cellValue = getCellValue(row, key);
        if (Array.isArray(value)) {
          return value.includes(cellValue);
        }
        return cellValue === value;
      });
    }
  });
  
  // Apply sorting
  if (sortConfig.value.key) {
    result.sort((a, b) => {
      const aValue = getCellValue(a, sortConfig.value.key);
      const bValue = getCellValue(b, sortConfig.value.key);
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return sortConfig.value.direction === 'desc' ? -comparison : comparison;
    });
  }
  
  return result;
});

// Pagination logic
const totalItems = computed(() => {
  return props.serverSidePagination ? props.totalItems : filteredData.value.length;
});

const totalPages = computed(() => {
  return props.serverSidePagination ? props.totalPages : Math.ceil(totalItems.value / currentPageSize.value);
});

const currentPageValue = computed(() => {
  return props.serverSidePagination ? props.currentPage : currentPage.value;
});

const pageSizeValue = computed(() => {
  return props.serverSidePagination ? props.pageSize : currentPageSize.value;
});

const startIndex = computed(() => {
  return (currentPageValue.value - 1) * pageSizeValue.value;
});

const endIndex = computed(() => {
  return Math.min(startIndex.value + pageSizeValue.value, totalItems.value);
});

const paginatedData = computed(() => {
  // For server-side pagination, use the data as-is (already paginated by server)
  if (props.serverSidePagination) {
    return filteredData.value;
  }
  // For client-side pagination, slice the data
  return filteredData.value.slice(startIndex.value, startIndex.value + currentPageSize.value);
});

// Selection logic
const isAllSelected = computed(() => {
  return props.selectable && 
         paginatedData.value.length > 0 && 
         paginatedData.value.every(row => isRowSelected(row));
});

const isPartiallySelected = computed(() => {
  return props.selectable && 
         props.selectedRows.length > 0 && 
         !isAllSelected.value;
});

// Methods
const getCellValue = (row, key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row);
};

const formatCellValue = (value, column) => {
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value);
  }
  
  if (value === null || value === undefined) {
    return '-';
  }
  
  return String(value);
};

const getRowKey = (row, index) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index);
  }
  return getCellValue(row, props.rowKey) || index;
};

const getColumnClasses = (column) => [
  'table-column',
  `column-${column.key}`,
  {
    'sortable': column.sortable,
    'sorted': sortConfig.value.key === column.key,
    'text-left': !column.align || column.align === 'left',
    'text-center': column.align === 'center',
    'text-right': column.align === 'right',
    'sticky-column': column.sticky
  }
];

const getColumnStyles = (column) => {
  const styles = {};
  
  // Handle explicit width specifications first
  if (column.width) {
    styles.width = column.width;
    styles.minWidth = column.minWidth || column.width;
    styles.maxWidth = column.maxWidth || column.width;
    return styles;
  }
  
  // Handle flex-based system
  if (column.flex) {
    const totalFlexUnits = props.columns
      .filter(col => col.flex)
      .reduce((sum, col) => sum + parseFloat(col.flex), 0);
    
    if (totalFlexUnits > 0) {
      const percentage = (parseFloat(column.flex) / totalFlexUnits) * 100;
      styles.width = `${percentage}%`;
      styles.maxWidth = `${percentage}%`;
    }
    
    styles.minWidth = column.minWidth || '120px';
    // Force strict width constraints for flex columns
    styles.overflow = 'hidden';
    styles.textOverflow = 'ellipsis';
    styles.whiteSpace = 'nowrap';
    return styles;
  }
  
  // Handle minWidth only
  if (column.minWidth) {
    styles.minWidth = column.minWidth;
    styles.width = 'auto';
    styles.maxWidth = column.maxWidth;
    return styles;
  }
  
  // Improved column width distribution to prevent large gaps
  const columnIndex = props.columns.indexOf(column);
  const totalColumns = props.columns.length;
  
  // Use a more balanced approach for column widths
  // Name column - needs space for avatar + text but not excessive
  if (columnIndex === 0 || column.key === 'name') {
    styles.width = '25%';
    styles.minWidth = '180px';
    styles.maxWidth = '300px';
  }
  // Email column - flexible but constrained
  else if (column.key === 'email') {
    styles.width = '30%';
    styles.minWidth = '200px';
    styles.maxWidth = '350px';
  }
  // Department, job title - medium width
  else if (['department', 'job_title', 'contract_type'].includes(column.key)) {
    styles.width = '20%';
    styles.minWidth = '140px';
    styles.maxWidth = '200px';
  }
  // Date columns - compact
  else if (column.key.includes('date') || column.key.includes('time')) {
    styles.width = '15%';
    styles.minWidth = '120px';
    styles.maxWidth = '160px';
  }
  // Default columns - distribute remaining space evenly
  else {
    // Calculate remaining width after name (25%) and email (30%) columns
    const nameWidth = 25;
    const emailWidth = 30;
    const departmentWidth = 20; // For department columns
    
    // Count different column types
    const nameColumns = props.columns.filter((col, idx) => idx === 0 || col.key === 'name').length;
    const emailColumns = props.columns.filter(col => col.key === 'email').length;
    const departmentColumns = props.columns.filter(col => ['department', 'job_title', 'contract_type'].includes(col.key)).length;
    const dateColumns = props.columns.filter(col => col.key.includes('date') || col.key.includes('time')).length;
    
    // Calculate used width
    const usedWidth = (nameColumns * nameWidth) + (emailColumns * emailWidth) + (departmentColumns * departmentWidth) + (dateColumns * 15);
    const remainingColumns = totalColumns - nameColumns - emailColumns - departmentColumns - dateColumns;
    const remainingWidth = Math.max(100 - usedWidth, 15);
    const columnWidth = remainingColumns > 0 ? remainingWidth / remainingColumns : 15;
    
    styles.width = `${Math.max(columnWidth, 15)}%`;
    styles.minWidth = '120px';
    styles.maxWidth = '200px';
  }
  
  if (column.maxWidth) {
    styles.maxWidth = column.maxWidth;
  }
  
  return styles;
};

const getRowClasses = (row, index) => [
  'table-row',
  {
    'row-selected': isRowSelected(row),
    'row-clickable': !!props.onRowClick,
    'row-even': index % 2 === 0,
    'row-odd': index % 2 === 1
  }
];

const getCellClasses = (column, row) => [
  'table-cell',
  `cell-${column.key}`,
  {
    'text-left': !column.align || column.align === 'left',
    'text-center': column.align === 'center',
    'text-right': column.align === 'right'
  }
];

const isRowSelected = (row) => {
  const rowKey = getRowKey(row);
  return props.selectedRows.some(selectedRow => getRowKey(selectedRow) === rowKey);
};

const getRowActions = (row) => {
  if (typeof props.rowActions === 'function') {
    return props.rowActions(row);
  }
  return props.rowActions;
};

// Event handlers
const handleSearch = (query) => {
  searchQuery.value = query;
  currentPage.value = 1;
  emit('search', query);
};

const handleFilter = (filters) => {
  activeFilters.value = { ...filters };
  currentPage.value = 1;
  emit('filter', filters);
};

const handleSort = (column) => {
  if (!column.sortable) return;
  
  let direction = 'asc';
  if (sortConfig.value.key === column.key) {
    direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc';
  }
  
  sortConfig.value = {
    key: column.key,
    direction
  };
  
  emit('sort', { key: column.key, direction });
};

const handlePageChange = (page) => {
  currentPage.value = page;
  emit('page-change', page);
};

const handlePageSizeChange = (size) => {
  // For server-side pagination, don't update local state - let the parent handle it
  if (!props.serverSidePagination) {
    currentPageSize.value = size;
    currentPage.value = 1;
  }
  
  emit('page-size-change', size);
};

const handleRowClick = (row, event) => {
  if (event.target.closest('.select-column, .actions-column')) {
    return; // Don't trigger row click for selection or actions
  }
  emit('row-click', row);
};

const handleRowAction = (action, row) => {
  emit('row-action', { action, row });
};

const handleHeaderAction = (action) => {
  emit('header-action', action);
};

const toggleSelectAll = () => {
  const newSelection = isAllSelected.value 
    ? props.selectedRows.filter(row => !paginatedData.value.includes(row))
    : [...props.selectedRows, ...paginatedData.value.filter(row => !isRowSelected(row))];
  
  emit('selection-change', newSelection);
};

const toggleRowSelection = (row) => {
  const newSelection = isRowSelected(row)
    ? props.selectedRows.filter(selectedRow => getRowKey(selectedRow) !== getRowKey(row))
    : [...props.selectedRows, row];
  
  emit('selection-change', newSelection);
};

// Watchers
watch(() => props.data, () => {
  currentPage.value = 1;
});

watch(() => filteredData.value.length, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value);
  }
});
</script>

<style scoped>
/* DataTable Component - Theme Independent with CSS Custom Properties */
.data-table-container {
  /* Set component-level CSS custom properties for light theme */
  --dt-bg-primary: #ffffff;
  --dt-bg-secondary: #fafafa;
  --dt-border-color: #e5e5e5;
  --dt-text-primary: #111827;
  --dt-text-secondary: #6b7280;
  --dt-text-muted: #9ca3af;
  
  /* Apply light theme as component default */
  background-color: var(--dt-bg-primary);
  border: 1px solid var(--dt-border-color);
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  overflow: hidden;
  color: var(--dt-text-primary);
  
  /* Isolate from global theme inheritance */
  isolation: isolate;
}

/* Child components inherit theme from DataTable container */

/* Theme variants - only applied when explicitly set */
.data-table-container[data-theme="light"] {
  background-color: #ffffff;
  border-color: #e5e5e5;
  color: #111827;
}

.data-table-container[data-theme="dark"] {
  background-color: #262626;
  border-color: #404040;
  color: #e5e5e5;
}

.table-wrapper {
  @apply relative;
}

.table-wrapper.loading {
  @apply opacity-75;
}

.table-scroll-container {
  @apply overflow-x-auto;
  width: 100%;
}

.data-table {
  @apply w-full;
  table-layout: fixed; /* Use fixed layout for consistent column widths */
  min-width: 100%;
  width: 100%; /* Full width to prevent gaps */
  border-collapse: collapse; /* Ensure no spacing between cells */
  /* Force table to behave more strictly */
  display: table;
  table-layout: fixed !important;
}

/* Flexible column widths - smart content handling */
.table-head th,
.table-body td {
  /* Force columns to respect their calculated widths */
  word-wrap: break-word;
  word-break: normal;
  hyphens: auto;
  white-space: normal;
  overflow: hidden !important; /* Prevent content from expanding beyond column width */
  position: relative;
  /* Force width constraints */
  box-sizing: border-box;
  max-width: 0 !important; /* This forces the table to respect the width calculations */
  /* Additional constraints to force table behavior */
  vertical-align: top;
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
}

/* Force all cell content to respect column boundaries */
.table-head th > *,
.table-body td > * {
  max-width: 100%;
  overflow: hidden;
}

/* Specifically target flex containers in cells */
.table-body td .flex {
  max-width: 100%;
  min-width: 0;
  width: 100%;
}

/* Force flex children to respect boundaries */
.table-body td .flex > * {
  min-width: 0;
  max-width: 100%;
}

/* Specifically handle the name cell flex layout */
.table-body td .flex .flex-1 {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

/* Ensure text content in flex containers is constrained */
.table-body td .flex .truncate {
  max-width: 100%;
}

/* Cell content styling */
.cell-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-width: 100%;
}

/* Email column - show full content without truncation */
.cell-email .cell-value {
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
  min-width: 250px;
}

/* Name column - show full content for avatar + name */
.cell-name .cell-value {
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
  min-width: 200px;
}

/* Remove conflicting CSS - let JavaScript handle column widths */

/* Modern Table Header - Default light theme */
.table-head {
  @apply bg-white border-b border-neutral-200;
}

/* Theme-aware table header */
.data-table-container[data-theme="light"] .table-head,
.data-table-container:not([data-theme="dark"]) .table-head {
  @apply bg-white border-b border-neutral-200;
}

.data-table-container[data-theme="dark"] .table-head {
  @apply bg-neutral-900 border-b border-neutral-700;
}

.table-head th {
  @apply px-6 py-4 text-left text-sm font-semibold text-neutral-900;
  @apply whitespace-nowrap;
  letter-spacing: -0.025em;
}

/* Theme-aware table header cells */
.data-table-container[data-theme="light"] .table-head th,
.data-table-container:not([data-theme="dark"]) .table-head th {
  @apply text-neutral-900;
}

.data-table-container[data-theme="dark"] .table-head th {
  @apply text-neutral-400;
}

.table-head th.text-center {
  text-align: center;
}

.table-head th.text-right {
  text-align: right;
}

.column-header {
  @apply flex items-center justify-between;
}

.sortable .column-header {
  @apply cursor-pointer select-none;
}

.sortable:hover .column-header {
  @apply text-neutral-700;
}

.sort-indicator {
  @apply ml-2 flex-shrink-0;
}

.sort-icon {
  @apply w-4 h-4 text-neutral-400;
}

.sort-icon.active {
  @apply text-neutral-600;
}

/* Table Body - Default light theme */
.table-body {
  @apply bg-white divide-y divide-neutral-200;
}

/* Theme-aware table body */
.data-table-container[data-theme="light"] .table-body,
.data-table-container:not([data-theme="dark"]) .table-body {
  @apply bg-white divide-y divide-neutral-200;
}

.data-table-container[data-theme="dark"] .table-body {
  @apply bg-neutral-800 divide-neutral-700;
}

.table-row {
  @apply transition-colors duration-150;
}

.table-hoverable .table-row:hover {
  @apply bg-neutral-50;
}

.table-hoverable .table-row:hover {
  @apply bg-neutral-50;
}

.table-striped .table-row:nth-child(even) {
  @apply bg-neutral-50;
}

.row-selected {
  @apply bg-primary-50 border-primary-200;
}

.row-clickable {
  @apply cursor-pointer;
}

.table-cell {
  @apply px-6 py-4 text-sm text-neutral-900;
  @apply overflow-hidden;
  line-height: 1.5;
}

/* Theme-aware table cells */
.data-table-container[data-theme="light"] .table-cell,
.data-table-container:not([data-theme="dark"]) .table-cell {
  @apply text-neutral-900;
}

.data-table-container[data-theme="dark"] .table-cell {
  @apply text-neutral-200;
}

.table-cell.text-center {
  text-align: center;
}

.table-cell.text-right {
  text-align: right;
}

.cell-content {
  @apply flex items-center;
  @apply min-w-0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  /* Force content to respect column boundaries */
  flex-shrink: 1;
  flex-grow: 0;
}

.table-cell.text-center .cell-content {
  @apply justify-center;
}

.table-cell.text-right .cell-content {
  @apply justify-end;
}

.cell-value {
  width: 100%;
  display: block;
  min-width: 0;
}

/* Special Columns */
.select-column {
  @apply w-12 px-4 py-3;
}

.actions-column {
  @apply w-16 px-4 py-3;
}

.row-actions {
  @apply flex justify-end;
}

.action-trigger {
  @apply p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500;
}

/* Table Footer - Default light theme */
.table-footer {
  @apply flex items-center justify-between px-4 py-3 bg-neutral-50 border-t border-neutral-200;
}

/* Theme-aware table footer */
.data-table-container[data-theme="light"] .table-footer,
.data-table-container:not([data-theme="dark"]) .table-footer {
  @apply bg-neutral-50 border-t border-neutral-200;
}

.data-table-container[data-theme="dark"] .table-footer {
  @apply bg-neutral-900 border-t border-neutral-700;
}

.footer-info {
  @apply flex items-center space-x-4 text-sm text-neutral-700;
}

/* Theme-aware footer info */
.data-table-container[data-theme="light"] .footer-info,
.data-table-container:not([data-theme="dark"]) .footer-info {
  @apply text-neutral-700;
}

.data-table-container[data-theme="dark"] .footer-info {
  @apply text-neutral-400;
}

.selection-info {
  @apply text-primary-600 font-medium;
}

/* Size Variants */
.table-sm .table-cell,
.table-sm .table-head th {
  @apply px-3 py-2 text-xs;
}

.table-lg .table-cell,
.table-lg .table-head th {
  @apply px-6 py-4 text-base;
}

/* Responsive Design - HFI Principles */
@media (max-width: 1200px) {
  /* Hide medium priority columns on smaller screens */
  .table-head th[data-priority="medium"],
  .table-body td[data-priority="medium"] {
    display: none;
  }
}

@media (max-width: 768px) {
  /* Hide low priority columns on tablets */
  .table-head th[data-priority="low"],
  .table-body td[data-priority="low"] {
    display: none;
  }
  
  .data-table {
    font-size: 0.875rem;
  }
  
  .table-cell {
    @apply px-3 py-2;
  }
  
  .table-head th {
    @apply px-3 py-2 text-xs;
  }
}

@media (max-width: 640px) {
  /* Mobile optimization */
  .table-mobile {
    @apply text-xs;
  }
  
  .table-mobile .table-cell,
  .table-mobile .table-head th {
    @apply px-2 py-2;
  }
  
  .column-header {
    @apply flex-col items-start space-y-1;
  }
  
  .sort-indicator {
    @apply ml-0;
  }
  
  /* Stack layout for very small screens */
  .data-table-container {
    @apply overflow-x-auto;
  }
  
  .data-table {
    min-width: 600px; /* Ensure minimum readable width */
  }
}

/* Dropdown Actions */
.dropdown-action-item {
  @apply block w-full px-4 py-2 text-left text-sm text-neutral-700;
  @apply hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none;
  @apply transition-colors duration-150 ease-in-out;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Component-level theme control - no global theme dependencies */

/* Fallback styles for missing or corrupted theme classes */
.data-table-container:not([class*="theme-"]) {
  /* Force light theme when no theme class is detected */
  @apply bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden;
}

.table-head:not([class*="theme-"]) {
  /* Force light theme for table header when no theme class is detected */
  @apply bg-white border-b border-neutral-200;
}

.table-head:not([class*="theme-"]) th {
  @apply text-neutral-900;
}

.table-body:not([class*="theme-"]) {
  /* Force light theme for table body when no theme class is detected */
  @apply bg-white divide-y divide-neutral-200;
}

.table-cell:not([class*="theme-"]) {
  @apply text-neutral-900;
}

.table-footer:not([class*="theme-"]) {
  /* Force light theme for table footer when no theme class is detected */
  @apply bg-neutral-50 border-t border-neutral-200;
}

.footer-info:not([class*="theme-"]) {
  @apply text-neutral-700;
}

/* Clean fallback - no overrides needed with proper component isolation */
</style>