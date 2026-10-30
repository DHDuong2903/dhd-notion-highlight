import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { webAnalytics } from '../lib/analytics.js';

interface HeroProps {
  onOpenWaitlist: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenWaitlist }) => {
  const [waitlistCount, setWaitlistCount] = useState<number>(38);

  useEffect(() => {
    fetch('/api/waitlist/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data?.count) setWaitlistCount(data.count);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="hero-section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div
            style={{
              position: 'relative',
              padding: '6px',
              borderRadius: '24px',
              background:
                'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.2) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 12px 36px rgba(99, 102, 241, 0.35)',
            }}
          >
            <img
              src="/icons/logo.png"
              alt="Notion Highlight App Logo"
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '18px',
                display: 'block',
              }}
            />
          </div>
        </div>

        <div className="badge-pill">
          <span className="badge-dot" />
          <span>Chrome Web Store Release · Closed Beta</span>
        </div>

        <h1 className="hero-title">
          Save Web Highlights Directly to Notion —{' '}
          <span className="text-gradient">Never Lose Context Again</span>
        </h1>

        <p className="hero-subtitle">
          Select any text on any webpage and right-click "Send to Notion". All highlights from the
          same article automatically group into a single, clean Notion page. Zero clutter, zero
          manual copy-pasting.
        </p>

        <div className="hero-actions">
          <button
            className="btn-primary"
            style={{ fontSize: '15px', padding: '14px 28px' }}
            onClick={() => {
              webAnalytics.trackCtaClick('hero_primary');
              onOpenWaitlist();
            }}
          >
            <span>Join Closed Beta Waitlist</span>
            <ArrowRight size={18} />
          </button>

          <a
            href="#how-it-works"
            className="btn-secondary"
            style={{ fontSize: '15px', padding: '14px 24px' }}
          >
            <span>See Live Demo</span>
          </a>
        </div>

        <div className="hero-proof">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={15} style={{ color: 'var(--emerald)' }} />
            <span>Over {waitlistCount}+ knowledge workers joined</span>
          </div>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} style={{ color: '#a5b4fc' }} />
            <span>Encrypted OAuth 2.0 & Zero-PII</span>
          </div>
        </div>
      </div>
    </section>
  );
};
