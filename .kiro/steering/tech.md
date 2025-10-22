# Technology Stack

## Backend
- **Framework**: Laravel 12.x (PHP 8.2+)
- **Database**: SQLite (development), supports MySQL/PostgreSQL for production
- **Authentication**: Laravel Sanctum with Spatie Laravel Permission for RBAC
- **Queue System**: Database-driven queues for email notifications and background jobs
- **File Processing**: Laravel Excel (Maatwebsite) for import/export, DomPDF for reports

## Frontend
- **Framework**: Vue.js 3 with Composition API
- **Routing**: Inertia.js for SPA-like experience with Laravel backend
- **Styling**: Tailwind CSS with custom design token system
- **Icons**: Heroicons and Lucide Vue Next
- **UI Components**: Headless UI for accessible components

## Build System
- **Bundler**: Vite with Laravel Vite plugin
- **Testing**: Vitest for JavaScript, PHPUnit for PHP
- **Code Quality**: Laravel Pint for PHP formatting

## Key Dependencies
- **CSV/Excel**: League CSV, PhpSpreadsheet for data processing
- **Email**: Laravel Mail with queue support for notifications
- **Routing**: Ziggy for Laravel route access in JavaScript

## Common Commands

### Development
```bash
# Start development environment (runs server, queue, logs, and Vite)
composer dev

# Individual services
php artisan serve          # Laravel development server
php artisan queue:work     # Process background jobs
npm run dev               # Vite development server
```

### Testing
```bash
composer test             # Run PHP tests
npm run test             # Run JavaScript tests (single run)
npm run test:watch       # Run JavaScript tests in watch mode
```

### Build & Deploy
```bash
npm run build            # Build production assets
php artisan migrate      # Run database migrations
php artisan config:cache # Cache configuration for production
```

### Maintenance
```bash
php artisan queue:listen --tries=1  # Queue worker with retry limit
php artisan pail --timeout=0        # Real-time log monitoring
```