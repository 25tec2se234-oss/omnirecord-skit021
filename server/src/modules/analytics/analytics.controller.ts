import { Response, NextFunction } from 'express';
import { prisma } from '../../db/client.js';
import { AuthenticatedRequest } from '../../types/index.js';

// Sanitize cell values against Spreadsheet Formula Injection (CSV Injection)
export function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If string starts with =, +, -, @, or tab/CR, prepend single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }
  // If string contains comma, double quote, or newline, wrap in quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function getDashboardOverview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;

    const [
      totalStudents,
      totalActivities,
      totalRecords,
      verifiedRecords,
      pendingReviews,
      needsCorrection,
      rejectedRecords,
      activeActivities,
      departments,
      records
    ] = await Promise.all([
      prisma.studentProfile.count({ where: { institutionId, status: 'ACTIVE' } }),
      prisma.activity.count({ where: { institutionId, isArchived: false } }),
      prisma.participationRecord.count({ where: { institutionId } }),
      prisma.participationRecord.count({ where: { institutionId, verificationStatus: 'VERIFIED' } }),
      prisma.participationRecord.count({ where: { institutionId, verificationStatus: 'PENDING_REVIEW' } }),
      prisma.participationRecord.count({ where: { institutionId, verificationStatus: 'NEEDS_CORRECTION' } }),
      prisma.participationRecord.count({ where: { institutionId, verificationStatus: 'REJECTED' } }),
      prisma.activity.count({ where: { institutionId, isArchived: false, status: { in: ['Upcoming', 'Ongoing'] } } }),
      prisma.department.findMany({
        where: { institutionId },
        include: {
          _count: {
            select: { participationRecords: true, students: true }
          }
        }
      }),
      prisma.participationRecord.findMany({
        where: { institutionId },
        select: {
          category: true,
          achievementLevel: true,
          participationDate: true,
          verificationStatus: true
        }
      })
    ]);

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const r of records) {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    }
    const categoryDistribution = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count
    }));

    // Department participation breakdown
    const departmentDistribution = departments.map((d) => ({
      departmentId: d.id,
      code: d.code,
      name: d.name,
      recordsCount: d._count.participationRecords,
      studentsCount: d._count.students
    }));

    // Monthly trends (past 6 months)
    const monthCounts: Record<string, { total: number; verified: number }> = {};
    for (const r of records) {
      const monthKey = r.participationDate.toISOString().substring(0, 7); // YYYY-MM
      if (!monthCounts[monthKey]) {
        monthCounts[monthKey] = { total: 0, verified: 0 };
      }
      monthCounts[monthKey].total += 1;
      if (r.verificationStatus === 'VERIFIED') {
        monthCounts[monthKey].verified += 1;
      }
    }

    const monthlyTrends = Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, stats]) => ({
        month,
        total: stats.total,
        verified: stats.verified
      }));

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalActivities,
          activeActivities,
          totalRecords,
          verifiedRecords,
          pendingReviews,
          needsCorrection,
          rejectedRecords,
          verificationRate: totalRecords > 0 ? Math.round((verifiedRecords / totalRecords) * 100) : 0
        },
        categoryDistribution,
        departmentDistribution,
        monthlyTrends
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function exportRecordsCsv(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;

    const records = await prisma.participationRecord.findMany({
      where: { institutionId },
      include: {
        studentProfile: true,
        activity: true,
        department: true,
        reviews: { orderBy: { reviewedAt: 'desc' }, take: 1 }
      },
      orderBy: { submissionDate: 'desc' }
    });

    const headers = [
      'Record Number',
      'Student Name',
      'Roll Number',
      'Department',
      'Activity Name',
      'Category',
      'Participation Date',
      'Achievement Level',
      'Verification Status',
      'Certificate Ref',
      'Reviewer Notes',
      'Submission Date'
    ];

    const rows = records.map((r) => [
      sanitizeCsvCell(r.recordNumber),
      sanitizeCsvCell(r.studentProfile.name),
      sanitizeCsvCell(r.studentProfile.studentId),
      sanitizeCsvCell(r.department.name),
      sanitizeCsvCell(r.activity.name),
      sanitizeCsvCell(r.category),
      sanitizeCsvCell(r.participationDate.toISOString().split('T')[0]),
      sanitizeCsvCell(r.achievementLevel),
      sanitizeCsvCell(r.verificationStatus),
      sanitizeCsvCell(r.certificateRef || ''),
      sanitizeCsvCell(r.reviews[0]?.decisionNotes || ''),
      sanitizeCsvCell(r.submissionDate.toISOString().split('T')[0])
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pehchaan_records_${new Date().toISOString().split('T')[0]}.csv"`
    );

    res.send(csvContent);
  } catch (err) {
    next(err);
  }
}

export async function exportStudentsCsv(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;

    const students = await prisma.studentProfile.findMany({
      where: { institutionId },
      include: {
        department: true,
        _count: { select: { participationRecords: true } }
      },
      orderBy: { studentId: 'asc' }
    });

    const headers = [
      'Student Roll No',
      'Full Name',
      'Email',
      'Department',
      'Program',
      'Year',
      'CGPA',
      'Status',
      'Verified Records Count'
    ];

    const rows = students.map((s) => [
      sanitizeCsvCell(s.studentId),
      sanitizeCsvCell(s.name),
      sanitizeCsvCell(s.email),
      sanitizeCsvCell(s.department.name),
      sanitizeCsvCell(s.program),
      sanitizeCsvCell(s.year),
      sanitizeCsvCell(s.cgpa || ''),
      sanitizeCsvCell(s.status),
      sanitizeCsvCell(s._count.participationRecords)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pehchaan_students_${new Date().toISOString().split('T')[0]}.csv"`
    );

    res.send(csvContent);
  } catch (err) {
    next(err);
  }
}
