import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  CheckCheck,
  ShieldCheck
} from 'lucide-react';

export const NotificationsCenter = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, navigateTo } = useApp();

  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />;
      case 'info':
      default:
        return <Info size={18} style={{ color: 'var(--info)' }} />;
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Notifications' }]} onNavigate={navigateTo} />

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Bell size={24} style={{ color: 'var(--primary-orange)' }} />
            Institutional Notifications Center
          </h1>
          <p>
            Real-time activity alerts on student submissions, verification approvals, and accreditation reporting notices.
          </p>
        </div>

        <div className="page-actions">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              icon={CheckCheck}
              onClick={markAllNotificationsAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Scope Disclaimer */}
      <div style={{ background: 'var(--orange-50)', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid var(--orange-100)', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#9A3412', display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldCheck size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Transparency Notice:</strong> Alerts are simulated for frontend demonstration. Institutional SMS and automated email dispatches will be configured with campus SMTP servers in the production backend.
        </span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filter bar */}
        <div style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('ALL')}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'UNREAD' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('UNREAD')}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            Click an alert to navigate to the relevant workflow
          </span>
        </div>

        {/* Notifications list */}
        {filteredNotifs.length === 0 ? (
          <EmptyState
            title={filter === 'UNREAD' ? "No unread alerts" : "No notifications"}
            description="You are completely caught up with institutional activity."
          />
        ) : (
          <div>
            {filteredNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationAsRead(n.id);
                  if (n.targetPage) {
                    navigateTo(n.targetPage, { recordId: n.recordId });
                  }
                }}
                style={{
                  padding: '1.1rem 1.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: n.read ? 'var(--surface-white)' : 'var(--orange-50)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'background 150ms'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ marginTop: 2 }}>{getNotifIcon(n.type)}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {n.title}
                      </strong>
                      {!n.read && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-orange)', display: 'inline-block' }} />
                      )}
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.45 }}>
                      {n.message}
                    </p>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      <span>{n.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary-orange)', fontWeight: 600 }}>
                    Inspect
                  </span>
                  <ArrowRight size={14} style={{ color: 'var(--primary-orange)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
