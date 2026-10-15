import { Response, NextFunction } from 'express';
import { prisma } from '../../db/client.js';
import { AuthenticatedRequest } from '../../types/index.js';
import {
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema
} from './students.schemas.js';

export async function listStudents(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;
    const query = studentQuerySchema.parse(req.query);

    const where: any = {
      institutionId
    };

    // Role-based privacy enforcement: Students can only view their own profile in directory
    if (req.user!.role === 'STUDENT') {
      const ownProfile = await prisma.studentProfile.findFirst({
        where: {
          institutionId,
          OR: [
            { userId: req.user!.userId },
            { email: { equals: req.user!.email, mode: 'insensitive' } }
          ]
        }
      });
      if (!ownProfile) {
        res.json({
          success: true,
          data: [],
          meta: { total: 0, page: 1, limit: query.limit, totalPages: 0 }
        });
        return;
      }
      where.id = ownProfile.id;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { studentId: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.departmentId && query.departmentId !== 'all') {
      where.departmentId = query.departmentId;
    }

    if (query.year && query.year !== 'all') {
      where.year = query.year;
    }

    if (query.status && query.status !== 'all') {
      where.status = query.status.toUpperCase();
    }

    const skip = (query.page - 1) * query.limit;

    const [total, students] = await Promise.all([
      prisma.studentProfile.count({ where }),
      prisma.studentProfile.findMany({
        where,
        include: {
          department: {
            select: {
              id: true,
              code: true,
              name: true
            }
          },
          _count: {
            select: {
              participationRecords: true
            }
          }
        },
        skip,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder }
      })
    ]);

    const formatted = students.map((s) => ({
      id: s.id,
      studentId: s.studentId,
      name: s.name,
      email: s.email,
      departmentId: s.departmentId,
      departmentName: s.department.name,
      departmentCode: s.department.code,
      program: s.program,
      year: s.year,
      status: s.status === 'ACTIVE' ? 'Active' : s.status,
      avatar: s.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      phone: s.phone || '',
      cgpa: s.cgpa || '',
      bio: s.bio || '',
      participationCount: s._count.participationRecords,
      createdAt: s.createdAt
    }));

    res.json({
      success: true,
      data: formatted,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getStudent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const institutionId = req.user!.institutionId;

    // Support lookup by either database cuid/uuid or studentId (roll number)
    const student: any = await prisma.studentProfile.findFirst({
      where: {
        institutionId,
        OR: [{ id }, { studentId: id }]
      },
      include: {
        department: true,
        participationRecords: {
          include: {
            activity: true,
            evidenceFiles: true,
            reviews: {
              orderBy: { reviewedAt: 'desc' },
              take: 1
            }
          },
          orderBy: { participationDate: 'desc' }
        }
      }
    });

    if (!student) {
      res.status(404).json({ success: false, error: 'Student not found in this institution' });
      return;
    }

    // Role-based privacy enforcement: Students cannot view other students' profiles
    if (req.user!.role === 'STUDENT') {
      const isOwner =
        (student.userId && student.userId === req.user!.userId) ||
        (student.email && student.email.toLowerCase() === req.user!.email.toLowerCase());
      if (!isOwner) {
        res.status(403).json({
          success: false,
          error: 'Access denied: You do not have permission to view other students’ private profiles.'
        });
        return;
      }
    }

    const records = student.participationRecords.map((r: any) => ({
      id: r.id,
      recordNumber: r.recordNumber,
      activityId: r.activityId,
      activityName: r.activity.name,
      category: r.category,
      departmentName: student.department.name,
      participationDate: r.participationDate.toISOString().split('T')[0],
      achievementLevel: r.achievementLevel,
      certificateRef: r.certificateRef,
      verificationStatus:
        r.verificationStatus === 'PENDING_REVIEW'
          ? 'Pending Review'
          : r.verificationStatus === 'NEEDS_CORRECTION'
          ? 'Needs Correction'
          : r.verificationStatus === 'VERIFIED'
          ? 'Verified'
          : r.verificationStatus === 'REJECTED'
          ? 'Rejected'
          : 'Draft',
      description: r.description,
      evidenceFilename: r.evidenceFiles[0]?.originalFilename || null,
      evidenceFileId: r.evidenceFiles[0]?.id || null,
      evidenceFileSize: r.evidenceFiles[0]?.fileDisplaySize || null,
      reviewerNotes: r.reviews[0]?.decisionNotes || null,
      reviewerName: r.reviews[0]?.reviewerName || null,
      reviewDate: r.reviews[0]?.reviewedAt ? r.reviews[0].reviewedAt.toISOString().split('T')[0] : null
    }));

    const verifiedRecords = records.filter((r: any) => r.verificationStatus === 'Verified');

    res.json({
      success: true,
      data: {
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        departmentId: student.departmentId,
        departmentName: student.department.name,
        departmentCode: student.department.code,
        program: student.program,
        year: student.year,
        status: student.status === 'ACTIVE' ? 'Active' : student.status,
        avatar: student.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        phone: student.phone || '',
        cgpa: student.cgpa || '',
        bio: student.bio || '',
        records,
        stats: {
          totalRecords: records.length,
          verifiedRecords: verifiedRecords.length,
          pendingRecords: records.filter((r: any) => r.verificationStatus === 'Pending Review').length,
          needsCorrection: records.filter((r: any) => r.verificationStatus === 'Needs Correction').length,
          winnerCount: verifiedRecords.filter((r: any) => r.achievementLevel === 'Winner').length
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createStudent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createStudentSchema.parse(req.body);
    const institutionId = req.user!.institutionId;

    // Verify department belongs to the same institution
    const department = await prisma.department.findFirst({
      where: {
        id: data.departmentId,
        institutionId
      }
    });

    if (!department) {
      res.status(400).json({
        success: false,
        error: 'The assigned department does not exist in this institution.'
      });
      return;
    }

    // Check unique roll number within institution
    const existingStudentId = await prisma.studentProfile.findUnique({
      where: {
        institutionId_studentId: {
          institutionId,
          studentId: data.studentId
        }
      }
    });

    if (existingStudentId) {
      res.status(409).json({
        success: false,
        error: `A student with roll number '${data.studentId}' already exists in this institution.`
      });
      return;
    }

    // Check unique email within institution
    const existingEmail = await prisma.studentProfile.findUnique({
      where: {
        institutionId_email: {
          institutionId,
          email: data.email.toLowerCase()
        }
      }
    });

    if (existingEmail) {
      res.status(409).json({
        success: false,
        error: `A student with email '${data.email}' already exists in this institution.`
      });
      return;
    }

    const student = await prisma.studentProfile.create({
      data: {
        institutionId,
        studentId: data.studentId,
        name: data.name,
        email: data.email.toLowerCase(),
        departmentId: data.departmentId,
        program: data.program,
        year: data.year,
        status: data.status.toUpperCase() as any,
        phone: data.phone,
        cgpa: data.cgpa,
        bio: data.bio,
        avatar: data.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
      },
      include: {
        department: true
      }
    });

    await prisma.auditLog.create({
      data: {
        institutionId,
        actorUserId: req.user!.userId,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'STUDENT_REGISTERED',
        resourceType: 'StudentProfile',
        resourceId: student.id,
        afterState: student
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        departmentId: student.departmentId,
        departmentName: student.department.name,
        program: student.program,
        year: student.year,
        status: 'Active',
        avatar: student.avatar,
        phone: student.phone,
        cgpa: student.cgpa,
        bio: student.bio
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateStudent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = updateStudentSchema.parse(req.body);
    const institutionId = req.user!.institutionId;

    const existing = await prisma.studentProfile.findFirst({
      where: {
        institutionId,
        OR: [{ id }, { studentId: id }]
      }
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Student not found in this institution' });
      return;
    }

    if (data.departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: data.departmentId, institutionId }
      });
      if (!dept) {
        res.status(400).json({ success: false, error: 'Invalid department' });
        return;
      }
    }

    const updated = await prisma.studentProfile.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        studentId: data.studentId,
        email: data.email?.toLowerCase(),
        departmentId: data.departmentId,
        program: data.program,
        year: data.year,
        status: data.status ? (data.status.toUpperCase() as any) : undefined,
        phone: data.phone,
        cgpa: data.cgpa,
        bio: data.bio,
        avatar: data.avatar
      },
      include: {
        department: true
      }
    });

    await prisma.auditLog.create({
      data: {
        institutionId,
        actorUserId: req.user!.userId,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'STUDENT_UPDATED',
        resourceType: 'StudentProfile',
        resourceId: updated.id,
        beforeState: existing,
        afterState: updated
      }
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        studentId: updated.studentId,
        name: updated.name,
        email: updated.email,
        departmentId: updated.departmentId,
        departmentName: updated.department.name,
        program: updated.program,
        year: updated.year,
        status: updated.status === 'ACTIVE' ? 'Active' : updated.status,
        avatar: updated.avatar,
        phone: updated.phone,
        cgpa: updated.cgpa,
        bio: updated.bio
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function archiveStudent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const institutionId = req.user!.institutionId;

    const existing = await prisma.studentProfile.findFirst({
      where: {
        institutionId,
        OR: [{ id }, { studentId: id }]
      }
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Student not found in this institution' });
      return;
    }

    // Explicit archival to protect verified academic history
    const archived = await prisma.studentProfile.update({
      where: { id: existing.id },
      data: { status: 'ARCHIVED' }
    });

    await prisma.auditLog.create({
      data: {
        institutionId,
        actorUserId: req.user!.userId,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'STUDENT_ARCHIVED',
        resourceType: 'StudentProfile',
        resourceId: archived.id,
        reason: 'Archived via student management'
      }
    });

    res.json({
      success: true,
      message: `Student ${existing.name} (${existing.studentId}) successfully archived. Academic history preserved.`
    });
  } catch (err) {
    next(err);
  }
}
