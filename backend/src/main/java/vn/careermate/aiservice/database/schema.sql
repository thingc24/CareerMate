-- AI Service Database Schema
-- PostgreSQL Database - aiservice schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create aiservice schema if not exists
CREATE SCHEMA IF NOT EXISTS aiservice;
GRANT ALL PRIVILEGES ON SCHEMA aiservice TO postgres;

-- ============================================
-- AI CHAT CONVERSATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS aiservice.ai_chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    conversation_title VARCHAR(255),
    role VARCHAR(100), -- CAREER_COACH, CV_ADVISOR, INTERVIEW_PREP, etc.
    context TEXT, -- Additional context for the conversation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_student ON aiservice.ai_chat_conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_created ON aiservice.ai_chat_conversations(created_at);

-- AI Chat Messages
CREATE TABLE IF NOT EXISTS aiservice.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES aiservice.ai_chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'ASSISTANT', 'SYSTEM')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_conversation ON aiservice.ai_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created ON aiservice.ai_chat_messages(created_at);

-- ============================================
-- JOB RECOMMENDATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS aiservice.job_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    job_id UUID NOT NULL, -- References jobservice.jobs(id) - cross-schema reference
    match_score DECIMAL(5,2) NOT NULL, -- 0-100
    match_reason TEXT, -- Why this job was recommended
    skill_match JSONB, -- Skills matching details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_recommendations_student ON aiservice.job_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_job ON aiservice.job_recommendations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_score ON aiservice.job_recommendations(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_created ON aiservice.job_recommendations(created_at);

-- ============================================
-- CAREER ROADMAPS
-- ============================================

CREATE TABLE IF NOT EXISTS aiservice.career_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    career_goal VARCHAR(255) NOT NULL, -- Target job title or career path
    current_level VARCHAR(50), -- BEGINNER, INTERMEDIATE, ADVANCED
    target_level VARCHAR(50),
    roadmap_data JSONB, -- Steps, milestones, timeline
    skills_gap JSONB, -- Skills needed to reach goal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_career_roadmaps_student ON aiservice.career_roadmaps(student_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_created ON aiservice.career_roadmaps(created_at);

-- ============================================
-- MOCK INTERVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS aiservice.mock_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    job_id UUID NOT NULL, -- References jobservice.jobs(id) - cross-schema reference
    cv_id UUID, -- References userservice.cvs(id) - cross-schema reference
    status VARCHAR(50) DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    overall_score DECIMAL(5,2), -- Overall interview score
    feedback JSONB, -- Detailed feedback by category
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mock_interviews_student ON aiservice.mock_interviews(student_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_job ON aiservice.mock_interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_status ON aiservice.mock_interviews(status);

-- Mock Interview Questions
CREATE TABLE IF NOT EXISTS aiservice.mock_interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES aiservice.mock_interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50), -- TECHNICAL, BEHAVIORAL, SITUATIONAL, etc.
    student_answer TEXT,
    ai_feedback TEXT,
    score DECIMAL(5,2), -- Score for this question (0-10)
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mock_interview_questions_interview ON aiservice.mock_interview_questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_mock_interview_questions_order ON aiservice.mock_interview_questions(interview_id, order_index);
