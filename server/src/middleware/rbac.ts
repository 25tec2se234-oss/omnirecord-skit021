import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';

export function requireRoles(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
      return;
    }

    // Platform Super Admin always has full access
    if (req.user.isPlatformAdmin) {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
      return;
    }

    next();
  };
}

export const requirePlatformAdmin = requireRoles('PLATFORM_SUPER_ADMIN');
export const requireInstitutionAdmin = requireRoles('PLATFORM_SUPER_ADMIN', 'INSTITUTION_ADMIN');
export const requireCoordinator = requireRoles('PLATFORM_SUPER_ADMIN', 'INSTITUTION_ADMIN', 'FACULTY_COORDINATOR');
export const requireStaff = requireRoles('PLATFORM_SUPER_ADMIN', 'INSTITUTION_ADMIN', 'FACULTY_COORDINATOR', 'AUDITOR_VIEWER');
