# ==============================================================================
# KIND Cluster Provisioning Automation
# Provisions 1 Control-Plane Node and 3 Worker Nodes
# ==============================================================================
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

$ClusterName = "academic-cloud-cluster"
$ConfigPath = Join-Path $RootDir "infrastructure\kubernetes\base\kind-config.yaml"
$MetricsPath = Join-Path $RootDir "infrastructure\kubernetes\base\metrics-server.yaml"

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

Write-Host ">>> Applying topology zone and worker labels to nodes..." -ForegroundColor Cyan
kubectl label node academic-cloud-cluster-worker node-role.kubernetes.io/worker="" topology.kubernetes.io/zone="zone-a" --overwrite
kubectl label node academic-cloud-cluster-worker2 node-role.kubernetes.io/worker="" topology.kubernetes.io/zone="zone-b" --overwrite
kubectl label node academic-cloud-cluster-worker3 node-role.kubernetes.io/worker="" topology.kubernetes.io/zone="zone-c" --overwrite

Write-Host ">>> Deploying Kubernetes Metrics Server (required for HPA & kubectl top)..." -ForegroundColor Cyan
kubectl apply -f $MetricsPath

Write-Host ">>> Cluster Nodes Status:" -ForegroundColor Green
kubectl get nodes -o wide --show-labels

Write-Host "`n>>> KIND Cluster Successfully Initialized with 1 Control-Plane and 3 Worker Nodes!" -ForegroundColor Green
