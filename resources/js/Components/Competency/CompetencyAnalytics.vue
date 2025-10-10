<template>
  <div class="competency-analytics">
    <!-- Analytics Header -->
    <div class="analytics-header">
      <div class="header-content">
        <h2 class="analytics-title">Competency Analytics</h2>
        <p class="analytics-subtitle">Key metrics and insights for competency performance</p>
      </div>
      <div class="header-actions">
        <button
          @click="refreshData"
          :disabled="loading"
          class="refresh-button"
        >
          <ArrowPathIcon :class="['w-4 h-4', { 'animate-spin': loading }]" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="metrics-grid">
      <StatsCard
        :value="metrics.total_assessments"
        label="Total Assessments"
        icon="document-text"
        variant="primary"
        :loading="loading"
        size="medium"
      />
      <StatsCard
        :value="formatRating(metrics.average_rating)"
        label="Average Rating"
        icon="star"
        variant="success"
        :loading="loading"
        size="medium"
        suffix="/5"
      />
      <StatsCard
        :value="metrics.critical_gaps"
        label="Critical Gaps"
        icon="exclamation-triangle"
        variant="warning"
        :loading="loading"
        size="medium"
        :urgent="metrics.critical_gaps > 5"
      />
      <StatsCard
        :value="metrics.employees_assessed"
        label="Employees Assessed"
        icon="users"
        variant="info"
        :loading="loading"
        size="medium"
      />
    </div>

    <!-- Analytics Content Grid -->
    <div class="analytics-grid">
      <!-- Competency Radar Chart -->
      <div class="analytics-card radar-chart-card">
        <DashboardWidget
          title="Competency Overview"
          :loading="loading"
          class="competency-radar"
        >
          <template #actions>
            <select
              v-model="selectedEmployee"
              @change="handleEmployeeChange"
              class="employee-select"
            >
              <option value="">All Employees</option>
              <option
                v-for="employee in employees"
                :key="employee.id"
                :value="employee.id"
              >
                {{ employee.name }}
              </option>
            </select>
          </template>

          <div v-if="!loading && radarData.length > 0" class="radar-container">
            <CompetencyRadarChart
              :data="radarData"
              :employee="selectedEmployeeData"
              :height="300"
            />
          </div>
          <div v-else-if="!loading" class="empty-state">
            <ChartBarIcon class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p class="text-neutral-500 text-center">No competency data available</p>
          </div>
        </DashboardWidget>
      </div>

      <!-- Skill Gap Matrix -->
      <div class="analytics-card skill-gap-card">
        <DashboardWidget
          title="Skill Gap Analysis"
          :loading="loading"
          class="skill-gap-matrix"
        >
          <template #actions>
            <select
              v-model="selectedDepartment"
              @change="handleDepartmentChange"
              class="department-select"
            >
              <option value="">All Departments</option>
              <option
                v-for="department in departments"
                :key="department.id"
                :value="department.id"
              >
                {{ department.name }}
              </option>
            </select>
          </template>

          <div v-if="!loading && skillGaps.length > 0" class="skill-gap-container">
            <SkillGapMatrix
              :gaps="skillGaps"
              :departments="departments"
              @gap-click="handleGapClick"
            />
          </div>
          <div v-else-if="!loading" class="empty-state">
            <ExclamationTriangleIcon class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p class="text-neutral-500 text-center">No skill gaps identified</p>
          </div>
        </DashboardWidget>
      </div>

      <!-- Trend Analysis Chart -->
      <div class="analytics-card trend-chart-card">
        <ChartWidget
          title="Competency Trends"
          :data="trendData"
          type="line"
          color="primary"
          :height="300"
          :loading="loading"
          :show-area="true"
          :show-points="true"
          :time-ranges="trendTimeRanges"
          @time-range-change="handleTrendTimeRangeChange"
          @refresh="refreshTrendData"
        />
      </div>

      <!-- Rating Distribution -->
      <div class="analytics-card distribution-card">
        <ChartWidget
          title="Rating Distribution"
          :data="distributionData"
          type="donut"
          color="secondary"
          :height="300"
          :loading="loading"
          :show-legend="true"
          :center-text="distributionCenterText"
          @refresh="refreshDistributionData"
        />
      </div>

      <!-- Category Performance -->
      <div class="analytics-card category-performance-card">
        <ChartWidget
          title="Performance by Category"
          :data="categoryData"
          type="bar"
          color="success"
          :height="300"
          :loading="loading"
          :show-grid="true"
          :show-labels="true"
          @refresh="refreshCategoryData"
        />
      </div>

      <!-- Interactive Filters -->
      <div class="analytics-card filters-card">
        <DashboardWidget
          title="Filters & Options"
          class="analytics-filters"
        >
          <div class="filter-grid">
            <!-- Date Range Filter -->
            <div class="filter-group">
              <label class="filter-label">Date Range</label>
              <select
                v-model="filters.dateRange"
                @change="applyFilters"
                class="filter-select"
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>

            <!-- Assessment Type Filter -->
            <div class="filter-group">
              <label class="filter-label">Assessment Type</label>
              <select
                v-model="filters.assessmentType"
                @change="applyFilters"
                class="filter-select"
              >
                <option value="">All Types</option>
                <option value="self">Self Assessment</option>
                <option value="manager">Manager Assessment</option>
                <option value="peer">Peer Assessment</option>
                <option value="360">360° Feedback</option>
              </select>
            </div>

            <!-- Competency Category Filter -->
            <div class="filter-group">
              <label class="filter-label">Category</label>
              <select
                v-model="filters.category"
                @change="applyFilters"
                class="filter-select"
              >
                <option value="">All Categories</option>
                <option
                  v-for="category in competencyCategories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>

            <!-- Export Options -->
            <div class="filter-group">
              <label class="filter-label">Export</label>
              <div class="export-buttons">
                <button
                  @click="exportData('pdf')"
                  :disabled="loading"
                  class="export-button"
                >
                  <DocumentArrowDownIcon class="w-4 h-4" />
                  PDF
                </button>
                <button
                  @click="exportData('excel')"
                  :disabled="loading"
                  class="export-button"
                >
                  <TableCellsIcon class="w-4 h-4" />
                  Excel
                </button>
              </div>
            </div>
          </div>
        </DashboardWidget>
      </div>
    </div>

    <!-- Detailed Insights Section -->
    <div v-if="insights && insights.length > 0" class="insights-section">
      <h3 class="insights-title">Key Insights</h3>
      <div class="insights-grid">
        <div
          v-for="insight in insights"
          :key="insight.id"
          class="insight-card"
          :class="`insight-card--${insight.type}`"
        >
          <div class="insight-icon">
            <component :is="getInsightIcon(insight.type)" class="w-6 h-6" />
          </div>
          <div class="insight-content">
            <h4 class="insight-title">{{ insight.title }}</h4>
            <p class="insight-description">{{ insight.description }}</p>
            <div v-if="insight.action" class="insight-action">
              <button
                @click="handleInsightAction(insight)"
                class="insight-action-button"
              >
                {{ insight.action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import axios from 'axios';

// Components
import DashboardWidget from '@/Components/Dashboard/DashboardWidget.vue';
import ChartWidget from '@/Components/Dashboard/ChartWidget.vue';
import StatsCard from '@/Components/Dashboard/StatsCard.vue';
import CompetencyRadarChart from './CompetencyRadarChart.vue';
import SkillGapMatrix from './SkillGapMatrix.vue';

// Icons
import {
  ArrowPathIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  LightBulbIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  employees: {
    type: Array,
    default: () => []
  },
  departments: {
    type: Array,
    default: () => []
  },
  competencyCategories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['data-updated', 'export-requested', 'insight-action']);

// Local state
const loading = ref(false);
const selectedEmployee = ref('');
const selectedDepartment = ref('');

// Analytics data
const metrics = ref({
  total_assessments: 0,
  average_rating: 0,
  critical_gaps: 0,
  employees_assessed: 0,
  competencies_tracked: 0,
  improvement_trends: {}
});

const radarData = ref([]);
const skillGaps = ref([]);
const trendData = ref([]);
const distributionData = ref([]);
const categoryData = ref([]);
const insights = ref([]);

// Filters
const filters = reactive({
  dateRange: '90d',
  assessmentType: '',
  category: '',
  employeeId: '',
  departmentId: ''
});

// Time ranges for trend analysis
const trendTimeRanges = [
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '1y' }
];

// Computed properties
const selectedEmployeeData = computed(() => {
  if (!selectedEmployee.value) return null;
  return props.employees.find(emp => emp.id === parseInt(selectedEmployee.value));
});

const distributionCenterText = computed(() => {
  const total = distributionData.value.reduce((sum, item) => sum + item.y, 0);
  return total > 0 ? total.toString() : '0';
});

const formatRating = (rating) => {
  return rating ? parseFloat(rating).toFixed(1) : '0.0';
};

// Methods
const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadDashboardData(),
      loadRadarData(),
      loadSkillGaps(),
      loadTrendData(),
      loadDistributionData(),
      loadCategoryData(),
      loadInsights()
    ]);
    emit('data-updated');
  } catch (error) {
    console.error('Failed to refresh analytics data:', error);
  } finally {
    loading.value = false;
  }
};

const loadDashboardData = async () => {
  try {
    const response = await axios.get('/api/competency-analytics/dashboard', {
      params: buildApiParams()
    });
    
    if (response.data.success) {
      metrics.value = response.data.data.metrics;
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
};

const loadRadarData = async () => {
  try {
    const endpoint = selectedEmployee.value 
      ? `/api/competency-analytics/employee/${selectedEmployee.value}`
      : '/api/competency-analytics/dashboard';
    
    const response = await axios.get(endpoint, {
      params: buildApiParams()
    });
    
    if (response.data.success) {
      if (selectedEmployee.value) {
        // Transform employee competency data for radar chart
        const competencyScores = response.data.data.competency_score.competency_scores || [];
        radarData.value = competencyScores.map(comp => ({
          label: comp.competency_name,
          value: comp.rating,
          category: comp.category,
          weight: comp.weight
        }));
      } else {
        // Transform organizational data for radar chart
        const categoryScores = response.data.data.distribution.category_distribution || {};
        radarData.value = Object.entries(categoryScores).map(([category, data]) => ({
          label: category,
          value: data.average_rating,
          category: category,
          count: data.count
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load radar data:', error);
    radarData.value = [];
  }
};

const loadSkillGaps = async () => {
  try {
    const response = await axios.get('/api/competency-analytics/skill-gaps', {
      params: buildApiParams()
    });
    
    if (response.data.success) {
      skillGaps.value = response.data.data.competency_gaps || [];
    }
  } catch (error) {
    console.error('Failed to load skill gaps:', error);
    skillGaps.value = [];
  }
};

const loadTrendData = async () => {
  try {
    const response = await axios.get('/api/competency-analytics/trends', {
      params: {
        ...buildApiParams(),
        months: getTrendMonths()
      }
    });
    
    if (response.data.success) {
      const trends = response.data.data.organizational || [];
      trendData.value = trends.map(trend => ({
        x: trend.month,
        y: trend.average_rating,
        label: trend.month
      }));
    }
  } catch (error) {
    console.error('Failed to load trend data:', error);
    trendData.value = [];
  }
};

const loadDistributionData = async () => {
  try {
    const response = await axios.get('/api/competency-analytics/distribution', {
      params: buildApiParams()
    });
    
    if (response.data.success) {
      const distribution = response.data.data.rating_distribution || {};
      distributionData.value = Object.entries(distribution).map(([rating, count]) => ({
        x: parseInt(rating),
        y: count,
        label: `Rating ${rating}`,
        value: count
      }));
    }
  } catch (error) {
    console.error('Failed to load distribution data:', error);
    distributionData.value = [];
  }
};

const loadCategoryData = async () => {
  try {
    const response = await axios.get('/api/competency-analytics/distribution', {
      params: buildApiParams()
    });
    
    if (response.data.success) {
      const categories = response.data.data.category_distribution || {};
      categoryData.value = Object.entries(categories).map(([category, data]) => ({
        x: category,
        y: data.average_rating,
        label: category,
        value: data.average_rating
      }));
    }
  } catch (error) {
    console.error('Failed to load category data:', error);
    categoryData.value = [];
  }
};

const loadInsights = async () => {
  try {
    const response = await axios.get('/api/competency-analytics/insights', {
      params: buildApiParams()
    });
    
    if (response.data.success) {
      const insightData = response.data.data;
      insights.value = generateInsights(insightData);
    }
  } catch (error) {
    console.error('Failed to load insights:', error);
    insights.value = [];
  }
};

const generateInsights = (data) => {
  const insights = [];
  
  // Generate insights based on data patterns
  if (data.type === 'organizational') {
    const criticalGaps = data.skill_gaps?.critical_gaps || [];
    if (criticalGaps.length > 0) {
      insights.push({
        id: 'critical-gaps',
        type: 'warning',
        title: `${criticalGaps.length} Critical Skill Gaps Identified`,
        description: `Areas requiring immediate attention: ${criticalGaps.slice(0, 3).map(gap => gap.competency_name).join(', ')}`,
        action: {
          label: 'View Details',
          type: 'view-gaps'
        }
      });
    }
    
    // Add more organizational insights...
  } else if (data.type === 'employee') {
    const strengths = data.strengths || [];
    const improvements = data.improvement_areas || [];
    
    if (strengths.length > 0) {
      insights.push({
        id: 'employee-strengths',
        type: 'success',
        title: `${strengths.length} Key Strengths Identified`,
        description: `Top performing areas: ${strengths.slice(0, 3).map(s => s.competency_name).join(', ')}`,
        action: {
          label: 'View Profile',
          type: 'view-employee'
        }
      });
    }
    
    if (improvements.length > 0) {
      insights.push({
        id: 'employee-improvements',
        type: 'info',
        title: `${improvements.length} Areas for Development`,
        description: `Focus areas: ${improvements.slice(0, 3).map(i => i.competency_name).join(', ')}`,
        action: {
          label: 'Create Plan',
          type: 'create-development-plan'
        }
      });
    }
  }
  
  return insights;
};

const buildApiParams = () => {
  const params = {};
  
  if (filters.dateRange) {
    const now = new Date();
    const daysMap = { '30d': 30, '90d': 90, '6m': 180, '1y': 365 };
    const days = daysMap[filters.dateRange] || 90;
    const fromDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    params.date_from = fromDate.toISOString().split('T')[0];
    params.date_to = now.toISOString().split('T')[0];
  }
  
  if (filters.assessmentType) {
    params.assessment_type = filters.assessmentType;
  }
  
  if (selectedDepartment.value) {
    params.department_id = selectedDepartment.value;
  }
  
  if (selectedEmployee.value) {
    params.employee_id = selectedEmployee.value;
  }
  
  return params;
};

const getTrendMonths = () => {
  const monthsMap = { '30d': 1, '90d': 3, '6m': 6, '1y': 12 };
  return monthsMap[filters.dateRange] || 3;
};

// Event handlers
const handleEmployeeChange = () => {
  filters.employeeId = selectedEmployee.value;
  loadRadarData();
};

const handleDepartmentChange = () => {
  filters.departmentId = selectedDepartment.value;
  applyFilters();
};

const handleTrendTimeRangeChange = (timeRange) => {
  filters.dateRange = timeRange;
  applyFilters();
};

const handleGapClick = (gap) => {
  // Navigate to detailed gap analysis or employee profile
  if (gap.employee_id) {
    router.visit(route('employees.show', gap.employee_id));
  }
};

const handleInsightAction = (insight) => {
  emit('insight-action', insight);
  
  switch (insight.action.type) {
    case 'view-gaps':
      // Navigate to skill gaps page
      router.visit(route('competency-analytics.reports', { type: 'skill_gaps' }));
      break;
    case 'view-employee':
      if (selectedEmployee.value) {
        router.visit(route('employees.show', selectedEmployee.value));
      }
      break;
    case 'create-development-plan':
      // Navigate to development plan creation
      if (selectedEmployee.value) {
        router.visit(route('competency.development-plans.create', { employee: selectedEmployee.value }));
      }
      break;
  }
};

const applyFilters = () => {
  refreshData();
};

const refreshTrendData = () => {
  loadTrendData();
};

const refreshDistributionData = () => {
  loadDistributionData();
};

const refreshCategoryData = () => {
  loadCategoryData();
};

const exportData = async (format) => {
  try {
    loading.value = true;
    
    const response = await axios.post('/api/competency-analytics/export', {
      type: 'dashboard',
      format: format,
      filters: buildApiParams()
    });
    
    if (response.data.success && response.data.download_url) {
      // Trigger download
      window.open(response.data.download_url, '_blank');
    }
    
    emit('export-requested', { format, success: true });
  } catch (error) {
    console.error('Export failed:', error);
    emit('export-requested', { format, success: false, error });
  } finally {
    loading.value = false;
  }
};

const getInsightIcon = (type) => {
  const iconMap = {
    success: TrendingUpIcon,
    warning: ExclamationTriangleIcon,
    error: ExclamationCircleIcon,
    info: LightBulbIcon
  };
  return iconMap[type] || LightBulbIcon;
};

// Initialize data
onMounted(() => {
  if (props.initialData && Object.keys(props.initialData).length > 0) {
    // Use initial data if provided
    metrics.value = props.initialData.metrics || metrics.value;
    radarData.value = props.initialData.radarData || [];
    skillGaps.value = props.initialData.skillGaps || [];
    trendData.value = props.initialData.trendData || [];
    distributionData.value = props.initialData.distributionData || [];
    categoryData.value = props.initialData.categoryData || [];
    insights.value = props.initialData.insights || [];
  } else {
    // Load data from API
    refreshData();
  }
});

// Watch for filter changes
watch(() => filters.dateRange, () => {
  applyFilters();
});
</script>

<style scoped>
.competency-analytics {
  @apply space-y-8;
}

/* Analytics Header */
.analytics-header {
  @apply flex items-center justify-between mb-6;
}

.header-content {
  @apply flex-1;
}

.analytics-title {
  @apply text-2xl font-bold text-neutral-900 mb-1;
}

.analytics-subtitle {
  @apply text-neutral-600;
}

.header-actions {
  @apply flex items-center space-x-3;
}

.refresh-button {
  @apply inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

/* Metrics Grid */
.metrics-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8;
}

/* Analytics Grid */
.analytics-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6;
}

.analytics-card {
  @apply bg-white rounded-lg shadow-sm border border-neutral-200;
}

.radar-chart-card {
  @apply lg:col-span-1;
}

.skill-gap-card {
  @apply lg:col-span-1;
}

.trend-chart-card {
  @apply lg:col-span-2 xl:col-span-2;
}

.distribution-card {
  @apply lg:col-span-1;
}

.category-performance-card {
  @apply lg:col-span-2 xl:col-span-2;
}

.filters-card {
  @apply lg:col-span-1;
}

/* Selects */
.employee-select,
.department-select {
  @apply text-sm border border-neutral-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

/* Empty States */
.empty-state {
  @apply flex flex-col items-center justify-center py-12;
}

/* Radar Container */
.radar-container {
  @apply w-full h-full flex items-center justify-center;
}

/* Skill Gap Container */
.skill-gap-container {
  @apply w-full;
}

/* Filters */
.filter-grid {
  @apply grid grid-cols-1 gap-4;
}

.filter-group {
  @apply space-y-2;
}

.filter-label {
  @apply block text-sm font-medium text-neutral-700;
}

.filter-select {
  @apply w-full text-sm border border-neutral-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.export-buttons {
  @apply flex space-x-2;
}

.export-button {
  @apply inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 border border-neutral-300 rounded-md hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

/* Insights Section */
.insights-section {
  @apply mt-8;
}

.insights-title {
  @apply text-lg font-semibold text-neutral-900 mb-4;
}

.insights-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.insight-card {
  @apply flex items-start space-x-3 p-4 rounded-lg border;
}

.insight-card--success {
  @apply bg-success-50 border-success-200;
}

.insight-card--warning {
  @apply bg-warning-50 border-warning-200;
}

.insight-card--error {
  @apply bg-error-50 border-error-200;
}

.insight-card--info {
  @apply bg-info-50 border-info-200;
}

.insight-icon {
  @apply flex-shrink-0 mt-0.5;
}

.insight-card--success .insight-icon {
  @apply text-success-600;
}

.insight-card--warning .insight-icon {
  @apply text-warning-600;
}

.insight-card--error .insight-icon {
  @apply text-error-600;
}

.insight-card--info .insight-icon {
  @apply text-info-600;
}

.insight-content {
  @apply flex-1 min-w-0;
}

.insight-title {
  @apply text-sm font-medium text-neutral-900 mb-1;
}

.insight-description {
  @apply text-sm text-neutral-600 mb-2;
}

.insight-action {
  @apply mt-2;
}

.insight-action-button {
  @apply text-xs font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:underline;
}

/* Dark theme */
.theme-dark .analytics-title {
  @apply text-neutral-100;
}

.theme-dark .analytics-subtitle {
  @apply text-neutral-400;
}

.theme-dark .refresh-button {
  @apply text-neutral-300 bg-neutral-800 border-neutral-600 hover:bg-neutral-700;
}

.theme-dark .analytics-card {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .employee-select,
.theme-dark .department-select,
.theme-dark .filter-select {
  @apply bg-neutral-800 border-neutral-600 text-neutral-200;
}

.theme-dark .filter-label {
  @apply text-neutral-300;
}

.theme-dark .export-button {
  @apply text-neutral-300 bg-neutral-700 border-neutral-600 hover:bg-neutral-600;
}

.theme-dark .insights-title {
  @apply text-neutral-100;
}

.theme-dark .insight-title {
  @apply text-neutral-100;
}

.theme-dark .insight-description {
  @apply text-neutral-400;
}

/* Responsive */
@media (max-width: 768px) {
  .analytics-header {
    @apply flex-col items-start space-y-4;
  }
  
  .header-actions {
    @apply w-full justify-end;
  }
  
  .metrics-grid {
    @apply grid-cols-2;
  }
  
  .analytics-grid {
    @apply grid-cols-1;
  }
  
  .insights-grid {
    @apply grid-cols-1;
  }
}

@media (max-width: 640px) {
  .metrics-grid {
    @apply grid-cols-1;
  }
  
  .export-buttons {
    @apply flex-col space-x-0 space-y-2;
  }
}

/* Animation */
.analytics-card {
  animation: fade-in-up 0.6s ease-out;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .analytics-card {
    animation: none;
  }
}
</style>