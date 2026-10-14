import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../../db/client.js';
import { AuthenticatedRequest } from '../../types/index.js';

const updateInstitutionSchema = z.object({
  name: z.string().min(2).optional(),
  shortName: z.string().min(2).optional(),
  accreditation: z.string().optional(),
  address: z.string().optional(),
  academicYear: z.string().optional(),
  adminEmail: z.string().email().optional()
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['INSTITUTION_ADMIN', 'FACULTY_COORDINATOR', 'STUDENT', 'AUDITOR_VIEWER']),
  departmentId: z.string().optional()
});

export async function getCurrentInstitution(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institution = await prisma.institution.findUnique({
      where: { id: req.user!.institutionId },
      include: {
        subscription: true,
        _count: {
          select: {
            students: true,
            activities: true,
            departments: true,
            participationRecords: true
          }
        }
      }
    });

    if (!institution) {
      res.status(404).json({ success: false, error: 'Institution not found' });
      return;
    }

    res.json({
      success: true,
      data: institution
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCurrentInstitution(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = updateInstitutionSchema.parse(req.body);

    const updated = await prisma.institution.update({
      where: { id: req.user!.institutionId },
      data
    });

    await prisma.auditLog.create({
      data: {
        institutionId: req.user!.institutionId,
        actorUserId: req.user!.userId,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'INSTITUTION_SETTINGS_UPDATED',
        resourceType: 'Institution',
        resourceId: updated.id,
        afterState: data
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function listMembers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const members = await prisma.institutionMembership.findMany({
      where: { institutionId: req.user!.institutionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            phone: true,
            createdAt: true
          }
        },
        department: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: members
    });
  } catch (err) {
    next(err);
  }
}

export async function inviteMember(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = inviteMemberSchema.parse(req.body);
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        institutionId: req.user!.institutionId,
        email: data.email.toLowerCase(),
        role: data.role,
        departmentId: data.departmentId,
        token,
        invitedByUserId: req.user!.userId,
        expiresAt
      }
    });

    res.status(201).json({
      success: true,
      message: 'Invitation generated successfully',
      data: invitation
    });
  } catch (err) {
    next(err);
  }
}
