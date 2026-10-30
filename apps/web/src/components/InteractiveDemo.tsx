import React, { useState } from 'react';
import { ExternalLink, Check, Sparkles, Plus, MousePointerClick } from 'lucide-react';
import { webAnalytics } from '../lib/analytics.js';

interface SampleQuote {
  id: string;
  text: string;
  isSynced: boolean;
}

export const InteractiveDemo: React.FC = () => {
  const [quotes, setQuotes] = useState<SampleQuote[]>([
    {
      id: 'q1',
      text: 'The best notes are the ones you actually revisit. Traditional web clippers save too much junk you will never read again.',
      isSynced: true,
    },
    {
      id: 'q2',
      text: 'By clustering quotes under the original article title, your knowledge base stays structured without manual page creation.',
      isSynced: false,
    },
    {
      id: 'q3',
      text: 'Friction is the enemy of personal knowledge management. One right-click should do the job.',
      isSynced: false,
    },
  ]);

  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

  const handleSyncQuote = (id: string) => {
    setActiveHighlightId(id);
    webAnalytics.track('interactive_demo_clicked', { quoteId: id });

    setTimeout(() => {
      setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, isSynced: true } : q)));
      setActiveHighlightId(null);
    }, 400);
  };

  const syncedQuotes = quotes.filter((q) => q.isSynced);

  return (
    <div className="demo-wrapper">
      <div className="demo-topbar">
        <div className="window-dots">
          <div className="dot dot-red" />
          <div className="dot dot-yellow" />
          <div className="dot dot-green" />
        </div>
        <div className="browser-bar">https://paulgraham.com/ideas.html</div>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Live Simulator</div>
      </div>

      <div className="demo-content-split">
        {/* Left Browser Mockup */}
        <div className="demo-left-browser">
          <div className="demo-instruction">
            <MousePointerClick size={14} />
            <span>Click any quote to send to Notion</span>
          </div>

          <h3 className="mock-article-title">How to Build a Second Brain Without Chaos</h3>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Published by Tiago Forte · 5 min read
          </p>

          {quotes.map((q) => (
            <div
              key={q.id}
              className={`selectable-quote ${q.isSynced ? 'synced' : ''}`}
              onClick={() => handleSyncQuote(q.id)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <span>"{q.text}"</span>
                {q.isSynced ? (
                  <span
                    style={{
                      color: 'var(--emerald)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} /> In Notion
                  </span>
                ) : (
                  <span
                    style={{
                      color: 'var(--primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      flexShrink: 0,
                    }}
                  >
                    <Plus size={12} /> Click to Save
                  </span>
                )}
              </div>
            </div>
          ))}

          {activeHighlightId && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                background: '#10b981',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Sparkles size={12} />
              <span>Synced directly to Notion!</span>
            </div>
          )}
        </div>

        {/* Right Notion Page Mockup */}
        <div className="demo-right-notion">
          <div className="notion-mock-page">
            <div className="notion-page-header">
              <span style={{ fontSize: '20px' }}>📄</span>
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#f8fafc',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  How to Build a Second Brain Without Chaos
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Source: paulgraham.com</span>
                  <ExternalLink size={10} />
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                color: '#64748b',
                fontWeight: 600,
                marginBottom: '10px',
              }}
            >
              Highlights ({syncedQuotes.length}) — Auto Grouped
            </div>

            {syncedQuotes.map((sq) => (
              <div key={sq.id} className="notion-quote-block">
                "{sq.text}"
              </div>
            ))}

            {syncedQuotes.length === 0 && (
              <div
                style={{
                  color: 'var(--text-dim)',
                  fontSize: '13px',
                  fontStyle: 'italic',
                  padding: '20px 0',
                  textAlign: 'center',
                }}
              >
                Select a quote on the left to see it automatically grouped here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
