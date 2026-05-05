#!/bin/bash

# Regenerate Ziggy routes for JavaScript
# Run this after adding new routes to web.php

echo "==================================="
echo "Regenerating Ziggy Routes"
echo "==================================="

# Generate Ziggy routes
php artisan ziggy:generate

echo ""
echo "✓ Ziggy routes regenerated!"
echo ""
echo "File updated: resources/js/ziggy.js"
echo ""
echo "If you're in development, Vite should auto-reload."
echo "If not, you may need to rebuild assets:"
echo "  npm run build"
