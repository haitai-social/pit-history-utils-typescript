import { SingleChatType } from './single-chat';


export interface VibeHistoryMethods {
  unselectChatAtIndex(index: number): void;
  selectChatAtIndex(index: number): void;
  editNameAtIndex(index: number, newName: string): void;
  editIdeName(newName: string): void;
  appendChatHistory(chat: SingleChatType): void;
  toJSON(): string;
}
