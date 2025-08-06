<template>
  <div class="table-skeleton">
    <table class="skeleton-table">
      <!-- Skeleton Header -->
      <thead class="skeleton-head">
        <tr>
          <th
            v-for="(column, index) in columns"
            :key="index"
            class="skeleton-header-cell"
            :style="getColumnSkeletonStyles(index)"
          >
            <div class="skeleton-header-content">
              <div class="skeleton-element skeleton-header-text"></div>
            </div>
          </th>
        </tr>
      </thead>
      
      <!-- Skeleton Body -->
      <tbody class="skeleton-body">
        <tr
          v-for="row in rows"
          :key="row"
          class="skeleton-row"
        >
          <td
            v-for="(column, index) in columns"
            :key="index"
            class="skeleton-cell"
            :style="getColumnSkeletonStyles(index)"
          >
            <div class="skeleton-cell-content">
              <div 
                class="skeleton-element skeleton-cell-text"
                :style="getCellSkeletonStyles(index, row)"
              ></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  columns: {
    type: Number,
    default: 4
  },
  
  rows: {
    type: Number,
    default: 5
  },
  
  animated: {
    type: Boolean,
    default: true
  }
});

// Design system-based column width logic (matches DataTable)
const getColumnSkeletonStyles = (columnIndex) => {
  const styles = {};
  
  // First column (name) - matches DataTable logic
  if (columnIndex === 0) {
    styles.minWidth = '200px';
    styles.width = 'auto';
  }
  // Second column (email) - matches DataTable logic
  else if (columnIndex === 1) {
    styles.minWidth = '250px';
    styles.width = 'auto';
  }
  // Other columns - matches DataTable logic
  else {
    styles.minWidth = '120px';
    styles.width = 'auto';
  }
  
  return styles;
};

// Generate realistic skeleton widths based on column type
const getCellSkeletonStyles = (columnIndex, rowIndex) => {
  // Use consistent seed for predictable but varied widths
  const seed = (columnIndex * 7 + rowIndex * 11) % 100;
  
  let minWidth, maxWidth;
  
  // First column (name) - shorter widths for names
  if (columnIndex === 0) {
    minWidth = 60;
    maxWidth = 85;
  }
  // Second column (email) - longer widths for emails
  else if (columnIndex === 1) {
    minWidth = 70;
    maxWidth = 90;
  }
  // Other columns - medium widths
  else {
    minWidth = 40;
    maxWidth = 80;
  }
  
  const width = minWidth + (seed % (maxWidth - minWidth));
  
  return {
    width: `${width}%`
  };
};
</script>

<style scoped>
.table-skeleton {
  @apply w-full overflow-hidden;
}

.skeleton-table {
  @apply w-full;
  table-layout: auto; /* Match DataTable layout */
  min-width: 100%;
  width: max-content;
}

/* Skeleton Header - Match DataTable styles */
.skeleton-head {
  @apply bg-white border-b border-neutral-200;
}

.skeleton-header-cell {
  @apply px-6 py-4 text-left;
  @apply whitespace-nowrap;
}

.skeleton-header-content {
  @apply flex items-center justify-between;
}

.skeleton-header-text {
  /* Flexible height using design tokens */
  height: clamp(0.875rem, 2vw, 1rem);
  /* Flexible width using design tokens */
  width: clamp(4rem, 8vw, 6rem);
}

/* Skeleton Body - Match DataTable styles */
.skeleton-body {
  @apply bg-white divide-y divide-neutral-200;
}

.skeleton-row {
  @apply transition-colors duration-150;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-cell {
  @apply px-6 py-4;
  @apply overflow-hidden;
  line-height: 1.5;
}

.skeleton-cell-content {
  @apply flex items-center min-w-0 w-full;
}

.skeleton-cell-text {
  /* Flexible height using design tokens */
  height: clamp(0.75rem, 1.5vw, 1rem);
  border-radius: clamp(0.25rem, 0.5vw, 0.375rem);
}

/* Design System Skeleton Animation */
.skeleton-element {
  @apply bg-neutral-200 rounded-md;
  background: linear-gradient(
    90deg,
    rgb(229 231 235) 25%,
    rgb(209 213 219) 50%,
    rgb(229 231 235) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Remove hardcoded variations - let JavaScript handle dynamic widths */

/* Dark Theme - Using design tokens */
.theme-dark .skeleton-head {
  @apply bg-neutral-900 border-neutral-700;
}

.theme-dark .skeleton-body {
  @apply bg-neutral-800 divide-neutral-700;
}

.theme-dark .skeleton-element {
  @apply bg-neutral-700;
  background: linear-gradient(
    90deg,
    rgb(55 65 81) 25%,
    rgb(75 85 99) 50%,
    rgb(55 65 81) 75%
  );
  background-size: 200% 100%;
}

/* Responsive Design - Using design tokens */
@media (max-width: 768px) {
  .skeleton-header-cell,
  .skeleton-cell {
    @apply px-3 py-2;
  }
  
  .skeleton-header-text {
    height: clamp(0.75rem, 1.5vw, 0.875rem);
    width: clamp(3rem, 6vw, 4rem);
  }
  
  .skeleton-cell-text {
    height: clamp(0.625rem, 1.25vw, 0.75rem);
  }
}

@media (max-width: 640px) {
  .skeleton-header-cell,
  .skeleton-cell {
    @apply px-2 py-2;
  }
  
  .skeleton-table {
    min-width: 600px; /* Match DataTable minimum width */
  }
}

/* Size Variants - Match DataTable */
.table-sm .skeleton-header-cell,
.table-sm .skeleton-cell {
  @apply px-3 py-2;
}

.table-sm .skeleton-header-text,
.table-sm .skeleton-cell-text {
  height: clamp(0.625rem, 1.25vw, 0.75rem);
}

.table-lg .skeleton-header-cell,
.table-lg .skeleton-cell {
  @apply px-6 py-4;
}

.table-lg .skeleton-header-text,
.table-lg .skeleton-cell-text {
  height: clamp(1rem, 2vw, 1.25rem);
}
</style>