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
    print(">>> [Option 8] Running Locust Load Testing Benchmark...")
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

def show_viva_guide():
    clear_screen()
    print_banner()
    guide_path = os.path.join(ROOT_DIR, "documentation", "viva_defense_guide.md")
    print(">>> [Option 9] External Examiner Viva Defense Guide\n")
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
        print("  [4]  📦 Deploy Strategy 1: Default Scheduling (Baseline Clustered Pods)")
        print("  [5]  🎯 Deploy Strategy 2: Pod Affinity & Anti-Affinity (Optimal Distribution)")
        print("  [6]  ⚡ Deploy Strategy 3: Horizontal Pod Autoscaler (HPA Scaling Stress)")
        print("  [7]  💥 Run Controlled Worker Node Failure Experiment (Measure Failover)")
        print("  [8]  📊 Run Locust Concurrency Benchmark (50, 100, 250, 500 users)")
        print("  [9]  🎓 View Examiner Viva Questions & Defense Cheatsheet")
        print("  [0]  🚪 Exit Controller")
        print("")
        choice = input("Enter choice [0-9]: ").strip()

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
            deploy_strategy("strategy-1-default", 1)
        elif choice == "5":
            deploy_strategy("strategy-2-affinity", 2)
        elif choice == "6":
            deploy_strategy("strategy-3-autoscaling", 3)
        elif choice == "7":
            simulate_failure()
        elif choice == "8":
            run_locust_benchmarks()
        elif choice == "9":
            show_viva_guide()
        elif choice == "0":
            print("\nExiting Lab Controller. Good luck with your evaluation!")
            break
        else:
            print("Invalid selection. Try again.")
            time.sleep(1)

if __name__ == "__main__":
    main_menu()
