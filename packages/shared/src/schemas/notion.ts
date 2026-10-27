import { z } from 'zod';

export const selectDatabaseSchema = z.object({
  databaseId: z.string().min(1, { message: 'databaseId is required' }),
});

export type SelectDatabaseInput = z.infer<typeof selectDatabaseSchema>;

export const notionStatusResponseSchema = z.object({
  isConnected: z.boolean(),
  workspaceId: z.string().nullable().optional(),
  databaseId: z.string().nullable().optional(),
});

export type NotionStatusResponse = z.infer<typeof notionStatusResponseSchema>;
