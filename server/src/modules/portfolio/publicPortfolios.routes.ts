import { Router } from 'express';
import { getPublicPortfolio } from './portfolio.controller.js';

const router = Router();

// Dedicated public endpoint for public portfolios
router.get('/:studentId', getPublicPortfolio);

export default router;
