import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import cookie from '@fastify/cookie';
import session from '@fastify/session';
import { healthRoutes } from './routes/health.js';
import { prototypeRoutes } from './routes/prototype.js';
import { authRoutes } from './routes/auth.js';
import { highlightRoutes } from './routes/highlights.js';
import { notionRoutes } from './routes/notion.js';
import { telemetryRoutes } from './routes/telemetry.js';
import { authPlugin } from './middleware/auth.js';
import { env } from './config/env.js';
import { serverErrorTracker } from './lib/errorTracker.js';

export function buildApp(opts: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify(opts);

  // Global Error Hook (Phase 6 - Error Tracking)
  app.addHook('onError', async (request, _reply, error) => {
    await serverErrorTracker.captureException(error, {
      userId: request.sessionUser?.id,
      url: request.url,
      method: request.method,
      statusCode: error.statusCode || 500,
    });
  });

  // Plugins
  app.register(sensible);
  app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : [env.CORS_ORIGIN],
    credentials: true,
  });

  app.register(cookie);
  app.register(session, {
    secret: env.SESSION_SECRET,
    cookie: {
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  });
  app.register(authPlugin);

  // Root route
  app.get('/', async (_request, reply) => {
    return reply.status(200).send({
      name: 'Notion Highlight Sync API',
      status: 'running',
      version: '0.1.0',
      health: '/api/health',
      prototypeStatus: '/api/prototype/status',
    });
  });

  // Routes
  app.register(healthRoutes);
  app.register(prototypeRoutes);
  app.register(authRoutes);
  app.register(highlightRoutes);
  app.register(notionRoutes);
  app.register(telemetryRoutes);

  return app;
}
