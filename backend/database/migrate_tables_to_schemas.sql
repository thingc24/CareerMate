-- Migration script to move tables from public schema to service-specific schemas
-- WARNING: This will affect all existing queries. Test in development first!

-- Step 1: Move User Service tables to userservice schema
-- ALTER TABLE users SET SCHEMA userservice;
-- ALTER TABLE student_profiles SET SCHEMA userservice;
-- ALTER TABLE recruiter_profiles SET SCHEMA userservice;
-- ALTER TABLE cvs SET SCHEMA userservice;
-- ALTER TABLE conversations SET SCHEMA userservice;
-- ALTER TABLE messages SET SCHEMA userservice;
-- ALTER TABLE student_skills SET SCHEMA userservice;

-- Step 2: Move Job Service tables to jobservice schema
-- ALTER TABLE jobs SET SCHEMA jobservice;
-- ALTER TABLE applications SET SCHEMA jobservice;
-- ALTER TABLE application_history SET SCHEMA jobservice;
-- ALTER TABLE saved_jobs SET SCHEMA jobservice;
-- ALTER TABLE job_skills SET SCHEMA jobservice;

-- Step 3: Move Learning Service tables to learningservice schema
-- ALTER TABLE cv_templates SET SCHEMA learningservice;
-- ALTER TABLE courses SET SCHEMA learningservice;
-- ALTER TABLE course_modules SET SCHEMA learningservice;
-- ALTER TABLE lessons SET SCHEMA learningservice;
-- ALTER TABLE course_enrollments SET SCHEMA learningservice;
-- ALTER TABLE lesson_progress SET SCHEMA learningservice;
-- ALTER TABLE quizzes SET SCHEMA learningservice;
-- ALTER TABLE quiz_questions SET SCHEMA learningservice;
-- ALTER TABLE quiz_attempts SET SCHEMA learningservice;
-- ALTER TABLE quiz_answers SET SCHEMA learningservice;
-- ALTER TABLE challenges SET SCHEMA learningservice;
-- ALTER TABLE challenge_participations SET SCHEMA learningservice;
-- ALTER TABLE badges SET SCHEMA learningservice;
-- ALTER TABLE student_badges SET SCHEMA learningservice;
-- ALTER TABLE packages SET SCHEMA learningservice;
-- ALTER TABLE subscriptions SET SCHEMA learningservice;

-- Step 4: Move Content Service tables to contentservice schema
-- ALTER TABLE companies SET SCHEMA contentservice;
-- ALTER TABLE company_ratings SET SCHEMA contentservice;
-- ALTER TABLE articles SET SCHEMA contentservice;
-- ALTER TABLE article_reactions SET SCHEMA contentservice;
-- ALTER TABLE article_comments SET SCHEMA contentservice;

-- Step 5: Move AI Service tables to aiservice schema
-- ALTER TABLE ai_chat_conversations SET SCHEMA aiservice;
-- ALTER TABLE ai_chat_messages SET SCHEMA aiservice;
-- ALTER TABLE job_recommendations SET SCHEMA aiservice;
-- ALTER TABLE career_roadmaps SET SCHEMA aiservice;
-- ALTER TABLE mock_interviews SET SCHEMA aiservice;
-- ALTER TABLE mock_interview_questions SET SCHEMA aiservice;

-- Step 6: Move Notification Service tables to notificationservice schema
-- ALTER TABLE notifications SET SCHEMA notificationservice;

-- Note: After moving tables, you need to:
-- 1. Update JPA entities with @Table(schema = "...")
-- 2. Update all SQL queries to include schema names
-- 3. Update foreign key constraints if they reference tables in different schemas
-- 4. Test all endpoints to ensure they still work

-- This script is commented out for safety. Uncomment when ready to migrate.
