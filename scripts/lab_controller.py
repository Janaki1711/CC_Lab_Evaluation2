#!/usr/bin/env python3
"""
================================================================================
ACADEMIC CLOUD LAB CONTROLLER & EVALUATION CLI
Cloud Computing Lab 2: Kubernetes Intelligent Placement & Distributed Storage
================================================================================
"""

import os
import sys
import time
import subprocess
import webbrowser

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")

def print_banner():
    print("""
================================================================================
   _  ___  ___ ___ ___ __  __ ___   _      ___ _    ___  _   _ ___  
  /_\\/ __|/   \\   \\ __|  \\/  |_ _| /_\\    / __| |  / _ \\| | | |   \\ 
 / _ \\ (__| - | |) | _|| |\\/| || | / _ \\  | (__| |_| (_) | |_| | |) |
/_/ \\_\\___|_|_|___/|___|_|  |_|___/_/ \\_\\  \\___|____\\___/ \\___/|___/ 
--------------------------------------------------------------------------------
 [Cloud Computing Lab 2 Evaluation]
 Kubernetes Intelligent Pod Placement, Affinity/Anti-Affinity & MinIO Storage
================================================================================
""")

def check_prerequisites():
    print(">>> Checking System Prerequisites...")
    tools = ["docker", "kubectl", "kind", "python"]
    status = {}
    for t in tools:
        try:
            subprocess.run([t, "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            status[t] = "INSTALLED"
        except Exception:
            status[t] = "NOT DETECTED"
    
    for t, s in status.items():
        color = "\033[92m" if s == "INSTALLED" else "\033[91m"
        print(f"  • {t.ljust(12)}: {color}{s}\033[0m")
    print("-" * 80)
    return status

def start_local_platform():
    clear_screen()
    print_banner()
    print(">>> [Option 1] Starting Full Local Platform (FastAPI Services + React UI)...")
    print("    1. Starting Auth Service (:8001)")
    print("    2. Starting Metadata Service (:8003)")
    print("    3. Starting File Service (:8002)")
    print("    4. Opening Web Dashboard (:3000)")
    print("-" * 80)
    
    # Run the start_all_services script in a separate window
    if os.name == "nt":
        subprocess.Popen(f'start "AcademiaCloud Backend" powershell -NoExit -Command "cd \'{ROOT_DIR}\'; python scripts/start_all_services.py"', shell=True)
        subprocess.Popen(f'start "AcademiaCloud Frontend" powershell -NoExit -Command "cd \'{ROOT_DIR}\\frontend\'; npm run dev"', shell=True)
    else:
        subprocess.Popen([sys.executable, os.path.join(ROOT_DIR, "scripts", "start_all_services.py")])
    
    time.sleep(3)
    try:
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass
    print("\n[SUCCESS] Platform launched in dedicated windows! Access at http://localhost:3000")
    input("\nPress Enter to return to main menu...")

def provision_kind_cluster():
    clear_screen()
    print_banner()
    print(">>> [Option 3] Provisioning 4-Node Kubernetes Cluster via kind...")
    print("    Topology: 1 Control-Plane Node + 3 Distinct Worker Nodes")
    print("    Config:   infrastructure/kubernetes/base/kind-config.yaml")
    print("-" * 80)

    cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", os.path.join(ROOT_DIR, "scripts", "setup_kind_cluster.ps1")]
    subprocess.run(cmd)
    input("\nPress Enter to return to main menu...")

def build_docker_images():
    clear_screen()
    print_banner()
    print(">>> [Option 4] Building All Docker Containers & Sideloading into KIND...")
    print("    Containers: Auth (:8001), File (:8002), Metadata (:8003), Gateway (:80), Frontend (:3000)")
    print("-" * 80)

    cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", os.path.join(ROOT_DIR, "scripts", "build_docker_images.ps1")]
    subprocess.run(cmd)
    input("\nPress Enter to return to main menu...")

def deploy_strategy(strategy_name, strategy_num):
    clear_screen()
    print_banner()
    print(f">>> [Option {strategy_num + 3}] Deploying {strategy_name}...")
    print(f"    Script: scripts/deploy_strategy.ps1 -Strategy '{strategy_name}'")
    print("-" * 80)

    cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", os.path.join(ROOT_DIR, "scripts", "deploy_strategy.ps1"), "-Strategy", strategy_name]
    subprocess.run(cmd)
    input("\nPress Enter to return to main menu...")

def simulate_failure():
    clear_screen()
    print_banner()
    print(">>> [Option 7] Controlled Worker Node Failure Simulation...")
    print("    Halts 'academic-cloud-cluster-worker' and monitors failover across worker2 & worker3.")
    print("-" * 80)

    cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", os.path.join(ROOT_DIR, "scripts", "simulate_node_failure.ps1")]
    subprocess.run(cmd)
    input("\nPress Enter to return to main menu...")

def run_locust_benchmarks():
    clear_screen()
    print_banner()
    print(">>> [Option 9] Running Locust Load Testing Benchmark...")
    print("    Simulates 50, 100, 250, and 500 concurrent users uploading 100KB to 10MB payloads.")
    print("-" * 80)
    print("Opening Locust Web Interface on http://localhost:8089...")
    
    if os.name == "nt":
        subprocess.Popen(f'start "Locust Benchmark" powershell -NoExit -Command "cd \'{ROOT_DIR}\'; locust -f load-testing/locustfile.py --host http://localhost"', shell=True)
    else:
        subprocess.Popen(["locust", "-f", os.path.join(ROOT_DIR, "load-testing", "locustfile.py"), "--host", "http://localhost"])
    
    time.sleep(2)
    try:
        webbrowser.open("http://localhost:8089")
    except Exception:
        pass
    input("\nPress Enter to return to main menu...")

def run_k6_benchmarks():
    clear_screen()
    print_banner()
    print(">>> [Option 10] Running k6 Benchmark Suite (Upload, Download, Mixed 60/25/10/5)...")
    print("    Script: load-testing/k6/run-k6-benchmarks.ps1")
    print("-" * 80)
    
    cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", os.path.join(ROOT_DIR, "load-testing", "k6", "run-k6-benchmarks.ps1"), "-TestType", "mixed"]
    subprocess.run(cmd)
    input("\nPress Enter to return to main menu...")

def show_viva_guide():
    clear_screen()
    print_banner()
    guide_path = os.path.join(ROOT_DIR, "documentation", "viva_defense_guide.md")
    print(">>> [Option 11] External Examiner Viva Defense Guide\n")
    if os.path.exists(guide_path):
        with open(guide_path, "r", encoding="utf-8") as f:
            lines = f.readlines()[:40]
            print("".join(lines))
            print("\n[Full defense guide available at documentation/viva_defense_guide.md]")
    else:
        print("Defense guide file is located in documentation/viva_defense_guide.md")
    input("\nPress Enter to return to main menu...")

def main_menu():
    while True:
        clear_screen()
        print_banner()
        print("Select an evaluation phase or operational workflow to execute:")
        print("")
        print("  [1]  🚀 Launch Full Local Web Platform (FastAPI Services + React UI)")
        print("  [2]  🔍 Check Docker & Kubernetes Prerequisites")
        print("  [3]  🏗️  Provision 4-Node KIND Cluster (1 Control-Plane + 3 Worker Nodes)")
        print("  [4]  🐳 Build All Docker Containers & Sideload into KIND")
        print("  [5]  📦 Deploy Config A: Default Scheduling (Baseline Clustered Pods)")
        print("  [6]  🌐 Deploy Config B: Locality Only (Preferred Pod Affinity)")
        print("  [7]  🛡️  Deploy Config C: Replica Spread & Autoscaling (Anti-Affinity + HPA)")
        print("  [8]  ⚡ Deploy Config D: Combined Optimal Strategy (Affinity + Anti-Affinity + HPA)")
        print("  [9]  💥 Run Controlled Worker Node Failure Experiment (Measure Failover)")
        print("  [10] 📊 Run Locust Concurrency Benchmark (Web UI at :8089)")
        print("  [11] 📈 Run k6 Concurrent Benchmark Suite (60% Down / 25% Up / 10% List / 5% Del)")
        print("  [12] 🎓 View Examiner Viva Questions & Defense Cheatsheet")
        print("  [0]  🚪 Exit Controller")
        print("")
        choice = input("Enter choice [0-12]: ").strip()

        if choice == "1":
            start_local_platform()
        elif choice == "2":
            clear_screen()
            print_banner()
            check_prerequisites()
            input("\nPress Enter to return to main menu...")
        elif choice == "3":
            provision_kind_cluster()
        elif choice == "4":
            build_docker_images()
        elif choice == "5":
            deploy_strategy("strategy-1-default", 1)
        elif choice == "6":
            deploy_strategy("strategy-2a-locality", 2)
        elif choice == "7":
            deploy_strategy("strategy-2b-spread", 3)
        elif choice == "8":
            deploy_strategy("strategy-4-combined", 4)
        elif choice == "9":
            simulate_failure()
        elif choice == "10":
            run_locust_benchmarks()
        elif choice == "11":
            run_k6_benchmarks()
        elif choice == "12":
            show_viva_guide()
        elif choice == "0":
            print("\nExiting Lab Controller. Good luck with your evaluation!")
            break
        else:
            print("Invalid selection. Try again.")
            time.sleep(1)

if __name__ == "__main__":
    main_menu()
