import {
  type AnalyticsEventName,
  type AnalyticsEventPayloadMap,
  scrubSensitiveData,
} from '@notion-highlight/shared';
import { api } from '../api/client.js';

class ExtensionTelemetry {
  private cachedConsent: boolean | null = null;
  private distinctId: string = 'ext-anonymous';

  /**
   * Check if user has consented to anonymous telemetry.
   * Default: true (can be toggled in extension settings).
   */
  public async isEnabled(): Promise<boolean> {
    if (this.cachedConsent !== null) {
      return this.cachedConsent;
    }

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const data = await chrome.storage.local.get(['telemetryConsent']);
      this.cachedConsent = data.telemetryConsent !== false; // Default true
      return this.cachedConsent;
    }

    return true;
  }

  /**
   * Set user telemetry consent (Opt-out support - Phase 6 Epic P6-E3)
   */
  public async setEnabled(enabled: boolean): Promise<void> {
    this.cachedConsent = enabled;
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ telemetryConsent: enabled });
    }
  }

  /**
   * Identify current user for tracking activation funnel
   */
  public identify(userId: string): void {
    if (userId) {
      this.distinctId = userId;
    }
  }

  /**
   * Track an event from Extension (Popup or Background)
   * Guaranteed to be non-blocking and scrubbed of any PII/tokens.
   */
  public async track<E extends AnalyticsEventName>(
    event: E,
    properties: AnalyticsEventPayloadMap[E] & Record<string, any>,
  ): Promise<void> {
    try {
      const enabled = await this.isEnabled();
      if (!enabled) return;

      const sanitized = scrubSensitiveData({
        ...properties,
        $lib: 'notion-highlight-extension',
        distinct_id: this.distinctId,
        timestamp: new Date().toISOString(),
      });

      // Log in development / debug console
      console.log(`📊 [Extension Telemetry] ${event}`, sanitized);

      // Forward to backend which dispatches directly to PostHog
      await api.telemetry.track(event, sanitized).catch((err) => {
        console.debug('Telemetry forward failed (non-blocking):', err?.message);
      });
    } catch {
      // Never disrupt extension UI or operations
    }
  }
}

export const extensionTelemetry = new ExtensionTelemetry();
