import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { canonicalizeUrl } from '../utils/url.js';
import { requireAuth } from '../middleware/auth.js';
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
      // 5a. Create new source (Notion page will be created in Phase 4)
      source = await prisma.source.create({
        data: {
          userId: sessionUser.id,
          canonicalUrl,
          originalUrl: url,
          title,
        },
      });
    }

    // 6. Create Highlight record as PENDING
    const highlight = await prisma.highlight.create({
      data: {
        userId: sessionUser.id,
        sourceId: source.id,
        content: text,
        status: 'PENDING',
        idempotencyKey,
      },
    });

    // 7. Log sync attempt (PENDING — Notion sync happens in Phase 4)
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
        'Highlight saved. Notion sync will be completed after Notion connection is established (Phase 4).',
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
