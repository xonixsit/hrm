<template>
  <div class="employee-handbook">
    <!-- Header Section -->
    <div class="handbook-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="handbook-title">Employee Handbook</h1>
          <p class="handbook-subtitle">Your guide to assessments, performance tracking, and professional development</p>
        </div>
        <div class="header-icon">
          <BookOpenIcon class="w-12 h-12 text-blue-600" />
        </div>
      </div>
    </div>

    <!-- Navigation Cards Grid -->
    <div class="handbook-navigation">
      <div class="nav-grid">
        
        <!-- Assessments Access Card -->
        <div class="nav-card assessments-card" @click="navigateTo('assessments')">
          <div class="card-header">
            <div class="card-icon assessments-icon">
              <ClipboardDocumentCheckIcon class="w-8 h-8" />
            </div>
            <div class="card-badge">
              <span class="badge-text">{{ assessmentStats.pending }} Pending</span>
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">Competency Assessments</h3>
            <p class="card-description">Access your skill evaluations, complete pending assessments, and track your competency progress</p>
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-value">{{ assessmentStats.completed }}</span>
                <span class="stat-label">Completed</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ assessmentStats.average }}%</span>
                <span class="stat-label">Avg Score</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="nav-link">View Assessments</span>
            <ArrowRightIcon class="w-5 h-5" />
          </div>
        </div>

        <!-- Leaderboard Card -->
        <div class="nav-card leaderboard-card" @click="navigateTo('leaderboard')">
          <div class="card-header">
            <div class="card-icon leaderboard-icon">
              <TrophyIcon class="w-8 h-8" />
            </div>
            <div class="card-badge ranking-badge">
              <span class="badge-text">#{{ leaderboardStats.rank }} Rank</span>
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">Performance Leaderboard</h3>
            <p class="card-description">See how you rank among your peers, track team performance, and celebrate achievements</p>
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-value">{{ leaderboardStats.points }}</span>
                <span class="stat-label">Points</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ leaderboardStats.percentile }}%</span>
                <span class="stat-label">Percentile</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="nav-link">View Leaderboard</span>
            <ArrowRightIcon class="w-5 h-5" />
          </div>
        </div>

        <!-- Feedback Features Card -->
        <div class="nav-card feedback-card" @click="navigateTo('feedback')">
          <div class="card-header">
            <div class="card-icon feedback-icon">
              <ChatBubbleLeftRightIcon class="w-8 h-8" />
            </div>
            <div class="card-badge">
              <span class="badge-text">{{ feedbackStats.unread }} New</span>
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">Feedback & Reviews</h3>
            <p class="card-description">{{ feedbackDescription }}</p>
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-value">{{ feedbackStats.received }}</span>
                <span class="stat-label">Received</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ feedbackStats.rating }}/5</span>
                <span class="stat-label">Avg Rating</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="nav-link">View Feedback</span>
            <ArrowRightIcon class="w-5 h-5" />
          </div>
        </div>

        <!-- Performance Analytics Card -->
        <div class="nav-card analytics-card" @click="navigateTo('analytics')">
          <div class="card-header">
            <div class="card-icon analytics-icon">
              <ChartBarIcon class="w-8 h-8" />
            </div>
            <div class="card-badge trend-badge" :class="getTrendClass(analyticsStats.trend)">
              <span class="badge-text">{{ formatTrend(analyticsStats.trend) }}</span>
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">Performance Analytics</h3>
            <p class="card-description">Deep dive into your performance metrics, trends, and improvement opportunities</p>
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-value">{{ analyticsStats.score }}%</span>
                <span class="stat-label">Overall Score</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ analyticsStats.goals }}</span>
                <span class="stat-label">Goals Met</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="nav-link">View Analytics</span>
            <ArrowRightIcon class="w-5 h-5" />
          </div>
        </div>

        <!-- Development Plans Card -->
        <div class="nav-card development-card" @click="navigateTo('development')">
          <div class="card-header">
            <div class="card-icon development-icon">
              <AcademicCapIcon class="w-8 h-8" />
            </div>
            <div class="card-badge">
              <span class="badge-text">{{ developmentStats.active }} Active</span>
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">Development Plans</h3>
            <p class="card-description">Access your personalized learning paths, skill development goals, and training resources</p>
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-value">{{ developmentStats.completed }}%</span>
                <span class="stat-label">Progress</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ developmentStats.skills }}</span>
                <span class="stat-label">Skills</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="nav-link">View Plans</span>
            <ArrowRightIcon class="w-5 h-5" />
          </div>
        </div>

        <!-- Team Directory Card -->
        <div class="nav-card directory-card" @click="navigateTo('directory')">
          <div class="card-header">
            <div class="card-icon directory-icon">
              <UsersIcon class="w-8 h-8" />
            </div>
            <div class="card-badge">
              <span class="badge-text">{{ directoryStats.online }} Online</span>
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">Team Directory</h3>
            <p class="card-description">Connect with colleagues, view team structure, and access contact information</p>
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-value">{{ directoryStats.total }}</span>
                <span class="stat-label">Members</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ directoryStats.departments }}</span>
                <span class="stat-label">Departments</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="nav-link">View Directory</span>
            <ArrowRightIcon class="w-5 h-5" />
          </div>
        </div>

      </div>
    </div>

    <!-- Quick Access Section -->
    <div class="quick-access-section">
      <h2 class="section-title">Quick Access</h2>
      <div class="quick-access-grid">
        <button class="quick-access-btn" @click="navigateTo('assessments.pending')">
          <ClockIcon class="w-5 h-5" />
          <span>Pending Assessments</span>
        </button>
        <button class="quick-access-btn" @click="navigateTo('feedback.recent')">
          <BellIcon class="w-5 h-5" />
          <span>Recent Feedback</span>
        </button>
        <button class="quick-access-btn" @click="navigateTo('leaderboard.monthly')">
          <StarIcon class="w-5 h-5" />
          <span>Monthly Rankings</span>
        </button>
        <button class="quick-access-btn" @click="navigateTo('development.goals')">
          <FlagIcon class="w-5 h-5" />
          <span>Development Goals</span>
        </button>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="recent-activity-section">
      <h2 class="section-title">Recent Activity</h2>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="getActivityIconClass(activity.type)">
            <component :is="getActivityIcon(activity.type)" class="w-5 h-5" />
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.description }}</p>
            <span class="activity-time">{{ formatRelativeTime(activity.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth';

// Import icons
import {
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  AcademicCapIcon,
  UsersIcon,
  ArrowRightIcon,
  ClockIcon,
  BellIcon,
  StarIcon,
  FlagIcon
} from '@heroicons/vue/24/outline';

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
    default: () => [
      {
        id: 1,
        type: 'assessment',
        description: 'Completed Customer Service Skills Assessment',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        type: 'feedback',
        description: 'Received feedback from Manager on Q4 Performance',
        created_at: '2024-01-14T15:45:00Z'
      },
      {
        id: 3,
        type: 'leaderboard',
        description: 'Moved up to #5 in Monthly Sales Rankings',
        created_at: '2024-01-13T09:20:00Z'
      }
    ]
  }
});

const emit = defineEmits(['navigate']);

// Composables
const { hasAnyRole } = useAuth();

// Computed properties
const feedbackDescription = computed(() => {
  return hasAnyRole(['Admin', 'HR', 'Manager']) 
    ? 'Give and receive feedback, peer reviews, and manage team performance evaluations'
    : 'View feedback received from your manager and peers about your performance';
});

// Methods
const navigateTo = (route) => {
  emit('navigate', route);
  // You can also use Inertia router here
  // router.visit(`/employee/${route}`);
};

const getTrendClass = (trend) => {
  if (trend > 0) return 'positive';
  if (trend < 0) return 'negative';
  return 'neutral';
};

const formatTrend = (trend) => {
  if (trend > 0) return `+${trend}%`;
  if (trend < 0) return `${trend}%`;
  return '0%';
};

const getActivityIconClass = (type) => {
  const classes = {
    assessment: 'assessment-activity',
    feedback: 'feedback-activity',
    leaderboard: 'leaderboard-activity',
    development: 'development-activity'
  };
  return classes[type] || 'default-activity';
};

const getActivityIcon = (type) => {
  const icons = {
    assessment: ClipboardDocumentCheckIcon,
    feedback: ChatBubbleLeftRightIcon,
    leaderboard: TrophyIcon,
    development: AcademicCapIcon
  };
  return icons[type] || ClockIcon;
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};
</script>

<style scoped>
.employee-handbook {
  @apply max-w-7xl mx-auto p-6 space-y-8;
}

/* Header Section */
.handbook-header {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200;
}

.header-content {
  @apply flex items-center justify-between;
}

.handbook-title {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.handbook-subtitle {
  @apply text-lg text-gray-600;
}

.header-icon {
  @apply hidden md:block;
}

/* Navigation Cards */
.handbook-navigation {
  @apply space-y-6;
}

.nav-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.nav-card {
  @apply bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer;
}

.card-header {
  @apply flex items-center justify-between mb-4;
}

.card-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center;
}

.assessments-icon {
  @apply bg-blue-100 text-blue-600;
}

.leaderboard-icon {
  @apply bg-yellow-100 text-yellow-600;
}

.feedback-icon {
  @apply bg-green-100 text-green-600;
}

.analytics-icon {
  @apply bg-purple-100 text-purple-600;
}

.development-icon {
  @apply bg-indigo-100 text-indigo-600;
}

.directory-icon {
  @apply bg-pink-100 text-pink-600;
}

.card-badge {
  @apply px-3 py-1 rounded-full text-sm font-medium;
}

.assessments-card .card-badge {
  @apply bg-blue-100 text-blue-700;
}

.leaderboard-card .card-badge {
  @apply bg-yellow-100 text-yellow-700;
}

.feedback-card .card-badge {
  @apply bg-green-100 text-green-700;
}

.analytics-card .card-badge {
  @apply bg-purple-100 text-purple-700;
}

.development-card .card-badge {
  @apply bg-indigo-100 text-indigo-700;
}

.directory-card .card-badge {
  @apply bg-pink-100 text-pink-700;
}

.ranking-badge.positive {
  @apply bg-green-100 text-green-700;
}

.ranking-badge.negative {
  @apply bg-red-100 text-red-700;
}

.ranking-badge.neutral {
  @apply bg-gray-100 text-gray-700;
}

.trend-badge.positive {
  @apply bg-green-100 text-green-700;
}

.trend-badge.negative {
  @apply bg-red-100 text-red-700;
}

.trend-badge.neutral {
  @apply bg-gray-100 text-gray-700;
}

.card-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.card-description {
  @apply text-gray-600 mb-4;
}

.card-stats {
  @apply flex space-x-6 mb-4;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply block text-2xl font-bold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-500;
}

.card-footer {
  @apply flex items-center justify-between text-blue-600 font-medium;
}

.nav-link {
  @apply hover:text-blue-700 transition-colors;
}

/* Quick Access Section */
.quick-access-section {
  @apply bg-white rounded-xl border border-gray-200 p-6;
}

.section-title {
  @apply text-xl font-semibold text-gray-900 mb-4;
}

.quick-access-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.quick-access-btn {
  @apply flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-gray-700 hover:text-gray-900;
}

/* Recent Activity Section */
.recent-activity-section {
  @apply bg-white rounded-xl border border-gray-200 p-6;
}

.activity-list {
  @apply space-y-4;
}

.activity-item {
  @apply flex items-start space-x-3 p-3 bg-gray-50 rounded-lg;
}

.activity-icon {
  @apply w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0;
}

.assessment-activity {
  @apply bg-blue-100 text-blue-600;
}

.feedback-activity {
  @apply bg-green-100 text-green-600;
}

.leaderboard-activity {
  @apply bg-yellow-100 text-yellow-600;
}

.development-activity {
  @apply bg-indigo-100 text-indigo-600;
}

.default-activity {
  @apply bg-gray-100 text-gray-600;
}

.activity-content {
  @apply flex-1;
}

.activity-text {
  @apply text-gray-900 font-medium;
}

.activity-time {
  @apply text-sm text-gray-500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .handbook-header {
    @apply p-6;
  }
  
  .header-content {
    @apply flex-col space-y-4;
  }
  
  .nav-grid {
    @apply grid-cols-1;
  }
  
  .quick-access-grid {
    @apply grid-cols-1;
  }
}
</style>