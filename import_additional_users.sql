-- Import Additional Users SQL Script
-- Password for all users: Welcome@123 (hashed with bcrypt)
-- Default password hash: $2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5OMh/NG9B/XRm

SET @department_id = 1; -- Change this to your actual department ID
SET @password_hash = '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5OMh/NG9B/XRm'; -- Welcome@123

SET @user_id = LAST_INSERT_ID();

INSERT INTO employees (user_id, employee_code, department_id, job_title, join_date, contract_type, phone, address, status, created_at, updated_at)
VALUES (@user_id, CONCAT('EMP', LPAD(@user_id, 4, '0')), @department_id, 'Employee', NOW(), 'Full-time', '9100164640', 'HMT hills,KPHB, kukatpalli, 500084', 'active', NOW(), NOW());

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT id, 'App\\Models\\User', @user_id FROM roles WHERE name = 'Employee' LIMIT 1;

-- 2. VAKITA ALEKHYA
INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at)
VALUES ('VAKITA ALEKHYA', 'alekhya@mysupertax.com', @password_hash, NOW(), NOW(), NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO employees (user_id, employee_code, department_id, job_title, join_date, contract_type, phone, address, status, created_at, updated_at)
VALUES (@user_id, CONCAT('EMP', LPAD(@user_id, 4, '0')), @department_id, 'Employee', NOW(), 'Full-time', '9392454233', 'prabhakar reddy nagar, sanath nagar , 500018', 'active', NOW(), NOW());

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT id, 'App\\Models\\User', @user_id FROM roles WHERE name = 'Employee' LIMIT 1;

-- Note: PIDIKITI VENKATESH (venkatesh@mysupertax.com) already exists according to your records
-- If you need to create it anyway, uncomment the following:

/*
-- 2. PIDIKITI VENKATESH
INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at)
VALUES ('PIDIKITI VENKATESH', 'venkatesh@mysupertax.com', @password_hash, NOW(), NOW(), NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO employees (user_id, employee_code, department_id, job_title, join_date, contract_type, phone, address, status, created_at, updated_at)
VALUES (@user_id, CONCAT('EMP', LPAD(@user_id, 4, '0')), @department_id, 'Employee', NOW(), 'Full-time', '6302324944', 'SRI LAKSHMI BOYS PG, AMEERPET, BESIDE GURUDWAR SAHEB TEMPLE , 500016', 'active', NOW(), NOW());

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT id, 'App\\Models\\User', @user_id FROM roles WHERE name = 'Employee' LIMIT 1;
*/

SELECT 'User details:' as message, name, email FROM users WHERE email IN ('raveen@mysupertax.com', 'alekhya@mysupertax.com');