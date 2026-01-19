# Script to copy service code from monolith to microservices
# Run from backend/microservices directory

$monolithPath = "..\src\main\java\vn\careermate"
$microservicesPath = "."

# Services mapping
$services = @(
    @{Name="user-service"; Package="userservice"; Source="userservice"},
    @{Name="job-service"; Package="jobservice"; Source="jobservice"},
    @{Name="content-service"; Package="contentservice"; Source="contentservice"},
    @{Name="learning-service"; Package="learningservice"; Source="learningservice"},
    @{Name="admin-service"; Package="adminservice"; Source="adminservice"},
    @{Name="notification-service"; Package="notificationservice"; Source="notificationservice"},
    @{Name="ai-service"; Package="aiservice"; Source="aiservice"}
)

foreach ($service in $services) {
    $serviceName = $service.Name
    $packageName = $service.Package
    $sourcePackage = $service.Source
    
    Write-Host "Processing $serviceName..."
    
    $sourcePath = "$monolithPath\$sourcePackage"
    $targetPath = "$microservicesPath\$serviceName\src\main\java\vn\careermate\$packageName"
    
    if (Test-Path $sourcePath) {
        Write-Host "  Copying from $sourcePath to $targetPath..."
        
        # Create target directory
        New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
        
        # Copy all files
        Copy-Item -Path "$sourcePath\*" -Destination $targetPath -Recurse -Force
        
        Write-Host "  ✓ Copied $serviceName"
    } else {
        Write-Host "  ✗ Source path not found: $sourcePath"
    }
}

Write-Host "`nCode copying completed!"
Write-Host "Next: Update package declarations and add Feign Clients"
