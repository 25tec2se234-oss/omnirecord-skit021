import { Response, NextFunction } from 'express';
import { prisma } from '../../db/client.js';
import { AuthenticatedRequest } from '../../types/index.js';
import {
  createActivitySchema,
  updateActivitySchema,
  activityQuerySchema
} from './activities.schemas.js';

export async function listActivities(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;
    const query = activityQuerySchema.parse(req.query);

    const where: any = {
      institutionId,
      isArchived: false
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { venue: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.category && query.category !== 'all') {
      where.category = query.category;
    }

    if (query.departmentId && query.departmentId !== 'all') {
      where.departmentId = query.departmentId;
    }

    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }

    const skip = (query.page - 1) * query.limit;

    const [total, activities] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.findMany({
        where,
        include: {
          department: {
            select: { id: true, code: true, name: true }
          },
          _count: {
            select: { participationRecords: true }
          }
        },
        skip,
        take: query.limit,
        orderBy: { startDate: 'desc' }
      })
    ]);

    const formatted = activities.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      category: a.category,
      description: a.description,
      departmentId: a.departmentId,
      departmentName: a.department.name,
      departmentCode: a.department.code,
      startDate: a.startDate.toISOString().split('T')[0],
      endDate: a.endDate.toISOString().split('T')[0],
      venue: a.venue,
      mode: a.mode,
      coordinator: a.coordinator,
      status: a.status,
      maxParticipants: a.maxParticipants,
      participantCount: a._count.participationRecords
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

export async function getActivity(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const institutionId = req.user!.institutionId;

    const activity = await prisma.activity.findFirst({
      where: {
        institutionId,
        OR: [{ id }, { code: id }]
      },
      include: {
        department: true,
        participationRecords: {
          include: {
            studentProfile: true,
            evidenceFiles: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!activity) {
      res.status(404).json({ success: false, error: 'Activity not found in this institution' });
      return;
    }

    const participants = activity.participationRecords.map((r) => ({
      recordId: r.id,
      recordNumber: r.recordNumber,
      studentId: r.studentProfile.studentId,
      studentName: r.studentProfile.name,
      studentEmail: r.studentProfile.email,
      achievementLevel: r.achievementLevel,
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
      participationDate: r.participationDate.toISOString().split('T')[0],
      evidenceFilename: r.evidenceFiles[0]?.originalFilename || null
    }));

    res.json({
      success: true,
      data: {
        id: activity.id,
        code: activity.code,
        name: activity.name,
        category: activity.category,
        description: activity.description,
        departmentId: activity.departmentId,
        departmentName: activity.department.name,
        startDate: activity.startDate.toISOString().split('T')[0],
        endDate: activity.endDate.toISOString().split('T')[0],
        venue: activity.venue,
        mode: activity.mode,
        coordinator: activity.coordinator,
        status: activity.status,
        maxParticipants: activity.maxParticipants,
        participantCount: participants.length,
        participants
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createActivity(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createActivitySchema.parse(req.body);
    const institutionId = req.user!.institutionId;

    // Verify department belongs to the same institution
    const department = await prisma.department.findFirst({
      where: { id: data.departmentId, institutionId }
    });

    if (!department) {
      res.status(400).json({
        success: false,
        error: 'The assigned department does not belong to your institution.'
      });
      return;
    }

    // Generate next institutional sequential code (e.g. ACT-101, ACT-102...)
    const highestActivity = await prisma.activity.findFirst({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      select: { code: true }
    });

    let nextNum = 101;
    if (highestActivity?.code) {
      const match = highestActivity.code.match(/ACT-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const code = `ACT-${nextNum}`;

    const activity = await prisma.activity.create({
      data: {
        institutionId,
        code,
        name: data.name,
        category: data.category,
        description: data.description,
        departmentId: data.departmentId,
        startDate: data.startDate,
        endDate: data.endDate,
        venue: data.venue,
        mode: data.mode,
        coordinator: data.coordinator,
        status: data.status,
        maxParticipants: data.maxParticipants
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
        action: 'ACTIVITY_CREATED',
        resourceType: 'Activity',
        resourceId: activity.id,
        afterState: activity
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: activity.id,
        code: activity.code,
        name: activity.name,
        category: activity.category,
        description: activity.description,
        departmentId: activity.departmentId,
        departmentName: activity.department.name,
        startDate: activity.startDate.toISOString().split('T')[0],
        endDate: activity.endDate.toISOString().split('T')[0],
        venue: activity.venue,
        mode: activity.mode,
        coordinator: activity.coordinator,
        status: activity.status,
        maxParticipants: activity.maxParticipants,
        participantCount: 0
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateActivity(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = updateActivitySchema.parse(req.body);
    const institutionId = req.user!.institutionId;

    const existing = await prisma.activity.findFirst({
      where: {
        institutionId,
        OR: [{ id }, { code: id }]
      }
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Activity not found in this institution' });
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

    const updated = await prisma.activity.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        departmentId: data.departmentId,
        startDate: data.startDate,
        endDate: data.endDate,
        venue: data.venue,
        mode: data.mode,
        coordinator: data.coordinator,
        status: data.status,
        maxParticipants: data.maxParticipants,
        isArchived: data.isArchived
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
        action: 'ACTIVITY_UPDATED',
        resourceType: 'Activity',
        resourceId: updated.id,
        beforeState: existing,
        afterState: updated
      }
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        code: updated.code,
        name: updated.name,
        category: updated.category,
        description: updated.description,
        departmentId: updated.departmentId,
        departmentName: updated.department.name,
        startDate: updated.startDate.toISOString().split('T')[0],
        endDate: updated.endDate.toISOString().split('T')[0],
        venue: updated.venue,
        mode: updated.mode,
        coordinator: updated.coordinator,
        status: updated.status,
        maxParticipants: updated.maxParticipants
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function archiveActivity(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const institutionId = req.user!.institutionId;

    const existing = await prisma.activity.findFirst({
      where: {
        institutionId,
        OR: [{ id }, { code: id }]
      }
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Activity not found' });
      return;
    }

    await prisma.activity.update({
      where: { id: existing.id },
      data: { isArchived: true }
    });

    await prisma.auditLog.create({
      data: {
        institutionId,
        actorUserId: req.user!.userId,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'ACTIVITY_ARCHIVED',
        resourceType: 'Activity',
        resourceId: existing.id
      }
    });

    res.json({
      success: true,
      message: `Activity '${existing.name}' archived successfully.`
    });
  } catch (err) {
    next(err);
  }
}
