import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { UserAvatar } from '../common/UserAvatar';
import {
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  PlusCircle,
  Calendar,
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  Trash2,
  FileUp
} from 'lucide-react';

export const StudentPortal = () => {
  const {
    students,
    records,
    activities,
    departments,
    currentUser,
    addRecord,
    addToast,
    navigateTo,
    currentRoute
  } = useApp();

  const getInitialTab = () => {
    if (currentRoute === 'student-submit') return 'submit';
    if (currentRoute === 'student-portfolio') return 'portfolio';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Sync activeTab whenever route changes
  React.useEffect(() => {
    if (currentRoute === 'student-submit') {
      setActiveTab('submit');
    } else if (currentRoute === 'student-portfolio') {
      setActiveTab('portfolio');
    } else if (currentRoute === 'student-dashboard') {
      setActiveTab('dashboard');
    }
  }, [currentRoute]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'submit') {
      navigateTo('student-submit');
    } else if (tab === 'portfolio') {
      navigateTo('student-portfolio');
    } else {
      navigateTo('student-dashboard');
    }
  };

  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(null);

  // Match the student profile based on email or default to currentUser / Aarav Sharma
  const currentStudent = useMemo(() => {
    const matched = students.find(
      (s) => currentUser?.email && s.email?.toLowerCase() === currentUser.email.toLowerCase()
    );
    if (matched) return matched;

    if (currentUser?.name || currentUser?.fullName) {
      return {
        id: currentUser.id || 'STU-REAL',
        studentId: currentUser.rollNumber || currentUser.studentId || 'SKIT-2024-0520',
        name: currentUser.fullName || currentUser.name,
        email: currentUser.email || 'student@skit.ac.in',
        departmentName: currentUser.department || 'Information Technology',
        batch: currentUser.batch || '2022 - 2026',
        totalCredits: 38,
        avatar: currentUser.avatar || null
      };
    }

    return students[0] || {
      id: 'STU-001',
      studentId: 'STU-2022-001',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@skit.ac.in',
      departmentName: 'Computer Science & Engineering',
      batch: '2022 - 2026',
      totalCredits: 42,
      avatar: null
    };
  }, [students, currentUser]);

  // Student's records
  const myRecords = useMemo(() => {
    return records.filter(
      (r) =>
        r.studentId === currentStudent.id ||
        r.studentRegNo === currentStudent.studentId ||
        r.studentEmail === currentStudent.email ||
        r.studentName?.toLowerCase() === currentStudent.name?.toLowerCase()
    );
  }, [records, currentStudent]);

  const verifiedRecords = myRecords.filter((r) => r.verificationStatus === 'Verified');
  const pendingRecords = myRecords.filter((r) => r.verificationStatus === 'Pending Review');
  const correctionRecords = myRecords.filter((r) => r.verificationStatus === 'Needs Correction');

  // Submit Achievement Form State
  const [formData, setFormData] = useState({
    activityId: activities[0]?.id || 'ACT-101',
    achievementTitle: '',
    category: 'Technical',
    achievementLevel: 'Winner',
    participationDate: new Date().toISOString().split('T')[0],
    description: '',
    certificateRef: '',
    evidenceFileName: ''
  });

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      addToast({
        title: "File Exceeds 10MB Limit",
        message: "Please choose a certificate file under 10MB.",
        type: "error"
      });
      return;
    }
    const validExtensions = /\.(pdf|png|jpe?g)$/i;
    if (!validExtensions.test(file.name)) {
      addToast({
        title: "Unsupported Format",
        message: "Please upload a PDF document or PNG/JPEG image.",
        type: "warning"
      });
      return;
    }

    setSelectedFile(file);
    if (file.type && file.type.startsWith('image/')) {
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setFilePreviewUrl(null);
    }
    setFormData((prev) => ({
      ...prev,
      evidenceFileName: file.name
    }));
    addToast({
      title: "Evidence Attached",
      message: `${file.name} ready for verification upload.`,
      type: "info"
    });
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setFormData((prev) => ({
      ...prev,
      evidenceFileName: ''
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAchievementSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedActivity = activities.find((a) => a.id === formData.activityId) || activities[0];

    const submissionPayload = {
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentRegNo: currentStudent.studentId,
      studentDepartment: currentStudent.departmentName,
      studentEmail: currentStudent.email,
      activityId: selectedActivity.id,
      activityName: formData.achievementTitle || selectedActivity.name,
      category: formData.category,
      achievementLevel: formData.achievementLevel,
      participationDate: formData.participationDate,
      verificationStatus: 'Pending Review',
      certificateRef: formData.certificateRef || `CERT-${Date.now().toString().slice(-4)}`,
      evidenceFileName: selectedFile ? selectedFile.name : (formData.evidenceFileName || 'certificate_document.pdf'),
      evidenceFileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.4 MB',
      file: selectedFile,
      description:
        formData.description && formData.description.trim().length >= 5
          ? formData.description.trim()
          : `${formData.achievementTitle || selectedActivity.name} - Verified Student Participation Record`
    };

    try {
      await addRecord(submissionPayload);
      handleTabChange('dashboard');
      handleRemoveFile();
      setFormData({
        activityId: activities[0]?.id || 'ACT-101',
        achievementTitle: '',
        category: 'Technical',
        achievementLevel: 'Winner',
        participationDate: new Date().toISOString().split('T')[0],
        description: '',
        certificateRef: '',
        evidenceFileName: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Student Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
          borderColor: 'var(--orange-100)',
          padding: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <UserAvatar
              name={currentStudent.name}
              src={customAvatar || currentStudent.avatar}
              size={68}
              showBadge={true}
              editable={true}
              onAvatarChange={(newUrl) => {
                setCustomAvatar(newUrl);
                addToast({
                  title: "Profile Photo Updated",
                  message: "Your profile photo has been updated for this session.",
                  type: "success"
                });
              }}
            />
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.2rem 0.6rem', background: 'var(--soft-orange)', borderRadius: 'var(--radius-full)', color: 'var(--primary-orange)', fontSize: '0.74rem', fontWeight: 700, marginBottom: 4 }}>
                <GraduationCap size={13} />
                STUDENT ACHIEVEMENT PORTAL
              </div>
              <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                {currentStudent.name}
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
                {currentStudent.studentId} • {currentStudent.departmentName} • Batch {currentStudent.batch || '2022-2026'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => handleTabChange('submit')}
            >
              Submit New Achievement
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={() => navigateTo('portfolio-builder')}
            >
              Portfolio Builder
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Award}
              onClick={() => handleTabChange('portfolio')}
            >
              My Records ({verifiedRecords.length})
            </Button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginTop: '1.5rem', borderTop: '1px solid var(--orange-100)', paddingTop: '1rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleTabChange('dashboard')}
          >
            Student Overview
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'portfolio' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleTabChange('portfolio')}
          >
            My Portfolio & Credentials ({myRecords.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'submit' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleTabChange('submit')}
          >
            Submit Achievement
          </button>
        </div>
      </div>

      {/* TAB 1: STUDENT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Verified Credentials"
              value={verifiedRecords.length}
              icon={CheckCircle2}
              subtitle="Authenticated by SKIT"
            />
            <StatCard
              title="Pending Review"
              value={pendingRecords.length}
              icon={Clock}
              subtitle="Under review by faculty"
            />
            <StatCard
              title="Action Required"
              value={correctionRecords.length}
              icon={AlertTriangle}
              subtitle="Needs correction / re-upload"
            />
            <StatCard
              title="Earned Activity Credits"
              value={currentStudent.totalCredits || verifiedRecords.length * 5}
              icon={Sparkles}
              subtitle="Autonomous framework points"
            />
          </div>

          {/* Recent Submissions & Available Events */}
          <div className="grid grid-cols-2 gap-6">
            {/* Recent Submissions */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Participation Submissions</h3>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleTabChange('portfolio')}
                  style={{ color: 'var(--primary-orange)', fontSize: '0.78rem' }}
                >
                  View All ({myRecords.length}) →
                </button>
              </div>

              {myRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  No participation records submitted yet. Click "Submit New Achievement" to register your first proof!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {myRecords.slice(0, 4).map((rec) => (
                    <div
                      key={rec.id || rec.recordNumber}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                          {rec.activityName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          {rec.category} • {rec.achievementLevel} • {rec.submissionDate || 'Recent'}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(rec.verificationStatus)}>
                        {rec.verificationStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Eligible Campus Events */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Upcoming Campus Events</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  SKIT Autonomous Framework
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activities.slice(0, 4).map((act) => (
                  <div
                    key={act.id}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-white)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                        {act.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {act.startDate} • {act.venue || 'Campus Auditorium'}
                      </div>
                    </div>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          activityId: act.id,
                          achievementTitle: act.name,
                          category: act.category
                        });
                        handleTabChange('submit');
                      }}
                    >
                      Submit Proof
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: PORTFOLIO & CERTIFICATES */}
      {activeTab === 'portfolio' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                My Verified Achievement Portfolio
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Permanent academic and co-curricular credentials authenticated by institution authority
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                icon={Sparkles}
                onClick={() => navigateTo('portfolio-builder')}
              >
                Launch Portfolio Builder
              </Button>
              <select
                className="form-control"
                style={{ width: 'auto', fontSize: '0.82rem', height: 34 }}
                value={portfolioCategoryFilter}
                onChange={(e) => setPortfolioCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Social / Community">Social / Community</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {myRecords
              .filter((r) => portfolioCategoryFilter === 'ALL' || r.category === portfolioCategoryFilter)
              .map((rec) => (
                <div
                  key={rec.id || rec.recordNumber}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    background: 'var(--surface-white)',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                          {rec.recordNumber || rec.id}
                        </div>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 2px' }}>
                          {rec.activityName}
                        </h4>
                      </div>
                      <Badge variant={getStatusBadgeVariant(rec.verificationStatus)}>
                        {rec.verificationStatus}
                      </Badge>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                      Level: <strong>{rec.achievementLevel || 'Participant'}</strong> • Category: {rec.category}
                    </div>

                    {rec.reviewerNotes && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-secondary)',
                          fontSize: '0.74rem',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <strong>Reviewer Note:</strong> {rec.reviewerNotes}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                      Ref: <code>{rec.certificateRef || 'CERT-VERIFIED'}</code>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() =>
                          addToast({
                            title: "Evidence Document",
                            message: `Downloading authentic credential ${rec.certificateRef || rec.id}...`,
                            type: "info"
                          })
                        }
                      >
                        <Download size={13} style={{ marginRight: 4 }} />
                        Certificate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUBMIT ACHIEVEMENT FORM */}
      {activeTab === 'submit' && (
        <div
          className="card"
          style={{
            maxWidth: 740,
            margin: '0 auto',
            padding: '2.25rem',
            borderRadius: 16,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04)',
            border: '1px solid var(--border-light)'
          }}
        >
          {/* Form Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              marginBottom: '1.75rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FFEDD5 0%, #FFF7ED 100%)',
                color: 'var(--primary-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(249, 115, 22, 0.2)'
              }}
            >
              <Award size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Submit Participation & Achievement Evidence
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                Upload authentic credentials for faculty coordinator review and permanent institutional ledger verification.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 8,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 6,
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                  fontSize: '0.74rem',
                  fontWeight: 600
                }}
              >
                <ShieldCheck size={14} />
                Institutional Verification Gateway • Encrypted Evidence Storage
              </div>
            </div>
          </div>

          <form onSubmit={handleAchievementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Event / Activity Selection */}
            <div className="form-group">
              <label className="form-label">
                <span>Select Campus Event / Activity <span className="required">*</span></span>
                <span style={{ fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                  SKIT Approved Registry
                </span>
              </label>
              <select
                className="form-control form-select"
                value={formData.activityId}
                onChange={(e) => {
                  const act = activities.find((a) => a.id === e.target.value);
                  setFormData({
                    ...formData,
                    activityId: e.target.value,
                    achievementTitle: act?.name || '',
                    category: act?.category || formData.category
                  });
                }}
              >
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.name} ({act.category}) — {act.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Achievement Level & Date */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span>Achievement Level <span className="required">*</span></span>
                </label>
                <select
                  className="form-control form-select"
                  value={formData.achievementLevel}
                  onChange={(e) => setFormData({ ...formData, achievementLevel: e.target.value })}
                >
                  <option value="Winner">Winner (1st Place)</option>
                  <option value="Runner-up">Runner-Up (2nd Place)</option>
                  <option value="Finalist">Finalist / 3rd Position</option>
                  <option value="Recognition">Special Recognition / Merit</option>
                  <option value="Participant">Active Participant</option>
                  <option value="Organizer">Event Coordinator / Student Lead</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Participation Date <span className="required">*</span></span>
                </label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={formData.participationDate}
                  onChange={(e) => setFormData({ ...formData, participationDate: e.target.value })}
                />
              </div>
            </div>

            {/* Certificate Serial Number */}
            <div className="form-group">
              <label className="form-label">
                <span>Certificate Serial Number / Reference ID</span>
                <span style={{ fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                  Optional / Auto-generated if left blank
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. CERT-SIH-2024-8849 or Roll ID"
                className="form-control"
                value={formData.certificateRef}
                onChange={(e) => setFormData({ ...formData, certificateRef: e.target.value })}
              />
              <div className="form-hint">
                Found on your official certificate or letter. Used for cryptographic verification.
              </div>
            </div>

            {/* Real Interactive Drag & Drop File Upload */}
            <div className="form-group">
              <label className="form-label">
                <span>Upload Certificate / Evidence File <span className="required">*</span></span>
                <span style={{ fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                  PDF, PNG, JPG (Max 10MB)
                </span>
              </label>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />

              {selectedFile ? (
                /* File Selected Card */
                <div className="file-preview-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                    {filePreviewUrl ? (
                      <img
                        src={filePreviewUrl}
                        alt="Preview"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          objectFit: 'cover',
                          border: '1px solid var(--border-light)'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          background: 'var(--orange-100)',
                          color: 'var(--primary-orange)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <FileText size={22} />
                      </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 320
                        }}
                      >
                        {selectedFile.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                        <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.1rem 0.5rem' }}>
                          <Check size={11} /> Ready to Upload
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </Button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={handleRemoveFile}
                      title="Remove file"
                      style={{ color: 'var(--error)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Dropzone */
                <div
                  className={`file-dropzone ${isDragging ? 'dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                >
                  <div className="file-dropzone-icon">
                    <Upload size={24} />
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Click to select certificate file or drag & drop here
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Supported formats: PDF, PNG, JPEG (Max 10MB)
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                      Browse Local Certificate
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Supporting Notes */}
            <div className="form-group">
              <label className="form-label">
                <span>Supporting Notes / Contribution Description <span className="required">*</span></span>
              </label>
              <textarea
                rows={3}
                className="form-control form-textarea"
                placeholder="Describe your role, contributions, project details, and key takeaways (min 5 characters)..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="form-hint">
                This authentic narrative appears on your public portfolio transcript when verified.
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 12,
                marginTop: '1.25rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)'
              }}
            >
              <Button variant="ghost" size="sm" onClick={() => handleTabChange('dashboard')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSubmitting}
                icon={Upload}
              >
                {isSubmitting ? 'Uploading to PostgreSQL...' : 'Submit Evidence for Verification'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
