#!/bin/bash

echo "🚀 Deploying Xonixs HRM Demo..."

# Install dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

echo "📦 Installing Node dependencies..."
npm install

# Build assets
echo "🔨 Building production assets..."
npm run build

# Set up environment
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file from example"
fi

# Generate application key
php artisan key:generate

# Set up database and demo data
echo "🗄️  Setting up database with demo data..."
php artisan demo:setup --fresh

# Cache configuration for production
echo "⚡ Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
echo "🔐 Setting file permissions..."
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo "✅ Demo deployment completed!"
echo ""
echo "🔑 Demo Login Credentials:"
echo "Admin: admin@xonixs.com / password123"
echo "HR: hr@xonixs.com / password123"
echo "Manager: manager@xonixs.com / password123"
echo "Employee: employee@xonixs.com / password123"
echo ""
echo "🎯 Your demo is ready!"