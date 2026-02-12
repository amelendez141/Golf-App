import { Router } from 'express';
import { webhookService } from '../services/webhookService.js';
import type { Request, Response } from 'express';

const router = Router();

// POST /api/webhooks/clerk - Clerk webhook endpoint
router.post('/clerk', async (req: Request, res: Response) => {
  // Get raw body for signature verification
  const payload = JSON.stringify(req.body);

  const event = await webhookService.verifyClerkWebhook(payload, {
    'svix-id': req.headers['svix-id'] as string,
    'svix-timestamp': req.headers['svix-timestamp'] as string,
    'svix-signature': req.headers['svix-signature'] as string,
  });

  await webhookService.handleClerkEvent(event);

  res.json({ received: true });
});

export { router as webhookRoutes };
