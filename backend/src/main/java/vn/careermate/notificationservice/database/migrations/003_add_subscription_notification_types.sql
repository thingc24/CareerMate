-- Migration: Add subscription-related notification types
-- Update notifications table constraint to include subscription types

ALTER TABLE notificationservice.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notificationservice.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'ARTICLE_APPROVED', 'ARTICLE_REJECTED', 'ARTICLE_PENDING',
    'JOB_APPROVED', 'JOB_REJECTED', 'JOB_PENDING',
    'NEW_APPLICATION', 'APPLICATION_STATUS_CHANGED', 'JOB_RECOMMENDATION',
    'NEW_COMMENT', 'NEW_REACTION', 'INTERVIEW_SCHEDULED',
    'SYSTEM_ANNOUNCEMENT', 'NEW_MESSAGE',
    'SUBSCRIPTION_REQUEST', 'SUBSCRIPTION_APPROVED', 'SUBSCRIPTION_REJECTED'
));
