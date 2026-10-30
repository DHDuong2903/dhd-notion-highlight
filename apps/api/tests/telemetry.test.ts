import { describe, it, expect, vi } from 'vitest';
import { sanitizeDomain, scrubSensitiveData, AnalyticsEvents } from '@notion-highlight/shared';
import { serverTelemetry } from '../src/lib/telemetry.js';
import { serverErrorTracker } from '../src/lib/errorTracker.js';
import { buildApp } from '../src/app.js';

describe('Phase 6 — Analytics & Privacy Sanitization', () => {
  describe('sanitizeDomain', () => {
    it('should extract lowercase hostname and strip ports and paths', () => {
      expect(sanitizeDomain('https://Sub.Example.COM:8080/path/to/page?query=1#frag')).toBe(
        'sub.example.com',
      );
    });

    it('should handle standard URLs cleanly', () => {
      expect(sanitizeDomain('https://notion.so/my-workspace')).toBe('notion.so');
      expect(sanitizeDomain('http://localhost:3000/test')).toBe('localhost');
    });

    it('should return unknown-domain for invalid strings without throwing', () => {
      expect(sanitizeDomain('not-a-valid-url')).toBe('unknown-domain');
      expect(sanitizeDomain('')).toBe('unknown-domain');
    });
  });

  describe('scrubSensitiveData', () => {
    it('should replace passwords, tokens, secrets, and auth keys with [REDACTED]', () => {
      const payload = {
        userId: 'usr_123',
        password: 'my-super-secret-password',
        accessToken: 'secret_notion_token_99999',
        clientSecret: 'shhh',
        cookieHeader: 'session=abcde',
        authorization: 'Bearer token',
      };

      const cleaned = scrubSensitiveData(payload);

      expect(cleaned.userId).toBe('usr_123');
      expect(cleaned.password).toBe('[REDACTED]');
      expect(cleaned.accessToken).toBe('[REDACTED]');
      expect(cleaned.clientSecret).toBe('[REDACTED]');
      expect(cleaned.cookieHeader).toBe('[REDACTED]');
      expect(cleaned.authorization).toBe('[REDACTED]');
    });

    it('should replace raw highlight content/text with character length to protect privacy', () => {
      const rawHighlight = {
        domain: 'techcrunch.com',
        content: 'This is a confidential private quote from an article.',
        text: 'Another short excerpt',
        isNewSource: true,
      };

      const cleaned: any = scrubSensitiveData(rawHighlight);

      expect(cleaned.domain).toBe('techcrunch.com');
      expect(cleaned.isNewSource).toBe(true);
      expect(cleaned.content).toBeUndefined();
      expect(cleaned.text).toBeUndefined();
      expect(cleaned.contentLength).toBe(53);
      expect(cleaned.textLength).toBe(21);
    });

    it('should recursively scrub nested objects and arrays', () => {
      const nested = {
        metadata: {
          authInfo: {
            token: 'secret123',
          },
        },
        items: [{ password: '123' }, { title: 'Safe Title' }],
      };

      const cleaned = scrubSensitiveData(nested);

      expect(cleaned.metadata.authInfo.token).toBe('[REDACTED]');
      expect(cleaned.items[0].password).toBe('[REDACTED]');
      expect(cleaned.items[1].title).toBe('Safe Title');
    });
  });

  describe('serverTelemetry & serverErrorTracker execution safety', () => {
    it('should track events without throwing in any environment', async () => {
      await expect(
        serverTelemetry.track(
          AnalyticsEvents.HIGHLIGHT_SAVED,
          {
            isNewSource: true,
            domain: 'github.com',
            charLength: 120,
            status: 'SYNCED',
          },
          'usr_test_123',
        ),
      ).resolves.not.toThrow();
    });

    it('should identify users safely without throwing', async () => {
      await expect(
        serverTelemetry.identify('usr_test_123', {
          plan: 'FREE',
        }),
      ).resolves.not.toThrow();
    });

    it('should capture exceptions with scrubbed context without throwing', async () => {
      const testError = new Error('Test Notion API connection failure');
      await expect(
        serverErrorTracker.captureException(testError, {
          userId: 'usr_test_123',
          tags: { component: 'test' },
          extra: { password: 'should-not-leak' },
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('Telemetry API Endpoints (/api/telemetry)', () => {
    const app = buildApp();

    it('GET /api/telemetry/config should return telemetry status and host', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/telemetry/config',
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data).toHaveProperty('enabled');
      expect(data).toHaveProperty('host');
      expect(data).toHaveProperty('hasKey');
    });

    it('POST /api/telemetry should accept events forwarded from the extension', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/telemetry',
        payload: {
          event: 'history_opened',
          properties: {
            itemsCount: 5,
            source: 'chrome-extension-unit-test',
          },
        },
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.success).toBe(true);
    });

    it('POST /api/telemetry should reject invalid payloads', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/telemetry',
        payload: {
          event: '', // empty event
        },
      });

      expect(res.statusCode).toBe(400);
    });
  });
});
