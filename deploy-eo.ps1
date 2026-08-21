# Build blog + merge edge-functions + deploy to EdgeOne Pages (Makers) via CLI
# Usage:
#   1. Install CLI once:   npm i -g edgeone
#   2. Set env vars:       $env:EO_BLOG_PROJECT="<your-pages-project-name>"
#                          $env:EO_BLOG_TOKEN="<your-edgeone-api-token>"
#   3. Run:                powershell -ExecutionPolicy Bypass -File deploy-eo.ps1
# Note: your Pages project must already be bound to x1anyu.cn in the EO console
# (domain binding is NOT done by this script).

$ErrorActionPreference = "Stop"

$repo    = "F:\Admin\Desktop\blog\my-blog"
$tmp     = Join-Path $repo ".deploy-tmp"
$project = $env:EO_BLOG_PROJECT
$token   = $env:EO_BLOG_TOKEN

if (-not $project -or -not $token) {
    Write-Host "Missing env: set EO_BLOG_PROJECT and EO_BLOG_TOKEN first." -ForegroundColor Red
    exit 1
}

Set-Location $repo

Write-Host "[1/4] Building blog (pnpm build)..." -ForegroundColor Cyan
pnpm build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed." -ForegroundColor Red; exit 1 }

Write-Host "[2/4] Merging dist + edge-functions into $tmp ..." -ForegroundColor Cyan
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null
Copy-Item -Path (Join-Path $repo "dist\*") -Destination $tmp -Recurse -Force
Copy-Item -Path (Join-Path $repo "edge-functions") -Destination $tmp -Recurse -Force
if (Test-Path (Join-Path $repo "edgeone.json")) {
    Copy-Item -Path (Join-Path $repo "edgeone.json") -Destination $tmp -Force
}

Write-Host "[3/4] Deploying to EdgeOne Pages project '$project' ..." -ForegroundColor Cyan
edgeone makers deploy $tmp -n $project -t $token
if ($LASTEXITCODE -ne 0) { Write-Host "Deploy failed." -ForegroundColor Red; exit 1 }

Write-Host "[4/4] Cleaning up temp dir..." -ForegroundColor Cyan
Remove-Item $tmp -Recurse -Force

Write-Host "Done. Verify:" -ForegroundColor Green
Write-Host '  curl "https://x1anyu.cn/file/youlian/x1anyu.cn.png"' -ForegroundColor Yellow
Write-Host '  Expect HTTP 200 (image/png), not 404.' -ForegroundColor Yellow
