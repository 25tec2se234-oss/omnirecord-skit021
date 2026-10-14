import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { ProductOnboardingModal } from './components/onboarding/ProductOnboardingModal';
import { RecordFormModal } from './components/records/RecordFormModal';
import { AuthModal } from './components/auth/AuthModal';

// Major Application Views
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { OrganiserPortal } from './components/portals/OrganiserPortal';
import { StudentPortal } from './components/portals/StudentPortal';
import { StaffManagement } from './components/staff/StaffManagement';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { StudentManagement } from './components/students/StudentManagement';
import { ParticipationRecords } from './components/records/ParticipationRecords';
import { ActivityManagement } from './components/activities/ActivityManagement';
import { VerificationCenter } from './components/verification/VerificationCenter';
import { StudentAchievementProfile } from './components/profile/StudentAchievementProfile';
import { DepartmentManagement } from './components/departments/DepartmentManagement';
import { AnalyticsReports } from './components/analytics/AnalyticsReports';
import { NotificationsCenter } from './components/notifications/NotificationsCenter';
import { SettingsPage } from './components/settings/SettingsPage';
import { HelpCenter } from './components/help/HelpCenter';

const MainAppLayout = () => {
  const {
    currentRoute,
    isSidebarCollapsed,
    hasCompletedOnboarding,
    setIsOnboardingOpen,
    institutionInfo,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useApp();

  const [isGlobalRecordModalOpen, setIsGlobalRecordModalOpen] = useState(false);

  // If new user arrives and enters dashboard without having seen onboarding, launch onboarding
  useEffect(() => {
    if (!hasCompletedOnboarding && currentRoute !== 'landing') {
      setIsOnboardingOpen(true);
    }
  }, [hasCompletedOnboarding, currentRoute, setIsOnboardingOpen]);

  // If on public landing page, render dedicated full-width presentation
  if (currentRoute === 'landing') {
    return (
      <>
        <LandingPage />
        <ProductOnboardingModal />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
        <ToastContainer />
      </>
    );
  }

  // If on dedicated login page, render full-screen authentication experience
  if (currentRoute === 'login') {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const renderRouteContent = () => {
    switch (currentRoute) {
      case 'dashboard':
        return (
          <DashboardOverview
            onOpenRecordModal={() => setIsGlobalRecordModalOpen(true)}
          />
        );
      case 'organiser-dashboard':
        return <OrganiserPortal />;
      case 'student-dashboard':
      case 'student-portfolio':
      case 'student-submit':
        return <StudentPortal />;
      case 'students':
        return <StudentManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'records':
        return <ParticipationRecords />;
      case 'activities':
        return (
          <ActivityManagement
            onOpenRecordModal={() => setIsGlobalRecordModalOpen(true)}
          />
        );
      case 'verification':
        return <VerificationCenter />;
      case 'profile':
        return <StudentAchievementProfile />;
      case 'departments':
        return <DepartmentManagement />;
      case 'analytics':
        return <AnalyticsReports />;
      case 'notifications':
        return <NotificationsCenter />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpCenter />;
      default:
        return (
          <DashboardOverview
            onOpenRecordModal={() => setIsGlobalRecordModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Collapsible / Mobile-friendly Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`app-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <Navbar onOpenRecordModal={() => setIsGlobalRecordModalOpen(true)} />

        <main className="app-content" id="main-content">
          {renderRouteContent()}
        </main>

        {/* Institutional Minimal Footer */}
        <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', background: 'var(--surface-white)', padding: '1rem 1.75rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <strong>{institutionInfo.shortName}</strong> • {institutionInfo.portalId} • Institutional Governance Simulation
          </div>
          <div>
            Frontend Prototype • SKIT021 Centralized Student Participation Platform
          </div>
        </footer>
      </div>

      {/* Global Modals & Toast Layer */}
      <RecordFormModal
        isOpen={isGlobalRecordModalOpen}
        onClose={() => setIsGlobalRecordModalOpen(false)}
      />

      <ProductOnboardingModal />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
