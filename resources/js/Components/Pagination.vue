<template>
  <nav 
    :class="['pagination', props.class]"
    role="navigation"
    aria-label="Pagination Navigation"
    ref="paginationNav"
  >
    <!-- Pagination Info -->
    <div v-if="showInfo" class="pagination-info">
      <p class="pagination-info-text">
        Showing 
        <span class="pagination-info-number">{{ from }}</span>
        to 
        <span class="pagination-info-number">{{ to }}</span>
        of 
        <span class="pagination-info-number">{{ total }}</span>
        results
      </p>
    </div>

    <!-- Page Size Selector -->
    <div v-if="showPageSizeSelector" class="pagination-page-size">
      <label for="page-size-select" class="pagination-page-size-label">
        Show:
      </label>
      <select
        id="page-size-select"
        v-model="selectedPageSize"
        @change="handlePageSizeChange"
        class="pagination-page-size-select"
        :disabled="loading"
      >
        <option
          v-for="size in pageSizeOptions"
          :key="size"
          :value="size"
        >
          {{ size }}
        </option>
      </select>
      <span class="pagination-page-size-suffix">per page</span>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination-controls">
      <!-- First Page Button -->
      <button
        v-if="showFirstLast && currentPage > 1"
        @click="goToPage(1)"
        @keydown="handleKeydown($event, 1)"
        class="pagination-button pagination-button--first"
        :disabled="loading || currentPage === 1"
        :aria-label="'Go to first page'"
        ref="firstButton"
      >
        <Icon name="chevron-double-left" class="pagination-icon" />
        <span v-if="!compact" class="pagination-button-text">First</span>
      </button>

      <!-- Previous Page Button -->
      <button
        @click="goToPrevious"
        @keydown="handleKeydown($event, currentPage - 1)"
        class="pagination-button pagination-button--previous"
        :disabled="loading || !hasPrevious"
        :aria-label="'Go to previous page'"
        ref="previousButton"
      >
        <Icon name="chevron-left" class="pagination-icon" />
        <span v-if="!compact" class="pagination-button-text">Previous</span>
      </button>

      <!-- Page Numbers -->
      <div class="pagination-pages" role="group" aria-label="Page numbers">
        <template v-for="(page, index) in visiblePages" :key="page.label || index">
          <!-- Page Number Button -->
          <button
            v-if="page.type === 'page'"
            @click="goToPage(page.number)"
            @keydown="handleKeydown($event, page.number)"
            :class="getPageButtonClasses(page)"
            :disabled="loading || page.current"
            :aria-label="page.current ? `Current page, page ${page.number}` : `Go to page ${page.number}`"
            :aria-current="page.current ? 'page' : undefined"
            :ref="el => setPageButtonRef(el, page.number)"
          >
            {{ page.number }}
          </button>

          <!-- Ellipsis -->
          <span
            v-else-if="page.type === 'ellipsis'"
            class="pagination-ellipsis"
            aria-hidden="true"
          >
            ...
          </span>
        </template>
      </div>

      <!-- Next Page Button -->
      <button
        @click="goToNext"
        @keydown="handleKeydown($event, currentPage + 1)"
        class="pagination-button pagination-button--next"
        :disabled="loading || !hasNext"
        :aria-label="'Go to next page'"
        ref="nextButton"
      >
        <span v-if="!compact" class="pagination-button-text">Next</span>
        <Icon name="chevron-right" class="pagination-icon" />
      </button>

      <!-- Last Page Button -->
      <button
        v-if="showFirstLast && currentPage < lastPage"
        @click="goToPage(lastPage)"
        @keydown="handleKeydown($event, lastPage)"
        class="pagination-button pagination-button--last"
        :disabled="loading || currentPage === lastPage"
        :aria-label="'Go to last page'"
        ref="lastButton"
      >
        <span v-if="!compact" class="pagination-button-text">Last</span>
        <Icon name="chevron-double-right" class="pagination-icon" />
      </button>
    </div>

    <!-- Jump to Page -->
    <div v-if="showJumpToPage" class="pagination-jump">
      <label for="jump-to-page" class="pagination-jump-label">
        Go to page:
      </label>
      <input
        id="jump-to-page"
        v-model.number="jumpToPageValue"
        @keydown="handleJumpKeydown"
        @blur="handleJumpBlur"
        type="number"
        :min="1"
        :max="lastPage"
        class="pagination-jump-input"
        :disabled="loading"
        placeholder="Page"
      />
      <button
        @click="handleJumpToPage"
        class="pagination-jump-button"
        :disabled="loading || !isValidJumpPage"
        aria-label="Jump to specified page"
      >
        Go
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="pagination-loading">
      <Icon name="spinner" class="pagination-loading-icon animate-spin" />
      <span class="pagination-loading-text">Loading...</span>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  // Laravel pagination data
  links: {
    type: Array,
    default: () => []
  },
  
  // Alternative props for custom pagination
  currentPage: {
    type: Number,
    default: 1
  },
  
  lastPage: {
    type: Number,
    default: 1
  },
  
  total: {
    type: Number,
    default: 0
  },
  
  perPage: {
    type: Number,
    default: 15
  },
  
  from: {
    type: Number,
    default: 0
  },
  
  to: {
    type: Number,
    default: 0
  },
  
  // Display options
  showInfo: {
    type: Boolean,
    default: true
  },
  
  showPageSizeSelector: {
    type: Boolean,
    default: true
  },
  
  showFirstLast: {
    type: Boolean,
    default: true
  },
  
  showJumpToPage: {
    type: Boolean,
    default: false
  },
  
  compact: {
    type: Boolean,
    default: false
  },
  
  // Page size options
  pageSizeOptions: {
    type: Array,
    default: () => [10, 15, 25, 50, 100]
  },
  
  // Maximum visible page numbers
  maxVisiblePages: {
    type: Number,
    default: 7
  },
  
  // Loading state
  loading: {
    type: Boolean,
    default: false
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['page-change', 'page-size-change', 'update:currentPage', 'update:perPage']);

// Template refs
const paginationNav = ref(null);
const firstButton = ref(null);
const previousButton = ref(null);
const nextButton = ref(null);
const lastButton = ref(null);
const pageButtonRefs = ref({});

// Local state
const selectedPageSize = ref(props.perPage);
const jumpToPageValue = ref('');
const focusedPageIndex = ref(-1);

// Computed properties
const parsedData = computed(() => {
  // If using Laravel pagination links
  if (props.links && props.links.length > 0) {
    const prevLink = props.links.find(link => link.label === '&laquo; Previous');
    const nextLink = props.links.find(link => link.label === 'Next &raquo;');
    const pageLinks = props.links.filter(link => 
      link.label !== '&laquo; Previous' && 
      link.label !== 'Next &raquo;' &&
      !isNaN(parseInt(link.label))
    );
    
    const currentPageLink = pageLinks.find(link => link.active);
    const currentPageNum = currentPageLink ? parseInt(currentPageLink.label) : 1;
    const lastPageNum = pageLinks.length > 0 ? parseInt(pageLinks[pageLinks.length - 1].label) : 1;
    
    return {
      currentPage: currentPageNum,
      lastPage: lastPageNum,
      hasPrevious: !!prevLink?.url,
      hasNext: !!nextLink?.url,
      previousUrl: prevLink?.url,
      nextUrl: nextLink?.url,
      total: props.total,
      from: props.from,
      to: props.to,
      perPage: props.perPage
    };
  }
  
  // Use direct props
  return {
    currentPage: props.currentPage,
    lastPage: props.lastPage,
    hasPrevious: props.currentPage > 1,
    hasNext: props.currentPage < props.lastPage,
    total: props.total,
    from: props.from,
    to: props.to,
    perPage: props.perPage
  };
});

// Computed properties for template access
const currentPage = computed(() => parsedData.value.currentPage);
const lastPage = computed(() => parsedData.value.lastPage);
const hasPrevious = computed(() => parsedData.value.hasPrevious);
const hasNext = computed(() => parsedData.value.hasNext);
const total = computed(() => parsedData.value.total);
const from = computed(() => parsedData.value.from);
const to = computed(() => parsedData.value.to);

const visiblePages = computed(() => {
  const pages = [];
  const current = parsedData.value.currentPage;
  const last = parsedData.value.lastPage;
  const maxVisible = props.maxVisiblePages;
  
  if (last <= maxVisible) {
    // Show all pages if total pages is less than max visible
    for (let i = 1; i <= last; i++) {
      pages.push({
        type: 'page',
        number: i,
        current: i === current
      });
    }
  } else {
    // Complex pagination logic
    const sidePages = Math.floor((maxVisible - 3) / 2); // Reserve space for first, last, and ellipsis
    
    // Always show first page
    pages.push({
      type: 'page',
      number: 1,
      current: current === 1
    });
    
    let startPage, endPage;
    
    if (current <= sidePages + 2) {
      // Near the beginning
      startPage = 2;
      endPage = Math.min(maxVisible - 1, last - 1);
    } else if (current >= last - sidePages - 1) {
      // Near the end
      startPage = Math.max(2, last - maxVisible + 2);
      endPage = last - 1;
    } else {
      // In the middle
      startPage = current - sidePages;
      endPage = current + sidePages;
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push({ type: 'ellipsis' });
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push({
        type: 'page',
        number: i,
        current: i === current
      });
    }
    
    // Add ellipsis before last page if needed
    if (endPage < last - 1) {
      pages.push({ type: 'ellipsis' });
    }
    
    // Always show last page (if not already shown)
    if (last > 1) {
      pages.push({
        type: 'page',
        number: last,
        current: current === last
      });
    }
  }
  
  return pages;
});

const isValidJumpPage = computed(() => {
  const page = parseInt(jumpToPageValue.value);
  return page >= 1 && page <= parsedData.value.lastPage && page !== parsedData.value.currentPage;
});

// Methods
const setPageButtonRef = (el, pageNumber) => {
  if (el) {
    pageButtonRefs.value[pageNumber] = el;
  }
};

const goToPage = (page) => {
  if (page < 1 || page > parsedData.value.lastPage || page === parsedData.value.currentPage) {
    return;
  }
  
  //console.log('goToPage called with:', page);
  
  // Emit the event first
  emit('page-change', page);
  emit('update:currentPage', page);
  
  // Try multiple navigation strategies
  let navigationSuccess = false;
  
  // Strategy 1: Use Laravel pagination links
  if (props.links && props.links.length > 0) {
    const pageLink = props.links.find(link => parseInt(link.label) === page);
    //console.log('Found pageLink:', pageLink);
    
    if (pageLink?.url) {
      //console.log('Strategy 1: Using Laravel link:', pageLink.url);
      router.get(pageLink.url);
      navigationSuccess = true;
    }
  }
  
  // Strategy 2: Manual URL construction if Strategy 1 failed
  if (!navigationSuccess) {
    //console.log('Strategy 2: Manual URL construction');
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page', page);
    const newUrl = `${currentPath}?${searchParams.toString()}`;
    //console.log('Navigating to:', newUrl);
    router.get(newUrl);
  }
};

const goToPrevious = () => {
  if (parsedData.value.hasPrevious) {
    if (parsedData.value.previousUrl) {
      router.get(parsedData.value.previousUrl);
    } else {
      goToPage(parsedData.value.currentPage - 1);
    }
  }
};

const goToNext = () => {
  if (parsedData.value.hasNext) {
    if (parsedData.value.nextUrl) {
      router.get(parsedData.value.nextUrl);
    } else {
      goToPage(parsedData.value.currentPage + 1);
    }
  }
};

const handlePageSizeChange = () => {
  emit('page-size-change', selectedPageSize.value);
  emit('update:perPage', selectedPageSize.value);
  
  // Reset to first page when changing page size
  goToPage(1);
};

const handleJumpToPage = () => {
  if (isValidJumpPage.value) {
    goToPage(parseInt(jumpToPageValue.value));
    jumpToPageValue.value = '';
  }
};

const handleJumpKeydown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleJumpToPage();
  }
};

const handleJumpBlur = () => {
  // Clear invalid values on blur
  if (!isValidJumpPage.value) {
    jumpToPageValue.value = '';
  }
};

const handleKeydown = (event, targetPage) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      goToPage(targetPage);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      if (parsedData.value.hasPrevious) {
        goToPrevious();
      }
      break;
    case 'ArrowRight':
      event.preventDefault();
      if (parsedData.value.hasNext) {
        goToNext();
      }
      break;
    case 'Home':
      event.preventDefault();
      goToPage(1);
      break;
    case 'End':
      event.preventDefault();
      goToPage(parsedData.value.lastPage);
      break;
  }
};

const getPageButtonClasses = (page) => [
  'pagination-page-button',
  {
    'pagination-page-button--current': page.current,
    'pagination-page-button--hover': !page.current
  }
];

// Watchers
watch(() => props.perPage, (newValue) => {
  selectedPageSize.value = newValue;
});

// Focus management for accessibility
const focusCurrentPage = async () => {
  await nextTick();
  const currentPageButton = pageButtonRefs.value[parsedData.value.currentPage];
  if (currentPageButton) {
    currentPageButton.focus();
  }
};

defineExpose({
  goToPage,
  goToPrevious,
  goToNext,
  focusCurrentPage
});
</script>
<style 
scoped>
.pagination {
  @apply flex flex-col sm:flex-row items-center justify-between gap-4 p-4;
  @apply bg-white border border-neutral-200 rounded-lg shadow-sm;
}

/* Pagination Info */
.pagination-info {
  @apply flex-shrink-0;
}

.pagination-info-text {
  @apply text-sm text-neutral-600;
}

.pagination-info-number {
  @apply font-medium text-neutral-900;
}

/* Page Size Selector */
.pagination-page-size {
  @apply flex items-center gap-2 text-sm;
}

.pagination-page-size-label {
  @apply text-neutral-600 font-medium;
}

.pagination-page-size-select {
  @apply px-3 py-1.5 border border-neutral-300 rounded-md;
  @apply bg-white text-neutral-900 text-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors duration-200;
}

.pagination-page-size-suffix {
  @apply text-neutral-600;
}

/* Pagination Controls */
.pagination-controls {
  @apply flex items-center gap-1;
}

.pagination-button {
  @apply inline-flex items-center gap-2 px-3 py-2;
  @apply text-sm font-medium text-neutral-700;
  @apply bg-white border border-neutral-300 rounded-md;
  @apply hover:bg-neutral-50 hover:text-neutral-900;
  @apply focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white;
  @apply transition-all duration-200;
}

.pagination-button--first,
.pagination-button--last {
  @apply hidden sm:inline-flex;
}

.pagination-icon {
  @apply w-4 h-4 flex-shrink-0;
}

.pagination-button-text {
  @apply hidden sm:inline;
}

/* Page Numbers */
.pagination-pages {
  @apply flex items-center gap-1 mx-2;
}

.pagination-page-button {
  @apply inline-flex items-center justify-center w-10 h-10;
  @apply text-sm font-medium text-neutral-700;
  @apply bg-white border border-neutral-300 rounded-md;
  @apply hover:bg-neutral-50 hover:text-neutral-900;
  @apply focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2;
  @apply disabled:cursor-default;
  @apply transition-all duration-200;
}

.pagination-page-button--current {
  @apply bg-teal-600 border-teal-600 text-white;
  @apply hover:bg-teal-700 hover:border-teal-700;
}

.pagination-page-button--hover:hover {
  @apply bg-neutral-50 text-neutral-900;
}

.pagination-ellipsis {
  @apply inline-flex items-center justify-center w-10 h-10;
  @apply text-neutral-500 font-medium;
}

/* Jump to Page */
.pagination-jump {
  @apply flex items-center gap-2 text-sm;
}

.pagination-jump-label {
  @apply text-neutral-600 font-medium whitespace-nowrap;
}

.pagination-jump-input {
  @apply w-16 px-2 py-1.5 border border-neutral-300 rounded-md;
  @apply bg-white text-neutral-900 text-sm text-center;
  @apply focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors duration-200;
}

.pagination-jump-button {
  @apply px-3 py-1.5 text-sm font-medium;
  @apply bg-teal-600 text-white border border-teal-600 rounded-md;
  @apply hover:bg-teal-700 hover:border-teal-700;
  @apply focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-all duration-200;
}

/* Loading Indicator */
.pagination-loading {
  @apply flex items-center gap-2 text-sm text-neutral-600;
}

.pagination-loading-icon {
  @apply w-4 h-4;
}

.pagination-loading-text {
  @apply font-medium;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .pagination {
    @apply flex-col gap-3 p-3;
  }
  
  .pagination-controls {
    @apply flex-wrap justify-center;
  }
  
  .pagination-pages {
    @apply mx-1;
  }
  
  .pagination-page-button {
    @apply w-8 h-8 text-xs;
  }
  
  .pagination-button {
    @apply px-2 py-1.5 text-xs;
  }
  
  .pagination-icon {
    @apply w-3 h-3;
  }
  
  .pagination-info,
  .pagination-page-size,
  .pagination-jump {
    @apply text-xs;
  }
}

/* Dark Theme Adjustments */
.theme-dark .pagination {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .pagination-info-text {
  @apply text-neutral-400;
}

.theme-dark .pagination-info-number {
  @apply text-neutral-200;
}

.theme-dark .pagination-page-size-label,
.theme-dark .pagination-page-size-suffix {
  @apply text-neutral-400;
}

.theme-dark .pagination-page-size-select {
  @apply bg-neutral-800 border-neutral-600 text-neutral-200;
  @apply focus:ring-teal-400 focus:border-teal-400;
}

.theme-dark .pagination-button {
  @apply bg-neutral-800 border-neutral-600 text-neutral-300;
  @apply hover:bg-neutral-700 hover:text-neutral-200;
  @apply disabled:hover:bg-neutral-800;
}

.theme-dark .pagination-page-button {
  @apply bg-neutral-800 border-neutral-600 text-neutral-300;
  @apply hover:bg-neutral-700 hover:text-neutral-200;
}

.theme-dark .pagination-page-button--current {
  @apply bg-teal-600 border-teal-600 text-white;
  @apply hover:bg-teal-700 hover:border-teal-700;
}

.theme-dark .pagination-ellipsis {
  @apply text-neutral-500;
}

.theme-dark .pagination-jump-label {
  @apply text-neutral-400;
}

.theme-dark .pagination-jump-input {
  @apply bg-neutral-800 border-neutral-600 text-neutral-200;
  @apply focus:ring-teal-400 focus:border-teal-400;
}

.theme-dark .pagination-loading {
  @apply text-neutral-400;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .pagination-button,
  .pagination-page-button {
    @apply border-2;
  }
  
  .pagination-page-button--current {
    @apply border-2 border-teal-800;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .pagination-button,
  .pagination-page-button,
  .pagination-page-size-select,
  .pagination-jump-input,
  .pagination-jump-button {
    @apply transition-none;
  }
}
</style>