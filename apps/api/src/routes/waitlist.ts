import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { waitlistSchema, AppErrorCode, AnalyticsEvents } from '@notion-highlight/shared';
import { serverTelemetry } from '../lib/telemetry.js';

export const waitlistRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/waitlist — Join beta waitlist and optionally submit demand validation survey
  fastify.post('/api/waitlist', async (request, reply) => {
    const parseResult = waitlistSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: AppErrorCode.BAD_REQUEST,
          message: parseResult.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const { email, currentTools, useNotion, destinations, willingToPay, feedback, source } =
      parseResult.data;

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.waitlistEntry.findUnique({
      where: { email: normalizedEmail },
    });

    const isExisting = !!existing;

    // Upsert entry so users can submit initial email and then complete survey answers
    const entry = await prisma.waitlistEntry.upsert({
      where: { email: normalizedEmail },
      update: {
        currentTools: currentTools ?? existing?.currentTools,
        useNotion: useNotion ?? existing?.useNotion,
        destinations: destinations ?? existing?.destinations,
        willingToPay: willingToPay ?? existing?.willingToPay,
        feedback: feedback ?? existing?.feedback,
        source: source ?? existing?.source,
      },
      create: {
        email: normalizedEmail,
        currentTools,
        useNotion,
        destinations,
        willingToPay,
        feedback,
        source: source || 'landing_page',
      },
    });

    const hasSurvey = !!(currentTools || destinations || willingToPay || feedback);

    // Track waitlist event in PostHog (Phase 6 & 7)
    await serverTelemetry.track(
      AnalyticsEvents.WAITLIST_SUBMITTED,
      {
        source: entry.source,
        hasSurvey,
      },
      `waitlist_${entry.id}`,
    );

    if (hasSurvey) {
      await serverTelemetry.track(
        AnalyticsEvents.SURVEY_SUBMITTED,
        {
          currentTools: currentTools || 'none',
          destinations: destinations || 'none',
          willingToPay: willingToPay || 'not_specified',
        },
        `waitlist_${entry.id}`,
      );
    }

    return reply.status(200).send({
      success: true,
      message: isExisting
        ? 'Your waitlist information has been updated. Thank you!'
        : "You're on the list! We'll reach out as soon as Closed Beta invites open.",
      isExisting,
    });
  });

  // GET /api/waitlist/stats — Public count for social proof
  fastify.get('/api/waitlist/stats', async (_request, reply) => {
    const totalCount = await prisma.waitlistEntry.count();
    // Start with a small baseline for social proof (e.g., 24 initial testers)
    const displayCount = Math.max(totalCount + 28, 28);

    return reply.status(200).send({
      count: displayCount,
    });
  });
};
