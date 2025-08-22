<template>
  <div class="data-table-container">
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
  
  // Theme Control - FORCE LIGHT THEME ALWAYS
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
  console.log("Testing");
  console.log(row, key);

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
  
  // Handle flex-based system properly
  if (column.flex) {
    const totalFlexUnits = props.columns
      .filter(col => col.flex)
      .reduce((sum, col) => sum + parseFloat(col.flex), 0);
    
    if (totalFlexUnits > 0) {
      const percentage = (parseFloat(column.flex) / totalFlexUnits) * 100;
      styles.width = `${percentage}%`;
    }
    
    styles.minWidth = column.minWidth || '120px';
    return styles;
  }
  
  // Handle minWidth only
  if (column.minWidth) {
    styles.minWidth = column.minWidth;
    styles.width = 'auto';
    styles.maxWidth = column.maxWidth;
    return styles;
  }
  
  // Default auto-sizing for columns without specific configuration
  styles.width = 'auto';
  styles.minWidth = '120px';
  
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
/* DataTable Component - Clean Design System Implementation */
.data-table-container {
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

/* Theme-aware container */
.theme-light .data-table-container {
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-900);
}

.theme-dark .data-table-container {
  background-color: var(--color-neutral-900);
  color: var(--color-neutral-50);
  border-color: var(--color-neutral-700);
}

.table-wrapper {
  position: relative;
}

.table-wrapper.loading {
  opacity: 0.75;
}

.table-scroll-container {
  overflow-x: auto;
  width: 100%;
}

/* Clean table layout using design system */
.data-table {
  width: 100%;
  table-layout: auto;
  border-collapse: collapse;
}

/* Table header using design tokens */
.table-head {
  background-color: var(--color-neutral-100);
  border-bottom: 1px solid var(--color-neutral-200);
}

.theme-dark .table-head {
  background-color: var(--color-neutral-800);
  border-bottom-color: var(--color-neutral-700);
}

.table-head th {
  padding: var(--spacing-4) var(--spacing-6);
  text-align: left;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  white-space: nowrap;
}

.theme-dark .table-head th {
  color: var(--color-neutral-100);
}

/* Table body using design tokens */
.table-body {
  background-color: var(--color-neutral-50);
}

.theme-dark .table-body {
  background-color: var(--color-neutral-900);
}

.table-body tr {
  border-bottom: 1px solid var(--color-neutral-200);
}

.theme-dark .table-body tr {
  border-bottom-color: var(--color-neutral-700);
}

.table-body tr:hover {
  background-color: var(--color-neutral-100);
}

.theme-dark .table-body tr:hover {
  background-color: var(--color-neutral-800);
}

/* Table cells using design tokens */
.table-cell {
  padding: var(--spacing-4) var(--spacing-6);
  font-size: var(--text-sm);
  color: var(--color-neutral-900);
  line-height: var(--leading-relaxed);
  vertical-align: top;
}

.theme-dark .table-cell {
  color: var(--color-neutral-100);
}

/* Cell content - clean and simple */
.cell-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-width: 0;
}

.cell-value {
  line-height: var(--leading-normal);
  color: var(--color-neutral-900);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.theme-dark .cell-value {
  color: var(--color-neutral-100);
}

/* Column header styling */
.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sortable .column-header {
  cursor: pointer;
  user-select: none;
}

.sortable:hover .column-header {
  color: var(--color-neutral-700);
}

.theme-dark .sortable:hover .column-header {
  color: var(--color-neutral-300);
}

.sort-indicator {
  margin-left: var(--spacing-2);
  flex-shrink: 0;
}

.sort-icon {
  width: 16px;
  height: 16px;
  color: var(--color-neutral-400);
}

.sort-icon.active {
  color: var(--color-neutral-600);
}

.theme-dark .sort-icon.active {
  color: var(--color-neutral-400);
}

/* Table row styling */
.table-row {
  transition: background-color var(--duration-fast) var(--easing-ease-out);
}

.table-hoverable .table-row:hover {
  background-color: var(--color-neutral-100);
}

.theme-dark .table-hoverable .table-row:hover {
  background-color: var(--color-neutral-800);
}

.table-striped .table-row:nth-child(even) {
  background-color: var(--color-neutral-50);
}

.theme-dark .table-striped .table-row:nth-child(even) {
  background-color: var(--color-neutral-850);
}

.row-selected {
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-200);
}

.theme-dark .row-selected {
  background-color: var(--color-primary-900);
  border-color: var(--color-primary-700);
}

.row-clickable {
  cursor: pointer;
}

/* Text alignment */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-center .cell-content {
  justify-content: center;
}

.text-right .cell-content {
  justify-content: flex-end;
}

/* Special columns */
.select-column {
  width: 48px;
  padding: var(--spacing-3) var(--spacing-4);
}

.actions-column {
  width: 64px;
  padding: var(--spacing-3) var(--spacing-4);
}

.row-actions {
  display: flex;
  justify-content: flex-end;
}

.action-trigger {
  padding: var(--spacing-1);
  border-radius: var(--radius-md);
  color: var(--color-neutral-400);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.action-trigger:hover {
  color: var(--color-neutral-600);
  background-color: var(--color-neutral-100);
}

.theme-dark .action-trigger:hover {
  color: var(--color-neutral-300);
  background-color: var(--color-neutral-800);
}

.action-trigger:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary-500);
}

/* Table footer */
.table-footer {
  background-color: var(--color-neutral-100);
  border-top: 1px solid var(--color-neutral-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-6);
}

.theme-dark .table-footer {
  background-color: var(--color-neutral-800);
  border-top-color: var(--color-neutral-700);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

.theme-dark .footer-info {
  color: var(--color-neutral-400);
}

.selection-info {
  color: var(--color-primary-600);
  font-weight: 500;
}

/* Size Variants */
.table-sm .table-cell,
.table-sm .table-head th {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--text-xs);
}

.table-lg .table-cell,
.table-lg .table-head th {
  padding: var(--spacing-6) var(--spacing-8);
  font-size: var(--text-base);
}

/* Responsive Design */
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
    font-size: var(--text-sm);
  }
  
  .table-cell {
    padding: var(--spacing-2) var(--spacing-3);
  }
  
  .table-head th {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--text-xs);
  }
}

@media (max-width: 640px) {
  /* Mobile optimization */
  .table-mobile {
    font-size: var(--text-xs);
  }
  
  .table-mobile .table-cell,
  .table-mobile .table-head th {
    padding: var(--spacing-2);
  }
  
  .column-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-1);
  }
  
  .sort-indicator {
    margin-left: 0;
  }
  
  /* Stack layout for very small screens */
  .data-table-container {
    overflow-x: auto;
  }
  
  .data-table {
    min-width: 600px; /* Ensure minimum readable width */
  }
}

/* Dropdown Actions */
.dropdown-action-item {
  display: block;
  width: 100%;
  padding: var(--spacing-2) var(--spacing-4);
  text-align: left;
  font-size: var(--text-sm);
  color: var(--color-neutral-700);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.dropdown-action-item:hover,
.dropdown-action-item:focus {
  background-color: var(--color-neutral-100);
  outline: none;
}

.dropdown-action-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.theme-dark .dropdown-action-item {
  color: var(--color-neutral-300);
}

.theme-dark .dropdown-action-item:hover,
.theme-dark .dropdown-action-item:focus {
  background-color: var(--color-neutral-800);
}
</style>