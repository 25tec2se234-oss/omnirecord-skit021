import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { DepartmentFormModal } from './DepartmentFormModal';
import {
  Building2,
  PlusCircle,
  Search,
  Users,
  CalendarDays,
  FileCheck2,
  Edit2,
  ArrowRight,
  Mail
} from 'lucide-react';

export const DepartmentManagement = () => {
  const { departments, students, activities, records, navigateTo } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.coordinator.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setIsFormOpen(true);
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Departments' }]} onNavigate={navigateTo} />

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Building2 size={24} style={{ color: 'var(--primary-orange)' }} />
            Academic Departments
          </h1>
          <p>
            Institutional faculties coordinating extracurricular events, student participation, and verification audits.
          </p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={handleOpenAdd}
          >
            Add Department
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        <div className="table-toolbar">
          <div className="header-search" style={{ width: 280 }}>
            <Search size={16} className="header-search-icon" />
            <input
              type="search"
              placeholder="Search department, code, coordinator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Total: <strong>{departments.length} Faculties</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      {filteredDepartments.length === 0 ? (
        <EmptyState
          title="No departments found"
          description="Try searching with a different department name or code."
          actionLabel="Clear Search"
          onAction={() => setSearchTerm('')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredDepartments.map((dept) => {
            const deptStudents = students.filter(s => s.departmentId === dept.id);
            const deptActivities = activities.filter(a => a.departmentId === dept.id);
            const deptRecords = records.filter(r => r.departmentId === dept.id);
            const verifiedRecords = deptRecords.filter(r => r.verificationStatus === 'Verified');

            return (
              <div key={dept.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--soft-orange)', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                      {dept.code}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {dept.name}
                      </h3>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1rem', flex: 1 }}>
                  {dept.description || 'Department fostering innovation and co-curricular involvement.'}
                </p>

                {/* Coordinator Info */}
                <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    Coordinator: {dept.coordinator}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={12} />
                    <span>{dept.email || `${dept.code.toLowerCase()}@skit.ac.in`}</span>
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1rem', textAlign: 'center' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Students</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{deptStudents.length}</div>
                  </div>
                  <div style={{ padding: '0.5rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Events</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{deptActivities.length}</div>
                  </div>
                  <div style={{ padding: '0.5rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Verified</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--success)' }}>{verifiedRecords.length}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.78rem', color: 'var(--primary-orange)', padding: 0 }}
                    onClick={() => navigateTo('records')}
                  >
                    View Department Records →
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => handleOpenEdit(dept)}
                    title="Edit department"
                  >
                    <Edit2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Department Form Modal */}
      <DepartmentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        department={editingDept}
      />
    </div>
  );
};
