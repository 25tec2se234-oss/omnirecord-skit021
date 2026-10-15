import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Upload, FileText, AlertTriangle, X } from 'lucide-react';

export const RecordFormModal = ({ isOpen, onClose, record = null }) => {
  const { students, activities, records, addRecord, updateRecord } = useApp();

  const [formData, setFormData] = useState({
    studentId: '',
    activityId: '',
    category: 'Technical',
    achievementLevel: 'Participant',
    participationDate: '',
    certificateRef: '',
    evidenceFilename: '',
    evidenceFileSize: '',
    verificationStatus: 'Pending Review',
    description: '',
    reviewerNotes: ''
  });

  const [simulatedFile, setSimulatedFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record) {
      setFormData({
        studentId: record.studentId || '',
        activityId: record.activityId || '',
        category: record.category || 'Technical',
        achievementLevel: record.achievementLevel || 'Participant',
        participationDate: record.participationDate || '',
        certificateRef: record.certificateRef || '',
        evidenceFilename: record.evidenceFilename || '',
        evidenceFileSize: record.evidenceFileSize || '',
        verificationStatus: record.verificationStatus || 'Pending Review',
        description: record.description || '',
        reviewerNotes: record.reviewerNotes || ''
      });
      setSimulatedFile(record.evidenceFilename ? { name: record.evidenceFilename, size: record.evidenceFileSize || '1.2 MB' } : null);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        studentId: students[0] ? students[0].id : '',
        activityId: activities[0] ? activities[0].id : '',
        category: activities[0] ? activities[0].category : 'Technical',
        achievementLevel: 'Participant',
        participationDate: today,
        certificateRef: `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
        evidenceFilename: 'achievement_evidence.pdf',
        evidenceFileSize: '1.2 MB',
        verificationStatus: 'Pending Review',
        description: '',
        reviewerNotes: ''
      });
      setSimulatedFile({ name: 'achievement_evidence.pdf', size: '1.2 MB' });
    }
    setErrors({});
  }, [record, isOpen, students, activities]);

  // When activity changes, automatically update the category if available
  const handleActivityChange = (actId) => {
    const act = activities.find(a => a.id === actId);
    setFormData(prev => ({
      ...prev,
      activityId: actId,
      category: act ? act.category : prev.category
    }));
  };

  const handleSimulateUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      setSimulatedFile({ name: file.name, size: sizeStr, fileObject: file });
      setFormData(prev => ({
        ...prev,
        evidenceFilename: file.name,
        evidenceFileSize: sizeStr
      }));
    }
  };

  const duplicateRecord = useMemo(() => {
    if (!formData.studentId || !formData.activityId) return null;
    return records.find(
      (r) =>
        r.studentId === formData.studentId &&
        r.activityId === formData.activityId &&
        (!record || r.id !== record.id)
    );
  }, [records, formData.studentId, formData.activityId, record]);

  const validate = () => {
    const newErrors = {};
    if (!formData.studentId) newErrors.studentId = 'Student selection is required';
    if (!formData.activityId) newErrors.activityId = 'Activity/event is required';
    if (!formData.participationDate) newErrors.participationDate = 'Participation date is required';
    if (!formData.evidenceFilename) newErrors.evidenceFilename = 'Evidence attachment metadata is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const studentObj = students.find(s => s.id === formData.studentId);
    const actObj = activities.find(a => a.id === formData.activityId);

    const payload = {
      ...formData,
      file: simulatedFile?.fileObject,
      studentName: studentObj ? studentObj.name : 'Unknown Student',
      studentRegNo: studentObj ? studentObj.studentId : '',
      studentDepartment: studentObj ? studentObj.departmentName : '',
      departmentId: studentObj ? studentObj.departmentId : 'DEPT-CSE',
      activityName: actObj ? actObj.name : 'Unknown Activity'
    };

    if (record) {
      updateRecord(record.id, payload);
    } else {
      addRecord(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? "Edit Participation Record" : "Log Student Participation"}
      subtitle="Record extracurricular or co-curricular participation and upload evidence metadata"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {record ? "Save Record" : "Submit for Verification"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Student <span className="required">*</span>
            </label>
            <select
              className={`form-select ${errors.studentId ? 'error' : ''}`}
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            >
              <option value="">Select Enrolled Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentId} • {s.departmentName})
                </option>
              ))}
            </select>
            {errors.studentId && <div className="form-error">{errors.studentId}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Activity / Event <span className="required">*</span>
            </label>
            <select
              className={`form-select ${errors.activityId ? 'error' : ''}`}
              value={formData.activityId}
              onChange={(e) => handleActivityChange(e.target.value)}
            >
              <option value="">Select Institutional Activity</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category})
                </option>
              ))}
            </select>
            {errors.activityId && <div className="form-error">{errors.activityId}</div>}
          </div>
        </div>

        {duplicateRecord && (
          <div
            style={{
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 8,
              padding: '0.65rem 0.85rem',
              fontSize: '0.78rem',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: '1rem'
            }}
          >
            <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <span>
              <strong>Duplicate Record Notice:</strong> A participation record (<strong>{duplicateRecord.id}</strong> • <em>{duplicateRecord.achievementLevel}</em>) is already registered for this student and activity.
            </span>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Activity Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Technical">Technical (Hackathons / Coding)</option>
              <option value="Research">Research & Conferences</option>
              <option value="Cultural">Cultural & Performing Arts</option>
              <option value="Sports">Sports & Athletics</option>
              <option value="Workshop">Workshop & Training</option>
              <option value="Innovation">Innovation & Entrepreneurship</option>
              <option value="Volunteering">Volunteering & Community</option>
              <option value="Extracurricular">Extracurricular & Debates</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Achievement Level</label>
            <select
              className="form-select"
              value={formData.achievementLevel}
              onChange={(e) => setFormData({ ...formData, achievementLevel: e.target.value })}
            >
              <option value="Participant">Participant</option>
              <option value="Finalist">Finalist</option>
              <option value="Winner">Winner (1st Place)</option>
              <option value="Runner-up">Runner-up (2nd / 3rd Place)</option>
              <option value="Recognition">Special Recognition / Merit</option>
              <option value="Organizer">Organizer / Student Lead</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Participation Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className={`form-input ${errors.participationDate ? 'error' : ''}`}
              value={formData.participationDate}
              onChange={(e) => setFormData({ ...formData, participationDate: e.target.value })}
            />
            {errors.participationDate && <div className="form-error">{errors.participationDate}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Certificate Reference Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CERT-SIH24-089"
              value={formData.certificateRef}
              onChange={(e) => setFormData({ ...formData, certificateRef: e.target.value })}
            />
          </div>
        </div>

        {/* Evidence Attachment Simulation */}
        <div className="form-group">
          <label className="form-label">
            Certificate or Evidence Attachment <span className="required">*</span>
          </label>
          <div
            style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              position: 'relative'
            }}
          >
            {simulatedFile ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-white)', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--soft-orange)', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{simulatedFile.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>{simulatedFile.size} • Attached (Demo)</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => {
                    setSimulatedFile(null);
                    setFormData(prev => ({ ...prev, evidenceFilename: '', evidenceFileSize: '' }));
                  }}
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <Upload size={28} style={{ color: 'var(--text-tertiary)', margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Upload Credential Proof (PDF, PNG, JPG)
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Maximum file size: 10MB. Document will be presented in verification queue.
                </p>
                <label className="btn btn-secondary btn-sm" style={{ marginTop: 10, display: 'inline-flex', cursor: 'pointer' }}>
                  <span>Select File</span>
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleSimulateUpload}
                  />
                </label>
              </div>
            )}
          </div>
          {errors.evidenceFilename && <div className="form-error">{errors.evidenceFilename}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Achievement Notes & Synopsis</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Details regarding project title, team members, or specific merit..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Demo transparency note */}
        <div style={{ background: 'var(--orange-50)', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--orange-100)', fontSize: '0.76rem', color: '#9A3412' }}>
          <strong>Demo Notice:</strong> Files selected are simulated in memory for this frontend prototype. They will immediately route to the Verification Center queue for review.
        </div>
      </form>
    </Modal>
  );
};
