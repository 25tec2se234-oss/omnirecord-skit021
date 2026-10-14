import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  Mail,
  User,
  LogOut,
  RefreshCw,
  X,
  Server
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const {
    isBackendConnected,
    isLoadingBackend,
    currentUser,
    activeRole,
    login,
    logout,
    refreshBackendData
  } = useApp();

  const [email, setEmail] = useState('studentaffairs@skit.ac.in');
  const [password, setPassword] = useState('DemoPassword2024!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'custom'

  if (!isOpen) return null;

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (roleEmail, defaultPass = 'DemoPassword2024!') => {
    setAuthError('');
    setIsSubmitting(true);
    try {
      await login(roleEmail, defaultPass);
      onClose();
    } catch (err) {
      setAuthError(err.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--surface-white)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFF 100%)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'var(--soft-orange)',
                color: 'var(--primary-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Live Backend & Authentication
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Multi-Tenant PostgreSQL Integration
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Database Status Banner */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: isBackendConnected ? 'rgba(34, 197, 94, 0.08)' : 'rgba(234, 179, 8, 0.08)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: isBackendConnected ? '#22c55e' : '#eab308',
                boxShadow: isBackendConnected ? '0 0 6px #22c55e' : 'none'
              }}
            />
            <span style={{ fontWeight: 600, color: isBackendConnected ? '#15803d' : '#854d0e' }}>
              {isBackendConnected ? 'PostgreSQL Database: CONNECTED' : 'Backend: Standalone / Reconnecting'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem', height: 'auto', gap: 4 }}
            onClick={refreshBackendData}
            disabled={isLoadingBackend}
          >
            <RefreshCw size={12} className={isLoadingBackend ? 'spin-animation' : ''} />
            {isLoadingBackend ? 'Testing...' : 'Test Ping'}
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto' }}>
          {/* Active Session Info */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--primary-orange)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}
              >
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentUser?.name || 'Institutional Administrator'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {currentUser?.email || 'studentaffairs@skit.ac.in'} • <span style={{ fontWeight: 600, color: 'var(--primary-orange)' }}>{activeRole}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--error)', fontSize: '0.75rem', gap: 4 }}
              onClick={logout}
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '1.25rem'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderBottom: activeTab === 'quick' ? '2px solid var(--primary-orange)' : '2px solid transparent',
                background: 'transparent',
                fontWeight: activeTab === 'quick' ? 600 : 500,
                color: activeTab === 'quick' ? 'var(--primary-orange)' : 'var(--text-secondary)',
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              One-Click Role Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderBottom: activeTab === 'custom' ? '2px solid var(--primary-orange)' : '2px solid transparent',
                background: 'transparent',
                fontWeight: activeTab === 'custom' ? 600 : 500,
                color: activeTab === 'custom' ? 'var(--primary-orange)' : 'var(--text-secondary)',
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              Email & Password
            </button>
          </div>

          {authError && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--error)',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: '1rem'
              }}
            >
              <AlertCircle size={15} />
              {authError}
            </div>
          )}

          {activeTab === 'quick' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                Select an institutional role to authenticate with the live backend database:
              </p>

              {/* Admin Button */}
              <button
                type="button"
                className="btn btn-outline"
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  textAlign: 'left'
                }}
                onClick={() => handleQuickLogin('studentaffairs@skit.ac.in')}
                disabled={isSubmitting}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    🏛️ Institutional Administrator
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    studentaffairs@skit.ac.in • Full administrative permissions
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary-orange)', fontWeight: 600 }}>
                  Login →
                </span>
              </button>

              {/* Coordinator Button */}
              <button
                type="button"
                className="btn btn-outline"
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  textAlign: 'left'
                }}
                onClick={() => handleQuickLogin('cse.coordinator@skit.ac.in')}
                disabled={isSubmitting}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    👨‍🏫 Faculty Coordinator / Reviewer
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    cse.coordinator@skit.ac.in • Verification & review queue
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary-orange)', fontWeight: 600 }}>
                  Login →
                </span>
              </button>

              {/* Student Button */}
              <button
                type="button"
                className="btn btn-outline"
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  textAlign: 'left'
                }}
                onClick={() => handleQuickLogin('aarav.sharma@skit.ac.in')}
                disabled={isSubmitting}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    🎓 Student (Aarav Sharma)
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    aarav.sharma@skit.ac.in • Participation portfolio submission
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary-orange)', fontWeight: 600 }}>
                  Login →
                </span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>
                  Institutional Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-tertiary)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. studentaffairs@skit.ac.in"
                    className="form-control"
                    style={{ paddingLeft: 34, fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-tertiary)' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="form-control"
                    style={{ paddingLeft: 34, fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Seed Demo Password: <code>DemoPassword2024!</code>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                style={{ width: '100%', marginTop: 8 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Authenticating with PostgreSQL...' : 'Sign In with Database'}
              </Button>
            </form>
          )}

          {/* Backend Info Footer */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.75rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Server size={14} style={{ color: 'var(--primary-orange)' }} />
            <div>
              <strong>Host:</strong> pehchaan-backend-qkyn.onrender.com
              <br />
              <strong>Tenant:</strong> Swami Keshvanand Institute of Technology (SKIT-021)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
