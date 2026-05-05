#!/bin/bash

# Fix Storage Permissions for Production Server
# Run this script on your production server

echo "=== Fixing Storage Permissions for Laravel ==="
echo ""

# Get the current directory (should be your Laravel root)
LARAVEL_ROOT=$(pwd)

echo "Laravel Root: $LARAVEL_ROOT"
echo ""

# 1. Create storage link if it doesn't exist
echo "Step 1: Creating storage symlink..."
php artisan storage:link
echo "✓ Storage link created"
echo ""

# 2. Set correct ownership (replace 'www-data' with your web server user if different)
# Common users: www-data (Ubuntu/Debian), apache (CentOS/RHEL), nginx (Nginx)
WEB_USER="www-data"

echo "Step 2: Setting ownership to $WEB_USER..."
sudo chown -R $WEB_USER:$WEB_USER storage/
sudo chown -R $WEB_USER:$WEB_USER public/storage/
echo "✓ Ownership set"
echo ""

# 3. Set correct permissions
echo "Step 3: Setting permissions..."
# Storage directory - 775 (rwxrwxr-x)
sudo chmod -R 775 storage/
sudo chmod -R 775 storage/app/
sudo chmod -R 775 storage/app/public/
sudo chmod -R 775 storage/app/public/profile-pictures/

# Public storage link - 755 (rwxr-xr-x)
sudo chmod -R 755 public/storage/

# Make sure files are readable
sudo find storage/app/public/profile-pictures/ -type f -exec chmod 644 {} \;
echo "✓ Permissions set"
echo ""

# 4. Verify the symlink
echo "Step 4: Verifying symlink..."
if [ -L "public/storage" ]; then
    echo "✓ Symlink exists at public/storage"
    ls -la public/storage
else
    echo "✗ Symlink does not exist!"
    echo "Creating it now..."
    ln -s ../storage/app/public public/storage
fi
echo ""

# 5. Check if profile-pictures directory exists
echo "Step 5: Checking profile-pictures directory..."
if [ -d "storage/app/public/profile-pictures" ]; then
    echo "✓ Profile pictures directory exists"
    echo "Files in directory:"
    ls -lah storage/app/public/profile-pictures/ | head -10
else
    echo "✗ Profile pictures directory does not exist!"
    echo "Creating it now..."
    mkdir -p storage/app/public/profile-pictures
    sudo chown $WEB_USER:$WEB_USER storage/app/public/profile-pictures
    sudo chmod 775 storage/app/public/profile-pictures
fi
echo ""

# 6. Test file access
echo "Step 6: Testing file access..."
TEST_FILE=$(ls storage/app/public/profile-pictures/ | head -1)
if [ ! -z "$TEST_FILE" ]; then
    echo "Testing access to: $TEST_FILE"
    if [ -r "storage/app/public/profile-pictures/$TEST_FILE" ]; then
        echo "✓ File is readable"
    else
        echo "✗ File is not readable - fixing permissions..."
        sudo chmod 644 "storage/app/public/profile-pictures/$TEST_FILE"
    fi
else
    echo "No files found in profile-pictures directory"
fi
echo ""

# 7. Clear Laravel caches
echo "Step 7: Clearing Laravel caches..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
echo "✓ Caches cleared"
echo ""

echo "=== Fix Complete ==="
echo ""
echo "If you're still getting 403 errors, check:"
echo "1. Your web server configuration (Apache/Nginx)"
echo "2. SELinux settings (if enabled): sudo setsebool -P httpd_read_user_content 1"
echo "3. Web server error logs for more details"
echo ""
echo "For Apache, you may need to add to your VirtualHost:"
echo "<Directory /path/to/laravel/public/storage>"
echo "    Options Indexes FollowSymLinks"
echo "    AllowOverride None"
echo "    Require all granted"
echo "</Directory>"
