import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { VerificationReviewModal } from './VerificationReviewModal';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ShieldAlert
} from 'lucide-react';

export const VerificationCenter = () => {
  const { records, departments, selectedRecordId, setSelectedRecordId, navigateTo } = useApp();

  const [activeTab, setActiveTab] = useState('Pending Review');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [reviewingRecord, setReviewingRecord] = useState(null);

  // If a recordId was passed in route navigation, automatically open it
  useEffect(() => {
    if (selectedRecordId) {
      const rec = records.find(r => r.id === selectedRecordId);
      if (rec) {
        setReviewingRecord(rec);
        // Switch tab to match the record's status if needed
        if (rec.verificationStatus === 'Pending Review') setActiveTab('Pending Review');
        else if (rec.verificationStatus === 'Needs Correction') setActiveTab('Needs Correction');
      }
      setSelectedRecordId(null);
    }
  }, [selectedRecordId, records, setSelectedRecordId]);

  // Counts
  const pendingCount = records.filter(r => r.verificationStatus === 'Pending Review').length;
  const correctionCount = records.filter(r => r.verificationStatus === 'Needs Correction').length;
  const verifiedCount = records.filter(r => r.verificationStatus === 'Verified').length;
  const rejectedCount = records.filter(r => r.verificationStatus === 'Rejected').length;

  const filteredQueue = useMemo(() => {
    return records.filter((r) => {
      const matchTab = activeTab === 'ALL' || r.verificationStatus === activeTab;

      const matchSearch =
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = selectedDept === 'ALL' || r.departmentId === selectedDept;

      return matchTab && matchSearch && matchDept;
    });
  }, [records, activeTab, searchTerm, selectedDept]);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Verification Center' }]} onNavigate={navigateTo} />

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ShieldCheck size={24} style={{ color: 'var(--primary-orange)' }} />
            Achievement Verification Center
          </h1>
          <p>
            Structured review queue for faculty coordinators to audit student participation evidence, approve merits, or request corrections.
          </p>
        </div>
      </div>

      {/* Security & Scope Limitation Alert */}
      <div
        style={{
          background: 'var(--orange-50)',
          border: '1px solid var(--orange-100)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12
        }}
      >
        <ShieldAlert size={20} style={{ color: 'var(--primary-orange)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.82rem', color: '#9A3412', lineHeight: 1.5 }}>
          <strong>Security Notice (Frontend Demo Scope):</strong> This interface demonstrates the review and approval workflow. All decisions update the simulated frontend state immediately. Real institutional authorization, multi-signature approval rules, and tamper-resistant cryptographic verification will be connected in the future backend.
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div
          className="card"
          style={{ cursor: 'pointer', borderColor: activeTab === 'Pending Review' ? 'var(--primary-orange)' : 'var(--border-light)' }}
          onClick={() => setActiveTab('Pending Review')}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PENDING REVIEW</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)', margin: '4px 0' }}>
            {pendingCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Requires immediate coordinator action</span>
        </div>

        <div
          className="card"
          style={{ cursor: 'pointer', borderColor: activeTab === 'Needs Correction' ? 'var(--primary-orange)' : 'var(--border-light)' }}
          onClick={() => setActiveTab('Needs Correction')}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>NEEDS CORRECTION</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-orange)', margin: '4px 0' }}>
            {correctionCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Feedback sent to students</span>
        </div>

        <div
          className="card"
          style={{ cursor: 'pointer', borderColor: activeTab === 'Verified' ? 'var(--primary-orange)' : 'var(--border-light)' }}
          onClick={() => setActiveTab('Verified')}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>VERIFIED MERITS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', margin: '4px 0' }}>
            {verifiedCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Added to digital transcript</span>
        </div>

        <div
          className="card"
          style={{ cursor: 'pointer', borderColor: activeTab === 'Rejected' ? 'var(--primary-orange)' : 'var(--border-light)' }}
          onClick={() => setActiveTab('Rejected')}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REJECTED CLAIMS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--error)', margin: '4px 0' }}>
            {rejectedCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Ineligible or invalid proofs</span>
        </div>
      </div>

      {/* Main Review Workspace */}
      <div className="table-container">
        {/* Tabs Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 1.25rem', background: 'var(--surface-white)', overflowX: 'auto' }}>
          {[
            { id: 'Pending Review', label: `Pending Queue (${pendingCount})`, icon: Clock },
            { id: 'Needs Correction', label: `Needs Correction (${correctionCount})`, icon: AlertTriangle },
            { id: 'Verified', label: `Verified Merits (${verifiedCount})`, icon: CheckCircle2 },
            { id: 'Rejected', label: `Rejected (${rejectedCount})`, icon: XCircle },
            { id: 'ALL', label: `All Records (${records.length})`, icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`tab-btn ${isActive ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.85rem 1rem' }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="header-search" style={{ width: 280 }}>
            <Search size={16} className="header-search-icon" />
            <input
              type="search"
              placeholder="Search by student, roll no, event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-filters">
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code}
                </option>
              ))}
            </select>

            {(searchTerm || selectedDept !== 'ALL') && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDept('ALL');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Queue Table */}
        <div className="table-wrapper">
          {filteredQueue.length === 0 ? (
            <EmptyState
              title={`No records in "${activeTab}"`}
              description="All submissions for this category have been processed or none match the search."
              actionLabel="View All Submissions"
              onAction={() => setActiveTab('ALL')}
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Submission</th>
                  <th>Student</th>
                  <th>Activity Claimed</th>
                  <th>Achievement Level</th>
                  <th>Evidence Attachment</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Review Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {rec.id}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        {rec.submissionDate || 'Recent'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {rec.studentName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {rec.studentRegNo} • {rec.studentDepartment}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                        {rec.activityName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        Category: {rec.category}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {rec.achievementLevel}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                        <span className="badge badge-neutral">
                          {rec.evidenceFilename || 'Document.pdf'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        Ref: {rec.certificateRef}
                      </div>
                    </td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(rec.verificationStatus)} dot>
                        {rec.verificationStatus}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant={rec.verificationStatus === 'Pending Review' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setReviewingRecord(rec)}
                        icon={ShieldCheck}
                      >
                        {rec.verificationStatus === 'Pending Review' ? 'Inspect & Verify' : 'Re-examine'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <VerificationReviewModal
        isOpen={!!reviewingRecord}
        onClose={() => setReviewingRecord(null)}
        record={reviewingRecord}
      />
    </div>
  );
};
