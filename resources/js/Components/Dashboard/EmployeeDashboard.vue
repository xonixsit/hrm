<template>
  <div class="employee-dashboard">
    <!-- Motivational Message Block -->
    <div class="motivation-block">
      <div class="motivation-content">
        <p class="motivation-text">
          <BoltIcon class="w-5 h-5 inline-block mr-2 text-yellow-500" />
          Ready to tackle today's challenges?
        </p>
      </div>
      <div class="quick-clock-actions">
        <button @click="handleClockInOut" :disabled="loading" :class="clockButtonClasses">
          <ClockIcon class="w-4 h-4" />
          {{ clockButtonText }}
        </button>
        <button v-if="isCurrentlyClockedIn && !(currentAttendance && currentAttendance.on_break)"
          @click="handleTakeBreak" :disabled="loading" class="break-button">
          <PauseIcon class="w-4 h-4" />
          Take Break
        </button>
        <button v-if="isCurrentlyClockedIn && (currentAttendance && currentAttendance.on_break)" @click="handleEndBreak"
          :disabled="loading" class="end-break-button">
          <PlayIcon class="w-4 h-4" />
          End Break
        </button>
      </div>
    </div>



    <!-- Enhanced Time Tracking Block -->
    <div class="time-tracking-section">
      <!-- Real-time Clock Display -->
      <div class="real-time-clock">
        <div class="clock-display">
          <div class="current-time">{{ currentTimeFormatted }}</div>
          <div class="current-date">{{ currentDate }}</div>
        </div>
        <div class="work-status">
          <div class="status-indicator" :class="getStatusIndicatorClasses()">
            <div class="status-dot"></div>
            <span class="status-text">{{ workdayStatusText }}</span>
          </div>
        </div>
      </div>

      <!-- Time Progress Visualization -->
      <div class="time-progress-block">
        <!-- Work Duration Display -->
        <div class="duration-display">
          <div class="duration-item">
            <div class="duration-label">Work Time</div>
            <div class="duration-value">{{ realTimeWorkDuration }}</div>
          </div>
          <div class="duration-item" v-if="currentAttendance && currentAttendance.on_break">
            <div class="duration-label">Break Time</div>
            <div class="duration-value">{{ realTimeBreakDuration }}</div>
          </div>
          <div class="duration-item">
            <div class="duration-label">Progress</div>
            <div class="duration-value">{{ Math.round(actualWorkProgressPercentage) }}%</div>
          </div>
        </div>

        <!-- Horizontal Clock Timeline -->
        <div class="horizontal-clock-container">
          <!-- Time Markers -->
          <div class="time-markers">
            <div v-for="(marker, index) in timelineMarkers" :key="index" class="time-marker" :class="{
                'start-marker': index === 0,
                'end-marker': index === timelineMarkers.length - 1,
                'lunch-marker': marker.isLunch,
                'regular-marker': !marker.isLunch && index !== 0 && index !== timelineMarkers.length - 1
              }">
              <div class="marker-line"></div>
              <span class="marker-time">{{ marker.label }}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="time-progress-bar">
            <div class="progress-bar-shimmer"></div>

            <!-- Pre-work time fill -->
            <div v-if="isCurrentlyClockedIn && preWorkWidth > 0" class="pre-work-fill" :style="{ 
                width: `${preWorkWidth}%`,
                transition: 'width 0.5s ease-out'
              }"></div>

            <!-- Work progress fill -->
            <div v-if="isCurrentlyClockedIn && progressWidth > 0" class="work-progress-fill" :style="{ 
                left: `${progressStartPosition}%`,
                width: `${progressWidth}%`,
                transition: 'width 0.5s ease-out, left 0.5s ease-out'
              }">
              <!-- Current Time Indicator -->
              <div class="current-time-indicator" v-if="workdayStatus === 'during-work'">
                <div class="time-dot"></div>
                <div class="time-tooltip">{{ currentTimeFormatted }}</div>
              </div>
            </div>

            <!-- Break time fills -->
            <div v-for="(breakFill, index) in breakTimeFills" :key="`break-${index}`" class="break-time-fill"
              :class="{ 'ongoing-break': breakFill.isOngoing }" :style="{ 
                left: `${breakFill.left}%`,
                width: `${breakFill.width}%`
              }"></div>
          </div>

          <!-- Progress Information -->
          <div class="time-progress-info">
            <div class="progress-left">
              <span class="progress-time">{{ currentTimeFormatted }}</span>
              <span class="progress-status" :class="getStatusClasses()">{{ workdayStatusText }}</span>
            </div>
            <div class="progress-right">
              <span class="progress-percentage">{{ progressLabel }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- Journey & Growth Overview -->
    <div class="journey-overview-section">
      <!-- Journey Milestones -->
      <div class="journey-milestones">
        <h3 class="section-title">Your Journey</h3>
        <div class="milestone-grid">
          <div class="milestone-card">
            <div class="milestone-icon">
              <CalendarDaysIcon class="w-6 h-6 text-blue-600" />
            </div>
            <div class="milestone-content">
              <div class="milestone-value">{{ Math.floor(stats.daysWithCompany || 0) }}</div>
              <div class="milestone-label">Days with Company</div>
              <div class="milestone-sublabel">{{ formatServiceTime(Math.floor(stats.yearsOfService || 0),
                Math.floor(stats.monthsWithCompany || 0)) }}</div>
            </div>
          </div>

          <div class="milestone-card">
            <div class="milestone-icon">
              <ClockIcon class="w-6 h-6 text-green-600" />
            </div>
            <div class="milestone-content">
              <div class="milestone-value">{{ stats.totalWorkHours || 0 }}h</div>
              <div class="milestone-label">Total Work Hours</div>
              <div class="milestone-sublabel">Lifetime contribution</div>
            </div>
          </div>

          <div class="milestone-card">
            <div class="milestone-icon">
              <ChartBarIcon class="w-6 h-6 text-purple-600" />
            </div>
            <div class="milestone-content">
              <div class="milestone-value">{{ stats.projectsContributed || 0 }}</div>
              <div class="milestone-label">Projects</div>
              <div class="milestone-sublabel">Cross-functional work</div>
            </div>
          </div>

          <div class="milestone-card">
            <div class="milestone-icon">
              <StarIcon class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="milestone-content">
              <div class="milestone-value">{{ stats.performanceRank || 'N/A' }}</div>
              <div class="milestone-label">Performance Rank</div>
              <div class="milestone-sublabel">Among peers</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance & Growth Stats -->
      <div class="performance-stats">
        <h3 class="section-title">Performance & Growth</h3>
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-header">
              <CheckCircleIcon class="w-5 h-5" />
              <span class="stat-trend" :class="getTrendClass(stats.performanceTrend)">
                {{ formatTrend(stats.performanceTrend) }}
              </span>
            </div>
            <div class="stat-value">{{ stats.myAverageRating || 'N/A' }}</div>
            <div class="stat-label">Avg Rating</div>
          </div>

          <div class="stat-card success">
            <div class="stat-header">
              <DocumentTextIcon class="w-5 h-5" />
              <span class="stat-trend" :class="getTrendClass(stats.attendanceTrend)">
                {{ formatTrend(stats.attendanceTrend) }}
              </span>
            </div>
            <div class="stat-value">{{ isNaN(stats.attendanceRate) ? 'N/A' : Math.round(stats.attendanceRate || 0) + '%'
              }}</div>
            <div class="stat-label">Attendance Rate</div>
          </div>

          <div class="stat-card info">
            <div class="stat-header">
              <ChartBarIcon class="w-5 h-5" />
              <span class="stat-trend" :class="getTrendClass(stats.productivityTrend)">
                {{ formatTrend(stats.productivityTrend) }}
              </span>
            </div>
            <div class="stat-value">{{ stats.myWorkReports || 0 }}</div>
            <div class="stat-label">Work Reports</div>
          </div>

          <div class="stat-card warning">
            <div class="stat-header">
              <BoltIcon class="w-5 h-5" />
              <span class="consistency-score">{{ Math.round(stats.consistencyScore || 0) }}%</span>
            </div>
            <div class="stat-value">{{ stats.mySuccessfulCalls || 0 }}</div>
            <div class="stat-label">Successful Calls</div>
          </div>
        </div>
      </div>

      <!-- Achievements & Recognition -->
      <div class="achievements-section" v-if="stats.totalAchievements > 0">
        <h3 class="section-title">Achievements & Recognition</h3>
        <div class="achievements-grid">
          <div class="achievement-summary">
            <div class="achievement-count">{{ stats.totalAchievements }}</div>
            <div class="achievement-label">Total Achievements</div>
          </div>
          <div class="recent-achievements">
            <div v-for="achievement in stats.recentAchievements" :key="achievement" class="achievement-item">
              <div class="achievement-badge">🏆</div>
              <span class="achievement-text">{{ achievement }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Growth Progress -->
      <div class="growth-progress">
        <h3 class="section-title">Development Progress</h3>
        <div class="progress-items">
          <div class="progress-item">
            <div class="progress-header">
              <span class="progress-label">Competency Progress</span>
              <span class="progress-value">{{ formatTrend(stats.competencyProgress) }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: Math.abs(stats.competencyProgress || 0) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Left Column -->
      <div class="left-column">


        <!-- Recent Feedback -->
        <DashboardWidget title="Recent Feedback" :loading="loading" class="recent-feedback">
          <div v-if="recentFeedback.length === 0" class="empty-state">
            <ChatBubbleLeftIcon class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p class="text-neutral-500 text-center">No recent feedback</p>
          </div>

          <div v-else class="feedback-list">
            <div v-for="feedback in recentFeedback.slice(0, 3)" :key="feedback.id" class="feedback-item">
              <div class="feedback-header">
                <div class="feedback-from">
                  <span class="feedback-author">{{ feedback.from.name }}</span>
                  <span class="feedback-role">{{ feedback.from.role }}</span>
                </div>
                <div class="feedback-rating">
                  <div class="rating-stars">
                    <StarIcon v-for="star in 5" :key="star" :class="[
                        'w-4 h-4',
                        star <= feedback.rating ? 'text-warning-400 fill-current' : 'text-neutral-300'
                      ]" />
                  </div>
                </div>
              </div>
              <p class="feedback-comment">{{ feedback.comment }}</p>
              <span class="feedback-date">{{ formatRelativeTime(feedback.created_at) }}</span>
            </div>
          </div>
        </DashboardWidget>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Employee Quick Actions -->
        <QuickActions :actions="employeeQuickActions" title="Quick Actions" :max-visible="6"
          @action="handleQuickAction" />

        <!-- Birthday Notifications -->
        <BirthdayNotifications :todays-birthdays="birthdayNotifications.todaysBirthdays"
          :upcoming-birthdays="birthdayNotifications.upcomingBirthdays" :stats="birthdayNotifications.stats" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import { useAuth } from '@/composables/useAuth.js';
  import DashboardWidget from './DashboardWidget.vue';
  import QuickActions from './QuickActions.vue';
  import BirthdayNotifications from './BirthdayNotifications.vue';

  // Import icons
  import {
    ClockIcon,
    CheckCircleIcon,
    CalendarDaysIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    MapPinIcon,
    UsersIcon,
    ChatBubbleLeftIcon,
    StarIcon,
    PauseIcon,
    PlayIcon,
    BoltIcon,
    ChartBarIcon,
    DocumentTextIcon
  } from '@heroicons/vue/24/outline';

  const props = defineProps({
    stats: {
      type: Object,
      default: () => ({
        hoursToday: 0,
        tasksCompleted: 0,
        leaveBalance: 0,
        upcomingDeadlines: 0,
        taskTrend: 0,
        daysWithCompany: 0,
        yearsOfService: 0,
        monthsWithCompany: 0,
        totalWorkHours: 0,
        projectsContributed: 0,
        performanceRank: 'N/A',
        myAverageRating: 'N/A',
        attendanceRate: 0,
        myWorkReports: 0,
        mySuccessfulCalls: 0,
        consistencyScore: 0,
        totalAchievements: 0,
        recentAchievements: [],
        performanceTrend: 0,
        attendanceTrend: 0,
        productivityTrend: 0,
        competencyProgress: 0
      })
    },
    personalActivities: {
      type: Array,
      default: () => []
    },
    myTasks: {
      type: Array,
      default: () => []
    },
    recentFeedback: {
      type: Array,
      default: () => []
    },
    clockedIn: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    currentAttendance: {
      type: Object,
      default: () => ({
        clocked_in: false,
        on_break: false,
        clock_in_time: null,
        break_sessions: [],
        current_break_start: null,
        todays_summary: {
          total_hours: '0h 0m',
          break_time: '0h 0m',
          sessions: 0,
          clock_ins: 0
        },
        recent_activities: [],
        stats: {
          weekly_hours: '0h 0m',
          monthly_hours: '0h 0m',
          average_daily: '0h 0m'
        }
      })
    },
    birthdayNotifications: {
      type: Object,
      default: () => ({
        todaysBirthdays: [],
        upcomingBirthdays: [],
        stats: {}
      })
    }
  });

  const emit = defineEmits(['clock-in-out', 'toggle-task', 'action', 'view-task']);

  // Composables
  const { user } = useAuth();

  // Local state
  const currentTime = ref(new Date());
  const currentDate = ref('');
  const realTimeWorkDuration = ref('0h 0m 0s');
  const realTimeBreakDuration = ref('0h 0m 0s');
  const breakStartTime = ref(null);
  let timeInterval = null;

  // Computed properties
  const isCurrentlyClockedIn = computed(() => {
    const clockedIn = props.clockedIn || props.currentAttendance.clocked_in;
    console.log('🔍 isCurrentlyClockedIn computed:', {
      propsClockedIn: props.clockedIn,
      currentAttendanceClockedIn: props.currentAttendance.clocked_in,
      result: clockedIn
    });
    return clockedIn;
  });

  const clockButtonText = computed(() => {
    return isCurrentlyClockedIn.value ? 'Clock Out' : 'Clock In';
  });

  const clockButtonClasses = computed(() => [
    'inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
    isCurrentlyClockedIn.value
      ? 'text-white bg-error-600 border border-error-600 hover:bg-error-700 focus:ring-error-500'
      : 'text-white bg-success-600 border border-success-600 hover:bg-success-700 focus:ring-success-500'
  ]);

  const currentTimeFormatted = computed(() => {
    return currentTime.value.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  });

  const workdayStatus = computed(() => {
    if (!isCurrentlyClockedIn.value) {
      return 'before-work';
    }

    const clockInTime = props.currentAttendance.clock_in_time;
    if (!clockInTime) {
      return 'before-work';
    }

    // If clocked in, always show as 'during-work' to display the progress bar
    // The actual progress calculation will handle the time logic
    return 'during-work';
  });

  const actualWorkProgressPercentage = computed(() => {
    if (!isCurrentlyClockedIn.value) {
      console.log('🔍 Progress: Not clocked in, returning 0%');
      return 0;
    }

    const clockInTime = props.currentAttendance.clock_in_time;
    if (!clockInTime) {
      console.log('🔍 Progress: No clock in time, returning 0%');
      return 0;
    }

    const now = currentTime.value;
    const actualClockIn = new Date(clockInTime);

    if (now < actualClockIn) {
      console.log('🔍 Progress: Current time before clock in, returning 0%');
      return 0;
    }

    const workTimeElapsedMs = now.getTime() - actualClockIn.getTime();
    const workTimeElapsedHours = workTimeElapsedMs / (1000 * 60 * 60);
    const standardWorkHours = 8;
    const percentage = (workTimeElapsedHours / standardWorkHours) * 100;

    const finalPercentage = Math.min(100, Math.max(0, percentage));

    console.log('🔍 Progress calculation:', {
      clockInTime,
      now: now.toISOString(),
      workTimeElapsedHours: workTimeElapsedHours.toFixed(2),
      percentage: percentage.toFixed(2),
      finalPercentage: finalPercentage.toFixed(2)
    });

    return finalPercentage;
  });

  const progressLabel = computed(() => {
    const percentage = Math.round(actualWorkProgressPercentage.value);

    switch (workdayStatus.value) {
      case 'before-work':
        if (!isCurrentlyClockedIn.value) {
          return 'Ready to clock in';
        }
        return 'Work session starting';
      case 'after-work':
        return 'Workday complete!';
      case 'during-work':
        return `${percentage}% of workday`;
      default:
        return `${percentage}% of workday`;
    }
  });

  const workdayStatusText = computed(() => {
    switch (workdayStatus.value) {
      case 'before-work':
        return 'Pre-work';
      case 'after-work':
        return 'Complete';
      case 'during-work':
        return 'Active';
      default:
        return 'Active';
    }
  });

  const timelineMarkers = computed(() => {
    return [
      { label: '8 AM', isLunch: false },
      { label: '9', isLunch: false },
      { label: '10', isLunch: false },
      { label: '11', isLunch: false },
      { label: '12 PM', isLunch: true },
      { label: '1', isLunch: false },
      { label: '2', isLunch: false },
      { label: '3', isLunch: false },
      { label: '4', isLunch: false },
      { label: '5 PM', isLunch: false }
    ];
  });

  const progressStartPosition = computed(() => {
    if (!isCurrentlyClockedIn.value) {
      return 0;
    }

    const clockInTime = props.currentAttendance.clock_in_time;
    if (!clockInTime) {
      return 0;
    }

    const now = currentTime.value;
    const timelineStart = new Date(now);
    timelineStart.setHours(8, 0, 0, 0);

    const timelineEnd = new Date(now);
    timelineEnd.setHours(17, 0, 0, 0);

    const actualClockIn = new Date(clockInTime);
    const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();
    const clockInPositionMs = actualClockIn.getTime() - timelineStart.getTime();
    const clockInPositionPercent = Math.max(0, (clockInPositionMs / totalTimelineMs) * 100);

    return Math.min(100, clockInPositionPercent);
  });

  const progressWidth = computed(() => {
    if (!isCurrentlyClockedIn.value) {
      console.log('🔍 ProgressWidth: Not clocked in, returning 0');
      return 0;
    }

    const clockInTime = props.currentAttendance.clock_in_time;
    if (!clockInTime) {
      console.log('🔍 ProgressWidth: No clock in time, returning 0');
      return 0;
    }

    const now = currentTime.value;
    const timelineStart = new Date(now);
    timelineStart.setHours(8, 0, 0, 0);

    const timelineEnd = new Date(now);
    timelineEnd.setHours(17, 0, 0, 0);

    const actualClockIn = new Date(clockInTime);
    const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();

    if (now < actualClockIn) {
      console.log('🔍 ProgressWidth: Current time before clock in, returning 0');
      return 0;
    }

    const currentPositionMs = now.getTime() - timelineStart.getTime();
    const currentPositionPercent = Math.min(100, Math.max(0, (currentPositionMs / totalTimelineMs) * 100));

    const clockInPositionMs = actualClockIn.getTime() - timelineStart.getTime();
    const clockInPositionPercent = Math.max(0, (clockInPositionMs / totalTimelineMs) * 100);

    const width = currentPositionPercent - clockInPositionPercent;
    const finalWidth = Math.max(0, width);

    console.log('🔍 ProgressWidth calculation:', {
      clockInTime,
      timelineStart: timelineStart.toISOString(),
      timelineEnd: timelineEnd.toISOString(),
      currentPositionPercent: currentPositionPercent.toFixed(2),
      clockInPositionPercent: clockInPositionPercent.toFixed(2),
      width: width.toFixed(2),
      finalWidth: finalWidth.toFixed(2)
    });

    return finalWidth;
  });

  const preWorkWidth = computed(() => {
    if (!isCurrentlyClockedIn.value) {
      return 0;
    }

    const clockInTime = props.currentAttendance.clock_in_time;
    if (!clockInTime) {
      return 0;
    }

    const now = currentTime.value;
    const timelineStart = new Date(now);
    timelineStart.setHours(8, 0, 0, 0);

    const timelineEnd = new Date(now);
    timelineEnd.setHours(17, 0, 0, 0);

    const actualClockIn = new Date(clockInTime);
    const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();
    const clockInPositionMs = actualClockIn.getTime() - timelineStart.getTime();
    const clockInPositionPercent = Math.max(0, (clockInPositionMs / totalTimelineMs) * 100);

    return Math.min(100, clockInPositionPercent);
  });

  const breakTimeFills = computed(() => {
    if (!isCurrentlyClockedIn.value) {
      return [];
    }

    const now = currentTime.value;
    const timelineStart = new Date(now);
    timelineStart.setHours(8, 0, 0, 0);

    const timelineEnd = new Date(now);
    timelineEnd.setHours(17, 0, 0, 0);

    const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();

    const allBreakSessions = [];

    // Add completed break sessions from the break_sessions array
    const breakSessions = props.currentAttendance.break_sessions || [];
    breakSessions.forEach(session => {
      if (session.start) {
        allBreakSessions.push({
          start: session.start,
          end: session.end,
          isOngoing: false
        });
      }
    });

    // Add current ongoing break session if on break
    if (props.currentAttendance && props.currentAttendance.on_break) {
      let currentBreakStart = null;

      // Try to get current break start time from multiple sources
      if (props.currentAttendance.current_break_start) {
        currentBreakStart = props.currentAttendance.current_break_start;
      } else if (breakStartTime.value) {
        currentBreakStart = breakStartTime.value;
      }

      if (currentBreakStart) {
        allBreakSessions.push({
          start: currentBreakStart,
          end: null, // Ongoing break
          isOngoing: true
        });
      }
    }

    if (allBreakSessions.length === 0) {
      return [];
    }

    return allBreakSessions.map((session, index) => {
      const breakStart = new Date(session.start);
      const breakEnd = session.end ? new Date(session.end) : now;

      const breakStartMs = breakStart.getTime() - timelineStart.getTime();
      const breakEndMs = breakEnd.getTime() - timelineStart.getTime();

      const leftPercent = Math.max(0, (breakStartMs / totalTimelineMs) * 100);
      const rightPercent = Math.min(100, (breakEndMs / totalTimelineMs) * 100);
      const widthPercent = Math.max(0, rightPercent - leftPercent);

      return {
        left: leftPercent,
        width: widthPercent,
        isOngoing: session.isOngoing
      };
    }).filter(session => session.width > 0);
  });

  const employeeQuickActions = computed(() => [
    {
      id: 'my-assessments',
      label: 'My Assessments',
      description: 'View and complete competency assessments',
      icon: CheckCircleIcon,
      variant: 'primary',
      route: 'competency-assessments.my-assessments'
    },
    {
      id: 'request-leave',
      label: 'Request Leave',
      description: 'Submit a new leave request',
      icon: CalendarIcon,
      variant: 'secondary',
      route: 'leaves.create'
    },
    {
      id: 'assessment-dashboard',
      label: 'Assessment Dashboard',
      description: 'View assessment overview and analytics',
      icon: ExclamationTriangleIcon,
      variant: 'success',
      route: 'assessment-dashboard'
    }
  ]);



  // Methods for status styling
  const getStatusClasses = () => {
    const baseClasses = 'text-xs font-medium px-2 py-1 rounded-full';

    switch (workdayStatus.value) {
      case 'before-work':
        return `${baseClasses} bg-neutral-100 text-neutral-600`;
      case 'after-work':
        return `${baseClasses} bg-success-100 text-success-700`;
      case 'during-work':
        return `${baseClasses} bg-primary-100 text-primary-700`;
      default:
        return `${baseClasses} bg-primary-100 text-primary-700`;
    }
  };

  const getStatusIndicatorClasses = () => {
    const baseClasses = 'flex items-center space-x-2';

    switch (workdayStatus.value) {
      case 'before-work':
        return `${baseClasses} text-neutral-600`;
      case 'after-work':
        return `${baseClasses} text-success-700`;
      case 'during-work':
        if (props.currentAttendance && props.currentAttendance.on_break) {
          return `${baseClasses} text-warning-700`;
        }
        return `${baseClasses} text-primary-700`;
      default:
        return `${baseClasses} text-primary-700`;
    }
  };

  // Real-time duration update functions
  const updateTime = () => {
    const now = new Date();

    currentTime.value = now;

    currentDate.value = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const updateWorkDuration = () => {
    if (isCurrentlyClockedIn.value && props.currentAttendance.clock_in_time) {
      const clockInTime = new Date(props.currentAttendance.clock_in_time);
      const now = new Date();
      const diffMs = now - clockInTime;

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      realTimeWorkDuration.value = `${hours}h ${minutes}m ${seconds}s`;
    } else {
      realTimeWorkDuration.value = '0h 0m 0s';
    }

    // Calculate break time - check multiple sources for break start time
    if (props.currentAttendance && props.currentAttendance.on_break) {
      let breakStart = null;

      // Try to get break start time from multiple sources
      if (props.currentAttendance.current_break_start) {
        breakStart = new Date(props.currentAttendance.current_break_start);
      } else if (breakStartTime.value) {
        breakStart = new Date(breakStartTime.value);
      } else if (props.currentAttendance.break_sessions && props.currentAttendance.break_sessions.length > 0) {
        // Get the last break session if it doesn't have an end time (ongoing break)
        const lastBreak = props.currentAttendance.break_sessions[props.currentAttendance.break_sessions.length - 1];
        if (lastBreak && !lastBreak.end) {
          breakStart = new Date(lastBreak.start);
        }
      }

      if (breakStart && !isNaN(breakStart.getTime())) {
        const now = new Date();
        const diffMs = Math.max(0, now - breakStart); // Ensure positive duration

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        realTimeBreakDuration.value = `${hours}h ${minutes}m ${seconds}s`;

        // Update local breakStartTime for consistency
        if (!breakStartTime.value) {
          breakStartTime.value = breakStart.toISOString();
        }
      } else {
        // If we can't find a valid break start time but we're on break, 
        // set the current time as break start for immediate feedback
        if (!breakStartTime.value) {
          breakStartTime.value = new Date().toISOString();
        }
        realTimeBreakDuration.value = '0h 0m 1s'; // Show at least 1 second to indicate break is active
      }
    } else {
      realTimeBreakDuration.value = '0h 0m 0s';
      breakStartTime.value = null;
    }
  };

  const handleClockInOut = async () => {
    try {
      console.log('🔍 EmployeeDashboard: Clock in/out button clicked');
      console.log('🔍 Current state:', {
        isCurrentlyClockedIn: isCurrentlyClockedIn.value,
        clockedIn: props.clockedIn,
        currentAttendanceClockedIn: props.currentAttendance.clocked_in
      });

      emit('clock-in-out');

      // Also broadcast the state change for immediate floating widget sync
      setTimeout(() => {
        const updateEvent = new CustomEvent('attendance-state-changed', {
          detail: {
            clockedIn: !isCurrentlyClockedIn.value,
            onBreak: false,
            clockInTime: isCurrentlyClockedIn.value ? null : new Date().toISOString(),
            breakStartTime: null,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(updateEvent);
      }, 100);
    } catch (error) {
      console.error('Clock in/out failed:', error);
    }
  };

  const handleTakeBreak = async () => {
    try {
      // Set break start time immediately for instant feedback
      breakStartTime.value = new Date().toISOString();

      emit('action', { type: 'take-break' });

      // Also broadcast the state change for immediate floating widget sync
      setTimeout(() => {
        const updateEvent = new CustomEvent('attendance-state-changed', {
          detail: {
            clockedIn: true,
            onBreak: true,
            clockInTime: (props.currentAttendance && props.currentAttendance.clock_in_time) || null,
            breakStartTime: breakStartTime.value,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(updateEvent);
      }, 100);
    } catch (error) {
      console.error('Take break failed:', error);
    }
  };

  const handleEndBreak = async () => {
    try {
      emit('action', { type: 'end-break' });

      // Also broadcast the state change for immediate floating widget sync
      setTimeout(() => {
        const updateEvent = new CustomEvent('attendance-state-changed', {
          detail: {
            clockedIn: true,
            onBreak: false,
            clockInTime: (props.currentAttendance && props.currentAttendance.clock_in_time) || null,
            breakStartTime: null,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(updateEvent);
      }, 100);
    } catch (error) {
      console.error('End break failed:', error);
    }
  };

  // Helper methods for formatting
  const formatServiceTime = (years, months) => {
    const yearValue = Number(years) || 0;
    const monthValue = Number(months) || 0;

    if (yearValue > 0) {
      return `${yearValue} year${yearValue > 1 ? 's' : ''}, ${monthValue} month${monthValue > 1 ? 's' : ''}`;
    }
    return `${monthValue} month${monthValue > 1 ? 's' : ''}`;
  };

  const formatTrend = (trend) => {
    const trendValue = Number(trend) || 0;
    if (trendValue > 0) return `+${trendValue}%`;
    if (trendValue < 0) return `${trendValue}%`;
    return '0%';
  };

  const getTrendClass = (trend) => {
    const trendValue = Number(trend) || 0;
    if (trendValue === 0) return 'neutral';
    return trendValue > 0 ? 'positive' : 'negative';
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const handleQuickAction = (action) => {
    emit('action', action);
  };

  // const handleQuickAction = (action) => {
  //   emit('action', action);
  // };

  // const viewFullCalendar = () => {
  //   emit('action', { route: 'calendar.index' });
  // };

  // const joinMeeting = (event) => {
  //   if (event.meeting_link) {
  //     window.open(event.meeting_link, '_blank');
  //   }
  // };

  // const formatTime = (time) => {
  //   return new Date(time).toLocaleTimeString('en-US', {
  //     hour: 'numeric',
  //     minute: '2-digit',
  //     hour12: true
  //   });
  // };

  // const formatRelativeTime = (date) => {
  //   const now = new Date();
  //   const past = new Date(date);
  //   const diffMs = now - past;
  //   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  //   if (diffDays === 0) return 'Today';
  //   if (diffDays === 1) return 'Yesterday';
  //   if (diffDays < 7) return `${diffDays} days ago`;
  //   return past.toLocaleDateString();
  // };

  // const handleQuickAction = (action) => {
  //   emit('action', { type: 'quick-action', data: action });
  // };

  // const viewFullCalendar = () => {
  //   emit('action', { type: 'view-calendar' });
  // };

  // const joinMeeting = (event) => {
  //   if (event.meeting_link) {
  //     window.open(event.meeting_link, '_blank');
  //   }
  // };

  // const formatTime = (time) => {
  //   return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
  //     hour: 'numeric',
  //     minute: '2-digit',
  //     hour12: true
  //   });
  // };

  // const formatRelativeTime = (date) => {
  //   const now = new Date();
  //   const target = new Date(date);
  //   const diffInMinutes = Math.floor((target - now) / (1000 * 60));

  //   if (diffInMinutes < 0) {
  //     const pastMinutes = Math.abs(diffInMinutes);
  //     if (pastMinutes < 60) return `${pastMinutes}m ago`;

  //     const pastHours = Math.floor(pastMinutes / 60);
  //     if (pastHours < 24) return `${pastHours}h ago`;

  //     const pastDays = Math.floor(pastHours / 24);
  //     return `${pastDays}d ago`;
  //   }

  //   if (diffInMinutes < 60) return `in ${diffInMinutes}m`;

  //   const hours = Math.floor(diffInMinutes / 60);
  //   if (hours < 24) return `in ${hours}h`;

  //   const days = Math.floor(hours / 24);
  //   return `in ${days}d`;
  // };

  onMounted(() => {
    updateTime();
    updateWorkDuration();

    timeInterval = setInterval(() => {
      updateTime();
      updateWorkDuration();
    }, 1000);
  });

  onUnmounted(() => {
    if (timeInterval) {
      clearInterval(timeInterval);
    }
  });
</script>

<style scoped>
  .employee-dashboard {
    @apply space-y-8;
  }

  /* Competency Overview Section */
  .competency-overview-section {
    @apply bg-white rounded-lg border border-neutral-200 p-6;
  }

  .competency-stats-grid {
    @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
  }

  .competency-stat-card {
    @apply flex items-center space-x-4 p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg border border-neutral-200;
  }

  .stat-icon {
    @apply flex-shrink-0;
  }

  .stat-content {
    @apply flex-1;
  }

  .stat-value {
    @apply text-2xl font-bold text-neutral-900;
  }

  .stat-label {
    @apply text-sm text-neutral-600 font-medium;
  }

  /* Motivational Message Block */
  .motivation-block {
    @apply flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200 mb-4;
  }



  .motivation-content {
    @apply flex-1;
  }

  .motivation-text {
    @apply text-lg font-medium text-primary-900;
  }

  .quick-clock-actions {
    @apply flex items-center space-x-3;
  }

  /* Enhanced Time Tracking Section */
  .time-tracking-section {
    @apply bg-white rounded-lg border border-neutral-200 mb-8 shadow-sm overflow-hidden;
  }

  /* Real-time Clock Display */
  .real-time-clock {
    @apply flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-neutral-200;
  }

  .clock-display {
    @apply flex flex-col;
  }

  .current-time {
    @apply text-3xl font-bold text-gray-900 font-mono;
  }

  .current-date {
    @apply text-sm text-gray-600 mt-1;
  }

  .work-status {
    @apply flex items-center;
  }

  .status-indicator {
    @apply flex items-center space-x-2 px-3 py-2 rounded-full bg-white shadow-sm;
  }

  .status-dot {
    @apply w-3 h-3 rounded-full;
  }

  .status-indicator.text-neutral-600 .status-dot {
    @apply bg-gray-400;
  }

  .status-indicator.text-success-700 .status-dot {
    @apply bg-green-500;
  }

  .status-indicator.text-primary-700 .status-dot {
    @apply bg-blue-500;
  }

  .status-indicator.text-warning-700 .status-dot {
    @apply bg-yellow-500;
  }

  .status-text {
    @apply text-sm font-medium;
  }

  /* Duration Display */
  .duration-display {
    @apply grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b border-neutral-200;
  }

  .duration-item {
    @apply text-center;
  }

  .duration-label {
    @apply text-xs text-gray-500 uppercase tracking-wide font-medium mb-1;
  }

  .duration-value {
    @apply text-lg font-bold text-gray-900 font-mono;
  }

  /* Time Progress Block */
  .time-progress-block {
    @apply p-4 bg-white;
  }

  /* Horizontal Clock Container */
  .horizontal-clock-container {
    @apply relative;
  }

  /* Time Markers */
  .time-markers {
    @apply flex justify-between items-center mb-2 relative;
  }

  .time-marker {
    @apply flex flex-col items-center;
  }

  .marker-line {
    @apply w-px h-4 bg-neutral-300 mb-1;
  }

  .start-marker .marker-line {
    @apply bg-success-400;
  }

  .lunch-marker .marker-line {
    @apply bg-warning-400;
  }

  .end-marker .marker-line {
    @apply bg-error-400;
  }

  .regular-marker .marker-line {
    @apply bg-neutral-300;
  }

  .marker-time {
    @apply text-xs font-medium text-neutral-600;
  }

  /* Enhanced Progress Bar */
  .time-progress-bar {
    @apply w-full h-5 bg-neutral-100 rounded-lg mb-3 relative;
    border: 1px solid #e5e7eb;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  /* Pre-work time fill */
  .pre-work-fill {
    @apply absolute top-0 left-0 h-full;
    background: linear-gradient(135deg, #fee2e2, #fca5a5, #f87171);
    z-index: 1;
  }

  .pre-work-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: repeating-linear-gradient(45deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.2) 2px,
        rgba(255, 255, 255, 0.2) 4px);
    z-index: 2;
  }

  /* Work progress fill */
  .work-progress-fill {
    @apply absolute top-0 h-full;
    background: linear-gradient(135deg, #dcfce7, #86efac, #22c55e);
    z-index: 2;
    box-shadow: 0 1px 3px rgba(34, 197, 94, 0.3);
    border: 1px solid rgba(34, 197, 94, 0.4);
  }

  .work-progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: repeating-linear-gradient(45deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.2) 2px,
        rgba(255, 255, 255, 0.2) 4px);
    z-index: 1;
  }

  /* Break time fill */
  .break-time-fill {
    @apply absolute top-0 h-full;
    background: linear-gradient(135deg, #fed7aa, #fdba74, #fb923c);
    z-index: 3;
    min-width: 3px;
    box-shadow: 0 1px 3px rgba(251, 146, 60, 0.3);
    border: 1px solid rgba(251, 146, 60, 0.4);
  }

  .break-time-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: repeating-linear-gradient(45deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.2) 2px,
        rgba(255, 255, 255, 0.2) 4px);
    z-index: 1;
  }

  .break-time-fill.ongoing-break {
    animation: breakPulse 2s infinite ease-in-out;
    box-shadow: 0 2px 6px rgba(251, 146, 60, 0.4);
  }

  @keyframes breakPulse {

    0%,
    100% {
      opacity: 0.8;
      transform: scaleY(1);
    }

    50% {
      opacity: 1;
      transform: scaleY(1.05);
    }
  }

  /* Background shimmer */
  .progress-bar-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.1) 50%,
        transparent 100%);
    background-size: 200% 100%;
    animation: backgroundShimmer 3s infinite ease-in-out;
  }

  @keyframes backgroundShimmer {
    0% {
      background-position: -200% 0;
    }

    100% {
      background-position: 200% 0;
    }
  }

  /* Current Time Indicator */
  .current-time-indicator {
    @apply absolute top-0 right-0 transform translate-x-1/2 -translate-y-1;
  }

  .time-dot {
    @apply w-3 h-3 bg-blue-500 rounded-full shadow-lg;
    animation: timePulse 2s infinite ease-in-out;
  }

  .time-tooltip {
    @apply absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap;
  }

  @keyframes timePulse {

    0%,
    100% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.2);
    }
  }

  /* Progress Information */
  .time-progress-info {
    @apply flex justify-between items-center mt-2;
  }

  .progress-left {
    @apply flex items-center space-x-2;
  }

  .progress-time {
    @apply text-sm font-medium text-gray-700;
  }

  .progress-status {
    @apply text-xs font-medium px-2 py-1 rounded-full;
  }

  .progress-right {
    @apply text-sm font-medium text-gray-700;
  }



  /* Break and Clock Action Buttons */
  .break-button,
  .end-break-button {
    @apply inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
  }

  .break-button {
    @apply text-white bg-warning-600 border border-warning-600 hover:bg-warning-700 focus:ring-warning-500;
  }

  .end-break-button {
    @apply text-white bg-success-600 border border-success-600 hover:bg-success-700 focus:ring-success-500;
  }

  /* Dashboard Content */
  .dashboard-content {
    @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
  }

  .left-column {
    @apply lg:col-span-2 space-y-6;
  }

  .right-column {
    @apply space-y-6;
  }

  /* Responsive Design */
  @media (max-width: 640px) {
    .real-time-clock {
      @apply flex-col space-y-4;
    }

    .duration-display {
      @apply grid-cols-2 gap-2;
    }

    .current-time {
      @apply text-2xl;
    }

    .time-markers {
      @apply hidden;
    }

    .stats-grid {
      @apply grid-cols-2 gap-4;
    }

    .stat-item {
      @apply flex-col space-x-0 space-y-2 text-center;
    }

    .stat-value {
      @apply text-lg;
    }
  }
</style>
<style scoped>
  /* Journey & Growth Styles */
  .journey-overview-section {
    @apply space-y-6 mb-8;
  }

  .section-title {
    @apply text-lg font-semibold text-gray-900 mb-4;
  }

  /* Journey Milestones */
  .milestone-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
  }

  .milestone-card {
    @apply bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow;
  }

  .milestone-icon {
    @apply mb-3;
  }

  .milestone-value {
    @apply text-2xl font-bold text-gray-900;
  }

  .milestone-label {
    @apply text-sm font-medium text-gray-700;
  }

  .milestone-sublabel {
    @apply text-xs text-gray-500 mt-1;
  }

  /* Performance Stats */
  .stats-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
  }

  .stat-card {
    @apply bg-white rounded-lg border p-4 relative overflow-hidden;
  }

  .stat-card.primary {
    @apply border-blue-200 bg-blue-50;
  }

  .stat-card.success {
    @apply border-green-200 bg-green-50;
  }

  .stat-card.info {
    @apply border-purple-200 bg-purple-50;
  }

  .stat-card.warning {
    @apply border-yellow-200 bg-yellow-50;
  }

  .stat-header {
    @apply flex items-center justify-between mb-2;
  }

  .stat-trend {
    @apply text-xs font-medium px-2 py-1 rounded-full;
  }

  .stat-trend.positive {
    @apply bg-green-100 text-green-700;
  }

  .stat-trend.negative {
    @apply bg-red-100 text-red-700;
  }

  .stat-trend.neutral {
    @apply bg-gray-100 text-gray-600;
  }

  .consistency-score {
    @apply text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700;
  }

  .stat-value {
    @apply text-2xl font-bold text-gray-900;
  }

  .stat-label {
    @apply text-sm text-gray-600;
  }

  /* Achievements */
  .achievements-grid {
    @apply grid grid-cols-1 md:grid-cols-3 gap-4;
  }

  .achievement-summary {
    @apply bg-white rounded-lg border border-gray-200 p-4 text-center;
  }

  .achievement-count {
    @apply text-3xl font-bold text-yellow-600;
  }

  .achievement-label {
    @apply text-sm text-gray-600;
  }

  .recent-achievements {
    @apply md:col-span-2 bg-white rounded-lg border border-gray-200 p-4;
  }

  .achievement-item {
    @apply flex items-center space-x-3 py-2;
  }

  .achievement-badge {
    @apply text-lg;
  }

  .achievement-text {
    @apply text-sm text-gray-700;
  }

  /* Growth Progress */
  .progress-items {
    @apply space-y-4;
  }

  .progress-item {
    @apply bg-white rounded-lg border border-gray-200 p-4;
  }

  .progress-header {
    @apply flex items-center justify-between mb-2;
  }

  .progress-label {
    @apply text-sm font-medium text-gray-700;
  }

  .progress-value {
    @apply text-sm font-semibold text-gray-900;
  }

  .progress-bar {
    @apply w-full bg-gray-200 rounded-full h-2;
  }

  .progress-fill {
    @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
  }
</style>