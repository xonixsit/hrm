-- Drop all skill tests tables in reverse order (respects foreign keys)
-- Run this BEFORE running skill_tests_schema.sql if tables already exist

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `text_answer_reviews`;
DROP TABLE IF EXISTS `answers`;
DROP TABLE IF EXISTS `test_responses`;
DROP TABLE IF EXISTS `test_sessions`;
DROP TABLE IF EXISTS `test_assignments`;
DROP TABLE IF EXISTS `text_question_configs`;
DROP TABLE IF EXISTS `question_options`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `skill_tests`;

SET FOREIGN_KEY_CHECKS = 1;

-- Now you can run skill_tests_schema.sql
