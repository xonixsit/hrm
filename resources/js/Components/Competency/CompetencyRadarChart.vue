<template>
  <div class="competency-radar-chart">
    <div class="radar-container" :style="{ height: `${height}px` }">
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        :width="width"
        :height="height"
        class="radar-svg"
      >
        <!-- Background circles -->
        <g class="radar-grid">
          <circle
            v-for="level in gridLevels"
            :key="level"
            :cx="centerX"
            :cy="centerY"
            :r="(level / maxValue) * radius"
            class="grid-circle"
            fill="none"
          />
        </g>

        <!-- Axis lines -->
        <g class="radar-axes">
          <line
            v-for="(point, index) in axisPoints"
            :key="index"
            :x1="centerX"
            :y1="centerY"
            :x2="point.x"
            :y2="point.y"
            class="axis-line"
          />
        </g>

        <!-- Data area -->
        <g v-if="hasData" class="radar-data">
          <!-- Data polygon -->
          <polygon
            :points="dataPolygonPoints"
            class="data-area"
            :class="`data-area--${color}`"
          />
          
          <!-- Data outline -->
          <polygon
            :points="dataPolygonPoints"
            class="data-outline"
            :class="`data-outline--${color}`"
            fill="none"
          />

          <!-- Data points -->
          <circle
            v-for="(point, index) in dataPoints"
            :key="index"
            :cx="point.x"
            :cy="point.y"
            :r="pointRadius"
            class="data-point"
            :class="`data-point--${color}`"
            @mouseenter="showTooltip(point, $event)"
            @mouseleave="hideTooltip"
          />
        </g>

        <!-- Labels -->
        <g class="radar-labels">
          <text
            v-for="(label, index) in labelPositions"
            :key="index"
            :x="label.x"
            :y="label.y"
            :text-anchor="label.anchor"
            :dominant-baseline="label.baseline"
            class="axis-label"
          >
            {{ label.text }}
          </text>
        </g>

        <!-- Grid value labels -->
        <g class="grid-labels">
          <text
            v-for="level in gridLevels"
            :key="level"
            :x="centerX + 5"
            :y="centerY - (level / maxValue) * radius + 4"
            class="grid-label"
            text-anchor="start"
          >
            {{ level }}
          </text>
        </g>
      </svg>

      <!-- Legend -->
      <div v-if="showLegend && employee" class="radar-legend">
        <div class="legend-header">
          <h4 class="legend-title">{{ employee.name }}</h4>
          <p class="legend-subtitle">{{ employee.department || 'No Department' }}</p>
        </div>
        <div class="legend-items">
          <div
            v-for="(item, index) in processedData"
            :key="index"
            class="legend-item"
          >
            <div class="legend-color" :class="`legend-color--${getItemColor(index)}`" />
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value">{{ formatValue(item.value) }}</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!hasData" class="radar-empty">
        <ChartBarIcon class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p class="text-neutral-500 text-center">No competency data available</p>
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip.show"
      ref="tooltipRef"
      class="radar-tooltip"
      :style="tooltipStyle"
    >
      <div class="tooltip-content">
        <div class="tooltip-title">{{ tooltip.title }}</div>
        <div class="tooltip-value">{{ tooltip.value }}</div>
        <div v-if="tooltip.subtitle" class="tooltip-subtitle">{{ tooltip.subtitle }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue';
import { ChartBarIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  employee: {
    type: Object,
    default: null
  },
  width: {
    type: Number,
    default: 400
  },
  height: {
    type: Number,
    default: 300
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(value)
  },
  maxValue: {
    type: Number,
    default: 5
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  pointRadius: {
    type: Number,
    default: 4
  }
});

// Local state
const tooltipRef = ref(null);
const tooltip = reactive({
  show: false,
  title: '',
  value: '',
  subtitle: '',
  x: 0,
  y: 0
});

// Computed properties
const hasData = computed(() => props.data && props.data.length > 0);

const processedData = computed(() => {
  if (!hasData.value) return [];
  
  return props.data.map((item, index) => ({
    ...item,
    index,
    value: Math.max(0, Math.min(props.maxValue, item.value || 0)),
    label: item.label || `Item ${index + 1}`
  }));
});

const centerX = computed(() => props.width / 2);
const centerY = computed(() => props.height / 2);
const radius = computed(() => Math.min(props.width, props.height) / 2 - 60);

const gridLevels = computed(() => {
  const levels = [];
  const step = props.maxValue / 5;
  for (let i = 1; i <= 5; i++) {
    levels.push(step * i);
  }
  return levels;
});

const axisPoints = computed(() => {
  if (!hasData.value) return [];
  
  const angleStep = (2 * Math.PI) / processedData.value.length;
  
  return processedData.value.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    return {
      x: centerX.value + Math.cos(angle) * radius.value,
      y: centerY.value + Math.sin(angle) * radius.value
    };
  });
});

const dataPoints = computed(() => {
  if (!hasData.value) return [];
  
  const angleStep = (2 * Math.PI) / processedData.value.length;
  
  return processedData.value.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const distance = (item.value / props.maxValue) * radius.value;
    
    return {
      ...item,
      x: centerX.value + Math.cos(angle) * distance,
      y: centerY.value + Math.sin(angle) * distance,
      angle,
      distance
    };
  });
});

const dataPolygonPoints = computed(() => {
  if (!hasData.value) return '';
  
  return dataPoints.value
    .map(point => `${point.x},${point.y}`)
    .join(' ');
});

const labelPositions = computed(() => {
  if (!hasData.value) return [];
  
  const angleStep = (2 * Math.PI) / processedData.value.length;
  const labelRadius = radius.value + 20;
  
  return processedData.value.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = centerX.value + Math.cos(angle) * labelRadius;
    const y = centerY.value + Math.sin(angle) * labelRadius;
    
    // Determine text anchor based on position
    let anchor = 'middle';
    let baseline = 'middle';
    
    if (Math.cos(angle) > 0.1) {
      anchor = 'start';
    } else if (Math.cos(angle) < -0.1) {
      anchor = 'end';
    }
    
    if (Math.sin(angle) > 0.1) {
      baseline = 'hanging';
    } else if (Math.sin(angle) < -0.1) {
      baseline = 'baseline';
    }
    
    return {
      x,
      y,
      text: item.label,
      anchor,
      baseline
    };
  });
});

const tooltipStyle = computed(() => ({
  left: `${tooltip.x}px`,
  top: `${tooltip.y}px`,
  transform: 'translate(-50%, -100%)'
}));

// Methods
const formatValue = (value) => {
  return typeof value === 'number' ? value.toFixed(1) : '0.0';
};

const getItemColor = (index) => {
  const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
  return colors[index % colors.length];
};

const showTooltip = (data, event) => {
  tooltip.show = true;
  tooltip.title = data.label || 'Competency';
  tooltip.value = `${formatValue(data.value)} / ${props.maxValue}`;
  tooltip.subtitle = data.category ? `Category: ${data.category}` : '';
  
  const rect = event.target.getBoundingClientRect();
  const container = event.target.closest('.competency-radar-chart');
  const containerRect = container.getBoundingClientRect();
  
  tooltip.x = rect.left - containerRect.left + rect.width / 2;
  tooltip.y = rect.top - containerRect.top;
};

const hideTooltip = () => {
  tooltip.show = false;
};
</script>

<style scoped>
.competency-radar-chart {
  @apply relative w-full;
}

.radar-container {
  @apply relative flex items-center justify-center;
}

.radar-svg {
  @apply w-full h-auto;
}

/* Grid styling */
.grid-circle {
  @apply stroke-neutral-200;
  stroke-width: 1;
}

.axis-line {
  @apply stroke-neutral-300;
  stroke-width: 1;
}

.axis-label {
  @apply fill-neutral-700 text-xs font-medium;
}

.grid-label {
  @apply fill-neutral-500 text-xs;
}

/* Data styling */
.data-area {
  opacity: 0.2;
}

.data-area--primary {
  @apply fill-primary-500;
}

.data-area--secondary {
  @apply fill-secondary-500;
}

.data-area--success {
  @apply fill-success-500;
}

.data-area--warning {
  @apply fill-warning-500;
}

.data-area--error {
  @apply fill-error-500;
}

.data-area--info {
  @apply fill-info-500;
}

.data-outline {
  stroke-width: 2;
}

.data-outline--primary {
  @apply stroke-primary-600;
}

.data-outline--secondary {
  @apply stroke-secondary-600;
}

.data-outline--success {
  @apply stroke-success-600;
}

.data-outline--warning {
  @apply stroke-warning-600;
}

.data-outline--error {
  @apply stroke-error-600;
}

.data-outline--info {
  @apply stroke-info-600;
}

.data-point {
  @apply cursor-pointer transition-all duration-200;
  stroke-width: 2;
}

.data-point:hover {
  r: 6;
}

.data-point--primary {
  @apply fill-primary-600 stroke-white;
}

.data-point--secondary {
  @apply fill-secondary-600 stroke-white;
}

.data-point--success {
  @apply fill-success-600 stroke-white;
}

.data-point--warning {
  @apply fill-warning-600 stroke-white;
}

.data-point--error {
  @apply fill-error-600 stroke-white;
}

.data-point--info {
  @apply fill-info-600 stroke-white;
}

/* Legend */
.radar-legend {
  @apply absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-neutral-200 p-4 max-w-xs;
}

.legend-header {
  @apply mb-3 pb-2 border-b border-neutral-200;
}

.legend-title {
  @apply text-sm font-semibold text-neutral-900;
}

.legend-subtitle {
  @apply text-xs text-neutral-600;
}

.legend-items {
  @apply space-y-2;
}

.legend-item {
  @apply flex items-center justify-between text-xs;
}

.legend-color {
  @apply w-3 h-3 rounded-full mr-2 flex-shrink-0;
}

.legend-color--primary {
  @apply bg-primary-600;
}

.legend-color--secondary {
  @apply bg-secondary-600;
}

.legend-color--success {
  @apply bg-success-600;
}

.legend-color--warning {
  @apply bg-warning-600;
}

.legend-color--error {
  @apply bg-error-600;
}

.legend-color--info {
  @apply bg-info-600;
}

.legend-label {
  @apply text-neutral-700 flex-1 truncate mr-2;
}

.legend-value {
  @apply font-medium text-neutral-900;
}

/* Empty state */
.radar-empty {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

/* Tooltip */
.radar-tooltip {
  @apply absolute z-50 pointer-events-none;
}

.tooltip-content {
  @apply bg-neutral-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm;
}

.tooltip-title {
  @apply font-medium;
}

.tooltip-value {
  @apply text-lg font-bold;
}

.tooltip-subtitle {
  @apply text-xs opacity-75;
}

/* Dark theme */
.theme-dark .grid-circle {
  @apply stroke-neutral-700;
}

.theme-dark .axis-line {
  @apply stroke-neutral-600;
}

.theme-dark .axis-label {
  @apply fill-neutral-300;
}

.theme-dark .grid-label {
  @apply fill-neutral-400;
}

.theme-dark .radar-legend {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .legend-title {
  @apply text-neutral-100;
}

.theme-dark .legend-subtitle {
  @apply text-neutral-400;
}

.theme-dark .legend-label {
  @apply text-neutral-300;
}

.theme-dark .legend-value {
  @apply text-neutral-100;
}

/* Responsive */
@media (max-width: 640px) {
  .radar-legend {
    @apply relative top-0 right-0 mt-4 max-w-none;
  }
  
  .legend-items {
    @apply grid grid-cols-2 gap-2;
  }
}

/* Animation */
.data-area,
.data-outline,
.data-point {
  animation: radar-fade-in 0.8s ease-out;
}

@keyframes radar-fade-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.data-area {
  animation-delay: 0.2s;
}

.data-outline {
  animation-delay: 0.4s;
}

.data-point {
  animation-delay: 0.6s;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .data-area,
  .data-outline,
  .data-point {
    animation: none;
  }
}
</style>