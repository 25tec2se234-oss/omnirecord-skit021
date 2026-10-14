import { Router } from 'express';
import { listAuditLogs } from './audit.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';
import { requireStaff } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, enforceTenantIsolation);

router.get('/', requireStaff, listAuditLogs);

export default router;
