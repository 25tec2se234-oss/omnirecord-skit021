import { Response, NextFunction } from 'express';
import { prisma } from '../../db/client.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { reviewDecisionSchema, reopenRecordSchema } from './verification.schemas.js';

export async function getVerificationQueues(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;

    const [pending, needsCorrection, verified, rejected] = await Promise.all([
      prisma.participationRecord.count({ where: { institutionId, verificationStatus: 'PENDING_REVIEW' } }),
      prisma.participationRecord.count({ where: { institutionId, verificationStatus: 'NEEDS_CORRECTION' } }),
      prisma.participationRecord.count({ where: { institutionId, verificationStatus: 'VERIFIED' } }),
      prisma.participationRecord.count({ where: { institutionId, verificationStatus: 'REJECTED' } })
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          pendingCount: pending,
          needsCorrectionCount: needsCorrection,
          verifiedCount: verified,
          rejectedCount: rejected,
          totalReviews: pending + needsCorrection + verified + rejected
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function submitVerificationReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = reviewDecisionSchema.parse(req.body);
    const institutionId = req.user!.institutionId;

    // Fetch the record with its student profile and evidence
    const record = await prisma.participationRecord.findFirst({
      where: {
        institutionId,
        OR: [{ id: data.recordId }, { recordNumber: data.recordId }]
      },
      include: {
        studentProfile: true,
        activity: true,
        department: true
      }
    });

    if (!record) {
      res.status(404).json({ success: false, error: 'Record not found in this institution' });
      return;
    }

    // ANTI-SELF-APPROVAL RULE: Check if reviewer is the student who owns this record (by userId or email)
    const isOwnerByUserId = record.studentProfile.userId && record.studentProfile.userId === req.user!.userId;
    const isOwnerByEmail = record.studentProfile.email && record.studentProfile.email.toLowerCase() === req.user!.email.toLowerCase();
    if (isOwnerByUserId || isOwnerByEmail) {
      res.status(403).json({
        success: false,
        error: 'Security Policy Violation: Self-approval is strictly forbidden. A student cannot verify their own participation record.'
      });
      return;
    }

    // DEPARTMENT REVIEW BOUNDARY: Faculty coordinators may only review submissions for their assigned department
    if (
      req.user!.role === 'FACULTY_COORDINATOR' &&
      req.user!.departmentId &&
      req.user!.departmentId !== record.departmentId
    ) {
      res.status(403).json({
        success: false,
        error: 'Access denied: You are only authorized to verify participation records within your assigned department.'
      });
      return;
    }

    const previousStatus = record.verificationStatus;
    const newStatus = data.status;

    // VALIDATE PERMITTED STATE TRANSITIONS
    if (previousStatus === 'VERIFIED') {
      res.status(400).json({
        success: false,
        error: 'Invalid state transition: Verified records cannot be directly altered. An institution administrator must formally reopen the record first.'
      });
      return;
    }

    if (previousStatus === 'REJECTED' && req.user!.role !== 'INSTITUTION_ADMIN' && !req.user!.isPlatformAdmin) {
      res.status(400).json({
        success: false,
        error: 'Invalid state transition: Rejected records cannot be approved without being reopened by an administrator.'
      });
      return;
    }

    const reviewerNotes = data.notes || (newStatus === 'VERIFIED' ? 'Verified by authorized reviewer.' : '');

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the participation record
      const updatedRecord = await tx.participationRecord.update({
        where: { id: record.id },
        data: {
          verificationStatus: newStatus
        }
      });

      // 2. Insert immutable verification review history
      const review = await tx.verificationReview.create({
        data: {
          institutionId,
          recordId: record.id,
          reviewerUserId: req.user!.userId,
          reviewerName: req.user!.fullName,
          reviewerDepartment: req.user!.role === 'FACULTY_COORDINATOR' ? record.department.name : 'Institutional Administration',
          previousStatus,
          newStatus,
          decisionNotes: reviewerNotes
        }
      });

      // 3. Create student notification
      const notifTypeMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
        VERIFIED: 'success',
        NEEDS_CORRECTION: 'warning',
        REJECTED: 'error'
      };

      const statusTitleMap: Record<string, string> = {
        VERIFIED: 'Achievement Successfully Verified',
        NEEDS_CORRECTION: 'Correction Requested by Reviewer',
        REJECTED: 'Participation Claim Rejected'
      };

      await tx.notification.create({
        data: {
          institutionId,
          recipientUserId: record.studentProfile.userId,
          title: statusTitleMap[newStatus] || 'Record Status Updated',
          message: `${record.studentProfile.name}'s record for ${record.activity.name} was marked as ${newStatus}. Note: "${reviewerNotes}"`,
          type: notifTypeMap[newStatus] || 'info',
          targetPage: 'verification',
          recordId: record.id
        }
      });

      // 4. Create Audit Log
      await tx.auditLog.create({
        data: {
          institutionId,
          actorUserId: req.user!.userId,
          actorEmail: req.user!.email,
          actorRole: req.user!.role,
          action: `RECORD_${newStatus}`,
          resourceType: 'ParticipationRecord',
          resourceId: record.id,
          beforeState: { status: previousStatus },
          afterState: { status: newStatus, notes: reviewerNotes },
          reason: reviewerNotes
        }
      });

      return { updatedRecord, review };
    });

    res.json({
      success: true,
      message: `Record ${record.recordNumber} successfully updated to ${newStatus}.`,
      data: {
        recordId: result.updatedRecord.id,
        recordNumber: record.recordNumber,
        verificationStatus:
          newStatus === 'VERIFIED'
            ? 'Verified'
            : newStatus === 'NEEDS_CORRECTION'
            ? 'Needs Correction'
            : 'Rejected',
        reviewerName: req.user!.fullName,
        reviewDate: result.review.reviewedAt.toISOString().split('T')[0],
        reviewerNotes
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function reopenRecord(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = reopenRecordSchema.parse(req.body);
    const institutionId = req.user!.institutionId;

    const record = await prisma.participationRecord.findFirst({
      where: {
        institutionId,
        OR: [{ id: data.recordId }, { recordNumber: data.recordId }]
      },
      include: {
        studentProfile: true,
        activity: true
      }
    });

    if (!record) {
      res.status(404).json({ success: false, error: 'Record not found in this institution' });
      return;
    }

    const previousStatus = record.verificationStatus;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.participationRecord.update({
        where: { id: record.id },
        data: { verificationStatus: 'PENDING_REVIEW' }
      });

      const review = await tx.verificationReview.create({
        data: {
          institutionId,
          recordId: record.id,
          reviewerUserId: req.user!.userId,
          reviewerName: req.user!.fullName,
          reviewerDepartment: 'Institutional Review Board',
          previousStatus,
          newStatus: 'PENDING_REVIEW',
          decisionNotes: `Reopened for review: ${data.reason}`
        }
      });

      await tx.auditLog.create({
        data: {
          institutionId,
          actorUserId: req.user!.userId,
          actorEmail: req.user!.email,
          actorRole: req.user!.role,
          action: 'RECORD_REOPENED_FOR_REVIEW',
          resourceType: 'ParticipationRecord',
          resourceId: record.id,
          beforeState: { status: previousStatus },
          afterState: { status: 'PENDING_REVIEW' },
          reason: data.reason
        }
      });

      return { updated, review };
    });

    res.json({
      success: true,
      message: `Record ${record.recordNumber} reopened and returned to Pending Review queue.`,
      data: result
    });
  } catch (err) {
    next(err);
  }
}
