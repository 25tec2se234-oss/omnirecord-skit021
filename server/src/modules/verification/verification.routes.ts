import { Router } from 'express';
import {
  getVerificationQueues,
  submitVerificationReview,
  reopenRecord
} from './verification.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';
import { requireCoordinator, requireInstitutionAdmin } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, enforceTenantIsolation);

router.get('/queues', requireCoordinator, getVerificationQueues);
router.post('/review', requireCoordinator, submitVerificationReview);
router.post('/reopen', requireInstitutionAdmin, reopenRecord);

export default router;
