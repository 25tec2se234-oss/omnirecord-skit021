import { Router } from 'express';
import {
  getCurrentInstitution,
  updateCurrentInstitution,
  listMembers,
  inviteMember
} from './institutions.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';
import { requireInstitutionAdmin, requireStaff } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, enforceTenantIsolation);

router.get('/current', getCurrentInstitution);
router.patch('/current', requireInstitutionAdmin, updateCurrentInstitution);
router.get('/members', requireStaff, listMembers);
router.post('/invite', requireInstitutionAdmin, inviteMember);

export default router;
