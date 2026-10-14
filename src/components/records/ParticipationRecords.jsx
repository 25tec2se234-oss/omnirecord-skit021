import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Button } from '../common/Button';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { Pagination } from '../common/Pagination';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { RecordFormModal } from './RecordFormModal';
import { RecordDetailModal } from './RecordDetailModal';
import {
  FileCheck2,
  PlusCircle,
  Search,
  Eye,
  Edit2,
  Trash2,
  ShieldCheck,
  ArrowUpDown
} from 'lucide-react';

export const ParticipationRecords = () => {
  const { records, departments, deleteRecord, navigateTo } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState('participationDate');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [inspectingRecord, setInspectingRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Filter & Sort Logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.certificateRef || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = selectedCategory === 'ALL' || r.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || r.verificationStatus === selectedStatus;
      const matchDept = selectedDept === 'ALL' || r.departmentId === selectedDept;
      const matchLevel = selectedLevel === 'ALL' || r.achievementLevel === selectedLevel;

      return matchSearch && matchCat && matchStatus && matchDept && matchLevel;
    }).sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [records, searchTerm, selectedCategory, selectedStatus, selectedDept, selectedLevel, sortField, sortAsc]);

  // Paginated items
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      deleteRecord(recordToDelete.id);
      setRecordToDelete(null);
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Participation Records' }]} onNavigate={navigateTo} />

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <FileCheck2 size={24} style={{ color: 'var(--primary-orange)' }} />
            Participation Records
          </h1>
          <p>
            Central repository of student extracurricular achievements, evidence files, and verification credentials.
          </p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={handleOpenAdd}
          >
            Record Participation
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="header-search" style={{ width: 280 }}>
            <Search size={16} className="header-search-icon" />
            <input
              type="search"
              placeholder="Search record ID, student, event..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="table-filters">
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Research">Research</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Workshop">Workshop</option>
              <option value="Volunteering">Volunteering</option>
              <option value="Innovation">Innovation</option>
              <option value="Extracurricular">Extracurricular</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Needs Correction">Needs Correction</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Achievement Levels</option>
              <option value="Winner">Winner</option>
              <option value="Runner-up">Runner-up</option>
              <option value="Finalist">Finalist</option>
              <option value="Participant">Participant</option>
              <option value="Recognition">Recognition</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code}
                </option>
              ))}
            </select>

            {(searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedDept !== 'ALL' || selectedLevel !== 'ALL') && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSelectedDept('ALL');
                  setSelectedLevel('ALL');
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="table-wrapper">
          {paginatedRecords.length === 0 ? (
            <EmptyState
              title="No records found"
              description="No participation entries match the selected filters or search keyword."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
                setSelectedDept('ALL');
                setSelectedLevel('ALL');
              }}
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('id')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Record ID <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleSort('studentName')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Student <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th>Activity / Event</th>
                  <th>Category</th>
                  <th className="sortable" onClick={() => handleSort('participationDate')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Date <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th>Achievement</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {rec.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button
                          type="button"
                          style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)' }}
                          onClick={() => navigateTo('profile', { studentId: rec.studentId })}
                        >
                          {rec.studentName}
                        </button>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          {rec.studentRegNo}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                        {rec.activityName}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{rec.category}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {rec.participationDate}
                      </span>
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
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          onClick={() => setInspectingRecord(rec)}
                          title="Inspect record details"
                          aria-label="View record"
                        >
                          <Eye size={15} />
                        </button>
                        {(rec.verificationStatus === 'Pending Review' || rec.verificationStatus === 'Needs Correction') && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={() => navigateTo('verification', { recordId: rec.id })}
                            title="Verify submission in Verification Center"
                            aria-label="Verify submission"
                          >
                            <ShieldCheck size={15} style={{ color: 'var(--warning)' }} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          onClick={() => handleOpenEdit(rec)}
                          title="Edit record"
                          aria-label="Edit record"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          onClick={() => setRecordToDelete(rec)}
                          title="Delete record"
                          aria-label="Delete record"
                        >
                          <Trash2 size={15} style={{ color: 'var(--error)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRecords.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Record Form Modal for Add/Edit */}
      <RecordFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        record={editingRecord}
      />

      {/* Record Detail Modal */}
      <RecordDetailModal
        isOpen={!!inspectingRecord}
        onClose={() => setInspectingRecord(null)}
        record={inspectingRecord}
        onOpenEdit={handleOpenEdit}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Participation Record"
        message={`Are you sure you want to remove record ${recordToDelete?.id} (${recordToDelete?.activityName}) for ${recordToDelete?.studentName}?`}
        confirmLabel="Delete Record"
      />
    </div>
  );
};
