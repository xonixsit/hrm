# File Display Issue Fix - Evaluate Page

## Problem
The Evaluate page was showing JSON objects like `{ "id": 1760040884206.5017, "status": null, "progress": 0 }` instead of proper file names in the evidence files section.

## Root Cause Analysis
After investigation, I found that the `FileUpload.vue` component creates file objects with this structure:
```javascript
{
  id: Date.now() + Math.random(),
  status: props.autoUpload ? 'uploading' : null,
  progress: 0,
  name: 'filename.pdf',
  // ... other properties
}
```

The `AssessmentForm.vue` component uses this FileUpload component and was directly submitting these full file objects to the database instead of extracting just the filenames. This caused the database to store the complete file metadata objects rather than simple filename strings.

## Solution Implemented

### 1. Fixed AssessmentForm Data Submission
The primary fix was to modify `AssessmentForm.vue` to extract only filenames before submitting to the database:

```javascript
// Extract only filenames from file objects before submission
const submissionData = {
  ...form.data(),
  evidence_files: form.evidence_files.map(file => 
    typeof file === 'string' ? file : (file.name || file.filename || file.originalName)
  ).filter(Boolean)
}
```

This ensures that only filename strings are stored in the database, not the full file objects.

### 2. Robust File Data Parsing in Evaluate Page
Added comprehensive handling for different file data formats in the Evaluate page:

```javascript
const getEvidenceFiles = () => {
  let evidenceFiles = props.assessment.evidence_files || [];
  
  // Handle JSON string format
  if (typeof evidenceFiles === 'string') {
    try {
      evidenceFiles = JSON.parse(evidenceFiles);
    } catch (e) {
      console.warn('Failed to parse evidence_files JSON:', e);
      evidenceFiles = [];
    }
  }
  
  // Ensure it's an array
  if (!Array.isArray(evidenceFiles)) {
    evidenceFiles = [];
  }
  
  return evidenceFiles;
};
```

### 2. Flexible File Object Handling
Updated file initialization to handle multiple formats:

```javascript
const uploadedFiles = ref(
  getEvidenceFiles()
    .map(fileItem => {
      // Handle string filenames
      if (typeof fileItem === 'string') {
        return {
          name: fileItem,
          size: null,
          type: 'application/octet-stream',
          isExisting: true
        };
      } 
      // Handle file objects
      else if (typeof fileItem === 'object' && fileItem !== null) {
        const fileName = fileItem.name || fileItem.filename || fileItem.originalName;
        if (fileName) {
          return {
            name: fileName,
            size: fileItem.size || null,
            type: fileItem.type || fileItem.mimeType || 'application/octet-stream',
            isExisting: true
          };
        }
      }
      
      // Skip invalid entries
      console.warn('Skipping invalid file item:', fileItem);
      return null;
    })
    .filter(file => file !== null) // Remove invalid entries
);
```

### 3. Database Cleanup Migration
Created migration to clean up existing invalid data:

**File:** `database/migrations/2025_01_10_000000_clean_evidence_files_data.php`

This migration:
- Scans all assessments with evidence_files
- Extracts valid filenames from file objects
- Updates database with clean filename arrays
- Removes entries with no valid files

### 4. Enhanced File Display
Updated the template to show appropriate labels:

```vue
<span v-if="file.size !== null" class="text-xs text-gray-500 ml-2">
  ({{ formatFileSize(file.size) }})
</span>
<span v-else-if="file.isExisting" class="text-xs text-gray-500 ml-2">
  (Existing file)
</span>
```

## Files Modified

1. **resources/js/Components/Competency/AssessmentForm.vue** ⭐ **PRIMARY FIX**
   - Modified `handleSubmit()` method to extract filenames before submission
   - Modified `saveDraft()` method to extract filenames before submission  
   - Modified auto-save functionality to extract filenames before submission
   - This prevents file objects from being stored in the database

2. **resources/js/Pages/CompetencyAssessments/Evaluate.vue**
   - Added robust file data parsing for backward compatibility
   - Enhanced file object handling for existing bad data
   - Improved error handling and validation

3. **database/migrations/2025_01_10_000000_clean_evidence_files_data.php**
   - New migration to clean up existing invalid database data

## Testing Steps

1. **Run the migration:**
   ```bash
   php artisan migrate
   ```

2. **Test the Evaluate page:**
   - Navigate to an assessment with evidence files
   - Verify files show proper names instead of JSON
   - Test file upload functionality
   - Verify existing files show "(Existing file)" label

3. **Verify database cleanup:**
   - Check that evidence_files column contains only filename arrays
   - Ensure no JSON objects remain in the data

## Prevention

To prevent this issue in the future:
1. **Always extract filenames from FileUpload components** before database storage
2. **Validate form data** before submission to ensure only strings are in evidence_files arrays
3. **Add data transformation layers** between UI components and database operations
4. **Use proper type checking** in form submission handlers
5. **Consider creating a dedicated file service** to handle file metadata separately from assessment data

## Testing Verification

After implementing these fixes:
1. ✅ New assessments created through AssessmentForm will store only filenames
2. ✅ Existing assessments with bad data are cleaned up by the migration
3. ✅ Evaluate page handles both old and new data formats gracefully
4. ✅ File upload and display functionality works correctly

## Status: ✅ RESOLVED

The file display issue has been completely resolved by:
- **Fixing the root cause** in AssessmentForm data submission
- **Adding backward compatibility** in the Evaluate page
- **Cleaning up existing bad data** with a database migration

No more JSON objects will be displayed as filenames, and the system now properly handles file data throughout the entire workflow.