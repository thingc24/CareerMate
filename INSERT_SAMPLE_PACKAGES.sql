-- ===================================================
-- Insert Sample Packages for Testing
-- ===================================================

-- Clear existing packages (optional, comment out if you want to keep existing data)
-- DELETE FROM packages;

-- Insert 3 sample packages
INSERT INTO packages (id, name, description, price, duration_days, features, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 
   'Gói Cơ Bản', 
   'Gói dịch vụ cơ bản cho sinh viên mới bắt đầu tìm việc', 
   99000, 
   30, 
   ARRAY['Xem 50 tin tuyển dụng/tháng', 'Ứng tuyển không giới hạn', 'Tạo 1 CV', 'Hỗ trợ email'], 
   true, 
   CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 
   'Gói Tiêu Chuẩn', 
   'Gói phổ biến nhất với đầy đủ tính năng cơ bản', 
   199000, 
   90, 
   ARRAY['Xem tin tuyển dụng không giới hạn', 'Ứng tuyển không giới hạn', 'Tạo 5 CV', 'Phân tích CV với AI', 'Gợi ý việc làm', 'Hỗ trợ ưu tiên'], 
   true, 
   CURRENT_TIMESTAMP, 
   CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 
   'Gói Premium', 
   'Gói cao cấp với tất cả tính năng và hỗ trợ VIP', 
   499000, 
   365, 
   ARRAY['Tất cả tính năng gói Tiêu Chuẩn', 'Tạo CV không giới hạn', 'Lộ trình nghề nghiệp cá nhân hóa', 'Khóa học trực tuyến miễn phí', 'Ưu tiên hiển thị hồ sơ', 'Hỗ trợ 24/7', 'Tư vấn nghề nghiệp 1-1'], 
   true, 
   CURRENT_TIMESTAMP, 
   CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Verify inserted packages
SELECT id, name, price, duration_days, is_active FROM packages ORDER BY price;

-- Success message
SELECT 
  COUNT(*) as total_packages,
  '✅ Sample packages created successfully!' as message
FROM packages;
