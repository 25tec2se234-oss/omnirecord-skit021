import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Award, ShieldCheck, Printer, CheckCircle2 } from 'lucide-react';

export const CertificatePreviewModal = ({ isOpen, onClose, record, student }) => {
  const { institutionInfo } = useApp();

  if (!record || !student) return null;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Certificate Preview"
      subtitle={`Certificate ID: ${record.certificateRef || 'CERT-DEMO'}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            icon={Printer}
            onClick={handlePrintCertificate}
          >
            Print Credential
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Transparency Banner */}
        <div style={{ background: 'var(--orange-50)', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--orange-100)', fontSize: '0.78rem', color: '#9A3412', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Demo Credential:</strong> Generated for frontend prototype testing. Real institutional certificates will embed cryptographic PKI signatures and blockchain anchoring.
          </span>
        </div>

        {/* Certificate Canvas / Card */}
        <div
          id="printable-certificate"
          style={{
            border: '8px double #C2410C',
            background: 'linear-gradient(135deg, #FFFDFB 0%, #FFF7ED 100%)',
            borderRadius: 12,
            padding: '2.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            boxShadow: 'var(--shadow-md)',
            color: '#18181B'
          }}
        >
          {/* Institutional Top Crest */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-orange)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              <Award size={26} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {institutionInfo.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#71717A' }}>
                {institutionInfo.accreditation}
              </div>
            </div>
          </div>

          <div style={{ width: 120, height: 2, background: 'var(--primary-orange)', margin: '0.75rem auto 1.5rem' }} />

          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Certificate of Achievement & Participation
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#18181B', margin: '0.75rem 0 0.5rem' }}>
            This is proudly presented to
          </h2>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary-orange)', letterSpacing: '-0.01em', margin: '0.5rem 0' }}>
            {student.name}
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#4B5563', maxWidth: 580, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Roll No. <strong>{student.studentId}</strong> of <strong>{student.departmentName}</strong> for meritorious participation as <strong>{record.achievementLevel}</strong> in <strong>{record.activityName}</strong> on <strong>{record.participationDate}</strong>.
          </p>

          {/* Bottom Verification & Signatures Bar */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1px solid #FED7AA', paddingTop: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Left signature */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#9A3412', marginBottom: 2 }}>
                {record.reviewerName || 'Dr. Ananya Sharma'}
              </div>
              <div style={{ borderTop: '1px solid #71717A', width: 150, paddingTop: 4, fontSize: '0.74rem', color: '#71717A', fontWeight: 600 }}>
                Faculty Coordinator
              </div>
            </div>

            {/* Center Verified Badge */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: 8, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', border: '2px solid var(--success-border)', marginBottom: 4 }}>
                <CheckCircle2 size={24} />
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase' }}>
                VERIFIED BY INSTITUTION
              </div>
              <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                REF: {record.certificateRef}
              </div>
            </div>

            {/* Right signature */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#9A3412', marginBottom: 2 }}>
                Prof. M. K. Surana
              </div>
              <div style={{ borderTop: '1px solid #71717A', width: 150, paddingTop: 4, fontSize: '0.74rem', color: '#71717A', fontWeight: 600 }}>
                Dean of Student Affairs
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
