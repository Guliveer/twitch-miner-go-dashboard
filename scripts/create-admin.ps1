#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$rootDir = Split-Path $PSScriptRoot -Parent

# Load .env
foreach ($line in Get-Content (Join-Path $rootDir ".env")) {
    if ($line -match '^\s*([^#][^=]*)=(.+)$') {
        [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim(), "Process")
    }
}

$baseUrl = $env:NEON_AUTH_BASE_URL
$dbDsn   = $env:DB_DSN

if (-not $baseUrl) { Write-Error "Missing NEON_AUTH_BASE_URL in .env"; exit 1 }
if (-not $dbDsn)   { Write-Error "Missing DB_DSN in .env"; exit 1 }

Write-Host ""
Write-Host "=== Twitch Miner Dashboard - First Admin Setup ===" -ForegroundColor Cyan
Write-Host ""

$email     = Read-Host "Email"
$name      = Read-Host "Display name"
$securePwd = Read-Host "Password (min 8 chars)" -AsSecureString
$password  = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd))
Write-Host ""

Write-Host "Creating auth account..."

$body = @{ email = $email; password = $password; name = $name } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Method Post `
        -Uri "$baseUrl/sign-up/email" `
        -ContentType "application/json" `
        -Headers @{ Origin = "http://localhost:3000" } `
        -Body $body
} catch {
    Write-Host "ERROR: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

$userId = if ($r.data.user.id) { $r.data.user.id } else { $r.user.id }
if (-not $userId) {
    Write-Host "ERROR: Could not get user ID from response:" -ForegroundColor Red
    $r | ConvertTo-Json -Depth 5
    exit 1
}

Write-Host "Auth account created. User ID: $userId"
Write-Host "Inserting admin role into database..."

$sql = "INSERT INTO user_meta (user_id, must_change_password, role) VALUES ('$userId', false, 'admin') ON CONFLICT (user_id) DO UPDATE SET role = 'admin', must_change_password = false;"
& psql $dbDsn -c $sql

Write-Host ""
Write-Host "Done! Log in at /login with:" -ForegroundColor Green
Write-Host "  Email: $email"
Write-Host ""
Write-Host "Remember to disable sign-up in Neon Auth console." -ForegroundColor Yellow
