import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const DepartmentFormModal = ({ isOpen, onClose, department = null }) => {
  const { addDepartment, updateDepartment } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    coordinator: '',
    email: '',
    description: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        code: department.code || '',
        coordinator: department.coordinator || '',
        email: department.email || '',
        description: department.description || '',
        status: department.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        code: '',
        coordinator: '',
        email: '',
        description: '',
        status: 'Active'
      });
    }
    setErrors({});
  }, [department, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Department name is required';
    if (!formData.code.trim()) newErrors.code = 'Department code is required (e.g. CSE)';
    if (!formData.coordinator.trim()) newErrors.coordinator = 'Faculty coordinator name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (department) {
      updateDepartment(department.id, formData);
    } else {
      addDepartment(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={department ? "Edit Department" : "Add Academic Department"}
      subtitle="Establish institutional faculties and faculty coordinators"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {department ? "Save Changes" : "Create Department"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Department Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Artificial Intelligence & Data Science"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Department Code <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.code ? 'error' : ''}`}
              placeholder="e.g. AIDS"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
            {errors.code && <div className="form-error">{errors.code}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Faculty Coordinator <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.coordinator ? 'error' : ''}`}
              placeholder="e.g. Dr. Ramesh Gupta"
              value={formData.coordinator}
              onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
            />
            {errors.coordinator && <div className="form-error">{errors.coordinator}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="coordinator@skit.ac.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description / Mandate</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Focus area, research labs, or department notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
};
