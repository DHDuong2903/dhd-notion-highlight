import { env } from '../config/env.js';
import {
  type AnalyticsEventName,
  type AnalyticsEventPayloadMap,
  scrubSensitiveData,
} from '@notion-highlight/shared';

class ServerTelemetry {
  private isEnabled: boolean;
  private apiKey?: string;
  private host: string;

  constructor() {
    this.isEnabled = env.TELEMETRY_ENABLED;
    this.apiKey = env.POSTHOG_API_KEY;
    this.host = env.POSTHOG_HOST.replace(/\/+$/, '');
  }

  /**
   * Tracks a server-side analytics event.
   * Ensures all properties are thoroughly scrubbed of passwords, tokens, cookies, and raw highlight text.
   */
  public async track<E extends AnalyticsEventName>(
    event: E,
    properties: AnalyticsEventPayloadMap[E] & Record<string, any>,
    userId?: string,
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const sanitizedProps = scrubSensitiveData({
        ...properties,
        $lib: 'notion-highlight-api',
        timestamp: new Date().toISOString(),
      });

      if (this.apiKey) {
        // PostHog HTTP Capture API
        await fetch(`${this.host}/capture/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: this.apiKey,
            event,
            properties: {
              distinct_id: userId || 'server-anonymous',
              ...sanitizedProps,
            },
          }),
        }).catch((err) => {
          if (env.NODE_ENV === 'development') {
            console.debug('Telemetry dispatch failed (non-blocking):', err?.message);
          }
        });
      } else if (env.NODE_ENV === 'development') {
        console.log(`📊 [Telemetry Track] Event: "${event}"`, {
          userId: userId || 'anonymous',
          properties: sanitizedProps,
        });
      }
    } catch {
      // Telemetry must never crash core logic
    }
  }

  /**
   * Identifies user attributes without PII.
   */
  public async identify(userId: string, traits: Record<string, any> = {}): Promise<void> {
    if (!this.isEnabled || !userId) return;

    try {
      const sanitizedTraits = scrubSensitiveData(traits);

      if (this.apiKey) {
        await fetch(`${this.host}/capture/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: this.apiKey,
            event: '$identify',
            properties: {
              distinct_id: userId,
              $set: sanitizedTraits,
            },
          }),
        }).catch(() => {});
      } else if (env.NODE_ENV === 'development') {
        console.log(`📊 [Telemetry Identify] User: "${userId}"`, sanitizedTraits);
      }
    } catch {
      // Non-blocking
    }
  }
}

export const serverTelemetry = new ServerTelemetry();
