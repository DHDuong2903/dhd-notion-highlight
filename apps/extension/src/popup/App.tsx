import React, { useEffect, useState, useCallback } from 'react';
import {
  BookmarkCheck,
  Server,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Mail,
  Lock,
  Layers,
  FileText,
} from 'lucide-react';
import { api, type UserProfile, type HighlightItem } from '../api/client.js';

export const App: React.FC = () => {
  // User & Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // System & Highlights State
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false);

  // Check backend health
  const checkHealth = useCallback(async () => {
    try {
      const res = await api.checkHealth();
      if (res.status === 'ok') {
        setBackendStatus('connected');
        setLatencyMs(res.latencyMs);
      } else {
        setBackendStatus('disconnected');
      }
    } catch {
      setBackendStatus('disconnected');
    }
  }, []);

  // Fetch highlights
  const loadHighlights = useCallback(async () => {
    setIsLoadingHighlights(true);
    try {
      const list = await api.highlights.list();
      setHighlights(list);
    } catch (err) {
      console.warn('Failed to fetch highlights:', err);
    } finally {
      setIsLoadingHighlights(false);
    }
  }, []);

  // Initial user check
  const checkCurrentUser = useCallback(async () => {
    setIsLoadingUser(true);
    try {
      const currentUser = await api.auth.getMe();
      setUser(currentUser);
      if (currentUser) {
        await loadHighlights();
      }
    } catch (err) {
      console.warn('User not authenticated:', err);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, [loadHighlights]);

  useEffect(() => {
    checkHealth();
    checkCurrentUser();
  }, [checkHealth, checkCurrentUser]);

  // Auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !password) {
      setAuthError('Please fill in both email and password.');
      return;
    }

    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      let authedUser: UserProfile;
      if (authMode === 'login') {
        authedUser = await api.auth.login({ email, password });
      } else {
        authedUser = await api.auth.register({ email, password });
      }

      setUser(authedUser);
      setEmail('');
      setPassword('');
      await loadHighlights();
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setHighlights([]);
    }
  };

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="header">
        <div className="logo-group">
          <div className="logo-badge">
            <BookmarkCheck size={20} color="#ffffff" />
          </div>
          <div className="title-group">
            <h1>Notion Highlight</h1>
            <p>1-Click Web Highlights</p>
          </div>
        </div>

        <button
          onClick={() => {
            checkHealth();
            if (user) loadHighlights();
          }}
          className="btn-icon"
          title="Refresh Status"
        >
          <RefreshCw
            size={13}
            className={backendStatus === 'checking' || isLoadingHighlights ? 'pulse-dot' : ''}
          />
        </button>
      </header>

      {/* Loading initial session */}
      {isLoadingUser ? (
        <div className="card" style={{ textAlign: 'center', padding: '30px 10px' }}>
          <span className="pulse-dot" style={{ width: '10px', height: '10px', margin: '0 auto 10px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Connecting to session...</p>
        </div>
      ) : user ? (
        /* Authenticated View */
        <>
          {/* User Profile Card */}
          <div className="user-card">
            <div className="user-info">
              <div className="user-avatar">{user.email.charAt(0).toUpperCase()}</div>
              <div className="user-details">
                <span className="user-email" title={user.email}>
                  {user.email}
                </span>
                <div className="user-meta">
                  <span className="plan-badge">{user.plan}</span>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-danger-ghost" title="Sign Out">
              <LogOut size={12} />
              Logout
            </button>
          </div>

          {/* System Status Card */}
          <section className="card">
            <div className="card-title">
              <div className="card-title-left">
                <Server size={13} />
                <span>Integration Status</span>
              </div>
            </div>

            <div className="status-row">
              <span className="status-label">Backend Server</span>
              {backendStatus === 'connected' ? (
                <span className="status-badge ok">
                  <span className="pulse-dot" />
                  Online {latencyMs ? `(${latencyMs}ms)` : ''}
                </span>
              ) : (
                <span className="status-badge error">
                  <AlertCircle size={10} />
                  Offline
                </span>
              )}
            </div>

            <div className="status-row">
              <span className="status-label">Context Menu</span>
              <span className="status-badge ok">
                <CheckCircle2 size={10} />
                "Send to Notion" Ready
              </span>
            </div>

            <div className="status-row">
              <span className="status-label">Notion Sync Engine</span>
              <span className="status-badge pending">
                <span className="pulse-dot" />
                Phase 4 (OAuth Next)
              </span>
            </div>
          </section>

          {/* Highlights List Card */}
          <section className="card">
            <div className="card-title">
              <div className="card-title-left">
                <Layers size={13} />
                <span>Saved Highlights ({highlights.length})</span>
              </div>
              <button
                onClick={loadHighlights}
                className="btn-icon"
                style={{ padding: '3px' }}
                title="Reload highlights"
              >
                <RefreshCw size={11} className={isLoadingHighlights ? 'pulse-dot' : ''} />
              </button>
            </div>

            {highlights.length === 0 ? (
              <div className="empty-state">
                <Sparkles size={24} style={{ opacity: 0.5 }} />
                <span>No highlights saved yet.</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Highlight text on any webpage and right-click &quot;Send to Notion&quot;.
                </span>
              </div>
            ) : (
              <div className="highlights-list">
                {highlights.map((item) => (
                  <div key={item.id} className="highlight-item">
                    <div className="highlight-snippet">&quot;{item.content}&quot;</div>
                    <div className="highlight-meta">
                      <span className="highlight-source" title={item.source?.title || item.source?.canonicalUrl}>
                        <FileText size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        {item.source?.title || 'Article'}
                      </span>
                      <span
                        className={`status-badge ${
                          item.status === 'SYNCED' ? 'ok' : item.status === 'FAILED' ? 'error' : 'pending'
                        }`}
                        style={{ fontSize: '9px', padding: '1px 5px' }}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        /* Unauthenticated View: Login / Register */
        <>
          <section className="card">
            <div className="tabs-header">
              <button
                className={`tab-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
              >
                Sign In
              </button>
              <button
                className={`tab-btn ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authError && (
                <div className="alert-error">
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={14} className="input-icon" />
                  <input
                    type="email"
                    className="input-field"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={14} className="input-icon" />
                  <input
                    type="password"
                    className="input-field"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn" disabled={isSubmittingAuth}>
                {isSubmittingAuth ? (
                  <>
                    <span className="pulse-dot" />
                    <span>{authMode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <span>{authMode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
                )}
              </button>
            </form>
          </section>

          {/* Quick Guide Card */}
          <section className="card">
            <div className="card-title">
              <div className="card-title-left">
                <Sparkles size={13} />
                <span>How It Works</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div>1. Sign in or create a free account above.</div>
              <div>2. Select text on any web article or documentation.</div>
              <div>3. Right-click and choose <strong>&quot;Send to Notion&quot;</strong>.</div>
              <div>4. Highlights from the same page are automatically grouped together!</div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="footer">
        <span>Notion Highlight Sync • MV3</span>
      </footer>
    </div>
  );
};
