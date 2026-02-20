import { Router } from 'express';
import { userRoutes } from './userRoutes.js';
import { courseRoutes } from './courseRoutes.js';
import { teeTimeRoutes } from './teeTimeRoutes.js';
import { webhookRoutes } from './webhookRoutes.js';
import { demoRoutes } from './demo.js';
import { weatherRoutes } from './weatherRoutes.js';
import { conditionRoutes } from './conditionRoutes.js';
import { healthRoutes } from './healthRoutes.js';
import { connectRoutes } from './connectRoutes.js';
import { authRoutes } from './authRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/tee-times', teeTimeRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/demo', demoRoutes);
router.use('/weather', weatherRoutes);
router.use('/conditions', conditionRoutes);
router.use('/connect', connectRoutes);

export { router as apiRoutes, healthRoutes };
