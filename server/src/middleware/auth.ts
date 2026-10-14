import { Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { prisma } from '../db/client.js';
import { AuthenticatedRequest, AuthUserPayload, TenantContext } from '../types/index.js';
import { verifyToken } from '../utils/auth.js';

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = req.cookies?.[env.COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. No active session found.'
      });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired session token.'
      });
      return;
    }

    // Verify user status in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: {
          where: { institutionId: payload.institutionId, status: 'ACTIVE' },
          include: { institution: true }
        }
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'User account is inactive or not found.'
      });
      return;
    }

    // Platform admin check or valid institution membership
    if (!user.isPlatformAdmin && user.memberships.length === 0) {
      res.status(403).json({
        success: false,
        error: 'No active membership found for this institution.'
      });
      return;
    }

    const activeMembership = user.memberships[0];
    const institution = activeMembership?.institution;

    req.user = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      isPlatformAdmin: user.isPlatformAdmin,
      institutionId: activeMembership?.institutionId || payload.institutionId,
      institutionCode: institution?.code || payload.institutionCode,
      institutionName: institution?.name || payload.institutionName,
      role: activeMembership?.role || payload.role,
      departmentId: activeMembership?.departmentId
    };

    if (institution) {
      req.tenant = {
        id: institution.id,
        code: institution.code,
        name: institution.name,
        shortName: institution.shortName,
        portalId: institution.portalId
      };
    }

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal authentication error'
    });
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.[env.COOKIE_NAME] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (!token) {
    next();
    return;
  }
  const payload = verifyToken(token);
  if (payload) {
    req.user = payload;
  }
  next();
}
