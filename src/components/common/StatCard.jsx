import React from 'react';

export const StatCard = ({
  label,
  value,
  icon: Icon,
  colorScheme = 'orange', // 'orange' | 'blue' | 'green' | 'amber'
  trend,
  trendType = 'positive', // 'positive' | 'warning' | 'neutral'
  subtitle,
  onClick
}) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {trend && (
          <span
            className={`stat-trend ${
              typeof trend === 'object' ? trend.direction || trendType : trendType
            }`}
          >
            {typeof trend === 'object' ? trend.label || '' : trend}
          </span>
        )}
        {subtitle && !trend && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            {subtitle}
          </span>
        )}
      </div>

      {Icon && (
        <div className={`stat-icon-wrapper ${colorScheme}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};
