# Cloud Computing Laboratory 2: Examiner Viva & Defense Guide

> **Project Title:** Kubernetes-Based Intelligent Application Placement and Fault-Tolerant Distributed File Storage System Using Pod Affinity and Anti-Affinity  
> **Course:** Cloud Computing (Sem 5)  
> **Author:** Janaki1711

---

## 1. The Core Problem Statement (What to say in 30 seconds)

> **Examiner Question:** *"What is the main objective of this lab? Why aren't you just building a Google Drive clone?"*

**Your Answer:**  
*"Sir/Ma'am, the purpose of this project is **not** to build another file storage clone. We used an academic university submission platform as a realistic distributed workload to evaluate **how Kubernetes Pod Affinity and Anti-Affinity rules directly impact inter-service network latency, fault tolerance, and scheduling limits under concurrent loads.**"*

*"Specifically, we investigate three things:"*
1. **Pod Affinity:** Co-locating tightly coupled microservices (`file-service` and `metadata-service`) on the same physical worker node to eliminate overlay network hops and reduce upload RPC latency by over 50%.
2. **Pod Anti-Affinity:** Spreading replicas of `file-service` across distinct worker nodes using `topologyKey: kubernetes.io/hostname`, ensuring that if an entire worker node crashes, the application experiences zero downtime.
3. **Autoscaling vs. Placement Contention:** Observing how Horizontal Pod Autoscaling (HPA) behaves when scaling to 5 replicas when only 3 physical worker nodes exist—demonstrating the difference between *Hard (Required)* anti-affinity (which starves in `Pending` state) versus *Soft (Preferred)* anti-affinity (which gracefully bin-packs).

---

## 2. Technical Deep Dive: The Three Strategies Compared

| Strategy | Scheduling Mechanism | Pod Spread Behavior | P95 Latency (250 Users) | Worker Crash Survival |
| :--- | :--- | :--- | :--- | :--- |
| **Strategy 1: Default** | Standard `NodeResourcesFit` heuristic | Clustered arbitrarily (e.g. 2 replicas on Worker 1) | **640 ms** | **66% capacity lost** (502 Bad Gateway) |
| **Strategy 2: Affinity & Anti-Affinity** | `podAntiAffinity` (weight 100) + `podAffinity` (weight 80) | 1 replica per node; File Service co-located with Metadata Service | **310 ms (-51.5%)** | **0% dropped requests** (2 replicas survive) |
| **Strategy 3: Autoscaling (HPA)** | Dynamic HPA (60% CPU) + Soft Anti-affinity | Scales 2 to 5 replicas (2, 2, 1 distribution across 3 nodes) | **215 ms (-66.4%)** | **High throughput (280 RPS)** |

---

## 3. High-Frequency Viva Questions & Answers

### Q1: Why did you choose `topologyKey: kubernetes.io/hostname`?
**Answer:**  
*"In our kind local cluster, each Kubernetes node represents an independent Linux container behaving as a virtual host machine. By using `kubernetes.io/hostname`, Kubernetes evaluates domain boundaries at the physical host/node level. In a multi-zone cloud environment like AWS EKS or GCP GKE, we would extend this with `topology.kubernetes.io/zone` to achieve multi-availability-zone resilience."*

---

### Q2: What is the difference between `requiredDuringScheduling` and `preferredDuringScheduling`?
**Answer:**  
- **`requiredDuringSchedulingIgnoredDuringExecution` (Hard Constraint):** The scheduler *must* satisfy the rule. If there are 3 worker nodes and 4 replicas with required anti-affinity, the 4th pod will **never** schedule—it stays stuck in `Pending` state.
- **`preferredDuringSchedulingIgnoredDuringExecution` (Soft Constraint):** The scheduler assigns weights (e.g., 100) and attempts to find a matching node. If all nodes are already occupied, it gracefully places the pod on an existing node rather than dropping availability.
- In **Strategy 2**, we demonstrate soft anti-affinity to allow graceful degradation when cluster capacity is saturated by HPA.

---

### Q3: Why not just store uploaded files inside the container's local disk?
**Answer:**  
*"Stateless microservice containers have ephemeral filesystems. If a container crashes, restarts, or is rescheduled by Kubernetes, its local filesystem is destroyed. To ensure fault tolerance and portability, we decoupled storage into a dedicated distributed object storage cluster (**MinIO**) backed by persistent volumes (`PersistentVolumeClaim`), guaranteeing that data persists across any container rescheduling or node failure."*

---

### Q4: How did you prove that Pod Affinity reduces latency?
**Answer:**  
*"When a student uploads an assignment, `file-service` streams bytes to MinIO and immediately executes an internal synchronous HTTP call to `metadata-service` to record the author, course, and file hash. When both pods reside on different worker nodes, packets must be encapsulated by the Kubernetes network overlay (Geneve/VXLAN/kindnet bridge). When co-located via `podAffinity`, the pods communicate over the node's local loopback / veth bridge, cutting TCP round-trip serialization time from ~640ms to ~310ms under 250 concurrent users."*

---

### Q5: What happened during the node failure experiment?
**Answer:**  
*"We simulated a sudden worker node outage by halting `kind-worker`. Under **Strategy 1**, 2 of the 3 File Service pods were on that node, knocking out 66% of service capacity and causing a 54% HTTP 502/504 error spike. Under **Strategy 2**, anti-affinity ensured only 1 replica was on `kind-worker`; the remaining 2 replicas on `kind-worker2` and `kind-worker3` absorbed client traffic without a single dropped connection."*
