@echo off
SET PGPASSWORD=Aa1234
echo ========================================
echo Checking Admin Users in Database
echo ========================================
echo.

echo Listing all databases...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;"

echo.
echo ========================================
echo Enter database name (default: careermate):
set /p DBNAME="Database name: "
if "%DBNAME%"=="" set DBNAME=careermate

echo.
echo Querying admin users from database: %DBNAME%
echo ========================================
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d %DBNAME% -c "SELECT email, full_name, role, status FROM users WHERE role = 'ADMIN' OR LOWER(email) LIKE '%%admin%%';"

echo.
echo ========================================
echo ADMIN LOGIN INFO:
echo ========================================
echo Email: admin@careermate.vn
echo Password: admin123
echo ========================================
pause
