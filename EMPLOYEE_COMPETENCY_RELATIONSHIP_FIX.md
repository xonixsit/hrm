# Employee Competency Assessment Relationship Fix

## Issue
**Error**: `Call to undefined relationship [competencyAssessments] on model [App\Models\Employee]`

**Location**: When accessing `http://localhost:8000/competency-assessments` and clicking on submitted assessments

## Root Cause
The `Employee` model was missing the `competencyAssessments` relationship method, which is required for:
1. Eager loading competency assessments with employees
2. Accessing employee assessment data in controllers
3. Department ranking calculations
4. Assessment analytics and reporting

## Solution Applied

### 1. Added Missing Relationship ✅
**File**: `app/Models/Employee.php`

Added the missing `competencyAssessments()` relationship method:

```php
public function competencyAssessments()
{
    return $this->hasMany(CompetencyAssessment::class);
}
```

### 2. Verified Inverse Relationship ✅
**File**: `app/Models/CompetencyAssessment.php`

Confirmed the inverse relationship exists:
```php
public function employee(): BelongsTo
{
    return $this->belongsTo(Employee::class);
}
```

## Impact Areas Fixed

### 1. **Controller Usage**
- `CompetencyAssessmentController::employeeAssessments()` method
- Department ranking calculations
- Employee assessment statistics

### 2. **Eager Loading**
```php
Employee::where('department_id', $employee->department_id)
    ->with(['competencyAssessments' => function ($query) {
        $query->whereNotNull('rating');
    }])
```

### 3. **Assessment Pages**
- Employee assessment listings
- Assessment analytics
- Department comparisons
- Performance metrics

## Files Modified
- `app/Models/Employee.php` - Added `competencyAssessments()` relationship

## Testing
- ✅ No syntax errors in Employee model
- ✅ Relationship properly defined
- ✅ Inverse relationship exists in CompetencyAssessment model

## Result
The error should now be resolved and users can:
- Access competency assessment pages without errors
- View submitted assessments
- See employee assessment data
- Use assessment analytics features