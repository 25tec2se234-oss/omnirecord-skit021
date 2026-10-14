import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CleanMinimalTemplate } from './templates/CleanMinimalTemplate';
import { TechDevTemplate } from './templates/TechDevTemplate';
import { AcademicProfessionalTemplate } from './templates/AcademicProfessionalTemplate';
import { PortfolioTranscriptView } from './PortfolioTranscriptView';
import { Button } from '../common/Button';
import {
  Share2,
  Printer,
  AlertTriangle,
  Lock,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export const PublicPortfolioPage = ({ studentId, onNavigateHome }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPublicPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        const idToFetch = studentId || (typeof window !== 'undefined' ? window.location.pathname.split('/portfolio/')[1] : 'SKIT-2022-CS014');
        if (!idToFetch) {
          throw new Error('No student identifier specified in portfolio URL.');
        }

        const res = await api.portfolio.getPublic(idToFetch);
        if (isMounted) {
          if (res?.data) {
            setPortfolioData(res.data);
            document.title = `${res.data.student.name} — Verified Student Portfolio | Pehchaan`;
          } else {
            throw new Error('Portfolio record is not available.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load public portfolio.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPublicPortfolio();

    return () => {
      isMounted = false;
      document.title = 'Pehchaan (SKIT021) — Student Participation & Verification SaaS';
    };
  }, [studentId]);

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.left = '-999999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. Loading State
  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div className="spin" style={{ width: 44, height: 44, border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-orange)', borderRadius: '50%' }} />
        <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Retrieving authentic student records from institutional registry...
        </div>
      </div>
    );
  }

  // 2. Error / Private State
  if (error || !portfolioData) {
    const errorLower = (error || '').toLowerCase();
    const isPrivate = errorLower.includes('private');
    const isNotFound = errorLower.includes('not found') || errorLower.includes('does not exist') || errorLower.includes('unpublished');

    let displayMessage = 'The requested student portfolio could not be found, does not exist, or has not been published yet.';
    if (isPrivate) {
      displayMessage = 'The student has configured their portfolio visibility to Private. Only the student may access this profile.';
    } else if (!isNotFound && error) {
      displayMessage = 'We are currently unable to retrieve this verified student portfolio from the institutional registry. Please try again later.';
    }

    return (
      <div style={{ maxWidth: 600, margin: '6rem auto', padding: '2rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: isPrivate ? '#FEF3C7' : '#FEE2E2',
              color: isPrivate ? '#D97706' : '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}
          >
            {isPrivate ? <Lock size={26} /> : <AlertTriangle size={26} />}
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
            {isPrivate ? 'This Portfolio is Private' : 'Portfolio Not Available'}
          </h2>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
            {displayMessage}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {onNavigateHome && (
              <Button variant="primary" icon={ArrowLeft} onClick={onNavigateHome}>
                Return to Pehchaan
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { student, institution, portfolio, credentials } = portfolioData;

  return (
    <div className="public-portfolio-wrapper" style={{ minHeight: '100vh', background: 'var(--bg-app)', paddingBottom: '4rem' }}>
      {/* Top Navbar */}
      <header
        className="no-print"
        style={{
          background: 'var(--surface-white)',
          borderBottom: '1px solid var(--border-light)',
          padding: '0.75rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {onNavigateHome && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onNavigateHome}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
              >
                <ArrowLeft size={14} />
                Pehchaan Home
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  fontSize: '0.74rem',
                  fontWeight: 700
                }}
              >
                <CheckCircle2 size={13} />
                Official Verified Portfolio
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button
              variant="outline"
              size="sm"
              icon={Share2}
              onClick={handleCopyLink}
            >
              {copySuccess ? 'Copied!' : 'Share Portfolio'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
            >
              Print Transcript
            </Button>
          </div>
        </div>
      </header>

      {/* Main Portfolio Presentation Area */}
      <main style={{ maxWidth: 1040, margin: '2rem auto', padding: '0 1.25rem' }}>
        {portfolio.template === 'TECH_DEV_CARD' ? (
          <TechDevTemplate
            student={student}
            institution={institution}
            portfolio={portfolio}
            credentials={credentials}
          />
        ) : portfolio.template === 'ACADEMIC_PROFESSIONAL' ? (
          <AcademicProfessionalTemplate
            student={student}
            institution={institution}
            portfolio={portfolio}
            credentials={credentials}
          />
        ) : (
          <CleanMinimalTemplate
            student={student}
            institution={institution}
            portfolio={portfolio}
            credentials={credentials}
          />
        )}
      </main>

      {/* Hidden Transcript view for clean printing */}
      <PortfolioTranscriptView
        student={student}
        institution={institution}
        portfolio={portfolio}
        credentials={credentials}
      />
    </div>
  );
};
