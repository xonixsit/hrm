<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Organization Chart"
      subtitle="Visual representation of your organizational structure"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <ContentCard class="overflow-hidden">
        <!-- Chart Controls -->
        <div class="border-b border-neutral-200 p-4 bg-neutral-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-neutral-700">View:</label>
                <BaseSelect
                  v-model="viewMode"
                  class="w-40"
                >
                  <option value="departments">Departments</option>
                  <option value="employees">Employees</option>
                  <option value="mixed">Mixed View</option>
                </BaseSelect>
              </div>
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-neutral-700">Layout:</label>
                <BaseSelect
                  v-model="layoutDirection"
                  class="w-32"
                >
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                </BaseSelect>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="zoomOut"
                class="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                :disabled="zoomLevel <= 0.5"
              >
                <Icon name="minus" class="w-4 h-4" />
              </button>
              <span class="text-sm text-neutral-600 min-w-[60px] text-center">
                {{ Math.round(zoomLevel * 100) }}%
              </span>
              <button
                @click="zoomIn"
                class="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                :disabled="zoomLevel >= 2"
              >
                <Icon name="plus" class="w-4 h-4" />
              </button>
              <button
                @click="resetZoom"
                class="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Organization Chart -->
        <div class="relative overflow-auto" style="height: 600px;">
          <div 
            class="org-chart-container"
            :style="{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              minWidth: '100%',
              minHeight: '100%'
            }"
          >
            <!-- Root Level (CEO/Top Management) -->
            <div class="flex justify-center py-8">
              <div v-if="rootDepartment" class="org-chart-node">
                <DepartmentNode
                  :department="rootDepartment"
                  :view-mode="viewMode"
                  :is-root="true"
                  @node-click="handleNodeClick"
                />
              </div>
            </div>

            <!-- Department Hierarchy -->
            <div v-if="departmentHierarchy.length > 0" class="relative">
              <!-- Connection Lines -->
              <svg class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 1;">
                <g v-for="connection in connections" :key="`${connection.from}-${connection.to}`">
                  <line
                    :x1="connection.x1"
                    :y1="connection.y1"
                    :x2="connection.x2"
                    :y2="connection.y2"
                    stroke="#d1d5db"
                    stroke-width="2"
                  />
                </g>
              </svg>

              <!-- Department Levels -->
              <div 
                v-for="(level, levelIndex) in departmentHierarchy" 
                :key="levelIndex"
                class="flex justify-center space-x-8 py-8"
                style="z-index: 2; position: relative;"
              >
                <div 
                  v-for="department in level" 
                  :key="department.id"
                  class="org-chart-node"
                >
                  <DepartmentNode
                    :department="department"
                    :view-mode="viewMode"
                    @node-click="handleNodeClick"
                  />
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!rootDepartment && departmentHierarchy.length === 0" class="text-center py-16">
              <BuildingOfficeIcon class="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-neutral-900 mb-2">No Organization Structure</h3>
              <p class="text-neutral-600 mb-4">Create departments and assign managers to build your organization chart.</p>
              <button
                @click="router.visit(route('departments.create'))"
                class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon class="w-4 h-4 mr-2" />
                Create Department
              </button>
            </div>
          </div>
        </div>
      </ContentCard>

      <!-- Department Details Modal -->
      <DepartmentModal
        v-if="selectedDepartment"
        :department="selectedDepartment"
        @close="selectedDepartment = null"
      />
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import ContentCard from '@/Components/Layout/ContentCard.vue'
import BaseSelect from '@/Components/Base/BaseSelect.vue'
import Icon from '@/Components/Base/Icon.vue'
import DepartmentNode from '@/Components/Organization/DepartmentNode.vue'
import DepartmentModal from '@/Components/Organization/DepartmentModal.vue'
import { 
  BuildingOfficeIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  PrinterIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  departments: {
    type: Array,
    required: true
  }
})

// Reactive state
const viewMode = ref('departments')
const layoutDirection = ref('vertical')
const zoomLevel = ref(1)
const selectedDepartment = ref(null)

// Breadcrumbs configuration
const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'People Management', href: '#' },
  { label: 'Departments', href: route('departments.index') },
  { label: 'Organization Chart', current: true }
]

// Header actions
const headerActions = [
  {
    id: 'export-chart',
    label: 'Export Chart',
    icon: ArrowDownTrayIcon,
    variant: 'secondary',
    handler: () => exportChart()
  },
  {
    id: 'print-chart',
    label: 'Print Chart',
    icon: PrinterIcon,
    variant: 'secondary',
    handler: () => printChart()
  }
]

// Computed properties
const rootDepartment = computed(() => {
  return props.departments.find(dept => !dept.parent_id && dept.manager)
})

const departmentHierarchy = computed(() => {
  const hierarchy = []
  const processed = new Set()
  
  // Start with departments that have no parent (root level)
  let currentLevel = props.departments.filter(dept => !dept.parent_id && dept.id !== rootDepartment.value?.id)
  
  while (currentLevel.length > 0) {
    hierarchy.push([...currentLevel])
    
    // Mark current level as processed
    currentLevel.forEach(dept => processed.add(dept.id))
    
    // Find next level (children of current level)
    const nextLevel = []
    currentLevel.forEach(parent => {
      const children = props.departments.filter(dept => 
        dept.parent_id === parent.id && !processed.has(dept.id)
      )
      nextLevel.push(...children)
    })
    
    currentLevel = nextLevel
  }
  
  return hierarchy
})

const connections = computed(() => {
  // This would calculate connection lines between nodes
  // For now, return empty array - would need actual DOM measurements
  return []
})

// Methods
const handleNodeClick = (department) => {
  selectedDepartment.value = department
}

const zoomIn = () => {
  if (zoomLevel.value < 2) {
    zoomLevel.value = Math.min(2, zoomLevel.value + 0.1)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1)
  }
}

const resetZoom = () => {
  zoomLevel.value = 1
}

const exportChart = () => {
  // Implementation for exporting the chart as image/PDF
  console.log('Exporting organization chart...')
}

const printChart = () => {
  window.print()
}

onMounted(() => {
  // Any initialization logic
})
</script>

<style scoped>
.org-chart-container {
  transition: transform 0.2s ease-in-out;
}

.org-chart-node {
  position: relative;
}

@media print {
  .org-chart-container {
    transform: none !important;
  }
}
</style>