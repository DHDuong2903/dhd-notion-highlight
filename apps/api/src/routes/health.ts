import { FastifyPluginAsync } from 'fastify';
import { healthResponseSchema } from '@notion-highlight/shared';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/health', async (_request, reply) => {
    const response = healthResponseSchema.parse({ status: 'ok' });
    return reply.status(200).send(response);
  });
};
