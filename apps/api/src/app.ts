import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { healthRoutes } from './routes/health.js';
import { env } from './config/env.js';

export function buildApp(opts: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify(opts);

  // Plugins
  app.register(sensible);
  app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : [env.CORS_ORIGIN],
    credentials: true,
  });

  // Root route
  app.get('/', async (_request, reply) => {
    return reply.status(200).send({
      name: 'Notion Highlight Sync API',
      status: 'running',
      version: '0.1.0',
      health: '/api/health',
    });
  });

  // Routes
  app.register(healthRoutes);

  return app;
}
