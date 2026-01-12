@echo off
REM Script kiểm tra database và các bảng
REM Chạy file này trong thư mục CareerMate

echo ========================================
echo Kiểm tra Database CareerMate
echo ========================================
echo.

REM Đường dẫn đến psql.exe
set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"

REM Thông tin kết nối
set DB_HOST=127.0.0.1
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=careermate_db

echo Kiểm tra các bảng quiz...
%PSQL_PATH% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "\dt quiz*"

echo.
echo Kiểm tra tất cả các bảng...
%PSQL_PATH% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "\dt"

echo.
echo Kiểm tra số lượng bảng quiz...
%PSQL_PATH% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'quiz%';"

echo.
pause
