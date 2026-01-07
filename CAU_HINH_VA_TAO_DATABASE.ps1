# Script tu dong cau hinh PostgreSQL va tao database
# CHAY PowerShell as Administrator!

Write-Host "=== CAU HINH POSTGRESQL VA TAO DATABASE ===" -ForegroundColor Cyan
Write-Host ""

# Kiem tra quyen Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Can quyen Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vui long:" -ForegroundColor Yellow
    Write-Host "  1. Click phai vao PowerShell" -ForegroundColor White
    Write-Host "  2. Chon 'Run as Administrator'" -ForegroundColor White
    Write-Host "  3. Chay lai script nay" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "Co quyen Administrator" -ForegroundColor Green
Write-Host ""

# Tim PostgreSQL
Write-Host "Dang tim PostgreSQL..." -ForegroundColor Cyan
$pgPath = $null
$pgVersions = @("18", "17", "16", "15", "14", "13")

foreach ($version in $pgVersions) {
    $testPath = "C:\Program Files\PostgreSQL\$version\bin\psql.exe"
    if (Test-Path $testPath) {
        $pgPath = "C:\Program Files\PostgreSQL\$version\bin"
        Write-Host "Tim thay PostgreSQL $version tai: $pgPath" -ForegroundColor Green
        break
    }
}

if (-not $pgPath) {
    Write-Host "Khong tim thay PostgreSQL!" -ForegroundColor Red
    Write-Host "Vui long cai dat PostgreSQL truoc" -ForegroundColor Yellow
    pause
    exit 1
}

# Tim data folder
Write-Host ""
Write-Host "Dang tim data folder..." -ForegroundColor Cyan
$dataPath = $null
$version = ($pgPath -split '\\')[-2]

$possiblePaths = @(
    "C:\Program Files\PostgreSQL\$version\data",
    "C:\ProgramData\PostgreSQL\$version\data"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $confFile = Join-Path $path "postgresql.conf"
        if (Test-Path $confFile) {
            $dataPath = $path
            Write-Host "Tim thay data folder: $dataPath" -ForegroundColor Green
            break
        }
    }
}

# Neu khong tim thay, tim trong toan bo o C
if (-not $dataPath) {
    Write-Host "Dang tim trong toan bo o C..." -ForegroundColor Yellow
    $confFiles = Get-ChildItem -Path "C:\Program Files\PostgreSQL" -Filter "postgresql.conf" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($confFiles) {
        $dataPath = $confFiles.DirectoryName
        Write-Host "Tim thay data folder: $dataPath" -ForegroundColor Green
    }
}

if (-not $dataPath) {
    Write-Host "Khong tim thay data folder, se bo qua buoc cau hinh port" -ForegroundColor Yellow
    Write-Host "Tiep tuc voi viec doi mat khau va tao database..." -ForegroundColor Yellow
}

# Buoc 1: Cau hinh port 5433
if ($dataPath) {
    Write-Host ""
    Write-Host "=== BUOC 1: CAU HINH PORT 5433 ===" -ForegroundColor Cyan
    $confFile = Join-Path $dataPath "postgresql.conf"
    
    if (Test-Path $confFile) {
        # Backup
        $backupFile = "$confFile.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item $confFile $backupFile
        Write-Host "Da backup: $backupFile" -ForegroundColor Gray
        
        # Doc va sua
        $content = Get-Content $confFile
        $newContent = @()
        $portFound = $false
        
        foreach ($line in $content) {
            if ($line -match "^\s*#?\s*port\s*=") {
                $newContent += "port = 5433                    # Changed to 5433"
                $portFound = $true
            } else {
                $newContent += $line
            }
        }
        
        if (-not $portFound) {
            $inserted = $false
            $finalContent = @()
            foreach ($line in $newContent) {
                $finalContent += $line
                if ($line -match "CONNECTIONS AND AUTHENTICATION" -and -not $inserted) {
                    $finalContent += ""
                    $finalContent += "# PostgreSQL Port"
                    $finalContent += "port = 5433                    # Changed to 5433"
                    $inserted = $true
                }
            }
            if (-not $inserted) {
                $finalContent = @("# PostgreSQL Port", "port = 5433                    # Changed to 5433", "") + $finalContent
            }
            $newContent = $finalContent
        }
        
        # Ghi file
        try {
            $newContent | Set-Content $confFile -Encoding UTF8
            Write-Host "Da cap nhat port = 5433" -ForegroundColor Green
        } catch {
            Write-Host "Loi khi ghi file: $_" -ForegroundColor Red
        }
    }
}

# Buoc 2: Tim va restart service
Write-Host ""
Write-Host "=== BUOC 2: RESTART POSTGRESQL SERVICE ===" -ForegroundColor Cyan
$services = Get-Service | Where-Object { 
    $_.Name -like "*postgres*" -or 
    $_.DisplayName -like "*postgres*" 
}

if ($services) {
    foreach ($service in $services) {
        Write-Host "Tim thay service: $($service.Name)" -ForegroundColor White
        try {
            Restart-Service -Name $service.Name -Force
            Write-Host "Da restart service: $($service.Name)" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } catch {
            Write-Host "Loi khi restart: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Khong tim thay service, co the PostgreSQL chay tu Docker hoac XAMPP" -ForegroundColor Yellow
}

# Buoc 3: Doi mat khau
Write-Host ""
Write-Host "=== BUOC 3: DOI MAT KHAU ===" -ForegroundColor Cyan

# Thu cac mat khau pho bien
$commonPasswords = @("postgres", "admin", "123456", "password", "")

$passwordChanged = $false
foreach ($oldPwd in $commonPasswords) {
    Write-Host "Thu mat khau: $($oldPwd -replace '.', '*')" -ForegroundColor Gray
    
    # Thu port 5433
    $env:PGPASSWORD = $oldPwd
    $result = & "$pgPath\psql.exe" -U postgres -p 5433 -h localhost -c "ALTER USER postgres WITH PASSWORD 'Vantanvip#123@';" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Da doi mat khau thanh cong (port 5433)!" -ForegroundColor Green
        $passwordChanged = $true
        break
    }
    
    # Thu port 5432
    $result = & "$pgPath\psql.exe" -U postgres -p 5432 -h localhost -c "ALTER USER postgres WITH PASSWORD 'Vantanvip#123@';" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Da doi mat khau thanh cong (port 5432)!" -ForegroundColor Green
        $passwordChanged = $true
        break
    }
}

if (-not $passwordChanged) {
    Write-Host "Khong the doi mat khau tu dong" -ForegroundColor Yellow
    Write-Host "Vui long doi mat khau thu cong bang pgAdmin hoac:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres -p 5432" -ForegroundColor White
    Write-Host "  ALTER USER postgres WITH PASSWORD 'Vantanvip#123@';" -ForegroundColor White
}

# Buoc 4: Tao database
Write-Host ""
Write-Host "=== BUOC 4: TAO DATABASE ===" -ForegroundColor Cyan

$env:PGPASSWORD = "Vantanvip#123@"

# Thu port 5433
Write-Host "Thu tao database tren port 5433..." -ForegroundColor Cyan
$createDb = & "$pgPath\psql.exe" -U postgres -p 5433 -h localhost -c "CREATE DATABASE careermate_db;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Da tao database careermate_db (port 5433)!" -ForegroundColor Green
} elseif ($createDb -match "already exists") {
    Write-Host "Database careermate_db da ton tai (port 5433)!" -ForegroundColor Yellow
} else {
    # Thu port 5432
    Write-Host "Thu tao database tren port 5432..." -ForegroundColor Cyan
    $createDb = & "$pgPath\psql.exe" -U postgres -p 5432 -h localhost -c "CREATE DATABASE careermate_db;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Da tao database careermate_db (port 5432)!" -ForegroundColor Green
        Write-Host "CANH BAO: PostgreSQL dang chay port 5432, can cap nhat config Backend!" -ForegroundColor Yellow
    } elseif ($createDb -match "already exists") {
        Write-Host "Database careermate_db da ton tai (port 5432)!" -ForegroundColor Yellow
        Write-Host "CANH BAO: PostgreSQL dang chay port 5432, can cap nhat config Backend!" -ForegroundColor Yellow
    } else {
        Write-Host "Khong the tao database!" -ForegroundColor Red
        Write-Host "Output: $createDb" -ForegroundColor Gray
    }
}

# Buoc 5: Kiem tra ket noi
Write-Host ""
Write-Host "=== BUOC 5: KIEM TRA KET NOI ===" -ForegroundColor Cyan

$env:PGPASSWORD = "Vantanvip#123@"

# Test port 5433
Write-Host "Test ket noi port 5433..." -ForegroundColor Cyan
$test1 = & "$pgPath\psql.exe" -U postgres -p 5433 -h localhost -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "KET NOI PORT 5433 THANH CONG!" -ForegroundColor Green
    $test1 | Select-Object -First 2
} else {
    # Test port 5432
    Write-Host "Test ket noi port 5432..." -ForegroundColor Cyan
    $test2 = & "$pgPath\psql.exe" -U postgres -p 5432 -h localhost -c "SELECT version();" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "KET NOI PORT 5432 THANH CONG!" -ForegroundColor Green
        Write-Host "CAN CAP NHAT CONFIG BACKEND VE PORT 5432!" -ForegroundColor Yellow
    } else {
        Write-Host "KHONG THE KET NOI!" -ForegroundColor Red
        Write-Host "Output: $test2" -ForegroundColor Gray
    }
}

# Tom tat
Write-Host ""
Write-Host "=== HOAN TAT ===" -ForegroundColor Green
Write-Host ""
Write-Host "Da thuc hien:" -ForegroundColor Cyan
Write-Host "  - Cau hinh port 5433 (neu tim thay config)" -ForegroundColor Green
Write-Host "  - Restart PostgreSQL service" -ForegroundColor Green
Write-Host "  - Doi mat khau: Vantanvip#123@" -ForegroundColor Green
Write-Host "  - Tao database: careermate_db" -ForegroundColor Green
Write-Host ""
Write-Host "Buoc tiep theo:" -ForegroundColor Yellow
Write-Host "  1. Kiem tra PostgreSQL dang chay port nao:" -ForegroundColor White
Write-Host "     netstat -ano | findstr :543" -ForegroundColor Gray
Write-Host "  2. Neu chay port 5432, cap nhat config Backend ve port 5432" -ForegroundColor White
Write-Host "  3. Chay Backend: mvn spring-boot:run" -ForegroundColor White
Write-Host "  4. Backend se tu dong tao tables" -ForegroundColor White
Write-Host ""

pause
