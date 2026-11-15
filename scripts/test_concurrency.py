#!/usr/bin/env python3
"""
================================================================================
CONCURRENT LOAD TESTING SCRIPT (50-60 CONCURRENT USERS)
Academic Cloud Platform - Kubernetes Placement & Anti-Affinity Evaluation
================================================================================
Simulates 50-60 simultaneous concurrent users executing mixed workloads:
  • 60% Document Downloads / Retrieval
  • 25% Document Uploads (with binary payloads)
  • 10% Metadata Listing & Filtering
  • 5% Health & Cluster Topology Checks
Calculates p50, p95, p99 latency, RPS, and success rate under load.
================================================================================
"""

import sys
import io
import time
import uuid
import random
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

GATEWAY_URL = "http://localhost:80"
CONCURRENCY = 60
TOTAL_REQUESTS = 180

def get_auth_token():
    try:
        res = requests.post(
            f"{GATEWAY_URL}/api/auth/login",
            json={"username": "student1", "password": "password123"},
            timeout=5
        )
        if res.status_code == 200:
            return res.json().get("access_token")
    except Exception as e:
        print(f"[!] Login failed: {e}")
    return None

def upload_task(token, idx):
    size_kb = random.choice([50, 100, 250, 500])
    content = b"X" * (size_kb * 1024)
    filename = f"loadtest_doc_{idx}_{size_kb}KB.pdf"
    
    headers = {"Authorization": f"Bearer {token}"}
    files = {"file": (filename, io.BytesIO(content), "application/pdf")}
    data = {
        "title": f"Load Test File #{idx}",
        "description": "Concurrent load testing document",
        "course_code": random.choice(["CS501", "CS502", "CS503"]),
        "department": "Computer Science & Engineering",
        "submission_type": "assignment",
        "is_public": "true"
    }
    
    t0 = time.time()
    try:
        r = requests.post(f"{GATEWAY_URL}/api/files/upload", files=files, data=data, headers=headers, timeout=15)
        latency = (time.time() - t0) * 1000
        return ("UPLOAD", r.status_code, latency, len(content))
    except Exception as e:
        return ("UPLOAD", 0, (time.time() - t0) * 1000, 0)

def download_task(token, doc_id):
    headers = {"Authorization": f"Bearer {token}"}
    t0 = time.time()
    try:
        r = requests.get(f"{GATEWAY_URL}/api/files/download/{doc_id}", headers=headers, timeout=15)
        latency = (time.time() - t0) * 1000
        return ("DOWNLOAD", r.status_code, latency, len(r.content))
    except Exception as e:
        return ("DOWNLOAD", 0, (time.time() - t0) * 1000, 0)

def list_task(token):
    headers = {"Authorization": f"Bearer {token}"}
    course = random.choice(["CS501", "CS502", "CS503", "CS504"])
    t0 = time.time()
    try:
        r = requests.get(f"{GATEWAY_URL}/api/documents?course_code={course}", headers=headers, timeout=10)
        latency = (time.time() - t0) * 1000
        return ("LIST", r.status_code, latency, len(r.content))
    except Exception as e:
        return ("LIST", 0, (time.time() - t0) * 1000, 0)

def health_task():
    t0 = time.time()
    try:
        r = requests.get(f"{GATEWAY_URL}/health", timeout=5)
        latency = (time.time() - t0) * 1000
        return ("HEALTH", r.status_code, latency, len(r.content))
    except Exception as e:
        return ("HEALTH", 0, (time.time() - t0) * 1000, 0)

def run_benchmark(concurrency=CONCURRENCY, total_requests=TOTAL_REQUESTS):
    print("=" * 80)
    print(f"  ACADEMIC CLOUD - CONCURRENT LOAD TEST ({concurrency} SIMULTANEOUS USERS)")
    print(f"  Target: {GATEWAY_URL} (Kind Multi-Node Cluster)")
    print("=" * 80)
    
    print("\n>>> 1. Authenticating test user...")
    token = get_auth_token()
    if not token:
        print("[FAIL] Could not acquire JWT token. Ensure cluster pods are running.")
        sys.exit(1)
    print("    [OK] JWT Bearer Token acquired successfully.")
    
    print("\n>>> 2. Seeding initial baseline document for download benchmarks...")
    sample_file = io.BytesIO(b"Baseline file content for concurrent reading benchmark.")
    up_res = requests.post(
        f"{GATEWAY_URL}/api/files/upload",
        files={"file": ("seed_baseline.pdf", sample_file, "application/pdf")},
        data={"title": "Seed Baseline", "course_code": "CS501", "is_public": "true"},
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    if up_res.status_code == 201:
        baseline_doc_id = up_res.json()["document"]["id"]
        print(f"    [OK] Seed document active: id={baseline_doc_id}")
    else:
        print(f"    [WARN] Seed upload returned {up_res.status_code}, defaulting to first available doc.")
        baseline_doc_id = "default"

    print(f"\n>>> 3. Firing {total_requests} requests across {concurrency} concurrent threads...")
    print(f"    Workload Distribution: 60% Downloads, 25% Uploads, 10% Metadata, 5% Health\n")

    tasks = []
    for i in range(total_requests):
        roll = random.random()
        if roll < 0.60:
            tasks.append(("DOWNLOAD", download_task, (token, baseline_doc_id)))
        elif roll < 0.85:
            tasks.append(("UPLOAD", upload_task, (token, i)))
        elif roll < 0.95:
            tasks.append(("LIST", list_task, (token,)))
        else:
            tasks.append(("HEALTH", health_task, ()))

    results = []
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        future_map = {executor.submit(func, *args): op for op, func, args in tasks}
        completed = 0
        for future in as_completed(future_map):
            completed += 1
            op, status_code, latency, size = future.result()
            results.append((op, status_code, latency, size))
            if completed % 25 == 0 or completed == total_requests:
                print(f"    Progress: {completed:3d}/{total_requests} requests completed ({(completed/total_requests)*100:3.0f}%)")

    total_time = time.time() - start_time
    rps = total_requests / total_time

    # Calculate statistics
    latencies = [r[2] for r in results]
    successes = [r for r in results if r[1] in [200, 201]]
    failures = [r for r in results if r[1] not in [200, 201]]

    p50 = statistics.median(latencies)
    p95 = statistics.quantiles(latencies, n=20)[18] if len(latencies) >= 20 else max(latencies)
    p99 = statistics.quantiles(latencies, n=100)[98] if len(latencies) >= 100 else max(latencies)
    avg_lat = statistics.mean(latencies)

    print("\n" + "=" * 80)
    print("  CONCURRENCY BENCHMARK RESULTS")
    print("=" * 80)
    print(f"  • Concurrent Users (Threads): {concurrency}")
    print(f"  • Total Requests Completed:   {total_requests}")
    print(f"  • Total Duration:             {total_time:.2f} seconds")
    print(f"  • Throughput (RPS):           {rps:.2f} requests/sec")
    print(f"  • Successful Requests:        {len(successes)} ({len(successes)/total_requests*100:.1f}%)")
    print(f"  • Failed Requests:            {len(failures)} ({len(failures)/total_requests*100:.1f}%)")
    print("-" * 80)
    print("  LATENCY METRICS (ms):")
    print(f"  • Average Latency:            {avg_lat:.2f} ms")
    print(f"  • Min Latency:                {min(latencies):.2f} ms")
    print(f"  • 50th Percentile (p50):      {p50:.2f} ms")
    print(f"  • 95th Percentile (p95):      {p95:.2f} ms")
    print(f"  • 99th Percentile (p99):      {p99:.2f} ms")
    print(f"  • Max Latency:                {max(latencies):.2f} ms")
    print("-" * 80)

    # Per-operation breakdown
    print("  OPERATION BREAKDOWN:")
    for op_name in ["DOWNLOAD", "UPLOAD", "LIST", "HEALTH"]:
        op_results = [r for r in results if r[0] == op_name]
        if op_results:
            op_lats = [r[2] for r in op_results]
            op_succ = len([r for r in op_results if r[1] in [200, 201]])
            print(f"  • {op_name.ljust(9)}: {len(op_results):3d} reqs | Success: {op_succ}/{len(op_results)} | Avg: {statistics.mean(op_lats):.1f}ms | p95: {max(op_lats):.1f}ms")
    print("=" * 80)

if __name__ == "__main__":
    c = int(sys.argv[1]) if len(sys.argv) > 1 else CONCURRENCY
    t = int(sys.argv[2]) if len(sys.argv) > 2 else TOTAL_REQUESTS
    run_benchmark(concurrency=c, total_requests=t)
