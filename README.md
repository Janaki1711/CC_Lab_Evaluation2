# Kubernetes-Based Intelligent Application Placement and Fault-Tolerant Distributed File Storage System

> **Cloud Computing Laboratory Evaluation 2**  
> **Course:** Cloud Computing (Sem 5)  
> **Repository:** [Janaki1711/CC_Lab_Evaluation2](https://github.com/Janaki1711/CC_Lab_Evaluation2)

---

## 1. Project Overview

This project designs, deploys, and benchmarks a cloud-native **University Document Submission and Management Platform** deployed on a multi-node Kubernetes cluster.

While serving as a functional document platform where students submit assignments and teachers grade and download records, the core academic objective is to **investigate how Kubernetes Pod Affinity and Anti-Affinity policies dictate application placement, system performance, inter-service network latency, and fault tolerance under high concurrency and node failure conditions**.

### Core Research Questions
1. **Pod Affinity:** Does co-locating tightly coupled microservices (`file-service` and `metadata-service`) on the same worker node measurably reduce inter-service RPC latency compared to default scheduling?
2. **Pod Anti-Affinity:** How does enforcing pod spread across worker nodes via `requiredDuringScheduling` vs `preferredDuringScheduling` insulate client traffic from node failures?
3. **Autoscaling Interaction:** How does the Kubernetes Horizontal Pod Autoscaler (HPA) interact with strict Anti-Affinity constraints when replica demand exceeds physical node capacity?

---

## 2. Architecture At A Glance

```
                                  +-----------------------------+
                                  |   React.js Client Portal   |
                                  +-----------------------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |   NGINX API Gateway (:80)   |
                                  +-----------------------------+
                                       /         |          \
           +--------------------------+          |           +--------------------------+
           |                                     |                                      |
           v                                     v                                      v
+----------------------+             +----------------------+             +----------------------+
|  Auth Service (:8001)|             |  File Service (:8002)|<----------->|Metadata Svc (:8003)  |
|  FastAPI / JWT / RBAC|             |  FastAPI / MinIO SDK | Inter-SVC   |FastAPI / PostgreSQL  |
+----------------------+             +----------------------+   Traffic   +----------------------+
           |                                     |                                      |
           v                                     v                                      v
+----------------------+             +----------------------+             +----------------------+
|   PostgreSQL (:5432) |             |  MinIO Storage(:9000)|             |   PostgreSQL (:5432) |
|  Accounts & Roles    |             |  Raw Academic Blobs  |             |  Doc Records & Audits|
+----------------------+             +----------------------+             +----------------------+
```

---

## 3. Placement Strategies Compared

1. **Strategy 1: Default Scheduling (Baseline)**
   - Standard Kubernetes scheduler heuristic (`NodeResourcesFit` + default scoring).
   - No affinity or anti-affinity annotations.
2. **Strategy 2: Pod Affinity & Anti-Affinity (Placement Optimized)**
   - **Pod Anti-Affinity:** Spreads `file-service` replicas across distinct worker nodes using topology key `kubernetes.io/hostname`.
   - **Pod Affinity:** Encourages `file-service` pods to co-locate with `metadata-service` to minimize inter-service network hops.
3. **Strategy 3: Combined Placement & Autoscaling (HPA)**
   - Dynamic replica scaling based on CPU utilization (target 60%).
   - Demonstrates behavior when pod scaling exceeds available node topology.

---

## 4. Repository Structure

```
.
├── frontend/                               # React.js SPA (Vite + TailwindCSS + Recharts)
│   ├── src/
│   │   ├── components/                     # Navigation, Modals, Dashboards
│   │   ├── pages/                          # Student, Teacher, K8s Topology, Benchmarks
│   │   └── services/                       # API clients
│   └── package.json
├── services/
│   ├── api-gateway/                        # NGINX reverse proxy & ingress config
│   ├── auth-service/                       # FastAPI authentication & JWT microservice
│   ├── file-service/                       # FastAPI streaming MinIO file management service
│   └── metadata-service/                   # FastAPI PostgreSQL metadata & K8s topology service
├── infrastructure/
│   ├── docker/                             # Dockerfiles & local build configurations
│   ├── kubernetes/
│   │   ├── base/                           # Namespaces, ConfigMaps, Secrets, StorageClasses
│   │   ├── strategy-1-default/             # Baseline scheduling manifests
│   │   ├── strategy-2-affinity/            # Pod Affinity & Anti-Affinity manifests
│   │   └── strategy-3-autoscaling/         # Combined HPA + Affinity manifests
│   ├── storage/                            # PostgreSQL StatefulSet & MinIO manifests
│   └── monitoring/                         # Prometheus & Grafana configurations
├── load-testing/
│   ├── locustfile.py                       # User simulation scripts (Upload, Download, Search)
│   └── scenarios/                          # Configurable test runs (50, 100, 250, 500 users)
├── scripts/                                # Automation scripts (kind setup, deploy, failover)
├── documentation/                          # Detailed architecture, schemas, and reports
├── docker-compose.yml                      # Local development multi-container orchestration
├── .env.example                            # Configuration environment template
└── README.md
```

---

## 5. Development Progress Checklist

- [x] **Phase 1: Architecture and Planning**
- [x] **Phase 2: Functional Application Development**
- [x] **Phase 3: Containerization & Local Orchestration**
- [ ] **Phase 4: Kubernetes Cluster & Base Infrastructure**
- [ ] **Phase 5: Pod Affinity & Anti-Affinity Implementation**
- [ ] **Phase 6: Autoscaling & Observability Infrastructure**
- [ ] **Phase 7: Load Testing & Performance Benchmarking**
- [ ] **Phase 8: Node Failure & Fault-Tolerance Simulation**
- [ ] **Phase 9: Evaluation Report & Final Documentation**

For the detailed phase-by-phase breakdown and status, refer to [documentation/roadmap.md](documentation/roadmap.md).
