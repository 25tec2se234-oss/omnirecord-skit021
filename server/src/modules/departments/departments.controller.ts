import { Response, NextFunction } from 'express';
import { prisma } from '../../db/client.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { createDepartmentSchema, updateDepartmentSchema } from './departments.schemas.js';

export async function listDepartments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;

    const departments = await prisma.department.findMany({
      where: { institutionId },
      include: {
        _count: {
          select: {
            students: true,
            activities: true,
            participationRecords: true
          }
        }
      },
      orderBy: { code: 'asc' }
    });

    // Format response to match frontend expectation
    const formatted = departments.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      coordinator: d.coordinatorName || 'Not Assigned',
      email: d.coordinatorEmail || '',
      status: d.status,
      description: d.description || '',
      studentCount: d._count.students,
      activityCount: d._count.activities,
      recordCount: d._count.participationRecords
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

export async function getDepartment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const institutionId = req.user!.institutionId;

    const department = await prisma.department.findFirst({
      where: { id, institutionId },
      include: {
        students: {
          take: 10,
          select: { id: true, studentId: true, name: true, year: true, cgpa: true }
        },
        activities: {
          take: 10,
          select: { id: true, code: true, name: true, status: true, startDate: true }
        },
        _count: {
          select: { students: true, activities: true, participationRecords: true }
        }
      }
    });

    if (!department) {
      res.status(404).json({ success: false, error: 'Department not found' });
      return;
    }

    res.json({
      success: true,
      data: department
    });
  } catch (err) {
    next(err);
  }
}

export async function createDepartment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createDepartmentSchema.parse(req.body);
    const institutionId = req.user!.institutionId;

    const existing = await prisma.department.findUnique({
      where: {
        institutionId_code: {
          institutionId,
          code: data.code
        }
      }
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: `Department with code '${data.code}' already exists in this institution.`
      });
      return;
    }

    const department = await prisma.department.create({
      data: {
        institutionId,
        code: data.code,
        name: data.name,
        coordinatorName: data.coordinatorName,
        coordinatorEmail: data.coordinatorEmail,
        description: data.description,
        status: 'Active'
      }
    });

    await prisma.auditLog.create({
      data: {
        institutionId,
        actorUserId: req.user!.userId,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'DEPARTMENT_CREATED',
        resourceType: 'Department',
        resourceId: department.id,
        afterState: department
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: department.id,
        code: department.code,
        name: department.name,
        coordinator: department.coordinatorName || '',
        email: department.coordinatorEmail || '',
        status: department.status,
        description: department.description
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDepartment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = updateDepartmentSchema.parse(req.body);
    const institutionId = req.user!.institutionId;

    const existing = await prisma.department.findFirst({
      where: { id, institutionId }
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Department not found' });
      return;
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        coordinatorName: data.coordinatorName,
        coordinatorEmail: data.coordinatorEmail,
        description: data.description,
        status: data.status
      }
    });

    await prisma.auditLog.create({
      data: {
        institutionId,
        actorUserId: req.user!.userId,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'DEPARTMENT_UPDATED',
        resourceType: 'Department',
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
        coordinator: updated.coordinatorName || '',
        email: updated.coordinatorEmail || '',
        status: updated.status,
        description: updated.description
      }
    });
  } catch (err) {
    next(err);
  }
}
