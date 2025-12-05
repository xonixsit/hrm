# Design Document: Skill Testing System

## Overview

The Skill Testing System is a comprehensive platform for creating, administering, and evaluating employee skill assessments. The system supports multiple question types (MCQ, text-based, single-answer), automatic scoring for objective questions, manual review workflows for subjective answers, and detailed analytics on employee performance and skill gaps.

The architecture follows a layered approach with clear separation between test management, test-taking, scoring, and analytics components. The system integrates with the existing employee and competency management systems while maintaining data integrity and audit trails.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vue.js)                         │
├─────────────────────────────────────────────────────────────┤
│  Test Creation UI │ Test Taking UI │ Admin Review UI │ Analytics UI
└────────────┬──────────────────────────────────────────────┬─┘
             │                                              │
┌────────────▼──────────────────────────────────────────────▼─┐
│              API Layer (Laravel Controllers)                 │
├─────────────────────────────────────────────────────────────┤
│ SkillTestController │ TestResponseController │ ReviewController
└────────────┬──────────────────────────────────────────────┬─┘
             │                                              │
┌────────────▼──────────────────────────────────────────────▼─┐
│            Service Layer (Business Logic)                    │
├─────────────────────────────────────────────────────────────┤
│ SkillTestService │ ScoringService │ ReviewService │ AnalyticsService
└────────────┬──────────────────────────────────────────────┬─┘
             │                                              │
┌────────────▼──────────────────────────────────────────────▼─┐
│              Data Layer (Eloquent Models)                    │
├─────────────────────────────────────────────────────────────┤
│ SkillTest │ Question │ TestResponse │ Answer │ Review │ Score
└─────────────────────────────────────────────────────────────┘
```

### Component Interactions

1. **Test Creation Flow**: Admin creates test → Questions added → Test published → Available for assignment
2. **Test Assignment Flow**: Admin assigns test → Employees notified → Test appears in employee dashboard
3. **Test Taking Flow**: Employee starts test → Answers questions → Submits → Automatic scoring for objectives
4. **Review Flow**: Admin reviews pending text answers → Grades responses → Calculates final score → Employee notified
5. **Analytics Flow**: System aggregates scores → Calculates metrics → Displays trends and insights

## Components and Interfaces

### 1. Test Management Component

**Responsibilities:**
- Create, edit, delete skill tests
- Manage test questions and configurations
- Publish/archive tests
- Track test versions

**Key Interfaces:**
```php
interface SkillTestRepository {
    create(array $data): SkillTest;
    update(SkillTest $test, array $data): SkillTest;
    publish(SkillTest $test): void;
    archive(SkillTest $test): void;
    getByStatus(string $status): Collection;
}

interface QuestionRepository {
    create(SkillTest $test, array $data): Question;
    update(Question $question, array $data): Question;
    delete(Question $question): void;
    reorder(SkillTest $test, array $questionIds): void;
}
```

### 2. Test Assignment Component

**Responsibilities:**
- Assign tests to employees or groups
- Manage assignment deadlines and attempt limits
- Track assignment status
- Send notifications

**Key Interfaces:**
```php
interface TestAssignmentService {
    assignToEmployees(SkillTest $test, array $employeeIds, array $config): Collection;
    assignToGroup(SkillTest $test, string $groupType, array $groupIds, array $config): Collection;
    updateAssignment(TestAssignment $assignment, array $data): TestAssignment;
    getAssignmentsForEmployee(Employee $employee): Collection;
}
```

### 3. Test Taking Component

**Responsibilities:**
- Display tests to employees
- Manage test sessions and time limits
- Store employee responses
- Handle test submission

**Key Interfaces:**
```php
interface TestSessionService {
    startSession(TestAssignment $assignment): TestSession;
    saveResponse(TestSession $session, Question $question, array $answer): void;
    submitTest(TestSession $session): TestResponse;
    getSessionStatus(TestSession $session): array;
}
```

### 4. Scoring Component

**Responsibilities:**
- Automatically score objective questions
- Calculate total scores
- Determine pass/fail status
- Generate score reports

**Key Interfaces:**
```php
interface ScoringService {
    scoreObjectiveQuestions(TestResponse $response): void;
    calculateTotalScore(TestResponse $response): float;
    determinePassed(TestResponse $response, SkillTest $test): bool;
    generateScoreReport(TestResponse $response): array;
}
```

### 5. Review Component

**Responsibilities:**
- Display pending text answer reviews
- Grade text answers
- Add reviewer comments
- Finalize scores

**Key Interfaces:**
```php
interface ReviewService {
    getPendingReviews(User $reviewer): Collection;
    gradeTextAnswer(Answer $answer, int $score, string $comment): void;
    completeReview(TestResponse $response): void;
    getReviewStatus(TestResponse $response): array;
}
```

### 6. Analytics Component

**Responsibilities:**
- Calculate performance metrics
- Generate analytics dashboards
- Identify skill gaps
- Track trends

**Key Interfaces:**
```php
interface AnalyticsService {
    getTestMetrics(SkillTest $test): array;
    getEmployeePerformance(Employee $employee): array;
    getSkillGaps(array $filters): array;
    getPerformanceTrends(array $filters): array;
}
```

## Data Models

### Core Models

```
SkillTest
├── id: bigint
├── name: string (unique)
├── description: text
├── category: string
├── difficulty_level: enum (easy, medium, hard)
├── passing_score: integer (0-100)
├── time_limit: integer (minutes, nullable)
├── max_attempts: integer
├── randomize_questions: boolean
├── randomize_answers: boolean
├── show_correct_answers: boolean
├── show_explanations: boolean
├── feedback_timing: enum (immediate, after_deadline, manual)
├── status: enum (draft, published, archived)
├── created_by: bigint (foreign key to User)
├── created_at: timestamp
├── updated_at: timestamp
└── deleted_at: timestamp (soft delete)

Question
├── id: bigint
├── skill_test_id: bigint (foreign key)
├── type: enum (mcq, text, single_answer)
├── question_text: text
├── order: integer
├── points: decimal
├── created_at: timestamp
├── updated_at: timestamp

QuestionOption (for MCQ and Single Answer)
├── id: bigint
├── question_id: bigint (foreign key)
├── option_text: text
├── explanation: text (nullable)
├── is_correct: boolean
├── order: integer
├── created_at: timestamp

TextQuestionConfig
├── id: bigint
├── question_id: bigint (foreign key)
├── min_characters: integer (nullable)
├── max_characters: integer (nullable)
├── expected_answer_guidelines: text
├── created_at: timestamp

TestAssignment
├── id: bigint
├── skill_test_id: bigint (foreign key)
├── employee_id: bigint (foreign key)
├── assigned_by: bigint (foreign key to User)
├── available_from: timestamp
├── available_until: timestamp
├── max_attempts: integer
├── status: enum (pending, in_progress, completed)
├── created_at: timestamp
├── updated_at: timestamp

TestSession
├── id: bigint
├── test_assignment_id: bigint (foreign key)
├── started_at: timestamp
├── submitted_at: timestamp (nullable)
├── time_spent: integer (seconds)
├── status: enum (in_progress, submitted, expired)
├── created_at: timestamp

TestResponse
├── id: bigint
├── test_session_id: bigint (foreign key)
├── employee_id: bigint (foreign key)
├── skill_test_id: bigint (foreign key)
├── total_score: decimal (nullable)
├── percentage_score: decimal (nullable)
├── passed: boolean (nullable)
├── review_status: enum (auto_scored, pending_review, reviewed)
├── submitted_at: timestamp
├── created_at: timestamp

Answer
├── id: bigint
├── test_response_id: bigint (foreign key)
├── question_id: bigint (foreign key)
├── answer_text: text (nullable)
├── selected_option_id: bigint (nullable, foreign key)
├── is_correct: boolean (nullable)
├── score: decimal (nullable)
├── created_at: timestamp

TextAnswerReview
├── id: bigint
├── answer_id: bigint (foreign key)
├── reviewed_by: bigint (foreign key to User)
├── score: decimal
├── comment: text (nullable)
├── reviewed_at: timestamp
├── created_at: timestamp
```

### Relationships

```
SkillTest
  ├── hasMany Questions
  ├── hasMany TestAssignments
  ├── hasMany TestResponses
  └── belongsTo User (created_by)

Question
  ├── belongsTo SkillTest
  ├── hasMany QuestionOptions
  ├── hasOne TextQuestionConfig
  └── hasMany Answers

TestAssignment
  ├── belongsTo SkillTest
  ├── belongsTo Employee
  ├── belongsTo User (assigned_by)
  └── hasMany TestSessions

TestSession
  ├── belongsTo TestAssignment
  └── hasOne TestResponse

TestResponse
  ├── belongsTo TestSession
  ├── belongsTo Employee
  ├── belongsTo SkillTest
  └── hasMany Answers

Answer
  ├── belongsTo TestResponse
  ├── belongsTo Question
  ├── belongsTo QuestionOption (nullable)
  └── hasOne TextAnswerReview
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Test Uniqueness
*For any* skill test creation, the system SHALL prevent creating tests with duplicate names within the same organization.
**Validates: Requirements 1.2**

### Property 2: Question Validation
*For any* skill test, the system SHALL prevent publishing tests that contain questions without proper configuration (missing text, insufficient options, or missing correct answers).
**Validates: Requirements 1.5**

### Property 3: MCQ Scoring Accuracy
*For any* multiple-choice question with configured correct answers, when an employee submits responses, the system SHALL automatically score the response correctly according to the configured scoring rules.
**Validates: Requirements 2.6, 7.1, 7.2**

### Property 4: Single Answer Scoring
*For any* single-answer question, when an employee selects an option, the system SHALL mark it as correct if and only if it matches the configured correct answer.
**Validates: Requirements 4.4**

### Property 5: Text Answer Pending Review
*For any* test response containing text-based questions, the system SHALL mark the response as "Pending Review" until all text answers are graded by an administrator.
**Validates: Requirements 7.5**

### Property 6: Score Calculation Accuracy
*For any* completed test response with all questions scored, the system SHALL calculate the total percentage score as (total points earned / total possible points) × 100.
**Validates: Requirements 7.3**

### Property 7: Pass/Fail Determination
*For any* test response with a calculated percentage score, the system SHALL determine pass/fail status by comparing the score against the test's configured passing threshold.
**Validates: Requirements 7.6**

### Property 8: Time Limit Enforcement
*For any* test session with a configured time limit, the system SHALL prevent access and auto-submit the test when the time limit expires.
**Validates: Requirements 5.5, 6.6**

### Property 9: Deadline Enforcement
*For any* test assignment with a deadline, the system SHALL prevent new test attempts after the deadline has passed.
**Validates: Requirements 5.7**

### Property 10: Answer Persistence
*For any* answer submitted during a test session, the system SHALL store the response persistently and make it available for review and scoring.
**Validates: Requirements 6.3**

### Property 11: Test Archiving Preservation
*For any* archived skill test, the system SHALL preserve all historical test data (assignments, responses, scores) while preventing new assignments to the archived test.
**Validates: Requirements 1.7, 11.7**

### Property 12: Review Status Tracking
*For any* test response, the system SHALL accurately track review status (auto_scored, pending_review, reviewed) and update it appropriately as reviews are completed.
**Validates: Requirements 8.1, 8.5**

### Property 13: Notification on Assignment
*For any* test assignment created, the system SHALL send a notification to the assigned employee containing test details and deadline.
**Validates: Requirements 5.3, 12.1**

### Property 14: Notification on Completion
*For any* test response marked as reviewed, the system SHALL send a notification to the employee containing their score and pass/fail status.
**Validates: Requirements 8.6, 12.4**

### Property 15: Analytics Metric Accuracy
*For any* set of test responses, the system SHALL calculate analytics metrics (average score, pass rate, completion rate) correctly based on the underlying data.
**Validates: Requirements 10.1, 10.2**

## Error Handling

### Validation Errors
- Test name uniqueness validation
- Question configuration validation (missing text, insufficient options)
- Answer option validation (at least 2 for MCQ, exactly 1 correct for single answer)
- Score threshold validation (0-100%)
- Character limit validation for text answers

### Business Logic Errors
- Attempting to publish incomplete tests
- Attempting to assign archived tests
- Attempting to take tests after deadline
- Attempting to exceed maximum attempts
- Attempting to modify submitted tests

### Data Integrity Errors
- Orphaned questions (question without test)
- Orphaned answers (answer without response)
- Inconsistent scoring (score exceeds max points)
- Missing required relationships

### User Permission Errors
- Non-admin attempting to create tests
- Non-admin attempting to review answers
- Employee attempting to access unassigned tests
- Employee attempting to access other employee's responses

## Testing Strategy

### Unit Testing Approach
- Test individual scoring algorithms with various question types
- Test validation logic for test creation and question configuration
- Test time limit and deadline enforcement logic
- Test score calculation formulas
- Test notification triggering conditions

### Property-Based Testing Approach
The system will use **PHPUnit with custom property-based testing utilities** to verify correctness properties. Each property will be implemented as a single comprehensive test that:

1. Generates random but valid test data (tests, questions, assignments, responses)
2. Executes the system operation being tested
3. Verifies the property holds true for the generated data
4. Runs minimum 100 iterations to ensure robustness

**Property-Based Test Configuration:**
- Minimum iterations: 100
- Each test tagged with format: `**Feature: skill-testing, Property {number}: {property_text}**`
- Each test references the corresponding requirement: `**Validates: Requirements X.Y**`
- Tests focus on core logic without mocking external dependencies

**Example Property Test Structure:**
```php
/**
 * Feature: skill-testing, Property 3: MCQ Scoring Accuracy
 * Validates: Requirements 2.6, 7.1, 7.2
 */
public function test_mcq_scoring_accuracy()
{
    // Generate random MCQ with correct answers
    // Generate random employee responses
    // Score the responses
    // Verify scoring matches expected results
    // Repeat 100+ times with different data
}
```

### Integration Testing Approach
- Test complete test-taking workflow from assignment to scoring
- Test review workflow for text answers
- Test notification sending at key points
- Test analytics calculations with real data
- Test concurrent test submissions

### Test Coverage Goals
- Core scoring logic: 100% coverage
- Validation logic: 100% coverage
- Business rules: 100% coverage
- API endpoints: 80%+ coverage
- UI components: 60%+ coverage

## Implementation Considerations

### Performance Considerations
- Index test_id, employee_id, status on TestResponse for fast queries
- Cache analytics calculations with invalidation on new responses
- Batch process notifications for large assignments
- Optimize question randomization to avoid repeated queries

### Security Considerations
- Validate all user inputs before processing
- Enforce role-based access control on all endpoints
- Prevent timing attacks on test submissions
- Audit all review actions with user tracking
- Encrypt sensitive test data if needed

### Scalability Considerations
- Design for concurrent test submissions
- Use database transactions for atomic operations
- Implement pagination for large result sets
- Consider queue jobs for heavy analytics calculations

### Data Integrity Considerations
- Use soft deletes for tests and questions to preserve history
- Maintain audit trails for all reviews and score changes
- Implement referential integrity constraints
- Validate data consistency on migrations
