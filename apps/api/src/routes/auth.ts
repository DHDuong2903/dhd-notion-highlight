import { FastifyPluginAsync } from 'fastify';
import argon2 from 'argon2';
import { prisma } from '../lib/prisma.js';
import {
  AppErrorCode,
  registerSchema,
  loginSchema,
  AnalyticsEvents,
} from '@notion-highlight/shared';
import { serverTelemetry } from '../lib/telemetry.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/auth/register
  fastify.post('/api/auth/register', async (request, reply) => {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: AppErrorCode.BAD_REQUEST,
          message: parseResult.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const { email, password } = parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.status(409).send({
        error: {
          code: AppErrorCode.CONFLICT,
          message: 'Email address is already registered',
        },
      });
    }

    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, plan: true, createdAt: true },
    });

    // Set session
    request.session.userId = user.id;

    // Track registration event (Phase 6)
    await serverTelemetry.track(AnalyticsEvents.USER_REGISTERED, { authMethod: 'email' }, user.id);
    await serverTelemetry.identify(user.id, { plan: user.plan });

    return reply.status(201).send({ user });
  });

  // POST /api/auth/login
  fastify.post('/api/auth/login', async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: AppErrorCode.BAD_REQUEST,
          message: parseResult.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({
        error: {
          code: AppErrorCode.UNAUTHORIZED,
          message: 'Invalid email or password',
        },
      });
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return reply.status(401).send({
        error: {
          code: AppErrorCode.UNAUTHORIZED,
          message: 'Invalid email or password',
        },
      });
    }

    // Set session
    request.session.userId = user.id;

    // Track login event (Phase 6)
    await serverTelemetry.track(AnalyticsEvents.USER_LOGGED_IN, { authMethod: 'email' }, user.id);

    return reply.status(200).send({
      user: { id: user.id, email: user.email, plan: user.plan },
    });
  });

  // POST /api/auth/logout
  fastify.post('/api/auth/logout', async (request, reply) => {
    await request.session.destroy();
    return reply.status(200).send({ message: 'Logged out successfully' });
  });

  // GET /api/auth/me — returns current session user
  fastify.get('/api/auth/me', async (request, reply) => {
    const userId = request.session.userId;
    if (!userId) {
      return reply.status(401).send({
        error: {
          code: AppErrorCode.UNAUTHORIZED,
          message: 'Not authenticated',
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, plan: true, createdAt: true },
    });

    if (!user) {
      await request.session.destroy();
      return reply.status(401).send({
        error: {
          code: AppErrorCode.UNAUTHORIZED,
          message: 'Session user not found',
        },
      });
    }

    return reply.status(200).send({ user });
  });
};
