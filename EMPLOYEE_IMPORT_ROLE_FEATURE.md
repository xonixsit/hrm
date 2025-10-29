# Employee Import Role Feature Implementation

## Overview
Added Role column support to the employee import feature in the Xonobics HRM system. This enhancement allows administrators to assign user roles during the bulk employee import process.

## Implementation Details

### Frontend Changes (Import.vue)
- Added 'Role' field to the `requiredFields` configuration
- Updated column mapping to include role selection
- Enhanced auto-mapping logic to detect role-related columns
- Added role validation in the import options

### Backend Changes (EmployeeImportController.php)
- Updated validation rules to include role field
- Added role assignment logic in `createUser()` method
- Implemented role updating in `updateEmployee()` method
- Added role fallback to 'Employee' if invalid role provided
- Enhanced template generation to include Role column

### Supported Roles
- Admin
- HR
- Manager
- Employee (default fallback)

### Features
- **Role Assignment**: Automatically assigns roles during import based on Role column
- **Role Validation**: Validates role names against existing system roles
- **Role Updates**: Updates existing employee roles when using update mode
- **Template Support**: Role column included in both Excel and CSV templates
- **Auto-mapping**: Automatically detects role columns with variations like 'User Role', 'System Role', 'Access Role'

### Usage
1. Include a 'Role' column in your import file
2. Use valid role names: Admin, HR, Manager, or Employee
3. Map the Role column during import configuration
4. Invalid or empty roles default to 'Employee'

## Technical Implementation

The role assignment uses Spatie Laravel Permission package:
- Roles are assigned using `$user->assignRole($role)`
- Role updates use `$user->syncRoles([$role])` to replace existing roles
- Role validation checks against existing roles in the system
- Fallback mechanism ensures all users have at least the 'Employee' role the admin screen. The system now allows importing employee data with role assignments from Excel/CSV files.

## Changes Made

### Backend Changes (EmployeeImportController.php)

1. **Added Role to Template Headers**
   - Updated template generation to include "Role" column
   - Added sample data with role examples (Employee, Manager, HR)

2. **Enhanced Validation**
   - Added role validation: `'role' => 'nullable|string|in:Admin,HR,Manager,Employee'`
   - Validates against existing system roles

3. **Role Assignment Logic**
   - In `createUser()`: Assigns role to new users during import
   - In `updateEmployee()`: Updates existing user roles when updating
   - Defaults to 'Employee' role if invalid or missing role provided
   - Uses `syncRoles()` for updates to replace existing roles

4. **Template Updates**
   - Excel template now includes Role column (column I)
   - CSV template includes Role header
   - Sample data shows proper role usage

### Frontend Changes (Import.vue)

1. **Added Role Field Mapping**
   - Added role field to `requiredFields` configuration
   - Role is optional (not required for import)

2. **Enhanced Column Auto-Mapping**
   - Added role column detection patterns: `['role', 'user role', 'system role', 'access role', 'permission role']`
   - Updated fallback column names to include role variations

3. **Updated Column Detection**
   - Removed 'Role' from job_title mapping to avoid conflicts
   - Added dedicated role column options in fallback list

## Available Roles
The system supports these roles (defined in RoleSeeder):
- **Admin**: Full system access
- **HR**: Human resources management
- **Manager**: Team management capabilities  
- **Employee**: Standard employee access (default)

## Import Behavior

### New Employee Import
- Creates user account with specified role
- If role is invalid/missing, defaults to 'Employee'
- Assigns role using Spatie Permission package

### Existing Employee Update
- Updates user's role if role column is provided
- Uses `syncRoles()` to replace existing roles
- Maintains existing role if role column is empty

### Template Files
- **Excel Template**: 9 columns (A-I) including Role
- **CSV Template**: Includes Role header with sample data
- **Sample Data**: Shows proper role usage examples

## Usage Instructions

1. **Download Template**
   - Use "Download Excel Template" or "Download CSV Template" buttons
   - Template now includes Role column with examples

2. **Prepare Data**
   - Fill Role column with: Admin, HR, Manager, or Employee
   - Leave empty for default Employee role
   - Invalid roles will default to Employee

3. **Import Process**
   - Upload file through import interface
   - Map Role column during column mapping step
   - Role assignment happens automatically during import

## Error Handling
- Invalid roles are logged but don't stop import
- Missing roles default to 'Employee'
- Role validation errors are included in import results
- Existing role assignments are preserved if role column is empty during updates

## Files Modified
- `app/Http/Controllers/EmployeeImportController.php`
- `resources/js/Pages/Employees/Import.vue`

## Testing
The implementation maintains backward compatibility:
- Imports without Role column work as before (default to Employee)
- Existing import functionality remains unchanged
- Role assignment integrates seamlessly with existing user creation flow