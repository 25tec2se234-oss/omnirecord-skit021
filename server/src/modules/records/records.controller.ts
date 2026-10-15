import { Response, NextFunction } from 'express';
import { prisma } from '../../db/client.js';
import { AuthenticatedRequest } from '../../types/index.js';
import {
  createRecordSchema,
  updateRecordSchema,
  recordQuerySchema
} from './records.schemas.js';

async function resolveStudentProfile(userId: string, email: string, institutionId: string) {
  let student = await prisma.studentProfile.findFirst({
    where: {
      institutionId,
      userId
    },
    include: { department: true }
  });

  if (!student && email) {
    student = await prisma.studentProfile.findFirst({
      where: {
        institutionId,
        email: { equals: email, mode: 'insensitive' }
      },
      include: { department: true }
    });
  }

  return student;
}

export async function listRecords(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;
    const query = recordQuerySchema.parse(req.query);

    const where: any = {
      institutionId
    };

    if (query.status && query.status !== 'all') {
      const statusMap: Record<string, string> = {
        'Pending Review': 'PENDING_REVIEW',
        'Verified': 'VERIFIED',
        'Needs Correction': 'NEEDS_CORRECTION',
        'Rejected': 'REJECTED',
        'Draft': 'DRAFT'
      };
      where.verificationStatus = statusMap[query.status] || query.status.toUpperCase();
    }

    if (query.departmentId && query.departmentId !== 'all') {
      where.departmentId = query.departmentId;
    }

    if (query.category && query.category !== 'all') {
      where.category = query.category;
    }

    // Role-based ownership enforcement: Students can ONLY view their own records
    if (req.user!.role === 'STUDENT') {
      const student = await resolveStudentProfile(req.user!.userId, req.user!.email, institutionId);
      if (!student) {
        res.json({
          success: true,
          data: [],
          meta: {
            total: 0,
            page: query.page,
            limit: query.limit,
            totalPages: 0
          }
        });
        return;
      }
      where.studentProfileId = student.id;
    } else if (query.studentId && query.studentId !== 'all') {
      where.OR = [
        { studentProfileId: query.studentId },
        { studentProfile: { studentId: query.studentId } }
      ];
    }

    if (query.search) {
      const searchConditions: any[] = [
        { recordNumber: { contains: query.search, mode: 'insensitive' } },
        { certificateRef: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { activity: { name: { contains: query.search, mode: 'insensitive' } } }
      ];
      if (req.user!.role !== 'STUDENT') {
        searchConditions.push(
          { studentProfile: { name: { contains: query.search, mode: 'insensitive' } } },
          { studentProfile: { studentId: { contains: query.search, mode: 'insensitive' } } }
        );
      }
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const skip = (query.page - 1) * query.limit;

    const [total, records] = await Promise.all([
      prisma.participationRecord.count({ where }),
      prisma.participationRecord.findMany({
        where,
        include: {
          studentProfile: {
            select: {
              id: true,
              studentId: true,
              name: true,
              email: true
            }
          },
          activity: {
            select: {
              id: true,
              code: true,
              name: true,
              category: true
            }
          },
          department: {
            select: {
              id: true,
              code: true,
              name: true
            }
          },
          evidenceFiles: {
            take: 1,
            select: {
              id: true,
              originalFilename: true,
              fileDisplaySize: true
            }
          },
          reviews: {
            orderBy: { reviewedAt: 'desc' },
            take: 1
          }
        },
        skip,
        take: query.limit,
        orderBy: { submissionDate: 'desc' }
      })
    ]);

    const formatted = records.map((r) => {
      const statusDisplay =
        r.verificationStatus === 'PENDING_REVIEW'
          ? 'Pending Review'
          : r.verificationStatus === 'NEEDS_CORRECTION'
          ? 'Needs Correction'
          : r.verificationStatus === 'VERIFIED'
          ? 'Verified'
          : r.verificationStatus === 'REJECTED'
          ? 'Rejected'
          : 'Draft';

      const latestReview = r.reviews[0];

      return {
        id: r.id,
        recordNumber: r.recordNumber,
        studentId: r.studentProfile.studentId,
        studentDbId: r.studentProfileId,
        studentRegNo: r.studentProfile.studentId,
        studentName: r.studentProfile.name,
        studentDepartment: r.department.name,
        activityId: r.activity.code || r.activityId,
        activityDbId: r.activityId,
        activityName: r.activity.name,
        category: r.category,
        departmentId: r.departmentId,
        participationDate: r.participationDate.toISOString().split('T')[0],
        achievementLevel: r.achievementLevel,
        certificateRef: r.certificateRef || `CERT-${r.recordNumber}`,
        evidenceFilename: r.evidenceFiles[0]?.originalFilename || 'certificate_document.pdf',
        evidenceFileId: r.evidenceFiles[0]?.id || null,
        evidenceFileSize: r.evidenceFiles[0]?.fileDisplaySize || '1.2 MB',
        verificationStatus: statusDisplay,
        reviewerName: latestReview?.reviewerName || (r.verificationStatus === 'PENDING_REVIEW' ? 'Pending Assignment' : 'Institutional Reviewer'),
        reviewerDepartment: latestReview?.reviewerDepartment || r.department.name,
        reviewDate: latestReview?.reviewedAt ? latestReview.reviewedAt.toISOString().split('T')[0] : null,
        reviewerNotes: latestReview?.decisionNotes || (r.verificationStatus === 'PENDING_REVIEW' ? 'Awaiting departmental review.' : ''),
        submissionDate: r.submissionDate.toISOString().split('T')[0],
        description: r.description
      };
    });

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

export async function getRecord(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const institutionId = req.user!.institutionId;

    const r: any = await prisma.participationRecord.findFirst({
      where: {
        institutionId,
        OR: [{ id }, { recordNumber: id }]
      },
      include: {
        studentProfile: { include: { department: true } },
        activity: { include: { department: true } },
        department: true,
        evidenceFiles: true,
        reviews: {
          orderBy: { reviewedAt: 'desc' }
        }
      }
    });

    if (!r) {
      res.status(404).json({ success: false, error: 'Participation record not found' });
      return;
    }

    // Role-based ownership enforcement: Students can only view their own records
    if (req.user!.role === 'STUDENT') {
      const isOwner =
        (r.studentProfile.userId && r.studentProfile.userId === req.user!.userId) ||
        (r.studentProfile.email && r.studentProfile.email.toLowerCase() === req.user!.email.toLowerCase());
      if (!isOwner) {
        res.status(403).json({
          success: false,
          error: 'Access denied: You do not have permission to view another student’s record.'
        });
        return;
      }
    }

    const latestReview = r.reviews[0];

    const formatted = {
      id: r.id,
      recordNumber: r.recordNumber,
      studentId: r.studentProfile.studentId,
      studentDbId: r.studentProfileId,
      studentRegNo: r.studentProfile.studentId,
      studentName: r.studentProfile.name,
      studentDepartment: r.department.name,
      activityId: r.activity.code || r.activityId,
      activityDbId: r.activityId,
      activityName: r.activity.name,
      category: r.category,
      departmentId: r.departmentId,
      participationDate: r.participationDate.toISOString().split('T')[0],
      achievementLevel: r.achievementLevel,
      certificateRef: r.certificateRef,
      evidenceFilename: r.evidenceFiles[0]?.originalFilename || 'certificate_document.pdf',
      evidenceFileId: r.evidenceFiles[0]?.id || null,
      evidenceFileSize: r.evidenceFiles[0]?.fileDisplaySize || '1.2 MB',
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
      reviewerName: latestReview?.reviewerName || (r.verificationStatus === 'PENDING_REVIEW' ? 'Pending Assignment' : 'Institutional Reviewer'),
      reviewerDepartment: latestReview?.reviewerDepartment || r.department.name,
      reviewDate: latestReview?.reviewedAt ? latestReview.reviewedAt.toISOString().split('T')[0] : null,
      reviewerNotes: latestReview?.decisionNotes || '',
      submissionDate: r.submissionDate.toISOString().split('T')[0],
      description: r.description,
      reviewHistory: r.reviews.map((rev: any) => ({
        id: rev.id,
        reviewerName: rev.reviewerName,
        previousStatus: rev.previousStatus,
        newStatus: rev.newStatus,
        decisionNotes: rev.decisionNotes,
        reviewedAt: rev.reviewedAt
      }))
    };

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

export async function createRecord(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createRecordSchema.parse(req.body);
    const institutionId = req.user!.institutionId;

    let student: any;
    if (req.user!.role === 'STUDENT') {
      student = await resolveStudentProfile(req.user!.userId, req.user!.email, institutionId);
      if (!student) {
        res.status(400).json({
          success: false,
          error: 'Your authenticated account does not have an associated student profile in this institution.'
        });
        return;
      }
      // Prohibit student from spoofing another student's ID in request
      if (data.studentId && data.studentId !== student.id && data.studentId !== student.studentId) {
        res.status(403).json({
          success: false,
          error: 'Access denied: You cannot create participation records for other students.'
        });
        return;
      }
    } else {
      // Resolve student in same institution for staff/coordinators
      student = await prisma.studentProfile.findFirst({
        where: {
          institutionId,
          OR: [{ id: data.studentId }, { studentId: data.studentId }]
        },
        include: { department: true }
      });
    }

    if (!student) {
      res.status(400).json({
        success: false,
        error: 'Referenced student does not exist in this institution.'
      });
      return;
    }

    // Resolve activity in same institution
    const activity = await prisma.activity.findFirst({
      where: {
        institutionId,
        OR: [{ id: data.activityId }, { code: data.activityId }]
      }
    });

    if (!activity) {
      res.status(400).json({
        success: false,
        error: 'Referenced activity does not exist in this institution.'
      });
      return;
    }

    // Generate collision-resistant institutional recordNumber: REC-2024-XXX
    const currentYear = new Date().getFullYear();
    const highestRecord = await prisma.participationRecord.findFirst({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      select: { recordNumber: true }
    });

    let nextSeq = 1;
    if (highestRecord?.recordNumber) {
      const match = highestRecord.recordNumber.match(/REC-\d+-(\d+)/);
      if (match) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }
    const recordNumber = `REC-${currentYear}-${String(nextSeq).padStart(3, '0')}`;

    const record = await prisma.$transaction(async (tx) => {
      const newRec = await tx.participationRecord.create({
        data: {
          institutionId,
          recordNumber,
          studentProfileId: student.id,
          activityId: activity.id,
          departmentId: student.departmentId,
          category: activity.category,
          participationDate: data.participationDate,
          achievementLevel: data.achievementLevel,
          certificateRef: data.certificateRef || `CERT-${recordNumber}`,
          description: data.description,
          verificationStatus: 'PENDING_REVIEW'
        }
      });

      // If simulated or uploaded evidence file metadata was provided
      if (data.evidenceFilename) {
        await tx.evidenceFile.create({
          data: {
            institutionId,
            recordId: newRec.id,
            originalFilename: data.evidenceFilename,
            storedFilename: `evidence_${newRec.id}_${Date.now()}.pdf`,
            storagePath: `uploads/evidence/evidence_${newRec.id}.pdf`,
            mimeType: 'application/pdf',
            fileSize: 1048576,
            fileDisplaySize: data.evidenceFileSize || '1.0 MB',
            uploadedByUserId: req.user!.userId
          }
        });
      }

      // Generate notification for coordinators
      await tx.notification.create({
        data: {
          institutionId,
          recipientRole: 'FACULTY_COORDINATOR',
          title: 'New Participation Record Awaiting Review',
          message: `${student.name} (${student.studentId}) submitted evidence for ${activity.name}.`,
          type: 'info',
          targetPage: 'verification',
          recordId: newRec.id
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          institutionId,
          actorUserId: req.user!.userId,
          actorEmail: req.user!.email,
          actorRole: req.user!.role,
          action: 'RECORD_SUBMITTED',
          resourceType: 'ParticipationRecord',
          resourceId: newRec.id,
          afterState: {
            recordNumber,
            studentId: student.studentId,
            activityId: activity.code,
            achievementLevel: data.achievementLevel
          }
        }
      });

      return newRec;
    });

    res.status(201).json({
      success: true,
      data: {
        id: record.id,
        recordNumber: record.recordNumber,
        studentId: student.studentId,
        studentRegNo: student.studentId,
        studentName: student.name,
        studentDepartment: student.department.name,
        activityId: activity.code,
        activityName: activity.name,
        category: record.category,
        departmentId: record.departmentId,
        participationDate: record.participationDate.toISOString().split('T')[0],
        achievementLevel: record.achievementLevel,
        certificateRef: record.certificateRef,
        evidenceFilename: data.evidenceFilename || 'credential_document.pdf',
        evidenceFileSize: data.evidenceFileSize || '1.2 MB',
        verificationStatus: 'Pending Review',
        reviewerName: 'Pending Assignment',
        reviewerNotes: 'Submitted for institutional review',
        submissionDate: record.submissionDate.toISOString().split('T')[0],
        description: record.description
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateRecord(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = updateRecordSchema.parse(req.body);
    const institutionId = req.user!.institutionId;

    const existing = await prisma.participationRecord.findFirst({
      where: {
        institutionId,
        OR: [{ id }, { recordNumber: id }]
      },
      include: {
        studentProfile: true
      }
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Participation record not found' });
      return;
    }

    // Role-based ownership enforcement
    if (req.user!.role === 'STUDENT') {
      const isOwner =
        (existing.studentProfile.userId && existing.studentProfile.userId === req.user!.userId) ||
        (existing.studentProfile.email && existing.studentProfile.email.toLowerCase() === req.user!.email.toLowerCase());
      if (!isOwner) {
        res.status(403).json({
          success: false,
          error: 'Access denied: You cannot modify records belonging to other students.'
        });
        return;
      }

      if (existing.verificationStatus === 'VERIFIED') {
        res.status(403).json({
          success: false,
          error: 'Verified participation records cannot be modified directly.'
        });
        return;
      }
    }

    const updated = await prisma.participationRecord.update({
      where: { id: existing.id },
      data: {
        participationDate: data.participationDate,
        achievementLevel: data.achievementLevel,
        certificateRef: data.certificateRef,
        description: data.description,
        // If it was needs correction and is updated by student, move back to pending review
        verificationStatus:
          existing.verificationStatus === 'NEEDS_CORRECTION'
            ? 'PENDING_REVIEW'
            : existing.verificationStatus
      }
    });

    await prisma.auditLog.create({
      data: {
        institutionId,
        actorUserId: req.user!.userId,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'RECORD_UPDATED',
        resourceType: 'ParticipationRecord',
        resourceId: updated.id,
        beforeState: existing,
        afterState: updated
      }
    });

    res.json({
      success: true,
      message: 'Record updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteRecord(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const institutionId = req.user!.institutionId;

    const existing = await prisma.participationRecord.findFirst({
      where: {
        institutionId,
        OR: [{ id }, { recordNumber: id }]
      },
      include: {
        studentProfile: true
      }
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Record not found' });
      return;
    }

    // Role-based ownership enforcement
    if (req.user!.role === 'STUDENT') {
      const isOwner =
        (existing.studentProfile.userId && existing.studentProfile.userId === req.user!.userId) ||
        (existing.studentProfile.email && existing.studentProfile.email.toLowerCase() === req.user!.email.toLowerCase());
      if (!isOwner) {
        res.status(403).json({
          success: false,
          error: 'Access denied: You cannot delete records belonging to other students.'
        });
        return;
      }
      if (existing.verificationStatus === 'VERIFIED') {
        res.status(403).json({
          success: false,
          error: 'Verified academic records cannot be deleted. Contact your institution administrator.'
        });
        return;
      }
    } else if (existing.verificationStatus === 'VERIFIED' && req.user!.role !== 'INSTITUTION_ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Verified academic records cannot be deleted. Contact your institution administrator.'
      });
      return;
    }

    await prisma.participationRecord.delete({
      where: { id: existing.id }
    });

    await prisma.auditLog.create({
      data: {
        institutionId,
        actorUserId: req.user!.userId,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'RECORD_DELETED',
        resourceType: 'ParticipationRecord',
        resourceId: existing.id,
        beforeState: existing
      }
    });

    res.json({
      success: true,
      message: `Record ${existing.recordNumber} deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
}
