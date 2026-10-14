import { Router } from 'express';
import {
  listActivities,
  getActivity,
  createActivity,
  updateActivity,
  archiveActivity
} from './activities.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';
import { requireCoordinator } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, enforceTenantIsolation);

router.get('/', listActivities);
router.get('/:id', getActivity);
router.post('/', requireCoordinator, createActivity);
router.put('/:id', requireCoordinator, updateActivity);
router.delete('/:id', requireCoordinator, archiveActivity);

export default router;
