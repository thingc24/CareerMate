-- Add NEW_MESSAGE to notifications_type_check constraint
-- First, drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Recreate the constraint with NEW_MESSAGE added
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'ARTICLE_APPROVED',
    'ARTICLE_REJECTED',
    'ARTICLE_PENDING',
    'JOB_APPROVED',
    'JOB_REJECTED',
    'JOB_PENDING',
    'NEW_APPLICATION',
    'APPLICATION_STATUS_CHANGED',
    'JOB_RECOMMENDATION',
    'NEW_COMMENT',
    'NEW_REACTION',
    'INTERVIEW_SCHEDULED',
    'SYSTEM_ANNOUNCEMENT',
    'NEW_MESSAGE'
));
