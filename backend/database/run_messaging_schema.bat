@echo off
echo Running messaging schema migration...
cd /d "%~dp0"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d careermate -f messaging_schema.sql
pause
