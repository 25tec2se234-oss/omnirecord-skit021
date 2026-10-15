import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { UserAvatar } from '../common/UserAvatar';
import { useApp } from '../../context/AppContext';
import { Award, Mail, Phone, BookOpen, Calendar } from 'lucide-react';

export const StudentDetailModal = ({ isOpen, onClose, student }) => {
  const { records, navigateTo } = useApp();

  if (!student) return null;

  const studentRecords = records.filter(r => r.studentId === student.id);
  const verifiedCount = studentRecords.filter(r => r.verificationStatus === 'Verified').length;
  const pendingCount = studentRecords.filter(r => r.verificationStatus === 'Pending Review').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Profile Overview"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            icon={Award}
            onClick={() => {
              onClose();
              navigateTo('profile', { studentId: student.id });
            }}
          >
            Open Achievement Profile
          </Button>
        </>
      }
    >
      <div>
        {/* Profile Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <UserAvatar
            name={student.name}
            src={student.avatar}
            size={64}
            showBadge={true}
          />
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {student.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {student.studentId}
              </span>
              <span className={`badge ${student.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                {student.status}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-orange)', fontWeight: 600, marginTop: 4 }}>
              {student.departmentName}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 10, marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
            <BookOpen size={15} style={{ color: 'var(--text-tertiary)' }} />
            <span>{student.program}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
            <Calendar size={15} style={{ color: 'var(--text-tertiary)' }} />
            <span>{student.year}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
            <Mail size={15} style={{ color: 'var(--text-tertiary)' }} />
            <span>{student.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
            <Phone size={15} style={{ color: 'var(--text-tertiary)' }} />
            <span>{student.phone || 'N/A'}</span>
          </div>
        </div>

        {/* Stats Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem', textAlign: 'center' }}>
          <div style={{ padding: '0.75rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Participation</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{studentRecords.length}</div>
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Verified</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>{verifiedCount}</div>
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pending</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--warning)' }}>{pendingCount}</div>
          </div>
        </div>

        {/* Associated Records Preview */}
        <div>
          <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
            Logged Achievements & Participation
          </strong>
          {studentRecords.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              No participation records logged yet for this student.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: 180, overflowY: 'auto' }}>
              {studentRecords.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: 6,
                    border: '1px solid var(--border-light)',
                    background: 'var(--surface-white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.activityName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {r.category} • {r.achievementLevel} • {r.participationDate}
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(r.verificationStatus)}>
                    {r.verificationStatus}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
