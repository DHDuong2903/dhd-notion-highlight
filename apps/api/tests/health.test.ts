import { describe, it, expect, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { HealthResponse } from '@notion-highlight/shared';

describe('GET /api/health', () => {
  const app = buildApp({ logger: false });

  afterAll(async () => {
    await app.close();
  });

  it('should return HTTP 200 with status ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body) as HealthResponse;
    expect(body).toEqual({
      status: 'ok',
    });
  });
});
