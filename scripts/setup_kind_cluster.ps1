# ==============================================================================
# KIND Cluster Provisioning Automation
# Provisions 1 Control-Plane Node and 3 Worker Nodes
# ==============================================================================
$ErrorActionPreference = "Stop"

$ClusterName = "academic-cloud-cluster"
$ConfigPath = "infrastructure/kubernetes/base/kind-config.yaml"

Write-Host ">>> Checking if kind cluster '$ClusterName' exists..." -ForegroundColor Cyan
$existing = kind get clusters 2>$null
if ($existing -contains $ClusterName) {
    Write-Host "Cluster '$ClusterName' already exists. Deleting for fresh evaluation setup..." -ForegroundColor Yellow
    kind delete cluster --name $ClusterName
}

Write-Host ">>> Creating 4-node kind cluster from $ConfigPath..." -ForegroundColor Green
kind create cluster --config $ConfigPath

Write-Host ">>> Waiting for nodes to be ready..." -ForegroundColor Cyan
kubectl wait --for=condition=Ready nodes --all --timeout=120s

Write-Host ">>> Cluster Nodes Status:" -ForegroundColor Green
kubectl get nodes -o wide --show-labels

Write-Host "`n>>> KIND Cluster Successfully Initialized with 1 Control-Plane and 3 Worker Nodes!" -ForegroundColor Green
