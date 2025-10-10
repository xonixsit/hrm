<template>
  <div class="skill-gap-matrix">
    <!-- Matrix Header -->
    <div class="matrix-header">
      <div class="header-controls">
        <div class="view-toggle">
          <button
            @click="viewMode = 'heatmap'"
            :class="['toggle-button', { active: viewMode === 'heatmap' }]"
          >
            <Squares2X2Icon class="w-4 h-4" />
            Heatmap
          </button>
          <button
            @click="viewMode = 'list'"
            :class="['toggle-button', { active: viewMode === 'list' }]"
          >
            <ListBulletIcon class="w-4 h-4" />
            List
          </button>
        </div>
        <div class="severity-filter">
          <select
            v-model="selectedSeverity"
            @change="filterBySeverity"
            class="severity-select"
          >
            <option value="">All Severities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Heatmap View -->
    <div v-if="viewMode === 'heatmap'" class="heatmap-container">
      <div v-if="filteredGaps.length === 0" class="empty-state">
        <ExclamationTriangleIcon class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p class="text-neutral-500 text-center">No skill gaps found</p>
      </div>
      
      <div v-else class="heatmap-grid">
        <!-- Competency Labels -->
        <div class="competency-labels">
          <div class="label-spacer"></div>
          <div
            v-for="competency in uniqueCompetencies"
            :key="competency.id"
            class="competency-label"
            :title="competency.name"
          >
            {{ truncateText(competency.name, 15) }}
          </div>
        </div>

        <!-- Department Rows -->
        <div
          v-for="department in departmentsWithGaps"
          :key="department.id"
          class="department-row"
        >
          <!-- Department Label -->
          <div class="department-label" :title="department.name">
            {{ truncateText(department.name, 20) }}
          </div>

          <!-- Gap Cells -->
          <div
            v-for="competency in uniqueCompetencies"
            :key="`${department.id}-${competency.id}`"
            class="gap-cell"
            :class="getGapCellClass(department.id, competency.id)"
            :title="getGapCellTooltip(department.id, competency.id)"
            @click="handleGapClick(department.id, competency.id)"
          >
            <div class="gap-indicator">
              <span class="gap-count">{{ getGapCount(department.id, competency.id) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Heatmap Legend -->
      <div class="heatmap-legend">
        <div class="legend-title">Gap Severity</div>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-color legend-color--high"></div>
            <span class="legend-text">High (3+ employees)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color legend-color--medium"></div>
            <span class="legend-text">Medium (2 employees)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color legend-color--low"></div>
            <span class="legend-text">Low (1 employee)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color legend-color--none"></div>
            <span class="legend-text">No gaps</span>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="list-container">
      <div v-if="filteredGaps.length === 0" class="empty-state">
        <ExclamationTriangleIcon class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p class="text-neutral-500 text-center">No skill gaps found</p>
      </div>

      <div v-else class="gap-list">
        <div
          v-for="gap in filteredGaps"
          :key="`${gap.competency_id}-${gap.competency_name}`"
          class="gap-item"
          :class="`gap-item--${gap.gap_severity}`"
          @click="handleGapItemClick(gap)"
        >
          <div class="gap-header">
            <div class="gap-title">
              <h4 class="competency-name">{{ gap.competency_name }}</h4>
              <span class="competency-category">{{ gap.category }}</span>
            </div>
            <div class="gap-severity">
              <span
                class="severity-badge"
                :class="`severity-badge--${gap.gap_severity}`"
              >
                {{ gap.gap_severity.toUpperCase() }}
              </span>
            </div>
          </div>

          <div class="gap-metrics">
            <div class="metric">
              <span class="metric-label">Average Rating</span>
              <span class="metric-value">{{ formatRating(gap.average_rating) }}/5</span>
            </div>
            <div class="metric">
              <span class="metric-label">Employees Below Target</span>
              <span class="metric-value">
                {{ gap.employees_below_target }}/{{ gap.total_employees }}
                ({{ Math.round(gap.below_target_percentage) }}%)
              </span>
            </div>
          </div>

          <div class="gap-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :class="`progress-fill--${gap.gap_severity}`"
                :style="{ width: `${gap.below_target_percentage}%` }"
              ></div>
            </div>
            <span class="progress-text">
              {{ Math.round(gap.below_target_percentage) }}% need improvement
            </span>
          </div>

          <div class="gap-actions">
            <button
              @click.stop="viewGapDetails(gap)"
              class="action-button action-button--primary"
            >
              <EyeIcon class="w-4 h-4" />
              View Details
            </button>
            <button
              @click.stop="createDevelopmentPlan(gap)"
              class="action-button action-button--secondary"
            >
              <AcademicCapIcon class="w-4 h-4" />
              Create Plan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Gap Detail Modal -->
    <div v-if="showGapModal" class="gap-modal-overlay" @click="closeGapModal">
      <div class="gap-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ selectedGap?.competency_name }} - Gap Analysis</h3>
          <button @click="closeGapModal" class="modal-close">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="modal-content">
          <div v-if="selectedGap" class="gap-details">
            <!-- Gap Overview -->
            <div class="detail-section">
              <h4 class="section-title">Overview</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Category</span>
                  <span class="detail-value">{{ selectedGap.category }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Severity</span>
                  <span
                    class="detail-value severity-badge"
                    :class="`severity-badge--${selectedGap.gap_severity}`"
                  >
                    {{ selectedGap.gap_severity.toUpperCase() }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Average Rating</span>
                  <span class="detail-value">{{ formatRating(selectedGap.average_rating) }}/5</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Employees Affected</span>
                  <span class="detail-value">
                    {{ selectedGap.employees_below_target }}/{{ selectedGap.total_employees }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Affected Employees -->
            <div class="detail-section">
              <h4 class="section-title">Affected Employees</h4>
              <div class="employee-list">
                <div
                  v-for="employee in getAffectedEmployees(selectedGap)"
                  :key="employee.id"
                  class="employee-item"
                >
                  <div class="employee-info">
                    <span class="employee-name">{{ employee.name }}</span>
                    <span class="employee-department">{{ employee.department }}</span>
                  </div>
                  <div class="employee-rating">
                    <span class="rating-value">{{ formatRating(employee.rating) }}/5</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="detail-section">
              <h4 class="section-title">Recommendations</h4>
              <div class="recommendations">
                <div class="recommendation-item">
                  <CheckCircleIcon class="w-5 h-5 text-success-600" />
                  <span>Organize targeted training sessions for this competency</span>
                </div>
                <div class="recommendation-item">
                  <CheckCircleIcon class="w-5 h-5 text-success-600" />
                  <span>Pair affected employees with high performers for mentoring</span>
                </div>
                <div class="recommendation-item">
                  <CheckCircleIcon class="w-5 h-5 text-success-600" />
                  <span>Create development plans with specific milestones</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button
            @click="createBulkDevelopmentPlan"
            class="modal-button modal-button--primary"
          >
            Create Development Plans
          </button>
          <button
            @click="closeGapModal"
            class="modal-button modal-button--secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue';
import {
  Squares2X2Icon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  AcademicCapIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  gaps: {
    type: Array,
    default: () => []
  },
  departments: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['gap-click', 'view-details', 'create-plan']);

// Local state
const viewMode = ref('heatmap');
const selectedSeverity = ref('');
const showGapModal = ref(false);
const selectedGap = ref(null);

// Computed properties
const filteredGaps = computed(() => {
  if (!selectedSeverity.value) return props.gaps;
  return props.gaps.filter(gap => gap.gap_severity === selectedSeverity.value);
});

const uniqueCompetencies = computed(() => {
  const competencies = new Map();
  
  filteredGaps.value.forEach(gap => {
    if (!competencies.has(gap.competency_id)) {
      competencies.set(gap.competency_id, {
        id: gap.competency_id,
        name: gap.competency_name,
        category: gap.category
      });
    }
  });
  
  return Array.from(competencies.values()).sort((a, b) => a.name.localeCompare(b.name));
});

const departmentsWithGaps = computed(() => {
  const deptGaps = new Map();
  
  // Initialize with all departments
  props.departments.forEach(dept => {
    deptGaps.set(dept.id, {
      id: dept.id,
      name: dept.name,
      gaps: []
    });
  });
  
  // Add gaps to departments (this would need to be enhanced based on actual data structure)
  filteredGaps.value.forEach(gap => {
    // For now, we'll distribute gaps across departments
    // In a real implementation, this would come from the gap data
    const deptId = props.departments[0]?.id; // Simplified for demo
    if (deptGaps.has(deptId)) {
      deptGaps.get(deptId).gaps.push(gap);
    }
  });
  
  return Array.from(deptGaps.values()).filter(dept => dept.gaps.length > 0);
});

// Methods
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const formatRating = (rating) => {
  return typeof rating === 'number' ? rating.toFixed(1) : '0.0';
};

const getGapCount = (departmentId, competencyId) => {
  // This would calculate the number of employees with gaps for this dept/competency combination
  // For now, returning a mock value
  const gap = filteredGaps.value.find(g => g.competency_id === competencyId);
  return gap ? gap.employees_below_target : 0;
};

const getGapCellClass = (departmentId, competencyId) => {
  const count = getGapCount(departmentId, competencyId);
  
  if (count === 0) return 'gap-cell--none';
  if (count === 1) return 'gap-cell--low';
  if (count === 2) return 'gap-cell--medium';
  return 'gap-cell--high';
};

const getGapCellTooltip = (departmentId, competencyId) => {
  const count = getGapCount(departmentId, competencyId);
  const competency = uniqueCompetencies.value.find(c => c.id === competencyId);
  const department = props.departments.find(d => d.id === departmentId);
  
  return `${department?.name}: ${count} employees need improvement in ${competency?.name}`;
};

const getAffectedEmployees = (gap) => {
  // Mock data - in real implementation, this would come from the gap data
  return [
    { id: 1, name: 'John Doe', department: 'Engineering', rating: 2.1 },
    { id: 2, name: 'Jane Smith', department: 'Engineering', rating: 1.8 },
    { id: 3, name: 'Bob Johnson', department: 'Engineering', rating: 2.3 }
  ].slice(0, gap.employees_below_target);
};

const filterBySeverity = () => {
  // Filtering is handled by computed property
};

const handleGapClick = (departmentId, competencyId) => {
  const gap = filteredGaps.value.find(g => g.competency_id === competencyId);
  if (gap) {
    emit('gap-click', { departmentId, competencyId, gap });
  }
};

const handleGapItemClick = (gap) => {
  selectedGap.value = gap;
  showGapModal.value = true;
};

const viewGapDetails = (gap) => {
  selectedGap.value = gap;
  showGapModal.value = true;
  emit('view-details', gap);
};

const createDevelopmentPlan = (gap) => {
  emit('create-plan', gap);
};

const createBulkDevelopmentPlan = () => {
  if (selectedGap.value) {
    emit('create-plan', selectedGap.value);
    closeGapModal();
  }
};

const closeGapModal = () => {
  showGapModal.value = false;
  selectedGap.value = null;
};
</script>

<style scoped>
.skill-gap-matrix {
  @apply w-full;
}

/* Matrix Header */
.matrix-header {
  @apply mb-6;
}

.header-controls {
  @apply flex items-center justify-between;
}

.view-toggle {
  @apply flex bg-neutral-100 rounded-lg p-1;
}

.toggle-button {
  @apply inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors;
}

.toggle-button:not(.active) {
  @apply text-neutral-600 hover:text-neutral-900;
}

.toggle-button.active {
  @apply text-primary-700 bg-white shadow-sm;
}

.severity-select {
  @apply text-sm border border-neutral-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

/* Heatmap View */
.heatmap-container {
  @apply space-y-6;
}

.heatmap-grid {
  @apply overflow-x-auto;
}

.competency-labels {
  @apply flex;
}

.label-spacer {
  @apply w-32 flex-shrink-0;
}

.competency-label {
  @apply w-24 flex-shrink-0 p-2 text-xs font-medium text-neutral-700 text-center border-b border-neutral-200;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.department-row {
  @apply flex;
}

.department-label {
  @apply w-32 flex-shrink-0 p-3 text-sm font-medium text-neutral-900 bg-neutral-50 border-r border-neutral-200 flex items-center;
}

.gap-cell {
  @apply w-24 h-16 flex-shrink-0 border border-neutral-200 cursor-pointer transition-all duration-200 hover:scale-105;
}

.gap-cell--none {
  @apply bg-neutral-50 hover:bg-neutral-100;
}

.gap-cell--low {
  @apply bg-warning-100 hover:bg-warning-200;
}

.gap-cell--medium {
  @apply bg-warning-300 hover:bg-warning-400;
}

.gap-cell--high {
  @apply bg-error-200 hover:bg-error-300;
}

.gap-indicator {
  @apply w-full h-full flex items-center justify-center;
}

.gap-count {
  @apply text-sm font-bold;
}

.gap-cell--none .gap-count {
  @apply text-neutral-400;
}

.gap-cell--low .gap-count {
  @apply text-warning-800;
}

.gap-cell--medium .gap-count {
  @apply text-warning-900;
}

.gap-cell--high .gap-count {
  @apply text-error-900;
}

/* Heatmap Legend */
.heatmap-legend {
  @apply bg-neutral-50 rounded-lg p-4;
}

.legend-title {
  @apply text-sm font-semibold text-neutral-900 mb-3;
}

.legend-items {
  @apply flex flex-wrap gap-4;
}

.legend-item {
  @apply flex items-center space-x-2;
}

.legend-color {
  @apply w-4 h-4 rounded border border-neutral-300;
}

.legend-color--none {
  @apply bg-neutral-50;
}

.legend-color--low {
  @apply bg-warning-100;
}

.legend-color--medium {
  @apply bg-warning-300;
}

.legend-color--high {
  @apply bg-error-200;
}

.legend-text {
  @apply text-xs text-neutral-600;
}

/* List View */
.list-container {
  @apply space-y-4;
}

.gap-list {
  @apply space-y-4;
}

.gap-item {
  @apply bg-white border border-neutral-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md;
}

.gap-item--high {
  @apply border-error-200 bg-error-50;
}

.gap-item--medium {
  @apply border-warning-200 bg-warning-50;
}

.gap-item--low {
  @apply border-info-200 bg-info-50;
}

.gap-header {
  @apply flex items-start justify-between mb-3;
}

.gap-title {
  @apply flex-1;
}

.competency-name {
  @apply text-lg font-semibold text-neutral-900 mb-1;
}

.competency-category {
  @apply text-sm text-neutral-600;
}

.severity-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.severity-badge--high {
  @apply bg-error-100 text-error-800;
}

.severity-badge--medium {
  @apply bg-warning-100 text-warning-800;
}

.severity-badge--low {
  @apply bg-info-100 text-info-800;
}

.gap-metrics {
  @apply grid grid-cols-2 gap-4 mb-3;
}

.metric {
  @apply text-sm;
}

.metric-label {
  @apply block text-neutral-600 mb-1;
}

.metric-value {
  @apply font-semibold text-neutral-900;
}

.gap-progress {
  @apply mb-4;
}

.progress-bar {
  @apply w-full bg-neutral-200 rounded-full h-2 mb-2;
}

.progress-fill {
  @apply h-full rounded-full transition-all duration-300;
}

.progress-fill--high {
  @apply bg-error-500;
}

.progress-fill--medium {
  @apply bg-warning-500;
}

.progress-fill--low {
  @apply bg-info-500;
}

.progress-text {
  @apply text-xs text-neutral-600;
}

.gap-actions {
  @apply flex space-x-2;
}

.action-button {
  @apply inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.action-button--primary {
  @apply text-primary-700 bg-primary-100 hover:bg-primary-200 focus:ring-primary-500;
}

.action-button--secondary {
  @apply text-neutral-700 bg-neutral-100 hover:bg-neutral-200 focus:ring-neutral-500;
}

/* Empty State */
.empty-state {
  @apply flex flex-col items-center justify-center py-12;
}

/* Gap Modal */
.gap-modal-overlay {
  @apply fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4;
}

.gap-modal {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-neutral-200;
}

.modal-title {
  @apply text-lg font-semibold text-neutral-900;
}

.modal-close {
  @apply text-neutral-400 hover:text-neutral-600 focus:outline-none;
}

.modal-content {
  @apply p-6;
}

.gap-details {
  @apply space-y-6;
}

.detail-section {
  @apply space-y-3;
}

.section-title {
  @apply text-base font-semibold text-neutral-900;
}

.detail-grid {
  @apply grid grid-cols-2 gap-4;
}

.detail-item {
  @apply space-y-1;
}

.detail-label {
  @apply block text-sm text-neutral-600;
}

.detail-value {
  @apply block text-sm font-medium text-neutral-900;
}

.employee-list {
  @apply space-y-2;
}

.employee-item {
  @apply flex items-center justify-between p-3 bg-neutral-50 rounded-lg;
}

.employee-info {
  @apply flex-1;
}

.employee-name {
  @apply block text-sm font-medium text-neutral-900;
}

.employee-department {
  @apply block text-xs text-neutral-600;
}

.employee-rating {
  @apply text-sm font-semibold text-neutral-900;
}

.recommendations {
  @apply space-y-2;
}

.recommendation-item {
  @apply flex items-start space-x-2 text-sm text-neutral-700;
}

.modal-actions {
  @apply flex justify-end space-x-3 p-6 border-t border-neutral-200;
}

.modal-button {
  @apply px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.modal-button--primary {
  @apply text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500;
}

.modal-button--secondary {
  @apply text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-500;
}

/* Dark theme */
.theme-dark .toggle-button:not(.active) {
  @apply text-neutral-400 hover:text-neutral-200;
}

.theme-dark .toggle-button.active {
  @apply text-primary-300 bg-neutral-800;
}

.theme-dark .severity-select {
  @apply bg-neutral-800 border-neutral-600 text-neutral-200;
}

.theme-dark .competency-label {
  @apply text-neutral-300 border-neutral-700;
}

.theme-dark .department-label {
  @apply text-neutral-100 bg-neutral-800 border-neutral-700;
}

.theme-dark .gap-cell {
  @apply border-neutral-700;
}

.theme-dark .gap-item {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .competency-name {
  @apply text-neutral-100;
}

.theme-dark .competency-category {
  @apply text-neutral-400;
}

.theme-dark .metric-label {
  @apply text-neutral-400;
}

.theme-dark .metric-value {
  @apply text-neutral-100;
}

.theme-dark .progress-text {
  @apply text-neutral-400;
}

.theme-dark .gap-modal {
  @apply bg-neutral-800;
}

.theme-dark .modal-title {
  @apply text-neutral-100;
}

.theme-dark .modal-header {
  @apply border-neutral-700;
}

.theme-dark .section-title {
  @apply text-neutral-100;
}

.theme-dark .detail-label {
  @apply text-neutral-400;
}

.theme-dark .detail-value {
  @apply text-neutral-100;
}

.theme-dark .employee-item {
  @apply bg-neutral-700;
}

.theme-dark .employee-name {
  @apply text-neutral-100;
}

.theme-dark .employee-department {
  @apply text-neutral-400;
}

.theme-dark .employee-rating {
  @apply text-neutral-100;
}

.theme-dark .recommendation-item {
  @apply text-neutral-300;
}

.theme-dark .modal-actions {
  @apply border-neutral-700;
}

/* Responsive */
@media (max-width: 768px) {
  .header-controls {
    @apply flex-col space-y-4 items-stretch;
  }
  
  .heatmap-grid {
    @apply text-xs;
  }
  
  .competency-label {
    @apply w-20;
  }
  
  .gap-cell {
    @apply w-20 h-12;
  }
  
  .department-label {
    @apply w-24;
  }
  
  .gap-metrics {
    @apply grid-cols-1;
  }
  
  .gap-actions {
    @apply flex-col space-y-2 space-x-0;
  }
  
  .detail-grid {
    @apply grid-cols-1;
  }
  
  .modal-actions {
    @apply flex-col space-y-2 space-x-0;
  }
}

/* Animation */
.gap-item,
.gap-cell {
  animation: fade-in-up 0.4s ease-out;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .gap-item,
  .gap-cell {
    animation: none;
  }
  
  .gap-cell {
    transition: none;
  }
}
</style>