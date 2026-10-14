import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import {
  MonthlyTrendChart,
  CategoryBreakdownChart,
  DepartmentEngagementChart,
  VerificationStatusRing
} from './ChartComponents';
import {
  Users,
  FileCheck2,
  Clock,
  CalendarDays,
  PlusCircle,
  ShieldCheck,
  FileDown,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const DashboardOverview = ({ onOpenRecordModal }) => {
  const {
    students,
    records,
    activities,
    departments,
    navigateTo,
    institutionInfo
  } = useApp();

  const pendingRecords = records.filter(r => r.verificationStatus === 'Pending Review');
  const verifiedRecords = records.filter(r => r.verificationStatus === 'Verified');
  const activeActivities = activities.filter(a => a.status === 'Ongoing' || a.status === 'Upcoming');

  const todayStr = useMemo(() => new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date()), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)',
          borderColor: 'var(--orange-100)',
          padding: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="badge badge-orange">
                <Sparkles size={13} />
                Institutional Command Hub
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>• {todayStr}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Good morning, Administrator
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4, maxWidth: 640 }}>
              Here's an overview of student participation, pending verifications, and cross-departmental activities for {institutionInfo.shortName}.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={FileDown}
              onClick={() => navigateTo('analytics')}
            >
              Accreditation Reports
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={onOpenRecordModal}
            >
              Record Participation
            </Button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="stat-card-grid">
        <StatCard
          label="Total Registered Students"
          value={students.length}
          icon={Users}
          colorScheme="blue"
          trend="+14% this semester"
          trendType="positive"
          onClick={() => navigateTo('students')}
        />
        <StatCard
          label="Participation Records"
          value={records.length}
          icon={FileCheck2}
          colorScheme="orange"
          trend={`${verifiedRecords.length} verified`}
          trendType="positive"
          onClick={() => navigateTo('records')}
        />
        <StatCard
          label="Pending Verifications"
          value={pendingRecords.length}
          icon={Clock}
          colorScheme="amber"
          trend={pendingRecords.length > 0 ? "Requires review" : "Queue clear"}
          trendType={pendingRecords.length > 0 ? "warning" : "positive"}
          onClick={() => navigateTo('verification')}
        />
        <StatCard
          label="Active Activities"
          value={activeActivities.length}
          icon={CalendarDays}
          colorScheme="green"
          trend={`${activities.length} total events`}
          trendType="neutral"
          onClick={() => navigateTo('activities')}
        />
      </div>

      {/* Review Alert Notice if pending items */}
      {pendingRecords.length > 0 && (
        <div
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#FDE68A',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#92400E' }}>
                {pendingRecords.length} Participation Submissions Awaiting Coordinator Verification
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#B45309', marginTop: 2 }}>
                Students have uploaded proofs for technical hackathons, research conferences, and sports events.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={ShieldCheck}
            onClick={() => navigateTo('verification')}
            style={{ background: 'var(--warning)', borderColor: 'var(--warning)' }}
          >
            Open Verification Queue
          </Button>
        </div>
      )}

      {/* Charts Grid: Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
        {/* Monthly Trend Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Monthly Participation Trends</h3>
              <p className="card-subtitle">Volume of recorded student achievements (2024)</p>
            </div>
            <span className="badge badge-neutral">H1 2024</span>
          </div>
          <MonthlyTrendChart records={records} />
        </div>

        {/* Verification Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Verification Integrity</h3>
              <p className="card-subtitle">Distribution of review statuses across records</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigateTo('verification')}
            >
              Review
            </Button>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            <VerificationStatusRing records={records} />
          </div>
        </div>
      </div>

      {/* Charts Grid: Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Participation by Category</h3>
              <p className="card-subtitle">Activity distribution across campus domains</p>
            </div>
            <span className="badge badge-orange">{records.length} total</span>
          </div>
          <CategoryBreakdownChart records={records} />
        </div>

        {/* Department Engagement */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Department Engagement</h3>
              <p className="card-subtitle">Participation volume by engineering & management branches</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigateTo('departments')}
            >
              All Depts
            </Button>
          </div>
          <DepartmentEngagementChart records={records} departments={departments} />
        </div>
      </div>

      {/* Recent Participation Activity Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <h3 className="card-title">Recent Participation Submissions</h3>
            <p className="card-subtitle">Latest achievements logged by students across departments</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigateTo('records')}
          >
            View All Records
          </Button>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Student</th>
                <th>Activity / Event</th>
                <th>Category</th>
                <th>Achievement</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 6).map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {rec.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        type="button"
                        style={{ textAlign: 'left', fontWeight: 600, color: 'var(--primary-orange)' }}
                        onClick={() => navigateTo('profile', { studentId: rec.studentId })}
                        title="View student profile"
                      >
                        {rec.studentName}
                      </button>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        {rec.studentRegNo}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                      {rec.activityName}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{rec.category}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rec.achievementLevel}
                    </span>
                  </td>
                  <td>
                    <Badge variant={getStatusBadgeVariant(rec.verificationStatus)} dot>
                      {rec.verificationStatus}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (rec.verificationStatus === 'Pending Review' || rec.verificationStatus === 'Needs Correction') {
                          navigateTo('verification', { recordId: rec.id });
                        } else {
                          navigateTo('profile', { studentId: rec.studentId });
                        }
                      }}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
