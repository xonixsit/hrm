<template>
  <DashboardWidget
    :title="title"
    :loading="loading"
    :error="error"
    class="chart-widget"
    :padding="padding"
    :background="background"
  >
    <template #actions>
      <slot name="actions">
        <div v-if="showControls" class="chart-controls">
          <!-- Time Range Selector -->
          <select
            v-if="showTimeRange"
            v-model="selectedTimeRange"
            @change="handleTimeRangeChange"
            class="chart-control-select"
          >
            <option v-for="range in timeRanges" :key="range.value" :value="range.value">
              {{ range.label }}
            </option>
          </select>
          
          <!-- Chart Type Selector -->
          <button
            v-if="showTypeToggle"
            @click="toggleChartType"
            class="chart-control-button"
            :title="`Switch to ${nextChartType} chart`"
          >
            <component :is="getChartTypeIcon()" class="w-4 h-4" />
          </button>
          
          <!-- Refresh Button -->
          <button
            v-if="showRefresh"
            @click="handleRefresh"
            class="chart-control-button"
            :disabled="loading"
            title="Refresh data"
          >
            <component :is="refreshIcon" :class="['w-4 h-4', { 'animate-spin': loading }]" />
          </button>
        </div>
      </slot>
    </template>

    <!-- Chart Container -->
    <div class="chart-container" :class="chartContainerClasses">
      <!-- Loading State -->
      <div v-if="loading" class="chart-loading">
        <div class="loading-skeleton">
          <div class="skeleton-bars">
            <div v-for="i in 8" :key="i" class="skeleton-bar" :style="{ height: `${Math.random() * 60 + 20}%` }" />
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="chart-error">
        <component :is="errorIcon" class="w-12 h-12 text-error-400 mx-auto mb-3" />
        <p class="text-error-600 text-center mb-4">{{ errorMessage }}</p>
        <button @click="handleRefresh" class="error-retry-button">
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasData" class="chart-empty">
        <component :is="emptyIcon" class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p class="text-neutral-500 text-center">{{ emptyMessage }}</p>
      </div>

      <!-- Chart Content -->
      <div v-else class="chart-content">
        <!-- Line Chart -->
        <div v-if="type === 'line'" class="line-chart">
          <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="chart-svg">
            <!-- Grid Lines -->
            <g v-if="showGrid" class="grid-lines">
              <!-- Horizontal grid lines -->
              <line
                v-for="(line, index) in horizontalGridLines"
                :key="`h-${index}`"
                :x1="chartPadding.left"
                :y1="line.y"
                :x2="chartWidth - chartPadding.right"
                :y2="line.y"
                class="grid-line"
              />
              <!-- Vertical grid lines -->
              <line
                v-for="(line, index) in verticalGridLines"
                :key="`v-${index}`"
                :x1="line.x"
                :y1="chartPadding.top"
                :x2="line.x"
                :y2="chartHeight - chartPadding.bottom"
                class="grid-line"
              />
            </g>

            <!-- Chart Area -->
            <path
              v-if="showArea"
              :d="areaPath"
              class="chart-area"
              :class="`chart-area--${color}`"
            />

            <!-- Chart Line -->
            <path
              :d="linePath"
              class="chart-line"
              :class="`chart-line--${color}`"
              fill="none"
              :stroke-width="lineWidth"
            />

            <!-- Data Points -->
            <g v-if="showPoints" class="data-points">
              <circle
                v-for="(point, index) in chartPoints"
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

            <!-- Axes -->
            <g class="axes">
              <!-- X Axis -->
              <line
                :x1="chartPadding.left"
                :y1="chartHeight - chartPadding.bottom"
                :x2="chartWidth - chartPadding.right"
                :y2="chartHeight - chartPadding.bottom"
                class="axis-line"
              />
              <!-- Y Axis -->
              <line
                :x1="chartPadding.left"
                :y1="chartPadding.top"
                :x2="chartPadding.left"
                :y2="chartHeight - chartPadding.bottom"
                class="axis-line"
              />
            </g>

            <!-- Axis Labels -->
            <g v-if="showLabels" class="axis-labels">
              <!-- X Axis Labels -->
              <text
                v-for="(label, index) in xAxisLabels"
                :key="`x-${index}`"
                :x="label.x"
                :y="chartHeight - chartPadding.bottom + 20"
                class="axis-label"
                text-anchor="middle"
              >
                {{ label.text }}
              </text>
              <!-- Y Axis Labels -->
              <text
                v-for="(label, index) in yAxisLabels"
                :key="`y-${index}`"
                :x="chartPadding.left - 10"
                :y="label.y"
                class="axis-label"
                text-anchor="end"
                dominant-baseline="middle"
              >
                {{ label.text }}
              </text>
            </g>
          </svg>
        </div>

        <!-- Bar Chart -->
        <div v-else-if="type === 'bar'" class="bar-chart">
          <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="chart-svg">
            <!-- Grid Lines -->
            <g v-if="showGrid" class="grid-lines">
              <line
                v-for="(line, index) in horizontalGridLines"
                :key="`h-${index}`"
                :x1="chartPadding.left"
                :y1="line.y"
                :x2="chartWidth - chartPadding.right"
                :y2="line.y"
                class="grid-line"
              />
            </g>

            <!-- Bars -->
            <g class="bars">
              <rect
                v-for="(bar, index) in chartBars"
                :key="index"
                :x="bar.x"
                :y="bar.y"
                :width="bar.width"
                :height="bar.height"
                class="chart-bar"
                :class="`chart-bar--${color}`"
                @mouseenter="showTooltip(bar, $event)"
                @mouseleave="hideTooltip"
              />
            </g>

            <!-- Axes and Labels -->
            <g class="axes">
              <line
                :x1="chartPadding.left"
                :y1="chartHeight - chartPadding.bottom"
                :x2="chartWidth - chartPadding.right"
                :y2="chartHeight - chartPadding.bottom"
                class="axis-line"
              />
              <line
                :x1="chartPadding.left"
                :y1="chartPadding.top"
                :x2="chartPadding.left"
                :y2="chartHeight - chartPadding.bottom"
                class="axis-line"
              />
            </g>

            <g v-if="showLabels" class="axis-labels">
              <text
                v-for="(label, index) in xAxisLabels"
                :key="`x-${index}`"
                :x="label.x"
                :y="chartHeight - chartPadding.bottom + 20"
                class="axis-label"
                text-anchor="middle"
              >
                {{ label.text }}
              </text>
              <text
                v-for="(label, index) in yAxisLabels"
                :key="`y-${index}`"
                :x="chartPadding.left - 10"
                :y="label.y"
                class="axis-label"
                text-anchor="end"
                dominant-baseline="middle"
              >
                {{ label.text }}
              </text>
            </g>
          </svg>
        </div>

        <!-- Donut Chart -->
        <div v-else-if="type === 'donut'" class="donut-chart">
          <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="chart-svg">
            <g :transform="`translate(${chartWidth / 2}, ${chartHeight / 2})`">
              <!-- Donut Segments -->
              <path
                v-for="(segment, index) in donutSegments"
                :key="index"
                :d="segment.path"
                class="donut-segment"
                :class="`donut-segment--${segment.color}`"
                @mouseenter="showTooltip(segment, $event)"
                @mouseleave="hideTooltip"
              />
              
              <!-- Center Text -->
              <text
                v-if="centerText"
                class="donut-center-text"
                text-anchor="middle"
                dominant-baseline="middle"
              >
                {{ centerText }}
              </text>
            </g>
          </svg>
          
          <!-- Legend -->
          <div v-if="showLegend" class="chart-legend">
            <div
              v-for="(item, index) in legendItems"
              :key="index"
              class="legend-item"
            >
              <div class="legend-color" :class="`legend-color--${item.color}`" />
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Footer -->
    <div v-if="$slots.footer || showSummary" class="chart-footer">
      <slot name="footer">
        <div v-if="showSummary" class="chart-summary">
          <div class="summary-stats">
            <div v-for="stat in summaryStats" :key="stat.label" class="summary-stat">
              <span class="stat-label">{{ stat.label }}</span>
              <span class="stat-value">{{ stat.value }}</span>
            </div>
          </div>
        </div>
      </slot>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip.show"
      ref="tooltipRef"
      class="chart-tooltip"
      :style="tooltipStyle"
    >
      <div class="tooltip-content">
        <div class="tooltip-title">{{ tooltip.title }}</div>
        <div class="tooltip-value">{{ tooltip.value }}</div>
        <div v-if="tooltip.subtitle" class="tooltip-subtitle">{{ tooltip.subtitle }}</div>
      </div>
    </div>
  </DashboardWidget>
</template>

<script setup>
import { computed, ref, reactive, watch, nextTick } from 'vue';
import DashboardWidget from './DashboardWidget.vue';
import { getIcon } from '@/config/icons';

const props = defineProps({
  // Chart data
  data: {
    type: Array,
    default: () => []
  },
  
  // Chart configuration
  title: {
    type: String,
    default: 'Chart'
  },
  
  type: {
    type: String,
    default: 'line',
    validator: (value) => ['line', 'bar', 'donut'].includes(value)
  },
  
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(value)
  },
  
  // Chart dimensions
  height: {
    type: Number,
    default: 300
  },
  
  width: {
    type: Number,
    default: 600
  },
  
  // Display options
  showGrid: {
    type: Boolean,
    default: true
  },
  
  showLabels: {
    type: Boolean,
    default: true
  },
  
  showPoints: {
    type: Boolean,
    default: true
  },
  
  showArea: {
    type: Boolean,
    default: false
  },
  
  showLegend: {
    type: Boolean,
    default: true
  },
  
  showSummary: {
    type: Boolean,
    default: false
  },
  
  // Controls
  showControls: {
    type: Boolean,
    default: true
  },
  
  showTimeRange: {
    type: Boolean,
    default: true
  },
  
  showTypeToggle: {
    type: Boolean,
    default: false
  },
  
  showRefresh: {
    type: Boolean,
    default: true
  },
  
  // Time ranges
  timeRanges: {
    type: Array,
    default: () => [
      { label: '7 Days', value: '7d' },
      { label: '30 Days', value: '30d' },
      { label: '90 Days', value: '90d' },
      { label: '1 Year', value: '1y' }
    ]
  },
  
  // States
  loading: {
    type: Boolean,
    default: false
  },
  
  error: {
    type: Boolean,
    default: false
  },
  
  errorMessage: {
    type: String,
    default: 'Failed to load chart data'
  },
  
  emptyMessage: {
    type: String,
    default: 'No data available'
  },
  
  // Styling
  padding: {
    type: String,
    default: 'md'
  },
  
  background: {
    type: String,
    default: 'white'
  },
  
  // Chart styling
  lineWidth: {
    type: Number,
    default: 2
  },
  
  pointRadius: {
    type: Number,
    default: 4
  },
  
  centerText: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['time-range-change', 'chart-type-change', 'refresh', 'data-point-click']);

// Local state
const selectedTimeRange = ref(props.timeRanges[0]?.value || '7d');
const tooltipRef = ref(null);
const tooltip = reactive({
  show: false,
  title: '',
  value: '',
  subtitle: '',
  x: 0,
  y: 0
});

// Chart dimensions
const chartWidth = computed(() => props.width);
const chartHeight = computed(() => props.height);
const chartPadding = computed(() => ({
  top: 20,
  right: 20,
  bottom: 40,
  left: 60
}));

// Icons
const refreshIcon = computed(() => getIcon('refresh') || getIcon('arrow-path'));
const errorIcon = computed(() => getIcon('x-circle'));
const emptyIcon = computed(() => getIcon('chart-bar'));

// Data processing
const hasData = computed(() => props.data && props.data.length > 0);

const processedData = computed(() => {
  if (!hasData.value) return [];
  
  return props.data
    .filter(item => item != null && typeof item === 'object')
    .map((item, index) => ({
      ...item,
      index,
      x: typeof item.x !== 'undefined' ? item.x : index,
      y: typeof item.y !== 'undefined' ? item.y : item.value || 0,
      label: item.label || `Item ${index + 1}`
    }));
});

// Chart calculations
const dataExtent = computed(() => {
  if (!hasData.value) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  
  const xValues = processedData.value.map(d => d.x);
  const yValues = processedData.value.map(d => d.y);
  
  return {
    minX: Math.min(...xValues),
    maxX: Math.max(...xValues),
    minY: Math.min(0, Math.min(...yValues)),
    maxY: Math.max(...yValues)
  };
});

const xScale = computed(() => {
  const { minX, maxX } = dataExtent.value;
  const range = maxX - minX || 1;
  const chartArea = chartWidth.value - chartPadding.value.left - chartPadding.value.right;
  
  return (value) => chartPadding.value.left + ((value - minX) / range) * chartArea;
});

const yScale = computed(() => {
  const { minY, maxY } = dataExtent.value;
  const range = maxY - minY || 1;
  const chartArea = chartHeight.value - chartPadding.value.top - chartPadding.value.bottom;
  
  return (value) => chartHeight.value - chartPadding.value.bottom - ((value - minY) / range) * chartArea;
});

// Chart elements
const chartPoints = computed(() => {
  return processedData.value.map(d => ({
    ...d,
    x: xScale.value(d.x),
    y: yScale.value(d.y)
  }));
});

const linePath = computed(() => {
  if (!hasData.value) return '';
  
  return chartPoints.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
});

const areaPath = computed(() => {
  if (!hasData.value) return '';
  
  const points = chartPoints.value;
  const baseline = yScale.value(0);
  
  let path = `M ${points[0].x} ${baseline}`;
  path += ` L ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  
  path += ` L ${points[points.length - 1].x} ${baseline} Z`;
  
  return path;
});

const chartBars = computed(() => {
  if (!hasData.value) return [];
  
  const barWidth = (chartWidth.value - chartPadding.value.left - chartPadding.value.right) / processedData.value.length * 0.8;
  const baseline = yScale.value(0);
  
  return processedData.value.map((d, index) => {
    const x = xScale.value(d.x) - barWidth / 2;
    const y = yScale.value(d.y);
    const height = baseline - y;
    
    return {
      ...d,
      x,
      y,
      width: barWidth,
      height: Math.max(0, height)
    };
  });
});

// Grid lines
const horizontalGridLines = computed(() => {
  const { minY, maxY } = dataExtent.value;
  const steps = 5;
  const stepSize = (maxY - minY) / steps;
  
  return Array.from({ length: steps + 1 }, (_, i) => ({
    y: yScale.value(minY + i * stepSize),
    value: minY + i * stepSize
  }));
});

const verticalGridLines = computed(() => {
  const { minX, maxX } = dataExtent.value;
  const steps = Math.min(processedData.value.length - 1, 6);
  const stepSize = (maxX - minX) / steps;
  
  return Array.from({ length: steps + 1 }, (_, i) => ({
    x: xScale.value(minX + i * stepSize),
    value: minX + i * stepSize
  }));
});

// Axis labels
const xAxisLabels = computed(() => {
  return processedData.value.map(d => ({
    x: xScale.value(d.x),
    text: d.label || d.x.toString()
  }));
});

const yAxisLabels = computed(() => {
  return horizontalGridLines.value.map(line => ({
    y: line.y,
    text: Math.round(line.value).toString()
  }));
});

// Donut chart calculations
const donutSegments = computed(() => {
  if (!hasData.value || props.type !== 'donut') return [];
  
  const total = processedData.value.reduce((sum, d) => sum + d.y, 0);
  const radius = Math.min(chartWidth.value, chartHeight.value) / 2 - 40;
  const innerRadius = radius * 0.6;
  
  let currentAngle = -Math.PI / 2; // Start at top
  
  return processedData.value.map((d, index) => {
    const angle = (d.y / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = Math.cos(startAngle) * radius;
    const y1 = Math.sin(startAngle) * radius;
    const x2 = Math.cos(endAngle) * radius;
    const y2 = Math.sin(endAngle) * radius;
    
    const x3 = Math.cos(endAngle) * innerRadius;
    const y3 = Math.sin(endAngle) * innerRadius;
    const x4 = Math.cos(startAngle) * innerRadius;
    const y4 = Math.sin(startAngle) * innerRadius;
    
    const largeArc = angle > Math.PI ? 1 : 0;
    
    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
    
    currentAngle = endAngle;
    
    return {
      ...d,
      path,
      percentage: (d.y / total) * 100,
      color: getSegmentColor(index)
    };
  });
});

const legendItems = computed(() => {
  if (props.type !== 'donut') return [];
  
  return donutSegments.value.map(segment => ({
    label: segment.label,
    value: `${Math.round(segment.percentage)}%`,
    color: segment.color
  }));
});

// Summary statistics
const summaryStats = computed(() => {
  if (!hasData.value) return [];
  
  const values = processedData.value.map(d => d.y);
  const total = values.reduce((sum, val) => sum + val, 0);
  const average = total / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  
  return [
    { label: 'Total', value: total.toLocaleString() },
    { label: 'Average', value: Math.round(average).toLocaleString() },
    { label: 'Max', value: max.toLocaleString() },
    { label: 'Min', value: min.toLocaleString() }
  ];
});

// Chart type management
const chartTypes = ['line', 'bar', 'donut'];
const nextChartType = computed(() => {
  const currentIndex = chartTypes.indexOf(props.type);
  return chartTypes[(currentIndex + 1) % chartTypes.length];
});

// Styling
const chartContainerClasses = computed(() => [
  `chart-container--${props.type}`,
  `chart-container--${props.color}`
]);

const tooltipStyle = computed(() => ({
  left: `${tooltip.x}px`,
  top: `${tooltip.y}px`,
  transform: 'translate(-50%, -100%)'
}));

// Methods
const handleTimeRangeChange = () => {
  emit('time-range-change', selectedTimeRange.value);
};

const toggleChartType = () => {
  emit('chart-type-change', nextChartType.value);
};

const handleRefresh = () => {
  emit('refresh');
};

const getChartTypeIcon = () => {
  const icons = {
    line: 'chart-line',
    bar: 'chart-bar',
    donut: 'chart-pie'
  };
  return getIcon(icons[nextChartType.value]) || getIcon('chart-bar');
};

const getSegmentColor = (index) => {
  const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
  return colors[index % colors.length];
};

const showTooltip = (data, event) => {
  tooltip.show = true;
  tooltip.title = data.label || 'Data Point';
  tooltip.value = data.y?.toLocaleString() || data.value?.toLocaleString() || '0';
  tooltip.subtitle = data.subtitle || '';
  
  const rect = event.target.getBoundingClientRect();
  tooltip.x = rect.left + rect.width / 2;
  tooltip.y = rect.top;
};

const hideTooltip = () => {
  tooltip.show = false;
};

// Watch for data changes
watch(() => props.data, () => {
  // Reset tooltip when data changes
  hideTooltip();
}, { deep: true });
</script>

<style scoped>
.chart-widget {
  /* Base chart widget styling */
}

.chart-controls {
  @apply flex items-center space-x-2;
}

.chart-control-select {
  @apply text-sm border border-neutral-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.chart-control-button {
  @apply inline-flex items-center justify-center w-8 h-8 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.chart-container {
  @apply relative w-full;
}

.chart-loading,
.chart-error,
.chart-empty {
  @apply flex flex-col items-center justify-center py-12;
}

.loading-skeleton {
  @apply w-full max-w-md;
}

.skeleton-bars {
  @apply flex items-end justify-between space-x-2 h-32;
}

.skeleton-bar {
  @apply bg-neutral-200 rounded-t animate-pulse;
  width: 12%;
}

.error-retry-button {
  @apply px-4 py-2 text-sm font-medium text-white bg-error-600 hover:bg-error-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2;
}

.chart-content {
  @apply w-full;
}

.chart-svg {
  @apply w-full h-auto;
}

/* Grid and axes */
.grid-line {
  @apply stroke-neutral-200;
  stroke-width: 1;
}

.axis-line {
  @apply stroke-neutral-400;
  stroke-width: 1;
}

.axis-label {
  @apply fill-neutral-600 text-xs;
}

/* Line chart */
.chart-line--primary {
  @apply stroke-primary-600;
}

.chart-line--secondary {
  @apply stroke-secondary-600;
}

.chart-line--success {
  @apply stroke-success-600;
}

.chart-line--warning {
  @apply stroke-warning-600;
}

.chart-line--error {
  @apply stroke-error-600;
}

.chart-line--info {
  @apply stroke-info-600;
}

.chart-area--primary {
  @apply fill-primary-100;
  opacity: 0.3;
}

.chart-area--secondary {
  @apply fill-secondary-100;
  opacity: 0.3;
}

.chart-area--success {
  @apply fill-success-100;
  opacity: 0.3;
}

.chart-area--warning {
  @apply fill-warning-100;
  opacity: 0.3;
}

.chart-area--error {
  @apply fill-error-100;
  opacity: 0.3;
}

.chart-area--info {
  @apply fill-info-100;
  opacity: 0.3;
}

.data-point {
  @apply cursor-pointer transition-all duration-200;
}

.data-point:hover {
  r: 6;
}

.data-point--primary {
  @apply fill-primary-600 stroke-white;
  stroke-width: 2;
}

.data-point--secondary {
  @apply fill-secondary-600 stroke-white;
  stroke-width: 2;
}

.data-point--success {
  @apply fill-success-600 stroke-white;
  stroke-width: 2;
}

.data-point--warning {
  @apply fill-warning-600 stroke-white;
  stroke-width: 2;
}

.data-point--error {
  @apply fill-error-600 stroke-white;
  stroke-width: 2;
}

.data-point--info {
  @apply fill-info-600 stroke-white;
  stroke-width: 2;
}

/* Bar chart */
.chart-bar {
  @apply cursor-pointer transition-all duration-200;
}

.chart-bar:hover {
  opacity: 0.8;
}

.chart-bar--primary {
  @apply fill-primary-600;
}

.chart-bar--secondary {
  @apply fill-secondary-600;
}

.chart-bar--success {
  @apply fill-success-600;
}

.chart-bar--warning {
  @apply fill-warning-600;
}

.chart-bar--error {
  @apply fill-error-600;
}

.chart-bar--info {
  @apply fill-info-600;
}

/* Donut chart */
.donut-segment {
  @apply cursor-pointer transition-all duration-200;
}

.donut-segment:hover {
  opacity: 0.8;
}

.donut-segment--primary {
  @apply fill-primary-600;
}

.donut-segment--secondary {
  @apply fill-secondary-600;
}

.donut-segment--success {
  @apply fill-success-600;
}

.donut-segment--warning {
  @apply fill-warning-600;
}

.donut-segment--error {
  @apply fill-error-600;
}

.donut-segment--info {
  @apply fill-info-600;
}

.donut-center-text {
  @apply fill-neutral-900 text-lg font-semibold;
}

.chart-legend {
  @apply mt-4 space-y-2;
}

.legend-item {
  @apply flex items-center justify-between;
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
  @apply text-sm text-neutral-700 flex-1;
}

.legend-value {
  @apply text-sm font-medium text-neutral-900;
}

/* Chart footer */
.chart-footer {
  @apply mt-4 pt-4 border-t border-neutral-200;
}

.summary-stats {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.summary-stat {
  @apply text-center;
}

.stat-label {
  @apply block text-xs text-neutral-500 mb-1;
}

.stat-value {
  @apply block text-lg font-semibold text-neutral-900;
}

/* Tooltip */
.chart-tooltip {
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
.theme-dark .chart-control-select {
  @apply bg-neutral-800 border-neutral-600 text-neutral-200;
}

.theme-dark .grid-line {
  @apply stroke-neutral-700;
}

.theme-dark .axis-line {
  @apply stroke-neutral-600;
}

.theme-dark .axis-label {
  @apply fill-neutral-400;
}

.theme-dark .skeleton-bar {
  @apply bg-neutral-700;
}

.theme-dark .legend-label {
  @apply text-neutral-300;
}

.theme-dark .legend-value {
  @apply text-neutral-100;
}

.theme-dark .stat-label {
  @apply text-neutral-400;
}

.theme-dark .stat-value {
  @apply text-neutral-100;
}

.theme-dark .donut-center-text {
  @apply fill-neutral-100;
}

/* Responsive */
@media (max-width: 640px) {
  .chart-controls {
    @apply flex-wrap gap-2;
  }
  
  .summary-stats {
    @apply grid-cols-2;
  }
  
  .chart-legend {
    @apply text-sm;
  }
}

/* Animation */
.chart-line,
.chart-bar,
.donut-segment {
  animation: chart-fade-in 0.6s ease-out;
}

@keyframes chart-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .chart-line,
  .chart-bar,
  .donut-segment,
  .data-point {
    animation: none;
    transition: none;
  }
}
</style>