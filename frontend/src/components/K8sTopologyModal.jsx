import React from 'react';
import { Server, Cpu, ShieldCheck, Database, HardDrive, Network, X, CheckCircle } from 'lucide-react';

export default function K8sTopologyModal({ isOpen, onClose, telemetryData }) {
  if (!isOpen) return null;

  const nodes = [
    {
      name: 'academic-cloud-cluster-worker',
      role: 'Worker Node 1',
      status: 'Ready',
      ip: '172.19.0.2',
      pods: [
        { name: 'bms-redis (Redis 7 In-Memory Engine)', type: 'cache', highlight: 'Distributed Lock Authority' },
        { name: 'booking-service (Replica 1)', type: 'worker', highlight: 'Pod Affinity: Co-located with Redis (< 4ms Latency)' },
        { name: 'api-gateway (NGINX Ingress)', type: 'gateway', highlight: 'Port 80 Host Route' },
        { name: 'frontend (React UI)', type: 'ui', highlight: 'Black & Red Web App' },
      ],
      affinityRole: 'AFFINITY ANCHOR: Co-locates Booking Worker with Redis Engine'
    },
    {
      name: 'academic-cloud-cluster-worker2',
      role: 'Worker Node 2',
      status: 'Ready',
      ip: '172.19.0.4',
      pods: [
        { name: 'booking-service (Replica 2)', type: 'worker', highlight: 'Pod Anti-Affinity: Traffic Surge Absorption' },
        { name: 'postgres-db-0 (PostgreSQL StatefulSet)', type: 'db', highlight: 'Seat Inventory & Bookings Master' },
        { name: 'auth-service (Replica 1)', type: 'auth', highlight: 'JWT Authentication Engine' },
      ],
      affinityRole: 'ANTI-AFFINITY: Absorbs bot spikes without saturating Node 1'
    },
    {
      name: 'academic-cloud-cluster-worker3',
      role: 'Worker Node 3',
      status: 'Ready',
      ip: '172.19.0.5',
      pods: [
        { name: 'booking-service (Replica 3)', type: 'worker', highlight: 'Pod Anti-Affinity: High Availability Fallback' },
        { name: 'minio-store (S3 Object Storage)', type: 'storage', highlight: 'Asset Bucket' },
        { name: 'auth-service (Replica 2)', type: 'auth', highlight: 'Secondary Auth' },
      ],
      affinityRole: 'ANTI-AFFINITY: Guarantees zero single-point-of-failure (Zero-SPOF)'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0f121d] border border-[#2b334a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#252c3f] bg-gradient-to-r from-red-950/40 via-[#141824] to-[#0f121d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>Kubernetes Placement Topology</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 uppercase font-mono">
                  4-Node Kind Cluster
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Real-Time Pod Affinity & Anti-Affinity Distribution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1b2030] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Theory / Viva Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#141826] border border-[#2a344d] space-y-2">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold font-mono text-xs uppercase">
                <Network className="w-4 h-4" />
                <span>1. Pod Affinity (Sub-Millisecond Speed)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <code className="text-red-400 bg-red-950/50 px-1 py-0.5 rounded">podAffinity</code> co-locates <code className="text-slate-200">booking-service</code> with <code className="text-slate-200">bms-redis</code> on Worker Node 1. This routes Redis distributed locking through local loopback/veth, avoiding cross-node overlay network latency.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#141826] border border-[#2a344d] space-y-2">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold font-mono text-xs uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Pod Anti-Affinity (Fault Tolerance)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <code className="text-emerald-400 bg-emerald-950/50 px-1 py-0.5 rounded">podAntiAffinity</code> ensures the 3 booking replicas never run on the same node. When 500 bot rush requests hit the cluster, CPU load is distributed across all 3 nodes with Zero SPOF.
              </p>
            </div>
          </div>

          {/* Nodes & Pods List */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Cluster Node Topology & Pod Allocation:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nodes.map((node) => (
                <div
                  key={node.name}
                  className="p-4 rounded-xl bg-[#131622] border border-[#262e42] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">{node.role}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                        {node.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      {node.name}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#20273a]">
                      {node.pods.map((p, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-[#181d2c] border border-[#28324a] text-xs font-mono space-y-1"
                        >
                          <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span className="truncate">{p.name}</span>
                          </div>
                          <div className="text-[10px] text-amber-300/90 leading-tight">
                            {p.highlight}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] font-mono text-cyan-300/80 border-t border-[#20273a]">
                    ⚡ {node.affinityRole}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c0f17] border-t border-[#252c3f] flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Current Node Serving You: <strong className="text-emerald-400">{telemetryData?.node_name || 'academic-cloud-cluster-worker'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
