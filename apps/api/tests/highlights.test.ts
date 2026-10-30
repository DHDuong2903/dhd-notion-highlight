import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { AppErrorCode } from '@notion-highlight/shared';

describe('Highlight API Endpoints', () => {
  const app = buildApp({ logger: false });
  const testEmail = `highlight-test-${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let authCookie: string;
  let testUserId: string;

  beforeAll(async () => {
    await app.ready();

    // Register user for testing
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: testEmail, password: testPassword },
    });
    authCookie = res.headers['set-cookie'] as string;
    const body = JSON.parse(res.body);
    testUserId = body.user.id;
  });

  afterAll(async () => {
    try {
      if (testUserId) {
        await prisma.user.delete({ where: { id: testUserId } });
      }
    } catch {
      // ignore
    }
    await app.close();
  });

  describe('POST /api/highlights authentication', () => {
    it('should return 401 UNAUTHORIZED if not authenticated', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        payload: {
          idempotencyKey: randomUUID(),
          text: 'Some highlighted text',
          title: 'Article Title',
          url: 'https://example.com/article',
        },
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe(AppErrorCode.UNAUTHORIZED);
    });
  });

  describe('POST /api/highlights & Source Grouping', () => {
    const articleUrl =
      'https://techcrunch.com/2026/01/01/ai-trends/?utm_source=twitter&utm_medium=social#part1';
    let firstSourceId: string;
    let firstHighlightId: string;
    const key1 = randomUUID();

    it('should create a new Source and Highlight for the 1st highlight on an URL', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: authCookie },
        payload: {
          idempotencyKey: key1,
          text: 'First highlight on AI trends',
          title: 'AI Trends in 2026',
          url: articleUrl,
        },
      });

      expect(res.statusCode).toBe(202);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.isNewSource).toBe(true);
      expect(body.highlightId).toBeDefined();
      expect(body.sourceId).toBeDefined();

      firstSourceId = body.sourceId;
      firstHighlightId = body.highlightId;
    });

    it('should group 2nd highlight from same URL (different query params) under the same Source', async () => {
      // Different tracking params and hash, but same canonical URL
      const differentVariantUrl =
        'https://techcrunch.com/2026/01/01/ai-trends/?ref=newsletter#conclusion';
      const key2 = randomUUID();

      const res = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: authCookie },
        payload: {
          idempotencyKey: key2,
          text: 'Second highlight from the conclusion section',
          title: 'AI Trends in 2026',
          url: differentVariantUrl,
        },
      });

      expect(res.statusCode).toBe(202);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.isNewSource).toBe(false); // Groups under existing source!
      expect(body.sourceId).toBe(firstSourceId);
      expect(body.highlightId).not.toBe(firstHighlightId);
    });

    it('should handle idempotency: repeating request with key1 returns existing highlight', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: authCookie },
        payload: {
          idempotencyKey: key1,
          text: 'First highlight on AI trends',
          title: 'AI Trends in 2026',
          url: articleUrl,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.isDuplicate).toBe(true);
      expect(body.highlightId).toBe(firstHighlightId);
    });
  });

  describe('GET /api/highlights', () => {
    it('should list all highlights for the authenticated user', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/highlights',
        headers: { cookie: authCookie },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.highlights).toBeDefined();
      expect(Array.isArray(body.highlights)).toBe(true);
      expect(body.highlights.length).toBeGreaterThanOrEqual(2);
      expect(body.highlights[0]).toHaveProperty('content');
      expect(body.highlights[0]).toHaveProperty('source');
    });
  });
});
