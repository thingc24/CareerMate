-- =====================================================
-- AUTO-FIX: Tự động tìm và update admin users
-- Chạy script này trong pgAdmin 4
-- =====================================================

-- Bước 1: Hiển thị TẤT CẢ users hiện có
SELECT id, email, full_name, role, status, created_at 
FROM users 
ORDER BY created_at 
LIMIT 20;

-- Bước 2: Update TẤT CẢ users có email chứa 'admin' thành ADMIN
UPDATE users 
SET role = 'ADMIN', 
    status = 'ACTIVE',
    updated_at = CURRENT_TIMESTAMP
WHERE LOWER(email) LIKE '%admin%';

-- Bước 3: Hiển thị kết quả - tất cả ADMIN users
SELECT id, email, full_name, role, status 
FROM users 
WHERE role = 'ADMIN';

-- Bước 4: Nếu KHÔNG CÓ admin nào, tạo user mặc định
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'admin@careermate.vn',
    '$2a$10$rN7aLbLWlH6/y1qQJqJ7OuGq6F/HJdGS1KQqZp7VFhXqaVD3H5emu',
    'System Administrator',
    '0900000000',
    'ADMIN',
    'ACTIVE',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'ADMIN'
);

-- Bước 5: KẾT QUẢ CUỐI CÙNG - Hiển thị tất cả admin users
SELECT 
    '✅ Script hoàn thành!' as status,
    COUNT(*) as total_admins
FROM users 
WHERE role = 'ADMIN';

SELECT email, full_name, role, status 
FROM users 
WHERE role = 'ADMIN'
ORDER BY created_at;
