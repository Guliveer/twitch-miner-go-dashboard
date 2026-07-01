@echo off
setlocal EnableDelayedExpansion

set SCRIPT_DIR=%~dp0
set ROOT_DIR=%SCRIPT_DIR%..

echo.
echo === Twitch Miner Dashboard - First Admin Setup ===
echo.

:: Load .env via PowerShell into temp file to avoid & issues
set TMPENV=%TEMP%\tmpadminenv.ps1
echo $env = @{} > "%TMPENV%"
echo Get-Content '%ROOT_DIR%\.env' ^| ForEach-Object { if ($_ -match '^([^#][^=]*)=(.+)$') { $env[$Matches[1].Trim()] = $Matches[2].Trim() } } >> "%TMPENV%"
echo Write-Output ("NEON_AUTH_BASE_URL=" + $env['NEON_AUTH_BASE_URL']) >> "%TMPENV%"
echo Write-Output ("DB_DSN=" + $env['DB_DSN']) >> "%TMPENV%"

for /f "delims=" %%L in ('powershell -NoProfile -ExecutionPolicy Bypass -File "%TMPENV%"') do (
    set "%%L"
)
del "%TMPENV%"

if "!NEON_AUTH_BASE_URL!"=="" ( echo ERROR: Missing NEON_AUTH_BASE_URL in .env & exit /b 1 )
if "!DB_DSN!"=="" ( echo ERROR: Missing DB_DSN in .env & exit /b 1 )

set /p EMAIL="Email: "
set /p NAME="Display name: "
for /f "delims=" %%P in ('powershell -NoProfile -Command "$s=Read-Host 'Password (min 8 chars)' -AsSecureString;[Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))"') do set "PASSWORD=%%P"
echo.

echo Creating auth account...

for /f "delims=" %%I in ('powershell -NoProfile -Command "$r=Invoke-RestMethod -Method Post -Uri '!NEON_AUTH_BASE_URL!/sign-up/email' -ContentType 'application/json' -Headers @{Origin='http://localhost:3000'} -Body ([pscustomobject]@{email='!EMAIL!';password='!PASSWORD!';name='!NAME!'}|ConvertTo-Json); if($r.data.user.id){$r.data.user.id}else{$r.user.id}"') do set "USER_ID=%%I"

if "!USER_ID!"=="" (
    echo ERROR: Failed to create account. Check that sign-up is enabled in Neon Auth console.
    exit /b 1
)

echo Auth account created. User ID: !USER_ID!
echo Inserting admin role into database...

psql "!DB_DSN!" -c "INSERT INTO user_meta (user_id, must_change_password, role) VALUES ('!USER_ID!', false, 'admin') ON CONFLICT (user_id) DO UPDATE SET role = 'admin', must_change_password = false;"

echo.
echo Done! Log in at /login with: !EMAIL!
echo Remember to disable sign-up in Neon Auth console.
echo.
endlocal
