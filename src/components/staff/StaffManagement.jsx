import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Key,
  ShieldCheck,
  Send
} from 'lucide-react';

export const StaffManagement = () => {
  const { departments, isBackendConnected, addToast } = useApp();

  const [members, setMembers] = useState([
    {
      id: 'MEM-001',
      fullName: 'Dean of Student Affairs',
      email: 'studentaffairs@skit.ac.in',
      role: 'INSTITUTION_ADMIN',
      departmentName: 'Institutional Affairs',
      status: 'ACTIVE',
      joinedDate: '2023-08-15'
    },
    {
      id: 'MEM-002',
      fullName: 'Dr. Ananya Sharma',
      email: 'cse.coordinator@skit.ac.in',
      role: 'FACULTY_COORDINATOR',
      departmentName: 'Computer Science & Engineering',
      status: 'ACTIVE',
      joinedDate: '2023-09-01'
    },
    {
      id: 'MEM-003',
      fullName: 'Prof. Rajesh Kumar',
      email: 'ece.coordinator@skit.ac.in',
      role: 'FACULTY_COORDINATOR',
      departmentName: 'Electronics & Communication',
      status: 'ACTIVE',
      joinedDate: '2023-10-10'
    },
    {
      id: 'MEM-004',
      fullName: 'Dr. Neha Verma',
      email: 'auditor@skit.ac.in',
      role: 'AUDITOR_VIEWER',
      departmentName: 'Internal Quality Assurance (IQAC)',
      status: 'ACTIVE',
      joinedDate: '2024-01-12'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    role: 'FACULTY_COORDINATOR',
    departmentId: departments[0]?.id || 'DEPT-CSE'
  });

  // Load from backend if connected
  useEffect(() => {
    const fetchMembers = async () => {
      if (isBackendConnected) {
        try {
          const res = await api.institutions.listMembers();
          if (res?.data && res.data.length > 0) {
            const mapped = res.data.map((m) => ({
              id: m.id,
              fullName: m.user.fullName,
              email: m.user.email,
              role: m.role,
              departmentName: m.department?.name || 'Institutional Affairs',
              status: m.status || 'ACTIVE',
              joinedDate: m.createdAt?.split('T')[0] || '2024-01-01'
            }));
            setMembers(mapped);
          }
        } catch {
          // preserve defaults
        }
      }
    };
    fetchMembers();
  }, [isBackendConnected]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isBackendConnected) {
        await api.institutions.inviteMember({
          email: inviteForm.email,
          role: inviteForm.role,
          departmentId: inviteForm.departmentId
        });
      }

      const selectedDept = departments.find((d) => d.id === inviteForm.departmentId);
      const newMember = {
        id: `MEM-${Date.now().toString().slice(-3)}`,
        fullName: inviteForm.fullName || inviteForm.email.split('@')[0],
        email: inviteForm.email,
        role: inviteForm.role,
        departmentName: selectedDept?.name || 'Computer Science & Engineering',
        status: 'ACTIVE',
        joinedDate: new Date().toISOString().split('T')[0]
      };

      setMembers((prev) => [newMember, ...prev]);
      setIsInviteModalOpen(false);
      setInviteForm({
        fullName: '',
        email: '',
        role: 'FACULTY_COORDINATOR',
        departmentId: departments[0]?.id || 'DEPT-CSE'
      });

      addToast({
        title: "Staff Member Invited",
        message: `Invitation generated and access provisioned for ${newMember.email}.`,
        type: "success"
      });
    } catch (err) {
      addToast({
        title: "Invitation Note",
        message: err.message || "Invitation generated locally.",
        type: "info"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = (id) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
          : m
      )
    );
    addToast({
      title: "Membership Updated",
      message: "Staff authorization status updated.",
      type: "info"
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)',
          borderColor: 'var(--orange-100)',
          padding: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.2rem 0.6rem', background: 'var(--soft-orange)', borderRadius: 'var(--radius-full)', color: 'var(--primary-orange)', fontSize: '0.74rem', fontWeight: 700, marginBottom: 4 }}>
              <ShieldCheck size={13} />
              COLLEGE GOVERNANCE & ROLES
            </div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Staff & Event Organiser Management
            </h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
              Manage institutional roles, assign department coordinators, and control verification review privileges.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Staff / Coordinator
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 250 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search by name, email, department..."
                className="form-control"
                style={{ paddingLeft: 32, fontSize: '0.82rem', height: 34 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ fontSize: '0.82rem', height: 34, width: 'auto' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="INSTITUTION_ADMIN">Institution Admin</option>
              <option value="FACULTY_COORDINATOR">Faculty Coordinator</option>
              <option value="AUDITOR_VIEWER">Auditor / Viewer</option>
            </select>
          </div>

          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredMembers.length}</strong> staff members
          </span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Authorized User</th>
                <th>Institutional Role</th>
                <th>Department Assignment</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.fullName}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{m.email}</div>
                  </td>
                  <td>
                    <Badge variant={m.role === 'INSTITUTION_ADMIN' ? 'orange' : m.role === 'FACULTY_COORDINATOR' ? 'info' : 'neutral'}>
                      {m.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td style={{ fontSize: '0.84rem' }}>{m.departmentName}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.joinedDate}</td>
                  <td>
                    <Badge variant={m.status === 'ACTIVE' ? 'success' : 'error'}>
                      {m.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => toggleStatus(m.id)}
                    >
                      {m.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsInviteModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 460,
              background: 'var(--surface-white)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              padding: '1.75rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Invite Staff / Coordinator
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setIsInviteModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Gupta"
                  className="form-control"
                  value={inviteForm.fullName}
                  onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                  Institutional Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="ramesh.gupta@skit.ac.in"
                  className="form-control"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                  Assigned Institutional Role
                </label>
                <select
                  className="form-control"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                >
                  <option value="FACULTY_COORDINATOR">Faculty Coordinator / Event Organiser</option>
                  <option value="INSTITUTION_ADMIN">Institution Administrator</option>
                  <option value="AUDITOR_VIEWER">Auditor / Quality Assurance (Read-Only)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                  Department Assignment
                </label>
                <select
                  className="form-control"
                  value={inviteForm.departmentId}
                  onChange={(e) => setInviteForm({ ...inviteForm, departmentId: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <Button variant="ghost" size="sm" onClick={() => setIsInviteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Provisioning...' : 'Dispatch Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
