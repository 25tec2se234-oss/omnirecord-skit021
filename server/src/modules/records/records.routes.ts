import { Router } from 'express';
import {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord
} from './records.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';

const router = Router();

router.use(authenticate, enforceTenantIsolation);

router.get('/', listRecords);
router.get('/:id', getRecord);
router.post('/', createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

export default router;
