/**
 * Event taxonomy & type-safe payload definitions for Product Analytics (Phase 6)
 */

export const AnalyticsEvents = {
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  NOTION_CONNECTED: 'notion_connected',
  DATABASE_SELECTED: 'database_selected',
  HIGHLIGHT_SAVED: 'highlight_saved',
  HIGHLIGHT_SAVE_FAILED: 'highlight_save_failed',
  HISTORY_OPENED: 'history_opened',
  WAITLIST_SUBMITTED: 'waitlist_submitted',
  SURVEY_SUBMITTED: 'survey_submitted',
  LANDING_CTA_CLICKED: 'landing_cta_clicked',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export interface UserRegisteredPayload {
  authMethod: 'email' | 'google';
}

export interface UserLoggedInPayload {
  authMethod: 'email' | 'google';
}

export interface NotionConnectedPayload {
  workspaceId?: string;
}

export interface DatabaseSelectedPayload {
  isAutoCreated: boolean;
  databaseIdLength?: number;
}

export interface HighlightSavedPayload {
  isNewSource: boolean;
  domain: string;
  charLength: number;
  status: 'SYNCED' | 'PENDING';
}

export interface HighlightSaveFailedPayload {
  errorCode: string;
  domain: string;
  charLength?: number;
}

export interface HistoryOpenedPayload {
  itemsCount: number;
}

export interface WaitlistSubmittedPayload {
  source: string;
  hasSurvey: boolean;
}

export interface SurveySubmittedPayload {
  currentTools?: string;
  destinations?: string;
  willingToPay?: string;
}

export interface LandingCtaClickedPayload {
  location: string;
}

export type AnalyticsEventPayloadMap = {
  [AnalyticsEvents.USER_REGISTERED]: UserRegisteredPayload;
  [AnalyticsEvents.USER_LOGGED_IN]: UserLoggedInPayload;
  [AnalyticsEvents.NOTION_CONNECTED]: NotionConnectedPayload;
  [AnalyticsEvents.DATABASE_SELECTED]: DatabaseSelectedPayload;
  [AnalyticsEvents.HIGHLIGHT_SAVED]: HighlightSavedPayload;
  [AnalyticsEvents.HIGHLIGHT_SAVE_FAILED]: HighlightSaveFailedPayload;
  [AnalyticsEvents.HISTORY_OPENED]: HistoryOpenedPayload;
  [AnalyticsEvents.WAITLIST_SUBMITTED]: WaitlistSubmittedPayload;
  [AnalyticsEvents.SURVEY_SUBMITTED]: SurveySubmittedPayload;
  [AnalyticsEvents.LANDING_CTA_CLICKED]: LandingCtaClickedPayload;
};

/**
 * Sanitizes a URL to return only the hostname domain (e.g. "developer.mozilla.org"),
 * completely removing query parameters, paths, tokens, or personal identifiers.
 */
export function sanitizeDomain(url: string): string {
  try {
    const match = url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/([^/?#]+)/);
    if (match && match[1]) {
      return match[1].split(':')[0].toLowerCase();
    }
    return 'unknown-domain';
  } catch {
    return 'unknown-domain';
  }
}

/**
 * Sensitive field patterns to scrub from any telemetry or error context
 */
const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /cookie/i,
  /session/i,
  /auth/i,
  /content/i, // Highlight raw text
  /text/i, // Highlight raw text
  /key/i,
];

/**
 * Recursively scrubs sensitive data (passwords, tokens, cookies, raw highlight content)
 * from objects before sending to analytics or error tracking services.
 */
export function scrubSensitiveData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return data as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => scrubSensitiveData(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const scrubbed: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null) {
        scrubbed[key] = scrubSensitiveData(value);
        continue;
      }

      const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
      if (isSensitiveKey) {
        if (typeof value === 'string' && /content|text/i.test(key)) {
          scrubbed[`${key}Length`] = value.length;
        } else {
          scrubbed[key] = '[REDACTED]';
        }
      } else {
        scrubbed[key] = value;
      }
    }
    return scrubbed as T;
  }

  return data;
}
