import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Calendar,
  User,
  ShieldCheck,
  Award
} from 'lucide-react';

export const RecordDetailModal = ({ isOpen, onClose, record, onOpenEdit }) => {
  const { navigateTo } = useApp();

  if (!record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Participation Record: ${record.id}`}
      subtitle={`Submitted on ${record.submissionDate || 'N/A'}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {onOpenEdit && (
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onOpenEdit(record);
              }}
            >
              Edit Record
            </Button>
          )}
          {record.verificationStatus === 'Pending Review' || record.verificationStatus === 'Needs Correction' ? (
            <Button
              variant="primary"
              icon={ShieldCheck}
              onClick={() => {
                onClose();
                navigateTo('verification', { recordId: record.id });
              }}
            >
              Open in Verification Center
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={Award}
              onClick={() => {
                onClose();
                navigateTo('profile', { studentId: record.studentId });
              }}
            >
              View Student Profile
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top Status Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
              VERIFICATION STATUS
            </span>
            <div style={{ marginTop: 2 }}>
              <Badge variant={getStatusBadgeVariant(record.verificationStatus)} dot>
                {record.verificationStatus}
              </Badge>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
              ACHIEVEMENT LEVEL
            </span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {record.achievementLevel}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
              CERTIFICATE REF
            </span>
            <div className="mono" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--primary-orange)' }}>
              {record.certificateRef || 'N/A'}
            </div>
          </div>
        </div>

        {/* Two Column Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Student Info */}
          <div style={{ padding: '1rem', borderRadius: 10, border: '1px solid var(--border-light)', background: 'var(--surface-white)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
              <User size={15} />
              <span>STUDENT INFORMATION</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {record.studentName}
            </div>
            <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Roll No: {record.studentRegNo}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--primary-orange)', marginTop: 4, fontWeight: 500 }}>
              {record.studentDepartment}
            </div>
          </div>

          {/* Activity Info */}
          <div style={{ padding: '1rem', borderRadius: 10, border: '1px solid var(--border-light)', background: 'var(--surface-white)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
              <Calendar size={15} />
              <span>ACTIVITY DETAILS</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {record.activityName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span className="badge badge-neutral">{record.category}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Date: {record.participationDate}
              </span>
            </div>
          </div>
        </div>

        {/* Description / Synopsis */}
        {record.description && (
          <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Submission Notes & Synopsis
            </strong>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.5 }}>
              {record.description}
            </p>
          </div>
        )}

        {/* Evidence Preview Box */}
        <div>
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
            Attached Credential Proof (Frontend Simulation)
          </strong>
          <div
            style={{
              border: '1px solid var(--border-light)',
              borderRadius: 10,
              padding: '1.25rem',
              background: 'linear-gradient(135deg, #FAF5FF 0%, #FFF7ED 100%)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Watermark */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-15deg)',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'rgba(249, 115, 22, 0.08)',
                letterSpacing: '0.15em',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              FRONTEND DEMO VERIFICATION
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-sm)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-orange)', marginBottom: 8 }}>
                <FileText size={24} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                {record.evidenceFilename || 'certificate_evidence.pdf'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {record.evidenceFileSize || '1.2 MB'} • Standard Credential Archive
              </div>
              <div style={{ marginTop: 10 }}>
                <span className="badge badge-orange" style={{ fontSize: '0.72rem' }}>
                  Reference: {record.certificateRef || 'CERT-DEMO-REF'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviewer Audit Trail */}
        <div style={{ padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
          <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Verification Audit Log
          </strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: '0.85rem' }}>
            <ShieldCheck size={16} style={{ color: 'var(--primary-orange)' }} />
            <span>
              Reviewer: <strong>{record.reviewerName || 'Unassigned Coordinator'}</strong>
            </span>
            {record.reviewDate && (
              <span style={{ color: 'var(--text-tertiary)' }}>
                • Reviewed on {record.reviewDate}
              </span>
            )}
          </div>
          {record.reviewerNotes && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic', paddingLeft: 24 }}>
              "{record.reviewerNotes}"
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
