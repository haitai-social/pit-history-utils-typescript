import { z } from 'zod';

export const SingleChatSchema = z.object({
  role: z.string().default(''),
  name: z.string().default(''),
  content: z.string().default(''),
  is_select: z.boolean().default(true),
});

export type SingleChatType = z.infer<typeof SingleChatSchema>;

export const ExportedSingleChatSchema = z.object({
  role: z.string().default(''),
  name: z.string().default(''),
  content: z.string().default(''),
});

export type ExportedSingleChatType = z.infer<typeof ExportedSingleChatSchema>;
