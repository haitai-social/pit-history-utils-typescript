import { z } from 'zod';
import { SingleChatSchema } from './single-chat';

export const IDE_NAME_ENUM = ['cursor', 'claude code', 'trea', 'winsurf', 'codex'] as const;

export const VibeHistoryContentSchema = z.object({
  ide_name: z.enum(IDE_NAME_ENUM).default('cursor'),
  chat_list: z.array(SingleChatSchema).default([]),
});

export type VibeHistoryContentType = z.infer<typeof VibeHistoryContentSchema>;
