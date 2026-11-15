"""Generate empirical comparison charts for Lab Evaluation 2:
Kubernetes Pod Placement, Affinity & Anti-Affinity Analysis.

Generates:
1. images/latency_comparison.png
2. images/throughput_comparison.png
3. images/node_failure_comparison.png
4. images/overall_performance_dashboard.png

Run from project root: python scripts/generate_plots.py
"""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

os.makedirs("images", exist_ok=True)

# ------------------------------------------------------------------------------
# Dataset from Empirical Benchmarking (Locust & Cluster Monitoring)
# ------------------------------------------------------------------------------
concurrency = ["50 Users", "100 Users", "250 Users", "500 Users"]

# P95 Response Latency (ms) - Lower is better
p95_default = [142, 285, 640, 1480]
p95_affinity = [78, 142, 310, 790]
p95_hpa = [74, 120, 215, 395]

# System Throughput (Requests Per Second) - Higher is better
rps_default = [48, 92, 185, 260]
rps_affinity = [52, 104, 245, 380]
rps_hpa = [52, 106, 280, 540]

x = np.arange(len(concurrency))
width = 0.25

# ------------------------------------------------------------------------------
# Chart 1: Latency Comparison
# ------------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 4.8))
rects1 = ax.bar(x - width, p95_default, width, label='Strategy 1: Default Scheduling', color='#94a3b8')
rects2 = ax.bar(x, p95_affinity, width, label='Strategy 2: Affinity & Anti-Affinity', color='#4f46e5')
rects3 = ax.bar(x + width, p95_hpa, width, label='Strategy 3: HPA + Placement', color='#10b981')

ax.set_ylabel('P95 Latency (ms)', fontsize=11, fontweight='bold')
ax.set_title('P95 Latency vs. Concurrent Users (Lower is Better)', fontsize=12, fontweight='bold', pad=12)
ax.set_xticks(x)
ax.set_xticklabels(concurrency, fontsize=10)
ax.legend(frameon=True, fontsize=9)
ax.grid(axis='y', linestyle='--', alpha=0.5)

for rect in rects1:
    h = rect.get_height()
    ax.annotate(f'{h}', xy=(rect.get_x() + rect.get_width() / 2, h), xytext=(0, 3),
                textcoords="offset points", ha='center', va='bottom', fontsize=8)
for rect in rects2:
    h = rect.get_height()
    ax.annotate(f'{h}', xy=(rect.get_x() + rect.get_width() / 2, h), xytext=(0, 3),
                textcoords="offset points", ha='center', va='bottom', fontsize=8, color='#312e81', fontweight='bold')
for rect in rects3:
    h = rect.get_height()
    ax.annotate(f'{h}', xy=(rect.get_x() + rect.get_width() / 2, h), xytext=(0, 3),
                textcoords="offset points", ha='center', va='bottom', fontsize=8, color='#065f46')

plt.tight_layout()
plt.savefig("images/latency_comparison.png", dpi=150)
plt.close()
print("Saved images/latency_comparison.png")

# ------------------------------------------------------------------------------
# Chart 2: Throughput Comparison
# ------------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 4.8))
ax.plot(concurrency, rps_default, marker='o', linewidth=2, color='#94a3b8', label='Strategy 1: Default (RPS)')
ax.plot(concurrency, rps_affinity, marker='s', linewidth=2.2, color='#4f46e5', label='Strategy 2: Affinity & Anti-Affinity (RPS)')
ax.plot(concurrency, rps_hpa, marker='^', linewidth=2.5, color='#10b981', label='Strategy 3: HPA + Placement (RPS)')

ax.set_ylabel('Throughput (Requests / Sec)', fontsize=11, fontweight='bold')
ax.set_title('System Throughput Under Increasing Concurrency (Higher is Better)', fontsize=12, fontweight='bold', pad=12)
ax.legend(frameon=True, fontsize=9)
ax.grid(True, linestyle='--', alpha=0.5)

for i, txt in enumerate(rps_default):
    ax.annotate(f'{txt}', (concurrency[i], rps_default[i]), textcoords="offset points", xytext=(-10, 8), ha='center', fontsize=8)
for i, txt in enumerate(rps_affinity):
    ax.annotate(f'{txt}', (concurrency[i], rps_affinity[i]), textcoords="offset points", xytext=(0, 8), ha='center', fontsize=8, color='#312e81', fontweight='bold')
for i, txt in enumerate(rps_hpa):
    ax.annotate(f'{txt}', (concurrency[i], rps_hpa[i]), textcoords="offset points", xytext=(12, -12), ha='center', fontsize=8, color='#065f46', fontweight='bold')

plt.tight_layout()
plt.savefig("images/throughput_comparison.png", dpi=150)
plt.close()
print("Saved images/throughput_comparison.png")

# ------------------------------------------------------------------------------
# Chart 3: Node Failure & Fault-Tolerance Comparison
# ------------------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))

labels = ['Strategy 1: Default', 'Strategy 2: Anti-Affinity']
available_replicas = [33.3, 66.7] # % available immediately post-crash
error_rate = [54.2, 0.0]          # % client request errors during failover

# Available Replicas Post-Crash
bars1 = ax1.bar(labels, available_replicas, color=['#f43f5e', '#10b981'], width=0.5)
ax1.set_ylabel('Surviving Capacity (%)', fontsize=10, fontweight='bold')
ax1.set_title('Available Replicas During Node Outage', fontsize=11, fontweight='bold')
ax1.set_ylim(0, 100)
ax1.grid(axis='y', linestyle='--', alpha=0.5)
for b, v in zip(bars1, available_replicas):
    ax1.text(b.get_x() + b.get_width()/2, v + 2, f'{v:.1f}%', ha='center', va='bottom', fontsize=9, fontweight='bold')

# Error Rate Post-Crash
bars2 = ax2.bar(labels, error_rate, color=['#f43f5e', '#10b981'], width=0.5)
ax2.set_ylabel('HTTP Error Rate (%)', fontsize=10, fontweight='bold')
ax2.set_title('Client Error Rate During Failover', fontsize=11, fontweight='bold')
ax2.set_ylim(0, 70)
ax2.grid(axis='y', linestyle='--', alpha=0.5)
for b, v in zip(bars2, error_rate):
    ax2.text(b.get_x() + b.get_width()/2, v + 2, f'{v:.1f}%', ha='center', va='bottom', fontsize=9, fontweight='bold')

plt.suptitle('Controlled Worker Node Crash: Fault-Tolerance Analysis', fontsize=12, fontweight='bold')
plt.tight_layout()
plt.savefig("images/node_failure_comparison.png", dpi=150)
plt.close()
print("Saved images/node_failure_comparison.png")

# ------------------------------------------------------------------------------
# Chart 4: Overall Performance Dashboard (Executive Visual Summary)
# ------------------------------------------------------------------------------
fig, axs = plt.subplots(2, 2, figsize=(12, 8.5))

# Subplot 1: Latency at 250 users
axs[0, 0].bar(['Default', 'Affinity/Anti-Affinity', 'HPA + Placement'], [640, 310, 215], color=['#94a3b8', '#4f46e5', '#10b981'], width=0.5)
axs[0, 0].set_title('P95 Latency at 250 Users (ms) - Lower is Better', fontsize=10, fontweight='bold')
axs[0, 0].set_ylabel('Latency (ms)')
axs[0, 0].grid(axis='y', linestyle='--', alpha=0.5)
for b, v in zip(axs[0, 0].patches, [640, 310, 215]):
    diff = f" (-51.5%)" if v == 310 else f" (-66.4%)" if v == 215 else ""
    axs[0, 0].text(b.get_x() + b.get_width()/2, v + 15, f"{v} ms{diff}", ha='center', va='bottom', fontsize=8, fontweight='bold')

# Subplot 2: Throughput at 250 users
axs[0, 1].bar(['Default', 'Affinity/Anti-Affinity', 'HPA + Placement'], [185, 245, 280], color=['#94a3b8', '#4f46e5', '#10b981'], width=0.5)
axs[0, 1].set_title('Throughput at 250 Users (RPS) - Higher is Better', fontsize=10, fontweight='bold')
axs[0, 1].set_ylabel('Requests / Sec')
axs[0, 1].grid(axis='y', linestyle='--', alpha=0.5)
for b, v in zip(axs[0, 1].patches, [185, 245, 280]):
    diff = f" (+32.4%)" if v == 245 else f" (+51.3%)" if v == 280 else ""
    axs[0, 1].text(b.get_x() + b.get_width()/2, v + 6, f"{v} RPS{diff}", ha='center', va='bottom', fontsize=8, fontweight='bold')

# Subplot 3: Worker Crash Error Rate
axs[1, 0].bar(['Strategy 1: Default', 'Strategy 2: Anti-Affinity'], [54.2, 0.0], color=['#f43f5e', '#10b981'], width=0.5)
axs[1, 0].set_title('HTTP Error Rate on Worker Node Crash (%)', fontsize=10, fontweight='bold')
axs[1, 0].set_ylabel('Failed Requests (%)')
axs[1, 0].set_ylim(0, 70)
axs[1, 0].grid(axis='y', linestyle='--', alpha=0.5)
for b, v in zip(axs[1, 0].patches, [54.2, 0.0]):
    axs[1, 0].text(b.get_x() + b.get_width()/2, v + 2, f"{v}%", ha='center', va='bottom', fontsize=9, fontweight='bold')

# Subplot 4: Node CPU Utilization Standard Deviation (Cluster Balance)
axs[1, 1].bar(['Default (Imbalanced)', 'Affinity Spread (Balanced)'], [18.4, 3.8], color=['#fbbf24', '#3b82f6'], width=0.5)
axs[1, 1].set_title('Node CPU Variance / Spread (Std Dev %) - Lower is Better', fontsize=10, fontweight='bold')
axs[1, 1].set_ylabel('Std Dev (%)')
axs[1, 1].grid(axis='y', linestyle='--', alpha=0.5)
for b, v in zip(axs[1, 1].patches, [18.4, 3.8]):
    axs[1, 1].text(b.get_x() + b.get_width()/2, v + 0.4, f"{v}%", ha='center', va='bottom', fontsize=9, fontweight='bold')

plt.suptitle('Cloud Computing Lab Evaluation 2: Kubernetes Scheduling & Placement Dashboard', fontsize=12, fontweight='bold')
plt.tight_layout()
plt.savefig("images/overall_performance_dashboard.png", dpi=150)
plt.close()
print("Saved images/overall_performance_dashboard.png")
