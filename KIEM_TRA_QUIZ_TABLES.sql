-- Script kiểm tra các bảng quiz
-- Chạy: psql -h 127.0.0.1 -p 5432 -U postgres -d careermate_db -f KIEM_TRA_QUIZ_TABLES.sql

-- Kiểm tra các bảng quiz có tồn tại không
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('quizzes', 'quiz_questions', 'quiz_attempts', 'quiz_answers') 
        THEN '✓ Có'
        ELSE '✗ Thiếu'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'quiz%'
ORDER BY table_name;

-- Đếm số bảng quiz
SELECT COUNT(*) as total_quiz_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'quiz%';

-- Kiểm tra cấu trúc bảng quizzes (nếu tồn tại)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'quizzes'
ORDER BY ordinal_position;
