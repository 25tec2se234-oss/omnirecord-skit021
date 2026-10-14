import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Button } from '../common/Button';
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Home,
  UserCheck,
  CalendarCheck,
  Award
} from 'lucide-react';

export const LoginPage = () => {
  const { login, navigateTo, isBackendConnected, refreshBackendData, addToast } = useApp();

  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'credentials' | 'forgot'
  const [email, setEmail] = useState('studentaffairs@skit.ac.in');
  const [password, setPassword] = useState('DemoPassword2024!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      const role = data?.user?.role || data?.membership?.role || 'INSTITUTION_ADMIN';

      // Role-based redirect
      if (role === 'STUDENT') {
        navigateTo('student-dashboard');
      } else if (role === 'FACULTY_COORDINATOR') {
        navigateTo('organiser-dashboard');
      } else {
        navigateTo('dashboard');
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Invalid credentials or backend unreachable. Please try again or test database sync.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (roleEmail, targetPortal, defaultPass = 'DemoPassword2024!') => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(roleEmail, defaultPass);
      navigateTo(targetPortal);
    } catch (err) {
      setErrorMessage(
        err.message || 'Quick login failed. Click below to initialize database tables if first run.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncDatabase = async () => {
    setIsSyncingDb(true);
    setErrorMessage('');
    try {
      const res = await api.system.initDb();
      addToast({
        title: "Database Synchronized",
        message: res.message || "PostgreSQL database migrated and seeded successfully!",
        type: "success"
      });
      await refreshBackendData();
    } catch (err) {
      setErrorMessage(err.message || "Database sync failed. Server might still be launching.");
    } finally {
      setIsSyncingDb(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.auth.requestPasswordReset(forgotEmail);
      setForgotSuccess(true);
    } catch {
      // Simulate/standard response for security
      setForgotSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #FFF7ED 0%, #F8FAFC 85%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Top Brand Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-orange)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)'
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              PEHCHAAN
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary-orange)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              SKIT021 Central Platform
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigateTo('landing')}
          style={{ gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}
        >
          <Home size={15} />
          Landing Page
        </button>
      </div>

      {/* Main Login Card */}
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '2rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          background: 'var(--surface-white)',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Institutional Portal Login
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 6, marginBottom: 0 }}>
            Secure role-based access for Administrators, Organisers, and Students
          </p>
        </div>

        {/* Database Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: isBackendConnected ? 'rgba(34, 197, 94, 0.08)' : 'rgba(234, 179, 8, 0.08)',
            border: `1px solid ${isBackendConnected ? 'rgba(34, 197, 94, 0.25)' : 'rgba(234, 179, 8, 0.25)'}`,
            marginBottom: '1.5rem',
            fontSize: '0.78rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
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
              {isBackendConnected ? 'PostgreSQL Database: Online & Live' : 'Backend: Standalone Mode'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleSyncDatabase}
            disabled={isSyncingDb}
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', height: 'auto', gap: 4 }}
            title="Auto-migrate and seed initial accounts"
          >
            <RefreshCw size={11} className={isSyncingDb ? 'spin-animation' : ''} />
            {isSyncingDb ? 'Syncing...' : 'Sync DB'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '1.5rem'
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('quick'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '0.65rem 0.5rem',
              border: 'none',
              borderBottom: activeTab === 'quick' ? '2px solid var(--primary-orange)' : '2px solid transparent',
              background: 'transparent',
              fontWeight: activeTab === 'quick' ? 700 : 500,
              color: activeTab === 'quick' ? 'var(--primary-orange)' : 'var(--text-secondary)',
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 150ms'
            }}
          >
            Role Login
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('credentials'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '0.65rem 0.5rem',
              border: 'none',
              borderBottom: activeTab === 'credentials' ? '2px solid var(--primary-orange)' : '2px solid transparent',
              background: 'transparent',
              fontWeight: activeTab === 'credentials' ? 700 : 500,
              color: activeTab === 'credentials' ? 'var(--primary-orange)' : 'var(--text-secondary)',
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 150ms'
            }}
          >
            Credentials Form
          </button>
        </div>

        {/* Error Alert with Auto-repair Action */}
        {errorMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--error)',
              fontSize: '0.8rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{errorMessage}</div>
            </div>
            <button
              type="button"
              onClick={handleSyncDatabase}
              disabled={isSyncingDb}
              style={{
                marginTop: 8,
                fontSize: '0.75rem',
                color: 'var(--primary-orange)',
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 600
              }}
            >
              <RefreshCw size={12} className={isSyncingDb ? 'spin-animation' : ''} />
              {isSyncingDb ? 'Initializing database...' : 'Click to initialize & seed database accounts'}
            </button>
          </div>
        )}

        {/* Tab 1: Role Login */}
        {activeTab === 'quick' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
              Choose a portal role to log in with verified institutional credentials:
            </p>

            {/* College Admin Portal Card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('studentaffairs@skit.ac.in', 'dashboard')}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                background: 'var(--surface-white)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-orange)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--soft-orange)',
                    color: 'var(--primary-orange)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    College Administrative Portal
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    studentaffairs@skit.ac.in • Full Institutional Oversight
                  </div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--primary-orange)' }} />
            </button>

            {/* Event Organiser Portal Card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('cse.coordinator@skit.ac.in', 'organiser-dashboard')}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                background: 'var(--surface-white)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-orange)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Event Organiser Portal
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    cse.coordinator@skit.ac.in • Events, Rosters & Review Queue
                  </div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: '#2563eb' }} />
            </button>

            {/* Student Portal Card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('aarav.sharma@skit.ac.in', 'student-dashboard')}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                background: 'var(--surface-white)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-orange)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Student Portal
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    aarav.sharma@skit.ac.in • Portfolio & Submissions
                  </div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: '#16a34a' }} />
            </button>
          </div>
        )}

        {/* Tab 2: Standard Credentials Form */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Institutional Email or Student ID
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-tertiary)' }} />
                <input
                  type="email"
                  required
                  placeholder="e.g. studentaffairs@skit.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: 38, fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  style={{ fontSize: '0.75rem', color: 'var(--primary-orange)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-tertiary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter institutional password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: 38, paddingRight: 38, fontSize: '0.88rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: 5 }}>
                Default Seed Password: <code>DemoPassword2024!</code>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {isLoading ? 'Authenticating with PostgreSQL...' : 'Sign In to Portal'}
            </Button>
          </form>
        )}

        {/* Tab 3: Forgot Password View */}
        {activeTab === 'forgot' && (
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 6px' }}>Reset Your Password</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
              Enter your registered institutional email to receive a secure recovery token.
            </p>

            {forgotSuccess ? (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#15803d',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: '1rem'
                }}
              >
                <CheckCircle2 size={18} />
                <span>If an account exists, a password reset link has been dispatched to your institutional inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="email"
                  required
                  placeholder="name@skit.ac.in"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '0.88rem' }}
                />
                <Button type="submit" variant="primary" size="md" disabled={isLoading}>
                  {isLoading ? 'Sending Request...' : 'Send Password Reset Link'}
                </Button>
              </form>
            )}

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setActiveTab('credentials'); setForgotSuccess(false); }}
              style={{ width: '100%', marginTop: 10, fontSize: '0.8rem' }}
            >
              ← Back to Login
            </button>
          </div>
        )}

        {/* Institutional Footer */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-light)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)'
          }}
        >
          Protected by multi-tenant PostgreSQL schema isolation.
          <br />
          Swami Keshvanand Institute of Technology (SKIT-021)
        </div>
      </div>
    </div>
  );
};
