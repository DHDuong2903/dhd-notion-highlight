import { z } from 'zod';

export const createHighlightSchema = z.object({
  idempotencyKey: z.string().uuid({ message: 'idempotencyKey must be a valid UUIDv4' }),
  text: z
    .string()
    .trim()
    .min(1, { message: 'Text content cannot be empty' })
    .max(2000, { message: 'Text cannot exceed 2000 characters' }),
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title cannot be empty' })
    .max(500, { message: 'Title cannot exceed 500 characters' }),
  url: z.string().url({ message: 'Must be a valid URL' }),
});

export type CreateHighlightInput = z.infer<typeof createHighlightSchema>;

export const highlightResponseSchema = z.object({
  success: z.boolean(),
  highlightId: z.string().optional(),
  sourceId: z.string().optional(),
  notionPageId: z.string().optional(),
  notionUrl: z.string().optional(),
  isNewSource: z.boolean().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
});

export type HighlightResponse = z.infer<typeof highlightResponseSchema>;
