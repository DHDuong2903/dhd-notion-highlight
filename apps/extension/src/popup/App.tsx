import React, { useEffect, useState } from 'react';
import {
  BookmarkCheck,
  Server,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import type { HealthResponse } from '@notion-highlight/shared';

const BACKEND_URL = 'http://localhost:3001';

export const App: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>(
    'checking',
  );
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkHealth = async () => {
    setIsRefreshing(true);
    const start = performance.now();
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      if (res.ok) {
        const data = (await res.json()) as HealthResponse;
        if (data.status === 'ok') {
          setBackendStatus('connected');
          setLatencyMs(Math.round(performance.now() - start));
        } else {
          setBackendStatus('disconnected');
        }
      } else {
        setBackendStatus('disconnected');
      }
    } catch {
      setBackendStatus('disconnected');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="header">
        <div className="logo-group">
          <div className="logo-badge">
            <BookmarkCheck size={20} color="#ffffff" />
          </div>
          <div className="title-group">
            <h1>Notion Highlight Sync</h1>
            <p>Phase 0 Foundation</p>
          </div>
        </div>
        <button
          onClick={checkHealth}
          disabled={isRefreshing}
          className="btn-secondary"
          style={{ width: 'auto', padding: '6px 8px', borderRadius: '8px' }}
          title="Refresh Status"
        >
          <RefreshCw size={13} className={isRefreshing ? 'pulse-dot' : ''} />
        </button>
      </header>

      {/* System Status Card */}
      <section className="card">
        <div className="card-title">
          <Server size={14} />
          System Health
        </div>

        <div className="status-row">
          <span className="status-label">Fastify Backend API</span>
          {backendStatus === 'connected' ? (
            <span className="status-badge ok">
              <span className="pulse-dot" />
              Connected {latencyMs ? `(${latencyMs}ms)` : ''}
            </span>
          ) : backendStatus === 'checking' ? (
            <span className="status-badge pending">
              <span className="pulse-dot" />
              Checking...
            </span>
          ) : (
            <span className="status-badge error">
              <AlertCircle size={11} />
              Offline (Port 3001)
            </span>
          )}
        </div>

        <div className="status-row">
          <span className="status-label">Context Menu Service</span>
          <span className="status-badge ok">
            <CheckCircle2 size={11} />
            "Send to Notion" Active
          </span>
        </div>

        <div className="status-row">
          <span className="status-label">Notion Integration</span>
          <span className="status-badge pending">
            <span className="pulse-dot" />
            Phase 1 Prototype Next
          </span>
        </div>
      </section>

      {/* Quick Guide */}
      <section className="card">
        <div className="card-title">
          <Sparkles size={14} />
          How It Works
        </div>
        <div className="instructions-list">
          <div className="instruction-step">
            <span className="step-num">1</span>
            <span>Select any text excerpt or quote on a webpage.</span>
          </div>
          <div className="instruction-step">
            <span className="step-num">2</span>
            <span>
              Right-click and select <strong>"Send to Notion"</strong> from the menu.
            </span>
          </div>
          <div className="instruction-step">
            <span className="step-num">3</span>
            <span>
              Backend automatically groups highlights by canonical article URL into your Notion
              page!
            </span>
          </div>
        </div>
      </section>

      {/* Documentation Link */}
      <a
        href="https://github.com/DHDuong2903/dhd-notion-highlight"
        target="_blank"
        rel="noreferrer"
        className="btn btn-secondary"
      >
        <ExternalLink size={14} />
        View Roadmap & Docs
      </a>

      {/* Footer */}
      <footer className="footer">Notion Highlight Sync • Manifest V3 • v0.1.0</footer>
    </div>
  );
};
