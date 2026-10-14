import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ActivityFormModal } from './ActivityFormModal';
import { ActivityDetailModal } from './ActivityDetailModal';
import {
  CalendarDays,
  PlusCircle,
  Search,
  Filter,
  LayoutGrid,
  List,
  Eye,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Calendar,
  Clock,
  ArrowUpDown
} from 'lucide-react';

export const ActivityManagement = ({ onOpenRecordModal }) => {
  const { activities, records, departments, deleteActivity, navigateTo } = useApp();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [inspectingActivity, setInspectingActivity] = useState(null);
  const [activityToDelete, setActivityToDelete] = useState(null);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchSearch =
        act.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (act.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (act.coordinator || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = selectedCategory === 'ALL' || act.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || act.status === selectedStatus;

      return matchSearch && matchCat && matchStatus;
    });
  }, [activities, searchTerm, selectedCategory, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingActivity(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (act) => {
    setEditingActivity(act);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (activityToDelete) {
      deleteActivity(activityToDelete.id);
      setActivityToDelete(null);
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Activities & Events' }]} onNavigate={navigateTo} />

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <CalendarDays size={24} style={{ color: 'var(--primary-orange)' }} />
            Activities & Institutional Events
          </h1>
          <p>
            Catalog official hackathons, conferences, athletic championships, workshops, and community volunteering drives.
          </p>
        </div>

        <div className="page-actions">
          {/* View Mode Toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: 2 }}>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.35rem 0.65rem' }}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.35rem 0.65rem' }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>

          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={handleOpenAdd}
          >
            Create Activity
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        <div className="table-toolbar">
          <div className="header-search" style={{ width: 280 }}>
            <Search size={16} className="header-search-icon" />
            <input
              type="search"
              placeholder="Search activity name, coordinator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-filters">
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Research">Research</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Workshop">Workshop</option>
              <option value="Innovation">Innovation</option>
              <option value="Volunteering">Volunteering</option>
              <option value="Extracurricular">Extracurricular</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {(searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Rendering: Card View vs Table View */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          title="No activities found"
          description="Try broadening your category or status filters to locate events."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('ALL');
            setSelectedStatus('ALL');
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Card Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredActivities.map((act) => {
            const participantCount = records.filter(r => r.activityId === act.id).length;

            return (
              <div key={act.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: '0.75rem' }}>
                  <span className="badge badge-orange">{act.category}</span>
                  <Badge variant={getStatusBadgeVariant(act.status)} dot>
                    {act.status}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {act.name}
                </h3>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, flex: 1, marginBottom: '1rem' }}>
                  {act.description || 'Institutional co-curricular activity organized for student development.'}
                </p>

                <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} style={{ color: 'var(--primary-orange)' }} />
                    <span>{act.startDate} {act.endDate !== act.startDate ? `to ${act.endDate}` : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} style={{ color: 'var(--primary-orange)' }} />
                    <span>{act.venue} ({act.mode})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={13} style={{ color: 'var(--primary-orange)' }} />
                    <span><strong>{participantCount}</strong> logged participant{participantCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Host: {act.departmentName || 'Institutional'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => setInspectingActivity(act)}
                      title="Inspect activity and view registered participants"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => handleOpenEdit(act)}
                      title="Edit activity"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => setActivityToDelete(act)}
                      title="Delete activity"
                    >
                      <Trash2 size={15} style={{ color: 'var(--error)' }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Activity Name</th>
                  <th>Category</th>
                  <th>Host Department</th>
                  <th>Dates</th>
                  <th>Mode / Venue</th>
                  <th>Coordinator</th>
                  <th>Participants</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => {
                  const participantCount = records.filter(r => r.activityId === act.id).length;

                  return (
                    <tr key={act.id}>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{act.name}</strong>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{act.category}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem' }}>{act.departmentName || 'N/A'}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {act.startDate}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem' }}>{act.venue} ({act.mode})</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--primary-orange)', fontWeight: 500 }}>
                          {act.coordinator}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{participantCount}</strong>
                      </td>
                      <td>
                        <Badge variant={getStatusBadgeVariant(act.status)} dot>
                          {act.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={() => setInspectingActivity(act)}
                            title="Inspect details and participants"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={() => handleOpenEdit(act)}
                            title="Edit activity"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={() => setActivityToDelete(act)}
                            title="Delete activity"
                          >
                            <Trash2 size={15} style={{ color: 'var(--error)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ActivityFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        activity={editingActivity}
      />

      <ActivityDetailModal
        isOpen={!!inspectingActivity}
        onClose={() => setInspectingActivity(null)}
        activity={inspectingActivity}
        onOpenRecordModal={onOpenRecordModal}
      />

      <ConfirmDialog
        isOpen={!!activityToDelete}
        onClose={() => setActivityToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Activity"
        message={`Are you sure you want to delete '${activityToDelete?.name}'? Note that existing participation records will preserve their event reference.`}
        confirmLabel="Delete Activity"
      />
    </div>
  );
};
