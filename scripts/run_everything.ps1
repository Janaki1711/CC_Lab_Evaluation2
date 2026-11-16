# ==============================================================================
# BookMyShow High-Concurrency Engine - One-Click Launcher
# Starts Backend Microservices + Frontend Dev Server + Opens Browser
# ==============================================================================
$Host.UI.RawUI.WindowTitle = "BookMyShow High-Concurrency Platform - Controller"
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

Write-Host "========================================================================" -ForegroundColor Red
Write-Host "      BOOKMYSHOW HIGH-CONCURRENCY FLASH-SALE & TICKETING PLATFORM" -ForegroundColor Red
Write-Host "========================================================================" -ForegroundColor Red
Write-Host ">>> 1. Starting Backend Microservices (Auth, Metadata, File, Booking)..." -ForegroundColor Yellow

$backendJob = Start-Process -FilePath "python" -ArgumentList "scripts/start_all_services.py" -PassThru -NoNewWindow

Write-Host ">>> Waiting 4 seconds for microservices initialization..." -ForegroundColor Gray
Start-Sleep -Seconds 4

# Check health of all 4 services
try {
    $authHealth = Invoke-RestMethod -Uri "http://127.0.0.1:8001/health" -Method Get -TimeoutSec 3
    Write-Host "  [OK] Auth Service:     http://localhost:8001 (JWT, RBAC) - HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Auth Service not responding yet on 8001" -ForegroundColor Yellow
}

try {
    $metaHealth = Invoke-RestMethod -Uri "http://127.0.0.1:8003/health" -Method Get -TimeoutSec 3
    Write-Host "  [OK] Metadata Service: http://localhost:8003 (Schema & K8s Telemetry) - HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Metadata Service not responding yet on 8003" -ForegroundColor Yellow
}

try {
    $fileHealth = Invoke-RestMethod -Uri "http://127.0.0.1:8002/health" -Method Get -TimeoutSec 3
    Write-Host "  [OK] File Service:     http://localhost:8002 (Storage Engine) - HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] File Service not responding yet on 8002" -ForegroundColor Yellow
}

try {
    $bookHealth = Invoke-RestMethod -Uri "http://127.0.0.1:8004/health" -Method Get -TimeoutSec 3
    Write-Host "  [OK] Booking Service:  http://localhost:8004 (High-Concurrency Engine) - HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Booking Service not responding yet on 8004" -ForegroundColor Yellow
}

Write-Host "`n>>> 2. Launching Vite Cinema Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootDir\frontend'; npm run dev"

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host "`n========================================================================" -ForegroundColor Green
Write-Host "SYSTEM RUNNING SUCCESSFULLY!" -ForegroundColor Green
Write-Host "• Frontend UI:         http://localhost:3000" -ForegroundColor White
Write-Host "• Booking Engine:      http://localhost:8004" -ForegroundColor White
Write-Host "• Auth Microservice:   http://localhost:8001" -ForegroundColor White
Write-Host "• File Microservice:   http://localhost:8002" -ForegroundColor White
Write-Host "• Metadata Service:    http://localhost:8003" -ForegroundColor White
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "Press Ctrl+C in this terminal window to stop the backend microservices.`n" -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host "`nStopping backend services..." -ForegroundColor Yellow
    Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
    Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $PID } | Stop-Process -Force -ErrorAction SilentlyContinue
}
