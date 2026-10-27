import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { canonicalizeUrl } from '../utils/url.js';
import { requireAuth } from '../middleware/auth.js';
import { decryptToken } from '../utils/crypto.js';
import { NotionService } from '../services/notion.js';
import { AppErrorCode, createHighlightSchema } from '@notion-highlight/shared';

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
      return reply.status(200).send({
        success: true,
        highlightId: existing.id,
        sourceId: existing.sourceId,
        notionPageId: existing.source.notionPageId,
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

    // 4. Canonicalize URL & look up source
    const canonicalUrl = canonicalizeUrl(url);

    let source = await prisma.source.findUnique({
      where: {
        userId_canonicalUrl: { userId: sessionUser.id, canonicalUrl },
      },
    });

    const isNewSource = source === null;

    if (!source) {
      // 5a. Create new source
      source = await prisma.source.create({
        data: {
          userId: sessionUser.id,
          canonicalUrl,
          originalUrl: url,
          title,
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

    // 7. Check if user has connected Notion and selected a database
    const connection = await prisma.notionConnection.findUnique({
      where: { userId: sessionUser.id },
    });

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

        return reply.status(200).send({
          success: true,
          highlightId: highlight.id,
          sourceId: source.id,
          notionPageId,
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
