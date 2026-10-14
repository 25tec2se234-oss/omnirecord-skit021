import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/client.js';
import { AuthenticatedRequest } from '../../types/index.js';

const auditQuerySchema = z.object({
  action: z.string().optional(),
  resourceType: z.string().optional(),
  actorEmail: z.string().optional(),
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 50))
});

export async function listAuditLogs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = req.user!.institutionId;
    const query = auditQuerySchema.parse(req.query);

    const where: any = {};

    // Unless platform super admin, strictly filter to current institution
    if (!req.user!.isPlatformAdmin) {
      where.institutionId = institutionId;
    }

    if (query.action) {
      where.action = { contains: query.action, mode: 'insensitive' };
    }

    if (query.resourceType) {
      where.resourceType = query.resourceType;
    }

    if (query.actorEmail) {
      where.actorEmail = { contains: query.actorEmail, mode: 'insensitive' };
    }

    const skip = (query.page - 1) * query.limit;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { timestamp: 'desc' }
      })
    ]);

    res.json({
      success: true,
      data: logs,
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
