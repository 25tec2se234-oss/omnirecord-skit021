import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
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
  Check
} from 'lucide-react';

export const StudentPortal = () => {
  const {
    students,
    records,
    activities,
    departments,
    currentUser,
    addRecord,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'portfolio' | 'submit'
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Match the student profile based on email or default to Aarav Sharma
  const currentStudent = useMemo(() => {
    const matched = students.find(
      (s) => s.email?.toLowerCase() === currentUser?.email?.toLowerCase()
    );
    return matched || students[0] || {
      id: 'STU-001',
      studentId: 'STU-2022-001',
      name: currentUser?.fullName || currentUser?.name || 'Aarav Sharma',
      email: currentUser?.email || 'aarav.sharma@skit.ac.in',
      departmentName: 'Computer Science & Engineering',
      batch: '2022 - 2026',
      totalCredits: 42,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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
    evidenceFileName: 'certificate_document.pdf'
  });

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
      evidenceFileName: formData.evidenceFileName,
      evidenceFileSize: '1.4 MB',
      description: formData.description
    };

    try {
      await addRecord(submissionPayload);
      setActiveTab('portfolio');
      setFormData({
        activityId: activities[0]?.id || 'ACT-101',
        achievementTitle: '',
        category: 'Technical',
        achievementLevel: 'Winner',
        participationDate: new Date().toISOString().split('T')[0],
        description: '',
        certificateRef: '',
        evidenceFileName: 'certificate_document.pdf'
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
            <img
              src={currentStudent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentStudent.name}
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #fff',
                boxShadow: 'var(--shadow-md)'
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
              onClick={() => setActiveTab('submit')}
            >
              Submit New Achievement
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Award}
              onClick={() => setActiveTab('portfolio')}
            >
              My Portfolio ({verifiedRecords.length})
            </Button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginTop: '1.5rem', borderTop: '1px solid var(--orange-100)', paddingTop: '1rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Student Overview
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'portfolio' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('portfolio')}
          >
            My Portfolio & Credentials ({myRecords.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'submit' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('submit')}
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
                  onClick={() => setActiveTab('portfolio')}
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
                        setActiveTab('submit');
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
        <div className="card" style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Submit Participation & Achievement Evidence
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Upload your authentic credential or certificate for coordinator verification.
            </p>
          </div>

          <form onSubmit={handleAchievementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                Select Campus Event / Activity
              </label>
              <select
                className="form-control"
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                  Achievement Level
                </label>
                <select
                  className="form-control"
                  value={formData.achievementLevel}
                  onChange={(e) => setFormData({ ...formData, achievementLevel: e.target.value })}
                >
                  <option value="Winner (1st Place)">Winner (1st Place)</option>
                  <option value="Runner-Up (2nd Place)">Runner-Up (2nd Place)</option>
                  <option value="3rd Position">3rd Position</option>
                  <option value="Active Participant">Active Participant</option>
                  <option value="Event Coordinator / Lead">Event Coordinator / Lead</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                  Participation Date
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

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                Certificate Serial Number / Reference ID
              </label>
              <input
                type="text"
                placeholder="e.g. CERT-SIH-2024-8849 or Roll ID"
                className="form-control"
                value={formData.certificateRef}
                onChange={(e) => setFormData({ ...formData, certificateRef: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                Upload Certificate / Evidence File (PDF, PNG, JPG)
              </label>
              <div
                style={{
                  border: '2px dashed var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer'
                }}
              >
                <Upload size={24} style={{ color: 'var(--primary-orange)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formData.evidenceFileName || 'Click to select certificate file'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Supported formats: PDF, PNG, JPEG (Max 10MB)
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                Supporting Notes / Description
              </label>
              <textarea
                rows={2}
                className="form-control"
                placeholder="Describe your role, contribution, and any key deliverables..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('dashboard')}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting to PostgreSQL...' : 'Submit Evidence for Verification'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
