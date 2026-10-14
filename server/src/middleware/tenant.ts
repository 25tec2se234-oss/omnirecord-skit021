import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';

export function enforceTenantIsolation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  // If user is Platform Super Admin, they may operate across tenants if specified
  if (req.user.isPlatformAdmin) {
    next();
    return;
  }

  const authenticatedTenantId = req.user.institutionId;

  // Check if client tried to spoof or inject a foreign institutionId in params, query, or body
  const attemptedInstitutionId =
    req.params.institutionId ||
    (req.query.institutionId as string) ||
    req.body?.institutionId;

  if (attemptedInstitutionId && attemptedInstitutionId !== authenticatedTenantId) {
    res.status(403).json({
      success: false,
      error: 'Tenant isolation violation: Cross-institution data access is strictly forbidden.'
    });
    return;
  }

  // Force body institutionId to always match the authenticated tenant
  if (req.body && typeof req.body === 'object') {
    req.body.institutionId = authenticatedTenantId;
  }

  next();
}
