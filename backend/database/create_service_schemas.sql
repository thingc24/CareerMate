-- Create PostgreSQL schemas for microservices separation
-- This allows logical separation while keeping the same database

-- Create schemas for each service
CREATE SCHEMA IF NOT EXISTS userservice;
CREATE SCHEMA IF NOT EXISTS jobservice;
CREATE SCHEMA IF NOT EXISTS learningservice;
CREATE SCHEMA IF NOT EXISTS contentservice;
CREATE SCHEMA IF NOT EXISTS aiservice;
CREATE SCHEMA IF NOT EXISTS notificationservice;

-- Grant permissions to postgres user
GRANT ALL ON SCHEMA userservice TO postgres;
GRANT ALL ON SCHEMA jobservice TO postgres;
GRANT ALL ON SCHEMA learningservice TO postgres;
GRANT ALL ON SCHEMA contentservice TO postgres;
GRANT ALL ON SCHEMA aiservice TO postgres;
GRANT ALL ON SCHEMA notificationservice TO postgres;

-- Note: Tables will be moved to schemas later via migration scripts
-- For now, tables remain in public schema for backward compatibility
