import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const ActivityFormModal = ({ isOpen, onClose, activity = null }) => {
  const { departments, addActivity, updateActivity } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Technical',
    description: '',
    departmentId: '',
    startDate: '',
    endDate: '',
    venue: '',
    mode: 'In-Person',
    coordinator: '',
    status: 'Upcoming',
    maxParticipants: 100
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name || '',
        category: activity.category || 'Technical',
        description: activity.description || '',
        departmentId: activity.departmentId || (departments[0] ? departments[0].id : ''),
        startDate: activity.startDate || '',
        endDate: activity.endDate || '',
        venue: activity.venue || '',
        mode: activity.mode || 'In-Person',
        coordinator: activity.coordinator || '',
        status: activity.status || 'Upcoming',
        maxParticipants: activity.maxParticipants || 100
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        name: '',
        category: 'Technical',
        description: '',
        departmentId: departments[0] ? departments[0].id : 'DEPT-CSE',
        startDate: today,
        endDate: today,
        venue: 'Campus Innovation Center',
        mode: 'In-Person',
        coordinator: departments[0] ? departments[0].coordinator : 'Faculty Coordinator',
        status: 'Upcoming',
        maxParticipants: 100
      });
    }
    setErrors({});
  }, [activity, isOpen, departments]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Activity name is required';
    if (!formData.departmentId) newErrors.departmentId = 'Host department is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date cannot be earlier than start date';
      }
    }

    if (!formData.coordinator.trim()) newErrors.coordinator = 'Faculty coordinator name is required';
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

    if (activity) {
      updateActivity(activity.id, payload);
    } else {
      addActivity(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? "Edit Institutional Activity" : "Create Institutional Activity"}
      subtitle="Publish an academic competition, hackathon, workshop, or sports championship"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {activity ? "Save Activity" : "Create Activity"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Activity / Event Name <span className="required">*</span>
          </label>
          <input
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="e.g. National Autonomous Robotics Challenge 2024"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Technical">Technical</option>
              <option value="Research">Research</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Workshop">Workshop</option>
              <option value="Innovation">Innovation</option>
              <option value="Volunteering">Volunteering</option>
              <option value="Extracurricular">Extracurricular</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Host Department <span className="required">*</span>
            </label>
            <select
              className={`form-select ${errors.departmentId ? 'error' : ''}`}
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            >
              <option value="">Select Host Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            {errors.departmentId && <div className="form-error">{errors.departmentId}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Start Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className={`form-input ${errors.startDate ? 'error' : ''}`}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            {errors.startDate && <div className="form-error">{errors.startDate}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              End Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className={`form-input ${errors.endDate ? 'error' : ''}`}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            {errors.endDate && <div className="form-error">{errors.endDate}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Venue / Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Main Auditorium / Lab 3"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Mode</label>
            <select
              className="form-select"
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
            >
              <option value="In-Person">In-Person</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Virtual">Virtual</option>
            </select>
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
              placeholder="e.g. Dr. Ananya Sharma"
              value={formData.coordinator}
              onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
            />
            {errors.coordinator && <div className="form-error">{errors.coordinator}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description & Eligibility</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Brief scope of the event, eligibility criteria, and deliverables..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
};
