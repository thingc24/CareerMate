# Script chay Backend CareerMate
# Usage: .\CHAY_BACKEND.ps1

Write-Host "=== CAREERMATE BACKEND ===" -ForegroundColor Cyan
Write-Host ""

# Check if port 8080 is already in use
$pid8080 = netstat -ano | findstr :8080 | Select-String "LISTENING" | ForEach-Object { ($_ -split " +")[-1] } | Select-Object -Unique

if ($pid8080) {
    Write-Host "Port 8080 is already in use (PID: $pid8080)" -ForegroundColor Yellow
    $choice = Read-Host "Do you want to stop it and restart? (y/n)"
    if ($choice -eq "y" -or $choice -eq "Y") {
        Write-Host "Stopping process on port 8080..." -ForegroundColor Yellow
        taskkill /PID $pid8080 /F | Out-Null
        Start-Sleep -Seconds 2
        Write-Host "Process stopped" -ForegroundColor Green
    } else {
        Write-Host "Exiting. Please stop the process manually or use a different port." -ForegroundColor Red
        exit
    }
}

# Set Java and Maven paths
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
$env:PATH = "C:\Program Files\apache-maven-3.9.12\bin;$env:PATH"

# Check if Java is available
$javaVersion = java -version 2>&1 | Select-String "version"
if (-not $javaVersion) {
    Write-Host "Error: Java not found!" -ForegroundColor Red
    Write-Host "Please install Java JDK 23 or update JAVA_HOME" -ForegroundColor Yellow
    exit 1
}

# Check if Maven is available
$mvnVersion = mvn -version 2>&1 | Select-String "Apache Maven"
if (-not $mvnVersion) {
    Write-Host "Error: Maven not found!" -ForegroundColor Red
    Write-Host "Please install Maven or update PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "Java: $javaVersion" -ForegroundColor Green
Write-Host "Maven: $mvnVersion" -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
cd backend

Write-Host "Starting Spring Boot application..." -ForegroundColor Cyan
Write-Host "Backend will be available at: http://localhost:8080" -ForegroundColor Yellow
Write-Host "API Base URL: http://localhost:8080/api" -ForegroundColor Yellow
Write-Host "Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Run Spring Boot
mvn spring-boot:run

