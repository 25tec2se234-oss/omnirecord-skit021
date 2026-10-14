import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthUserPayload {
  userId: string;
  email: string;
  fullName: string;
  isPlatformAdmin: boolean;
  institutionId: string;
  institutionCode: string;
  institutionName: string;
  role: Role;
  departmentId?: string | null;
}

export interface TenantContext {
  id: string;
  code: string;
  name: string;
  shortName: string;
  portalId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
  tenant?: TenantContext;
}
