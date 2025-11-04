<template>
  <div class="table-pagination" :data-theme="theme">
    <!-- Left: Simple Page Size Selector -->
    <div class="page-size-section">
      <label class="page-size-label">Rows per page:</label>
      <select
        :value="pageSize"
        @change="handlePageSizeChange"
        class="page-size-select"
        aria-label="Select page size"
      >
        <option
          v-for="size in pageSizeOptions"
          :key="size"
          :value="size"
        >
          {{ size }}
        </option>
      </select>
    </div>
    
    <!-- Center: Page Info -->
    <div class="page-info flex-grow min-w-0">
      <span class="info-text">
        {{ startItem }}-{{ endItem }} of {{ totalItems }}
      </span>
    </div>
    
    <!-- Right: Navigation -->
    <div class="pagination-nav flex-shrink-0 flex-grow justify-end">
      <button
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        class="nav-button"
        aria-label="Previous page"
        title="Previous page"
      >
        <Icon name="chevron-left" class="w-4 h-4" />
      </button>
      
      <div class="page-numbers flex items-center">
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            :class="getPageButtonClasses(page)"
            @click="goToPage(page)"
            :aria-label="`Go to page ${page}`"
            :aria-current="page === currentPage ? 'page' : undefined"
            :title="`Go to page ${page}`"
          >
            {{ page }}
          </button>
          <span v-else class="ellipsis" aria-hidden="true">...</span>
        </template>
      </div>
      
      <button
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
        class="nav-button"
        aria-label="Next page"
        title="Next page"
      >
        <Icon name="chevron-right" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  
  totalPages: {
    type: Number,
    required: true
  },
  
  pageSize: {
    type: Number,
    required: true
  },
  
  pageSizeOptions: {
    type: Array,
    default: () => [10, 25, 50, 100]
  },
  
  totalItems: {
    type: Number,
    required: true
  },
  
  maxVisiblePages: {
    type: Number,
    default: 5 // Reduced from 7 to 5 to prevent overflow on smaller screens
  },
  
  theme: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'dark'].includes(value)
  }
});

const emit = defineEmits(['page-change', 'page-size-change']);

// Computed properties
const startItem = computed(() => {
  return props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.totalItems);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = props.totalPages;
  const current = props.currentPage;
  const maxVisible = props.maxVisiblePages;
  
  if (total <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Calculate start and end of visible range
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    // Always show first page
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }
    
    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Always show last page
    if (end < total) {
      if (end < total - 1) {
        pages.push('...');
      }
      pages.push(total);
    }
  }
  
  return pages;
});

const showEndEllipsis = computed(() => {
  return visiblePages.value.includes('...');
});

// Methods
const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page);
  }
};

const handlePageSizeChange = (event) => {
  const newSize = parseInt(event.target.value);
  emit('page-size-change', newSize);
};

const getPageButtonClasses = (page) => [
  'pagination-button',
  'page-number',
  {
    'active': page === props.currentPage,
    'ellipsis': page === '...'
  }
];
</script>

<style scoped>
.table-pagination {
  @apply flex items-center justify-end bg-white border-t border-neutral-200 w-full;
  @apply gap-6; /* Increased gap for better spacing */
  padding: clamp(0.75rem, 2vw, 1.5rem) clamp(1rem, 3vw, 2rem);
}

.page-size-section {
  @apply flex items-center text-neutral-700;
  gap: clamp(0.5rem, 1.5vw, 1rem);
  font-size: clamp(0.75rem, 2vw, 0.875rem);
}

.pagination-nav {
  @apply flex items-center gap-2; /* Slightly increased gap for consistency */
}

.page-numbers {
  @apply flex items-center;
  gap: clamp(0.25rem, 1vw, 0.5rem);
  margin: 0 clamp(0.5rem, 2vw, 1rem);
}

.pagination-button {
  @apply inline-flex items-center justify-center font-medium rounded-md;
  @apply text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply transition-colors duration-150;
  min-width: clamp(2rem, 3.5vw, 2.5rem); /* Adjusted min-width for uniformity */
  height: clamp(2rem, 4vw, 2.5rem);
  padding: clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 1.5vw, 0.75rem);
  font-size: clamp(0.75rem, 2vw, 0.875rem);
}

@media (max-width: 768px) {
  .table-pagination {
    @apply flex-wrap justify-center gap-3 px-3 py-4;
  }
  
  .page-size-section, .page-info, .pagination-nav {
    @apply flex-shrink-0;
  }
}
.page-size-label {
  @apply whitespace-nowrap font-medium text-neutral-600;
}

.page-size-select {
  @apply border border-neutral-300 rounded-md bg-white;
  @apply hover:border-neutral-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500;
  @apply focus:outline-none transition-colors duration-150;
  @apply cursor-pointer;
  /* Flexible sizing that adapts to content and screen */
  min-width: max-content;
  width: auto;
  padding: clamp(0.375rem, 1vw, 0.625rem) clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(0.75rem, 2vw, 0.875rem);
}

/* Center: Page Info */
.page-info {
  @apply text-neutral-600 font-medium;
  font-size: clamp(0.75rem, 2vw, 0.875rem);
}

.info-text {
  @apply whitespace-nowrap;
}

/* Right: Navigation */
.pagination-nav {
  @apply flex items-center gap-1;
}

/* Navigation Buttons */
.nav-button {
  @apply inline-flex items-center justify-center rounded-md;
  @apply text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100;
  @apply focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2;
  @apply disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-500;
  @apply transition-colors duration-150;
  /* Flexible size that adapts to content and screen size */
  width: clamp(2rem, 4vw, 2.5rem);
  height: clamp(2rem, 4vw, 2.5rem);
}

/* Page Numbers */
.page-numbers {
  @apply flex items-center;
  /* Flexible spacing that adapts to available space */
  gap: clamp(0.25rem, 1vw, 0.5rem);
  margin: 0 clamp(0.5rem, 2vw, 1rem);
}

.pagination-button {
  @apply inline-flex items-center justify-center font-medium rounded-md;
  @apply text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100;
  @apply focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2;
  @apply transition-colors duration-150;
  /* Flexible sizing that adapts to content and screen */
  min-width: clamp(1.5rem, 3vw, 2.5rem);
  height: clamp(2rem, 4vw, 2.5rem);
  padding: clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 1.5vw, 0.75rem);
  font-size: clamp(0.75rem, 2vw, 0.875rem);
}

.pagination-button.active {
  @apply bg-teal-600 text-white hover:bg-teal-700 hover:text-white;
}

.ellipsis {
  @apply px-2 py-1 text-sm text-neutral-400 pointer-events-none;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .table-pagination {
    @apply flex-col gap-3 px-3 py-4;
  }
  
  .page-size-section {
    @apply justify-center;
  }
  
  .page-info {
    @apply text-center;
  }
  
  .pagination-nav {
    @apply justify-center;
  }
  
  .page-numbers {
    @apply mx-1;
  }
}

/* Component-level theme control */
.table-pagination[data-theme="dark"] {
  @apply bg-neutral-800 border-neutral-700;
}

.table-pagination[data-theme="dark"] .page-size-label,
.table-pagination[data-theme="dark"] .page-info {
  @apply text-neutral-300;
}

.table-pagination[data-theme="dark"] .page-size-select {
  @apply bg-neutral-700 border-neutral-600 text-neutral-200;
  @apply hover:border-neutral-500 focus:border-teal-500;
}

.table-pagination[data-theme="dark"] .nav-button {
  @apply text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700;
  @apply disabled:hover:bg-transparent disabled:hover:text-neutral-400;
}

.table-pagination[data-theme="dark"] .pagination-button {
  @apply text-neutral-300 hover:text-neutral-100 hover:bg-neutral-700;
}

.table-pagination[data-theme="dark"] .pagination-button.active {
  @apply bg-teal-600 text-white hover:bg-teal-700;
}

.table-pagination[data-theme="dark"] .ellipsis {
  @apply text-neutral-500;
}
</style>