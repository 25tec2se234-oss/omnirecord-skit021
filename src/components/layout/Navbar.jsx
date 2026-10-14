import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import {
  Menu,
  Search,
  Bell,
  PlusCircle,
  HelpCircle,
  RotateCcw,
  User,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  Globe,
  ShieldCheck,
  LogOut
} from 'lucide-react';

export const Navbar = ({ onOpenRecordModal }) => {
  const {
    navigateTo,
    setIsMobileSidebarOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    restartProductTour,
    resetDemoData,
    institutionInfo,
    isBackendConnected,
    setIsAuthModalOpen,
    currentUser,
    activeRole,
    logout
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to records or students with search
    navigateTo('records');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />;
      case 'warning':
        return <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />;
      case 'info':
      default:
        return <Info size={16} style={{ color: 'var(--info)' }} />;
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Mobile menu toggle */}
        <button
          type="button"
          className="btn btn-ghost btn-icon mobile-menu-toggle"
          onClick={() => setIsMobileSidebarOpen(true)}
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="header-search">
          <Search size={16} className="header-search-icon" />
          <input
            type="search"
            placeholder="Search students, activities, certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search records"
          />
        </form>
      </div>

      <div className="header-right">
        {/* Live Backend Database Status Pill */}
        <button
          type="button"
          onClick={() => navigateTo('login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.76rem',
            fontWeight: 600,
            background: isBackendConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
            color: isBackendConnected ? '#15803d' : '#854d0e',
            border: `1px solid ${isBackendConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
            cursor: 'pointer',
            transition: 'all 150ms'
          }}
          title="Click to check backend health or sign in"
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isBackendConnected ? '#22c55e' : '#eab308',
              boxShadow: isBackendConnected ? '0 0 6px #22c55e' : 'none'
            }}
          />
          <span className="no-mobile">
            {isBackendConnected ? 'PostgreSQL Live' : 'Backend Standalone'}
          </span>
        </button>

        {/* Quick Add Record action */}
        {onOpenRecordModal && (
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={onOpenRecordModal}
            className="no-mobile"
          >
            Record Participation
          </Button>
        )}

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Open notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-orange)',
                  boxShadow: '0 0 0 2px var(--surface-white)'
                }}
              />
            )}
          </button>

          {isNotifOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '115%',
                width: 320,
                background: 'var(--surface-white)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-light)',
                zIndex: 60,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-light)',
                  background: 'var(--bg-secondary)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    style={{ fontSize: '0.75rem', color: 'var(--primary-orange)', fontWeight: 500 }}
                    onClick={markAllNotificationsAsRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                    No notifications right now
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.targetPage) navigateTo(n.targetPage, { recordId: n.recordId });
                        setIsNotifOpen(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        background: n.read ? 'transparent' : 'var(--orange-50)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        transition: 'background 150ms'
                      }}
                    >
                      <div style={{ marginTop: 2 }}>{getNotifIcon(n.type)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: n.read ? 500 : 600, color: 'var(--text-primary)' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.35 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                          {n.timestamp}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: '0.65rem',
                  borderTop: '1px solid var(--border-light)',
                  textAlign: 'center',
                  background: 'var(--surface-hover)'
                }}
              >
                <button
                  type="button"
                  style={{ fontSize: '0.78rem', color: 'var(--primary-orange)', fontWeight: 600 }}
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigateTo('notifications');
                  }}
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-md)', gap: 8 }}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="User account menu"
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--soft-orange)',
                color: 'var(--primary-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.82rem',
                border: '1px solid var(--orange-100)'
              }}
            >
              {(currentUser?.name || currentUser?.fullName || 'User')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }} className="no-mobile">
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {activeRole === 'STUDENT'
                  ? 'Student Portal'
                  : activeRole === 'FACULTY_COORDINATOR'
                  ? 'Organiser Portal'
                  : 'College Admin'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {currentUser?.name || currentUser?.fullName || institutionInfo.shortName}
              </span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
          </button>

          {isUserMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '115%',
                width: 240,
                background: 'var(--surface-white)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-light)',
                zIndex: 60,
                padding: '0.5rem'
              }}
            >
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: 4 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentUser?.name || currentUser?.fullName || 'Active Session'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {currentUser?.email || institutionInfo.adminEmail}
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary-orange)', marginTop: 4, textTransform: 'uppercase' }}>
                  Role: {activeRole}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigateTo('login');
                }}
              >
                <ShieldCheck size={15} style={{ marginRight: 8, color: 'var(--primary-orange)' }} />
                Sign In / Switch Portal
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                onClick={() => {
                  setIsUserMenuOpen(false);
                  restartProductTour();
                }}
              >
                <HelpCircle size={15} style={{ marginRight: 8, color: 'var(--primary-orange)' }} />
                Product Tour (Onboarding)
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigateTo('settings');
                }}
              >
                <User size={15} style={{ marginRight: 8 }} />
                Profile & Settings
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigateTo('landing');
                }}
              >
                <Globe size={15} style={{ marginRight: 8 }} />
                View Public Landing Page
              </button>

              <div style={{ margin: '4px 0', borderTop: '1px solid var(--border-light)' }} />

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: 'var(--error)' }}
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                  navigateTo('login');
                }}
              >
                <LogOut size={15} style={{ marginRight: 8 }} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
