# Xonixs HRM Demo Setup

This guide will help you set up a complete demo environment with sample data for testing and demonstration purposes.

## Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# Make the script executable
chmod +x deploy-demo.sh

# Run the deployment script
./deploy-demo.sh
```

### Option 2: Manual Setup
```bash
# Install dependencies
composer install
npm install && npm run build

# Set up environment
cp .env.example .env
php artisan key:generate

# Set up database with demo data
php artisan demo:setup --fresh

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@xonixs.com | password123 |
| **HR Manager** | hr@xonixs.com | password123 |
| **IT Manager** | manager@xonixs.com | password123 |
| **Employee** | employee@xonixs.com | password123 |

## Demo Data Overview

### 👥 Users & Employees
- **11 Total Users**: 1 Admin, 1 HR Manager, 1 IT Manager, 8 Employees
- **5 Departments**: HR, IT, Sales & Marketing, Finance, Operations
- **Realistic Employee Data**: Names, positions, join dates, salaries

### 📊 Projects & Work Data
- **4 Active Projects**: Website Redesign, Mobile App, CRM Integration, Analytics Platform
- **20 Days of Timesheets**: With project assignments and hours tracking
- **15 Days of Work Reports**: Including tasks, calls, meetings, and issues resolved

### 🏖️ Leave Management
- **4 Leave Types**: Annual (25 days), Sick (10 days), Personal (5 days), Maternity (90 days)
- **Multiple Leave Requests**: Mix of pending, approved, and rejected requests
- **Realistic Date Ranges**: Past and future leave requests

### ⏰ Attendance Tracking
- **30 Days of Records**: Complete attendance history for all employees
- **Realistic Clock Times**: 8-9 AM start, 7-9 hour workdays
- **Break Sessions**: 30-60 minute breaks included
- **Weekend Exclusions**: No attendance records on weekends

### 🎯 Competency Management
- **5 Competency Categories**: Communication, Leadership, Technical, Problem Solving, Customer Service
- **2 Assessment Cycles**: Q4 2024 Performance Review, Annual Review 2024
- **Multiple Assessments**: Self, manager, and peer assessments with ratings
- **Various Statuses**: Draft, submitted, and approved assessments

### 💬 Feedback System
- **Peer Reviews**: Cross-departmental feedback entries
- **Rating System**: 3-5 star ratings with detailed comments
- **Recent Activity**: Feedback from the last 60 days

## Features to Test

### 🔐 Role-Based Access Control
- **Admin**: Full system access, user management, system settings
- **HR Manager**: Employee management, leave approvals, reports
- **IT Manager**: Team management, timesheet approvals, assessments
- **Employee**: Personal dashboard, leave requests, timesheet entry

### 📈 Dashboard Analytics
- **Admin Dashboard**: System-wide metrics, pending approvals, user activity
- **Manager Dashboard**: Team performance, pending team approvals
- **Employee Dashboard**: Personal metrics, attendance tracking, competency progress

### 🔄 Workflow Testing
1. **Leave Request Flow**: Submit → Approve/Reject → Notifications
2. **Timesheet Flow**: Entry → Manager Review → Approval
3. **Assessment Flow**: Assignment → Completion → Manager Review
4. **Attendance Flow**: Clock In/Out → Break Management → Reports

### 📊 Reporting Features
- **Attendance Reports**: Daily, weekly, monthly summaries
- **Leave Reports**: Usage by type, department, employee
- **Performance Reports**: Assessment results, competency tracking
- **Work Reports**: Productivity metrics, call tracking

## Environment Configuration

### Database Settings
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=xonixs_demo
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Application Settings
```env
APP_NAME="Xonixs HRM Demo"
APP_ENV=production
APP_DEBUG=false
APP_URL=hrms.xonixs.com
```

### Mail Configuration (Optional)
```env
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="Xonixs HRM Demo"
```

## Testing Scenarios

### 1. Admin User Testing
- Login as admin@xonixs.com
- Review system dashboard with all metrics
- Manage users and assign roles
- Approve/reject leave requests
- View system-wide reports

### 2. Manager Testing
- Login as manager@xonixs.com
- Review team dashboard
- Approve team timesheets
- Conduct competency assessments
- View team performance reports

### 3. Employee Testing
- Login as employee@xonixs.com
- Clock in/out with attendance tracking
- Submit leave requests
- Complete timesheet entries
- Fill out self-assessments

### 4. HR Testing
- Login as hr@xonixs.com
- Manage employee records
- Process leave approvals
- Generate HR reports
- Manage competency cycles

## Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check database credentials in .env
# Ensure database exists
mysql -u root -p -e "CREATE DATABASE xonixs_demo;"
```

**Permission Errors**
```bash
# Fix storage permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 755 storage bootstrap/cache
```

**Asset Build Errors**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install && npm run build
```

**Seeder Errors**
```bash
# Run seeder with verbose output
php artisan db:seed --class=DemoDataSeeder -v
```

## Production Deployment

### Server Requirements
- PHP 8.1+
- MySQL 5.7+ or MariaDB 10.3+
- Composer
- Node.js 16+
- Web server (Apache/Nginx)

### Security Considerations
- Change all demo passwords in production
- Set `APP_DEBUG=false`
- Configure proper SSL certificates
- Set up regular database backups
- Configure proper file permissions

### Performance Optimization
- Enable OPcache
- Configure Redis for caching
- Set up queue workers
- Enable gzip compression
- Configure CDN for assets

## Support

For issues or questions about the demo setup:
1. Check the troubleshooting section above
2. Review Laravel logs in `storage/logs/`
3. Check browser console for JavaScript errors
4. Verify database connections and permissions

---

**Happy Testing! 🚀**

The demo includes realistic data patterns and workflows that showcase the full capabilities of the Xonixs HRM system.