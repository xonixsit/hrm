# Technology Stack

## Backend
- **Framework**: Laravel 12.x (PHP 8.2+)
- **Authentication**: Laravel Sanctum
- **Permissions**: Spatie Laravel Permission
- **Database**: SQLite (development), supports MySQL/PostgreSQL
- **PDF Generation**: DomPDF (barryvdh/laravel-dompdf)
- **Excel**: Maatwebsite Excel
- **Code Style**: Laravel Pint (PHP CS Fixer)

## Frontend
- **Framework**: Vue.js 3.4+
- **SPA Bridge**: Inertia.js 2.0
- **Styling**: Tailwind CSS 3.2+ with Forms plugin
- **Build Tool**: Vite 5.4+
- **HTTP Client**: Axios
- **Routing**: Ziggy (Laravel routes in JavaScript)

## Development Tools
- **Package Manager**: Composer (PHP), npm (JavaScript)
- **Testing**: PHPUnit 11.5+
- **Development Server**: Laravel Sail (Docker)
- **Process Management**: Concurrently for multiple services

## Common Commands

### Development
```bash
# Start all development services (server, queue, logs, vite)
composer dev

# Individual services
php artisan serve          # Laravel server
npm run dev               # Vite development server
php artisan queue:listen  # Queue worker
php artisan pail          # Log viewer
```

### Building
```bash
npm run build            # Production build
php artisan config:cache # Cache configuration
php artisan route:cache  # Cache routes
```

### Testing
```bash
composer test           # Run PHPUnit tests
php artisan test       # Alternative test command
```

### Code Quality
```bash
./vendor/bin/pint      # Fix code style
php artisan config:clear # Clear cached config
```

## Path Aliases
- `@/` → `resources/js/` (JavaScript imports)
- `ziggy-js` → `./vendor/tightenco/ziggy` (Route helpers)