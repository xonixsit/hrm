-- =====================================================
-- PRODUCTION MIGRATION QUERIES
-- Safe deployment for Xonixs HR System enhancements
-- =====================================================

-- These queries are designed to be safe for production:
-- 1. All columns are added as NULLABLE to avoid breaking existing data
-- 2. Default values are provided where appropriate
-- 3. Queries check for existing columns before adding
-- 4. No data loss or disruption to existing functionality

-- =====================================================
-- 1. EMAIL PREFERENCES TABLE
-- =====================================================

-- Create email_preferences table if it doesn't exist
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
    KEY `email_preferences_user_id_foreign` (`user_id`),
    CONSTRAINT `email_preferences_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. JOBS TABLE (for queue processing)
-- =====================================================

-- Create jobs table if it doesn't exist
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create job_batches table if it doesn't exist
CREATE TABLE IF NOT EXISTS `job_batches` (
    `id` varchar(191) NOT NULL,
    `name` varchar(191) NOT NULL,
    `total_jobs` int(11) NOT NULL,
    `pending_jobs` int(11) NOT NULL,
    `failed_jobs` int(11) NOT NULL,
    `failed_job_ids` longtext NOT NULL,
    `options` mediumtext DEFAULT NULL,
    `cancelled_at` int(10) unsigned DEFAULT NULL,
    `created_at` int(10) unsigned NOT NULL,
    `finished_at` int(10) unsigned DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create failed_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS `failed_jobs` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(191) NOT NULL,
    `connection` text NOT NULL,
    `queue` text NOT NULL,
    `payload` longtext NOT NULL,
    `exception` longtext NOT NULL,
    `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. EMPLOYEE TABLE ENHANCEMENTS
-- =====================================================

-- Add new columns to employees table (safe for production)
-- Each column is added individually with IF NOT EXISTS check

-- Personal Information Fields
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'date_of_birth') = 0,
    'ALTER TABLE employees ADD COLUMN date_of_birth DATE NULL AFTER phone',
    'SELECT "Column date_of_birth already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'gender') = 0,
    'ALTER TABLE employees ADD COLUMN gender ENUM(''male'', ''female'', ''other'', ''prefer_not_to_say'') NULL AFTER date_of_birth',
    'SELECT "Column gender already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'marital_status') = 0,
    'ALTER TABLE employees ADD COLUMN marital_status ENUM(''single'', ''married'', ''divorced'', ''widowed'', ''separated'') NULL AFTER gender',
    'SELECT "Column marital_status already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'nationality') = 0,
    'ALTER TABLE employees ADD COLUMN nationality VARCHAR(191) NULL AFTER marital_status',
    'SELECT "Column nationality already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'national_id') = 0,
    'ALTER TABLE employees ADD COLUMN national_id VARCHAR(191) NULL AFTER nationality',
    'SELECT "Column national_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'passport_number') = 0,
    'ALTER TABLE employees ADD COLUMN passport_number VARCHAR(191) NULL AFTER national_id',
    'SELECT "Column passport_number already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Contact Information Fields
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'personal_email') = 0,
    'ALTER TABLE employees ADD COLUMN personal_email VARCHAR(191) NULL AFTER passport_number',
    'SELECT "Column personal_email already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'alternate_phone') = 0,
    'ALTER TABLE employees ADD COLUMN alternate_phone VARCHAR(191) NULL AFTER personal_email',
    'SELECT "Column alternate_phone already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'permanent_address') = 0,
    'ALTER TABLE employees ADD COLUMN permanent_address TEXT NULL AFTER alternate_phone',
    'SELECT "Column permanent_address already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'current_address') = 0,
    'ALTER TABLE employees ADD COLUMN current_address TEXT NULL AFTER permanent_address',
    'SELECT "Column current_address already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Emergency Contact Fields
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'emergency_contact_name') = 0,
    'ALTER TABLE employees ADD COLUMN emergency_contact_name VARCHAR(191) NULL AFTER current_address',
    'SELECT "Column emergency_contact_name already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'emergency_contact_relationship') = 0,
    'ALTER TABLE employees ADD COLUMN emergency_contact_relationship VARCHAR(191) NULL AFTER emergency_contact_name',
    'SELECT "Column emergency_contact_relationship already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'emergency_contact_phone') = 0,
    'ALTER TABLE employees ADD COLUMN emergency_contact_phone VARCHAR(191) NULL AFTER emergency_contact_relationship',
    'SELECT "Column emergency_contact_phone already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'emergency_contact_email') = 0,
    'ALTER TABLE employees ADD COLUMN emergency_contact_email VARCHAR(191) NULL AFTER emergency_contact_phone',
    'SELECT "Column emergency_contact_email already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Employment Details Fields
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'salary') = 0,
    'ALTER TABLE employees ADD COLUMN salary DECIMAL(10,2) NULL AFTER emergency_contact_email',
    'SELECT "Column salary already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'salary_currency') = 0,
    'ALTER TABLE employees ADD COLUMN salary_currency VARCHAR(3) DEFAULT ''USD'' AFTER salary',
    'SELECT "Column salary_currency already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'employment_type') = 0,
    'ALTER TABLE employees ADD COLUMN employment_type ENUM(''full_time'', ''part_time'', ''contract'', ''intern'', ''consultant'') DEFAULT ''full_time'' AFTER salary_currency',
    'SELECT "Column employment_type already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'work_location') = 0,
    'ALTER TABLE employees ADD COLUMN work_location VARCHAR(191) NULL AFTER employment_type',
    'SELECT "Column work_location already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'work_start_time') = 0,
    'ALTER TABLE employees ADD COLUMN work_start_time TIME NULL AFTER work_location',
    'SELECT "Column work_start_time already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'work_end_time') = 0,
    'ALTER TABLE employees ADD COLUMN work_end_time TIME NULL AFTER work_start_time',
    'SELECT "Column work_end_time already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Banking Information Fields
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'bank_name') = 0,
    'ALTER TABLE employees ADD COLUMN bank_name VARCHAR(191) NULL AFTER work_end_time',
    'SELECT "Column bank_name already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'bank_account_number') = 0,
    'ALTER TABLE employees ADD COLUMN bank_account_number VARCHAR(191) NULL AFTER bank_name',
    'SELECT "Column bank_account_number already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'bank_routing_number') = 0,
    'ALTER TABLE employees ADD COLUMN bank_routing_number VARCHAR(191) NULL AFTER bank_account_number',
    'SELECT "Column bank_routing_number already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Additional Information Fields
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'skills') = 0,
    'ALTER TABLE employees ADD COLUMN skills TEXT NULL AFTER bank_routing_number',
    'SELECT "Column skills already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'certifications') = 0,
    'ALTER TABLE employees ADD COLUMN certifications TEXT NULL AFTER skills',
    'SELECT "Column certifications already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'education') = 0,
    'ALTER TABLE employees ADD COLUMN education TEXT NULL AFTER certifications',
    'SELECT "Column education already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND column_name = 'notes') = 0,
    'ALTER TABLE employees ADD COLUMN notes TEXT NULL AFTER education',
    'SELECT "Column notes already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE (Optional but recommended)
-- =====================================================

-- Add indexes for better query performance
-- These are safe to add and will improve system performance

-- Index on employee gender for reporting
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND index_name = 'idx_employees_gender') = 0,
    'ALTER TABLE employees ADD INDEX idx_employees_gender (gender)',
    'SELECT "Index idx_employees_gender already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index on employment type for filtering
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND index_name = 'idx_employees_employment_type') = 0,
    'ALTER TABLE employees ADD INDEX idx_employees_employment_type (employment_type)',
    'SELECT "Index idx_employees_employment_type already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index on date of birth for age calculations
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE table_name = 'employees' 
     AND table_schema = DATABASE() 
     AND index_name = 'idx_employees_date_of_birth') = 0,
    'ALTER TABLE employees ADD INDEX idx_employees_date_of_birth (date_of_birth)',
    'SELECT "Index idx_employees_date_of_birth already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 5. DATA MIGRATION AND CLEANUP (Optional)
-- =====================================================

-- Set default employment_type for existing employees
UPDATE employees 
SET employment_type = 'full_time' 
WHERE employment_type IS NULL;

-- Set default salary_currency for existing employees with salary
UPDATE employees 
SET salary_currency = 'USD' 
WHERE salary IS NOT NULL AND salary_currency IS NULL;

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Run these queries to verify the migration was successful:

-- Check if all new columns exist
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'employees' 
AND TABLE_SCHEMA = DATABASE()
AND COLUMN_NAME IN (
    'date_of_birth', 'gender', 'nationality', 'personal_email',
    'emergency_contact_name', 'salary', 'employment_type', 'skills'
)
ORDER BY ORDINAL_POSITION;

-- Check email_preferences table
SELECT COUNT(*) as email_preferences_table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'email_preferences' 
AND TABLE_SCHEMA = DATABASE();

-- Check jobs table
SELECT COUNT(*) as jobs_table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'jobs' 
AND TABLE_SCHEMA = DATABASE();

-- =====================================================
-- DEPLOYMENT NOTES:
-- =====================================================

/*
DEPLOYMENT INSTRUCTIONS:

1. BACKUP FIRST:
   - Create a full database backup before running these queries
   - Test on a staging environment first

2. EXECUTION ORDER:
   - Run queries in the order provided
   - Each section can be run independently
   - Safe to run multiple times (idempotent)

3. ROLLBACK PLAN:
   - Keep the backup ready
   - New columns can be dropped if needed:
     ALTER TABLE employees DROP COLUMN column_name;

4. VERIFICATION:
   - Run the verification queries at the end
   - Check application functionality after migration
   - Monitor for any errors in logs

5. PERFORMANCE:
   - Migration should complete quickly (adds columns only)
   - No data modification except default values
   - Indexes will improve query performance

6. ZERO DOWNTIME:
   - These changes are non-breaking
   - Application will continue to work during migration
   - New features will be available after deployment
*/