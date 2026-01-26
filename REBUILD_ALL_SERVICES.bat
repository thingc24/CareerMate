@echo off
echo ================================================================
echo CareerMate - Rebuild All Microservices
echo ================================================================
echo.

cd /d "%~dp0backend"

echo [1/8] Building Eureka Server...
cd microservices\eureka-server
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Eureka Server build failed!
    pause
    exit /b 1
)

echo.
echo [2/8] Building User Service...
cd ..\user-service
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: User Service build failed!
    pause
    exit /b 1
)

echo.
echo [3/8] Building Admin Service...
cd ..\admin-service
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Admin Service build failed!
    pause
    exit /b 1
)

echo.
echo [4/8] Building Job Service...
cd ..\job-service
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Job Service build failed!
    pause
    exit /b 1
)

echo.
echo [5/8] Building Content Service...
cd ..\content-service
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Content Service build failed!
    pause
    exit /b 1
)

echo.
echo [6/8] Building Notification Service...
cd ..\notification-service
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Notification Service build failed!
    pause
    exit /b 1
)

echo.
echo [7/8] Building Learning Service...
cd ..\learning-service
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Learning Service build failed!
    pause
    exit /b 1
)

echo.
echo [8/8] Building API Gateway...
cd ..\api-gateway
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: API Gateway build failed!
    pause
    exit /b 1
)

cd ..\..
echo.
echo ================================================================
echo All services built successfully!
echo ================================================================
echo.
echo IMPORTANT: Stop all running services and restart with CHAY_BACKEND.ps1
echo.
pause
