-- Script tạo database cho CareerMate
-- Chạy trong pgAdmin hoặc psql

-- Kết nối với PostgreSQL (port 5433)
-- psql -U postgres -p 5433

-- Tạo database
CREATE DATABASE careermate_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Vietnamese_Vietnam.1258'
    LC_CTYPE = 'Vietnamese_Vietnam.1258'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Kiểm tra database đã tạo
\l

-- Kết nối vào database
\c careermate_db

-- Kiểm tra kết nối
SELECT version();

