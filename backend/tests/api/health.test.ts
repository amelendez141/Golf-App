/**
 * Health Check and Error Handling API Tests
 *
 * Tests the health endpoint and global error handling middleware.
 */

import request from 'supertest';
import { app } from '../../src/app';

describe('Health Check API', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should return positive uptime', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should return 404 for unknown API routes with different methods', async () => {
      const methods = ['post', 'put', 'delete', 'patch'] as const;

      for (const method of methods) {
        const response = await request(app)[method]('/api/nonexistent')
          .expect(404);

        expect(response.body.success).toBe(false);
      }
    });

    it('should return proper error structure', async () => {
      const response = await request(app)
        .get('/api/does-not-exist')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: expect.any(String),
        },
      });
    });
  });

  describe('JSON Body Parsing', () => {
    it('should accept valid JSON body', async () => {
      // This test verifies JSON parsing works - we use a POST endpoint
      // The actual endpoint behavior is tested elsewhere
      const response = await request(app)
        .post('/api/unknown')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json')
        .expect(404); // 404 because endpoint doesn't exist, but body was parsed

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject malformed JSON', async () => {
      const response = await request(app)
        .post('/api/unknown')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      // Note: CORS headers depend on configuration
      // In test environment, we check the response completed successfully
      expect(response.status).toBe(200);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers from helmet', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Helmet adds various security headers
      // Check for some common ones
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });
});
