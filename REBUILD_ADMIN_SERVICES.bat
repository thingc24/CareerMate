@echo off
echo ========================================
echo Rebuilding Admin and Common Services
echo ========================================
echo.
echo This will rebuild:
echo - common module (with new DTOs)  
echo - admin-service (with updated controller)
echo.
echo Please wait, this may take 2-3 minutes...
echo.

cd backend

echo [1/2] Rebuilding common module...
call mvnw.cmd -pl microservices/common clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Failed to rebuild common module!
    cd ..
    pause
    exit /b 1
)

echo.
echo [2/2] Rebuilding admin-service...
call mvnw.cmd -pl microservices/admin-service clean install -DskipTests  
if errorlevel 1 (
    echo ERROR: Failed to rebuild admin-service!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo BUILD SUCCESSFUL!
echo ========================================
echo.
echo Next steps:
echo 1. STOP all running CHAY_BACKEND.ps1 terminals
echo 2. Run .\CHAY_BACKEND.ps1 again
echo 3. Test admin pages - packages should work now!
echo.
pause

