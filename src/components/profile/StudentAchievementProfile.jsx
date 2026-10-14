import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { CertificatePreviewModal } from './CertificatePreviewModal';
import {
  Award,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const StudentAchievementProfile = () => {
  const { students, records, selectedStudentId, setSelectedStudentId, navigateTo } = useApp();

  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [inspectingRecord, setInspectingRecord] = useState(null);

  // Filtered records for this student
  const studentRecords = useMemo(() => {
    if (!currentStudent) return [];
    return records
      .filter(r => r.studentId === currentStudent.id)
      .filter(r => selectedCategory === 'ALL' || r.category === selectedCategory)
      .sort((a, b) => new Date(b.participationDate) - new Date(a.participationDate));
  }, [records, currentStudent, selectedCategory]);

  const allStudentRecords = useMemo(() => {
    if (!currentStudent) return [];
    return records.filter(r => r.studentId === currentStudent.id);
  }, [records, currentStudent]);

  const verifiedCount = allStudentRecords.filter(r => r.verificationStatus === 'Verified').length;
  const winnersCount = allStudentRecords.filter(r => r.achievementLevel === 'Winner' || r.achievementLevel === 'Runner-up').length;

  const handlePrint = () => {
    window.print();
  };

  if (!currentStudent) return null;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Students', route: 'students' },
          { label: currentStudent.name }
        ]}
        onNavigate={navigateTo}
      />

      {/* Top Header & Student Switcher */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Award size={24} style={{ color: 'var(--primary-orange)' }} />
            Digital Student Achievement Profile
          </h1>
          <p>
            Official institutional co-curricular transcript consolidating verified events, certificates, and merits.
          </p>
        </div>

        <div className="page-actions">
          {/* Quick Student Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }} className="no-mobile">
              Switch Student:
            </span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={currentStudent.id}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            icon={Printer}
            onClick={handlePrint}
          >
            Print Achievement Transcript
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)',
          borderColor: 'var(--orange-100)',
          marginBottom: '1.5rem',
          padding: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <img
              src={currentStudent.avatar}
              alt={currentStudent.name}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--surface-white)',
                boxShadow: 'var(--shadow-md)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {currentStudent.name}
                </h2>
                <Badge variant={currentStudent.status === 'Active' ? 'success' : 'neutral'}>
                  {currentStudent.status}
                </Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-orange)' }}>
                  {currentStudent.studentId}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {currentStudent.departmentName}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>•</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {currentStudent.program} ({currentStudent.year})
                </span>
              </div>

              {currentStudent.bio && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 8, maxWidth: 600 }}>
                  {currentStudent.bio}
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '0.75rem 1.1rem', background: 'var(--surface-white)', borderRadius: 10, border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>PARTICIPATION</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{allStudentRecords.length}</div>
            </div>
            <div style={{ padding: '0.75rem 1.1rem', background: 'var(--surface-white)', borderRadius: 10, border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>VERIFIED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)' }}>{verifiedCount}</div>
            </div>
            <div style={{ padding: '0.75rem 1.1rem', background: 'var(--surface-white)', borderRadius: 10, border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>HONORS / WINS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-orange)' }}>{winnersCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'ALL', label: 'All Activities' },
          { id: 'Technical', label: 'Technical' },
          { id: 'Research', label: 'Research' },
          { id: 'Cultural', label: 'Cultural' },
          { id: 'Sports', label: 'Sports' },
          { id: 'Workshop', label: 'Workshops' },
          { id: 'Volunteering', label: 'Volunteering' },
          { id: 'Extracurricular', label: 'Extracurricular' }
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Chronological Achievement Timeline */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Chronological Achievement History</h3>
            <p className="card-subtitle">Verified institutional activities and credential proofs</p>
          </div>
          <span className="badge badge-neutral">
            {studentRecords.length} {studentRecords.length === 1 ? 'event' : 'events'} listed
          </span>
        </div>

        {studentRecords.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No records found for the selected category filter.
          </div>
        ) : (
          <div className="timeline">
            {studentRecords.map((rec) => {
              const isVerified = rec.verificationStatus === 'Verified';
              const isPending = rec.verificationStatus === 'Pending Review';
              const isCorrection = rec.verificationStatus === 'Needs Correction';

              const markerClass = isVerified ? 'verified' : isPending ? 'pending' : isCorrection ? 'correction' : 'rejected';

              return (
                <div key={rec.id} className="timeline-item">
                  <div className={`timeline-marker ${markerClass}`} />

                  <div className="timeline-content">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {rec.activityName}
                          </h4>
                          <span className="badge badge-orange">{rec.category}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                          Conducted on {rec.participationDate} • Record ID: {rec.id}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {rec.achievementLevel}
                        </span>
                        <Badge variant={getStatusBadgeVariant(rec.verificationStatus)} dot>
                          {rec.verificationStatus}
                        </Badge>
                      </div>
                    </div>

                    {rec.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                        {rec.description}
                      </p>
                    )}

                    {/* Verification info & Credential link */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {isVerified ? (
                          <span style={{ color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={14} /> Verified by {rec.reviewerName || 'Institutional Faculty'}
                          </span>
                        ) : isPending ? (
                          <span style={{ color: 'var(--warning)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={14} /> Under faculty verification review
                          </span>
                        ) : (
                          <span style={{ color: 'var(--error)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={14} /> Reviewer Note: {rec.reviewerNotes || 'Requires correction'}
                          </span>
                        )}
                      </div>

                      {isVerified && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Award}
                          onClick={() => setInspectingRecord(rec)}
                        >
                          View Verified Credential
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      <CertificatePreviewModal
        isOpen={!!inspectingRecord}
        onClose={() => setInspectingRecord(null)}
        record={inspectingRecord}
        student={currentStudent}
      />
    </div>
  );
};
