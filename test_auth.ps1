
$logFile = 'c:\xampp\htdocs\CareerMate\backend\microservices\user-service\logs\user-service.log'
Write-Host "--- TEST START ---"
$resp = curl.exe -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"test_v5@example.com\",\"password\":\"password\",\"fullName\":\"Test User\",\"role\":\"STUDENT\"}" http://localhost:8081/auth/register
Write-Host "Response: $resp"
Write-Host "--- LOG TAIL ---"
Get-Content -Path $logFile -Tail 20
Write-Host "--- TEST END ---"
