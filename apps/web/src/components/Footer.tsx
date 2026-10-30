import React from 'react';

interface FooterProps {
  onNavigatePage: (page: 'landing' | 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePage }) => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/icons/logo.png"
              alt="Notion Highlight"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                objectFit: 'contain',
              }}
            />
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '15px' }}>
              Notion Highlight Sync
            </span>
            <span>· Built for researchers & readers</span>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
            <button
              onClick={() => {
                onNavigatePage('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ background: 'transparent', color: 'var(--text-muted)' }}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => {
                onNavigatePage('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ background: 'transparent', color: 'var(--text-muted)' }}
            >
              Terms of Service
            </button>
            <a href="mailto:support@notionhighlight.com" style={{ color: 'var(--text-muted)' }}>
              Contact Support
            </a>
          </div>
        </div>

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            color: 'var(--text-dim)',
            fontSize: '12px',
          }}
        >
          Not affiliated with or endorsed by Notion Labs, Inc. Notion is a registered trademark of
          Notion Labs, Inc.
        </div>
      </div>
    </footer>
  );
};
