import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const StudentFormModal = ({ isOpen, onClose, student = null }) => {
  const { departments, addStudent, updateStudent } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    departmentId: '',
    program: '',
    year: '1st Year',
    status: 'Active',
    phone: '',
    cgpa: '8.5',
    bio: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        studentId: student.studentId || '',
        email: student.email || '',
        departmentId: student.departmentId || (departments[0] ? departments[0].id : ''),
        program: student.program || '',
        year: student.year || '1st Year',
        status: student.status || 'Active',
        phone: student.phone || '',
        cgpa: student.cgpa || '8.5',
        bio: student.bio || ''
      });
    } else {
      setFormData({
        name: '',
        studentId: `SKIT-2024-CS${Math.floor(100 + Math.random() * 900)}`,
        email: '',
        departmentId: departments[0] ? departments[0].id : 'DEPT-CSE',
        program: 'B.Tech Computer Science',
        year: '1st Year',
        status: 'Active',
        phone: '+91 98000 00000',
        cgpa: '8.5',
        bio: 'Undergraduate student participating in co-curricular events.'
      });
    }
    setErrors({});
  }, [student, isOpen, departments]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Student full name is required';
    if (!formData.studentId.trim()) newErrors.studentId = 'Roll number / Student ID is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Institutional email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.departmentId) newErrors.departmentId = 'Department selection is required';
    if (!formData.program.trim()) newErrors.program = 'Academic program/degree is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedDept = departments.find(d => d.id === formData.departmentId);
    const departmentName = selectedDept ? selectedDept.name : '';

    const payload = {
      ...formData,
      departmentName
    };

    if (student) {
      updateStudent(student.id, payload);
    } else {
      addStudent(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? "Edit Student Details" : "Register New Student"}
      subtitle="Maintain canonical student identity across participation and verification records"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {student ? "Save Changes" : "Register Student"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Student ID / Roll No. <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.studentId ? 'error' : ''}`}
              placeholder="e.g. SKIT-2023-CS042"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            />
            {errors.studentId && <div className="form-error">{errors.studentId}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Institutional Email <span className="required">*</span>
            </label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="student@skit.ac.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Contact</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+91 98000 00000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Department <span className="required">*</span>
            </label>
            <select
              className={`form-select ${errors.departmentId ? 'error' : ''}`}
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            {errors.departmentId && <div className="form-error">{errors.departmentId}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Program / Degree <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.program ? 'error' : ''}`}
              placeholder="e.g. B.Tech Computer Science"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            />
            {errors.program && <div className="form-error">{errors.program}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Academic Year</label>
            <select
              className="form-select"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Record Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Graduated">Graduated</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Bio / Academic Interests</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Brief notes about competitive interests, clubs, or specializations..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <div style={{ background: 'var(--orange-50)', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--orange-100)', fontSize: '0.76rem', color: '#9A3412' }}>
          <strong>Notice:</strong> In this frontend demo phase, student data is saved into browser localStorage. Production backend integration will interface with campus LDAP / SIS databases.
        </div>
      </form>
    </Modal>
  );
};
