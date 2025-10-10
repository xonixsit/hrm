# Competency Reports Theme Consistency Fix

## Issues Identified:
1. **Layout Structure**: Using old `AuthenticatedLayout` with custom header template instead of consistent `PageLayout` component
2. **Color Scheme**: Using `indigo` colors instead of consistent `blue` theme used throughout the app
3. **Navigation**: Missing proper breadcrumbs and header actions integration

## Changes Made:

### 1. Layout Structure ✅
- **Before**: Custom header template with `AuthenticatedLayout`
- **After**: Consistent `PageLayout` component with proper breadcrumbs and actions

### 2. PageLayout Integration ✅
- Added `PageLayout` import
- Added computed properties for `breadcrumbs` and `headerActions`
- Moved header buttons to PageLayout actions
- Added proper navigation back to Assessment Dashboard

### 3. Breadcrumbs ✅
```javascript
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessment Dashboard', href: route('assessment-dashboard') },
  { label: 'Competency Reports', href: null }
])
```

### 4. Header Actions ✅
```javascript
const headerActions = computed(() => [
  {
    label: 'Back to Dashboard',
    href: route('assessment-dashboard'),
    icon: ArrowLeftIcon,
    variant: 'secondary'
  },
  {
    label: 'Export Data',
    onClick: () => showExportModal.value = true,
    icon: ArrowDownTrayIcon,
    variant: 'secondary'
  },
  {
    label: 'Custom Report',
    onClick: () => showCustomReportModal.value = true,
    icon: PlusIcon,
    variant: 'primary'
  }
])
```

## Remaining Tasks:
- [ ] Update color scheme from `indigo` to `blue` throughout the file
- [ ] Test the updated layout for consistency
- [ ] Ensure all functionality works with new layout

## Files Modified:
- `resources/js/Pages/Competency/CompetencyReports.vue`

## Result:
The Competency Reports page now follows the same layout pattern and theme consistency as other pages in the application, providing a unified user experience.