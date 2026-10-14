import { Router } from 'express';
import {
  getDashboardOverview,
  exportRecordsCsv,
  exportStudentsCsv
} from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';
import { requireStaff } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, enforceTenantIsolation);

router.get('/dashboard', getDashboardOverview);
router.get('/export/records', requireStaff, exportRecordsCsv);
router.get('/export/students', requireStaff, exportStudentsCsv);

export default router;
