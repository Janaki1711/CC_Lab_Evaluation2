#!/usr/bin/env python3
"""
Academic Platform - All-in-One Local Microservices Runner
Spins up Auth Service (8001), File Service (8002), Metadata Service (8003), and Booking Service (8004) concurrently.
"""

import sys
import os
import subprocess
import time
import signal

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

services = [
    {
        "name": "Auth Service",
        "cwd": os.path.join(ROOT_DIR, "services", "auth-service"),
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8001"]
    },
    {
        "name": "Metadata Service",
        "cwd": os.path.join(ROOT_DIR, "services", "metadata-service"),
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8003"]
    },
    {
        "name": "File Service",
        "cwd": os.path.join(ROOT_DIR, "services", "file-service"),
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8002"]
    },
    {
        "name": "Booking Service",
        "cwd": os.path.join(ROOT_DIR, "services", "booking-service"),
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8004"]
    }
]

processes = []

def cleanup(sig=None, frame=None):
    print("\nShutting down backend microservices...")
    for p in processes:
        try:
            p.terminate()
        except Exception:
            pass
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def main():
    print("=" * 75)
    print("BOOKMYSHOW PLATFORM - STARTING LOCAL BACKEND MICROSERVICES")
    print("=" * 75)
    print("• Auth Service:     http://localhost:8001 (JWT, RBAC)")
    print("• File Service:     http://localhost:8002 (Storage Engine)")
    print("• Metadata Service: http://localhost:8003 (Schema & K8s Telemetry)")
    print("• Booking Service:  http://localhost:8004 (High-Concurrency Flash-Sale Engine)")
    print("-" * 75)

    for svc in services:
        print(f"Launching {svc['name']} on {svc['cmd'][-3]}:{svc['cmd'][-2]}...")
        proc = subprocess.Popen(svc["cmd"], cwd=svc["cwd"])
        processes.append(proc)
        time.sleep(1)

    print("\nAll 4 backend microservices are RUNNING!")
    print("Vite frontend proxy will now connect cleanly without ECONNREFUSED.")
    print("Press Ctrl+C to stop all services.\n")

    try:
        while True:
            time.sleep(1)
            for p in processes:
                if p.poll() is not None:
                    print(f"Warning: A service process exited with code {p.returncode}")
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
