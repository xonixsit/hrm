#!/bin/bash

echo "🚀 Deploying Xonixs HRM to Production..."

# Backup current deployment
echo "📦 Creating backup..."
if [ -d "backup" ]; then
    rm -rf backup
fi
mkdir backup
cp -r storage backup/
cp .env backup/.env.backup 2>/dev/null || true

# Use production environment
echo "⚙️  Setting up production environment..."
cp .env.production .env

# Install dependencies
echo "📦 Installing dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction
npm ci --production

# Build assets
echo "🔨 Building production assets..."
npm run build

# Generate application key if needed
if ! grep -q "APP_KEY=base64:" .env; then
    php artisan key:generate --force
fi

# Set up database
echo "🗄️  Setting up production database..."
php artisan migrate --force

# Seed demo data (optional - remove for real production)
read -p "Do you want to seed demo data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan demo:setup
fi

# Optimize for production
echo "⚡ Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Set proper permissions
echo "🔐 Setting file permissions..."
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache public

# Create symbolic link for storage
php artisan storage:link

# Clear any development caches
php artisan cache:clear
php artisan config:clear

echo "✅ Production deployment completed!"
echo ""
echo "🌐 Site URL: https://hrm.xonixs.com"
echo ""
echo "🔑 Demo Login Credentials:"
echo "Admin: admin@xonixs.com / password123"
echo "HR: hr@xonixs.com / password123"
echo "Manager: manager@xonixs.com / password123"
echo "Employee: employee@xonixs.com / password123"
echo ""
echo "⚠️  IMPORTANT: Change default passwords in production!"
echo "⚠️  Update database credentials in .env"
echo "⚠️  Configure SSL certificate"
echo "⚠️  Set up proper backup system"