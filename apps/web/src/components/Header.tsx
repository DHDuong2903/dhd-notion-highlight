import React from 'react';
import { webAnalytics } from '../lib/analytics.js';

interface HeaderProps {
  onOpenWaitlist: () => void;
  onNavigatePage: (page: 'landing' | 'privacy' | 'terms') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWaitlist, onNavigatePage }) => {
  return (
    <header className="site-header">
      <div className="container nav-row">
        <div
          className="brand-logo"
          onClick={() => onNavigatePage('landing')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <img
            src="/icons/logo.png"
            alt="Notion Highlight Sync"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              objectFit: 'contain',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
            }}
          />
          <span>Notion Highlight Sync</span>
        </div>

        <nav className="nav-links">
          <a href="#how-it-works" onClick={() => onNavigatePage('landing')}>
            How It Works
          </a>
          <a href="#features" onClick={() => onNavigatePage('landing')}>
            Features
          </a>
          <a href="#comparison" onClick={() => onNavigatePage('landing')}>
            Why Us
          </a>
          <a href="#faq" onClick={() => onNavigatePage('landing')}>
            FAQ
          </a>
          <button
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
            onClick={() => {
              webAnalytics.trackCtaClick('header');
              onOpenWaitlist();
            }}
          >
            Join Beta
          </button>
        </nav>
      </div>
    </header>
  );
};
