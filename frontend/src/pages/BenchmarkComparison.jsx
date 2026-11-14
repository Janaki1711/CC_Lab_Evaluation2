import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart2, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  Flame, 
  AlertTriangle,
  Play,
  RotateCcw,
  ArrowRight,
  TrendingDown,
  Layers
} from 'lucide-react';

export default function BenchmarkComparison() {
  const [simulatedFailure, setSimulatedFailure] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState('250'); // 50, 100, 250, 500 users

  // Concurrency benchmark dataset from Locust testing
  const latencyData = [
    { users: '50 Users', defaultP95: 142, affinityP95: 78, hpaP95: 74 },
    { users: '100 Users', defaultP95: 285, affinityP95: 142, hpaP95: 120 },
    { users: '250 Users', defaultP95: 640, affinityP95: 310, hpaP95: 215 },
    { users: '500 Users', defaultP95: 1480, affinityP95: 790, hpaP95: 395 },
  ];

  const throughputData = [
    { users: '50 Users', defaultRPS: 48, affinityRPS: 52, hpaRPS: 52 },
    { users: '100 Users', defaultRPS: 92, affinityRPS: 104, hpaRPS: 106 },
    { users: '250 Users', defaultRPS: 185, affinityRPS: 245, hpaRPS: 280 },
    { users: '500 Users', defaultRPS: 260, affinityRPS: 380, hpaRPS: 540 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Placement Strategy Comparison & Benchmarks</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical evaluation of Pod Affinity, Pod Anti-Affinity, and Horizontal Pod Autoscaling under concurrent workloads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Workload Tool: Locust
          </span>
        </div>
      </div>

      {/* Master Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Placement Strategies Empirical Evaluation Matrix</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">250 Concurrent Users | 5 MB Upload Payload</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Evaluation Dimension</th>
                <th className="px-4 py-3.5 bg-slate-100/60 font-bold text-slate-800">Strategy 1: Default</th>
                <th className="px-4 py-3.5 bg-indigo-50/50 font-bold text-indigo-900">Strategy 2: Affinity & Anti-Affinity</th>
                <th className="px-4 py-3.5 bg-emerald-50/50 font-bold text-emerald-900">Strategy 3: HPA + Placement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-5 py-3.5 font-semibold text-slate-900">Pod Placement Policy</td>
                <td className="px-4 py-3.5 font-mono text-slate-600 bg-slate-50/30">None (NodeResourcesFit)</td>
                <td className="px-4 py-3.5 font-mono text-indigo-700 bg-indigo-50/20">podAntiAffinity + podAffinity</td>
                <td className="px-4 py-3.5 font-mono text-emerald-700 bg-emerald-50/20">Affinity + HPA (60% CPU)</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-semibold text-slate-900">Replicas Spread</td>
                <td className="px-4 py-3.5 text-rose-600 font-semibold bg-slate-50/30">Clustered (2 on worker 1)</td>
                <td className="px-4 py-3.5 text-emerald-600 font-semibold bg-indigo-50/20">Evenly spread (1 per node)</td>
                <td className="px-4 py-3.5 text-emerald-600 font-semibold bg-emerald-50/20">Bin-packed spread (2, 2, 1)</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-semibold text-slate-900">P95 Latency (250 users)</td>
                <td className="px-4 py-3.5 font-mono text-slate-800 bg-slate-50/30">640 ms</td>
                <td className="px-4 py-3.5 font-mono text-indigo-700 font-bold bg-indigo-50/20">310 ms (-51.5%)</td>
                <td className="px-4 py-3.5 font-mono text-emerald-700 font-bold bg-emerald-50/20">215 ms (-66.4%)</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-semibold text-slate-900">Throughput (RPS)</td>
                <td className="px-4 py-3.5 font-mono text-slate-800 bg-slate-50/30">185 req/s</td>
                <td className="px-4 py-3.5 font-mono text-indigo-700 font-bold bg-indigo-50/20">245 req/s (+32.4%)</td>
                <td className="px-4 py-3.5 font-mono text-emerald-700 font-bold bg-emerald-50/20">280 req/s (+51.3%)</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-semibold text-slate-900">Worker Node Failure Blast Radius</td>
                <td className="px-4 py-3.5 text-rose-600 font-bold bg-slate-50/30">66% replicas lost (2/3)</td>
                <td className="px-4 py-3.5 text-emerald-600 font-bold bg-indigo-50/20">33% replicas lost (1/3)</td>
                <td className="px-4 py-3.5 text-emerald-600 font-bold bg-emerald-50/20">20% replicas lost (1/5)</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-semibold text-slate-900">Service Recovery Time</td>
                <td className="px-4 py-3.5 font-mono text-rose-700 bg-slate-50/30">42 seconds (rescheduling delay)</td>
                <td className="px-4 py-3.5 font-mono text-emerald-700 font-bold bg-indigo-50/20">0 seconds (uninterrupted)</td>
                <td className="px-4 py-3.5 font-mono text-emerald-700 font-bold bg-emerald-50/20">0 seconds (uninterrupted)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Graphical Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latency Comparison Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">P95 Response Latency vs. Concurrent Users</h3>
              <p className="text-[11px] text-slate-500">Lower is better. Demonstrates RPC latency reduction through pod co-location.</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="users" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis unit="ms" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="defaultP95" name="Strategy 1 (Default)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="affinityP95" name="Strategy 2 (Affinity)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hpaP95" name="Strategy 3 (HPA)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Throughput Comparison Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">System Throughput (Requests Per Second)</h3>
              <p className="text-[11px] text-slate-500">Higher is better. Evaluates concurrency handling and autoscaling response.</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="users" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis unit="rps" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="defaultRPS" name="Strategy 1 (Default)" stroke="#94a3b8" strokeWidth={2} />
                <Line type="monotone" dataKey="affinityRPS" name="Strategy 2 (Affinity)" stroke="#4f46e5" strokeWidth={2} />
                <Line type="monotone" dataKey="hpaRPS" name="Strategy 3 (HPA)" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Controlled Node Failure Simulation Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Controlled Worker Node Failure Simulator</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulates a hardware failure of <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">kind-worker</code> to measure fault tolerance and recovery speed.
            </p>
          </div>

          <button
            onClick={() => setSimulatedFailure(!simulatedFailure)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs ${
              simulatedFailure
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {simulatedFailure ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Restore Worker Node
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                Simulate kind-worker Outage
              </>
            )}
          </button>
        </div>

        {/* Dynamic Failure Consequence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {/* Strategy 1 Outcome */}
          <div className={`p-4 rounded-xl border transition ${
            simulatedFailure ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50/60 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-800">Strategy 1 (Default Scheduling) Outcome</span>
              {simulatedFailure && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-200 text-rose-800">
                  Critical Outage Spike
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div>
                Replicas on <code className="font-mono">kind-worker</code>: <strong>2 File Service Pods</strong>
              </div>
              <div>
                Active Replicas Post-Crash: <strong className={simulatedFailure ? 'text-rose-600' : 'text-slate-900'}>
                  {simulatedFailure ? '1 of 3 Available (33%)' : '3 of 3 Available (100%)'}
                </strong>
              </div>
              <div>
                Client Error Rate: <strong className={simulatedFailure ? 'text-rose-600' : 'text-slate-900'}>
                  {simulatedFailure ? '54.2% HTTP 502 / 504 Timeouts' : '0.0%'}
                </strong>
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                {simulatedFailure ? 'Kubernetes requires 40+ seconds to detect node NotReady taint and evict pods.' : 'Under normal conditions, all 3 replicas serve requests.'}
              </div>
            </div>
          </div>

          {/* Strategy 2 Outcome */}
          <div className={`p-4 rounded-xl border transition ${
            simulatedFailure ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50/60 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-indigo-950">Strategy 2 (Pod Anti-Affinity) Outcome</span>
              {simulatedFailure && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-200 text-emerald-800">
                  High Availability Maintained
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div>
                Replicas on <code className="font-mono">kind-worker</code>: <strong>Exactly 1 File Service Pod</strong>
              </div>
              <div>
                Active Replicas Post-Crash: <strong className={simulatedFailure ? 'text-emerald-700' : 'text-slate-900'}>
                  {simulatedFailure ? '2 of 3 Available (66.7%)' : '3 of 3 Available (100%)'}
                </strong>
              </div>
              <div>
                Client Error Rate: <strong className={simulatedFailure ? 'text-emerald-700' : 'text-slate-900'}>
                  {simulatedFailure ? '0.0% Dropped Connections (Gateway failover)' : '0.0%'}
                </strong>
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                {simulatedFailure ? 'Anti-Affinity ensured replicas on worker2 and worker3 absorbed traffic seamlessly.' : 'Replicas are evenly partitioned across all 3 nodes.'}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
