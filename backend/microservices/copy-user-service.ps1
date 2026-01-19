# Copy user-service code from monolith
$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "src\main\java\vn\careermate\userservice"
$dest = Join-Path $PSScriptRoot "user-service\src\main\java\vn\careermate\userservice"

Write-Host "Copying from: $source"
Write-Host "To: $dest"

if (Test-Path $source) {
    if (-not (Test-Path $dest)) {
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
    }
    Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force
    Write-Host "✓ Copied user-service successfully"
} else {
    Write-Host "✗ Source not found: $source"
}
