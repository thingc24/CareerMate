@echo off
echo === Starting CareerMate Backend ===
echo.

REM Set JAVA_HOME
set "JAVA_HOME=C:\Program Files\Java\jdk-23"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo JAVA_HOME: %JAVA_HOME%
echo.

REM Check Java
java -version
echo.

REM Run Maven
echo Starting Spring Boot...
echo Please wait, this may take 2-5 minutes on first run...
echo.

REM Use full path to avoid issues
cd /d "%~dp0"
call "%~dp0mvnw.cmd" spring-boot:run

pause

