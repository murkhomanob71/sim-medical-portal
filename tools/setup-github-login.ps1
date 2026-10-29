# =============================================================================
#  setup-github-login.ps1
#  One-time GitHub sign-in for this PC. Saves an encrypted token so later
#  backups never ask you to log in again.
#
#  Run:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\setup-github-login.ps1
# =============================================================================

param(
  [string]$ClientId = '0120e057bd645470c1ed',
  [string]$StoreDir = (Join-Path $env:APPDATA 'sim-medical-portal')
)

$ErrorActionPreference = 'Stop'
$storeFile = Join-Path $StoreDir 'github-token.dat'

Write-Host ''
Write-Host 'SIM Medical Portal - GitHub one-time login' -ForegroundColor Magenta
Write-Host '------------------------------------------'

try {
  $req = Invoke-RestMethod -Method Post -Uri 'https://github.com/login/device/code' `
    -Headers @{ Accept = 'application/json' } `
    -Body @{ client_id = $ClientId; scope = 'repo' } -TimeoutSec 30
} catch {
  Write-Host 'Could not reach GitHub. Check the internet connection.' -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host ('  1. Open : ' + $req.verification_uri) -ForegroundColor Cyan
Write-Host ('  2. Code : ' + $req.user_code) -ForegroundColor Yellow
Write-Host '  3. Press Authorize (works from your phone too)'
Write-Host ''

try { Start-Process $req.verification_uri } catch { }

$interval = [int]$req.interval
if ($interval -lt 5) { $interval = 5 }
$deadline = (Get-Date).AddSeconds([int]$req.expires_in)

while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds $interval
  try {
    $res = Invoke-RestMethod -Method Post -Uri 'https://github.com/login/oauth/access_token' `
      -Headers @{ Accept = 'application/json' } `
      -Body @{
        client_id   = $ClientId
        device_code = $req.device_code
        grant_type  = 'urn:ietf:params:oauth:grant-type:device_code'
      } -TimeoutSec 30
  } catch {
    continue
  }

  if ($res.access_token) {
    if (-not (Test-Path $StoreDir)) { New-Item -ItemType Directory -Path $StoreDir -Force | Out-Null }
    $secure = ConvertTo-SecureString $res.access_token -AsPlainText -Force
    ConvertFrom-SecureString $secure | Set-Content -Path $storeFile -Encoding ASCII
    Write-Host ''
    Write-Host '  Signed in. Token saved (encrypted for this Windows user).' -ForegroundColor Green
    Write-Host ('  File: ' + $storeFile)
    Write-Host '  You will not be asked to log in again.'
    exit 0
  }

  if ($res.error -eq 'slow_down') { $interval = $interval + 5; continue }
  if ($res.error -eq 'authorization_pending') { continue }

  Write-Host ('  Failed: ' + $res.error) -ForegroundColor Red
  exit 1
}

Write-Host '  The code expired. Run this script again for a fresh code.' -ForegroundColor Red
exit 1
