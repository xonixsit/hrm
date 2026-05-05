-- Cleanup Duplicate Employee Records
-- This script identifies and removes duplicate employee records for the same user_id
-- Keeps the record with the simpler employee_code (e.g., EMP0109 instead of EMP-1778010946)

-- Step 1: View duplicates before cleanup
SELECT 
    user_id,
    COUNT(*) as record_count,
    GROUP_CONCAT(id) as employee_ids,
    GROUP_CONCAT(employee_code) as employee_codes
FROM employees
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY user_id;

-- Step 2: Delete duplicate records (keeps the one with shorter/simpler employee_code)
-- Run this carefully - review the results from Step 1 first!

-- For each duplicate, this will keep the record with the shortest employee_code
DELETE e1 FROM employees e1
INNER JOIN employees e2 ON e1.user_id = e2.user_id
WHERE e1.id > e2.id 
  AND LENGTH(e1.employee_code) > LENGTH(e2.employee_code);

-- Alternative: If you want to manually specify which IDs to delete
-- DELETE FROM employees WHERE id IN (28, 27, 26, 25); -- Replace with actual IDs from Step 1

-- Step 3: Verify cleanup
SELECT 
    user_id,
    COUNT(*) as record_count,
    GROUP_CONCAT(id) as employee_ids,
    GROUP_CONCAT(employee_code) as employee_codes
FROM employees
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY user_id;

-- Step 4: Check all remaining employees
SELECT 
    e.id,
    e.user_id,
    u.name,
    u.email,
    e.employee_code,
    e.created_at
FROM employees e
INNER JOIN users u ON e.user_id = u.id
ORDER BY e.user_id, e.id;
