import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { canonicalizeUrl } from '../utils/url.js';
import { requireAuth } from '../middleware/auth.js';
import { decryptToken } from '../utils/crypto.js';
import { NotionService } from '../services/notion.js';
import {
  AppErrorCode,
  createHighlightSchema,
  AnalyticsEvents,
  sanitizeDomain,
} from '@notion-highlight/shared';
import { serverTelemetry } from '../lib/telemetry.js';
import { serverErrorTracker } from '../lib/errorTracker.js';

// Quota limits
const QUOTA = {
  FREE: 100,
  PRO: 10000,
};

export const highlightRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/highlights
  fastify.post('/api/highlights', { preHandler: requireAuth }, async (request, reply) => {
    const sessionUser = request.sessionUser!;

    // 1. Validate input
    const parseResult = createHighlightSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: AppErrorCode.BAD_REQUEST,
          message: parseResult.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const { idempotencyKey, text, title, url } = parseResult.data;

    // 2. Check idempotency — return existing result for duplicate keys
    const existing = await prisma.highlight.findUnique({
      where: { idempotencyKey },
      include: { source: true },
    });
    if (existing) {
      const notionUrl = existing.source.notionPageId
        ? `https://notion.so/${existing.source.notionPageId.replace(/-/g, '')}`
        : undefined;

      return reply.status(200).send({
        success: true,
        highlightId: existing.id,
        sourceId: existing.sourceId,
        notionPageId: existing.source.notionPageId,
        notionUrl,
        isNewSource: false,
        isDuplicate: true,
        status: existing.status,
        message: 'Highlight already saved (idempotent response)',
      });
    }

    // 3. Quota check (before writing anything)
    const quotaLimit = QUOTA[sessionUser.plan as keyof typeof QUOTA] ?? QUOTA.FREE;
    const highlightCount = await prisma.highlight.count({
      where: { userId: sessionUser.id, status: 'SYNCED' },
    });
    if (highlightCount >= quotaLimit) {
      return reply.status(429).send({
        error: {
          code: AppErrorCode.QUOTA_EXCEEDED,
          message: `Highlight quota exceeded (${quotaLimit} on ${sessionUser.plan} plan)`,
        },
      });
    }

    // 4. Check Notion connection to identify target database
    const connection = await prisma.notionConnection.findUnique({
      where: { userId: sessionUser.id },
    });
    const targetDbId = connection?.databaseId || '';

    // 5. Canonicalize URL & look up source scoped to the target database
    const canonicalUrl = canonicalizeUrl(url);

    let source = await prisma.source.findUnique({
      where: {
        userId_canonicalUrl_databaseId: {
          userId: sessionUser.id,
          canonicalUrl,
          databaseId: targetDbId,
        },
      },
    });

    const isNewSource = source === null;

    if (!source) {
      // Create new source scoped to this database
      source = await prisma.source.create({
        data: {
          userId: sessionUser.id,
          canonicalUrl,
          originalUrl: url,
          title,
          databaseId: targetDbId,
        },
      });
    }

    // 6. Create Highlight record
    const highlight = await prisma.highlight.create({
      data: {
        userId: sessionUser.id,
        sourceId: source.id,
        content: text,
        status: 'PENDING',
        idempotencyKey,
      },
    });

    // 7. Sync to Notion if connected and database is chosen
    if (connection && connection.databaseId) {
      try {
        const token = decryptToken(connection.accessTokenEncrypted);
        const notion = new NotionService({ auth: token });

        let notionPageId = source.notionPageId;

        if (!notionPageId) {
          // Task P4-E3-T1: Create new Notion page
          const created = await notion.createPage({
            databaseId: connection.databaseId,
            title: source.title,
            url: source.canonicalUrl,
            highlightText: text,
          });

          notionPageId = created.pageId;

          // Update source with new Notion page ID
          await prisma.source.update({
            where: { id: source.id },
            data: { notionPageId },
          });
        } else {
          // Task P4-E3-T2: Append highlight to existing Notion page
          await notion.appendHighlight(notionPageId, text);
        }

        // Update highlight status to SYNCED
        await prisma.highlight.update({
          where: { id: highlight.id },
          data: { status: 'SYNCED' },
        });

        // Log successful sync
        await prisma.syncLog.create({
          data: {
            userId: sessionUser.id,
            highlightId: highlight.id,
            status: 'SUCCESS',
          },
        });

        // Track successful highlight saved (Phase 6)
        await serverTelemetry.track(
          AnalyticsEvents.HIGHLIGHT_SAVED,
          {
            isNewSource,
            domain: sanitizeDomain(url),
            charLength: text.length,
            status: 'SYNCED',
          },
          sessionUser.id,
        );

        const notionUrl = `https://notion.so/${notionPageId.replace(/-/g, '')}`;

        return reply.status(200).send({
          success: true,
          highlightId: highlight.id,
          sourceId: source.id,
          notionPageId,
          notionUrl,
          isNewSource,
          status: 'SYNCED',
          message: isNewSource
            ? 'Created new Notion page with highlight'
            : 'Appended highlight to existing Notion page',
        });
      } catch (err: any) {
        // Notion sync failure: mark as FAILED and log
        await prisma.highlight.update({
          where: { id: highlight.id },
          data: { status: 'FAILED' },
        });

        await prisma.syncLog.create({
          data: {
            userId: sessionUser.id,
            highlightId: highlight.id,
            status: 'FAILED',
            errorCode: err?.code || 'NOTION_SYNC_FAILED',
          },
        });

        // Track failed highlight sync (Phase 6)
        await serverTelemetry.track(
          AnalyticsEvents.HIGHLIGHT_SAVE_FAILED,
          {
            errorCode: err?.code || 'NOTION_SYNC_FAILED',
            domain: sanitizeDomain(url),
            charLength: text.length,
          },
          sessionUser.id,
        );

        // Report Notion sync exception to Sentry (Phase 6)
        await serverErrorTracker.captureException(err, {
          userId: sessionUser.id,
          highlightId: highlight.id,
          sourceId: source.id,
          domain: sanitizeDomain(url),
          tags: {
            component: 'notion_sync',
            errorCode: err?.code || 'UNKNOWN',
          },
        });

        return reply.status(200).send({
          success: true,
          highlightId: highlight.id,
          sourceId: source.id,
          notionPageId: source.notionPageId,
          isNewSource,
          status: 'FAILED',
          message: `Saved to database, but Notion sync failed: ${err?.message || 'API error'}`,
        });
      }
    }

    // 8. If Notion is not connected, keep highlight as PENDING
    await prisma.syncLog.create({
      data: {
        userId: sessionUser.id,
        highlightId: highlight.id,
        status: 'FAILED',
        errorCode: 'NOTION_NOT_CONNECTED',
      },
    });

    // Track pending highlight save (Phase 6)
    await serverTelemetry.track(
      AnalyticsEvents.HIGHLIGHT_SAVED,
      {
        isNewSource,
        domain: sanitizeDomain(url),
        charLength: text.length,
        status: 'PENDING',
      },
      sessionUser.id,
    );

    return reply.status(202).send({
      success: true,
      highlightId: highlight.id,
      sourceId: source.id,
      notionPageId: source.notionPageId,
      isNewSource,
      status: 'PENDING',
      message:
        'Highlight saved to database. Connect Notion in extension to sync directly to Notion.',
    });
  });

  // GET /api/highlights — list user's highlights
  fastify.get('/api/highlights', { preHandler: requireAuth }, async (request, reply) => {
    const sessionUser = request.sessionUser!;

    const highlights = await prisma.highlight.findMany({
      where: { userId: sessionUser.id },
      include: {
        source: { select: { canonicalUrl: true, title: true, notionPageId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return reply.status(200).send({ highlights });
  });
};
