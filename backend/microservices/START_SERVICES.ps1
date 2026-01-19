# Script to start all microservices
# Run from backend/microservices directory

Write-Host "Starting CareerMate Microservices..."
Write-Host ""

# Start Eureka Server
Write-Host "1. Starting Eureka Server (port 8761)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd eureka-server; mvn spring-boot:run"
Start-Sleep -Seconds 10

# Start API Gateway
Write-Host "2. Starting API Gateway (port 8080)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api-gateway; mvn spring-boot:run"
Start-Sleep -Seconds 10

# Start User Service
Write-Host "3. Starting User Service (port 8081)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd user-service; mvn spring-boot:run"
Start-Sleep -Seconds 5

# Start Notification Service
Write-Host "4. Starting Notification Service (port 8086)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd notification-service; mvn spring-boot:run"
Start-Sleep -Seconds 5

# Start Job Service
Write-Host "5. Starting Job Service (port 8082)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd job-service; mvn spring-boot:run"
Start-Sleep -Seconds 5

# Start Content Service
Write-Host "6. Starting Content Service (port 8083)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd content-service; mvn spring-boot:run"
Start-Sleep -Seconds 5

# Start Learning Service
Write-Host "7. Starting Learning Service (port 8084)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd learning-service; mvn spring-boot:run"
Start-Sleep -Seconds 5

# Start Admin Service
Write-Host "8. Starting Admin Service (port 8085)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd admin-service; mvn spring-boot:run"
Start-Sleep -Seconds 5

# Start AI Service
Write-Host "9. Starting AI Service (port 8087)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai-service; mvn spring-boot:run"

Write-Host ""
Write-Host "All services started!"
Write-Host "Eureka Dashboard: http://localhost:8761"
Write-Host "API Gateway: http://localhost:8080"
