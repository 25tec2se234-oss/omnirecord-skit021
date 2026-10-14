import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  User,
  Calendar,
  Award,
  Sparkles
} from 'lucide-react';

export const VerificationReviewModal = ({ isOpen, onClose, record }) => {
  const { updateVerificationStatus, navigateTo } = useApp();

  const [activeAction, setActiveAction] = useState(null); // 'reject' | 'correction' | null
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('Dr. Ananya Sharma (Convenor)');
  const [feedbackError, setFeedbackError] = useState('');

  if (!record) return null;

  const handleVerify = () => {
    updateVerificationStatus(
      record.id,
      'Verified',
      feedbackNotes || 'Credential evidence and participation verified against official institutional records.',
      reviewerName
    );
    onClose();
  };

  const handleReject = () => {
    if (!feedbackNotes.trim()) {
      setFeedbackError('A specific rejection reason is required for institutional transparency');
      return;
    }
    updateVerificationStatus(record.id, 'Rejected', feedbackNotes, reviewerName);
    onClose();
  };

  const handleRequestCorrection = () => {
    if (!feedbackNotes.trim()) {
      setFeedbackError('Please specify the required correction instructions for the student');
      return;
    }
    updateVerificationStatus(record.id, 'Needs Correction', feedbackNotes, reviewerName);
    onClose();
  };

  const handleResetToPending = () => {
    updateVerificationStatus(record.id, 'Pending Review', 'Re-queued for review committee evaluation.', reviewerName);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Achievement Verification Review"
      subtitle={`Auditing claim for Record ${record.id} • Submitted ${record.submissionDate || 'Recently'}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          {record.verificationStatus !== 'Pending Review' && (
            <Button
              variant="outline"
              icon={RotateCcw}
              onClick={handleResetToPending}
            >
              Reset to Pending
            </Button>
          )}

          <Button
            variant="ghost"
            style={{ color: 'var(--error)' }}
            icon={XCircle}
            onClick={() => {
              setActiveAction('reject');
              setFeedbackNotes('');
              setFeedbackError('');
            }}
          >
            Reject Claim
          </Button>

          <Button
            variant="secondary"
            style={{ color: 'var(--warning)', borderColor: 'var(--warning-border)' }}
            icon={AlertTriangle}
            onClick={() => {
              setActiveAction('correction');
              setFeedbackNotes('');
              setFeedbackError('');
            }}
          >
            Request Correction
          </Button>

          <Button
            variant="primary"
            icon={CheckCircle2}
            onClick={handleVerify}
            style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
          >
            Approve & Verify
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Verification Status Overview Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            background: record.verificationStatus === 'Verified' ? 'var(--success-bg)' : record.verificationStatus === 'Pending Review' ? 'var(--warning-bg)' : 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 10,
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)' }}>
              CURRENT STATUS
            </div>
            <div style={{ marginTop: 2 }}>
              <Badge variant={getStatusBadgeVariant(record.verificationStatus)} dot>
                {record.verificationStatus}
              </Badge>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)' }}>
              CLAIMED ACHIEVEMENT
            </div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {record.achievementLevel}
            </strong>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)' }}>
              CERTIFICATE CODE
            </div>
            <span className="mono" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary-orange)' }}>
              {record.certificateRef || 'N/A'}
            </span>
          </div>
        </div>

        {/* Student & Activity Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>
              <User size={15} />
              <span>STUDENT IDENTITY</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{record.studentName}</div>
            <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              ID: {record.studentRegNo}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--primary-orange)', marginTop: 4 }}>
              {record.studentDepartment}
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>
              <Award size={15} />
              <span>EVENT & DATE</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{record.activityName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Category: <strong style={{ color: 'var(--text-primary)' }}>{record.category}</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              Event Date: {record.participationDate}
            </div>
          </div>
        </div>

        {/* Evidence Inspection Card */}
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
            Attached Evidence Document Preview
          </label>
          <div
            style={{
              padding: '1.5rem',
              borderRadius: 10,
              border: '2px solid var(--border-light)',
              background: 'linear-gradient(135deg, #FFF1E7 0%, #FFFFFF 100%)',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-md)', color: 'var(--primary-orange)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <FileText size={24} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{record.evidenceFilename || 'certificate_proof.pdf'}</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              File Size: {record.evidenceFileSize || '1.2 MB'} • Format: PDF Institutional Certificate
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '0.35rem 0.85rem', background: 'var(--surface-white)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)', fontSize: '0.75rem', color: 'var(--primary-orange)' }}>
              <ShieldCheck size={14} />
              <span>Reference Key: {record.certificateRef || 'CERT-DEMO'}</span>
            </div>

            <div style={{ marginTop: 12, fontSize: '0.74rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              Note: This is a frontend demo preview. Production backend will perform SHA-256 hash validation and cryptographic signature check.
            </div>
          </div>
        </div>

        {/* Action input for Rejection or Correction */}
        {activeAction && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 10,
              background: activeAction === 'reject' ? 'var(--error-bg)' : 'var(--warning-bg)',
              border: `1px solid ${activeAction === 'reject' ? 'var(--error-border)' : 'var(--warning-border)'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: '0.88rem', color: activeAction === 'reject' ? 'var(--error)' : '#92400E' }}>
                {activeAction === 'reject' ? 'Reason for Rejection' : 'Correction Instructions for Student'}
              </strong>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveAction(null)}
              >
                Cancel
              </button>
            </div>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder={
                activeAction === 'reject'
                  ? 'e.g. Uploaded ticket is not an authentic certificate of merit...'
                  : 'e.g. Please re-upload a clear scan with authorized signature visible...'
              }
              value={feedbackNotes}
              onChange={(e) => {
                setFeedbackNotes(e.target.value);
                setFeedbackError('');
              }}
            />
            {feedbackError && <div className="form-error" style={{ marginTop: 4 }}>{feedbackError}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              {activeAction === 'reject' ? (
                <Button variant="destructive" size="sm" onClick={handleReject}>
                  Confirm Rejection
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleRequestCorrection}>
                  Send Correction Request
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Reviewer identity config */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Reviewer Signature / Authority</label>
          <input
            type="text"
            className="form-input"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};
