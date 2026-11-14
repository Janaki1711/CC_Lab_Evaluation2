import React from 'react';
import { 
  Shield, 
  FolderLock, 
  FileText, 
  Scale, 
  Cpu, 
  PieChart, 
  Users, 
  Activity, 
  Server, 
  BarChart3, 
  HardDrive,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, activeDepartment, setActiveDepartment, fileCounts = {} }) {
  const folders = [
    { id: 'all', label: 'All Vault Assets', icon: FolderLock, count: fileCounts.all || 4 },
    { id: 'Legal & Corporate Compliance', label: 'Legal & Contracts', icon: Scale, count: fileCounts.legal || 2 },
    { id: 'Cloud & Infrastructure Engineering', label: 'Engineering Blueprints', icon: Cpu, count: fileCounts.eng || 1 },
    { id: 'Global Finance & Operations', label: 'Finance & Audits', icon: PieChart, count: fileCounts.fin || 1 },
    { id: 'Human Resources', label: 'HR & Protocols', icon: Users, count: fileCounts.hr || 1 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm tracking-tight">KubeVault</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Distributed Document Storage</p>
            </div>
          </div>
        </div>

        {/* Navigation Section 1: Enterprise Vault */}
        <div className="px-3 pt-4">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Workspace Vault
          </div>
          <nav className="space-y-0.5">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isActive = currentView === 'vault' && activeDepartment === folder.id;

              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setCurrentView('vault');
                    setActiveDepartment(folder.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{folder.label}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500">
                    {folder.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Navigation Section 2: Compliance & Audit */}
        <div className="px-3 pt-5">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Governance & Audit
          </div>
          <button
            onClick={() => setCurrentView('audit')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              currentView === 'audit'
                ? 'bg-slate-100 text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className={`w-4 h-4 ${currentView === 'audit' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Compliance Audit Trail</span>
          </button>
        </div>

        {/* Navigation Section 3: Cloud Infrastructure */}
        <div className="px-3 pt-5">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Kubernetes Operations
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => setCurrentView('topology')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === 'topology'
                  ? 'bg-slate-100 text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Server className={`w-4 h-4 ${currentView === 'topology' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>Placement Topology</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            <button
              onClick={() => setCurrentView('benchmarks')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === 'benchmarks'
                  ? 'bg-slate-100 text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${currentView === 'benchmarks' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Affinity Benchmarks</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Sidebar Footer: Security Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
              MinIO S3 Cluster
            </span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded font-mono font-semibold">
              ENCRYPTED
            </span>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            Topology Spread: <strong className="text-slate-700">3 Worker Nodes</strong>
          </div>
        </div>
      </div>
    </aside>
  );
}
