-- ============================================================
-- Skill Tests Feature - MySQL Schema
-- Generated from Laravel migrations
-- Run in order (respects foreign key dependencies)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. skill_tests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `skill_tests` (
  `id`                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`                 VARCHAR(255)    NOT NULL,
  `description`          TEXT            NULL,
  `category`             VARCHAR(255)    NULL,
  `difficulty_level`     ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
  `passing_score`        INT             NOT NULL DEFAULT 70,
  `time_limit`           INT             NULL COMMENT 'in minutes',
  `max_attempts`         INT             NOT NULL DEFAULT 1,
  `randomize_questions`  TINYINT(1)      NOT NULL DEFAULT 0,
  `randomize_answers`    TINYINT(1)      NOT NULL DEFAULT 0,
  `show_correct_answers` TINYINT(1)      NOT NULL DEFAULT 1,
  `show_explanations`    TINYINT(1)      NOT NULL DEFAULT 1,
  `feedback_timing`      ENUM('immediate','after_deadline','manual') NOT NULL DEFAULT 'immediate',
  `status`               ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  `created_by`           BIGINT UNSIGNED NOT NULL,
  `created_at`           TIMESTAMP       NULL,
  `updated_at`           TIMESTAMP       NULL,
  `deleted_at`           TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `skill_tests_name_unique` (`name`),
  KEY `skill_tests_status_index` (`status`),
  KEY `skill_tests_created_by_index` (`created_by`),
  KEY `skill_tests_created_at_index` (`created_at`),
  CONSTRAINT `skill_tests_created_by_foreign`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. questions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `questions` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `skill_test_id` BIGINT UNSIGNED NOT NULL,
  `type`          ENUM('mcq','text','single_answer') NOT NULL,
  `question_text` TEXT            NOT NULL,
  `order`         INT             NOT NULL DEFAULT 0,
  `points`        DECIMAL(8,2)    NOT NULL DEFAULT 1.00,
  `created_at`    TIMESTAMP       NULL,
  `updated_at`    TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  KEY `questions_skill_test_id_index` (`skill_test_id`),
  KEY `questions_type_index` (`type`),
  KEY `questions_skill_test_id_order_index` (`skill_test_id`, `order`),
  CONSTRAINT `questions_skill_test_id_foreign`
    FOREIGN KEY (`skill_test_id`) REFERENCES `skill_tests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. question_options
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `question_options` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question_id` BIGINT UNSIGNED NOT NULL,
  `option_text` TEXT            NOT NULL,
  `explanation` TEXT            NULL,
  `is_correct`  TINYINT(1)      NOT NULL DEFAULT 0,
  `order`       INT             NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP       NULL,
  `updated_at`  TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  KEY `question_options_question_id_index` (`question_id`),
  KEY `question_options_question_id_order_index` (`question_id`, `order`),
  CONSTRAINT `question_options_question_id_foreign`
    FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. text_question_configs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `text_question_configs` (
  `id`                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question_id`                 BIGINT UNSIGNED NOT NULL,
  `min_characters`              INT             NULL,
  `max_characters`              INT             NULL,
  `expected_answer_guidelines`  TEXT            NULL,
  `created_at`                  TIMESTAMP       NULL,
  `updated_at`                  TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `text_question_configs_question_id_unique` (`question_id`),
  CONSTRAINT `text_question_configs_question_id_foreign`
    FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. test_assignments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `test_assignments` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `skill_test_id`   BIGINT UNSIGNED NOT NULL,
  `employee_id`     BIGINT UNSIGNED NOT NULL,
  `assigned_by`     BIGINT UNSIGNED NOT NULL,
  `available_from`  TIMESTAMP       NULL,
  `available_until` TIMESTAMP       NULL,
  `max_attempts`    INT             NOT NULL DEFAULT 1,
  `status`          ENUM('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
  `created_at`      TIMESTAMP       NULL,
  `updated_at`      TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  KEY `test_assignments_skill_test_id_index` (`skill_test_id`),
  KEY `test_assignments_employee_id_index` (`employee_id`),
  KEY `test_assignments_assigned_by_index` (`assigned_by`),
  KEY `test_assignments_status_index` (`status`),
  KEY `test_assignments_skill_test_id_employee_id_index` (`skill_test_id`, `employee_id`),
  KEY `test_assignments_employee_id_status_index` (`employee_id`, `status`),
  CONSTRAINT `test_assignments_skill_test_id_foreign`
    FOREIGN KEY (`skill_test_id`) REFERENCES `skill_tests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_assignments_employee_id_foreign`
    FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_assignments_assigned_by_foreign`
    FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. test_sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `test_sessions` (
  `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `test_assignment_id` BIGINT UNSIGNED NOT NULL,
  `started_at`         TIMESTAMP       NOT NULL,
  `submitted_at`       TIMESTAMP       NULL,
  `time_spent`         INT             NULL COMMENT 'in seconds',
  `status`             ENUM('in_progress','submitted','expired') NOT NULL DEFAULT 'in_progress',
  `created_at`         TIMESTAMP       NULL,
  `updated_at`         TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  KEY `test_sessions_test_assignment_id_index` (`test_assignment_id`),
  KEY `test_sessions_status_index` (`status`),
  KEY `test_sessions_started_at_index` (`started_at`),
  CONSTRAINT `test_sessions_test_assignment_id_foreign`
    FOREIGN KEY (`test_assignment_id`) REFERENCES `test_assignments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. test_responses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `test_responses` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `test_session_id`  BIGINT UNSIGNED NOT NULL,
  `employee_id`      BIGINT UNSIGNED NOT NULL,
  `skill_test_id`    BIGINT UNSIGNED NOT NULL,
  `total_score`      DECIMAL(8,2)    NULL,
  `percentage_score` DECIMAL(5,2)    NULL,
  `passed`           TINYINT(1)      NULL,
  `review_status`    ENUM('auto_scored','pending_review','reviewed') NOT NULL DEFAULT 'auto_scored',
  `submitted_at`     TIMESTAMP       NOT NULL,
  `created_at`       TIMESTAMP       NULL,
  `updated_at`       TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  KEY `test_responses_test_session_id_index` (`test_session_id`),
  KEY `test_responses_employee_id_index` (`employee_id`),
  KEY `test_responses_skill_test_id_index` (`skill_test_id`),
  KEY `test_responses_review_status_index` (`review_status`),
  KEY `test_responses_employee_id_skill_test_id_index` (`employee_id`, `skill_test_id`),
  KEY `test_responses_submitted_at_index` (`submitted_at`),
  CONSTRAINT `test_responses_test_session_id_foreign`
    FOREIGN KEY (`test_session_id`) REFERENCES `test_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_responses_employee_id_foreign`
    FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_responses_skill_test_id_foreign`
    FOREIGN KEY (`skill_test_id`) REFERENCES `skill_tests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. answers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `answers` (
  `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `test_response_id`   BIGINT UNSIGNED NOT NULL,
  `question_id`        BIGINT UNSIGNED NOT NULL,
  `answer_text`        TEXT            NULL,
  `selected_option_id` BIGINT UNSIGNED NULL,
  `is_correct`         TINYINT(1)      NULL,
  `score`              DECIMAL(8,2)    NULL,
  `created_at`         TIMESTAMP       NULL,
  `updated_at`         TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  KEY `answers_test_response_id_index` (`test_response_id`),
  KEY `answers_question_id_index` (`question_id`),
  KEY `answers_selected_option_id_index` (`selected_option_id`),
  KEY `answers_test_response_id_question_id_index` (`test_response_id`, `question_id`),
  CONSTRAINT `answers_test_response_id_foreign`
    FOREIGN KEY (`test_response_id`) REFERENCES `test_responses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `answers_question_id_foreign`
    FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `answers_selected_option_id_foreign`
    FOREIGN KEY (`selected_option_id`) REFERENCES `question_options` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. text_answer_reviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `text_answer_reviews` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `answer_id`   BIGINT UNSIGNED NOT NULL,
  `reviewed_by` BIGINT UNSIGNED NOT NULL,
  `score`       DECIMAL(8,2)    NOT NULL,
  `comment`     TEXT            NULL,
  `reviewed_at` TIMESTAMP       NOT NULL,
  `created_at`  TIMESTAMP       NULL,
  `updated_at`  TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `text_answer_reviews_answer_id_unique` (`answer_id`),
  KEY `text_answer_reviews_reviewed_by_index` (`reviewed_by`),
  KEY `text_answer_reviews_reviewed_at_index` (`reviewed_at`),
  CONSTRAINT `text_answer_reviews_answer_id_foreign`
    FOREIGN KEY (`answer_id`) REFERENCES `answers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `text_answer_reviews_reviewed_by_foreign`
    FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
