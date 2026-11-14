import React from 'react';
import { X, CheckCircle2, Server, Cpu, ShieldAlert, GitBranch, ArrowRight, Building2, HardDrive, Layers } from 'lucide-react';

export default function ProblemStatementModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl">
              <Server className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Research & Problem Statement Definition</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Cloud Computing Lab Evaluation 2 • Master Architecture</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed">
          
          {/* Real-World Industry Problem Statement Callout */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center gap-2 font-bold text-indigo-950 text-sm mb-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Industry Problem: Enterprise Multi-Tenant Document Storage Resilience
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">
              Global enterprises require zero-downtime document vaults for mission-critical assets (contracts, financial audits, architecture specs). Running these workloads on Kubernetes presents critical scheduling trade-offs: 
              <strong> How do we eliminate single-point-of-failure (SPOF) across physical worker hosts while avoiding the severe network latency penalties introduced by inter-pod overlay encapsulation?</strong>
            </p>
          </div>

          {/* The 3 Core Research Pillars */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Experimental Hypotheses & Placement Mechanics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="font-bold text-indigo-950 text-xs mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  1. Pod Anti-Affinity
                </div>
                <div className="font-mono text-[10px] text-indigo-600 mb-1.5">topologyKey: kubernetes.io/hostname</div>
                <p className="text-slate-600 leading-normal">
                  Stateless file processing replicas are strictly distributed across distinct worker nodes (<code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">kind-worker</code>, <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">worker2</code>, <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">worker3</code>) to ensure an abrupt physical node crash results in 0 dropped client requests.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="font-bold text-indigo-950 text-xs mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  2. Pod Affinity
                </div>
                <div className="font-mono text-[10px] text-indigo-600 mb-1.5">app: metadata-service</div>
                <p className="text-slate-600 leading-normal">
                  Synchronous RPC between File Service and Metadata Service is routed over the node's local loopback rather than the virtual network bridge, cutting P95 request latency by ~51.5% under high concurrency.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="font-bold text-indigo-950 text-xs mb-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-600" />
                  3. HPA Scheduling Limits
                </div>
                <div className="font-mono text-[10px] text-emerald-600 mb-1.5">Target: 60% CPU</div>
                <p className="text-slate-600 leading-normal">
                  When 500 users trigger autoscaling to 5 replicas across only 3 worker nodes, soft anti-affinity (<code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">preferredDuringScheduling</code>) safely bin-packs pods without leaving replicas starving in <code className="text-rose-600 font-mono">Pending</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Strategy Matrix Table */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2.5">
              Comparative Strategy Implementation
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Strategy</th>
                    <th className="px-4 py-2.5">Scheduling Policy</th>
                    <th className="px-4 py-2.5">Observed P95 Latency</th>
                    <th className="px-4 py-2.5">Node Crash Survival</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-900">Strategy 1</td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">Default NodeResourcesFit</td>
                    <td className="px-4 py-2.5 font-mono text-rose-600 font-bold">640 ms</td>
                    <td className="px-4 py-2.5 text-rose-600">66% capacity lost</td>
                  </tr>
                  <tr className="bg-indigo-50/30">
                    <td className="px-4 py-2.5 font-bold text-indigo-950">Strategy 2</td>
                    <td className="px-4 py-2.5 font-mono text-indigo-700">Pod Affinity + Anti-Affinity</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-700 font-bold">310 ms (-51.5%)</td>
                    <td className="px-4 py-2.5 text-emerald-700 font-bold">0% dropped connections</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-900">Strategy 3</td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">HPA Scaled (60% CPU) + Spread</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-700 font-bold">215 ms (-66.4%)</td>
                    <td className="px-4 py-2.5 text-emerald-700 font-bold">High throughput (280 RPS)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs shadow-xs transition"
          >
            Close & Continue Evaluation
          </button>
        </div>

      </div>
    </div>
  );
}
