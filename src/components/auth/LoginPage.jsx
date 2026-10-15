import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
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
  Building2,
  Award,
  Users,
  Sparkles,
  ChevronRight,
  ExternalLink,
  BookOpen,
  UserPlus,
  Phone
} from 'lucide-react';

export const LoginPage = () => {
  const { login, register, navigateTo, isBackendConnected, refreshBackendData, addToast } = useApp();

  // Mode: 'signin' | 'register' | 'demo' | 'forgot'
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  // Registration state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('STUDENT');
  const [regStudentId, setRegStudentId] = useState('');
  const [regDepartmentCode, setRegDepartmentCode] = useState('CS');
  const [regPhone, setRegPhone] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Pre-configured persona accounts for SKIT021
  const DEMO_PERSONAS = [
    {
      role: 'INSTITUTION_ADMIN',
      portal: 'dashboard',
      title: 'College Admin',
      subtitle: 'Student Affairs & Dean Office',
      email: 'studentaffairs@skit.ac.in',
      password: 'DemoPassword2024!',
      badge: 'Full Oversight',
      icon: Building2,
      color: '#EA580C',
      bg: '#FFF7ED'
    },
    {
      role: 'FACULTY_COORDINATOR',
      portal: 'organiser-dashboard',
      title: 'Event Organiser',
      subtitle: 'Faculty & Event Reviewer',
      email: 'coord.cs@skit.ac.in',
      password: 'DemoPassword2024!',
      badge: 'Review & Verify',
      icon: Users,
      color: '#2563EB',
      bg: '#EFF6FF'
    },
    {
      role: 'STUDENT',
      portal: 'student-dashboard',
      title: 'Student Portal',
      subtitle: 'Priya Sharma (STU-001 • CS)',
      email: 'priya.sharma@skit.ac.in',
      password: 'DemoPassword2024!',
      badge: 'Submit & Portfolio',
      icon: Award,
      color: '#16A34A',
      bg: '#F0FDF4'
    }
  ];

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!email || !email.trim()) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(email.trim(), password);
      const role = data?.user?.role || data?.membership?.role || 'STUDENT';

      // Auto-route based on authenticated role
      if (role === 'STUDENT') {
        navigateTo('student-dashboard');
      } else if (role === 'FACULTY_COORDINATOR') {
        navigateTo('organiser-dashboard');
      } else {
        navigateTo('dashboard');
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Authentication failed. Please verify your credentials or check connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!regFullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }
    if (!regPassword || regPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (regRole === 'STUDENT' && !regStudentId.trim()) {
      setErrorMessage('Student Roll / ID Number is required for student registration.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        institutionCode: 'SKIT-021',
        departmentCode: regDepartmentCode,
        studentId: regRole === 'STUDENT' ? regStudentId.trim() : undefined,
        phone: regPhone.trim() || undefined
      };

      const data = await register(payload);
      const role = data?.user?.role || regRole;

      if (role === 'STUDENT') {
        navigateTo('student-dashboard');
      } else if (role === 'FACULTY_COORDINATOR') {
        navigateTo('organiser-dashboard');
      } else {
        navigateTo('dashboard');
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Registration failed. An account with this email may already exist or input was invalid.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = (persona) => {
    setEmail(persona.email);
    setPassword(persona.password);
    setErrorMessage('');
    setAuthMode('signin');
  };

  const handleQuickLaunchPersona = async (persona) => {
    setEmail(persona.email);
    setPassword(persona.password);
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(persona.email, persona.password, { isDemo: true });
      navigateTo(persona.portal);
    } catch (err) {
      setErrorMessage(
        err.message || 'Quick login failed. Server might be spinning up, please try in a moment.'
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
        title: "Database Synced",
        message: res.message || "PostgreSQL database migrated and seeded successfully!",
        type: "success"
      });
      await refreshBackendData();
    } catch (err) {
      setErrorMessage(err.message || "Database sync encountered an issue.");
    } finally {
      setIsSyncingDb(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.auth.requestPasswordReset(forgotEmail);
      setForgotSuccess(true);
    } catch {
      // Standard response for security
      setForgotSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-split-container">
      {/* ============================================================== */}
      {/* LEFT SHOWCASE PANEL: Brand Identity & Platform Value Showcase */}
      {/* ============================================================== */}
      <div className="login-showcase-panel">
        <div className="showcase-content">
          {/* Top Brand Tag */}
          <div className="showcase-brand-header">
            <div className="showcase-logo-icon">
              <GraduationCap size={28} />
            </div>
            <div>
              <div className="showcase-brand-title">PEHCHAAN</div>
              <div className="showcase-brand-badge">SKIT021 • Institutional SaaS</div>
            </div>
          </div>

          {/* Hero Statement */}
          <div className="showcase-hero-text">
            <div className="showcase-chip">
              <Sparkles size={14} />
              <span>National Level EdTech Initiative</span>
            </div>
            <h1 className="showcase-headline">
              Your Journey. <br />
              Your Proof. <br />
              <span className="showcase-accent">Our Authenticity.</span>
            </h1>
            <p className="showcase-description">
              A unified, multi-tenant governance platform for verified student achievements,
              institutional accreditations, and official activity portfolios at SKIT Jaipur.
            </p>
          </div>

          {/* Three Feature Highlight Cards */}
          <div className="showcase-cards-list">
            <div className="showcase-card">
              <div className="showcase-card-icon" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#F97316' }}>
                <ShieldCheck size={20} />
              </div>
              <div className="showcase-card-text">
                <div className="showcase-card-title">Multi-Tier Verification Ledger</div>
                <div className="showcase-card-desc">
                  Strict non-self-approval workflow with faculty review and audit-logged decisions.
                </div>
              </div>
            </div>

            <div className="showcase-card">
              <div className="showcase-card-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
                <Award size={20} />
              </div>
              <div className="showcase-card-text">
                <div className="showcase-card-title">Tamper-Proof Student Portfolios</div>
                <div className="showcase-card-desc">
                  Centralized student participation records, verifiable certificates, and transcripts.
                </div>
              </div>
            </div>

            <div className="showcase-card">
              <div className="showcase-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                <BookOpen size={20} />
              </div>
              <div className="showcase-card-text">
                <div className="showcase-card-title">Accreditation & NAAC Compliance</div>
                <div className="showcase-card-desc">
                  Instant institutional reporting, department metrics, and protected CSV exports.
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Social Proof & Affiliation */}
          <div className="showcase-footer">
            <div className="showcase-stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Isolated Data</span>
            </div>
            <div className="showcase-stat-divider" />
            <div className="showcase-stat">
              <span className="stat-number">3 Roles</span>
              <span className="stat-label">Admin • Organiser • Student</span>
            </div>
            <div className="showcase-stat-divider" />
            <div className="showcase-stat">
              <span className="stat-number">PostgreSQL</span>
              <span className="stat-label">Real Database</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT SIGN-IN PANEL: Sleek Unified Form & Authentication UI    */}
      {/* ============================================================== */}
      <div className="login-form-panel">
        <div className="form-panel-wrapper">
          {/* Top Utilities: Back link & Live Status */}
          <div className="form-top-bar">
            <button
              type="button"
              className="back-home-btn"
              onClick={() => navigateTo('landing')}
              title="Return to public landing page"
            >
              <Home size={15} />
              <span>Back to Home</span>
            </button>

            {/* Live Database Status */}
            <div
              className={`db-pill ${isBackendConnected ? 'online' : 'standalone'}`}
              title={isBackendConnected ? 'Connected to live PostgreSQL database' : 'Running in local fallback mode'}
            >
              <span className="db-dot" />
              <span>{isBackendConnected ? 'PostgreSQL Live' : 'Backend Standalone'}</span>
            </div>
          </div>

          {/* Card Header */}
          <div className="form-header">
            <div className="form-institution-tag">
              <Building2 size={14} style={{ color: 'var(--primary-orange)' }} />
              <span>Swami Keshvanand Institute of Technology (SKIT021)</span>
            </div>
            <h2 className="form-title">
              {authMode === 'forgot'
                ? 'Reset Password'
                : authMode === 'register'
                ? 'Create Authentic Account'
                : 'Sign in to Pehchaan'}
            </h2>
            <p className="form-subtitle">
              {authMode === 'forgot'
                ? 'Enter your institutional email address to receive password reset instructions.'
                : authMode === 'register'
                ? 'Register directly into the official SKIT021 institutional verification database.'
                : 'Access your dedicated College Admin, Event Organiser, or Student portal.'}
            </p>
          </div>

          {/* Mode Selector (Sign In vs Register vs 1-Click Demo) */}
          {authMode !== 'forgot' && (
            <div className="auth-mode-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
              <button
                type="button"
                className={`mode-btn ${authMode === 'signin' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`mode-btn ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
              >
                Sign Up
              </button>
              <button
                type="button"
                className={`mode-btn ${authMode === 'demo' ? 'active' : ''}`}
                onClick={() => { setAuthMode('demo'); setErrorMessage(''); }}
              >
                Demo Roles
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="login-error-alert">
              <AlertCircle size={16} className="error-icon" />
              <div className="error-text">
                <div>{errorMessage}</div>
                <button
                  type="button"
                  className="error-repair-btn"
                  onClick={handleSyncDatabase}
                  disabled={isSyncingDb}
                >
                  <RefreshCw size={12} className={isSyncingDb ? 'spin-animation' : ''} />
                  <span>{isSyncingDb ? 'Syncing database...' : 'Initialize & Repair Database'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: Standard Enterprise Sign In Form                        */}
          {/* ============================================================== */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="auth-form">
              {/* Email / Institutional Identifier */}
              <div className="form-group">
                <label className="form-label" htmlFor="user-email">
                  Institutional Email or ID
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="user-email"
                    type="email"
                    required
                    placeholder="e.g. studentaffairs@skit.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    className="form-input"
                  />
                </div>
                <div className="quick-domain-hints">
                  <span className="hint-label">SKIT Domain:</span>
                  <button
                    type="button"
                    className="domain-chip"
                    onClick={() => {
                      if (!email.includes('@')) setEmail(email + '@skit.ac.in');
                    }}
                  >
                    + @skit.ac.in
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="label-with-link">
                  <label className="form-label" htmlFor="user-password">
                    Password
                  </label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => { setAuthMode('forgot'); setErrorMessage(''); }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="user-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="form-row-remember">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this workstation</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn-submit-login"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="btn-loading-content">
                    <RefreshCw size={17} className="spin-animation" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <span className="btn-normal-content">
                    <span>Sign In to Portal</span>
                    <ArrowRight size={17} />
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="form-divider">
                <span>or continue with institutional identity</span>
              </div>

              {/* SSO Buttons */}
              <div className="sso-buttons-grid">
                <button
                  type="button"
                  className="sso-btn"
                  onClick={() => {
                    addToast({
                      title: "Institutional Single Sign-On",
                      message: "Google Workspace SSO requires campus domain OAuth. Please sign in with your email & password or select a role from Demo Roles.",
                      type: "info"
                    });
                  }}
                  title="SKIT Google Workspace SSO"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>SKIT Google Workspace</span>
                </button>
              </div>

              {/* Fast persona loader pill footer */}
              <div className="persona-quick-strip">
                <span className="strip-label">Fast Demo Switch:</span>
                <div className="strip-chips">
                  {DEMO_PERSONAS.map((p) => (
                    <button
                      key={p.role}
                      type="button"
                      className="strip-chip"
                      onClick={() => handleSelectPersona(p)}
                      title={`Load credentials for ${p.title}`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* TAB 2: Real User Self-Registration Form                        */}
          {/* ============================================================== */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="auth-form">
              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label">Registering As</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[
                    { id: 'STUDENT', label: '🎓 Student' },
                    { id: 'FACULTY_COORDINATOR', label: '👨‍🏫 Faculty' },
                    { id: 'INSTITUTION_ADMIN', label: '🏛️ Admin' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      style={{
                        padding: '0.55rem 0.4rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-md)',
                        border: regRole === r.id ? '2px solid var(--primary-orange)' : '1px solid var(--border-light)',
                        background: regRole === r.id ? 'var(--orange-50)' : 'var(--surface-white)',
                        color: regRole === r.id ? 'var(--primary-orange)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 150ms'
                      }}
                      onClick={() => setRegRole(r.id)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-fullname">
                  Full Name <span style={{ color: 'var(--primary-orange)' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <UserPlus size={18} className="input-icon" />
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Official Email Address <span style={{ color: 'var(--primary-orange)' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="e.g. rahul.sharma@skit.ac.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password (min 8 characters) <span style={{ color: 'var(--primary-orange)' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Choose a secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Student Roll / ID (Only for students) */}
              {regRole === 'STUDENT' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-student-id">
                    Student Roll Number / Enrollment ID <span style={{ color: 'var(--primary-orange)' }}>*</span>
                  </label>
                  <div className="input-with-icon">
                    <Award size={18} className="input-icon" />
                    <input
                      id="reg-student-id"
                      type="text"
                      required
                      placeholder="e.g. SKIT-2024-CS088"
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              {/* Department */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-department">
                  Academic Department
                </label>
                <select
                  id="reg-department"
                  value={regDepartmentCode}
                  onChange={(e) => setRegDepartmentCode(e.target.value)}
                  className="form-input"
                  style={{ height: 42, cursor: 'pointer' }}
                >
                  <option value="CS">Computer Science & Engineering (CS)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="ME">Mechanical Engineering (ME)</option>
                  <option value="CIVIL">Civil Engineering (CE)</option>
                  <option value="EE">Electrical Engineering (EE)</option>
                </select>
              </div>

              {/* Phone (Optional) */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">
                  Phone Number (Optional)
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn-submit-login"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="btn-loading-content">
                    <RefreshCw size={17} className="spin-animation" />
                    <span>Creating Account in PostgreSQL...</span>
                  </span>
                ) : (
                  <span className="btn-normal-content">
                    <span>Complete Registration</span>
                    <ArrowRight size={17} />
                  </span>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  style={{ color: 'var(--primary-orange)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
                >
                  Sign in here →
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* TAB 3: 1-Click Demo Personas (For Evaluators & Reviewers)       */}
          {/* ============================================================== */}
          {authMode === 'demo' && (
            <div className="demo-personas-container">
              <p className="demo-intro">
                Select a verified institutional role below to instantly load credentials and enter the portal:
              </p>

              <div className="persona-cards-list">
                {DEMO_PERSONAS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div
                      key={p.role}
                      className="persona-card"
                      onClick={() => handleQuickLaunchPersona(p)}
                    >
                      <div className="persona-icon-box" style={{ background: p.bg, color: p.color }}>
                        <Icon size={24} />
                      </div>
                      <div className="persona-info">
                        <div className="persona-title-row">
                          <span className="persona-title">{p.title}</span>
                          <span className="persona-badge" style={{ color: p.color, background: p.bg }}>
                            {p.badge}
                          </span>
                        </div>
                        <div className="persona-subtitle">{p.subtitle}</div>
                        <div className="persona-email">{p.email}</div>
                      </div>
                      <div className="persona-arrow">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="demo-note">
                <span>💡 Note: Role permissions are validated directly on the PostgreSQL backend.</span>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: Forgot Password Recovery Flow                           */}
          {/* ============================================================== */}
          {authMode === 'forgot' && (
            <div className="forgot-password-container">
              {forgotSuccess ? (
                <div className="forgot-success-box">
                  <CheckCircle2 size={36} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px' }}>Recovery Link Sent</h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    If an institutional account exists for <strong>{forgotEmail || email}</strong>, you will receive a secure password reset token shortly.
                  </p>
                  <button
                    type="button"
                    className="btn-submit-login"
                    style={{ marginTop: 20 }}
                    onClick={() => { setAuthMode('signin'); setForgotSuccess(false); }}
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="forgot-email">
                      Institutional Email Address
                    </label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        placeholder="e.g. yourname@skit.ac.in"
                        value={forgotEmail || email}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-submit-login"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending Token...' : 'Send Password Reset Link'}
                  </button>

                  <button
                    type="button"
                    className="btn-ghost-cancel"
                    onClick={() => setAuthMode('signin')}
                  >
                    ← Back to Sign In
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Institutional Compliance Footer */}
          <div className="form-footer-compliance">
            <span>Official Portal for Swami Keshvanand Institute of Technology, Jaipur</span>
            <div className="footer-links">
              <span>Security Policy</span>
              <span>•</span>
              <span>Privacy</span>
              <span>•</span>
              <span>Admin Desk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
