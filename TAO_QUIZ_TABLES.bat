@echo off
REM Script tạo các bảng Quiz
REM Chạy file này trong thư mục CareerMate

echo ========================================
echo Tạo các bảng Quiz
echo ========================================
echo.

REM Đường dẫn đến psql.exe
set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"

REM Thông tin kết nối
set DB_HOST=127.0.0.1
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=careermate_db

echo Đang tạo các bảng Quiz...
%PSQL_PATH% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f backend\database\quiz_schema.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Lỗi khi tạo bảng Quiz!
    echo Vui lòng kiểm tra:
    echo 1. Database careermate_db đã tồn tại chưa
    echo 2. File backend\database\quiz_schema.sql có tồn tại không
    echo 3. Password đúng chưa (Aa1234)
    pause
    exit /b 1
)

echo.
echo ========================================
echo Hoàn thành! Đã tạo các bảng Quiz.
echo ========================================
echo.
echo Kiểm tra các bảng đã tạo:
%PSQL_PATH% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'quiz%' ORDER BY table_name;"

pause
