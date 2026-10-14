import React from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = "No records found",
  description = "No items match your active filters or search terms. Try adjusting them or clear your criteria.",
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="empty-icon">
        <Icon size={26} />
      </div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-desc">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
