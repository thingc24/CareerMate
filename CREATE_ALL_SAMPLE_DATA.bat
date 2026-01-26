@echo off
SET PGPASSWORD=Aa1234
echo ========================================
echo Inserting ALL Sample Data into Database
echo ========================================
echo.
echo This will create:
echo - 3 Packages
echo - 3 CV Templates  
echo - 15 Users (10 students + 5 recruiters)
echo - 5 Companies
echo - 4 Jobs
echo - 3 Articles
echo.
echo Enter database name (default: careermate):
set /p DBNAME="Database name: "
if "%DBNAME%"=="" set DBNAME=careermate

echo.
echo Inserting data into %DBNAME%...
echo ========================================
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d %DBNAME% -f INSERT_ALL_SAMPLE_DATA.sql

echo.
echo ========================================
echo DONE! Sample data inserted!
echo ========================================
echo.
echo Now refresh your admin pages:
echo - Packages: http://localhost:5173/admin/packages
echo - Users: http://localhost:5173/admin/users
echo - Jobs: http://localhost:5173/admin/jobs
echo - Articles: http://localhost:5173/admin/articles
echo - CV Templates: http://localhost:5173/admin/cv-templates
echo.
pause
