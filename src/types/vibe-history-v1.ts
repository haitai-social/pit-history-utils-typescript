import { z } from 'zod';
import { SingleChatType } from './single-chat';
import { ExportedVibeHistoryContentSchema } from './vibe-history-content';

export const ExportedVibeHistoryV1JsonSchema = z.object({
  version: z.literal("v1"),
  content: ExportedVibeHistoryContentSchema,
});

export type ExportedVibeHistoryV1JsonType = z.infer<typeof ExportedVibeHistoryV1JsonSchema>;


export interface VibeHistoryV1Methods {
  unselectChatAtIndex(index: number): void;
  selectChatAtIndex(index: number): void;
  editNameAtIndex(index: number, newName: string): void;
  editIdeName(newName: string): void;
  appendChatHistory(chat: SingleChatType): void;
  toJSON(): ExportedVibeHistoryV1JsonType;
}
