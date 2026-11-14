# ==============================================================================
# Controlled Node Failure & Fault Tolerance Simulator
# Shuts down kind-worker (Compute Node 1) and observes replica failover
# ==============================================================================
param(
    [string]$TargetNode = "academic-cloud-cluster-worker"
)

$Namespace = "academic-docs"

Write-Host "========================================================================" -ForegroundColor Red
Write-Host "CONTROLLED NODE FAILURE EXPERIMENT: $TargetNode" -ForegroundColor Red
Write-Host "========================================================================" -ForegroundColor Red

Write-Host "`n>>> 1. Capturing Initial Pod Distribution..." -ForegroundColor Cyan
kubectl get pods -n $Namespace -o wide

Write-Host "`n>>> 2. Halting Docker container for worker node: $TargetNode..." -ForegroundColor Yellow
$startTime = Get-Date
docker stop $TargetNode

Write-Host "`n>>> 3. Worker container stopped! Monitoring Kubernetes node status..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
kubectl get nodes

Write-Host "`n>>> 4. Monitoring Application Pods and Rescheduling Status..." -ForegroundColor Cyan
for ($i = 1; $i -le 6; $i++) {
    Write-Host "`n[Check $i/6 - Elapsed: $([int]((Get-Date) - $startTime).TotalSeconds)s]" -ForegroundColor White
    kubectl get pods -n $Namespace -o wide --show-labels
    Start-Sleep -Seconds 5
}

Write-Host "`n>>> 5. Restoring Worker Node Container..." -ForegroundColor Green
docker start $TargetNode
Start-Sleep -Seconds 10
kubectl get nodes

Write-Host "`n>>> 6. Final Cluster State Post-Recovery:" -ForegroundColor Green
kubectl get pods -n $Namespace -o wide
Write-Host "`nExperiment complete. Check documentation/roadmap.md for benchmark logs." -ForegroundColor Green
