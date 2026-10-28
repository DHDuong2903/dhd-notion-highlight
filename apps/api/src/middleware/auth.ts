import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { AppErrorCode } from '@notion-highlight/shared';
import { prisma } from '../lib/prisma.js';

/**
 * requireAuth hook: must run before any route handler that requires authentication.
 * Reads userId from session and attaches user to request.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.session?.userId;
  if (!userId) {
    return reply.status(401).send({
      error: {
        code: AppErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
      },
    });
  }

  // Verify user still exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, plan: true },
  });

  if (!user) {
    await request.session.destroy();
    return reply.status(401).send({
      error: {
        code: AppErrorCode.UNAUTHORIZED,
        message: 'Session expired',
      },
    });
  }

  // Attach user to request for downstream handlers
  request.sessionUser = user;
}

export const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Decorate request with sessionUser shape
  fastify.decorateRequest('sessionUser', null);
};
