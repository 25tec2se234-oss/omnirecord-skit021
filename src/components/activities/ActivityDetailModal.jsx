import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Award,
  PlusCircle
} from 'lucide-react';

export const ActivityDetailModal = ({ isOpen, onClose, activity, onOpenRecordModal }) => {
  const { records, navigateTo } = useApp();

  if (!activity) return null;

  // Associated participants derived from records
  const participants = records.filter(r => r.activityId === activity.id);
  const verifiedCount = participants.filter(r => r.verificationStatus === 'Verified').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity.name}
      subtitle={`${activity.category} • Hosted by ${activity.departmentName || 'Institutional Department'}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {onOpenRecordModal && (
            <Button
              variant="primary"
              icon={PlusCircle}
              onClick={() => {
                onClose();
                onOpenRecordModal();
              }}
            >
              Log Participant
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Meta Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-light)', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>STATUS</span>
            <div style={{ marginTop: 2 }}>
              <Badge variant={getStatusBadgeVariant(activity.status)} dot>
                {activity.status}
              </Badge>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>DATES</span>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {activity.startDate} {activity.endDate !== activity.startDate ? `to ${activity.endDate}` : ''}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>VENUE / MODE</span>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {activity.venue || 'Campus Grounds'} ({activity.mode})
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>COORDINATOR</span>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary-orange)' }}>
              {activity.coordinator}
            </div>
          </div>
        </div>

        {/* Description */}
        {activity.description && (
          <div style={{ padding: '0.85rem 1rem', background: 'var(--surface-white)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              About the Event
            </strong>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.5 }}>
              {activity.description}
            </p>
          </div>
        )}

        {/* Associated Participants Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} style={{ color: 'var(--primary-orange)' }} />
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Registered Participants ({participants.length})
              </strong>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>
              {verifiedCount} Verified Claims
            </span>
          </div>

          {participants.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px dashed var(--border-light)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              No students have logged participation for this event yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 220, overflowY: 'auto' }}>
              {participants.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--surface-white)',
                    borderRadius: 8,
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.studentName} <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>({p.studentRegNo})</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {p.studentDepartment} • Awarded: <strong>{p.achievementLevel}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge variant={getStatusBadgeVariant(p.verificationStatus)}>
                      {p.verificationStatus}
                    </Badge>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        onClose();
                        navigateTo('profile', { studentId: p.studentId });
                      }}
                      title="View Student Profile"
                    >
                      <Award size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
