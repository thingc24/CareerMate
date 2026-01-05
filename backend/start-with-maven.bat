@echo off
echo === Starting CareerMate Backend with Maven ===
echo.

REM Set JAVA_HOME
set "JAVA_HOME=C:\Program Files\Java\jdk-23"
set "PATH=%JAVA_HOME%\bin;%PATH%"

REM Add Maven to PATH
set "MAVEN_HOME=C:\Program Files\apache-maven-3.9.12"
set "PATH=%MAVEN_HOME%\bin;%PATH%"

echo JAVA_HOME: %JAVA_HOME%
echo MAVEN_HOME: %MAVEN_HOME%
echo.

REM Check Maven
mvn -version
echo.

echo Starting Spring Boot...
echo Please wait, this may take 2-5 minutes on first run...
echo.

REM Run Spring Boot
mvn spring-boot:run

pause

