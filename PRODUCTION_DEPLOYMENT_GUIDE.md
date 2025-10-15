# 🚀 Production Deployment Guide - Xonixs HR System

## 📋 **Pre-Deployment Checklist**

### ✅ **Before You Start**
- [ ] **Create Full Database Backup**
- [ ] **Test on Staging Environment**
- [ ] **Verify Application is Running**
- [ ] **Check Disk Space (ensure sufficient space)**
- [ ] **Schedule Maintenance Window (optional)**

## 🔧 **Deployment Steps**

### **Step 1: Database Backup**
```sql
-- Create backup (adjust path as needed)
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql

-- Or using phpMyAdmin: Export → Custom → Structure and Data
```

### **Step 2: Execute Migration Queries**

#### **Option A: Simple Migration (Recommended)**
```sql
-- Execute the SIMPLE_PRODUCTION_MIGRATION.sql file
-- This contains all necessary changes in one script
source SIMPLE_PRODUCTION_MIGRATION.sql;
```

#### **Option B: Step-by-Step Migration**
```sql
-- 1. Create email preferences table
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

-- 2. Create jobs table
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

-- 3. Add employee fields (execute one by one if needed)
ALTER TABLE employees ADD COLUMN date_of_birth DATE NULL;
ALTER TABLE employees ADD COLUMN gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL;
ALTER TABLE employees ADD COLUMN nationality VARCHAR(191) NULL;
ALTER TABLE employees ADD COLUMN personal_email VARCHAR(191) NULL;
ALTER TABLE employees ADD COLUMN emergency_contact_name VARCHAR(191) NULL;
ALTER TABLE employees ADD COLUMN emergency_contact_phone VARCHAR(191) NULL;
ALTER TABLE employees ADD COLUMN salary DECIMAL(10,2) NULL;
ALTER TABLE employees ADD COLUMN employment_type ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') DEFAULT 'full_time';
-- ... (continue with other fields as needed)
```

### **Step 3: Verification**
```sql
-- Verify new tables exist
SHOW TABLES LIKE 'email_preferences';
SHOW TABLES LIKE 'jobs';

-- Verify new columns exist
DESCRIBE employees;

-- Check data integrity
SELECT COUNT(*) FROM employees;
SELECT COUNT(*) FROM users;
```

### **Step 4: Application Deployment**
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# 3. Clear caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# 4. Run Laravel migrations (if any)
php artisan migrate --force

# 5. Restart services
sudo systemctl restart nginx
sudo systemctl restart php8.1-fpm  # Adjust PHP version as needed
```

## 🔍 **Post-Deployment Verification**

### **Database Checks**
```sql
-- 1. Verify all new columns exist
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'employees' 
AND COLUMN_NAME IN ('date_of_birth', 'gender', 'salary', 'emergency_contact_name');

-- 2. Check email preferences table
SELECT COUNT(*) FROM email_preferences;

-- 3. Verify existing data is intact
SELECT COUNT(*) FROM employees WHERE user_id IS NOT NULL;
```

### **Application Checks**
- [ ] **Login System** - Verify users can log in
- [ ] **Employee List** - Check employee listing works
- [ ] **Employee Creation** - Test creating new employee
- [ ] **Employee Editing** - Test editing existing employee
- [ ] **Email Preferences** - Access email preferences page
- [ ] **Leave Management** - Verify leave system works
- [ ] **Assessment System** - Check assessments work

### **Email System Checks**
```bash
# Test email notifications
php artisan notifications:test

# Check queue status
php artisan queue:monitor default

# Start queue worker (if not already running)
php artisan queue:work --daemon
```

## 🚨 **Rollback Plan (If Needed)**

### **Database Rollback**
```sql
-- If issues occur, restore from backup
mysql -u username -p database_name < backup_YYYYMMDD_HHMMSS.sql

-- Or drop new columns individually
ALTER TABLE employees DROP COLUMN date_of_birth;
ALTER TABLE employees DROP COLUMN gender;
-- ... (continue for other new columns)

-- Drop new tables
DROP TABLE IF EXISTS email_preferences;
DROP TABLE IF EXISTS jobs;
```

### **Application Rollback**
```bash
# Revert to previous version
git checkout previous_commit_hash

# Rebuild assets
npm run build

# Clear caches
php artisan config:clear
php artisan cache:clear
```

## ⚡ **Performance Considerations**

### **Expected Migration Time**
- **Small Database** (< 1000 employees): 1-2 minutes
- **Medium Database** (1000-10000 employees): 2-5 minutes  
- **Large Database** (> 10000 employees): 5-15 minutes

### **Zero Downtime Deployment**
- ✅ **Safe Operations**: Adding nullable columns
- ✅ **Non-Breaking**: Existing functionality continues
- ✅ **Backward Compatible**: Old code works with new schema

### **Monitoring**
```bash
# Monitor MySQL processes during migration
SHOW PROCESSLIST;

# Check table locks
SHOW OPEN TABLES WHERE In_use > 0;

# Monitor disk space
df -h
```

## 📊 **Success Criteria**

### ✅ **Migration Successful If:**
1. All new tables created successfully
2. All new columns added to employees table
3. Existing data remains intact
4. Application loads without errors
5. Users can log in and access features
6. Employee creation/editing works with new fields
7. Email preferences page accessible
8. No database errors in logs

### ❌ **Rollback If:**
1. Database errors during migration
2. Application fails to load
3. Data corruption detected
4. Critical functionality broken
5. Performance severely degraded

## 📞 **Support Contacts**

- **Database Issues**: DBA Team
- **Application Issues**: Development Team  
- **Infrastructure Issues**: DevOps Team

## 📝 **Documentation Updates**

After successful deployment:
- [ ] Update system documentation
- [ ] Notify users of new features
- [ ] Update user training materials
- [ ] Document any configuration changes

---

## 🎯 **Quick Command Reference**

```bash
# Backup database
mysqldump -u root -p xonixshr > backup_$(date +%Y%m%d_%H%M%S).sql

# Execute migration
mysql -u root -p xonixshr < SIMPLE_PRODUCTION_MIGRATION.sql

# Verify deployment
php artisan notifications:test
php artisan queue:monitor default

# Start queue worker
nohup php artisan queue:work > /dev/null 2>&1 &
```

**Remember**: Always test on staging first! 🧪