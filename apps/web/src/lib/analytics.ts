import { AnalyticsEvents, type AnalyticsEventName } from '@notion-highlight/shared';

class WebAnalytics {
  private distinctId: string;

  constructor() {
    this.distinctId = this.getOrCreateDistinctId();
  }

  private getOrCreateDistinctId(): string {
    const KEY = 'nh_web_distinct_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = 'usr_web_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem(KEY, id);
    }
    return id;
  }

  public track(event: AnalyticsEventName | string, properties: Record<string, any> = {}): void {
    const payload = {
      event,
      properties: {
        ...properties,
        distinct_id: this.distinctId,
        source: 'landing_page',
        url: window.location.href,
        referrer: document.referrer || 'direct',
      },
    };

    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Non-blocking
    });
  }

  public trackCtaClick(location: string): void {
    this.track(AnalyticsEvents.LANDING_CTA_CLICKED, { location });
  }
}

export const webAnalytics = new WebAnalytics();
