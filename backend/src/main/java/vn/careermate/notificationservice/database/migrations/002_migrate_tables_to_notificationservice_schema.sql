-- Migration script to move Notification Service tables from public schema to notificationservice schema
-- This script moves all tables related to Notification Service

-- Step 1: Move Notification Service tables to notificationservice schema
ALTER TABLE IF EXISTS notifications SET SCHEMA notificationservice;

-- Note: Foreign keys will be automatically updated by PostgreSQL
-- Tables that reference notificationservice tables from other schemas need to use fully qualified names
