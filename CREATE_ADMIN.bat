@echo off
SET PGPASSWORD=Aa1234
echo ========================================
echo Connecting to PostgreSQL database...
echo ========================================
echo.

echo Step 1: Showing current users...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate -c "SELECT email, full_name, role FROM users LIMIT 10;"

echo.
echo Step 2: Updating admin users...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate -c "UPDATE users SET role = 'ADMIN', status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE LOWER(email) LIKE '%%admin%%';"

echo.
echo Step 3: Creating default admin if needed...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate -c "INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified, created_at, updated_at) SELECT gen_random_uuid(), 'admin@careermate.vn', '$2a$10$rN7aLbLWlH6/y1qQJqJ7OuGq6F/HJdGS1KQqZp7VFhXqaVD3H5emu', 'System Administrator', '0900000000', 'ADMIN', 'ACTIVE', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN');"

echo.
echo Step 4: Showing all ADMIN users...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate -c "SELECT email, full_name, role, status FROM users WHERE role = 'ADMIN';"

echo.
echo ========================================
echo DONE! Admin users updated successfully!
echo ========================================
echo.
echo Next step: Logout and login again with admin account
pause
