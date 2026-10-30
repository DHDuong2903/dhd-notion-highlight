import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { Hero } from './components/Hero.js';
import { InteractiveDemo } from './components/InteractiveDemo.js';
import { Features } from './components/Features.js';
import { Comparison } from './components/Comparison.js';
import { FAQ } from './components/FAQ.js';
import { Footer } from './components/Footer.js';
import { WaitlistModal } from './components/WaitlistModal.js';
import { PrivacyPolicy } from './pages/PrivacyPolicy.js';
import { TermsOfService } from './pages/TermsOfService.js';
import { webAnalytics } from './lib/analytics.js';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'privacy' | 'terms'>('landing');
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  useEffect(() => {
    webAnalytics.track('landing_page_viewed', {
      page: currentPage,
    });
  }, [currentPage]);

  return (
    <div>
      <Header onOpenWaitlist={() => setIsWaitlistOpen(true)} onNavigatePage={setCurrentPage} />

      {currentPage === 'landing' && (
        <main>
          <Hero onOpenWaitlist={() => setIsWaitlistOpen(true)} />

          <section id="how-it-works" style={{ padding: '0 0 60px' }}>
            <div className="container">
              <div className="section-head">
                <h2 className="section-title">See It in Action</h2>
                <p className="section-subtitle">
                  Test the live simulator below: click any quote from the article on the left, and
                  watch it instantly group inside the single Notion page on the right.
                </p>
              </div>
              <InteractiveDemo />
            </div>
          </section>

          <Features />
          <Comparison />
          <FAQ />

          {/* Bottom CTA Banner */}
          <section style={{ padding: '60px 0 100px' }}>
            <div
              className="container"
              style={{
                background:
                  'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-lg)',
                padding: '48px 32px',
                textAlign: 'center',
              }}
            >
              <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>
                Ready to Organize Your Web Highlights?
              </h2>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '16px',
                  maxWidth: '560px',
                  margin: '0 auto 28px',
                }}
              >
                Join our Closed Beta today. Test the Chrome Extension before public launch and help
                shape the future of web reading productivity.
              </p>
              <button
                className="btn-primary"
                style={{ fontSize: '15px', padding: '14px 32px' }}
                onClick={() => {
                  webAnalytics.trackCtaClick('bottom_banner');
                  setIsWaitlistOpen(true);
                }}
              >
                Get Closed Beta Invite
              </button>
            </div>
          </section>
        </main>
      )}

      {currentPage === 'privacy' && <PrivacyPolicy onBack={() => setCurrentPage('landing')} />}

      {currentPage === 'terms' && <TermsOfService onBack={() => setCurrentPage('landing')} />}

      <Footer onNavigatePage={setCurrentPage} />

      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </div>
  );
};
