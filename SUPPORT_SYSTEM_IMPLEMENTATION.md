# Support System Implementation

## Overview

A comprehensive support request system has been implemented in the Xonobics HRMS to allow users to submit categorized support requests that are automatically sent via email to the support team.

## Features

### 🎯 Core Functionality
- **Categorized Support Requests**: 9 predefined categories including Technical Issues, Account & Login, Attendance, Leave Management, etc.
- **Priority Levels**: Low, Medium, High, and Urgent priority levels
- **Email Notifications**: Automatic email notifications sent to support team upon request submission
- **Request Tracking**: Users can view their submitted requests and track status
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### 📋 Support Categories
1. **Technical Issues** - Browser issues, system errors, bugs
2. **Account & Login** - Authentication problems, password issues
3. **Attendance & Time Tracking** - Clock in/out issues, attendance corrections
4. **Leave Management** - Leave request problems, approval issues
5. **Competency Assessments** - Assessment-related questions and issues
6. **Reports & Analytics** - Report generation problems, data issues
7. **Permissions & Access** - Role and permission related issues
8. **General Help** - General questions and guidance
9. **Other** - Any other issues not covered above

### 🚨 Priority Levels
- **Low** - Non-urgent issues that can wait
- **Medium** - Standard issues (default)
- **High** - Important issues affecting work
- **Urgent** - Critical issues requiring immediate attention

## Implementation Details

### Database Schema

```sql
CREATE TABLE support_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    category VARCHAR(191) NOT NULL,
    subject VARCHAR(191) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(191) DEFAULT 'medium',
    status VARCHAR(191) DEFAULT 'open',
    attachments TEXT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Backend Components

#### Models
- **`App\Models\SupportRequest`** - Main model with relationships and helper methods

#### Controllers
- **`App\Http\Controllers\SupportController`** - Handles CRUD operations and form submissions

#### Mail Classes
- **`App\Mail\SupportRequestMail`** - Queued email notification for new support requests

#### Email Templates
- **`resources/views/emails/support/request.blade.php`** - Professional HTML email template

### Frontend Components

#### Vue.js Pages
- **`resources/js/Pages/Support/Create.vue`** - Support request submission form
- **`resources/js/Pages/Support/Index.vue`** - List of user's support requests
- **`resources/js/Pages/Support/Show.vue`** - Detailed view of individual support request

### Routes

```php
// Support Request routes
Route::get('/support', [SupportController::class, 'index'])->name('support.index');
Route::get('/support/create', [SupportController::class, 'create'])->name('support.create');
Route::post('/support', [SupportController::class, 'store'])->name('support.store');
Route::get('/support/{supportRequest}', [SupportController::class, 'show'])->name('support.show');
```

### Navigation Integration

The support system is integrated into the main navigation sidebar with a "Support" menu item available to all authenticated users.

## Configuration

### Environment Variables

Add to your `.env` file:

```env
MAIL_SUPPORT_EMAIL="support@example.com"
```

If not set, the system will fall back to the default `MAIL_FROM_ADDRESS`.

### Queue Configuration

The support email notifications are queued for better performance. Ensure your queue worker is running:

```bash
php artisan queue:work
```

## Usage

### For End Users

1. **Submit Support Request**:
   - Navigate to Support → Create New Request
   - Select appropriate category and priority
   - Fill in subject and detailed description
   - Submit the form

2. **Track Requests**:
   - Navigate to Support → My Requests
   - View all submitted requests with status
   - Click on any request to view details

### For Administrators

Support requests are automatically emailed to the configured support email address with:
- Complete request details
- User information
- Priority and category
- Professional formatting

## Email Template Features

The email template includes:
- **Professional Design**: Clean, responsive HTML layout
- **Complete Information**: All request details, user info, timestamps
- **Priority Indicators**: Visual priority indicators with color coding
- **Contact Information**: Support team contact details
- **Branding**: Consistent with HRMS branding

## Security Features

- **User Authorization**: Users can only view their own support requests
- **Input Validation**: Comprehensive form validation
- **CSRF Protection**: Built-in Laravel CSRF protection
- **SQL Injection Prevention**: Eloquent ORM protection

## Performance Considerations

- **Queued Emails**: Email notifications are queued to prevent blocking
- **Pagination**: Support request lists are paginated
- **Efficient Queries**: Optimized database queries with proper relationships
- **Asset Optimization**: Compiled and minified frontend assets

## Testing

The system includes comprehensive testing capabilities:
- Model relationships testing
- Form validation testing
- Email notification testing
- Database integrity testing

## Future Enhancements

Potential future improvements:
- File attachment support
- Support ticket comments/replies
- Admin dashboard for managing requests
- Status update notifications
- Knowledge base integration
- Live chat integration

## Troubleshooting

### Common Issues

1. **Emails not sending**: Check queue worker and mail configuration
2. **Navigation not showing**: Clear browser cache and rebuild assets
3. **Form validation errors**: Check model fillable fields and validation rules

### Debug Commands

```bash
# Test email configuration
php artisan tinker
Mail::raw('Test email', function($msg) { $msg->to('test@example.com')->subject('Test'); });

# Check queue jobs
php artisan queue:work --verbose

# Clear caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## File Structure

```
Support System Files:
├── app/
│   ├── Http/Controllers/SupportController.php
│   ├── Mail/SupportRequestMail.php
│   └── Models/SupportRequest.php
├── database/migrations/
│   └── 2025_10_23_144523_create_support_requests_table.php
├── resources/
│   ├── js/Pages/Support/
│   │   ├── Create.vue
│   │   ├── Index.vue
│   │   └── Show.vue
│   └── views/emails/support/
│       └── request.blade.php
└── routes/web.php (support routes added)
```

## Conclusion

The support system provides a complete solution for handling user support requests within the HRMS. It's designed to be user-friendly, efficient, and easily maintainable while providing comprehensive functionality for both end users and support staff.