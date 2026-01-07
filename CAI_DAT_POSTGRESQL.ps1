# Script cài đặt PostgreSQL bằng Chocolatey
# Chạy PowerShell as Administrator trước khi chạy script này

Write-Host "=== CAI DAT POSTGRESQL ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra quyền Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Can quyen Administrator!" -ForegroundColor Red
    Write-Host "Vui long:" -ForegroundColor Yellow
    Write-Host "  1. Click phai vao PowerShell" -ForegroundColor White
    Write-Host "  2. Chon 'Run as Administrator'" -ForegroundColor White
    Write-Host "  3. Chay lai script nay" -ForegroundColor White
    pause
    exit 1
}

Write-Host "Co quyen Administrator - OK" -ForegroundColor Green
Write-Host ""

# Kiểm tra Chocolatey
$choco = Get-Command choco -ErrorAction SilentlyContinue
if (-not $choco) {
    Write-Host "ERROR: Chocolatey chua duoc cai dat!" -ForegroundColor Red
    Write-Host "Cai Chocolatey: https://chocolatey.org/install" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Chocolatey da co - OK" -ForegroundColor Green
Write-Host ""

# Cài đặt PostgreSQL
Write-Host "Dang cai dat PostgreSQL..." -ForegroundColor Cyan
Write-Host "  - PostgreSQL Server" -ForegroundColor White
Write-Host "  - pgAdmin 4" -ForegroundColor White
Write-Host "  - Command Line Tools" -ForegroundColor White
Write-Host ""

try {
    # Cài PostgreSQL với các components cần thiết
    choco install postgresql --params '/Password:postgres' -y
    
    Write-Host ""
    Write-Host "=== CAI DAT THANH CONG ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Thong tin:" -ForegroundColor Cyan
    Write-Host "  - PostgreSQL Server: Da cai" -ForegroundColor White
    Write-Host "  - pgAdmin 4: Da cai" -ForegroundColor White
    Write-Host "  - Port: 5432" -ForegroundColor White
    Write-Host "  - Username: postgres" -ForegroundColor White
    Write-Host "  - Password: postgres (doi ngay sau khi cai)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "BUOC TIEP THEO:" -ForegroundColor Cyan
    Write-Host "  1. Doi password PostgreSQL (khuyen nghi)" -ForegroundColor White
    Write-Host "  2. Tao database: careermate_db" -ForegroundColor White
    Write-Host "  3. Cap nhat application.yml neu can" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Co loi xay ra khi cai dat!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "THU LAI:" -ForegroundColor Yellow
    Write-Host "  choco install postgresql -y" -ForegroundColor White
    pause
    exit 1
}

Write-Host "Nhan phim bat ky de thoat..." -ForegroundColor Gray
pause

