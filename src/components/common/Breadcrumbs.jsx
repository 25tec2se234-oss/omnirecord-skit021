import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = ({ items = [], onNavigate }) => {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <button
        type="button"
        className="breadcrumb-item"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        onClick={() => onNavigate && onNavigate('dashboard')}
      >
        <Home size={13} />
        <span>Dashboard</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
            {isLast || !item.route ? (
              <span className="breadcrumb-item active">{item.label}</span>
            ) : (
              <button
                type="button"
                className="breadcrumb-item"
                onClick={() => onNavigate && onNavigate(item.route)}
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
