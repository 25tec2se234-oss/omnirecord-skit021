import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StudentFormModal } from './StudentFormModal';
import { StudentDetailModal } from './StudentDetailModal';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Award,
  ArrowUpDown
} from 'lucide-react';

export const StudentManagement = () => {
  const { students, records, departments, deleteStudent, navigateTo } = useApp();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [inspectingStudent, setInspectingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = selectedDept === 'ALL' || s.departmentId === selectedDept;
      const matchYear = selectedYear === 'ALL' || s.year === selectedYear;
      const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

      return matchSearch && matchDept && matchYear && matchStatus;
    }).sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      if (sortField === 'participationCount') {
        aVal = records.filter(r => r.studentId === a.id).length;
        bVal = records.filter(r => r.studentId === b.id).length;
      }

      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [students, records, searchTerm, selectedDept, selectedYear, selectedStatus, sortField, sortAsc]);

  // Paginated items
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Students Directory' }]} onNavigate={navigateTo} />

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Users size={24} style={{ color: 'var(--primary-orange)' }} />
            Students Directory
          </h1>
          <p>
            Manage enrolled students, link extracurricular achievements, and inspect verified digital transcripts.
          </p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={handleOpenAdd}
          >
            Register Student
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
              placeholder="Search by name, roll no, or email..."
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
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Academic Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
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
              <option value="Active">Active</option>
              <option value="Graduated">Graduated</option>
            </select>

            {(searchTerm || selectedDept !== 'ALL' || selectedYear !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDept('ALL');
                  setSelectedYear('ALL');
                  setSelectedStatus('ALL');
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
          {paginatedStudents.length === 0 ? (
            <EmptyState
              title="No students match criteria"
              description="Try adjusting your department filter, academic year, or search keyword."
              actionLabel="Reset Search Filters"
              onAction={() => {
                setSearchTerm('');
                setSelectedDept('ALL');
                setSelectedYear('ALL');
                setSelectedStatus('ALL');
              }}
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('studentId')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Student ID <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Student Name <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th>Department</th>
                  <th>Program / Cohort</th>
                  <th className="sortable" onClick={() => handleSort('participationCount')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Participations <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => {
                  const studentRecs = records.filter(r => r.studentId === student.id);
                  const verifiedRecs = studentRecs.filter(r => r.verificationStatus === 'Verified');

                  return (
                    <tr key={student.id}>
                      <td>
                        <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                          {student.studentId}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={student.avatar}
                            alt=""
                            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {student.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          {student.departmentName}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>{student.program}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          {student.year}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {studentRecs.length}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--success)' }}>
                            ({verifiedRecs.length} verified)
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={student.status === 'Active' ? 'success' : 'neutral'}>
                          {student.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={() => setInspectingStudent(student)}
                            title="Quick view"
                            aria-label="View student summary"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={() => navigateTo('profile', { studentId: student.id })}
                            title="Digital Achievement Profile"
                            aria-label="Open achievement profile"
                          >
                            <Award size={15} style={{ color: 'var(--primary-orange)' }} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={() => handleOpenEdit(student)}
                            title="Edit details"
                            aria-label="Edit student"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={() => setStudentToDelete(student)}
                            title="Delete demo student"
                            aria-label="Delete student"
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
          )}
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredStudents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Form Modal for Add / Edit */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        student={editingStudent}
      />

      {/* Quick Detail Modal */}
      <StudentDetailModal
        isOpen={!!inspectingStudent}
        onClose={() => setInspectingStudent(null)}
        student={inspectingStudent}
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Demo Student"
        message={`Are you sure you want to delete ${studentToDelete?.name} (${studentToDelete?.studentId})? All associated demo participation records will also be unlinked.`}
        confirmLabel="Delete Student"
      />
    </div>
  );
};
