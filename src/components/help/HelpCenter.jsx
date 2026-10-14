import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Button } from '../common/Button';
import {
  HelpCircle,
  PlayCircle,
  FileText,
  Users,
  FileCheck2,
  ShieldCheck,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';

export const HelpCenter = () => {
  const { restartProductTour, navigateTo } = useApp();

  const [expandedFaq, setExpandedFaq] = useState(0);

  const guides = [
    {
      title: "1. How to Register or Edit a Student",
      icon: Users,
      desc: "Navigate to the Students Directory and click 'Register Student'. Fill in the student's name, permanent roll number/student ID, department, academic cohort, and program. Changes to student profiles automatically cascade to all associated participation and verification records.",
      actionLabel: "Go to Students Directory",
      route: "students"
    },
    {
      title: "2. How to Record Student Participation",
      icon: FileCheck2,
      desc: "Open 'Participation Records' or use the quick 'Record Participation' button in the top navigation bar. Choose the student from the registry and select the hosted event. The category automatically populates. Select achievement level (Winner, Runner-up, Finalist, Participant) and upload the certificate evidence.",
      actionLabel: "Record Participation",
      route: "records"
    },
    {
      title: "3. How Verification Works",
      icon: ShieldCheck,
      desc: "When student evidence is submitted, it routes into the Verification Center queue. Authorized faculty coordinators can review the attached document preview and either approve as 'Verified', request clarification with 'Needs Correction', or 'Reject' with an official reason note.",
      actionLabel: "Open Verification Center",
      route: "verification"
    },
    {
      title: "4. How to Generate Accreditation Reports (NAAC / NBA)",
      icon: BarChart3,
      desc: "Visit 'Analytics & Reports'. Apply the dynamic filters (Department, Category, Academic Year, Date Range). The metrics and visual charts update dynamically. Click 'Export Filtered CSV' to download tabular spreadsheet data or click 'Report Preview' to print an official executive document.",
      actionLabel: "Open Analytics & Reports",
      route: "analytics"
    }
  ];

  const faqs = [
    {
      q: "Is this frontend demo data shared across multiple browsers or institutions?",
      a: "No. All demo data is strictly isolated to your current browser using localStorage. No real institutional servers or external third parties receive any entered information."
    },
    {
      q: "Can I reset the sample data if I make too many test edits?",
      a: "Yes! Navigate to Settings and click 'Reset to Initial Sample Data' or use the user profile dropdown in the top right to restore the clean initial dataset anytime."
    },
    {
      q: "How does this platform prevent duplicate participation records?",
      a: "During participation logging, the system verifies student IDs against existing records for the same activity and prevents redundant submissions."
    },
    {
      q: "What technologies are used in this implementation?",
      a: "The platform is built with React 19, modern Vanilla CSS with an enterprise design token architecture, Lucide icons, and responsive layouts supporting desktop down to mobile phones."
    }
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Help & Tour' }]} onNavigate={navigateTo} />

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <HelpCircle size={24} style={{ color: 'var(--primary-orange)' }} />
            Help Center & Guided Tour
          </h1>
          <p>
            Operational workflows, step-by-step guides, and quick walkthroughs for campus administrators and coordinators.
          </p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            icon={PlayCircle}
            onClick={restartProductTour}
          >
            Restart Product Tour (6 Steps)
          </Button>
        </div>
      </div>

      {/* Guided Walkthrough Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #FFF1E7 0%, #FFFFFF 100%)',
          borderColor: 'var(--orange-100)',
          padding: '1.75rem',
          marginBottom: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <span className="badge badge-orange" style={{ marginBottom: 8 }}>
              Interactive Walkthrough
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              New to OmniRecord? Experience the Guided Product Tour
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4, maxWidth: 640 }}>
              Takes approximately 45 seconds to understand the student registry, activity catalog, faculty verification queue, and institutional accreditation reporting.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={PlayCircle}
            onClick={restartProductTour}
          >
            Launch Guided Tour
          </Button>
        </div>
      </div>

      {/* 4 Core Workflow Guides */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Step-by-Step Operational Workflows
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {guides.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--soft-orange)', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  <Icon size={20} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                  {g.title}
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '1rem' }}>
                  {g.desc}
                </p>
                <button
                  type="button"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--primary-orange)', fontWeight: 600, borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}
                  onClick={() => navigateTo(g.route)}
                >
                  <span>{g.actionLabel}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
          Frequently Asked Questions & Architecture Notes
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 8,
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isOpen ? 'var(--bg-secondary)' : 'var(--surface-white)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isOpen && (
                  <div style={{ padding: '0.85rem 1.1rem', background: 'var(--surface-white)', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, borderTop: '1px solid var(--border-light)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
