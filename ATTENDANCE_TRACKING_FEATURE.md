# Attendance Tracking Feature for Admin Dashboard

## Overview
Added comprehensive attendance tracking functionality to the admin dashboard that allows administrators to monitor employee clock-in status in real-time.

## Features

### 1. Dashboard Statistics
- **Today's Attendance Card**: Shows clocked-in employees vs total employees (e.g., "15/20")
- **Status Indicators**: Color-coded status (Excellent ≥90%, Good ≥75%, Needs Attention <75%)
- **Real-time Updates**: Refresh button to get latest attendance data

### 2. Attendance Tracking Widget
- **Summary Stats**: 
  - Number of employees clocked in
  - Number of employees who missed clock-in
  - Total employee count
  - Attendance rate percentage with progress bar

- **Tabbed View**:
  - **Clocked In Tab**: Shows employees currently clocked in with:
    - Employee name, job title, department
    - Clock-in time
    - Current work duration
    - Break status indicator
  
  - **Missed Clock-in Tab**: Shows employees who haven't clocked in with:
    - Employee name, job title, department
    - Employee code
    - "Not clocked in" status

- **Quick Actions**:
  - Send reminder to employees who missed clock-in
  - Export attendance report

### 3. Data Filtering
- Only tracks employees with "Employee" role
- Only shows active employees (not exited)
- Real-time calculation of work duration and break status

## Technical Implementation

### Backend (DashboardController.php)
- Added `getAttendanceTrackingData()` method
- Filters employees by role and active status
- Calculates attendance statistics
- Returns structured data for frontend consumption

### Frontend Components
- **AttendanceTrackingWidget.vue**: New component for detailed attendance view
- **Dashboard.vue**: Updated to include attendance tracking
- Integrated with existing UnifiedCard and UnifiedStatsCard components

### Database Queries
- Efficient queries using Laravel relationships
- Filters by today's date for attendance records
- Uses Employee and Attendance models with proper relationships

## Usage

### For Administrators
1. Navigate to the admin dashboard
2. View the "Today's Attendance" card in the top metrics
3. Check the detailed "Today's Attendance Tracking" widget for:
   - Complete list of clocked-in employees
   - List of employees who missed clock-in
   - Send reminders to absent employees
   - Export attendance reports

### Data Refresh
- Manual refresh button in the widget
- Automatic updates when dashboard is refreshed
- Preserves scroll position during updates

## Benefits
- **Real-time Monitoring**: Instant visibility into attendance status
- **Proactive Management**: Identify and contact employees who missed clock-in
- **Performance Tracking**: Monitor overall attendance rates and trends
- **Actionable Insights**: Quick actions for common administrative tasks

## Future Enhancements
- Email/SMS reminder functionality
- Attendance report generation and export
- Historical attendance trends
- Department-wise attendance breakdown
- Integration with leave management system