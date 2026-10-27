import { Client, isNotionClientError, APIErrorCode, ClientErrorCode } from '@notionhq/client';
import type {
  CreatePageParameters,
  BlockObjectRequest,
} from '@notionhq/client/build/src/api-endpoints.js';
import { AppErrorCode } from '@notion-highlight/shared';

export interface NotionServiceConfig {
  auth?: string;
}

export interface SaveHighlightOptions {
  databaseId: string;
  title: string;
  url: string;
  highlightText: string;
}

export interface SaveHighlightResult {
  pageId: string;
  isNewSource: boolean;
  notionPageUrl?: string;
}

export interface NotionDatabaseProperty {
  id?: string;
  type: string;
  [key: string]: unknown;
}

export interface NotionDatabaseInfo {
  id: string;
  properties: Record<string, NotionDatabaseProperty>;
}

export class NotionAppError extends Error {
  constructor(
    message: string,
    public readonly code: (typeof AppErrorCode)[keyof typeof AppErrorCode],
    public readonly statusCode: number = 500,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'NotionAppError';
  }
}

export class NotionService {
  private client: Client;
  private dbCache = new Map<string, NotionDatabaseInfo>();

  constructor(config: NotionServiceConfig = {}) {
    this.client = new Client({
      auth: config.auth,
    });
  }

  /**
   * Helper to chunk long text into rich_text array (Notion limit is 2000 chars per text block)
   */
  public static splitTextForNotion(
    text: string,
  ): Array<{ type: 'text'; text: { content: string } }> {
    const MAX_CHUNK = 2000;
    const chunks: Array<{ type: 'text'; text: { content: string } }> = [];

    for (let i = 0; i < text.length; i += MAX_CHUNK) {
      chunks.push({
        type: 'text',
        text: {
          content: text.substring(i, i + MAX_CHUNK),
        },
      });
    }

    return chunks.length > 0 ? chunks : [{ type: 'text', text: { content: '' } }];
  }

  /**
   * Retrieve database metadata to detect property names dynamically
   */
  public async getDatabase(databaseId: string): Promise<NotionDatabaseInfo> {
    if (this.dbCache.has(databaseId)) {
      return this.dbCache.get(databaseId)!;
    }

    try {
      const db = await this.client.databases.retrieve({ database_id: databaseId });
      const rawProperties =
        (db as unknown as { properties?: Record<string, NotionDatabaseProperty> }).properties || {};

      const dbInfo: NotionDatabaseInfo = {
        id: db.id,
        properties: rawProperties,
      };

      this.dbCache.set(databaseId, dbInfo);
      return dbInfo;
    } catch (error) {
      if (error instanceof NotionAppError) throw error;
      throw this.transformNotionError(error, `Failed to retrieve Notion database [${databaseId}]`);
    }
  }

  /**
   * Search for accessible databases
   */
  public async searchDatabases(): Promise<Array<{ id: string; title: string }>> {
    try {
      const response = await this.client.search({
        filter: { value: 'data_source', property: 'object' },
        page_size: 100,
      });

      return (response.results as any[]).map((db) => {
        const titleArr = db.title || [];
        const title = titleArr.map((t: any) => t.plain_text || '').join('').trim() || 'Untitled Database';
        // In Notion v5 data_source objects, the real database ID is in parent.database_id
        const databaseId = db.parent?.type === 'database_id' ? db.parent.database_id : db.id;
        return {
          id: databaseId,
          title,
        };
      });
    } catch (error) {
      throw this.transformNotionError(error, 'Failed to search Notion databases');
    }
  }

  /**
   * Get human-readable title of a database
   */
  public async getDatabaseTitle(databaseId: string): Promise<string> {
    try {
      const db = await this.client.databases.retrieve({ database_id: databaseId });
      const titleArr = (db as any).title || [];
      return titleArr.map((t: any) => t.plain_text || '').join('').trim() || 'Untitled Database';
    } catch {
      return 'Selected Database';
    }
  }

  /**
   * Search for an existing page in the database with matching URL
   */
  public async findPageByUrl(databaseId: string, url: string): Promise<string | null> {
    try {
      const db = await this.getDatabase(databaseId);

      // Find URL property in database properties
      const urlPropEntry = Object.entries(db.properties).find(([_, prop]) => prop.type === 'url');

      if (!urlPropEntry) {
        // Fallback: If no dedicated URL property exists, return null
        return null;
      }

      const [urlPropName] = urlPropEntry;

      const response = await this.client.request<{
        results: Array<{ id: string; url?: string }>;
      }>({
        path: `databases/${databaseId}/query`,
        method: 'post',
        body: {
          filter: {
            property: urlPropName,
            url: {
              equals: url,
            },
          },
          page_size: 1,
        },
      });

      if (response.results && response.results.length > 0) {
        return response.results[0].id;
      }

      return null;
    } catch (error) {
      if (error instanceof NotionAppError) throw error;
      throw this.transformNotionError(error, `Failed to lookup source page by URL`);
    }
  }

  /**
   * Create a new page in the database with Title, URL, and the initial highlight block
   */
  public async createPage(options: {
    databaseId: string;
    title: string;
    url: string;
    highlightText: string;
  }): Promise<{ pageId: string; notionUrl: string }> {
    try {
      const db = await this.getDatabase(options.databaseId);

      // Detect title property name
      const titlePropEntry = Object.entries(db.properties).find(
        ([_, prop]) => prop.type === 'title',
      );
      const titlePropName = titlePropEntry ? titlePropEntry[0] : 'Name';

      // Detect url property name if any
      const urlPropEntry = Object.entries(db.properties).find(([_, prop]) => prop.type === 'url');

      const properties: CreatePageParameters['properties'] = {
        [titlePropName]: {
          title: [
            {
              type: 'text',
              text: { content: options.title || 'Untitled Highlight Source' },
            },
          ],
        },
      };

      if (urlPropEntry) {
        const [urlPropName] = urlPropEntry;
        properties[urlPropName] = {
          url: options.url,
        };
      }

      // Initial highlight block
      const highlightBlock: BlockObjectRequest = {
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: NotionService.splitTextForNotion(options.highlightText),
        },
      };

      const page = await this.client.pages.create({
        parent: { database_id: options.databaseId },
        properties,
        children: [highlightBlock],
      });

      return {
        pageId: page.id,
        notionUrl: (page as { url?: string }).url || '',
      };
    } catch (error) {
      if (error instanceof NotionAppError) throw error;
      throw this.transformNotionError(error, `Failed to create Notion page`);
    }
  }

  /**
   * Append a highlight block to an existing Notion page
   */
  public async appendHighlight(pageId: string, highlightText: string): Promise<void> {
    try {
      const highlightBlock: BlockObjectRequest = {
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: NotionService.splitTextForNotion(highlightText),
        },
      };

      await this.client.blocks.children.append({
        block_id: pageId,
        children: [highlightBlock],
      });
    } catch (error) {
      throw this.transformNotionError(error, `Failed to append highlight to page [${pageId}]`);
    }
  }

  /**
   * Source grouping orchestrator:
   * 1. Check if source page exists by canonical URL.
   * 2. If exists -> append highlight block.
   * 3. If not -> create new page with highlight block.
   */
  public async saveHighlight(options: SaveHighlightOptions): Promise<SaveHighlightResult> {
    const existingPageId = await this.findPageByUrl(options.databaseId, options.url);

    if (existingPageId) {
      await this.appendHighlight(existingPageId, options.highlightText);
      return {
        pageId: existingPageId,
        isNewSource: false,
      };
    }

    const { pageId, notionUrl } = await this.createPage(options);
    return {
      pageId,
      isNewSource: true,
      notionPageUrl: notionUrl,
    };
  }

  /**
   * Check connection status with Notion API
   */
  public async testConnection(): Promise<{ ok: boolean; botId?: string; botName?: string }> {
    try {
      const user = await this.client.users.me({});
      return {
        ok: true,
        botId: user.id,
        botName: user.name ?? undefined,
      };
    } catch (error) {
      throw this.transformNotionError(error, 'Notion connection test failed');
    }
  }

  /**
   * Standardize Notion API errors into application errors
   */
  private transformNotionError(error: unknown, context: string): NotionAppError {
    const err = error as { code?: string; status?: number; message?: string } | undefined;
    const code = err?.code;
    const status = err?.status;

    if (isNotionClientError(error) || code) {
      if (code === APIErrorCode.Unauthorized || status === 401) {
        return new NotionAppError(
          `${context}: Invalid or unauthorized Notion API token`,
          AppErrorCode.UNAUTHORIZED,
          401,
          error,
        );
      }

      if (code === APIErrorCode.ObjectNotFound || status === 404) {
        return new NotionAppError(
          `${context}: Target database or page not found or not shared with integration`,
          AppErrorCode.NOT_FOUND,
          404,
          error,
        );
      }

      if (code === APIErrorCode.RateLimited || status === 429) {
        return new NotionAppError(
          `${context}: Notion API rate limit exceeded`,
          AppErrorCode.NOTION_API_ERROR,
          429,
          error,
        );
      }

      if (code === APIErrorCode.ValidationError || status === 400) {
        return new NotionAppError(
          `${context}: Invalid property or schema payload for Notion API: ${err?.message || ''}`,
          AppErrorCode.BAD_REQUEST,
          400,
          error,
        );
      }

      if (code === ClientErrorCode.RequestTimeout || status === 504) {
        return new NotionAppError(
          `${context}: Notion API request timed out`,
          AppErrorCode.NOTION_API_ERROR,
          504,
          error,
        );
      }

      return new NotionAppError(
        `${context}: Notion API error [${code}]: ${err?.message || 'Error'}`,
        AppErrorCode.NOTION_API_ERROR,
        status || 500,
        error,
      );
    }

    return new NotionAppError(
      `${context}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      AppErrorCode.INTERNAL_ERROR,
      500,
      error,
    );
  }
}
