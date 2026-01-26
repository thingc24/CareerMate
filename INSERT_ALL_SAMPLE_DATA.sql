-- ============================================================================
-- COMPREHENSIVE SAMPLE DATA FOR ALL ADMIN FEATURES
-- Run this in pgAdmin 4 to populate all admin-managed entities
-- ============================================================================

-- NOTE: Replace 'your_database_name' if different from 'careermate'
-- Database: careermate

-- ============================================================================
-- 1. PACKAGES (Gói Dịch Vụ)
-- ============================================================================

INSERT INTO packages (id, name, description, price, duration_days, features, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Gói Cơ Bản', 'Gói dịch vụ cơ bản cho sinh viên mới bắt đầu tìm việc', 99000, 30, 
   ARRAY['Xem 50 tin tuyển dụng/tháng', 'Ứng tuyển không giới hạn', 'Tạo 1 CV', 'Hỗ trợ email'], 
   true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Gói Tiêu Chuẩn', 'Gói phổ biến nhất với đầy đủ tính năng cơ bản', 199000, 90, 
   ARRAY['Xem tin tuyển dụng không giới hạn', 'Ứng tuyển không giới hạn', 'Tạo 5 CV', 'Phân tích CV với AI', 'Gợi ý việc làm', 'Hỗ trợ ưu tiên'], 
   true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Gói Premium', 'Gói cao cấp với tất cả tính năng và hỗ trợ VIP', 499000, 365, 
   ARRAY['Tất cả tính năng gói Tiêu Chuẩn', 'Tạo CV không giới hạn', 'Lộ trình nghề nghiệp cá nhân hóa', 'Khóa học trực tuyến miễn phí', 'Ưu tiên hiển thị hồ sơ', 'Hỗ trợ 24/7', 'Tư vấn nghề nghiệp 1-1'], 
   true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ============================================================================  
-- 2. CV TEMPLATES  
-- ============================================================================

INSERT INTO cv_templates (id, name, description, template_data, thumbnail_url, category, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Modern Professional', 'Template hiện đại phù hợp với mọi ngành nghề', 
   '{"sections": ["header", "experience", "education", "skills"], "layout": "two-column"}', 
   NULL, 'PROFESSIONAL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Creative Designer', 'Template sáng tạo cho designer và creative', 
   '{"sections": ["header", "portfolio", "experience", "skills"], "layout": "creative"}', 
   NULL, 'CREATIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Tech Resume', 'Template tối giản cho lập trình viên', 
   '{"sections": ["header", "technical_skills", "projects", "experience"], "layout": "minimal"}', 
   NULL, 'TECHNICAL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. SAMPLE USERS (Sinh viên và Nhà tuyển dụng)
-- ============================================================================

-- Insert sample students (10 students)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'student' || generate_series || '@example.com',
  '$2a$10$rN7aLbLWlH6/y1qQJqJ7OuGq6F/HJdGS1KQqZp7VFhXqaVD3H5emu', -- password: admin123
  'Sinh viên ' || generate_series,
  '090000' || LPAD(generate_series::text, 4, '0'),
  'STUDENT',
  'ACTIVE',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM generate_series(1, 10)
ON CONFLICT (email) DO NOTHING;

-- Insert sample recruiters (5 recruiters)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'recruiter' || generate_series || '@company.com',
  '$2a$10$rN7aLbLWlH6/y1qQJqJ7OuGq6F/HJdGS1KQqZp7VFhXqaVD3H5emu',
  'Nhà tuyển dụng ' || generate_series,
  '091000' || LPAD(generate_series::text, 4, '0'),
  'RECRUITER',
  'ACTIVE',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM generate_series(1, 5)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 4. COMPANIES
-- ============================================================================

INSERT INTO companies (id, name, description, industry, location, logo_url, website, employee_count, is_verified, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'FPT Software', 'Công ty phần mềm hàng đầu Việt Nam', 'Công nghệ thông tin', 'Hà Nội, Việt Nam', 
   NULL, 'https://fptsoftware.com', '20000+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Viettel Solutions', 'Giải pháp CNTT của Tập đoàn Viettel', 'Viễn thông', 'Hà Nội, Việt Nam', 
   NULL, 'https://www.viettelsolutions.vn', '5000+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'VNG Corporation', 'Tập đoàn công nghệ hàng đầu VN', 'Game & Social Media', 'TP.HCM, Việt Nam', 
   NULL, 'https://www.vng.com.vn', '3000+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Shopee Vietnam', 'Sàn thương mại điện tử số 1', 'E-commerce', 'TP.HCM, Việt Nam', 
   NULL, 'https://shopee.vn', '2000+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Tiki Corporation', 'Sàn TMĐT phát triển nhanh nhất VN', 'E-commerce', 'TP.HCM, Việt Nam', 
   NULL, 'https://tiki.vn', '1000+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. JOBS (Tin tuyển dụng)
-- ============================================================================

-- Get sample company IDs for job insertion
DO $$
DECLARE
  company_id1 UUID;
  company_id2 UUID;
BEGIN
  SELECT id INTO company_id1 FROM companies WHERE name = 'FPT Software' LIMIT 1;
  SELECT id INTO company_id2 FROM companies WHERE name = 'VNG Corporation' LIMIT 1;
  
  IF company_id1 IS NOT NULL THEN
    INSERT INTO jobs (id, company_id, title, description, requirements, benefits, location, job_type, experience_level, salary_min, salary_max, status, created_at, updated_at, expires_at)
    VALUES
      (gen_random_uuid(), company_id1, 'Java Backend Developer', 
       'Phát triển hệ thống backend với Spring Boot', 
       'Java, Spring Boot, Microservices, PostgreSQL', 
       'Lương cạnh tranh, Bảo hiểm đầy đủ, Du lịch hàng năm', 
       'Hà Nội', 'FULL_TIME', 'MID_LEVEL', 15000000, 25000000, 'ACTIVE', 
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days'),
       
      (gen_random_uuid(), company_id1, 'Frontend Developer (React)', 
       'Phát triển giao diện người dùng với React', 
       'React.js, TypeScript, TailwindCSS, RESTful API', 
       'Flexible working hours, Laptop provided, Learning budget', 
       'Hà Nội', 'FULL_TIME', 'JUNIOR', 10000000, 18000000, 'ACTIVE', 
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days');
  END IF;
  
  IF company_id2 IS NOT NULL THEN
    INSERT INTO jobs (id, company_id, title, description, requirements, benefits, location, job_type, experience_level, salary_min, salary_max, status, created_at, updated_at, expires_at)
    VALUES
      (gen_random_uuid(), company_id2, 'Mobile Developer (Flutter)', 
       'Phát triển ứng dụng mobile đa nền tảng', 
       'Flutter, Dart, Firebase, RESTful API', 
       'Competitive salary, 13th month salary, Annual bonus', 
       'TP.HCM', 'FULL_TIME', 'MID_LEVEL', 18000000, 30000000, 'ACTIVE', 
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '45 days'),
       
      (gen_random_uuid(), company_id2, 'DevOps Engineer', 
       'Xây dựng và vận hành hệ thống CI/CD', 
       'Docker, Kubernetes, AWS, Jenkins, Linux', 
       'Remote working option, Top salary, Stock options', 
       'TP.HCM', 'FULL_TIME', 'SENIOR', 25000000, 40000000, 'ACTIVE', 
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '60 days');
  END IF;
END $$;

-- ============================================================================
-- 6. ARTICLES (Bài viết)
-- ============================================================================

-- Get sample author (admin or recruiter)
DO $$
DECLARE
  author_id UUID;
BEGIN
  SELECT id INTO author_id FROM users WHERE email = 'admin@careermate.vn' LIMIT 1;
  
  IF author_id IS NOT NULL THEN
    INSERT INTO articles (id, title, content, summary, author_id, thumbnail_url, category, tags, status, is_published, created_at, updated_at)
    VALUES
      (gen_random_uuid(), '10 Kỹ năng mềm quan trọng khi đi làm', 
       '<p>Kỹ năng mềm đóng vai trò rất quan trọng trong công việc...</p>',
       'Tìm hiểu 10 kỹ năng mềm thiết yếu mà mọi sinh viên cần có',
       author_id, NULL, 'CAREER_TIPS', 
       ARRAY['soft skills', 'career', 'tips'], 
       'PUBLISHED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       
      (gen_random_uuid(), 'Cách viết CV thu hút nhà tuyển dụng', 
       '<p>Một CV tốt có thể giúp bạn nổi bật giữa hàng trăm ứng viên...</p>',
       'Hướng dẫn chi tiết cách viết CV chuyên nghiệp',
       author_id, NULL, 'CV_TIPS', 
       ARRAY['CV', 'resume', 'job application'], 
       'PUBLISHED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       
      (gen_random_uuid(), 'Xu hướng ngành công nghệ 2026', 
       '<p>Năm 2026 sẽ chứng kiến sự bùng nổ của AI và Machine Learning...</p>',
       'Phân tích xu hướng công nghệ mới nhất năm 2026',
       author_id, NULL, 'INDUSTRY_NEWS', 
       ARRAY['technology', 'trends', 'AI'], 
       'PUBLISHED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check inserted data
SELECT 'Packages' as table_name, COUNT(*) as count FROM packages
UNION ALL
SELECT 'CV Templates', COUNT(*) FROM cv_templates
UNION ALL
SELECT 'Users', COUNT(*) FROM users WHERE role != 'ADMIN'
UNION ALL
SELECT 'Companies', COUNT(*) FROM companies
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'Articles', COUNT(*) FROM articles
ORDER BY table_name;

-- Success message
SELECT '✅ All sample data inserted successfully!' as message;
