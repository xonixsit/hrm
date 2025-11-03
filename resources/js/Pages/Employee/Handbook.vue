<template>
  <AppLayout title="Employee Handbook">
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Employee Handbook
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <EmployeeHandbook
          :assessment-stats="assessmentStats"
          :leaderboard-stats="leaderboardStats"
          :feedback-stats="feedbackStats"
          :analytics-stats="analyticsStats"
          :development-stats="developmentStats"
          :directory-stats="directoryStats"
          :recent-activities="recentActivities"
          @navigate="handleNavigation"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { router } from '@inertiajs/vue3';
import EmployeeHandbook from '@/Components/EmployeeHandbook/EmployeeHandbook.vue';

const props = defineProps({
  assessmentStats: {
    type: Object,
    default: () => ({
      pending: 3,
      completed: 12,
      average: 87
    })
  },
  leaderboardStats: {
    type: Object,
    default: () => ({
      rank: 5,
      points: 1250,
      percentile: 85
    })
  },
  feedbackStats: {
    type: Object,
    default: () => ({
      unread: 2,
      received: 15,
      rating: 4.2
    })
  },
  analyticsStats: {
    type: Object,
    default: () => ({
      score: 92,
      goals: 8,
      trend: 12
    })
  },
  developmentStats: {
    type: Object,
    default: () => ({
      active: 2,
      completed: 75,
      skills: 24
    })
  },
  directoryStats: {
    type: Object,
    default: () => ({
      online: 45,
      total: 120,
      departments: 8
    })
  },
  recentActivities: {
    type: Array,
    default: () => []
  }
});

const handleNavigation = (route) => {
  // Map routes to actual Inertia routes
  const routeMap = {
    'assessments': 'competency-assessments.index',
    'assessments.pending': 'competency-assessments.index?filter=pending',
    'leaderboard': 'leaderboard.index',
    'leaderboard.monthly': 'leaderboard.index?period=monthly',
    'feedback': 'feedback.index',
    'feedback.recent': 'feedback.index?filter=recent',
    'analytics': 'analytics.index',
    'development': 'development.index',
    'development.goals': 'development.goals',
    'directory': 'employees.directory'
  };

  const targetRoute = routeMap[route] || route;
  
  // Navigate using Inertia
  router.visit(route(targetRoute));
};
</script>