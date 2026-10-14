import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
  ...props
}) => {
  const variantClass = `badge-${variant}`;

  return (
    <span className={`badge ${variantClass} ${className}`.trim()} {...props}>
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            display: 'inline-block'
          }}
        />
      )}
      {children}
    </span>
  );
};

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'Verified':
    case 'Active':
    case 'Completed':
      return 'success';
    case 'Pending Review':
    case 'Upcoming':
    case 'Ongoing':
      return 'warning';
    case 'Needs Correction':
      return 'orange';
    case 'Rejected':
    case 'Cancelled':
      return 'error';
    case 'Draft':
    default:
      return 'neutral';
  }
};
