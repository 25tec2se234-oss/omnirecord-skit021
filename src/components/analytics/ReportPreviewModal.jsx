import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Printer, Download, FileText, CheckCircle2 } from 'lucide-react';

export const ReportPreviewModal = ({ isOpen, onClose, filteredRecords, filterSummary }) => {
  const { institutionInfo, departments } = useApp();

  if (!isOpen) return null;

  const todayStr = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium'
  }).format(new Date());

  const verifiedCount = filteredRecords.filter(r => r.verificationStatus === 'Verified').length;
  const pendingCount = filteredRecords.filter(r => r.verificationStatus === 'Pending Review').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Institutional Accreditation Report Preview"
      subtitle="NAAC Criteria 5 & NBA Student Participation Audit Format"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            icon={Printer}
            onClick={handlePrint}
          >
            Print Executive Report
          </Button>
        </>
      }
    >
      <div id="printable-report" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#18181B' }}>
        {/* Institutional Header */}
        <div style={{ borderBottom: '2px solid var(--primary-orange)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#9A3412', textTransform: 'uppercase' }}>
              {institutionInfo.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {institutionInfo.accreditation} • Office of Dean (Student Affairs)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
              Document ID: SKIT-REPORT-{new Date().getFullYear()}-AUDIT
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>Generated on:</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{todayStr}</div>
          </div>
        </div>

        {/* Filter Context Parameters */}
        <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.82rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div><strong>Active Department:</strong> {filterSummary.department}</div>
          <div><strong>Category Filter:</strong> {filterSummary.category}</div>
          <div><strong>Academic Year:</strong> {filterSummary.academicYear}</div>
          <div><strong>Timeframe:</strong> {filterSummary.dateRange}</div>
        </div>

        {/* Executive Summary Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
          <div style={{ padding: '0.85rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Filtered Entries</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{filteredRecords.length}</div>
          </div>
          <div style={{ padding: '0.85rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Verified Records</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: 2 }}>{verifiedCount}</div>
          </div>
          <div style={{ padding: '0.85rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pending Review</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning)', marginTop: 2 }}>{pendingCount}</div>
          </div>
          <div style={{ padding: '0.85rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Verification Rate</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-orange)', marginTop: 2 }}>
              {filteredRecords.length > 0 ? Math.round((verifiedCount / filteredRecords.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Tabular Records Summary */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Detailed Records Roster ({filteredRecords.length} items)
          </h4>
          <table className="data-table" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Activity / Event</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  <td><strong>{r.studentName}</strong></td>
                  <td className="mono">{r.studentRegNo}</td>
                  <td>{r.activityName}</td>
                  <td>{r.category}</td>
                  <td>{r.participationDate}</td>
                  <td>{r.verificationStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Institutional Sign-off Block */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #D1D5DB', paddingTop: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 160, borderBottom: '1px solid #000', marginBottom: 4 }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Prepared By (Faculty In-Charge)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 160, borderBottom: '1px solid #000', marginBottom: 4 }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Verified By (Head of Department)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 160, borderBottom: '1px solid #000', marginBottom: 4 }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Approved (Dean of Academic Affairs)</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
