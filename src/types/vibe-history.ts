import { SingleChatType } from './single-chat';


export interface VibeHistoryMethods {
  unselectChatAtIndex(index: number): void;
  selectChatAtIndex(index: number): void;
  editNameAtIndex(index: number, newName: string): void;
  editContentAtIndex(index: number, newContent: string): void;
  editIdeName(newName: string): void;
  appendChatHistory(chat: SingleChatType): void;
  toJSONString(): string;
}

export interface VibeHistoryFactoryMethods {
  fromJsonString(input: string): VibeHistoryMethods | null;
  fromCodexHistory(input: string): VibeHistoryMethods | null;
  fromCursorHistory(input: string): VibeHistoryMethods | null;
  fromFileText(input: string): VibeHistoryMethods | null;
}
