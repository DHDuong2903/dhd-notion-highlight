import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { encryptToken, decryptToken, createOAuthState, verifyOAuthState } from '../utils/crypto.js';
import { NotionService } from '../services/notion.js';
import {
  AppErrorCode,
  selectDatabaseSchema,
  createDatabaseSchema,
  type NotionStatusResponse,
} from '@notion-highlight/shared';

export const notionRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/notion/connect — Generates OAuth authorization URL
  fastify.get('/api/notion/connect', { preHandler: requireAuth }, async (request, reply) => {
    const sessionUser = request.sessionUser!;

    const clientId = process.env.NOTION_CLIENT_ID || env.NOTION_CLIENT_ID;
    const clientSecret = process.env.NOTION_CLIENT_SECRET || env.NOTION_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return reply.status(400).send({
        error: {
          code: AppErrorCode.BAD_REQUEST,
          message:
            'Notion OAuth is not configured on server. Please set NOTION_CLIENT_ID and NOTION_CLIENT_SECRET in environment.',
        },
      });
    }

    const state = createOAuthState(sessionUser.id);
    const redirectUri = encodeURIComponent(env.NOTION_REDIRECT_URI);
    const encodedState = encodeURIComponent(state);

    const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}&state=${encodedState}`;

    const query = request.query as { redirect?: string };
    if (query?.redirect === 'true') {
      return reply.redirect(authUrl);
    }

    return reply.status(200).send({ url: authUrl });
  });

  // GET /api/notion/callback — OAuth redirect callback
  fastify.get('/api/notion/callback', async (request, reply) => {
    const query = request.query as {
      code?: string;
      state?: string;
      error?: string;
    };

    reply.type('text/html');

    if (query.error) {
      return reply.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Notion Connection Error</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #fff;">
            <h2>❌ Connection Denied</h2>
            <p style="color: #94a3b8;">${query.error}</p>
            <p>You can close this window and try again in the extension.</p>
          </body>
        </html>
      `);
    }

    if (!query.code || !query.state) {
      return reply.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Invalid OAuth Request</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #fff;">
            <h2>❌ Missing Authorization Code or State</h2>
            <p>You can close this window and try again.</p>
          </body>
        </html>
      `);
    }

    const userId = verifyOAuthState(query.state);
    if (!userId) {
      return reply.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Invalid State</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #fff;">
            <h2>❌ Security Verification Failed</h2>
            <p style="color: #94a3b8;">The OAuth state signature could not be verified.</p>
          </body>
        </html>
      `);
    }

    try {
      const clientId = process.env.NOTION_CLIENT_ID || env.NOTION_CLIENT_ID;
      const clientSecret = process.env.NOTION_CLIENT_SECRET || env.NOTION_CLIENT_SECRET;
      const basicAuth = Buffer.from(
        `${clientId}:${clientSecret}`,
      ).toString('base64');

      const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: query.code,
          redirect_uri: env.NOTION_REDIRECT_URI,
        }),
      });

      const tokenData = (await tokenRes.json()) as any;

      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData?.error || 'Failed to exchange authorization code for token');
      }

      // Encrypt access token
      const accessTokenEncrypted = encryptToken(tokenData.access_token);

      // Upsert connection
      await prisma.notionConnection.upsert({
        where: { userId },
        update: {
          workspaceId: tokenData.workspace_id || 'unknown',
          accessTokenEncrypted,
        },
        create: {
          userId,
          workspaceId: tokenData.workspace_id || 'unknown',
          accessTokenEncrypted,
        },
      });

      return reply.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Notion Connected</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background: #0f172a;
                color: #f8fafc;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .box {
                background: #1e293b;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 32px 40px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              }
              .btn {
                margin-top: 20px;
                padding: 10px 20px;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
              }
            </style>
          </head>
          <body>
            <div class="box">
              <div style="font-size: 40px; margin-bottom: 12px;">🎉</div>
              <h2 style="margin: 0 0 8px;">Notion Connected!</h2>
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px;">
                Your workspace <strong>${tokenData.workspace_name || ''}</strong> has been linked successfully.
              </p>
              <button class="btn" onclick="window.close()">Close Window</button>
            </div>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage({ type: 'NOTION_AUTH_SUCCESS' }, '*');
                  setTimeout(() => window.close(), 1500);
                }
              } catch (e) {}
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      return reply.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Connection Failed</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #fff;">
            <h2>❌ Connection Failed</h2>
            <p style="color: #f87171;">${err?.message || 'Internal error'}</p>
          </body>
        </html>
      `);
    }
  });

  // GET /api/notion/status — Connection status and selected database info
  fastify.get('/api/notion/status', { preHandler: requireAuth }, async (request, reply) => {
    const sessionUser = request.sessionUser!;

    const connection = await prisma.notionConnection.findUnique({
      where: { userId: sessionUser.id },
    });

    if (!connection) {
      const emptyStatus: NotionStatusResponse = {
        isConnected: false,
      };
      return reply.status(200).send(emptyStatus);
    }

    let databaseTitle: string | null = null;
    if (connection.databaseId) {
      try {
        const token = decryptToken(connection.accessTokenEncrypted);
        const notion = new NotionService({ auth: token });
        databaseTitle = await notion.getDatabaseTitle(connection.databaseId);
      } catch {
        databaseTitle = 'Selected Database';
      }
    }

    const response: NotionStatusResponse = {
      isConnected: true,
      workspaceId: connection.workspaceId,
      databaseId: connection.databaseId,
      databaseTitle,
    };

    return reply.status(200).send(response);
  });

  // GET /api/notion/databases — List user's Notion databases
  fastify.get('/api/notion/databases', { preHandler: requireAuth }, async (request, reply) => {
    const sessionUser = request.sessionUser!;

    const connection = await prisma.notionConnection.findUnique({
      where: { userId: sessionUser.id },
    });

    if (!connection) {
      return reply.status(400).send({
        error: {
          code: AppErrorCode.NOTION_NOT_CONNECTED,
          message: 'Notion is not connected. Please connect your Notion account first.',
        },
      });
    }

    try {
      const token = decryptToken(connection.accessTokenEncrypted);
      const notion = new NotionService({ auth: token });
      const databases = await notion.searchDatabases();

      return reply.status(200).send({ databases });
    } catch (err: any) {
      return reply.status(err?.statusCode || 500).send({
        error: {
          code: err?.code || AppErrorCode.NOTION_API_ERROR,
          message: err?.message || 'Failed to fetch Notion databases',
        },
      });
    }
  });

  // POST /api/notion/database — Select target database
  fastify.post('/api/notion/database', { preHandler: requireAuth }, async (request, reply) => {
    const sessionUser = request.sessionUser!;

    const parseResult = selectDatabaseSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: AppErrorCode.BAD_REQUEST,
          message: parseResult.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const { databaseId } = parseResult.data;

    const connection = await prisma.notionConnection.findUnique({
      where: { userId: sessionUser.id },
    });

    if (!connection) {
      return reply.status(400).send({
        error: {
          code: AppErrorCode.NOTION_NOT_CONNECTED,
          message: 'Notion is not connected. Please connect your Notion account first.',
        },
      });
    }

    let targetDbId = databaseId;

    try {
      // Validate database access
      const token = decryptToken(connection.accessTokenEncrypted);
      const notion = new NotionService({ auth: token });

      try {
        await notion.getDatabase(targetDbId);
      } catch (err) {
        // Fallback: In case client sent a data_source ID, resolve the real database ID
        const dbs = await notion.searchDatabases();
        const found = dbs.find((d) => d.id === targetDbId) || dbs[0];
        if (found) {
          targetDbId = found.id;
          await notion.getDatabase(targetDbId);
        } else {
          throw err;
        }
      }

      // Save databaseId to NotionConnection
      await prisma.notionConnection.update({
        where: { userId: sessionUser.id },
        data: { databaseId: targetDbId },
      });

      const title = await notion.getDatabaseTitle(targetDbId);

      return reply.status(200).send({
        success: true,
        databaseId: targetDbId,
        databaseTitle: title,
      });
    } catch (err: any) {
      return reply.status(err?.statusCode || 500).send({
        error: {
          code: err?.code || AppErrorCode.NOTION_API_ERROR,
          message: err?.message || 'Failed to verify Notion database',
        },
      });
    }
  });

  // POST /api/notion/database/create — Auto-create or link custom/default database
  fastify.post('/api/notion/database/create', { preHandler: requireAuth }, async (request, reply) => {
    const sessionUser = request.sessionUser!;

    const parseResult = createDatabaseSchema.safeParse(request.body || {});
    const customTitle = parseResult.success ? parseResult.data.title : undefined;

    const connection = await prisma.notionConnection.findUnique({
      where: { userId: sessionUser.id },
    });

    if (!connection) {
      return reply.status(400).send({
        error: {
          code: AppErrorCode.NOTION_NOT_CONNECTED,
          message: 'Notion is not connected. Please connect your Notion account first.',
        },
      });
    }

    try {
      const token = decryptToken(connection.accessTokenEncrypted);
      const notion = new NotionService({ auth: token });

      const newDb = await notion.createDefaultDatabase(customTitle);

      // Automatically set this as the active database
      await prisma.notionConnection.update({
        where: { userId: sessionUser.id },
        data: { databaseId: newDb.id },
      });

      return reply.status(201).send({
        success: true,
        databaseId: newDb.id,
        databaseTitle: newDb.title,
        alreadyExisted: !!newDb.alreadyExisted,
      });
    } catch (err: any) {
      return reply.status(err?.statusCode || 500).send({
        error: {
          code: err?.code || AppErrorCode.NOTION_API_ERROR,
          message: err?.message || 'Failed to setup Notion database',
        },
      });
    }
  });

  // DELETE /api/notion/connection — Disconnect Notion
  fastify.delete('/api/notion/connection', { preHandler: requireAuth }, async (request, reply) => {
    const sessionUser = request.sessionUser!;

    await prisma.notionConnection.deleteMany({
      where: { userId: sessionUser.id },
    });

    return reply.status(200).send({
      message: 'Notion disconnected successfully',
    });
  });
};
