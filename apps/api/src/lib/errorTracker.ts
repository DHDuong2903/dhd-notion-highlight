import { env } from '../config/env.js';
import { scrubSensitiveData } from '@notion-highlight/shared';
import { serverTelemetry } from './telemetry.js';

export interface ErrorContext {
  userId?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  [key: string]: any;
}

class ServerErrorTracker {
  /**
   * Captures and reports an exception with scrubbed context to PostHog and server logs.
   * Strips cookies, tokens, passwords, and raw highlight content before sending.
   */
  public async captureException(error: unknown, context: ErrorContext = {}): Promise<void> {
    try {
      const err = error instanceof Error ? error : new Error(String(error));
      const sanitizedContext = scrubSensitiveData({
        ...context,
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });

      // PostHog native error tracking ($exception event)
      await serverTelemetry.track(
        '$exception' as any,
        {
          $exception_type: err.name || 'Error',
          $exception_message: err.message,
          $exception_stack_trace_raw: err.stack,
          ...sanitizedContext,
        },
        context.userId,
      );

      if (env.NODE_ENV !== 'test') {
        console.error('🚨 [Server Error]', {
          message: err.message,
          name: err.name,
          context: sanitizedContext,
        });
      }
    } catch {
      // Error tracker must never throw
    }
  }
}

export const serverErrorTracker = new ServerErrorTracker();
