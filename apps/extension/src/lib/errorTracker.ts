import { scrubSensitiveData } from '@notion-highlight/shared';
import { extensionTelemetry } from './telemetry.js';

class ExtensionErrorTracker {
  private isInitialized = false;

  /**
   * Initializes global error listeners in window context (Popup) or worker context
   */
  public init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error || event.message, {
          source: 'window.onerror',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(event.reason, {
          source: 'unhandledrejection',
        });
      });
    }
  }

  /**
   * Captures an error safely without exposing raw highlight content or tokens
   */
  public captureError(error: unknown, context: Record<string, any> = {}): void {
    try {
      const err = error instanceof Error ? error : new Error(String(error));
      const sanitized = scrubSensitiveData({
        $exception_type: err.name || 'Error',
        $exception_message: err.message,
        $exception_stack_trace_raw: err.stack,
        context,
        timestamp: new Date().toISOString(),
      });

      // Forward to PostHog error tracking if enabled
      extensionTelemetry.track('$exception' as any, sanitized);
      console.error('🚨 [Extension Error Tracker]', sanitized);
    } catch {
      // Non-blocking
    }
  }
}

export const extensionErrorTracker = new ExtensionErrorTracker();
