import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import EnterpriseVault from './pages/EnterpriseVault';
import ComplianceAudit from './pages/ComplianceAudit';
import ClusterTopology from './pages/ClusterTopology';
import BenchmarkComparison from './pages/BenchmarkComparison';
import ProblemStatementModal from './components/ProblemStatementModal';
import LoginModal from './pages/LoginModal';
import { authApi } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('vault'); // 'vault' | 'audit' | 'topology' | 'benchmarks'
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeStrategy, setActiveStrategy] = useState('strategy-2-affinity');

  useEffect(() => {
    const saved = authApi.getCurrentUser();
    if (saved) {
      setCurrentUser(saved);
    } else {
      // Default initial enterprise persona: Alex Kumar (Lead Cloud Architect)
      const defaultUser = {
        id: 'usr-alex-kumar',
        username: 'alex.kumar',
        email: 'alex.kumar@vaultcloud.io',
        full_name: 'Alex Kumar',
        role: 'engineer',
        department: 'Cloud & Infrastructure Engineering',
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
    if (user.role === 'auditor') {
      setCurrentView('vault');
      setActiveDepartment('Legal & Corporate Compliance');
    } else if (user.role === 'executive') {
      setCurrentView('vault');
      setActiveDepartment('Global Finance & Operations');
    } else {
      setCurrentView('vault');
      setActiveDepartment('Cloud & Infrastructure Engineering');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden antialiased">
      
      {/* SaaS Left Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeDepartment={activeDepartment}
        setActiveDepartment={setActiveDepartment}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          onOpenProblemStatement={() => setIsProblemModalOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          activeStrategy={activeStrategy}
        />

        {/* Scrollable Workspace Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'vault' && (
              <EnterpriseVault
                activeDepartment={activeDepartment}
                currentUser={currentUser}
                onOpenProblemStatement={() => setIsProblemModalOpen(true)}
              />
            )}

            {currentView === 'audit' && (
              <ComplianceAudit />
            )}

            {currentView === 'topology' && (
              <ClusterTopology
                activeStrategy={activeStrategy}
                setActiveStrategy={setActiveStrategy}
              />
            )}

            {currentView === 'benchmarks' && (
              <BenchmarkComparison />
            )}
          </div>
        </main>
      </div>

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
