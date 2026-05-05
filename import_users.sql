-- Import Users SQL Script
-- Password for all users: Welcome@123 (hashed with bcrypt)
-- Default password hash: $2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5OMh/NG9B/XRm

-- Note: You need to get the department_id from your departments table
-- Run this first to get department ID: SELECT id FROM departments LIMIT 1;
-- Replace @department_id with the actual department ID

SET @department_id = 1; -- Change this to your actual department ID
SET @password_hash = '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5OMh/NG9B/XRm'; -- Welcome@123

-- 1. SHAIK ABDHUL RAHEEM
INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at)
VALUES ('SHAIK ABDHUL RAHEEM', 'raheem@mysupertax.com', @password_hash, NOW(), NOW(), NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO employees (user_id, employee_code, department_id, job_title, join_date, contract_type, phone, address, status, created_at, updated_at)
VALUES (@user_id, CONCAT('EMP', LPAD(@user_id, 4, '0')), @department_id, 'Employee', NOW(), 'Full-time', '+919160946810', '13-11-98 HOUSE NUMBER 4TH FLOOR ,SAI BOYS HOSTEL OPP BULINDING NEAR Madhapur ,500081.', 'active', NOW(), NOW());

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT id, 'App\\Models\\User', @user_id FROM roles WHERE name = 'Employee' LIMIT 1;

-- 2. Prabhudeva Ganta
INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at)
VALUES ('Prabhudeva Ganta', 'prabhudeva@mysupertax.com', @password_hash, NOW(), NOW(), NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO employees (user_id, employee_code, department_id, job_title, join_date, contract_type, phone, address, status, created_at, updated_at)
VALUES (@user_id, CONCAT('EMP', LPAD(@user_id, 4, '0')), @department_id, 'Employee', NOW(), 'Full-time', '9949737983', 'saigiri school,lakshminarsimha nagar,yusafguda,500045', 'active', NOW(), NOW());

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT id, 'App\\Models\\User', @user_id FROM roles WHERE name = 'Employee' LIMIT 1;

-- 3. CHILUMULA SAI NIKHITHA
INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at)
VALUES ('CHILUMULA SAI NIKHITHA', 'nikhitha@mysupertax.com', @password_hash, NOW(), NOW(), NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO employees (user_id, employee_code, department_id, job_title, join_date, contract_type, phone, address, status, created_at, updated_at)
VALUES (@user_id, CONCAT('EMP', LPAD(@user_id, 4, '0')), @department_id, 'Employee', NOW(), 'Full-time', '9059549472', 'LAKSHMI LADIES HOSTEL, 500085 ,KPHB,HYDERABAD', 'active', NOW(), NOW());

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT id, 'App\\Models\\User', @user_id FROM roles WHERE name = 'Employee' LIMIT 1;

-- 4. Hareesh Majjiga
INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at)
VALUES ('Hareesh Majjiga', 'hareesh@mysupertax.com', @password_hash, NOW(), NOW(), NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO employees (user_id, employee_code, department_id, job_title, join_date, contract_type, phone, address, status, created_at, updated_at)
VALUES (@user_id, CONCAT('EMP', LPAD(@user_id, 4, '0')), @department_id, 'Employee', NOW(), 'Full-time', '8639848969', 'Sri Venkateswara pg, room no 209, opposite Hanuman Temple, near KIMS Hospital, Kondapur, 500084.', 'active', NOW(), NOW());

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT id, 'App\\Models\\User', @user_id FROM roles WHERE name = 'Employee' LIMIT 1;

-- 5. Nerella Soumya
INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at)
VALUES ('Nerella Soumya', 'soumya@mysupertax.com', @password_hash, NOW(), NOW(), NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO employees (user_id, employee_code, department_id, job_title, join_date, contract_type, phone, address, status, created_at, updated_at)
VALUES (@user_id, CONCAT('EMP', LPAD(@user_id, 4, '0')), @department_id, 'Employee', NOW(), 'Full-time', '9908253120', 'sri sai balaji complex,Ameerpet', 'active', NOW(), NOW());

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT id, 'App\\Models\\User', @user_id FROM roles WHERE name = 'Employee' LIMIT 1;

-- 6. LAVANYA NIMMANAGOTI
INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at)
VALUES ('LAVANYA NIMMANAGOTI', 'lavanya@mysupertax.com', @password_hash, NOW(), NOW(), NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO employees (user_id, employee_code, department_id, job_title, join_date, contract_type, phone, address, status, created_at, updated_at)
VALUES (@user_id, CONCAT('EMP', LPAD(@user_id, 4, '0')), @department_id, 'Employee', NOW(), 'Full-time', '8074244288', 'Sri Trikoteshwara Ladies Hostel, Near Tazza Kitchen- Madhapur, 500081', 'active', NOW(), NOW());

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT id, 'App\\Models\\User', @user_id FROM roles WHERE name = 'Employee' LIMIT 1;

-- 7. LUQMAAN BABA
INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at)
VALUES ('LUQMAAN BABA', 'mohammed.k@etaxplanner.com', @password_hash, NOW(), NOW(), NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO employees (user_id, employee_code, department_id, job_title, join_date, contract_type, phone, address, status, created_at, updated_at)
VALUES (@user_id, CONCAT('EMP', LPAD(@user_id, 4, '0')), @department_id, 'Employee', NOW(), 'Full-time', '7032736053', 'BORABANDA YOUSUFGUDA HYDERABAD 500045', 'active', NOW(), NOW());

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT id, 'App\\Models\\User', @user_id FROM roles WHERE name = 'Employee' LIMIT 1;

-- Verification queries
SELECT 'Users created:' as message, COUNT(*) as count FROM users WHERE email IN (
    'raheem@mysupertax.com',
    'prabhudeva@mysupertax.com',
    'nikhitha@mysupertax.com',
    'hareesh@mysupertax.com',
    'soumya@mysupertax.com',
    'lavanya@mysupertax.com',
    'mohammed.k@etaxplanner.com'
);

SELECT 'Employees created:' as message, COUNT(*) as count FROM employees e
INNER JOIN users u ON e.user_id = u.id
WHERE u.email IN (
    'raheem@mysupertax.com',
    'prabhudeva@mysupertax.com',
    'nikhitha@mysupertax.com',
    'hareesh@mysupertax.com',
    'soumya@mysupertax.com',
    'lavanya@mysupertax.com',
    'raveen@mysupertax.com',
    'mohammed.k@etaxplanner.com',
    'vijayashanthi@mysupertax.com',
    'j.karthik@etaxplanner.com',
    'afroz@mysupertax.com',
    'deepak@mysupertax.com',
    'makubhavani311@gmail.com',
    'venkatesh@mysupertax.com','raveen@mysupertax.com','alekhya@mysupertax.com'
);
