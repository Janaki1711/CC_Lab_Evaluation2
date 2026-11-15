import React, { useState } from 'react';
import { X, User, Lock, Mail, Shield, Building2, Check, AlertCircle, Scale, Cpu, PieChart, GraduationCap, School } from 'lucide-react';
import { authApi } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const personas = [
    {
      id: 'student',
      title: 'student1',
      subtitle: 'Student Portal (Uploader)',
      dept: 'Computer Science',
      role: 'student',
      u: 'student1',
      p: 'password123',
      icon: GraduationCap,
      color: 'blue'
    },
    {
      id: 'teacher',
      title: 'teacher1',
      subtitle: 'Professor (Grader & Auditor)',
      dept: 'Computer Science',
      role: 'teacher',
      u: 'teacher1',
      p: 'password123',
      icon: School,
      color: 'emerald'
    },
    {
      id: 'alex',
      title: 'Alex Kumar',
      subtitle: 'Lead Cloud Architect',
      dept: 'Cloud Infrastructure',
      role: 'engineer',
      u: 'alex.kumar',
      p: 'password123',
      icon: Cpu,
      color: 'indigo'
    },
    {
      id: 'admin',
      title: 'admin',
      subtitle: 'Systems Administrator',
      dept: 'Security Operations',
      role: 'admin',
      u: 'admin',
      p: 'password123',
      icon: Shield,
      color: 'purple'
    }
  ];

  const handleQuickPersona = async (p) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await authApi.login(p.u, p.p);
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || `Login failed for ${p.u}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (tab === 'login') {
        const res = await authApi.login(username, password);
        onLoginSuccess(res.user);
        onClose();
      } else {
        const cleanEmail = email || `${username}@university.edu`;
        const res = await authApi.register({
          username,
          email: cleanEmail,
          password,
          full_name: fullName || username,
          role,
          department
        });
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Authentication failed. Please check credentials or register a new account.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Academic Cloud Identity</h3>
              <p className="text-[11px] text-slate-500 font-mono">JWT RBAC • PostgreSQL Authentication</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div className="px-6 pt-4 pb-1">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create New Account
            </button>
          </div>
        </div>

        {tab === 'login' ? (
          <div>
            {/* 1-Click Personas */}
            <div className="px-6 pt-3 pb-1">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Quick Select Persona (1-Click)
                </label>
                <span className="text-[10px] text-indigo-600 font-medium">password: password123</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {personas.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickPersona(p)}
                      disabled={loading}
                      className="p-2 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition flex items-center gap-2 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-100 text-slate-700 group-hover:text-indigo-700 flex items-center justify-center transition flex-shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">{p.title}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{p.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-2 flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Or Enter Credentials</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Manual Login Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-1 space-y-3 text-xs">
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setError(''); }}
                    className="underline font-bold text-indigo-700 hover:text-indigo-900 whitespace-nowrap ml-1"
                  >
                    Register?
                  </button>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. student1, teacher1, or your username"
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
                  placeholder="Enter password (default: password123)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition shadow-xs flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-3 text-xs">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. jdoe24"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. jdoe@university.edu"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose password (min 6 characters)"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher / Professor</option>
                  <option value="engineer">Engineer / Architect</option>
                  <option value="admin">Administrator</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Create Account & Sign In'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
