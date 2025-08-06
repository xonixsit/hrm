# Project Structure

## Laravel Backend Structure

### Core Application (`app/`)
- `app/Http/` - Controllers, Middleware, Requests, Resources
- `app/Models/` - Eloquent models
- `app/Providers/` - Service providers
- `app/Exports/` - Excel export classes
- `app/Notifications/` - Email/SMS notifications
- `app/Traits/` - Reusable model traits

### Configuration (`config/`)
- Standard Laravel config files
- `config/permission.php` - Spatie permissions configuration

### Database (`database/`)
- `database/migrations/` - Database schema migrations
- `database/seeders/` - Database seeders
- `database/factories/` - Model factories for testing
- `database/database.sqlite` - SQLite database file

### Routes (`routes/`)
- Web routes, API routes, console commands

## Frontend Structure (`resources/js/`)

### Core Files
- `app.js` - Main application entry point
- `bootstrap.js` - Application bootstrapping

### Pages (`resources/js/Pages/`)
- Inertia.js page components organized by feature:
  - `Feedbacks/` - Feedback management pages
  - `Leaves/` - Leave management pages  
  - `Projects/` - Project management pages

### Components (`resources/js/Components/`)
- Reusable Vue.js components
- Navigation components with error boundaries
- Authentication-related components
- Role-based access components

### Layouts (`resources/js/Layouts/`)
- `AuthenticatedLayout.vue` - Main authenticated user layout

### Composables (`resources/js/composables/`)
- Vue 3 composition API utilities:
  - `useAuth.js` - Authentication helpers
  - `useAuthErrorHandler.js` - Error handling
  - `usePermissions.js` - Permission checking

### Services (`resources/js/services/`)
- `NavigationGuardService.js` - Route protection logic

## Styling (`resources/css/`)
- Tailwind CSS configuration and custom styles

## Build Configuration
- `vite.config.js` - Vite build configuration with Vue and Laravel plugins
- `tailwind.config.js` - Tailwind CSS configuration
- `jsconfig.json` - JavaScript path resolution

## Conventions

### File Naming
- Vue components: PascalCase (e.g., `NavigationErrorBoundary.vue`)
- Composables: camelCase with `use` prefix (e.g., `useAuth.js`)
- Services: PascalCase with `Service` suffix (e.g., `NavigationGuardService.js`)

### Directory Organization
- Group related functionality in feature folders
- Separate concerns: components, composables, services, pages
- Use Laravel's standard directory structure for backend code

### Import Paths
- Use `@/` alias for `resources/js/` imports
- Relative imports for closely related files
- Absolute imports for shared utilities and components