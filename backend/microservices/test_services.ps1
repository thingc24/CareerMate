# Test All Microservices
Write-Host "`n===========================================================" -ForegroundColor Green
Write-Host "           TESTING ALL MICROSERVICES           " -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Green

$services = @(
    @{Name="user-service"; Port=8081; Path="user-service"},
    @{Name="job-service"; Port=8082; Path="job-service"},
    @{Name="content-service"; Port=8083; Path="content-service"},
    @{Name="notification-service"; Port=8084; Path="notification-service"},
    @{Name="learning-service"; Port=8085; Path="learning-service"},
    @{Name="ai-service"; Port=8086; Path="ai-service"},
    @{Name="admin-service"; Port=8087; Path="admin-service"}
)

$baseDir = "C:\xampp\htdocs\CareerMate\backend\microservices"
$results = @()

foreach ($svc in $services) {
    Write-Host "`n==== Testing $($svc.Name) ====" -ForegroundColor Cyan
    Write-Host "Port: $($svc.Port)" -ForegroundColor Yellow
    
    # Check if service is already running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($svc.Port)/actuator/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ $($svc.Name) is already running" -ForegroundColor Green
        $results += "$($svc.Name) : RUNNING"
        continue
    } catch {
        Write-Host "Service not running, will start it..." -ForegroundColor Yellow
    }
    
    # Start service in background
    Write-Host "Starting $($svc.Name)..." -ForegroundColor Yellow
    $jarPath = Join-Path $baseDir "$($svc.Path)\target\$($svc.Name)-1.0.0.jar"
    
    if (Test-Path $jarPath) {
        $process = Start-Process -FilePath "java" -ArgumentList "-jar", $jarPath -PassThru -WindowStyle Hidden
        Write-Host "Started process PID: $($process.Id)" -ForegroundColor Gray
        
        # Wait for service to start
        $maxWait = 30
        $waited = 0
        $started = $false
        
        while ($waited -lt $maxWait -and -not $started) {
            Start-Sleep -Seconds 2
            $waited += 2
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$($svc.Port)/actuator/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
                Write-Host "✅ $($svc.Name) started successfully!" -ForegroundColor Green
                $results += "$($svc.Name) : SUCCESS"
                $started = $true
            } catch {
                Write-Host "." -NoNewline -ForegroundColor Gray
            }
        }
        
        if (-not $started) {
            Write-Host "`n❌ $($svc.Name) failed to start within $maxWait seconds" -ForegroundColor Red
            $results += "$($svc.Name) : FAILED"
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "❌ JAR file not found: $jarPath" -ForegroundColor Red
        Write-Host "Building $($svc.Name)..." -ForegroundColor Yellow
        Push-Location (Join-Path $baseDir $svc.Path)
        mvn clean package -DskipTests | Out-Null
        Pop-Location
        
        if (Test-Path $jarPath) {
            Write-Host "Build successful, starting service..." -ForegroundColor Green
            $process = Start-Process -FilePath "java" -ArgumentList "-jar", $jarPath -PassThru -WindowStyle Hidden
            Start-Sleep -Seconds 15
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$($svc.Port)/actuator/health" -TimeoutSec 2 -UseBasicParsing
                Write-Host "✅ $($svc.Name) started!" -ForegroundColor Green
                $results += "$($svc.Name) : SUCCESS"
            } catch {
                Write-Host "❌ $($svc.Name) failed to start" -ForegroundColor Red
                $results += "$($svc.Name) : FAILED"
            }
        } else {
            Write-Host "❌ Build failed for $($svc.Name)" -ForegroundColor Red
            $results += "$($svc.Name) : BUILD_FAILED"
        }
    }
}

Write-Host "`n===========================================================" -ForegroundColor Green
Write-Host "           TEST RESULTS           " -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Green
$results | ForEach-Object { Write-Host $_ }

# Check Eureka for registered services
Write-Host "`n==== Checking Eureka Registry ====" -ForegroundColor Cyan
try {
    $eurekaResponse = Invoke-WebRequest -Uri "http://localhost:8761/eureka/apps" -TimeoutSec 3 -UseBasicParsing
    Write-Host "✅ Eureka is accessible" -ForegroundColor Green
    $registeredServices = ([xml]$eurekaResponse.Content).applications.application.name | Select-Object -Unique
    Write-Host "Registered services:" -ForegroundColor Yellow
    $registeredServices | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
} catch {
    Write-Host "❌ Cannot access Eureka: $_" -ForegroundColor Red
}

Write-Host "`n===========================================================" -ForegroundColor Green
