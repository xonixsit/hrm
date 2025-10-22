# Project Structure & Conventions

## Directory Organization

### Backend (Laravel)
```
app/
├── Console/Commands/     # Artisan commands (birthday emails, notifications)
├── Http/
│   ├── Controllers/     # Route controllers (Employee, Assessment, etc.)
│   └── Middleware/      # Custom middleware (password reset, etc.)
├── Jobs/               # Queue jobs for background processing
├── Mail/               # Email templates and mailable classes
├── Models/             # Eloquent models with relationships
├── Notifications/      # Laravel notification classes
├── Policies/           # Authorization policies for RBAC
├── Providers/          # Service providers
├── Services/           # Business logic services (Birthday, Notification)
└── Traits/             # Reusable model traits
```

### Frontend (Vue.js)
```
resources/js/
├── Components/
│   ├── Dashboard/      # Dashboard-specific components
│   ├── Layout/         # Layout components (headers, footers)
│   ├── Navigation/     # Navigation components (sidebar, breadcrumbs)
│   ├── UI/            # Reusable UI components (cards, buttons)
│   └── Debug/         # Development/debugging components
├── Pages/             # Inertia.js page components
│   ├── Admin/         # Admin-only pages (roles, system settings)
│   ├── Employees/     # Employee management pages
│   ├── CompetencyAssessments/  # Assessment pages
│   └── Profile/       # User profile pages
├── config/            # Configuration files (design tokens)
├── services/          # JavaScript services and utilities
└── utils/             # Utility functions (accessibility, etc.)
```

## Naming Conventions

### PHP (Laravel)
- **Controllers**: PascalCase with `Controller` suffix (`EmployeeController`)
- **Models**: PascalCase singular (`Employee`, `CompetencyAssessment`)
- **Jobs**: PascalCase with descriptive action (`SendWelcomeEmail`)
- **Mail**: PascalCase with descriptive name (`BirthdayWish`, `AssessmentAssigned`)
- **Policies**: PascalCase with `Policy` suffix (`EmployeePolicy`)
- **Services**: PascalCase with `Service` suffix (`BirthdayService`)

### Vue.js
- **Components**: PascalCase (`EmployeeDashboard.vue`, `SimpleInfoCard.vue`)
- **Pages**: PascalCase matching route structure (`Index.vue`, `Create.vue`, `Edit.vue`)
- **Props/Variables**: camelCase (`employeeData`, `isLoading`)
- **Events**: kebab-case (`employee-updated`, `assessment-submitted`)

### Database
- **Tables**: snake_case plural (`employees`, `competency_assessments`)
- **Columns**: snake_case (`first_name`, `created_at`)
- **Foreign Keys**: `{model}_id` format (`employee_id`, `manager_id`)

## Architecture Patterns

### Backend Patterns
- **Repository Pattern**: Not used - direct Eloquent model usage
- **Service Layer**: Business logic in dedicated service classes
- **Policy-Based Authorization**: Spatie Permission with custom policies
- **Queue Jobs**: Background processing for emails and heavy operations
- **Soft Deletes**: Used for employee records to maintain data integrity

### Frontend Patterns
- **Composition API**: Vue 3 Composition API for component logic
- **Design Token System**: Centralized design tokens in `designTokens.js`
- **Component Composition**: Reusable UI components with consistent props
- **Inertia.js**: Server-side routing with client-side navigation

## File Naming Rules

### Vue Components
- Use PascalCase for all component files
- Prefix with domain when needed (`Dashboard/`, `Navigation/`)
- Use descriptive names (`BirthdayNotifications.vue`, `IntegratedTopNav.vue`)

### PHP Files
- Follow PSR-4 autoloading standards
- Controllers in `Http/Controllers/` with `Controller` suffix
- Models in root `Models/` directory
- Services in `Services/` directory with `Service` suffix

### Database Migrations
- Use Laravel timestamp format: `YYYY_MM_DD_HHMMSS_description.php`
- Descriptive names: `create_email_preferences_table.php`
- Foreign key migrations: `add_manager_id_to_employees_table.php`

## Code Organization Rules

### Component Structure
- Keep components focused and single-responsibility
- Use composition over inheritance
- Implement proper prop validation and defaults
- Follow accessibility guidelines (ARIA labels, semantic HTML)

### Model Relationships
- Define relationships in models using Eloquent conventions
- Use proper foreign key constraints
- Implement soft deletes where data integrity is important
- Add model factories for testing

### Route Organization
- Group related routes using Route::group()
- Apply middleware at group level when possible
- Use resource routes for CRUD operations
- Implement proper authorization in route definitions