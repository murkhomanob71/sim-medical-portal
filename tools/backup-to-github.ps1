# =============================================================================
#  backup-to-github.ps1
#  Pushes this folder to GitHub as a commit on a branch. No git needed.
#  Run once:  tools\setup-github-login.ps1   (one-time sign-in)
#  Then:      tools\backup-to-github.ps1     (no login, every time)
# =============================================================================

param(
  [string]$Repo = 'murkhomanob71/sim-medical-portal',
  [string]$Branch = 'v3-portal',
  [string]$Message = '',
  [string]$Root = (Split-Path -Parent (Split-Path -Parent $PSCommandPath)),
  [string]$StoreDir = (Join-Path $env:APPDATA 'sim-medical-portal'),
  [string[]]$Exclude = @('backups', '.git'),
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$api = 'https://api.github.com'
$storeFile = Join-Path $StoreDir 'github-token.dat'

function Fail($text) {
  Write-Host ''
  Write-Host $text -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host 'SIM Medical Portal - backup to GitHub' -ForegroundColor Magenta
Write-Host '-------------------------------------'

# ---------------------------------------------------------------- token
if (-not (Test-Path $storeFile)) {
  Fail "No saved login found. Run tools\setup-github-login.ps1 once, then try again."
}

try {
  $enc = (Get-Content -Path $storeFile -Raw).Trim()
  $secure = ConvertTo-SecureString $enc
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
} catch {
  Fail "Saved login could not be read. Run tools\setup-github-login.ps1 again."
}

if (-not $token) { Fail 'Saved login is empty. Run tools\setup-github-login.ps1 again.' }

$headers = @{
  Authorization = "Bearer $token"
  Accept        = 'application/vnd.github+json'
  'User-Agent'  = 'sim-medical-portal-backup'
}

function Invoke-GitHub {
  param([string]$Method, [string]$Uri, $Body)

  $params = @{ Method = $Method; Uri = $Uri; Headers = $headers; TimeoutSec = 60 }
  if ($null -ne $Body) {
    $params.ContentType = 'application/json; charset=utf-8'
    $params.Body = [System.Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 10 -Compress))
  }
  Invoke-RestMethod @params
}

# ---------------------------------------------------------------- repo
try {
  $info = Invoke-GitHub -Method Get -Uri "$api/repos/$Repo"
} catch {
  Fail "GitHub rejected the saved login (expired or revoked). Run tools\setup-github-login.ps1 again."
}

$branches = @()
try {
  $refs = Invoke-GitHub -Method Get -Uri "$api/repos/$Repo/git/matching-refs/heads/"
  $branches = @($refs | ForEach-Object { $_.ref -replace '^refs/heads/', '' })
} catch { }

$baseBranch = if ($branches -contains $Branch) { $Branch } else { $info.default_branch }
$baseRef = Invoke-GitHub -Method Get -Uri "$api/repos/$Repo/git/ref/heads/$baseBranch"
$baseSha = $baseRef.object.sha

Write-Host ("  repo    : " + $info.full_name + " (private: " + $info.private + ")")
Write-Host ("  branch  : $Branch  (base: $baseBranch)")
Write-Host ("  account : " + $info.owner.login)

# ---------------------------------------------------------------- files
$rootFull = (Resolve-Path $Root).Path.TrimEnd('\')
$files = Get-ChildItem -Path $rootFull -Recurse -File -Force | Where-Object {
  $rel = $_.FullName.Substring($rootFull.Length + 1)
  $skip = $false
  foreach ($dir in $Exclude) {
    if ($rel -eq $dir -or $rel.StartsWith($dir + '\')) { $skip = $true; break }
  }
  -not $skip
} | Sort-Object FullName

Write-Host ("  files   : " + $files.Count)

if ($DryRun) {
  $files | ForEach-Object { Write-Host ("    " + $_.FullName.Substring($rootFull.Length + 1)) }
  Write-Host '  dry run - nothing uploaded.'
  exit 0
}

$tree = New-Object System.Collections.ArrayList
$done = 0
foreach ($file in $files) {
  $done++
  $rel = $file.FullName.Substring($rootFull.Length + 1).Replace('\', '/')
  $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($file.FullName))
  $blob = Invoke-GitHub -Method Post -Uri "$api/repos/$Repo/git/blobs" -Body @{ content = $b64; encoding = 'base64' }
  [void]$tree.Add(@{ path = $rel; mode = '100644'; type = 'blob'; sha = $blob.sha })
  Write-Host ("    [" + $done + "/" + $files.Count + "] $rel")
}

$newTree = Invoke-GitHub -Method Post -Uri "$api/repos/$Repo/git/trees" -Body @{ tree = $tree.ToArray() }

$baseCommit = Invoke-GitHub -Method Get -Uri "$api/repos/$Repo/git/commits/$baseSha"
if ($baseCommit.tree.sha -eq $newTree.sha) {
  Write-Host ''
  Write-Host '  Nothing changed - branch already matches this folder.' -ForegroundColor Yellow
  Write-Host ("  " + $info.html_url + "/tree/" + $Branch)
  exit 0
}

if (-not $Message) {
  $Message = 'Backup ' + (Get-Date -Format 'yyyy-MM-dd HH:mm')
}

$commit = Invoke-GitHub -Method Post -Uri "$api/repos/$Repo/git/commits" -Body @{
  message = $Message
  tree    = $newTree.sha
  parents = @($baseSha)
}

if ($branches -contains $Branch) {
  $null = Invoke-GitHub -Method Patch -Uri "$api/repos/$Repo/git/refs/heads/$Branch" -Body @{ sha = $commit.sha; force = $false }
} else {
  $null = Invoke-GitHub -Method Post -Uri "$api/repos/$Repo/git/refs" -Body @{ ref = "refs/heads/$Branch"; sha = $commit.sha }
}

Write-Host ''
Write-Host '  Backup done.' -ForegroundColor Green
Write-Host ("  commit : " + $commit.sha.Substring(0, 7) + "  " + $Message)
Write-Host ("  url    : " + $info.html_url + "/tree/" + $Branch)
