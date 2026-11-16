param(
    [ValidateSet(
        "strategy-1-default",
        "strategy-2a-locality",
        "strategy-2-affinity",
        "strategy-2b-spread",
        "strategy-3-autoscaling",
        "strategy-4-combined"
    )]
    [string]$Strategy = "strategy-4-combined"
)

$ErrorActionPreference = "Stop"
$Namespace = "academic-docs"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "DEPLOYING ACADEMIC PLATFORM UNDER: $Strategy" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

# 1. Apply Base Resources
Write-Host ">>> Deploying Namespace, Configs, Secrets, Storage & Core Services..." -ForegroundColor Yellow
kubectl apply -f infrastructure/kubernetes/base/namespace.yaml
kubectl apply -f infrastructure/kubernetes/base/configmap.yaml
kubectl apply -f infrastructure/kubernetes/base/secrets.yaml
kubectl apply -f infrastructure/kubernetes/base/storage-pv-pvc.yaml
kubectl apply -f infrastructure/kubernetes/base/postgres.yaml
kubectl apply -f infrastructure/kubernetes/base/minio.yaml
kubectl apply -f infrastructure/kubernetes/base/auth-service.yaml
kubectl apply -f infrastructure/kubernetes/base/metadata-service.yaml
kubectl apply -f infrastructure/kubernetes/base/redis.yaml
kubectl apply -f infrastructure/kubernetes/base/booking-service.yaml
kubectl apply -f infrastructure/kubernetes/base/api-gateway.yaml

# 2. Apply Selected Strategy
Write-Host "`n>>> Applying Placement Strategy: $Strategy..." -ForegroundColor Yellow
if ($Strategy -eq "strategy-1-default") {
    # Config A: None / None / HPA Off
    kubectl apply -f infrastructure/kubernetes/strategy-1-default/file-service-default.yaml
    kubectl delete hpa file-service-hpa -n $Namespace --ignore-not-found
} elseif ($Strategy -eq "strategy-2a-locality") {
    # Config B: Preferred Affinity Only / None / HPA Off
    kubectl apply -f infrastructure/kubernetes/strategy-2a-locality/file-service-locality-only.yaml
    kubectl delete hpa file-service-hpa -n $Namespace --ignore-not-found
} elseif ($Strategy -eq "strategy-2-affinity") {
    # Legacy Alias for Combined Affinity + Anti-Affinity (No HPA)
    kubectl apply -f infrastructure/kubernetes/strategy-2-affinity/file-service-affinity.yaml
    kubectl delete hpa file-service-hpa -n $Namespace --ignore-not-found
} elseif ($Strategy -eq "strategy-2b-spread") {
    # Config C: None / Preferred Anti-Affinity / HPA On
    kubectl apply -f infrastructure/kubernetes/strategy-2b-spread/file-service-spread-only.yaml
} else {
    # Config D: Combined Affinity + Anti-Affinity + HPA On (strategy-3-autoscaling / strategy-4-combined)
    kubectl apply -f infrastructure/kubernetes/strategy-3-autoscaling/file-service-hpa.yaml
}

Write-Host "`n>>> Waiting for microservices to reach Ready state..." -ForegroundColor Cyan
kubectl rollout status deployment/auth-service -n $Namespace --timeout=120s
kubectl rollout status deployment/metadata-service -n $Namespace --timeout=120s
kubectl rollout status deployment/bms-redis -n $Namespace --timeout=120s
kubectl rollout status deployment/booking-service -n $Namespace --timeout=120s
kubectl rollout status deployment/file-service -n $Namespace --timeout=120s
kubectl rollout status deployment/api-gateway -n $Namespace --timeout=120s

Write-Host "`n>>> VERIFYING ACTUAL POD-TO-NODE PLACEMENT:" -ForegroundColor Green
kubectl get pods -n $Namespace -o wide

Write-Host "`n>>> Strategy '$Strategy' successfully deployed and verified!" -ForegroundColor Green
