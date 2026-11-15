# ==============================================================================
# Automated Docker Image Builder & KIND Sideload Script
# Builds all 5 custom microservice containers and loads them into KIND
# ==============================================================================
param(
    [switch]$LoadToKind = $true,
    [string]$ClusterName = "academic-cloud-cluster"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "         BUILDING DOCKER CONTAINERS FOR ACADEMIC PLATFORM" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

$images = @(
    @{ Name = "auth-service:latest";     Context = "services/auth-service";     Dockerfile = "services/auth-service/Dockerfile" },
    @{ Name = "file-service:latest";     Context = "services/file-service";     Dockerfile = "services/file-service/Dockerfile" },
    @{ Name = "metadata-service:latest"; Context = "services/metadata-service"; Dockerfile = "services/metadata-service/Dockerfile" },
    @{ Name = "api-gateway:latest";      Context = "services/api-gateway";      Dockerfile = "services/api-gateway/Dockerfile" },
    @{ Name = "frontend:latest";         Context = "frontend";                  Dockerfile = "frontend/Dockerfile" }
)

foreach ($img in $images) {
    Write-Host "`n>>> Building Docker Container: $($img.Name)..." -ForegroundColor Yellow
    docker build -t $img.Name -f $img.Dockerfile $img.Context
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to build $($img.Name)" -ForegroundColor Red
        exit 1
    }
    Write-Host "[SUCCESS] Image $($img.Name) built cleanly." -ForegroundColor Green
}

if ($LoadToKind) {
    Write-Host "`n========================================================================" -ForegroundColor Cyan
    Write-Host ">>> Loading Built Docker Images into KIND Cluster: '$ClusterName'..." -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan

    $existing = kind get clusters 2>$null
    if ($existing -contains $ClusterName) {
        foreach ($img in $images) {
            Write-Host "  -> Sideloading $($img.Name) into kind..." -ForegroundColor Gray
            kind load docker-image $img.Name --name $ClusterName
        }
        Write-Host "`n[SUCCESS] All container images are available inside the KIND cluster nodes!" -ForegroundColor Green
    } else {
        Write-Host "[INFO] KIND cluster '$ClusterName' not currently active. Images built on host." -ForegroundColor Yellow
        Write-Host "       Run setup_kind_cluster.ps1, then re-run this script with -LoadToKind." -ForegroundColor Yellow
    }
}

Write-Host "`n>>> Docker container build workflow complete!" -ForegroundColor Green
