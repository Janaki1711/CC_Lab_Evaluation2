# Master Implementation Checklist & Roadmap

This checklist tracks progress across all nine phases of the project lifecycle. Each phase must be functional and verified before proceeding to the next.

---

### [x] Phase 1: Architecture and Planning
- [x] Finalize system architecture and microservices breakdown.
- [x] Define component responsibilities and failure domains.
- [x] Map out document upload, download, and authentication communication flows.
- [x] Design repository directory structure and clean git workflow.
- [x] Formulate PostgreSQL relational schema (users, documents, access logs) and DDL.
- [x] Formulate MinIO object storage bucket scheme and key structure.
- [x] Detail Kubernetes placement mechanics (Default, Soft/Hard Anti-Affinity, Affinity, HPA).
- [x] Commit and push foundational architecture and configuration specs to GitHub.

---

### [x] Phase 2: Functional Application Development
- [x] Implement Auth Service (FastAPI, JWT, bcrypt, role management: student/teacher/admin).
- [x] Implement Metadata Service (FastAPI, SQLAlchemy, CRUD for documents & audit logs).
- [x] Implement File Service (FastAPI, MinIO SDK, streaming upload/download, authorization checks).
- [x] Configure resilient local PostgreSQL and MinIO storage fallback managers.
- [x] Build React.js Frontend (Vite, TailwindCSS/Lucide, Auth, Student Portal, Teacher Portal).
- [x] Implement custom Light Academic Design System with zero dark theme.
- [x] Implement Live Placement Topology Map & Strategy Comparison interface.
- [x] Verify frontend build and Python compilation across all microservices.
- [x] Commit and push Phase 2 codebase.

---

### [ ] Phase 3: Containerization & Local Orchestration
- [ ] Write optimized multi-stage Dockerfiles for all microservices.
- [ ] Write Nginx API Gateway configuration (`nginx.conf`) and Dockerfile.
- [ ] Build root `docker-compose.yml` orchestrating all 6 containers.
- [ ] Verify inter-service networking, volumes, and health checks under Docker Compose.
- [ ] Commit and push Phase 3 artifacts.

---

### [ ] Phase 4: Kubernetes Cluster & Base Infrastructure
- [ ] Write kind configuration for 1 control-plane and 3 worker nodes (`kind-config.yaml`).
- [ ] Provision local 4-node kind cluster.
- [ ] Write Kubernetes manifests for Namespace, ConfigMaps, Secrets, and PVCs.
- [ ] Deploy PostgreSQL StatefulSet and MinIO Deployment with Service definitions.
- [ ] Deploy stateless microservices (Auth, File, Metadata, Gateway) with Liveness/Readiness probes.
- [ ] Verify full application functionality over Kubernetes Services and Ingress/NodePort.
- [ ] Commit and push Phase 4 manifests.

---

### [ ] Phase 5: Pod Affinity & Anti-Affinity Implementation
- [ ] Define **Strategy 1 (Default Scheduling)** deployment manifests.
- [ ] Define **Strategy 2 (Pod Affinity & Anti-Affinity)** deployment manifests.
- [ ] Verify pod-to-node placement using `kubectl get pods -o wide`.
- [ ] Benchmark Strict (`requiredDuringScheduling`) vs Flexible (`preferredDuringScheduling`) anti-affinity.
- [ ] Test node capacity saturation edge case (replicas > nodes).
- [ ] Commit and push Phase 5 manifests.

---

### [ ] Phase 6: Autoscaling & Observability Infrastructure
- [ ] Deploy Kubernetes Metrics Server in kind cluster.
- [ ] Deploy Prometheus and Grafana with pre-configured scrape configs and dashboards.
- [ ] Configure Horizontal Pod Autoscaler (HPA) for File Service (**Strategy 3**).
- [ ] Build the in-app **Kubernetes Infrastructure Dashboard** in React showing live pod-to-node placement.
- [ ] Verify HPA scaling triggers under artificial CPU load.
- [ ] Commit and push Phase 6 artifacts.

---

### [ ] Phase 7: Load Testing & Performance Benchmarking
- [ ] Implement Locust load testing scripts (`locustfile.py`) with student and teacher user behaviors.
- [ ] Test scenarios with 50, 100, 250, and 500 concurrent users.
- [ ] Benchmark multiple document payloads (100 KB, 1 MB, 5 MB, 10 MB).
- [ ] Execute benchmarking across Strategy 1, Strategy 2, and Strategy 3 under identical loads.
- [ ] Collect latency (P50, P95), throughput (RPS), CPU, and error metrics.
- [ ] Commit and push Phase 7 test suites and raw benchmark outputs.

---

### [ ] Phase 8: Node Failure & Fault-Tolerance Simulation
- [ ] Execute controlled node failure experiment (shutting down worker node 1).
- [ ] Measure failover downtime and error rates under Strategy 1 vs. Strategy 2.
- [ ] Track pod eviction, rescheduling, and recovery times.
- [ ] Record and analyze availability differences.
- [ ] Commit and push Phase 8 experimental results and test scripts.

---

### [ ] Phase 9: Evaluation Report & Final Documentation
- [ ] Consolidate experimental comparison tables and graphs.
- [ ] Document reproducibility instructions from scratch.
- [ ] Complete executive laboratory report answering core research questions.
- [ ] Final tag and push to GitHub repository.
