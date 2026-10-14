import { Router } from 'express';
import { getCurrentSubscription, handleWebhook } from './subscriptions.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';
import { requireInstitutionAdmin } from '../../middleware/rbac.js';

const router = Router();

// Public webhook route (verified by eventId / signatures)
router.post('/webhook', handleWebhook);

// Protected subscription details for Institution Admin
router.get('/current', authenticate, enforceTenantIsolation, requireInstitutionAdmin, getCurrentSubscription);

export default router;
