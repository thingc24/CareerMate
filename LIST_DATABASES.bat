@echo off
SET PGPASSWORD=Aa1234
echo ========================================
echo Finding PostgreSQL Databases
echo ========================================
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -l

echo.
echo ========================================
pause
