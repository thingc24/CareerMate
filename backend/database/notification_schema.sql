-- Notification Service Schema
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    message VARCHAR(1000),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    link_url VARCHAR(500),
    related_entity_type VARCHAR(100),
    related_entity_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);

COMMENT ON TABLE notifications IS 'Stores user notifications for various events';
COMMENT ON COLUMN notifications.type IS 'ARTICLE_APPROVED, JOB_APPROVED, NEW_APPLICATION, etc.';
COMMENT ON COLUMN notifications.status IS 'UNREAD or READ';
COMMENT ON COLUMN notifications.link_url IS 'URL to navigate to related page';
COMMENT ON COLUMN notifications.related_entity_type IS 'Type of related entity: ARTICLE, JOB, APPLICATION, etc.';
COMMENT ON COLUMN notifications.related_entity_id IS 'ID of related entity';
