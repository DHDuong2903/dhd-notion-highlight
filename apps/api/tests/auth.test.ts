import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { AppErrorCode } from '@notion-highlight/shared';

describe('Auth API Endpoints', () => {
  const app = buildApp({ logger: false });
  const testEmail = `test-user-${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let sessionCookie: string;

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    // Cleanup test user
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'test-user-' } },
      });
    } catch {
      // ignore
    }
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should reject invalid email or short password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'invalid-email',
          password: '123',
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe(AppErrorCode.BAD_REQUEST);
    });

    it('should register a new user and set session cookie', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe(testEmail);
      expect(body.user.plan).toBe('FREE');
      expect(body.user).not.toHaveProperty('passwordHash');

      // Check cookie is set
      const cookies = res.cookies;
      expect(cookies.length).toBeGreaterThan(0);
      const sessionIdCookie = cookies.find((c) => c.name === 'sessionId');
      expect(sessionIdCookie).toBeDefined();
      sessionCookie = res.headers['set-cookie'] as string;
    });

    it('should return 409 Conflict if email is already registered', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      });

      expect(res.statusCode).toBe(409);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe(AppErrorCode.CONFLICT);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for non-existent email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'nobody@example.com',
          password: 'Password123!',
        },
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe(AppErrorCode.UNAUTHORIZED);
    });

    it('should return 401 for wrong password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: testEmail,
          password: 'WrongPassword!',
        },
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe(AppErrorCode.UNAUTHORIZED);
    });

    it('should successfully log in with correct credentials', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.user.email).toBe(testEmail);
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  describe('GET /api/auth/me & POST /api/auth/logout', () => {
    it('should return 401 when no session cookie is sent', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe(AppErrorCode.UNAUTHORIZED);
    });

    it('should return user info when valid session cookie is sent', async () => {
      // First login to get a fresh session cookie
      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: testEmail, password: testPassword },
      });
      const cookieHeader = loginRes.headers['set-cookie'] as string;

      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          cookie: cookieHeader,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.user.email).toBe(testEmail);
    });

    it('should clear session on logout', async () => {
      // Login
      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: testEmail, password: testPassword },
      });
      const cookieHeader = loginRes.headers['set-cookie'] as string;

      // Logout
      const logoutRes = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
        headers: { cookie: cookieHeader },
      });
      expect(logoutRes.statusCode).toBe(200);

      // Me should now fail
      const meRes = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: { cookie: cookieHeader },
      });
      expect(meRes.statusCode).toBe(401);
    });
  });
});
