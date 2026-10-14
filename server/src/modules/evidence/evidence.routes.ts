import { Router } from 'express';
import { uploadEvidenceFile, downloadEvidenceFile } from './evidence.controller.js';
import { uploadEvidenceMiddleware } from './evidence.service.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';

const router = Router();

router.use(authenticate, enforceTenantIsolation);

router.post('/upload', uploadEvidenceMiddleware.single('file'), uploadEvidenceFile);
router.get('/:id/download', downloadEvidenceFile);

export default router;
