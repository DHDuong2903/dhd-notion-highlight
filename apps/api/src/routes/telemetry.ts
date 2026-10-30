import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';
import { serverTelemetry } from '../lib/telemetry.js';
import { scrubSensitiveData, AppErrorCode } from '@notion-highlight/shared';

const telemetrySchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.any()).optional().default({}),
});

export const telemetryRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/telemetry/config — Check telemetry status
  fastify.get('/api/telemetry/config', async (_request, reply) => {
    return reply.status(200).send({
      enabled: env.TELEMETRY_ENABLED && !!env.POSTHOG_API_KEY,
      host: env.POSTHOG_HOST,
      hasKey: !!env.POSTHOG_API_KEY,
    });
  });

  // POST /api/telemetry — Receive events from extension or frontend
  fastify.post('/api/telemetry', async (request, reply) => {
    const parseResult = telemetrySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: AppErrorCode.BAD_REQUEST,
          message: 'Invalid telemetry payload',
        },
      });
    }

    const { event, properties } = parseResult.data;
    const userId = request.sessionUser?.id || properties.distinct_id || 'ext-anonymous';

    const scrubbedProps = scrubSensitiveData({
      ...properties,
      source: 'chrome-extension',
    });

    await serverTelemetry.track(event as any, scrubbedProps, userId);

    return reply.status(200).send({ success: true });
  });
};
