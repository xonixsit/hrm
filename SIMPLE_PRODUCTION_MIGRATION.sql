-- =====================================================
-- SIMPLE PRODUCTION MIGRATION - XONIXS HR SYSTEM
-- Execute these queries in order on production database
-- =====================================================

-- 1. CREATE EMAIL PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS `email_preferences` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `user_id` bigint(20) unsigned NOT NULL,
    `leave_request_submitted` tinyint(1) NOT NULL DEFAULT 1,
    `leave_request_approved` tinyint(1) NOT NULL DEFAULT 1,
    `leave_request_rejected` tinyint(1) NOT NULL DEFAULT 1,
    `assessment_assigned` tinyint(1) NOT NULL DEFAULT 1,
    `assessment_submitted` tinyint(1) NOT NULL DEFAULT 1,
    `assessment_approved` tinyint(1) NOT NULL DEFAULT 1,
    `assessment_rejected` tinyint(1) NOT NULL DEFAULT 1,
    `daily_digest` tinyint(1) NOT NULL DEFAULT 0,
    `weekly_digest` tinyint(1) NOT NULL DEFAULT 1,
    `digest_time` varchar(191) NOT NULL DEFAULT '09:00',
    `digest_day` varchar(191) NOT NULL DEFAULT 'monday',
    `pending_reminders` tinyint(1) NOT NULL DEFAULT 1,
    `reminder_frequency_hours` int(11) NOT NULL DEFAULT 24,
    `system_notifications` tinyint(1) NOT NULL DEFAULT 1,
    `marketing_emails` tinyint(1) NOT NULL DEFAULT 0,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email_preferences_user_id_unique` (`user_id`),
    CONSTRAINT `email_preferences_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- 2. CREATE JOBS TABLE FOR QUEUE PROCESSING
CREATE TABLE IF NOT EXISTS `jobs` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `queue` varchar(191) NOT NULL,
    `payload` longtext NOT NULL,
    `attempts` tinyint(3) unsigned NOT NULL,
    `reserved_at` int(10) unsigned DEFAULT NULL,
    `available_at` int(10) unsigned NOT NULL,
    `created_at` int(10) unsigned NOT NULL,
    PRIMARY KEY (`id`),
    KEY `jobs_queue_index` (`queue`)
);

-- 3. ADD NEW EMPLOYEE FIELDS (Safe - all nullable)
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL AFTER phone,
ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL AFTER date_of_birth,
ADD COLUMN IF NOT EXISTS marital_status ENUM('single', 'married', 'divorced', 'widowed', 'separated') NULL AFTER gender,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(191) NULL AFTER marital_status,
ADD COLUMN IF NOT EXISTS national_id VARCHAR(191) NULL AFTER nationality,
ADD COLUMN IF NOT EXISTS passport_number VARCHAR(191) NULL AFTER national_id,
ADD COLUMN IF NOT EXISTS personal_email VARCHAR(191) NULL AFTER passport_number,
ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(191) NULL AFTER personal_email,
ADD COLUMN IF NOT EXISTS permanent_address TEXT NULL AFTER alternate_phone,
ADD COLUMN IF NOT EXISTS current_address TEXT NULL AFTER permanent_address,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(191) NULL AFTER current_address,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(191) NULL AFTER emergency_contact_name,
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(191) NULL AFTER emergency_contact_relationship,
ADD COLUMN IF NOT EXISTS emergency_contact_email VARCHAR(191) NULL AFTER emergency_contact_phone,
ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2) NULL AFTER emergency_contact_email,
ADD COLUMN IF NOT EXISTS salary_currency VARCHAR(3) DEFAULT 'USD' AFTER salary,
ADD COLUMN IF NOT EXISTS employment_type ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') DEFAULT 'full_time' AFTER salary_currency,
ADD COLUMN IF NOT EXISTS work_location VARCHAR(191) NULL AFTER employment_type,
ADD COLUMN IF NOT EXISTS work_start_time TIME NULL AFTER work_location,
ADD COLUMN IF NOT EXISTS work_end_time TIME NULL AFTER work_start_time,
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(191) NULL AFTER work_end_time,
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(191) NULL AFTER bank_name,
ADD COLUMN IF NOT EXISTS bank_routing_number VARCHAR(191) NULL AFTER bank_account_number,
ADD COLUMN IF NOT EXISTS skills TEXT NULL AFTER bank_routing_number,
ADD COLUMN IF NOT EXISTS certifications TEXT NULL AFTER skills,
ADD COLUMN IF NOT EXISTS education TEXT NULL AFTER certifications,
ADD COLUMN IF NOT EXISTS notes TEXT NULL AFTER education;

-- 4. SET DEFAULT VALUES FOR EXISTING RECORDS
UPDATE employees SET employment_type = 'full_time' WHERE employment_type IS NULL;
UPDATE employees SET salary_currency = 'USD' WHERE salary IS NOT NULL AND salary_currency IS NULL;

-- 5. ADD PERFORMANCE INDEXES (Optional but recommended)
ALTER TABLE employees ADD INDEX IF NOT EXISTS idx_employees_gender (gender);
ALTER TABLE employees ADD INDEX IF NOT EXISTS idx_employees_employment_type (employment_type);
ALTER TABLE employees ADD INDEX IF NOT EXISTS idx_employees_date_of_birth (date_of_birth);

-- =====================================================
-- VERIFICATION QUERIES (Run after migration)
-- =====================================================

-- Check new columns exist
SHOW COLUMNS FROM employees LIKE '%date_of_birth%';
SHOW COLUMNS FROM employees LIKE '%gender%';
SHOW COLUMNS FROM employees LIKE '%salary%';
SHOW COLUMNS FROM employees LIKE '%emergency_contact%';

-- Check tables exist
SHOW TABLES LIKE 'email_preferences';
SHOW TABLES LIKE 'jobs';

-- Count records (should match existing employee count)
SELECT COUNT(*) as total_employees FROM employees;
SELECT COUNT(*) as employees_with_employment_type FROM employees WHERE employment_type IS NOT NULL;