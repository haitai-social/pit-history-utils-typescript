import { z } from 'zod';
import { ExportedSingleChatSchema, SingleChatSchema } from './single-chat';

export const VibeHistoryContentSchema = z.object({
  ide_name: z.string().default(''),
  chat_list: z.array(SingleChatSchema).default([]),
});

export type VibeHistoryContentType = z.infer<typeof VibeHistoryContentSchema>;

export const ExportedVibeHistoryContentSchema = z.object({
  ide_name: z.string().default(''),
  chat_list: z.array(ExportedSingleChatSchema).default([]),
});

export type ExportedVibeHistoryContentType = z.infer<typeof ExportedVibeHistoryContentSchema>;
