import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { NotionService, NotionAppError } from '../services/notion.js';
import { canonicalizeUrl } from '../utils/url.js';
import { env } from '../config/env.js';

const prototypeHighlightSchema = z.object({
  text: z.string().trim().min(1, { message: 'Highlight text is required' }),
  title: z.string().trim().default('Untitled Page'),
  url: z.string().url({ message: 'Must be a valid URL' }),
  databaseId: z.string().optional(),
});

export const prototypeRoutes: FastifyPluginAsync = async (fastify) => {
  // Service instance using environment token
  const notionService = new NotionService({
    auth: env.NOTION_API_KEY,
  });

  // Check Prototype Notion connection status
  fastify.get('/api/prototype/status', async (_request, reply) => {
    const isConfigured = Boolean(env.NOTION_API_KEY && env.NOTION_DATABASE_ID);

    if (!isConfigured) {
      return reply.status(200).send({
        configured: false,
        message:
          'NOTION_API_KEY and NOTION_DATABASE_ID are not set in apps/api/.env. Set them to test live Notion operations.',
      });
    }

    try {
      const conn = await notionService.testConnection();
      return reply.status(200).send({
        configured: true,
        connected: conn.ok,
        botName: conn.botName,
        databaseId: env.NOTION_DATABASE_ID,
      });
    } catch (err) {
      if (err instanceof NotionAppError) {
        return reply.status(err.statusCode).send({
          configured: true,
          connected: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
      }
      return reply.status(500).send({
        configured: true,
        connected: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: err instanceof Error ? err.message : 'Unknown error',
        },
      });
    }
  });

  // Prototype highlight sync: creates page or appends to existing page based on URL
  fastify.post('/api/prototype/highlight', async (request, reply) => {
    const parseResult = prototypeHighlightSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_INPUT',
          message: parseResult.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const { text, title, url, databaseId: bodyDbId } = parseResult.data;
    const databaseId = bodyDbId || env.NOTION_DATABASE_ID;

    if (!databaseId) {
      return reply.status(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'Database ID must be provided in request body or NOTION_DATABASE_ID in .env',
        },
      });
    }

    if (!env.NOTION_API_KEY) {
      return reply.status(503).send({
        error: {
          code: 'NOTION_NOT_CONNECTED',
          message: 'NOTION_API_KEY is not configured in apps/api/.env',
        },
      });
    }

    const canonicalUrl = canonicalizeUrl(url);

    try {
      const result = await notionService.saveHighlight({
        databaseId,
        title,
        url: canonicalUrl,
        highlightText: text,
      });

      return reply.status(200).send({
        success: true,
        pageId: result.pageId,
        isNewSource: result.isNewSource,
        canonicalUrl,
        notionPageUrl: result.notionPageUrl,
        message: result.isNewSource
          ? 'Created new Notion page for source'
          : 'Appended highlight block to existing Notion source page',
      });
    } catch (err) {
      if (err instanceof NotionAppError) {
        return reply.status(err.statusCode).send({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
      }

      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: err instanceof Error ? err.message : 'Unknown error during Notion sync',
        },
      });
    }
  });
};
