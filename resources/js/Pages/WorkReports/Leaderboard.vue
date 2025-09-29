<template>
  <AuthenticatedLayout>
    <PageLayout
      title="🏆 Performance Leaderboard"
      subtitle="See who's leading the pack in performance metrics"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Leaderboard Dashboard -->
      <div class="space-y-6">
        <!-- Filter Controls with Better Employee UX -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          
          <!-- Primary: Time Period Selection -->
          <div class="space-y-3">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
              📅 Choose Time Period
            </h3>
            
            <!-- Quick Presets (Most Used) -->
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="period in intelligentPeriods"
                :key="period.key"
                @click="selectIntelligentPeriod(period)"
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
                :class="activePeriod === period.key 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'"
              >
                <span>{{ period.icon }}</span>
                <span>{{ period.label }}</span>
              </button>
            </div>

            <!-- Custom Date Range (Advanced) -->
            <details class="group">
              <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <span class="group-open:rotate-90 transition-transform">▶</span>
                Custom date range
              </summary>
              <div class="mt-3 flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <label class="text-sm font-medium text-gray-700">From:</label>
                  <input
                    v-model="localFilters.date_from"
                    type="date"
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @change="handleDateFromChange"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-sm font-medium text-gray-700">To:</label>
                  <input
                    v-model="localFilters.date_to"
                    type="date"
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @change="handleDateToChange"
                  />
                </div>
              </div>
            </details>
          </div>

          <!-- Secondary: Ranking Method -->
          <div class="border-t border-gray-200 pt-6 space-y-3">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
              🏆 What to Rank By
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- Overall Performance (Recommended) -->
              <button
                @click="leaderboardType = 'score'"
                :class="leaderboardType === 'score' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'"
                class="relative p-4 rounded-lg border-2 transition-all duration-200 text-left group"
              >
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl">🏆</span>
                  <div>
                    <div class="font-semibold">Overall Performance</div>
                    <div class="text-xs opacity-75">Recommended</div>
                  </div>
                </div>
                <p class="text-xs opacity-90">
                  Balanced score combining activity, quality, and consistency
                </p>
                <div v-if="leaderboardType === 'score'" class="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                  ★ Active
                </div>
              </button>

              <!-- Activity -->
              <button
                @click="leaderboardType = 'calls'"
                :class="leaderboardType === 'calls' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:bg-green-50'"
                class="p-4 rounded-lg border-2 transition-all duration-200 text-left"
              >
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl">📞</span>
                  <div>
                    <div class="font-semibold">Activity Level</div>
                    <div class="text-xs opacity-75">Volume focused</div>
                  </div>
                </div>
                <p class="text-xs opacity-90">
                  Who's making the most calls and staying busy
                </p>
              </button>

              <!-- Quality -->
              <button
                @click="leaderboardType = 'success'"
                :class="leaderboardType === 'success' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:bg-purple-50'"
                class="p-4 rounded-lg border-2 transition-all duration-200 text-left"
              >
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl">✅</span>
                  <div>
                    <div class="font-semibold">Success Rate</div>
                    <div class="text-xs opacity-75">Quality focused</div>
                  </div>
                </div>
                <p class="text-xs opacity-90">
                  Who's most effective at converting calls
                </p>
              </button>
            </div>
          </div>
        </div>

        <!-- Top 3 Podium -->
        <div v-if="topPerformers.length >= 3" class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200 p-8">
          <h3 class="text-xl font-bold text-gray-900 text-center mb-8">🏆 Top Performers</h3>
          
          <div class="flex items-end justify-center gap-8">
            <!-- 2nd Place -->
            <div class="text-center">
              <div class="bg-gray-200 rounded-lg p-6 mb-4 relative">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                  2nd
                </div>
                <div class="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                  👤
                </div>
                <h4 class="font-semibold text-gray-900">{{ topPerformers[1]?.name }}</h4>
                <p class="text-sm text-gray-600">{{ getMetricValue(topPerformers[1]) }}</p>
              </div>
            </div>

            <!-- 1st Place -->
            <div class="text-center">
              <div class="bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-lg p-8 mb-4 relative transform scale-110">
                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  🥇 1st
                </div>
                <div class="w-20 h-20 bg-yellow-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                  👤
                </div>
                <h4 class="font-bold text-gray-900 text-lg">{{ topPerformers[0]?.name }}</h4>
                <p class="text-gray-700 font-semibold">{{ getMetricValue(topPerformers[0]) }}</p>
              </div>
            </div>

            <!-- 3rd Place -->
            <div class="text-center">
              <div class="bg-orange-200 rounded-lg p-6 mb-4 relative">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                  3rd
                </div>
                <div class="w-16 h-16 bg-orange-300 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                  👤
                </div>
                <h4 class="font-semibold text-gray-900">{{ topPerformers[2]?.name }}</h4>
                <p class="text-sm text-gray-600">{{ getMetricValue(topPerformers[2]) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Full Leaderboard -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Complete Rankings</h3>
            <p class="text-sm text-gray-600">All employees ranked by {{ getLeaderboardTitle() }}</p>
          </div>
          
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Calls</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance Score</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="(employee, index) in rankedEmployees" 
                  :key="employee.id"
                  :class="getRankRowClass(index + 1)"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span class="text-lg font-bold" :class="getRankTextClass(index + 1)">
                        {{ getRankDisplay(index + 1) }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                        {{ employee.name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ employee.name }}</div>
                        <div class="text-sm text-gray-500">{{ employee.position || 'Employee' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ employee.total_calls }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ employee.success_rate }}%
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ employee.performance_score }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm" :class="employee.trend >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ employee.trend >= 0 ? '+' : '' }}{{ employee.trend }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { router, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'

// Props
const props = defineProps({
  employees: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  }
})

// Reactive data
const localFilters = ref({
  date_from: props.filters.date_from || '',
  date_to: props.filters.date_to || '',
})

const leaderboardType = ref('score') // 'calls', 'success', 'score'
const activePeriod = ref(null)

// Breadcrumbs
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Work Reports', href: route('work-reports.index') },
  { label: 'Leaderboard', href: route('work-reports.leaderboard'), current: true }
])

// Header actions
const headerActions = [
  {
    label: 'Back to Reports',
    href: '/work-reports',
    variant: 'secondary'
  },
  {
    label: 'Export Rankings',
    action: () => exportLeaderboard(),
    variant: 'primary'
  }
]

// Intelligent date periods
const intelligentPeriods = [
  {
    key: 'recent',
    label: 'Recent',
    icon: '⚡',
    days: 7
  },
  {
    key: 'month',
    label: 'This Month',
    icon: '📅',
    days: 30
  }
]

// Computed properties
const rankedEmployees = computed(() => {
  let sorted = [...props.employees]
  
  switch (leaderboardType.value) {
    case 'calls':
      sorted.sort((a, b) => b.total_calls - a.total_calls)
      break
    case 'success':
      sorted.sort((a, b) => b.success_rate - a.success_rate)
      break
    case 'score':
    default:
      sorted.sort((a, b) => b.performance_score - a.performance_score)
      break
  }
  
  return sorted
})

const topPerformers = computed(() => {
  return rankedEmployees.value.slice(0, 3)
})

// Methods
const getMetricValue = (employee) => {
  if (!employee) return ''
  
  switch (leaderboardType.value) {
    case 'calls':
      return `${employee.total_calls} calls`
    case 'success':
      return `${employee.success_rate}% success`
    case 'score':
    default:
      return `${employee.performance_score} points`
  }
}

const getLeaderboardTitle = () => {
  switch (leaderboardType.value) {
    case 'calls':
      return 'Total Calls'
    case 'success':
      return 'Success Rate'
    case 'score':
    default:
      return 'Performance Score'
  }
}

const getRankDisplay = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

const getRankRowClass = (rank) => {
  if (rank === 1) return 'bg-yellow-50 border-l-4 border-yellow-400'
  if (rank === 2) return 'bg-gray-50 border-l-4 border-gray-400'
  if (rank === 3) return 'bg-orange-50 border-l-4 border-orange-400'
  return 'hover:bg-gray-50'
}

const getRankTextClass = (rank) => {
  if (rank <= 3) return 'text-2xl'
  return 'text-gray-600'
}

const selectIntelligentPeriod = (period) => {
  activePeriod.value = period.key
  const today = new Date()
  const fromDate = new Date(today.getTime() - (period.days * 24 * 60 * 60 * 1000))
  
  localFilters.value.date_from = fromDate.toISOString().split('T')[0]
  localFilters.value.date_to = today.toISOString().split('T')[0]
  
  applyFilters()
}

const handleDateFromChange = () => {
  activePeriod.value = null
  applyFilters()
}

const handleDateToChange = () => {
  activePeriod.value = null
  applyFilters()
}

const applyFilters = () => {
  try {
    router.get('/work-reports/leaderboard', localFilters.value, {
      preserveState: true,
      preserveScroll: true,
      onError: (errors) => {
        console.error('Leaderboard filter error:', errors)
      },
      onException: (exception) => {
        console.error('Leaderboard exception:', exception)
      }
    })
  } catch (error) {
    console.error('Router navigation error:', error)
    // Fallback to window location if Inertia fails
    const params = new URLSearchParams(localFilters.value)
    window.location.href = `/work-reports/leaderboard?${params.toString()}`
  }
}

const exportLeaderboard = () => {
  try {
    const params = new URLSearchParams({
      ...localFilters.value,
      type: leaderboardType.value,
      export: 'leaderboard'
    })
    
    window.open(`/work-reports/export?${params}`, '_blank')
  } catch (error) {
    console.error('Export error:', error)
    alert('Export failed. Please try again.')
  }
}

// Initialize with current month
onMounted(() => {
  if (!localFilters.value.date_from || !localFilters.value.date_to) {
    selectIntelligentPeriod(intelligentPeriods[1]) // This Month
  }
})
</script>