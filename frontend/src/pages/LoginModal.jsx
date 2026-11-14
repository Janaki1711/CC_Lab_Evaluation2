import React, { useState } from 'react';
import { X, User, Lock, Mail, Shield, Building2, Check, AlertCircle, Scale, Cpu, PieChart } from 'lucide-react';
import { authApi } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('engineer');
  const [department, setDepartment] = useState('Cloud & Infrastructure Engineering');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const personas = [
    {
      id: 'alex',
      title: 'Alex Kumar',
      subtitle: 'Lead Cloud Architect',
      dept: 'Cloud & Infrastructure Engineering',
      role: 'engineer',
      u: 'alex.kumar',
      p: 'password123',
      icon: Cpu,
      color: 'indigo'
    },
    {
      id: 'sarah',
      title: 'Sarah Chen, Esq.',
      subtitle: 'Legal Counsel & Auditor',
      dept: 'Legal & Corporate Compliance',
      role: 'auditor',
      u: 'sarah.chen',
      p: 'password123',
      icon: Scale,
      color: 'blue'
    },
    {
      id: 'elena',
      title: 'Elena Rostova',
      subtitle: 'VP Finance & Operations',
      dept: 'Global Finance & Operations',
      role: 'executive',
      u: 'elena.rostova',
      p: 'password123',
      icon: PieChart,
      color: 'emerald'
    }
  ];

  const handleQuickPersona = async (p) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(p.u, p.p);
      onLoginSuccess(res.user);
      onClose();
    } catch {
      const mockUser = {
        id: `usr-${p.id}`,
        username: p.u,
        email: `${p.u}@vaultcloud.io`,
        full_name: p.title,
        role: p.role,
        department: p.dept,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', `mock-jwt-token-for-${p.u}`);
      onLoginSuccess(mockUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 'login') {
        const res = await authApi.login(username, password);
        onLoginSuccess(res.user);
        onClose();
      } else {
        const res = await authApi.register({
          username,
          email,
          password,
          full_name: fullName,
          role,
          department
        });
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials or select a quick persona.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Enterprise Vault Identity</h3>
              <p className="text-[11px] text-slate-500 font-mono">RBAC & Cryptographic Token Access</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Evaluation Personas */}
        <div className="px-6 pt-5 pb-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
            Select Enterprise Role (1-Click Switch)
          </label>
          <div className="space-y-2">
            {personas.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickPersona(p)}
                  disabled={loading}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 text-slate-700 group-hover:text-indigo-700 flex items-center justify-center transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{p.title}</div>
                      <div className="text-[10px] text-slate-400">{p.subtitle} • {p.dept.split(' ')[0]}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-semibold">
                    {p.role}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-2 flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Or Manual Sign-In</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3 text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex.kumar"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition shadow-xs"
          >
            {loading ? 'Authenticating...' : 'Sign In with Credentials'}
          </button>
        </form>

      </div>
    </div>
  );
}
