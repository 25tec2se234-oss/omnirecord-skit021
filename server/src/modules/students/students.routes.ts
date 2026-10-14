import { Router } from 'express';
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  archiveStudent
} from './students.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';
import { requireCoordinator, requireInstitutionAdmin } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, enforceTenantIsolation);

router.get('/', listStudents);
router.get('/:id', getStudent);
router.post('/', requireCoordinator, createStudent);
router.put('/:id', requireCoordinator, updateStudent);
router.delete('/:id', requireInstitutionAdmin, archiveStudent);

export default router;
