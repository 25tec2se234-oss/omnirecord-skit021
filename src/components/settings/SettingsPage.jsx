import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Settings,
  Building2,
  Database,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const SettingsPage = () => {
  const {
    institutionInfo,
    resetDemoData,
    restartProductTour,
    students,
    records,
    activities,
    departments,
    navigateTo,
    addToast
  } = useApp();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [instSettings, setInstSettings] = useState({
    name: institutionInfo.name,
    shortName: institutionInfo.shortName,
    accreditation: institutionInfo.accreditation,
    adminName: institutionInfo.adminName,
    adminEmail: institutionInfo.adminEmail,
    academicYear: institutionInfo.academicYear
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    addToast({
      title: "Settings Saved",
      message: "Institutional configuration updated in demo memory.",
      type: "success"
    });
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setIsResetConfirmOpen(false);
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Settings' }]} onNavigate={navigateTo} />

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Settings size={24} style={{ color: 'var(--primary-orange)' }} />
            Institutional Settings & Demo Controls
          </h1>
          <p>
            Configure institutional profile metadata, manage browser local demo storage, and inspect future backend roadmap.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Institutional Profile Settings */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Institutional Identity</h3>
              <p className="card-subtitle">Official university title and accreditation parameters</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Institution Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={instSettings.name}
                  onChange={(e) => setInstSettings({ ...instSettings, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Abbreviation / Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={instSettings.shortName}
                  onChange={(e) => setInstSettings({ ...instSettings, shortName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Accreditation Affiliation</label>
                <input
                  type="text"
                  className="form-input"
                  value={instSettings.accreditation}
                  onChange={(e) => setInstSettings({ ...instSettings, accreditation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Active Academic Year</label>
                <input
                  type="text"
                  className="form-input"
                  value={instSettings.academicYear}
                  onChange={(e) => setInstSettings({ ...instSettings, academicYear: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Administrator In-Charge</label>
                <input
                  type="text"
                  className="form-input"
                  value={instSettings.adminName}
                  onChange={(e) => setInstSettings({ ...instSettings, adminName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Admin Notification Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={instSettings.adminEmail}
                  onChange={(e) => setInstSettings({ ...instSettings, adminEmail: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button type="submit" variant="primary">
                Update Identity
              </Button>
            </div>
          </form>
        </div>

        {/* Demo State & Browser Storage Management */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Demo State & Storage Management</h3>
              <p className="card-subtitle">Manage browser-isolated mock records and restore initial state</p>
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 10, marginBottom: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Students</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{students.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Activities</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{activities.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Records</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{records.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Departments</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{departments.length}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Reset Demo Dataset</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Clears any newly added demo records and restores the pristine sample dataset.
              </p>
            </div>
            <Button
              variant="destructive"
              icon={RotateCcw}
              onClick={() => setIsResetConfirmOpen(true)}
            >
              Reset to Initial Sample Data
            </Button>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '1.25rem', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Product Onboarding Tour</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Re-launch the 6-step guided walkthrough explaining product features.
              </p>
            </div>
            <Button
              variant="secondary"
              icon={HelpCircle}
              onClick={restartProductTour}
            >
              Restart Product Tour
            </Button>
          </div>
        </div>

        {/* Backend Transition Roadmap */}
        <div className="card" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
            <Layers size={18} style={{ color: 'var(--primary-orange)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Future Backend Architecture Roadmap</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            This frontend is architected with modular service contracts so that actual institutional backend microservices can be attached without rewriting UI components:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
            <div style={{ background: '#fff', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E5E7EB' }}>
              <strong>1. SAML 2.0 / OAuth2 SSO:</strong> Integration with institutional Active Directory and student portals.
            </div>
            <div style={{ background: '#fff', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E5E7EB' }}>
              <strong>2. S3 / Cloud Storage:</strong> SHA-256 evidence hashing and virus scanning on document upload.
            </div>
            <div style={{ background: '#fff', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E5E7EB' }}>
              <strong>3. Cryptographic Verification:</strong> Verifiable digital signatures and public verification portal with QR code.
            </div>
            <div style={{ background: '#fff', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E5E7EB' }}>
              <strong>4. Relational PostgreSQL:</strong> Institutional multi-tenant database supporting 50,000+ students.
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Demo Data"
        message="This will clear all changes made during this browser session and restore the initial mock dataset (students, activities, verification queue, and departments)."
        confirmLabel="Reset Everything"
      />
    </div>
  );
};
