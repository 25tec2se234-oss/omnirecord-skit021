import { Router } from 'express';
import {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment
} from './departments.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';
import { requireCoordinator } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, enforceTenantIsolation);

router.get('/', listDepartments);
router.get('/:id', getDepartment);
router.post('/', requireCoordinator, createDepartment);
router.put('/:id', requireCoordinator, updateDepartment);

export default router;
