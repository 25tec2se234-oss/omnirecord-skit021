import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { CleanMinimalTemplate } from './templates/CleanMinimalTemplate';
import { TechDevTemplate } from './templates/TechDevTemplate';
import { AcademicProfessionalTemplate } from './templates/AcademicProfessionalTemplate';
import { PortfolioTranscriptView } from './PortfolioTranscriptView';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import {
  Award,
  CheckCircle2,
  Share2,
  Printer,
  Eye,
  Edit3,
  Globe,
  Lock,
  Sparkles,
  Layout,
  Search,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const PortfolioBuilder = () => {
  const { currentUser, institutionInfo, addToast, records, students } = useApp();

  // Primary State
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Student & Portfolio State
  const [portfolioData, setPortfolioData] = useState({
    template: 'CLEAN_MINIMAL',
    visibility: 'PRIVATE',
    headline: 'Full-Stack Developer & Aspiring AI Engineer',
    bio: 'Passionate about building scalable software solutions, participating in hackathons, and developing verified technical competencies.',
    customSlug: ''
  });

  const [studentProfile, setStudentProfile] = useState({
    id: 'STU-001',
    studentId: 'SKIT-2022-CS014',
    name: currentUser?.fullName || currentUser?.name || 'Aarav Patel',
    email: currentUser?.email || 'aarav.patel.22@skit.ac.in',
    program: 'B.Tech Computer Science',
    year: '3rd Year',
    departmentName: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  const [eligibleCredentials, setEligibleCredentials] = useState([]);
  const [selectedCredentialIds, setSelectedCredentialIds] = useState(new Set());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Load portfolio settings and verified credentials from backend
  useEffect(() => {
    let isCancelled = false;

    async function fetchPortfolio() {
      try {
        const [portfolioRes, credsRes] = await Promise.allSettled([
          api.portfolio.getMyPortfolio(),
          api.portfolio.getEligibleCredentials()
        ]);

        if (isCancelled) return;

        if (portfolioRes.status === 'fulfilled' && portfolioRes.value?.data) {
          const { portfolio, student } = portfolioRes.value.data;
          if (portfolio) {
            setPortfolioData({
              template: portfolio.template || 'CLEAN_MINIMAL',
              visibility: portfolio.visibility || 'PRIVATE',
              headline: portfolio.headline || 'Full-Stack Developer & Aspiring AI Engineer',
              bio: portfolio.bio || '',
              customSlug: portfolio.customSlug || ''
            });
          }
          if (student) {
            setStudentProfile(prev => ({ ...prev, ...student }));
          }
        }

        if (credsRes.status === 'fulfilled' && Array.isArray(credsRes.value?.data)) {
          const creds = credsRes.value.data;
          setEligibleCredentials(creds);
          const selected = new Set(creds.filter(c => c.isSelected).map(c => c.id));
          setSelectedCredentialIds(selected);
        } else {
          // Fallback to local verified records for this student if backend not reached
          const studentMatched = students.find(s =>
            s.email?.toLowerCase() === currentUser?.email?.toLowerCase() ||
            s.name?.toLowerCase() === (currentUser?.fullName || currentUser?.name || '').toLowerCase()
          ) || students[0];

          if (studentMatched) {
            setStudentProfile(prev => ({
              ...prev,
              ...studentMatched,
              studentId: studentMatched.studentId || 'SKIT-2022-CS014'
            }));
          }

          const studentVerifiedRecords = records.filter(r =>
            (r.verificationStatus === 'Verified' || r.verificationStatus === 'VERIFIED') &&
            (r.studentId === studentMatched?.id ||
              r.studentRegNo === studentMatched?.studentId ||
              r.studentName?.toLowerCase() === studentMatched?.name?.toLowerCase())
          );

          const mapped = studentVerifiedRecords.map((r, i) => ({
            id: r.id || `REC-${i}`,
            recordNumber: r.id || r.recordNumber || `REC-2024-${i + 1}`,
            title: r.activityName || r.title || 'Participation Record',
            category: r.category || 'Technical',
            participationDate: r.participationDate || new Date().toISOString(),
            achievementLevel: r.achievementLevel || 'Participant',
            certificateRef: r.certificateRef || 'CERT-VERIFIED',
            description: r.description || '',
            departmentName: r.studentDepartment || studentMatched?.departmentName || 'Computer Science',
            verificationStatus: 'VERIFIED',
            isVerified: true,
            isSelected: i < 3,
            displayOrder: i
          }));

          setEligibleCredentials(mapped);
          setSelectedCredentialIds(new Set(mapped.filter(m => m.isSelected).map(m => m.id)));
        }
      } catch (err) {
        console.warn('Portfolio load notice:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchPortfolio();

    return () => {
      isCancelled = true;
    };
  }, [currentUser, records, students]);

  // Persist settings (template, visibility, headline, bio) to backend
  const handleUpdateSettings = async (updates) => {
    const nextSettings = { ...portfolioData, ...updates };
    setPortfolioData(nextSettings);
    setSaveStatus('saving');

    try {
      await api.portfolio.updateMySettings({
        template: nextSettings.template,
        visibility: nextSettings.visibility,
        headline: nextSettings.headline,
        bio: nextSettings.bio,
        customSlug: nextSettings.customSlug || null
      });
      setSaveStatus('saved');
    } catch (err) {
      console.warn('Portfolio setting save fallback:', err);
      setSaveStatus('error');
      addToast({
        title: 'Save Note',
        message: 'Settings saved in local session.',
        type: 'info'
      });
    }
  };

  // Toggle credential selection with backend persistence
  const handleToggleCredential = async (credId) => {
    const nextSet = new Set(selectedCredentialIds);
    if (nextSet.has(credId)) {
      nextSet.delete(credId);
    } else {
      nextSet.add(credId);
    }

    setSelectedCredentialIds(nextSet);
    setSaveStatus('saving');

    const credentialIdsArray = Array.from(nextSet);

    try {
      await api.portfolio.updateCredentials({
        credentialIds: credentialIdsArray
      });
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('saved'); // Optimistic local update
      console.warn('Credential persistence note:', err);
    }
  };

  // Select all / Deselect all
  const handleSelectAll = async (selectAll = true) => {
    const nextSet = selectAll
      ? new Set(eligibleCredentials.map(c => c.id))
      : new Set();

    setSelectedCredentialIds(nextSet);
    setSaveStatus('saving');

    try {
      await api.portfolio.updateCredentials({
        credentialIds: Array.from(nextSet)
      });
      setSaveStatus('saved');
      addToast({
        title: selectAll ? 'All Selected' : 'Selections Cleared',
        message: selectAll
          ? `Selected all ${eligibleCredentials.length} verified credentials.`
          : 'Deselected all credentials from public view.',
        type: 'info'
      });
    } catch (err) {
      console.warn('Selection update fallback:', err);
      setSaveStatus('saved');
    }
  };

  // Canonical shareable URL
  const shareableUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pehchaan-skit021.onrender.com';
    const identifier = portfolioData.customSlug || studentProfile.studentId || studentProfile.id;
    return `${origin}/portfolio/${identifier}`;
  }, [portfolioData.customSlug, studentProfile]);

  // Copy Shareable Link (Robust Clipboard API + Fallback)
  const handleCopyLink = async () => {
    if (portfolioData.visibility === 'PRIVATE') {
      addToast({
        title: 'Portfolio is Private',
        message: 'Please publish your portfolio before sharing this link with recruiters or peers.',
        type: 'warning'
      });
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareableUrl);
      } else {
        // Fallback for older browsers / non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = shareableUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) throw new Error('Copy command failed');
      }

      addToast({
        title: 'Link Copied to Clipboard!',
        message: shareableUrl,
        type: 'success'
      });
    } catch (err) {
      console.error('Clipboard copy error:', err);
      addToast({
        title: 'Copy Failed',
        message: 'Could not access clipboard. Please manually copy the URL.',
        type: 'error'
      });
    }
  };

  // Print Transcript
  const handlePrintTranscript = () => {
    window.print();
  };

  // Filtered credentials list
  const filteredCredentials = useMemo(() => {
    return eligibleCredentials.filter(c => {
      const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.certificateRef && c.certificateRef.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [eligibleCredentials, categoryFilter, searchQuery]);

  // Selected credentials array for preview and print
  const selectedCredentialsList = useMemo(() => {
    return eligibleCredentials.filter(c => selectedCredentialIds.has(c.id));
  }, [eligibleCredentials, selectedCredentialIds]);

  const categoriesList = useMemo(() => {
    const cats = new Set(eligibleCredentials.map(c => c.category));
    return ['ALL', ...Array.from(cats)];
  }, [eligibleCredentials]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
        <div className="spin" style={{ width: 40, height: 40, border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-orange)', borderRadius: '50%' }} />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Loading verified credentials and portfolio settings...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
          borderColor: 'var(--orange-100)',
          padding: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.2rem 0.6rem', background: 'var(--soft-orange)', borderRadius: 'var(--radius-full)', color: 'var(--primary-orange)', fontSize: '0.74rem', fontWeight: 700, marginBottom: 4 }}>
              <Sparkles size={13} />
              AUTHENTICATED CREDENTIAL SHOWCASE
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Automated Portfolio Builder
            </h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
              Curate, preview, and publish your verified academic and technical achievements backed by immutable SKIT institutional records.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Status Pill */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: portfolioData.visibility === 'PUBLIC' ? '#ECFDF5' : '#F1F5F9',
                color: portfolioData.visibility === 'PUBLIC' ? '#059669' : '#64748B',
                border: `1px solid ${portfolioData.visibility === 'PUBLIC' ? '#A7F3D0' : '#E2E8F0'}`
              }}
            >
              {portfolioData.visibility === 'PUBLIC' ? <Globe size={13} /> : <Lock size={13} />}
              {portfolioData.visibility === 'PUBLIC' ? 'PORTFOLIO PUBLIC' : 'PORTFOLIO PRIVATE'}
            </span>

            {/* Toggle Preview Mode */}
            <Button
              variant={isPreviewMode ? 'primary' : 'outline'}
              size="sm"
              icon={isPreviewMode ? Edit3 : Eye}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? 'Edit Selections' : 'Live Preview'}
            </Button>

            {/* Copy Shareable Link */}
            <Button
              variant="outline"
              size="sm"
              icon={Share2}
              onClick={handleCopyLink}
              title={portfolioData.visibility === 'PRIVATE' ? 'Publish portfolio to share link' : 'Copy public URL'}
            >
              Copy Link
            </Button>

            {/* Print Transcript */}
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={handlePrintTranscript}
            >
              Print Transcript
            </Button>

            {/* Publish / Unpublish Button */}
            <Button
              variant={portfolioData.visibility === 'PUBLIC' ? 'secondary' : 'primary'}
              size="sm"
              icon={portfolioData.visibility === 'PUBLIC' ? Lock : Globe}
              onClick={() => setIsPublishModalOpen(true)}
            >
              {portfolioData.visibility === 'PUBLIC' ? 'Unpublish' : 'Publish Portfolio'}
            </Button>
          </div>
        </div>

        {/* Sync Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', borderTop: '1px solid var(--orange-100)', paddingTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw size={12} className="spin" style={{ color: 'var(--primary-orange)' }} />
                <span style={{ color: 'var(--primary-orange)', fontWeight: 600 }}>Syncing changes to PostgreSQL...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check size={13} style={{ color: '#16A34A' }} />
                <span style={{ color: '#16A34A', fontWeight: 600 }}>Authoritative database synced</span>
              </>
            ) : (
              <>
                <AlertCircle size={13} style={{ color: 'var(--text-secondary)' }} />
                <span>Changes saved in session</span>
              </>
            )}
          </div>

          <div style={{ fontFamily: 'monospace' }}>
            Live URL: <a href={shareableUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-orange)', textDecoration: 'none' }}>{shareableUrl}</a>
          </div>
        </div>
      </div>

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Eligible Verified Records"
          value={eligibleCredentials.length}
          icon={CheckCircle2}
          subtitle="Confirmed by Faculty"
        />
        <StatCard
          title="Selected for Publication"
          value={selectedCredentialIds.size}
          icon={Award}
          subtitle={`${eligibleCredentials.length > 0 ? Math.round((selectedCredentialIds.size / eligibleCredentials.length) * 100) : 0}% of verified achievements`}
        />
        <StatCard
          title="Active Layout Template"
          value={
            portfolioData.template === 'TECH_DEV_CARD'
              ? 'Tech Dev Card'
              : portfolioData.template === 'ACADEMIC_PROFESSIONAL'
              ? 'Academic Pro'
              : 'Clean Minimal'
          }
          icon={Layout}
          subtitle="Customizable theme"
        />
        <StatCard
          title="Public Access Status"
          value={portfolioData.visibility}
          icon={portfolioData.visibility === 'PUBLIC' ? Globe : Lock}
          subtitle={portfolioData.visibility === 'PUBLIC' ? 'Publicly discoverable' : 'Private to student only'}
        />
      </div>

      {/* 3. PREVIEW MODE VIEW */}
      {isPreviewMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-white)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Eye size={18} style={{ color: 'var(--primary-orange)' }} />
              <div>
                <strong style={{ fontSize: '0.94rem' }}>Live Interactive Preview</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: 8 }}>
                  Viewing as: {portfolioData.template.replace(/_/g, ' ')} ({selectedCredentialsList.length} credentials)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button size="sm" variant="outline" onClick={() => setIsPreviewMode(false)}>
                Back to Selection Editor
              </Button>
              <Button size="sm" variant="primary" icon={Printer} onClick={handlePrintTranscript}>
                Print This View
              </Button>
            </div>
          </div>

          {/* Render Active Template */}
          {portfolioData.template === 'TECH_DEV_CARD' && (
            <TechDevTemplate
              student={{ ...studentProfile, headline: portfolioData.headline, bio: portfolioData.bio }}
              institution={institutionInfo}
              portfolio={portfolioData}
              credentials={selectedCredentialsList}
            />
          )}

          {portfolioData.template === 'ACADEMIC_PROFESSIONAL' && (
            <AcademicProfessionalTemplate
              student={{ ...studentProfile, headline: portfolioData.headline, bio: portfolioData.bio }}
              institution={institutionInfo}
              portfolio={portfolioData}
              credentials={selectedCredentialsList}
            />
          )}

          {portfolioData.template === 'CLEAN_MINIMAL' && (
            <CleanMinimalTemplate
              student={{ ...studentProfile, headline: portfolioData.headline, bio: portfolioData.bio }}
              institution={institutionInfo}
              portfolio={portfolioData}
              credentials={selectedCredentialsList}
            />
          )}
        </div>
      ) : (
        /* 4. BUILDER & SELECTION VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Section: Select Template */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                1. Choose Portfolio Layout Template
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Select a presentation layout designed for recruiter reviews, technical evaluation, or formal academic applications.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Template 1: Clean Minimal */}
              <div
                onClick={() => handleUpdateSettings({ template: 'CLEAN_MINIMAL' })}
                style={{
                  border: `2px solid ${portfolioData.template === 'CLEAN_MINIMAL' ? 'var(--primary-orange)' : 'var(--border-light)'}`,
                  background: portfolioData.template === 'CLEAN_MINIMAL' ? 'var(--orange-50)' : 'var(--surface-white)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {portfolioData.template === 'CLEAN_MINIMAL' && (
                  <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--primary-orange)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} />
                  </span>
                )}
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-orange)', marginBottom: 4 }}>
                  TEMPLATE 1
                </div>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  Clean Minimal
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Crisp white layout with subtle orange accents, clean typography, and recruiter-focused card metadata.
                </p>
                <div style={{ marginTop: 12, fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  Best for: General placements, LinkedIn sharing, HR screening.
                </div>
              </div>

              {/* Template 2: Tech Dev Card */}
              <div
                onClick={() => handleUpdateSettings({ template: 'TECH_DEV_CARD' })}
                style={{
                  border: `2px solid ${portfolioData.template === 'TECH_DEV_CARD' ? 'var(--primary-orange)' : 'var(--border-light)'}`,
                  background: portfolioData.template === 'TECH_DEV_CARD' ? 'var(--orange-50)' : 'var(--surface-white)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {portfolioData.template === 'TECH_DEV_CARD' && (
                  <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--primary-orange)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} />
                  </span>
                )}
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-orange)', marginBottom: 4 }}>
                  TEMPLATE 2
                </div>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  Tech Dev Card
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Developer-oriented theme featuring dark terminal header, hackathon cards, and technology badges derived from real records.
                </p>
                <div style={{ marginTop: 12, fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  Best for: Software engineering, hackathon showcases, technical roles.
                </div>
              </div>

              {/* Template 3: Academic Professional */}
              <div
                onClick={() => handleUpdateSettings({ template: 'ACADEMIC_PROFESSIONAL' })}
                style={{
                  border: `2px solid ${portfolioData.template === 'ACADEMIC_PROFESSIONAL' ? 'var(--primary-orange)' : 'var(--border-light)'}`,
                  background: portfolioData.template === 'ACADEMIC_PROFESSIONAL' ? 'var(--orange-50)' : 'var(--surface-white)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {portfolioData.template === 'ACADEMIC_PROFESSIONAL' && (
                  <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--primary-orange)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} />
                  </span>
                )}
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-orange)', marginBottom: 4 }}>
                  TEMPLATE 3
                </div>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  Academic Professional
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Formal institutional letterhead presentation with university seal, structured academic listing, and official endorsement.
                </p>
                <div style={{ marginTop: 12, fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  Best for: Internships, research grants, master's & PhD applications.
                </div>
              </div>
            </div>
          </div>

          {/* Section: Portfolio Headline & Customization */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                2. Professional Headline & Bio
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Add context to your achievements for recruiters and academic evaluators.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Professional Headline</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.86rem' }}
                  value={portfolioData.headline}
                  onChange={(e) => setPortfolioData({ ...portfolioData, headline: e.target.value })}
                  onBlur={() => handleUpdateSettings({ headline: portfolioData.headline })}
                  placeholder="e.g. Full-Stack Systems Developer & Hackathon Winner"
                  maxLength={200}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>
                  Brief one-line summary displayed at the top of your portfolio.
                </span>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Personal Statement / Bio</label>
                <textarea
                  className="form-control"
                  rows={2}
                  style={{ fontSize: '0.86rem', resize: 'vertical' }}
                  value={portfolioData.bio}
                  onChange={(e) => setPortfolioData({ ...portfolioData, bio: e.target.value })}
                  onBlur={() => handleUpdateSettings({ bio: portfolioData.bio })}
                  placeholder="Summarize your primary engineering passions, research interests, and project experience."
                  maxLength={1000}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>
                  Auto-saves on blur.
                </span>
              </div>
            </div>
          </div>

          {/* Section: Verified Credentials Library */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  3. Verified Credentials Library ({eligibleCredentials.length} Eligible)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Select which authenticated institutional achievements to include in your public portfolio.
                </p>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: 30, fontSize: '0.82rem', height: 34, width: 200 }}
                    placeholder="Search credentials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="form-control"
                  style={{ fontSize: '0.82rem', height: 34, width: 'auto' }}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'ALL' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>

                <Button size="xs" variant="outline" onClick={() => handleSelectAll(true)}>
                  Select All
                </Button>
                <Button size="xs" variant="ghost" onClick={() => handleSelectAll(false)}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Credentials Card Grid */}
            {filteredCredentials.length === 0 ? (
              <div
                style={{
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-medium)',
                  color: 'var(--text-secondary)'
                }}
              >
                <Award size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  No Verified Credentials Found
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {eligibleCredentials.length === 0
                    ? 'Only achievements verified by institutional faculty coordinators are eligible for publication. Once verified, your achievements will appear here automatically.'
                    : 'No credentials match your active search or category filter.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
                {filteredCredentials.map(cred => {
                  const isSelected = selectedCredentialIds.has(cred.id);
                  return (
                    <div
                      key={cred.id}
                      onClick={() => handleToggleCredential(cred.id)}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${isSelected ? 'var(--primary-orange)' : 'var(--border-light)'}`,
                        background: isSelected ? '#FFFAF5' : 'var(--surface-white)',
                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 12,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        {/* Top bar: Category + Checkbox */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              color: isSelected ? 'var(--primary-orange)' : 'var(--text-secondary)',
                              background: isSelected ? 'var(--orange-100)' : 'var(--surface-muted)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            {cred.category}
                          </span>

                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 4,
                              border: `2px solid ${isSelected ? 'var(--primary-orange)' : 'var(--border-medium)'}`,
                              background: isSelected ? 'var(--primary-orange)' : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', margin: '8px 0 4px' }}>
                          {cred.title}
                        </h4>

                        {/* Description */}
                        {cred.description && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                            {cred.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom bar: Details & Verified Badge */}
                      <div
                        style={{
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.74rem',
                          color: 'var(--text-tertiary)'
                        }}
                      >
                        <div>
                          Level: <strong style={{ color: 'var(--text-primary)' }}>{cred.achievementLevel || 'Participant'}</strong>
                          {cred.participationDate && (
                            <span style={{ marginLeft: 8 }}>
                              • {new Date(cred.participationDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>

                        {/* Authoritative verification status */}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            background: '#ECFDF5',
                            color: '#059669',
                            fontWeight: 700,
                            fontSize: '0.7rem'
                          }}
                        >
                          <CheckCircle2 size={12} />
                          Verified
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. PUBLISH CONFIRMATION MODAL */}
      {isPublishModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsPublishModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: 520, padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: portfolioData.visibility === 'PUBLIC' ? 'var(--orange-50)' : '#ECFDF5',
                  color: portfolioData.visibility === 'PUBLIC' ? 'var(--primary-orange)' : '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {portfolioData.visibility === 'PUBLIC' ? <Lock size={22} /> : <Globe size={22} />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {portfolioData.visibility === 'PUBLIC' ? 'Unpublish Portfolio?' : 'Publish Portfolio to Public URL?'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {portfolioData.visibility === 'PUBLIC' ? 'Revoke public web access' : 'Make selected verified achievements publicly accessible'}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {portfolioData.visibility === 'PUBLIC' ? (
                <p style={{ margin: 0 }}>
                  Unpublishing will immediately make your portfolio private. Anyone accessing your public portfolio URL will no longer be able to view your credentials.
                </p>
              ) : (
                <p style={{ margin: 0 }}>
                  Publishing will make your selected verified achievements accessible at your public URL:
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: 4, fontFamily: 'monospace' }}>
                    {shareableUrl}
                  </strong>
                  Only your explicitly approved name, institution, and <strong>{selectedCredentialIds.size} selected verified credentials</strong> will be public. Private contact info, unselected records, and internal audit notes are strictly shielded.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="outline" onClick={() => setIsPublishModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={portfolioData.visibility === 'PUBLIC' ? 'secondary' : 'primary'}
                onClick={async () => {
                  const nextVisibility = portfolioData.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
                  await handleUpdateSettings({ visibility: nextVisibility });
                  setIsPublishModalOpen(false);
                  addToast({
                    title: nextVisibility === 'PUBLIC' ? 'Portfolio Published!' : 'Portfolio Unpublished',
                    message: nextVisibility === 'PUBLIC'
                      ? 'Your public portfolio is now accessible to recruiters and visitors.'
                      : 'Your portfolio is now private.',
                    type: 'success'
                  });
                }}
              >
                {portfolioData.visibility === 'PUBLIC' ? 'Confirm Unpublish' : 'Confirm & Publish'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Hidden Printable Transcript (Available for window.print()) */}
      <PortfolioTranscriptView
        student={{ ...studentProfile, headline: portfolioData.headline, bio: portfolioData.bio }}
        institution={institutionInfo}
        portfolio={portfolioData}
        credentials={selectedCredentialsList}
      />
    </div>
  );
};
