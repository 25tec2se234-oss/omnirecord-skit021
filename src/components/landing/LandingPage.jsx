import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  Users,
  BarChart3,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Search,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';

export const LandingPage = () => {
  const { navigateTo, restartProductTour, records, students, activities } = useApp();

  const pendingCount = records.filter(r => r.verificationStatus === 'Pending Review').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border-light)',
          height: 70
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            height: '100%',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Brand mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-orange)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)'
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                PEHCHAAN
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--primary-orange)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                SKIT021
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="no-mobile">
            <a href="#problem-solution" style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Problem & Solution
            </a>
            <a href="#features" style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Features
            </a>
            <a href="#how-it-works" style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              How It Works
            </a>
            <a href="#institutional-benefits" style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              For Institutions
            </a>
          </nav>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={restartProductTour}
            >
              <HelpCircle size={15} style={{ marginRight: 4 }} />
              Guided Tour
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('dashboard')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Enter Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '4rem 1.5rem 3rem', background: 'radial-gradient(circle at 50% 0%, #FFF1E7 0%, #F5F6F8 70%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.35rem 0.85rem', background: 'var(--surface-white)', borderRadius: 'var(--radius-full)', border: '1px solid var(--orange-100)', boxShadow: 'var(--shadow-xs)', marginBottom: '1.5rem' }}>
            <Sparkles size={15} style={{ color: 'var(--primary-orange)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-orange-hover)' }}>
              National Level EdTech Prototype • SKIT021 • By Team - Eco-Novators
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem'
            }}
          >
            Your Journey. Your Proof. <br />
            <span style={{ color: 'var(--primary-orange)' }}>Our Authenticity.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              maxWidth: 780,
              margin: '0 auto 2rem',
              lineHeight: 1.6
            }}
          >
            Bring student participation, achievements, certificates, and institutional activities together in one centralized platform. Simplify verification, improve visibility, and make student engagement easier to manage.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigateTo('dashboard')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Explore the Platform
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={restartProductTour}
              icon={HelpCircle}
            >
              See How It Works (Tour)
            </Button>
          </div>

          {/* Interactive Live Dashboard Mockup Preview */}
          <div
            style={{
              background: 'var(--surface-white)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0,0,0,0.02)',
              overflow: 'hidden',
              textAlign: 'left'
            }}
          >
            {/* Mockup Header bar */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-light)',
                padding: '0.75rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                <span style={{ marginLeft: 12, fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                  https://pehchaan.skit.ac.in/dashboard
                </span>
              </div>
              <span className="badge badge-orange" style={{ fontSize: '0.7rem' }}>
                Illustrative Live Preview
              </span>
            </div>

            {/* Mockup Content Body */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '1rem', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL STUDENTS</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                    {students.length} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>enrolled</span>
                  </div>
                </div>
                <div style={{ padding: '1rem', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RECORDED ACHIEVEMENTS</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                    {records.length} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>activities</span>
                  </div>
                </div>
                <div style={{ padding: '1rem', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PENDING VERIFICATIONS</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning)', marginTop: 4 }}>
                    {pendingCount} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>in queue</span>
                  </div>
                </div>
                <div style={{ padding: '1rem', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACTIVE ACTIVITIES</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-orange)', marginTop: 4 }}>
                    {activities.length} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>events</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Snippet */}
              <div style={{ background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <strong style={{ fontSize: '0.88rem' }}>Recent Activity Stream</strong>
                  <button
                    type="button"
                    style={{ fontSize: '0.78rem', color: 'var(--primary-orange)', fontWeight: 600 }}
                    onClick={() => navigateTo('records')}
                  >
                    Open Records →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {records.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 6,
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 600 }}>{r.studentName}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>• {r.activityName}</span>
                      </div>
                      <span className={`badge ${r.verificationStatus === 'Verified' ? 'badge-success' : r.verificationStatus === 'Pending Review' ? 'badge-warning' : 'badge-orange'}`}>
                        {r.verificationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Comparison */}
      <section id="problem-solution" style={{ padding: '5rem 1.5rem', background: 'var(--surface-white)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-orange" style={{ marginBottom: 12 }}>Modernizing Institutional Operations</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              From Fragmented Spreadsheets to Verified Excellence
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 640, margin: '0.5rem auto 0' }}>
              Compare the friction of traditional paper and ad-hoc spreadsheets against Pehchaan's centralized digital architecture.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* BEFORE Card */}
            <div style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#991B1B', fontWeight: 700, fontSize: '1.1rem' }}>BEFORE: Disconnected & Manual</h4>
                  <p style={{ color: '#B91C1C', fontSize: '0.8rem' }}>Traditional Institutional Hurdles</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.88rem', color: '#7F1D1D' }}>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>✕</span>
                  <span><strong>Scattered Spreadsheets:</strong> Participation files lost across isolated departmental folders with zero standard schema.</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.88rem', color: '#7F1D1D' }}>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>✕</span>
                  <span><strong>Unverified Certificates:</strong> High risk of fabricated PDF claims, altered names, and unverified participation credentials.</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.88rem', color: '#7F1D1D' }}>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>✕</span>
                  <span><strong>Repeated Manual Work:</strong> Faculty spend substantial administrative time compiling disparate proofs for periodic institutional reviews.</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.88rem', color: '#7F1D1D' }}>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>✕</span>
                  <span><strong>Blindspots:</strong> No real-time visibility into student engagement or cross-departmental extra-curricular activity.</span>
                </div>
              </div>
            </div>

            {/* AFTER Card */}
            <div style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', background: 'var(--orange-50)', border: '1px solid var(--orange-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--soft-orange)', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#9A3412', fontWeight: 700, fontSize: '1.1rem' }}>AFTER: Pehchaan Centralization</h4>
                  <p style={{ color: '#C2410C', fontSize: '0.8rem' }}>Unified Institutional Architecture</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.88rem', color: '#7C2D12' }}>
                  <span style={{ color: 'var(--primary-orange)', fontWeight: 700 }}>✓</span>
                  <span><strong>Unified Digital Ledger:</strong> Single canonical participation history mapped by permanent student roll numbers and academic programs.</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.88rem', color: '#7C2D12' }}>
                  <span style={{ color: 'var(--primary-orange)', fontWeight: 700 }}>✓</span>
                  <span><strong>Structured Verification:</strong> Dedicated approval queues for authorized coordinators to validate, query, or approve evidence.</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.88rem', color: '#7C2D12' }}>
                  <span style={{ color: 'var(--primary-orange)', fontWeight: 700 }}>✓</span>
                  <span><strong>Instant Reports & CSV:</strong> Immediate export of accreditation tables with filtered categories and date ranges.</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.88rem', color: '#7C2D12' }}>
                  <span style={{ color: 'var(--primary-orange)', fontWeight: 700 }}>✓</span>
                  <span><strong>Digital Achievement Profiles:</strong> Tamper-evident student achievement transcripts ready for recruitment and higher education.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (8 Required Core Capabilities) */}
      <section id="features" style={{ padding: '5rem 1.5rem', background: 'var(--bg-app)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-orange" style={{ marginBottom: 12 }}>Feature Suite</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Enterprise-Grade Product Capabilities</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 640, margin: '0.5rem auto 0' }}>
              Built specifically around the operational needs of colleges, universities, faculty convenors, and student affairs officers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                icon: Users,
                title: "1. Centralized Student Records",
                desc: "Permanent student directory tying extracurricular accomplishments to academic departments, programs, and graduation cohorts."
              },
              {
                icon: ShieldCheck,
                title: "2. Certificate & Evidence Verification",
                desc: "Faculty verification workflows with status transitions (Verified, Needs Correction, Rejected) and audit notes."
              },
              {
                icon: Layers,
                title: "3. Activity & Event Management",
                desc: "Comprehensive registry for technical hackathons, cultural festivals, sports championships, workshops, and NSS volunteering."
              },
              {
                icon: Building2,
                title: "4. Department-Level Governance",
                desc: "Organized workspaces for departmental coordinators (CSE, IT, ECE, Mech, Civil, Biotech, MBA) to manage their students."
              },
              {
                icon: BarChart3,
                title: "5. Student Engagement Analytics",
                desc: "Multi-dimensional visual analytics displaying participation rates, monthly trends, and category distribution."
              },
              {
                icon: FileText,
                title: "6. Institutional Accreditation Reporting",
                desc: "Structured exports designed to assist institutional reporting standards, student progression metrics, and review audits."
              },
              {
                icon: Award,
                title: "7. Digital Achievement Profiles",
                desc: "Public-ready, print-friendly student transcripts highlighting verified awards, leadership roles, and verifiable certificate refs."
              },
              {
                icon: Search,
                title: "8. Duplicate Record Detection Assistance",
                desc: "Frontend checks identifying duplicate submissions for the same activity and student to preserve data integrity."
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--soft-orange)',
                      color: 'var(--primary-orange)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>{feature.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works (4-Step Process) */}
      <section id="how-it-works" style={{ padding: '5rem 1.5rem', background: 'var(--surface-white)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-orange" style={{ marginBottom: 12 }}>Workflow</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>How the Platform Operates</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 580, margin: '0.5rem auto 0' }}>
              A four-step verifiable pipeline converting raw participation proofs into verified institutional merit.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                step: "01",
                title: "Register or Import Records",
                desc: "Enroll students and catalog institutional activities across engineering, management, and arts faculties."
              },
              {
                step: "02",
                title: "Record Student Participation",
                desc: "Log achievements with attached digital certificates, competition levels (Winner, Runner-up), and dates."
              },
              {
                step: "03",
                title: "Review & Verify Evidence",
                desc: "Department coordinators audit submission files, leave constructive feedback, and approve verified badges."
              },
              {
                step: "04",
                title: "Maintain Records & Reports",
                desc: "Generate digital achievement transcripts, export compliance CSVs, and inspect campus engagement metrics."
              }
            ].map((step, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: 'var(--primary-orange)',
                    opacity: 0.85,
                    marginBottom: '0.75rem',
                    fontFamily: 'monospace'
                  }}
                >
                  {step.step}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{step.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Benefits Section */}
      <section id="institutional-benefits" style={{ padding: '4.5rem 1.5rem', background: 'var(--orange-50)', borderTop: '1px solid var(--orange-100)', borderBottom: '1px solid var(--orange-100)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-orange" style={{ marginBottom: 12 }}>Institutional Impact</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Why Educational Institutions Need Centralization
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 640, margin: '0.5rem auto 2.5rem' }}>
            Transforming administrative overhead into streamlined compliance and student career acceleration.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
            <div style={{ background: 'var(--surface-white)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border-light)' }}>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Streamlined Audit Preparation</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                Organize accreditation documentation and student progression records with standardized CSV and PDF data exports rather than manual departmental sweeps.
              </p>
            </div>
            <div style={{ background: 'var(--surface-white)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border-light)' }}>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Coordinator-Verified Student Credentials</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                Institutional review queues ensure that transcripts and merit certificates reflect faculty-reviewed records.
              </p>
            </div>
            <div style={{ background: 'var(--surface-white)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border-light)' }}>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Recognize Top Talent Promptly</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                Identify high-engagement student leaders, national hackathon winners, and athletic record holders for institutional honors and scholarships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Demo Disclaimer Banner */}
      <section style={{ padding: '2.5rem 1.5rem', background: 'var(--surface-white)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: 8 }}>
            <ShieldCheck size={16} />
            <span>Hackathon Implementation Scope & Transparency Note</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This system represents the <strong>Frontend Demonstration Phase (SKIT021)</strong>. All student names, departments, certificates, and metrics are illustrative sample data stored locally in your browser. Live cryptographic verification, database persistence, and institutional single-sign-on (SSO) will be established in the subsequent backend integration phase.
          </p>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center', background: 'linear-gradient(180deg, var(--bg-app) 0%, var(--surface-white) 100%)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to experience the future of student achievement verification?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem' }}>
            Launch the interactive administrator workspace or take a quick 45-second guided tour.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigateTo('dashboard')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Open Administrator Workspace
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={restartProductTour}
              icon={HelpCircle}
            >
              Launch Interactive Tour
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', background: 'var(--surface-white)', borderTop: '1px solid var(--border-light)', padding: '2.5rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary-orange)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={16} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>PEHCHAAN</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>• SKIT021 • By Team Eco-Novators</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            Designed for Educational Institutions & Student Affairs
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <button type="button" onClick={() => navigateTo('dashboard')} style={{ color: 'inherit' }}>Dashboard</button>
            <button type="button" onClick={() => navigateTo('verification')} style={{ color: 'inherit' }}>Verification Queue</button>
            <button type="button" onClick={() => navigateTo('analytics')} style={{ color: 'inherit' }}>Analytics</button>
            <button type="button" onClick={restartProductTour} style={{ color: 'inherit' }}>Product Tour</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
