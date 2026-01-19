@echo off
set SOURCE=backend\src\main\java\vn\careermate\userservice
set DEST=backend\microservices\user-service\src\main\java\vn\careermate\userservice

if not exist "%DEST%" mkdir "%DEST%"
xcopy /E /I /Y "%SOURCE%\*" "%DEST%\"
echo Copied user-service files
