@echo off
echo === Starting CareerMate Backend ===
echo.

REM Set JAVA_HOME
set "JAVA_HOME=C:\Program Files\Java\jdk-23"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo JAVA_HOME: %JAVA_HOME%
echo.

REM Check if Maven is installed
where mvn >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Maven found! Starting Spring Boot...
    echo.
    mvn spring-boot:run
) else (
    echo ERROR: Maven is not installed!
    echo.
    echo Please install Maven:
    echo 1. Download from: https://maven.apache.org/download.cgi
    echo 2. Extract to: C:\Program Files\Apache\maven
    echo 3. Add to PATH: C:\Program Files\Apache\maven\bin
    echo.
    echo OR use Maven Wrapper (may have issues):
    call mvnw.cmd spring-boot:run
)

pause

