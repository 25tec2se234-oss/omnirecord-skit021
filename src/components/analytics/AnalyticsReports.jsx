import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Button } from '../common/Button';
import { StatCard } from '../common/StatCard';
import {
  MonthlyTrendChart,
  CategoryBreakdownChart,
  DepartmentEngagementChart,
  VerificationStatusRing
} from '../dashboard/ChartComponents';
import { ReportPreviewModal } from './ReportPreviewModal';
import {
  BarChart3,
  Filter,
  Calendar,
  Award,
  Users,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

export const AnalyticsReports = () => {
  const { records, students, departments, navigateTo } = useApp();

  // Dynamic Filters
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState('ALL');

  // Report Preview Modal state
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Filtered dataset according to active controls
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Dept filter
      if (selectedDept !== 'ALL' && r.departmentId !== selectedDept) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;

      // Student academic year filter
      if (selectedYear !== 'ALL') {
        const student = students.find(s => s.id === r.studentId);
        if (!student || student.year !== selectedYear) return false;
      }

      // Date range filter
      if (selectedDateRange === 'Q1_2024') {
        const d = r.participationDate || '';
        if (d < '2024-01-01' || d > '2024-03-31') return false;
      } else if (selectedDateRange === 'Q2_2024') {
        const d = r.participationDate || '';
        if (d < '2024-04-01' || d > '2024-06-30') return false;
      }

      return true;
    });
  }, [records, students, selectedDept, selectedCategory, selectedYear, selectedDateRange]);

  const verifiedCount = filteredRecords.filter(r => r.verificationStatus === 'Verified').length;
  const pendingCount = filteredRecords.filter(r => r.verificationStatus === 'Pending Review').length;
  const verificationRate = filteredRecords.length > 0 ? Math.round((verifiedCount / filteredRecords.length) * 100) : 0;

  // Most active activities in filtered dataset
  const activeActivitiesLeaderboard = useMemo(() => {
    const actMap = {};
    filteredRecords.forEach((r) => {
      actMap[r.activityName] = (actMap[r.activityName] || 0) + 1;
    });
    return Object.entries(actMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredRecords]);

  // Top students in filtered dataset
  const topStudentsLeaderboard = useMemo(() => {
    const stuMap = {};
    filteredRecords.forEach((r) => {
      if (!stuMap[r.studentId]) {
        stuMap[r.studentId] = {
          name: r.studentName,
          regNo: r.studentRegNo,
          dept: r.studentDepartment,
          count: 0
        };
      }
      stuMap[r.studentId].count += 1;
    });
    return Object.values(stuMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredRecords]);

  // Real CSV Export Utility
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      "Record ID",
      "Student Name",
      "Student Roll No",
      "Department",
      "Activity Name",
      "Category",
      "Participation Date",
      "Achievement Level",
      "Verification Status",
      "Certificate Reference",
      "Reviewer Name",
      "Review Notes"
    ];

    const rows = filteredRecords.map(r => [
      `"${r.id}"`,
      `"${r.studentName}"`,
      `"${r.studentRegNo}"`,
      `"${r.studentDepartment}"`,
      `"${r.activityName.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.participationDate}"`,
      `"${r.achievementLevel}"`,
      `"${r.verificationStatus}"`,
      `"${r.certificateRef || ''}"`,
      `"${r.reviewerName || ''}"`,
      `"${(r.reviewerNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Pehchaan_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterSummary = {
    department: selectedDept === 'ALL' ? 'All Departments' : selectedDept,
    category: selectedCategory === 'ALL' ? 'All Categories' : selectedCategory,
    academicYear: selectedYear === 'ALL' ? 'All Cohorts' : selectedYear,
    dateRange: selectedDateRange === 'ALL' ? 'All Time (2024)' : selectedDateRange.replace('_', ' ')
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Analytics & Reports' }]} onNavigate={navigateTo} />

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <BarChart3 size={24} style={{ color: 'var(--primary-orange)' }} />
            Analytics & Institutional Reporting
          </h1>
          <p>
            Dynamic metrics, department breakdowns, and export tools tailored for internal compliance and institutional reviews.
          </p>
        </div>

        <div className="page-actions">
          <Button
            variant="secondary"
            icon={Eye}
            onClick={() => setIsReportOpen(true)}
          >
            Report Preview & Print
          </Button>
          <Button
            variant="primary"
            icon={FileSpreadsheet}
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
          >
            Export Filtered CSV ({filteredRecords.length})
          </Button>
        </div>
      </div>

      {/* Dynamic Filter Controls Panel */}
      <div className="card" style={{ marginBottom: '1.75rem', background: 'var(--surface-white)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem' }}>
          <Filter size={16} style={{ color: 'var(--primary-orange)' }} />
          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Interactive Report Scope & Data Filters
          </strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Timeframe</label>
            <select
              className="form-select"
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
            >
              <option value="ALL">All Recorded Dates</option>
              <option value="Q1_2024">Q1 2024 (Jan - Mar)</option>
              <option value="Q2_2024">Q2 2024 (Apr - Jun)</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Host Department</label>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Activity Category</label>
            <select
              className="form-select"
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
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Student Cohort</label>
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="ALL">All Academic Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
        </div>

        {(selectedDept !== 'ALL' || selectedCategory !== 'ALL' || selectedYear !== 'ALL' || selectedDateRange !== 'ALL') && (
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSelectedDept('ALL');
                setSelectedCategory('ALL');
                setSelectedYear('ALL');
                setSelectedDateRange('ALL');
              }}
            >
              Reset Filters to All Data
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Strip linked to Filtered Data */}
      <div className="stat-card-grid">
        <StatCard
          label="Filtered Participation Records"
          value={filteredRecords.length}
          icon={BarChart3}
          colorScheme="orange"
          subtitle={`${records.length} records in institutional database`}
        />
        <StatCard
          label="Verified Merits"
          value={verifiedCount}
          icon={Award}
          colorScheme="green"
          trend={`${verificationRate}% of filtered records`}
          trendType="positive"
        />
        <StatCard
          label="Pending Review"
          value={pendingCount}
          icon={Calendar}
          colorScheme="amber"
          subtitle="Awaiting coordinator review"
        />
        <StatCard
          label="Active Departments"
          value={selectedDept === 'ALL' ? departments.length : 1}
          icon={Users}
          colorScheme="blue"
          subtitle="Contributing programs"
        />
      </div>

      {/* Charts Grid Driven by Filtered Records */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Monthly Trend (Filtered)</h3>
              <p className="card-subtitle">Participation volume across matching criteria</p>
            </div>
            <span className="badge badge-orange">{filteredRecords.length} events</span>
          </div>
          <MonthlyTrendChart records={filteredRecords} />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Verification Breakdown</h3>
              <p className="card-subtitle">Verified vs Pending ratio in current subset</p>
            </div>
            <span className="badge badge-neutral">{verificationRate}% Rate</span>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            <VerificationStatusRing records={filteredRecords} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Category Distribution</h3>
              <p className="card-subtitle">Domain breakdown for active selection</p>
            </div>
          </div>
          <CategoryBreakdownChart records={filteredRecords} />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Department Involvement</h3>
              <p className="card-subtitle">Participation representation across disciplines</p>
            </div>
          </div>
          <DepartmentEngagementChart records={filteredRecords} departments={departments} />
        </div>
      </div>

      {/* Leaderboards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
        {/* Most Active Events */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Most Active Activities</h3>
            <span className="badge badge-neutral">By Turnout</span>
          </div>
          {activeActivitiesLeaderboard.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              No activities found in current filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {activeActivitiesLeaderboard.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 8,
                    fontSize: '0.84rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--orange-100)', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.74rem' }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                  </div>
                  <strong style={{ color: 'var(--primary-orange)' }}>{item.count} entries</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highly Engaged Students */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">High Engagement Students</h3>
            <span className="badge badge-neutral">Top Contributors</span>
          </div>
          {topStudentsLeaderboard.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              No students found in current filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {topStudentsLeaderboard.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 8,
                    fontSize: '0.84rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{item.regNo} • {item.dept}</div>
                  </div>
                  <strong style={{ color: 'var(--success)' }}>{item.count} achievements</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportPreviewModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        filteredRecords={filteredRecords}
        filterSummary={filterSummary}
      />
    </div>
  );
};
