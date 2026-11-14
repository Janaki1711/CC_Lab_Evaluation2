import React from 'react';
import { X, CheckCircle2, Server, Cpu, ShieldAlert, GitBranch, ArrowRight } from 'lucide-react';

export default function ProblemStatementModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Research & Laboratory Problem Statement</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Cloud Computing Laboratory Evaluation 2</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          
          {/* Core Problem Callout */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <h3 className="font-semibold text-indigo-950 flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              Core Problem Definition
            </h3>
            <p className="text-slate-700">
              Develop a Kubernetes-based distributed academic document platform that utilizes <strong>Pod Affinity</strong> and <strong>Pod Anti-Affinity</strong> rules to systematically optimize microservice placement, minimize inter-service network latency, eliminate single-node failure blast radiuses, and evaluate application performance under concurrent workloads.
            </p>
          </div>

          {/* Research Questions Grid */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-3">Key Research Investigations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition">
                <div className="text-indigo-600 font-semibold mb-1 text-xs">1. Pod Affinity</div>
                <p className="text-xs text-slate-600">
                  Does co-locating <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">file-service</code> and <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">metadata-service</code> on the same worker node reduce overlay network hops and lower P95 upload/download latency?
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition">
                <div className="text-indigo-600 font-semibold mb-1 text-xs">2. Pod Anti-Affinity</div>
                <p className="text-xs text-slate-600">
                  How does enforcing spread across distinct worker nodes (<code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">kubernetes.io/hostname</code>) insulate client requests when an entire worker node abruptly crashes?
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition">
                <div className="text-indigo-600 font-semibold mb-1 text-xs">3. HPA Scheduling Limits</div>
                <p className="text-xs text-slate-600">
                  What occurs when Horizontal Pod Autoscaler scales to 6 replicas across only 3 worker nodes under <em>Strict (Required)</em> vs <em>Flexible (Preferred)</em> anti-affinity?
                </p>
              </div>
            </div>
          </div>

          {/* Three Strategies Comparison Overview */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-3">Placement Strategies Implemented</h4>
            <div className="space-y-2.5">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-800">Strategy 1</span>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Default Kubernetes Scheduling (Baseline)</div>
                  <div className="text-xs text-slate-500 mt-0.5">Pods are placed based purely on resource requests without co-location or spread guarantees. Replicas frequently cluster on a single node.</div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/30 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">Strategy 2</span>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Pod Affinity & Anti-Affinity (Placement Optimized)</div>
                  <div className="text-xs text-slate-500 mt-0.5">Spreads File Service replicas across distinct nodes while co-locating one replica with Metadata Service on <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-mono">kind-worker</code>.</div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/30 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Strategy 3</span>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Combined Placement & Horizontal Autoscaling (HPA)</div>
                  <div className="text-xs text-slate-500 mt-0.5">Dynamic replica scaling from 2 to 6 pods at 60% CPU threshold, demonstrating graceful bin-packing when replicas outnumber worker nodes.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Verification Checklist */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Evaluation Deliverables Verified
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">• Multi-node Kubernetes topology (1 Control, 3 Workers)</li>
              <li className="flex items-center gap-1.5">• MinIO S3 object storage with PVC durability</li>
              <li className="flex items-center gap-1.5">• Live pod-to-node placement visualization</li>
              <li className="flex items-center gap-1.5">• Locust load test benchmark integration</li>
              <li className="flex items-center gap-1.5">• Controlled node failure & recovery observation</li>
              <li className="flex items-center gap-1.5">• Prometheus metrics & telemetry endpoints</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs shadow-sm transition"
          >
            Acknowledge & Continue
          </button>
        </div>

      </div>
    </div>
  );
}
