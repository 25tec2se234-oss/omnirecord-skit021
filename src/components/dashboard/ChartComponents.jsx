import React, { useState } from 'react';

/**
 * Monthly Participation Trends Bar Chart
 */
export const MonthlyTrendChart = ({ records = [] }) => {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Group records by month (from Jan to Jun 2024)
  const months = [
    { key: '2024-01', label: 'Jan' },
    { key: '2024-02', label: 'Feb' },
    { key: '2024-03', label: 'Mar' },
    { key: '2024-04', label: 'Apr' },
    { key: '2024-05', label: 'May' },
    { key: '2024-06', label: 'Jun' }
  ];

  const monthCounts = months.map(m => {
    const count = records.filter(r => (r.participationDate || '').startsWith(m.key)).length;
    return { ...m, count };
  });

  const maxVal = Math.max(...monthCounts.map(m => m.count), 1);

  return (
    <div style={{ width: '100%', height: 220, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
        {monthCounts.map((item, idx) => {
          const heightPercent = Math.max(12, Math.round((item.count / maxVal) * 100));
          const isHovered = hoveredMonth === item.key;

          return (
            <div
              key={idx}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}
              onMouseEnter={() => setHoveredMonth(item.key)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: `${heightPercent + 12}%`,
                    background: 'var(--text-primary)',
                    color: '#fff',
                    padding: '3px 7px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    boxShadow: 'var(--shadow-md)',
                    pointerEvents: 'none'
                  }}
                >
                  {item.count} participation{item.count !== 1 ? 's' : ''}
                </div>
              )}

              {/* Bar */}
              <div
                style={{
                  width: '70%',
                  maxWidth: 36,
                  height: `${heightPercent}%`,
                  background: isHovered
                    ? 'var(--primary-orange-hover)'
                    : 'linear-gradient(180deg, var(--primary-orange) 0%, rgba(249, 115, 22, 0.75) 100%)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 200ms ease',
                  cursor: 'pointer'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Month Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
        {monthCounts.map((m, idx) => (
          <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: hoveredMonth === m.key ? 'var(--primary-orange)' : 'var(--text-secondary)', fontWeight: hoveredMonth === m.key ? 700 : 500 }}>
            {m.label}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Category Breakdown Progress List
 */
export const CategoryBreakdownChart = ({ records = [] }) => {
  const categories = [
    { label: 'Technical', color: '#F97316' },
    { label: 'Research', color: '#2563EB' },
    { label: 'Cultural', color: '#EC4899' },
    { label: 'Sports', color: '#16A34A' },
    { label: 'Workshop', color: '#8B5CF6' },
    { label: 'Volunteering', color: '#06B6D4' },
    { label: 'Extracurricular', color: '#F59E0B' }
  ];

  const total = records.length || 1;

  const data = categories.map(cat => {
    const count = records.filter(r => r.category === cat.label).length;
    const percentage = Math.round((count / total) * 100);
    return { ...cat, count, percentage };
  }).filter(c => c.count > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {data.map((item, idx) => (
        <div key={idx}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong>{item.count}</strong> ({item.percentage}%)
            </span>
          </div>
          <div style={{ height: 7, borderRadius: 4, background: 'var(--surface-muted)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${item.percentage}%`,
                height: '100%',
                backgroundColor: item.color,
                borderRadius: 4,
                transition: 'width 300ms ease'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Department Engagement Horizontal Bar Comparison
 */
export const DepartmentEngagementChart = ({ records = [], departments = [] }) => {
  const maxRecords = Math.max(...departments.map(d => {
    return records.filter(r => r.departmentId === d.id).length;
  }), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {departments.map((dept) => {
        const count = records.filter(r => r.departmentId === dept.id).length;
        const widthPercent = Math.max(8, Math.round((count / maxRecords) * 100));

        return (
          <div key={dept.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 3 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dept.code} ({dept.name})</span>
              <span style={{ color: 'var(--text-secondary)' }}>{count} records</span>
            </div>
            <div style={{ height: 8, background: 'var(--surface-muted)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${widthPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #F97316 0%, #FB923C 100%)',
                  borderRadius: 4,
                  transition: 'width 300ms ease'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Verification Status Ring Chart
 */
export const VerificationStatusRing = ({ records = [] }) => {
  const total = records.length || 1;
  const verified = records.filter(r => r.verificationStatus === 'Verified').length;
  const pending = records.filter(r => r.verificationStatus === 'Pending Review').length;
  const correction = records.filter(r => r.verificationStatus === 'Needs Correction').length;
  const rejected = records.filter(r => r.verificationStatus === 'Rejected').length;

  const verifiedPercent = Math.round((verified / total) * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      {/* Visual Ring Mockup */}
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: `conic-gradient(
            #16A34A 0% ${(verified / total) * 100}%,
            #D97706 ${(verified / total) * 100}% ${((verified + pending) / total) * 100}%,
            #F97316 ${((verified + pending) / total) * 100}% ${((verified + pending + correction) / total) * 100}%,
            #DC2626 ${((verified + pending + correction) / total) * 100}% 100%
          )`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: '50%',
            background: 'var(--surface-white)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {verifiedPercent}%
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: 2 }}>
            Verified
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A' }} />
            <span>Verified</span>
          </span>
          <strong>{verified}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706' }} />
            <span>Pending Review</span>
          </span>
          <strong>{pending}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316' }} />
            <span>Needs Correction</span>
          </span>
          <strong>{correction}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626' }} />
            <span>Rejected</span>
          </span>
          <strong>{rejected}</strong>
        </div>
      </div>
    </div>
  );
};
