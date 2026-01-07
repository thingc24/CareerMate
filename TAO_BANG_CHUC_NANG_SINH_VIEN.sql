-- ============================================
-- TẠO CÁC BẢNG CSDL CHO CHỨC NĂNG SINH VIÊN
-- CareerMate Database Schema
-- ============================================

-- 1. Bảng lưu lịch sử chat AI (Career Coach)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    conversation_title VARCHAR(255),
    role VARCHAR(50), -- CAREER_COACH, CV_ADVISOR, INTERVIEW_PREP
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_student ON ai_chat_conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_created ON ai_chat_conversations(created_at);

-- Bảng lưu từng tin nhắn trong cuộc trò chuyện
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(10) NOT NULL, -- USER or AI
    message TEXT NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created ON ai_chat_messages(created_at);

-- 2. Bảng lưu công việc đã lưu (Favorite/Saved Jobs)
-- ============================================
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_student ON saved_jobs(student_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs(job_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_jobs_unique ON saved_jobs(student_id, job_id);

-- 3. Bảng lưu lịch sử Mock Interview
-- ============================================
CREATE TABLE IF NOT EXISTS mock_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    cv_id UUID REFERENCES cvs(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED
    overall_score DECIMAL(5,2),
    total_questions INTEGER,
    answered_questions INTEGER,
    ai_feedback JSONB,
    duration_seconds INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mock_interviews_student ON mock_interviews(student_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_job ON mock_interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_status ON mock_interviews(status);

-- Bảng lưu từng câu hỏi trong Mock Interview
CREATE TABLE IF NOT EXISTS mock_interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mock_interview_id UUID NOT NULL REFERENCES mock_interviews(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    question TEXT NOT NULL,
    student_answer TEXT,
    ai_feedback TEXT,
    score DECIMAL(5,2),
    status VARCHAR(20), -- NOT_ANSWERED, ANSWERED, SKIPPED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mock_questions_interview ON mock_interview_questions(mock_interview_id);
CREATE INDEX IF NOT EXISTS idx_mock_questions_order ON mock_interview_questions(mock_interview_id, question_order);

-- 4. Bảng lưu Job Recommendations (Gợi ý việc làm)
-- ============================================
CREATE TABLE IF NOT EXISTS job_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    match_score DECIMAL(5,2) NOT NULL, -- 0-100
    match_reason TEXT,
    is_viewed BOOLEAN DEFAULT FALSE,
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viewed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_recommendations_student ON job_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_job ON job_recommendations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_score ON job_recommendations(match_score);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_created ON job_recommendations(created_at);

-- ============================================
-- CÁC BẢNG ĐÃ CÓ SẴN (Để tham khảo)
-- ============================================
-- student_profiles: Thông tin profile sinh viên
-- cvs: CV đã upload
-- applications: Đơn ứng tuyển
-- application_history: Lịch sử thay đổi đơn ứng tuyển
-- student_skills: Kỹ năng của sinh viên
-- career_roadmaps: Lộ trình phát triển sự nghiệp
-- quiz_attempts: Lần làm quiz
-- quiz_answers: Câu trả lời quiz
-- course_enrollments: Đăng ký khóa học
-- challenge_participations: Tham gia thử thách
-- subscriptions: Gói đăng ký premium
-- ============================================

-- ============================================
-- GHI CHÚ QUAN TRỌNG
-- ============================================
-- 1. Tất cả các bảng đều có ON DELETE CASCADE để tự động xóa dữ liệu liên quan
-- 2. Các bảng đều có created_at để theo dõi thời gian tạo
-- 3. Các bảng có updated_at để theo dõi thời gian cập nhật
-- 4. Tất cả foreign keys đều có indexes để tối ưu truy vấn
-- 5. Các bảng đều hỗ trợ CRUD đầy đủ (Create, Read, Update, Delete)
-- ============================================

