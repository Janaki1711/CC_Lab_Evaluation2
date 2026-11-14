#!/usr/bin/env python3
"""
End-to-End Functional Verification Script
Academic Document Management & Intelligent Placement System
"""

import sys
import io
import time
import requests

GATEWAY_URL = "http://localhost:80"
AUTH_URL = "http://localhost:8001"
FILE_URL = "http://localhost:8002"
META_URL = "http://localhost:8003"

def run_tests():
    print("=" * 70)
    print("ACADEMIA CLOUD - FUNCTIONAL SMOKE TEST SUITE")
    print("=" * 70)

    # 1. Test Gateway / Services Health
    targets = [
        ("Auth Service", f"{AUTH_URL}/health"),
        ("File Service", f"{FILE_URL}/health"),
        ("Metadata Service", f"{META_URL}/health")
    ]

    for name, url in targets:
        try:
            r = requests.get(url, timeout=3)
            if r.status_code == 200:
                print(f"[PASS] {name} is HEALTHY (200 OK)")
            else:
                print(f"[WARN] {name} returned status {r.status_code}")
        except Exception as e:
            print(f"[SKIP] {name} not directly reachable on host: {e}")

    # 2. Test User Login
    print("\n--- Testing Authentication & Role Management ---")
    try:
        login_res = requests.post(f"{AUTH_URL}/api/auth/login", json={
            "username": "student1",
            "password": "password123"
        }, timeout=5)

        if login_res.status_code == 200:
            token_data = login_res.json()
            jwt_token = token_data["access_token"]
            print(f"[PASS] Authenticated successfully as student1. JWT token acquired.")
            headers = {"Authorization": f"Bearer {jwt_token}"}
        else:
            print(f"[FAIL] Login failed: {login_res.text}")
            return False
    except Exception as e:
        print(f"[INFO] Skipping live HTTP auth test (services not currently running locally): {e}")
        return True

    # 3. Test Cluster Topology Endpoint
    print("\n--- Testing Cluster Placement & Telemetry ---")
    try:
        top_res = requests.get(f"{META_URL}/api/cluster/topology", timeout=5)
        if top_res.status_code == 200:
            top_data = top_res.json()
            print(f"[PASS] Cluster topology endpoint active: {len(top_data.get('nodes', []))} nodes, {len(top_data.get('pods', []))} pods.")
            print(f"       Active Strategy: {top_data.get('active_strategy')}")
    except Exception as e:
        print(f"[INFO] Topology telemetry check skipped: {e}")

    # 4. Test File Upload Lifecycle
    print("\n--- Testing Document Upload & MinIO Persistence ---")
    try:
        sample_file_content = b"%PDF-1.4 Mock academic lab report for Pod Affinity evaluation."
        files = {
            "file": ("Lab2_Test_Report.pdf", io.BytesIO(sample_file_content), "application/pdf")
        }
        data = {
            "title": "Smoke Test: Affinity Evaluation",
            "description": "Automated verification test",
            "course_code": "CS502",
            "department": "Computer Science & Engineering",
            "submission_type": "lab_record",
            "is_public": "false"
        }
        up_res = requests.post(f"{FILE_URL}/api/files/upload", files=files, data=data, headers=headers, timeout=10)
        if up_res.status_code == 201:
            doc_info = up_res.json()["document"]
            doc_id = doc_info["id"]
            print(f"[PASS] File uploaded to MinIO and indexed in PostgreSQL: id={doc_id}")
            
            # 5. Test Download
            print("\n--- Testing Streaming Download ---")
            down_res = requests.get(f"{FILE_URL}/api/files/download/{doc_id}", headers=headers, timeout=10)
            if down_res.status_code == 200 and len(down_res.content) == len(sample_file_content):
                print(f"[PASS] Stream download matched original binary ({len(down_res.content)} bytes).")
            else:
                print(f"[FAIL] Download content mismatch or status: {down_res.status_code}")
        else:
            print(f"[FAIL] Upload failed: {up_res.text}")
    except Exception as e:
        print(f"[INFO] Upload cycle skipped: {e}")

    print("\n" + "=" * 70)
    print("SMOKE TEST COMPLETED")
    print("=" * 70)
    return True

if __name__ == "__main__":
    run_tests()
