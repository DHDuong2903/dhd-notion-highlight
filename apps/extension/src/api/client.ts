import type {
  RegisterInput,
  LoginInput,
  CreateHighlightInput,
  HighlightResponse,
} from '@notion-highlight/shared';

export interface UserProfile {
  id: string;
  email: string;
  plan: 'FREE' | 'PRO';
  createdAt?: string;
}

export interface HighlightItem {
  id: string;
  userId: string;
  sourceId: string;
  content: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  idempotencyKey: string;
  createdAt: string;
  source?: {
    canonicalUrl: string;
    title: string;
    notionPageId?: string | null;
  };
}

export interface ApiError {
  code: string;
  message: string;
}

export const DEFAULT_BACKEND_URL = 'http://localhost:3001';

class ApiClient {
  private baseUrl: string = DEFAULT_BACKEND_URL;

  public async getBaseUrl(): Promise<string> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const stored = await chrome.storage.local.get(['backendUrl']);
      if (stored.backendUrl) {
        this.baseUrl = stored.backendUrl;
      }
    }
    return this.baseUrl;
  }

  public async setBaseUrl(url: string): Promise<void> {
    this.baseUrl = url.replace(/\/+$/, '');
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ backendUrl: this.baseUrl });
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = await this.getBaseUrl();
    const url = `${baseUrl}${path}`;

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensures session cookie is sent with cross-origin extension requests
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
      const errorCode = data?.error?.code || 'UNKNOWN_ERROR';
      const error = new Error(errorMsg) as Error & { code?: string; status?: number };
      error.code = errorCode;
      error.status = response.status;
      throw error;
    }

    return data as T;
  }

  // Health
  public async checkHealth(): Promise<{ status: string; latencyMs: number }> {
    const start = performance.now();
    const data = await this.request<{ status: string }>('/api/health');
    const latencyMs = Math.round(performance.now() - start);
    return { status: data.status, latencyMs };
  }

  // Auth endpoints
  public auth = {
    getMe: async (): Promise<UserProfile | null> => {
      try {
        const data = await this.request<{ user: UserProfile }>('/api/auth/me');
        return data.user;
      } catch (err: any) {
        if (err.status === 401) {
          return null;
        }
        throw err;
      }
    },

    login: async (input: LoginInput): Promise<UserProfile> => {
      const data = await this.request<{ user: UserProfile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return data.user;
    },

    register: async (input: RegisterInput): Promise<UserProfile> => {
      const data = await this.request<{ user: UserProfile }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return data.user;
    },

    logout: async (): Promise<void> => {
      await this.request<{ message: string }>('/api/auth/logout', {
        method: 'POST',
      });
    },
  };

  // Highlights endpoints
  public highlights = {
    create: async (input: CreateHighlightInput): Promise<HighlightResponse> => {
      return this.request<HighlightResponse>('/api/highlights', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    list: async (): Promise<HighlightItem[]> => {
      const data = await this.request<{ highlights: HighlightItem[] }>('/api/highlights');
      return data.highlights;
    },
  };

  // Notion endpoints (Phase 4)
  public notion = {
    getStatus: async () => {
      return this.request<{
        isConnected: boolean;
        workspaceId?: string | null;
        databaseId?: string | null;
        databaseTitle?: string | null;
      }>('/api/notion/status');
    },

    getConnectUrl: async () => {
      return this.request<{ url: string }>('/api/notion/connect');
    },

    getDatabases: async () => {
      const data = await this.request<{ databases: Array<{ id: string; title: string }> }>(
        '/api/notion/databases',
      );
      return data.databases;
    },

    selectDatabase: async (databaseId: string) => {
      return this.request<{ success: boolean; databaseId: string; databaseTitle?: string }>(
        '/api/notion/database',
        {
          method: 'POST',
          body: JSON.stringify({ databaseId }),
        },
      );
    },

    disconnect: async () => {
      await this.request<{ message: string }>('/api/notion/connection', {
        method: 'DELETE',
      });
    },
  };
}

export const api = new ApiClient();
