import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  LogOut,
  Mail,
  Lock,
  Layers,
  FileText,
  Database,
  Unlink,
  ExternalLink,
  ChevronDown,
  Check,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { api, type UserProfile, type HighlightItem } from '../api/client.js';

interface NotionStatus {
  isConnected: boolean;
  workspaceId?: string | null;
  databaseId?: string | null;
  databaseTitle?: string | null;
}

export const App: React.FC = () => {
  // Theme State: 'system' | 'light' | 'dark'
  const [themePreference, setThemePreference] = useState<'system' | 'light' | 'dark'>(() => {
    return (localStorage.getItem('notion_highlight_theme') as any) || 'system';
  });
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true;
  });

  // Calculate effective theme
  const effectiveTheme =
    themePreference === 'system' ? (systemIsDark ? 'dark' : 'light') : themePreference;

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Sync theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme]);

  // Toggle theme handler
  const handleToggleTheme = () => {
    const nextTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    setThemePreference(nextTheme);
    localStorage.setItem('notion_highlight_theme', nextTheme);
  };

  // User & Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // System & Highlights State
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>(
    'checking',
  );
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false);

  // Notion OAuth State
  const [notionStatus, setNotionStatus] = useState<NotionStatus | null>(null);
  const [databases, setDatabases] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedDb, setSelectedDb] = useState<string>('');
  const [isLoadingNotion, setIsLoadingNotion] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [notionMsg, setNotionMsg] = useState<string | null>(null);

  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check backend health
  const checkHealth = useCallback(async () => {
    try {
      const res = await api.checkHealth();
      if (res.status === 'ok') {
        setBackendStatus('connected');
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

  // Fetch Notion status & databases
  const loadNotionStatus = useCallback(async () => {
    setIsLoadingNotion(true);
    try {
      const status = await api.notion.getStatus();
      setNotionStatus(status);
      if (status.databaseId) {
        setSelectedDb(status.databaseId);
      }

      if (status.isConnected) {
        try {
          const dbs = await api.notion.getDatabases();
          setDatabases(dbs);
        } catch {
          // ignore if databases call fails
        }
      }
    } catch (err) {
      console.warn('Failed to load Notion status:', err);
    } finally {
      setIsLoadingNotion(false);
    }
  }, []);

  // Initial user check
  const checkCurrentUser = useCallback(async () => {
    setIsLoadingUser(true);
    try {
      const currentUser = await api.auth.getMe();
      setUser(currentUser);
      if (currentUser) {
        await Promise.all([loadHighlights(), loadNotionStatus()]);
      }
    } catch (err) {
      console.warn('User not authenticated:', err);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, [loadHighlights, loadNotionStatus]);

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
      await Promise.all([loadHighlights(), loadNotionStatus()]);
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
      setNotionStatus(null);
      setDatabases([]);
    }
  };

  // Connect Notion OAuth
  const handleConnectNotion = async () => {
    setNotionMsg(null);
    try {
      const { url } = await api.notion.getConnectUrl();
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({ url });
      } else {
        window.open(url, '_blank');
      }
    } catch (err: any) {
      setNotionMsg(err?.message || 'Failed to initiate Notion connection.');
    }
  };

  // Select database
  const handleSelectDatabase = async (dbId: string) => {
    setSelectedDb(dbId);
    setIsDropdownOpen(false);
    if (!dbId) return;

    setIsSavingDb(true);
    setNotionMsg(null);
    try {
      const res = await api.notion.selectDatabase(dbId);
      setNotionStatus((prev) =>
        prev
          ? {
              ...prev,
              databaseId: res.databaseId,
              databaseTitle: res.databaseTitle,
            }
          : null,
      );
      setNotionMsg(`Saved: ${res.databaseTitle}`);
      setTimeout(() => setNotionMsg(null), 2500);
    } catch (err: any) {
      setNotionMsg(err?.message || 'Failed to select database.');
    } finally {
      setIsSavingDb(false);
    }
  };

  // Disconnect Notion
  const handleDisconnectNotion = async () => {
    if (!window.confirm('Disconnect Notion workspace?')) {
      return;
    }
    try {
      await api.notion.disconnect();
      setNotionStatus({ isConnected: false });
      setSelectedDb('');
      setDatabases([]);
      setNotionMsg('Notion disconnected.');
      setTimeout(() => setNotionMsg(null), 2500);
    } catch (err: any) {
      setNotionMsg(err?.message || 'Failed to disconnect Notion.');
    }
  };

  // Find title of currently selected database
  const selectedDbTitle =
    databases.find((d) => d.id === selectedDb)?.title ||
    notionStatus?.databaseTitle ||
    'Choose a Notion database...';

  // Limit display to the 5 most recent highlights
  const recentHighlights = highlights.slice(0, 5);

  return (
    <div className="popup-container" data-theme={effectiveTheme}>
      {/* Header with Logo, Theme toggle, and User info */}
      <header className="header">
        <div className="logo-group">
          <div className="logo-badge">
            <img
              src="icons/logo.png"
              alt="Notion Highlight"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div className="title-group">
            <h1>Notion Highlight</h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: backendStatus === 'connected' ? '#10b981' : '#ef4444',
                  display: 'inline-block',
                }}
              />
              {backendStatus === 'connected' ? 'Ready' : 'Offline'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={handleToggleTheme}
            className="btn-icon"
            style={{ padding: '4px' }}
            title={`Switch to ${effectiveTheme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {effectiveTheme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          {user && (
            <>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={user.email}
              >
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="btn-danger-ghost"
                style={{ padding: '3px 6px', fontSize: '10px' }}
                title="Sign Out"
              >
                <LogOut size={11} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Loading initial session */}
      {isLoadingUser ? (
        <div className="card" style={{ textAlign: 'center', padding: '24px 10px' }}>
          <span
            className="pulse-dot"
            style={{ width: '8px', height: '8px', margin: '0 auto 8px' }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
            Connecting to session...
          </p>
        </div>
      ) : user ? (
        /* Authenticated View */
        <>
          {/* Notion Destination Database Card — Higher z-index to overlay highlights card */}
          <section className="card" style={{ position: 'relative', zIndex: 50 }}>
            <div className="card-title">
              <div className="card-title-left">
                <Database size={12} />
                <span>Destination Database</span>
              </div>
              {notionStatus?.isConnected && (
                <button
                  onClick={handleDisconnectNotion}
                  className="btn-danger-ghost"
                  style={{ fontSize: '10px', padding: '1px 5px' }}
                  title="Disconnect Notion"
                >
                  <Unlink size={10} />
                  Disconnect
                </button>
              )}
            </div>

            {notionMsg && (
              <div
                style={{
                  fontSize: '11px',
                  color: notionMsg.includes('Failed') ? 'var(--danger)' : 'var(--success)',
                  marginBottom: '6px',
                }}
              >
                {notionMsg}
              </div>
            )}

            {!notionStatus?.isConnected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Connect your Notion workspace to save highlights.
                </p>
                <button
                  onClick={handleConnectNotion}
                  className="btn notion-btn"
                  style={{ padding: '7px 12px' }}
                >
                  Connect Notion Workspace
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* Custom Styled Dropdown */}
                <div className="custom-select-wrapper" ref={dropdownRef}>
                  <div
                    className={`custom-select-trigger ${isDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="custom-select-value">
                      <Database size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isSavingDb ? 'Saving destination...' : selectedDbTitle}
                      </span>
                    </div>
                    <div className={`custom-select-chevron ${isDropdownOpen ? 'open' : ''}`}>
                      <ChevronDown size={14} />
                    </div>
                  </div>

                  {isDropdownOpen && (
                    <div className="custom-select-dropdown">
                      <div className="custom-select-list">
                        {databases.length === 0 ? (
                          <div
                            style={{
                              padding: '8px',
                              color: 'var(--text-muted)',
                              fontSize: '11px',
                              textAlign: 'center',
                            }}
                          >
                            No accessible databases found. Make sure you shared a database with the
                            integration in Notion.
                          </div>
                        ) : (
                          databases.map((db) => {
                            const isSelected = db.id === selectedDb;
                            return (
                              <div
                                key={db.id}
                                className={`custom-select-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelectDatabase(db.id)}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <Database size={12} style={{ opacity: 0.7, flexShrink: 0 }} />
                                  <span
                                    style={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {db.title}
                                  </span>
                                </div>
                                {isSelected && (
                                  <Check
                                    size={13}
                                    style={{ color: 'var(--accent)', flexShrink: 0 }}
                                  />
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="custom-select-footer">
                        <span>Select database for highlights</span>
                        <button
                          type="button"
                          className="custom-select-refresh-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadNotionStatus();
                          }}
                          disabled={isLoadingNotion}
                          title="Reload database list from Notion"
                        >
                          <RefreshCw size={10} className={isLoadingNotion ? 'pulse-dot' : ''} />
                          Reload
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Highlights List Card — Lower z-index so dropdown always overlays */}
          <section
            className="card"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div className="card-title">
              <div className="card-title-left">
                <Layers size={12} />
                <span>
                  Recent Highlights ({recentHighlights.length}
                  {highlights.length > 5 ? ` of ${highlights.length}` : ''})
                </span>
              </div>
              <button
                onClick={loadHighlights}
                className="btn-icon"
                style={{ padding: '2px' }}
                title="Reload highlights"
              >
                <RefreshCw size={11} className={isLoadingHighlights ? 'pulse-dot' : ''} />
              </button>
            </div>

            {highlights.length === 0 ? (
              <div className="empty-state">
                <Sparkles size={18} style={{ opacity: 0.4 }} />
                <span style={{ fontSize: '11px' }}>No highlights saved yet.</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Highlight text on any page ➔ Right click ➔ &quot;Send to Notion&quot;.
                </span>
              </div>
            ) : (
              <div className="highlights-list">
                {recentHighlights.map((item) => (
                  <div key={item.id} className="highlight-item">
                    <div className="highlight-snippet">&quot;{item.content}&quot;</div>
                    <div className="highlight-meta">
                      <span
                        className="highlight-source"
                        title={item.source?.title || item.source?.canonicalUrl}
                      >
                        <FileText size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        {item.source?.title || 'Article'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.source?.notionPageId && (
                          <a
                            href={`https://notion.so/${item.source.notionPageId.replace(/-/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              color: 'var(--accent)',
                              textDecoration: 'none',
                              fontSize: '10px',
                            }}
                            title="Open in Notion"
                          >
                            <ExternalLink size={10} />
                            Open
                          </a>
                        )}
                        <span
                          className={`status-badge ${
                            item.status === 'SYNCED'
                              ? 'ok'
                              : item.status === 'FAILED'
                                ? 'error'
                                : 'pending'
                          }`}
                          style={{ fontSize: '8px', padding: '1px 4px' }}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        /* Unauthenticated View: Login / Register */
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
              Register
            </button>
          </div>

          {authError && (
            <div className="alert-error" style={{ marginBottom: '10px' }}>
              <AlertCircle size={12} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <Mail size={14} className="input-icon" />
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmittingAuth}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmittingAuth}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={isSubmittingAuth}
              style={{ marginTop: '4px' }}
            >
              {isSubmittingAuth
                ? 'Please wait...'
                : authMode === 'login'
                  ? 'Sign In to Extension'
                  : 'Create Free Account'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
};
