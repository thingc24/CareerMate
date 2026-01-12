-- Script tạo database cho CareerMate
-- Chạy trong pgAdmin hoặc psql
-- Lệnh chạy: psql -h 127.0.0.1 -p 5432 -U postgres -d postgres -f TAO_DATABASE.sql

-- Tạo database
CREATE DATABASE careermate_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

