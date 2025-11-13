<template>
    <AuthenticatedLayout>
        <template #header>
            Employee Handbook
        </template>

        <template #subtitle>
            Your complete guide to using the Xonobics HR system
        </template>

        <div class="handbook-container">
            <!-- Quick Navigation -->
            <div class="quick-nav">
                <h2 class="nav-title">Quick Navigation</h2>
                <div class="nav-grid">
                    <a href="#attendance" class="nav-card">
                        <ClockIcon class="nav-icon" />
                        <span>Time Tracking</span>
                    </a>
                    <a href="#leaves" class="nav-card">
                        <CalendarDaysIcon class="nav-icon" />
                        <span>Leave Requests</span>
                    </a>
                    <a href="#reports" class="nav-card">
                        <DocumentTextIcon class="nav-icon" />
                        <span>Work Reports</span>
                    </a>
                    <a href="#support" class="nav-card">
                        <QuestionMarkCircleIcon class="nav-icon" />
                        <span>Get Support</span>
                    </a>
                </div>
            </div>

            <!-- Time Tracking Section -->
            <section id="attendance" class="handbook-section">
                <div class="section-header">
                    <ClockIcon class="section-icon" />
                    <h2>Time Tracking & Attendance</h2>
                </div>

                <div class="feature-grid">
                    <!-- Clock In/Out -->
                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon success">
                                <PlayIcon class="w-6 h-6" />
                            </div>
                            <h3>Clock In & Clock Out</h3>
                        </div>
                        <div class="feature-content">
                            <p>Track your work hours easily with our one-click system.</p>

                            <div class="step-list">
                                <div class="step">
                                    <span class="step-number">1</span>
                                    <div class="step-content">
                                        <strong>Clock In:</strong>
                                        <div class="navigation-hint">
                                            <ArrowRightIcon class="hint-arrow" />
                                            On your dashboard, click the <span class="click-target green">🕐 Clock
                                                In</span> button
                                        </div>
                                        <div class="location-note">
                                            📍 <em>Found in the top section of your dashboard</em>
                                        </div>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">2</span>
                                    <div class="step-content">
                                        <strong>Clock Out:</strong>
                                        <div class="navigation-hint">
                                            <ArrowRightIcon class="hint-arrow" />
                                            When done working, click the <span class="click-target red">🕐 Clock
                                                Out</span> button
                                        </div>
                                        <div class="location-note">
                                            📍 <em>Same location, button changes after clock-in</em>
                                        </div>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">3</span>
                                    <div class="step-content">
                                        <strong>Monitor Progress:</strong>
                                        <div class="progress-indicators">
                                            <div class="indicator-item">⏱️ Real-time work duration display</div>
                                            <div class="indicator-item">📊 Progress bar showing daily completion</div>
                                            <div class="indicator-item">🎯 Timeline visualization of your workday</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="tip-box">
                                <LightBulbIcon class="tip-icon" />
                                <div>
                                    <strong>Pro Tip:</strong> Your work time is automatically calculated and synced to
                                    timesheets!
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Break Management -->
                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon warning">
                                <PauseIcon class="w-6 h-6" />
                            </div>
                            <h3>Break Management</h3>
                        </div>
                        <div class="feature-content">
                            <p>Take breaks and track them automatically.</p>

                            <div class="step-list">
                                <div class="step">
                                    <span class="step-number">1</span>
                                    <div class="step-content">
                                        <strong>Start Break:</strong>
                                        <div class="navigation-hint">
                                            <ArrowRightIcon class="hint-arrow" />
                                            Click the <span class="click-target orange">⏸️ Take Break</span> button
                                            (appears after clock-in)
                                        </div>
                                        <div class="location-note">
                                            📍 <em>Next to the Clock Out button on your dashboard</em>
                                        </div>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">2</span>
                                    <div class="step-content">
                                        <strong>End Break:</strong>
                                        <div class="navigation-hint">
                                            <ArrowRightIcon class="hint-arrow" />
                                            Click <span class="click-target green">▶️ End Break</span> when you return
                                        </div>
                                        <div class="location-note">
                                            📍 <em>Same button location, text changes during break</em>
                                        </div>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">3</span>
                                    <div class="step-content">
                                        <strong>Automatic Tracking:</strong>
                                        <div class="auto-features">
                                            <div class="feature-item">🟠 Orange bars show break periods on timeline
                                            </div>
                                            <div class="feature-item">⏰ Break time excluded from work hours</div>
                                            <div class="feature-item">📊 Real-time break duration display</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="info-box">
                                <InformationCircleIcon class="info-icon" />
                                <div>
                                    Break times appear as orange bars on your timeline and don't count toward work
                                    hours.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline Understanding -->
                    <div class="feature-card full-width">
                        <div class="feature-header">
                            <div class="feature-icon info">
                                <ChartBarIcon class="w-6 h-6" />
                            </div>
                            <h3>Understanding Your Timeline</h3>
                        </div>
                        <div class="feature-content">
                            <div class="timeline-guide">
                                <div class="timeline-example">
                                    <div class="timeline-bar">
                                        <div class="timeline-segment pre-work">Pre-work</div>
                                        <div class="timeline-segment work-time">Work Time</div>
                                        <div class="timeline-segment break-time">Break</div>
                                        <div class="timeline-segment work-time">Work Time</div>
                                    </div>
                                    <div class="timeline-labels">
                                        <span>8 AM</span>
                                        <span>12 PM</span>
                                        <span>5 PM</span>
                                    </div>
                                </div>

                                <div class="timeline-legend">
                                    <div class="legend-item">
                                        <div class="legend-color pre-work"></div>
                                        <span><strong>Red:</strong> Time before you clocked in</span>
                                    </div>
                                    <div class="legend-item">
                                        <div class="legend-color work-time"></div>
                                        <span><strong>Green:</strong> Active work time</span>
                                    </div>
                                    <div class="legend-item">
                                        <div class="legend-color break-time"></div>
                                        <span><strong>Orange:</strong> Break periods</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Leave Requests Section -->
            <section id="leaves" class="handbook-section">
                <div class="section-header">
                    <CalendarDaysIcon class="section-icon" />
                    <h2>Leave Requests</h2>
                </div>

                <div class="feature-grid">
                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon info">
                                <PlusIcon class="w-6 h-6" />
                            </div>
                            <h3>Requesting Leave</h3>
                        </div>
                        <div class="feature-content">
                            <div class="step-list">
                                <div class="step">
                                    <span class="step-number">1</span>
                                    <div class="step-content">
                                        <strong>Navigate to Leaves:</strong>
                                        <div class="navigation-hint">
                                            <ArrowRightIcon class="hint-arrow" />
                                            Click <span class="click-target">Leaves</span> in the left sidebar menu
                                        </div>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">2</span>
                                    <div class="step-content">
                                        <strong>Start New Request:</strong>
                                        <div class="navigation-hint">
                                            <ArrowRightIcon class="hint-arrow" />
                                            Look for the <span class="click-target green">+ Request Leave</span> button
                                            at the top right
                                        </div>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">3</span>
                                    <div class="step-content">
                                        <strong>Fill the Form:</strong>
                                        <div class="form-fields">
                                            <div class="field-item">📅 Select start and end dates</div>
                                            <div class="field-item">📝 Choose leave type (Sick, Vacation, etc.)</div>
                                            <div class="field-item">💬 Add reason/description</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">4</span>
                                    <div class="step-content">
                                        <strong>Submit Request:</strong>
                                        <div class="navigation-hint">
                                            <ArrowRightIcon class="hint-arrow" />
                                            Click <span class="click-target blue">Submit Request</span> button at the
                                            bottom
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon success">
                                <EyeIcon class="w-6 h-6" />
                            </div>
                            <h3>Tracking Leave Status</h3>
                        </div>
                        <div class="feature-content">
                            <div class="status-guide">
                                <div class="status-item">
                                    <span class="status-badge pending">Pending</span>
                                    <span>Waiting for manager approval</span>
                                </div>
                                <div class="status-item">
                                    <span class="status-badge approved">Approved</span>
                                    <span>Leave request accepted</span>
                                </div>
                                <div class="status-item">
                                    <span class="status-badge rejected">Rejected</span>
                                    <span>Leave request declined</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Work Reports Section -->
            <section id="reports" class="handbook-section">
                <div class="section-header">
                    <DocumentTextIcon class="section-icon" />
                    <h2>Work Reports</h2>
                </div>

                <div class="feature-grid">
                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon info">
                                <PencilIcon class="w-6 h-6" />
                            </div>
                            <h3>Submitting Work Reports</h3>
                        </div>
                        <div class="feature-content">
                            <div class="step-list">
                                <div class="step">
                                    <span class="step-number">1</span>
                                    <div class="step-content">
                                        <strong>Go to Work Reports:</strong>
                                        <div class="navigation-hint">
                                            <ArrowRightIcon class="hint-arrow" />
                                            Click <span class="click-target">Work Reports</span> in the left sidebar
                                        </div>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">2</span>
                                    <div class="step-content">
                                        <strong>Create New Report:</strong>
                                        <div class="navigation-hint">
                                            <ArrowRightIcon class="hint-arrow" />
                                            Click <span class="click-target green">+ Submit Report</span> button
                                        </div>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">3</span>
                                    <div class="step-content">
                                        <strong>Fill Report Details:</strong>
                                        <div class="form-fields">
                                            <div class="field-item">📋 Describe daily activities</div>
                                            <div class="field-item">🎯 List achievements and goals met</div>
                                            <div class="field-item">📞 Record client interactions</div>
                                            <div class="field-item">⏰ Add time spent on tasks</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="step">
                                    <span class="step-number">4</span>
                                    <div class="step-content">
                                        <strong>Submit Report:</strong>
                                        <div class="navigation-hint">
                                            <ArrowRightIcon class="hint-arrow" />
                                            Click <span class="click-target blue">Save Report</span> to submit
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="tip-box">
                                <LightBulbIcon class="tip-icon" />
                                <div>
                                    <strong>Best Practice:</strong> Submit reports daily for better tracking and
                                    performance reviews.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-header">
                            <div class="feature-icon success">
                                <ChartBarIcon class="w-6 h-6" />
                            </div>
                            <h3>Performance Tracking</h3>
                        </div>
                        <div class="feature-content">
                            <p>Your work reports help track:</p>
                            <ul class="benefit-list">
                                <li>Daily productivity</li>
                                <li>Client interaction success</li>
                                <li>Goal achievement</li>
                                <li>Performance improvements</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Support Section -->
            <section id="support" class="handbook-section">
                <div class="section-header">
                    <QuestionMarkCircleIcon class="section-icon" />
                    <h2>Getting Support</h2>
                </div>

                <div class="support-grid">
                    <div class="support-card">
                        <div class="support-icon">
                            <ChatBubbleLeftRightIcon class="w-8 h-8" />
                        </div>
                        <h3>Need Help?</h3>
                        <p>Contact your manager or HR team for assistance with any system issues.</p>
                        <button class="support-button">Contact Support</button>
                    </div>

                    <div class="support-card">
                        <div class="support-icon">
                            <BookOpenIcon class="w-8 h-8" />
                        </div>
                        <h3>Common Issues</h3>
                        <ul class="faq-list">
                            <li>Can't clock in? Check your internet connection</li>
                            <li>Missing work hours? Contact your manager</li>
                            <li>Leave not approved? Follow up with your supervisor</li>
                        </ul>
                    </div>

                    <div class="support-card">
                        <div class="support-icon">
                            <CogIcon class="w-8 h-8" />
                        </div>
                        <h3>System Tips</h3>
                        <ul class="tips-list">
                            <li>Always clock out before leaving</li>
                            <li>Submit timesheets on time</li>
                            <li>Keep work reports detailed</li>
                            <li>Update your profile regularly</li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- Quick Actions Footer -->
            <div class="quick-actions-footer">
                <h3>Quick Actions</h3>
                <div class="action-buttons">
                    <button @click="navigateTo('dashboard')" class="action-btn primary">
                        <HomeIcon class="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <button @click="navigateTo('leaves.create')" class="action-btn secondary">
                        <CalendarDaysIcon class="w-5 h-5" />
                        Request Leave
                    </button>
                    <button @click="navigateTo('work-reports.create')" class="action-btn secondary">
                        <DocumentTextIcon class="w-5 h-5" />
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<script setup>
    import { router } from '@inertiajs/vue3'
    import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
    import {
        ClockIcon,
        CalendarDaysIcon,
        DocumentTextIcon,
        QuestionMarkCircleIcon,
        PlayIcon,
        PauseIcon,
        ChartBarIcon,
        PlusIcon,
        EyeIcon,
        PencilIcon,
        InformationCircleIcon,
        ChatBubbleLeftRightIcon,
        BookOpenIcon,
        CogIcon,
        HomeIcon,
        LightBulbIcon,
        ArrowRightIcon
    } from '@heroicons/vue/24/outline'

    const navigateTo = (routeName) => {
        try {
            router.visit(route(routeName))
        } catch (error) {
            console.error('Navigation error:', error)
        }
    }
</script>

<style scoped lang="postcss">
    .handbook-container {
        @apply max-w-6xl mx-auto space-y-12 p-6;
    }

    /* Quick Navigation */
    .quick-nav {
        @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
    }

    .nav-title {
        @apply text-xl font-semibold text-gray-900 mb-4;
    }

    .nav-grid {
        @apply grid grid-cols-2 md:grid-cols-4 gap-4;
    }

    .nav-card {
        @apply flex flex-col items-center p-4 bg-gray-50 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-teal-200;
        min-height: 80px;
    }

    .nav-icon {
        @apply w-8 h-8 text-teal-600 mb-2;
    }

    .nav-card span {
        @apply text-sm font-medium text-gray-700;
    }

    /* Sections */
    .handbook-section {
        @apply bg-white rounded-xl shadow-sm border border-gray-200 p-8;
    }

    .section-header {
        @apply flex items-center mb-8;
    }

    .section-icon {
        @apply w-8 h-8 text-teal-600 mr-3;
    }

    .section-header h2 {
        @apply text-2xl font-bold text-gray-900;
    }

    /* Feature Grid */
    .feature-grid {
        @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
    }

    .feature-card {
        @apply bg-gray-50 rounded-lg p-6 border border-gray-200;
    }

    .feature-card.full-width {
        @apply lg:col-span-2;
    }

    .feature-header {
        @apply flex items-center mb-4;
    }

    .feature-icon {
        @apply w-12 h-12 rounded-lg flex items-center justify-center mr-4;
    }

    .feature-icon.success {
        @apply bg-green-100 text-green-600;
    }

    .feature-icon.warning {
        @apply bg-yellow-100 text-yellow-600;
    }

    .feature-icon.info {
        @apply bg-teal-100 text-teal-600;
    }

    .feature-header h3 {
        @apply text-lg font-semibold text-gray-900;
    }

    .feature-content p {
        @apply text-gray-600 mb-4;
    }

    /* Steps */
    .step-list {
        @apply space-y-3 mb-4;
    }

    .step {
        @apply flex items-start;
    }

    .step-number {
        @apply w-6 h-6 bg-teal-600 text-white text-sm font-bold rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5;
    }

    .step-content {
        @apply text-sm text-gray-700;
    }

    /* Info Boxes */
    .tip-box,
    .info-box {
        @apply flex items-start p-3 rounded-lg;
    }

    .tip-box {
        @apply bg-yellow-50 border border-yellow-200;
    }

    .info-box {
        @apply bg-teal-50 border border-teal-200;
    }

    .tip-icon,
    .info-icon {
        @apply w-5 h-5 mr-2 flex-shrink-0 mt-0.5;
    }

    .tip-icon {
        @apply text-yellow-600;
    }

    .info-icon {
        @apply text-teal-600;
    }

    /* Timeline Guide */
    .timeline-guide {
        @apply space-y-4;
    }

    .timeline-example {
        @apply space-y-2;
    }

    .timeline-bar {
        @apply flex h-8 rounded-lg overflow-hidden border border-gray-300;
    }

    .timeline-segment {
        @apply flex items-center justify-center text-xs font-medium text-white;
    }

    .timeline-segment.pre-work {
        @apply bg-red-500;
        flex: 2;
    }

    .timeline-segment.work-time {
        @apply bg-green-500;
        flex: 3;
    }

    .timeline-segment.break-time {
        @apply bg-orange-500;
        flex: 1;
    }

    .timeline-labels {
        @apply flex justify-between text-xs text-gray-500;
    }

    .timeline-legend {
        @apply grid grid-cols-1 md:grid-cols-3 gap-3;
    }

    .legend-item {
        @apply flex items-center;
    }

    .legend-color {
        @apply w-4 h-4 rounded mr-2;
    }

    .legend-color.pre-work {
        @apply bg-red-500;
    }

    .legend-color.work-time {
        @apply bg-green-500;
    }

    .legend-color.break-time {
        @apply bg-orange-500;
    }

    /* Status Guide */
    .status-guide {
        @apply space-y-3;
    }

    .status-item {
        @apply flex items-center justify-between;
    }

    .status-badge {
        @apply px-3 py-1 rounded-full text-xs font-medium;
    }

    .status-badge.pending {
        @apply bg-yellow-100 text-yellow-800;
    }

    .status-badge.approved {
        @apply bg-green-100 text-green-800;
    }

    .status-badge.rejected {
        @apply bg-red-100 text-red-800;
    }

    /* Lists */
    .benefit-list,
    .faq-list,
    .tips-list {
        @apply space-y-2 text-sm text-gray-600;
    }

    .benefit-list li,
    .faq-list li,
    .tips-list li {
        @apply flex items-start;
    }

    .benefit-list li::before {
        @apply content-['✓'] text-green-600 font-bold mr-2;
    }

    .faq-list li::before {
        @apply content-['?'] text-teal-600 font-bold mr-2;
    }

    .tips-list li::before {
        @apply content-['💡'] mr-2;
    }

    /* Support Grid */
    .support-grid {
        @apply grid grid-cols-1 md:grid-cols-3 gap-6;
    }

    .support-card {
        @apply bg-gray-50 rounded-lg p-6 text-center border border-gray-200;
    }

    .support-icon {
        @apply w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4;
    }

    .support-card h3 {
        @apply text-lg font-semibold text-gray-900 mb-2;
    }

    .support-card p {
        @apply text-gray-600 mb-4;
    }

    .support-button {
        @apply px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors;
    }

    /* Quick Actions Footer */
    .quick-actions-footer {
        @apply bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-6 text-center;
    }

    .quick-actions-footer h3 {
        @apply text-xl font-semibold text-gray-900 mb-4;
    }

    .action-buttons {
        @apply flex flex-wrap justify-center gap-3;
    }

    .action-btn {
        @apply flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors;
        min-height: 44px;
    }

    .action-btn.primary {
        @apply bg-teal-600 text-white hover:bg-teal-700;
    }

    .action-btn.secondary {
        @apply bg-white text-gray-700 border border-gray-300 hover:bg-gray-50;
    }

    /* Responsive Design */
    @media (max-width: 640px) {
        .handbook-container {
            @apply p-4 space-y-8;
        }

        .feature-grid {
            @apply grid-cols-1;
        }

        .nav-grid {
            @apply grid-cols-2;
        }

        .action-buttons {
            @apply flex-col;
        }
    }

    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {

        .nav-card,
        .action-btn,
        .support-button {
            @apply transition-none;
        }
    }

    /* Navigation Hints */
    .navigation-hint {
        @apply flex items-center mt-2 p-2 bg-teal-50 rounded-lg border-l-4 border-teal-400;
    }

    .hint-arrow {
        @apply w-4 h-4 text-teal-600 mr-2 flex-shrink-0;
    }

    .click-target {
        @apply px-2 py-1 rounded font-semibold text-white mx-1;
    }

    .click-target.green {
        @apply bg-green-600;
    }

    .click-target.red {
        @apply bg-red-600;
    }

    .click-target.blue {
        @apply bg-teal-600;
    }

    .click-target.orange {
        @apply bg-orange-600;
    }

    .click-target:not(.green):not(.red):not(.blue):not(.orange) {
        @apply bg-gray-700;
    }

    .location-note {
        @apply text-xs text-gray-500 mt-1 italic;
    }

    .form-fields,
    .progress-indicators,
    .auto-features {
        @apply mt-2 space-y-1;
    }

    .field-item,
    .indicator-item,
    .feature-item {
        @apply text-sm text-gray-600 flex items-center;
    }

    /* Focus States */
    .nav-card:focus-visible,
    .action-btn:focus-visible,
    .support-button:focus-visible {
        @apply ring-2 ring-teal-500 ring-offset-2;
    }
</style>