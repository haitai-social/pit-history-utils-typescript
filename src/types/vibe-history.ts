import { z } from 'zod';
import { SingleChatType } from './single-chat';
import { ExportedVibeHistoryContentSchema } from './vibe-history-content';
import { JSON_VERSION } from '../common/version';

export const ExportedVibeHistoryJsonSchema = z.object({
  version: z.literal(JSON_VERSION),
  content: ExportedVibeHistoryContentSchema,
});

export type ExportedVibeHistoryJsonType = z.infer<typeof ExportedVibeHistoryJsonSchema>;


export interface VibeHistoryMethods {
  unselectChatAtIndex(index: number): void;
  selectChatAtIndex(index: number): void;
  editNameAtIndex(index: number, newName: string): void;
  editIdeName(newName: string): void;
  appendChatHistory(chat: SingleChatType): void;
  toJSON(): ExportedVibeHistoryJsonType;
}
