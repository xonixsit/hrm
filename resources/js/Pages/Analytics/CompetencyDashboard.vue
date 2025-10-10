<template>
  <AuthenticatedLayout>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Competency Analytics</h1>
              <p class="text-gray-600 mt-1">Insights and reports on competency assessments</p>
            </div>
            <Link
              :href="route('assessment-dashboard')"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon class="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <!-- Metrics Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ChartBarIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Assessments</p>
                <p class="text-2xl font-bold text-gray-900">{{ metrics?.totalAssessments || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UserGroupIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Employees Assessed</p>
                <p class="text-2xl font-bold text-gray-900">{{ metrics?.employeesAssessed || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <StarIcon class="h-8 w-8 text-yellow-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Average Rating</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatRating(metrics?.averageRating) }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CheckCircleIcon class="h-8 w-8 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Completion Rate</p>
                <p class="text-2xl font-bold text-gray-900">{{ metrics?.completionRate || 0 }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Rating Distribution -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Rating Distribution</h3>
            </div>
            <div class="p-6">
              <div v-if="distribution?.ratings" class="space-y-4">
                <div v-for="(count, rating) in distribution.ratings" :key="rating" class="flex items-center">
                  <div class="flex items-center w-20">
                    <StarIcon class="h-4 w-4 text-yellow-400 mr-1" />
                    <span class="text-sm font-medium">{{ rating }}</span>
                  </div>
                  <div class="flex-1 mx-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-blue-600 h-2 rounded-full"
                        :style="{ width: `${getRatingPercentage(count, metrics?.totalAssessments)}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="w-16 text-right">
                    <span class="text-sm text-gray-600">{{ count }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                No rating data available
              </div>
            </div>
          </div>

          <!-- Competency Categories -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Competency Categories</h3>
            </div>
            <div class="p-6">
              <div v-if="distribution?.categories" class="space-y-4">
                <div v-for="(data, category) in distribution.categories" :key="category" class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium text-gray-900">{{ category }}</span>
                      <span class="text-sm text-gray-600">{{ data.count }} assessments</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-green-600 h-2 rounded-full"
                        :style="{ width: `${getCategoryPercentage(data.count, metrics?.totalAssessments)}%` }"
                      ></div>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <span class="text-xs text-gray-500">Avg: {{ formatRating(data.averageRating) }}</span>
                      <span class="text-xs text-gray-500">{{ getCategoryPercentage(data.count, metrics?.totalAssessments) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                No category data available
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Trends -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Recent Trends</h3>
          </div>
          <div class="p-6">
            <div v-if="trends?.length" class="space-y-4">
              <div v-for="trend in trends" :key="trend.period" class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <div class="font-medium text-gray-900">{{ trend.period }}</div>
                  <div class="text-sm text-gray-500">{{ trend.assessments }} assessments completed</div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-gray-900">{{ formatRating(trend.averageRating) }}</div>
                  <div class="text-sm text-gray-500">Average rating</div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              No trend data available
            </div>
          </div>
        </div>

        <!-- Top Performers -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Top Rated Employees -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Top Rated Employees</h3>
            </div>
            <div class="p-6">
              <div v-if="topPerformers?.employees?.length" class="space-y-4">
                <div v-for="employee in topPerformers.employees" :key="employee.id" class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-600">
                        {{ getInitials(employee.name) }}
                      </span>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{{ employee.name }}</div>
                      <div class="text-sm text-gray-500">{{ employee.assessmentCount }} assessments</div>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <div class="flex">
                      <StarIcon
                        v-for="i in 5"
                        :key="i"
                        :class="[
                          i <= Math.round(employee.averageRating) ? 'text-yellow-400' : 'text-gray-300',
                          'h-4 w-4'
                        ]"
                      />
                    </div>
                    <span class="ml-2 text-sm font-medium text-gray-900">{{ formatRating(employee.averageRating) }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                No employee data available
              </div>
            </div>
          </div>

          <!-- Top Competencies -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Top Competencies</h3>
            </div>
            <div class="p-6">
              <div v-if="topPerformers?.competencies?.length" class="space-y-4">
                <div v-for="competency in topPerformers.competencies" :key="competency.id" class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ competency.name }}</div>
                    <div class="text-sm text-gray-500">{{ competency.category }} • {{ competency.assessmentCount }} assessments</div>
                  </div>
                  <div class="ml-4 text-right">
                    <div class="text-sm font-medium text-gray-900">{{ formatRating(competency.averageRating) }}</div>
                    <div class="flex">
                      <StarIcon
                        v-for="i in 5"
                        :key="i"
                        :class="[
                          i <= Math.round(competency.averageRating) ? 'text-yellow-400' : 'text-gray-300',
                          'h-3 w-3'
                        ]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                No competency data available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  UserGroupIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  metrics: Object,
  distribution: Object,
  trends: Array,
  topPerformers: Object,
  filters: Object
});

const formatRating = (rating) => {
  return rating ? parseFloat(rating).toFixed(1) : '0.0';
};

const getRatingPercentage = (count, total) => {
  return total > 0 ? Math.round((count / total) * 100) : 0;
};

const getCategoryPercentage = (count, total) => {
  return total > 0 ? Math.round((count / total) * 100) : 0;
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
</script>