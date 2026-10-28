import { describe, it, expect, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Prototype API Endpoints', () => {
  const app = buildApp({ logger: false });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/prototype/status', () => {
    it('should return status info even when env vars are not set', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/prototype/status',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty('configured');
    });
  });

  describe('POST /api/prototype/highlight', () => {
    it('should return 400 when body is invalid', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/prototype/highlight',
        payload: {
          text: '',
          url: 'not-a-url',
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.error.code).toBe('INVALID_INPUT');
    });

    it('should return 400 when databaseId is missing and not in env', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/prototype/highlight',
        payload: {
          text: 'Valid highlight',
          url: 'https://example.com/test',
        },
      });

      // Without databaseId in payload or .env, should return 400 BAD_REQUEST
      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.error.code).toBe('BAD_REQUEST');
    });
  });
});
