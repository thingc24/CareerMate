-- ============================================
-- CẬP NHẬT BẢNG student_profiles
-- Thêm cột avatar_url để lưu ảnh đại diện
-- ============================================

-- Thêm cột avatar_url nếu chưa có
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Tạo index cho avatar_url (nếu cần)
-- CREATE INDEX IF NOT EXISTS idx_student_profiles_avatar ON student_profiles(avatar_url) WHERE avatar_url IS NOT NULL;

-- ============================================
-- GHI CHÚ
-- ============================================
-- Cột avatar_url sẽ lưu đường dẫn file ảnh đại diện
-- File được lưu trong thư mục uploads/avatars/
-- ============================================

