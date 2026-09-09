import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PERMISSIONS, ROLES } from './config/roles';
import Login from './components/Login';
import RoleGuard from './components/RoleGuard';
import StakeholderRegistry from './components/StakeholderRegistry';
import ProgramAgenda from './components/ProgramAgenda';
import ProtocolTracker from './components/ProtocolTracker';
import SeatingAssigner from './components/SeatingAssigner';
import PartnerEngagement from './components/PartnerEngagement';
import SecurityScanner from './components/SecurityScanner';
import TeamDeploymentHub from './components/TeamDeploymentHub';
import PublicRSVP from './components/PublicRSVP';
import OperationalAnalytics from './components/OperationalAnalytics';
import ExecutiveOversight from './components/ExecutiveOversight';
import UserRoleManager from './components/UserRoleManager';
import CSRLedgerAndRegistration from './components/CSRLedgerAndRegistration';
import InstallAppButton from './components/InstallAppButton';
import SeedButton from './components/SeedButton';
import { 
  Users, 
  Calendar, 
  PlaneTakeoff, 
  ShieldCheck, 
  Armchair, 
  Landmark, 
  ClipboardList, 
  LogOut, 
  QrCode, 
  BarChart3, 
  Crown, 
  ShieldAlert, 
  HeartHandshake 
} from 'lucide-react';

// Inner component to safely consume useAuth inside the AuthProvider tree
function MainLayout() {
  const { currentUser, userRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('stakeholders');

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Header Brand & Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/napps-logo.png" 
              alt="NAPPS Logo" 
              className="w-9 h-9 object-contain rounded-lg bg-white p-0.5" 
            />
            <div>
              <h1 className="text-sm font-bold tracking-tight">NAPPSCONFERENCE2026</h1>
              <p className="text-[10px] text-slate-400">Management & Protocol System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dynamic Install App Button */}
            <InstallAppButton />

            <div className="hidden sm:block text-right border-l border-slate-700 pl-3">
              <span className="block text-xs font-semibold">{currentUser.email}</span>
              <span className="inline-block text-[10px] font-bold uppercase bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded">
                Role: {userRole || ROLES.GUEST}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="bg-slate-800 border-t border-slate-700 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-4 overflow-x-auto">
            {userRole === ROLES.SUPER_ADMIN && (
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'users' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>User Access Control</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('stakeholders')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'stakeholders' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>VIP & Stakeholders</span>
            </button>

            <button
              onClick={() => setActiveTab('csr_ledger')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'csr_ledger' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Support & CSR Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab('rsvp')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'rsvp' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Public RSVP Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'analytics' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Operational Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('oversight')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'oversight' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Executive Brief</span>
            </button>

            <button
              onClick={() => setActiveTab('engagement')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'engagement' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>Partner Engagement</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'tasks' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Team Task Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'agenda' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Program Agenda</span>
            </button>

            <button
              onClick={() => setActiveTab('protocol')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'protocol' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlaneTakeoff className="w-4 h-4" />
              <span>Protocol & Logistics</span>
            </button>

            <button
              onClick={() => setActiveTab('seating')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'seating' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Armchair className="w-4 h-4" />
              <span>Seating Assigner</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'security' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Security Check-In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
          <SeedButton />
        </div>

        {activeTab === 'users' && (
          <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
            <UserRoleManager />
          </RoleGuard>
        )}

        {activeTab === 'stakeholders' && (
          <RoleGuard allowedRoles={PERMISSIONS.stakeholders}>
            <StakeholderRegistry />
          </RoleGuard>
        )}

        {activeTab === 'csr_ledger' && (
          <RoleGuard allowedRoles={PERMISSIONS.csr_ledger}>
            <CSRLedgerAndRegistration />
          </RoleGuard>
        )}

        {activeTab === 'rsvp' && (
          <RoleGuard allowedRoles={PERMISSIONS.rsvp}>
            <PublicRSVP />
          </RoleGuard>
        )}

        {activeTab === 'analytics' && (
          <RoleGuard allowedRoles={PERMISSIONS.analytics}>
            <OperationalAnalytics />
          </RoleGuard>
        )}

        {activeTab === 'oversight' && (
          <RoleGuard allowedRoles={PERMISSIONS.oversight}>
            <ExecutiveOversight />
          </RoleGuard>
        )}

        {activeTab === 'engagement' && (
          <RoleGuard allowedRoles={PERMISSIONS.engagement}>
            <PartnerEngagement />
          </RoleGuard>
        )}

        {activeTab === 'tasks' && (
          <RoleGuard allowedRoles={PERMISSIONS.tasks}>
            <TeamDeploymentHub />
          </RoleGuard>
        )}

        {activeTab === 'agenda' && (
          <RoleGuard allowedRoles={PERMISSIONS.agenda}>
            <ProgramAgenda />
          </RoleGuard>
        )}

        {activeTab === 'protocol' && (
          <RoleGuard allowedRoles={PERMISSIONS.protocol}>
            <ProtocolTracker />
          </RoleGuard>
        )}

        {activeTab === 'seating' && (
          <RoleGuard allowedRoles={PERMISSIONS.seating}>
            <SeatingAssigner />
          </RoleGuard>
        )}

        {activeTab === 'security' && (
          <RoleGuard allowedRoles={PERMISSIONS.security}>
            <SecurityScanner />
          </RoleGuard>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-[11px] text-slate-500">
        NAPPSCONFERENCE2026 Core Operations System • Built for Real-Time Event Management
      </footer>
    </div>
  );
}

// Root App Component
export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}