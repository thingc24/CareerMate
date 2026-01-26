@echo off
SET PGPASSWORD=Aa1234
echo ========================================
echo Creating sample packages in database...
echo ========================================
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate -f INSERT_SAMPLE_PACKAGES.sql

echo.
echo ========================================
echo DONE! Sample packages created!
echo ========================================
echo.
echo Now refresh your admin packages page!
pause
