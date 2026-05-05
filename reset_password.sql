-- Reset Password for maheshwari@etaxplanner.com
-- New password: Welcome@123
-- Password hash: $2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5OMh/NG9B/XRm

-- Check if user exists
SELECT 'User before password reset:' as status, id, name, email, created_at 
FROM users 
WHERE email = 'maheshwari@etaxplanner.com';

-- Reset password
UPDATE users 
SET password = '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5OMh/NG9B/XRm',
    updated_at = NOW()
WHERE email = 'maheshwari@etaxplanner.com';

-- Verify update
SELECT 'User after password reset:' as status, id, name, email, updated_at 
FROM users 
WHERE email = 'maheshwari@etaxplanner.com';

-- Show result
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM users WHERE email = 'maheshwari@etaxplanner.com') 
        THEN 'Password reset successful! New password: Welcome@123'
        ELSE 'User not found!'
    END as result;
