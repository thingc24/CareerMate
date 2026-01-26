-- Quick fix: Create or update admin user
-- Run this in phpMyAdmin or MySQL Workbench

USE careermate;

-- Step 1: Check current admin users
SELECT id, email, full_name, role FROM users WHERE email = 'admin@careermate.vn' OR role = 'ADMIN';

-- Step 2: Create new admin user if doesn't exist
-- Password: admin123 (bcrypt hash below)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified, created_at, updated_at)
SELECT 
    UUID(),
    'admin@careermate.vn',
    '$2a$10$rN7aLbLWlH6/y1qQJqJ7OuGq6F/HJdGS1KQqZp7VFhXqaVD3H5emu',
    'System Administrator',
    '0900000000',
    'ADMIN',
    'ACTIVE',
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@careermate.vn'
);

-- Step 3: Update existing user to ADMIN if exists
UPDATE users 
SET role = 'ADMIN', status = 'ACTIVE'
WHERE email = 'admin@careermate.vn';

-- Step 4: Verify the admin user
SELECT id, email, full_name, role, status, created_at FROM users WHERE email = 'admin@careermate.vn';

-- Success message
SELECT 'Admin user created/updated successfully!' as message,
       'Email: admin@careermate.vn' as login_email,
       'Password: admin123' as login_password;
