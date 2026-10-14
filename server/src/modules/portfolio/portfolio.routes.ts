import { Router } from 'express';
import {
  getMyPortfolio,
  updateMyPortfolioSettings,
  getMyCredentials,
  updateMyCredentials,
  getPublicPortfolio
} from './portfolio.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';

const router = Router();

// Public route accessible without authentication
router.get('/public/:studentId', getPublicPortfolio);

// Authenticated student routes
router.get('/me', authenticate, enforceTenantIsolation, getMyPortfolio);
router.put('/me', authenticate, enforceTenantIsolation, updateMyPortfolioSettings);
router.get('/me/credentials', authenticate, enforceTenantIsolation, getMyCredentials);
router.put('/me/credentials', authenticate, enforceTenantIsolation, updateMyCredentials);

export default router;
