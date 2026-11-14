# ==============================================================================
# Academic Platform - Local Backend Microservices Launcher (PowerShell)
# Launches Auth (8001), Metadata (8003), and File (8002) concurrently
# ==============================================================================
$Host.UI.RawUI.WindowTitle = "Academic Platform - Backend Microservices"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "STARTING LOCAL BACKEND MICROSERVICES FOR ACADEMIA CLOUD" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

Set-Location $RootDir
python scripts/start_all_services.py
