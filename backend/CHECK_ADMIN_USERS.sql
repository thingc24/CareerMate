-- ===================================================================
-- CareerMate - Admin User Check and Fix Script
-- Purpose: Verify and fix admin users who should have ADMIN role
-- ===================================================================

-- 1. CHECK CURRENT ADMIN USERS
SELECT id, email, full_name, role, status, created_at
FROM users
WHERE role = 'ADMIN'
ORDER BY created_at DESC;

-- 2. CHECK IF THERE ARE ANY ADMIN USERS AT ALL
SELECT COUNT(*) as admin_count
FROM users  
WHERE role = 'ADMIN';

-- 3. CHECK ALL USERS AND THEIR ROLES
SELECT id, email, full_name, role, status
FROM users
ORDER BY created_at DESC
LIMIT 20;

-- 4. IF NO ADMIN EXISTS, CREATE ONE
-- Uncomment and modify the email/password as needed:
/*
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified, created_at, updated_at)
VALUES (
    UUID(),
    'admin@careermate.vn',
    '$2a$10$YourBcryptHashedPasswordHere',  -- Use bcrypt to hash 'admin123'
    'System Administrator',
    '0900000000',
    'ADMIN',
    'ACTIVE',
    TRUE,
    NOW(),
    NOW()
);
*/

-- 5. UPDATE EXISTING USER TO ADMIN (if you have a specific user)
-- Replace 'your@email.com' with the actual email
/*
UPDATE users
SET role = 'ADMIN', status = 'ACTIVE'
WHERE email = 'your@email.com';
*/

-- 6. VERIFY THE UPDATE
SELECT id, email, full_name, role, status
FROM users
WHERE email LIKE '%admin%' OR role = 'ADMIN';

-- ===================================================================
-- IMPORTANT NOTES:
-- - Password hash shown is just placeholder
-- - Use a bcrypt online tool or backend to generate proper hash
-- - Default password 'admin123' hash in bcrypt:
--   $2a$10$rN7aLbLWlH6/y1qQJqJ7OuGq6F/HJdGS1KQqZp7VFhXqaVD3H5emu
-- ===================================================================
