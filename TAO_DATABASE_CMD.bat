@echo off
REM Script tạo database CareerMate trong CMD
REM Chạy file này trong thư mục CareerMate

echo ========================================
echo Tạo Database CareerMate
echo ========================================
echo.

REM Đường dẫn đến psql.exe
set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"

REM Thông tin kết nối
set DB_HOST=127.0.0.1
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=postgres

echo Bước 1: Tạo database careermate_db...
%PSQL_PATH% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f TAO_DATABASE.sql
if %ERRORLEVEL% NEQ 0 (
    echo Lỗi khi tạo database!
    pause
    exit /b 1
)

echo.
echo Bước 2: Tạo các bảng chức năng sinh viên...
%PSQL_PATH% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d careermate_db -f TAO_BANG_CHUC_NANG_SINH_VIEN.sql
if %ERRORLEVEL% NEQ 0 (
    echo Lỗi khi tạo bảng chức năng sinh viên!
    pause
    exit /b 1
)

echo.
echo Bước 3: Tạo các bảng Quiz...
%PSQL_PATH% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d careermate_db -f backend\database\quiz_schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo Lỗi khi tạo bảng Quiz!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Hoàn thành! Database đã được tạo thành công.
echo ========================================
pause
