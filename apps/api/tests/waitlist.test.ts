import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import type { FastifyInstance } from 'fastify';

describe('Waitlist & Validation API Endpoints (Phase 7)', () => {
  let app: FastifyInstance;
  const testEmail = `tester-${Date.now()}@example.com`;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await prisma.waitlistEntry.deleteMany({
      where: { email: { contains: 'tester-' } },
    });
    await app.close();
  });

  it('POST /api/waitlist should reject malformed email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/waitlist',
      payload: {
        email: 'invalid-email',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBeDefined();
  });

  it('POST /api/waitlist should successfully register an email to waitlist', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/waitlist',
      payload: {
        email: testEmail,
        source: 'unit_test',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.isExisting).toBe(false);

    const saved = await prisma.waitlistEntry.findUnique({
      where: { email: testEmail.toLowerCase() },
    });
    expect(saved).not.toBeNull();
    expect(saved?.email).toBe(testEmail.toLowerCase());
  });

  it('POST /api/waitlist should allow updating entry with survey answers', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/waitlist',
      payload: {
        email: testEmail,
        currentTools: 'Pocket, Notion Web Clipper',
        destinations: 'Obsidian, Notion',
        willingToPay: '$3/month',
        feedback: 'Would love dark mode and markdown export.',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.isExisting).toBe(true);

    const updated = await prisma.waitlistEntry.findUnique({
      where: { email: testEmail.toLowerCase() },
    });
    expect(updated?.currentTools).toBe('Pocket, Notion Web Clipper');
    expect(updated?.willingToPay).toBe('$3/month');
  });

  it('GET /api/waitlist/stats should return positive count', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/waitlist/stats',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.count).toBeGreaterThanOrEqual(1);
  });
});
