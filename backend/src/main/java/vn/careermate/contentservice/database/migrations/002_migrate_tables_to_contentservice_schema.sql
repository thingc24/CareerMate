-- Migration script to move Content Service tables from public schema to contentservice schema
-- This script moves all tables related to Content Service

-- Step 1: Move Content Service tables to contentservice schema
ALTER TABLE IF EXISTS companies SET SCHEMA contentservice;
ALTER TABLE IF EXISTS company_ratings SET SCHEMA contentservice;
ALTER TABLE IF EXISTS articles SET SCHEMA contentservice;
ALTER TABLE IF EXISTS article_reactions SET SCHEMA contentservice;
ALTER TABLE IF EXISTS article_comments SET SCHEMA contentservice;

-- Note: Foreign keys will be automatically updated by PostgreSQL
-- Tables that reference contentservice tables from other schemas need to use fully qualified names
