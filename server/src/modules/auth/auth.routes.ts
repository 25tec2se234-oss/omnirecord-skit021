import { Router } from 'express';
import {
  login,
  register,
  getCurrentUser,
  logout,
  requestPasswordReset,
  resetPassword,
  changePassword
} from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);
router.post('/forgot-password', authLimiter, requestPasswordReset);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/change-password', authenticate, changePassword);

export default router;
