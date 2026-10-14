import { Router } from 'express';
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from './notifications.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenantIsolation } from '../../middleware/tenant.js';

const router = Router();

router.use(authenticate, enforceTenantIsolation);

router.get('/', listNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.post('/read-all', markAllNotificationsAsRead);

export default router;
