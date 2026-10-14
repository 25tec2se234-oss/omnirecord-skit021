import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  CalendarDays,
  ShieldCheck,
  Award,
  Building2,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export const Sidebar = () => {
  const {
    currentRoute,
    navigateTo,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    records,
    notifications,
    restartProductTour
  } = useApp();

  // Pending verification count
  const pendingCount = records.filter(r => r.verificationStatus === 'Pending Review').length;
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students Directory', icon: Users },
    { id: 'records', label: 'Participation Records', icon: FileCheck2 },
    { id: 'activities', label: 'Activities & Events', icon: CalendarDays },
    {
      id: 'verification',
      label: 'Verification Center',
      icon: ShieldCheck,
      badge: pendingCount > 0 ? pendingCount : null
    },
    { id: 'profile', label: 'Achievement Profiles', icon: Award },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : null
    },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Tour', icon: HelpCircle }
  ];

  return (
    <>
      {isMobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand header */}
        <div className="sidebar-brand">
          <button
            type="button"
            className="brand-wrapper"
            onClick={() => navigateTo('dashboard')}
            title="Go to Dashboard"
          >
            <div className="brand-icon">
              <GraduationCap size={22} />
            </div>
            {!isSidebarCollapsed && (
              <div className="brand-info">
                <span className="brand-title">PEHCHAAN</span>
                <span className="brand-badge">SKIT021 • Team Eco-Novators</span>
              </div>
            )}
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            className="btn btn-ghost btn-icon no-mobile"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ width: 28, height: 28 }}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="sidebar-nav-container">
          {!isSidebarCollapsed && (
            <div className="nav-section-title">Institutional Management</div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigateTo(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <span className="nav-item-icon">
                  <Icon size={19} />
                </span>
                {!isSidebarCollapsed && <span>{item.label}</span>}
                {!isSidebarCollapsed && item.badge !== null && item.badge !== undefined && (
                  <span className="nav-item-count">{item.badge}</span>
                )}
              </button>
            );
          })}

          <div style={{ margin: '1rem 0', borderTop: '1px solid var(--border-light)' }} />

          <button
            type="button"
            className="nav-item"
            onClick={() => navigateTo('landing')}
            title="Return to Public Landing Page"
          >
            <span className="nav-item-icon">
              <ExternalLink size={17} />
            </span>
            {!isSidebarCollapsed && <span>Public Landing Page</span>}
          </button>
        </div>

        {/* Sidebar Footer with quick tour restart */}
        {!isSidebarCollapsed && (
          <div className="sidebar-footer">
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
              Need assistance?
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ width: '100%', fontSize: '0.78rem' }}
              onClick={restartProductTour}
            >
              Take Product Tour
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
