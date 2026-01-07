# Script cấu hình PostgreSQL chạy port 5433
# Chạy PowerShell as Administrator

Write-Host "=== CAU HINH POSTGRESQL PORT 5433 ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra quyền Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Can quyen Administrator!" -ForegroundColor Red
    Write-Host "Vui long chay PowerShell as Administrator" -ForegroundColor Yellow
    pause
    exit 1
}

# Tìm PostgreSQL data folder
$pgVersions = @("18", "17", "16", "15", "14", "13")
$dataPath = $null

foreach ($version in $pgVersions) {
    $paths = @(
        "C:\Program Files\PostgreSQL\$version\data",
        "C:\ProgramData\PostgreSQL\$version\data"
    )
    
    foreach ($path in $paths) {
        if (Test-Path $path) {
            $confFile = Join-Path $path "postgresql.conf"
            if (Test-Path $confFile) {
                $dataPath = $path
                Write-Host "Tim thay PostgreSQL data: $dataPath" -ForegroundColor Green
                break
            }
        }
    }
    
    if ($dataPath) { break }
}

if (-not $dataPath) {
    Write-Host "ERROR: Khong tim thay PostgreSQL data folder!" -ForegroundColor Red
    Write-Host "Vui long kiem tra PostgreSQL da duoc cai dat chua" -ForegroundColor Yellow
    pause
    exit 1
}

$confFile = Join-Path $dataPath "postgresql.conf"

# Backup file config
$backupFile = "$confFile.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $confFile $backupFile
Write-Host "Da backup config: $backupFile" -ForegroundColor Gray

# Đọc file config
$content = Get-Content $confFile

# Tìm và sửa port
$portFound = $false
$newContent = @()

foreach ($line in $content) {
    if ($line -match "^\s*#?\s*port\s*=") {
        $newContent += "port = 5433                    # Changed to 5433"
        $portFound = $true
        Write-Host "Da cap nhat port = 5433" -ForegroundColor Green
    } else {
        $newContent += $line
    }
}

# Nếu không tìm thấy dòng port, thêm mới
if (-not $portFound) {
    Write-Host "Khong tim thay dong port, them moi..." -ForegroundColor Yellow
    $inserted = $false
    $finalContent = @()
    
    foreach ($line in $newContent) {
        $finalContent += $line
        # Thêm port sau dòng CONNECTIONS AND AUTHENTICATION
        if ($line -match "CONNECTIONS AND AUTHENTICATION" -and -not $inserted) {
            $finalContent += ""
            $finalContent += "# PostgreSQL Port"
            $finalContent += "port = 5433                    # Changed to 5433"
            $inserted = $true
            Write-Host "Da them port = 5433" -ForegroundColor Green
        }
    }
    
    if (-not $inserted) {
        # Thêm vào đầu file
        $finalContent = @("# PostgreSQL Port", "port = 5433                    # Changed to 5433", "") + $finalContent
        Write-Host "Da them port = 5433 vao dau file" -ForegroundColor Green
    }
    
    $newContent = $finalContent
}

# Ghi file config
$newContent | Set-Content $confFile -Encoding UTF8
Write-Host "Da luu file config" -ForegroundColor Green

# Tìm PostgreSQL service
Write-Host ""
Write-Host "Tim PostgreSQL service..." -ForegroundColor Cyan
$services = Get-Service | Where-Object { 
    $_.Name -like "*postgres*" -or 
    $_.DisplayName -like "*postgres*" 
}

if ($services) {
    foreach ($service in $services) {
        Write-Host "Tim thay service: $($service.Name) - $($service.DisplayName)" -ForegroundColor White
        
        Write-Host "Dang restart service..." -ForegroundColor Yellow
        try {
            Restart-Service -Name $service.Name -Force
            Write-Host "Da restart service: $($service.Name)" -ForegroundColor Green
        } catch {
            Write-Host "Loi khi restart service: $_" -ForegroundColor Red
            Write-Host "Vui long restart thu cong trong Services (services.msc)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "Khong tim thay PostgreSQL service!" -ForegroundColor Red
    Write-Host "Vui long restart PostgreSQL thu cong" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== HOAN TAT ===" -ForegroundColor Green
Write-Host ""
Write-Host "Da cap nhat PostgreSQL config:" -ForegroundColor Cyan
Write-Host "  - Port: 5433" -ForegroundColor White
Write-Host "  - Backup: $backupFile" -ForegroundColor Gray
Write-Host ""
Write-Host "BUOC TIEP THEO:" -ForegroundColor Yellow
Write-Host "  1. Kiem tra PostgreSQL da chay port 5433:" -ForegroundColor White
Write-Host "     netstat -ano | findstr :5433" -ForegroundColor Gray
Write-Host "  2. Test ket noi:" -ForegroundColor White
Write-Host "     psql -U postgres -p 5433 -h localhost" -ForegroundColor Gray
Write-Host "  3. Tao database:" -ForegroundColor White
Write-Host "     CREATE DATABASE careermate_db;" -ForegroundColor Gray
Write-Host "  4. Chay Backend:" -ForegroundColor White
Write-Host "     mvn spring-boot:run" -ForegroundColor Gray
Write-Host ""

pause

