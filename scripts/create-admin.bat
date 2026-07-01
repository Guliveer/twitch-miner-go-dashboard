@echo off
:: Creates the first admin account for the dashboard.
:: Usage: scripts\create-admin.bat
:: Requires: curl (built into Windows 10+), psql in PATH

setlocal EnableDelayedExpansion

set SCRIPT_DIR=%~dp0
set ROOT_DIR=%SCRIPT_DIR%..

:: Load .env
if exist "%ROOT_DIR%\.env" (
    for /f "usebackq tokens=1,* delims==" %%A in ("%ROOT_DIR%\.env") do (
        set "%%A=%%B"
    )
)

if not defined NEON_AUTH_BASE_URL (
    echo ERROR: Missing NEON_AUTH_BASE_URL in .env
    exit /b 1
)
if not defined DB_DSN (
    echo ERROR: Missing DB_DSN in .env
    exit /b 1
)

echo.
echo === Twitch Miner Dashboard - First Admin Setup ===
echo.

set /p EMAIL="Email: "
set /p NAME="Display name: "

:: PowerShell for masked password input
for /f "delims=" %%P in ('powershell -NoProfile -Command "$p = Read-Host 'Password (min 8 chars)' -AsSecureString; [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($p))"') do set "PASSWORD=%%P"
echo.

:: 1. Register via Neon Auth
echo Creating auth account...

for /f "delims=" %%R in ('curl -sf -X POST "%NEON_AUTH_BASE_URL%/sign-up/email" -H "Content-Type: application/json" -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\",\"name\":\"%NAME%\"}"') do set "RESPONSE=%%R"

:: Extract user id from JSON response using PowerShell
for /f "delims=" %%I in ('powershell -NoProfile -Command "$r = '%RESPONSE%' | ConvertFrom-Json; $r.data.user.id"') do set "USER_ID=%%I"

if not defined USER_ID (
    echo.
    echo ERROR: Failed to create auth account. Response:
    echo %RESPONSE%
    exit /b 1
)

echo Auth account created. User ID: %USER_ID%

:: 2. Insert admin row into user_meta
echo Inserting admin role into database...

psql "%DB_DSN%" -c "INSERT INTO user_meta (user_id, must_change_password, role) VALUES ('%USER_ID%', false, 'admin') ON CONFLICT (user_id) DO UPDATE SET role = 'admin', must_change_password = false;"

echo.
echo Done! You can now log in at /login with:
echo   Email:    %EMAIL%
echo   Password: (the one you just set)
echo.

endlocal
