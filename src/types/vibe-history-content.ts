import { z } from 'zod';
import { SingleChatSchema } from './single-chat';

export const VibeHistoryContentSchema = z.object({
  ide_name: z.string().default('cursor'),
  chat_list: z.array(SingleChatSchema).default([]),
});

export type VibeHistoryContentType = z.infer<typeof VibeHistoryContentSchema>;

