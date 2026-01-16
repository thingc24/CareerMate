-- Notification Service Database Schema
-- PostgreSQL Database - notificationservice schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create notificationservice schema if not exists
CREATE SCHEMA IF NOT EXISTS notificationservice;
GRANT ALL PRIVILEGES ON SCHEMA notificationservice TO postgres;

-- Notifications table
CREATE TABLE IF NOT EXISTS notificationservice.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References userservice.users(id) - cross-schema reference
    title VARCHAR(500) NOT NULL,
    message VARCHAR(1000),
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'ARTICLE_APPROVED', 'ARTICLE_REJECTED', 'ARTICLE_PENDING',
        'JOB_APPROVED', 'JOB_REJECTED', 'JOB_PENDING',
        'NEW_APPLICATION', 'APPLICATION_STATUS_CHANGED', 'JOB_RECOMMENDATION',
        'NEW_COMMENT', 'NEW_REACTION', 'INTERVIEW_SCHEDULED',
        'SYSTEM_ANNOUNCEMENT', 'NEW_MESSAGE'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD' CHECK (status IN ('UNREAD', 'READ')),
    link_url VARCHAR(500),
    related_entity_type VARCHAR(100),
    related_entity_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notificationservice.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notificationservice.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notificationservice.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notificationservice.notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notificationservice.notifications(type);

COMMENT ON TABLE notificationservice.notifications IS 'Stores user notifications for various events';
COMMENT ON COLUMN notificationservice.notifications.type IS 'Type of notification: ARTICLE_APPROVED, JOB_APPROVED, NEW_APPLICATION, etc.';
COMMENT ON COLUMN notificationservice.notifications.status IS 'UNREAD or READ';
COMMENT ON COLUMN notificationservice.notifications.link_url IS 'URL to navigate to related page';
COMMENT ON COLUMN notificationservice.notifications.related_entity_type IS 'Type of related entity: ARTICLE, JOB, APPLICATION, etc.';
COMMENT ON COLUMN notificationservice.notifications.related_entity_id IS 'ID of related entity';
