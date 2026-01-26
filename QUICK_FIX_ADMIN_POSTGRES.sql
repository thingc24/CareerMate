-- =====================================================
-- CareerMate - Create Admin User (PostgreSQL)
-- Run this in pgAdmin 4 Query Tool
-- =====================================================

-- Step 1: Check existing admin users
SELECT id, email, full_name, role, status FROM users 
WHERE email = 'admin@careermate.vn' OR role = 'ADMIN';

-- Step 2: Create admin user if doesn't exist
-- Password: admin123 (bcrypt hash)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified, created_at, updated_at)
SELECT 
    gen_random_uuid(),                                                          -- PostgreSQL UUID function
    'admin@careermate.vn',
    '$2a$10$rN7aLbLWlH6/y1qQJqJ7OuGq6F/HJdGS1KQqZp7VFhXqaVD3H5emu',  -- bcrypt hash of 'admin123'
    'System Administrator',
    '0900000000',
    'ADMIN',
    'ACTIVE',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@careermate.vn'
);

-- Step 3: Update existing user to ADMIN role (if exists)
UPDATE users 
SET role = 'ADMIN', 
    status = 'ACTIVE',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@careermate.vn';

-- Step 4: Verify the admin user
SELECT id, email, full_name, role, status, created_at 
FROM users 
WHERE email = 'admin@careermate.vn';

-- Step 5: Success message (PostgreSQL style)
SELECT 
    'Admin user created/updated successfully!' as message,
    'admin@careermate.vn' as login_email,
    'admin123' as login_password;

-- Bonus: Show all admin users
SELECT email, full_name, role, status 
FROM users 
WHERE role = 'ADMIN'
ORDER BY created_at DESC;
