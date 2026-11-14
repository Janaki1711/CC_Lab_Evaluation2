# Kubernetes Pod Placement Strategies & Scheduling Mechanics

## 1. Overview of the Scheduling Problem

In a distributed cloud-native architecture, where application pods are placed directly impacts:
1. **Network Latency:** Communicating microservices placed on separate nodes incur overlay network packet encapsulation (e.g., VXLAN, Geneve, or kindnet bridge), introducing serialization latency. Co-located pods communicate over the node's local loopback or veth pairs.
2. **Fault Tolerance & Availability:** If all replicas of a stateless service land on the same physical or virtual worker node, failure of that single node causes immediate total service outage until pods are rescheduled.
3. **Resource Contention:** Concentrating compute-intensive pods on one node leads to CPU throttling and memory pressure, whereas spreading pods evenly balances node resource utilization.

---

## 2. Cluster Topology Reference

The laboratory cluster consists of four nodes built via `kind` (Kubernetes IN Docker):

```
+-------------------------------------------------------------+
|                  kind-control-plane                         |
|  (API Server, Controller Manager, Scheduler, etcd)         |
+-------------------------------------------------------------+
          |                      |                     |
+-------------------+  +-------------------+  +-------------------+
|    kind-worker    |  |   kind-worker2    |  |   kind-worker3    |
|  (Compute Node 1) |  |  (Compute Node 2) |  |  (Compute Node 3) |
+-------------------+  +-------------------+  +-------------------+
```

Topology Key used: `kubernetes.io/hostname` (evaluates node uniqueness based on node hostname).

---

## 3. Placement Strategy Definitions

### Strategy 1: Default Kubernetes Scheduling (Baseline)

In default scheduling, no affinity or anti-affinity rules are attached to the pod specifications.

- **Scheduling Algorithm:** The `kube-scheduler` filters nodes based on resource requests (`NodeResourcesFit`), image availability, and port conflicts, then scores remaining nodes based on `NodeResourcesBalancedAllocation` and default spread priorities.
- **Expected Behavior:** Under light loads, replicas often concentrate on one or two nodes. When a node fails, multiple replicas may be knocked offline simultaneously. Inter-service traffic between `file-service` and `metadata-service` crosses node boundaries arbitrarily.

```yaml
# Strategy 1 Spec snippet (services/file-service)
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: file-service
        strategy: default
    spec:
      containers:
      - name: file-service
        image: file-service:latest
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
```

---

### Strategy 2: Pod Affinity & Anti-Affinity (Placement Optimized)

Combines two complementary placement mechanisms:

#### A. Pod Anti-Affinity (High Availability Spread)
Ensures that replicas of `file-service` are distributed across different worker nodes to eliminate single-node failure blast radius.

- **Strict Mode (Required):**
  `requiredDuringSchedulingIgnoredDuringExecution`
  The scheduler will refuse to place two `file-service` pods on the same node. If replica count ($N$) > eligible worker nodes ($M$), $N - M$ pods will remain in `Pending` state.
- **Soft Mode (Preferred):**
  `preferredDuringSchedulingIgnoredDuringExecution` (Weight: 100)
  The scheduler assigns high priority scores to nodes that do NOT yet run a `file-service` pod. If nodes are exhausted, it will gracefully place additional pods on occupied nodes.

#### B. Pod Affinity (Inter-Service Co-location)
`file-service` and `metadata-service` engage in frequent synchronous HTTP API calls during upload verification and download authorization.
We define a preferred pod affinity rule on `file-service` directing it toward nodes running `metadata-service`:

```yaml
# Strategy 2 Spec snippet (services/file-service)
affinity:
  # Pod Anti-Affinity: Spread file-service replicas across distinct worker nodes
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - file-service
        topologyKey: "kubernetes.io/hostname"

  # Pod Affinity: Co-locate with metadata-service to minimize inter-service RPC latency
  podAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 80
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - metadata-service
        topologyKey: "kubernetes.io/hostname"
```

---

### Strategy 3: Combined Placement & Horizontal Pod Autoscaling (HPA)

Adds dynamic scalability on top of Strategy 2.

- **Scaling Driver:** CPU Utilization threshold (target: 60%).
- **Autoscaling Boundaries:** `minReplicas: 2`, `maxReplicas: 6`.
- **Key Experimental Question:**
  *What happens when HPA scales `file-service` to 4, 5, or 6 replicas while the cluster only has 3 worker nodes?*
  - Under `requiredDuringSchedulingIgnoredDuringExecution`, scaling stalls at 3 replicas; pods 4, 5, 6 remain in `Pending` state with event `0/3 nodes are available: 3 node(s) had untolerated pod anti-affinity`.
  - Under `preferredDuringSchedulingIgnoredDuringExecution`, HPA successfully scales all 6 replicas, placing 2 replicas per worker node while maintaining maximum achievable spread.

```yaml
# Strategy 3 HPA Configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: file-service-hpa
  namespace: academic-docs
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: file-service
  minReplicas: 2
  maxReplicas: 6
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60
```

---

## 4. Experimental Metrics & Evaluation Matrix

| Metric | Measurement Tool | Significance |
| :--- | :--- | :--- |
| **P50 / P95 Request Latency (ms)** | Locust & Prometheus | Evaluates the effect of pod co-location vs. cross-node network hops |
| **Requests Per Second (RPS)** | Locust | Measures total system throughput under concurrency |
| **Pod Distribution Across Nodes** | `kubectl get pods -o wide` / Dashboard | Verifies anti-affinity spread and affinity co-location |
| **Failover Downtime (seconds)** | Locust / Custom script | Measures service availability when a worker node is abruptly halted |
| **Available Replicas Post-Crash** | Prometheus `kube_deployment_status_replicas_available` | Quantifies immediate fault isolation |
| **Node Resource Balance (std dev)** | Prometheus `node_cpu_seconds_total` | Evaluates if pod distribution avoids hot-spotting |
