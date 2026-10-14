import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  FileCheck2,
  Search,
  Filter,
  Eye,
  FileText,
  Calendar,
  MapPin,
  Building,
  Check,
  X,
  RefreshCw,
  Award
} from 'lucide-react';

export const OrganiserPortal = () => {
  const {
    activities,
    records,
    students,
    departments,
    currentUser,
    addActivity,
    updateVerificationStatus,
    navigateTo
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'events' | 'review'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

  // Review modal state
  const [selectedRecordForReview, setSelectedRecordForReview] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('Verified');
  const [reviewNotes, setReviewNotes] = useState('');

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    name: '',
    category: 'Technical',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    venue: 'Main Campus Auditorium',
    departmentId: departments[0]?.id || 'DEPT-CSE',
    maxParticipants: 100,
    description: ''
  });

  // Filter events relevant to coordinator
  const assignedEvents = activities;
  const pendingReviewRecords = records.filter(
    (r) => r.verificationStatus === 'Pending Review' || r.verificationStatus === 'Needs Correction'
  );
  const verifiedRecords = records.filter((r) => r.verificationStatus === 'Verified');

  // Filtered Review Queue
  const filteredReviewQueue = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.activityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.recordNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PENDING' && r.verificationStatus === 'Pending Review') ||
        (statusFilter === 'CORRECTION' && r.verificationStatus === 'Needs Correction') ||
        (statusFilter === 'VERIFIED' && r.verificationStatus === 'Verified') ||
        (statusFilter === 'REJECTED' && r.verificationStatus === 'Rejected');

      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    await addActivity({
      ...newEvent,
      code: `ACT-${Date.now().toString().slice(-3)}`,
      status: 'Upcoming'
    });
    setIsCreateEventModalOpen(false);
    setNewEvent({
      name: '',
      category: 'Technical',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      venue: 'Main Campus Auditorium',
      departmentId: departments[0]?.id || 'DEPT-CSE',
      maxParticipants: 100,
      description: ''
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecordForReview) return;

    await updateVerificationStatus(
      selectedRecordForReview.id || selectedRecordForReview.recordNumber,
      reviewDecision,
      reviewNotes,
      currentUser?.fullName || currentUser?.name || 'Faculty Coordinator'
    );

    setSelectedRecordForReview(null);
    setReviewNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Organiser Header */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)',
          borderColor: 'rgba(59, 130, 246, 0.25)',
          padding: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.25rem 0.65rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-full)', color: '#2563eb', fontSize: '0.76rem', fontWeight: 700, marginBottom: 8 }}>
              <CalendarDays size={14} />
              EVENT ORGANISER & FACULTY WORKSPACE
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Welcome, {currentUser?.fullName || currentUser?.name || 'Faculty Coordinator'}
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
              Manage assigned campus activities, monitor participant rosters, and verify student evidence credentials.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => setIsCreateEventModalOpen(true)}
            >
              Create New Event
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={FileCheck2}
              onClick={() => setActiveTab('review')}
            >
              Review Queue ({pendingReviewRecords.length})
            </Button>
          </div>
        </div>

        {/* Portal Sub-Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginTop: '1.5rem', borderTop: '1px solid rgba(59, 130, 246, 0.15)', paddingTop: '1rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('overview')}
          >
            Dashboard Overview
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'events' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('events')}
          >
            My Events ({assignedEvents.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'review' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('review')}
          >
            Verification Queue ({pendingReviewRecords.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Assigned Events"
              value={assignedEvents.length}
              icon={CalendarDays}
              subtitle="Active campus activities"
            />
            <StatCard
              title="Total Participants"
              value={records.length}
              icon={Users}
              subtitle="Registered students"
            />
            <StatCard
              title="Pending Reviews"
              value={pendingReviewRecords.length}
              icon={Clock}
              trend="Action required"
              trendType="warning"
            />
            <StatCard
              title="Verified Achievements"
              value={verifiedRecords.length}
              icon={CheckCircle2}
              subtitle="Authenticated credentials"
            />
          </div>

          {/* Dual Panel: Active Events & Urgent Submissions */}
          <div className="grid grid-cols-2 gap-6">
            {/* Active Events */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Upcoming & Active Events</h3>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTab('events')}
                  style={{ color: 'var(--primary-orange)', fontSize: '0.78rem' }}
                >
                  View All →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {assignedEvents.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {event.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {event.startDate} • {event.venue || 'Campus Auditorium'} • {event.category}
                      </div>
                    </div>
                    <Badge variant={event.status === 'Ongoing' ? 'success' : 'info'}>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Submissions Awaiting Coordinator Review */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Submissions Awaiting Review</h3>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTab('review')}
                  style={{ color: 'var(--primary-orange)', fontSize: '0.78rem' }}
                >
                  Open Queue →
                </button>
              </div>

              {pendingReviewRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={32} style={{ color: 'var(--success)', margin: '0 auto 8px' }} />
                  Verification queue is completely clear!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pendingReviewRecords.slice(0, 4).map((rec) => (
                    <div
                      key={rec.id || rec.recordNumber}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--surface-white)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                          {rec.studentName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          {rec.activityName} • {rec.achievementLevel}
                        </div>
                      </div>

                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => {
                          setSelectedRecordForReview(rec);
                          setActiveTab('review');
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: MY EVENTS */}
      {activeTab === 'events' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Assigned Institutional Events</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                All campus activities, competitions, and conferences under your supervision
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => setIsCreateEventModalOpen(true)}
            >
              Add New Event
            </Button>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Category</th>
                  <th>Timeline</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedEvents.map((act) => {
                  const participantCount = records.filter(
                    (r) => r.activityId === act.id || r.activityName === act.name
                  ).length;

                  return (
                    <tr key={act.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{act.id || act.code}</div>
                      </td>
                      <td>
                        <Badge variant="neutral">{act.category}</Badge>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {act.startDate} to {act.endDate}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {act.venue || 'Campus Auditorium'}
                      </td>
                      <td>
                        <Badge variant={act.status === 'Ongoing' ? 'success' : act.status === 'Upcoming' ? 'info' : 'neutral'}>
                          {act.status}
                        </Badge>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {participantCount} students
                      </td>
                      <td>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            setSearchQuery(act.name);
                            setActiveTab('review');
                          }}
                        >
                          View Submissions
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFICATION QUEUE */}
      {activeTab === 'review' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Participation Evidence Verification Queue
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Examine uploaded certificates, verify participation hours, and issue decisions
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 220 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Filter student or event..."
                  className="form-control"
                  style={{ paddingLeft: 32, fontSize: '0.82rem', height: 34 }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-control"
                style={{ fontSize: '0.82rem', height: 34 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="CORRECTION">Needs Correction</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Student</th>
                  <th>Activity / Event</th>
                  <th>Achievement Level</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviewQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                      No participation submissions matched the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredReviewQueue.map((rec) => (
                    <tr key={rec.id || rec.recordNumber}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600 }}>
                          {rec.recordNumber || rec.id}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.studentName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{rec.studentRegNo || rec.studentId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{rec.activityName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{rec.category}</div>
                      </td>
                      <td>
                        <Badge variant="neutral">{rec.achievementLevel || 'Participant'}</Badge>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {rec.submissionDate || rec.createdAt?.split('T')[0] || 'Recent'}
                      </td>
                      <td>
                        <Badge variant={getStatusBadgeVariant(rec.verificationStatus)}>
                          {rec.verificationStatus}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => setSelectedRecordForReview(rec)}
                        >
                          Review Evidence
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedRecordForReview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setSelectedRecordForReview(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 550,
              background: 'var(--surface-white)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              padding: '1.75rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Verification Review: {selectedRecordForReview.recordNumber || selectedRecordForReview.id}
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setSelectedRecordForReview(null)}
              >
                ✕
              </button>
            </div>

            {/* Submission Detail Cards */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
                fontSize: '0.84rem'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Student:</span>
                  <div style={{ fontWeight: 600 }}>{selectedRecordForReview.studentName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Activity:</span>
                  <div style={{ fontWeight: 600 }}>{selectedRecordForReview.activityName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Achievement:</span>
                  <div style={{ fontWeight: 600 }}>{selectedRecordForReview.achievementLevel}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Certificate Ref:</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {selectedRecordForReview.certificateRef || 'CERT-DEMO-VALIDATED'}
                  </div>
                </div>
              </div>

              {/* Evidence File Box */}
              <div
                style={{
                  marginTop: '0.85rem',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--surface-white)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} style={{ color: 'var(--primary-orange)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    Official Certificate / Evidence PDF
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  Size: {selectedRecordForReview.evidenceFileSize || '1.2 MB'}
                </span>
              </div>
            </div>

            {/* Review Decision Form */}
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
                  Review Decision
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${reviewDecision === 'Verified' ? 'btn-success' : 'btn-outline'}`}
                    onClick={() => setReviewDecision('Verified')}
                  >
                    ✓ Verified
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${reviewDecision === 'Needs Correction' ? 'btn-warning' : 'btn-outline'}`}
                    onClick={() => setReviewDecision('Needs Correction')}
                  >
                    ⚠ Correction
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${reviewDecision === 'Rejected' ? 'btn-danger' : 'btn-outline'}`}
                    onClick={() => setReviewDecision('Rejected')}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
                  Reviewer Notes / Instructions {reviewDecision !== 'Verified' && <span style={{ color: 'var(--error)' }}>*</span>}
                </label>
                <textarea
                  required={reviewDecision !== 'Verified'}
                  rows={3}
                  className="form-control"
                  style={{ fontSize: '0.84rem' }}
                  placeholder={
                    reviewDecision === 'Verified'
                      ? 'Optional institutional note or accreditation comments...'
                      : 'Specific correction instructions or reason for rejection...'
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecordForReview(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Submit Institutional Decision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {isCreateEventModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsCreateEventModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 500,
              background: 'var(--surface-white)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              padding: '1.75rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Create Institutional Campus Event
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setIsCreateEventModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Hackathon 2025"
                  className="form-control"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                    Category
                  </label>
                  <select
                    className="form-control"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Social / Community">Social / Community</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                    Host Department
                  </label>
                  <select
                    className="form-control"
                    value={newEvent.departmentId}
                    onChange={(e) => setNewEvent({ ...newEvent, departmentId: e.target.value })}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                  Venue / Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auditorium Hall B or Online (Zoom)"
                  className="form-control"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                  Description & Eligibility
                </label>
                <textarea
                  rows={2}
                  className="form-control"
                  placeholder="Outline participation rules and student criteria..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <Button variant="ghost" size="sm" onClick={() => setIsCreateEventModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Publish Campus Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
