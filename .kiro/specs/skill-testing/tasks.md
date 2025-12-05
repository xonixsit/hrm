# Implementation Plan: Skill Testing System

## Overview
This implementation plan breaks down the Skill Testing System into discrete, manageable coding tasks that build incrementally. Each task focuses on writing, modifying, or testing code to implement the feature according to the design specification.

---

## Phase 1: Database Setup and Core Models

- [x] 1. Create database migrations for skill testing tables (COMPLETED)
  - Create migration for `skill_tests` table with all required columns
  - Create migration for `questions` table with polymorphic type support
  - Create migration for `question_options` table for MCQ and single answer options
  - Create migration for `text_question_configs` table for text-based question settings
  - Create migration for `test_assignments` table for employee assignments
  - Create migration for `test_sessions` table for tracking test attempts
  - Create migration for `test_responses` table for storing employee responses
  - Create migration for `answers` table for individual question answers
  - Create migration for `text_answer_reviews` table for admin reviews
  - Add appropriate indexes on foreign keys and frequently queried columns
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Create Eloquent models with relationships (COMPLETED)
  - Create `SkillTest` model with relationships to questions, assignments, and responses
  - Create `Question` model with polymorphic relationships to different question types
  - Create `QuestionOption` model for MCQ and single answer options
  - Create `TextQuestionConfig` model for text question configuration
  - Create `TestAssignment` model with relationships to test and employee
  - Create `TestSession` model for tracking test attempts
  - Create `TestResponse` model with relationships to responses and answers
  - Create `Answer` model for individual question answers
  - Create `TextAnswerReview` model for admin reviews
  - Implement all relationships as defined in design document
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 2.1 Write property test for model relationships
  - **Property 11: Test Archiving Preservation**
  - **Validates: Requirements 1.7, 11.7**

---

## Phase 2: Test Management (Creation, Editing, Publishing)

- [x] 3. Implement SkillTestService for test management (COMPLETED)
  - Create `SkillTestService` class with methods for CRUD operations
  - Implement `createTest()` method with validation for unique names
  - Implement `updateTest()` method with validation
  - Implement `publishTest()` method with validation that test has at least one properly configured question
  - Implement `archiveTest()` method that preserves historical data
  - Implement `getTestsByStatus()` method for filtering tests
  - _Requirements: 1.1, 1.2, 1.5, 1.6, 1.7_

- [x] 4. Implement QuestionService for question management (COMPLETED)
  - Create `QuestionService` class for managing questions within tests
  - Implement `addQuestion()` method with type-specific validation
  - Implement `updateQuestion()` method
  - Implement `deleteQuestion()` method
  - Implement `reorderQuestions()` method for drag-and-drop functionality
  - Implement `validateQuestionConfiguration()` method
  - _Requirements: 1.4, 1.5, 2.1, 3.1, 4.1_

- [x] 5. Create SkillTestController for test management endpoints (COMPLETED)
  - Create `SkillTestController` with routes for test CRUD operations
  - Implement `index()` to list all tests with filtering
  - Implement `create()` to show test creation form
  - Implement `store()` to create new test
  - Implement `edit()` to show test editing form
  - Implement `update()` to update existing test
  - Implement `destroy()` to delete test
  - Implement `publish()` to publish test
  - Implement `archive()` to archive test
  - Add authorization checks using policies
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7_

- [ ]* 5.1 Write property test for test uniqueness
  - **Property 1: Test Uniqueness**
  - **Validates: Requirements 1.2**

- [ ]* 5.2 Write property test for question validation
  - **Property 2: Question Validation**
  - **Validates: Requirements 1.5**

---

## Phase 3: Question Management API

- [ ] 6. Create QuestionController for question management endpoints
  - Create `QuestionController` with endpoints for question CRUD operations
  - Implement `store()` to add new question to test
  - Implement `update()` to update existing question
  - Implement `destroy()` to delete question
  - Implement `reorder()` to handle drag-and-drop reordering
  - Add authorization checks using policies
  - _Requirements: 1.4, 1.5, 2.1, 3.1, 4.1_

- [ ] 7. Create Vue components for test creation and editing
  - Create `TestForm.vue` component for creating/editing tests
  - Create `QuestionBuilder.vue` component for adding and managing questions
  - Create `MCQQuestionForm.vue` component for MCQ question creation
  - Create `TextQuestionForm.vue` component for text question creation
  - Create `SingleAnswerQuestionForm.vue` component for single answer questions
  - Create `QuestionList.vue` component with drag-and-drop reordering
  - Implement form validation and error handling
  - _Requirements: 1.1, 1.4, 1.5, 2.1, 3.1, 4.1_

- [ ]* 7.1 Write property test for MCQ scoring
  - **Property 3: MCQ Scoring Accuracy**
  - **Validates: Requirements 2.6, 7.1, 7.2**

- [ ]* 7.2 Write property test for single answer scoring
  - **Property 4: Single Answer Scoring**
  - **Validates: Requirements 4.4**

---

## Phase 4: Test Assignment and Employee Access

- [ ] 8. Implement TestAssignmentService
  - Create `TestAssignmentService` class
  - Implement `assignToEmployees()` method for individual employee assignment
  - Implement `assignToGroup()` method for department/role-based assignment
  - Implement `updateAssignment()` method to modify deadlines and attempt limits
  - Implement `getAssignmentsForEmployee()` method
  - Implement `getAssignmentStatus()` method
  - Validate test is published before assignment
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 9. Create TestAssignmentController
  - Create `TestAssignmentController` with assignment endpoints
  - Implement `assign()` to show assignment form
  - Implement `storeAssignment()` to create assignments
  - Implement `updateAssignment()` to modify existing assignments
  - Implement `getAssignedTests()` to list tests for current employee
  - Add authorization checks
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Create Vue components for test assignment
  - Create `AssignmentForm.vue` component for assigning tests
  - Create `EmployeeSelector.vue` component for selecting employees/groups
  - Create `AssignmentList.vue` component for viewing assignments
  - Implement deadline and attempt limit configuration
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 11. Implement notification on test assignment
  - Create `TestAssignedNotification` class
  - Implement notification sending in `TestAssignmentService`
  - Include test details, deadline, and instructions in notification
  - Support email and in-app notifications
  - _Requirements: 5.3, 12.1_

- [ ]* 11.1 Write property test for assignment notifications
  - **Property 13: Notification on Assignment**
  - **Validates: Requirements 5.3, 12.1**

---

## Phase 5: Test Taking Interface and Session Management

- [ ] 12. Implement TestSessionService
  - Create `TestSessionService` class
  - Implement `startSession()` method to create test session
  - Implement `getSessionStatus()` method to check time remaining and progress
  - Implement `saveResponse()` method to store answer without submission
  - Implement `submitTest()` method to finalize test
  - Implement time limit enforcement
  - Implement deadline enforcement
  - Implement attempt limit enforcement
  - _Requirements: 5.5, 5.6, 5.7, 6.2, 6.3, 6.6_

- [ ] 13. Create TestTakingController
  - Create `TestTakingController` for test-taking endpoints
  - Implement `show()` to display test instructions and start screen
  - Implement `getQuestion()` to retrieve current question
  - Implement `saveAnswer()` to save response without submission
  - Implement `getTestSummary()` to show all questions and responses
  - Implement `submitTest()` to finalize test
  - Add authorization to ensure employee can only access assigned tests
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7_

- [ ] 14. Create Vue components for test taking
  - Create `TestStartScreen.vue` component showing test info and start button
  - Create `QuestionDisplay.vue` component for displaying questions
  - Create `MCQQuestion.vue` component for MCQ display and interaction
  - Create `TextQuestion.vue` component for text input
  - Create `SingleAnswerQuestion.vue` component for single answer display
  - Create `TestSummary.vue` component for review before submission
  - Create `TestTimer.vue` component for countdown timer with warnings
  - Implement navigation between questions
  - Implement progress tracking
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 14.1 Write property test for answer persistence
  - **Property 10: Answer Persistence**
  - **Validates: Requirements 6.3**

- [ ]* 14.2 Write property test for time limit enforcement
  - **Property 8: Time Limit Enforcement**
  - **Validates: Requirements 5.5, 6.6**

- [ ]* 14.3 Write property test for deadline enforcement
  - **Property 9: Deadline Enforcement**
  - **Validates: Requirements 5.7**

---

## Phase 6: Automatic Scoring for Objective Questions

- [ ] 15. Implement ScoringService for automatic scoring
  - Create `ScoringService` class
  - Implement `scoreObjectiveQuestions()` method
  - Implement MCQ scoring with support for full credit, partial credit, and all-or-nothing modes
  - Implement single answer scoring
  - Implement `calculateTotalScore()` method to compute percentage
  - Implement `determinePassed()` method based on passing threshold
  - Implement `generateScoreReport()` method
  - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7_

- [ ] 16. Integrate scoring into test submission
  - Modify `TestSessionService.submitTest()` to call scoring service
  - Implement automatic scoring for objective questions
  - Mark tests with text questions as "Pending Review"
  - Calculate and store total score and percentage
  - Determine pass/fail status
  - Store review status in TestResponse
  - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6_

- [ ] 17. Create score display components
  - Create `ScoreDisplay.vue` component showing score and pass/fail status
  - Create `QuestionBreakdown.vue` component showing question-by-question results
  - Create `FeedbackDisplay.vue` component showing correct answers and explanations
  - Implement conditional display based on feedback timing configuration
  - _Requirements: 7.4, 7.7_

- [ ]* 17.1 Write property test for score calculation accuracy
  - **Property 6: Score Calculation Accuracy**
  - **Validates: Requirements 7.3**

- [ ]* 17.2 Write property test for pass/fail determination
  - **Property 7: Pass/Fail Determination**
  - **Validates: Requirements 7.6**

- [ ]* 17.3 Write property test for text answer pending review
  - **Property 5: Text Answer Pending Review**
  - **Validates: Requirements 7.5**

---

## Phase 7: Admin Review Workflow for Text Answers

- [ ] 18. Implement ReviewService for text answer grading
  - Create `ReviewService` class
  - Implement `getPendingReviews()` method to list tests awaiting review
  - Implement `gradeTextAnswer()` method to score and comment on answers
  - Implement `completeReview()` method to finalize all reviews for a test
  - Implement `getReviewStatus()` method
  - Implement `calculateFinalScore()` method including text answer points
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 19. Create ReviewController for admin review endpoints
  - Create `ReviewController` with review management endpoints
  - Implement `getPendingReviews()` to list pending reviews
  - Implement `showReview()` to display test for review
  - Implement `gradeAnswer()` to save grade and comment
  - Implement `completeReview()` to finalize review
  - Add authorization to ensure only admins can review
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 20. Create Vue components for review interface
  - Create `PendingReviewsList.vue` component showing tests awaiting review
  - Create `ReviewInterface.vue` component for grading text answers
  - Create `TextAnswerDisplay.vue` component showing employee response and guidelines
  - Create `GradingForm.vue` component for entering score and comments
  - Create `ReviewProgress.vue` component showing review completion status
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 8.7_

- [ ] 21. Implement notification on review completion
  - Create `TestReviewedNotification` class
  - Implement notification sending in `ReviewService.completeReview()`
  - Include score, pass/fail status, and feedback in notification
  - Support email and in-app notifications
  - _Requirements: 8.6, 12.4_

- [ ]* 21.1 Write property test for review status tracking
  - **Property 12: Review Status Tracking**
  - **Validates: Requirements 8.1, 8.5**

- [ ]* 21.2 Write property test for completion notifications
  - **Property 14: Notification on Completion**
  - **Validates: Requirements 8.6, 12.4**

---

## Phase 8: Score Reporting and Results

- [ ] 22. Implement result retrieval and reporting
  - Create methods in `ScoringService` to retrieve test results
  - Implement `getTestResults()` method for individual test
  - Implement `getEmployeeResults()` method for employee's all test results
  - Implement `getResultsWithBreakdown()` method for detailed question-by-question results
  - Implement filtering by test, date range, department, employee group
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 23. Create ResultsController for results endpoints
  - Create `ResultsController` with results retrieval endpoints
  - Implement `getMyResults()` for employee to view their results
  - Implement `getEmployeeResults()` for admin to view employee results
  - Implement `getTestResults()` for admin to view all results for a test
  - Add authorization checks
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 24. Create Vue components for results display
  - Create `MyResults.vue` component for employee to view their test results
  - Create `ResultsDetail.vue` component showing detailed breakdown
  - Create `QuestionReview.vue` component showing question, employee answer, and correct answer
  - Create `PerformanceMetrics.vue` component showing time taken, attempts, improvement
  - Create `ResultsComparison.vue` component for comparing multiple attempts
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 25. Implement PDF and Excel export for results
  - Create `ResultsExportService` class
  - Implement PDF export using DomPDF
  - Implement Excel export using Laravel Excel
  - Include question-by-question breakdown in exports
  - Support filtering and custom date ranges
  - _Requirements: 9.5_

---

## Phase 9: Analytics and Insights

- [ ] 26. Implement AnalyticsService for metrics calculation
  - Create `AnalyticsService` class
  - Implement `getTestMetrics()` method (average score, pass rate, completion rate)
  - Implement `getQuestionMetrics()` method (difficulty, discrimination index, pass rate per question)
  - Implement `getEmployeePerformance()` method
  - Implement `getSkillGaps()` method to identify low-performing skills
  - Implement `getPerformanceTrends()` method for trend analysis
  - Implement `getDepartmentComparison()` method
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 27. Create AnalyticsController for analytics endpoints
  - Create `AnalyticsController` with analytics endpoints
  - Implement `getDashboard()` to get key metrics
  - Implement `getTestAnalytics()` for specific test analysis
  - Implement `getSkillGaps()` for skill gap analysis
  - Implement `getTrends()` for trend analysis
  - Implement `getDepartmentComparison()` for department comparison
  - Add authorization checks
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 28. Create Vue components for analytics dashboard
  - Create `AnalyticsDashboard.vue` component showing key metrics
  - Create `TestAnalytics.vue` component for test-specific analytics
  - Create `SkillGapAnalysis.vue` component showing low-performing skills
  - Create `PerformanceTrends.vue` component with trend charts
  - Create `DepartmentComparison.vue` component for department metrics
  - Create `QuestionAnalysis.vue` component showing question difficulty and pass rates
  - Implement charts using Chart.js or similar library
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 29. Implement analytics export functionality
  - Create `AnalyticsExportService` class
  - Implement PDF export for analytics reports
  - Implement Excel export for analytics data
  - Support custom date ranges and filters
  - _Requirements: 10.7_

- [ ]* 29.1 Write property test for analytics accuracy
  - **Property 15: Analytics Metric Accuracy**
  - **Validates: Requirements 10.1, 10.2**

---

## Phase 10: Test Configuration and Settings

- [ ] 30. Implement test configuration management
  - Create `TestConfigurationService` class
  - Implement methods to configure randomization options
  - Implement methods to configure passing scores, time limits, attempt limits
  - Implement methods to configure feedback timing (immediate, after deadline, manual)
  - Implement methods to configure display options (show/hide answers, explanations)
  - Implement methods to manage test versions
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.6_

- [ ] 31. Create TestConfigurationController
  - Create `TestConfigurationController` for configuration endpoints
  - Implement endpoints to update test settings
  - Add authorization checks for admin-only access
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.6_

- [ ] 32. Create Vue components for test configuration
  - Create `TestSettings.vue` component for configuring test properties
  - Create `ScoringSettings.vue` component for passing score and scoring rules
  - Create `FeedbackSettings.vue` component for feedback timing and display options
  - Create `RandomizationSettings.vue` component for randomization options
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 33. Implement role-based access control for tests
  - Create `SkillTestPolicy` class with authorization rules (ALREADY EXISTS - verify completeness)
  - Implement authorization for test creation (admin only)
  - Implement authorization for test assignment (admin/manager)
  - Implement authorization for test review (admin/reviewer)
  - Implement authorization for analytics access (admin/manager)
  - _Requirements: 11.5_

---

## Phase 11: Notifications and Reminders

- [ ] 34. Implement notification system for skill testing
  - Create `TestNotificationService` class
  - Implement `notifyTestAssigned()` method
  - Implement `notifyDeadlineApproaching()` method
  - Implement `notifyPendingReview()` method
  - Implement `notifyTestReviewed()` method
  - Implement `notifyTestCycleComplete()` method
  - Support configurable notification preferences
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [ ] 35. Create notification classes
  - Create `TestAssignedNotification` class
  - Create `TestDeadlineReminderNotification` class
  - Create `PendingReviewNotification` class
  - Create `TestReviewedNotification` class
  - Create `TestCycleCompleteNotification` class
  - Implement email and in-app notification channels
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 36. Implement scheduled reminders
  - Create `SendTestDeadlineReminders` command
  - Create `SendPendingReviewReminders` command
  - Add commands to scheduler in `Kernel.php`
  - Implement configurable reminder schedules
  - Implement escalation for overdue reminders
  - _Requirements: 12.2, 12.6_

- [ ] 37. Create notification preference management
  - Create `SkillTestNotificationPreference` model
  - Create `NotificationPreferenceController` for managing preferences
  - Create `NotificationPreferences.vue` component for UI
  - Implement preference checking in notification service
  - _Requirements: 12.7_

---

## Phase 12: Integration and Testing

- [ ] 38. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 39. Create integration tests for complete workflows
  - Test complete test-taking workflow from assignment to scoring
  - Test review workflow for text answers
  - Test notification sending at key points
  - Test analytics calculations with real data
  - Test concurrent test submissions
  - _Requirements: All_

- [ ] 40. Create API documentation
  - Document all API endpoints
  - Include request/response examples
  - Document authorization requirements
  - Document error responses
  - _Requirements: All_

- [ ] 41. Create user documentation
  - Document test creation process for admins
  - Document test assignment process
  - Document test-taking process for employees
  - Document review process for admins
  - Document analytics usage
  - _Requirements: All_

- [ ] 42. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
