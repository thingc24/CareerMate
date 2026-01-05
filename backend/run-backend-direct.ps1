# PowerShell script to run backend
# Run: .\run-backend-direct.ps1

Write-Host "=== Starting CareerMate Backend ===" -ForegroundColor Cyan
Write-Host ""

# Set JAVA_HOME
$javaHome = "C:\Program Files\Java\jdk-23"
if (Test-Path $javaHome) {
    $env:JAVA_HOME = $javaHome
    Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "JAVA_HOME not found at: $javaHome" -ForegroundColor Red
    Write-Host "Please set JAVA_HOME manually" -ForegroundColor Yellow
    exit 1
}

# Add Java to PATH
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Check if Maven wrapper exists
if (-not (Test-Path "mvnw.cmd")) {
    Write-Host "mvnw.cmd not found!" -ForegroundColor Red
    exit 1
}

# Check if Maven wrapper jar exists
if (-not (Test-Path ".mvn\wrapper\maven-wrapper.jar")) {
    Write-Host "Maven wrapper jar not found!" -ForegroundColor Red
    Write-Host "Downloading Maven wrapper..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path ".mvn\wrapper" | Out-Null
    Invoke-WebRequest -Uri "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -OutFile ".mvn\wrapper\maven-wrapper.jar"
}

Write-Host "Starting Spring Boot..." -ForegroundColor Green
Write-Host ""

# Run Maven - Use cmd to avoid path issues
$mvnwPath = Resolve-Path "mvnw.cmd"
cmd /c "`"$mvnwPath`" spring-boot:run"
