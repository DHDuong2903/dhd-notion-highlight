import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { encryptToken } from '../src/utils/crypto.js';
import { AppErrorCode } from '@notion-highlight/shared';
import { NotionService } from '../src/services/notion.js';

describe('Phase 5 — End-to-End User Journey & Reliability Suite', () => {
  const app = buildApp({ logger: false });

  // Test User A (Primary)
  const userAEmail = `e2e-user-a-${Date.now()}@example.com`;
  const password = 'Password123!';
  let userACookie: string;
  let userAId: string;

  // Test User B (Adversary / Boundary check)
  const userBEmail = `e2e-user-b-${Date.now()}@example.com`;
  let userBCookie: string;
  let userBId: string;

  const mockDbId = 'mock-database-id-12345';
  const mockPageId1 = '11111111-2222-3333-4444-555555555555';
  const mockPageId2 = '66666666-7777-8888-9999-000000000000';

  beforeAll(async () => {
    await app.ready();

    // 1. Register User A
    const resA = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: userAEmail, password },
    });
    expect(resA.statusCode).toBe(201);
    userACookie = resA.headers['set-cookie'] as string;
    userAId = JSON.parse(resA.body).user.id;

    // 2. Register User B
    const resB = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: userBEmail, password },
    });
    expect(resB.statusCode).toBe(201);
    userBCookie = resB.headers['set-cookie'] as string;
    userBId = JSON.parse(resB.body).user.id;

    // 3. Setup mock Notion connection for User A
    const encryptedToken = encryptToken('secret_mock_notion_token_for_user_a');
    await prisma.notionConnection.create({
      data: {
        userId: userAId,
        accessTokenEncrypted: encryptedToken,
        workspaceId: 'mock-workspace-id-a',
        databaseId: mockDbId,
      },
    });
  });

  afterAll(async () => {
    try {
      if (userAId) {
        await prisma.user.delete({ where: { id: userAId } });
      }
      if (userBId) {
        await prisma.user.delete({ where: { id: userBId } });
      }
    } catch {
      // ignore cleanup errors
    }
    await app.close();
  });

  // ==========================================
  // EPIC P5-E1: Integration Testing Journey
  // ==========================================
  describe('Epic P5-E1: Core Highlight Sync Journey', () => {
    const articleUrl =
      'https://engineering.atspotify.com/2026/01/system-architecture/?utm_source=twitter#intro';
    let firstSourceId: string;
    let firstHighlightId: string;
    const key1 = randomUUID();

    it('P5-E1-T1: New source flow — creates Notion page and returns notionUrl with isNewSource: true', async () => {
      // Mock Notion page creation
      const createPageSpy = vi.spyOn(NotionService.prototype, 'createPage').mockResolvedValueOnce({
        pageId: mockPageId1,
        notionUrl: `https://notion.so/${mockPageId1.replace(/-/g, '')}`,
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: userACookie },
        payload: {
          idempotencyKey: key1,
          text: 'Microservices architecture enables independent deployment cycles.',
          title: 'Spotify System Architecture',
          url: articleUrl,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.isNewSource).toBe(true);
      expect(body.status).toBe('SYNCED');
      expect(body.highlightId).toBeDefined();
      expect(body.sourceId).toBeDefined();
      expect(body.notionUrl).toContain(mockPageId1.replace(/-/g, ''));

      firstSourceId = body.sourceId;
      firstHighlightId = body.highlightId;

      expect(createPageSpy).toHaveBeenCalledTimes(1);

      // Verify in Database
      const savedSource = await prisma.source.findUnique({
        where: { id: firstSourceId },
      });
      expect(savedSource).not.toBeNull();
      expect(savedSource?.notionPageId).toBe(mockPageId1);

      const savedHighlight = await prisma.highlight.findUnique({
        where: { id: firstHighlightId },
      });
      expect(savedHighlight?.status).toBe('SYNCED');
    });

    it('P5-E1-T2: Existing source flow — second highlight on same canonical URL appends block without creating new page', async () => {
      // Different query string, same canonical URL
      const variantUrl =
        'https://engineering.atspotify.com/2026/01/system-architecture/?utm_campaign=newsletter#summary';
      const key2 = randomUUID();

      const appendBlockSpy = vi
        .spyOn(NotionService.prototype, 'appendHighlight')
        .mockResolvedValueOnce();
      const createPageSpy = vi.spyOn(NotionService.prototype, 'createPage');

      const res = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: userACookie },
        payload: {
          idempotencyKey: key2,
          text: 'Event-driven communication ensures eventual consistency across distributed domains.',
          title: 'Spotify System Architecture',
          url: variantUrl,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.isNewSource).toBe(false);
      expect(body.status).toBe('SYNCED');
      expect(body.sourceId).toBe(firstSourceId); // Must be the same source
      expect(body.notionUrl).toContain(mockPageId1.replace(/-/g, ''));

      expect(appendBlockSpy).toHaveBeenCalledTimes(1);
      // createPage must NOT be called for existing source
      expect(createPageSpy).not.toHaveBeenCalled();
    });

    it('P5-E1-T3: Different source flow — distinct URL creates a distinct Notion page and Source', async () => {
      const distinctUrl = 'https://martinfowler.com/articles/patterns-of-distributed-systems/';
      const key3 = randomUUID();

      const createPageSpy = vi.spyOn(NotionService.prototype, 'createPage').mockResolvedValueOnce({
        pageId: mockPageId2,
        notionUrl: `https://notion.so/${mockPageId2.replace(/-/g, '')}`,
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: userACookie },
        payload: {
          idempotencyKey: key3,
          text: 'Consensus algorithms like Raft guarantee high availability.',
          title: 'Patterns of Distributed Systems',
          url: distinctUrl,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.isNewSource).toBe(true);
      expect(body.status).toBe('SYNCED');
      expect(body.sourceId).not.toBe(firstSourceId);
      expect(body.notionUrl).toContain(mockPageId2.replace(/-/g, ''));

      expect(createPageSpy).toHaveBeenCalledTimes(1);
    });

    it('P5-E1-T4: Unauthenticated requests are rejected with 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        payload: {
          idempotencyKey: randomUUID(),
          text: 'Unauthorized highlight',
          title: 'Should Fail',
          url: 'https://example.com',
        },
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe(AppErrorCode.UNAUTHORIZED);
    });

    it('P5-E1-T5: Notion connection failure / revocation detection marks highlight as FAILED', async () => {
      const keyFail = randomUUID();

      // Simulate Notion API token revoked or connection error
      vi.spyOn(NotionService.prototype, 'createPage').mockRejectedValueOnce(
        new Error('Unauthorized: Notion token has been revoked or expired'),
      );

      const res = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: userACookie },
        payload: {
          idempotencyKey: keyFail,
          text: 'This highlight should gracefully record FAILED status when Notion API fails.',
          title: 'Failed Notion Test',
          url: 'https://failure-test.org/article',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.status).toBe('FAILED');
      expect(body.message).toContain('Notion sync failed');

      // Verify the highlight was recorded as FAILED in DB for auditability
      const failedHighlight = await prisma.highlight.findUnique({
        where: { idempotencyKey: keyFail },
      });
      expect(failedHighlight).not.toBeNull();
      expect(failedHighlight?.status).toBe('FAILED');
    });
  });

  // ==========================================
  // EPIC P5-E2: Security & Reliability
  // ==========================================
  describe('Epic P5-E2: Security, Isolation & Reliability', () => {
    it('P5-E2-T1: User boundary isolation — User B cannot see User A highlights or connection', async () => {
      // User B status check (no connection)
      const statusResB = await app.inject({
        method: 'GET',
        url: '/api/notion/status',
        headers: { cookie: userBCookie },
      });
      expect(statusResB.statusCode).toBe(200);
      const statusBodyB = JSON.parse(statusResB.body);
      expect(statusBodyB.isConnected).toBe(false);
      expect(statusBodyB.databaseId).toBeFalsy();

      // User B highlights query (must return 0 highlights)
      const highlightsResB = await app.inject({
        method: 'GET',
        url: '/api/highlights',
        headers: { cookie: userBCookie },
      });
      expect(highlightsResB.statusCode).toBe(200);
      const highlightsBodyB = JSON.parse(highlightsResB.body);
      expect(highlightsBodyB.highlights).toHaveLength(0);

      // User A status check (must see their own connection)
      const statusResA = await app.inject({
        method: 'GET',
        url: '/api/notion/status',
        headers: { cookie: userACookie },
      });
      expect(statusResA.statusCode).toBe(200);
      const statusBodyA = JSON.parse(statusResA.body);
      expect(statusBodyA.isConnected).toBe(true);
      expect(statusBodyA.databaseId).toBe(mockDbId);
      // Zero token leak check: accessToken must NEVER appear in response
      expect(statusResA.body).not.toContain('secret_mock_notion_token');
    });

    it('P5-E2-T2: Input payload size limits & validation errors (400 Bad Request)', async () => {
      // 1. Text exceeds 2000 characters limit
      const oversizedText = 'A'.repeat(2001);
      const resOversized = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: userACookie },
        payload: {
          idempotencyKey: randomUUID(),
          text: oversizedText,
          title: 'Too long',
          url: 'https://example.com/long',
        },
      });
      expect(resOversized.statusCode).toBe(400);
      expect(JSON.parse(resOversized.body).error.code).toBe(AppErrorCode.BAD_REQUEST);

      // 2. Malformed URL
      const resBadUrl = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: userACookie },
        payload: {
          idempotencyKey: randomUUID(),
          text: 'Valid text',
          title: 'Bad URL',
          url: 'not-a-valid-url',
        },
      });
      expect(resBadUrl.statusCode).toBe(400);
      expect(JSON.parse(resBadUrl.body).error.code).toBe(AppErrorCode.BAD_REQUEST);

      // 3. Missing idempotencyKey
      const resMissingKey = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: userACookie },
        payload: {
          text: 'Valid text',
          title: 'Missing Key',
          url: 'https://example.com/ok',
        },
      });
      expect(resMissingKey.statusCode).toBe(400);
      expect(JSON.parse(resMissingKey.body).error.code).toBe(AppErrorCode.BAD_REQUEST);
    });

    it('P5-E2-T3: Retry Idempotency — re-submitting same idempotencyKey returns cached response without duplicate work', async () => {
      const fixedKey = randomUUID();
      const createPageSpy = vi.spyOn(NotionService.prototype, 'createPage').mockResolvedValueOnce({
        pageId: '33333333-4444-5555-6666-777777777777',
        notionUrl: 'https://notion.so/33333333444455556666777777777777',
      });

      // First call
      const res1 = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: userACookie },
        payload: {
          idempotencyKey: fixedKey,
          text: 'Testing retry idempotency guarantee.',
          title: 'Idempotency Doc',
          url: 'https://idempotency.org/docs',
        },
      });
      expect(res1.statusCode).toBe(200);
      const body1 = JSON.parse(res1.body);
      expect(body1.success).toBe(true);
      expect(body1.isDuplicate).toBeUndefined();

      // Second identical call (network retry)
      const res2 = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: userACookie },
        payload: {
          idempotencyKey: fixedKey,
          text: 'Testing retry idempotency guarantee.',
          title: 'Idempotency Doc',
          url: 'https://idempotency.org/docs',
        },
      });
      expect(res2.statusCode).toBe(200);
      const body2 = JSON.parse(res2.body);
      expect(body2.success).toBe(true);
      expect(body2.isDuplicate).toBe(true);
      expect(body2.highlightId).toBe(body1.highlightId);
      expect(body2.notionUrl).toBe(body1.notionUrl);

      // Notion API must ONLY have been called once
      expect(createPageSpy).toHaveBeenCalledTimes(1);
    });

    it('Auto-create default database flow via POST /api/notion/database/create', async () => {
      const autoCreatedDbId = 'auto-created-database-id-999';

      vi.spyOn(NotionService.prototype, 'createDefaultDatabase').mockResolvedValueOnce({
        id: autoCreatedDbId,
        title: 'Web Highlights',
        alreadyExisted: false,
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/notion/database/create',
        headers: { cookie: userACookie },
        payload: { title: 'Web Highlights' },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.databaseId).toBe(autoCreatedDbId);
      expect(body.databaseTitle).toBe('Web Highlights');
      expect(body.alreadyExisted).toBe(false);

      // Verify connection in DB was updated to the new database
      const updatedConn = await prisma.notionConnection.findUnique({
        where: { userId: userAId },
      });
      expect(updatedConn?.databaseId).toBe(autoCreatedDbId);
    });

    it('Database deduplication: re-creating existing database returns existing DB and alreadyExisted: true', async () => {
      const autoCreatedDbId = 'auto-created-database-id-999';

      vi.spyOn(NotionService.prototype, 'createDefaultDatabase').mockResolvedValueOnce({
        id: autoCreatedDbId,
        title: 'Web Highlights',
        alreadyExisted: true,
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/notion/database/create',
        headers: { cookie: userACookie },
        payload: { title: 'Web Highlights' },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.alreadyExisted).toBe(true);
      expect(body.databaseId).toBe(autoCreatedDbId);
    });

    it('Database Switch Isolation: Highlighting same URL after changing destination database creates a NEW source in new DB', async () => {
      // User A is now connected to autoCreatedDbId ('auto-created-database-id-999')
      // Highlighting the same article URL from Test 1 should now create a NEW page in the NEW database!
      const newDbPageId = '99999999-8888-7777-6666-555555555555';
      const createPageSpy = vi.spyOn(NotionService.prototype, 'createPage').mockResolvedValueOnce({
        pageId: newDbPageId,
        notionUrl: `https://notion.so/${newDbPageId.replace(/-/g, '')}`,
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/highlights',
        headers: { cookie: userACookie },
        payload: {
          idempotencyKey: randomUUID(),
          text: 'This highlight belongs to the newly selected database.',
          title: 'Spotify System Architecture',
          url: 'https://engineering.atspotify.com/2026/01/system-architecture/',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.isNewSource).toBe(true); // Must be a new source for this new database!
      expect(body.notionPageId).toBe(newDbPageId);
      expect(createPageSpy).toHaveBeenCalledTimes(1);

      // Verify the new source in DB is scoped to the new database
      const newSource = await prisma.source.findUnique({
        where: { id: body.sourceId },
      });
      expect(newSource?.databaseId).toBe('auto-created-database-id-999');
      expect(newSource?.notionPageId).toBe(newDbPageId);
    });
  });
});
