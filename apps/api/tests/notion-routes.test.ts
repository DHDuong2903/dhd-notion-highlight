import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { encryptToken, createOAuthState } from '../src/utils/crypto.js';
import { AppErrorCode } from '@notion-highlight/shared';
import { NotionService } from '../src/services/notion.js';

describe('Notion API Routes & OAuth', () => {
  const app = buildApp({ logger: false });
  const testEmail = `notion-oauth-${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let authCookie: string;
  let testUserId: string;

  beforeAll(async () => {
    await app.ready();

    // Register user
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

  describe('GET /api/notion/status', () => {
    it('should return isConnected: false when user has no Notion connection', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/notion/status',
        headers: { cookie: authCookie },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.isConnected).toBe(false);
    });

    it('should return 401 when unauthenticated', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/notion/status',
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/notion/connect', () => {
    it('should generate valid OAuth URL with HMAC state', async () => {
      // Mock env vars temporarily if needed
      process.env.NOTION_CLIENT_ID = 'test-client-id-123';
      process.env.NOTION_CLIENT_SECRET = 'test-client-secret-456';

      const res = await app.inject({
        method: 'GET',
        url: '/api/notion/connect',
        headers: { cookie: authCookie },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.url).toContain('https://api.notion.com/v1/oauth/authorize');
      expect(body.url).toContain('client_id=');
      expect(body.url).toContain('state=');
    });
  });

  describe('GET /api/notion/callback validation', () => {
    it('should return 400 when code or state is missing', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/notion/callback',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toContain('Missing Authorization Code or State');
    });

    it('should return 400 when state HMAC is tampered', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/notion/callback?code=mock_code&state=fake-user.tampered-signature',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toContain('Security Verification Failed');
    });
  });

  describe('Database Selection & Highlights with Notion Sync', () => {
    const mockDbId = 'mock-database-id-12345';

    beforeAll(async () => {
      // Manually insert a NotionConnection for this test user
      const encryptedToken = encryptToken('secret_mock_access_token_xyz');
      await prisma.notionConnection.upsert({
        where: { userId: testUserId },
        update: {
          workspaceId: 'mock-workspace-id',
          databaseId: mockDbId,
          accessTokenEncrypted: encryptedToken,
        },
        create: {
          userId: testUserId,
          workspaceId: 'mock-workspace-id',
          databaseId: mockDbId,
          accessTokenEncrypted: encryptedToken,
        },
      });
    });

    it('should show isConnected: true in status after connection', async () => {
      // Mock NotionService.getDatabaseTitle
      vi.spyOn(NotionService.prototype, 'getDatabaseTitle').mockResolvedValue('My Reading List');

      const res = await app.inject({
        method: 'GET',
        url: '/api/notion/status',
        headers: { cookie: authCookie },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.isConnected).toBe(true);
      expect(body.databaseId).toBe(mockDbId);
      expect(body.databaseTitle).toBe('My Reading List');
    });

    it('should sync highlight to Notion when connected', async () => {
      // Mock NotionService createPage & appendHighlight
      vi.spyOn(NotionService.prototype, 'createPage').mockResolvedValue({
        pageId: 'notion-page-uuid-999',
        notionUrl: 'https://notion.so/test-page-999',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: authCookie },
        payload: {
          idempotencyKey: randomUUID(),
          text: 'This is a synced highlight test',
          title: 'Article to Sync',
          url: 'https://example.com/sync-article',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.status).toBe('SYNCED');
      expect(body.notionPageId).toBe('notion-page-uuid-999');
    });

    it('should delete NotionConnection on DELETE /api/notion/connection', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/notion/connection',
        headers: { cookie: authCookie },
      });

      expect(res.statusCode).toBe(200);

      // Check status again
      const statusRes = await app.inject({
        method: 'GET',
        url: '/api/notion/status',
        headers: { cookie: authCookie },
      });

      const body = JSON.parse(statusRes.body);
      expect(body.isConnected).toBe(false);
    });
  });
});
