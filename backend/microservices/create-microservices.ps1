# Script to create microservices structure from monolith
# Run this from backend/microservices directory

$basePath = "..\src\main\java\vn\careermate"
$microservicesPath = "."

# Services to create
$services = @(
    @{Name="user-service"; Port=8081; Package="userservice"},
    @{Name="job-service"; Port=8082; Package="jobservice"},
    @{Name="content-service"; Port=8083; Package="contentservice"},
    @{Name="learning-service"; Port=8084; Package="learningservice"},
    @{Name="admin-service"; Port=8085; Package="adminservice"},
    @{Name="notification-service"; Port=8086; Package="notificationservice"},
    @{Name="ai-service"; Port=8087; Package="aiservice"}
)

foreach ($service in $services) {
    $serviceName = $service.Name
    $packageName = $service.Package
    $port = $service.Port
    
    Write-Host "Creating $serviceName..."
    
    # Create directory structure
    $srcPath = "$microservicesPath\$serviceName\src\main\java\vn\careermate\$packageName"
    $resourcesPath = "$microservicesPath\$serviceName\src\main\resources"
    
    New-Item -ItemType Directory -Force -Path $srcPath | Out-Null
    New-Item -ItemType Directory -Force -Path $resourcesPath | Out-Null
    
    # Copy source files
    $sourcePath = "$basePath\$packageName"
    if (Test-Path $sourcePath) {
        Write-Host "  Copying source files from $sourcePath..."
        Copy-Item -Path "$sourcePath\*" -Destination $srcPath -Recurse -Force
    }
    
    # Create pom.xml template (will be customized per service)
    Write-Host "  Service $serviceName structure created"
}

Write-Host "`nMicroservices structure created!"
Write-Host "Next steps:"
Write-Host "1. Customize pom.xml for each service"
Write-Host "2. Create Main Application class for each service"
Write-Host "3. Create application.yml for each service"
Write-Host "4. Add Feign Client interfaces for inter-service communication"
