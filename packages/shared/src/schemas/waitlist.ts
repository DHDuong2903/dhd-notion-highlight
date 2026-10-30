import { z } from 'zod';

export const waitlistSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address' }),
  currentTools: z.string().max(200).optional(),
  useNotion: z.boolean().optional().default(true),
  destinations: z.string().max(200).optional(),
  willingToPay: z.string().max(100).optional(),
  feedback: z.string().max(1000).optional(),
  source: z.string().max(100).optional().default('landing_page'),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

export const waitlistResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  isExisting: z.boolean().optional(),
});

export type WaitlistResponse = z.infer<typeof waitlistResponseSchema>;
