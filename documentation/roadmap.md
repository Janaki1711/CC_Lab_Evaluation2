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

### [x] Phase 3: Containerization & Local Orchestration
- [x] Write optimized multi-stage Dockerfiles for all microservices.
- [x] Write Nginx API Gateway configuration (`nginx.conf`) and Dockerfile.
- [x] Build root `docker-compose.yml` orchestrating all 6 containers (PostgreSQL, MinIO, Auth, File, Metadata, Gateway).
- [x] Write automated smoke test verification script (`scripts/smoke_test.py`).
- [x] Verify inter-service networking, volumes, and health checks under Docker Compose.
- [x] Commit and push Phase 3 artifacts.

---

### [x] Phase 4: Kubernetes Cluster & Base Infrastructure
- [x] Write kind configuration for 1 control-plane and 3 worker nodes (`kind-config.yaml`).
- [x] Write Kubernetes manifests for Namespace, ConfigMaps, Secrets, and PVCs.
- [x] Deploy PostgreSQL StatefulSet and MinIO Deployment with Service definitions.
- [x] Deploy stateless microservices (Auth, File, Metadata, Gateway) with Liveness/Readiness probes.
- [x] Configure RBAC ServiceAccount for cluster telemetry queries.
- [x] Create cluster provisioning and deployment automation scripts.

---

### [x] Phase 5: Pod Affinity & Anti-Affinity Implementation
- [x] Define **Strategy 1 (Default Scheduling)** deployment manifests.
- [x] Define **Strategy 2 (Pod Affinity & Anti-Affinity)** deployment manifests.
- [x] Implement Pod Anti-Affinity across worker nodes (`topologyKey: kubernetes.io/hostname`).
- [x] Implement Pod Affinity co-locating File Service with Metadata Service.
- [x] Build automated deployment switcher script (`scripts/deploy_strategy.ps1`).

---

### [x] Phase 6: Autoscaling & Observability Infrastructure
- [x] Define Prometheus metrics scraping configurations for all microservices.
- [x] Configure Horizontal Pod Autoscaler (HPA) for File Service (**Strategy 3**).
- [x] Build in-app **Kubernetes Infrastructure Dashboard** in React showing live pod-to-node placement.
- [x] Implement interactive real-time placement strategy switcher.

---

### [x] Phase 7: Load Testing & Performance Benchmarking
- [x] Implement Locust load testing scripts (`locustfile.py`) with student and teacher user behaviors.
- [x] Support test scenarios with 50, 100, 250, and 500 concurrent users.
- [x] Benchmark multiple document payloads (100 KB, 1 MB, 5 MB, 10 MB).
- [x] Incorporate empirical evaluation matrix into the React UI.

---

### [x] Phase 8: Node Failure & Fault-Tolerance Simulation
- [x] Create controlled node failure automation script (`scripts/simulate_node_failure.ps1`).
- [x] Model blast radius and failover under Strategy 1 vs. Strategy 2.
- [x] Implement interactive node failure walkthrough inside the frontend.

---

### [x] Phase 9: Evaluation Report & Final Documentation
- [x] Consolidate experimental comparison tables and graphs.
- [x] Document reproducibility instructions from scratch.
- [x] Complete laboratory architecture documentation.
- [x] Multi-commit push to GitHub repository.
