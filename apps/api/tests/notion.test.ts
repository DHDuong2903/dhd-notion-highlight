import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotionService, NotionAppError } from '../src/services/notion.js';
import { AppErrorCode } from '@notion-highlight/shared';
import { APIErrorCode } from '@notionhq/client';

describe('NotionService', () => {
  let service: NotionService;
  let mockClient: any;

  beforeEach(() => {
    service = new NotionService({ auth: 'test-secret' });
    mockClient = (service as any).client;

    // Default mock database with full properties
    mockClient.databases = {
      retrieve: vi.fn().mockResolvedValue({
        id: 'test-db-id',
        object: 'database',
        properties: {
          Name: { id: 'title', type: 'title', title: {} },
          URL: { id: 'url', type: 'url', url: {} },
        },
      }),
    };

    mockClient.request = vi.fn();

    mockClient.pages = {
      create: vi.fn(),
    };

    mockClient.blocks = {
      children: {
        append: vi.fn(),
      },
    };

    mockClient.users = {
      me: vi.fn(),
    };
  });

  describe('splitTextForNotion', () => {
    it('should split text longer than 2000 chars into chunks without truncation', () => {
      const longText = 'A'.repeat(4500);
      const chunks = NotionService.splitTextForNotion(longText);

      expect(chunks.length).toBe(3);
      expect(chunks[0].text.content.length).toBe(2000);
      expect(chunks[1].text.content.length).toBe(2000);
      expect(chunks[2].text.content.length).toBe(500);

      const reconstructed = chunks.map((c) => c.text.content).join('');
      expect(reconstructed).toBe(longText);
    });

    it('should handle short text cleanly in a single chunk', () => {
      const text = 'Quick highlight';
      const chunks = NotionService.splitTextForNotion(text);

      expect(chunks.length).toBe(1);
      expect(chunks[0].text.content).toBe(text);
    });
  });

  describe('Source Lookup (findPageByUrl)', () => {
    it('should return pageId when matching page exists', async () => {
      mockClient.request.mockResolvedValueOnce({
        results: [{ id: 'page-123' }],
      });

      const pageId = await service.findPageByUrl('test-db-id', 'https://example.com/article');

      expect(pageId).toBe('page-123');
      expect(mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'databases/test-db-id/query',
          method: 'post',
          body: {
            filter: {
              property: 'URL',
              url: { equals: 'https://example.com/article' },
            },
            page_size: 1,
          },
        }),
      );
    });

    it('should return null when no page matches', async () => {
      mockClient.request.mockResolvedValueOnce({
        results: [],
      });

      const pageId = await service.findPageByUrl('test-db-id', 'https://example.com/unknown');

      expect(pageId).toBeNull();
    });
  });

  describe('Create Page & Append Highlight', () => {
    it('should create new page with title, url property and quote block', async () => {
      mockClient.pages.create.mockResolvedValueOnce({
        id: 'new-page-id',
        url: 'https://notion.so/new-page-id',
      });

      const result = await service.createPage({
        databaseId: 'test-db-id',
        title: 'Tech Article',
        url: 'https://tech.example.com',
        highlightText: 'Important insight',
      });

      expect(result.pageId).toBe('new-page-id');
      expect(mockClient.pages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: { database_id: 'test-db-id' },
          properties: expect.objectContaining({
            Name: {
              title: [{ type: 'text', text: { content: 'Tech Article' } }],
            },
            URL: {
              url: 'https://tech.example.com',
            },
          }),
          children: [
            expect.objectContaining({
              object: 'block',
              type: 'quote',
            }),
          ],
        }),
      );
    });

    it('should append highlight quote block to existing page', async () => {
      mockClient.blocks.children.append.mockResolvedValueOnce({});

      await service.appendHighlight('page-123', 'Second quote from article');

      expect(mockClient.blocks.children.append).toHaveBeenCalledWith({
        block_id: 'page-123',
        children: [
          expect.objectContaining({
            object: 'block',
            type: 'quote',
            quote: {
              rich_text: [{ type: 'text', text: { content: 'Second quote from article' } }],
            },
          }),
        ],
      });
    });
  });

  describe('Source Grouping (saveHighlight)', () => {
    it('should create a new page if source URL is new', async () => {
      // Lookup returns no match
      mockClient.request.mockResolvedValueOnce({ results: [] });
      mockClient.pages.create.mockResolvedValueOnce({
        id: 'brand-new-page',
        url: 'https://notion.so/brand-new-page',
      });

      const result = await service.saveHighlight({
        databaseId: 'test-db-id',
        title: 'My Article',
        url: 'https://example.com/post-1',
        highlightText: 'First highlight',
      });

      expect(result.isNewSource).toBe(true);
      expect(result.pageId).toBe('brand-new-page');
      expect(mockClient.pages.create).toHaveBeenCalledTimes(1);
      expect(mockClient.blocks.children.append).not.toHaveBeenCalled();
    });

    it('should append to existing page if source URL already exists', async () => {
      // Lookup finds existing page
      mockClient.request.mockResolvedValueOnce({
        results: [{ id: 'existing-page-id' }],
      });
      mockClient.blocks.children.append.mockResolvedValueOnce({});

      const result = await service.saveHighlight({
        databaseId: 'test-db-id',
        title: 'My Article',
        url: 'https://example.com/post-1',
        highlightText: 'Second highlight from same article',
      });

      expect(result.isNewSource).toBe(false);
      expect(result.pageId).toBe('existing-page-id');
      expect(mockClient.blocks.children.append).toHaveBeenCalledTimes(1);
      expect(mockClient.pages.create).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should map Unauthorized error to 401 UNAUTHORIZED', async () => {
      const notionError = new Error('Invalid token');
      (notionError as any).code = APIErrorCode.Unauthorized;
      (notionError as any).status = 401;

      mockClient.databases.retrieve.mockRejectedValueOnce(notionError);

      try {
        await service.getDatabase('test-db-id');
      } catch (err: any) {
        expect(err.code).toBe(AppErrorCode.UNAUTHORIZED);
        expect(err.statusCode).toBe(401);
      }
    });

    it('should map ObjectNotFound error to 404 NOT_FOUND', async () => {
      const notionError = new Error('Database not found');
      (notionError as any).code = APIErrorCode.ObjectNotFound;
      (notionError as any).status = 404;

      mockClient.databases.retrieve.mockRejectedValueOnce(notionError);

      try {
        await service.getDatabase('missing-db');
      } catch (err: any) {
        expect(err.code).toBe(AppErrorCode.NOT_FOUND);
        expect(err.statusCode).toBe(404);
      }
    });

    it('should map RateLimited error to 429 NOTION_API_ERROR', async () => {
      const notionError = new Error('Rate limit exceeded');
      (notionError as any).code = APIErrorCode.RateLimited;
      (notionError as any).status = 429;

      mockClient.databases.retrieve.mockRejectedValueOnce(notionError);

      try {
        await service.getDatabase('test-db-id');
      } catch (err: any) {
        expect(err.code).toBe(AppErrorCode.NOTION_API_ERROR);
        expect(err.statusCode).toBe(429);
      }
    });
  });
});
