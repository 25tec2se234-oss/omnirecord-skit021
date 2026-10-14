import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import {
  GraduationCap,
  Layers,
  FileCheck2,
  ShieldCheck,
  BarChart3,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const ProductOnboardingModal = () => {
  const { isOnboardingOpen, completeOnboarding, navigateTo } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOnboardingOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      setCurrentStep(0);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOnboardingOpen]);

  useEffect(() => {
    if (!isOnboardingOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        completeOnboarding();
        navigateTo('dashboard');
      } else if (e.key === 'ArrowRight') {
        setCurrentStep((prev) => (prev < 5 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingOpen, completeOnboarding, navigateTo]);

  if (!isOnboardingOpen) return null;

  const steps = [
    {
      id: "welcome",
      badge: "SKIT021 Institutional Platform",
      title: "Welcome to Your Centralized Participation Platform",
      description: "One organized, verified digital ecosystem to manage student activities, achievements, certificates, and institutional accreditation records in a single place.",
      icon: GraduationCap,
      accentColor: "#F97316",
      details: [
        "Unifies disconnected departmental spreadsheets and loose paper certificates",
        "Empowers coordinators with structured verification workflows",
        "Instantly generates student achievement transcripts and accreditation reports"
      ],
      illustration: (
        <div style={{ background: 'linear-gradient(135deg, #FFF1E7 0%, #FED7AA 100%)', borderRadius: 16, padding: '2rem 1.5rem', textAlign: 'center', border: '1px solid #FDBA74' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F97316', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(249,115,22,0.3)', marginBottom: '1rem' }}>
            <GraduationCap size={32} />
          </div>
          <h4 style={{ color: '#9A3412', fontWeight: 700, fontSize: '1.1rem' }}>Centralized Digital Repository</h4>
          <p style={{ color: '#C2410C', fontSize: '0.85rem', marginTop: 4 }}>Bridging students, departmental coordinators, and institutional leadership</p>
        </div>
      )
    },
    {
      id: "understand",
      badge: "Unified Architecture",
      title: "Everything Connected in One Place",
      description: "Pehchaan eliminates siloed data by creating relational links between students, departments, activities, and verified credentials.",
      icon: Layers,
      accentColor: "#2563EB",
      details: [
        "Students Directory: Individual portfolios and cross-departmental involvement",
        "Institutional Activities: Hackathons, conferences, fests, sports, and community outreach",
        "Referential Integrity: Updating a student or event automatically syncs all records"
      ],
      illustration: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', padding: '1rem', background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <div style={{ background: '#fff', padding: '0.85rem', borderRadius: 10, textAlign: 'center', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#F97316', fontWeight: 700, fontSize: '0.82rem' }}>1. Students</div>
            <div style={{ fontSize: '0.75rem', color: '#71717A', marginTop: 4 }}>12+ Verified Profiles</div>
          </div>
          <div style={{ background: '#fff', padding: '0.85rem', borderRadius: 10, textAlign: 'center', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#2563EB', fontWeight: 700, fontSize: '0.82rem' }}>2. Activities</div>
            <div style={{ fontSize: '0.75rem', color: '#71717A', marginTop: 4 }}>10+ Campus Events</div>
          </div>
          <div style={{ background: '#fff', padding: '0.85rem', borderRadius: 10, textAlign: 'center', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#16A34A', fontWeight: 700, fontSize: '0.82rem' }}>3. Records</div>
            <div style={{ fontSize: '0.75rem', color: '#71717A', marginTop: 4 }}>15+ Tracked Evidence</div>
          </div>
        </div>
      )
    },
    {
      id: "records",
      badge: "Participation Tracking",
      title: "Keep Every Achievement Organized",
      description: "Effortlessly record extracurricular, co-curricular, and academic participation with structured evidence metadata.",
      icon: FileCheck2,
      accentColor: "#D97706",
      details: [
        "Attach simulated certificates, paper presentations, and merit proofs",
        "Categorized by Technical, Cultural, Sports, Research, Volunteering & Workshops",
        "Frontend demo note: Secure file upload endpoints will connect to the production cloud storage in backend phase"
      ],
      illustration: (
        <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '1.25rem', border: '1px solid #FDE68A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706' }} />
            <strong style={{ fontSize: '0.85rem', color: '#92400E' }}>Sample Record: Smart India Hackathon Winner</strong>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#B45309', lineHeight: 1.4 }}>
            Student: Aarav Patel (SKIT-2022-CS014) • Department: CSE • Certificate: CERT-SIH24-089 (Attached PDF)
          </div>
        </div>
      )
    },
    {
      id: "verification",
      badge: "Review Workflow",
      title: "Build Trust Through Structured Verification",
      description: "Prevent unverified or duplicated claims with an institutional review queue designed for department heads and faculty coordinators.",
      icon: ShieldCheck,
      accentColor: "#16A34A",
      details: [
        "Queue inspects student identity, achievement level, and attached evidence preview",
        "Actionable states: Mark as Verified, Reject with mandatory reason, or Request Correction",
        "Simulation disclaimer: Real cryptographic document signing and institutional identity will occur in backend phase"
      ],
      illustration: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '1rem', background: '#F0FDF4', borderRadius: 14, border: '1px solid #BBF7D0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 600, color: '#166534' }}>Verification Pipeline:</span>
            <span style={{ color: '#15803D' }}>4-Step Review</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#16A34A' }} />
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#16A34A' }} />
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#86EFAC' }} />
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#DCFCE7' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#166534' }}>
            Evidence Submitted → Faculty Review → Merit Verification → Verified Profile Transcript
          </div>
        </div>
      )
    },
    {
      id: "insights",
      badge: "Analytics & Accreditation",
      title: "Turn Participation into Meaningful Insights",
      description: "Generate structured visual metrics and compliance-ready reports for institutional evaluations and academic audits.",
      icon: BarChart3,
      accentColor: "#9333EA",
      details: [
        "Filter student participation by academic year, department, and category",
        "One-click CSV data export with active filter state preserved",
        "Print-ready institutional executive summary preview and student transcript"
      ],
      illustration: (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', background: '#FAF5FF', borderRadius: 14, border: '1px solid #E9D5FF' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', color: '#6B21A8', fontWeight: 600 }}>Participation Rate</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#581C87' }}>88.4%</div>
          </div>
          <div style={{ width: 1, height: 40, background: '#D8B4FE' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', color: '#6B21A8', fontWeight: 600 }}>Active Departments</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#581C87' }}>7 / 7</div>
          </div>
        </div>
      )
    },
    {
      id: "ready",
      badge: "Ready to Explore",
      title: "Your Institutional Workspace Is Ready",
      description: "All modules are primed with realistic demo data. You can inspect students, verify pending submissions, record new achievements, or export accreditation reports.",
      icon: Sparkles,
      accentColor: "#F97316",
      details: [
        "Feel free to test creating, editing, and verifying records",
        "You can restart this tour anytime from the Help Center or header",
        "Use 'Reset Demo Data' in Settings to restore initial sample data anytime"
      ],
      illustration: (
        <div style={{ textAlign: 'center', padding: '1.5rem', background: '#FFF1E7', borderRadius: 16, border: '1px solid #FFEDD5' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: '#F97316', color: '#fff', marginBottom: '0.75rem' }}>
            <CheckCircle2 size={32} />
          </div>
          <h4 style={{ color: '#18181B', fontSize: '1.1rem', fontWeight: 700 }}>Interactive Environment Active</h4>
          <p style={{ color: '#71717A', fontSize: '0.85rem', marginTop: 4 }}>Click below to dive into the administrator dashboard</p>
        </div>
      )
    }
  ];

  const current = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
      navigateTo('dashboard');
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigateTo('dashboard');
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" style={{ zIndex: 120 }}>
      <div
        className="modal-dialog lg"
        style={{
          maxWidth: 680,
          background: 'var(--surface-white)',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="onboarding-step-heading"
      >
        {/* Header with step pill & close */}
        <div className="modal-header" style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-orange">
              {current.badge}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={handleSkip}
            aria-label="Skip tour"
            title="Skip tour and go to dashboard"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar line */}
        <div style={{ height: 3, background: 'var(--border-light)', width: '100%' }}>
          <div
            style={{
              height: '100%',
              background: 'var(--primary-orange)',
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              transition: 'width 250ms ease-out'
            }}
          />
        </div>

        {/* Content Body */}
        <div className="modal-body" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            {current.illustration}
          </div>

          <h3 id="onboarding-step-heading" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {current.title}
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
            {current.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 10, border: '1px solid var(--border-light)' }}>
            {current.details.map((detail, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--primary-orange)', flexShrink: 0, marginTop: 2 }} />
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer controls */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {!isLast ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleSkip}
              >
                Skip Introduction
              </button>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                You can revisit this anytime in Help
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!isFirst && (
              <Button
                variant="secondary"
                size="md"
                onClick={handlePrev}
                icon={ChevronLeft}
              >
                Back
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              icon={isLast ? ArrowRight : ChevronRight}
              iconPosition="right"
            >
              {isFirst ? "Let's Get Started" : isLast ? "Open Dashboard" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
