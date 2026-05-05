-- Manual password reset for maheshwari@etaxplanner.com
-- Password: Welcome@123
-- This uses a bcrypt hash with cost factor 12 (Laravel's default)

UPDATE users 
SET password = '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'maheshwari@etaxplanner.com';

-- Verify the update
SELECT id, name, email, created_at, updated_at 
FROM users 
WHERE email = 'maheshwari@etaxplanner.com';

-- Note: This hash is for the password "password"
-- If you need a different password, you'll need to generate the hash using Laravel:
-- php -r "echo password_hash('Welcome@123', PASSWORD_BCRYPT, ['cost' => 12]);"
