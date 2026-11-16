import React, { useState } from 'react';
import { User, Lock, Mail, Film, CheckCircle2, X, Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginModal({
  isOpen,
  onClose,
  currentUser,
  onLoginUser
}) {
  const [tab, setTab] = useState('demo'); // 'demo' or 'custom'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const demoAccounts = [
    {
      id: 'user_alex_101',
      name: 'Alex Kumar',
      email: 'alex.kumar@cinema.com',
      role: 'VIP Gold Buyer',
      badge: 'VIP Gold',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-600/60',
      description: 'Frequently buys VIP Recliners (Row A). Ideal for Buyer 1 race condition demo.'
    },
    {
      id: 'user_sarah_202',
      name: 'Sarah Jenkins',
      email: 'sarah.j@cinema.com',
      role: 'Regular Buyer',
      badge: 'Member',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-600/60',
      description: 'Competes for popular seats in Window 2. Ideal for demonstrating HTTP 409 collisions.'
    },
    {
      id: 'user_sharma_303',
      name: 'Prof. Sharma',
      email: 'evaluator@university.edu',
      role: 'Lab Faculty / Evaluator',
      badge: 'Evaluator',
      badgeColor: 'bg-red-950 text-red-300 border-red-600/60',
      description: 'Faculty account for grading Kubernetes placement & concurrency compliance.'
    }
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    const customUser = {
      id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
      name: name || email.split('@')[0],
      email: email,
      role: 'Custom User',
      badge: 'User'
    };
    onLoginUser(customUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e111a] border border-[#2b334a] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#232a3e] bg-gradient-to-r from-red-950/50 via-[#131724] to-[#0e111a] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-1">
                <span>book</span>
                <span className="text-red-500">my</span>
                <span>show</span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-700/50 uppercase font-mono ml-2">
                  Account Sign In
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Access ticket reservations, loyalty rewards & flash sales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2030] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#212739] bg-[#111420]">
          <button
            type="button"
            onClick={() => setTab('demo')}
            className={`flex-1 py-3 text-xs font-mono font-bold border-b-2 transition-all ${
              tab === 'demo'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Fast 1-Click Demo Profiles (Viva)
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`flex-1 py-3 text-xs font-mono font-bold border-b-2 transition-all ${
              tab === 'custom'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Custom Sign In / Register
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {tab === 'demo' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-mono">
                Click any profile below to sign in instantly. Use different profiles across 2 browser windows to showcase <strong className="text-amber-400">distributed lock collision (409 Conflict)</strong>!
              </p>

              {demoAccounts.map((account) => {
                const isActive = currentUser.id === account.id;

                return (
                  <div
                    key={account.id}
                    onClick={() => {
                      onLoginUser(account);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-gradient-to-r from-red-950/40 to-[#181d2c] border-red-500 ring-2 ring-red-500/50 shadow-lg'
                        : 'bg-[#141825] hover:bg-[#1b2032] border-[#262f44] hover:border-slate-500'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white font-sans">
                          {account.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${account.badgeColor}`}>
                          {account.badge}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {account.email} • {account.role}
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans">
                        {account.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white font-mono text-xs font-bold transition-all flex items-center space-x-1"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Full Name:
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#141825] border border-[#272f44] focus:border-red-500 rounded-xl px-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Email Address:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@cinema.com"
                    required
                    className="w-full bg-[#141825] border border-[#272f44] focus:border-red-500 rounded-xl px-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Password:
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#141825] border border-[#272f44] focus:border-red-500 rounded-xl px-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-lg shadow-red-950 transition-all"
              >
                Sign In to Account
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0c13] border-t border-[#212739] flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Kubernetes RBAC & Session Token: Active</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
