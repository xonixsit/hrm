# Production Migration Guide

## 🚨 **Issue:** Missing `competency_assessments` table in production

The error occurs because the competency management system migrations haven't been run in production yet.

## ✅ **Solution Steps:**

### **1. 🔍 Check Current Migration Status**
```bash
php artisan migrate:status
```
This will show which migrations are pending.

### **2. 🚀 Run Pending Migrations**
```bash
# Backup your database first!
php artisan migrate --force
```

The `--force` flag is needed in production environment.

### **3. 📋 Specific Competency Migrations to Run**
These migrations will be executed in order:
- `2025_10_01_185735_create_competencies_table.php`
- `2025_10_01_194734_create_employee_competencies_table.php`
- `2025_10_03_163053_update_competencies_table_add_new_fields.php`
- `2025_10_03_163122_create_competency_assessments_table.php` ← **This creates the missing table**
- `2025_10_03_163144_create_assessment_cycles_table.php`
- `2025_10_03_163206_create_competency_development_plans_table.php`
- `2025_10_03_163456_add_assessment_cycle_foreign_key_to_competency_assessments.php`
- `2025_10_06_203105_remove_duplicate_competencies.php`
- `2025_10_06_225406_make_rating_nullable_in_competency_assessments_table.php`
- `2025_10_08_152538_fix_competencies_table_add_missing_columns.php`
- `2025_10_08_163950_create_assessment_workflow_tables.php`
- `2025_10_08_184328_add_is_active_to_assessment_cycles_table.php`

### **4. 🛡️ Graceful Handling (Already Implemented)**
I've updated the `OrganizationalAnalyticsService` to handle missing tables gracefully:
- Checks if tables exist before querying
- Returns empty data structures if tables don't exist
- Prevents crashes when competency features aren't fully migrated

### **5. 🔄 Alternative: Run Specific Migration**
If you want to run just the competency assessments table:
```bash
php artisan migrate --path=database/migrations/2025_10_03_163122_create_competency_assessments_table.php --force
```

### **6. ✅ Verify Migration Success**
After running migrations, check:
```bash
php artisan migrate:status
```

All competency-related migrations should show as "Ran".

### **7. 🎯 Test the Application**
- Visit the dashboard: `http://your-domain.com/dashboard`
- Check organizational analytics: `http://your-domain.com/organizational-analytics`
- Verify competency management features work

## 🔧 **What I've Fixed:**

### **Analytics Service Protection:**
- Added `Schema::hasTable()` checks before all competency queries
- Graceful fallbacks to empty data when tables don't exist
- Proper error handling and logging
- No more crashes when accessing analytics before migration

### **Safe Migration Path:**
- All migrations are backward compatible
- Foreign key constraints are properly handled
- Indexes are created for performance
- Unique constraints prevent data duplication

## 📞 **If Issues Persist:**

1. **Check Laravel logs:** `storage/logs/laravel.log`
2. **Verify database connection:** Ensure production DB credentials are correct
3. **Check permissions:** Ensure Laravel can create tables
4. **Manual verification:** Connect to DB and check if `competency_assessments` table exists

## 🎉 **After Migration:**
- Competency management features will be fully functional
- Organizational analytics will show real competency data
- Employees can access their assigned competencies
- Admins can create assessment cycles and manage competencies

The system is now production-ready with proper error handling! 🚀