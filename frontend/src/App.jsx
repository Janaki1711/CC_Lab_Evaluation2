import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProblemStatementModal from './components/ProblemStatementModal';
import LoginModal from './pages/LoginModal';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ClusterTopology from './pages/ClusterTopology';
import BenchmarkComparison from './pages/BenchmarkComparison';
import { authApi } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('student'); // 'student' | 'teacher' | 'topology' | 'benchmarks'
  const [currentUser, setCurrentUser] = useState(null);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeStrategy, setActiveStrategy] = useState('strategy-2-affinity');

  useEffect(() => {
    // Initialize user session
    const saved = authApi.getCurrentUser();
    if (saved) {
      setCurrentUser(saved);
      if (saved.role === 'teacher') {
        setCurrentTab('teacher');
      }
    } else {
      // Default initial mock session as Student Janaki
      const defaultUser = {
        id: 'usr-student1-uuid',
        username: 'student1',
        email: 'student1@univ.edu',
        full_name: 'Janaki (Student)',
        role: 'student',
        department: 'Computer Science & Engineering',
        created_at: new Date().toISOString()
      };
      setCurrentUser(defaultUser);
      localStorage.setItem('user', JSON.stringify(defaultUser));
    }
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'teacher') {
      setCurrentTab('teacher');
    } else {
      setCurrentTab('student');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenProblemStatement={() => setIsProblemModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        activeStrategy={activeStrategy}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'student' && (
          <StudentDashboard
            currentUser={currentUser}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentTab === 'teacher' && (
          <TeacherDashboard
            currentUser={currentUser}
          />
        )}

        {currentTab === 'topology' && (
          <ClusterTopology
            activeStrategy={activeStrategy}
            setActiveStrategy={setActiveStrategy}
          />
        )}

        {currentTab === 'benchmarks' && (
          <BenchmarkComparison />
        )}
      </main>

      {/* Academic Platform Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Cloud Computing Laboratory Evaluation 2</span>
            <span>•</span>
            <span>Intelligent Pod Placement & Fault-Tolerant Distributed File Storage</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Kubernetes v1.36</span>
            <span>kind 0.33</span>
            <span>FastAPI</span>
            <span>MinIO</span>
            <span>PostgreSQL 16</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProblemStatementModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
