#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$rootDir = Split-Path $PSScriptRoot -Parent

foreach ($line in Get-Content (Join-Path $rootDir ".env")) {
    if ($line -match '^\s*([^#][^=]*)=(.+)$') {
        [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim(), "Process")
    }
}

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$secretKey   = $env:SUPABASE_SECRET_KEY

if (-not $supabaseUrl) { Write-Error "Missing NEXT_PUBLIC_SUPABASE_URL in .env"; exit 1 }
if (-not $secretKey)   { Write-Error "Missing SUPABASE_SECRET_KEY in .env"; exit 1 }

node "$PSScriptRoot\create-admin.mjs"
