# ==============================================================================
# Automated K6 Benchmark Suite Runner
# Runs Baseline (100 users), Mixed (500 users), and Peak (1000 users) workloads
# ==============================================================================
param(
    [ValidateSet("upload", "download", "mixed", "all")]
    [string]$TestType = "mixed",

    [ValidateSet("baseline", "mixed", "peak")]
    [string]$Profile = "mixed",

    [string]$BaseUrl = "http://localhost:80"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "       K6 CONCURRENT WORKLOAD BENCHMARK RUNNER" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "• Test Target:  $BaseUrl" -ForegroundColor White
Write-Host "• Workload:     $TestType" -ForegroundColor White
Write-Host "• Profile:      $Profile" -ForegroundColor White
Write-Host "------------------------------------------------------------------------" -ForegroundColor Gray

# Check if k6 is installed
$k6Check = Get-Command k6 -ErrorAction SilentlyContinue
if (-not $k6Check) {
    Write-Host "[ERROR] k6 binary not found in PATH!" -ForegroundColor Red
    Write-Host "Install k6 via winget:  winget install k6 --source winget" -ForegroundColor Yellow
    Write-Host "Or download from:       https://k6.io/docs/get-started/installation/" -ForegroundColor Yellow
    exit 1
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Run-Script($scriptName, $label) {
    $scriptPath = Join-Path $ScriptDir $scriptName
    Write-Host "`n>>> Running $label ($scriptName)..." -ForegroundColor Green
    & k6 run --env "BASE_URL=$BaseUrl" --env "TEST_PROFILE=$Profile" $scriptPath
}

if ($TestType -eq "upload" -or $TestType -eq "all") {
    Run-Script "upload-test.js" "Concurrent Upload Benchmark"
}

if ($TestType -eq "download" -or $TestType -eq "all") {
    Run-Script "download-test.js" "Concurrent Download Benchmark"
}

if ($TestType -eq "mixed" -or $TestType -eq "all") {
    Run-Script "mixed-workload.js" "Mixed Realistic Workload (60% Down / 25% Up / 10% List / 5% Del)"
}

Write-Host "`n>>> All k6 benchmark runs completed successfully!" -ForegroundColor Green
